/**
 * Servicio de licencias (README § 4 · "Licencias" y § 13, paso 3).
 *
 * Aquí viven las operaciones del contrato: emitir, activar, validar, reclamar,
 * revocar, liberar equipos y reenviar. **La validación nunca ocurre en el
 * cliente**: la app pregunta y este servicio responde.
 */

import {
  ACTIVATION_MESSAGES,
  activarEquipo,
  canActivate,
  DAY_MS,
  freeDevices,
  liberarEquipo,
  generateLicenseCode,
  grantsAccess,
  isValidLicenseCode,
  normalizeLicenseCode,
  reactivateLicense,
  refundLicense,
  revokeLicense,
  sealTrial,
  trialState,
  type ActivationError,
  type License,
} from '@/domain/license';
import {
  capabilities,
  etiquetaDeAcceso,
  resolveAccess,
  type AccessLevel,
  type Capabilities,
} from '@/domain/access';
import type { AdminSettings, LicenseStore, NewLicense } from './store';

export interface ServiceDeps {
  store: LicenseStore;
  /** Reloj inyectable: las pruebas controlan el paso del tiempo. */
  now?: () => number;
  /** Envío de correo transaccional. */
  mailer?: Mailer;
}

export interface Mailer {
  send(message: { to: string; template: MailTemplate; data: Record<string, unknown> }): Promise<void>;
}

export type MailTemplate =
  | 'compra-confirmada'
  | 'acceso-activado'
  | 'recuperar-acceso'
  | 'recordatorio-dia-6'
  | 'prueba-terminada';

export class LicenseService {
  private store: LicenseStore;
  private now: () => number;
  private mailer?: Mailer;

  constructor({ store, now, mailer }: ServiceDeps) {
    this.store = store;
    this.now = now ?? (() => Date.now());
    this.mailer = mailer;
  }

  settings(): Promise<AdminSettings> {
    return this.store.getSettings();
  }

  /**
   * `POST /licenses` — se llama desde el webhook de pago y desde "Emitir
   * licencia" del panel. Un mismo `paymentRef` nunca emite dos códigos.
   */
  async issue(input: {
    email: string;
    name?: string;
    /** Cuenta que compró, cuando el pago se hizo con sesión abierta. */
    userId?: string;
    /** Equipo desde el que se pagó. */
    originDeviceId?: string;
    source?: string;
    amount?: number;
    paymentRef?: string;
  }): Promise<{ code: string; license: License; alreadyIssued: boolean }> {
    if (input.paymentRef) {
      const existing = await this.store.findLicenseByPaymentRef(input.paymentRef);
      if (existing) return { code: existing.code, license: existing, alreadyIssued: true };
    }

    const settings = await this.store.getSettings();
    const data: NewLicense = {
      code: await this.uniqueCode(),
      email: input.email.trim().toLowerCase(),
      name: input.name?.trim(),
      userId: input.userId,
      originDeviceId: input.originDeviceId,
      source: input.source || 'checkout',
      amount: input.amount ?? settings.price,
      paymentRef: input.paymentRef,
      createdAt: this.now(),
    };
    const license = await this.store.createLicense(data);

    await this.store.appendEvent({
      kind: 'pago-recibido',
      message: `Pago recibido de ${license.email} por $${license.amount?.toLocaleString('es-MX')}`,
      code: license.code,
    });
    await this.store.appendEvent({
      kind: 'licencia-emitida',
      message: `Licencia ${license.code} emitida a ${license.email}`,
      code: license.code,
    });
    // El correo es el comprobante; el usuario no necesita teclear el código.
    await this.mail(license.email ?? '', 'compra-confirmada', { code: license.code, name: license.name });

    return { code: license.code, license, alreadyIssued: false };
  }

  /** `POST /licenses/activate` — registra el equipo. */
  async activate(input: {
    code: string;
    deviceId: string;
  }): Promise<
    | { ok: true; code: string; devices: number; max: number }
    | { ok: false; error: ActivationError; message: string }
  > {
    const code = normalizeLicenseCode(input.code);
    if (!code) {
      return { ok: false, error: 'codigo-invalido', message: ACTIVATION_MESSAGES['codigo-invalido'] };
    }

    const settings = await this.store.getSettings();
    const license = await this.store.findLicense(code);
    const check = canActivate(license, input.deviceId, settings.maxDevices);
    /*
      `limite-de-equipos` ya no cierra la puerta: se recicla el equipo más
      viejo y la persona entra. El tope existe contra la reventa, no contra
      quien pagó, y se gastaba con el `deviceId` —que muere al borrar los datos
      del navegador—, así que tres limpiezas dejaban fuera al cliente de lo que
      compró. Revocada y reembolsada sí siguen cerrando.
    */
    if (!check.ok && check.error !== 'limite-de-equipos') {
      return { ok: false, error: check.error, message: ACTIVATION_MESSAGES[check.error] };
    }

    const suyos = license as License;
    const ultimoUso = await this.store.ultimoUsoDeEquipos(suyos.devices);
    const { license: conElNuevo, reciclados } = activarEquipo(
      suyos,
      input.deviceId,
      this.now(),
      settings.maxDevices,
      ultimoUso,
    );
    const activated = await this.store.saveLicense(conElNuevo);
    await this.markConverted(input.deviceId);
    await this.store.appendEvent({
      kind: 'licencia-activada',
      message: `Licencia ${code} activada en un equipo (${activated.devices.length} de ${settings.maxDevices})`,
      code,
    });
    await this.registrarReciclaje(code, input.deviceId, reciclados, ultimoUso);
    await this.mail(activated.email ?? '', 'acceso-activado', { code });

    return { ok: true, code, devices: activated.devices.length, max: settings.maxDevices };
  }

  /**
   * `POST /licenses/validate` — se llama en cada arranque. Si la licencia fue
   * revocada o reembolsada, el acceso vuelve a prueba.
   */
  async validate(input: { code: string; deviceId: string }): Promise<{ ok: boolean; status: License['status'] | 'desconocida' }> {
    const code = normalizeLicenseCode(input.code);
    if (!code) return { ok: false, status: 'desconocida' };

    const license = await this.store.findLicense(code);
    if (!license) return { ok: false, status: 'desconocida' };
    // Una licencia activa en otros equipos no vale para este.
    const ok = grantsAccess(license) && license.devices.includes(input.deviceId);
    return { ok, status: license.status };
  }

  /**
   * `POST /licenses/claim` — activación automática: al volver del checkout la
   * app busca una licencia pagada sin equipos y la reclama sola.
   */
  /*
    La identidad no es opcional y no viene del navegador: la ruta la saca de la
    sesión. Antes bastaba con mandar un `deviceId` y el servidor entregaba la
    licencia sin dueño más reciente, fuera de quien fuera.
  */
  async claim(input: { deviceId: string; userId?: string; email?: string }): Promise<{ ok: boolean; code?: string }> {
    const settings = await this.store.getSettings();

    // Si este equipo ya tiene licencia, no hay nada que reclamar.
    const mine = await this.store.findLicenseByDevice(input.deviceId);
    if (mine && grantsAccess(mine)) return { ok: true, code: mine.code };

    if (!settings.autoActivation) return { ok: false };
    if (!input.userId && !input.email) return { ok: false };

    /*
      Primero la que este equipo pagó; si no, cualquiera que sea suya. Ya no se
      le pide lugar: si el tope está lleno, `activate` recicla el equipo más
      olvidado. Exigir lugar aquí era lo que dejaba a un cliente con licencia
      activa resolviendo a «bloqueado» en su cuarto navegador.
    */
    const claimable =
      (await this.store.findClaimableLicense({ userId: input.userId, email: input.email })) ??
      (await this.suyaAunqueEsteLlena(input));
    if (!claimable) return { ok: false };

    const result = await this.activate({ code: claimable.code, deviceId: input.deviceId });
    return result.ok ? { ok: true, code: result.code } : { ok: false };
  }

  /**
   * Una licencia vigente de esta persona, tenga lugar o no.
   *
   * Es lo que hace que pagar en el celular desbloquee también la laptop sin
   * teclear el código. Antes pedía `devices.length < maxDevices` y ahí estaba
   * la trampa: el tope se gasta con el `deviceId`, que muere al borrar los
   * datos del navegador. Quien limpiaba su navegador tres veces se quedaba sin
   * lugares en su propia licencia y la app lo trataba como si nunca hubiera
   * pagado. Ahora entra igual y el tope se resuelve reciclando.
   */
  private async suyaAunqueEsteLlena(owner: { userId?: string; email?: string }): Promise<License | undefined> {
    if (!owner.userId && !owner.email) return undefined;
    const correo = owner.email?.trim().toLowerCase();
    const todas = await this.store.listLicenses({});
    return todas.find(
      (l) =>
        ((owner.userId && l.userId === owner.userId) || (!!correo && l.email === correo)) &&
        (l.status === 'activada' || l.status === 'nueva'),
    );
  }

  /**
   * Deja el reciclaje en la bitácora del panel.
   *
   * Es la única señal de que una licencia se está compartiendo: un equipo
   * reciclado de vez en cuando es alguien que cambió de teléfono o limpió su
   * navegador; cinco en una semana son cinco personas turnándose una licencia.
   */
  private async registrarReciclaje(
    code: string,
    entra: string,
    reciclados: string[],
    ultimoUso: Readonly<Record<string, number>>,
  ): Promise<void> {
    for (const salio of reciclados) {
      const visto = ultimoUso[salio];
      const hace = visto ? `${Math.floor((this.now() - visto) / DAY_MS)} días sin abrirse` : 'sin registro de uso';
      await this.store.appendEvent({
        kind: 'equipo-reciclado',
        message: `Licencia ${code}: entró un equipo y salió el más olvidado (${hace})`,
        code,
        meta: { entra, salio, ultimoUso: visto ?? null },
      });
    }
  }

  /**
   * La licencia sólo abre si es de quien está preguntando.
   *
   * El `deviceId` vive en el `localStorage` del navegador y sobrevive a cerrar
   * sesión y a registrarse con otro correo. Mientras el acceso se decidía sólo
   * por equipo, un navegador que alguna vez activó una licencia la prestaba a
   * cualquier cuenta nueva que se creara ahí —y a quien ni siquiera entrara—.
   *
   * Red de seguridad: una licencia sin dueño registrado se sigue respetando
   * por equipo. Es la del comprador real que pagó con un correo y se registró
   * con otro, o que nunca llegó a crear cuenta: quitarle el acceso por una
   * regla nueva sería cobrarle dos veces. Cada vez que ese camino se usa queda
   * el aviso en la bitácora del servidor, y el panel las lista para asignarles
   * dueño a mano.
   */
  private async siEsDeQuienPregunta(
    license: License,
    quien: { userId?: string; email?: string; deviceId: string },
  ): Promise<License | undefined> {
    const correo = quien.email?.trim().toLowerCase();
    const suya =
      (!!quien.userId && license.userId === quien.userId) ||
      (!!correo && !!license.email && license.email.trim().toLowerCase() === correo);
    if (suya) return license;

    if (!(await this.sinDuenoRegistrado(license))) return undefined;

    console.warn(
      `[licencias] Licencia ${license.code} abierta por equipo: no tiene dueño registrado. ` +
        `equipo=${quien.deviceId} correoDeLaLicencia=${license.email ?? '(ninguno)'} ` +
        `quienPregunta=${correo ?? '(sin sesión)'}`,
    );
    return license;
  }

  /**
   * ¿Esta licencia no tiene a quién pertenecer?
   *
   * Con `userId` ya hay dueño. Con un correo que sí tiene cuenta, también: esa
   * persona puede entrar con él. Huérfana es la que no tiene ninguno de los
   * dos, y es la única que conserva el acceso por equipo.
   */
  private async sinDuenoRegistrado(license: License): Promise<boolean> {
    if (license.userId) return false;
    const correo = license.email?.trim().toLowerCase();
    if (!correo) return true;
    return !(await this.store.findAccountByEmail(correo));
  }

  /**
   * Asigna a mano el dueño de una licencia huérfana, desde el panel.
   *
   * Es la salida de la red de seguridad: mientras la licencia no tenga dueño,
   * el navegador donde se activó se la presta a cualquiera. Al ponerle un
   * correo con cuenta, el acceso pasa a ser de esa persona y de nadie más.
   */
  async asignarDueno(
    code: string,
    email: string,
  ): Promise<{ ok: true; license: License } | { ok: false; error: 'no-existe' | 'correo-invalido' | 'sin-cuenta' }> {
    const correo = email.trim().toLowerCase();
    if (!correo || !correo.includes('@')) return { ok: false, error: 'correo-invalido' };

    const license = await this.store.findLicense(normalizeLicenseCode(code) ?? '');
    if (!license) return { ok: false, error: 'no-existe' };

    /*
      Se exige que el correo ya tenga cuenta. Poner uno que no la tiene dejaría
      la licencia igual de huérfana pero fuera de la lista de pendientes: un
      problema escondido en vez de resuelto.
    */
    const cuenta = await this.store.findAccountByEmail(correo);
    if (!cuenta) return { ok: false, error: 'sin-cuenta' };

    const saved = await this.store.saveLicense({ ...license, email: correo, userId: cuenta.id });
    await this.store.appendEvent({
      kind: 'licencia-emitida',
      message: `Licencia ${saved.code} asignada a ${correo} desde el panel`,
      code: saved.code,
      meta: { email: correo, userId: cuenta.id },
    });
    return { ok: true, license: saved };
  }

  /**
   * Revoca todas las licencias vigentes de un correo.
   *
   * Por código hay que saber cuál es; por correo se resuelve con el dato que
   * el dueño sí tiene a la mano. Las ya revocadas o reembolsadas se dejan como
   * están: volver a tocarlas sólo ensucia la bitácora.
   */
  async revokeByEmail(email: string): Promise<{ codes: string[] }> {
    const correo = email.trim().toLowerCase();
    if (!correo) return { codes: [] };

    const suyas = (await this.store.listLicenses({})).filter(
      (l) => l.email?.trim().toLowerCase() === correo && (l.status === 'activada' || l.status === 'nueva'),
    );

    const codes: string[] = [];
    for (const license of suyas) {
      const revocada = await this.revoke(license.code);
      if (revocada) codes.push(revocada.code);
    }
    return { codes };
  }

  /** `POST /licenses/:code/revoke` */
  async revoke(code: string): Promise<License | undefined> {
    return this.transition(code, (l) => revokeLicense(l, this.now()), 'licencia-revocada', 'revocada');
  }

  async reactivate(code: string): Promise<License | undefined> {
    return this.transition(code, reactivateLicense, 'licencia-reactivada', 'reactivada');
  }

  async refund(code: string, amount?: number): Promise<License | undefined> {
    const license = await this.store.findLicense(code);
    if (!license) return undefined;
    const refunded = await this.store.saveLicense({
      ...refundLicense(license, this.now()),
      refundedAmount: amount ?? license.amount ?? 0,
    });
    await this.store.appendEvent({
      kind: 'licencia-reembolsada',
      message: `Licencia ${code} marcada como reembolsada`,
      code,
    });
    return refunded;
  }

  /** `POST /licenses/:code/free-devices` */
  async freeDevices(code: string): Promise<License | undefined> {
    return this.transition(code, freeDevices, 'equipos-liberados', 'con sus equipos liberados');
  }

  /**
   * Los equipos de una licencia, con cuándo se usó cada uno.
   *
   * El panel los lista para dos cosas: ver si una licencia se está compartiendo
   * —tres equipos usados el mismo día desde lados distintos— y liberar uno a
   * mano cuando alguien llama porque cambió de teléfono.
   */
  async equiposDe(code: string): Promise<Array<{ deviceId: string; ultimoUso: number | null }> | undefined> {
    const normalizado = normalizeLicenseCode(code);
    const license = normalizado ? await this.store.findLicense(normalizado) : undefined;
    if (!license) return undefined;

    const visto = await this.store.ultimoUsoDeEquipos(license.devices);
    return license.devices
      .map((deviceId) => ({ deviceId, ultimoUso: visto[deviceId] ?? null }))
      .sort((a, b) => (b.ultimoUso ?? 0) - (a.ultimoUso ?? 0));
  }

  /**
   * `POST /licenses/:code/free-device` — saca un equipo, no todos.
   *
   * `free-devices` vacía la licencia entera y la devuelve a «nueva», que es
   * mucho para «este señor cambió de teléfono». Esto quita uno y deja el resto
   * como está.
   */
  async freeDevice(code: string, deviceId: string): Promise<License | undefined> {
    const normalizado = normalizeLicenseCode(code);
    const license = normalizado ? await this.store.findLicense(normalizado) : undefined;
    if (!license || !deviceId || !license.devices.includes(deviceId)) return undefined;

    const guardada = await this.store.saveLicense(liberarEquipo(license, deviceId));
    await this.store.appendEvent({
      kind: 'equipos-liberados',
      message: `Licencia ${guardada.code}: un equipo liberado a mano (quedan ${guardada.devices.length})`,
      code: guardada.code,
      meta: { deviceId },
    });
    return guardada;
  }

  /** `POST /licenses/:code/resend` */
  async resend(code: string): Promise<boolean> {
    const license = await this.store.findLicense(code);
    if (!license) return false;
    await this.mail(license.email ?? '', 'recuperar-acceso', { code: license.code });
    await this.store.appendEvent({
      kind: 'codigo-reenviado',
      message: `Código ${code} reenviado a ${license.email}`,
      code,
    });
    return true;
  }

  /**
   * Estado de acceso de un equipo, resuelto en el servidor. Es lo único que la
   * app necesita para decidir qué muestra: nunca calcula el acceso por su cuenta.
   */
  async entitlement(input: { deviceId: string; code?: string; userId?: string; email?: string }): Promise<{
    level: AccessLevel;
    licensed: boolean;
    code?: string;
    status?: License['status'];
    trial: { startedAt: number; expiresAt: number; daysLeft: number; expired: boolean; label: string };
    capabilities: Capabilities;
    devices?: { used: number; max: number };
  }> {
    const settings = await this.store.getSettings();
    const now = this.now();

    const trialRecord = await this.store.startTrial(input.deviceId, now);
    const sealed = { ...trialRecord, ...sealTrial(trialRecord, now, settings.trialDays) };
    if (sealed.expiredAt !== trialRecord.expiredAt) await this.store.saveTrial(sealed);

    /*
      Si este equipo todavía no tiene licencia pero la persona sí compró, se
      activa aquí mismo. Es lo que hace que el acceso siga a la cuenta: pagas
      en el celular y la laptop entra sola, sin teclear el código. El tope de
      equipos lo sigue poniendo `canActivate`.
    */
    if (!(await this.store.findLicenseByDevice(input.deviceId)) && (input.userId || input.email)) {
      await this.claim({ deviceId: input.deviceId, userId: input.userId, email: input.email });
    }

    const license =
      (await this.store.findLicenseByDevice(input.deviceId)) ??
      (input.code ? await this.store.findLicense(normalizeLicenseCode(input.code) ?? '') : undefined);

    // Una licencia de otro equipo no da acceso a este…
    const enEsteEquipo = license && license.devices.includes(input.deviceId) ? license : undefined;
    // …y una de otra persona tampoco, aunque el equipo sea el mismo.
    const own = enEsteEquipo ? await this.siEsDeQuienPregunta(enEsteEquipo, input) : undefined;
    const access = resolveAccess({
      license: own,
      trialStart: sealed.startedAt,
      now,
      trialDays: settings.trialDays,
    });
    const trial = trialState(sealed.startedAt, now, settings.trialDays);

    /*
      La prueba del equipo sigue corriendo y venciendo aunque la persona haya
      pagado el día dos: son cosas distintas y las fechas no se tocan. Lo que
      no puede salir de aquí es la **etiqueta** de una prueba vencida hacia una
      cuenta con licencia — «Tu prueba terminó» a quien compró acceso de por
      vida se lee como que perdió lo que pagó.

      La pantalla ya no la pinta cruda (`etiquetaDeAcceso` y `avisoDePrueba`
      deciden por nivel), pero esto se resuelve también aquí: son dos guardias
      independientes y ninguna depende de que la otra exista.
    */
    return {
      level: access.level,
      licensed: access.licensed,
      code: own?.code,
      status: own?.status ?? license?.status,
      trial: {
        startedAt: trial.startedAt,
        expiresAt: trial.expiresAt,
        daysLeft: trial.daysLeft,
        expired: trial.expired,
        label: etiquetaDeAcceso(access.level, trial.label),
      },
      capabilities: capabilities(access.level),
      devices: own ? { used: own.devices.length, max: settings.maxDevices } : undefined,
    };
  }

  /**
   * El nivel con el que se decide qué puede guardar una cuenta.
   *
   * Normalmente sale del `entitlement` de su equipo, que es la misma regla que
   * contesta la app. Si la petición no trae equipo —un cliente viejo, o una
   * llamada a mano— no se puede saber si la prueba de ese aparato venció, así
   * que se resuelve por la cuenta: con licencia suya, `licencia`; sin ella,
   * `prueba`. Nunca se devuelve un nivel más generoso que el que le toca.
   */
  async nivelParaGuardar(input: { deviceId?: string; userId?: string; email?: string }): Promise<AccessLevel> {
    if (input.deviceId) return (await this.entitlement({ ...input, deviceId: input.deviceId })).level;

    const correo = input.email?.trim().toLowerCase();
    const suya = (await this.store.listLicenses({})).find(
      (l) =>
        l.status === 'activada' &&
        ((!!input.userId && l.userId === input.userId) || (!!correo && l.email?.trim().toLowerCase() === correo)),
    );
    return suya ? 'licencia' : 'prueba';
  }

  private async transition(
    code: string,
    change: (license: License) => License,
    kind: Parameters<LicenseStore['appendEvent']>[0]['kind'],
    verb: string,
  ): Promise<License | undefined> {
    const license = await this.store.findLicense(code);
    if (!license) return undefined;
    const saved = await this.store.saveLicense(change(license));
    await this.store.appendEvent({ kind, message: `Licencia ${code} ${verb}`, code });
    return saved;
  }

  private async markConverted(deviceId: string): Promise<void> {
    const trial = await this.store.getTrial(deviceId);
    if (trial && !trial.converted) await this.store.saveTrial({ ...trial, converted: true });
  }

  private async uniqueCode(): Promise<string> {
    for (let i = 0; i < 12; i++) {
      const code = generateLicenseCode();
      if (!(await this.store.findLicense(code))) return code;
    }
    throw new Error('No se pudo generar un código de licencia único');
  }

  private async mail(to: string, template: MailTemplate, data: Record<string, unknown>): Promise<void> {
    if (!this.mailer || !to) return;
    try {
      await this.mailer.send({ to, template, data });
    } catch {
      // Un fallo de correo no puede tumbar una activación: el código ya existe
      // y el usuario ya tiene acceso.
    }
  }
}

export { isValidLicenseCode };

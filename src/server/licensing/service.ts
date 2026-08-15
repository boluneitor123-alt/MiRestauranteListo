/**
 * Servicio de licencias (README § 4 · "Licencias" y § 13, paso 3).
 *
 * Aquí viven las operaciones del contrato: emitir, activar, validar, reclamar,
 * revocar, liberar equipos y reenviar. **La validación nunca ocurre en el
 * cliente**: la app pregunta y este servicio responde.
 */

import {
  ACTIVATION_MESSAGES,
  activateLicense,
  canActivate,
  freeDevices,
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
import { capabilities, resolveAccess, type AccessLevel, type Capabilities } from '@/domain/access';
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
    if (!check.ok) return { ok: false, error: check.error, message: ACTIVATION_MESSAGES[check.error] };

    const activated = await this.store.saveLicense(
      activateLicense(license as License, input.deviceId, this.now(), settings.maxDevices),
    );
    await this.markConverted(input.deviceId);
    await this.store.appendEvent({
      kind: 'licencia-activada',
      message: `Licencia ${code} activada en un equipo (${activated.devices.length} de ${settings.maxDevices})`,
      code,
    });
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
  async claim(input: { deviceId: string; email?: string }): Promise<{ ok: boolean; code?: string }> {
    const settings = await this.store.getSettings();

    // Si este equipo ya tiene licencia, no hay nada que reclamar.
    const mine = await this.store.findLicenseByDevice(input.deviceId);
    if (mine && grantsAccess(mine)) return { ok: true, code: mine.code };

    if (!settings.autoActivation) return { ok: false };

    const claimable = await this.store.findClaimableLicense(input.email?.trim().toLowerCase());
    if (!claimable) return { ok: false };

    const result = await this.activate({ code: claimable.code, deviceId: input.deviceId });
    return result.ok ? { ok: true, code: result.code } : { ok: false };
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
  async entitlement(input: { deviceId: string; code?: string }): Promise<{
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

    const license =
      (await this.store.findLicenseByDevice(input.deviceId)) ??
      (input.code ? await this.store.findLicense(normalizeLicenseCode(input.code) ?? '') : undefined);

    // Una licencia de otro equipo no da acceso a este.
    const own = license && license.devices.includes(input.deviceId) ? license : undefined;
    const access = resolveAccess({
      license: own,
      trialStart: sealed.startedAt,
      now,
      trialDays: settings.trialDays,
    });
    const trial = trialState(sealed.startedAt, now, settings.trialDays);

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
        label: trial.label,
      },
      capabilities: capabilities(access.level),
      devices: own ? { used: own.devices.length, max: settings.maxDevices } : undefined,
    };
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

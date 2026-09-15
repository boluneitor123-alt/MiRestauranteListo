import { describe, expect, it } from 'vitest';
import { CIUDADES, TAMANOS } from '@/content/estimaciones';
import { ONBOARDING_QUESTIONS } from '@/content/onboarding';
import { topesDe } from '../access';
import { afinarEstimacion } from '../afinar';
import { alDia } from '../desestimar';
import { BUDGET_CONCEPTS, FIXED_CONCEPTS } from '@/content/catalog';
import { ciudadDelPerfil, estaAfinado, estimarProyecto, nombreDeCiudad } from '../estimacion';
import { emptyProjectState, type ProjectState } from '../projectState';
import { sembrarEstimacion } from '../sembrar';

const DOCE = Object.fromEntries(ONBOARDING_QUESTIONS.map((q) => [q.id, 'contestada']));

const CDMX = CIUDADES[0].opcion;
const PUEBLO = CIUDADES[3].opcion;
const PUESTO = TAMANOS[0].opcion;
const GRANDE = TAMANOS[3].opcion;

/** Una cuenta recién diagnosticada y sembrada, como la deja el primer guardado. */
const sembrada = (extra: Partial<ProjectState> = {}): ProjectState =>
  sembrarEstimacion(
    emptyProjectState({
      answers: { ...DOCE, giro: 'Taquería', presupuesto: '$100,000 a $250,000', personal: '1 a 2' },
      ...extra,
    }),
    topesDe('licencia'),
  );

const conAfinacion = (state: ProjectState, ciudad: string, tamano: string): ProjectState => ({
  ...state,
  answers: { ...state.answers, ciudad, tamano },
});

const renta = (s: ProjectState) => s.fixed.find((c) => c.key === 'renta')!.amount;
const monto = (s: ProjectState, grupo: 'budget' | 'fixed', key: string) =>
  s[grupo].find((c) => c.key === key)!.amount;

describe('la tarjeta de afinación mueve los números', () => {
  it('la renta de un puesto de pueblo y la de un local grande de CDMX no se parecen', () => {
    const base = sembrada();
    const chico = afinarEstimacion(conAfinacion(base, PUEBLO, PUESTO));
    const grande = afinarEstimacion(conAfinacion(base, CDMX, GRANDE));

    expect(renta(chico)).toBeLessThan(renta(base));
    expect(renta(grande)).toBeGreaterThan(renta(base));
    expect(renta(grande)).toBeGreaterThan(renta(chico) * 3);
  });

  it('sólo mueve lo que depende del espacio', () => {
    const base = sembrada();
    const afinado = afinarEstimacion(conAfinacion(base, CDMX, GRANDE));

    // La renta, la obra, el mobiliario y los utensilios sí.
    for (const key of ['renta', 'obra', 'mob', 'uten']) {
      expect(monto(afinado, 'budget', key), key).not.toBe(monto(base, 'budget', key));
    }
    // La cocina cuesta lo mismo en Oaxaca que en Polanco; el inventario también.
    for (const key of ['cocina', 'refri', 'inv', 'permisos', 'mkt', 'pos', 'fondo']) {
      expect(monto(afinado, 'budget', key), key).toBe(monto(base, 'budget', key));
    }
    expect(monto(afinado, 'fixed', 'nomina')).toBe(monto(base, 'fixed', 'nomina'));
    expect(monto(afinado, 'fixed', 'luz')).toBe(monto(base, 'fixed', 'luz'));
  });

  it('no toca un solo peso de lo que la persona corrigió', () => {
    /*
      Es la promesa que no se rompe. Si se rompiera aquí, la app le estaría
      borrando la renta que fue a preguntar a un local de verdad y la estaría
      cambiando por una estimación.
    */
    const base = sembrada();
    const suya = {
      ...base,
      fixed: base.fixed.map((c) => (c.key === 'renta' ? { ...c, amount: 9_500 } : c)),
    };
    const conMarcas = alDia(base, suya);
    expect(conMarcas.estimados).not.toContain('fijos:renta');

    const afinado = afinarEstimacion(conAfinacion(conMarcas, CDMX, GRANDE));
    expect(renta(afinado)).toBe(9_500);
    // Y lo que sigue estimado sí se movió: la afinación no se desactiva entera.
    expect(monto(afinado, 'budget', 'obra')).not.toBe(monto(base, 'budget', 'obra'));
  });

  it('media respuesta no mueve nada', () => {
    const base = sembrada();
    const soloCiudad = { ...base, answers: { ...base.answers, ciudad: CDMX } };
    const soloTamano = { ...base, answers: { ...base.answers, tamano: GRANDE } };
    expect(afinarEstimacion(soloCiudad)).toBe(soloCiudad);
    expect(afinarEstimacion(soloTamano)).toBe(soloTamano);
    expect(estaAfinado({ ciudad: CDMX })).toBe(false);
    expect(estaAfinado({ tamano: GRANDE })).toBe(false);
    expect(estaAfinado({ ciudad: CDMX, tamano: GRANDE })).toBe(true);
  });

  it('una respuesta inventada no mueve nada', () => {
    // Las respuestas llegan por la API con el resto del estado: una que no
    // esté en la tabla no puede convertirse en un factor cualquiera.
    const inventada = conAfinacion(sembrada(), 'Marte', 'Enorme');
    expect(afinarEstimacion(inventada)).toBe(inventada);
  });

  it('a quien capturó todo a mano no se le toca nada', () => {
    // Sin sello no hubo siembra nuestra: no hay ninguna estimación que afinar.
    const propio = emptyProjectState({
      answers: { ...DOCE, giro: 'Taquería', ciudad: CDMX, tamano: GRANDE },
      fixed: [{ key: 'renta', label: 'Renta', amount: 12_000 }],
    });
    expect(afinarEstimacion(propio)).toBe(propio);
  });

  it('el presupuesto deja de contar cuando ya contestó dónde y de qué tamaño', () => {
    /*
      El presupuesto con el que cuenta era un proxy de "qué tan grande y
      dónde". Contestada la pregunta directa, el proxy sobra: multiplicar los
      dos cobra dos veces lo mismo y sacaba rentas de $58,000 para una
      taquería. Dos personas en el mismo local de la misma ciudad pagan la
      misma renta, tengan $50,000 o medio millón para abrir.
    */
    const pobre = afinarEstimacion(
      conAfinacion({ ...sembrada(), answers: { ...sembrada().answers, presupuesto: 'Menos de $50,000' } }, CDMX, GRANDE),
    );
    const rico = afinarEstimacion(
      conAfinacion({ ...sembrada(), answers: { ...sembrada().answers, presupuesto: 'Más de $500,000' } }, CDMX, GRANDE),
    );

    expect(renta(pobre)).toBe(renta(rico));
    expect(monto(pobre, 'budget', 'obra')).toBe(monto(rico, 'budget', 'obra'));
    // Y en lo que no es de espacio el presupuesto sí sigue mandando.
    expect(monto(pobre, 'budget', 'cocina')).toBeLessThan(monto(rico, 'budget', 'cocina'));
  });

  it('el estimador tampoco acepta media afinación, no sólo la tarjeta', () => {
    /*
      `afinarEstimacion` ya se niega antes de llegar aquí, pero la siembra
      llama al estimador directo: si un día alguien contesta la ciudad durante
      el diagnóstico, media respuesta no puede mover la renta sola.
    */
    const cat = { presupuesto: BUDGET_CONCEPTS, fijos: FIXED_CONCEPTS };
    const base = { giro: 'Taquería', presupuesto: '$100,000 a $250,000', personal: '1 a 2' };
    const rentaDe = (a: Record<string, string>) =>
      estimarProyecto(a, cat).fixed.find((c) => c.key === 'renta')!.amount;

    expect(rentaDe({ ...base, ciudad: CDMX })).toBe(rentaDe(base));
    expect(rentaDe({ ...base, tamano: GRANDE })).toBe(rentaDe(base));
    expect(rentaDe({ ...base, ciudad: CDMX, tamano: GRANDE })).not.toBe(rentaDe(base));
  });

  it('es idempotente: afinar dos veces da lo mismo', () => {
    const una = afinarEstimacion(conAfinacion(sembrada(), CDMX, GRANDE));
    expect(afinarEstimacion(una)).toBe(una);
  });
});

describe('la etiqueta se vuelve más específica', () => {
  it('nombra el tamaño y la ciudad sólo cuando movieron algo', () => {
    const base = sembrada();
    expect(base.selloEstimado).toBe('Estimado para taquería con equipo de 1 a 2 personas');

    const afinado = afinarEstimacion(conAfinacion(base, PUEBLO, PUESTO));
    expect(afinado.selloEstimado).toBe(
      'Estimado para taquería con equipo de 1 a 2 personas, en puesto, en una ciudad mediana',
    );
  });

  it('con media respuesta la etiqueta no presume precisión que no tiene', () => {
    const base = sembrada();
    const media = afinarEstimacion({ ...base, answers: { ...base.answers, ciudad: CDMX } });
    expect(media.selloEstimado).not.toContain('Ciudad de México');
  });

  it('usa la ciudad que ella escribió en su perfil, no la opción genérica', () => {
    const base = sembrada({ profile: { name: '', email: '', phone: '', city: 'zapopan' } });
    const afinado = afinarEstimacion(conAfinacion(base, CIUDADES[1].opcion, TAMANOS[1].opcion));
    expect(afinado.selloEstimado).toContain('en Zapopan');
    expect(afinado.selloEstimado).not.toContain('Guadalajara o Monterrey');
  });

  it('deja la ciudad del perfil en un nombre y no en una dirección', () => {
    /*
      Es texto libre. «zapopan, jalisco» salía tal cual y la etiqueta quedaba
      «en local chico, en Zapopan, jalisco»: tres datos donde hay dos, porque
      el sello ya separa sus partes con comas.
    */
    expect(nombreDeCiudad('zapopan, jalisco')).toBe('Zapopan');
    expect(nombreDeCiudad('  Monterrey  ')).toBe('Monterrey');
    expect(nombreDeCiudad('')).toBe('');
    expect(nombreDeCiudad(undefined)).toBe('');

    const base = sembrada({ profile: { name: '', email: '', phone: '', city: 'zapopan, jalisco' } });
    const afinado = afinarEstimacion(conAfinacion(base, CIUDADES[1].opcion, TAMANOS[1].opcion));
    expect(afinado.selloEstimado).toBe(
      'Estimado para taquería con equipo de 1 a 2 personas, en local chico, en Zapopan',
    );
  });

  it('si el perfil dice otra ciudad, gana lo que contestó en la tarjeta', () => {
    const base = sembrada({ profile: { name: '', email: '', phone: '', city: 'Oaxaca' } });
    const afinado = afinarEstimacion(conAfinacion(base, CIUDADES[1].opcion, TAMANOS[1].opcion));
    expect(afinado.selloEstimado).toContain('en Guadalajara o Monterrey');
    expect(afinado.selloEstimado).not.toContain('Oaxaca');
  });
});

describe('la ciudad del perfil, para no preguntar dos veces', () => {
  it('reconoce lo que la persona escribió, con acentos o sin ellos', () => {
    expect(ciudadDelPerfil('Ciudad de México')).toBe(CIUDADES[0].opcion);
    expect(ciudadDelPerfil('cdmx')).toBe(CIUDADES[0].opcion);
    expect(ciudadDelPerfil('NEZAHUALCÓYOTL')).toBe(CIUDADES[0].opcion);
    expect(ciudadDelPerfil('San Pedro Garza García')).toBe(CIUDADES[1].opcion);
    expect(ciudadDelPerfil('Querétaro')).toBe(CIUDADES[2].opcion);
  });

  it('lo que no conoce lo pregunta, no lo adivina', () => {
    /*
      Suponer que un pueblo desconocido es una ciudad grande le subiría la
      renta sin razón. Más vale una pregunta que una cifra inventada.
    */
    expect(ciudadDelPerfil('San Juan del Río')).toBeUndefined();
    expect(ciudadDelPerfil('')).toBeUndefined();
    expect(ciudadDelPerfil('  ')).toBeUndefined();
    expect(ciudadDelPerfil(undefined)).toBeUndefined();
  });
});

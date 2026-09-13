import { describe, expect, it } from 'vitest';
import { ETAPAS, ROUTE_MODULES } from '@/content/route';
import {
  alcanceDe,
  alcanceDeModulo,
  alcanceDeTarea,
  avisoDeTope,
  CANDADO_VENCIDO,
  capabilities,
  courseState,
  esMiniCurso,
  etapaDeModulo,
  RECURSOS,
  resolveAccess,
  resumenDeAlcance,
  seAbreLaLeccion,
  sePuedeEditarModulo,
  sePuedeGuardarOtro,
  textoDeCandado,
  topesDe,
  type AccessLevel,
} from '../access';
import type { License } from '../license';

const DEFINE = ETAPAS[0].mods;
const CONSTRUYE = ETAPAS[1].mods;
const ABRE = ETAPAS[2].mods;
const CURSOS = ROUTE_MODULES.filter((m) => esMiniCurso(m.id)).map((m) => m.id);

describe('la etapa de cada módulo sale de ETAPAS, no de una lista aparte', () => {
  it('los módulos de ruta caen en su etapa y los cursos en ninguna', () => {
    expect(DEFINE.map(etapaDeModulo)).toEqual(DEFINE.map(() => 'define'));
    expect(CONSTRUYE.map(etapaDeModulo)).toEqual(CONSTRUYE.map(() => 'construye'));
    expect(ABRE.map(etapaDeModulo)).toEqual(ABRE.map(() => 'abre'));
    expect(CURSOS.every(esMiniCurso)).toBe(true);
    expect(CURSOS).toHaveLength(4);
  });

  it('la etapa 1 son las 11 tareas del contrato, contadas del código', () => {
    const tareas = DEFINE.reduce((n, id) => n + (ROUTE_MODULES.find((m) => m.id === id)?.tasks.length ?? 0), 0);
    expect(tareas).toBe(11);
  });
});

describe('prueba: la etapa 1 se trabaja completa', () => {
  it('sus módulos abren la lección y dejan marcarla', () => {
    for (const id of DEFINE) {
      expect(alcanceDeModulo('prueba', id)).toBe('abierto');
      expect(seAbreLaLeccion('prueba', id)).toBe(true);
      expect(sePuedeEditarModulo('prueba', id)).toBe(true);
    }
  });
});

describe('prueba: las etapas 2 y 3 se ven pero no se abren', () => {
  it('quedan cerradas: ni lección ni marcar', () => {
    for (const id of [...CONSTRUYE, ...ABRE]) {
      expect(alcanceDeTarea('prueba', id)).toBe('cerrado');
      expect(seAbreLaLeccion('prueba', id)).toBe(false);
      expect(sePuedeEditarModulo('prueba', id)).toBe(false);
    }
  });

  it('no hay excepción para la lección 1: la «muestra gratis» se fue', () => {
    // Antes el índice 0 de cada módulo cerrado se abría. El alcance ya no
    // depende del índice, así que no puede volver por la puerta de atrás.
    for (const id of CONSTRUYE) {
      expect(alcanceDeTarea('prueba', id)).toBe('cerrado');
    }
  });
});

describe('prueba: los mini cursos tienen portada, no lecciones', () => {
  it('los cuatro quedan cerrados', () => {
    for (const id of CURSOS) {
      expect(alcanceDeModulo('prueba', id)).toBe('cerrado');
      expect(seAbreLaLeccion('prueba', id)).toBe(false);
    }
  });

  it('el rótulo del menú ya no promete una lección abierta', () => {
    expect(courseState('prueba', 0)).toBe('se abre con el pago único');
    expect(courseState('licencia', 0)).toBe('sin empezar');
    expect(courseState('licencia', 3)).toBe('3 completadas');
  });
});

describe('prueba: el Costeador funciona con tope de 2', () => {
  it('deja crear hasta el segundo y no el tercero', () => {
    expect(sePuedeGuardarOtro('prueba', 'platillos', 0)).toBe(true);
    expect(sePuedeGuardarOtro('prueba', 'platillos', 1)).toBe(true);
    expect(sePuedeGuardarOtro('prueba', 'platillos', 2)).toBe(false);
  });

  it('las sub-recetas llevan su propio tope de 2', () => {
    expect(topesDe('prueba')).toEqual({ platillos: 2, subrecetas: 2 });
    expect(sePuedeGuardarOtro('prueba', 'subrecetas', 2)).toBe(false);
  });

  it('Mi menú se abre: se arma de los platillos y hereda su tope', () => {
    expect(alcanceDe('prueba', 'costeador:menu')).toBe('abierto');
  });

  it('el aviso dice cuántos quedan, y luego que se abre con el pago', () => {
    expect(avisoDeTope('prueba', 'platillos', 0)).toContain('quedan 2');
    expect(avisoDeTope('prueba', 'platillos', 1)).toContain('queda 1');
    expect(avisoDeTope('prueba', 'platillos', 2)).toContain('Desbloquea con el pago único');
    expect(avisoDeTope('licencia', 'platillos', 99)).toBeNull();
  });
});

describe('prueba: Números se ve y no se captura', () => {
  it('los cinco módulos quedan en sólo lectura', () => {
    for (const r of ['presupuesto', 'fijos', 'equilibrio', 'aguante', 'realidad'] as const) {
      expect(alcanceDe('prueba', `numeros:${r}`)).toBe('solo-lectura');
    }
  });

  it('el resumen para imprimir queda cerrado', () => {
    expect(alcanceDe('prueba', 'numeros:resumen')).toBe('cerrado');
  });

  it('la cifra de inversión no se enseña', () => {
    expect(capabilities('prueba').muestraCifrasDeInversion).toBe(false);
    expect(capabilities('licencia').muestraCifrasDeInversion).toBe(true);
  });
});

describe('al vencer los 7 días nada se borra: todo pasa a sólo lectura', () => {
  it('la etapa 1 se conserva visible y deja de editarse', () => {
    for (const id of DEFINE) {
      expect(alcanceDeModulo('bloqueado', id)).toBe('solo-lectura');
      expect(seAbreLaLeccion('bloqueado', id)).toBe(true);
      expect(sePuedeEditarModulo('bloqueado', id)).toBe(false);
    }
  });

  it('lo capturado en el Costeador sigue ahí, sin poder crear más', () => {
    expect(alcanceDe('bloqueado', 'costeador:platillos')).toBe('solo-lectura');
    expect(alcanceDe('bloqueado', 'costeador:subrecetas')).toBe('solo-lectura');
    // Ni siquiera con lugar bajo el tope: vencida no se crea nada nuevo.
    expect(sePuedeGuardarOtro('bloqueado', 'platillos', 0)).toBe(false);
    expect(sePuedeGuardarOtro('bloqueado', 'subrecetas', 0)).toBe(false);
  });

  it('Números sigue visible', () => {
    expect(alcanceDe('bloqueado', 'numeros:presupuesto')).toBe('solo-lectura');
  });

  it('el resto queda como en prueba', () => {
    for (const id of [...CONSTRUYE, ...ABRE, ...CURSOS]) {
      expect(alcanceDeModulo('bloqueado', id)).toBe('cerrado');
    }
  });

  it('el letrero dice que la prueba terminó', () => {
    expect(textoDeCandado('bloqueado', 'contenido')).toBe(CANDADO_VENCIDO);
    expect(textoDeCandado('bloqueado', 'edicion')).toBe(CANDADO_VENCIDO);
    expect(textoDeCandado('prueba', 'contenido')).toBe('Desbloquea con el pago único');
    expect(textoDeCandado('prueba', 'edicion')).toBe('Para editar, desbloquea con el pago único');
  });

  it('ningún recurso cae a cerrado si en prueba estaba abierto o en lectura', () => {
    // El contrato es que vencer nunca esconde lo que la prueba dejaba ver.
    for (const r of RECURSOS) {
      if (alcanceDe('prueba', r) === 'cerrado') continue;
      expect(alcanceDe('bloqueado', r)).not.toBe('cerrado');
    }
  });
});

describe('licencia abre absolutamente todo', () => {
  it('los dieciséis recursos quedan abiertos', () => {
    for (const r of RECURSOS) expect(alcanceDe('licencia', r)).toBe('abierto');
    expect(topesDe('licencia')).toEqual({ platillos: null, subrecetas: null });
  });

  it('y ningún módulo, de ruta o curso, queda fuera', () => {
    for (const m of ROUTE_MODULES) {
      expect(alcanceDeModulo('licencia', m.id)).toBe('abierto');
      expect(sePuedeEditarModulo('licencia', m.id)).toBe(true);
    }
  });
});

describe('el resumen del aviso se calcula, no se teclea', () => {
  it('nombra la etapa 1 y sus tareas reales', () => {
    const texto = resumenDeAlcance('prueba');
    expect(texto).toContain(ETAPAS[0].name);
    expect(texto).toContain('11 tareas');
    expect(texto).toContain('2 platillos');
  });

  it('al vencer promete que nada se perdió', () => {
    expect(resumenDeAlcance('bloqueado')).toContain('sigue aquí');
  });
});

describe('el nivel lo decide la licencia y la prueba', () => {
  const activa: License = { code: 'MRL-AAAA-BBBB', status: 'activada', devices: ['x'], createdAt: 0 };
  const nivel = (input: Parameters<typeof resolveAccess>[0]): AccessLevel => resolveAccess(input).level;

  it('con licencia, licencia; sin ella, prueba o bloqueado según los días', () => {
    expect(nivel({ license: { ...activa }, trialStart: 0, now: 0 })).toBe('licencia');
    expect(nivel({ trialStart: 0, now: 0 })).toBe('prueba');
    expect(nivel({ trialStart: 0, now: 8 * 24 * 3600 * 1000 })).toBe('bloqueado');
  });
});

'use client';

import type { LegalDoc } from '@/content/legal';
import { AVISO_BORRADOR, CORREO } from '@/content/legal';
import { Ico } from '@/components/landing/pieces';

/**
 * Un documento legal (`LegalMRL.dc.html` de la entrega v2).
 *
 * La entrega trae los dos documentos en una sola página; aquí cada uno vive en
 * su ruta —`/terminos` y `/privacidad`— porque son dos enlaces distintos en el
 * producto y conviene que cada uno tenga su dirección. El índice lateral lista
 * las secciones del documento que se está leyendo, y al final se cruza con el
 * otro.
 */
export function Legal({ doc, otro }: { doc: LegalDoc; otro: LegalDoc }) {
  return (
    <div className="lp lg">
      <header className="lp-head">
        <div>
          <a href="/" className="lp-marca">
            <span>MRL</span>
            <span>
              Mi<span style={{ color: 'var(--orange-texto)' }}>Restaurante</span>Listo
            </span>
          </a>
          <div style={{ flex: 1 }} />
          <a href="/" className="lp-btn">
            Volver
          </a>
        </div>
      </header>

      <div className="lg-wrap">
        <div className="lg-borrador" role="note">
          <span style={{ color: 'var(--amber-d)', display: 'grid', flex: 'none', marginTop: 2 }}>
            <Ico name="alerta" size={20} width={2.4} />
          </span>
          <p style={{ flex: 1, minWidth: 0, fontSize: 14, color: '#6B4405' }}>
            <strong>{AVISO_BORRADOR.split('.')[0]}.</strong>
            {AVISO_BORRADOR.slice(AVISO_BORRADOR.indexOf('.') + 1)}
          </p>
        </div>

        <div className="lg-cols">
          <nav className="lg-toc" aria-label={`Secciones de ${doc.title}`}>
            <span className="lg-toc-tit">{doc.title.toUpperCase()}</span>
            {doc.sections.map((s) => (
              <a key={s.id} href={`#${s.id}`}>
                {s.title}
              </a>
            ))}
            <a className="lg-toc-otro" href={otro.slug}>
              {otro.title} →
            </a>
          </nav>

          <div>
            <h1 className="lg-tit">{doc.title}</h1>
            <p className="lg-sub">{doc.sub}</p>

            <div className="lg-card">
              {doc.sections.map((s, i) => (
                <section key={s.id} id={s.id} className="lg-sec">
                  <h2>
                    {i + 1}. {s.title}
                  </h2>
                  <div className="lg-cuerpo">
                    {s.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                  </div>
                  {s.list?.length ? (
                    <ul className="lg-lista">
                      {s.list.map((li) => (
                        <li key={li}>{li}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </div>

            <a className="lg-otro" href={otro.slug}>
              <span>
                <span className="lg-otro-k">También te puede interesar</span>
                <span className="lg-otro-t">{otro.title}</span>
              </span>
              <Ico name="flecha" size={20} width={2.6} />
            </a>

            <div className="lg-dudas">
              <h2>¿Dudas sobre esto?</h2>
              <p>
                {/* Va dentro de la frase: excepción documentada, con el área tocable crecida. */}
                Escríbenos a{' '}
                <a className="mrl-inline lg-mail" href={`mailto:${CORREO}`}>
                  {CORREO}
                </a>{' '}
                y te respondemos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  Versión de la política de cookies/privacidad CON el píxel de Meta, y a la vez
  versión del consentimiento (lib/consentimiento.ts): si cambia, quien ya eligió
  vuelve a ser preguntado.

  Módulo aparte, sin importar los textos legales, porque lo carga el componente
  del aviso en el navegador y no debe arrastrar las políticas enteras al bundle.

  La política de privacidad ya llevaba fecha 2026-11-06 (#116): ese día no hay
  una fecha posterior que poner sin inventarla. AL ENCENDER SEDA_FLAG_META_PIXEL,
  subir esta fecha al día de la activación. El texto legal con Meta está en
  lib/legal/meta.ts; tests/meta-pixel-legal.test.ts exige que esta fecha no sea
  anterior a las de los textos base.
*/
export const ACTUALIZADO_CON_META = "2026-11-06"

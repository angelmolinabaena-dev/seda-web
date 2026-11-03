import type { IdiomaTour } from "./idiomas"

/*
  Textos del visor 360 en los cinco idiomas.

  TEXTO NUEVO — pendiente de revisión de Ángel (los cinco idiomas; la fuente es
  el español). Son etiquetas de interfaz, sin promesas sobre la casa ni cifras.
  `it` no existe en messages/*.json (la web no tiene italiano): vive aquí, junto
  al resto, para que el visor sea autosuficiente al incrustarse.

  `{estancia}` y `{nombre}` se sustituyen con `rellenar()`.
*/

export type TextosVisor = {
  cargando: string
  estancias: string
  irA: string
  acercar: string
  alejar: string
  pantallaCompleta: string
  salirPantallaCompleta: string
  activarGiroscopio: string
  desactivarGiroscopio: string
  idioma: string
  ayuda: string
  recorrido360: string
  errorWebgl: string
  errorCarga: string
  reintentar: string
  /** Mensajes internos de Pannellum que puede ver el visitante. */
  pannellum: {
    loadingLabel: string
    noPanoramaError: string
    fileAccessError: string
    malformedURLError: string
    iOS8WebGLError: string
    genericWebGLError: string
    textureSizeError: string
    unknownError: string
  }
}

export const TEXTOS_VISOR: Record<IdiomaTour, TextosVisor> = {
  es: {
    cargando: "Cargando recorrido…",
    estancias: "Estancias",
    irA: "Ir a {estancia}",
    acercar: "Acercar",
    alejar: "Alejar",
    pantallaCompleta: "Pantalla completa",
    salirPantallaCompleta: "Salir de pantalla completa",
    activarGiroscopio: "Mover con el giroscopio",
    desactivarGiroscopio: "Dejar de usar el giroscopio",
    idioma: "Idioma",
    ayuda: "Arrastra para mirar alrededor",
    recorrido360: "Recorrido 360°",
    errorWebgl: "Tu navegador no puede mostrar este recorrido en 360°.",
    errorCarga: "No se ha podido cargar el recorrido.",
    reintentar: "Reintentar",
    pannellum: {
      loadingLabel: "Cargando…",
      noPanoramaError: "No hay ninguna imagen para mostrar.",
      fileAccessError: "No se ha podido abrir el archivo %s.",
      malformedURLError: "La dirección de la imagen no es válida.",
      iOS8WebGLError: "Este dispositivo no puede mostrar la imagen.",
      genericWebGLError: "Tu navegador no puede mostrar este recorrido en 360°.",
      textureSizeError: "La imagen es demasiado grande para este dispositivo.",
      unknownError: "No se ha podido cargar el recorrido.",
    },
  },
  en: {
    cargando: "Loading tour…",
    estancias: "Rooms",
    irA: "Go to {estancia}",
    acercar: "Zoom in",
    alejar: "Zoom out",
    pantallaCompleta: "Full screen",
    salirPantallaCompleta: "Exit full screen",
    activarGiroscopio: "Move with the gyroscope",
    desactivarGiroscopio: "Stop using the gyroscope",
    idioma: "Language",
    ayuda: "Drag to look around",
    recorrido360: "360° tour",
    errorWebgl: "Your browser cannot display this 360° tour.",
    errorCarga: "The tour could not be loaded.",
    reintentar: "Try again",
    pannellum: {
      loadingLabel: "Loading…",
      noPanoramaError: "There is no image to show.",
      fileAccessError: "The file %s could not be opened.",
      malformedURLError: "The image address is not valid.",
      iOS8WebGLError: "This device cannot display the image.",
      genericWebGLError: "Your browser cannot display this 360° tour.",
      textureSizeError: "The image is too large for this device.",
      unknownError: "The tour could not be loaded.",
    },
  },
  de: {
    cargando: "Rundgang wird geladen …",
    estancias: "Räume",
    irA: "Zu {estancia}",
    acercar: "Hineinzoomen",
    alejar: "Herauszoomen",
    pantallaCompleta: "Vollbild",
    salirPantallaCompleta: "Vollbild beenden",
    activarGiroscopio: "Mit dem Gyroskop bewegen",
    desactivarGiroscopio: "Gyroskop nicht mehr verwenden",
    idioma: "Sprache",
    ayuda: "Ziehen, um sich umzusehen",
    recorrido360: "360°-Rundgang",
    errorWebgl: "Ihr Browser kann diesen 360°-Rundgang nicht anzeigen.",
    errorCarga: "Der Rundgang konnte nicht geladen werden.",
    reintentar: "Erneut versuchen",
    pannellum: {
      loadingLabel: "Wird geladen …",
      noPanoramaError: "Es gibt kein Bild zum Anzeigen.",
      fileAccessError: "Die Datei %s konnte nicht geöffnet werden.",
      malformedURLError: "Die Adresse des Bildes ist ungültig.",
      iOS8WebGLError: "Dieses Gerät kann das Bild nicht anzeigen.",
      genericWebGLError: "Ihr Browser kann diesen 360°-Rundgang nicht anzeigen.",
      textureSizeError: "Das Bild ist für dieses Gerät zu groß.",
      unknownError: "Der Rundgang konnte nicht geladen werden.",
    },
  },
  fr: {
    cargando: "Chargement de la visite…",
    estancias: "Pièces",
    irA: "Aller à {estancia}",
    acercar: "Zoom avant",
    alejar: "Zoom arrière",
    pantallaCompleta: "Plein écran",
    salirPantallaCompleta: "Quitter le plein écran",
    activarGiroscopio: "Se déplacer avec le gyroscope",
    desactivarGiroscopio: "Ne plus utiliser le gyroscope",
    idioma: "Langue",
    ayuda: "Faites glisser pour regarder autour de vous",
    recorrido360: "Visite 360°",
    errorWebgl: "Votre navigateur ne peut pas afficher cette visite à 360°.",
    errorCarga: "La visite n'a pas pu être chargée.",
    reintentar: "Réessayer",
    pannellum: {
      loadingLabel: "Chargement…",
      noPanoramaError: "Il n'y a aucune image à afficher.",
      fileAccessError: "Le fichier %s n'a pas pu être ouvert.",
      malformedURLError: "L'adresse de l'image n'est pas valide.",
      iOS8WebGLError: "Cet appareil ne peut pas afficher l'image.",
      genericWebGLError: "Votre navigateur ne peut pas afficher cette visite à 360°.",
      textureSizeError: "L'image est trop grande pour cet appareil.",
      unknownError: "La visite n'a pas pu être chargée.",
    },
  },
  it: {
    cargando: "Caricamento del tour…",
    estancias: "Stanze",
    irA: "Vai a {estancia}",
    acercar: "Ingrandisci",
    alejar: "Riduci",
    pantallaCompleta: "Schermo intero",
    salirPantallaCompleta: "Esci da schermo intero",
    activarGiroscopio: "Muovi con il giroscopio",
    desactivarGiroscopio: "Smetti di usare il giroscopio",
    idioma: "Lingua",
    ayuda: "Trascina per guardarti intorno",
    recorrido360: "Tour a 360°",
    errorWebgl: "Il tuo browser non può mostrare questo tour a 360°.",
    errorCarga: "Non è stato possibile caricare il tour.",
    reintentar: "Riprova",
    pannellum: {
      loadingLabel: "Caricamento…",
      noPanoramaError: "Non c'è nessuna immagine da mostrare.",
      fileAccessError: "Non è stato possibile aprire il file %s.",
      malformedURLError: "L'indirizzo dell'immagine non è valido.",
      iOS8WebGLError: "Questo dispositivo non può mostrare l'immagine.",
      genericWebGLError: "Il tuo browser non può mostrare questo tour a 360°.",
      textureSizeError: "L'immagine è troppo grande per questo dispositivo.",
      unknownError: "Non è stato possibile caricare il tour.",
    },
  },
}

/** Sustituye `{clave}` por su valor; una clave sin valor se deja tal cual (se ve y se corrige). */
export function rellenar(plantilla: string, valores: Record<string, string>): string {
  return plantilla.replace(/\{(\w+)\}/g, (m, k: string) => (k in valores ? valores[k] : m))
}

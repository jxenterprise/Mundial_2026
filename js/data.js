/* ============================================================
   MUNDIAL 26 LIVE — data.js
   Datos reales verificados del Mundial 2026 (corte: 2 jul 2026,
   ~10:30 p. m. hora Colombia). Fuentes: FIFA.com, feed deportivo.
   Este archivo es el "modo respaldo": la web funciona con estos
   datos aunque la API en vivo no esté conectada.
   ============================================================ */

const DATOS_MUNDIAL = {
  // Momento del corte de datos (UTC). Se muestra al usuario en modo respaldo.
  corteDatosUTC: "2026-07-03T14:30:00Z",

  /* ------------------------------------------------------------
     DÓNDE VER — canales con derechos por país.
     Verificado el 3 jul 2026 (El Colombiano, Futbolred, CNN,
     Depor/El Comercio, Infobae, Milenio). La oferta exacta puede
     variar según el partido y el operador.
     ------------------------------------------------------------ */
  dondeVerVerificado: "3 de julio de 2026",
  dondeVer: [
    { pais: "Colombia", iso: "co", destacada: true,
      tv: ["DSports (104 partidos)", "Caracol TV", "Canal RCN", "Win Sports"],
      streaming: ["DGO", "Ditu / Caracol Play", "Deportes RCN", "Disney+"] },
    { pais: "México", iso: "mx",
      tv: ["Canal 5 (Televisa)", "Azteca 7", "TUDN"],
      streaming: ["ViX", "TUDN En Vivo", "Azteca Deportes"] },
    { pais: "Estados Unidos", iso: "us",
      tv: ["FOX / FS1 (inglés)", "Telemundo (español)"],
      streaming: ["Peacock", "FOX Sports App"] },
    { pais: "España", iso: "es",
      tv: ["TVE La 1", "Movistar+"],
      streaming: ["RTVE Play", "DAZN"] },
    { pais: "Argentina", iso: "ar",
      tv: ["DSports (DirecTV)"],
      streaming: ["DGO"] },
    { pais: "Perú", iso: "pe",
      tv: ["DirecTV (exclusivo)"],
      streaming: ["DGO"] },
  ],

  /* ------------------------------------------------------------
     Dominio oficial de cada canal/app de arriba, para mostrar su
     favicon real y enlazar directo desde "Dónde ver". Investigado
     y verificado el 3 jul 2026. Si agregas un canal nuevo a
     `dondeVer` y no lo pones aquí, la web simplemente no le pone
     ícono ni enlace (no rompe nada).
     ------------------------------------------------------------ */
  canalesInfo: {
    "DSports (104 partidos)": { dominio: "www.directvsports.com", url: "https://www.directvsports.com/" },
    "DSports (DirecTV)":      { dominio: "www.directvsports.com", url: "https://www.directvsports.com/" },
    "Caracol TV":             { dominio: "www.caracoltv.com",     url: "https://www.caracoltv.com/" },
    "Canal RCN":              { dominio: "www.canalrcn.com",      url: "https://www.canalrcn.com/" },
    "Win Sports":             { dominio: "www.winsports.co",      url: "https://www.winsports.co/" },
    "DGO":                    { dominio: "www.directvgo.com",     url: "https://www.directvgo.com/" },
    "Ditu / Caracol Play":    { dominio: "ditu.caracoltv.com",     url: "https://ditu.caracoltv.com/" },
    "Deportes RCN":           { dominio: "www.deportesrcn.com",    url: "https://www.deportesrcn.com/" },
    "Disney+":                { dominio: "www.disneyplus.com",    url: "https://www.disneyplus.com/" },
    "Canal 5 (Televisa)":     { dominio: "www.televisa.com",      url: "https://www.televisa.com/canal5" },
    "Azteca 7":               { dominio: "www.tvazteca.com",      url: "https://www.tvazteca.com/azteca7/" },
    "TUDN":                   { dominio: "www.tudn.com",          url: "https://www.tudn.com/" },
    "TUDN En Vivo":           { dominio: "www.tudn.com",          url: "https://www.tudn.com/" },
    "ViX":                    { dominio: "vix.com",               url: "https://vix.com/" },
    "Azteca Deportes":        { dominio: "www.tvazteca.com",      url: "https://www.tvazteca.com/aztecadeportes/" },
    "FOX / FS1 (inglés)":     { dominio: "www.foxsports.com",     url: "https://www.foxsports.com/" },
    "Telemundo (español)":    { dominio: "www.telemundo.com",     url: "https://www.telemundo.com/" },
    "Peacock":                { dominio: "www.peacocktv.com",     url: "https://www.peacocktv.com/" },
    "FOX Sports App":         { dominio: "www.foxsports.com",     url: "https://www.foxsports.com/" },
    "TVE La 1":               { dominio: "www.rtve.es",           url: "https://www.rtve.es/play/videos/directo/la-1/" },
    "Movistar+":              { dominio: "www.movistarplus.es",  url: "https://www.movistarplus.es/" },
    "RTVE Play":              { dominio: "www.rtve.es",           url: "https://www.rtve.es/play/" },
    "DAZN":                   { dominio: "www.dazn.com",          url: "https://www.dazn.com/es-ES/" },
    "DirecTV (exclusivo)":    { dominio: "directvla.com",         url: "https://www.directvla.com/pe" },
  },

  torneo: {
    nombre: "Copa del Mundo 2026",
    sedes: "Canadá · Estados Unidos · México",
    equipos: 48,
    partidos: 104,
    estadios: 16,
    faseActual: "Dieciseisavos de final",
    finalFecha: "2026-07-19",
    finalSede: "Nueva York / Nueva Jersey",
  },

  /* ------------------------------------------------------------
     EQUIPOS — código: { nombre, bandera, alias (otros códigos
     que usan distintas APIs, p. ej. football-data.org) }
     ------------------------------------------------------------ */
  equipos: {
    MEX: { nombre: "México",              bandera: "🇲🇽", iso: "mx", alias: [] },
    RSA: { nombre: "Sudáfrica",           bandera: "🇿🇦", iso: "za", alias: ["ZAF"] },
    KOR: { nombre: "Corea del Sur",       bandera: "🇰🇷", iso: "kr", alias: [] },
    CZE: { nombre: "Chequia",             bandera: "🇨🇿", iso: "cz", alias: [] },
    SUI: { nombre: "Suiza",               bandera: "🇨🇭", iso: "ch", alias: ["CHE"] },
    CAN: { nombre: "Canadá",              bandera: "🇨🇦", iso: "ca", alias: [] },
    BIH: { nombre: "Bosnia y Herzegovina",bandera: "🇧🇦", iso: "ba", alias: [] },
    QAT: { nombre: "Catar",               bandera: "🇶🇦", iso: "qa", alias: [] },
    BRA: { nombre: "Brasil",              bandera: "🇧🇷", iso: "br", alias: [] },
    MAR: { nombre: "Marruecos",           bandera: "🇲🇦", iso: "ma", alias: [] },
    SCO: { nombre: "Escocia",             bandera: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", iso: "gb-sct", alias: [] },
    HTI: { nombre: "Haití",               bandera: "🇭🇹", iso: "ht", alias: ["HAI"] },
    USA: { nombre: "Estados Unidos",      bandera: "🇺🇸", iso: "us", alias: [] },
    AUS: { nombre: "Australia",           bandera: "🇦🇺", iso: "au", alias: [] },
    PAR: { nombre: "Paraguay",            bandera: "🇵🇾", iso: "py", alias: ["PRY"] },
    TUR: { nombre: "Turquía",             bandera: "🇹🇷", iso: "tr", alias: [] },
    GER: { nombre: "Alemania",            bandera: "🇩🇪", iso: "de", alias: ["DEU"] },
    CIV: { nombre: "Costa de Marfil",     bandera: "🇨🇮", iso: "ci", alias: [] },
    ECU: { nombre: "Ecuador",             bandera: "🇪🇨", iso: "ec", alias: [] },
    CUW: { nombre: "Curazao",             bandera: "🇨🇼", iso: "cw", alias: ["CUR"] },
    NED: { nombre: "Países Bajos",        bandera: "🇳🇱", iso: "nl", alias: ["NLD"] },
    JPN: { nombre: "Japón",               bandera: "🇯🇵", iso: "jp", alias: [] },
    SWE: { nombre: "Suecia",              bandera: "🇸🇪", iso: "se", alias: [] },
    TUN: { nombre: "Túnez",               bandera: "🇹🇳", iso: "tn", alias: [] },
    BEL: { nombre: "Bélgica",             bandera: "🇧🇪", iso: "be", alias: [] },
    EGY: { nombre: "Egipto",              bandera: "🇪🇬", iso: "eg", alias: [] },
    IRN: { nombre: "Irán",                bandera: "🇮🇷", iso: "ir", alias: [] },
    NZL: { nombre: "Nueva Zelanda",       bandera: "🇳🇿", iso: "nz", alias: [] },
    ESP: { nombre: "España",              bandera: "🇪🇸", iso: "es", alias: [] },
    CPV: { nombre: "Cabo Verde",          bandera: "🇨🇻", iso: "cv", alias: [] },
    URU: { nombre: "Uruguay",             bandera: "🇺🇾", iso: "uy", alias: [] },
    KSA: { nombre: "Arabia Saudita",      bandera: "🇸🇦", iso: "sa", alias: ["SAU"] },
    FRA: { nombre: "Francia",             bandera: "🇫🇷", iso: "fr", alias: [] },
    NOR: { nombre: "Noruega",             bandera: "🇳🇴", iso: "no", alias: [] },
    SEN: { nombre: "Senegal",             bandera: "🇸🇳", iso: "sn", alias: [] },
    IRQ: { nombre: "Irak",                bandera: "🇮🇶", iso: "iq", alias: [] },
    ARG: { nombre: "Argentina",           bandera: "🇦🇷", iso: "ar", alias: [] },
    AUT: { nombre: "Austria",             bandera: "🇦🇹", iso: "at", alias: [] },
    DZA: { nombre: "Argelia",             bandera: "🇩🇿", iso: "dz", alias: ["ALG"] },
    JOR: { nombre: "Jordania",            bandera: "🇯🇴", iso: "jo", alias: [] },
    COL: { nombre: "Colombia",            bandera: "🇨🇴", iso: "co", alias: [] },
    POR: { nombre: "Portugal",            bandera: "🇵🇹", iso: "pt", alias: ["PRT"] },
    COD: { nombre: "RD Congo",            bandera: "🇨🇩", iso: "cd", alias: [] },
    UZB: { nombre: "Uzbekistán",          bandera: "🇺🇿", iso: "uz", alias: [] },
    ENG: { nombre: "Inglaterra",          bandera: "🏴󠁧󠁢󠁥󠁮󠁧󠁬󠁿", iso: "gb-eng", alias: [] },
    CRO: { nombre: "Croacia",             bandera: "🇭🇷", iso: "hr", alias: ["HRV"] },
    GHA: { nombre: "Ghana",               bandera: "🇬🇭", iso: "gh", alias: [] },
    PAN: { nombre: "Panamá",              bandera: "🇵🇦", iso: "pa", alias: [] },
  },

  /* ------------------------------------------------------------
     FASE DE GRUPOS — clasificación final (fase ya terminada).
     clasificado: true = pasó a dieciseisavos (1º, 2º y los 8
     mejores terceros: PAR, ECU, GHA, DZA, BIH, SWE, SEN, COD).
     ------------------------------------------------------------ */
  grupos: [
    { letra: "A", filas: [
      { code: "MEX", pj: 3, g: 3, e: 0, p: 0, pts: 9, clasificado: true },
      { code: "RSA", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "KOR", pj: 3, g: 1, e: 0, p: 2, pts: 3, clasificado: false },
      { code: "CZE", pj: 3, g: 0, e: 1, p: 2, pts: 1, clasificado: false },
    ]},
    { letra: "B", filas: [
      { code: "SUI", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "CAN", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "BIH", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "QAT", pj: 3, g: 0, e: 1, p: 2, pts: 1, clasificado: false },
    ]},
    { letra: "C", filas: [
      { code: "BRA", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "MAR", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "SCO", pj: 3, g: 1, e: 0, p: 2, pts: 3, clasificado: false },
      { code: "HTI", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
    { letra: "D", filas: [
      { code: "USA", pj: 3, g: 2, e: 0, p: 1, pts: 6, clasificado: true },
      { code: "AUS", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "PAR", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "TUR", pj: 3, g: 1, e: 0, p: 2, pts: 3, clasificado: false },
    ]},
    { letra: "E", filas: [
      { code: "GER", pj: 3, g: 2, e: 0, p: 1, pts: 6, clasificado: true },
      { code: "CIV", pj: 3, g: 2, e: 0, p: 1, pts: 6, clasificado: true },
      { code: "ECU", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "CUW", pj: 3, g: 0, e: 1, p: 2, pts: 1, clasificado: false },
    ]},
    { letra: "F", filas: [
      { code: "NED", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "JPN", pj: 3, g: 1, e: 2, p: 0, pts: 5, clasificado: true },
      { code: "SWE", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "TUN", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
    { letra: "G", filas: [
      { code: "BEL", pj: 3, g: 1, e: 2, p: 0, pts: 5, clasificado: true },
      { code: "EGY", pj: 3, g: 1, e: 2, p: 0, pts: 5, clasificado: true },
      { code: "IRN", pj: 3, g: 0, e: 3, p: 0, pts: 3, clasificado: false },
      { code: "NZL", pj: 3, g: 0, e: 1, p: 2, pts: 1, clasificado: false },
    ]},
    { letra: "H", filas: [
      { code: "ESP", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "CPV", pj: 3, g: 0, e: 3, p: 0, pts: 3, clasificado: true },
      { code: "URU", pj: 3, g: 0, e: 2, p: 1, pts: 2, clasificado: false },
      { code: "KSA", pj: 3, g: 0, e: 2, p: 1, pts: 2, clasificado: false },
    ]},
    { letra: "I", filas: [
      { code: "FRA", pj: 3, g: 3, e: 0, p: 0, pts: 9, clasificado: true },
      { code: "NOR", pj: 3, g: 2, e: 0, p: 1, pts: 6, clasificado: true },
      { code: "SEN", pj: 3, g: 1, e: 0, p: 2, pts: 3, clasificado: true },
      { code: "IRQ", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
    { letra: "J", filas: [
      { code: "ARG", pj: 3, g: 3, e: 0, p: 0, pts: 9, clasificado: true },
      { code: "AUT", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "DZA", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "JOR", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
    { letra: "K", filas: [
      { code: "COL", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "POR", pj: 3, g: 1, e: 2, p: 0, pts: 5, clasificado: true },
      { code: "COD", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "UZB", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
    { letra: "L", filas: [
      { code: "ENG", pj: 3, g: 2, e: 1, p: 0, pts: 7, clasificado: true },
      { code: "CRO", pj: 3, g: 2, e: 0, p: 1, pts: 6, clasificado: true },
      { code: "GHA", pj: 3, g: 1, e: 1, p: 1, pts: 4, clasificado: true },
      { code: "PAN", pj: 3, g: 0, e: 0, p: 3, pts: 0, clasificado: false },
    ]},
  ],

  /* ------------------------------------------------------------
     PARTIDOS — eliminación directa.
     estado: 'fin' | 'vivo' | 'prog'
     penales: { l, v } si se definió por penales.
     nota: texto extra ("Prórroga", etc.).
     Horas en UTC (ISO); el navegador las muestra en hora local.
     Para llaves sin equipo definido: code null + placeholder.
     ------------------------------------------------------------ */
  partidos: [
    // ============ DIECISEISAVOS DE FINAL (28 jun – 3 jul) ============
    { id: 73, fase: "16avos", estado: "fin", inicioUTC: "2026-06-28T20:00:00Z",
      local: "RSA", visita: "CAN", gl: 0, gv: 1, estadio: "Los Ángeles" },
    { id: 74, fase: "16avos", estado: "fin", inicioUTC: "2026-06-29T20:30:00Z",
      local: "GER", visita: "PAR", gl: 1, gv: 1, penales: { l: 3, v: 4 },
      nota: "Penales", estadio: "Boston" },
    { id: 75, fase: "16avos", estado: "fin", inicioUTC: "2026-06-30T01:00:00Z",
      local: "NED", visita: "MAR", gl: 1, gv: 1, penales: { l: 2, v: 3 },
      nota: "Penales", estadio: "Monterrey" },
    { id: 76, fase: "16avos", estado: "fin", inicioUTC: "2026-06-29T17:00:00Z",
      local: "BRA", visita: "JPN", gl: 2, gv: 1, estadio: "Houston" },
    { id: 77, fase: "16avos", estado: "fin", inicioUTC: "2026-06-30T21:00:00Z",
      local: "FRA", visita: "SWE", gl: 3, gv: 0, estadio: "Nueva York / Nueva Jersey" },
    { id: 78, fase: "16avos", estado: "fin", inicioUTC: "2026-06-30T17:00:00Z",
      local: "CIV", visita: "NOR", gl: 1, gv: 2, estadio: "Dallas" },
    { id: 79, fase: "16avos", estado: "fin", inicioUTC: "2026-07-01T02:00:00Z",
      local: "MEX", visita: "ECU", gl: 2, gv: 0, estadio: "Ciudad de México" },
    { id: 80, fase: "16avos", estado: "fin", inicioUTC: "2026-07-01T16:00:00Z",
      local: "ENG", visita: "COD", gl: 2, gv: 1 },
    { id: 81, fase: "16avos", estado: "fin", inicioUTC: "2026-07-02T00:00:00Z",
      local: "USA", visita: "BIH", gl: 2, gv: 0, estadio: "San Francisco" },
    { id: 82, fase: "16avos", estado: "fin", inicioUTC: "2026-07-01T20:00:00Z",
      local: "BEL", visita: "SEN", gl: 3, gv: 2, nota: "Prórroga", estadio: "Seattle" },
    { id: 83, fase: "16avos", estado: "fin", inicioUTC: "2026-07-02T23:00:00Z",
      local: "POR", visita: "CRO", gl: 2, gv: 1, estadio: "Toronto" },
    { id: 84, fase: "16avos", estado: "fin", inicioUTC: "2026-07-02T19:00:00Z",
      local: "ESP", visita: "AUT", gl: 3, gv: 0, estadio: "Los Ángeles" },
    { id: 85, fase: "16avos", estado: "fin", inicioUTC: "2026-07-03T03:00:00Z",
      local: "SUI", visita: "DZA", gl: 2, gv: 0, estadio: "Vancouver" },
    { id: 86, fase: "16avos", estado: "prog", inicioUTC: "2026-07-03T22:00:00Z",
      local: "ARG", visita: "CPV", gl: null, gv: null, estadio: "Miami" },
    { id: 87, fase: "16avos", estado: "prog", inicioUTC: "2026-07-04T01:30:00Z",
      local: "COL", visita: "GHA", gl: null, gv: null, estadio: "Kansas City" },
    { id: 88, fase: "16avos", estado: "prog", inicioUTC: "2026-07-03T18:00:00Z",
      local: "AUS", visita: "EGY", gl: null, gv: null, estadio: "Dallas" },

    // ============ OCTAVOS DE FINAL (4 – 7 jul) ============
    { id: 89, fase: "octavos", estado: "prog", inicioUTC: "2026-07-04T17:00:00Z",
      local: "CAN", visita: "MAR", gl: null, gv: null },
    { id: 90, fase: "octavos", estado: "prog", inicioUTC: "2026-07-04T21:00:00Z",
      local: "PAR", visita: "FRA", gl: null, gv: null },
    { id: 91, fase: "octavos", estado: "prog", inicioUTC: "2026-07-05T20:00:00Z",
      local: "BRA", visita: "NOR", gl: null, gv: null, estadio: "Nueva York / Nueva Jersey" },
    { id: 92, fase: "octavos", estado: "prog", inicioUTC: "2026-07-06T00:00:00Z",
      local: "MEX", visita: "ENG", gl: null, gv: null },
    { id: 93, fase: "octavos", estado: "prog", inicioUTC: "2026-07-06T19:00:00Z",
      local: "POR", visita: "ESP", gl: null, gv: null },
    { id: 94, fase: "octavos", estado: "prog", inicioUTC: "2026-07-07T00:00:00Z",
      local: "USA", visita: "BEL", gl: null, gv: null, estadio: "Seattle" },
    { id: 95, fase: "octavos", estado: "prog", inicioUTC: null, fechaTexto: "Mar 7 jul · hora por definir",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Ganador Suiza / Argelia", placeholderV: "Ganador Colombia / Ghana" },
    { id: 96, fase: "octavos", estado: "prog", inicioUTC: "2026-07-07T16:00:00Z",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Ganador Argentina / Cabo Verde", placeholderV: "Ganador Australia / Egipto" },

    // ============ CUARTOS DE FINAL (9 – 11 jul) ============
    { id: 97, fase: "cuartos", estado: "prog", inicioUTC: null, fechaTexto: "Jue 9 – Sáb 11 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },
    { id: 98, fase: "cuartos", estado: "prog", inicioUTC: null, fechaTexto: "Jue 9 – Sáb 11 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },
    { id: 99, fase: "cuartos", estado: "prog", inicioUTC: null, fechaTexto: "Jue 9 – Sáb 11 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },
    { id: 100, fase: "cuartos", estado: "prog", inicioUTC: null, fechaTexto: "Jue 9 – Sáb 11 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },

    // ============ SEMIFINALES (14 – 15 jul) ============
    { id: 101, fase: "semis", estado: "prog", inicioUTC: null, fechaTexto: "Mar 14 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },
    { id: 102, fase: "semis", estado: "prog", inicioUTC: null, fechaTexto: "Mié 15 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },

    // ============ TERCER PUESTO Y FINAL ============
    { id: 103, fase: "tercer", estado: "prog", inicioUTC: null, fechaTexto: "Sáb 18 jul",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir" },
    { id: 104, fase: "final", estado: "prog", inicioUTC: null,
      fechaTexto: "Dom 19 jul · Nueva York / Nueva Jersey",
      local: null, visita: null, gl: null, gv: null,
      placeholderL: "Por definir", placeholderV: "Por definir",
      estadio: "Nueva York / Nueva Jersey" },
  ],

  nombresFase: {
    "16avos":  "Dieciseisavos de final",
    "octavos": "Octavos de final",
    "cuartos": "Cuartos de final",
    "semis":   "Semifinales",
    "tercer":  "Tercer puesto",
    "final":   "Gran Final",
  },
};

// Índice rápido de alias → código canónico (para adaptar otras APIs)
const ALIAS_EQUIPO = (() => {
  const m = {};
  for (const [code, eq] of Object.entries(DATOS_MUNDIAL.equipos)) {
    m[code] = code;
    (eq.alias || []).forEach(a => { m[a] = code; });
  }
  return m;
})();

/* OXMO Control Operacional v20-clean-deep
   Base: v19-clean-safe. Limpieza profunda segura: duplicados retirados, Alertas fuera, clave personal removida de vistas visibles.
*/
/* =========================================================
   OXMO CONTROL OPERACIONAL - v19-clean-safe
   Limpieza segura generada desde v18.
   - Se eliminaron definiciones antiguas duplicadas cuando la última versión ya las reemplazaba.
   - Se mantuvieron intactos los bloques con dependencia de versiones base.
   - No se reescribieron cálculos sensibles de mezcla, ACP, Infodia, silos ni nube.
   ========================================================= */
const C = {
  blue: "#1E6FD9", blueLight: "#3A8EF5", cyan: "#00D4FF",
  green: "#00E5A0", copper: "#C87533", yellow: "#FFB800", red: "#FF4560",
  txt2: "#6A8FAF", txt3: "#2D4A6A"
};

const DEFAULT_USUARIOS = [
  { u: "admin", p: "oxmo2024", rol: "Administrador", nombre: "Administrador" },
  { u: "operador", p: "turno123", rol: "Operador", nombre: "Operador Turno" },
  { u: "supervisor", p: "super456", rol: "Supervisor", nombre: "Supervisor Planta" },
];
const USUARIOS = DEFAULT_USUARIOS;
const ROLES_USUARIO = ["Operador", "Supervisor", "Jefe de planta", "Super intendente", "Gerente", "Administrador"];

const LOTES_DEFAULT = [];
const DEFAULT_SECTORES = ["Bodega en transito", "Planta Envase"];
const CLOUD_CONFIG_KEY = "oxmo:supabase";
const DEFAULT_CLOUD_CONFIG = {
  url: "https://obkvneyvgzraxolohmwf.supabase.co",
  anonKey: "sb_publishable_MYJYPjkMBaSbY_9ujIZRhQ_A5Ta7re0",
};
const PUBLIC_APP_URL = "https://oxmo-control-operacional.vercel.app/";
const SHARED_KEYS = new Set(["oxmo:lotes", "oxmo:hist", "oxmo:sectores", "oxmo:silos", "oxmo:comunes", "oxmo:siloNiveles", "oxmo:siloHistorial", "oxmo:infodia", "oxmo:usuarios", "oxmo:userStats", "oxmo:avisos"]);
const HIDDEN_TABS = new Set(["quimica", "siloHistorial", "comunesTurno", "etiquetas", "alertas"]);
const cloud = { client: null, channel: null, ready: false, applying: false, status: "local", lastError: "", needsLotesCleanup: false, needsSiloCleanup: false };
let tabRenderFrame = 0;

const DEFAULT_SILOS = Array.from({ length: 8 }, (_, i) => ({
  id: `Silo ${i + 4}`,
  cap: 50,
}));
const SILOS = DEFAULT_SILOS.map(s => ({...s, nivel: 0, den: 1, cu: 0, mo: 0, turno: ""}));

const SILO_SIM_WINDOWS = [
  { start: "2026-04-10", end: "2026-04-20", label: "10 al 20 de abril" },
  { start: "2026-05-10", end: "2026-05-20", label: "10 al 20 de mayo (prueba por falta de abril en el archivo)" },
];

const CARTILLA_MANUAL_SIMULADA = [
  { cantidad: 6, id: "FINO-BRIG-01", nota: "Fino Brig / 6 mx Oxmo", cu: 0.32, mo: 58.4, s: 0.012 },
  { cantidad: 10, id: "BRIG-TRANS-01", nota: "Brig transito / 6 mx Oxmo", cu: 0.34, mo: 58.1, s: 0.011 },
  { cantidad: 20, id: "OXMO10050-26", nota: "Oxmo 10050-26", cu: 0.30, mo: 59.0, s: 0.010 },
  { cantidad: 8, id: "ALTO-AZUFRE-01", nota: "Alto azufre", cu: 0.48, mo: 57.2, s: 0.145 },
  { cantidad: 20, id: "OXMO805-26", nota: "Oxmo 805-26", cu: 0.42, mo: 57.8, s: 0.014 },
  { cantidad: 8, id: "SILO10-INV-01", nota: "Oxmo Silo 10", cu: 0.38, mo: 58.5, s: 0.012 },
  { cantidad: 20, id: "OXMO10046-26", nota: "Oxmo 10046-26", cu: 0.52, mo: 56.2, s: 0.012 },
  { cantidad: 2, id: "OXMO-CDP-01", nota: "Oxmo CDP", cu: 0.44, mo: 57.6, s: 0.011 },
  { cantidad: 40, id: "INV-SILO11-13", nota: "Inventario Oxmo Silo 11/13", cu: 0.29, mo: 57.9, s: 0.013 },
  { cantidad: 21, id: "OXMO-CDP-02", nota: "Oxmo CDP", cu: 0.46, mo: 57.4, s: 0.012 },
  { cantidad: 20, id: "OXMO10047-26", nota: "Oxmo 10047-26", cu: 0.55, mo: 55.4, s: 0.012 },
  { cantidad: 18, id: "OXMO-CDP-03", nota: "Oxmo CDP", cu: 0.41, mo: 58.0, s: 0.011 },
  { cantidad: 20, id: "OSACB81-26", nota: "OSAC B81-26", cu: 0.36, mo: 58.2, s: 0.012 },
  { cantidad: 37, id: "REC-OXMO-01", nota: "Recuperado Oxmo", tipo: "Tambor", cu: 0.49, mo: 57.1, s: 0.018 },
  { cantidad: 35, id: "REC-B79-26", nota: "Recuperado B79-26", tipo: "Tambor", cu: 0.50, mo: 57.0, s: 0.019 },
  { cantidad: 20, id: "OSAC823-26", nota: "OSAC 823-26", cu: 0.31, mo: 58.6, s: 0.011 },
  { cantidad: 20, id: "OXMO-COLPAS-S10", nota: "Oxmo Colpas Silo 10", cu: 0.35, mo: 58.1, s: 0.012 },
  { cantidad: 20, id: "OSAC824-26", nota: "OSAC 824-26", cu: 0.28, mo: 58.8, s: 0.011 },
  { cantidad: 20, id: "OSAC827-26", nota: "OSAC 827-26", cu: 0.43, mo: 57.7, s: 0.012 },
  { cantidad: 20, id: "OSAC829-26", nota: "OSAC 829-26", cu: 0.53, mo: 55.5, s: 0.012 },
  { cantidad: 20, id: "OSAC826-26", nota: "OSAC 826-26", cu: 0.37, mo: 58.0, s: 0.012 },
  { cantidad: 12, id: "OXMO-SILO12-BC", nota: "Oxmo Silo 12 BC", cu: 0.27, mo: 58.4, s: 0.011 },
  { cantidad: 14, id: "OSAC814-26", nota: "OSAC 814-26", cu: 0.34, mo: 58.2, s: 0.012 },
  { cantidad: 2, id: "OSAC845-26", nota: "OSAC 845-26", cu: 0.45, mo: 57.6, s: 0.013 },
  { cantidad: 20, id: "OXMO10050-26-B", nota: "Oxmo 10050-26", cu: 0.30, mo: 59.0, s: 0.010 },
  { cantidad: 20, id: "OSAC805-26", nota: "OSAC 805-26", cu: 0.40, mo: 57.9, s: 0.012 },
  { cantidad: 20, id: "OSAC804-26", nota: "OSAC 804-26", cu: 0.39, mo: 58.1, s: 0.012 },
  { cantidad: 20, id: "OSAC821-26", nota: "OSAC 821-26", cu: 0.33, mo: 58.5, s: 0.011 },
];

const state = {
  user: load("oxmo:user", null),
  usuarios: loadUsuarios(),
  userStats: load("oxmo:userStats", {}),
  sessionStartedAt: Date.now(),
  adminView: "usuarios",
  lotes: loadLotes(),
  historial: load("oxmo:hist", [{tiempo:"--:--",accion:"Sistema iniciado",color:C.green,loteId:"",detalle:""}]),
  tab: "inventario",
  filtro: "Todos",
  editando: null,
  sectores: load("oxmo:sectores", DEFAULT_SECTORES),
  silosBase: loadSilos(),
  comunes: load("oxmo:comunes", []),
  siloNiveles: cleanSiloNiveles(load("oxmo:siloNiveles", {})),
  siloHistorial: load("oxmo:siloHistorial", []),
  infodia: load("oxmo:infodia", null),
  etiquetaFiltro: "Todos",
  etiquetaSel: [],
  reporteHTML: "",
  cloudPanel: false,
  cloudMsg: "",
  siloHistSearch: "",
  acpSearch: "",
  avisos: load("oxmo:avisos", []),
  mixMsg: "",
  mixProcessing: false,
  mixProgress: 0,
  mixOptions: null,
  mix: { cu: 0.5, mo: 57, s: 0.1, masa: 20000, sel: [], sector: "Todos" },
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : structuredClone(fallback);
  } catch {
    return structuredClone(fallback);
  }
}
function loadLotes() {
  const lotes = load("oxmo:lotes", LOTES_DEFAULT);
  const legacySeedIds = Array.from({ length: 13 }, (_, i) => `L-${String(i + 1).padStart(3, "0")}`);
  const isLegacySeed = lotes.length === legacySeedIds.length && lotes.every((l, i) => l.id === legacySeedIds[i]);
  if (isLegacySeed) {
    save("oxmo:lotes", []);
    return [];
  }
  const cleaned = lotes.filter(l => !isInfodiaProductionLote(l));
  if (cleaned.length !== lotes.length) save("oxmo:lotes", cleaned);
  return cleaned;
}
function loadUsuarios() {
  const saved = load("oxmo:usuarios", null);
  if (Array.isArray(saved) && saved.length) return saved.map(normalizarUsuario);
  save("oxmo:usuarios", DEFAULT_USUARIOS);
  return structuredClone(DEFAULT_USUARIOS);
}
function normalizarUsuario(u) {
  return {
    u: String(u?.u || "").trim().toLowerCase(),
    p: String(u?.p || ""),
    rol: u?.rol || "Operador",
    nombre: u?.nombre || u?.u || "Usuario",
    activo: u?.activo !== false,
    creado: u?.creado || hoy(),
    cargo: String(u?.cargo || "").trim(),
    area: String(u?.area || u?.areaCelula || "").trim(),
    areaCelula: String(u?.areaCelula || u?.area || "").trim(),
    turno: String(u?.turno || "").trim(),
    telefono: String(u?.telefono || "").trim(),
    correo: String(u?.correo || "").trim(),
    direccion: String(u?.direccion || "").trim(),
    contactoEmergenciaNombre: String(u?.contactoEmergenciaNombre || "").trim(),
    contactoEmergenciaRelacion: String(u?.contactoEmergenciaRelacion || "").trim(),
    contactoEmergenciaTelefono: String(u?.contactoEmergenciaTelefono || "").trim(),
    observacionesContacto: String(u?.observacionesContacto || "").trim(),
  };
}
function loadSilos() {
  const saved = load("oxmo:silos", DEFAULT_SILOS);
  if (!Array.isArray(saved) || saved.length < 8 || saved.some(s => /^S-\d+/.test(s.id || ""))) {
    save("oxmo:silos", DEFAULT_SILOS);
    return structuredClone(DEFAULT_SILOS);
  }
  return saved.map((s, i) => ({ id: s.id || `Silo ${i + 4}`, cap: Number(s.cap || 50) }));
}
function isValidSiloId(id) {
  return /^Silo (4|5|6|7|8|9|10|11)$/.test(String(id || ""));
}
function cleanSiloNiveles(niveles) {
  return Object.fromEntries(Object.entries(niveles || {}).filter(([id]) => isValidSiloId(id)));
}
function sortedSiloEntries(niveles = state.siloNiveles) {
  return Object.entries(cleanSiloNiveles(niveles)).sort((a, b) => parseInt(a[0].replace(/\D/g, ""), 10) - parseInt(b[0].replace(/\D/g, ""), 10));
}
function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  if (SHARED_KEYS.has(key) && cloud.ready && !cloud.applying) cloudSave(key, value);
}
function cloudConfig() {
  try { return JSON.parse(localStorage.getItem(CLOUD_CONFIG_KEY) || "null") || DEFAULT_CLOUD_CONFIG; }
  catch { return DEFAULT_CLOUD_CONFIG; }
}
function saveCloudConfig(cfg) {
  localStorage.setItem(CLOUD_CONFIG_KEY, JSON.stringify(cfg));
}
function clearCloudConfig() {
  localStorage.removeItem(CLOUD_CONFIG_KEY);
}
function sharedFallback(key) {
  if (key === "oxmo:lotes") return [];
  if (key === "oxmo:hist") return state.historial || [];
  if (key === "oxmo:sectores") return DEFAULT_SECTORES;
  if (key === "oxmo:silos") return DEFAULT_SILOS;
  if (key === "oxmo:comunes") return [];
  if (key === "oxmo:siloNiveles") return {};
  if (key === "oxmo:siloHistorial") return [];
  if (key === "oxmo:infodia") return null;
  if (key === "oxmo:usuarios") return DEFAULT_USUARIOS;
  if (key === "oxmo:userStats") return {};
  if (key === "oxmo:avisos") return [];
  return null;
}
/* v19-clean-safe: definición antigua removida: cloudSave */

/* v19-clean-safe: definición antigua removida: applyCloudValue */

async function initCloud() {
  const cfg = cloudConfig();
  if (!cfg?.url || !cfg?.anonKey || !window.supabase?.createClient) {
    cloud.status = "local";
    cloud.lastError = window.supabase?.createClient ? "" : "No se cargo la libreria de Supabase desde internet.";
    return;
  }
  try {
    cloud.lastError = "";
    cloud.client = window.supabase.createClient(cfg.url, cfg.anonKey);
    const { data, error } = await cloud.client.from("oxmo_state").select("key,value");
    if (error) throw error;
    cloud.applying = true;
    for (const row of data || []) {
      if (SHARED_KEYS.has(row.key)) applyCloudValue(row.key, row.value);
    }
    cloud.applying = false;
    cloud.channel = cloud.client
      .channel("oxmo_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "oxmo_state" }, payload => {
        const row = payload.new;
        if (!row || !SHARED_KEYS.has(row.key)) return;
        applyCloudValue(row.key, row.value);
        if (state.tab !== "reportePrint") render();
      })
      .subscribe();
    cloud.ready = true;
    cloud.status = "tiempo real";
    if (cloud.needsLotesCleanup) {
      cloud.needsLotesCleanup = false;
      await cloudSave("oxmo:lotes", state.lotes);
    }
    if (cloud.needsSiloCleanup) {
      cloud.needsSiloCleanup = false;
      await cloudSave("oxmo:siloNiveles", state.siloNiveles);
    }
    render();
  } catch (e) {
    cloud.ready = false;
    cloud.status = "error nube";
    cloud.lastError = e?.message || String(e);
    console.error("Cloud init error", e);
    render();
  }
}
/* v19-clean-safe: definición antigua removida: configureCloud */

function hoy() { return new Date().toLocaleDateString("es-CL"); }
function ahora() { return new Date().toLocaleTimeString("es-CL", {hour:"2-digit", minute:"2-digit"}); }
function fmt(n, d = 2) { return Number(n || 0).toFixed(d); }
function kgToTon(kg, d = 2) { return `${(Number(kg || 0) / 1000).toFixed(d)} t`; }
function nuevoId() {
  const nums = state.lotes
    .map(l => /^L-\d+$/i.test(String(l.id || "")) ? parseInt(String(l.id).split("-")[1], 10) : 0)
    .filter(Number.isFinite);
  return `L-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
}
function repararIdsLotesManuales() {
  const esIdManualInvalido = id => !id || /^L-\s*(NaN|undefined|null)?$/i.test(id);
  const usados = new Set(state.lotes.map(l => String(l.id || "").trim()).filter(id => id && !esIdManualInvalido(id)));
  let changed = false;
  state.lotes = state.lotes.map(l => {
    const id = String(l.id || "").trim();
    if (!esIdManualInvalido(id)) return l;
    let nuevo = nuevoId();
    while (usados.has(nuevo)) {
      const n = parseInt(nuevo.split("-")[1], 10) + 1;
      nuevo = `L-${String(n).padStart(3, "0")}`;
    }
    usados.add(nuevo);
    changed = true;
    return { ...l, id: nuevo };
  });
  if (changed) persistLotes();
}
function allSectores() {
  return [...new Set([...DEFAULT_SECTORES, ...state.sectores, ...state.lotes.map(l => l.sector).filter(Boolean)])];
}
function saveSectores() {
  state.sectores = allSectores();
  save("oxmo:sectores", state.sectores);
}
function hasAnalysis(l) {
  return Number(l.cu) > 0 || Number(l.mo) > 0 || Number(l.s) > 0;
}
function isInfodiaProductionLote(l) {
  const id = String(l?.id || "").toUpperCase();
  const obs = String(l?.obs || "").toUpperCase();
  const sector = String(l?.sector || "").toUpperCase();
  return obs.includes("IMPORTADO DESDE INFODIA") || (id.startsWith("OXM") && sector.includes("PLANTA ENVASE") && !hasAnalysis(l));
}
function clasificar(l) {
  if (!hasAnalysis(l)) return { clase: "Pendiente", color: C.yellow };
  if (l.s >= 0.1) return { clase: "Fuera Esp", color: C.red };
  if (l.cu >= 0 && l.cu <= 0.5 && l.mo >= 57) return { clase: "Bajo Cobre", color: C.green };
  if (l.cu >= 0.51 && l.cu <= 3 && l.mo >= 55) return { clase: "Alto Cobre", color: C.copper };
  return { clase: "Fuera Esp", color: C.red };
}
function moMinimo(cu) {
  return Number(cu) <= 0.5 ? 57 : 55;
}
function cumpleSpec(mix) {
  return hasAnalysis(mix) && mix.s < 0.1 && mix.mo >= moMinimo(mix.cu);
}
function unidadNombre(l) {
  return l.tipo === "Tambor" ? "tambores" : "sacos";
}
function comunesPorSilo(siloId) {
  return state.comunes.filter(c => c.siloId === siloId);
}
function ponderarSilo(base) {
  const comunes = comunesPorSilo(base.id);
  const masa = comunes.reduce((a, c) => a + Number(c.masa || 0), 0);
  const weighted = key => masa ? comunes.reduce((a, c) => a + Number(c[key] || 0) * Number(c.masa || 0), 0) / masa : 0;
  const nivelImportado = state.siloNiveles?.[base.id] || null;
  const masaImportada = Number(nivelImportado?.masa || 0);
  const usaComunes = masa > 0;
  const usaInfodia = !usaComunes && masaImportada > 0;
  const masaOperacional = usaComunes ? masa : usaInfodia ? masaImportada : 0;
  const silo = {
    ...base,
    masa: masaOperacional,
    nivel: base.cap ? Math.min(100, (masaOperacional / base.cap) * 100) : 0,
    cu: usaComunes ? weighted("cu") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.cu || 0) : 0,
    mo: usaComunes ? weighted("mo") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.mo || 0) : 0,
    s: usaComunes ? weighted("s") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.s || 0) : 0,
    muestras: usaComunes ? comunes.length : usaInfodia && hasAnalysis(nivelImportado) ? 1 : 0,
    ultimo: comunes.at(-1),
    nivelImportado,
  };
  return {...silo, ...clasificar(silo)};
}
function silosPonderados() {
  return state.silosBase.map(ponderarSilo);
}
function eColor(e) {
  return e === "Disponible" ? C.green : e === "Pendiente" ? C.yellow : C.red;
}
function addHist(accion, loteId = "", detalle = "", color = C.txt2) {
  state.historial.push({ tiempo: ahora(), accion, loteId, detalle, color });
  state.historial = state.historial.slice(-80);
  save("oxmo:hist", state.historial);
  registrarActividadUsuario(accion, loteId, detalle);
}
function persistLotes() { save("oxmo:lotes", state.lotes); }
function isAdmin(user = state.user) {
  return user?.rol === "Administrador";
}
function isSupervisor(user = state.user) {
  return user?.rol === "Supervisor";
}
function isOperator(user = state.user) {
  return user?.rol === "Operador";
}
function canViewTab(id, user = state.user) {
  if (!user) return false;
  if (HIDDEN_TABS.has(id)) return false;
  if (isAdmin(user)) return true;
  if (isOperator(user)) return ["inventario", "registro", "lotesOxmo", "alertas", "avisos"].includes(id);
  if (isSupervisor(user)) return ["inventario", "silos", "lotesOxmo", "mezclas", "reportes", "alertas", "avisos", "infodia"].includes(id);
  return ["inventario", "silos", "lotesOxmo", "mezclas", "reportes", "alertas"].includes(id);
}
function visibleTabs() {
  return [
    ["inventario", "Inventario"],
    ["silos", "Silos"],
    ["lotesOxmo", "Lotes OXMO/BQA"],
    ["mezclas", "Mezclas"],
    ["etiquetas", "Etiquetas"],
    ["reportes", "Reportes"],
    ["avisos", "Avisos"],
    ["admin", "Admin"],
  ].filter(([id]) => canViewTab(id));
}
function canEditLot(l, user = state.user) {
  if (!user || !l) return false;
  if (isAdmin(user) || isSupervisor(user)) return true;
  if (!isOperator(user)) return true;
  const owner = String(l.createdBy || "").trim().toLowerCase();
  return owner && owner === userKey(user);
}
function saveUsuarios() {
  state.usuarios = state.usuarios.map(normalizarUsuario);
  save("oxmo:usuarios", state.usuarios);
}
function userKey(user = state.user) {
  return String(user?.u || "").trim().toLowerCase();
}
function ensureUserStat(usuario) {
  const key = typeof usuario === "string" ? usuario : userKey(usuario);
  if (!key) return null;
  if (!state.userStats[key]) {
    state.userStats[key] = { acciones: 0, tiempoMs: 0, recientes: [], lastSeen: "" };
  }
  return state.userStats[key];
}
function registrarActividadUsuario(accion, loteId = "", detalle = "") {
  if (!state.user) return;
  const stat = ensureUserStat(state.user);
  if (!stat) return;
  stat.acciones = Number(stat.acciones || 0) + 1;
  stat.lastSeen = new Date().toLocaleString("es-CL");
  stat.recientes = [
    { fecha: hoy(), tiempo: ahora(), accion, loteId, detalle },
    ...(stat.recientes || [])
  ].slice(0, 16);
  save("oxmo:userStats", state.userStats);
}
function cerrarSesionUsuario() {
  if (!state.user) return;
  const stat = ensureUserStat(state.user);
  if (stat && state.sessionStartedAt) {
    stat.tiempoMs = Number(stat.tiempoMs || 0) + Math.max(0, Date.now() - state.sessionStartedAt);
    stat.lastSeen = new Date().toLocaleString("es-CL");
    save("oxmo:userStats", state.userStats);
  }
  state.sessionStartedAt = Date.now();
}
function tiempoUsuarioMs(usuario) {
  const key = typeof usuario === "string" ? usuario : userKey(usuario);
  const stat = state.userStats[key] || {};
  let ms = Number(stat.tiempoMs || 0);
  if (state.user && userKey() === key && state.sessionStartedAt) ms += Math.max(0, Date.now() - state.sessionStartedAt);
  return ms;
}
function formatDuration(ms) {
  const mins = Math.max(0, Math.round(Number(ms || 0) / 60000));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h ? `${h} h ${m} min` : `${m} min`;
}
function fechaOrdenMs(fecha) {
  if (!fecha) return 0;
  const raw = String(fecha).trim();
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`).getTime();
  const cl = raw.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
  if (cl) return new Date(`${cl[3]}-${String(cl[2]).padStart(2, "0")}-${String(cl[1]).padStart(2, "0")}T00:00:00`).getTime();
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}
function loteOrdenReciente(l) {
  const created = Date.parse(l?.createdAt || "");
  if (Number.isFinite(created)) return created;
  const fecha = fechaOrdenMs(l?.fecha);
  if (fecha) return fecha;
  const num = parseInt(String(l?.id || "").match(/\d+/)?.[0] || "0", 10);
  return Number.isFinite(num) ? num : 0;
}
function lotesRecientes(lotes = state.lotes) {
  return [...lotes].sort((a, b) => loteOrdenReciente(b) - loteOrdenReciente(a));
}

function guardarComunManual(data, fuente = "manual") {
  const masa = parseNum(data.masa);
  const cu = parseNum(data.cu);
  const mo = parseNum(data.mo);
  const s = parseNum(data.s);
  if (!data.siloId || !masa || masa <= 0 || !String(data.cu ?? "").trim() || !String(data.mo ?? "").trim() || !String(data.s ?? "").trim()) {
    alert("Ingresa silo, masa y analisis quimico validos");
    return false;
  }
  const comun = {
    id: `C-${Date.now()}`,
    codigo: data.codigo || `Manual-${Date.now()}`,
    siloId: data.siloId,
    turno: data.turno || "Dia",
    fecha: data.fecha || new Date().toISOString().slice(0, 10),
    masa: Number(masa.toFixed(2)),
    cu: Number(cu.toFixed(3)),
    mo: Number(mo.toFixed(3)),
    s: Number(s.toFixed(4)),
    fuente,
    tipoAnalisis: "comun_turno_manual",
  };
  state.comunes.push(comun);
  save("oxmo:comunes", state.comunes);
  addHist("Comun de turno ingresado", comun.siloId, `${comun.masa}t ${comun.turno}`, clasificar(comun).color);
  return true;
}

function render() {
  const app = document.querySelector("#app");
  const etiquetaPublica = publicEtiquetaFromUrl();
  if (etiquetaPublica) {
    app.innerHTML = etiquetaPublicaHTML(etiquetaPublica);
    return;
  }
  if (state.tab === "reportePrint") {
    app.innerHTML = state.reporteHTML;
    bindReportePrint();
    return;
  }
  if (!state.user) {
    app.innerHTML = loginHTML();
    bindLogin();
    return;
  }
  if (!canViewTab(state.tab)) state.tab = visibleTabs()[0]?.[0] || "inventario";
  app.innerHTML = shellHTML();
  bindShell();
}

function loginHTML() {
  return `
    <main class="login">
      <section class="login-card">
        <div class="brand">
          <div class="brand-mark"></div>
          <div>
            <div class="brand-title">OXMO</div>
            <div class="brand-sub">CONTROL OPERACIONAL</div>
          </div>
        </div>
        <div style="text-align:center;color:var(--txt3);font-size:11px;letter-spacing:3px;margin-bottom:34px">ENVASE · TRAZABILIDAD · INVENTARIO</div>
        <div class="box">
          <div class="muted-title" style="text-align:center;margin-bottom:24px">Iniciar sesión</div>
          <div id="loginError"></div>
          <div class="field"><label>Usuario</label><input id="loginUser" placeholder="Usuario asignado" autocomplete="username"></div>
          <div class="field"><label>Contraseña</label><input id="loginPass" type="password" placeholder="••••••••" autocomplete="current-password"></div>
          <button class="btn" id="loginBtn" style="width:100%">INGRESAR →</button>
          <div class="hint">
            <div style="letter-spacing:2px;margin-bottom:6px">ACCESO AUTORIZADO</div>
            <div>Las cuentas son creadas por el administrador del sistema.</div>
          </div>
        </div>
      </section>
    </main>
  `;
}
function bindLogin() {
  const submit = () => {
    const u = document.querySelector("#loginUser").value.trim().toLowerCase();
    const p = document.querySelector("#loginPass").value;
    const found = state.usuarios.find(x => x.activo !== false && x.u === u && x.p === p);
    if (!found) {
      document.querySelector("#loginError").innerHTML = `<div class="error">Usuario o contraseña incorrectos</div>`;
      return;
    }
    state.user = found;
    state.sessionStartedAt = Date.now();
    save("oxmo:user", found);
    registrarActividadUsuario("Inicio de sesión", "", "Acceso al sistema");
    render();
  };
  document.querySelector("#loginBtn").addEventListener("click", submit);
  document.querySelectorAll("#loginUser,#loginPass").forEach(el => el.addEventListener("keydown", e => {
    if (e.key === "Enter") submit();
  }));
}

function shellHTML() {
  const disp = state.lotes.filter(l => l.estado === "Disponible");
  const masaDisp = disp.reduce((a, l) => a + l.masa, 0);
  const masaRet = state.lotes.filter(l => l.estado !== "Disponible").reduce((a, l) => a + l.masa, 0);
  const cuPool = disp.filter(l => l.cu > 0);
  const cuProm = cuPool.length ? cuPool.reduce((a, l) => a + l.cu, 0) / cuPool.length : 0;
  const finoMoKg = disp.filter(l => Number(l.mo) > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0);
  const pend = state.lotes.filter(l => l.estado === "Pendiente");
  const fuera = state.lotes.filter(l => l.estado === "Fuera Esp");
  return `
    <header class="topbar">
      <div class="brand" style="justify-content:flex-start;margin:0">
        <div class="brand-mark" style="height:38px"></div>
        <div>
          <div style="font-weight:900;letter-spacing:3px">CONTROL OPERACIONAL</div>
          <div class="brand-sub">OXMO · ENVASE · TRAZABILIDAD</div>
        </div>
      </div>
      <div class="top-user-center">
        <div class="top-user-role">${state.user.rol.toUpperCase()}</div>
        <div class="top-user-name">${state.user.nombre}</div>
      </div>
      <div class="top-actions">
        <div style="text-align:right">
          <div id="clock" class="mono" style="color:var(--green);font-size:13px;font-weight:800">${new Date().toLocaleTimeString("es-CL")}</div>
          <div style="color:var(--txt3);font-size:8px;letter-spacing:1px">${hoy()}</div>
        </div>
        <button class="btn secondary" id="cloudConfigBtn" title="Configurar tiempo real">NUBE: ${cloud.status.toUpperCase()}</button>
        <button class="btn danger" id="logoutBtn">SALIR</button>
      </div>
    </header>
    <div class="status">${fuera.length ? `⚠ ${fuera.length} lote(s) fuera de especificación` : "Estado normal"} · Masa disponible: ${kgToTon(masaDisp)} · ${pend.length} pendientes análisis · Lotes totales: ${state.lotes.length}</div>
    <main class="main">
      <section class="kpis">
        ${kpi("Masa Disponible", masaDisp / 1000, "t", `${disp.length} lotes`, C.green, "INV", 2)}
        ${kpi("Masa Retenida", masaRet / 1000, "t", `${state.lotes.length - disp.length} lotes`, C.red, "RET", 2)}
        ${kpi("Fino Mo", finoMoKg / 1000, "t", "Masa x %Mo", C.copper, "◆", 2)}
        ${kpi("Cu Promedio", cuProm, "%", "Lotes analizados", C.cyan, "CU", 2)}
        ${kpi("Total Lotes", state.lotes.length, "", "Todos los sectores", C.blue, "LOT", 0)}
        ${kpi("Sin Análisis", pend.length, "", "Pendientes lab", C.yellow, "LAB", 0)}
      </section>
      <nav class="tabs">
        ${visibleTabs().map(([id, label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}
      </nav>
      ${canViewTab("infodia") ? `<div class="filters" style="margin-bottom:12px">
        <button class="pill ${state.tab === "infodia" ? "active" : ""}" data-tab="infodia">Importar Infodia</button>
      </div>` : ""}
      <section id="tabView">${tabHTML()}</section>
    </main>
    <footer class="footer">
      <span>OXMO CONTROL v20 · ${state.user.nombre} (${state.user.rol}) · ${state.historial.length} eventos</span>
      <span>DATOS PERSISTENTES · SGI COMPATIBLE</span>
    </footer>
    ${state.cloudPanel ? cloudPanelHTML() : ""}
  `;
}
function kpi(label, value, unit, sub, color, icon, dec = 0) {
  const shown = typeof value === "number" ? value.toFixed(dec) : value;
  return `<div class="kpi" style="--accent:${color}"><div class="icon">${icon}</div><div class="kpi-label">${label}</div><div class="kpi-value">${shown}</div><div class="kpi-sub">${unit} · ${sub}</div></div>`;
}
function bindShell() {
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    cerrarSesionUsuario();
    state.user = null;
    save("oxmo:user", null);
    render();
  });
  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    const nextTab = btn.dataset.tab;
    if (state.tab === nextTab) return;
    state.tab = nextTab;
    renderTabSoon();
  }));
  const clock = document.querySelector("#clock");
  setTimeout(() => { if (clock) clock.textContent = new Date().toLocaleTimeString("es-CL"); }, 1000);
  const cloudBtn = document.querySelector("#cloudConfigBtn");
  if (cloudBtn) cloudBtn.addEventListener("click", configureCloud);
  bindCloudPanel();
  bindTab();
}
function renderTabSoon() {
  if (tabRenderFrame) cancelAnimationFrame(tabRenderFrame);
  tabRenderFrame = requestAnimationFrame(() => {
    tabRenderFrame = 0;
    render();
  });
}

function tabHTML() {
  if (state.tab === "inventario") return inventarioHTML();
  if (state.tab === "silos") return silosHTML();
  if (state.tab === "quimica") return quimicaHTML();
  if (state.tab === "lotesOxmo") return lotesOxmoHTML();
  if (state.tab === "avisos") return avisosHTML();
  if (state.tab === "comunesTurno") return comunesTurnoHTML();
  if (state.tab === "admin") return adminHTML();
  if (state.tab === "mezclas") return mezclasHTML();
  if (state.tab === "registro") return registroHTML();
  if (state.tab === "infodia") return infodiaHTML();
  if (state.tab === "siloHistorial") return siloHistorialHTML();
  if (state.tab === "etiquetas") return etiquetasHTML();
  if (state.tab === "reportes") return reportesHTML();
  state.tab = "inventario";
  return inventarioHTML();
}
function bindTab() {
  if (state.tab === "inventario") bindInventario();
  if (state.tab === "silos") bindSilos();
  if (state.tab === "registro") bindRegistro();
  if (state.tab === "mezclas") bindMezclas();
  if (state.tab === "infodia") bindInfodia();
  if (state.tab === "siloHistorial") bindSiloHistorial();
  if (state.tab === "lotesOxmo") bindAnalisisACP();
  if (state.tab === "avisos") bindAvisos();
  if (state.tab === "comunesTurno") bindComunesTurno();
  if (state.tab === "admin") bindAdmin();
  if (state.tab === "etiquetas") bindEtiquetas();
  if (state.tab === "reportes") bindReportes();
  if (state.tab === "quimica") bindQuimica();
}


function cartillaManualLotes() {
  return CARTILLA_MANUAL_SIMULADA.map(item => {
    const lote = {
      id: item.id,
      tipo: item.tipo || "Maxisaco",
      masa: Number(item.cantidad || 0) * 1000,
      sector: "Bodega en transito",
      fila: 0,
      cu: Number(item.cu || 0),
      mo: Number(item.mo || 0),
      s: Number(item.s || 0),
      fecha: "01-06-2026",
      obs: `Cartilla manual simulada: ${item.nota}`,
      estado: "Disponible",
    };
    const c = clasificar(lote);
    return { ...lote, estado: c.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible" };
  });
}
function aplicarCartillaManual() {
  if (!confirm("Cargar la cartilla manual simulada? Se reemplazaran solo los registros simulados de cartilla anteriores.")) return;
  const nuevos = cartillaManualLotes();
  const ids = new Set(nuevos.map(l => l.id));
  state.lotes = state.lotes.filter(l => !ids.has(l.id) && !String(l.obs || "").includes("Cartilla manual simulada"));
  state.lotes = [...state.lotes, ...nuevos];
  addHist("Cartilla manual simulada", "", `${nuevos.length} registros cargados`, C.copper);
  persistLotes();
  render();
}
function deleteLot(id) {
  const lote = state.lotes.find(l => l.id === id);
  if (!canEditLot(lote)) {
    alert("No tienes permiso para eliminar este lote.");
    return;
  }
  if (!confirm(`¿Eliminar ${id}? Esta acción no se puede deshacer.`)) return;
  state.lotes = state.lotes.filter(l => l.id !== id);
  addHist("Lote eliminado", id, "", C.red);
  persistLotes();
  render();
}

function registroHTML() {
  const l = state.editando || {id:"",tipo:"Maxisaco",masa:"",sector:DEFAULT_SECTORES[0],fila:0,cu:"",mo:"",s:"",obs:"",estado:"Disponible"};
  const sectorOptions = [...allSectores(), "Añadir sector..."];
  return `
    <div class="grid-2">
      <div class="box" style="border-top:3px solid ${state.editando ? C.cyan : C.blue}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
          <div class="muted-title" style="color:${state.editando ? C.cyan : C.blueLight}">${state.editando ? `Editando ${l.id}` : "Nuevo lote"}</div>
          ${state.editando ? `<button class="btn secondary" id="cancelEdit">Cancelar</button>` : ""}
        </div>
        <form id="lotForm">
          <div class="form-grid">
            ${inputField("idManual","ID lote / nombre",state.editando ? l.id : "","text","Ej: OXMO10080-26 o L-008")}
            ${selectField("tipo","Tipo",l.tipo,["Maxisaco","Tambor"],"span-2")}
            ${selectField("sector","Sector",l.sector,sectorOptions)}
            <div class="field span-2" id="newSectorField" style="display:none"><label>Nombre nuevo sector</label><input name="nuevoSector" placeholder="Ej: Patio norte, Bodega temporal, Zona 3"></div>
            ${selectField("estado","Estado",l.estado,["Disponible","Pendiente","Bloqueado","Fuera Esp"])}
            ${inputField("masa","Masa (kg) *",l.masa,"number","ej: 1250")}
            ${inputField("fila","Fila",l.fila,"number")}
          </div>
          <div style="border-top:1px solid var(--line);padding-top:12px;margin-top:12px">
            <div class="muted-title" style="color:var(--cyan);margin-bottom:8px">Análisis químico</div>
            <div class="chem-grid">
              ${inputField("cu","Cu %",l.cu || "","number","0.49","0.01")}
              ${inputField("mo","Mo %",l.mo || "","number","57.5","0.01")}
              ${inputField("s","S %",l.s || "","number","0.08","0.01")}
            </div>
            <div style="margin-top:8px;color:var(--txt3);font-size:10px;line-height:1.5">Bajo cobre: Cu 0 a 0.50%, Mo >= 57%, S &lt; 0.1%. Alto cobre: Cu 0.51 a 3.00%, Mo >= 55%, S &lt; 0.1%.</div>
          </div>
          <div class="field"><label>Observaciones</label><textarea name="obs" rows="2" placeholder="Notas del operador...">${l.obs || ""}</textarea></div>
          <button class="btn" style="width:100%">${state.editando ? "ACTUALIZAR" : "REGISTRAR LOTE"}</button>
        </form>
      </div>
      <div class="card list">
        <div class="muted-title" style="margin-bottom:12px">Lotes registrados — ${state.lotes.length} total</div>
        ${lotesRecientes(state.lotes).map(x => {
          const c = clasificar(x);
          return `<div class="lot-row" style="--accent:${c.color}">
            <div>
              <div class="mono" style="color:var(--blue-light);font-weight:800">${x.id} <span style="color:var(--txt3);font-size:10px">· ${x.tipo} · ${x.sector}</span></div>
              <div style="color:var(--txt2);font-size:10px;margin-top:2px">${kgToTon(x.masa, 3)} · ${x.fecha}</div>
              <div style="margin-top:3px"><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span> <span style="color:${eColor(x.estado)};font-size:10px">● ${x.estado}</span></div>
            </div>
            <div class="mini-actions">${canEditLot(x) ? `<button class="icon-btn" data-copy="${x.id}">Copiar</button><button class="icon-btn" data-del="${x.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}</div>
          </div>`;
        }).join("")}
      </div>
    </div>
  `;
}
function inputField(name, label, value, type = "text", placeholder = "", step = "") {
  return `<div class="field"><label>${label}</label><input name="${name}" type="${type}" ${step ? `step="${step}"` : ""} value="${value ?? ""}" placeholder="${placeholder}"></div>`;
}
function selectField(name, label, value, options, cls = "") {
  return `<div class="field ${cls}"><label>${label}</label><select name="${name}">${options.map(o => `<option ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select></div>`;
}
function bindRegistro() {
  const form = document.querySelector("#lotForm");
  if (document.querySelector("#cancelEdit")) document.querySelector("#cancelEdit").addEventListener("click", () => { state.editando = null; render(); });
  const toggleNewSector = () => {
    document.querySelector("#newSectorField").style.display = form.elements.sector.value === "Añadir sector..." ? "block" : "none";
  };
  toggleNewSector();
  form.elements.sector.addEventListener("change", () => {
    toggleNewSector();
    if (form.elements.sector.value === "Añadir sector...") form.elements.nuevoSector.focus();
  });
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const masa = parseNum(data.masa);
    if (!masa || masa <= 0) { alert("Masa inválida"); return; }
    let sector = data.sector;
    if (sector === "Añadir sector...") {
      sector = (data.nuevoSector || "").trim();
      if (!sector) { alert("Ingresa el nombre del nuevo sector"); return; }
      state.sectores = [...new Set([...state.sectores, sector])];
      saveSectores();
    }
    const hasChem = data.cu && data.mo && data.s;
    const idSolicitado = String(data.idManual || "").trim();
    const idLote = state.editando ? state.editando.id : (idSolicitado || nuevoId());
    if (!state.editando && state.lotes.some(l => String(l.id).toLowerCase() === idLote.toLowerCase())) {
      alert("Ya existe un lote con ese ID o nombre");
      return;
    }
    const lote = {
      id: idLote,
      tipo: data.tipo, masa, sector, fila: parseNum(data.fila || 0),
      cu: data.cu ? Number(parseNum(data.cu).toFixed(3)) : 0,
      mo: data.mo ? Number(parseNum(data.mo).toFixed(3)) : 0,
      s: data.s ? Number(parseNum(data.s).toFixed(4)) : 0,
      obs: data.obs || "",
      fecha: state.editando ? state.editando.fecha : hoy(),
      createdAt: state.editando ? (state.editando.createdAt || new Date().toISOString()) : new Date().toISOString(),
      createdBy: state.editando ? (state.editando.createdBy || userKey()) : userKey(),
      createdByName: state.editando ? (state.editando.createdByName || state.user?.nombre || userKey()) : (state.user?.nombre || userKey()),
      areaCelula: state.editando ? (state.editando.areaCelula || areaTrabajoUsuario()) : areaTrabajoUsuario(),
      estado: "Pendiente"
    };
    const clasif = clasificar(lote);
    lote.estado = hasChem
      ? (data.estado === "Bloqueado" ? "Bloqueado" : clasif.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible")
      : "Pendiente";
    if (state.editando) {
      state.lotes = state.lotes.map(l => l.id === lote.id ? lote : l);
      addHist("Lote actualizado", lote.id, `${lote.masa}kg ${lote.sector}`, C.cyan);
    } else {
      state.lotes.push(lote);
      addHist("Nuevo lote registrado", lote.id, `${lote.tipo} ${lote.masa}kg`, C.green);
    }
    state.editando = null;
    if (!state.sectores.includes(lote.sector)) saveSectores();
    persistLotes();
    state.tab = "inventario";
    render();
  });
  document.querySelectorAll("[data-copy]").forEach(btn => btn.addEventListener("click", () => {
    const src = state.lotes.find(l => l.id === btn.dataset.copy);
    if (!canEditLot(src)) { alert("No tienes permiso para usar este lote como base."); return; }
    state.editando = {...src, id: null, fecha: hoy()};
    render();
  }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
  document.querySelectorAll("[data-label-lot]").forEach(btn => btn.addEventListener("click", () => {
    state.etiquetaSel = [btn.dataset.labelLot];
    printLabels();
  }));
}

function adminHTML() {
  if (!isAdmin()) return `<div class="notice">No tienes permisos para acceder a administración.</div>`;
  const usuarios = state.usuarios.map(normalizarUsuario);
  const totalTiempo = Math.max(1, usuarios.reduce((a, u) => a + tiempoUsuarioMs(u), 0));
  const totalAcciones = Math.max(1, usuarios.reduce((a, u) => a + Number(state.userStats[u.u]?.acciones || 0), 0));
  const rows = usuarios.map(u => {
    const stat = state.userStats[u.u] || {};
    const tiempo = tiempoUsuarioMs(u);
    const usoPct = Math.round((tiempo / totalTiempo) * 100);
    const accionPct = Math.round((Number(stat.acciones || 0) / totalAcciones) * 100);
    return { u, stat, tiempo, usoPct, accionPct };
  });
  return `
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Administración</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">Usuarios y uso de la aplicación</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Solo Administrador puede crear cuentas. Las métricas se generan con inicios de sesión y actividades registradas en OXMO.</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="pill ${state.adminView === "usuarios" ? "active" : ""}" data-admin-view="usuarios">Usuarios</button>
          <button class="pill ${state.adminView === "estadisticas" ? "active" : ""}" data-admin-view="estadisticas">Estadísticas</button>
        </div>
      </div>
      ${state.adminView === "estadisticas" ? adminStatsHTML(rows) : adminUsersHTML(rows)}
    </div>
  `;
}

function adminStatsHTML(rows) {
  return `
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Usuarios activos", String(rows.filter(r => r.u.activo !== false).length), C.green)}
      ${miniReport("Acciones totales", String(rows.reduce((a, r) => a + Number(r.stat.acciones || 0), 0)), C.blueLight)}
      ${miniReport("Tiempo registrado", formatDuration(rows.reduce((a, r) => a + r.tiempo, 0)), C.copper)}
      ${miniReport("Usuarios creados", String(rows.length), C.cyan)}
    </div>
    <div class="table-wrap" style="margin-bottom:14px">
      <table>
        <thead><tr><th>Usuario</th><th>Rol</th><th>% Uso tiempo</th><th>% Actividad</th><th>Tiempo de uso</th><th>Acciones</th><th>Último uso</th></tr></thead>
        <tbody>${rows.map(({u, stat, tiempo, usoPct, accionPct}) => `<tr>
          <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
          <td>${esc(u.rol)}</td>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="bar" style="width:120px;--accent:var(--green)"><span style="--w:${usoPct}%"></span></div><span class="mono">${usoPct}%</span></div></td>
          <td><div style="display:flex;align-items:center;gap:8px"><div class="bar" style="width:120px;--accent:var(--blue-light)"><span style="--w:${accionPct}%"></span></div><span class="mono">${accionPct}%</span></div></td>
          <td class="mono">${formatDuration(tiempo)}</td>
          <td class="mono">${Number(stat.acciones || 0)}</td>
          <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
        </tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="grid-cards">
      ${rows.map(({u, stat}) => `<div class="card">
        <div class="mono" style="color:var(--blue-light);font-size:16px;font-weight:900;margin-bottom:8px">${esc(u.nombre)}</div>
        <div style="color:var(--txt2);font-size:11px;margin-bottom:10px">${esc(u.rol)} · ${esc(u.u)}</div>
        ${(stat.recientes || []).slice(0, 6).map(r => `<div style="border-top:1px solid var(--line);padding:7px 0;font-size:11px">
          <span class="mono" style="color:var(--txt3)">${esc(r.fecha)} ${esc(r.tiempo)}</span>
          <div style="color:var(--txt)">${esc(r.accion)} ${r.loteId ? `<span class="mono" style="color:var(--blue-light)">${esc(r.loteId)}</span>` : ""}</div>
          ${r.detalle ? `<div style="color:var(--txt3)">${esc(r.detalle)}</div>` : ""}
        </div>`).join("") || `<div style="color:var(--txt3);font-size:11px">Sin actividad registrada.</div>`}
      </div>`).join("")}
    </div>
  `;
}
/* v19-clean-safe: definición antigua removida: bindAdmin */


function avisosHTML() {
  const puedeCrear = isOperator() || isAdmin() || isSupervisor();
  const puedeVerTodo = isAdmin() || isSupervisor();
  const avisos = [...(state.avisos || [])]
    .filter(a => puedeVerTodo || a.autor === userKey())
    .sort((a, b) => Date.parse(b.createdAt || "") - Date.parse(a.createdAt || ""));
  return `
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Avisos operacionales</div>
          <div style="font-size:20px;font-weight:900">Condiciones, notas y respaldo visual</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">El operador informa condiciones relevantes. Supervisor y administrador pueden revisar el historial.</div>
        </div>
        <div class="tag" style="color:${C.green};background:${C.green}22;border-color:${C.green}44">${avisos.length} aviso(s)</div>
      </div>
      <div style="display:grid;grid-template-columns:${puedeCrear ? "minmax(300px,420px) 1fr" : "1fr"};gap:16px;align-items:start">
        ${puedeCrear ? `<div class="card">
          <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Nuevo aviso</div>
          <form id="avisoForm">
            <div class="field"><label>Título / condición</label><input name="titulo" maxlength="80" placeholder="Ej: Derrame menor, condición de equipo, material observado"></div>
            <div class="field"><label>Prioridad</label><select name="prioridad"><option>Normal</option><option>Alta</option><option>Crítica</option></select></div>
            <div class="field"><label>Detalle</label><textarea name="detalle" rows="4" placeholder="Describe qué ocurrió, ubicación, acción tomada o recomendación."></textarea></div>
            <div class="field"><label>Fotografía opcional</label><input name="foto" type="file" accept="image/*"></div>
            <button class="btn" style="width:100%">PUBLICAR AVISO</button>
          </form>
        </div>` : ""}
        <div class="card">
          <div class="muted-title" style="margin-bottom:12px">${puedeVerTodo ? "Avisos recibidos" : "Mis avisos enviados"}</div>
          <div style="display:flex;flex-direction:column;gap:10px">
            ${avisos.map(a => avisoCardHTML(a, puedeVerTodo)).join("") || `<div style="color:var(--txt3);font-size:12px;text-align:center;padding:20px">Sin avisos registrados.</div>`}
          </div>
        </div>
      </div>
    </div>
  `;
}
function avisoCardHTML(a, puedeGestionar) {
  const color = a.prioridad === "Crítica" ? C.red : a.prioridad === "Alta" ? C.yellow : C.blueLight;
  return `<div class="lot-row" style="--accent:${color};align-items:flex-start">
    <div style="flex:1;min-width:0">
      <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
        <span class="tag" style="color:${color};background:${color}22;border-color:${color}44">${esc(a.prioridad || "Normal")}</span>
        <b style="color:var(--txt)">${esc(a.titulo || "Aviso operacional")}</b>
      </div>
      <div style="color:var(--txt2);font-size:11px;margin-top:4px">${esc(a.autorNombre || a.autor || "-")} · ${esc(a.fecha || "-")} ${esc(a.hora || "")}</div>
      <div style="color:var(--txt);font-size:12px;margin-top:8px;white-space:pre-wrap">${esc(a.detalle || "")}</div>
      ${a.foto ? `<img src="${a.foto}" alt="Foto aviso" style="max-width:220px;max-height:160px;border:1px solid var(--line);border-radius:6px;margin-top:10px;object-fit:cover">` : ""}
    </div>
    ${puedeGestionar ? `<button class="icon-btn" data-del-aviso="${esc(a.id)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}
  </div>`;
}
function bindAvisos() {
  document.querySelector("#avisoForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    if (!String(data.titulo || "").trim() || !String(data.detalle || "").trim()) {
      alert("Ingresa título y detalle del aviso.");
      return;
    }
    const guardar = foto => {
      const aviso = {
        id: `A-${Date.now()}`,
        titulo: String(data.titulo || "").trim(),
        detalle: String(data.detalle || "").trim(),
        prioridad: data.prioridad || "Normal",
        foto,
        autor: userKey(),
        autorNombre: state.user?.nombre || userKey(),
        rol: state.user?.rol || "",
        fecha: hoy(),
        hora: ahora(),
        createdAt: new Date().toISOString(),
      };
      state.avisos = [aviso, ...(state.avisos || [])].slice(0, 120);
      save("oxmo:avisos", state.avisos);
      addHist("Aviso operacional", aviso.id, aviso.titulo, aviso.prioridad === "Crítica" ? C.red : C.cyan);
      render();
    };
    const file = form.elements.foto?.files?.[0];
    if (!file) { guardar(""); return; }
    const reader = new FileReader();
    reader.onload = () => guardar(String(reader.result || ""));
    reader.onerror = () => { alert("No se pudo cargar la fotografía."); guardar(""); };
    reader.readAsDataURL(file);
  });
  document.querySelectorAll("[data-del-aviso]").forEach(btn => btn.addEventListener("click", () => {
    if (!confirm("¿Eliminar este aviso?")) return;
    state.avisos = (state.avisos || []).filter(a => a.id !== btn.dataset.delAviso);
    save("oxmo:avisos", state.avisos);
    addHist("Aviso eliminado", btn.dataset.delAviso, "", C.red);
    render();
  }));
}
/* v19-clean-safe: definición antigua removida: silosHTML */


function quimicaHTML() {
  return `<div class="grid-cards">${state.lotes.map(l => {
    const c = clasificar(l);
    if (!hasAnalysis(l)) return `<div class="card" style="border-left:4px solid ${C.yellow}"><div style="display:flex;justify-content:space-between"><b class="mono" style="color:var(--blue-light)">${l.id}</b><span class="tag" style="color:${C.yellow};background:${C.yellow}22">Pendiente</span></div><div style="text-align:center;color:${C.yellow};padding:18px 0">Sin análisis</div><button class="btn secondary" data-chem="${l.id}" style="width:100%">Ingresar análisis</button></div>`;
    return `<div class="card" style="border-left:4px solid ${c.color}">
      <div style="display:flex;justify-content:space-between;margin-bottom:10px"><b class="mono" style="color:var(--blue-light)">${l.id}</b><span class="tag" style="color:${c.color};background:${c.color}22;border-color:${c.color}44">${c.clase}</span></div>
      ${chemBar("Cu", l.cu, l.cu >= 0 && l.cu <= 3, 3)}
      ${chemBar("Mo", l.mo, l.mo >= moMinimo(l.cu), 70)}
      ${chemBar("S", l.s, l.s < 0.1, 1)}
      <div style="margin-top:8px;color:var(--txt2);font-size:10px">${l.sector} · ${l.masa}kg · ${l.fecha}</div>
    </div>`;
  }).join("")}</div>`;
}
function chemBar(label, value, ok, max) {
  const color = ok ? C.green : C.red;
  return `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between"><span style="color:var(--txt2);font-size:11px">${label}</span><span class="mono" style="color:${color};font-weight:800;font-size:11px">${value.toFixed(2)}% ${ok ? "✓" : "✗"}</span></div><div class="bar" style="--accent:${color}"><span style="--w:${Math.min((value/max)*100, 100)}%"></span></div></div>`;
}
function bindQuimica() {
  document.querySelectorAll("[data-chem]").forEach(btn => btn.addEventListener("click", () => {
    state.editando = state.lotes.find(l => l.id === btn.dataset.chem);
    state.tab = "registro";
    render();
  }));
}
/* v19-clean-safe: definición antigua removida: lotesOxmoHTML */


function comunesTurnoHTML() {
  const items = (state.infodia?.analisis || [])
    .filter(a => /^OO300-001-\d+-\d{2}$/.test(a.codigo))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.codigo.localeCompare(b.codigo));
  const may1to16 = items.filter(a => a.fecha >= "2026-05-01" && a.fecha <= "2026-05-16");
  const manuales = [...state.comunes].reverse();
  const form = `<div class="box" style="margin-bottom:14px">
    <div style="display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap;margin-bottom:12px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Ingreso manual</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900">Comun de turno para silo</div>
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:840px;line-height:1.45">Registra un comun puntual cuando aun no este cargado en Infodia. Al guardar, la pestaña Silos recalcula el ponderado del silo seleccionado.</div>
      </div>
    </div>
    <form id="comunTurnoForm">
      <div class="form-grid">
        ${selectField("siloId","Silo",state.silosBase[0]?.id || "Silo 4",state.silosBase.map(s => s.id))}
        ${selectField("turno","Turno","Dia",["Dia","Noche"])}
        ${inputField("fecha","Fecha",new Date().toISOString().slice(0, 10),"date")}
        ${inputField("masa","Masa comun (t)","50","number","50","0.01")}
        ${inputField("cu","Cu %","","number","0.49","0.001")}
        ${inputField("mo","Mo %","","number","57.5","0.001")}
        ${inputField("s","S %","","number","0.012","0.0001")}
      </div>
      <button class="btn" style="margin-top:10px">GUARDAR COMUN</button>
    </form>
    <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:12px">
      <div class="muted-title" style="margin-bottom:10px">Comunes asociados a silos - ${state.comunes.length}</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:8px;max-height:230px;overflow:auto">
        ${manuales.map(c => {
          const cl = clasificar(c);
          return `<div class="card" style="padding:10px;border-left:3px solid ${cl.color}">
            <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
              <div class="mono" style="color:var(--blue-light);font-weight:900">${c.siloId} - ${c.turno || "Dia"}</div>
              <button class="icon-btn" data-comun-del="${c.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">x</button>
            </div>
            <div style="color:var(--txt2);font-size:10px;margin-top:4px">${c.fecha || "-"} - ${c.masa || 0}t - Cu ${c.cu}% - Mo ${c.mo}% - S ${c.s}%</div>
            <span class="tag" style="margin-top:6px;background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span>
          </div>`;
        }).join("") || `<div style="color:var(--txt3);font-size:11px">Sin comunes manuales registrados.</div>`}
      </div>
    </div>
  </div>`;
  return form + analisisACPHTML({
    titulo: "Comunes de turno OO300-001",
    subtitulo: "Listado auditable de comunes de turno leidos desde ACP. Estos valores alimentan la caracterizacion historica de silos.",
    items,
    kpis: [
      ["Comunes totales", items.length, C.green],
      ["01-05 al 16-05", may1to16.length, C.cyan],
      ["Cu promedio", items.length ? `${average(items.map(x => x.cu)).toFixed(3)}%` : "-", C.blueLight],
      ["Mo promedio", items.length ? `${average(items.map(x => x.mo)).toFixed(3)}%` : "-", C.copper],
    ],
    empty: "No hay comunes OO300-001 cargados. Sube el Infodia con la hoja ACP.",
  });
}
/* v19-clean-safe: definición antigua removida: analisisACPHTML */


function bindAnalisisACP() {
  const input = document.querySelector("#acpSearch");
  const searchBtn = document.querySelector("#acpSearchBtn");
  const applyBtn = document.querySelector("#applyAcpInventory");
  if (input) {
    input.addEventListener("input", e => {
      state.acpSearch = e.target.value;
    });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        state.acpSearch = e.target.value;
        render();
        focusInputEnd("#acpSearch");
      }
    });
  }
  searchBtn?.addEventListener("click", () => {
    state.acpSearch = document.querySelector("#acpSearch")?.value || "";
    render();
    focusInputEnd("#acpSearch");
  });
  applyBtn?.addEventListener("click", aplicarACPInventarioActual);
}

function bindComunesTurno() {
  bindAnalisisACP();
  const form = document.querySelector("#comunTurnoForm");
  if (form) {
    form.addEventListener("submit", e => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      if (guardarComunManual(data, "manual-comunes-turno")) render();
    });
  }
  document.querySelectorAll("[data-comun-del]").forEach(btn => btn.addEventListener("click", () => {
    state.comunes = state.comunes.filter(c => c.id !== btn.dataset.comunDel);
    save("oxmo:comunes", state.comunes);
    render();
  }));
}

/* v19-clean-safe: definición antigua removida: range */

function chemResult(label, value, target, ok, max) {
  const color = ok ? C.green : value ? C.red : C.txt3;
  return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span style="color:var(--txt2);font-size:11px">${label}</span><span class="mono" style="color:${color};font-size:11px;font-weight:900">${value ? `${value.toFixed(2)}% ${ok ? "✓" : "✗"}` : "—"}</span></div><div class="bar" style="--accent:${color}"><span style="--w:${Math.min((value/max)*100,100)}%"></span></div><div style="text-align:center;color:var(--txt3);font-size:8px">meta: ${target}%</div></div>`;
}
function mini(label, value, color) {
  return `<div style="background:#0f3a6e66;border-radius:5px;padding:7px"><div style="color:var(--txt3);font-size:8px">${label}</div><div class="mono" style="color:${color};font-weight:900;font-size:12px">${value}</div></div>`;
}
/* v19-clean-safe: definición antigua removida: bindMezclas */


function etiquetasHTML() {
  const lotes = state.etiquetaFiltro === "Todos" ? state.lotes : state.lotes.filter(l => l.sector === state.etiquetaFiltro);
  return `<div>
    <div class="filters">
      ${["Todos", ...allSectores()].map(s => `<button class="pill ${state.etiquetaFiltro === s ? "active" : ""}" data-etq-filter="${s}">${s} (${s === "Todos" ? state.lotes.length : state.lotes.filter(l => l.sector === s).length})</button>`).join("")}
      <button class="pill" id="toggleEtq">Seleccionar todo</button>
      <button class="btn" id="printEtq" ${state.etiquetaSel.length ? "" : "disabled"} style="margin-left:auto">VISTA PREVIA PDF (${state.etiquetaSel.length})</button>
    </div>
    <div class="grid-cards">${lotes.map(l => {
      const c = clasificar(l), selected = state.etiquetaSel.includes(l.id);
      return `<div class="card" data-etq="${l.id}" style="border:2px solid ${selected ? c.color : "var(--line)"};box-shadow:${selected ? `0 0 16px ${c.color}33` : "none"};text-align:center;cursor:pointer">
        <div style="font-size:42px;color:${c.color}">▦</div>
        <div class="mono" style="color:var(--blue-light);font-weight:900">${l.id}</div>
        <div style="color:var(--txt2);font-size:10px">${l.tipo} · ${l.sector}</div>
        <div class="mono" style="margin-top:2px">${l.masa} kg</div>
        <div class="tag" style="margin-top:8px;background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</div>
      </div>`;
    }).join("")}</div>
  </div>`;
}
function bindEtiquetas() {
  document.querySelectorAll("[data-etq-filter]").forEach(btn => btn.addEventListener("click", () => { state.etiquetaFiltro = btn.dataset.etqFilter; state.etiquetaSel = []; render(); }));
  document.querySelectorAll("[data-etq]").forEach(card => card.addEventListener("click", () => {
    const id = card.dataset.etq;
    state.etiquetaSel = state.etiquetaSel.includes(id) ? state.etiquetaSel.filter(x => x !== id) : [...state.etiquetaSel, id];
    render();
  }));
  document.querySelector("#toggleEtq").addEventListener("click", () => {
    const lotes = state.etiquetaFiltro === "Todos" ? state.lotes : state.lotes.filter(l => l.sector === state.etiquetaFiltro);
    state.etiquetaSel = state.etiquetaSel.length === lotes.length ? [] : lotes.map(l => l.id);
    render();
  });
  document.querySelector("#printEtq").addEventListener("click", () => printLabels());
}
/* v19-clean-safe: definición antigua removida: printLabels */


function reportesHTML() {
  const disp = state.lotes.filter(l => l.estado === "Disponible");
  const masa = disp.reduce((a,l) => a + l.masa, 0);
  const finoMo = disp.filter(l => Number(l.mo) > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0);
  const cu = average(disp.filter(l => l.cu).map(l => l.cu));
  const mo = average(disp.filter(l => l.mo).map(l => l.mo));
  return `<div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;flex-wrap:wrap"><div class="muted-title">Reporte SGI — ${hoy()}</div><button class="btn" id="printReport">GENERAR PDF</button></div>
    <div class="grid-cards">
      ${miniReport("Masa disponible", kgToTon(masa), C.green)}
      ${miniReport("Fino Mo", kgToTon(finoMo), C.copper)}
      ${miniReport("Lotes disponibles", disp.length, C.green)}
      ${miniReport("Cu% promedio", `${cu.toFixed(2)}%`, C.cyan)}
      ${miniReport("Mo% promedio", `${mo.toFixed(3)}%`, C.blueLight)}
      ${miniReport("Sin análisis", state.lotes.filter(l => l.estado === "Pendiente").length, C.yellow)}
      ${miniReport("Fuera spec", state.lotes.filter(l => l.estado === "Fuera Esp").length, C.red)}
    </div>
    <div class="card" style="margin-top:14px;max-height:300px;overflow:auto"><div class="muted-title" style="margin-bottom:10px">Historial de movimientos (${state.historial.length} eventos)</div>${[...state.historial].reverse().map(h => `<div style="display:flex;gap:10px;padding:5px 0;border-bottom:1px solid #1a2e4a33;font-size:11px"><span class="mono" style="min-width:42px;color:var(--txt3)">${h.tiempo}</span><span style="color:${h.color || C.txt2}">${h.accion}</span><span class="mono" style="color:var(--blue-light)">${h.loteId || ""}</span><span style="color:var(--txt3)">${h.detalle || ""}</span></div>`).join("")}</div>
  </div>`;
}
function average(nums) { return nums.length ? nums.reduce((a,n) => a+n, 0) / nums.length : 0; }
function miniReport(label, value, color) {
  return `<div class="card" style="border-top:2px solid ${color}"><div style="color:var(--txt3);font-size:9px;text-transform:uppercase">${label}</div><div class="mono" style="color:${color};font-size:18px;font-weight:900">${value}</div></div>`;
}
/* v19-clean-safe: definición antigua removida: bindReportes */

/* v19-clean-safe: definición antigua removida: alertasHTML */

/* v19-clean-safe: definición antigua removida: silosHTML */

/* v19-clean-safe: definición antigua removida: bindSilos */

/* v19-clean-safe: definición antigua removida: alertasHTML */


function mezclaDe(items) {
  const masaKg = items.reduce((a, x) => a + x.kg, 0);
  const w = key => masaKg ? items.reduce((a, x) => a + x.lote[key] * x.kg, 0) / masaKg : 0;
  const mix = { cu: w("cu"), mo: w("mo"), s: w("s") };
  const cl = clasificar(mix);
  return {...mix, ...cl, masaKg, ok: cumpleSpec(mix)};
}

function formulaMezcla(items, mix) {
  const lines = [
    `Masa total = ${items.map(x => (x.kg/1000).toFixed(2)).join(" + ")} = ${(mix.masaKg/1000).toFixed(2)} t`,
    `Cu = (${items.map(x => `${x.lote.cu}*${(x.kg/1000).toFixed(2)}`).join(" + ")}) / ${(mix.masaKg/1000).toFixed(2)} = ${mix.cu.toFixed(3)}%`,
    `Mo = (${items.map(x => `${x.lote.mo}*${(x.kg/1000).toFixed(2)}`).join(" + ")}) / ${(mix.masaKg/1000).toFixed(2)} = ${mix.mo.toFixed(3)}%`,
    `S = (${items.map(x => `${x.lote.s}*${(x.kg/1000).toFixed(2)}`).join(" + ")}) / ${(mix.masaKg/1000).toFixed(2)} = ${mix.s.toFixed(3)}%`,
    `Criterio = S < 0.1 y Mo >= ${moMinimo(mix.cu)} para ${mix.cu <= 0.5 ? "bajo cobre" : "alto cobre"}`
  ];
  return lines.join("\n");
}

function generarOpcionesMezcla() {
  const objetivo = 20000;
  const paso = 500;
  const pool = state.lotes.filter(l => hasAnalysis(l) && l.masa > 0);
  const opts = [];
  const pushOption = items => {
    if (items.some(x => x.kg <= 0 || x.kg > x.lote.masa)) return;
    const mix = mezclaDe(items);
    if (!mix.ok) return;
    const fueraKg = items.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
    const residual = Math.abs(mix.s - 0.08) * 20 + Math.max(0, moMinimo(mix.cu) - mix.mo) * 4 + Math.abs(mix.cu - 0.5);
    opts.push({items, mix, fueraKg, score: fueraKg * 10 - residual});
  };

  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      const a = pool[i], b = pool[j];
      for (let kgA = paso; kgA < objetivo; kgA += paso) {
        const kgB = objetivo - kgA;
        pushOption([{lote:a, kg:kgA}, {lote:b, kg:kgB}]);
      }
    }
  }
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let k = j + 1; k < pool.length; k++) {
        const a = pool[i], b = pool[j], c = pool[k];
        for (let kgA = paso; kgA < objetivo - paso; kgA += paso) {
          for (let kgB = paso; kgB < objetivo - kgA; kgB += paso) {
            const kgC = objetivo - kgA - kgB;
            pushOption([{lote:a, kg:kgA}, {lote:b, kg:kgB}, {lote:c, kg:kgC}]);
          }
        }
      }
    }
  }
  return opts.sort((a, b) => b.score - a.score).slice(0, 8);
}

/* v19-clean-safe: definición antigua removida: buscarMejoresMezclas2 */


function mezclasHTML() {
  state.mix.masa = Math.min(40000, Math.max(1000, Math.round(parseNum(state.mix.masa || 20000) / 1000) * 1000));
  const materiales = state.lotes.filter(l => hasAnalysis(l) && (state.mix.sector === "Todos" || l.sector === state.mix.sector));
  const opciones = Array.isArray(state.mixOptions) ? state.mixOptions : [];
  return `<div class="mix-layout">
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="box">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Objetivo</div>
        ${range("Cu objetivo", "cu", state.mix.cu, 0, 3, 0.01, "%", C.copper)}
        ${range("Mo mínimo", "mo", state.mix.mo, 45, 65, 0.1, "%", C.green)}
        ${range("S máximo", "s", state.mix.s, 0, 0.5, 0.01, "%", C.yellow)}
        ${range("Masa lote", "masa", state.mix.masa, 1000, 40000, 1000, "kg", C.cyan)}
        <button class="btn" id="autoMix" style="width:100%;margin-top:8px" ${state.mixProcessing ? "disabled" : ""}>${state.mixProcessing ? "CALCULANDO..." : "BUSCAR MEJOR COMBINACIÓN"}</button>
        ${state.mixProcessing ? `<div class="mix-progress"><div style="width:${state.mixProgress || 8}%"></div></div><div style="color:var(--txt2);font-size:11px;text-align:center;margin-top:6px">Procesando combinaciones originales...</div>` : ""}
        ${state.mixMsg ? `<div class="notice" style="margin:10px 0 0;text-align:center;animation:mixPulse 1.2s ease">${state.mixMsg}</div>` : ""}
      </div>
      <div class="box">
        <div class="muted-title" style="margin-bottom:10px">Filtro zona</div>
        <div class="filters">${["Todos", ...allSectores()].map(s => `<button class="pill ${state.mix.sector === s ? "active" : ""}" data-mix-sector="${s}">${s}</button>`).join("")}</div>
      </div>
    </div>
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px">
        <div class="muted-title" style="color:var(--cyan)">Materiales</div>
        <div style="color:var(--txt3);font-size:10px">${state.mix.sel.length ? `${state.mix.sel.length} seleccionados` : "usando todos"}</div>
      </div>
      <div class="mix-material-grid">${materiales.map(l => {
        const c = clasificar(l);
        const selected = state.mix.sel.includes(l.id);
        return `<div class="card" data-mix-lot="${l.id}" style="cursor:pointer;border:2px solid ${selected ? c.color : "var(--line)"}">
          <div style="display:flex;justify-content:space-between;gap:8px"><b class="mono" style="color:var(--blue-light)">${l.id}</b><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span></div>
          <div style="color:var(--txt2);font-size:10px;margin-top:6px">${l.tipo} · ${l.sector} · ${(l.masa/1000).toFixed(2)}t</div>
          <div class="mono" style="font-size:11px;margin-top:4px">Cu ${l.cu}% · Mo ${l.mo}% · S ${l.s}%</div>
        </div>`;
      }).join("") || `<div style="color:var(--txt3);font-size:11px">No hay materiales con análisis para mezclar.</div>`}</div>
    </div>
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px">
        <div class="muted-title" style="color:var(--cyan)">Mejores opciones</div>
        ${opciones.length ? `<button class="btn secondary" id="printMixOptions">Imprimir / PDF</button>` : ""}
      </div>
      <div class="mix-options">${opciones.length ? opciones.map((op, idx) => mezclaOpcionHTML(op, idx)).join("") : `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px">Ajusta los objetivos y presiona BUSCAR MEJOR COMBINACIÓN para calcular opciones.</div>`}</div>
    </div>
  </div>`;
}
/* v19-clean-safe: definición antigua removida: mezclaOpcionHTML */

/* v19-clean-safe: definición antigua removida: mezclaDetalleHTML */

/* v19-clean-safe: definición antigua removida: mezclaOpcionHTML */


function mezclaDetalleHTML(op) {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px">
    ${op.items.map(x => `<div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div class="mono" style="color:var(--blue-light);font-weight:800">${x.lote.id}</div>
      <div style="color:var(--txt2);font-size:10px">${(x.kg / 1000).toFixed(0)} sacos - ${(x.kg / 1000).toFixed(2)} t</div>
    </div>`).join("")}
    <div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div style="color:var(--txt3);font-size:9px">Resultado</div>
      <div class="mono" style="color:${op.mix.color};font-weight:900">Cu ${op.mix.cu.toFixed(3)}% - Mo ${op.mix.mo.toFixed(3)}% - S ${op.mix.s.toFixed(3)}%</div>
    </div>
  </div>
  ${op.exacta ? "" : `<div style="color:var(--yellow);font-size:10px;margin-top:8px">No hubo ajuste exacto a ${(op.objetivoKg / 1000).toFixed(2)} t; se muestra la masa mas cercana encontrada.</div>`}
  <pre style="white-space:pre-wrap;background:#040a14;border:1px solid var(--line);border-radius:6px;padding:10px;color:var(--txt2);font-size:10px;margin:10px 0 0">${formulaMezcla(op.items, op.mix)}</pre>`;
}

function bindMezclas() {
  const commitMixInput = el => {
    const key = el.dataset.rangeInput;
    const min = parseNum(el.dataset.min);
    const max = parseNum(el.dataset.max);
    const step = parseNum(el.dataset.step) || 1;
    let value = parseNum(el.value);
    if (!Number.isFinite(value)) value = parseNum(state.mix[key]);
    value = Math.min(max, Math.max(min, value));
    if (key === "masa") value = Math.min(40000, Math.max(1000, Math.round(value / step) * step));
    state.mix[key] = Number(value.toFixed(step < 0.01 ? 4 : step < 0.1 ? 2 : step < 1 ? 1 : 0));
  };
  document.querySelectorAll("[data-range]").forEach(el => el.addEventListener("input", () => {
    const key = el.dataset.range;
    state.mix[key] = key === "masa" ? Number(el.value) : parseNum(el.value);
    state.mixOptions = null;
    render();
  }));
  document.querySelectorAll("[data-range-input]").forEach(el => {
    el.addEventListener("change", () => { commitMixInput(el); state.mixOptions = null; render(); });
    el.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        commitMixInput(el);
        state.mixOptions = null;
        render();
      }
    });
  });
  document.querySelectorAll("[data-mix-sector]").forEach(btn => btn.addEventListener("click", () => { state.mix.sector = btn.dataset.mixSector; state.mixOptions = null; render(); }));
  document.querySelectorAll("[data-mix-lot]").forEach(tile => tile.addEventListener("click", () => {
    const id = tile.dataset.mixLot;
    state.mix.sel = state.mix.sel.includes(id) ? state.mix.sel.filter(x => x !== id) : [...state.mix.sel, id];
    state.mixOptions = null;
    render();
  }));
  document.querySelector("#autoMix").addEventListener("click", () => {
    document.querySelectorAll("[data-range-input]").forEach(commitMixInput);
    state.mixProcessing = true;
    state.mixProgress = 12;
    state.mixMsg = "Calculando mezclas...";
    render();
    setTimeout(() => {
      state.mixProgress = 60;
      state.mixOptions = buscarMejoresMezclas2();
      state.mixProcessing = false;
      state.mixProgress = 100;
      state.mixMsg = "Opciones calculadas";
      render();
      setTimeout(() => { state.mixMsg = ""; state.mixProgress = 0; if (state.tab === "mezclas") render(); }, 2200);
    }, 80);
  });
  document.querySelector("#printMixOptions")?.addEventListener("click", printMixOptions);
}

function printMixOptions() {
  const opciones = Array.isArray(state.mixOptions) ? state.mixOptions : [];
  if (!opciones.length) {
    alert("Primero calcula las opciones de mezcla.");
    return;
  }
  const fecha = new Date().toLocaleString("es-CL");
  const objetivo = state.mix || {};
  const rows = opciones.map((op, idx) => `
    <section class="option">
      <div class="option-head">
        <div>
          <h2>Opción ${idx + 1} - ${esc(op.mix.clase)}</h2>
          <p>${op.exacta ? "Masa exacta" : "Masa aproximada"}: ${(op.mix.masaKg / 1000).toFixed(2)} t · Fuera de especificación usado: ${(op.fueraKg / 1000).toFixed(2)} t</p>
        </div>
        <strong class="${op.mix.ok ? "ok" : "warn"}">${op.mix.ok ? "CUMPLE" : "MEJOR APROX."}</strong>
      </div>
      <table>
        <thead><tr><th>Lote</th><th>Sacos</th><th>Masa</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasificación</th></tr></thead>
        <tbody>${op.items.map(x => {
          const cl = clasificar(x.lote);
          return `<tr><td>${esc(x.lote.id)}</td><td>${(x.kg / 1000).toFixed(0)}</td><td>${(x.kg / 1000).toFixed(2)} t</td><td>${fmt(x.lote.cu, 3)}</td><td>${fmt(x.lote.mo, 3)}</td><td>${fmt(x.lote.s, 4)}</td><td>${esc(cl.clase)}</td></tr>`;
        }).join("")}</tbody>
      </table>
      <div class="result">Resultado: Cu ${op.mix.cu.toFixed(3)}% · Mo ${op.mix.mo.toFixed(3)}% · S ${op.mix.s.toFixed(4)}%</div>
      <pre>${esc(formulaMezcla(op.items, op.mix))}</pre>
    </section>
  `).join("");
  const w = window.open("", "_blank");
  if (!w) {
    alert("Permite ventanas emergentes para generar el reporte de mezclas.");
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>mezclas_${new Date().toISOString().slice(0,10)}</title><style>
    @page{size:A4 portrait;margin:12mm}
    body{font-family:Arial,sans-serif;color:#112;margin:0;background:#f5f7fb}
    main{padding:18px;max-width:980px;margin:0 auto;background:white}
    h1{margin:0;color:#003366;font-size:22px}
    .sub{color:#52657a;font-size:12px;margin:6px 0 16px}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:14px}
    .kpi{border:1px solid #cbd8e6;border-top:4px solid #1e6fd9;border-radius:8px;padding:9px}
    .kpi b{display:block;color:#64748b;font-size:10px;text-transform:uppercase}
    .kpi span{font-family:Consolas,monospace;font-weight:900;font-size:16px}
    .option{border:1px solid #d7e2ee;border-left:5px solid #00a878;border-radius:8px;padding:12px;margin:12px 0;page-break-inside:avoid}
    .option-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    h2{font-size:16px;margin:0;color:#0f3a6e}
    p{margin:4px 0 10px;color:#52657a;font-size:11px}
    strong{font-family:Consolas,monospace}
    .ok{color:#008a61}.warn{color:#b77900}
    table{width:100%;border-collapse:collapse;font-size:11px}
    th{background:#0f3a6e;color:white;text-align:left;padding:6px}
    td{border:1px solid #d7e2ee;padding:5px}
    .result{margin-top:8px;font-family:Consolas,monospace;font-weight:900;color:#008a61}
    pre{white-space:pre-wrap;background:#f3f7fb;border:1px solid #d7e2ee;border-radius:6px;padding:8px;font-size:10px;color:#334155}
    .no-print{position:fixed;top:10px;right:10px}.no-print button{padding:9px 12px;font-weight:900}
    @media print{body{background:white}.no-print{display:none}main{padding:0;max-width:none}}
  </style></head><body><div class="no-print"><button onclick="window.print()">Imprimir / guardar PDF</button></div><main>
    <h1>Opciones de mezcla OXMO</h1>
    <div class="sub">Generado: ${esc(fecha)} · Preparado para operador/encargado</div>
    <div class="kpis">
      <div class="kpi"><b>Cu objetivo</b><span>${fmt(objetivo.cu, 3)}%</span></div>
      <div class="kpi"><b>Mo mínimo</b><span>${fmt(objetivo.mo, 3)}%</span></div>
      <div class="kpi"><b>S máximo</b><span>${fmt(objetivo.s, 4)}%</span></div>
      <div class="kpi"><b>Masa solicitada</b><span>${(parseNum(objetivo.masa) / 1000).toFixed(2)} t</span></div>
    </div>
    ${rows}
  </main><script>window.onload=()=>setTimeout(()=>window.print(),250)<\/script></body></html>`);
  w.document.close();
}

function bindReportes() {
  document.querySelector("#printReport").addEventListener("click", () => {
    const fechaArchivo = new Date().toISOString().slice(0, 10);
    const titulo = `reporte_${fechaArchivo}`;
    const totalMasa = state.lotes.reduce((a, l) => a + l.masa, 0);
    const totalFinoMo = state.lotes.filter(l => Number(l.mo) > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0);
    const rows = state.lotes.map(l => {
      const cl = clasificar(l);
      return `<tr>
        <td>${l.id}</td>
        <td>${l.tipo}</td>
        <td>${l.masa.toLocaleString("es-CL")}</td>
        <td>${l.sector}</td>
        <td>${hasAnalysis(l) ? l.cu : "-"}</td>
        <td>${hasAnalysis(l) ? l.mo : "-"}</td>
        <td>${hasAnalysis(l) ? l.s : "-"}</td>
        <td><span class="badge" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}66">${cl.clase}</span></td>
        <td>${l.estado}</td>
        <td>${l.fecha}</td>
      </tr>`;
    }).join("");
    const html = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${titulo}</title>
  <style>
    @page { size: 297mm 210mm; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      color: #182234;
      background: #ffffff;
    }
    body { padding: 10mm; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: stretch;
      background: linear-gradient(90deg, #071326, #0f3a6e 55%, #c87533);
      color: white;
      border-radius: 10px;
      margin-bottom: 10px;
      overflow: hidden;
    }
    .brand { padding: 14px 18px; }
    h1 { font-size: 20px; letter-spacing: .8px; margin: 0 0 4px; }
    .sub { font-size: 11px; color: #b9dfff; letter-spacing: 1.4px; }
    .date { padding: 14px 18px; text-align: right; background: #0002; min-width: 150px; font-size: 11px; }
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-bottom: 10px; }
    .k { border: 1px solid #d7e2ee; border-top: 4px solid #1e6fd9; border-radius: 8px; padding: 8px 10px; background: #f7fbff; }
    .k b { display: block; color: #0f3a6e; font-size: 15px; }
    .k span { font-size: 9px; color: #60728a; text-transform: uppercase; letter-spacing: .6px; }
    table { width: 100%; border-collapse: separate; border-spacing: 0; table-layout: fixed; border: 1px solid #cfd8e3; border-radius: 8px; overflow: hidden; }
    th { background: #0f3a6e; color: white; font-size: 9px; letter-spacing: .5px; text-transform: uppercase; }
    td, th { padding: 6px 7px; border-right: 1px solid #d7e2ee; border-bottom: 1px solid #d7e2ee; text-align: left; overflow-wrap: anywhere; vertical-align: middle; }
    td { font-size: 10px; }
    tr:nth-child(even) td { background: #f6f9fc; }
    td:nth-child(1) { font-family: Consolas, monospace; font-weight: bold; color: #1e6fd9; }
    td:nth-child(3), td:nth-child(5), td:nth-child(6), td:nth-child(7) { text-align: right; font-family: Consolas, monospace; }
    th:nth-child(1){width:8%} th:nth-child(2){width:10%} th:nth-child(3){width:10%} th:nth-child(4){width:18%}
    th:nth-child(5), th:nth-child(6), th:nth-child(7){width:8%} th:nth-child(8){width:14%} th:nth-child(9){width:10%} th:nth-child(10){width:8%}
    .badge { display: inline-block; border: 1px solid; border-radius: 999px; padding: 2px 7px; font-weight: bold; font-size: 9px; white-space: nowrap; }
    .small { font-size: 9px; color: #687789; margin-top: 8px; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed;right:14px;top:14px;display:flex;gap:8px">
    <button id="backReport" style="padding:8px 14px;border:1px solid #cfd8e3;border-radius:6px;background:white;color:#0f3a6e;font-weight:700;cursor:pointer">Volver</button>
    <button id="printReportView" style="padding:8px 14px;border:0;border-radius:6px;background:#1e6fd9;color:white;font-weight:700;cursor:pointer">Imprimir / guardar PDF</button>
  </div>
  <main>
    <div class="header">
      <div class="brand"><h1>REPORTE INVENTARIO DE CIRCULANTES</h1><div class="sub">OXMO · CONTROL OPERACIONAL</div></div>
      <div class="date"><b>Fecha reporte</b><br>${new Date().toLocaleString("es-CL")}</div>
    </div>
    <section class="summary">
      <div class="k"><span>Total lotes</span><b>${state.lotes.length}</b></div>
      <div class="k" style="border-top-color:#00e5a0"><span>Masa total</span><b>${(totalMasa / 1000).toFixed(2)} t</b></div>
      <div class="k" style="border-top-color:#00d4ff"><span>Fino Mo</span><b>${(totalFinoMo / 1000).toFixed(2)} t</b></div>
      <div class="k" style="border-top-color:#c87533"><span>Alto cobre</span><b>${state.lotes.filter(l => clasificar(l).clase === "Alto Cobre").length}</b></div>
      <div class="k" style="border-top-color:#ff4560"><span>Fuera esp.</span><b>${state.lotes.filter(l => clasificar(l).clase === "Fuera Esp").length}</b></div>
    </section>
    <table>
      <tr><th>ID</th><th>Tipo</th><th>Masa kg</th><th>Sector</th><th>Cu %</th><th>Mo %</th><th>S %</th><th>Clasificación</th><th>Estado</th><th>Fecha</th></tr>
      ${rows}
    </table>
    <div class="small">Reporte generado desde inventario de circulantes. No incluye silos.</div>
  </main>
</body>
</html>`;
    state.reporteHTML = html;
    state.tab = "reportePrint";
    render();
    setTimeout(() => window.print(), 400);
  });
}

function bindReportePrint() {
  const back = document.querySelector("#backReport");
  if (back) back.addEventListener("click", () => {
    state.tab = "reportes";
    state.reporteHTML = "";
    render();
  });
  const print = document.querySelector("#printReportView");
  if (print) print.addEventListener("click", () => window.print());
}

function infodiaHTML() {
  const info = state.infodia;
  const totals = info?.totals || {};
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Importar Infodia</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900">Produccion y silos desde archivo diario</div>
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:760px;line-height:1.45">Sube diariamente el archivo .xlsb del Infodia. OXMO calcula produccion, fino Mo, niveles de silo y caracterizacion automatica con los comunes OO300-001. El ingreso manual queda solo como respaldo para ajustes puntuales.</div>
      </div>
      <label class="btn" for="infodiaFile" style="cursor:pointer">SUBIR INFODIA</label>
      <input id="infodiaFile" type="file" accept=".xlsb,.xlsx,.xls" style="display:none" />
    </div>
    ${info ? `<div class="notice">Ultima importacion: ${info.fileName} - ${info.importedAt}. Dias leidos: ${info.days.length}. Registros de produccion procesados: ${totals.lotes || 0} (ocultos en inventario).</div>` : `<div class="notice" style="border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Aun no hay infodia importado.</div>`}
    ${info ? infodiaResumenHTML(info) : ""}
  </div>`;
}

function infodiaResumenHTML(info) {
  const days = [...info.days].sort((a, b) => a.fecha.localeCompare(b.fecha));
  const last = days.at(-1);
  const totals = info.totals || {};
  const lastKgMo = last?.kgMo || 0;
  const analisis = info.analisis || [];
  const siloHistorial = info.siloHistorial || [];
  const siloEntries = sortedSiloEntries();
  return `<div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Produccion ultimo dia", kgToTon(last?.produccionKg || 0), C.green)}
      ${miniReport("Fino Mo ultimo dia", kgToTon(lastKgMo), C.copper)}
      ${miniReport("Produccion acumulada", kgToTon(totals.produccionKg || 0), C.blueLight)}
      ${miniReport("Fino Mo acumulado", kgToTon(totals.kgMo || 0), C.cyan)}
      ${miniReport("Llenado silos", `${(totals.llenadoT || 0).toFixed(2)} t`, C.copper)}
      ${miniReport("Descarga silos", `${(totals.descargaT || 0).toFixed(2)} t`, C.yellow)}
      ${miniReport("Comunes ACP", String(analisis.length), C.green)}
      ${miniReport("Historial silos", String(siloHistorial.length), C.copper)}
      ${miniReport("Ventana simulacion", info.simWindow || "-", C.txt2)}
      ${miniReport("Ultimo dia", last?.fecha || "-", C.txt2)}
    </div>
    <div class="notice" style="border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Detalle de dias y lotes queda guardado solo para calculo interno. La simulacion de silos usa los comunes OO300-001 por fecha y queda disponible en Historial Silos.</div>
    <div class="card" style="margin-top:14px">
      <div class="muted-title" style="margin-bottom:10px">Ultimos niveles de silos desde infodia</div>
      <div class="grid-cards">${siloEntries.map(([id, s]) => `<div class="card">
        <div class="mono" style="color:var(--blue-light);font-weight:900">${id}</div>
        <div class="mono" style="color:var(--cyan);font-size:18px;font-weight:900">${Number(s.nivel || 0).toFixed(1)}%</div>
        <div style="color:var(--txt2);font-size:11px">${Number(s.masa || 0).toFixed(2)} t - ${s.fecha || ""}</div>
      </div>`).join("")}</div>
    </div>
    <div class="card" style="margin-top:14px">
      <div class="muted-title" style="margin-bottom:10px">Caracterizacion actual de silos</div>
      ${siloEntries.some(([, s]) => hasAnalysis(s)) ? `<div class="table-wrap">
        <table>
          <thead><tr><th>Silo</th><th>Fecha</th><th>Inicio</th><th>Termino</th><th>Nivel</th><th>Masa</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th>Comunes ACP</th></tr></thead>
          <tbody>${siloEntries.filter(([, s]) => hasAnalysis(s)).map(([id, s]) => {
            const cl = clasificar(s);
            return `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${id}</td>
              <td class="mono">${s.fecha || "-"}</td>
              <td class="mono">${s.horaInicio || "-"}</td>
              <td class="mono">${s.horaTermino || "-"}</td>
              <td class="mono">${Number(s.nivel || 0).toFixed(1)}%</td>
              <td class="mono">${Number(s.masa || 0).toFixed(2)} t</td>
              <td class="mono" style="color:var(--cyan)">${Number(s.cu || 0).toFixed(3)}</td>
              <td class="mono" style="color:var(--green)">${Number(s.mo || 0).toFixed(3)}</td>
              <td class="mono" style="color:var(--yellow)">${Number(s.s || 0).toFixed(4)}</td>
              <td><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span></td>
              <td style="font-size:10px;color:var(--txt2)">${(s.comunes || []).join(", ") || "-"}</td>
            </tr>`;
          }).join("")}</tbody>
        </table>
      </div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">Aun no hay caracterizacion de silos con comunes ACP para la ventana simulada.</div>`}
    </div>
  </div>`;
}

function siloHistorialHTML() {
  const query = String(state.siloHistSearch || "").trim().toLowerCase();
  const hist = [...(state.siloHistorial || [])]
    .filter(h => isValidSiloId(h.siloId))
    .filter(h => hasAnalysis(h))
    .filter(h => {
      if (!query) return true;
      return [h.fecha, h.siloId, h.movimiento, h.clase, ...(h.comunes || [])].join(" ").toLowerCase().includes(query);
    })
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || String(a.siloId).localeCompare(String(b.siloId)));
  const totalLlenado = hist.reduce((a, h) => a + Number(h.masaLlenado || 0), 0);
  const totalDescarga = hist.reduce((a, h) => a + Number(h.masaDescarga || 0), 0);
  const conAnalisis = hist.filter(h => hasAnalysis(h)).length;
  const ultimo = hist[0];
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Historial de llenado de silos</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900">Simulacion Infodia + comunes ACP</div>
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:820px;line-height:1.45">Caracterizacion historica generada desde las hojas diarias del Infodia y la hoja final de analisis. El turno dia usa el primer comun OO300-001 de la fecha y el turno noche el segundo, si existe. La quimica se asigna al llenado real detectado por nivel inicial y final.</div>
      </div>
      <button class="btn secondary" data-tab="infodia">Importar nuevo Infodia</button>
    </div>
    <div class="card" style="margin-bottom:14px">
      <div class="field" style="margin:0">
        <label>Buscar en historial</label>
        <input id="siloHistSearch" value="${state.siloHistSearch || ""}" placeholder="Ej: 2026-05-16, Silo 5, OO300-001-06150-26, Bajo Cobre">
      </div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Eventos historicos", String(hist.length), C.blueLight)}
      ${miniReport("Masa llenada", `${totalLlenado.toFixed(2)} t`, C.green)}
      ${miniReport("Masa descargada", `${totalDescarga.toFixed(2)} t`, C.yellow)}
      ${miniReport("Con analisis", String(conAnalisis), C.cyan)}
      ${miniReport("Ultimo evento", ultimo?.fecha || "-", C.copper)}
    </div>
    ${hist.length ? `<div class="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Inicio</th><th>Término</th><th>Silo</th><th>Movimiento</th><th>Nivel inicial</th><th>Nivel final</th><th>Llenado</th><th>Masa final</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th>Comunes ACP</th></tr></thead>
        <tbody>${hist.map(h => {
          const cl = hasAnalysis(h) ? clasificar(h) : { clase: "Pendiente", color: C.yellow };
          return `<tr>
            <td class="mono" style="color:var(--txt2)">${h.fecha}</td>
            <td class="mono" style="color:var(--txt2)">${h.horaInicio || "-"}</td>
            <td class="mono" style="color:var(--txt2)">${h.horaTermino || "-"}</td>
            <td class="mono" style="color:var(--blue-light);font-weight:900">${h.siloId}</td>
            <td><span class="tag" style="background:${h.movimiento === "Llenado" ? C.green : h.movimiento === "Descarga" ? C.yellow : C.blue}22;color:${h.movimiento === "Llenado" ? C.green : h.movimiento === "Descarga" ? C.yellow : C.blue};border-color:#ffffff22">${h.movimiento || "Nivel"}</span></td>
            <td class="mono">${Number(h.nivelInicial || 0).toFixed(1)}%</td>
            <td class="mono">${Number(h.nivelFinal || 0).toFixed(1)}%</td>
            <td class="mono">${Number(h.masaLlenado || 0).toFixed(2)} t</td>
            <td class="mono">${Number(h.masaFinal || 0).toFixed(2)} t</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.cyan : C.txt3}">${hasAnalysis(h) ? Number(h.cu).toFixed(3) : "-"}</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.green : C.txt3}">${hasAnalysis(h) ? Number(h.mo).toFixed(3) : "-"}</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.yellow : C.txt3}">${hasAnalysis(h) ? Number(h.s).toFixed(4) : "-"}</td>
            <td><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span></td>
            <td style="font-size:10px;color:var(--txt2)">${(h.comunes || []).join(", ") || "Sin comun para la fecha"}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">No hay eventos caracterizados para ese filtro. Importa el Infodia o cambia la busqueda.</div>`}
  </div>`;
}

function bindSiloHistorial() {
  const input = document.querySelector("#siloHistSearch");
  if (!input) return;
  input.addEventListener("input", e => {
    state.siloHistSearch = e.target.value;
    render();
    focusInputEnd("#siloHistSearch");
  });
}

function focusInputEnd(selector) {
  setTimeout(() => {
    const next = document.querySelector(selector);
    if (!next) return;
    next.focus();
    try {
      next.setSelectionRange(next.value.length, next.value.length);
    } catch {}
  }, 0);
}

function bindInfodia() {
  const file = document.querySelector("#infodiaFile");
  if (!file) return;
  file.addEventListener("change", async e => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    try {
      const result = await importarInfodia(selected);
      aplicarInfodia(result);
      addHist("Infodia importado", "", `${result.days.length} dias - produccion oculta en inventario`, C.cyan);
      render();
    } catch (err) {
      console.error(err);
      alert(`No se pudo importar el infodia: ${err.message || err}`);
    }
  });
}

async function importarInfodia(file) {
  if (!window.XLSX) throw new Error("No se cargo el lector Excel. Revisa conexion a internet y recarga.");
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array", cellDates: false });
  const analisisACP = parseAnalisisACP(wb);
  const analisis = analisisACP.filter(a => a.tipoAnalisis === "comun_turno");
  const analisisLotes = analisisACP.filter(a => a.tipoAnalisis !== "comun_turno");
  const days = wb.SheetNames
    .filter(name => /\d{2}-\d{2}-\d{4}/.test(name))
    .map(name => parseInfodiaSheet(name, XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" })))
    .filter(Boolean);
  const selectedWindow = selectSiloSimulationDays(days);
  const siloHistorial = buildSiloHistorial(days, analisis);
  const totals = days.reduce((a, d) => ({
    lotes: a.lotes + d.lotes.length,
    produccionKg: a.produccionKg + d.produccionKg,
    kgMo: a.kgMo + d.kgMo,
    llenadoT: a.llenadoT + d.llenadoT,
    descargaT: a.descargaT + d.descargaT,
  }), { lotes: 0, produccionKg: 0, kgMo: 0, llenadoT: 0, descargaT: 0 });
  return { fileName: file.name, importedAt: new Date().toLocaleString("es-CL"), days, analisis, analisisLotes, analisisACP, siloHistorial, simWindow: selectedWindow.label, totals };
}

function parseAnalisisACP(wb) {
  const sheetName = wb.SheetNames.find(n => /hoja1|anal|acp|lab|quim/i.test(n)) || wb.SheetNames.at(-1);
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
  if (!rows.length) return [];
  const headerRow = rows.findIndex(r => r.some(c => cellText(c).includes("NRO LOTE")));
  const header = (rows[headerRow >= 0 ? headerRow : 0] || []).map(x => cellText(x));
  const idxExact = name => header.findIndex(h => h === cellText(name));
  const idxIncludes = (...tokens) => header.findIndex(h => tokens.every(t => h.includes(cellText(t))));
  const loteIdx = idxIncludes("NRO", "LOTE");
  const fechaIdx = header.findIndex(h => h.includes("FECHA") && h.includes("ANALISIS"));
  const productoIdx = idxExact("PRODUCTO");
  const cuIdx = idxExact("Cu");
  const moIdx = idxExact("Mo");
  const sIdx = idxExact("S");
  if (loteIdx < 0 || fechaIdx < 0 || cuIdx < 0 || moIdx < 0 || sIdx < 0) return [];
  return rows.slice((headerRow >= 0 ? headerRow : 0) + 1).map(r => {
    const codigo = normalizarCodigoAnalisis(r[loteIdx]);
    const tipoAnalisis = tipoAnalisisACP(codigo);
    if (!tipoAnalisis) return null;
    const fecha = normalizarFechaAnalisis(r[fechaIdx]);
    const cu = parseNum(r[cuIdx]);
    const mo = parseNum(r[moIdx]);
    const s = parseNum(r[sIdx]);
    if (!fecha || !Number.isFinite(cu) || !Number.isFinite(mo)) return null;
    const comun = { codigo, tipoAnalisis, producto: productoIdx >= 0 ? String(r[productoIdx] || "").trim() : "", fecha, cu, mo, s, fuente: sheetName };
    return { ...comun, ...clasificar(comun) };
  }).filter(Boolean);
}
/* v19-clean-safe: definición antigua removida: tipoAnalisisACP */

/* v19-clean-safe: definición antigua removida: normalizarCodigoAnalisis */

/* v19-clean-safe: definición antigua removida: codigoPartesInventario */

/* v19-clean-safe: definición antigua removida: scoreMatchACP */


function buscarAnalisisParaInventario(lote, analisisACP) {
  const candidatos = (analisisACP || [])
    .filter(a => a.tipoAnalisis !== "comun_turno" && hasAnalysis(a))
    .map(a => ({ item: a, score: scoreMatchACP(lote, a) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score || String(b.item.fecha || "").localeCompare(String(a.item.fecha || "")));
  return candidatos[0]?.item || null;
}

function actualizarInventarioConACP(lotes, analisisACP) {
  let actualizados = 0;
  const updated = (lotes || []).map(l => {
    const match = buscarAnalisisParaInventario(l, analisisACP);
    if (!match) return l;
    const quimica = {
      cu: Number(Number(match.cu || 0).toFixed(3)),
      mo: Number(Number(match.mo || 0).toFixed(3)),
      s: Number(Number(match.s || 0).toFixed(4)),
    };
    const cl = clasificar(quimica);
    const obsBase = String(l.obs || "").replace(/\s*\|?\s*ACP:[^|]+/g, "").trim();
    const obsAcp = `ACP: ${match.codigo}${match.fecha ? ` ${match.fecha}` : ""}`;
    const next = {
      ...l,
      ...quimica,
      estado: l.estado === "Bloqueado" ? "Bloqueado" : cl.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible",
      acpMatch: match.codigo,
      acpFecha: match.fecha,
      obs: obsBase ? `${obsBase} | ${obsAcp}` : obsAcp,
    };
    if (
      Number(l.cu || 0) !== next.cu ||
      Number(l.mo || 0) !== next.mo ||
      Number(l.s || 0) !== next.s ||
      l.estado !== next.estado ||
      l.acpMatch !== next.acpMatch
    ) actualizados += 1;
    return next;
  });
  return { lotes: updated, actualizados };
}

function syncInventarioACP() {
  const acp = state.infodia?.analisisACP?.length ? state.infodia.analisisACP : state.infodia?.analisisLotes || [];
  if (!acp.length) return;
  const result = actualizarInventarioConACP(state.lotes, acp);
  if (!result.actualizados) return;
  state.lotes = result.lotes;
  save("oxmo:lotes", state.lotes);
}

function aplicarACPInventarioActual() {
  const result = actualizarInventarioConACP(state.lotes, state.infodia?.analisisACP || state.infodia?.analisisLotes || []);
  state.lotes = result.lotes;
  save("oxmo:lotes", state.lotes);
  addHist("Inventario actualizado con ACP", "", `${result.actualizados} lote(s) cruzados con cartilla`, result.actualizados ? C.green : C.yellow);
  render();
}

function buildSiloHistorial(days, analisis) {
  const byDate = new Map();
  for (const a of analisis) {
    if (!byDate.has(a.fecha)) byDate.set(a.fecha, []);
    byDate.get(a.fecha).push(a);
  }
  const targetDays = selectSiloSimulationDays(days).days;
  const out = [];
  for (const day of targetDays.sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const comunesDia = byDate.get(day.fecha) || [];
    for (const s of day.silos) {
      const comunes = comunesParaTurno(comunesDia, s.turno);
      const promedio = promedioAnalisis(comunes);
      const llenado = Number(s.llenadoT || 0);
      const descarga = Number(s.descargaT || 0);
      const masaFinal = Number(s.masa || 0);
      const tieneComun = comunes.length > 0 && hasAnalysis(promedio);
      const caracter = tieneComun && llenado > 0
        ? { cu: promedio.cu, mo: promedio.mo, s: promedio.s }
        : { cu: 0, mo: 0, s: 0 };
      const movimiento = llenado > 0 ? "Llenado" : descarga > 0 ? "Descarga" : "Nivel";
      const rec = {
        fecha: day.fecha,
        siloId: s.id,
        silo: s.silo,
        turno: s.turno,
        horaInicio: s.horaInicio,
        horaTermino: s.horaTermino,
        movimiento,
        nivelInicial: Number(s.nivelInicial || 0),
        masaLlenado: llenado,
        masaDescarga: descarga,
        masaFinal,
        nivelFinal: Number(s.finalNivel || 0),
        comunes: comunes.map(c => c.codigo),
        comunCu: promedio.cu,
        comunMo: promedio.mo,
        comunS: promedio.s,
        cu: caracter.cu,
        mo: caracter.mo,
        s: caracter.s,
      };
      const finalRec = { ...rec, ...clasificar(rec) };
      if (tieneComun && llenado > 0 && hasAnalysis(finalRec) && masaFinal > 0) out.push(finalRec);
    }
  }
  return out;
}

function promedioAnalisis(items) {
  if (!items.length) return { cu: 0, mo: 0, s: 0 };
  const avg = key => items.reduce((a, x) => a + Number(x[key] || 0), 0) / items.length;
  return {
    cu: Number(avg("cu").toFixed(3)),
    mo: Number(avg("mo").toFixed(3)),
    s: Number(avg("s").toFixed(4)),
  };
}

function comunesParaTurno(comunes, turno) {
  if (!comunes.length) return [];
  const sorted = [...comunes].sort((a, b) => a.codigo.localeCompare(b.codigo));
  if (turno === "B" && sorted.length > 1) return [sorted[1]];
  return [sorted[0]];
}

function parseInfodiaSheet(sheetName, rows) {
  const fecha = normalizarFechaHoja(sheetName);
  const loteRows = parseInfodiaLotes(rows, fecha);
  const silos = parseInfodiaSilos(rows, fecha);
  if (!loteRows.length && !silos.length) return null;
  const produccionKg = loteRows.reduce((a, l) => a + l.masa, 0);
  const kgMo = loteRows.reduce((a, l) => a + Number(l.kgMo || 0), 0);
  const llenadoT = silos.reduce((a, s) => a + s.llenadoT, 0);
  const descargaT = silos.reduce((a, s) => a + s.descargaT, 0);
  return { sheetName, fecha, lotes: loteRows, silos, produccionKg, kgMo, llenadoT, descargaT, netoT: llenadoT - descargaT };
}

function parseInfodiaLotes(rows, fecha) {
  const startA = rows.findIndex(r => cellText(r[0]).startsWith("T") && cellText(r[1]).toLowerCase() === "lote");
  if (startA < 0) return [];
  const startB = rows.findIndex((r, i) => i > startA && cellText(r[0]).startsWith("T") && cellText(r[1]).toLowerCase() === "lote");
  const end = rows.findIndex((r, i) => i > startA && r.some(c => cellText(c).includes("PRODUCCION DIA")));
  const blocks = [
    { turno: "A", from: startA + 1, to: startB > 0 ? startB : end },
    { turno: "B", from: startB > 0 ? startB + 1 : end, to: end > 0 ? end : rows.length },
  ];
  return blocks.flatMap(block => rows.slice(block.from, block.to).map(r => {
    const id = cellText(r[1]);
    const masa = parseNum(r[7]);
    if (!id || !masa) return null;
    const tipoEnvase = cellText(r[5]).toUpperCase();
    return {
      id,
      turno: block.turno,
      envasadora: cellText(r[2]),
      campana: cellText(r[3]),
      tipoMaterial: cellText(r[4]).trim(),
      tipo: tipoEnvase.includes("TB") ? "Tambor" : "Maxisaco",
      tipoEnvase,
      cantidad: parseNum(r[6]),
      masa,
      kgMo: parseNum(r[8]),
      desdeAl: cellText(r[9]),
      pesoUnitario: parseNum(r[10]),
      sector: "Planta Envase",
      fecha,
      estado: "Pendiente",
      cu: 0,
      mo: 0,
      s: 0,
      obs: `Importado desde infodia. Campana ${cellText(r[3])}. Turno ${block.turno}.`,
    };
  }).filter(Boolean));
}

function parseInfodiaSilos(rows, fecha) {
  const title = rows.findIndex(r => r.some(c => cellText(c).includes("EXISTENCIA SILOS")));
  if (title < 0) return [];
  const out = [];
  const mk = (n, turno, ini, fin, tipo, hasFin) => {
    const base = state.silosBase.find(s => s.id === `Silo ${n}`) || { cap: 50 };
    const finalNivel = hasFin ? Number(fin || 0) : Number(ini || 0);
    const delta = (finalNivel - Number(ini || 0)) * base.cap / 100;
    const horaInicio = turno === "A" ? "08:00" : "20:00";
    const horaTermino = turno === "A" ? "20:00" : `08:00 ${addIsoDays(fecha, 1)}`;
    return {
      id: `Silo ${n}`,
      silo: n,
      fecha,
      turno,
      horaInicio,
      horaTermino,
      tipo,
      nivelInicial: ini || 0,
      finalNivel,
      masa: finalNivel * base.cap / 100,
      llenadoT: Math.max(0, delta),
      descargaT: Math.max(0, -delta),
      netoT: delta,
    };
  };
  for (let i = title; i < Math.min(rows.length, title + 25); i++) {
    const r = rows[i];
    const n = parseInt(cellText(r[1]), 10);
    if (!Number.isInteger(n) || n < 4 || n > 11) continue;
    const hasVal = v => String(v ?? "").trim() !== "";
    const iniA = parsePct(r[2]);
    const finA = parsePct(r[3]);
    const tipoA = cellText(r[4]);
    const iniB = parsePct(r[5]);
    const finB = parsePct(r[6]);
    if (hasVal(r[2]) || hasVal(r[3])) out.push(mk(n, "A", iniA, finA, tipoA, hasVal(r[3])));
    if (hasVal(r[5]) || hasVal(r[6])) out.push(mk(n, "B", iniB, finB, "", hasVal(r[6])));
  }
  return out;
}

function selectSiloSimulationDays(days) {
  const sorted = [...(days || [])].sort((a, b) => a.fecha.localeCompare(b.fecha));
  for (const w of SILO_SIM_WINDOWS) {
    const selected = sorted.filter(d => d.fecha >= w.start && d.fecha <= w.end);
    if (selected.length) return { days: selected, label: w.label };
  }
  return { days: sorted, label: "todas las fechas disponibles" };
}

function uniqueBy(items, keyFn, preferNew = true) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyFn(item);
    if (!key) continue;
    if (preferNew || !map.has(key)) map.set(key, item);
  }
  return [...map.values()];
}

function recalcularTotalesInfodia(days) {
  return (days || []).reduce((a, d) => ({
    lotes: a.lotes + (d.lotes || []).length,
    produccionKg: a.produccionKg + Number(d.produccionKg || 0),
    kgMo: a.kgMo + Number(d.kgMo || 0),
    llenadoT: a.llenadoT + Number(d.llenadoT || 0),
    descargaT: a.descargaT + Number(d.descargaT || 0),
  }), { lotes: 0, produccionKg: 0, kgMo: 0, llenadoT: 0, descargaT: 0 });
}
/* v19-clean-safe: definición antigua removida: fusionarInfodia */


function aplicarInfodia(info) {
  info = fusionarInfodia(state.infodia, info);
  const lotesBase = state.lotes.filter(l => !isInfodiaProductionLote(l));
  const acpInventario = actualizarInventarioConACP(lotesBase, info.analisisACP || info.analisisLotes || []);
  state.lotes = acpInventario.lotes;
  save("oxmo:lotes", state.lotes);
  if (acpInventario.actualizados) {
    addHist("Inventario actualizado con ACP", "", `${acpInventario.actualizados} lote(s) cruzados al importar Infodia`, C.green);
  }
  const lastLevelBySilo = {};
  const lastAnalysisBySilo = {};
  state.siloHistorial = info.siloHistorial || [];
  save("oxmo:siloHistorial", state.siloHistorial);
  for (const day of [...(info.days || [])].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    for (const s of day.silos || []) {
      if (!isValidSiloId(s.id)) continue;
      lastLevelBySilo[s.id] = {
        nivel: Number(s.finalNivel || 0),
        masa: Number(s.masa || 0),
        fecha: day.fecha,
        fuente: "infodia",
        horaInicio: s.horaInicio,
        horaTermino: s.horaTermino,
        turno: s.turno,
      };
    }
  }
  for (const h of [...state.siloHistorial].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    if (!isValidSiloId(h.siloId)) continue;
    if (!hasAnalysis(h)) continue;
    lastAnalysisBySilo[h.siloId] = {
      fecha: h.fecha,
      cu: h.cu || 0,
      mo: h.mo || 0,
      s: h.s || 0,
      clase: h.clase,
      movimiento: h.movimiento,
      comunes: h.comunes || [],
      horaInicio: h.horaInicio,
      horaTermino: h.horaTermino,
    };
  }
  const merged = {};
  for (const id of new Set([...Object.keys(lastLevelBySilo), ...Object.keys(lastAnalysisBySilo)])) {
    if (!isValidSiloId(id)) continue;
    merged[id] = { ...(lastLevelBySilo[id] || {}), ...(lastAnalysisBySilo[id] || {}) };
  }
  state.siloNiveles = cleanSiloNiveles({ ...cleanSiloNiveles(state.siloNiveles), ...merged });
  save("oxmo:siloNiveles", state.siloNiveles);
  state.infodia = info;
  save("oxmo:infodia", info);
}

function cellText(v) {
  return String(v ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

function parseNum(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const txt = String(v ?? "").trim().replace(/\s/g, "");
  if (!txt || txt === "-") return 0;
  if (txt.includes(",")) return Number(txt.replace(/\./g, "").replace(",", ".")) || 0;
  if (/^\d{1,3}(\.\d{3})+$/.test(txt)) return Number(txt.replace(/\./g, "")) || 0;
  return Number(txt.replace(/[^0-9.-]/g, "")) || 0;
}

function parsePct(v) {
  const n = parseNum(v);
  return n > 0 && n <= 1 ? n * 100 : n;
}

function normalizarFechaHoja(name) {
  const m = name.match(/(\d{2})-(\d{2})-(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : name.trim();
}

function addIsoDays(fecha, days) {
  const d = new Date(`${fecha}T00:00:00`);
  if (Number.isNaN(d.getTime())) return fecha;
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function normalizarFechaAnalisis(v) {
  if (typeof v === "number" && Number.isFinite(v)) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(v) * 86400000);
    return d.toISOString().slice(0, 10);
  }
  if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
  const raw = String(v ?? "").trim();
  if (!raw) return "";
  const iso = raw.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (iso) return `${iso[1]}-${String(iso[2]).padStart(2, "0")}-${String(iso[3]).padStart(2, "0")}`;
  const meses = { ene:1, enero:1, feb:2, febrero:2, mar:3, marzo:3, abr:4, abril:4, may:5, mayo:5, jun:6, junio:6, jul:7, julio:7, ago:8, agosto:8, sep:9, sept:9, septiembre:9, oct:10, octubre:10, nov:11, noviembre:11, dic:12, diciembre:12 };
  const m = raw.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").match(/(\d{1,2})[-/\s.]([a-z]+|\d{1,2})[-/\s.](\d{2,4})/);
  if (!m) return raw;
  const month = /^\d+$/.test(m[2]) ? Number(m[2]) : meses[m[2]];
  const year = Number(m[3]) < 100 ? 2000 + Number(m[3]) : Number(m[3]);
  if (!month || !year) return raw;
  return `${year}-${String(month).padStart(2, "0")}-${String(m[1]).padStart(2, "0")}`;
}

function configureCloud() {
  state.cloudPanel = true;
  state.cloudMsg = "";
  render();
}

function range(label, key, value, min, max, step, unit, color) {
  const displayValue = key === "masa" ? Number(value).toFixed(0) : Number(value).toFixed(step < 0.1 ? 2 : 1);
  return `<div class="mix-target" style="--accent:${color}">
    <div class="mix-target-head">
      <span>${label}</span>
      <label><input data-range-input="${key}" data-min="${min}" data-max="${max}" data-step="${step}" type="text" inputmode="decimal" dir="ltr" value="${displayValue}" /> ${unit}</label>
    </div>
    <input data-range="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
  </div>`;
}

function cloudPanelHTML() {
  const cfg = cloudConfig() || {};
  const url = cfg.url || "https://obkvneyvgzraxolohmwf.supabase.co";
  const key = cfg.anonKey || "";
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <form class="cloud-modal" id="cloudForm">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Configurar nube</div>
          <h2 style="margin:0;color:var(--txt);font-size:20px">Sincronizacion en tiempo real</h2>
          <p style="margin:8px 0 0;color:var(--txt2);font-size:12px;line-height:1.45">Pega el Project URL y la Publishable key de Supabase. Con esto todos los dispositivos conectados al mismo link compartiran inventario, silos, sectores y comunes de turno.</p>
        </div>
        <button type="button" class="icon-btn" id="cloudClose" title="Cerrar">X</button>
      </div>
      <div class="cloud-hint">El Project URL correcto termina en <b>.supabase.co</b>. No debe cambiarse a .com.</div>
      <label class="lbl" for="cloudUrl">PROJECT URL</label>
      <input class="inp" id="cloudUrl" value="${url}" placeholder="https://xxxx.supabase.co" autocomplete="off" />
      <label class="lbl" for="cloudKey" style="margin-top:12px">PUBLISHABLE KEY</label>
      <textarea class="inp" id="cloudKey" rows="3" placeholder="sb_publishable_..." autocomplete="off">${key}</textarea>
      ${state.cloudMsg ? `<div class="notice" style="margin-top:12px">${state.cloudMsg}</div>` : ""}
      <div class="cloud-actions">
        <button type="button" class="btn secondary" id="cloudDisable">Usar solo este equipo</button>
        <div style="flex:1"></div>
        <button type="button" class="btn secondary" id="cloudCancel">Cancelar</button>
        <button class="btn" id="cloudSave">Guardar y conectar</button>
      </div>
      <div style="color:var(--txt3);font-size:10px;margin-top:10px;line-height:1.35">Importante: usa la Publishable key. No pegues la Secret key en la app.</div>
    </form>
  </div>`;
}

function bindCloudPanel() {
  const form = document.querySelector("#cloudForm");
  if (!form) return;
  const close = () => { state.cloudPanel = false; state.cloudMsg = ""; render(); };
  document.querySelector("#cloudClose")?.addEventListener("click", close);
  document.querySelector("#cloudCancel")?.addEventListener("click", close);
  document.querySelector("#cloudDisable")?.addEventListener("click", () => {
    clearCloudConfig();
    cloud.ready = false;
    cloud.status = "local";
    state.cloudPanel = false;
    state.cloudMsg = "";
    render();
  });
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const url = document.querySelector("#cloudUrl").value.trim();
    const anonKey = document.querySelector("#cloudKey").value.trim();
    if (!url || !anonKey) {
      state.cloudMsg = "Falta completar Project URL y Publishable key.";
      render();
      return;
    }
    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url)) {
      state.cloudMsg = "El Project URL parece incompleto. Debe quedar asi: https://obkvneyvgzraxolohmwf.supabase.co";
      render();
      return;
    }
    saveCloudConfig({ url, anonKey });
    cloud.status = "conectando";
    state.cloudMsg = "Conectando con Supabase...";
    render();
    await initCloud();
    if (cloud.ready) {
      await Promise.all([...SHARED_KEYS].map(keyName => cloudSave(keyName, load(keyName, sharedFallback(keyName)))));
      state.cloudPanel = false;
      state.cloudMsg = "";
      cloud.status = "tiempo real";
      render();
    } else {
      state.cloudPanel = true;
      state.cloudMsg = `No se pudo conectar. Detalle: ${cloud.lastError || "revisa la URL, la Publishable key y que la tabla oxmo_state exista."}`;
      render();
    }
  });
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function encodeEtiquetaQR(data) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
}

function decodeEtiquetaQR(token) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(token))));
  } catch {
    return null;
  }
}

function publicEtiquetaFromUrl() {
  const qs = new URLSearchParams(location.search);
  if (qs.get("label") === "1") {
    return {
      lote: qs.get("id") || "",
      material: qs.get("mat") || "",
      color: qs.get("color") || C.cyan,
      masa: qs.get("masa") || "",
      cu: qs.get("cu") || null,
      mo: qs.get("mo") || null,
      s: qs.get("s") || null,
      fecha: qs.get("fecha") || "",
    };
  }
  const token = qs.get("etiqueta");
  if (token) return decodeEtiquetaQR(token) || { error: "QR de etiqueta incompleto o no valido." };
  return null;
}
/* v19-clean-safe: definición antigua removida: etiquetaPublicaHTML */

function publicDato(label, value) {
  return `<div class="card" style="padding:10px;text-align:center"><div style="color:var(--txt3);font-size:9px;text-transform:uppercase">${esc(label)}</div><div class="mono" style="font-weight:900;color:var(--txt)">${esc(value)}</div></div>`;
}
/* v19-clean-safe: definición antigua removida: printLabels */

// --- Ajustes finales 2026-06-14: mezcla por objetivo, silos con comunes y etiqueta desde inventario ---
function correlativoAnalisis(codigo) {
  const txt = normalizarCodigoAnalisis(codigo || "");
  const nums = [...txt.matchAll(/(\d+)/g)].map(m => Number(m[1])).filter(Number.isFinite);
  return nums.length ? Math.max(...nums) : -1;
}

function lotesOxmoHTML() {
  const items = (state.infodia?.analisisLotes || [])
    .filter(a => /^(OXMO|OXBR)\d+-\d{2}$/.test(normalizarCodigoAnalisis(a.codigo)) || String(a.codigo || "").toUpperCase().includes("OSAC"))
    .sort((a, b) => {
      const nb = correlativoAnalisis(b.codigo);
      const na = correlativoAnalisis(a.codigo);
      return (nb - na) || String(b.fecha || "").localeCompare(String(a.fecha || "")) || String(b.codigo || "").localeCompare(String(a.codigo || ""));
    });
  const oxmo = items.filter(a => a.tipoAnalisis === "lote_oxmo");
  const briquetas = items.filter(a => a.tipoAnalisis === "briqueta");
  const osac = items.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").toUpperCase().includes("OSAC"));
  return analisisACPHTML({
    titulo: "Resultado de lotes OXMO - BQA",
    subtitulo: "Listado de analisis ACP para lotes OXMO, briquetas OXBR y registros OSAC. Estos datos son cartilla de laboratorio, no inventario fisico.",
    items,
    kpis: [
      ["Lotes OXMO", oxmo.length, C.blueLight],
      ["Briquetas OXBR", briquetas.length, C.copper],
      ["OSAC", osac.length, C.cyan],
      ["Con analisis", items.filter(hasAnalysis).length, C.green],
      ["Fuera espec.", items.filter(x => clasificar(x).clase === "Fuera Esp").length, C.red],
    ],
    empty: "No hay analisis OXMO/OXBR/OSAC cargados. Sube el Infodia con la hoja ACP.",
  });
}

function objetivoMezcla() {
  const masa = Math.min(40000, Math.max(1000, Math.round(parseNum(state.mix.masa || 20000) / 1000) * 1000));
  state.mix.masa = masa;
  return {
    cu: parseNum(state.mix.cu),
    mo: parseNum(state.mix.mo),
    s: parseNum(state.mix.s),
    masa,
  };
}
/* v19-clean-safe: definición antigua removida: evaluarMezclaObjetivo */

/* v19-clean-safe: definición antigua removida: buscarMejoresMezclas2 */

/* v19-clean-safe: definición antigua removida: mezclaOpcionHTML */

/* v19-clean-safe: definición antigua removida: comunesAsignados */


function siloCalculoHTML(siloId) {
  const silo = silosPonderados().find(s => s.id === siloId);
  if (!silo) return "";
  const comunes = comunesAsignados().filter(c => c.siloId === siloId && hasAnalysis(c));
  const masa = comunes.reduce((a, c) => a + Number(c.masa || 0), 0);
  const linea = key => comunes.map(c => `(${fmt(c[key], 3)} x ${fmt(c.masa, 2)})`).join(" + ") || "0";
  const calc = masa > 0
    ? `Cu = (${linea("cu")}) / ${fmt(masa, 2)} = ${fmt(silo.cu, 3)}%\nMo = (${linea("mo")}) / ${fmt(masa, 2)} = ${fmt(silo.mo, 3)}%\nS = (${linea("s")}) / ${fmt(masa, 2)} = ${fmt(silo.s, 4)}%`
    : "Silo sin masa ni comunes con analisis. Ponderacion en cero.";
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <div class="cloud-modal">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Calculo de ponderacion</div>
          <h2 style="margin:0;color:var(--txt);font-size:20px">${silo.id} · ${silo.clase}</h2>
          <p style="margin:8px 0 0;color:var(--txt2);font-size:12px">Masa actual ${fmt(silo.masa, 2)} t · Nivel ${fmt(silo.nivel, 1)}%</p>
        </div>
        <button type="button" class="icon-btn" id="siloCalcClose">X</button>
      </div>
      <pre style="white-space:pre-wrap;background:#040a14;border:1px solid var(--line);border-radius:6px;padding:12px;color:var(--txt2);font-size:11px">${esc(calc)}</pre>
      <div style="max-height:260px;overflow:auto;margin-top:12px">${comunes.map(c => {
        const cl = clasificar(c);
        return `<div class="card" style="padding:10px;margin-bottom:8px;border-left:3px solid ${cl.color}">
          <div class="mono" style="color:var(--blue-light);font-weight:900">${esc(c.codigo || c.id)} · ${esc(c.fecha || "-")}</div>
          <div style="color:var(--txt2);font-size:10px;margin-top:4px">${esc(c.fuente || "")} · ${fmt(c.masa, 2)} t · Cu ${fmt(c.cu, 3)}% · Mo ${fmt(c.mo, 3)}% · S ${fmt(c.s, 4)}%</div>
        </div>`;
      }).join("") || `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:16px">Sin comunes trazables para este silo.</div>`}</div>
    </div>
  </div>`;
}
/* v19-clean-safe: definición antigua removida: siloManualModalHTML */

/* v19-clean-safe: definición antigua removida: silosHTML */

/* v19-clean-safe: definición antigua removida: bindSilos */


function codigoClaveAnalisis(codigo) {
  const norm = normalizarCodigoAnalisis(codigo);
  const year = norm.match(/-(\d{2})$/)?.[1] || "";
  const body = year ? norm.replace(/-\d{2}$/, "") : norm;
  const nums = [...body.matchAll(/\d+/g)].map(m => String(Number(m[0])));
  const compact = `${body.replace(/\d+/g, m => String(Number(m)))}${year ? `-${year}` : ""}`;
  return { norm, year, nums, serial: nums[nums.length - 1] || "", compact };
}

function normalizarCodigoAnalisis(codigo) {
  const raw = String(codigo || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "")
    .replace(/[–—]/g, "-")
    .replace(/^([A-Z]+)-(?=\d)/, "$1");
  const m = raw.match(/^(.*-\d{2})(?:[-_].*)?$/);
  return m ? m[1] : raw;
}

function tipoAnalisisACP(codigo) {
  const c = normalizarCodigoAnalisis(codigo);
  if (/^OO300-001-\d+-\d{2}$/.test(c)) return "comun_turno";
  if (/^OXMO\d+-\d{2}$/.test(c)) return "lote_oxmo";
  if (/^OXBR\d+-\d{2}$/.test(c)) return "briqueta";
  if (c.includes("OSAC") && /-\d{2}$/.test(c)) return "lote_osac";
  if (/^[A-Z0-9]+(?:-[A-Z0-9]+)*-\d{2}$/.test(c)) return "otro_lote";
  return "";
}

function codigoPartesInventario(codigo) {
  const k = codigoClaveAnalisis(codigo);
  return k.year && k.serial ? { prefix: k.norm.replace(/[\d-]/g, ""), numero: k.serial, year: k.year, nums: k.nums, compact: k.compact } : null;
}

function scoreMatchACP(lote, analisis) {
  // HOTFIX v13: cruce ACP <-> inventario estrictamente exacto.
  // Antes se aceptaba coincidencia por ultimo correlativo + año (ej. 03001-26),
  // lo que podia actualizar un lote de otra familia/codigo. Ahora solo cruza
  // cuando el codigo completo coincide despues de limpiar espacios, mayusculas y guiones.
  const loteCodigo = normalizarCodigoAnalisis(lote?.id);
  const acpCodigo = normalizarCodigoAnalisis(analisis?.codigo);
  if (!loteCodigo || !acpCodigo) return 0;
  return loteCodigo === acpCodigo ? 10 : 0;
}

function analisisACPHTML({ titulo, subtitulo, items, kpis, empty }) {
  const q = String(state.acpSearch || "").trim().toLowerCase();
  const filtered = q
    ? items.filter(a => [a.codigo, a.fecha, a.producto, a.tipoAnalisis, a.clase].join(" ").toLowerCase().includes(q))
    : items;
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900">${titulo}</div>
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:860px;line-height:1.45">${subtitulo}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end">
        <button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button>
        <button class="btn secondary" data-tab="infodia">Importar Infodia</button>
      </div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${kpis.map(([label, value, color]) => miniReport(label, value, color)).join("")}
    </div>
    <div class="card" style="margin-bottom:14px">
      <div class="field" style="margin:0">
        <label>Buscar en cartilla</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input id="acpSearch" value="${state.acpSearch || ""}" dir="ltr" style="direction:ltr;text-align:left" placeholder="Ej: OXMO8635-26, OXBR1305-26, OO300-001-06149-26, 2026-05-16">
          <button class="btn secondary" id="acpSearchBtn" type="button">Buscar</button>
        </div>
      </div>
    </div>
    ${filtered.length ? `<div class="table-wrap">
      <table>
        <thead><tr><th>ID lote</th><th>Tipo</th><th>Producto</th><th>Fecha analisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead>
        <tbody>${filtered.map(a => {
          const c = clasificar(a);
          return `<tr>
            <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo)}</td>
            <td>${a.tipoAnalisis === "briqueta" ? "Briqueta" : a.tipoAnalisis === "comun_turno" ? "Comun turno" : a.tipoAnalisis === "otro_lote" || a.tipoAnalisis === "lote_osac" ? "Otro lote" : "Lote OXMO"}</td>
            <td style="color:var(--txt2)">${esc(a.producto || "-")}</td>
            <td class="mono">${esc(a.fecha || "-")}</td>
            <td class="mono" style="color:${a.cu >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td>
            <td class="mono" style="color:${a.mo >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td>
            <td class="mono" style="color:${a.s < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td>
            <td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span></td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">${empty}</div>`}
  </div>`;
}

function inventarioHTML() {
  const lotes = state.filtro === "Todos" ? lotesRecientes() : lotesRecientes().filter(l => l.estado === state.filtro);
  const selected = new Set(state.inventorySelected || []);
  const editableIds = lotes.filter(canEditLot).map(l => l.id);
  const dist = allSectores().map(s => ({s, v: state.lotes.filter(l => l.sector === s).reduce((a,l) => a + l.masa, 0)}));
  const max = Math.max(1, ...dist.map(d => d.v));
  return `
    <div class="filters">
      ${["Todos","Disponible","Bloqueado","Pendiente","Fuera Esp"].map(f => `<button class="pill ${state.filtro === f ? "active" : ""}" data-filter="${f}">${f} (${f === "Todos" ? state.lotes.length : state.lotes.filter(l => l.estado === f).length})</button>`).join("")}
      ${selected.size ? `<button class="pill" id="deleteSelectedLots" style="border-color:#ff456055;color:var(--red)">Eliminar seleccionados (${selected.size})</button>` : ""}
      <button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th><input id="invSelectAll" type="checkbox" ${editableIds.length && editableIds.every(id => selected.has(id)) ? "checked" : ""}></th>${["ID","Tipo","Masa","Sector","Cu%","Mo%","S%","Clasif.","Estado","Fecha",""].map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${lotes.map(l => rowHTML(l)).join("")}</tbody>
      </table>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Por sector</div>
        ${dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${esc(d.s)}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v/max)*100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v, 1)}</span></div>`).join("")}
      </div>
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Estados</div>
        ${["Disponible","Bloqueado","Pendiente","Fuera Esp"].map(e => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2e4a33"><span style="color:${eColor(e)}">● ${e}</span><span class="mono" style="font-weight:800">${state.lotes.filter(l => l.estado === e).length}</span></div>`).join("")}
      </div>
    </div>
  `;
}

function rowHTML(l) {
  const {clase, color} = clasificar(l);
  const selected = (state.inventorySelected || []).includes(l.id);
  const select = canEditLot(l) ? `<input type="checkbox" data-inv-select="${esc(l.id)}" ${selected ? "checked" : ""}>` : "";
  const labelAction = `<button class="icon-btn" data-label-lot="${esc(l.id)}" title="Imprimir etiqueta">▦</button>`;
  const actions = canEditLot(l)
    ? `<div class="mini-actions">${labelAction}<button class="icon-btn" data-edit="${esc(l.id)}">✏</button><button class="icon-btn" data-del="${esc(l.id)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button></div>`
    : `<div class="mini-actions">${labelAction}</div>`;
  return `<tr>
    <td>${select}</td>
    <td class="mono" style="color:var(--blue-light);font-weight:800">${esc(l.id)}</td>
    <td style="color:var(--txt2)">${esc(l.tipo)}</td>
    <td class="mono">${kgToTon(l.masa, 3)}</td>
    <td><span class="tag" style="color:var(--blue-light);background:#0f3a6e">${esc(l.sector)}</span></td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.cu >= 0.51 ? C.copper : C.green}">${hasAnalysis(l) ? l.cu : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.mo >= moMinimo(l.cu) ? C.green : C.red}">${hasAnalysis(l) ? l.mo : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.s < 0.1 ? C.green : C.red}">${hasAnalysis(l) ? l.s : "—"}</td>
    <td><span class="tag" style="background:${color}22;color:${color};border-color:${color}44">${clase}</span></td>
    <td style="color:${eColor(l.estado)}">● ${esc(l.estado)}</td>
    <td class="mono" style="color:var(--txt3);font-size:10px">${esc(l.fecha)}</td>
    <td>${actions}</td>
  </tr>`;
}

function bindInventario() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    state.filtro = btn.dataset.filter;
    state.inventorySelected = [];
    render();
  }));
  document.querySelector("#newLot")?.addEventListener("click", () => { state.editando = null; state.tab = "registro"; render(); });
  document.querySelector("#invSelectAll")?.addEventListener("change", e => {
    const lotes = state.filtro === "Todos" ? lotesRecientes() : lotesRecientes().filter(l => l.estado === state.filtro);
    state.inventorySelected = e.target.checked ? lotes.filter(canEditLot).map(l => l.id) : [];
    render();
  });
  document.querySelectorAll("[data-inv-select]").forEach(chk => chk.addEventListener("change", e => {
    const id = e.target.dataset.invSelect;
    const set = new Set(state.inventorySelected || []);
    e.target.checked ? set.add(id) : set.delete(id);
    state.inventorySelected = [...set];
    render();
  }));
  document.querySelector("#deleteSelectedLots")?.addEventListener("click", () => {
    const ids = (state.inventorySelected || []).filter(id => canEditLot(state.lotes.find(l => l.id === id)));
    if (!ids.length) return;
    if (!confirm(`¿Eliminar ${ids.length} lote(s) seleccionados? Esta accion no se puede deshacer.`)) return;
    state.lotes = state.lotes.filter(l => !ids.includes(l.id));
    state.inventorySelected = [];
    persistLotes();
    addHist("Lotes eliminados", `${ids.length}`, ids.slice(0, 6).join(", "), C.red);
    render();
  });
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const lote = state.lotes.find(l => l.id === btn.dataset.edit);
    if (!canEditLot(lote)) { alert("No tienes permiso para modificar este lote."); return; }
    state.editando = lote;
    state.tab = "registro";
    render();
  }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
  document.querySelectorAll("[data-label-lot]").forEach(btn => btn.addEventListener("click", () => {
    state.etiquetaSel = [btn.dataset.labelLot];
    printLabels();
  }));
}
/* v19-clean-safe: definición antigua removida: evaluarMezclaObjetivo */

/* v19-clean-safe: definición antigua removida: buscarMejoresMezclas2 */

/* v19-clean-safe: definición antigua removida: mezclaOpcionHTML */


function claveComun(c) {
  return `${normalizarCodigoAnalisis(c.codigo || c.id)}|${c.fecha || ""}|${c.siloId || ""}`;
}

function comunesAsignados() {
  const acp = new Map((state.infodia?.analisis || []).map(a => [normalizarCodigoAnalisis(a.codigo), a]));
  const manuales = new Map((state.comunes || []).filter(c => isValidSiloId(c.siloId)).map(c => [claveComun(c), c]));
  const rows = [];
  const seen = new Set();
  for (const h of state.siloHistorial || []) {
    if (!isValidSiloId(h.siloId)) continue;
    const codigos = Array.isArray(h.comunes) ? h.comunes : [];
    for (const codigo of codigos) {
      const a = acp.get(normalizarCodigoAnalisis(codigo)) || {};
      const base = {
        id: `${normalizarCodigoAnalisis(codigo)}|${h.fecha}|${h.siloId}`,
        codigo,
        fecha: a.fecha || h.fecha || "",
        siloId: h.siloId,
        turno: h.turno || "Dia",
        masa: Number(h.masaLlenado || h.llenado || h.masa || 0),
        cu: Number(a.cu ?? h.cu ?? 0),
        mo: Number(a.mo ?? h.mo ?? 0),
        s: Number(a.s ?? h.s ?? 0),
        fuente: "Infodia/ACP",
      };
      const key = claveComun(base);
      const row = manuales.get(key) ? { ...base, ...manuales.get(key), fuente: "Manual" } : base;
      if (seen.has(key)) continue;
      seen.add(key);
      rows.push(row);
    }
  }
  for (const c of state.comunes || []) {
    const key = claveComun(c);
    if (!isValidSiloId(c.siloId) || seen.has(key)) continue;
    seen.add(key);
    rows.push({ ...c, fuente: c.fuente || "Manual" });
  }
  return rows
    .filter(r => isValidSiloId(r.siloId))
    .sort((a, b) => fechaOrdenMs(b.fecha) - fechaOrdenMs(a.fecha) || String(b.codigo || "").localeCompare(String(a.codigo || "")));
}

function buscarComunPorId(id) {
  return comunesAsignados().find(c => c.id === id || claveComun(c) === id);
}

function siloManualModalHTML(siloId) {
  if (!siloId) return "";
  const edit = state.comunEditId ? buscarComunPorId(state.comunEditId) : null;
  const fechaHoy = new Date().toISOString().slice(0, 10);
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <form class="cloud-modal" id="comunForm">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">${edit ? "Modificar comun de turno" : "Ajuste manual de silo"}</div>
          <h2 style="margin:0;color:var(--txt);font-size:20px">${esc(edit?.siloId || siloId)}</h2>
          <p style="margin:8px 0 0;color:var(--txt2);font-size:12px">Usa este ingreso solo para corregir o cargar un comun puntual. La carga normal viene desde Infodia/ACP.</p>
        </div>
        <button type="button" class="icon-btn" id="siloManualClose">X</button>
      </div>
      <input type="hidden" name="editId" value="${esc(edit ? claveComun(edit) : "")}">
      <div class="form-grid">
        ${inputField("codigo","Codigo comun",edit?.codigo || `MANUAL-${Date.now().toString().slice(-6)}`,"text")}
        ${selectField("siloId","Silo",edit?.siloId || siloId,state.silosBase.map(s => s.id))}
        ${selectField("turno","Turno",edit?.turno || "Dia",["Dia","Noche"])}
        ${inputField("fecha","Fecha",edit?.fecha || fechaHoy,"date")}
        ${inputField("masa","Masa comun (t)",edit?.masa || "50","number","50","0.01")}
        ${inputField("cu","Cu %",edit?.cu ?? "","number","0.49","0.001")}
        ${inputField("mo","Mo %",edit?.mo ?? "","number","57.5","0.001")}
        ${inputField("s","S %",edit?.s ?? "","number","0.08","0.0001")}
      </div>
      <button class="btn" style="width:100%;margin-top:12px">${edit ? "GUARDAR CAMBIOS" : "GUARDAR COMUN"}</button>
    </form>
  </div>`;
}

function silosHTML() {
  const silos = silosPonderados();
  const comunes = comunesAsignados();
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start">
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Silos de almacenamiento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;max-height:640px;overflow:auto;padding-right:4px">${silos.map(s => {
      const color = s.muestras ? s.color : C.txt3;
      const source = s.nivelImportado?.fuente === "infodia"
        ? `${hasAnalysis(s.nivelImportado) ? "Infodia/ACP" : "Infodia nivel"} ${s.nivelImportado.fecha || ""}`
        : s.muestras ? "Manual" : "Sin datos";
      return `<div class="card" style="border-top:3px solid ${color}">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div class="muted-title" style="color:var(--cyan);font-weight:800">${s.id}</div>
          <span class="tag" style="background:${color}22;color:${color};border-color:${color}44">${s.muestras ? s.clase : "Sin comunes"}</span>
        </div>
        <div style="height:118px;width:76px;margin:0 auto 10px;border:1px solid var(--line);background:#2d4a6a33;border-radius:5px;position:relative;overflow:hidden">
          <div style="position:absolute;left:0;right:0;bottom:0;height:${s.nivel}%;background:linear-gradient(180deg,${color}bb,${color}55)"></div>
          <div class="mono" style="position:absolute;inset:0;display:grid;place-items:center;font-weight:900">${s.nivel.toFixed(0)}%</div>
        </div>
        <div class="mono" style="text-align:center;color:${color};font-weight:900">${s.masa.toFixed(1)} / ${s.cap} t</div>
        <div style="text-align:center;color:var(--txt3);font-size:9px;margin-top:4px">${source}${s.nivelImportado?.horaInicio ? ` · ${s.nivelImportado.horaInicio}-${s.nivelImportado.horaTermino}` : ""}</div>
        <div style="text-align:center;color:var(--txt2);font-size:11px;margin-top:3px">Cu: ${s.muestras ? s.cu.toFixed(2) : "-"}% · Mo: ${s.muestras ? s.mo.toFixed(2) : "-"}% · S: ${s.muestras ? s.s.toFixed(3) : "-"}%</div>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap">
          <button class="icon-btn" data-silo-fill="${s.id}">Ajuste manual</button>
          <button class="icon-btn" data-silo-calc="${s.id}">Ver calculo</button>
          <button class="icon-btn" data-silo-clear="${s.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button>
        </div>
      </div>`;
    }).join("")}</div>
    </section>
    <section class="box" style="min-width:0">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px">
        <div class="muted-title" style="color:var(--cyan)">Comunes de turno actualizados</div>
        <span style="color:var(--txt3);font-size:10px">${comunes.length} registros</span>
      </div>
      <div class="notice" style="margin-bottom:12px;border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Listado trazable de comunes asignados a silos. El mas reciente aparece primero.</div>
      <div class="table-wrap" style="max-height:540px;overflow:auto">
        <table>
          <thead><tr><th>Fecha</th><th>Codigo</th><th>Silo</th><th>Masa</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th></th></tr></thead>
          <tbody>${comunes.map(c => {
            const cl = clasificar(c);
            const id = esc(claveComun(c));
            return `<tr>
              <td class="mono">${esc(c.fecha || "-")}</td>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(c.codigo || c.id)}</td>
              <td>${esc(c.siloId)} · ${esc(c.turno || "Dia")}</td>
              <td class="mono">${fmt(c.masa, 2)} t</td>
              <td class="mono">${fmt(c.cu, 3)}</td>
              <td class="mono">${fmt(c.mo, 3)}</td>
              <td class="mono">${fmt(c.s, 4)}</td>
              <td><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span></td>
              <td><div class="mini-actions"><button class="icon-btn" data-silo-calc="${esc(c.siloId)}">Calc</button><button class="icon-btn" data-comun-edit="${id}">Editar</button><button class="icon-btn" data-comun-del="${id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button></div></td>
            </tr>`;
          }).join("") || `<tr><td colspan="9" style="color:var(--txt3);text-align:center;padding:18px">Sin comunes trazables registrados.</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  </div>
  ${siloManualModalHTML(state.siloManualOpen)}
  ${state.siloCalcOpen ? siloCalculoHTML(state.siloCalcOpen) : ""}`;
}

function bindSilos() {
  document.querySelectorAll("[data-silo-fill]").forEach(btn => btn.addEventListener("click", () => {
    state.siloManualOpen = btn.dataset.siloFill;
    state.comunEditId = "";
    render();
  }));
  document.querySelectorAll("[data-comun-edit]").forEach(btn => btn.addEventListener("click", () => {
    const c = buscarComunPorId(btn.dataset.comunEdit);
    state.siloManualOpen = c?.siloId || "Silo 4";
    state.comunEditId = btn.dataset.comunEdit;
    render();
  }));
  document.querySelectorAll("[data-comun-del]").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.comunDel;
    if (!confirm("¿Eliminar este comun de turno del registro de silos?")) return;
    state.comunes = (state.comunes || []).filter(c => claveComun(c) !== id && c.id !== id);
    state.siloHistorial = (state.siloHistorial || []).filter(h => {
      const codigos = Array.isArray(h.comunes) ? h.comunes : [];
      return !codigos.some(codigo => claveComun({ codigo, fecha: h.fecha, siloId: h.siloId }) === id);
    });
    save("oxmo:comunes", state.comunes);
    save("oxmo:siloHistorial", state.siloHistorial);
    addHist("Comun eliminado", id, "Registro de silo ajustado", C.red);
    render();
  }));
  document.querySelectorAll("[data-silo-calc]").forEach(btn => btn.addEventListener("click", () => {
    state.siloCalcOpen = btn.dataset.siloCalc;
    render();
  }));
  document.querySelectorAll("[data-silo-clear]").forEach(btn => btn.addEventListener("click", () => {
    const siloId = btn.dataset.siloClear;
    if (!confirm(`¿Vaciar todos los registros de ${siloId}?`)) return;
    state.comunes = state.comunes.filter(c => c.siloId !== siloId);
    state.siloHistorial = state.siloHistorial.filter(h => h.siloId !== siloId);
    save("oxmo:comunes", state.comunes);
    save("oxmo:siloHistorial", state.siloHistorial);
    addHist("Silo vaciado", siloId, "Comunes eliminados", C.red);
    render();
  }));
  document.querySelector("#siloManualClose")?.addEventListener("click", () => {
    state.siloManualOpen = "";
    state.comunEditId = "";
    render();
  });
  document.querySelector("#siloCalcClose")?.addEventListener("click", () => { state.siloCalcOpen = ""; render(); });
  const form = document.querySelector("#comunForm");
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (data.editId) {
      state.comunes = (state.comunes || []).filter(c => claveComun(c) !== data.editId && c.id !== data.editId);
    }
    if (guardarComunManual(data, "manual-silos")) {
      state.siloManualOpen = "";
      state.comunEditId = "";
      render();
    }
  });
}
/* v19-clean-safe: definición antigua removida: etiquetaFit */

/* v19-clean-safe: definición antigua removida: etiquetaCSS */

/* v19-clean-safe: definición antigua removida: etiquetaLabelHTML */

/* v19-clean-safe: definición antigua removida: etiquetaPublicaHTML */

/* v19-clean-safe: definición antigua removida: printLabels */


function mezclaScoreEstado(st, objetivo) {
  if (!st.sacks) return Infinity;
  const cu = st.cuMass / st.sacks;
  const mo = st.moMass / st.sacks;
  const s = st.sMass / st.sacks;
  const masaKg = st.sacks * 1000;
  const cuBand = Math.max(0.012, Math.abs(objetivo.cu) * 0.035);
  const moBand = 0.10;
  const sBand = Math.max(0.0012, Math.abs(objetivo.s) * 0.20);
  const cuNorm = Math.abs(cu - objetivo.cu) / cuBand;
  const moShort = Math.max(0, objetivo.mo - mo);
  const moNorm = (moShort / moBand) + Math.abs(mo - objetivo.mo) / 6;
  const sOver = Math.max(0, s - objetivo.s);
  const sNorm = (sOver / sBand) + Math.abs(s - objetivo.s) / 0.07;
  const classPenalty = (objetivo.cu > 0.5) === (cu > 0.5) ? 0 : 20;
  const massPenalty = Math.abs(masaKg - objetivo.masa) / 1000 * 7;
  return cuNorm * 22 + moNorm * 10 + sNorm * 15 + classPenalty + massPenalty - st.fueraSacks * 0.08;
}

function estadoAMezcla(st, objetivo) {
  const items = st.items.map(x => ({ lote: x.lote, kg: x.sacks * 1000 }));
  const mix = mezclaDe(items);
  const diffKg = Math.abs(mix.masaKg - objetivo.masa);
  const cuDiff = Math.abs(mix.cu - objetivo.cu);
  const moShort = Math.max(0, objetivo.mo - mix.mo);
  const sOver = Math.max(0, mix.s - objetivo.s);
  const fueraKg = items.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
  const exacta = diffKg < 0.001;
  const cumpleObjetivo = exacta && cuDiff <= 0.035 && moShort <= 0 && sOver <= 0;
  const score = mezclaScoreEstado(st, objetivo);
  mix.ok = cumpleObjetivo;
  return { items, mix, score, chemPenalty: score, diffKg, fueraKg, exacta, cumpleObjetivo, cuDiff, moShort, sOver };
}

function recortarBeam(lista, objetivo, limite = 80) {
  const seen = new Set();
  return lista
    .sort((a, b) => mezclaScoreEstado(a, objetivo) - mezclaScoreEstado(b, objetivo))
    .filter(st => {
      const firma = st.items.map(x => `${x.lote.id}:${x.sacks}`).sort().join("|");
      if (seen.has(firma)) return false;
      seen.add(firma);
      return true;
    })
    .slice(0, limite);
}

function evaluarMezclaObjetivo(items, objetivo, firmas, opciones) {
  if (!items.length || items.some(x => x.kg <= 0)) return;
  const sacks = items.reduce((a, x) => a + Math.round(x.kg / 1000), 0);
  if (!sacks || sacks > 40) return;
  const st = {
    items: items.map(x => ({ lote: x.lote, sacks: Math.round(x.kg / 1000) })),
    sacks,
    cuMass: items.reduce((a, x) => a + Number(x.lote.cu || 0) * Math.round(x.kg / 1000), 0),
    moMass: items.reduce((a, x) => a + Number(x.lote.mo || 0) * Math.round(x.kg / 1000), 0),
    sMass: items.reduce((a, x) => a + Number(x.lote.s || 0) * Math.round(x.kg / 1000), 0),
    fueraSacks: items.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + Math.round(x.kg / 1000), 0),
  };
  const op = estadoAMezcla(st, objetivo);
  const firma = op.items.map(x => `${x.lote.id}:${Math.round(x.kg)}`).sort().join("|");
  if (firmas.has(firma)) return;
  firmas.add(firma);
  opciones.push(op);
}

function buscarMejoresMezclas2() {
  const objetivo = objetivoMezcla();
  const selectedIds = new Set(state.mix.sel || []);
  const inventario = state.lotes
    .filter(l => hasAnalysis(l) && l.estado !== "Pendiente" && Number(l.masa || 0) >= 1000)
    .filter(l => state.mix.sector === "Todos" || l.sector === state.mix.sector)
    .map(l => ({ ...l, sacks: Math.min(40, Math.floor(Number(l.masa || 0) / 1000)) }))
    .filter(l => l.sacks > 0);
  const selected = selectedIds.size ? inventario.filter(l => selectedIds.has(l.id)) : [];
  const targetHigh = objetivo.cu > 0.5;
  const relevancia = l => {
    const clase = clasificar(l).clase;
    return Math.abs(Number(l.cu || 0) - objetivo.cu) * 180
      + Math.max(0, objetivo.mo - Number(l.mo || 0)) * 5
      + Math.max(0, Number(l.s || 0) - objetivo.s) * 450
      + ((Number(l.cu || 0) > 0.5) === targetHigh ? 0 : 12)
      - (clase === "Fuera Esp" ? 3 : 0);
  };
  const pool = [...(selected.length ? selected : inventario)]
    .sort((a, b) => relevancia(a) - relevancia(b))
    .slice(0, selected.length ? 30 : 24);
  const maxSacks = Math.min(40, Math.max(1, Math.round(objetivo.masa / 1000)));
  let beams = Array.from({ length: maxSacks + 1 }, () => []);
  beams[0] = [{ items: [], sacks: 0, cuMass: 0, moMass: 0, sMass: 0, fueraSacks: 0 }];

  for (const lote of pool) {
    const next = beams.map(arr => arr.slice());
    for (let used = 0; used <= maxSacks; used++) {
      for (const st of beams[used]) {
        const maxAdd = Math.min(lote.sacks, maxSacks - used);
        for (let q = 1; q <= maxAdd; q++) {
          const ns = used + q;
          next[ns].push({
            items: [...st.items, { lote, sacks: q }],
            sacks: ns,
            cuMass: st.cuMass + Number(lote.cu || 0) * q,
            moMass: st.moMass + Number(lote.mo || 0) * q,
            sMass: st.sMass + Number(lote.s || 0) * q,
            fueraSacks: st.fueraSacks + (clasificar(lote).clase === "Fuera Esp" ? q : 0),
          });
        }
      }
    }
    beams = next.map(arr => recortarBeam(arr, objetivo, 90));
  }

  const ordenMasas = [maxSacks];
  for (let d = 1; d <= 5; d++) {
    if (maxSacks - d >= 1) ordenMasas.push(maxSacks - d);
    if (maxSacks + d <= beams.length - 1) ordenMasas.push(maxSacks + d);
  }
  const opciones = ordenMasas.flatMap(s => beams[s] || []).map(st => estadoAMezcla(st, objetivo));
  const exactas = opciones.filter(o => o.exacta);
  const base = exactas.length ? exactas : opciones;
  const seen = new Set();
  return base
    .sort((a, b) =>
      a.cuDiff - b.cuDiff ||
      a.moShort - b.moShort ||
      a.sOver - b.sOver ||
      a.diffKg - b.diffKg ||
      a.score - b.score ||
      b.fueraKg - a.fueraKg
    )
    .filter(o => {
      const firma = o.items.map(x => `${x.lote.id}:${Math.round(x.kg)}`).sort().join("|");
      if (seen.has(firma)) return false;
      seen.add(firma);
      return true;
    })
    .slice(0, 10);
}

function mezclaOpcionHTML(op, idx) {
  const color = C.green;
  const estado = op.cumpleObjetivo ? "CUMPLE" : (op.exacta ? "MAS CERCANA" : `APROX. ${(op.diffKg / 1000).toFixed(1)} t`);
  const masaInfo = op.exacta
    ? `Masa exacta: ${(op.mix.masaKg / 1000).toFixed(2)} t`
    : `Masa aproximada: ${(op.mix.masaKg / 1000).toFixed(2)} t - diferencia ${(op.diffKg / 1000).toFixed(2)} t`;
  return `<div class="card" style="border-left:4px solid ${color};margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div>
        <b style="color:${color}">Opcion ${idx + 1} - ${op.mix.clase}</b>
        <div style="color:var(--txt2);font-size:10px">${masaInfo}</div>
        <div style="color:var(--txt2);font-size:10px">Diferencia Cu: ${op.cuDiff.toFixed(3)} · Fuera de especificacion usado: ${(op.fueraKg / 1000).toFixed(2)} t</div>
      </div>
      <div class="mono" style="font-weight:900;color:${op.cumpleObjetivo ? C.green : C.yellow}">${estado}</div>
    </div>
    ${mezclaDetalleHTML(op)}
  </div>`;
}

// --- Estabilizacion final: nube, ACP, usuarios, mayusculas y Zebra 2026-06-14 ---
const FINAL_CACHE_TAG = "20260626-qr-arriba";

function acpNumeroFinal(codigo) {
  const clean = normalizarCodigoAnalisis(String(codigo || "")).toUpperCase();
  const nums = clean.match(/\d+/g) || [];
  if (!nums.length) return 0;
  const usable = nums.length > 1 && String(nums[nums.length - 1]).length === 2 ? nums.slice(0, -1) : nums;
  return Number(usable[usable.length - 1] || 0) || 0;
}

function acpFechaFinal(item) {
  return fechaOrdenMs(item?.fecha || item?.fechaAnalisis || item?.fechaMuestra || "") || 0;
}

function sortAcpFinal(a, b) {
  return acpFechaFinal(b) - acpFechaFinal(a)
    || acpNumeroFinal(b?.codigo || b?.id) - acpNumeroFinal(a?.codigo || a?.id)
    || String(b?.codigo || b?.id || "").localeCompare(String(a?.codigo || a?.id || ""));
}

function normalizarAcpFinal(item) {
  const codigo = normalizarCodigoAnalisis(String(item?.codigo || item?.id || "")).toUpperCase();
  return {
    ...item,
    codigo,
    tipoAnalisis: item?.tipoAnalisis || tipoAnalisisACP(codigo),
    cu: Number(item?.cu || 0),
    mo: Number(item?.mo || 0),
    s: Number(item?.s || 0),
  };
}

function uniqueUltimoFinal(items, keyFn) {
  const map = new Map();
  for (const item of items || []) {
    const key = keyFn(item);
    if (key) map.set(key, item);
  }
  return [...map.values()];
}

function compactInfodiaFinal(info) {
  if (!info) return null;
  const days = uniqueUltimoFinal(info.days || [], d => d.fecha)
    .sort((a, b) => fechaOrdenMs(a.fecha) - fechaOrdenMs(b.fecha))
    .slice(-180);
  const analisisACP = uniqueUltimoFinal((info.analisisACP || []).map(normalizarAcpFinal).filter(a => a.codigo), a =>
    `${a.codigo}|${a.fecha || ""}|${a.tipoAnalisis || ""}`
  ).sort(sortAcpFinal).slice(0, 7000);
  const analisis = analisisACP.filter(a => a.tipoAnalisis === "comun_turno").sort(sortAcpFinal).slice(0, 3000);
  const analisisLotes = analisisACP.filter(a => a.tipoAnalisis !== "comun_turno").sort(sortAcpFinal).slice(0, 4500);
  const siloHistorial = (info.siloHistorial || [])
    .filter(h => isValidSiloId(h.siloId))
    .sort((a, b) => fechaOrdenMs(b.fecha) - fechaOrdenMs(a.fecha))
    .slice(0, 2500);
  const totals = recalcularTotalesInfodia(days);
  const simWindow = selectSiloSimulationDays(days);
  return { ...info, days, analisisACP, analisis, analisisLotes, siloHistorial, totals, simWindow };
}

function fusionarInfodia(prev, next) {
  const p = compactInfodiaFinal(prev) || {};
  const n = compactInfodiaFinal(next) || {};
  return compactInfodiaFinal({
    ...p,
    ...n,
    days: [...(p.days || []), ...(n.days || [])],
    analisisACP: [...(p.analisisACP || []), ...(n.analisisACP || [])],
    analisis: [...(p.analisis || []), ...(n.analisis || [])],
    analisisLotes: [...(p.analisisLotes || []), ...(n.analisisLotes || [])],
    siloHistorial: [...(p.siloHistorial || []), ...(n.siloHistorial || [])],
  });
}

function prepararValorNubeFinal(key, value) {
  if (key === "oxmo:lotes") {
    return (value || [])
      .filter(l => !isInfodiaProductionLote(l))
      .map(l => ({ ...l, id: String(l.id || "").trim().toUpperCase() }))
      .filter(l => l.id && l.id !== "L-NAN");
  }
  if (key === "oxmo:siloNiveles") return cleanSiloNiveles(value || {});
  if (key === "oxmo:siloHistorial") return (value || []).filter(h => isValidSiloId(h.siloId));
  if (key === "oxmo:infodia") return compactInfodiaFinal(value);
  if (key === "oxmo:usuarios") return (value || []).map(normalizarUsuario);
  if (key === "oxmo:comunes") {
    return uniqueUltimoFinal((value || []).filter(c => isValidSiloId(c.siloId)), c => claveComun(c))
      .sort((a, b) => fechaOrdenMs(b.fecha) - fechaOrdenMs(a.fecha) || String(b.codigo || "").localeCompare(String(a.codigo || "")));
  }
  return value;
}

async function cloudSave(key, value) {
  if (!cloud.client) return;
  try {
    const clean = prepararValorNubeFinal(key, value);
    const { error } = await cloud.client
      .from("oxmo_state")
      .upsert({ key, value: clean, updated_at: new Date().toISOString() });
    if (error) throw error;
    cloud.status = "sincronizado";
    cloud.lastError = "";
  } catch (e) {
    cloud.status = "error nube";
    cloud.lastError = e?.message || String(e);
    console.error("Cloud save error", e);
  }
}

function applyCloudValue(key, value) {
  cloud.applying = true;
  try {
    let nextValue = prepararValorNubeFinal(key, value);
    if (key === "oxmo:infodia") nextValue = fusionarInfodia(state.infodia, nextValue);
    if (key === "oxmo:comunes") nextValue = prepararValorNubeFinal(key, [...(state.comunes || []), ...(nextValue || [])]);

    localStorage.setItem(key, JSON.stringify(nextValue));
    if (key === "oxmo:lotes") state.lotes = nextValue || [];
    if (key === "oxmo:hist") state.historial = nextValue || [];
    if (key === "oxmo:sectores") state.sectores = nextValue || DEFAULT_SECTORES;
    if (key === "oxmo:silos") state.silosBase = nextValue || DEFAULT_SILOS;
    if (key === "oxmo:comunes") state.comunes = nextValue || [];
    if (key === "oxmo:siloNiveles") state.siloNiveles = cleanSiloNiveles(nextValue || {});
    if (key === "oxmo:siloHistorial") state.siloHistorial = nextValue || [];
    if (key === "oxmo:usuarios") state.usuarios = (nextValue || DEFAULT_USUARIOS).map(normalizarUsuario);
    if (key === "oxmo:userStats") state.userStats = nextValue || {};
    if (key === "oxmo:avisos") state.avisos = nextValue || [];
    if (key === "oxmo:infodia") {
      state.infodia = nextValue || null;
      const acp = actualizarInventarioConACP((state.lotes || []).filter(l => !isInfodiaProductionLote(l)), state.infodia?.analisisACP || []);
      state.lotes = prepararValorNubeFinal("oxmo:lotes", acp.lotes);
      localStorage.setItem("oxmo:lotes", JSON.stringify(state.lotes));
    }
  } catch (e) {
    cloud.status = "error nube";
    cloud.lastError = e?.message || String(e);
    console.error("Cloud apply error", e);
  } finally {
    cloud.applying = false;
  }
}

async function resyncCloudSnapshotFinal() {
  if (!cloud.ready || !cloud.client) return;
  for (const key of SHARED_KEYS) {
    const local = load(key, sharedFallback(key));
    await cloudSave(key, local);
  }
}

function debeMayusculaFinal(el) {
  if (!el || !["INPUT", "TEXTAREA"].includes(el.tagName)) return false;
  const type = String(el.type || "").toLowerCase();
  if (["password", "number", "date", "time", "file", "email", "url", "search"].includes(type)) return false;
  if (el.dataset.keepCase === "true") return false;

  // No forzar mayúsculas en administración de usuarios ni en Mi perfil.
  // Antes estos campos se transformaban automáticamente a MAYÚSCULAS al escribir,
  // lo que bloqueaba el uso normal de nombres, cargos, direcciones, correos, etc.
  const ctx = `${el.name || ""} ${el.id || ""} ${el.placeholder || ""} ${Object.keys(el.dataset || {}).join(" ")}`.toLowerCase();
  if (/(user|usuario|nombre|cargo|area|área|turno|telefono|teléfono|correo|email|direccion|dirección|contacto|emerg|relacion|relación|observacion|observación|perfil|clave|password|contrasena|contraseña|supabase|url|key|anon|fecha|hora|qr|link)/.test(ctx)) return false;

  return true;
}

function aplicarMayusculasFinal(root = document) {
  root.querySelectorAll("input,textarea").forEach(el => {
    if (!debeMayusculaFinal(el) || el.dataset.upperBound === "true") return;
    el.dataset.upperBound = "true";
    el.style.textTransform = "uppercase";
    el.addEventListener("input", () => {
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const next = String(el.value || "").toUpperCase();
      if (el.value !== next) {
        el.value = next;
        try { el.setSelectionRange(start, end); } catch {}
      }
    });
  });
}

function passwordUsuarioModalHTML() {
  if (!state.selfPassOpen || !state.user) return "";
  return `<div class="modal-backdrop" data-self-pass-modal>
    <div class="modal-card" style="max-width:460px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div class="section-title">MI CLAVE</div><h2 style="margin:4px 0 0">Cambiar contraseña</h2></div>
        <button class="btn ghost" data-self-pass-close>Salir</button>
      </div>
      <div class="alert info">Si pierdes la clave, contacta al Administrador para reiniciarla.</div>
      <label>Clave actual</label><input data-keep-case="true" data-self-pass-old type="text" class="input" value="" autocomplete="off">
      <label>Nueva clave visible</label><input data-keep-case="true" data-self-pass-new type="text" class="input" value="" autocomplete="off">
      <label>Repetir nueva clave</label><input data-keep-case="true" data-self-pass-repeat type="text" class="input" value="" autocomplete="off">
      <button class="btn primary" data-self-pass-save style="width:100%;margin-top:12px">Guardar nueva clave</button>
    </div>
  </div>`;
}

function insertarBotonClavePropiaFinal() {
  const logout = [...document.querySelectorAll("button")].find(b => b.textContent.trim().toUpperCase() === "SALIR");
  if (!logout || document.querySelector("[data-self-pass-open]")) return;
  const btn = document.createElement("button");
  btn.textContent = "MI CLAVE";
  btn.dataset.selfPassOpen = "true";
  btn.className = logout.className || "";
  btn.style.cssText = "background:#0f3a6e;border:1px solid #1e6fd966;color:#9cc7ff;padding:10px 16px;border-radius:7px;cursor:pointer;font-weight:900;letter-spacing:1px";
  logout.parentElement?.insertBefore(btn, logout);
}

function bindSelfPasswordFinal() {
  insertarBotonClavePropiaFinal();
  document.querySelector("[data-self-pass-open]")?.addEventListener("click", () => { state.selfPassOpen = true; render(); });
  if (state.selfPassOpen && !document.querySelector("[data-self-pass-modal]")) {
    document.body.insertAdjacentHTML("beforeend", passwordUsuarioModalHTML());
  }
  document.querySelectorAll("[data-self-pass-close]").forEach(btn => btn.addEventListener("click", () => { state.selfPassOpen = false; render(); }));
  document.querySelector("[data-self-pass-save]")?.addEventListener("click", () => {
    const oldPass = document.querySelector("[data-self-pass-old]")?.value || "";
    const newPass = document.querySelector("[data-self-pass-new]")?.value || "";
    const repeat = document.querySelector("[data-self-pass-repeat]")?.value || "";
    if (oldPass !== state.user.p) return alert("La clave actual no coincide.");
    if (!newPass || newPass !== repeat) return alert("La nueva clave debe coincidir en ambos campos.");
    state.usuarios = state.usuarios.map(u => u.u === state.user.u ? { ...u, p: newPass } : u);
    state.user = { ...state.user, p: newPass };
    saveUsuarios();
    save("oxmo:user", state.user);
    addHist("Usuario cambio su clave", state.user.u, "", C.cyan);
    state.selfPassOpen = false;
    render();
  });
}

function adminUserModalHTML() {
  const user = state.usuarios.find(u => u.u === state.adminEditUser);
  if (!user) return "";
  const stat = state.userStats[user.u] || {};
  const roles = ROLES_USUARIO.map(r => `<option ${user.rol === r ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<div class="modal-backdrop" data-admin-user-modal>
    <div class="modal-card" style="max-width:720px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div class="section-title">USUARIO</div><h2 style="margin:4px 0 0">${esc(user.nombre)}</h2></div>
        <button class="btn ghost" data-admin-edit-close>Cerrar</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${user.u === "admin" ? "readonly" : ""}></div>
        <div><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div>
        <div><label>Nueva contraseña (opcional)</label><input class="input" data-keep-case="true" data-admin-edit-pass type="password" value="" placeholder="Dejar en blanco para mantener"></div>
        <div><label>Rol</label><select class="input" data-admin-edit-rol>${roles}</select></div>
        <div><label>Estado</label><select class="input" data-admin-edit-activo ${user.u === "admin" ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div>
        <div><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div>
        <div><label>Ultimo uso</label><input class="input" readonly value="${esc(stat.lastSeen || "-")}"></div>
        <div><label>Tiempo de uso</label><input class="input" readonly value="${esc(formatDuration(tiempoUsuarioMs(user.u)))}"></div>
      </div>
      <div class="card" style="margin-top:12px">
        <div class="section-title">Actividad reciente</div>
        ${(stat.recientes || []).slice(0, 5).map(r => `<div style="padding:5px 0;border-bottom:1px solid var(--border);color:var(--txt2)">${esc(r.fecha)} ${esc(r.tiempo)} · ${esc(r.accion)} ${r.loteId ? "· " + esc(r.loteId) : ""}</div>`).join("") || `<div style="color:var(--txt3)">Sin actividad registrada.</div>`}
      </div>
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div>
  </div>`;
}

function adminUsersHTML(rows) {
  const roleOptions = ROLES_USUARIO.map(r => `<option>${esc(r)}</option>`).join("");
  return `
    <div style="display:grid;grid-template-columns:minmax(300px,420px) 1fr;gap:16px;align-items:start">
      <div class="card">
        <div class="section-title">Crear cuenta</div>
        <label>Usuario</label><input id="newUserU" class="input" data-keep-case="true" placeholder="ej: turno_a">
        <label>Nombre</label><input id="newUserNombre" class="input" data-keep-case="true" placeholder="Nombre visible">
        <label>Contraseña inicial</label><input id="newUserPass" data-keep-case="true" type="password" class="input" placeholder="Contraseña inicial">
        <label>Rol</label><select id="newUserRol" class="input">${roleOptions}</select>
        <button class="btn primary" id="crearUsuario" style="width:100%;margin-top:12px">Crear usuario</button>
      </div>
      <div class="card">
        <div class="section-title">Cuentas creadas — ${rows.length}</div>
        <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Ultimo uso</th><th>Control</th></tr></thead><tbody>
          ${rows.map(u => {
            const stat = state.userStats[u.u] || {};
            return `<tr>
              <td class="mono">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Deshabilitado"}</td>
              <td>${esc(u.creado || "-")}</td>
              <td>${esc(stat.lastSeen || "-")}</td>
              <td>
                <button class="btn small" data-admin-edit="${esc(u.u)}">Editar</button>
                ${u.u !== "admin" ? `<button class="btn small" data-admin-toggle="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button><button class="btn small danger" data-admin-del="${esc(u.u)}">Eliminar</button>` : ""}
              </td>
            </tr>`;
          }).join("")}
        </tbody></table></div>
      </div>
    </div>
    ${adminUserModalHTML()}
  `;
}

function bindAdmin() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    state.adminView = btn.dataset.adminView;
    render();
  }));
  document.querySelector("#crearUsuario")?.addEventListener("click", () => {
    const u = (document.querySelector("#newUserU")?.value || "").trim().toLowerCase();
    const nombre = (document.querySelector("#newUserNombre")?.value || "").trim();
    const p = document.querySelector("#newUserPass")?.value || "";
    const rol = document.querySelector("#newUserRol")?.value || "Operador";
    if (!u || !nombre || !p) return alert("Completa usuario, nombre y contraseña.");
    if (state.usuarios.some(x => x.u === u)) return alert("Ese usuario ya existe.");
    state.usuarios.push(normalizarUsuario({ u, nombre, p, rol, creado: hoy(), activo: true }));
    ensureUserStat(u);
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario creado", u, rol, C.green);
    render();
  });
  document.querySelectorAll("[data-admin-edit]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = btn.dataset.adminEdit;
    render();
  }));
  document.querySelectorAll("[data-admin-edit-close]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = "";
    render();
  }));
  document.querySelector("[data-admin-edit-save]")?.addEventListener("click", () => {
    const oldU = state.adminEditUser;
    const old = state.usuarios.find(u => u.u === oldU);
    if (!old) return;
    const nextU = old.u === "admin" ? "admin" : (document.querySelector("[data-admin-edit-u]")?.value || "").trim().toLowerCase();
    const nombre = (document.querySelector("[data-admin-edit-nombre]")?.value || "").trim();
    const p = document.querySelector("[data-admin-edit-pass]")?.value || "";
    const rol = document.querySelector("[data-admin-edit-rol]")?.value || "Operador";
    const activo = old.u === "admin" ? true : document.querySelector("[data-admin-edit-activo]")?.value !== "false";
    if (!nextU || !nombre || !p) return alert("Completa todos los datos del usuario.");
    if (nextU !== oldU && state.usuarios.some(u => u.u === nextU)) return alert("Ese usuario ya existe.");
    state.usuarios = state.usuarios.map(u => u.u === oldU ? normalizarUsuario({ ...u, u: nextU, nombre, p, rol, activo }) : u);
    if (nextU !== oldU && state.userStats[oldU]) {
      state.userStats[nextU] = state.userStats[oldU];
      delete state.userStats[oldU];
    }
    if (state.user?.u === oldU) {
      state.user = state.usuarios.find(u => u.u === nextU);
      save("oxmo:user", state.user);
    }
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario modificado", nextU, rol, C.cyan);
    state.adminEditUser = "";
    render();
  });
  document.querySelectorAll("[data-admin-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminToggle;
    state.usuarios = state.usuarios.map(x => x.u === u ? { ...x, activo: x.activo === false } : x);
    saveUsuarios();
    addHist("Estado de usuario modificado", u, "", C.yellow);
    render();
  }));
  document.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminDel;
    if (!confirm(`Eliminar cuenta ${u}?`)) return;
    state.usuarios = state.usuarios.filter(x => x.u !== u);
    delete state.userStats[u];
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario eliminado", u, "", C.red);
    render();
  }));
}
/* v19-clean-safe: definición antigua removida: etiquetaFit */

/* v19-clean-safe: definición antigua removida: etiquetaCSS */


const renderBaseFinal = render;
render = function() {
  renderBaseFinal();
  aplicarMayusculasFinal(document);
  bindSelfPasswordFinal();
};

/* =========================================================
   MEJORA USUARIOS / PERFIL - v20260626
   - Admin edita usuarios desde modal (sin prompt)
   - Cada usuario puede completar datos de contacto/perfil
   ========================================================= */
const PERFIL_CAMPOS_USUARIO = {
  cargo: "",
  area: "",
  turno: "",
  telefono: "",
  correo: "",
  direccion: "",
  contactoEmergenciaNombre: "",
  contactoEmergenciaRelacion: "",
  contactoEmergenciaTelefono: "",
  observacionesContacto: "",
};

const normalizarUsuarioAnteriorPerfil = normalizarUsuario;
normalizarUsuario = function(u) {
  const base = normalizarUsuarioAnteriorPerfil(u || {});
  return {
    ...PERFIL_CAMPOS_USUARIO,
    ...base,
    cargo: String(u?.cargo ?? base.cargo ?? ""),
    area: String(u?.area ?? base.area ?? ""),
    turno: String(u?.turno ?? base.turno ?? ""),
    telefono: String(u?.telefono ?? base.telefono ?? ""),
    correo: String(u?.correo ?? base.correo ?? ""),
    direccion: String(u?.direccion ?? base.direccion ?? ""),
    contactoEmergenciaNombre: String(u?.contactoEmergenciaNombre ?? base.contactoEmergenciaNombre ?? ""),
    contactoEmergenciaRelacion: String(u?.contactoEmergenciaRelacion ?? base.contactoEmergenciaRelacion ?? ""),
    contactoEmergenciaTelefono: String(u?.contactoEmergenciaTelefono ?? base.contactoEmergenciaTelefono ?? ""),
    observacionesContacto: String(u?.observacionesContacto ?? base.observacionesContacto ?? ""),
  };
};

state.usuarios = (state.usuarios || []).map(normalizarUsuario);
if (state.user) state.user = normalizarUsuario(state.user);

const canViewTabAnteriorPerfil = canViewTab;
canViewTab = function(id, user = state.user) {
  if (id === "perfil") return !!user;
  return canViewTabAnteriorPerfil(id, user);
};

const visibleTabsAnteriorPerfil = visibleTabs;
visibleTabs = function() {
  const tabs = visibleTabsAnteriorPerfil().filter(([id]) => id !== "perfil");
  const adminIndex = tabs.findIndex(([id]) => id === "admin");
  const perfilTab = ["perfil", "Mi perfil"];
  if (adminIndex >= 0) tabs.splice(adminIndex, 0, perfilTab);
  else tabs.push(perfilTab);
  return tabs;
};

const tabHTMLAnteriorPerfil = tabHTML;
tabHTML = function() {
  if (state.tab === "perfil") return perfilUsuarioHTML();
  return tabHTMLAnteriorPerfil();
};

const bindTabAnteriorPerfil = bindTab;
bindTab = function() {
  bindTabAnteriorPerfil();
  if (state.tab === "perfil") bindPerfilUsuario();
};

function valorPerfil(u, key) {
  return esc(u?.[key] || "");
}

function perfilUsuarioHTML() {
  const u = normalizarUsuario(state.usuarios.find(x => x.u === state.user?.u) || state.user || {});
  return `
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="section-title">Mi perfil</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">${esc(u.nombre)}</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Completa tus datos de contacto. Esta información queda disponible para el administrador.</div>
        </div>
        <span class="tag" style="color:${C.cyan};background:#00d4ff22;border-color:#00d4ff55">${esc(u.rol)}</span>
      </div>
      <form id="perfilUsuarioForm" class="profile-form">
        <div class="profile-grid">
          <div class="field"><label>Usuario</label><input class="input" readonly value="${esc(u.u)}"></div>
          <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" name="nombre" value="${esc(u.nombre)}"></div>
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" name="cargo" value="${valorPerfil(u, "cargo")}" placeholder="Ej: OPERADOR ENVASE"></div>
          <div class="field"><label>Área</label><input class="input" data-keep-case="true" name="area" value="${valorPerfil(u, "area")}" placeholder="Ej: ENVASE Y LOGÍSTICA"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" name="turno" value="${valorPerfil(u, "turno")}" placeholder="Ej: TURNO A / 7x7"></div>
          <div class="field"><label>Teléfono personal</label><input class="input" data-keep-case="true" name="telefono" value="${valorPerfil(u, "telefono")}" placeholder="+56 9 ...."></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" name="correo" value="${valorPerfil(u, "correo")}" placeholder="correo@empresa.cl"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" name="direccion" value="${valorPerfil(u, "direccion")}" placeholder="Dirección de contacto"></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="section-title" style="margin-bottom:10px;color:${C.red}">Contacto de emergencia</div>
          <div class="profile-grid">
            <div class="field"><label>Nombre contacto</label><input class="input" data-keep-case="true" name="contactoEmergenciaNombre" value="${valorPerfil(u, "contactoEmergenciaNombre")}" placeholder="Nombre y apellido"></div>
            <div class="field"><label>Relación</label><input class="input" data-keep-case="true" name="contactoEmergenciaRelacion" value="${valorPerfil(u, "contactoEmergenciaRelacion")}" placeholder="Ej: MADRE / PAREJA / HERMANO"></div>
            <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" name="contactoEmergenciaTelefono" value="${valorPerfil(u, "contactoEmergenciaTelefono")}" placeholder="+56 9 ...."></div>
            <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" name="observacionesContacto" rows="3" placeholder="Alergias, restricciones o notas relevantes">${valorPerfil(u, "observacionesContacto")}</textarea></div>
          </div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:14px">Guardar mi perfil</button>
      </form>
    </div>
  `;
}

function actualizarUsuarioPorKey(userKeyObjetivo, patch) {
  const old = state.usuarios.find(u => u.u === userKeyObjetivo);
  if (!old) return null;
  const next = normalizarUsuario({ ...old, ...patch });
  state.usuarios = state.usuarios.map(u => u.u === userKeyObjetivo ? next : u);
  if (state.user?.u === userKeyObjetivo) {
    state.user = next;
    save("oxmo:user", state.user);
  }
  saveUsuarios();
  return next;
}

function bindPerfilUsuario() {
  const form = document.querySelector("#perfilUsuarioForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const next = actualizarUsuarioPorKey(state.user.u, data);
    if (!next) return alert("No se pudo actualizar el perfil.");
    addHist("Perfil actualizado", next.u, "Datos de contacto actualizados", C.cyan);
    alert("Perfil guardado correctamente.");
    render();
  });
}

function usuarioContactoResumen(u) {
  const partes = [u.cargo, u.area, u.turno, u.telefono].filter(Boolean);
  return partes.length ? esc(partes.join(" · ")) : '<span style="color:var(--txt3)">Sin datos</span>';
}
/* v19-clean-safe: definición antigua removida: areaTrabajoDefault */

/* v19-clean-safe: definición antigua removida: areaTrabajoUsuario */

/* v19-clean-safe: definición antigua removida: areaTrabajoCatalogo */

/* v19-clean-safe: definición antigua removida: areaTrabajoOptionsHTML */

/* v19-clean-safe: definición antigua removida: areaTrabajoEsGlobal */

/* v19-clean-safe: definición antigua removida: areaTrabajoLote */

/* v19-clean-safe: definición antigua removida: lotesPorAreaTrabajo */


adminUserModalHTML = function() {
  const user = normalizarUsuario(state.usuarios.find(u => u.u === state.adminEditUser));
  if (!user?.u) return "";
  const stat = state.userStats[user.u] || {};
  const roles = ROLES_USUARIO.map(r => `<option ${user.rol === r ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<div class="modal-backdrop" data-admin-user-modal>
    <div class="modal-card user-modal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <div>
          <div class="section-title">Editar usuario</div>
          <h2 style="margin:4px 0 0">${esc(user.nombre)}</h2>
          <div style="color:var(--txt2);font-size:12px;margin-top:4px">Modifica cuenta, rol, contraseña y datos de contacto desde esta ventana.</div>
        </div>
        <button class="btn ghost" data-admin-edit-close>Cerrar</button>
      </div>

      <div class="profile-grid">
        <div class="field"><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${user.u === "admin" ? "readonly" : ""}></div>
        <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div>
        <div class="field"><label>Nueva contraseña (opcional)</label><input class="input" data-keep-case="true" data-admin-edit-pass type="password" value="" placeholder="Dejar en blanco para mantener"></div>
        <div class="field"><label>Rol</label><select class="input" data-admin-edit-rol>${roles}</select></div>
        <div class="field"><label>Estado</label><select class="input" data-admin-edit-activo ${user.u === "admin" ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div>
        <div class="field"><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px">Datos laborales y contacto</div>
        <div class="profile-grid">
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" data-admin-edit-cargo value="${valorPerfil(user, "cargo")}"></div>
          <div class="field"><label>Área / célula</label><input class="input" data-keep-case="true" data-admin-edit-area value="${valorPerfil(user, "area")}" placeholder="Ej: Envase A, Planta Envase, Logística"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" data-admin-edit-turno value="${valorPerfil(user, "turno")}"></div>
          <div class="field"><label>Teléfono</label><input class="input" data-keep-case="true" data-admin-edit-telefono value="${valorPerfil(user, "telefono")}"></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" data-admin-edit-correo value="${valorPerfil(user, "correo")}"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" data-admin-edit-direccion value="${valorPerfil(user, "direccion")}"></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px;color:${C.red}">Emergencia</div>
        <div class="profile-grid">
          <div class="field"><label>Contacto emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-nombre value="${valorPerfil(user, "contactoEmergenciaNombre")}"></div>
          <div class="field"><label>Relación</label><input class="input" data-keep-case="true" data-admin-edit-emerg-relacion value="${valorPerfil(user, "contactoEmergenciaRelacion")}"></div>
          <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-telefono value="${valorPerfil(user, "contactoEmergenciaTelefono")}"></div>
          <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" data-admin-edit-observaciones rows="3">${valorPerfil(user, "observacionesContacto")}</textarea></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title">Uso del sistema</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--txt2);font-size:12px;margin-top:8px">
          <div>Último uso: <b>${esc(stat.lastSeen || "-")}</b></div>
          <div>Tiempo de uso: <b>${esc(formatDuration(tiempoUsuarioMs(user.u)))}</b></div>
        </div>
      </div>
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div>
  </div>`;
};

adminUsersHTML = function(rows) {
  const usuarios = rows.map(r => normalizarUsuario(r.u || r));
  const roleOptions = ROLES_USUARIO.map(r => `<option>${esc(r)}</option>`).join("");
  return `
    <div style="display:grid;grid-template-columns:minmax(300px,420px) 1fr;gap:16px;align-items:start">
      <div class="card">
        <div class="section-title">Crear cuenta</div>
        <div class="field"><label>Usuario</label><input id="newUserU" class="input" data-keep-case="true" placeholder="ej: turno_a"></div>
        <div class="field"><label>Nombre</label><input id="newUserNombre" class="input" data-keep-case="true" placeholder="Nombre visible"></div>
        <div class="field"><label>Contraseña inicial</label><input id="newUserPass" data-keep-case="true" type="password" class="input" placeholder="Contraseña inicial"></div>
        <div class="field"><label>Rol</label><select id="newUserRol" class="input">${roleOptions}</select></div>
        <div class="field"><label>Cargo</label><input id="newUserCargo" class="input" data-keep-case="true" placeholder="Opcional"></div>
        <div class="field"><label>Área / célula</label><select id="newUserArea" class="input" data-keep-case="true">${areaTrabajoOptionsHTML()}</select></div>
        <div class="field" id="newUserAreaAddWrap" style="display:none"><label>Nueva área / célula</label><input id="newUserAreaAdd" class="input" data-keep-case="true" placeholder="Ej: Envase A, Centro Norte, Bodega 2"></div>
        <button class="btn primary" id="crearUsuario" style="width:100%;margin-top:4px">Crear usuario</button>
      </div>
      <div class="card">
        <div class="section-title">Cuentas creadas — ${usuarios.length}</div>
        <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Contacto</th><th>Estado</th><th>Último uso</th><th>Control</th></tr></thead><tbody>
          ${usuarios.map(u => {
            const stat = state.userStats[u.u] || {};
            return `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td style="color:var(--txt2);font-size:11px">${usuarioContactoResumen(u)}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Deshabilitado"}</td>
              <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">
                <button class="icon-btn" data-admin-edit="${esc(u.u)}">Editar</button>
                ${u.u !== "admin" && u.u !== userKey() ? `<button class="icon-btn" data-admin-toggle="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button><button class="icon-btn" data-admin-del="${esc(u.u)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}
              </div></td>
            </tr>`;
          }).join("")}
        </tbody></table></div>
      </div>
    </div>
    ${adminUserModalHTML()}
  `;
};

bindAdmin = function() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    state.adminView = btn.dataset.adminView;
    render();
  }));
  const areaSelCrear = document.querySelector("#newUserArea");
  const areaWrapCrear = document.querySelector("#newUserAreaAddWrap");
  if (areaSelCrear && areaWrapCrear) {
    const toggleArea = () => { areaWrapCrear.style.display = areaSelCrear.value === "__add__" ? "block" : "none"; };
    areaSelCrear.addEventListener("change", toggleArea);
    toggleArea();
  }
  document.querySelector("#crearUsuario")?.addEventListener("click", () => {
    const u = (document.querySelector("#newUserU")?.value || "").trim().toLowerCase();
    const nombre = (document.querySelector("#newUserNombre")?.value || "").trim();
    const p = document.querySelector("#newUserPass")?.value || "";
    const rol = document.querySelector("#newUserRol")?.value || "Operador";
    const cargo = (document.querySelector("#newUserCargo")?.value || "").trim();
    const areaSel = (document.querySelector("#newUserArea")?.value || "").trim();
    const areaNueva = (document.querySelector("#newUserAreaAdd")?.value || "").trim();
    const area = areaSel === "__add__" ? areaNueva : areaSel;
    if (!u || !nombre || !p) return alert("Completa usuario, nombre y contraseña.");
    if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área / célula.");
    if (!/^[a-z0-9._-]{3,24}$/.test(u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (state.usuarios.some(x => x.u === u)) return alert("Ese usuario ya existe.");
    const nuevo = normalizarUsuario({ u, nombre, p, rol, cargo, area, creado: hoy(), activo: true });
    state.usuarios.push(nuevo);
    ensureUserStat(nuevo);
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario creado", u, rol, C.green);
    render();
  });
  document.querySelectorAll("[data-admin-edit]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = btn.dataset.adminEdit;
    render();
  }));
  document.querySelectorAll("[data-admin-edit-close]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = "";
    render();
  }));
  document.querySelector("[data-admin-edit-save]")?.addEventListener("click", () => {
    const oldU = state.adminEditUser;
    const old = state.usuarios.find(u => u.u === oldU);
    if (!old) return;
    const nextU = old.u === "admin" ? "admin" : (document.querySelector("[data-admin-edit-u]")?.value || "").trim().toLowerCase();
    const patch = {
      u: nextU,
      nombre: (document.querySelector("[data-admin-edit-nombre]")?.value || "").trim(),
      p: document.querySelector("[data-admin-edit-pass]")?.value || old.p || "",
      rol: document.querySelector("[data-admin-edit-rol]")?.value || "Operador",
      activo: old.u === "admin" ? true : document.querySelector("[data-admin-edit-activo]")?.value !== "false",
      cargo: (document.querySelector("[data-admin-edit-cargo]")?.value || "").trim(),
      area: (document.querySelector("[data-admin-edit-area]")?.value || "").trim(),
      turno: (document.querySelector("[data-admin-edit-turno]")?.value || "").trim(),
      telefono: (document.querySelector("[data-admin-edit-telefono]")?.value || "").trim(),
      correo: (document.querySelector("[data-admin-edit-correo]")?.value || "").trim(),
      direccion: (document.querySelector("[data-admin-edit-direccion]")?.value || "").trim(),
      contactoEmergenciaNombre: (document.querySelector("[data-admin-edit-emerg-nombre]")?.value || "").trim(),
      contactoEmergenciaRelacion: (document.querySelector("[data-admin-edit-emerg-relacion]")?.value || "").trim(),
      contactoEmergenciaTelefono: (document.querySelector("[data-admin-edit-emerg-telefono]")?.value || "").trim(),
      observacionesContacto: (document.querySelector("[data-admin-edit-observaciones]")?.value || "").trim(),
    };
    if (!patch.u || !patch.nombre || !patch.p) return alert("Completa usuario, nombre y contraseña.");
    if (!/^[a-z0-9._-]{3,24}$/.test(patch.u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (patch.u !== oldU && state.usuarios.some(u => u.u === patch.u)) return alert("Ese usuario ya existe.");
    const next = normalizarUsuario({ ...old, ...patch });
    state.usuarios = state.usuarios.map(u => u.u === oldU ? next : u);
    if (patch.u !== oldU && state.userStats[oldU]) {
      state.userStats[patch.u] = state.userStats[oldU];
      delete state.userStats[oldU];
      state.lotes = state.lotes.map(l => l.createdBy === oldU ? { ...l, createdBy: patch.u, createdByName: next.nombre } : l);
      state.avisos = (state.avisos || []).map(a => a.autor === oldU ? { ...a, autor: patch.u, autorNombre: next.nombre } : a);
      save("oxmo:lotes", state.lotes);
      save("oxmo:avisos", state.avisos || []);
    }
    if (state.user?.u === oldU) {
      state.user = next;
      save("oxmo:user", state.user);
    }
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario modificado", next.u, `${next.nombre} (${next.rol})`, C.cyan);
    state.adminEditUser = "";
    render();
  });
  document.querySelectorAll("[data-admin-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminToggle;
    state.usuarios = state.usuarios.map(x => x.u === u ? { ...x, activo: x.activo === false } : x);
    saveUsuarios();
    addHist("Estado de usuario modificado", u, "", C.yellow);
    render();
  }));
  document.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminDel;
    if (!confirm(`¿Eliminar cuenta ${u}?`)) return;
    state.usuarios = state.usuarios.filter(x => x.u !== u);
    delete state.userStats[u];
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario eliminado", u, "", C.red);
    render();
  }));
};

/* =========================================================
   GERENTE_DASHBOARD_V3_20260626
   Dashboard ejecutivo suave para perfil Gerente.
   Incluye calendario, reloj e indicador de nube.
   La tendencia usa calcularProduccionDiariaGerencial(), preparada
   para el cálculo futuro: cargado a silo + descarga - retorno,
   ponderado por %Mo y densidad del material.
   ========================================================= */
function isGerente(user = state.user) {
  return String(user?.rol || "").trim().toLowerCase() === "gerente";
}

function gerenteNumber(n, d = 1) {
  const num = Number(n || 0);
  return num.toLocaleString("es-CL", { minimumFractionDigits: d, maximumFractionDigits: d });
}
function gerenteInt(n) { return Number(n || 0).toLocaleString("es-CL", { maximumFractionDigits: 0 }); }
function gerentePct(value, max) {
  const v = Number(value || 0);
  const m = Math.max(Number(max || 0), 1);
  return Math.max(0, Math.min(100, (v / m) * 100));
}
function gerenteDateShort(fecha) {
  const s = String(fecha || "");
  const [y, m, d] = s.split("-");
  return y && m && d ? `${d}-${m}` : (s || "-");
}
function gerenteCloudLabel() {
  if (cloud.status === "error nube" || cloud.status === "error") return "NUBE: ERROR";
  if (cloud.ready || String(cloud.status || "").toLowerCase().includes("sincron")) return "NUBE: SINCRONIZADO";
  return "MODO LOCAL";
}
function gerenteCloudClass() {
  if (cloud.status === "error nube" || cloud.status === "error") return "danger";
  if (cloud.ready || String(cloud.status || "").toLowerCase().includes("sincron")) return "ok";
  return "muted";
}

function calcularProduccionDiariaGerencial(day = {}) {
  // Fórmula base preparada para la función operacional definitiva:
  // producción diaria estimada = (cargado a silo + descarga - retorno) * densidad material
  // fino Mo estimado = producción diaria estimada * (%Mo / 100)
  const cargadoASiloT = Number(day.cargadoASiloT ?? day.cargaSiloT ?? day.llenadoT ?? day.cargadoT ?? 0);
  const descargaT = Number(day.descargaT ?? day.descargaSiloT ?? 0);
  const retornoT = Number(day.retornoT ?? day.retornoSiloT ?? 0);
  const densidadMaterial = Number(day.densidadMaterial ?? day.densidad ?? 1) || 1;
  let moPct = Number(day.moPct ?? day.moProm ?? day.mo ?? 0);
  if (!moPct && Number(day.produccionKg || 0) > 0 && Number(day.kgMo || 0) > 0) {
    moPct = (Number(day.kgMo || 0) / Number(day.produccionKg || 0)) * 100;
  }
  const movimientoBaseT = Math.max(0, cargadoASiloT + descargaT - retornoT);
  const produccionDiariaT = movimientoBaseT > 0
    ? movimientoBaseT * densidadMaterial
    : Number(day.produccionKg || 0) / 1000;
  const finoMoEstimadoT = moPct > 0 ? produccionDiariaT * (moPct / 100) : Number(day.kgMo || 0) / 1000;
  return {
    fecha: day.fecha || "",
    cargadoASiloT,
    descargaT,
    retornoT,
    densidadMaterial,
    moPct,
    produccionDiariaT,
    finoMoEstimadoT,
  };
}

function gerenteBuildAlerts({ fuera, pendientesAnalisis, masaTotalKg, masaDisponibleKg }) {
  const alerts = [];
  if ((fuera || []).length) {
    const masaFuera = fuera.reduce((a, l) => a + Number(l.masa || 0), 0);
    alerts.push({ level: "warn", title: `${fuera.length} lote(s) fuera de especificación`, text: `Masa comprometida: ${kgToTon(masaFuera, 2)}. Priorizar revisión química y plan de recuperación.`, when: "Hoy" });
  }
  if (pendientesAnalisis > 0) alerts.push({ level: "info", title: `${pendientesAnalisis} lote(s) sin análisis`, text: "La clasificación puede cambiar cuando se cargue laboratorio.", when: "Lab" });
  const disponibilidad = masaTotalKg ? (masaDisponibleKg / masaTotalKg) * 100 : 0;
  if (disponibilidad < 60) alerts.push({ level: "info", title: "Disponibilidad bajo 60%", text: `Inventario disponible en ${gerenteNumber(disponibilidad, 1)}% del total.`, when: "KPI" });
  if (!alerts.length) alerts.push({ level: "ok", title: "Sin alertas críticas", text: "Los indicadores ejecutivos se mantienen dentro del rango esperado.", when: "Ahora" });
  return alerts.slice(0, 4);
}

function gerenteDashboardData() {
  const lotes = state.lotes || [];
  const disp = lotes.filter(l => String(l.estado || "") === "Disponible");
  const retenidos = lotes.filter(l => String(l.estado || "") !== "Disponible");
  const pendientesAnalisis = lotes.filter(l => !hasAnalysis(l)).length;
  const masaTotalKg = lotes.reduce((a, l) => a + Number(l.masa || 0), 0);
  const masaDisponibleKg = disp.reduce((a, l) => a + Number(l.masa || 0), 0);
  const masaRetenidaKg = retenidos.reduce((a, l) => a + Number(l.masa || 0), 0);
  const analizados = lotes.filter(l => hasAnalysis(l));
  const finoMoKg = analizados.reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0);
  const claseMap = { "Bajo Cobre": [], "Alto Cobre": [], "Fuera Esp": [], "Pendiente": [] };
  lotes.forEach(l => {
    const cl = hasAnalysis(l) ? clasificar(l).clase : "Pendiente";
    (claseMap[cl] || claseMap["Pendiente"]).push(l);
  });
  const classRows = [
    { label: "Bajo Cobre", color: C.cyan, lots: claseMap["Bajo Cobre"] || [] },
    { label: "Alto Cobre", color: C.green, lots: claseMap["Alto Cobre"] || [] },
    { label: "Fuera Esp", color: C.copper, lots: claseMap["Fuera Esp"] || [] },
    { label: "Pendiente", color: "#9aacc2", lots: claseMap["Pendiente"] || [] },
  ].map(r => ({ ...r, masaKg: r.lots.reduce((a, l) => a + Number(l.masa || 0), 0), count: r.lots.length }));
  const fuera = classRows.find(r => r.label === "Fuera Esp")?.lots || [];
  const info = state.infodia || {};
  const days = [...(info.days || [])].sort((a, b) => fechaOrdenMs(a.fecha) - fechaOrdenMs(b.fecha));
  const totals = info.totals || recalcularTotalesInfodia(days);
  const trend30 = days.slice(-30).map(d => {
    const calc = calcularProduccionDiariaGerencial(d);
    return {
      fecha: d.fecha,
      produccionDiariaT: calc.produccionDiariaT,
      finoMoEstimadoT: calc.finoMoEstimadoT,
      consumoT: Number(d.descargaT || 0),
      ritmoInvT: Math.max(0, Number(calc.cargadoASiloT || 0) - Number(calc.retornoT || 0)),
    };
  });
  const sectores = allSectores().map(s => {
    const rows = lotes.filter(l => l.sector === s);
    const masaKg = rows.reduce((a, l) => a + Number(l.masa || 0), 0);
    const analyzedRows = rows.filter(hasAnalysis);
    const cuAvg = analyzedRows.length ? analyzedRows.reduce((a, l) => a + Number(l.cu || 0), 0) / analyzedRows.length : 0;
    const moAvg = analyzedRows.length ? analyzedRows.reduce((a, l) => a + Number(l.mo || 0), 0) / analyzedRows.length : 0;
    const sAvg = analyzedRows.length ? analyzedRows.reduce((a, l) => a + Number(l.s || 0), 0) / analyzedRows.length : 0;
    return { label: s, rows, masaKg, masaT: masaKg / 1000, count: rows.length, cuAvg, moAvg, sAvg };
  }).filter(x => x.count > 0 || x.masaKg > 0).sort((a, b) => b.masaKg - a.masaKg);
  const cumplimiento = analizados.length ? ((analizados.length - fuera.length) / analizados.length) * 100 : 100;
  const masaFueraKg = fuera.reduce((a, l) => a + Number(l.masa || 0), 0);
  const alerts = gerenteBuildAlerts({ fuera, pendientesAnalisis, masaTotalKg, masaDisponibleKg });
  return {
    lotes, disp, retenidos, fuera, masaTotalKg, masaDisponibleKg, masaRetenidaKg, finoMoKg,
    info, days, totals, trend30, sectores, classRows, cumplimiento, pendientesAnalisis, masaFueraKg, alerts,
    updatedAt: new Date().toLocaleString("es-CL"),
    lastDate: trend30.at(-1)?.fecha || (days.at(-1)?.fecha || "Sin Infodia"),
  };
}

function gerenteSpark(values, color = C.blueLight) {
  const data = (values || []).map(v => Number(v || 0));
  if (!data.length) return "";
  const max = Math.max(...data, 1), min = Math.min(...data, 0), w = 240, h = 42;
  const range = Math.max(max - min, 1);
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * w;
    const y = h - ((v - min) / range) * (h - 6) - 3;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ");
  return `<svg class="exec-soft-spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></polyline></svg>`;
}

function gerenteKpiHTML(label, value, sub, color = C.blueLight, icon = "◆", sparkValues = []) {
  return `<div class="exec-soft-kpi" style="--accent:${color}">
    <div class="exec-soft-kpi-head"><div class="exec-soft-icon">${icon}</div><div class="exec-soft-kpi-label">${esc(label)}</div></div>
    <div class="exec-soft-kpi-value">${esc(value)}</div>
    <div class="exec-soft-kpi-sub">${esc(sub || "")}</div>
    <div class="exec-soft-kpi-spark">${sparkValues.length ? gerenteSpark(sparkValues, color) : ""}</div>
  </div>`;
}

function gerenteChartSVG(rows) {
  if (!(rows || []).length) return `<div class="exec-empty">Sin Infodia para construir producción diaria.</div>`;
  const w = 760, h = 300, pad = 34;
  const prod = rows.map(r => Number(r.produccionDiariaT || 0));
  const cons = rows.map(r => Number(r.consumoT || 0));
  const fino = rows.map(r => Number(r.finoMoEstimadoT || 0));
  const max = Math.max(1, ...prod, ...cons, ...fino);
  const mk = arr => arr.map((v, i) => [pad + (i / Math.max(arr.length - 1, 1)) * (w - pad * 2), h - pad - (v / max) * (h - pad * 2)]);
  const prodPts = mk(prod), consPts = mk(cons), finoPts = mk(fino);
  const line = pts => pts.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = pts => `M ${pad} ${h-pad} L ` + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L ") + ` L ${w-pad} ${h-pad} Z`;
  const grid = Array.from({ length: 5 }, (_, i) => {
    const y = pad + i * ((h - pad * 2) / 4);
    const label = gerenteInt(max * (1 - i / 4));
    return `<g><line x1="${pad}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="#1b3554" stroke-width="1" stroke-dasharray="4 4"/><text x="6" y="${y+4}" fill="#8aa4bf" font-size="11">${label}</text></g>`;
  }).join("");
  const xLabels = rows.filter((_, i) => i % Math.ceil(rows.length / 7) === 0 || i === rows.length - 1).map(r => {
    const idx = rows.indexOf(r);
    const x = pad + (idx / Math.max(rows.length - 1, 1)) * (w - pad * 2);
    return `<text x="${x}" y="${h-8}" text-anchor="middle" fill="#8aa4bf" font-size="11">${esc(gerenteDateShort(r.fecha))}</text>`;
  }).join("");
  return `<svg class="exec-soft-chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">
    <defs><linearGradient id="softProd" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#19c8ff" stop-opacity="0.40"/><stop offset="100%" stop-color="#19c8ff" stop-opacity="0.02"/></linearGradient><linearGradient id="softCons" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#00e5a0" stop-opacity="0.22"/><stop offset="100%" stop-color="#00e5a0" stop-opacity="0.02"/></linearGradient></defs>
    ${grid}<path d="${area(prodPts)}" fill="url(#softProd)"></path><path d="${area(consPts)}" fill="url(#softCons)"></path>
    <polyline points="${line(prodPts)}" fill="none" stroke="#19c8ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="${line(consPts)}" fill="none" stroke="#00e5a0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"></polyline>
    <polyline points="${line(finoPts)}" fill="none" stroke="#5fa2ff" stroke-width="2" stroke-dasharray="6 6" stroke-linecap="round"></polyline>
    ${xLabels}
  </svg>`;
}

function gerenteTrendCardHTML(d) {
  return `<div class="exec-soft-card exec-soft-chart-card">
    <div class="exec-soft-card-head"><div><div class="exec-soft-card-title">Tendencia operacional</div><div class="exec-soft-card-sub">Producción diaria estimada · consumo · fino Mo estimado</div></div><div class="exec-soft-legend"><span><i style="background:${C.cyan}"></i>Producción diaria</span><span><i style="background:${C.green}"></i>Consumo</span><span><i class="dash"></i>Fino Mo</span></div></div>
    <div class="exec-soft-chart-wrap">${gerenteChartSVG(d.trend30)}</div>
  </div>`;
}

function gerenteDonutHTML(d) {
  const total = Math.max(1, d.classRows.reduce((a, r) => a + Number(r.masaKg || 0), 0));
  let acc = 0;
  const segs = d.classRows.map(r => { const s = (acc / total) * 100; acc += Number(r.masaKg || 0); const e = (acc / total) * 100; return `${r.color} ${s.toFixed(2)}% ${e.toFixed(2)}%`; }).join(', ');
  return `<div class="exec-soft-card exec-soft-donut-card"><div class="exec-soft-card-head"><div class="exec-soft-card-title">Distribución por clasificación</div></div><div class="exec-soft-donut-layout"><div class="exec-soft-donut" style="background:conic-gradient(${segs})"><div><b>${kgToTon(d.masaTotalKg, 1)}</b><span>Total</span></div></div><div class="exec-soft-donut-legend">${d.classRows.map(r => { const pct = d.masaTotalKg ? (r.masaKg / d.masaTotalKg) * 100 : 0; return `<div><i style="background:${r.color}"></i><span>${esc(r.label)}</span><b>${kgToTon(r.masaKg, 1)}</b><small>${gerenteNumber(pct, 1)}%</small></div>`; }).join('')}</div></div><div class="exec-soft-footnote">ⓘ Valores en toneladas métricas (t)</div></div>`;
}

function gerenteCalendarHTML() {
  const now = new Date();
  const monthName = now.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
  const y = now.getFullYear(), m = now.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0).getDate();
  const start = (first.getDay() + 6) % 7;
  const cells = Array.from({ length: start }, () => `<span></span>`).concat(Array.from({ length: last }, (_, i) => {
    const d = i + 1;
    return `<span class="${d === now.getDate() ? 'active' : ''}">${d}</span>`;
  })).join('');
  return `<div class="exec-soft-side-card"><div class="exec-soft-side-title">${esc(monthName.charAt(0).toUpperCase() + monthName.slice(1))}</div><div class="exec-soft-week"><b>Lun</b><b>Mar</b><b>Mié</b><b>Jue</b><b>Vie</b><b>Sáb</b><b>Dom</b></div><div class="exec-soft-cal">${cells}</div></div>`;
}

function gerenteClockHTML() {
  const now = new Date();
  return `<div class="exec-soft-side-card exec-soft-clock"><div class="exec-soft-clock-face"><span></span></div><div><b>${esc(now.toLocaleTimeString('es-CL'))}</b><p>${esc(now.toLocaleDateString('es-CL', { weekday:'long', day:'2-digit', month:'long', year:'numeric' }))}</p></div></div>`;
}

function gerenteDashboardHTML() {
  const d = gerenteDashboardData();
  const disponibilidad = d.masaTotalKg ? (d.masaDisponibleKg / d.masaTotalKg) * 100 : 0;
  const sparkProd = d.trend30.slice(-12).map(x => x.produccionDiariaT || 0);
  const sparkCons = d.trend30.slice(-12).map(x => x.consumoT || 0);
  const userInitials = String(state.user?.nombre || state.user?.u || "GM").split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase() || "GM";
  return `<section class="exec-soft-board-v4">
    <header class="exec-v4-header">
      <button class="exec-v4-brand" data-tab="gerencial" title="Volver al resumen"><span></span><b>MOLYB</b></button>
      <div class="exec-v4-user">
        <span>Gerente</span>
        <button class="exec-v4-avatar" data-tab="perfil" title="Mi perfil">${esc(userInitials)}</button>
        <button class="exec-v4-logout" id="logoutBtn" title="Cerrar sesión">Salir</button>
      </div>
    </header>

    <div class="exec-v4-layout">
      <section class="exec-v4-content">
        <div class="exec-soft-hero exec-v4-hero">
          <div>
            <h1>Control Operacional Molyb</h1>
            <p>Vista informativa orientada a gerencia. Consolida inventario, clasificación, producción, consumos y alertas sin exponer la operación técnica detallada.</p>
          </div>
        </div>

        <div class="exec-soft-kpis exec-v4-kpis">
          ${gerenteKpiHTML('Inventario total', kgToTon(d.masaTotalKg, 2), `${d.lotes.length} lotes registrados`, C.blueLight, '◈', d.sectores.map(s => s.masaT))}
          ${gerenteKpiHTML('Masa disponible', kgToTon(d.masaDisponibleKg, 2), `${gerenteNumber(disponibilidad, 1)}% del total`, C.green, '◎', sparkProd)}
          ${gerenteKpiHTML('Masa retenida', kgToTon(d.masaRetenidaKg, 2), `${d.retenidos.length} lotes retenidos`, C.yellow, '▣', d.classRows.map(s => s.masaKg/1000))}
          ${gerenteKpiHTML('Fuera especificación', kgToTon(d.masaFueraKg, 2), `${d.fuera.length} lote(s) afectados`, C.red, '△', d.classRows.map(s => s.masaKg/1000))}
          ${gerenteKpiHTML('Producción del mes', kgToTon(d.totals.produccionKg || 0, 2), `${d.totals.lotes || 0} registros Infodia`, C.green, '▥', sparkProd)}
          ${gerenteKpiHTML('Consumo / descarga', `${gerenteNumber(d.totals.descargaT || 0, 2)} t`, 'Acumulado desde Infodia', C.copper, '⇣', sparkCons)}
        </div>

        <div class="exec-soft-panels exec-v4-panels">
          ${gerenteTrendCardHTML(d)}
          ${gerenteDonutHTML(d)}
        </div>
        <div class="exec-soft-update">• Última actualización: ${esc(d.updatedAt)}</div>
      </section>

      <aside class="exec-soft-side exec-v4-side">
        ${gerenteCalendarHTML()}
        ${gerenteClockHTML()}
        <div class="exec-soft-side-card exec-v4-observaciones">
          <div class="exec-soft-side-title">Observaciones</div>
          ${d.alerts.map(a => `<div class="exec-soft-alert ${a.level}"><b>${esc(a.title)}</b><p>${esc(a.text)}</p></div>`).join('')}
        </div>
      </aside>
    </div>
  </section>`;
}

function gerenteShellHTML() {
  if (state.tab === 'perfil') {
    return `<main class="exec-soft-root exec-v4-profile"><header class="exec-v4-header"><button class="exec-v4-brand" data-tab="gerencial"><span></span><b>MOLYB</b></button><div style="display:flex;gap:10px"><button class="exec-v4-back" data-tab="gerencial">Volver al dashboard</button><button class="exec-v4-logout" id="logoutBtn">Salir</button></div></header><section class="main" id="tabView">${perfilUsuarioHTML()}</section></main>`;
  }
  return `<main class="exec-soft-root"><section id="tabView">${gerenteDashboardHTML()}</section></main>`;
}

const shellHTMLAnteriorGerente = shellHTML;
shellHTML = function() { if (isGerente()) return gerenteShellHTML(); return shellHTMLAnteriorGerente(); };
const canViewTabAnteriorGerente = canViewTab;
canViewTab = function(id, user = state.user) { if (isGerente(user)) return ['gerencial','perfil'].includes(id); return canViewTabAnteriorGerente(id, user); };
const visibleTabsAnteriorGerente = visibleTabs;
visibleTabs = function() { if (isGerente()) return [['gerencial','Dashboard'],['perfil','Mi perfil']]; return visibleTabsAnteriorGerente(); };
const tabHTMLAnteriorGerente = tabHTML;
tabHTML = function() { if (isGerente() && state.tab === 'gerencial') return gerenteDashboardHTML(); if (isGerente() && state.tab === 'perfil') return perfilUsuarioHTML(); return tabHTMLAnteriorGerente(); };
const bindTabAnteriorGerente = bindTab;
bindTab = function() { if (isGerente()) { if (state.tab === 'perfil') bindPerfilUsuario(); return; } bindTabAnteriorGerente(); };
const bindShellAnteriorGerente = bindShell;
bindShell = function() {
  if (!isGerente()) return bindShellAnteriorGerente();
  document.querySelector('#logoutBtn')?.addEventListener('click', () => { cerrarSesionUsuario(); state.user = null; save('oxmo:user', null); render(); });
  document.querySelector('#myPassBtn')?.addEventListener('click', () => state.user && openPassModal(state.user.u));
  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => { state.tab = btn.dataset.tab; render(); }));
  aplicarMayusculasFinal();
  bindTab();
};
const renderAnteriorGerente = render;
render = function() { if (state.user && isGerente() && !['gerencial','perfil'].includes(state.tab)) state.tab = 'gerencial'; return renderAnteriorGerente(); };

/* =========================================================
   AREA_CELULA_V1_20260626
   Centros independientes por área/célula + totalizado para Admin/Gerente.
   ========================================================= */
const canEditLotAnteriorAreaCelula = canEditLot;
canEditLot = function(l, user = state.user) {
  if (!user || !l) return false;
  if (areaTrabajoEsGlobal(user)) return canEditLotAnteriorAreaCelula(l, user);
  if (areaTrabajoLote(l) !== areaTrabajoUsuario(user)) return false;
  return canEditLotAnteriorAreaCelula(l, user);
};

const lotesRecientesAnteriorAreaCelula = lotesRecientes;
lotesRecientes = function(lotes = state.lotes) {
  return lotesRecientesAnteriorAreaCelula(lotesPorAreaTrabajo(lotes));
};

const inventarioHTMLAnteriorAreaCelula = inventarioHTML;
inventarioHTML = function() {
  const base = lotesPorAreaTrabajo(state.lotes);
  const lotes = state.filtro === "Todos" ? lotesRecientesAnteriorAreaCelula(base) : lotesRecientesAnteriorAreaCelula(base).filter(l => l.estado === state.filtro);
  const selected = new Set(state.inventorySelected || []);
  const editableIds = lotes.filter(canEditLot).map(l => l.id);
  const dist = allSectores().map(s => ({s, v: base.filter(l => l.sector === s).reduce((a,l) => a + l.masa, 0)})).filter(d => d.v > 0);
  const max = Math.max(1, ...dist.map(d => d.v));
  const areaInfo = areaTrabajoEsGlobal() ? "Totalizado todas las áreas" : `Área / célula: ${esc(areaTrabajoUsuario())}`;
  return `
    <div class="notice" style="margin-bottom:10px;border-color:#00d4ff44;background:#00d4ff12;color:var(--cyan)">${areaInfo}</div>
    <div class="filters">
      ${["Todos","Disponible","Bloqueado","Pendiente","Fuera Esp"].map(f => `<button class="pill ${state.filtro === f ? "active" : ""}" data-filter="${f}">${f} (${f === "Todos" ? base.length : base.filter(l => l.estado === f).length})</button>`).join("")}
      ${selected.size ? `<button class="pill" id="deleteSelectedLots" style="border-color:#ff456055;color:var(--red)">Eliminar seleccionados (${selected.size})</button>` : ""}
      <button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th><input id="invSelectAll" type="checkbox" ${editableIds.length && editableIds.every(id => selected.has(id)) ? "checked" : ""}></th>${["ID","Tipo","Masa","Sector","Cu%","Mo%","S%","Clasif.","Estado","Fecha",""] .map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${lotes.map(l => rowHTML(l)).join("")}</tbody>
      </table>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Por sector</div>
        ${dist.length ? dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${esc(d.s)}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v/max)*100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v, 1)}</span></div>`).join("") : `<span style="color:var(--txt3);font-size:12px">Sin inventario en esta área.</span>`}
      </div>
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Estados</div>
        ${["Disponible","Bloqueado","Pendiente","Fuera Esp"].map(e => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2e4a33"><span style="color:${eColor(e)}">● ${e}</span><span class="mono" style="font-weight:800">${base.filter(l => l.estado === e).length}</span></div>`).join("")}
      </div>
    </div>
  `;
};

// Inicialización movida al final del archivo para evitar errores de carga
// cuando los parches de área/célula aún no están definidos.


/* =========================================================
   ETIQUETA ZEBRA ZT230 300 DPI - 100 x 150 mm PROPORCIONAL
   v20260626-label-pro-v3
   Reemplaza las versiones anteriores de etiqueta/printLabels.
   ========================================================= */
function etiquetaFit(id) {
  const len = String(id || "").length;
  if (len > 30) return { idPt: 13, qrMm: 46 };
  if (len > 24) return { idPt: 14, qrMm: 48 };
  if (len > 18) return { idPt: 16, qrMm: 50 };
  return { idPt: 19, qrMm: 52 };
}

function etiquetaCSS(publicMode = false) {
  return `<style>
    @page { size: 100mm 150mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      min-height: 100%;
      background: ${publicMode ? "#fff" : "#eceff3"};
      color: #000;
      font-family: Arial, Helvetica, sans-serif;
    }
    .no-print {
      position: fixed;
      right: 8mm;
      top: 6mm;
      z-index: 20;
    }
    .no-print button {
      font-weight: 900;
      font-size: 13px;
      padding: 8px 12px;
      border: 1px solid #999;
      background: #fff;
      cursor: pointer;
    }
    .public-wrap {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 0;
      background: #fff;
    }
    .label-page {
      width: 100mm;
      height: 150mm;
      background: #fff;
      display: grid;
      place-items: center;
      padding: 0;
      margin: ${publicMode ? "0" : "0 0 8mm 0"};
      page-break-after: always;
      break-after: page;
      overflow: hidden;
    }
    .label {
      width: 96mm;
      height: 146mm;
      border: 1.15mm solid #111;
      border-radius: 3mm;
      padding: 4.3mm 5.2mm 2.6mm;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      background: #fff;
    }
    .label-top {
      display: grid;
      grid-template-columns: 38mm 1fr;
      gap: 3mm;
      align-items: center;
      min-height: 19mm;
      padding-bottom: 2.3mm;
      border-bottom: .45mm solid #111;
      flex: 0 0 auto;
    }
    .label-logo {
      width: 36mm;
      max-height: 15mm;
      object-fit: contain;
      object-position: left center;
      display: block;
    }
    .label-brand {
      text-align: right;
      min-width: 0;
    }
    .label-brand-title {
      font-weight: 900;
      font-size: 11pt;
      letter-spacing: 2.3pt;
      line-height: 1.05;
    }
    .label-brand-title span { display: block; }
    .label-date {
      margin-top: 1.4mm;
      font-size: 7pt;
      line-height: 1;
      color: #111;
      letter-spacing: 0;
      white-space: nowrap;
    }
    .label-id {
      min-height: 11mm;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      margin: 2.5mm 0 2mm;
      font-family: Consolas, "Courier New", monospace;
      font-weight: 900;
      line-height: 1.02;
      letter-spacing: .3pt;
      overflow-wrap: anywhere;
      word-break: break-word;
      flex: 0 0 auto;
    }
    .label-class {
      min-height: 13.5mm;
      border: .55mm solid var(--accent);
      color: var(--accent);
      border-radius: 2mm;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      font-weight: 900;
      font-size: 18pt;
      line-height: 1;
      letter-spacing: 1.2pt;
      padding: 1.7mm 2mm;
      margin-bottom: 2.5mm;
      flex: 0 0 auto;
    }
    .label-chem {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2mm;
      margin-bottom: 2.5mm;
      flex: 0 0 auto;
    }
    .label-cell,
    .label-mass {
      border: .35mm solid #222;
      border-radius: 1.5mm;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    .label-cell {
      min-height: 15.5mm;
      padding: 1.4mm 1mm;
    }
    .label-k {
      display: block;
      font-size: 6.8pt;
      line-height: 1;
      font-weight: 900;
      margin-bottom: 1mm;
      letter-spacing: .3pt;
    }
    .label-v {
      display: block;
      font-family: Consolas, "Courier New", monospace;
      font-size: 13.8pt;
      line-height: 1;
      font-weight: 900;
      white-space: nowrap;
    }
    .label-mass {
      min-height: 12.8mm;
      padding: 1.4mm 1mm;
      margin-bottom: 1.2mm;
      flex: 0 0 auto;
    }
    .label-mass .label-v {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13pt;
      letter-spacing: .2pt;
    }
    .label-qr-area {
      flex: 1 1 auto;
      min-height: 50mm;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5mm 0 1.2mm;
    }
    .label-qr {
      width: var(--qr-size);
      height: var(--qr-size);
      display: block;
      object-fit: contain;
      image-rendering: pixelated;
    }
    .label-foot {
      border-top: .35mm solid #111;
      padding-top: .8mm;
      text-align: center;
      font-size: 5.8pt;
      line-height: 1;
      color: #111;
      white-space: nowrap;
      flex: 0 0 auto;
    }
    @media print {
      html, body { background: #fff; width: 100mm; min-height: 150mm; }
      .no-print { display: none; }
      .label-page { margin: 0; box-shadow: none; }
    }
  </style>`;
}

function etiquetaLabelHTML(data, qrUrl) {
  const fit = etiquetaFit(data.id);
  const accent = data.color || "#C87533";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=620x620&margin=1&data=${encodeURIComponent(qrUrl)}`;
  return `<section class="label-page">
    <div class="label" style="--accent:${esc(accent)};--qr-size:${fit.qrMm}mm">
      <div class="label-top">
        <img class="label-logo" src="./molyb-logo.webp" alt="Molyb">
        <div class="label-brand">
          <div class="label-brand-title"><span>OXMO</span><span>CONTROL</span></div>
          <div class="label-date">${esc(data.fecha || hoy())}</div>
        </div>
      </div>
      <div class="label-id" style="font-size:${fit.idPt}pt">${esc(data.id || "SIN ID")}</div>
      <div class="label-class">${esc(String(data.mat || "SIN CLASIFICAR").toUpperCase())}</div>
      <div class="label-chem">
        <div class="label-cell"><span class="label-k">CU</span><span class="label-v">${esc(data.cu || "-")}%</span></div>
        <div class="label-cell"><span class="label-k">MO</span><span class="label-v">${esc(data.mo || "-")}%</span></div>
        <div class="label-cell"><span class="label-k">S</span><span class="label-v">${esc(data.s || "-")}%</span></div>
      </div>
      <div class="label-mass"><span class="label-k">MASA</span><span class="label-v">${esc(data.masa || "-")}</span></div>
      <div class="label-qr-area"><img class="label-qr" src="${qrSrc}" alt="QR ${esc(data.id)}"></div>
      <div class="label-foot">Zebra ZT230 · Etiqueta 100 × 150 mm · 300 dpi</div>
    </div>
  </section>`;
}

function etiquetaPublicaHTML(data) {
  if (!data || !data.id) {
    return `<style>body{font-family:Arial;background:#f4f6f8;padding:30px}</style><h1>Etiqueta no encontrada</h1><p>El QR no trae datos suficientes para reconstruir la etiqueta.</p>`;
  }
  return `<!doctype html><html><head><meta charset="utf-8"><title>Etiqueta ${esc(data.id)}</title>${etiquetaCSS(true)}</head><body><div class="public-wrap">${etiquetaLabelHTML(data, location.href)}</div></body></html>`;
}

function printLabels() {
  const ids = state.etiquetaSel || [];
  if (!ids.length) return;
  const items = ids.map(id => {
    const l = state.lotes.find(x => x.id === id);
    if (!l) return "";
    const c = clasificar(l);
    const data = {
      id: l.id,
      mat: c.clase,
      color: c.color,
      masa: kgToTon(l.masa, 2),
      cu: hasAnalysis(l) ? fmt(l.cu, 3).replace(/\.?0+$/, "") : "-",
      mo: hasAnalysis(l) ? fmt(l.mo, 3).replace(/\.?0+$/, "") : "-",
      s: hasAnalysis(l) ? fmt(l.s, 4).replace(/\.?0+$/, "") : "-",
      fecha: l.fecha || hoy(),
    };
    const labelParams = new URLSearchParams(data);
    const qrUrl = `${PUBLIC_APP_URL}etiqueta.html?${labelParams.toString()}`;
    return etiquetaLabelHTML(data, qrUrl);
  }).join("");
  const w = window.open("", "_blank");
  if (!w) {
    alert("Permite ventanas emergentes para abrir la vista previa de etiquetas.");
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas OXMO</title>${etiquetaCSS(false)}</head><body><div class="no-print"><button onclick="window.print()">Imprimir / guardar PDF</button></div>${items}</body></html>`);
  w.document.close();
}

/* =========================================================
   AREA_CELULA_V2_20260626
   - Inventario segmentado por área/célula
   - Roles globales: Jefe de planta, Super intendente, Gerente, Administrador
   - Inventario histórico sin área => Envase
   - Área de usuario editable solo por Administrador con lista desplegable
   ========================================================= */
const AREA_CELULA_DEFAULT = "Envase";
const ROLES_AREA_GLOBAL = new Set(["administrador", "gerente", "jefe de planta", "super intendente", "superintendente"]);

function normalizarTextoArea(v) {
  return String(v || "").trim();
}

function areaTrabajoDefault() { return AREA_CELULA_DEFAULT; }

function areaTrabajoUsuario(user = state.user) {
  return normalizarTextoArea(user?.area || user?.areaCelula) || AREA_CELULA_DEFAULT;
}

function areaTrabajoEsGlobal(user = state.user) {
  const rol = String(user?.rol || "").trim().toLowerCase();
  return ROLES_AREA_GLOBAL.has(rol) || isAdmin(user) || isGerente(user);
}

function areaTrabajoLote(lote = {}) {
  const explicit = normalizarTextoArea(lote.areaCelula || lote.areaTrabajo || lote.area);
  if (explicit) return explicit;
  const creador = (state.usuarios || []).map(normalizarUsuario).find(u => u.u === String(lote.createdBy || "").trim().toLowerCase());
  return creador ? areaTrabajoUsuario(creador) : AREA_CELULA_DEFAULT;
}

function areasTrabajoCatalogo() {
  const areas = [
    AREA_CELULA_DEFAULT,
    ...(state.usuarios || []).map(u => normalizarUsuario(u).area).filter(Boolean),
    ...(state.lotes || []).map(l => areaTrabajoLote(l)).filter(Boolean),
  ];
  return [...new Set(areas.map(normalizarTextoArea).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
}

function areaTrabajoCatalogo() { return areasTrabajoCatalogo(); }

function areaTrabajoOptionsHTML(selected = "", { includeAdd = false } = {}) {
  const sel = normalizarTextoArea(selected) || AREA_CELULA_DEFAULT;
  const options = areasTrabajoCatalogo();
  if (sel && !options.includes(sel)) options.push(sel);
  return options.map(a => `<option value="${esc(a)}" ${a === sel ? "selected" : ""}>${esc(a)}</option>`).join("")
    + (includeAdd ? `<option value="__add__">+ Añadir área / célula...</option>` : "");
}

function lotesPorAreaTrabajo(lotes = state.lotes, user = state.user) {
  const source = Array.isArray(lotes) ? lotes : [];
  if (areaTrabajoEsGlobal(user)) return source;
  const area = areaTrabajoUsuario(user);
  return source.filter(l => areaTrabajoLote(l) === area);
}

function migrarAreaCelulaV2() {
  let changedUsers = false;
  state.usuarios = (state.usuarios || []).map(u => {
    const nu = normalizarUsuario(u);
    if (!normalizarTextoArea(nu.area)) {
      changedUsers = true;
      return { ...nu, area: AREA_CELULA_DEFAULT, areaCelula: AREA_CELULA_DEFAULT };
    }
    if (!normalizarTextoArea(nu.areaCelula)) {
      changedUsers = true;
      return { ...nu, areaCelula: nu.area };
    }
    return nu;
  });
  if (state.user && !normalizarTextoArea(state.user.area)) {
    state.user = normalizarUsuario({ ...state.user, area: AREA_CELULA_DEFAULT, areaCelula: AREA_CELULA_DEFAULT });
    save("oxmo:user", state.user);
  }
  let changedLotes = false;
  state.lotes = (state.lotes || []).map(l => {
    const area = normalizarTextoArea(l.areaCelula || l.areaTrabajo || l.area);
    if (area) return { ...l, areaCelula: area, areaTrabajo: area };
    changedLotes = true;
    return { ...l, areaCelula: AREA_CELULA_DEFAULT, areaTrabajo: AREA_CELULA_DEFAULT };
  });
  if (changedUsers) saveUsuarios();
  if (changedLotes) save("oxmo:lotes", state.lotes);
}

function areaBadgeHTML(area, subtle = false) {
  return `<span class="area-chip ${subtle ? "subtle" : ""}">${esc(area || AREA_CELULA_DEFAULT)}</span>`;
}

const normalizarUsuarioAreaV2 = normalizarUsuario;
normalizarUsuario = function(u) {
  const base = normalizarUsuarioAreaV2(u || {});
  const area = normalizarTextoArea(u?.area || u?.areaCelula || base.area) || AREA_CELULA_DEFAULT;
  return { ...base, area, areaCelula: area };
};

const canEditLotAreaV2 = canEditLot;
canEditLot = function(l, user = state.user) {
  if (!l || !user) return false;
  if (!areaTrabajoEsGlobal(user) && areaTrabajoLote(l) !== areaTrabajoUsuario(user)) return false;
  return canEditLotAreaV2(l, user);
};

function renderAreaSelectHTML({ id = "", name = "", value = "", dataAttr = "", includeAdd = false, disabled = false } = {}) {
  const attrId = id ? `id="${esc(id)}"` : "";
  const attrName = name ? `name="${esc(name)}"` : "";
  const attrData = dataAttr ? `${dataAttr}` : "";
  return `<select ${attrId} ${attrName} class="input area-select" data-keep-case="true" ${attrData} ${disabled ? "disabled" : ""}>${areaTrabajoOptionsHTML(value, { includeAdd })}</select>`;
}

adminUsersHTML = function(rows) {
  const usuarios = rows.map(r => normalizarUsuario(r.u || r));
  const roleOptions = ROLES_USUARIO.map(r => `<option>${esc(r)}</option>`).join("");
  const areas = areasTrabajoCatalogo();
  return `
    <div class="area-admin-shell">
      <div class="area-admin-card create-user-card">
        <div class="section-title">Crear cuenta</div>
        <div class="area-help">Cada usuario queda asociado a un área/célula. Los roles operativos solo verán inventario de su área.</div>
        <div class="field"><label>Usuario</label><input id="newUserU" class="input" data-keep-case="true" placeholder="ej: turno_a"></div>
        <div class="field"><label>Nombre</label><input id="newUserNombre" class="input" data-keep-case="true" placeholder="Nombre visible"></div>
        <div class="field"><label>Contraseña inicial</label><input id="newUserPass" data-keep-case="true" type="password" class="input" placeholder="Contraseña inicial"></div>
        <div class="field"><label>Rol</label><select id="newUserRol" class="input">${roleOptions}</select></div>
        <div class="field"><label>Cargo</label><input id="newUserCargo" class="input" data-keep-case="true" placeholder="Opcional"></div>
        <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ id: "newUserArea", value: AREA_CELULA_DEFAULT, includeAdd: true })}</div>
        <div class="field" id="newUserAreaAddWrap" style="display:none"><label>Nueva área / célula</label><input id="newUserAreaAdd" class="input" data-keep-case="true" placeholder="Ej: Envase B, Logística, Centro Norte"></div>
        <button class="btn primary" id="crearUsuario" style="width:100%;margin-top:4px">Crear usuario</button>
      </div>
      <div class="area-admin-card users-list-card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px">
          <div>
            <div class="section-title">Cuentas creadas — ${usuarios.length}</div>
            <div class="area-help">Áreas activas: ${areas.map(a => areaBadgeHTML(a, true)).join(" ")}</div>
          </div>
        </div>
        <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Área / célula</th><th>Contacto</th><th>Estado</th><th>Último uso</th><th>Control</th></tr></thead><tbody>
          ${usuarios.map(u => {
            const stat = state.userStats[u.u] || {};
            return `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td>${areaBadgeHTML(u.area)}</td>
              <td style="color:var(--txt2);font-size:11px">${usuarioContactoResumen(u)}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Deshabilitado"}</td>
              <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">
                <button class="icon-btn" data-admin-edit="${esc(u.u)}">Editar</button>
                ${u.u !== "admin" && u.u !== userKey() ? `<button class="icon-btn" data-admin-toggle="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button><button class="icon-btn" data-admin-del="${esc(u.u)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}
              </div></td>
            </tr>`;
          }).join("")}
        </tbody></table></div>
      </div>
    </div>
    ${adminUserModalHTML()}
  `;
};

adminUserModalHTML = function() {
  const user = normalizarUsuario(state.usuarios.find(u => u.u === state.adminEditUser));
  if (!user?.u) return "";
  const stat = state.userStats[user.u] || {};
  const roles = ROLES_USUARIO.map(r => `<option ${user.rol === r ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<div class="modal-backdrop" data-admin-user-modal>
    <div class="modal-card user-modal-card area-user-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <div>
          <div class="section-title">Editar usuario</div>
          <h2 style="margin:4px 0 0">${esc(user.nombre)}</h2>
          <div style="color:var(--txt2);font-size:12px;margin-top:4px">Administra cuenta, rol, área/célula y datos personales.</div>
        </div>
        <button class="btn ghost" data-admin-edit-close>Cerrar</button>
      </div>

      <div class="area-modal-banner">
        <div>
          <div class="area-modal-title">Área asignada</div>
          <div class="area-modal-text">Este dato define qué inventario puede ver el usuario.</div>
        </div>
        ${areaBadgeHTML(user.area)}
      </div>

      <div class="profile-grid">
        <div class="field"><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${user.u === "admin" ? "readonly" : ""}></div>
        <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div>
        <div class="field"><label>Nueva contraseña (opcional)</label><input class="input" data-keep-case="true" data-admin-edit-pass type="password" value="" placeholder="Dejar en blanco para mantener"></div>
        <div class="field"><label>Rol</label><select class="input" data-admin-edit-rol>${roles}</select></div>
        <div class="field"><label>Estado</label><select class="input" data-admin-edit-activo ${user.u === "admin" ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div>
        <div class="field"><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px">Datos laborales y contacto</div>
        <div class="profile-grid">
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" data-admin-edit-cargo value="${valorPerfil(user, "cargo")}"></div>
          <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ value: user.area, includeAdd: true, dataAttr: "data-admin-edit-area" })}</div>
          <div class="field" data-admin-edit-area-add-wrap style="display:none"><label>Nueva área / célula</label><input class="input" data-keep-case="true" data-admin-edit-area-add placeholder="Ej: Envase B, Logística, Centro Norte"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" data-admin-edit-turno value="${valorPerfil(user, "turno")}"></div>
          <div class="field"><label>Teléfono</label><input class="input" data-keep-case="true" data-admin-edit-telefono value="${valorPerfil(user, "telefono")}"></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" data-admin-edit-correo value="${valorPerfil(user, "correo")}"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" data-admin-edit-direccion value="${valorPerfil(user, "direccion")}"></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px;color:${C.red}">Emergencia</div>
        <div class="profile-grid">
          <div class="field"><label>Contacto emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-nombre value="${valorPerfil(user, "contactoEmergenciaNombre")}"></div>
          <div class="field"><label>Relación</label><input class="input" data-keep-case="true" data-admin-edit-emerg-relacion value="${valorPerfil(user, "contactoEmergenciaRelacion")}"></div>
          <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-telefono value="${valorPerfil(user, "contactoEmergenciaTelefono")}"></div>
          <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" data-admin-edit-observaciones rows="3">${valorPerfil(user, "observacionesContacto")}</textarea></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title">Uso del sistema</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--txt2);font-size:12px;margin-top:8px">
          <div>Último uso: <b>${esc(stat.lastSeen || "-")}</b></div>
          <div>Tiempo de uso: <b>${esc(formatDuration(tiempoUsuarioMs(user.u)))}</b></div>
        </div>
      </div>
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div>
  </div>`;
};

perfilUsuarioHTML = function() {
  const u = normalizarUsuario(state.usuarios.find(x => x.u === state.user?.u) || state.user || {});
  return `
    <div class="box profile-soft-box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="section-title">Mi perfil</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">${esc(u.nombre)}</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Puedes actualizar tus datos de contacto. El área/célula queda bloqueada y la modifica solo el Administrador.</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag" style="color:${C.cyan};background:#00d4ff22;border-color:#00d4ff55">${esc(u.rol)}</span>${areaBadgeHTML(u.area)}</div>
      </div>
      <form id="perfilUsuarioForm" class="profile-form">
        <div class="profile-grid">
          <div class="field"><label>Usuario</label><input class="input" readonly value="${esc(u.u)}"></div>
          <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" name="nombre" value="${esc(u.nombre)}"></div>
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" name="cargo" value="${valorPerfil(u, "cargo")}" placeholder="Ej: Operador Envase"></div>
          <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ value: u.area, disabled: true })}<input type="hidden" name="area" value="${esc(u.area)}"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" name="turno" value="${valorPerfil(u, "turno")}" placeholder="Ej: Turno A / 7x7"></div>
          <div class="field"><label>Teléfono personal</label><input class="input" data-keep-case="true" name="telefono" value="${valorPerfil(u, "telefono")}" placeholder="+56 9 ...."></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" name="correo" value="${valorPerfil(u, "correo")}" placeholder="correo@empresa.cl"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" name="direccion" value="${valorPerfil(u, "direccion")}" placeholder="Dirección de contacto"></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="section-title" style="margin-bottom:10px;color:${C.red}">Contacto de emergencia</div>
          <div class="profile-grid">
            <div class="field"><label>Nombre contacto</label><input class="input" data-keep-case="true" name="contactoEmergenciaNombre" value="${valorPerfil(u, "contactoEmergenciaNombre")}" placeholder="Nombre y apellido"></div>
            <div class="field"><label>Relación</label><input class="input" data-keep-case="true" name="contactoEmergenciaRelacion" value="${valorPerfil(u, "contactoEmergenciaRelacion")}" placeholder="Ej: Madre / Pareja / Hermano"></div>
            <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" name="contactoEmergenciaTelefono" value="${valorPerfil(u, "contactoEmergenciaTelefono")}" placeholder="+56 9 ...."></div>
            <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" name="observacionesContacto" rows="3" placeholder="Alergias, restricciones o notas relevantes">${valorPerfil(u, "observacionesContacto")}</textarea></div>
          </div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:14px">Guardar mi perfil</button>
      </form>
    </div>
  `;
};

bindAdmin = function() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    state.adminView = btn.dataset.adminView;
    render();
  }));
  const toggleAddWrap = (sel, wrap) => {
    if (!sel || !wrap) return;
    const run = () => { wrap.style.display = sel.value === "__add__" ? "block" : "none"; };
    sel.addEventListener("change", run);
    run();
  };
  toggleAddWrap(document.querySelector("#newUserArea"), document.querySelector("#newUserAreaAddWrap"));
  toggleAddWrap(document.querySelector("[data-admin-edit-area]"), document.querySelector("[data-admin-edit-area-add-wrap]"));

  document.querySelector("#crearUsuario")?.addEventListener("click", () => {
    const u = (document.querySelector("#newUserU")?.value || "").trim().toLowerCase();
    const nombre = (document.querySelector("#newUserNombre")?.value || "").trim();
    const p = document.querySelector("#newUserPass")?.value || "";
    const rol = document.querySelector("#newUserRol")?.value || "Operador";
    const cargo = (document.querySelector("#newUserCargo")?.value || "").trim();
    const areaSel = (document.querySelector("#newUserArea")?.value || "").trim();
    const areaNueva = (document.querySelector("#newUserAreaAdd")?.value || "").trim();
    const area = areaSel === "__add__" ? areaNueva : areaSel;
    if (!u || !nombre || !p) return alert("Completa usuario, nombre y contraseña.");
    if (!area) return alert("Selecciona el área / célula del usuario.");
    if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área / célula.");
    if (!/^[a-z0-9._-]{3,24}$/.test(u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (state.usuarios.some(x => x.u === u)) return alert("Ese usuario ya existe.");
    const nuevo = normalizarUsuario({ u, nombre, p, rol, cargo, area, areaCelula: area, creado: hoy(), activo: true });
    state.usuarios.push(nuevo);
    ensureUserStat(nuevo);
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario creado", u, `${rol} · ${area}`, C.green);
    render();
  });
  document.querySelectorAll("[data-admin-edit]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = btn.dataset.adminEdit;
    render();
  }));
  document.querySelectorAll("[data-admin-edit-close]").forEach(btn => btn.addEventListener("click", () => { state.adminEditUser = ""; render(); }));
  document.querySelector("[data-admin-edit-save]")?.addEventListener("click", () => {
    const oldU = state.adminEditUser;
    const old = state.usuarios.find(u => u.u === oldU);
    if (!old) return;
    const nextU = old.u === "admin" ? "admin" : (document.querySelector("[data-admin-edit-u]")?.value || "").trim().toLowerCase();
    const areaSel = (document.querySelector("[data-admin-edit-area]")?.value || "").trim();
    const areaNueva = (document.querySelector("[data-admin-edit-area-add]")?.value || "").trim();
    const area = areaSel === "__add__" ? areaNueva : areaSel;
    const patch = {
      u: nextU,
      nombre: (document.querySelector("[data-admin-edit-nombre]")?.value || "").trim(),
      p: document.querySelector("[data-admin-edit-pass]")?.value || old.p || "",
      rol: document.querySelector("[data-admin-edit-rol]")?.value || "Operador",
      activo: old.u === "admin" ? true : document.querySelector("[data-admin-edit-activo]")?.value !== "false",
      cargo: (document.querySelector("[data-admin-edit-cargo]")?.value || "").trim(),
      area,
      areaCelula: area,
      turno: (document.querySelector("[data-admin-edit-turno]")?.value || "").trim(),
      telefono: (document.querySelector("[data-admin-edit-telefono]")?.value || "").trim(),
      correo: (document.querySelector("[data-admin-edit-correo]")?.value || "").trim(),
      direccion: (document.querySelector("[data-admin-edit-direccion]")?.value || "").trim(),
      contactoEmergenciaNombre: (document.querySelector("[data-admin-edit-emerg-nombre]")?.value || "").trim(),
      contactoEmergenciaRelacion: (document.querySelector("[data-admin-edit-emerg-relacion]")?.value || "").trim(),
      contactoEmergenciaTelefono: (document.querySelector("[data-admin-edit-emerg-telefono]")?.value || "").trim(),
      observacionesContacto: (document.querySelector("[data-admin-edit-observaciones]")?.value || "").trim(),
    };
    if (!patch.u || !patch.nombre || !patch.p) return alert("Completa usuario, nombre y contraseña.");
    if (!patch.area) return alert("Selecciona el área / célula del usuario.");
    if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área / célula.");
    if (!/^[a-z0-9._-]{3,24}$/.test(patch.u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (patch.u !== oldU && state.usuarios.some(u => u.u === patch.u)) return alert("Ese usuario ya existe.");
    const next = normalizarUsuario({ ...old, ...patch });
    state.usuarios = state.usuarios.map(u => u.u === oldU ? next : u);
    if (patch.u !== oldU && state.userStats[oldU]) {
      state.userStats[patch.u] = state.userStats[oldU];
      delete state.userStats[oldU];
      state.lotes = state.lotes.map(l => l.createdBy === oldU ? { ...l, createdBy: patch.u, createdByName: next.nombre } : l);
      state.avisos = (state.avisos || []).map(a => a.autor === oldU ? { ...a, autor: patch.u, autorNombre: next.nombre } : a);
      save("oxmo:lotes", state.lotes);
      save("oxmo:avisos", state.avisos || []);
    }
    if (state.user?.u === oldU) { state.user = next; save("oxmo:user", state.user); }
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario modificado", next.u, `${next.nombre} · ${next.area}`, C.cyan);
    state.adminEditUser = "";
    render();
  });
  document.querySelectorAll("[data-admin-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminToggle;
    state.usuarios = state.usuarios.map(x => x.u === u ? { ...x, activo: x.activo === false } : x);
    saveUsuarios();
    addHist("Estado de usuario modificado", u, "", C.yellow);
    render();
  }));
  document.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminDel;
    if (!confirm(`¿Eliminar cuenta ${u}?`)) return;
    state.usuarios = state.usuarios.filter(x => x.u !== u);
    delete state.userStats[u];
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario eliminado", u, "", C.red);
    render();
  }));
};

function withScopedLotesHTML(fn) {
  if (areaTrabajoEsGlobal()) return fn();
  const original = state.lotes;
  state.lotes = lotesPorAreaTrabajo(original);
  try { return fn(); }
  finally { state.lotes = original; }
}

const shellHTMLAreaV2 = shellHTML;
shellHTML = function() {
  if (!state.user || areaTrabajoEsGlobal()) return shellHTMLAreaV2();
  return withScopedLotesHTML(shellHTMLAreaV2);
};

const tabHTMLAreaV2 = tabHTML;
tabHTML = function() {
  if (!state.user || areaTrabajoEsGlobal() || state.tab === "admin") return tabHTMLAreaV2();
  return withScopedLotesHTML(tabHTMLAreaV2);
};

const registroHTMLAreaV2 = registroHTML;
registroHTML = function() {
  if (!state.user || areaTrabajoEsGlobal()) return registroHTMLAreaV2();
  return withScopedLotesHTML(registroHTMLAreaV2);
};

const gerenteDashboardDataAreaV2 = gerenteDashboardData;
gerenteDashboardData = function() {
  // Gerente siempre ve el total consolidado; esta línea deja explícito el totalizado.
  return gerenteDashboardDataAreaV2();
};

/* =========================================================
   AREA_CELULA_V9_FIX_20260626
   - Usuarios no globales fuera de Envase: solo Inventario + Mi perfil.
   - Usuarios no globales pueden crear/editar inventarios de su área.
   - Roles globales ven totalizado: Administrador, Gerente, Jefe de planta, Super intendente/Superintendente.
   - Área/Célula en usuarios como lista desplegable administrada por Admin.
   - Inventario sin área queda asociado a Envase.
   - Restauración robusta de Infodia/ACP: comunes OO300/O0300 + silos llenados por fecha.
   ========================================================= */

function normalizarRolAreaV9(user = state.user) {
  return String(user?.rol || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizarTextoAreaV9(v) {
  return String(v || "").trim();
}

areaTrabajoDefault = function() {
  return AREA_CELULA_DEFAULT || "Envase";
};

areaTrabajoUsuario = function(user = state.user) {
  return normalizarTextoAreaV9(user?.areaCelula || user?.area) || areaTrabajoDefault();
};

areaTrabajoEsGlobal = function(user = state.user) {
  const rol = normalizarRolAreaV9(user);
  return ["administrador", "gerente", "jefe de planta", "super intendente", "superintendente"].includes(rol) || isAdmin(user) || isGerente(user);
};

function areaEsEnvaseV9(user = state.user) {
  return normalizarTextoAreaV9(areaTrabajoUsuario(user)).toLowerCase() === String(areaTrabajoDefault()).toLowerCase();
}

function usuarioAreaLimitadaV9(user = state.user) {
  return !!user && !areaTrabajoEsGlobal(user) && !areaEsEnvaseV9(user);
}

areaTrabajoLote = function(lote = {}) {
  const explicit = normalizarTextoAreaV9(lote.areaCelula || lote.areaTrabajo || lote.area);
  if (explicit) return explicit;
  const creatorKey = String(lote.createdBy || "").trim().toLowerCase();
  const creador = (state.usuarios || []).map(normalizarUsuario).find(u => u.u === creatorKey);
  return creador ? areaTrabajoUsuario(creador) : areaTrabajoDefault();
};

areasTrabajoCatalogo = function() {
  const areas = [
    areaTrabajoDefault(),
    ...(state.usuarios || []).map(u => normalizarUsuario(u).areaCelula || normalizarUsuario(u).area).filter(Boolean),
    ...(state.lotes || []).map(l => normalizarTextoAreaV9(l.areaCelula || l.areaTrabajo || l.area)).filter(Boolean),
  ];
  return [...new Set(areas.map(normalizarTextoAreaV9).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
};

areaTrabajoCatalogo = function() {
  return areasTrabajoCatalogo();
};

areaTrabajoOptionsHTML = function(selected = "", { includeAdd = false } = {}) {
  const sel = normalizarTextoAreaV9(selected) || areaTrabajoDefault();
  const options = areasTrabajoCatalogo();
  if (sel && !options.includes(sel)) options.push(sel);
  return options.map(a => `<option value="${esc(a)}" ${a === sel ? "selected" : ""}>${esc(a)}</option>`).join("")
    + (includeAdd ? `<option value="__add__">+ Añadir área / célula...</option>` : "");
};

renderAreaSelectHTML = function({ id = "", name = "", value = "", dataAttr = "", includeAdd = false, disabled = false } = {}) {
  const attrId = id ? `id="${esc(id)}"` : "";
  const attrName = name ? `name="${esc(name)}"` : "";
  const attrData = dataAttr ? `${dataAttr}` : "";
  return `<select ${attrId} ${attrName} class="input area-select" data-keep-case="true" ${attrData} ${disabled ? "disabled" : ""}>${areaTrabajoOptionsHTML(value, { includeAdd })}</select>`;
};

function migrarAreaCelulaV9() {
  let changedUsers = false;
  state.usuarios = (state.usuarios || []).map(u => {
    const nu = normalizarUsuario(u || {});
    const area = normalizarTextoAreaV9(nu.areaCelula || nu.area) || areaTrabajoDefault();
    if (nu.area !== area || nu.areaCelula !== area) changedUsers = true;
    return { ...nu, area, areaCelula: area };
  });

  if (state.user) {
    const area = normalizarTextoAreaV9(state.user.areaCelula || state.user.area) || areaTrabajoDefault();
    if (state.user.area !== area || state.user.areaCelula !== area) {
      state.user = normalizarUsuario({ ...state.user, area, areaCelula: area });
      save("oxmo:user", state.user);
    }
  }

  let changedLotes = false;
  state.lotes = (state.lotes || []).map(l => {
    const area = normalizarTextoAreaV9(l.areaCelula || l.areaTrabajo || l.area) || areaTrabajoDefault();
    if (l.areaCelula === area && l.areaTrabajo === area) return l;
    changedLotes = true;
    return { ...l, areaCelula: area, areaTrabajo: area };
  });

  if (changedUsers) saveUsuarios();
  if (changedLotes) save("oxmo:lotes", state.lotes);
}

function lotesVisiblesAreaV9(lotes = state.lotes, user = state.user) {
  const source = Array.isArray(lotes) ? lotes : [];
  if (!user || areaTrabajoEsGlobal(user)) return source;
  const area = areaTrabajoUsuario(user);
  return source.filter(l => areaTrabajoLote(l) === area);
}

function areaBadgeHTMLV9(area, subtle = false) {
  return `<span class="area-chip ${subtle ? "subtle" : ""}">${esc(area || areaTrabajoDefault())}</span>`;
}
areaBadgeHTML = areaBadgeHTMLV9;

function areaScopeNoticeV9() {
  if (!state.user) return "";
  if (areaTrabajoEsGlobal()) {
    const areas = areasTrabajoCatalogo().map(a => areaBadgeHTML(a, true)).join(" ");
    return `<div class="area-scope-card"><div><b>Totalizado general</b><span>Vista consolidada de todas las áreas/células.</span></div><div class="area-chip-list">${areas}</div></div>`;
  }
  const area = areaTrabajoUsuario();
  const extra = areaEsEnvaseV9() ? "Área Envase: acceso según rol asignado." : "Área independiente: solo Inventario y Mi perfil.";
  return `<div class="area-scope-card"><div><b>${esc(area)}</b><span>${esc(extra)}</span></div>${areaBadgeHTML(area)}</div>`;
}

canViewTab = function(id, user = state.user) {
  if (!user) return false;
  if (isGerente(user)) return ["gerencial", "perfil"].includes(id);
  if (usuarioAreaLimitadaV9(user)) return ["inventario", "registro", "perfil"].includes(id);
  return canViewTabAnteriorGerente(id, user);
};

visibleTabs = function() {
  if (state.user && usuarioAreaLimitadaV9()) {
    return [["inventario", "Inventario"], ["perfil", "Mi perfil"]];
  }
  return visibleTabsAnteriorGerente();
};

shellHTML = function() {
  // El encabezado/KPIs también se acota al área para evitar que usuarios
  // operativos vean totales de otras células. No afecta Silos/Infodia
  // porque esos módulos se renderizan después y sin reemplazar state.lotes.
  if (!state.user || areaTrabajoEsGlobal()) return shellHTMLAreaV2();
  return withScopedLotesHTML(shellHTMLAreaV2);
};

tabHTML = function() {
  if (state.tab === "inventario") return inventarioHTML();
  if (state.tab === "registro") return registroHTML();
  return tabHTMLAreaV2();
};

canEditLot = function(l, user = state.user) {
  if (!l || !user) return false;
  if (!areaTrabajoEsGlobal(user) && areaTrabajoLote(l) !== areaTrabajoUsuario(user)) return false;
  return canEditLotAreaV2(l, user);
};

inventarioHTML = function() {
  const base = lotesVisiblesAreaV9(state.lotes);
  const ordered = lotesRecientesAnteriorAreaCelula(base);
  const lotes = state.filtro === "Todos" ? ordered : ordered.filter(l => l.estado === state.filtro);
  const selected = new Set(state.inventorySelected || []);
  const editableIds = lotes.filter(l => canEditLot(l)).map(l => l.id);
  const dist = allSectores().map(s => ({
    s,
    v: base.filter(l => l.sector === s).reduce((a, l) => a + Number(l.masa || 0), 0)
  })).filter(d => d.v > 0);
  const max = Math.max(1, ...dist.map(d => d.v));
  return `
    ${areaScopeNoticeV9()}
    <div class="filters filters-soft">
      ${["Todos", "Disponible", "Bloqueado", "Pendiente", "Fuera Esp"].map(f => `<button class="pill ${state.filtro === f ? "active" : ""}" data-filter="${f}">${f} (${f === "Todos" ? base.length : base.filter(l => l.estado === f).length})</button>`).join("")}
      ${selected.size ? `<button class="pill" id="deleteSelectedLots" style="border-color:#ff456055;color:var(--red)">Eliminar seleccionados (${selected.size})</button>` : ""}
      <button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button>
    </div>
    <div class="table-wrap inventory-soft-table">
      <table>
        <thead><tr><th><input id="invSelectAll" type="checkbox" ${editableIds.length && editableIds.every(id => selected.has(id)) ? "checked" : ""}></th>${["ID", "Área", "Tipo", "Masa", "Sector", "Cu%", "Mo%", "S%", "Clasif.", "Estado", "Fecha", ""].map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${lotes.length ? lotes.map(l => rowHTMLAreaV9(l)).join("") : `<tr><td colspan="12" style="text-align:center;color:var(--txt2);padding:26px">Sin inventario registrado para esta área/célula. Usa <b>+ Nuevo lote</b> para cargar tu primer registro.</td></tr>`}</tbody>
      </table>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Por sector</div>
        ${dist.length ? dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${esc(d.s)}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v / max) * 100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v, 1)}</span></div>`).join("") : `<span style="color:var(--txt3);font-size:12px">Sin inventario en esta área.</span>`}
      </div>
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Estados</div>
        ${["Disponible", "Bloqueado", "Pendiente", "Fuera Esp"].map(e => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2e4a33"><span style="color:${eColor(e)}">● ${e}</span><span class="mono" style="font-weight:800">${base.filter(l => l.estado === e).length}</span></div>`).join("")}
      </div>
    </div>
  `;
};

function rowHTMLAreaV9(l) {
  const { clase, color } = clasificar(l);
  const selected = (state.inventorySelected || []).includes(l.id);
  const select = canEditLot(l) ? `<input type="checkbox" data-inv-select="${esc(l.id)}" ${selected ? "checked" : ""}>` : "";
  const labelAction = `<button class="icon-btn" data-label-lot="${esc(l.id)}" title="Imprimir etiqueta">▦</button>`;
  const actions = canEditLot(l)
    ? `<div class="mini-actions">${labelAction}<button class="icon-btn" data-edit="${esc(l.id)}">✏</button><button class="icon-btn" data-del="${esc(l.id)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button></div>`
    : `<div class="mini-actions">${labelAction}</div>`;
  return `<tr>
    <td>${select}</td>
    <td class="mono" style="color:var(--blue-light);font-weight:800">${esc(l.id)}</td>
    <td>${areaBadgeHTML(areaTrabajoLote(l), true)}</td>
    <td style="color:var(--txt2)">${esc(l.tipo)}</td>
    <td class="mono">${kgToTon(l.masa, 3)}</td>
    <td><span class="tag" style="color:var(--blue-light);background:#0f3a6e">${esc(l.sector)}</span></td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.cu >= 0.51 ? C.copper : C.green}">${hasAnalysis(l) ? l.cu : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.mo >= moMinimo(l.cu) ? C.green : C.red}">${hasAnalysis(l) ? l.mo : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.s < 0.1 ? C.green : C.red}">${hasAnalysis(l) ? l.s : "—"}</td>
    <td><span class="tag" style="background:${color}22;color:${color};border-color:${color}44">${clase}</span></td>
    <td style="color:${eColor(l.estado)}">● ${esc(l.estado)}</td>
    <td class="mono" style="color:var(--txt3);font-size:10px">${esc(l.fecha)}</td>
    <td>${actions}</td>
  </tr>`;
}

registroHTML = function() {
  const area = state.editando ? areaTrabajoLote(state.editando) : areaTrabajoUsuario();
  return `<div class="area-scope-card"><div><b>Registro en área/célula</b><span>El lote quedará asociado a ${esc(area)}. Solo usuarios de esta área y roles globales podrán verlo.</span></div>${areaBadgeHTML(area)}</div>${registroHTMLAreaV2()}`;
};

// Infodia/ACP robusto: acepta OO300-001 y O0300-001 como comunes de turno.
tipoAnalisisACP = function(codigo) {
  codigo = normalizarCodigoAnalisis(codigo);
  if (/^O[O0]300-001-\d+-\d{2}$/.test(codigo)) return "comun_turno";
  if (/^OXMO\d+-\d{2}$/.test(codigo)) return "lote_oxmo";
  if (/^OXBR\d+-\d{2}$/.test(codigo)) return "briqueta";
  if (codigo.includes("OSAC") && /-\d{2}$/.test(codigo)) return "lote_osac";
  if (/^[A-Z]{2,12}\d+-\d{2}$/.test(codigo)) return "otro_lote";
  return "";
};

buildSiloHistorial = function(days, analisis) {
  const byDate = new Map();
  for (const a of analisis || []) {
    if (!byDate.has(a.fecha)) byDate.set(a.fecha, []);
    byDate.get(a.fecha).push(a);
  }
  const out = [];
  for (const day of [...(days || [])].sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")))) {
    const comunesDia = byDate.get(day.fecha) || [];
    for (const s of day.silos || []) {
      const comunes = comunesParaTurno(comunesDia, s.turno);
      const promedio = promedioAnalisis(comunes);
      const llenado = Number(s.llenadoT || 0);
      const descarga = Number(s.descargaT || 0);
      const masaFinal = Number(s.masa || 0);
      const tieneComun = comunes.length > 0 && hasAnalysis(promedio);
      const caracter = tieneComun && llenado > 0 ? { cu: promedio.cu, mo: promedio.mo, s: promedio.s } : { cu: 0, mo: 0, s: 0 };
      const movimiento = llenado > 0 ? "Llenado" : descarga > 0 ? "Descarga" : "Nivel";
      const rec = {
        fecha: day.fecha,
        siloId: s.id,
        silo: s.silo,
        turno: s.turno,
        horaInicio: s.horaInicio,
        horaTermino: s.horaTermino,
        movimiento,
        nivelInicial: Number(s.nivelInicial || 0),
        masaLlenado: llenado,
        masaDescarga: descarga,
        masaFinal,
        nivelFinal: Number(s.finalNivel || 0),
        comunes: comunes.map(c => c.codigo),
        comunCu: promedio.cu,
        comunMo: promedio.mo,
        comunS: promedio.s,
        cu: caracter.cu,
        mo: caracter.mo,
        s: caracter.s,
      };
      const finalRec = { ...rec, ...clasificar(rec) };
      if (tieneComun && llenado > 0 && hasAnalysis(finalRec)) out.push(finalRec);
    }
  }
  return out;
};

// Cuando ya existe Infodia cargado, recalcula siloHistorial con la lógica corregida
// sin tocar niveles ni inventario. Si la importación antigua no guardó analisis OO300,
// basta reimportar el Infodia para repoblar comunes.
function recalcularSiloHistorialInfodiaV9() {
  if (!state.infodia?.days?.length || !state.infodia?.analisisACP?.length) return false;
  const analisis = (state.infodia.analisisACP || []).filter(a => tipoAnalisisACP(a.codigo) === "comun_turno").map(a => ({ ...a, tipoAnalisis: "comun_turno" }));
  const siloHistorial = buildSiloHistorial(state.infodia.days, analisis);
  state.infodia = { ...state.infodia, analisis, siloHistorial };
  state.siloHistorial = siloHistorial;
  save("oxmo:infodia", state.infodia);
  save("oxmo:siloHistorial", state.siloHistorial);
  return true;
}

adminUsersHTML = function(rows) {
  const usuarios = rows.map(r => normalizarUsuario(r.u || r));
  const roleOptions = ROLES_USUARIO.map(r => `<option>${esc(r)}</option>`).join("");
  const areas = areasTrabajoCatalogo();
  return `
    <div class="area-admin-shell">
      <div class="area-admin-card create-user-card">
        <div class="section-title">Crear cuenta</div>
        <div class="area-help">Cada usuario queda asociado a un área/célula. Usuarios de otras áreas solo ven su inventario y su perfil.</div>
        <div class="field"><label>Usuario</label><input id="newUserU" class="input" data-keep-case="true" placeholder="ej: turno_a"></div>
        <div class="field"><label>Nombre</label><input id="newUserNombre" class="input" data-keep-case="true" placeholder="Nombre visible"></div>
        <div class="field"><label>Contraseña inicial</label><input id="newUserPass" data-keep-case="true" type="password" class="input" placeholder="Contraseña inicial"></div>
        <div class="field"><label>Rol</label><select id="newUserRol" class="input">${roleOptions}</select></div>
        <div class="field"><label>Cargo</label><input id="newUserCargo" class="input" data-keep-case="true" placeholder="Opcional"></div>
        <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ id: "newUserArea", value: areaTrabajoDefault(), includeAdd: true })}</div>
        <div class="field" id="newUserAreaAddWrap" style="display:none"><label>Nueva área / célula</label><input id="newUserAreaAdd" class="input" data-keep-case="true" placeholder="Ej: Envase B, Logística, Centro Norte"></div>
        <button class="btn primary" id="crearUsuario" style="width:100%;margin-top:4px">Crear usuario</button>
      </div>
      <div class="area-admin-card users-list-card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px">
          <div>
            <div class="section-title">Cuentas creadas — ${usuarios.length}</div>
            <div class="area-help">Áreas activas: ${areas.map(a => areaBadgeHTML(a, true)).join(" ")}</div>
          </div>
        </div>
        <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Área / célula</th><th>Estado</th><th>Último uso</th><th>Control</th></tr></thead><tbody>
          ${usuarios.map(u => {
            const stat = state.userStats[u.u] || {};
            return `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td>${areaBadgeHTML(u.area)}</td>
              
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Deshabilitado"}</td>
              <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">
                <button class="icon-btn" data-admin-edit="${esc(u.u)}">Editar</button>
                ${u.u !== "admin" && u.u !== userKey() ? `<button class="icon-btn" data-admin-toggle="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button><button class="icon-btn" data-admin-del="${esc(u.u)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}
              </div></td>
            </tr>`;
          }).join("")}
        </tbody></table></div>
      </div>
    </div>
    ${adminUserModalHTML()}
  `;
};

adminUserModalHTML = function() {
  const user = normalizarUsuario(state.usuarios.find(u => u.u === state.adminEditUser));
  if (!user?.u) return "";
  const stat = state.userStats[user.u] || {};
  const roles = ROLES_USUARIO.map(r => `<option ${user.rol === r ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<div class="modal-backdrop" data-admin-user-modal>
    <div class="modal-card user-modal-card area-user-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <div>
          <div class="section-title">Editar usuario</div>
          <h2 style="margin:4px 0 0">${esc(user.nombre)}</h2>
          <div style="color:var(--txt2);font-size:12px;margin-top:4px">Administra cuenta, rol, área/célula y datos personales. La contraseña solo se reemplaza si escribes una nueva.</div>
        </div>
        <button class="btn ghost" data-admin-edit-close>Cerrar</button>
      </div>

      <div class="area-modal-banner">
        <div>
          <div class="area-modal-title">Área asignada</div>
          <div class="area-modal-text">Define qué inventario puede ver el usuario.</div>
        </div>
        ${areaBadgeHTML(user.area)}
      </div>

      <div class="profile-grid">
        <div class="field"><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${user.u === "admin" ? "readonly" : ""}></div>
        <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div>
        <div class="field"><label>Nueva contraseña (opcional)</label><input class="input" data-keep-case="true" data-admin-edit-pass type="password" value="" placeholder="Dejar en blanco para mantener"></div>
        <div class="field"><label>Rol</label><select class="input" data-admin-edit-rol>${roles}</select></div>
        <div class="field"><label>Estado</label><select class="input" data-admin-edit-activo ${user.u === "admin" ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div>
        <div class="field"><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px">Datos laborales y contacto</div>
        <div class="profile-grid">
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" data-admin-edit-cargo value="${valorPerfil(user, "cargo")}"></div>
          <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ value: user.area, dataAttr: "data-admin-edit-area", includeAdd: true })}</div>
          <div class="field" data-admin-edit-area-add-wrap style="display:none"><label>Nueva área / célula</label><input class="input" data-keep-case="true" data-admin-edit-area-add placeholder="Ej: Envase B, Logística, Centro Norte"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" data-admin-edit-turno value="${valorPerfil(user, "turno")}"></div>
          <div class="field"><label>Teléfono</label><input class="input" data-keep-case="true" data-admin-edit-telefono value="${valorPerfil(user, "telefono")}"></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" data-admin-edit-correo value="${valorPerfil(user, "correo")}"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" data-admin-edit-direccion value="${valorPerfil(user, "direccion")}"></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px;color:${C.red}">Emergencia</div>
        <div class="profile-grid">
          <div class="field"><label>Contacto emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-nombre value="${valorPerfil(user, "contactoEmergenciaNombre")}"></div>
          <div class="field"><label>Relación</label><input class="input" data-keep-case="true" data-admin-edit-emerg-relacion value="${valorPerfil(user, "contactoEmergenciaRelacion")}"></div>
          <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-telefono value="${valorPerfil(user, "contactoEmergenciaTelefono")}"></div>
          <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" data-admin-edit-observaciones rows="3">${valorPerfil(user, "observacionesContacto")}</textarea></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--txt2);font-size:12px;margin-top:8px">
          <div>Último uso: <b>${esc(stat.lastSeen || "-")}</b></div>
          <div>Tiempo de uso: <b>${esc(formatDuration(tiempoUsuarioMs(user.u)))}</b></div>
        </div>
      </div>
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div>
  </div>`;
};

bindAdmin = function() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    state.adminView = btn.dataset.adminView;
    render();
  }));
  const toggleAddWrap = (sel, wrap) => {
    if (!sel || !wrap) return;
    const run = () => { wrap.style.display = sel.value === "__add__" ? "block" : "none"; };
    sel.addEventListener("change", run);
    run();
  };
  toggleAddWrap(document.querySelector("#newUserArea"), document.querySelector("#newUserAreaAddWrap"));
  toggleAddWrap(document.querySelector("[data-admin-edit-area]"), document.querySelector("[data-admin-edit-area-add-wrap]"));

  document.querySelector("#crearUsuario")?.addEventListener("click", () => {
    const u = (document.querySelector("#newUserU")?.value || "").trim().toLowerCase();
    const nombre = (document.querySelector("#newUserNombre")?.value || "").trim();
    const p = document.querySelector("#newUserPass")?.value || "";
    const rol = document.querySelector("#newUserRol")?.value || "Operador";
    const cargo = (document.querySelector("#newUserCargo")?.value || "").trim();
    const areaSel = (document.querySelector("#newUserArea")?.value || "").trim();
    const areaNueva = (document.querySelector("#newUserAreaAdd")?.value || "").trim();
    const area = areaSel === "__add__" ? areaNueva : areaSel;
    if (!u || !nombre || !p) return alert("Completa usuario, nombre y contraseña.");
    if (!area) return alert("Selecciona el área / célula del usuario.");
    if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área / célula.");
    if (!/^[a-z0-9._-]{3,24}$/.test(u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (state.usuarios.some(x => x.u === u)) return alert("Ese usuario ya existe.");
    const nuevo = normalizarUsuario({ u, nombre, p, rol, cargo, area, areaCelula: area, creado: hoy(), activo: true });
    state.usuarios.push(nuevo);
    ensureUserStat(nuevo);
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario creado", u, `${rol} · ${area}`, C.green);
    render();
  });

  document.querySelectorAll("[data-admin-edit]").forEach(btn => btn.addEventListener("click", () => {
    state.adminEditUser = btn.dataset.adminEdit;
    render();
  }));
  document.querySelectorAll("[data-admin-edit-close]").forEach(btn => btn.addEventListener("click", () => { state.adminEditUser = ""; render(); }));
  document.querySelector("[data-admin-edit-save]")?.addEventListener("click", () => {
    const oldU = state.adminEditUser;
    const old = state.usuarios.find(u => u.u === oldU);
    if (!old) return;
    const nextU = old.u === "admin" ? "admin" : (document.querySelector("[data-admin-edit-u]")?.value || "").trim().toLowerCase();
    const areaSel = (document.querySelector("[data-admin-edit-area]")?.value || "").trim();
    const areaNueva = (document.querySelector("[data-admin-edit-area-add]")?.value || "").trim();
    const area = areaSel === "__add__" ? areaNueva : areaSel;
    const patch = {
      u: nextU,
      nombre: (document.querySelector("[data-admin-edit-nombre]")?.value || "").trim(),
      p: document.querySelector("[data-admin-edit-pass]")?.value || old.p || "",
      rol: document.querySelector("[data-admin-edit-rol]")?.value || "Operador",
      activo: old.u === "admin" ? true : document.querySelector("[data-admin-edit-activo]")?.value !== "false",
      cargo: (document.querySelector("[data-admin-edit-cargo]")?.value || "").trim(),
      area,
      areaCelula: area,
      turno: (document.querySelector("[data-admin-edit-turno]")?.value || "").trim(),
      telefono: (document.querySelector("[data-admin-edit-telefono]")?.value || "").trim(),
      correo: (document.querySelector("[data-admin-edit-correo]")?.value || "").trim(),
      direccion: (document.querySelector("[data-admin-edit-direccion]")?.value || "").trim(),
      contactoEmergenciaNombre: (document.querySelector("[data-admin-edit-emerg-nombre]")?.value || "").trim(),
      contactoEmergenciaRelacion: (document.querySelector("[data-admin-edit-emerg-relacion]")?.value || "").trim(),
      contactoEmergenciaTelefono: (document.querySelector("[data-admin-edit-emerg-telefono]")?.value || "").trim(),
      observacionesContacto: (document.querySelector("[data-admin-edit-observaciones]")?.value || "").trim(),
    };
    if (!patch.u || !patch.nombre || !patch.p) return alert("Completa usuario, nombre y contraseña.");
    if (!patch.area) return alert("Selecciona el área / célula del usuario.");
    if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área / célula.");
    if (!/^[a-z0-9._-]{3,24}$/.test(patch.u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
    if (patch.u !== oldU && state.usuarios.some(u => u.u === patch.u)) return alert("Ese usuario ya existe.");
    const cambiosCriticos = [
      old.u !== patch.u ? `usuario: ${old.u} → ${patch.u}` : "",
      old.nombre !== patch.nombre ? `nombre: ${old.nombre} → ${patch.nombre}` : "",
      old.rol !== patch.rol ? `rol: ${old.rol} → ${patch.rol}` : "",
      areaTrabajoUsuario(old) !== patch.area ? `área: ${areaTrabajoUsuario(old)} → ${patch.area}` : "",
      old.p !== patch.p ? "contraseña: modificada" : "",
      old.activo !== patch.activo ? `estado: ${old.activo !== false ? "Activo" : "Deshabilitado"} → ${patch.activo ? "Activo" : "Deshabilitado"}` : "",
    ].filter(Boolean);
    const msg = cambiosCriticos.length
      ? `Confirma modificación de usuario:\n\n${cambiosCriticos.join("\n")}\n\n¿Guardar cambios?`
      : "No se detectan cambios críticos. ¿Guardar de todas formas?";
    if (!confirm(msg)) return;
    const next = normalizarUsuario({ ...old, ...patch });
    state.usuarios = state.usuarios.map(u => u.u === oldU ? next : u);
    if (patch.u !== oldU && state.userStats[oldU]) {
      state.userStats[patch.u] = state.userStats[oldU];
      delete state.userStats[oldU];
      state.lotes = state.lotes.map(l => l.createdBy === oldU ? { ...l, createdBy: patch.u, createdByName: next.nombre } : l);
      state.avisos = (state.avisos || []).map(a => a.autor === oldU ? { ...a, autor: patch.u, autorNombre: next.nombre } : a);
      save("oxmo:lotes", state.lotes);
      save("oxmo:avisos", state.avisos || []);
    }
    if (state.user?.u === oldU) { state.user = next; save("oxmo:user", state.user); }
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario modificado", next.u, `${next.nombre} · ${next.area}`, C.cyan);
    state.adminEditUser = "";
    render();
  });

  document.querySelectorAll("[data-admin-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const u = state.usuarios.find(x => x.u === btn.dataset.adminToggle);
    if (!u) return;
    if (!confirm(`${u.activo !== false ? "Deshabilitar" : "Activar"} usuario ${u.u}?`)) return;
    u.activo = u.activo === false ? true : false;
    saveUsuarios();
    addHist(u.activo ? "Usuario activado" : "Usuario deshabilitado", u.u, "", u.activo ? C.green : C.yellow);
    render();
  }));
  document.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.adminDel;
    if (!confirm(`Eliminar usuario ${u}? Esta acción no se puede deshacer.`)) return;
    state.usuarios = state.usuarios.filter(x => x.u !== u);
    delete state.userStats[u];
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Usuario eliminado", u, "", C.red);
    render();
  }));
};

perfilUsuarioHTML = function() {
  const u = normalizarUsuario(state.usuarios.find(x => x.u === state.user?.u) || state.user || {});
  return `
    <div class="box profile-soft-box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="section-title">Mi perfil</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">${esc(u.nombre)}</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Puedes actualizar tus datos de contacto. El área/célula queda bloqueada y la modifica solo el Administrador.</div>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center"><span class="tag" style="color:${C.cyan};background:#00d4ff22;border-color:#00d4ff55">${esc(u.rol)}</span>${areaBadgeHTML(u.area)}</div>
      </div>
      <form id="perfilUsuarioForm" class="profile-form">
        <div class="profile-grid">
          <div class="field"><label>Usuario</label><input class="input" readonly value="${esc(u.u)}"></div>
          <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" name="nombre" value="${esc(u.nombre)}"></div>
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" name="cargo" value="${valorPerfil(u, "cargo")}" placeholder="Ej: Operador Envase"></div>
          <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ value: u.area, disabled: true })}<input type="hidden" name="area" value="${esc(u.area)}"><input type="hidden" name="areaCelula" value="${esc(u.area)}"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" name="turno" value="${valorPerfil(u, "turno")}" placeholder="Ej: Turno A / 7x7"></div>
          <div class="field"><label>Teléfono personal</label><input class="input" data-keep-case="true" name="telefono" value="${valorPerfil(u, "telefono")}" placeholder="+56 9 ...."></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" name="correo" value="${valorPerfil(u, "correo")}" placeholder="correo@empresa.cl"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" name="direccion" value="${valorPerfil(u, "direccion")}" placeholder="Dirección de contacto"></div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="section-title" style="margin-bottom:10px;color:${C.red}">Contacto de emergencia</div>
          <div class="profile-grid">
            <div class="field"><label>Nombre contacto</label><input class="input" data-keep-case="true" name="contactoEmergenciaNombre" value="${valorPerfil(u, "contactoEmergenciaNombre")}" placeholder="Nombre y apellido"></div>
            <div class="field"><label>Relación</label><input class="input" data-keep-case="true" name="contactoEmergenciaRelacion" value="${valorPerfil(u, "contactoEmergenciaRelacion")}" placeholder="Ej: Madre / Pareja / Hermano"></div>
            <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" name="contactoEmergenciaTelefono" value="${valorPerfil(u, "contactoEmergenciaTelefono")}" placeholder="+56 9 ...."></div>
            <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" name="observacionesContacto" rows="3" placeholder="Alergias, restricciones o notas relevantes">${valorPerfil(u, "observacionesContacto")}</textarea></div>
          </div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:14px">Guardar mi perfil</button>
      </form>
    </div>
  `;
};

if (!document.getElementById("area-celula-v9-style")) {
  const st = document.createElement("style");
  st.id = "area-celula-v9-style";
  st.textContent = `
    .area-scope-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px;padding:14px 16px;border:1px solid rgba(0,212,255,.22);background:linear-gradient(135deg,rgba(0,212,255,.10),rgba(30,111,217,.08));border-radius:18px;box-shadow:0 12px 34px rgba(0,0,0,.16)}
    .area-scope-card b{display:block;color:var(--txt);font-size:14px}.area-scope-card span{display:block;color:var(--txt2);font-size:12px;margin-top:3px}.area-chip-list{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.filters-soft{background:rgba(8,21,39,.72);border:1px solid rgba(74,142,245,.20);border-radius:16px;padding:12px}.inventory-soft-table{border-radius:16px;overflow:hidden;border:1px solid rgba(74,142,245,.18)}.inventory-soft-table table thead th{background:linear-gradient(90deg,rgba(30,111,217,.50),rgba(0,212,255,.18))}.area-user-modal,.modal-card,.box,.card{border-radius:18px}.profile-soft-box{background:linear-gradient(135deg,rgba(11,25,46,.98),rgba(8,18,35,.96))}.area-select{background:#06101d;border-color:#1d3a5d}.area-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid rgba(0,212,255,.35);background:rgba(0,212,255,.12);color:#a9ecff;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:800}.area-chip.subtle{padding:3px 7px;font-size:10px;color:#8ccdf4;background:rgba(58,142,245,.12)}.pass-chip{display:inline-flex;align-items:center;border:1px solid rgba(255,184,0,.35);background:rgba(255,184,0,.12);color:#ffd36e;border-radius:999px;padding:4px 8px;font-size:11px;font-weight:800}
  `;
  document.head.appendChild(st);
}

render = function() {
  if (state.user && usuarioAreaLimitadaV9() && !["inventario", "registro", "perfil"].includes(state.tab)) {
    state.tab = "inventario";
  }
  return renderAnteriorGerente();
};


/* =========================================================
   AREA_FILTROS_KPI_V10_20260627
   - Filtro/buscador de inventario
   - KPIs ponderados por área seleccionada
   - Cu y Fino Mo consideran TODO lote con análisis, incluido Fuera Esp
   - Etiquetas Área sin término célula
   - ACP sin columna Producto
   - S mezcla por defecto 0.2%
   ========================================================= */
const AREA_FILTRO_TODAS_V10 = "Todas las áreas";

function areaScopeGlobalV10() {
  if (!areaTrabajoEsGlobal()) return areaTrabajoUsuario();
  return normalizarTextoAreaV9(state.invAreaFilter || AREA_FILTRO_TODAS_V10) || AREA_FILTRO_TODAS_V10;
}
function lotesScopeAreaV10(lotes = state.lotes) {
  const base = lotesVisiblesAreaV9(lotes).filter(l => !isInfodiaProductionLote(l));
  if (!areaTrabajoEsGlobal()) return base;
  const filtro = areaScopeGlobalV10();
  if (!filtro || filtro === AREA_FILTRO_TODAS_V10) return base;
  return base.filter(l => areaTrabajoLote(l) === filtro);
}
function lotesInventarioFiltradoV10() {
  let lotes = lotesScopeAreaV10();
  if (state.filtro && state.filtro !== "Todos") lotes = lotes.filter(l => l.estado === state.filtro);
  const q = normalizarTextoAreaV9(state.invSearch || "").toLowerCase();
  if (q) lotes = lotes.filter(l => [l.id, areaTrabajoLote(l), l.tipo, l.sector, l.estado, l.fecha, clasificar(l).clase, l.cu, l.mo, l.s].join(" ").toLowerCase().includes(q));
  return lotesRecientesAnteriorAreaCelula(lotes);
}
function kpiDataAreaV10(lotes = lotesScopeAreaV10()) {
  const disp = lotes.filter(l => l.estado === "Disponible");
  const retenidos = lotes.filter(l => l.estado !== "Disponible");
  const analizados = lotes.filter(hasAnalysis);
  const masaDisp = disp.reduce((a,l)=>a+Number(l.masa||0),0);
  const masaRet = retenidos.reduce((a,l)=>a+Number(l.masa||0),0);
  const masaAnalizada = analizados.reduce((a,l)=>a+Number(l.masa||0),0);
  const cuProm = masaAnalizada ? analizados.reduce((a,l)=>a+Number(l.cu||0)*Number(l.masa||0),0)/masaAnalizada : 0;
  const finoMoKg = analizados.reduce((a,l)=>a+Number(l.masa||0)*Number(l.mo||0)/100,0);
  const pend = lotes.filter(l => !hasAnalysis(l) || l.estado === "Pendiente");
  const fuera = lotes.filter(l => l.estado === "Fuera Esp" || clasificar(l).clase === "Fuera Esp");
  return { disp, retenidos, analizados, masaDisp, masaRet, masaAnalizada, cuProm, finoMoKg, pend, fuera, total:lotes.length };
}
function areaFilterSelectV10(id="inventoryAreaFilter", selected=areaScopeGlobalV10()) {
  const opts = [AREA_FILTRO_TODAS_V10, ...areasTrabajoCatalogo()];
  return `<select id="${id}" class="input area-filter-select">${opts.map(a => `<option value="${esc(a)}" ${a === selected ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>`;
}
function areaScopeNoticeV10() {
  if (areaTrabajoEsGlobal()) {
    const filtro = areaScopeGlobalV10();
    return `<div class="area-scope-card area-filter-card"><div><b>${filtro === AREA_FILTRO_TODAS_V10 ? "Totalizado general" : `Área ${esc(filtro)}`}</b><span>${filtro === AREA_FILTRO_TODAS_V10 ? "Indicadores consolidados de todas las áreas." : "Indicadores y tabla cuantifican solo el área seleccionada."}</span></div><div class="area-filter-box"><label>Filtro área</label>${areaFilterSelectV10()}</div></div>`;
  }
  const area = areaTrabajoUsuario();
  const extra = areaEsEnvaseV9() ? "Área Envase: acceso según rol asignado." : "Área independiente: solo Inventario y Mi perfil.";
  return `<div class="area-scope-card"><div><b>${esc(area)}</b><span>${esc(extra)}</span></div>${areaBadgeHTML(area)}</div>`;
}

shellHTML = function() {
  if (isGerente()) return gerenteShellHTML();
  const lotesScope = lotesScopeAreaV10();
  const d = kpiDataAreaV10(lotesScope);
  const areaLabel = areaScopeGlobalV10();
  return `
    <header class="topbar">
      <div class="brand" style="justify-content:flex-start;margin:0"><div class="brand-mark" style="height:38px"></div><div><div style="font-weight:900;letter-spacing:3px">CONTROL OPERACIONAL</div><div class="brand-sub">OXMO · ENVASE · TRAZABILIDAD</div></div></div>
      <div class="top-user-center"><div class="top-user-role">${esc(state.user.rol.toUpperCase())}</div><div class="top-user-name">${esc(state.user.nombre)}</div></div>
      <div class="top-actions"><div style="text-align:right"><div id="clock" class="mono" style="color:var(--green);font-size:13px;font-weight:800">${new Date().toLocaleTimeString("es-CL")}</div><div style="color:var(--txt3);font-size:8px;letter-spacing:1px">${hoy()}</div></div><button class="btn secondary" id="cloudConfigBtn" title="Configurar tiempo real">NUBE: ${esc(cloud.status.toUpperCase())}</button><button class="btn danger" id="logoutBtn">SALIR</button></div>
    </header>
    <div class="status">${d.fuera.length ? `⚠ ${d.fuera.length} lote(s) fuera de especificación` : "Estado normal"} · Área: ${esc(areaLabel)} · Masa disponible: ${kgToTon(d.masaDisp)} · ${d.pend.length} pendientes análisis · Lotes totales: ${d.total}</div>
    <main class="main main-v10-soft">
      <section class="kpis">
        ${kpi("Masa Disponible", d.masaDisp / 1000, "t", `${d.disp.length} lotes`, C.green, "INV", 2)}
        ${kpi("Masa Retenida", d.masaRet / 1000, "t", `${d.retenidos.length} lotes`, C.red, "RET", 2)}
        ${kpi("Fino Mo", d.finoMoKg / 1000, "t", "todos los analizados", C.copper, "◆", 2)}
        ${kpi("Cu Promedio", d.cuProm, "%", "ponderado por masa", C.cyan, "CU", 2)}
        ${kpi("Total Lotes", d.total, "", "según área/filtro", C.blue, "LOT", 0)}
        ${kpi("Sin Análisis", lotesScope.filter(l=>!hasAnalysis(l)).length, "", "Pendientes lab", C.yellow, "LAB", 0)}
      </section>
      <nav class="tabs">${visibleTabs().map(([id,label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</nav>
      ${canViewTab("infodia") ? `<div class="filters" style="margin-bottom:12px"><button class="pill ${state.tab === "infodia" ? "active" : ""}" data-tab="infodia">Importar Infodia</button></div>` : ""}
      <section id="tabView">${tabHTML()}</section>
    </main>
    <footer class="footer"><span>OXMO CONTROL · ${esc(state.user.nombre)} (${esc(state.user.rol)}) · Área ${esc(areaTrabajoUsuario())}</span><span>DATOS PERSISTENTES · SGI COMPATIBLE</span></footer>
    ${state.cloudPanel ? cloudPanelHTML() : ""}`;
};

inventarioHTML = function() {
  const base = lotesScopeAreaV10();
  const lotes = lotesInventarioFiltradoV10();
  const selected = new Set(state.inventorySelected || []);
  const editableIds = lotes.filter(l => canEditLot(l)).map(l => l.id);
  const dist = allSectores().map(s => ({ s, v: base.filter(l => l.sector === s).reduce((a,l)=>a+Number(l.masa||0),0) })).filter(d=>d.v>0);
  const max = Math.max(1, ...dist.map(d=>d.v));
  const countEstado = f => f === "Todos" ? base.length : base.filter(l=>l.estado===f).length;
  return `${areaScopeNoticeV10()}
    <div class="inventory-tools-v10">
      <div class="field"><label>Buscar inventario</label><input id="inventorySearch" class="input" data-keep-case="true" value="${esc(state.invSearch || "")}" placeholder="Buscar por ID, área, sector, clasificación, estado, fecha, Cu/Mo/S..."></div>
      <div class="filters filters-soft">${["Todos","Disponible","Bloqueado","Pendiente","Fuera Esp"].map(f=>`<button class="pill ${state.filtro===f?"active":""}" data-filter="${f}">${f} (${countEstado(f)})</button>`).join("")}${selected.size ? `<button class="pill" id="deleteSelectedLots" style="border-color:#ff456055;color:var(--red)">Eliminar seleccionados (${selected.size})</button>` : ""}<button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button></div>
    </div>
    <div class="table-wrap inventory-soft-table"><table><thead><tr><th><input id="invSelectAll" type="checkbox" ${editableIds.length && editableIds.every(id=>selected.has(id)) ? "checked" : ""}></th>${["ID","Área","Tipo","Masa","Sector","Cu%","Mo%","S%","Clasif.","Estado","Fecha",""] .map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${lotes.length ? lotes.map(l=>rowHTMLAreaV9(l)).join("") : `<tr><td colspan="12" style="text-align:center;color:var(--txt2);padding:26px">Sin inventario registrado para este filtro.</td></tr>`}</tbody></table></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px"><div class="card"><div class="muted-title" style="margin-bottom:10px">Por sector</div>${dist.length ? dist.map(d=>`<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${esc(d.s)}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v/max)*100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v,1)}</span></div>`).join("") : `<span style="color:var(--txt3);font-size:12px">Sin inventario en esta área.</span>`}</div><div class="card"><div class="muted-title" style="margin-bottom:10px">Estados</div>${["Disponible","Bloqueado","Pendiente","Fuera Esp"].map(e=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2e4a33"><span style="color:${eColor(e)}">● ${e}</span><span class="mono" style="font-weight:800">${base.filter(l=>l.estado===e).length}</span></div>`).join("")}</div></div>`;
};

const bindInventarioV10Base = bindInventario;
bindInventario = function() {
  bindInventarioV10Base();
  document.querySelector("#inventorySearch")?.addEventListener("input", e => { state.invSearch = e.target.value; renderTabSoon(); });
  document.querySelector("#inventoryAreaFilter")?.addEventListener("change", e => { state.invAreaFilter = e.target.value; state.filtro = "Todos"; state.invSearch = ""; render(); });
};

// Etiquetas de área sin el término célula.
areaTrabajoOptionsHTML = function(selected = "", { includeAdd = false } = {}) {
  const sel = normalizarTextoArea(selected) || AREA_CELULA_DEFAULT;
  const options = areasTrabajoCatalogo();
  if (sel && !options.includes(sel)) options.push(sel);
  return options.map(a => `<option value="${esc(a)}" ${a === sel ? "selected" : ""}>${esc(a)}</option>`).join("") + (includeAdd ? `<option value="__add__">+ Añadir área...</option>` : "");
};

// Reemplazos visuales de textos de administración/perfil.
const adminUsersHTMLV10Base = adminUsersHTML;
adminUsersHTML = function(rows) {
  return adminUsersHTMLV10Base(rows)
    .replaceAll("área/célula", "área")
    .replaceAll("Área / célula", "Área")
    .replaceAll("Nueva área / célula", "Nueva área")
    .replaceAll("+ Añadir área / célula...", "+ Añadir área...")
    .replaceAll("áreas/células", "áreas")
    .replaceAll("células", "áreas");
};
const adminUserModalHTMLV10Base = adminUserModalHTML;
adminUserModalHTML = function() {
  return adminUserModalHTMLV10Base()
    .replaceAll("área/célula", "área")
    .replaceAll("Área / célula", "Área")
    .replaceAll("Nueva área / célula", "Nueva área")
    .replaceAll("+ Añadir área / célula...", "+ Añadir área...")
    .replaceAll("célula", "área");
};
const perfilUsuarioHTMLV10Base = perfilUsuarioHTML;
perfilUsuarioHTML = function() {
  return perfilUsuarioHTMLV10Base()
    .replaceAll("área/célula", "área")
    .replaceAll("Área / célula", "Área")
    .replaceAll("célula", "área");
};

// Cartilla ACP sin columna Producto.
analisisACPHTML = function({ titulo, subtitulo, items, kpis, empty }) {
  const q = (state.acpSearch || "").trim().toLowerCase();
  const filtered = q ? items.filter(a => [a.codigo, a.fecha, a.tipoAnalisis, a.clase].join(" ").toLowerCase().includes(q)) : items;
  return `<div class="box"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px"><div><div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div><div style="color:var(--txt);font-size:20px;font-weight:900">${esc(titulo)}</div><div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:820px;line-height:1.45">${esc(subtitulo)}</div></div><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button><button class="btn secondary" id="importInfodiaTop">Importar Infodia</button></div></div><div class="grid-cards" style="margin-bottom:14px">${kpis.map(([label,value,color])=>miniReport(label,String(value),color)).join("")}</div><div class="card" style="margin-bottom:14px"><div class="field" style="margin:0"><label>Buscar en cartilla</label><div style="display:flex;gap:8px"><input id="acpSearch" value="${esc(state.acpSearch || "")}" dir="ltr" style="direction:ltr;text-align:left" placeholder="Ej: OXMO8635-26, OXBR1305-26, OO300-001-06149-26, 2026-05-16"><button class="btn secondary" id="clearAcpSearch" type="button">Limpiar</button></div></div></div>${filtered.length ? `<div class="table-wrap"><table><thead><tr><th>ID lote</th><th>Tipo</th><th>Fecha análisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead><tbody>${filtered.map(a=>{ const c=clasificar(a); return `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo)}</td><td>${esc(labelTipoAnalisis(a.tipoAnalisis))}</td><td class="mono">${esc(a.fecha || "-")}</td><td class="mono" style="color:${Number(a.cu) >= 0.51 ? C.copper : C.green}">${fmt(a.cu,3)}</td><td class="mono" style="color:${Number(a.mo) >= moMinimo(a.cu) ? C.green : C.red}">${fmt(a.mo,3)}</td><td class="mono" style="color:${Number(a.s) < 0.1 ? C.green : C.red}">${fmt(a.s,4)}</td><td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span></td></tr>`;}).join("")}</tbody></table></div>` : `<div class="notice">${esc(empty)}</div>`}</div>`;
};

// S por defecto en mezcla: 0.2%, editable.
if (state.mix && (Number(state.mix.s) === 0.1 || !Number.isFinite(Number(state.mix.s)))) state.mix.s = 0.2;
const mezclasHTMLV10Base = mezclasHTML;
mezclasHTML = function() { if (state.mix && Number(state.mix.s) === 0.1) state.mix.s = 0.2; return mezclasHTMLV10Base(); };

// Silos: color de llenado según caracterización química Cu/Mo/S.
const ponderarSiloV10Base = ponderarSilo;
ponderarSilo = function(base) {
  const s = ponderarSiloV10Base(base);
  const c = hasAnalysis(s) ? clasificar(s) : { clase: "Sin comunes", color: C.txt3 };
  return { ...s, clase: c.clase, color: c.color };
};

// Gerencia: filtro de área para el dashboard sin exponer módulos técnicos.
const gerenteDashboardDataV10Base = gerenteDashboardData;
gerenteDashboardData = function() {
  const original = state.lotes;
  const area = normalizarTextoAreaV9(state.gerenteAreaFilter || AREA_FILTRO_TODAS_V10);
  if (area && area !== AREA_FILTRO_TODAS_V10) state.lotes = original.filter(l => areaTrabajoLote(l) === area);
  try { return gerenteDashboardDataV10Base(); }
  finally { state.lotes = original; }
};
const gerenteDashboardHTMLV10Base = gerenteDashboardHTML;
gerenteDashboardHTML = function() {
  const select = `<div class="exec-area-filter-card"><label>Área dashboard</label>${areaFilterSelectV10("gerenteAreaFilter", normalizarTextoAreaV9(state.gerenteAreaFilter || AREA_FILTRO_TODAS_V10))}</div>`;
  return gerenteDashboardHTMLV10Base().replace(`<div class="exec-v4-layout">`, `${select}<div class="exec-v4-layout">`);
};
const bindShellV10Base = bindShell;
bindShell = function() {
  bindShellV10Base();
  document.querySelector("#gerenteAreaFilter")?.addEventListener("change", e => { state.gerenteAreaFilter = e.target.value; render(); });
};

// Comunes: aceptar OO300 y O0300 en vistas y reconstrucción al reimportar.
tipoAnalisisACP = function(codigo) {
  codigo = normalizarCodigoAnalisis(codigo);
  if (/^O[O0]300-001-\d+-\d{2}$/.test(codigo)) return "comun_turno";
  if (/^OXMO\d+-\d{2}$/.test(codigo)) return "lote_oxmo";
  if (/^OXBR\d+-\d{2}$/.test(codigo)) return "briqueta";
  if (codigo.includes("OSAC") && /-\d{2}$/.test(codigo)) return "lote_osac";
  if (/^[A-Z]{2,12}\d+-\d{2}$/.test(codigo)) return "otro_lote";
  return "";
};

migrarAreaCelulaV9();
if (state.infodia?.days?.length && state.infodia?.analisis?.length) recalcularSiloHistorialInfodiaV9();

/* =========================================================
   HOTFIX_V11_20260627
   - Lotes OXMO/BQA abre directo
   - Buscador inventario con debounce estable
   - S mezcla por defecto 0.01%
   - Gerente inicia en dashboard
   - Cierre de cambio de clave vuelve sin quedar bloqueado
   ========================================================= */
state.mix = state.mix || { cu: 0.5, mo: 57, s: 0.01, masa: 20000, sel: [], sector: "Todos" };
if ([0.1, 0.2].includes(Number(state.mix.s)) || !Number.isFinite(Number(state.mix.s))) state.mix.s = 0.01;

function tabHTMLDirectV11() {
  if (isGerente() && state.tab === "gerencial") return gerenteDashboardHTML();
  if (state.tab === "inventario") return inventarioHTML();
  if (state.tab === "silos") return silosHTML();
  if (state.tab === "quimica") return quimicaHTML();
  if (state.tab === "lotesOxmo") return lotesOxmoHTML();
  if (state.tab === "avisos") return avisosHTML();
  if (state.tab === "comunesTurno") return comunesTurnoHTML();
  if (state.tab === "admin") return adminHTML();
  if (state.tab === "mezclas") return mezclasHTML();
  if (state.tab === "registro") return registroHTML();
  if (state.tab === "infodia") return infodiaHTML();
  if (state.tab === "siloHistorial") return siloHistorialHTML();
  if (state.tab === "etiquetas") return etiquetasHTML();
  if (state.tab === "reportes") return reportesHTML();
  if (state.tab === "perfil") return perfilUsuarioHTML();
  return inventarioHTML();
}

tabHTML = tabHTMLDirectV11;

bindTab = function() {
  if (state.tab === "inventario") bindInventario();
  if (state.tab === "silos") bindSilos();
  if (state.tab === "registro") bindRegistro();
  if (state.tab === "mezclas") bindMezclas();
  if (state.tab === "infodia") bindInfodia();
  if (state.tab === "siloHistorial") bindSiloHistorial();
  if (state.tab === "lotesOxmo") bindAnalisisACP();
  if (state.tab === "avisos") bindAvisos();
  if (state.tab === "comunesTurno") bindComunesTurno();
  if (state.tab === "admin") bindAdmin();
  if (state.tab === "etiquetas") bindEtiquetas();
  if (state.tab === "reportes") bindReportes();
  if (state.tab === "quimica") bindQuimica();
  if (state.tab === "perfil") bindPerfilUsuario();
};

const mezclasHTMLV11Base = mezclasHTML;
mezclasHTML = function() {
  if (!state.mix) state.mix = { cu: 0.5, mo: 57, s: 0.01, masa: 20000, sel: [], sector: "Todos" };
  if ([0.1, 0.2].includes(Number(state.mix.s)) || !Number.isFinite(Number(state.mix.s))) state.mix.s = 0.01;
  return mezclasHTMLV11Base();
};

function lotesInventarioActualesV11() {
  return typeof lotesInventarioFiltradoV10 === "function" ? lotesInventarioFiltradoV10() : (state.filtro === "Todos" ? lotesRecientes() : lotesRecientes().filter(l => l.estado === state.filtro));
}

bindInventario = function() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    state.filtro = btn.dataset.filter;
    state.inventorySelected = [];
    render();
  }));

  document.querySelector("#newLot")?.addEventListener("click", () => {
    state.editando = null;
    state.tab = "registro";
    render();
  });

  document.querySelector("#inventoryAreaFilter")?.addEventListener("change", e => {
    state.invAreaFilter = e.target.value;
    state.filtro = "Todos";
    state.inventorySelected = [];
    render();
  });

  const search = document.querySelector("#inventorySearch");
  if (search) {
    search.addEventListener("input", e => {
      state.invSearch = e.target.value;
      clearTimeout(state._invSearchTimer);
      state._invSearchTimer = setTimeout(() => {
        state.inventorySelected = [];
        if (state.tab === "inventario") render();
      }, 350);
    });
    search.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        clearTimeout(state._invSearchTimer);
        state.inventorySelected = [];
        render();
      }
    });
  }

  document.querySelector("#invSelectAll")?.addEventListener("change", e => {
    const visibles = lotesInventarioActualesV11();
    state.inventorySelected = e.target.checked ? visibles.filter(l => canEditLot(l)).map(l => l.id) : [];
    render();
  });

  document.querySelectorAll("[data-inv-select]").forEach(chk => chk.addEventListener("change", e => {
    const id = e.target.dataset.invSelect;
    const set = new Set(state.inventorySelected || []);
    e.target.checked ? set.add(id) : set.delete(id);
    state.inventorySelected = [...set];
    render();
  }));

  document.querySelector("#deleteSelectedLots")?.addEventListener("click", () => {
    const ids = (state.inventorySelected || []).filter(id => canEditLot(state.lotes.find(l => l.id === id)));
    if (!ids.length) return;
    if (!confirm(`¿Eliminar ${ids.length} lote(s) seleccionados? Esta acción no se puede deshacer.`)) return;
    state.lotes = state.lotes.filter(l => !ids.includes(l.id));
    state.inventorySelected = [];
    persistLotes();
    addHist("Lotes eliminados", `${ids.length}`, ids.slice(0, 6).join(", "), C.red);
    render();
  });

  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const lote = state.lotes.find(l => l.id === btn.dataset.edit);
    if (!canEditLot(lote)) { alert("No tienes permiso para modificar este lote."); return; }
    state.editando = lote;
    state.tab = "registro";
    render();
  }));

  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
  document.querySelectorAll("[data-label-lot]").forEach(btn => btn.addEventListener("click", () => {
    state.etiquetaSel = [btn.dataset.labelLot];
    printLabels();
  }));
};

passwordUsuarioModalHTML = function() {
  if (!state.selfPassOpen || !state.user) return "";
  return `<div class="modal-backdrop" data-self-pass-modal>
    <div class="modal-card" style="max-width:460px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div><div class="section-title">MI CLAVE</div><h2 style="margin:4px 0 0">Cambiar contraseña</h2></div>
        <button class="btn ghost" type="button" data-self-pass-close>Cerrar</button>
      </div>
      <div class="alert info">Si pierdes la clave, contacta al Administrador para reiniciarla.</div>
      <label>Clave actual</label><input data-keep-case="true" data-self-pass-old type="text" class="input" value="" autocomplete="off">
      <label>Nueva clave visible</label><input data-keep-case="true" data-self-pass-new type="text" class="input" value="" autocomplete="off">
      <label>Repetir nueva clave</label><input data-keep-case="true" data-self-pass-repeat type="text" class="input" value="" autocomplete="off">
      <button class="btn primary" data-self-pass-save style="width:100%;margin-top:12px">Guardar nueva clave</button>
    </div>
  </div>`;
};

bindSelfPasswordFinal = function() {
  insertarBotonClavePropiaFinal();
  document.querySelector("[data-self-pass-open]")?.addEventListener("click", () => {
    state.selfPassOpen = true;
    render();
  });
  if (state.selfPassOpen && !document.querySelector("[data-self-pass-modal]")) {
    document.body.insertAdjacentHTML("beforeend", passwordUsuarioModalHTML());
  }
  const closePassModal = () => {
    state.selfPassOpen = false;
    if (isGerente()) state.tab = "gerencial";
    render();
  };
  document.querySelectorAll("[data-self-pass-close]").forEach(btn => btn.addEventListener("click", closePassModal));
  document.querySelector("[data-self-pass-modal]")?.addEventListener("click", e => {
    if (e.target?.matches?.("[data-self-pass-modal]")) closePassModal();
  });
  document.querySelector("[data-self-pass-save]")?.addEventListener("click", () => {
    const oldPass = document.querySelector("[data-self-pass-old]")?.value || "";
    const newPass = document.querySelector("[data-self-pass-new]")?.value || "";
    const repeat = document.querySelector("[data-self-pass-repeat]")?.value || "";
    if (oldPass !== state.user.p) { alert("La clave actual no coincide."); return; }
    if (!newPass || newPass !== repeat) { alert("La nueva clave debe coincidir en ambos campos."); return; }
    if (!confirm("¿Guardar nueva contraseña?")) return;
    state.usuarios = state.usuarios.map(u => u.u === state.user.u ? { ...u, p: newPass } : u);
    state.user = { ...state.user, p: newPass };
    saveUsuarios();
    save("oxmo:user", state.user);
    addHist("Usuario cambió su clave", state.user.u, "", C.cyan);
    state.selfPassOpen = false;
    if (isGerente()) state.tab = "gerencial";
    render();
  });
};

const bindLoginV11Base = bindLogin;
bindLogin = function() {
  bindLoginV11Base();
  const btn = document.querySelector("#loginBtn");
  const originalHandlersNote = true;
  // El listener base valida credenciales; este segundo paso corrige la pestaña
  // inmediatamente después del login si el usuario es Gerente.
  btn?.addEventListener("click", () => setTimeout(() => {
    if (state.user && isGerente(state.user)) { state.tab = "gerencial"; state._gerenteTabTouched = false; render(); }
  }, 0));
  document.querySelectorAll("#loginUser,#loginPass").forEach(el => el.addEventListener("keydown", e => {
    if (e.key === "Enter") setTimeout(() => {
      if (state.user && isGerente(state.user)) { state.tab = "gerencial"; state._gerenteTabTouched = false; render(); }
    }, 0);
  }));
};

const bindShellV11Base = bindShell;
bindShell = function() {
  if (isGerente()) {
    document.querySelector("#logoutBtn")?.addEventListener("click", () => {
      cerrarSesionUsuario();
      state.user = null;
      state._gerenteTabTouched = false;
      save("oxmo:user", null);
      render();
    });
    document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
      state._gerenteTabTouched = true;
      state.tab = btn.dataset.tab;
      render();
    }));
    document.querySelector("#gerenteAreaFilter")?.addEventListener("change", e => { state.gerenteAreaFilter = e.target.value; render(); });
    aplicarMayusculasFinal(document);
    bindTab();
    bindSelfPasswordFinal();
    return;
  }
  bindShellV11Base();
};

const renderV11Base = render;
render = function() {
  if (state.user && isGerente(state.user) && !state._gerenteTabTouched && state.tab === "perfil") {
    state.tab = "gerencial";
  }
  if (state.user && isGerente(state.user) && !canViewTab(state.tab)) {
    state.tab = "gerencial";
  }
  return renderV11Base();
};

if (state.user && isGerente(state.user) && state.tab === "perfil") state.tab = "gerencial";


/* =========================================================
   HOTFIX_V12_20260627
   - Lotes OXMO/BQA con render seguro.
   - Buscador de Inventario no re-renderiza mientras escribes.
   - Silos: color de llenado según caracterización química Cu/Mo/S.
   - S mezcla por defecto 0.01%.
   ========================================================= */
state.mix = state.mix || { cu: 0.5, mo: 57, s: 0.01, masa: 20000, sel: [], sector: "Todos" };
if ([0.1, 0.2].includes(Number(state.mix.s)) || !Number.isFinite(Number(state.mix.s))) state.mix.s = 0.01;

function valorBusquedaInventarioV12(l) {
  const c = clasificar(l);
  return [
    l.id,
    areaTrabajoLote(l),
    l.tipo,
    l.sector,
    l.estado,
    l.fecha,
    c.clase,
    l.cu,
    l.mo,
    l.s,
    l.obs,
  ].join(" ").toLowerCase();
}

function lotesInventarioFiltradoV12() {
  let base = typeof lotesScopeAreaV10 === "function" ? lotesScopeAreaV10() : lotesVisiblesAreaV9(state.lotes);
  base = base.filter(l => !isInfodiaProductionLote(l));
  if (state.filtro && state.filtro !== "Todos") base = base.filter(l => l.estado === state.filtro);
  const q = String(state.invSearch || "").trim().toLowerCase();
  if (q) base = base.filter(l => valorBusquedaInventarioV12(l).includes(q));
  return lotesRecientesAnteriorAreaCelula(base);
}

inventarioHTML = function() {
  const base = typeof lotesScopeAreaV10 === "function" ? lotesScopeAreaV10() : lotesVisiblesAreaV9(state.lotes);
  const lotes = lotesInventarioFiltradoV12();
  const selected = new Set(state.inventorySelected || []);
  const editableIds = lotes.filter(l => canEditLot(l)).map(l => l.id);
  const dist = allSectores().map(s => ({
    s,
    v: base.filter(l => l.sector === s).reduce((a,l) => a + Number(l.masa || 0), 0),
  })).filter(d => d.v > 0);
  const max = Math.max(1, ...dist.map(d => d.v));
  const countEstado = f => f === "Todos" ? base.length : base.filter(l => l.estado === f).length;
  return `${typeof areaScopeNoticeV10 === "function" ? areaScopeNoticeV10() : areaScopeNoticeV9()}
    <div class="inventory-tools-v10 inventory-tools-v12">
      <div class="field inventory-search-field"><label>Buscar inventario</label>
        <div class="inventory-search-line">
          <input id="inventorySearch" class="input" data-keep-case="true" value="${esc(state.invSearch || "")}" placeholder="Buscar por ID, área, sector, clasificación, estado, fecha, Cu/Mo/S...">
          <button class="btn secondary" id="inventorySearchBtn" type="button">Buscar</button>
          ${state.invSearch ? `<button class="btn ghost" id="inventorySearchClear" type="button">Limpiar</button>` : ""}
        </div>
      </div>
      <div class="filters filters-soft">
        ${["Todos","Disponible","Bloqueado","Pendiente","Fuera Esp"].map(f => `<button class="pill ${state.filtro===f ? "active" : ""}" data-filter="${f}">${f} (${countEstado(f)})</button>`).join("")}
        ${selected.size ? `<button class="pill" id="deleteSelectedLots" style="border-color:#ff456055;color:var(--red)">Eliminar seleccionados (${selected.size})</button>` : ""}
        <button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button>
      </div>
    </div>
    <div class="table-wrap inventory-soft-table"><table><thead><tr><th><input id="invSelectAll" type="checkbox" ${editableIds.length && editableIds.every(id => selected.has(id)) ? "checked" : ""}></th>${["ID","Área","Tipo","Masa","Sector","Cu%","Mo%","S%","Clasif.","Estado","Fecha",""] .map(h=>`<th>${h}</th>`).join("")}</tr></thead><tbody>${lotes.length ? lotes.map(l => rowHTMLAreaV9(l)).join("") : `<tr><td colspan="12" style="text-align:center;color:var(--txt2);padding:26px">Sin inventario registrado para este filtro.</td></tr>`}</tbody></table></div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      <div class="card"><div class="muted-title" style="margin-bottom:10px">Por sector</div>${dist.length ? dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${esc(d.s)}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v/max)*100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v,1)}</span></div>`).join("") : `<span style="color:var(--txt3);font-size:12px">Sin inventario en esta área.</span>`}</div>
      <div class="card"><div class="muted-title" style="margin-bottom:10px">Estados</div>${["Disponible","Bloqueado","Pendiente","Fuera Esp"].map(e => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #1a2e4a33"><span style="color:${eColor(e)}">● ${e}</span><span class="mono" style="font-weight:800">${base.filter(l => l.estado===e).length}</span></div>`).join("")}</div>
    </div>`;
};

function aplicarBusquedaInventarioV12() {
  const el = document.querySelector("#inventorySearch");
  state.invSearch = el ? el.value : "";
  state.inventorySelected = [];
  render();
  setTimeout(() => focusInputEnd("#inventorySearch"), 0);
}

bindInventario = function() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => {
    state.filtro = btn.dataset.filter;
    state.inventorySelected = [];
    render();
  }));
  document.querySelector("#newLot")?.addEventListener("click", () => { state.editando = null; state.tab = "registro"; render(); });
  document.querySelector("#inventoryAreaFilter")?.addEventListener("change", e => {
    state.invAreaFilter = e.target.value;
    state.filtro = "Todos";
    state.invSearch = "";
    state.inventorySelected = [];
    render();
  });
  const search = document.querySelector("#inventorySearch");
  if (search) {
    search.addEventListener("input", e => { state.invSearchDraft = e.target.value; });
    search.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); aplicarBusquedaInventarioV12(); }
      if (e.key === "Escape") { e.preventDefault(); state.invSearch = ""; render(); }
    });
  }
  document.querySelector("#inventorySearchBtn")?.addEventListener("click", aplicarBusquedaInventarioV12);
  document.querySelector("#inventorySearchClear")?.addEventListener("click", () => { state.invSearch = ""; state.invSearchDraft = ""; render(); });
  document.querySelector("#invSelectAll")?.addEventListener("change", e => {
    const visibles = lotesInventarioFiltradoV12();
    state.inventorySelected = e.target.checked ? visibles.filter(l => canEditLot(l)).map(l => l.id) : [];
    render();
  });
  document.querySelectorAll("[data-inv-select]").forEach(chk => chk.addEventListener("change", e => {
    const id = e.target.dataset.invSelect;
    const set = new Set(state.inventorySelected || []);
    e.target.checked ? set.add(id) : set.delete(id);
    state.inventorySelected = [...set];
    render();
  }));
  document.querySelector("#deleteSelectedLots")?.addEventListener("click", () => {
    const ids = (state.inventorySelected || []).filter(id => canEditLot(state.lotes.find(l => l.id === id)));
    if (!ids.length) return;
    if (!confirm(`¿Eliminar ${ids.length} lote(s) seleccionados? Esta acción no se puede deshacer.`)) return;
    state.lotes = state.lotes.filter(l => !ids.includes(l.id));
    state.inventorySelected = [];
    persistLotes();
    addHist("Lotes eliminados", `${ids.length}`, ids.slice(0, 6).join(", "), C.red);
    render();
  });
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const lote = state.lotes.find(l => l.id === btn.dataset.edit);
    if (!canEditLot(lote)) { alert("No tienes permiso para modificar este lote."); return; }
    state.editando = lote;
    state.tab = "registro";
    render();
  }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
  document.querySelectorAll("[data-label-lot]").forEach(btn => btn.addEventListener("click", () => {
    state.etiquetaSel = [btn.dataset.labelLot];
    printLabels();
  }));
};

function esCodigoLoteBqaV12(codigo, tipoAnalisis="") {
  const raw = String(codigo || "").trim().toUpperCase();
  const norm = normalizarCodigoAnalisis(raw);
  const tipo = String(tipoAnalisis || "").toLowerCase();
  return tipo === "lote_oxmo" || tipo === "briqueta" || tipo === "lote_osac" || /^OXMO\d+-\d{2}$/.test(norm) || /^OXBR\d+-\d{2}$/.test(norm) || raw.includes("OSAC");
}

lotesOxmoHTML = function() {
  const source = state.infodia?.analisisACP || state.infodia?.analisisLotes || [];
  const q = String(state.acpSearch || "").trim().toLowerCase();
  let items = source.filter(a => esCodigoLoteBqaV12(a.codigo, a.tipoAnalisis));
  if (q) items = items.filter(a => [a.codigo, a.fecha, a.tipoAnalisis, a.clase, a.fuente, a.cu, a.mo, a.s].join(" ").toLowerCase().includes(q));
  items = items.sort((a,b) => {
    const nb = correlativoAnalisis(b.codigo);
    const na = correlativoAnalisis(a.codigo);
    return (nb - na) || String(b.fecha || "").localeCompare(String(a.fecha || "")) || String(b.codigo || "").localeCompare(String(a.codigo || ""));
  });
  const allItems = source.filter(a => esCodigoLoteBqaV12(a.codigo, a.tipoAnalisis));
  const oxmo = allItems.filter(a => a.tipoAnalisis === "lote_oxmo" || /^OXMO\d+-\d{2}$/.test(normalizarCodigoAnalisis(a.codigo)));
  const briquetas = allItems.filter(a => a.tipoAnalisis === "briqueta" || /^OXBR\d+-\d{2}$/.test(normalizarCodigoAnalisis(a.codigo)));
  const osac = allItems.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").toUpperCase().includes("OSAC"));
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div><div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div><div style="color:var(--txt);font-size:18px;font-weight:900">Resultado de lotes OXMO - BQA</div><div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:860px;line-height:1.45">Listado de análisis ACP para lotes OXMO, briquetas OXBR y registros OSAC. Estos datos son cartilla de laboratorio, no inventario físico.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button><button class="btn secondary" data-tab="infodia">Importar Infodia</button></div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Lotes OXMO", oxmo.length, C.blueLight)}
      ${miniReport("Briquetas OXBR", briquetas.length, C.copper)}
      ${miniReport("OSAC", osac.length, C.cyan)}
      ${miniReport("Con análisis", allItems.filter(hasAnalysis).length, C.green)}
      ${miniReport("Fuera espec.", allItems.filter(x => clasificar(x).clase === "Fuera Esp").length, C.red)}
    </div>
    <div class="card" style="margin-bottom:14px"><div class="field" style="margin:0"><label>Buscar en cartilla</label><div style="display:flex;gap:8px;align-items:center"><input id="acpSearch" value="${esc(state.acpSearch || "")}" data-keep-case="true" placeholder="Ej: OXMO10065-26, OXBR1305-26, OSAC, 2026-06-14"><button class="btn secondary" id="acpSearchBtn" type="button">Buscar</button>${state.acpSearch ? `<button class="btn ghost" id="acpSearchClear" type="button">Limpiar</button>` : ""}</div></div></div>
    ${items.length ? `<div class="table-wrap"><table><thead><tr><th>ID lote</th><th>Tipo</th><th>Fecha análisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead><tbody>${items.map(a => { const c = clasificar(a); return `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo || "-")}</td><td>${esc(a.tipoAnalisis === "briqueta" ? "Briqueta" : a.tipoAnalisis === "lote_osac" ? "OSAC" : "Lote OXMO")}</td><td class="mono">${esc(a.fecha || "-")}</td><td class="mono" style="color:${Number(a.cu || 0) >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.mo || 0) >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.s || 0) < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td><td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${esc(c.clase)}</span></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">No hay análisis OXMO/OXBR/OSAC cargados o no hay resultados para la búsqueda.</div>`}
  </div>`;
};

bindAnalisisACP = function() {
  const input = document.querySelector("#acpSearch");
  const searchBtn = document.querySelector("#acpSearchBtn");
  const clearBtn = document.querySelector("#acpSearchClear");
  const applyBtn = document.querySelector("#applyAcpInventory");
  if (input) {
    input.addEventListener("input", e => { state.acpSearchDraft = e.target.value; });
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") { e.preventDefault(); state.acpSearch = e.target.value; render(); setTimeout(()=>focusInputEnd("#acpSearch"),0); }
      if (e.key === "Escape") { e.preventDefault(); state.acpSearch = ""; render(); }
    });
  }
  searchBtn?.addEventListener("click", () => { state.acpSearch = document.querySelector("#acpSearch")?.value || ""; render(); setTimeout(()=>focusInputEnd("#acpSearch"),0); });
  clearBtn?.addEventListener("click", () => { state.acpSearch = ""; render(); });
  applyBtn?.addEventListener("click", aplicarACPInventarioActual);
};

function colorSiloPorQuimicaV12(s) {
  const tieneQuimica = hasAnalysis(s);
  if (!tieneQuimica) return { color: C.txt3, clase: "Sin comunes", tieneQuimica: false };
  const cl = clasificar(s);
  return { color: cl.color, clase: cl.clase, tieneQuimica: true };
}

silosHTML = function() {
  const silos = silosPonderados();
  const comunes = comunesAsignados();
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:14px;align-items:start">
    <section class="box" style="min-width:0"><div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Silos de almacenamiento</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;max-height:640px;overflow:auto;padding-right:4px">${silos.map(s => {
      const cx = colorSiloPorQuimicaV12(s);
      const color = cx.color;
      const source = s.nivelImportado?.fuente === "infodia" ? `${hasAnalysis(s.nivelImportado) ? "Infodia/ACP" : "Infodia nivel"} ${s.nivelImportado.fecha || ""}` : cx.tieneQuimica ? "Manual / común" : "Sin datos";
      return `<div class="card" style="border-top:3px solid ${color}"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><div class="muted-title" style="color:var(--cyan);font-weight:800">${esc(s.id)}</div><span class="tag" style="background:${color}22;color:${color};border-color:${color}44">${esc(cx.clase)}</span></div><div style="height:118px;width:76px;margin:0 auto 10px;border:1px solid var(--line);background:#2d4a6a33;border-radius:5px;position:relative;overflow:hidden"><div style="position:absolute;left:0;right:0;bottom:0;height:${Number(s.nivel || 0)}%;background:linear-gradient(180deg,${color}dd,${color}66)"></div><div class="mono" style="position:absolute;inset:0;display:grid;place-items:center;font-weight:900">${Number(s.nivel || 0).toFixed(0)}%</div></div><div class="mono" style="text-align:center;color:${color};font-weight:900">${Number(s.masa || 0).toFixed(1)} / ${s.cap} t</div><div style="text-align:center;color:var(--txt3);font-size:9px;margin-top:4px">${esc(source)}${s.nivelImportado?.horaInicio ? ` · ${esc(s.nivelImportado.horaInicio)}-${esc(s.nivelImportado.horaTermino)}` : ""}</div><div style="text-align:center;color:var(--txt2);font-size:11px;margin-top:3px">Cu: ${cx.tieneQuimica ? Number(s.cu || 0).toFixed(2) : "-"}% · Mo: ${cx.tieneQuimica ? Number(s.mo || 0).toFixed(2) : "-"}% · S: ${cx.tieneQuimica ? Number(s.s || 0).toFixed(3) : "-"}%</div><div style="display:flex;justify-content:center;gap:6px;margin-top:8px;flex-wrap:wrap"><button class="icon-btn" data-silo-fill="${esc(s.id)}">Ajuste manual</button><button class="icon-btn" data-silo-calc="${esc(s.id)}">Ver cálculo</button><button class="icon-btn" data-silo-clear="${esc(s.id)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button></div></div>`;
    }).join("")}</div></section>
    <section class="box" style="min-width:0"><div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px"><div class="muted-title" style="color:var(--cyan)">Comunes de turno actualizados</div><span style="color:var(--txt3);font-size:10px">${comunes.length} registros</span></div><div class="notice" style="margin-bottom:12px;border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Listado trazable de comunes asignados a silos. El más reciente aparece primero.</div><div class="table-wrap" style="max-height:540px;overflow:auto"><table><thead><tr><th>Fecha</th><th>Código</th><th>Silo</th><th>Masa</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th></th></tr></thead><tbody>${comunes.map(c => { const cl = clasificar(c); const id = esc(claveComun(c)); return `<tr><td class="mono">${esc(c.fecha || "-")}</td><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(c.codigo || c.id)}</td><td>${esc(c.siloId)} · ${esc(c.turno || "Día")}</td><td class="mono">${fmt(c.masa, 2)} t</td><td class="mono">${fmt(c.cu, 3)}</td><td class="mono">${fmt(c.mo, 3)}</td><td class="mono">${fmt(c.s, 4)}</td><td><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${esc(cl.clase)}</span></td><td><div class="mini-actions"><button class="icon-btn" data-silo-calc="${esc(c.siloId)}">Calc</button><button class="icon-btn" data-comun-edit="${id}">Editar</button><button class="icon-btn" data-comun-del="${id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button></div></td></tr>`; }).join("") || `<tr><td colspan="9" style="color:var(--txt3);text-align:center;padding:18px">Sin comunes trazables registrados.</td></tr>`}</tbody></table></div></section>
  </div>${siloManualModalHTML(state.siloManualOpen)}${state.siloCalcOpen ? siloCalculoHTML(state.siloCalcOpen) : ""}`;
};

function tabHTMLDirectV12() {
  if (isGerente() && state.tab === "gerencial") return gerenteDashboardHTML();
  if (state.tab === "inventario") return inventarioHTML();
  if (state.tab === "silos") return silosHTML();
  if (state.tab === "quimica") return quimicaHTML();
  if (state.tab === "lotesOxmo") return lotesOxmoHTML();
  if (state.tab === "avisos") return avisosHTML();
  if (state.tab === "comunesTurno") return comunesTurnoHTML();
  if (state.tab === "admin") return adminHTML();
  if (state.tab === "mezclas") return mezclasHTML();
  if (state.tab === "registro") return registroHTML();
  if (state.tab === "infodia") return infodiaHTML();
  if (state.tab === "siloHistorial") return siloHistorialHTML();
  if (state.tab === "etiquetas") return etiquetasHTML();
  if (state.tab === "reportes") return reportesHTML();
  if (state.tab === "perfil") return perfilUsuarioHTML();
  return inventarioHTML();
}
tabHTML = tabHTMLDirectV12;

// Inicialización final segura.
syncInventarioACP();
repararIdsLotesManuales();
if (state.infodia) state.infodia = compactInfodiaFinal(state.infodia);
migrarAreaCelulaV9();
recalcularSiloHistorialInfodiaV9();
render();
initCloud().then(() => setTimeout(() => {
  try {
    resyncCloudSnapshotFinal();
    migrarAreaCelulaV9();
    recalcularSiloHistorialInfodiaV9();
    render();
  } catch (e) {
    console.warn("Post-sync v12", e);
  }
}, 1200));

/* =========================================================
   HOTFIX_V14_20260627
   - Cartilla ACP sin columna Fuente
   - Infodia actualiza inventario solo con coincidencia exacta completa
   - Botón de Infodia con icono nube upload
   - KPIs superiores: Masa disponible (con análisis) y Masa sin análisis
   - Dashboard gerencial en Mo fino + Cu promedio
   ========================================================= */

function iconoCloudUploadV14() {
  return `<span class="cloud-upload-icon" aria-hidden="true">☁</span>`;
}

function codigoExactoInventarioACPv14(codigo) {
  return String(codigo ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, "");
}

function buscarAnalisisExactoInventarioV14(lote, analisisACP) {
  const idLote = codigoExactoInventarioACPv14(lote?.id);
  if (!idLote) return null;
  const candidatos = (analisisACP || [])
    .filter(a => a && a.tipoAnalisis !== "comun_turno" && hasAnalysis(a))
    .filter(a => codigoExactoInventarioACPv14(a.codigo) === idLote)
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  return candidatos[0] || null;
}

actualizarInventarioConACP = function(lotes, analisisACP) {
  let actualizados = 0;
  const updated = (lotes || []).map(l => {
    const match = buscarAnalisisExactoInventarioV14(l, analisisACP);
    if (!match) return l;
    const quimica = {
      cu: Number(Number(match.cu || 0).toFixed(3)),
      mo: Number(Number(match.mo || 0).toFixed(3)),
      s: Number(Number(match.s || 0).toFixed(4)),
    };
    const cl = clasificar(quimica);
    const obsBase = String(l.obs || "").replace(/\s*\|?\s*ACP:[^|]+/g, "").trim();
    const obsAcp = `ACP: ${match.codigo}${match.fecha ? ` ${match.fecha}` : ""}`;
    const next = {
      ...l,
      ...quimica,
      estado: l.estado === "Bloqueado" ? "Bloqueado" : cl.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible",
      acpMatch: match.codigo,
      acpFecha: match.fecha,
      obs: obsBase ? `${obsBase} | ${obsAcp}` : obsAcp,
    };
    if (
      Number(l.cu || 0) !== next.cu ||
      Number(l.mo || 0) !== next.mo ||
      Number(l.s || 0) !== next.s ||
      l.estado !== next.estado ||
      l.acpMatch !== next.acpMatch ||
      l.acpFecha !== next.acpFecha
    ) actualizados += 1;
    return next;
  });
  return { lotes: updated, actualizados };
};

function syncInventarioACPExactV14() {
  const acp = state.infodia?.analisisACP?.length ? state.infodia.analisisACP : state.infodia?.analisisLotes || [];
  if (!acp.length) return 0;
  const result = actualizarInventarioConACP((state.lotes || []).filter(l => !isInfodiaProductionLote(l)), acp);
  if (result.actualizados) {
    state.lotes = result.lotes;
    save("oxmo:lotes", state.lotes);
  }
  return result.actualizados;
}

const aplicarInfodiaV14Base = aplicarInfodia;
aplicarInfodia = function(info) {
  aplicarInfodiaV14Base(info);
  const actualizados = syncInventarioACPExactV14();
  if (actualizados) addHist("Inventario actualizado exacto", "", `${actualizados} lote(s) cruzados por código completo`, C.green);
  render();
};

aplicarACPInventarioActual = function() {
  const result = actualizarInventarioConACP((state.lotes || []).filter(l => !isInfodiaProductionLote(l)), state.infodia?.analisisACP || state.infodia?.analisisLotes || []);
  state.lotes = result.lotes;
  save("oxmo:lotes", state.lotes);
  addHist("Inventario actualizado con ACP", "", `${result.actualizados} lote(s) cruzados con coincidencia exacta completa`, result.actualizados ? C.green : C.yellow);
  render();
};

function kpiDataAreaV14(lotes = lotesScopeAreaV10()) {
  const analizados = lotes.filter(hasAnalysis);
  const dispAnalizados = lotes.filter(l => l.estado === "Disponible" && hasAnalysis(l));
  const sinAnalisis = lotes.filter(l => !hasAnalysis(l));
  const fuera = lotes.filter(l => l.estado === "Fuera Esp" || clasificar(l).clase === "Fuera Esp");
  const masaDispAnalizada = dispAnalizados.reduce((a,l)=>a+Number(l.masa||0),0);
  const masaSinAnalisis = sinAnalisis.reduce((a,l)=>a+Number(l.masa||0),0);
  const masaAnalizada = analizados.reduce((a,l)=>a+Number(l.masa||0),0);
  const cuProm = masaAnalizada ? analizados.reduce((a,l)=>a+Number(l.cu||0)*Number(l.masa||0),0)/masaAnalizada : 0;
  const finoMoKg = analizados.reduce((a,l)=>a+Number(l.masa||0)*Number(l.mo||0)/100,0);
  return {
    analizados,
    disp: dispAnalizados,
    sinAnalisis,
    fuera,
    masaDisp: masaDispAnalizada,
    masaSinAnalisis,
    cuProm,
    finoMoKg,
    total: lotes.length,
  };
}

function kpiV14(label, value, unit, sub, color, icon, dec = 0) {
  const shown = typeof value === "number" ? value.toFixed(dec) : value;
  return `<div class="kpi" style="--accent:${color}"><div class="icon">${icon}</div><div class="kpi-label">${label}</div><div class="kpi-value">${shown}</div><div class="kpi-sub">${unit} · ${sub}</div></div>`;
}

function infodiaUploadPillV14() {
  return canViewTab("infodia") ? `<div class="filters infodia-upload-strip" style="margin-bottom:12px"><button class="pill cloud-upload-pill ${state.tab === "infodia" ? "active" : ""}" data-tab="infodia">${iconoCloudUploadV14()} Subir Infodia</button></div>` : "";
}

shellHTML = function() {
  if (isGerente()) return gerenteShellHTML();
  const lotesScope = lotesScopeAreaV10();
  const d = kpiDataAreaV14(lotesScope);
  const areaLabel = areaScopeGlobalV10();
  return `
    <header class="topbar">
      <div class="brand" style="justify-content:flex-start;margin:0"><div class="brand-mark" style="height:38px"></div><div><div style="font-weight:900;letter-spacing:3px">CONTROL OPERACIONAL</div><div class="brand-sub">OXMO · ENVASE · TRAZABILIDAD</div></div></div>
      <div class="top-user-center"><div class="top-user-role">${esc(state.user.rol.toUpperCase())}</div><div class="top-user-name">${esc(state.user.nombre)}</div></div>
      <div class="top-actions"><div style="text-align:right"><div id="clock" class="mono" style="color:var(--green);font-size:13px;font-weight:800">${new Date().toLocaleTimeString("es-CL")}</div><div style="color:var(--txt3);font-size:8px;letter-spacing:1px">${hoy()}</div></div><button class="btn secondary" id="cloudConfigBtn" title="Configurar tiempo real">NUBE: ${esc(cloud.status.toUpperCase())}</button><button class="btn danger" id="logoutBtn">SALIR</button></div>
    </header>
    <div class="status">${d.fuera.length ? `⚠ ${d.fuera.length} lote(s) fuera de especificación` : "Estado normal"} · Área: ${esc(areaLabel)} · Masa disponible con análisis: ${kgToTon(d.masaDisp)} · ${d.sinAnalisis.length} sin análisis · Lotes totales: ${d.total}</div>
    <main class="main main-v10-soft">
      <section class="kpis">
        ${kpiV14('Masa disponible <small>(con análisis)</small>', d.masaDisp / 1000, 't', `${d.disp.length} lotes`, C.green, 'INV', 2)}
        ${kpiV14('Masa sin análisis', d.masaSinAnalisis / 1000, 't', `${d.sinAnalisis.length} lotes`, C.yellow, 'LAB', 2)}
        ${kpiV14('Fino Mo', d.finoMoKg / 1000, 't', 'todos los analizados', C.copper, '◆', 2)}
        ${kpiV14('Cu Promedio', d.cuProm, '%', 'ponderado por masa', C.cyan, 'CU', 2)}
        ${kpiV14('Total Lotes', d.total, '', 'según área/filtro', C.blue, 'LOT', 0)}
        ${kpiV14('Fuera Esp.', d.fuera.length, '', 'lotes afectados', C.red, '!', 0)}
      </section>
      <nav class="tabs">${visibleTabs().map(([id,label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</nav>
      ${infodiaUploadPillV14()}
      <section id="tabView">${tabHTML()}</section>
    </main>
    <footer class="footer"><span>OXMO CONTROL · ${esc(state.user.nombre)} (${esc(state.user.rol)}) · Área ${esc(areaTrabajoUsuario())}</span><span>DATOS PERSISTENTES · SGI COMPATIBLE</span></footer>
    ${state.cloudPanel ? cloudPanelHTML() : ""}`;
};

const infodiaHTMLV14Base = infodiaHTML;
infodiaHTML = function() {
  return infodiaHTMLV14Base()
    .replace(/SUBIR INFODIA/g, `${iconoCloudUploadV14()} Subir Infodia`)
    .replace(/Importar nuevo Infodia/g, `${iconoCloudUploadV14()} Subir nuevo Infodia`);
};

lotesOxmoHTML = function() {
  const base = (state.infodia?.analisisLotes || [])
    .filter(a => a.tipoAnalisis !== "comun_turno")
    .filter(a => /^(OXMO|OXBR)\d+-\d{2}$/.test(normalizarCodigoAnalisis(a.codigo)) || String(a.codigo || "").toUpperCase().includes("OSAC"));
  const q = normalizarTextoAreaV9(state.acpSearch || "").toLowerCase();
  const items = q ? base.filter(a => [a.codigo, a.tipoAnalisis, a.fecha, a.cu, a.mo, a.s, clasificar(a).clase].join(" ").toLowerCase().includes(q)) : base;
  const allItems = base;
  const oxmo = allItems.filter(a => a.tipoAnalisis === "lote_oxmo");
  const briquetas = allItems.filter(a => a.tipoAnalisis === "briqueta");
  const osac = allItems.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").toUpperCase().includes("OSAC"));
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
      <div><div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div><div style="color:var(--txt);font-size:18px;font-weight:900">Resultado de lotes OXMO - BQA</div><div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:860px;line-height:1.45">Listado de análisis ACP para lotes OXMO, briquetas OXBR y registros OSAC. Estos datos son cartilla de laboratorio, no inventario físico.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button><button class="btn secondary cloud-upload-btn" data-tab="infodia">${iconoCloudUploadV14()} Subir Infodia</button></div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Lotes OXMO", oxmo.length, C.blueLight)}
      ${miniReport("Briquetas OXBR", briquetas.length, C.copper)}
      ${miniReport("OSAC", osac.length, C.cyan)}
      ${miniReport("Con análisis", allItems.filter(hasAnalysis).length, C.green)}
      ${miniReport("Fuera espec.", allItems.filter(x => clasificar(x).clase === "Fuera Esp").length, C.red)}
    </div>
    <div class="card" style="margin-bottom:14px"><div class="field" style="margin:0"><label>Buscar en cartilla</label><div style="display:flex;gap:8px;align-items:center"><input id="acpSearch" value="${esc(state.acpSearch || "")}" data-keep-case="true" placeholder="Ej: OXMO10065-26, OXBR1305-26, OSAC, 2026-06-14"><button class="btn secondary" id="acpSearchBtn" type="button">Buscar</button>${state.acpSearch ? `<button class="btn ghost" id="acpSearchClear" type="button">Limpiar</button>` : ""}</div></div></div>
    ${items.length ? `<div class="table-wrap"><table><thead><tr><th>ID lote</th><th>Tipo</th><th>Fecha análisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead><tbody>${items.map(a => { const c = clasificar(a); return `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo || "-")}</td><td>${esc(a.tipoAnalisis === "briqueta" ? "Briqueta" : a.tipoAnalisis === "lote_osac" ? "OSAC" : "Lote OXMO")}</td><td class="mono">${esc(a.fecha || "-")}</td><td class="mono" style="color:${Number(a.cu || 0) >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.mo || 0) >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.s || 0) < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td><td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${esc(c.clase)}</span></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">No hay análisis OXMO/OXBR/OSAC cargados o no hay resultados para la búsqueda.</div>`}
  </div>`;
};

function calcularFinoMoKgV14(lotes) {
  return (lotes || []).filter(hasAnalysis).reduce((a,l)=>a+Number(l.masa||0)*Number(l.mo||0)/100,0);
}
function cuPromPondKgV14(lotes) {
  const analizados = (lotes || []).filter(hasAnalysis);
  const masa = analizados.reduce((a,l)=>a+Number(l.masa||0),0);
  return masa ? analizados.reduce((a,l)=>a+Number(l.cu||0)*Number(l.masa||0),0)/masa : 0;
}

const gerenteDashboardDataV14Base = gerenteDashboardData;
gerenteDashboardData = function() {
  const d = gerenteDashboardDataV14Base();
  const lotes = d.lotes || [];
  const fineTotal = calcularFinoMoKgV14(lotes);
  const fineDisponible = calcularFinoMoKgV14(lotes.filter(l => l.estado === "Disponible"));
  const fineFuera = calcularFinoMoKgV14(lotes.filter(l => l.estado === "Fuera Esp" || clasificar(l).clase === "Fuera Esp"));
  const fineNoDisp = calcularFinoMoKgV14(lotes.filter(l => l.estado !== "Disponible"));
  const cuProm = cuPromPondKgV14(lotes);
  const classRowsFine = (d.classRows || []).map(r => ({
    ...r,
    masaKg: calcularFinoMoKgV14(r.lots || []),
  }));
  const sectoresFine = (d.sectores || []).map(s => ({
    ...s,
    masaKg: calcularFinoMoKgV14(s.rows || []),
    masaT: calcularFinoMoKgV14(s.rows || []) / 1000,
  })).sort((a,b)=>b.masaKg-a.masaKg);
  return {
    ...d,
    masaFisicaTotalKg: d.masaTotalKg,
    masaFisicaDisponibleKg: d.masaDisponibleKg,
    masaTotalKg: fineTotal,
    masaDisponibleKg: fineDisponible,
    masaRetenidaKg: fineNoDisp,
    masaFueraKg: fineFuera,
    finoMoKg: fineTotal,
    cuPromedioPond: cuProm,
    classRows: classRowsFine,
    sectores: sectoresFine,
  };
};

const gerenteDashboardHTMLV14Base = gerenteDashboardHTML;
gerenteDashboardHTML = function() {
  const d = gerenteDashboardData();
  const sparkProd = d.trend30.slice(-12).map(x => x.finoMoEstimadoT || 0);
  const sparkCons = d.trend30.slice(-12).map(x => (x.consumoT || 0) * ((d.cuPromedioPond || 0) / 100));
  const userInitials = String(state.user?.nombre || state.user?.u || "GM").split(/\s+/).filter(Boolean).slice(0,2).map(x => x[0]).join("").toUpperCase() || "GM";
  return `<section class="exec-soft-board-v4">
    <header class="exec-v4-header"><button class="exec-v4-brand" data-tab="gerencial" title="Volver al resumen"><span></span><b>MOLYB</b></button><div class="exec-v4-user"><span>Gerente</span><button class="exec-v4-avatar" data-tab="perfil" title="Mi perfil">${esc(userInitials)}</button><button class="exec-v4-logout" id="logoutBtn" title="Cerrar sesión">Salir</button></div></header>
    <div class="exec-area-filter-card"><label>Área dashboard</label>${areaFilterSelectV10("gerenteAreaFilter", normalizarTextoAreaV9(state.gerenteAreaFilter || AREA_FILTRO_TODAS_V10))}</div>
    <div class="exec-v4-layout"><section class="exec-v4-content"><div class="exec-soft-hero exec-v4-hero"><div><h1>Control Operacional Molyb</h1><p>Vista gerencial en Mo fino. Consolida inventario valorizado como masa × %Mo, clasificación, producción, consumos y alertas sin exponer operación técnica detallada.</p></div></div>
      <div class="exec-soft-kpis exec-v4-kpis">
        ${gerenteKpiHTML('Mo fino total', kgToTon(d.masaTotalKg, 2), `${d.lotes.length} lotes registrados`, C.blueLight, '◈', d.sectores.map(s => s.masaT))}
        ${gerenteKpiHTML('Mo fino disponible', kgToTon(d.masaDisponibleKg, 2), `Base física ${kgToTon(d.masaFisicaDisponibleKg || 0, 2)}`, C.green, '◎', sparkProd)}
        ${gerenteKpiHTML('Mo fino retenido', kgToTon(d.masaRetenidaKg, 2), `${d.retenidos.length} lotes no disponibles`, C.yellow, '▣', d.classRows.map(s => s.masaKg/1000))}
        ${gerenteKpiHTML('Mo fino fuera espec.', kgToTon(d.masaFueraKg, 2), `${d.fuera.length} lote(s) afectados`, C.red, '△', d.classRows.map(s => s.masaKg/1000))}
        ${gerenteKpiHTML('Producción Mo fino mes', kgToTon(d.totals.kgMo || 0, 2), `${d.totals.lotes || 0} registros Infodia`, C.green, '▥', sparkProd)}
        ${gerenteKpiHTML('Cu promedio', `${gerenteNumber(d.cuPromedioPond || 0, 2)}%`, 'ponderado por masa física', C.cyan, 'CU', d.sectores.map(s => s.cuAvg || 0))}
      </div>
      <div class="exec-soft-panels exec-v4-panels">${gerenteTrendCardHTML(d)}${gerenteDonutHTML(d)}</div><div class="exec-soft-update">• Última actualización: ${esc(d.updatedAt)}</div></section>
      <aside class="exec-soft-side exec-v4-side">${gerenteCalendarHTML()}${gerenteClockHTML()}<div class="exec-soft-side-card exec-v4-observaciones"><div class="exec-soft-side-title">Observaciones</div>${d.alerts.map(a => `<div class="exec-soft-alert ${a.level}"><b>${esc(a.title)}</b><p>${esc(a.text)}</p></div>`).join('')}</div></aside></div>
  </section>`;
};

// Sincronización final de datos ACP luego de cargar esta versión.
try { syncInventarioACPExactV14(); } catch (e) { console.warn("sync ACP exact v14", e); }
try { render(); } catch (e) { console.warn("render v14", e); }

/* =========================================================
   HOTFIX_V15_20260627
   Cruce ACP exacto con normalización O/0 en códigos numéricos.
   Ejemplo válido: OO710-001-00303-26 = 00710-001-00303-26.
   No cruza por sufijo ni por últimos números.
   ========================================================= */
function codigoCanonicoExactoACPv15(codigo) {
  const raw = String(codigo ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, "");
  const base = raw.match(/^(.*-\d{2})(?:[-_].*)?$/)?.[1] || raw;
  return base.split("-").map(seg => {
    // Solo segmentos numéricos donde Excel/teclado puede mezclar letra O con cero.
    // No se toca OXMO/OXBR/OSAC u otros prefijos alfanuméricos reales.
    if (/^[O0\d]+$/.test(seg) && /\d/.test(seg)) return seg.replace(/O/g, "0");
    return seg;
  }).join("-");
}

buscarAnalisisExactoInventarioV14 = function(lote, analisisACP) {
  const idLote = codigoCanonicoExactoACPv15(lote?.id);
  if (!idLote) return null;
  const candidatos = (analisisACP || [])
    .filter(a => a && a.tipoAnalisis !== "comun_turno" && hasAnalysis(a))
    .filter(a => codigoCanonicoExactoACPv15(a.codigo) === idLote)
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  return candidatos[0] || null;
};

actualizarInventarioConACP = function(lotes, analisisACP) {
  let actualizados = 0;
  const updated = (lotes || []).map(l => {
    const match = buscarAnalisisExactoInventarioV14(l, analisisACP);
    if (!match) return l;
    const quimica = {
      cu: Number(Number(match.cu || 0).toFixed(3)),
      mo: Number(Number(match.mo || 0).toFixed(3)),
      s: Number(Number(match.s || 0).toFixed(4)),
    };
    const cl = clasificar(quimica);
    const obsBase = String(l.obs || "").replace(/\s*\|?\s*ACP:[^|]+/g, "").trim();
    const obsAcp = `ACP: ${match.codigo}${match.fecha ? ` ${match.fecha}` : ""}`;
    const next = {
      ...l,
      ...quimica,
      estado: l.estado === "Bloqueado" ? "Bloqueado" : cl.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible",
      acpMatch: match.codigo,
      acpFecha: match.fecha,
      obs: obsBase ? `${obsBase} | ${obsAcp}` : obsAcp,
    };
    if (
      Number(l.cu || 0) !== next.cu ||
      Number(l.mo || 0) !== next.mo ||
      Number(l.s || 0) !== next.s ||
      l.estado !== next.estado ||
      l.acpMatch !== next.acpMatch ||
      l.acpFecha !== next.acpFecha
    ) actualizados += 1;
    return next;
  });
  return { lotes: updated, actualizados };
};

syncInventarioACPExactV14 = function() {
  const acp = state.infodia?.analisisACP?.length ? state.infodia.analisisACP : state.infodia?.analisisLotes || [];
  if (!acp.length) return 0;
  const result = actualizarInventarioConACP((state.lotes || []).filter(l => !isInfodiaProductionLote(l)), acp);
  if (result.actualizados) {
    state.lotes = result.lotes;
    save("oxmo:lotes", state.lotes);
  }
  return result.actualizados;
};

aplicarACPInventarioActual = function() {
  const acp = state.infodia?.analisisACP || state.infodia?.analisisLotes || [];
  const result = actualizarInventarioConACP((state.lotes || []).filter(l => !isInfodiaProductionLote(l)), acp);
  state.lotes = result.lotes;
  save("oxmo:lotes", state.lotes);
  addHist("Inventario actualizado con ACP", "", `${result.actualizados} lote(s) cruzados por código completo normalizado O/0`, result.actualizados ? C.green : C.yellow);
  alert(result.actualizados
    ? `${result.actualizados} lote(s) actualizados con ACP. Cruce exacto por código completo, normalizando O/0 en segmentos numéricos.`
    : "No hubo coincidencias exactas. Revisa que el código completo del inventario exista en la cartilla ACP.");
  render();
};

const aplicarInfodiaV15Base = aplicarInfodia;
aplicarInfodia = function(info) {
  aplicarInfodiaV15Base(info);
  const actualizados = syncInventarioACPExactV14();
  if (actualizados) addHist("Inventario actualizado ACP O/0", "", `${actualizados} lote(s) cruzados por código completo normalizado`, C.green);
  render();
};

try {
  const actualizadosV15 = syncInventarioACPExactV14();
  if (actualizadosV15) console.info(`ACP v15: ${actualizadosV15} lote(s) actualizados por código completo normalizado O/0`);
  render();
} catch (e) {
  console.warn("sync ACP exact v15", e);
}

/* =========================================================
   HOTFIX_V17_20260627
   ACP -> Inventario: coincidencia exacta por código completo,
   aceptando O/0 y relleno de ceros por segmento.
   También reconoce códigos PROCESO tipo OO710-001-00303-26.
   ========================================================= */
function normalizarSegmentoNumericoO0V17(seg) {
  const s = String(seg || "").toUpperCase().replace(/O/g, "0");
  return /^[0-9]+$/.test(s) ? s : String(seg || "").toUpperCase();
}

function codigoCanonicoExactoACPv17(codigo) {
  const raw = String(codigo ?? "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[‐‑‒–—―]/g, "-")
    .replace(/\s+/g, "")
    .replace(/_+/g, "-");
  const base = raw.match(/^(.*-\d{2})(?:[-_].*)?$/)?.[1] || raw;
  const parts = base.split("-").map(normalizarSegmentoNumericoO0V17);

  // Formato industrial de inventario/ACP: 00710-001-00303-26.
  // Mantiene coincidencia completa, pero corrige diferencias visuales:
  // OO710 -> 00710 y 3001 -> 03001.
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    return [
      parts[0].padStart(5, "0"),
      parts[1].padStart(3, "0"),
      parts[2].padStart(5, "0"),
      parts[3].slice(-2).padStart(2, "0"),
    ].join("-");
  }
  return parts.join("-");
}

function esCodigoComunTurnoV17(codigo) {
  return /^00300-001-\d{5}-\d{2}$/.test(codigoCanonicoExactoACPv17(codigo));
}

function esCodigoProcesoInventarioV17(codigo) {
  const c = codigoCanonicoExactoACPv17(codigo);
  return /^\d{5}-\d{3}-\d{5}-\d{2}$/.test(c) && !esCodigoComunTurnoV17(c);
}

const tipoAnalisisACPV17Base = typeof tipoAnalisisACP === "function" ? tipoAnalisisACP : null;
tipoAnalisisACP = function(codigo) {
  const raw = normalizarCodigoAnalisis(codigo);
  const canon = codigoCanonicoExactoACPv17(raw);
  if (/^00300-001-\d{5}-\d{2}$/.test(canon)) return "comun_turno";
  if (/^\d{5}-\d{3}-\d{5}-\d{2}$/.test(canon)) return "lote_proceso";
  if (/^OXMO\d+-\d{2}$/.test(raw)) return "lote_oxmo";
  if (/^OXBR\d+-\d{2}$/.test(raw)) return "briqueta";
  if (String(raw || "").includes("OSAC") && /-\d{2}$/.test(raw)) return "lote_osac";
  if (tipoAnalisisACPV17Base) return tipoAnalisisACPV17Base(raw);
  return "";
};


function labelTipoAnalisis(tipo) {
  if (typeof labelTipoAnalisisV17 === "function") return labelTipoAnalisisV17(tipo);
  if (tipo === "lote_proceso") return "Proceso / Inventario";
  if (tipo === "briqueta") return "Briqueta";
  if (tipo === "comun_turno") return "Común turno";
  if (tipo === "lote_osac") return "OSAC";
  if (tipo === "otro_lote") return "Otro lote";
  return "Lote OXMO";
}

function labelTipoAnalisisV17(tipo, codigo) {
  if (tipo === "lote_proceso") return "Proceso / Inventario";
  if (tipo === "lote_oxmo") return "Lote OXMO";
  if (tipo === "briqueta") return "Briqueta OXBR";
  if (tipo === "lote_osac") return "OSAC";
  if (tipo === "comun_turno") return "Común turno";
  return codigo ? "Análisis" : "-";
}

function buscarAnalisisInventarioV17(lote, analisisACP) {
  const idLote = codigoCanonicoExactoACPv17(lote?.id);
  if (!idLote) return null;
  const candidatos = (analisisACP || [])
    .filter(a => a && a.tipoAnalisis !== "comun_turno" && hasAnalysis(a))
    .filter(a => codigoCanonicoExactoACPv17(a.codigo) === idLote)
    .sort((a, b) => String(b.fecha || "").localeCompare(String(a.fecha || "")));
  return candidatos[0] || null;
}

actualizarInventarioConACP = function(lotes, analisisACP) {
  let actualizados = 0;
  let revisados = 0;
  const updated = (lotes || []).map(l => {
    if (isInfodiaProductionLote(l)) return l;
    revisados += 1;
    const match = buscarAnalisisInventarioV17(l, analisisACP);
    if (!match) return l;
    const quimica = {
      cu: Number(Number(match.cu || 0).toFixed(3)),
      mo: Number(Number(match.mo || 0).toFixed(3)),
      s: Number(Number(match.s || 0).toFixed(4)),
    };
    const cl = clasificar(quimica);
    const obsBase = String(l.obs || "").replace(/\s*\|?\s*ACP:[^|]+/g, "").trim();
    const obsAcp = `ACP: ${match.codigo}${match.fecha ? ` ${match.fecha}` : ""}`;
    const next = {
      ...l,
      ...quimica,
      estado: l.estado === "Bloqueado" ? "Bloqueado" : cl.clase === "Fuera Esp" ? "Fuera Esp" : "Disponible",
      acpMatch: match.codigo,
      acpCodigoCanonico: codigoCanonicoExactoACPv17(match.codigo),
      acpFecha: match.fecha,
      obs: obsBase ? `${obsBase} | ${obsAcp}` : obsAcp,
    };
    if (
      Number(l.cu || 0) !== next.cu ||
      Number(l.mo || 0) !== next.mo ||
      Number(l.s || 0) !== next.s ||
      l.estado !== next.estado ||
      l.acpMatch !== next.acpMatch ||
      l.acpFecha !== next.acpFecha
    ) actualizados += 1;
    return next;
  });
  return { lotes: updated, actualizados, revisados };
};

syncInventarioACPExactV14 = function() {
  const acp = state.infodia?.analisisACP?.length ? state.infodia.analisisACP : state.infodia?.analisisLotes || [];
  if (!acp.length) return 0;
  const result = actualizarInventarioConACP(state.lotes || [], acp);
  if (result.actualizados) {
    state.lotes = result.lotes;
    save("oxmo:lotes", state.lotes);
  }
  return result.actualizados;
};

aplicarACPInventarioActual = function() {
  const acp = state.infodia?.analisisACP?.length ? state.infodia.analisisACP : state.infodia?.analisisLotes || [];
  const result = actualizarInventarioConACP(state.lotes || [], acp);
  state.lotes = result.lotes;
  save("oxmo:lotes", state.lotes);
  addHist("Inventario actualizado con ACP", "", `${result.actualizados} lote(s) cruzados por código completo`, result.actualizados ? C.green : C.yellow);
  alert(result.actualizados
    ? `${result.actualizados} lote(s) actualizados con ACP.\nCruce por código completo normalizado: OO/O0/00 y ceros por segmento.\nEjemplo: OO710-001-00303-26 = 00710-001-00303-26.`
    : `No hubo coincidencias exactas.\nACP cargados: ${acp.length}.\nInventario revisado: ${result.revisados || 0}.\nRevisa que el código completo exista en ambos lados.`);
  render();
};

const aplicarInfodiaV17Base = aplicarInfodia;
aplicarInfodia = function(info) {
  aplicarInfodiaV17Base(info);
  const actualizados = syncInventarioACPExactV14();
  if (actualizados) addHist("ACP aplicado a inventario", "", `${actualizados} lote(s) actualizados por código completo`, C.green);
  render();
};

// Cartilla ACP: incluir también códigos PROCESO / inventario completo, no solo OXMO/OXBR/OSAC.
lotesOxmoHTML = function() {
  const base = (state.infodia?.analisisACP || state.infodia?.analisisLotes || [])
    .filter(a => a && a.tipoAnalisis !== "comun_turno")
    .filter(a => {
      const codigo = String(a.codigo || "").toUpperCase();
      const tipo = tipoAnalisisACP(codigo);
      return tipo === "lote_proceso" || tipo === "lote_oxmo" || tipo === "briqueta" || tipo === "lote_osac" || codigo.includes("OSAC");
    });
  const q = normalizarTextoAreaV9(state.acpSearch || "").toLowerCase();
  const items = q ? base.filter(a => [a.codigo, codigoCanonicoExactoACPv17(a.codigo), labelTipoAnalisisV17(a.tipoAnalisis, a.codigo), a.fecha, a.cu, a.mo, a.s, clasificar(a).clase].join(" ").toLowerCase().includes(q)) : base;
  const allItems = base;
  const proceso = allItems.filter(a => tipoAnalisisACP(a.codigo) === "lote_proceso");
  const oxmo = allItems.filter(a => a.tipoAnalisis === "lote_oxmo");
  const briquetas = allItems.filter(a => a.tipoAnalisis === "briqueta");
  const osac = allItems.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").toUpperCase().includes("OSAC"));
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
      <div><div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div><div style="color:var(--txt);font-size:18px;font-weight:900">Resultado de lotes OXMO - BQA</div><div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:860px;line-height:1.45">Listado de análisis ACP para lotes de inventario/proceso, OXMO, briquetas OXBR y OSAC. Estos datos son cartilla de laboratorio, no inventario físico.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button><button class="btn secondary cloud-upload-btn" data-tab="infodia">${iconoCloudUploadV14()} Subir Infodia</button></div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Proceso/inventario", proceso.length, C.blueLight)}
      ${miniReport("Lotes OXMO", oxmo.length, C.blueLight)}
      ${miniReport("Briquetas OXBR", briquetas.length, C.copper)}
      ${miniReport("OSAC", osac.length, C.cyan)}
      ${miniReport("Con análisis", allItems.filter(hasAnalysis).length, C.green)}
      ${miniReport("Fuera espec.", allItems.filter(x => clasificar(x).clase === "Fuera Esp").length, C.red)}
    </div>
    <div class="card" style="margin-bottom:14px"><div class="field" style="margin:0"><label>Buscar en cartilla</label><div style="display:flex;gap:8px;align-items:center"><input id="acpSearch" value="${esc(state.acpSearch || "")}" data-keep-case="true" placeholder="Ej: 00710-001-00303-26, OO710-001-00303-26, OXMO10065-26"><button class="btn secondary" id="acpSearchBtn" type="button">Buscar</button>${state.acpSearch ? `<button class="btn ghost" id="acpSearchClear" type="button">Limpiar</button>` : ""}</div></div></div>
    ${items.length ? `<div class="table-wrap"><table><thead><tr><th>ID lote</th><th>Código normalizado</th><th>Tipo</th><th>Fecha análisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead><tbody>${items.map(a => { const c = clasificar(a); const tipo = labelTipoAnalisisV17(tipoAnalisisACP(a.codigo), a.codigo); return `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo || "-")}</td><td class="mono" style="color:var(--txt2);font-size:11px">${esc(codigoCanonicoExactoACPv17(a.codigo))}</td><td>${esc(tipo)}</td><td class="mono">${esc(a.fecha || "-")}</td><td class="mono" style="color:${Number(a.cu || 0) >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.mo || 0) >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.s || 0) < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td><td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${esc(c.clase)}</span></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">No hay análisis de proceso/OXMO/OXBR/OSAC cargados o no hay resultados para la búsqueda.</div>`}
  </div>`;
};

try {
  const actualizadosV17 = syncInventarioACPExactV14();
  if (actualizadosV17) console.info(`ACP v17: ${actualizadosV17} lote(s) actualizados por código completo normalizado`);
  render();
} catch (e) {
  console.warn("sync ACP exact v17", e);
}

/* =========================================================
   HOTFIX_V18_REPORTES_ADMIN_MOFINO_20260627
   - Elimina pestaña Alertas/Alarma.
   - Agrega KPIs superiores de Mo fino por clasificación.
   - Reportes: historial de eventos/acciones visible solo para Admin.
   ========================================================= */
function finoMoPorClasificacionV18(lotes = lotesScopeAreaV10()) {
  const out = { bajo: 0, alto: 0, fuera: 0 };
  for (const l of lotes || []) {
    if (!hasAnalysis(l)) continue;
    const fino = Number(l.masa || 0) * Number(l.mo || 0) / 100;
    const clase = clasificar(l).clase;
    if (clase === "Bajo Cobre") out.bajo += fino;
    else if (clase === "Alto Cobre") out.alto += fino;
    else if (clase === "Fuera Esp") out.fuera += fino;
  }
  return out;
}

const canViewTabV18Base = canViewTab;
canViewTab = function(id, user = state.user) {
  if (id === "alertas" || id === "alarma" || id === "alarmas") return false;
  return canViewTabV18Base(id, user);
};

const visibleTabsV18Base = visibleTabs;
visibleTabs = function() {
  return visibleTabsV18Base().filter(([id, label]) => {
    const raw = `${id} ${label}`.toLowerCase();
    return !raw.includes("alerta") && !raw.includes("alarma");
  });
};

const shellHTMLV18Base = shellHTML;
shellHTML = function() {
  if (isGerente()) return gerenteShellHTML();
  const lotesScope = lotesScopeAreaV10();
  const d = kpiDataAreaV14(lotesScope);
  const fino = finoMoPorClasificacionV18(lotesScope);
  const areaLabel = areaScopeGlobalV10();
  return `
    <header class="topbar">
      <div class="brand" style="justify-content:flex-start;margin:0"><div class="brand-mark" style="height:38px"></div><div><div style="font-weight:900;letter-spacing:3px">CONTROL OPERACIONAL</div><div class="brand-sub">OXMO · ENVASE · TRAZABILIDAD</div></div></div>
      <div class="top-user-center"><div class="top-user-role">${esc(state.user.rol.toUpperCase())}</div><div class="top-user-name">${esc(state.user.nombre)}</div></div>
      <div class="top-actions"><div style="text-align:right"><div id="clock" class="mono" style="color:var(--green);font-size:13px;font-weight:800">${new Date().toLocaleTimeString("es-CL")}</div><div style="color:var(--txt3);font-size:8px;letter-spacing:1px">${hoy()}</div></div><button class="btn secondary" id="cloudConfigBtn" title="Configurar tiempo real">NUBE: ${esc(cloud.status.toUpperCase())}</button><button class="btn danger" id="logoutBtn">SALIR</button></div>
    </header>
    <div class="status">${d.fuera.length ? `⚠ ${d.fuera.length} lote(s) fuera de especificación` : "Estado normal"} · Área: ${esc(areaLabel)} · Masa disponible con análisis: ${kgToTon(d.masaDisp)} · ${d.sinAnalisis.length} sin análisis · Lotes totales: ${d.total}</div>
    <main class="main main-v10-soft">
      <section class="kpis kpis-v18-mofino">
        ${kpiV14('Masa disponible <small>(con análisis)</small>', d.masaDisp / 1000, 't', `${d.disp.length} lotes`, C.green, 'INV', 2)}
        ${kpiV14('Masa sin análisis', d.masaSinAnalisis / 1000, 't', `${d.sinAnalisis.length} lotes`, C.yellow, 'LAB', 2)}
        ${kpiV14('Fino Mo total', d.finoMoKg / 1000, 't', 'todos los analizados', C.copper, '◆', 2)}
        ${kpiV14('Cu Promedio', d.cuProm, '%', 'ponderado por masa', C.cyan, 'CU', 2)}
        ${kpiV14('Total Lotes', d.total, '', 'según área/filtro', C.blue, 'LOT', 0)}
        ${kpiV14('Fuera Esp.', d.fuera.length, '', 'lotes afectados', C.red, '!', 0)}
        ${kpiV14('Mo fino BC', fino.bajo / 1000, 't', 'material Bajo Cobre', C.green, 'BC', 2)}
        ${kpiV14('Mo fino Alto Cu', fino.alto / 1000, 't', 'material Alto Cobre', C.copper, 'AC', 2)}
        ${kpiV14('Mo fino Fuera Esp.', fino.fuera / 1000, 't', 'material fuera de especificación', C.red, 'FE', 2)}
      </section>
      <nav class="tabs">${visibleTabs().map(([id,label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</nav>
      ${infodiaUploadPillV14()}
      <section id="tabView">${tabHTML()}</section>
    </main>
    <footer class="footer"><span>OXMO CONTROL · ${esc(state.user.nombre)} (${esc(state.user.rol)}) · Área ${esc(areaTrabajoUsuario())}</span><span>DATOS PERSISTENTES · SGI COMPATIBLE</span></footer>
    ${state.cloudPanel ? cloudPanelHTML() : ""}`;
};

function adminAuditReportHTMLV18() {
  if (!isAdmin()) return "";
  const usuarios = (state.usuarios || []).map(u => {
    const key = userKey(u);
    const stat = state.userStats?.[key] || {};
    return { u, key, stat };
  });
  const eventosSistema = [...(state.historial || [])].slice().reverse().slice(0, 120);
  const accionesUsuario = usuarios.flatMap(({ u, key, stat }) => (stat.recientes || []).map(r => ({
    usuario: key,
    nombre: u.nombre || key,
    rol: u.rol || "-",
    area: areaTrabajoUsuario(u),
    fecha: r.fecha || "-",
    tiempo: r.tiempo || "-",
    accion: r.accion || "-",
    loteId: r.loteId || "",
    detalle: r.detalle || "",
  }))).sort((a, b) => `${b.fecha} ${b.tiempo}`.localeCompare(`${a.fecha} ${a.tiempo}`)).slice(0, 160);
  return `<div class="box admin-audit-report">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Control administrador</div>
        <h2 style="margin:0">Historial de eventos y acciones por usuario</h2>
        <p style="color:var(--txt2);font-size:12px;margin:6px 0 0;max-width:900px;line-height:1.45">Visible solo para Administrador. Resume eventos del sistema, acciones por cuenta, tiempo de uso y últimos accesos registrados.</p>
      </div>
      <span class="tag" style="background:#00d4ff22;color:var(--cyan);border-color:#00d4ff44">Solo Admin</span>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Usuarios", usuarios.length, C.blueLight)}
      ${miniReport("Acciones", usuarios.reduce((a, x) => a + Number(x.stat.acciones || 0), 0), C.green)}
      ${miniReport("Eventos sistema", (state.historial || []).length, C.copper)}
      ${miniReport("Tiempo acumulado", formatDuration(usuarios.reduce((a, x) => a + Number(x.stat.tiempoMs || 0), 0)), C.cyan)}
    </div>
    <div class="table-wrap" style="margin-bottom:14px">
      <table>
        <thead><tr><th>Cuenta</th><th>Nombre</th><th>Rol</th><th>Área</th><th>Acciones</th><th>Tiempo uso</th><th>Último uso</th></tr></thead>
        <tbody>${usuarios.map(({ u, key, stat }) => `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(key)}</td><td>${esc(u.nombre || "-")}</td><td>${esc(u.rol || "-")}</td><td>${areaBadgeHTML(areaTrabajoUsuario(u), true)}</td><td class="mono">${Number(stat.acciones || 0)}</td><td class="mono">${esc(formatDuration(tiempoUsuarioMs(key)))}</td><td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="profile-grid">
      <div class="card">
        <div class="section-title" style="margin-bottom:10px">Últimas acciones por cuenta</div>
        <div class="table-wrap" style="max-height:360px"><table><thead><tr><th>Fecha</th><th>Hora</th><th>Usuario</th><th>Acción</th><th>Lote</th><th>Detalle</th></tr></thead><tbody>${accionesUsuario.length ? accionesUsuario.map(r => `<tr><td class="mono">${esc(r.fecha)}</td><td class="mono">${esc(r.tiempo)}</td><td>${esc(r.nombre)} <span style="color:var(--txt3)">(${esc(r.usuario)})</span></td><td>${esc(r.accion)}</td><td class="mono" style="color:var(--blue-light)">${esc(r.loteId || "-")}</td><td style="color:var(--txt2)">${esc(r.detalle || "-")}</td></tr>`).join("") : `<tr><td colspan="6" style="text-align:center;color:var(--txt2);padding:18px">Sin acciones recientes registradas.</td></tr>`}</tbody></table></div>
      </div>
      <div class="card">
        <div class="section-title" style="margin-bottom:10px">Historial del sistema</div>
        <div class="table-wrap" style="max-height:360px"><table><thead><tr><th>Tiempo</th><th>Acción</th><th>Lote/Ref.</th><th>Detalle</th></tr></thead><tbody>${eventosSistema.length ? eventosSistema.map(h => `<tr><td class="mono">${esc(h.tiempo || "-")}</td><td>${esc(h.accion || "-")}</td><td class="mono" style="color:var(--blue-light)">${esc(h.loteId || "-")}</td><td style="color:var(--txt2)">${esc(h.detalle || "-")}</td></tr>`).join("") : `<tr><td colspan="4" style="text-align:center;color:var(--txt2);padding:18px">Sin eventos registrados.</td></tr>`}</tbody></table></div>
      </div>
    </div>
  </div>`;
}

const reportesHTMLV18Base = reportesHTML;
reportesHTML = function() {
  return `${reportesHTMLV18Base()}${adminAuditReportHTMLV18()}`;
};

const renderV18Base = render;
render = function() {
  if (state.tab === "alertas" || state.tab === "alarma" || state.tab === "alarmas") state.tab = "inventario";
  return renderV18Base();
};

try { render(); } catch (e) { console.warn("render v18", e); }


/* =========================================================
   HOTFIX_V21_CLAVES_PERFIL_20260627
   - Elimina el boton superior MI CLAVE.
   - Mueve cambio de clave propia a la pestaña Mi perfil.
   - Admin ve y cambia contraseña desde editor de usuario con confirmacion.
   ========================================================= */
function quitarBotonClaveSuperiorV21() {
  document.querySelectorAll('[data-self-pass-open]').forEach(btn => btn.remove());
  document.querySelectorAll('[data-self-pass-modal]').forEach(modal => modal.remove());
  state.selfPassOpen = false;
}

insertarBotonClavePropiaFinal = function() {
  quitarBotonClaveSuperiorV21();
};

passwordUsuarioModalHTML = function() {
  return "";
};

bindSelfPasswordFinal = function() {
  quitarBotonClaveSuperiorV21();
};

perfilUsuarioHTML = function() {
  const u = normalizarUsuario(state.usuarios.find(x => x.u === state.user?.u) || state.user || {});
  return `
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="section-title">Mi perfil</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">${esc(u.nombre)}</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Completa tus datos de contacto y administra tu clave de acceso desde esta pestaña.</div>
        </div>
        <span class="tag" style="color:${C.cyan};background:#00d4ff22;border-color:#00d4ff55">${esc(u.rol)}</span>
      </div>
      <form id="perfilUsuarioForm" class="profile-form">
        <div class="profile-grid">
          <div class="field"><label>Usuario</label><input class="input" readonly value="${esc(u.u)}"></div>
          <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" name="nombre" value="${esc(u.nombre)}"></div>
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" name="cargo" value="${valorPerfil(u, "cargo")}" placeholder="Ej: OPERADOR ENVASE"></div>
          <div class="field"><label>Área</label><input class="input" data-keep-case="true" name="area" value="${valorPerfil(u, "area")}" placeholder="Ej: ENVASE Y LOGÍSTICA"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" name="turno" value="${valorPerfil(u, "turno")}" placeholder="Ej: TURNO A / 7x7"></div>
          <div class="field"><label>Teléfono personal</label><input class="input" data-keep-case="true" name="telefono" value="${valorPerfil(u, "telefono")}" placeholder="+56 9 ...."></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" type="email" name="correo" value="${valorPerfil(u, "correo")}" placeholder="correo@empresa.cl"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" name="direccion" value="${valorPerfil(u, "direccion")}" placeholder="Dirección de contacto"></div>
        </div>

        <div class="card" style="margin-top:14px;border-top:2px solid ${C.blueLight}">
          <div class="section-title" style="margin-bottom:10px;color:${C.blueLight}">Clave de acceso</div>
          <div class="alert info" style="margin-bottom:12px">El botón superior “Mi clave” fue eliminado. Desde ahora, el cambio de contraseña se realiza solo aquí, en Mi perfil.</div>
          <div class="profile-grid">
            <div class="field"><label>Contraseña actual visible</label><input class="input mono" data-keep-case="true" type="text" readonly value="${esc(u.p || "")}" autocomplete="off"></div>
            <div class="field"><label>Nueva contraseña</label><input class="input" data-keep-case="true" data-profile-pass-new type="text" value="" placeholder="Dejar en blanco para mantener" autocomplete="off"></div>
            <div class="field"><label>Repetir nueva contraseña</label><input class="input" data-keep-case="true" data-profile-pass-repeat type="text" value="" placeholder="Repetir solo si cambiarás la clave" autocomplete="off"></div>
            <div class="field"><label>Estado</label><input class="input" readonly value="${u.activo !== false ? "Activo" : "Deshabilitado"}"></div>
          </div>
        </div>

        <div class="card" style="margin-top:14px">
          <div class="section-title" style="margin-bottom:10px;color:${C.red}">Contacto de emergencia</div>
          <div class="profile-grid">
            <div class="field"><label>Nombre contacto</label><input class="input" data-keep-case="true" name="contactoEmergenciaNombre" value="${valorPerfil(u, "contactoEmergenciaNombre")}" placeholder="Nombre y apellido"></div>
            <div class="field"><label>Relación</label><input class="input" data-keep-case="true" name="contactoEmergenciaRelacion" value="${valorPerfil(u, "contactoEmergenciaRelacion")}" placeholder="Ej: MADRE / PAREJA / HERMANO"></div>
            <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" name="contactoEmergenciaTelefono" value="${valorPerfil(u, "contactoEmergenciaTelefono")}" placeholder="+56 9 ...."></div>
            <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" name="observacionesContacto" rows="3" placeholder="Alergias, restricciones o notas relevantes">${valorPerfil(u, "observacionesContacto")}</textarea></div>
          </div>
        </div>
        <button class="btn primary" style="width:100%;margin-top:14px">Guardar mi perfil</button>
      </form>
    </div>
  `;
};

bindPerfilUsuario = function() {
  quitarBotonClaveSuperiorV21();
  const form = document.querySelector("#perfilUsuarioForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const newPass = document.querySelector("[data-profile-pass-new]")?.value || "";
    const repeat = document.querySelector("[data-profile-pass-repeat]")?.value || "";
    const patch = { ...data };
    if (newPass || repeat) {
      if (!newPass || newPass !== repeat) return alert("La nueva contraseña debe coincidir en ambos campos.");
      if (!confirm("¿Confirmas cambiar tu contraseña?")) return;
      patch.p = newPass;
    }
    const next = actualizarUsuarioPorKey(state.user.u, patch);
    if (!next) return alert("No se pudo actualizar el perfil.");
    addHist(newPass ? "Perfil y contraseña actualizados" : "Perfil actualizado", next.u, newPass ? "Cambio realizado desde Mi perfil" : "Datos de contacto actualizados", C.cyan);
    alert(newPass ? "Perfil y contraseña guardados correctamente." : "Perfil guardado correctamente.");
    render();
  });
};

adminUserModalHTML = function() {
  const user = normalizarUsuario(state.usuarios.find(u => u.u === state.adminEditUser));
  if (!user?.u) return "";
  const stat = state.userStats[user.u] || {};
  const roles = ROLES_USUARIO.map(r => `<option ${user.rol === r ? "selected" : ""}>${esc(r)}</option>`).join("");
  return `<div class="modal-backdrop" data-admin-user-modal>
    <div class="modal-card user-modal-card area-user-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px">
        <div>
          <div class="section-title">Editar usuario</div>
          <h2 style="margin:4px 0 0">${esc(user.nombre)}</h2>
          <div style="color:var(--txt2);font-size:12px;margin-top:4px">Administra cuenta, rol, área/célula, datos personales y contraseña visible. Todo cambio crítico solicita confirmación antes de guardar.</div>
        </div>
        <button class="btn ghost" data-admin-edit-close>Cerrar</button>
      </div>

      <div class="area-modal-banner">
        <div>
          <div class="area-modal-title">Área asignada</div>
          <div class="area-modal-text">Define qué inventario puede ver el usuario.</div>
        </div>
        ${areaBadgeHTML(user.area)}
      </div>

      <div class="profile-grid">
        <div class="field"><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${user.u === "admin" ? "readonly" : ""}></div>
        <div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div>
        <div class="field"><label>Contraseña visible / cambiar</label><input class="input mono" data-keep-case="true" data-admin-edit-pass type="text" value="${esc(user.p || "")}" autocomplete="off" spellcheck="false"></div>
        <div class="field"><label>Rol</label><select class="input" data-admin-edit-rol>${roles}</select></div>
        <div class="field"><label>Estado</label><select class="input" data-admin-edit-activo ${user.u === "admin" ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div>
        <div class="field"><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px">Datos laborales y contacto</div>
        <div class="profile-grid">
          <div class="field"><label>Cargo</label><input class="input" data-keep-case="true" data-admin-edit-cargo value="${valorPerfil(user, "cargo")}"></div>
          <div class="field"><label>Área / célula</label>${renderAreaSelectHTML({ value: user.area, dataAttr: "data-admin-edit-area", includeAdd: true })}</div>
          <div class="field" data-admin-edit-area-add-wrap style="display:none"><label>Nueva área / célula</label><input class="input" data-keep-case="true" data-admin-edit-area-add placeholder="Ej: Envase B, Logística, Centro Norte"></div>
          <div class="field"><label>Turno</label><input class="input" data-keep-case="true" data-admin-edit-turno value="${valorPerfil(user, "turno")}"></div>
          <div class="field"><label>Teléfono</label><input class="input" data-keep-case="true" data-admin-edit-telefono value="${valorPerfil(user, "telefono")}"></div>
          <div class="field"><label>Correo</label><input class="input" data-keep-case="true" data-admin-edit-correo value="${valorPerfil(user, "correo")}"></div>
          <div class="field"><label>Dirección</label><input class="input" data-keep-case="true" data-admin-edit-direccion value="${valorPerfil(user, "direccion")}"></div>
        </div>
      </div>

      <div class="card" style="margin-top:12px">
        <div class="section-title" style="margin-bottom:10px;color:${C.red}">Emergencia</div>
        <div class="profile-grid">
          <div class="field"><label>Contacto emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-nombre value="${valorPerfil(user, "contactoEmergenciaNombre")}"></div>
          <div class="field"><label>Relación</label><input class="input" data-keep-case="true" data-admin-edit-emerg-relacion value="${valorPerfil(user, "contactoEmergenciaRelacion")}"></div>
          <div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-telefono value="${valorPerfil(user, "contactoEmergenciaTelefono")}"></div>
          <div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" data-admin-edit-observaciones rows="3">${valorPerfil(user, "observacionesContacto")}</textarea></div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--txt2);font-size:12px;margin-top:8px">
          <div>Último uso: <b>${esc(stat.lastSeen || "-")}</b></div>
          <div>Tiempo de uso: <b>${esc(formatDuration(tiempoUsuarioMs(user.u)))}</b></div>
        </div>
      </div>
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div>
  </div>`;
};

const renderV21Base = render;
render = function() {
  const result = renderV21Base();
  quitarBotonClaveSuperiorV21();
  return result;
};

try { render(); } catch (e) { console.warn("render v21 claves", e); }


/* =========================================================
   HOTFIX_V22_OPERACION_20260627
   - Etiquetas: texto QR Molibdeno para el mundo Molyb.
   - Infodia visible solo para Encargado/Admin.
   - Lotes OXMO optimizado con límite de render.
   - Mensaje de Infodia actualizado con fecha/hora/archivo.
   - Mezclas filtradas por área asignada.
   - Silos recalculados desde el último Infodia cargado, sin arrastrar pantallas previas.
   - Nuevo lote habilitado para Supervisor/usuarios operativos.
   ========================================================= */

function normalizarTextoV22(v) {
  return String(v || "").trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

try {
  if (Array.isArray(ROLES_USUARIO) && !ROLES_USUARIO.includes("Encargado")) ROLES_USUARIO.splice(Math.max(0, ROLES_USUARIO.length - 1), 0, "Encargado");
} catch (e) { console.warn("roles v22", e); }

function esEncargadoInfodiaV22(user = state.user) {
  if (!user) return false;
  const rol = normalizarTextoV22(user.rol);
  const cargo = normalizarTextoV22(user.cargo);
  return rol.includes("encargado") || cargo.includes("encargado");
}

function puedeSubirInfodiaV22(user = state.user) {
  // El Admin queda como respaldo técnico para no bloquear la administración del sistema.
  return !!user && (isAdmin(user) || esEncargadoInfodiaV22(user));
}

const canViewTabV22Base = canViewTab;
canViewTab = function(id, user = state.user) {
  if (!user) return false;
  if (id === "infodia") return puedeSubirInfodiaV22(user);
  if (id === "registro") return !isGerente(user);
  return canViewTabV22Base(id, user);
};

const visibleTabsV22Base = visibleTabs;
visibleTabs = function() {
  const tabs = visibleTabsV22Base().filter(([id]) => id !== "infodia");
  return tabs;
};

function quitarBotonClaveSuperiorV22() {
  try {
    document.querySelectorAll('[data-self-pass-open], [data-self-pass-modal]').forEach(el => el.remove());
    document.querySelectorAll('button').forEach(btn => {
      const txt = String(btn.textContent || "").trim().toUpperCase();
      if (txt === "MI CLAVE") btn.remove();
    });
    state.selfPassOpen = false;
  } catch {}
}

quitarBotonClaveSuperiorV21 = quitarBotonClaveSuperiorV22;
insertarBotonClavePropiaFinal = function() { quitarBotonClaveSuperiorV22(); };
bindSelfPasswordFinal = function() { quitarBotonClaveSuperiorV22(); };
passwordUsuarioModalHTML = function() { return ""; };

etiquetaLabelHTML = function(data, qrUrl) {
  const fit = etiquetaFit(data.id);
  const accent = data.color || "#C87533";
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=620x620&margin=1&data=${encodeURIComponent(qrUrl)}`;
  return `<section class="label-page">
    <div class="label" style="--accent:${esc(accent)};--qr-size:${fit.qrMm}mm">
      <div class="label-top">
        <img class="label-logo" src="./molyb-logo.webp" alt="Molyb">
        <div class="label-brand">
          <div class="label-brand-title"><span>OXMO</span><span>CONTROL</span></div>
          <div class="label-date">${esc(data.fecha || hoy())}</div>
        </div>
      </div>
      <div class="label-id" style="font-size:${fit.idPt}pt">${esc(data.id || "SIN ID")}</div>
      <div class="label-class">${esc(String(data.mat || "SIN CLASIFICAR").toUpperCase())}</div>
      <div class="label-chem">
        <div class="label-cell"><span class="label-k">CU</span><span class="label-v">${esc(data.cu || "-")}%</span></div>
        <div class="label-cell"><span class="label-k">MO</span><span class="label-v">${esc(data.mo || "-")}%</span></div>
        <div class="label-cell"><span class="label-k">S</span><span class="label-v">${esc(data.s || "-")}%</span></div>
      </div>
      <div class="label-mass"><span class="label-k">MASA</span><span class="label-v">${esc(data.masa || "-")}</span></div>
      <div class="label-qr-area"><img class="label-qr" src="${qrSrc}" alt="QR ${esc(data.id)}"></div>
      <div class="label-foot">Molibdeno para el mundo Molyb</div>
    </div>
  </section>`;
};

function mensajeInfodiaActualizadoV22(fileName = "") {
  const now = new Date();
  const fecha = now.toLocaleDateString("es-CL");
  const hora = now.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return `Infodia actualizado el ${fecha} a las ${hora}. Archivo: ${fileName || "sin nombre"}`;
}

const infodiaUploadPillV22Base = typeof infodiaUploadPillV14 === "function" ? infodiaUploadPillV14 : null;
infodiaUploadPillV14 = function() {
  return puedeSubirInfodiaV22()
    ? `<div class="filters infodia-upload-strip" style="margin-bottom:12px"><button class="pill cloud-upload-pill ${state.tab === "infodia" ? "active" : ""}" data-tab="infodia">${iconoCloudUploadV14()} Subir Infodia</button></div>`
    : "";
};

const infodiaHTMLV22Base = infodiaHTML;
infodiaHTML = function() {
  if (!puedeSubirInfodiaV22()) {
    return `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">Solo usuarios con cargo o rol Encargado pueden subir Infodia.</div>`;
  }
  let html = infodiaHTMLV22Base();
  const info = state.infodia || {};
  const msg = state.infodiaMsgV22 || (info.fileName ? `Último Infodia actualizado: ${esc(info.fileName)} · ${esc(info.importedAt || "")}` : "");
  if (msg) {
    const card = `<div class="notice" style="border-color:#00e5a055;background:#00e5a022;color:var(--green);margin-bottom:12px">✅ ${esc(msg)}</div>`;
    html = html.replace('<div class="box">', `<div class="box">${card}`);
  }
  return html;
};

function clampV22(n, min, max) {
  const x = Number(n || 0);
  return Math.max(min, Math.min(max, Number.isFinite(x) ? x : 0));
}

function siloNivelesDesdeInfodiaActualV22(info) {
  const raw = info || {};
  const lastLevelBySilo = {};
  const lastAnalysisBySilo = {};
  const actualizadoEn = new Date().toISOString();
  for (const day of [...(raw.days || [])].sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")))) {
    for (const s of day.silos || []) {
      if (!isValidSiloId(s.id)) continue;
      const base = (state.silosBase || []).find(x => x.id === s.id) || { cap: 50 };
      const nivel = clampV22(s.finalNivel, 0, 100);
      const cap = Number(base.cap || 50);
      lastLevelBySilo[s.id] = {
        nivel,
        masa: Math.min(cap, Math.max(0, Number(s.masa || (nivel * cap / 100)))),
        fecha: day.fecha,
        fuente: "infodia",
        horaInicio: s.horaInicio,
        horaTermino: s.horaTermino,
        turno: s.turno,
        actualizadoEn,
      };
    }
  }
  for (const h of [...(raw.siloHistorial || [])].sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")))) {
    if (!isValidSiloId(h.siloId) || !hasAnalysis(h)) continue;
    lastAnalysisBySilo[h.siloId] = {
      fecha: h.fecha,
      cu: Number(h.cu || 0),
      mo: Number(h.mo || 0),
      s: Number(h.s || 0),
      clase: h.clase,
      movimiento: h.movimiento,
      comunes: h.comunes || [],
      horaInicio: h.horaInicio,
      horaTermino: h.horaTermino,
      actualizadoEn,
    };
  }
  const merged = {};
  for (const id of new Set([...Object.keys(lastLevelBySilo), ...Object.keys(lastAnalysisBySilo)])) {
    if (!isValidSiloId(id)) continue;
    const base = (state.silosBase || []).find(x => x.id === id) || { cap: 50 };
    const row = { ...(lastLevelBySilo[id] || {}), ...(lastAnalysisBySilo[id] || {}) };
    row.nivel = clampV22(row.nivel, 0, 100);
    row.masa = Math.min(Number(base.cap || 50), Math.max(0, Number(row.masa || 0)));
    row.fuente = row.fuente || "infodia";
    row.actualizadoEn = row.actualizadoEn || actualizadoEn;
    merged[id] = row;
  }
  return cleanSiloNiveles(merged);
}

const aplicarInfodiaV22Base = aplicarInfodia;
aplicarInfodia = function(info) {
  const rawInfo = compactInfodiaFinal ? compactInfodiaFinal(info) : info;
  aplicarInfodiaV22Base(info);
  const actuales = siloNivelesDesdeInfodiaActualV22(rawInfo);
  if (Object.keys(actuales).length) {
    state.siloNiveles = actuales;
    save("oxmo:siloNiveles", state.siloNiveles);
  }
};

const guardarComunManualV22Base = guardarComunManual;
guardarComunManual = function(data, fuente = "manual") {
  const before = (state.comunes || []).length;
  const ok = guardarComunManualV22Base(data, fuente);
  if (ok && (state.comunes || []).length > before) {
    const idx = state.comunes.length - 1;
    state.comunes[idx] = { ...state.comunes[idx], manualAt: new Date().toISOString(), fuente };
    save("oxmo:comunes", state.comunes);
  }
  return ok;
};

ponderarSilo = function(base) {
  const nivelImportado = state.siloNiveles?.[base.id] || null;
  const importMs = Date.parse(nivelImportado?.actualizadoEn || "") || fechaOrdenMs(nivelImportado?.fecha) || 0;
  const tieneImport = !!nivelImportado && Number(nivelImportado.masa || 0) > 0;
  const comunes = comunesPorSilo(base.id).filter(c => {
    if (!tieneImport) return true;
    const manualMs = Date.parse(c.manualAt || "") || 0;
    return manualMs && manualMs >= importMs;
  });
  const masa = comunes.reduce((a, c) => a + Number(c.masa || 0), 0);
  const weighted = key => masa ? comunes.reduce((a, c) => a + Number(c[key] || 0) * Number(c.masa || 0), 0) / masa : 0;
  const masaImportada = Number(nivelImportado?.masa || 0);
  const usaComunes = masa > 0;
  const usaInfodia = !usaComunes && masaImportada > 0;
  const masaOperacional = usaComunes ? masa : usaInfodia ? Math.min(Number(base.cap || 50), masaImportada) : 0;
  const silo = {
    ...base,
    masa: masaOperacional,
    nivel: base.cap ? clampV22((masaOperacional / base.cap) * 100, 0, 100) : 0,
    cu: usaComunes ? weighted("cu") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.cu || 0) : 0,
    mo: usaComunes ? weighted("mo") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.mo || 0) : 0,
    s: usaComunes ? weighted("s") : usaInfodia && hasAnalysis(nivelImportado) ? Number(nivelImportado.s || 0) : 0,
    muestras: usaComunes ? comunes.length : usaInfodia && hasAnalysis(nivelImportado) ? 1 : 0,
    ultimo: comunes.at(-1),
    nivelImportado,
  };
  return { ...silo, ...clasificar(silo) };
};

bindInfodia = function() {
  if (!puedeSubirInfodiaV22()) return;
  const file = document.querySelector("#infodiaFile");
  if (!file) return;
  file.addEventListener("change", async e => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    const label = document.querySelector('label[for="infodiaFile"]');
    const oldText = label?.innerHTML;
    if (label) label.innerHTML = `${iconoCloudUploadV14()} Procesando...`;
    try {
      const result = await importarInfodia(selected);
      aplicarInfodia(result);
      const msg = mensajeInfodiaActualizadoV22(selected.name);
      state.infodiaMsgV22 = msg;
      addHist("Infodia actualizado", "", msg, C.cyan);
      alert(msg);
      state.tab = "infodia";
      render();
    } catch (err) {
      alert(`No se pudo importar el Infodia: ${err.message || err}`);
      if (label && oldText) label.innerHTML = oldText;
    } finally {
      e.target.value = "";
    }
  });
};

function acpLotesBaseV22() {
  return (state.infodia?.analisisLotes || [])
    .filter(a => a && a.tipoAnalisis !== "comun_turno")
    .filter(a => /^(OXMO|OXBR)\d+-\d{2}$/.test(normalizarCodigoAnalisis(a.codigo)) || String(a.codigo || "").toUpperCase().includes("OSAC"));
}

lotesOxmoHTML = function() {
  const base = acpLotesBaseV22();
  const qRaw = String(state.acpSearch || "").trim();
  const q = normalizarTextoV22(qRaw);
  const filtrados = q ? base.filter(a => normalizarTextoV22([a.codigo, a.tipoAnalisis, a.fecha, a.cu, a.mo, a.s, clasificar(a).clase].join(" ")).includes(q)) : base;
  const limit = Number(state.lotesOxmoLimit || 260);
  const items = filtrados.slice(0, limit);
  const oxmo = base.filter(a => a.tipoAnalisis === "lote_oxmo");
  const briquetas = base.filter(a => a.tipoAnalisis === "briqueta");
  const osac = base.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").toUpperCase().includes("OSAC"));
  const uploadBtn = puedeSubirInfodiaV22() ? `<button class="btn secondary cloud-upload-btn" data-tab="infodia">${iconoCloudUploadV14()} Subir Infodia</button>` : "";
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
      <div><div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Cartilla ACP</div><div style="color:var(--txt);font-size:18px;font-weight:900">Resultado de lotes OXMO - BQA</div><div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:860px;line-height:1.45">Optimizado: se muestran ${items.length} de ${filtrados.length} registros para evitar retardo de apertura. Usa búsqueda para ubicar un lote específico.</div></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end"><button class="btn secondary" id="applyAcpInventory">Actualizar inventario con ACP</button>${uploadBtn}</div>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Lotes OXMO", oxmo.length, C.blueLight)}
      ${miniReport("Briquetas OXBR", briquetas.length, C.copper)}
      ${miniReport("OSAC", osac.length, C.cyan)}
      ${miniReport("Con análisis", base.filter(hasAnalysis).length, C.green)}
      ${miniReport("Fuera espec.", base.filter(x => clasificar(x).clase === "Fuera Esp").length, C.red)}
    </div>
    <div class="card" style="margin-bottom:14px"><div class="field" style="margin:0"><label>Buscar en cartilla</label><div style="display:flex;gap:8px;align-items:center"><input id="acpSearch" value="${esc(state.acpSearch || "")}" data-keep-case="true" placeholder="Ej: OXMO10065-26, OXBR1305-26, OSAC, 2026-06-14"><button class="btn secondary" id="acpSearchBtn" type="button">Buscar</button>${state.acpSearch ? `<button class="btn ghost" id="acpSearchClear" type="button">Limpiar</button>` : ""}</div></div></div>
    ${items.length ? `<div class="table-wrap"><table><thead><tr><th>ID lote</th><th>Tipo</th><th>Fecha análisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th></tr></thead><tbody>${items.map(a => { const c = clasificar(a); return `<tr><td class="mono" style="color:var(--blue-light);font-weight:900">${esc(a.codigo || "-")}</td><td>${esc(a.tipoAnalisis === "briqueta" ? "Briqueta" : a.tipoAnalisis === "lote_osac" ? "OSAC" : "Lote OXMO")}</td><td class="mono">${esc(a.fecha || "-")}</td><td class="mono" style="color:${Number(a.cu || 0) >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.mo || 0) >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td><td class="mono" style="color:${Number(a.s || 0) < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td><td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${esc(c.clase)}</span></td></tr>`; }).join("")}</tbody></table></div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">No hay análisis OXMO/OXBR/OSAC cargados o no hay resultados para la búsqueda.</div>`}
    ${filtrados.length > items.length ? `<div style="text-align:center;margin-top:12px"><button class="btn secondary" data-lotesoxmo-more>Mostrar 260 más</button></div>` : ""}
  </div>`;
};

const bindAnalisisACPV22Base = bindAnalisisACP;
bindAnalisisACP = function() {
  bindAnalisisACPV22Base();
  document.querySelector("#acpSearchClear")?.addEventListener("click", () => { state.acpSearch = ""; state.lotesOxmoLimit = 260; render(); });
  document.querySelector("[data-lotesoxmo-more]")?.addEventListener("click", () => { state.lotesOxmoLimit = Number(state.lotesOxmoLimit || 260) + 260; render(); });
};

function mixScopeLotesV22() {
  const base = typeof lotesScopeAreaV10 === "function" ? lotesScopeAreaV10(state.lotes) : lotesVisiblesAreaV9(state.lotes);
  return (base || []).filter(l => !isInfodiaProductionLote(l));
}

function mixSectoresV22(lotes) {
  const sectores = [...new Set((lotes || []).map(l => l.sector).filter(Boolean))].sort((a, b) => a.localeCompare(b, "es"));
  return ["Todos", ...sectores];
}

function mixMaterialesV22() {
  const base = mixScopeLotesV22();
  return base
    .filter(l => hasAnalysis(l) && l.estado !== "Pendiente" && Number(l.masa || 0) >= 1000)
    .filter(l => state.mix.sector === "Todos" || l.sector === state.mix.sector);
}

buscarMejoresMezclas2 = function() {
  const objetivo = objetivoMezcla();
  const selectedIds = new Set(state.mix.sel || []);
  const inventario = mixMaterialesV22()
    .map(l => ({ ...l, sacks: Math.min(40, Math.floor(Number(l.masa || 0) / 1000)) }))
    .filter(l => l.sacks > 0);
  const selected = selectedIds.size ? inventario.filter(l => selectedIds.has(l.id)) : [];
  const targetHigh = objetivo.cu > 0.5;
  const relevancia = l => {
    const clase = clasificar(l).clase;
    return Math.abs(Number(l.cu || 0) - objetivo.cu) * 180
      + Math.max(0, objetivo.mo - Number(l.mo || 0)) * 5
      + Math.max(0, Number(l.s || 0) - objetivo.s) * 450
      + ((Number(l.cu || 0) > 0.5) === targetHigh ? 0 : 12)
      - (clase === "Fuera Esp" ? 3 : 0);
  };
  const pool = [...(selected.length ? selected : inventario)].sort((a, b) => relevancia(a) - relevancia(b)).slice(0, selected.length ? 30 : 24);
  const maxSacks = Math.min(40, Math.max(1, Math.round(objetivo.masa / 1000)));
  let beams = Array.from({ length: maxSacks + 1 }, () => []);
  beams[0] = [{ items: [], sacks: 0, cuMass: 0, moMass: 0, sMass: 0, fueraSacks: 0 }];
  for (const lote of pool) {
    const next = beams.map(arr => arr.slice());
    for (let used = 0; used <= maxSacks; used++) {
      for (const st of beams[used]) {
        const maxAdd = Math.min(lote.sacks, maxSacks - used);
        for (let q = 1; q <= maxAdd; q++) {
          const ns = used + q;
          next[ns].push({
            items: [...st.items, { lote, sacks: q }],
            sacks: ns,
            cuMass: st.cuMass + Number(lote.cu || 0) * q,
            moMass: st.moMass + Number(lote.mo || 0) * q,
            sMass: st.sMass + Number(lote.s || 0) * q,
            fueraSacks: st.fueraSacks + (clasificar(lote).clase === "Fuera Esp" ? q : 0),
          });
        }
      }
    }
    beams = next.map(arr => recortarBeam(arr, objetivo, 90));
  }
  const ordenMasas = [maxSacks];
  for (let d = 1; d <= 5; d++) {
    if (maxSacks - d >= 1) ordenMasas.push(maxSacks - d);
    if (maxSacks + d <= beams.length - 1) ordenMasas.push(maxSacks + d);
  }
  const opciones = ordenMasas.flatMap(s => beams[s] || []).map(st => estadoAMezcla(st, objetivo));
  const exactas = opciones.filter(o => o.exacta);
  const base = exactas.length ? exactas : opciones;
  const seen = new Set();
  return base.sort((a, b) => a.cuDiff - b.cuDiff || a.moShort - b.moShort || a.sOver - b.sOver || a.diffKg - b.diffKg || a.score - b.score || b.fueraKg - a.fueraKg)
    .filter(o => { const firma = o.items.map(x => `${x.lote.id}:${Math.round(x.kg)}`).sort().join("|"); if (seen.has(firma)) return false; seen.add(firma); return true; })
    .slice(0, 10);
};

mezclasHTML = function() {
  const objetivo = objetivoMezcla();
  const scope = mixScopeLotesV22();
  const sectores = mixSectoresV22(scope);
  if (!sectores.includes(state.mix.sector)) state.mix.sector = "Todos";
  const materiales = mixMaterialesV22();
  state.mix.sel = (state.mix.sel || []).filter(id => materiales.some(l => l.id === id));
  const opciones = Array.isArray(state.mixOptions) ? state.mixOptions : [];
  const areaMsg = areaTrabajoEsGlobal() ? `Vista según filtro operativo: ${esc(areaScopeGlobalV10())}` : `Solo inventario del área asignada: ${esc(areaTrabajoUsuario())}`;
  return `<div class="mix-layout">
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="box">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Objetivo</div>
        <div class="notice" style="border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light);margin-bottom:12px">${areaMsg}</div>
        ${range("Cu objetivo", "cu", objetivo.cu, 0, 3, 0.01, "%", C.copper)}
        ${range("Mo mínimo", "mo", objetivo.mo, 45, 65, 0.1, "%", C.green)}
        ${range("S máximo", "s", objetivo.s, 0, 0.5, 0.01, "%", C.yellow)}
        ${range("Masa lote", "masa", objetivo.masa, 1000, 40000, 1000, "kg", C.cyan)}
        <button class="btn" id="autoMix" style="width:100%;margin-top:8px" ${state.mixProcessing ? "disabled" : ""}>${state.mixProcessing ? "CALCULANDO..." : "BUSCAR MEJOR COMBINACIÓN"}</button>
        ${state.mixProcessing ? `<div class="mix-progress"><div style="width:${state.mixProgress || 8}%"></div></div><div style="color:var(--txt2);font-size:11px;text-align:center;margin-top:6px">Procesando combinaciones del área visible...</div>` : ""}
        ${state.mixMsg ? `<div class="notice" style="margin:10px 0 0;text-align:center;animation:mixPulse 1.2s ease">${state.mixMsg}</div>` : ""}
      </div>
      <div class="box">
        <div class="muted-title" style="margin-bottom:10px">Filtro bodega / sector del área</div>
        <div class="filters">${sectores.map(s => `<button class="pill ${state.mix.sector === s ? "active" : ""}" data-mix-sector="${esc(s)}">${esc(s)}</button>`).join("")}</div>
      </div>
    </div>
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px"><div class="muted-title" style="color:var(--cyan)">Materiales</div><div style="color:var(--txt3);font-size:10px">${state.mix.sel.length ? `${state.mix.sel.length} seleccionados` : `${materiales.length} disponibles del área`}</div></div>
      <div class="mix-material-grid">${materiales.map(l => { const c = clasificar(l); const selected = state.mix.sel.includes(l.id); return `<div class="card" data-mix-lot="${esc(l.id)}" style="cursor:pointer;border:2px solid ${selected ? c.color : "var(--line)"}"><div style="display:flex;justify-content:space-between;gap:8px"><b class="mono" style="color:var(--blue-light)">${esc(l.id)}</b><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${esc(c.clase)}</span></div><div style="color:var(--txt2);font-size:10px;margin-top:6px">${esc(l.tipo)} · ${esc(l.sector)} · ${(Number(l.masa || 0)/1000).toFixed(2)}t</div><div class="mono" style="font-size:11px;margin-top:4px">Cu ${fmt(l.cu,3)}% · Mo ${fmt(l.mo,3)}% · S ${fmt(l.s,4)}%</div></div>`; }).join("") || `<div style="color:var(--txt3);font-size:11px">No hay materiales con análisis para mezclar en el área visible.</div>`}</div>
    </div>
    <div class="box">
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:12px"><div class="muted-title" style="color:var(--cyan)">Mejores opciones</div>${opciones.length ? `<button class="btn secondary" id="printMixOptions">Imprimir / PDF</button>` : ""}</div>
      <div class="mix-options">${opciones.length ? opciones.map((op, idx) => mezclaOpcionHTML(op, idx)).join("") : `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px">Ajusta los objetivos y presiona BUSCAR MEJOR COMBINACIÓN para calcular opciones.</div>`}</div>
    </div>
  </div>`;
};

const bindShellV22Base = bindShell;
bindShell = function() {
  bindShellV22Base();
  quitarBotonClaveSuperiorV22();
};

const renderV22Base = render;
render = function() {
  if (state.tab === "infodia" && !puedeSubirInfodiaV22()) state.tab = "inventario";
  if (state.tab === "registro" && !canViewTab("registro")) state.tab = "inventario";
  const out = renderV22Base();
  quitarBotonClaveSuperiorV22();
  return out;
};

try { render(); } catch (e) { console.warn("render v22", e); }


/* =========================================================
   HOTFIX_V23_PERMISOS_SESION_20260627
   - Admin inamovible.
   - Rol Supervisor migra a Encargado.
   - Roles operacionales: Operador, Encargado, Jefe de turno,
     Jefe de planta, Super intendente, Gerente.
   - Permisos individuales por usuario.
   - Cierre automático si cuenta es pausada/eliminada.
   ========================================================= */

const ADMIN_USER_KEY_V23 = "admin";
const ROLES_OPERACION_V23 = ["Operador", "Encargado", "Jefe de turno", "Jefe de planta", "Super intendente", "Gerente"];
const ROLES_SISTEMA_V23 = [...ROLES_OPERACION_V23, "Administrador"];

const PERMISOS_GRUPOS_V23 = [
  ["Vistas", [
    ["view_inventario", "Ver Inventario", "Acceso a la pestaña Inventario"],
    ["view_silos", "Ver Silos", "Acceso a estado/niveles de silos"],
    ["view_lotes_oxmo", "Ver Lotes OXMO/BQA", "Acceso a cartilla ACP / lotes OXMO"],
    ["view_mezclas", "Ver Mezclas", "Acceso a pestaña Mezclas"],
    ["view_reportes", "Ver Reportes", "Acceso a reportes operacionales"],
    ["view_avisos", "Ver Avisos", "Acceso a avisos operacionales"],
    ["view_gerencial", "Ver Dashboard gerencial", "Acceso al panel gerencial"],
    ["view_admin", "Ver Admin", "Administración de usuarios y permisos"],
    ["view_mi_perfil", "Ver Mi perfil", "Acceso a datos personales y clave propia"],
  ]],
  ["Inventario", [
    ["lot_create", "Crear lotes", "Permite usar Nuevo lote"],
    ["lot_edit_own", "Editar lotes propios", "Editar lotes creados por el usuario"],
    ["lot_edit_area", "Editar lotes del área", "Editar lotes del área asignada"],
    ["lot_edit_all", "Editar todos los lotes", "Editar lotes de cualquier área"],
    ["lot_delete_own", "Eliminar lotes propios", "Eliminar lotes creados por el usuario"],
    ["lot_delete_area", "Eliminar lotes del área", "Eliminar lotes del área asignada"],
    ["lot_delete_all", "Eliminar todos los lotes", "Eliminar lotes de cualquier área"],
    ["lot_change_status", "Cambiar estado de lote", "Disponible, Pendiente, Bloqueado, Fuera Esp."],
    ["lot_print_label", "Imprimir etiqueta", "Generar etiqueta QR"],
  ]],
  ["Infodia / ACP", [
    ["infodia_upload", "Subir Infodia", "Mostrar botón Subir Infodia"],
    ["infodia_apply_acp", "Actualizar inventario con ACP", "Cruzar análisis ACP con inventario"],
    ["infodia_view_acp", "Ver cartilla ACP", "Ver análisis importados"],
    ["infodia_reprocess", "Reprocesar Infodia", "Recalcular datos importados"],
    ["infodia_clear", "Limpiar Infodia cargado", "Borrar último Infodia guardado"],
  ]],
  ["Silos", [
    ["silo_view", "Ver silos", "Ver estado y niveles de silos"],
    ["silo_manual_adjust", "Ajustar silo manualmente", "Ingresar común/ajuste manual"],
    ["silo_clear", "Vaciar / limpiar silo", "Limpiar datos manuales de silo"],
    ["silo_edit_common", "Editar común de turno", "Modificar comunes asociados"],
    ["silo_delete_common", "Eliminar común de turno", "Eliminar registros de comunes"],
  ]],
  ["Mezclas", [
    ["mix_view", "Ver mezclas", "Entrar a pestaña Mezclas"],
    ["mix_calculate", "Calcular mezclas", "Buscar combinaciones"],
    ["mix_print", "Imprimir mezcla", "Generar reporte/PDF de mezcla"],
    ["mix_view_area_only", "Mezcla solo de su área", "Limita materiales al área asignada"],
    ["mix_view_all_areas", "Mezcla todas las áreas", "Permite ver materiales de todas las áreas"],
  ]],
  ["Reportes", [
    ["report_view", "Ver reportes", "Acceso a reportes"],
    ["report_print", "Imprimir reportes", "Generar PDF"],
    ["report_admin_history", "Ver historial admin", "Eventos por usuario/cuenta"],
    ["report_global", "Reporte global", "Ver todas las áreas"],
    ["report_area_only", "Reporte solo área", "Ver solo el área asignada"],
  ]],
  ["Avisos", [
    ["notice_view", "Ver avisos", "Ver pestaña Avisos"],
    ["notice_create", "Crear avisos", "Publicar aviso"],
    ["notice_delete_own", "Eliminar avisos propios", "Borrar avisos propios"],
    ["notice_delete_all", "Eliminar cualquier aviso", "Borrar avisos de otros usuarios"],
  ]],
  ["Usuarios / Administración", [
    ["user_view", "Ver usuarios", "Ver cuentas creadas"],
    ["user_create", "Crear usuarios", "Crear nuevas cuentas"],
    ["user_edit", "Editar usuarios", "Modificar usuario, nombre, rol y área"],
    ["user_pause", "Pausar usuarios", "Desactivar cuenta"],
    ["user_delete", "Eliminar usuarios", "Eliminar cuenta"],
    ["user_password_view", "Ver contraseñas", "Mostrar contraseña de usuarios"],
    ["user_password_change", "Cambiar contraseñas", "Cambiar clave de otro usuario"],
    ["user_permissions_edit", "Otorgar permisos", "Editar permisos individuales"],
  ]],
];

const TODOS_PERMISOS_V23 = PERMISOS_GRUPOS_V23.flatMap(g => g[1].map(p => p[0]));

const ROLE_PERMISSIONS_V23 = {
  "Operador": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_mezclas", "view_avisos", "view_mi_perfil", "lot_create", "lot_edit_own", "lot_print_label", "mix_view", "mix_calculate", "mix_print", "mix_view_area_only", "notice_view", "notice_create", "notice_delete_own", "silo_view", "infodia_view_acp"],
  "Encargado": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_mezclas", "view_reportes", "view_avisos", "view_mi_perfil", "lot_create", "lot_edit_own", "lot_edit_area", "lot_delete_own", "lot_delete_area", "lot_change_status", "lot_print_label", "infodia_upload", "infodia_apply_acp", "infodia_view_acp", "infodia_reprocess", "silo_view", "silo_manual_adjust", "silo_clear", "silo_edit_common", "silo_delete_common", "mix_view", "mix_calculate", "mix_print", "mix_view_area_only", "report_view", "report_print", "report_area_only", "notice_view", "notice_create", "notice_delete_own"],
  "Jefe de turno": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_mezclas", "view_reportes", "view_avisos", "view_mi_perfil", "lot_create", "lot_edit_own", "lot_edit_area", "lot_delete_own", "lot_delete_area", "lot_change_status", "lot_print_label", "infodia_apply_acp", "infodia_view_acp", "silo_view", "silo_manual_adjust", "silo_clear", "silo_edit_common", "silo_delete_common", "mix_view", "mix_calculate", "mix_print", "mix_view_area_only", "report_view", "report_print", "report_area_only", "notice_view", "notice_create", "notice_delete_own", "notice_delete_all"],
  "Jefe de planta": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_mezclas", "view_reportes", "view_avisos", "view_mi_perfil", "lot_create", "lot_edit_own", "lot_edit_area", "lot_delete_own", "lot_delete_area", "lot_change_status", "lot_print_label", "infodia_apply_acp", "infodia_view_acp", "silo_view", "silo_manual_adjust", "silo_clear", "silo_edit_common", "silo_delete_common", "mix_view", "mix_calculate", "mix_print", "mix_view_area_only", "report_view", "report_print", "report_area_only", "notice_view", "notice_create", "notice_delete_own", "notice_delete_all"],
  "Super intendente": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_reportes", "view_avisos", "view_mi_perfil", "infodia_view_acp", "silo_view", "report_view", "report_print", "report_global", "notice_view"],
  "Gerente": ["view_inventario", "view_silos", "view_lotes_oxmo", "view_reportes", "view_gerencial", "view_avisos", "view_mi_perfil", "infodia_view_acp", "silo_view", "report_view", "report_print", "report_global", "notice_view"],
  "Administrador": TODOS_PERMISOS_V23,
};

function rolCanonicoV23(rol) {
  const raw = String(rol || "").trim();
  const n = normalizarTextoV22(raw).replace(/\s+/g, " ");
  if (n === "admin" || n === "administrador") return "Administrador";
  if (n === "supervisor" || n === "encargado") return "Encargado";
  if (n === "jefe turno" || n === "jefe de turno") return "Jefe de turno";
  if (n === "jefe planta" || n === "jefe de planta") return "Jefe de planta";
  if (n === "super intendente" || n === "superintendente") return "Super intendente";
  if (n === "gerente") return "Gerente";
  if (n === "operador") return "Operador";
  return ROLES_SISTEMA_V23.includes(raw) ? raw : "Operador";
}

function usuarioEsAdminRaizV23(user) {
  return String(user?.u || "").trim().toLowerCase() === ADMIN_USER_KEY_V23;
}

function normalizarUsuarioV23(u) {
  const base = normalizarUsuario(u || {});
  base.rol = usuarioEsAdminRaizV23(base) ? "Administrador" : rolCanonicoV23(base.rol);
  if (base.u === ADMIN_USER_KEY_V23) {
    base.activo = true;
    base.area = base.area || AREA_FILTRO_TODAS_V10 || "Todas";
    base.areaCelula = base.area;
  }
  base.permisosOverride = base.permisosOverride && typeof base.permisosOverride === "object" && !Array.isArray(base.permisosOverride) ? base.permisosOverride : {};
  return base;
}

function normalizarUsuariosV23(lista = state.usuarios) {
  let usuarios = Array.isArray(lista) ? lista.map(normalizarUsuarioV23) : [];
  const adminIdx = usuarios.findIndex(u => u.u === ADMIN_USER_KEY_V23);
  if (adminIdx < 0) usuarios.unshift(normalizarUsuarioV23({ u: "admin", p: "oxmo2024", rol: "Administrador", nombre: "Administrador", activo: true, area: AREA_FILTRO_TODAS_V10 || "Todas" }));
  else usuarios[adminIdx] = normalizarUsuarioV23({ ...usuarios[adminIdx], u: "admin", rol: "Administrador", activo: true });
  return usuarios;
}

try {
  ROLES_USUARIO.splice(0, ROLES_USUARIO.length, ...ROLES_SISTEMA_V23);
  state.usuarios = normalizarUsuariosV23(state.usuarios);
  if (state.user) {
    const fresh = state.usuarios.find(u => u.u === state.user.u);
    if (fresh) state.user = fresh;
  }
  localStorage.setItem("oxmo:usuarios", JSON.stringify(state.usuarios));
  if (state.user) localStorage.setItem("oxmo:user", JSON.stringify(state.user));
} catch (e) { console.warn("migracion roles v23", e); }

function permisosBaseRolV23(rol) {
  return new Set(ROLE_PERMISSIONS_V23[rolCanonicoV23(rol)] || []);
}
function overridePermisosV23(user) {
  return (user?.permisosOverride && typeof user.permisosOverride === "object" && !Array.isArray(user.permisosOverride)) ? user.permisosOverride : {};
}
function usuarioActualizadoV23(user = state.user) {
  if (!user?.u) return null;
  return (state.usuarios || []).map(normalizarUsuarioV23).find(u => u.u === String(user.u).trim().toLowerCase()) || null;
}
function tienePermisoV23(user, code) {
  if (!user || !code) return false;
  const u = normalizarUsuarioV23(user);
  if (usuarioEsAdminRaizV23(u) || u.rol === "Administrador") return true;
  const over = overridePermisosV23(u);
  if (Object.prototype.hasOwnProperty.call(over, code)) return over[code] === true;
  return permisosBaseRolV23(u.rol).has(code);
}
function permisosEfectivosV23(user) {
  return Object.fromEntries(TODOS_PERMISOS_V23.map(code => [code, tienePermisoV23(user, code)]));
}
function estadoPermisoV23(user, code) {
  const u = normalizarUsuarioV23(user);
  const base = permisosBaseRolV23(u.rol).has(code) || u.rol === "Administrador";
  const over = overridePermisosV23(u);
  const hasOver = Object.prototype.hasOwnProperty.call(over, code);
  const effective = tienePermisoV23(u, code);
  if (usuarioEsAdminRaizV23(u)) return "Administrador total";
  if (hasOver && effective && !base) return "Otorgado manualmente";
  if (hasOver && !effective && base) return "Bloqueado manualmente";
  if (base) return "Heredado por rol";
  return "No permitido";
}
function aplicarPermisosSeleccionadosV23(userKeyEdit, checkedCodes) {
  const idx = state.usuarios.findIndex(u => u.u === userKeyEdit);
  if (idx < 0) return false;
  const u = normalizarUsuarioV23(state.usuarios[idx]);
  if (usuarioEsAdminRaizV23(u)) return false;
  const base = permisosBaseRolV23(u.rol);
  const nextOverride = {};
  for (const code of TODOS_PERMISOS_V23) {
    const checked = checkedCodes.has(code);
    const baseHas = base.has(code);
    if (checked !== baseHas) nextOverride[code] = checked;
  }
  state.usuarios[idx] = normalizarUsuarioV23({ ...u, permisosOverride: nextOverride });
  saveUsuarios();
  return true;
}

isSupervisor = function(user = state.user) { return rolCanonicoV23(user?.rol) === "Encargado"; };
function isEncargadoV23(user = state.user) { return rolCanonicoV23(user?.rol) === "Encargado"; }
isAdmin = function(user = state.user) {
  const u = user ? normalizarUsuarioV23(user) : null;
  return !!u && (u.rol === "Administrador" || usuarioEsAdminRaizV23(u));
};

function cerrarSesionForzadaV23(msg, showMessage = true) {
  try { cerrarSesionUsuario(); } catch {}
  state.user = null;
  state.adminEditUser = "";
  state.adminPermUser = "";
  state.tab = "inventario";
  try { localStorage.setItem("oxmo:user", "null"); } catch {}
  if (showMessage && !state._forcedLogoutShowingV23) {
    state._forcedLogoutShowingV23 = true;
    setTimeout(() => { alert(msg || "La sesión fue cerrada por administración."); state._forcedLogoutShowingV23 = false; try { render(); } catch {} }, 30);
  }
}
function sesionPuedeOperarV23(showMessage = true) {
  if (!state.user) return true;
  const fresh = usuarioActualizadoV23(state.user);
  if (!fresh || fresh.activo === false) {
    cerrarSesionForzadaV23(!fresh ? "Tu cuenta fue eliminada por administración. La sesión se cerró automáticamente." : "Tu cuenta fue pausada por administración. La sesión se cerró automáticamente.", showMessage);
    return false;
  }
  state.user = fresh;
  try { localStorage.setItem("oxmo:user", JSON.stringify(fresh)); } catch {}
  return true;
}

const saveUsuariosV23Base = saveUsuarios;
saveUsuarios = function() {
  state.usuarios = normalizarUsuariosV23(state.usuarios);
  saveUsuariosV23Base();
};
const saveV23Base = save;
save = function(key, value) {
  if (key !== "oxmo:user" && state.user && !sesionPuedeOperarV23(true)) return;
  return saveV23Base(key, value);
};
const applyCloudValueV23Base = applyCloudValue;
applyCloudValue = function(key, value) {
  applyCloudValueV23Base(key, value);
  if (key === "oxmo:usuarios") {
    state.usuarios = normalizarUsuariosV23(state.usuarios);
    sesionPuedeOperarV23(true);
  }
};
const initCloudV23Base = initCloud;
initCloud = async function() {
  const out = await initCloudV23Base();
  state.usuarios = normalizarUsuariosV23(state.usuarios);
  sesionPuedeOperarV23(true);
  return out;
};

const canViewTabV23Base = canViewTab;
canViewTab = function(id, user = state.user) {
  if (!user) return false;
  const u = normalizarUsuarioV23(user);
  if (u.activo === false) return false;
  if (id === "perfil" || id === "miPerfil") return tienePermisoV23(u, "view_mi_perfil");
  if (id === "inventario") return tienePermisoV23(u, "view_inventario");
  if (id === "silos") return tienePermisoV23(u, "view_silos") || tienePermisoV23(u, "silo_view");
  if (id === "lotesOxmo") return tienePermisoV23(u, "view_lotes_oxmo") || tienePermisoV23(u, "infodia_view_acp");
  if (id === "mezclas") return tienePermisoV23(u, "view_mezclas") || tienePermisoV23(u, "mix_view");
  if (id === "reportes") return tienePermisoV23(u, "view_reportes") || tienePermisoV23(u, "report_view");
  if (id === "avisos") return tienePermisoV23(u, "view_avisos") || tienePermisoV23(u, "notice_view");
  if (id === "admin") return tienePermisoV23(u, "view_admin");
  if (id === "gerencial") return tienePermisoV23(u, "view_gerencial");
  if (id === "registro") return tienePermisoV23(u, "lot_create");
  if (id === "infodia") return tienePermisoV23(u, "infodia_upload");
  if (["alertas", "alarma", "alarmas"].includes(id)) return false;
  return canViewTabV23Base(id, u);
};
visibleTabs = function() {
  const cfg = [["gerencial", "Dashboard"], ["inventario", "Inventario"], ["silos", "Silos"], ["lotesOxmo", "Lotes OXMO/BQA"], ["mezclas", "Mezclas"], ["reportes", "Reportes"], ["avisos", "Avisos"], ["admin", "Admin"], ["perfil", "Mi perfil"]];
  return cfg.filter(([id]) => canViewTab(id));
};
puedeSubirInfodiaV22 = function(user = state.user) { return tienePermisoV23(user, "infodia_upload"); };

function mismoOwnerV23(l, user = state.user) { return String(l?.createdBy || "").trim().toLowerCase() === String(user?.u || "").trim().toLowerCase(); }
function mismaAreaV23(l, user = state.user) { try { return normalizarTextoArea(areaTrabajoLote(l)) === normalizarTextoArea(areaTrabajoUsuario(user)); } catch { return String(l?.area || l?.sector || "").toLowerCase().includes(String(user?.area || "").toLowerCase()); } }
canEditLot = function(l, user = state.user) {
  if (!l || !user || !sesionPuedeOperarV23(false)) return false;
  if (tienePermisoV23(user, "lot_edit_all")) return true;
  if (tienePermisoV23(user, "lot_edit_area") && mismaAreaV23(l, user)) return true;
  if (tienePermisoV23(user, "lot_edit_own") && mismoOwnerV23(l, user)) return true;
  return false;
};
function canDeleteLotV23(l, user = state.user) {
  if (!l || !user || !sesionPuedeOperarV23(false)) return false;
  if (tienePermisoV23(user, "lot_delete_all")) return true;
  if (tienePermisoV23(user, "lot_delete_area") && mismaAreaV23(l, user)) return true;
  if (tienePermisoV23(user, "lot_delete_own") && mismoOwnerV23(l, user)) return true;
  return false;
}
const deleteLotV23Base = deleteLot;
deleteLot = function(id) { const lote = state.lotes.find(l => l.id === id); if (!canDeleteLotV23(lote)) return alert("No tienes permiso para eliminar este lote."); return deleteLotV23Base(id); };

const bindInventarioV23Base = bindInventario;
bindInventario = function() {
  bindInventarioV23Base();
  const newBtn = document.querySelector("#newLot");
  if (newBtn && !tienePermisoV23(state.user, "lot_create")) { newBtn.disabled = true; newBtn.title = "Sin permiso para crear lotes"; newBtn.textContent = "Nuevo lote bloqueado"; }
  if (newBtn && tienePermisoV23(state.user, "lot_create")) newBtn.onclick = e => { e.preventDefault(); if (!sesionPuedeOperarV23(true)) return; state.editando = null; state.tab = "registro"; render(); };
};

const aplicarACPInventarioActualV23Base = aplicarACPInventarioActual;
aplicarACPInventarioActual = function() { if (!tienePermisoV23(state.user, "infodia_apply_acp")) return alert("No tienes permiso para actualizar inventario con ACP."); return aplicarACPInventarioActualV23Base(); };
const bindSilosV23Base = bindSilos;
bindSilos = function() {
  bindSilosV23Base();
  if (!tienePermisoV23(state.user, "silo_manual_adjust")) { const form = document.querySelector("#comunForm"); if (form) form.querySelectorAll("input,select,textarea,button").forEach(el => { el.disabled = true; el.title = "Sin permiso para ajustar silos"; }); }
  if (!tienePermisoV23(state.user, "silo_clear")) document.querySelectorAll("[data-silo-clear]").forEach(el => el.remove());
  if (!tienePermisoV23(state.user, "silo_delete_common")) document.querySelectorAll("[data-comun-del]").forEach(el => el.remove());
};
const guardarComunManualV23Base = guardarComunManual;
guardarComunManual = function(data, fuente = "manual") { if (String(fuente || "").startsWith("manual") && !tienePermisoV23(state.user, "silo_manual_adjust")) { alert("No tienes permiso para ajustar silos manualmente."); return false; } return guardarComunManualV23Base(data, fuente); };
const bindMezclasV23Base = bindMezclas;
bindMezclas = function() { bindMezclasV23Base(); if (!tienePermisoV23(state.user, "mix_calculate")) { const btn = document.querySelector("#autoMix"); if (btn) { btn.disabled = true; btn.textContent = "Cálculo bloqueado"; btn.title = "Sin permiso para calcular mezclas"; } } if (!tienePermisoV23(state.user, "mix_print")) document.querySelector("#printMixOptions")?.remove(); };
const bindReportesV23Base = bindReportes;
bindReportes = function() { bindReportesV23Base(); if (!tienePermisoV23(state.user, "report_print")) { const btn = document.querySelector("#printReport"); if (btn) { btn.disabled = true; btn.textContent = "PDF bloqueado"; } } };
const adminAuditReportHTMLV23Base = adminAuditReportHTMLV18;
adminAuditReportHTMLV18 = function() { if (!tienePermisoV23(state.user, "report_admin_history")) return ""; return adminAuditReportHTMLV23Base(); };

function roleOptionsV23(selected = "Operador", includeAdmin = false) {
  const roles = includeAdmin ? ROLES_SISTEMA_V23 : ROLES_OPERACION_V23;
  const sel = rolCanonicoV23(selected);
  return roles.map(r => `<option value="${esc(r)}" ${r === sel ? "selected" : ""}>${esc(r)}</option>`).join("");
}

adminUsersHTML = function(rows) {
  const usuarios = normalizarUsuariosV23(rows.map(r => r.u || r));
  const areas = areasTrabajoCatalogo();
  const canCreate = tienePermisoV23(state.user, "user_create");
  return `
    <div class="area-admin-shell">
      <div class="area-admin-card create-user-card">
        <div class="section-title">Crear cuenta</div>
        <div class="area-help">El Rol define el cargo operacional y los permisos base. El Administrador se mantiene como cuenta técnica inamovible.</div>
        <div class="field"><label>Usuario</label><input id="newUserU" class="input" data-keep-case="true" placeholder="ej: turno_a" ${canCreate ? "" : "disabled"}></div>
        <div class="field"><label>Nombre</label><input id="newUserNombre" class="input" data-keep-case="true" placeholder="Nombre visible" ${canCreate ? "" : "disabled"}></div>
        <div class="field"><label>Contraseña inicial</label><input id="newUserPass" data-keep-case="true" type="password" class="input" placeholder="Contraseña inicial" ${canCreate ? "" : "disabled"}></div>
        <div class="field"><label>Rol</label><select id="newUserRol" class="input" ${canCreate ? "" : "disabled"}>${roleOptionsV23("Operador")}</select></div>
        <div class="field"><label>Área</label>${renderAreaSelectHTML({ id: "newUserArea", value: areaTrabajoDefault(), includeAdd: true })}</div>
        <div class="field" id="newUserAreaAddWrap" style="display:none"><label>Nueva área</label><input id="newUserAreaAdd" class="input" data-keep-case="true" placeholder="Ej: Envase B, Logística, Centro Norte"></div>
        <button class="btn primary" id="crearUsuario" style="width:100%;margin-top:4px" ${canCreate ? "" : "disabled"}>Crear usuario</button>
      </div>
      <div class="area-admin-card users-list-card">
        <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:12px"><div><div class="section-title">Cuentas creadas — ${usuarios.length}</div><div class="area-help">Áreas activas: ${areas.map(a => areaBadgeHTML(a, true)).join(" ")}</div></div></div>
        <div class="table-wrap"><table><thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Área</th><th>Estado</th><th>Último uso</th><th>Control</th></tr></thead><tbody>
          ${usuarios.map(u => { const stat = state.userStats[u.u] || {}; const root = usuarioEsAdminRaizV23(u); return `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}${root ? ` <span class="tag" style="color:${C.cyan};background:#00d4ff22;border-color:#00d4ff44">Fijo</span>` : ""}</td>
              <td>${esc(u.nombre)}</td><td>${esc(u.rol)}</td><td>${areaBadgeHTML(u.area)}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Deshabilitado"}</td><td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">${tienePermisoV23(state.user, "user_edit") ? `<button class="icon-btn" data-admin-edit="${esc(u.u)}">Editar</button>` : ""}${tienePermisoV23(state.user, "user_permissions_edit") ? `<button class="icon-btn" data-admin-perms="${esc(u.u)}">Permisos</button>` : ""}${!root && u.u !== userKey() && tienePermisoV23(state.user, "user_pause") ? `<button class="icon-btn" data-admin-toggle="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button>` : ""}${!root && u.u !== userKey() && tienePermisoV23(state.user, "user_delete") ? `<button class="icon-btn" data-admin-del="${esc(u.u)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}</div></td>
            </tr>`; }).join("")}
        </tbody></table></div>
      </div>
    </div>
    ${adminUserModalHTML()}${adminPermisosModalHTMLV23()}`;
};

adminUserModalHTML = function() {
  const user = normalizarUsuarioV23(state.usuarios.find(u => u.u === state.adminEditUser));
  if (!user?.u) return "";
  const stat = state.userStats[user.u] || {};
  const root = usuarioEsAdminRaizV23(user);
  const canPass = tienePermisoV23(state.user, "user_password_view") || tienePermisoV23(state.user, "user_password_change");
  return `<div class="modal-backdrop" data-admin-user-modal><div class="modal-card user-modal-card area-user-modal">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:12px"><div><div class="section-title">Editar usuario</div><h2 style="margin:4px 0 0">${esc(user.nombre)}</h2><div style="color:var(--txt2);font-size:12px;margin-top:4px">Administra cuenta, rol, área y contraseña. El usuario admin es inamovible.</div></div><button class="btn ghost" data-admin-edit-close>Cerrar</button></div>
      <div class="area-modal-banner"><div><div class="area-modal-title">Área asignada</div><div class="area-modal-text">Define qué inventario puede ver el usuario.</div></div>${areaBadgeHTML(user.area)}</div>
      <div class="profile-grid"><div class="field"><label>Usuario</label><input class="input" data-keep-case="true" data-admin-edit-u value="${esc(user.u)}" ${root ? "readonly" : ""}></div><div class="field"><label>Nombre visible</label><input class="input" data-keep-case="true" data-admin-edit-nombre value="${esc(user.nombre)}"></div><div class="field"><label>Contraseña visible / cambiar</label><input class="input mono" data-keep-case="true" data-admin-edit-pass type="${canPass ? "text" : "password"}" value="${canPass ? esc(user.p || "") : ""}" ${tienePermisoV23(state.user, "user_password_change") ? "" : "readonly"} autocomplete="off" spellcheck="false" placeholder="Sin permiso para ver/cambiar"></div><div class="field"><label>Rol</label><select class="input" data-admin-edit-rol ${root ? "disabled" : ""}>${roleOptionsV23(user.rol)}</select></div><div class="field"><label>Estado</label><select class="input" data-admin-edit-activo ${root ? "disabled" : ""}><option value="true" ${user.activo !== false ? "selected" : ""}>Activo</option><option value="false" ${user.activo === false ? "selected" : ""}>Deshabilitado</option></select></div><div class="field"><label>Creado</label><input class="input" readonly value="${esc(user.creado || "-")}"></div></div>
      <div class="card" style="margin-top:12px"><div class="section-title" style="margin-bottom:10px">Datos laborales y contacto</div><div class="profile-grid"><div class="field"><label>Área</label>${renderAreaSelectHTML({ value: user.area, dataAttr: "data-admin-edit-area", includeAdd: !root })}</div><div class="field" data-admin-edit-area-add-wrap style="display:none"><label>Nueva área</label><input class="input" data-keep-case="true" data-admin-edit-area-add placeholder="Ej: Envase B, Logística, Centro Norte"></div><div class="field"><label>Turno</label><input class="input" data-keep-case="true" data-admin-edit-turno value="${valorPerfil(user, "turno")}"></div><div class="field"><label>Teléfono</label><input class="input" data-keep-case="true" data-admin-edit-telefono value="${valorPerfil(user, "telefono")}"></div><div class="field"><label>Correo</label><input class="input" data-keep-case="true" data-admin-edit-correo value="${valorPerfil(user, "correo")}"></div><div class="field"><label>Dirección</label><input class="input" data-keep-case="true" data-admin-edit-direccion value="${valorPerfil(user, "direccion")}"></div></div></div>
      <div class="card" style="margin-top:12px"><div class="section-title" style="margin-bottom:10px;color:${C.red}">Emergencia</div><div class="profile-grid"><div class="field"><label>Contacto emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-nombre value="${valorPerfil(user, "contactoEmergenciaNombre")}"></div><div class="field"><label>Relación</label><input class="input" data-keep-case="true" data-admin-edit-emerg-relacion value="${valorPerfil(user, "contactoEmergenciaRelacion")}"></div><div class="field"><label>Teléfono emergencia</label><input class="input" data-keep-case="true" data-admin-edit-emerg-telefono value="${valorPerfil(user, "contactoEmergenciaTelefono")}"></div><div class="field"><label>Observaciones</label><textarea class="input" data-keep-case="true" data-admin-edit-observaciones rows="3">${valorPerfil(user, "observacionesContacto")}</textarea></div></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:var(--txt2);font-size:12px;margin-top:8px"><div>Último uso: <b>${esc(stat.lastSeen || "-")}</b></div><div>Tiempo de uso: <b>${esc(formatDuration(tiempoUsuarioMs(user.u)))}</b></div></div></div>
      ${root ? `<div class="notice" style="margin-top:12px;border-color:#00d4ff55;background:#00d4ff22;color:var(--cyan)">Administrador raíz: no se puede pausar, eliminar, renombrar ni cambiar de rol.</div>` : ""}
      <button class="btn primary" data-admin-edit-save style="width:100%;margin-top:12px">Guardar cambios</button>
    </div></div>`;
};

function adminPermisosModalHTMLV23() {
  const user = normalizarUsuarioV23(state.usuarios.find(u => u.u === state.adminPermUser));
  if (!user?.u) return "";
  const root = usuarioEsAdminRaizV23(user); const eff = permisosEfectivosV23(user); const overrides = overridePermisosV23(user);
  return `<div class="modal-backdrop" data-admin-perms-modal><div class="modal-card user-modal-card area-user-modal perm-modal-v23"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;margin-bottom:12px"><div><div class="section-title">Otorgamiento de permisos</div><h2 style="margin:4px 0 0">${esc(user.nombre)}</h2><div style="color:var(--txt2);font-size:12px;margin-top:4px">Rol base: <b>${esc(user.rol)}</b>. Marcado = permitido. Desmarcado = bloqueado/no permitido.</div></div><button class="btn ghost" data-admin-perms-close>Cerrar</button></div>${root ? `<div class="notice" style="border-color:#00d4ff55;background:#00d4ff22;color:var(--cyan)">La cuenta Administrador tiene todos los permisos y es inamovible. Esta matriz es solo de consulta.</div>` : `<div class="notice" style="border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Los cambios se guardan como diferencias respecto del rol base. Puedes otorgar o quitar permisos puntuales.</div>`}<div class="perm-groups-v23">${PERMISOS_GRUPOS_V23.map(([grupo, ps]) => `<section class="card perm-group-v23"><div class="section-title" style="margin-bottom:8px;color:${C.cyan}">${esc(grupo)}</div>${ps.map(([code, label, desc]) => { const base = permisosBaseRolV23(user.rol).has(code) || root; const hasOver = Object.prototype.hasOwnProperty.call(overrides, code); const estado = estadoPermisoV23(user, code); return `<label class="perm-row-v23 ${eff[code] ? "perm-on" : ""}"><input type="checkbox" data-perm-code="${esc(code)}" ${eff[code] ? "checked" : ""} ${root ? "disabled" : ""}><span><b>${esc(label)}</b><small>${esc(desc)}</small><em>${esc(estado)}${hasOver ? " · override" : base ? "" : ""}</em></span></label>`; }).join("")}</section>`).join("")}</div><button class="btn primary" data-admin-perms-save style="width:100%;margin-top:12px" ${root ? "disabled" : ""}>Guardar permisos</button></div></div>`;
}

bindAdmin = function() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => { state.adminView = btn.dataset.adminView; render(); }));
  const toggleAddWrap = (sel, wrap) => { if (!sel || !wrap) return; const run = () => { wrap.style.display = sel.value === "__add__" ? "block" : "none"; }; sel.addEventListener("change", run); run(); };
  toggleAddWrap(document.querySelector("#newUserArea"), document.querySelector("#newUserAreaAddWrap")); toggleAddWrap(document.querySelector("[data-admin-edit-area]"), document.querySelector("[data-admin-edit-area-add-wrap]"));
  document.querySelector("#crearUsuario")?.addEventListener("click", () => {
    if (!tienePermisoV23(state.user, "user_create")) return alert("No tienes permiso para crear usuarios.");
    const u = (document.querySelector("#newUserU")?.value || "").trim().toLowerCase(); const nombre = (document.querySelector("#newUserNombre")?.value || "").trim(); const p = document.querySelector("#newUserPass")?.value || ""; const rol = rolCanonicoV23(document.querySelector("#newUserRol")?.value || "Operador"); const areaSel = (document.querySelector("#newUserArea")?.value || "").trim(); const areaNueva = (document.querySelector("#newUserAreaAdd")?.value || "").trim(); const area = areaSel === "__add__" ? areaNueva : areaSel;
    if (!u || !nombre || !p) return alert("Completa usuario, nombre y contraseña."); if (u === ADMIN_USER_KEY_V23) return alert("La cuenta admin es inamovible y no puede duplicarse."); if (!area) return alert("Selecciona el área del usuario."); if (areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área."); if (!/^[a-z0-9._-]{3,24}$/.test(u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo."); if (state.usuarios.some(x => x.u === u)) return alert("Ese usuario ya existe.");
    const nuevo = normalizarUsuarioV23({ u, nombre, p, rol, cargo: rol, area, areaCelula: area, creado: hoy(), activo: true, permisosOverride: {} }); state.usuarios.push(nuevo); ensureUserStat(nuevo); saveUsuarios(); save("oxmo:userStats", state.userStats); addHist("Usuario creado", u, `${rol} · ${area}`, C.green); render();
  });
  document.querySelectorAll("[data-admin-edit]").forEach(btn => btn.addEventListener("click", () => { if (!tienePermisoV23(state.user, "user_edit")) return alert("Sin permiso para editar usuarios."); state.adminEditUser = btn.dataset.adminEdit; state.adminPermUser = ""; render(); }));
  document.querySelectorAll("[data-admin-perms]").forEach(btn => btn.addEventListener("click", () => { if (!tienePermisoV23(state.user, "user_permissions_edit")) return alert("Sin permiso para editar permisos."); state.adminPermUser = btn.dataset.adminPerms; state.adminEditUser = ""; render(); }));
  document.querySelectorAll("[data-admin-edit-close]").forEach(btn => btn.addEventListener("click", () => { state.adminEditUser = ""; render(); })); document.querySelectorAll("[data-admin-perms-close]").forEach(btn => btn.addEventListener("click", () => { state.adminPermUser = ""; render(); }));
  document.querySelector("[data-admin-perms-save]")?.addEventListener("click", () => { const key = state.adminPermUser; const u = state.usuarios.find(x => x.u === key); if (!u || usuarioEsAdminRaizV23(u)) return; const checked = new Set([...document.querySelectorAll("[data-perm-code]")].filter(x => x.checked).map(x => x.dataset.permCode)); if (!confirm(`¿Guardar permisos para ${u.nombre || u.u}?`)) return; aplicarPermisosSeleccionadosV23(key, checked); addHist("Permisos actualizados", key, "Matriz de permisos modificada", C.cyan); state.adminPermUser = ""; render(); });
  document.querySelector("[data-admin-edit-save]")?.addEventListener("click", () => {
    if (!tienePermisoV23(state.user, "user_edit")) return alert("Sin permiso para editar usuarios."); const oldU = state.adminEditUser; const old = normalizarUsuarioV23(state.usuarios.find(u => u.u === oldU)); if (!old?.u) return; const root = usuarioEsAdminRaizV23(old); const nextU = root ? ADMIN_USER_KEY_V23 : (document.querySelector("[data-admin-edit-u]")?.value || "").trim().toLowerCase(); const areaSel = (document.querySelector("[data-admin-edit-area]")?.value || "").trim(); const areaNueva = (document.querySelector("[data-admin-edit-area-add]")?.value || "").trim(); const area = root ? old.area : (areaSel === "__add__" ? areaNueva : areaSel); const passInput = document.querySelector("[data-admin-edit-pass]")?.value || old.p || ""; const passChanged = passInput !== old.p; if (passChanged && !tienePermisoV23(state.user, "user_password_change")) return alert("Sin permiso para cambiar contraseñas.");
    const patch = { u: nextU, nombre: (document.querySelector("[data-admin-edit-nombre]")?.value || "").trim(), p: passInput, rol: root ? "Administrador" : rolCanonicoV23(document.querySelector("[data-admin-edit-rol]")?.value || old.rol), activo: root ? true : document.querySelector("[data-admin-edit-activo]")?.value !== "false", cargo: root ? old.cargo : rolCanonicoV23(document.querySelector("[data-admin-edit-rol]")?.value || old.rol), area, areaCelula: area, turno: (document.querySelector("[data-admin-edit-turno]")?.value || "").trim(), telefono: (document.querySelector("[data-admin-edit-telefono]")?.value || "").trim(), correo: (document.querySelector("[data-admin-edit-correo]")?.value || "").trim(), direccion: (document.querySelector("[data-admin-edit-direccion]")?.value || "").trim(), contactoEmergenciaNombre: (document.querySelector("[data-admin-edit-emerg-nombre]")?.value || "").trim(), contactoEmergenciaRelacion: (document.querySelector("[data-admin-edit-emerg-relacion]")?.value || "").trim(), contactoEmergenciaTelefono: (document.querySelector("[data-admin-edit-emerg-telefono]")?.value || "").trim(), observacionesContacto: (document.querySelector("[data-admin-edit-observaciones]")?.value || "").trim() };
    if (!patch.u || !patch.nombre || !patch.p) return alert("Completa usuario, nombre y contraseña."); if (!patch.area) return alert("Selecciona el área del usuario."); if (!root && areaSel === "__add__" && !areaNueva) return alert("Ingresa el nombre de la nueva área."); if (!/^[a-z0-9._-]{3,24}$/.test(patch.u)) return alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo."); if (patch.u !== oldU && state.usuarios.some(u => u.u === patch.u)) return alert("Ese usuario ya existe.");
    const cambiosCriticos = [old.u !== patch.u ? `usuario: ${old.u} → ${patch.u}` : "", old.nombre !== patch.nombre ? `nombre: ${old.nombre} → ${patch.nombre}` : "", old.rol !== patch.rol ? `rol: ${old.rol} → ${patch.rol}` : "", areaTrabajoUsuario(old) !== patch.area ? `área: ${areaTrabajoUsuario(old)} → ${patch.area}` : "", old.p !== patch.p ? "contraseña: modificada" : "", old.activo !== patch.activo ? `estado: ${old.activo !== false ? "Activo" : "Deshabilitado"} → ${patch.activo ? "Activo" : "Deshabilitado"}` : ""].filter(Boolean); if (!confirm(cambiosCriticos.length ? `Confirma modificación de usuario:\n\n${cambiosCriticos.join("\n")}\n\n¿Guardar cambios?` : "No se detectan cambios críticos. ¿Guardar de todas formas?")) return;
    const next = normalizarUsuarioV23({ ...old, ...patch }); state.usuarios = state.usuarios.map(u => u.u === oldU ? next : u); if (patch.u !== oldU && state.userStats[oldU]) { state.userStats[patch.u] = state.userStats[oldU]; delete state.userStats[oldU]; state.lotes = state.lotes.map(l => l.createdBy === oldU ? { ...l, createdBy: patch.u, createdByName: next.nombre } : l); state.avisos = (state.avisos || []).map(a => a.autor === oldU ? { ...a, autor: patch.u, autorNombre: next.nombre } : a); save("oxmo:lotes", state.lotes); save("oxmo:avisos", state.avisos || []); } if (state.user?.u === oldU) { state.user = next; localStorage.setItem("oxmo:user", JSON.stringify(next)); } saveUsuarios(); save("oxmo:userStats", state.userStats); addHist("Usuario modificado", next.u, `${next.nombre} · ${next.area}`, C.cyan); state.adminEditUser = ""; render();
  });
  document.querySelectorAll("[data-admin-toggle]").forEach(btn => btn.addEventListener("click", () => { if (!tienePermisoV23(state.user, "user_pause")) return alert("Sin permiso para pausar usuarios."); const u = state.usuarios.find(x => x.u === btn.dataset.adminToggle); if (!u || usuarioEsAdminRaizV23(u)) return alert("La cuenta admin es inamovible."); if (!confirm(`${u.activo !== false ? "Pausar" : "Activar"} usuario ${u.u}?`)) return; u.activo = u.activo === false ? true : false; saveUsuarios(); addHist(u.activo ? "Usuario activado" : "Usuario pausado", u.u, u.activo ? "Acceso permitido" : "Cierre automático en dispositivos abiertos", u.activo ? C.green : C.yellow); render(); }));
  document.querySelectorAll("[data-admin-del]").forEach(btn => btn.addEventListener("click", () => { if (!tienePermisoV23(state.user, "user_delete")) return alert("Sin permiso para eliminar usuarios."); const u = btn.dataset.adminDel; if (u === ADMIN_USER_KEY_V23) return alert("La cuenta admin es inamovible."); if (!confirm(`Eliminar usuario ${u}? Esta acción cerrará sus sesiones abiertas y no se puede deshacer.`)) return; state.usuarios = state.usuarios.filter(x => x.u !== u); delete state.userStats[u]; saveUsuarios(); save("oxmo:userStats", state.userStats); addHist("Usuario eliminado", u, "Cierre automático en dispositivos abiertos", C.red); render(); }));
};

const renderV23Base = render;
render = function() {
  state.usuarios = normalizarUsuariosV23(state.usuarios);
  if (state.user && !sesionPuedeOperarV23(true)) return renderV23Base();
  if (state.tab && !canViewTab(state.tab)) state.tab = visibleTabs()[0]?.[0] || "inventario";
  const out = renderV23Base();
  return out;
};

try { render(); } catch (e) { console.warn("render v23 permisos", e); }

/* HOTFIX_V23B_PERMISOS_RENDER */
const tabHTMLV23Base = tabHTML;
tabHTML = function() {
  if (state.tab === "gerencial" && canViewTab("gerencial")) return gerenteDashboardHTML();
  return tabHTMLV23Base();
};

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
const HIDDEN_TABS = new Set(["quimica", "siloHistorial", "comunesTurno", "etiquetas"]);
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
async function cloudSave(key, value) {
  try {
    await cloud.client.from("oxmo_state").upsert({
      key,
      value,
      updated_at: new Date().toISOString()
    });
    cloud.status = "sincronizado";
  } catch (e) {
    cloud.status = "error nube";
    console.error("Cloud save error", e);
  }
}
function applyCloudValue(key, value) {
  cloud.applying = true;
  let nextValue = value;
  if (key === "oxmo:infodia" && !value && state.infodia) {
    cloud.applying = false;
    return;
  }
  if (key === "oxmo:lotes") {
    const incoming = Array.isArray(value) ? value : [];
    nextValue = incoming.filter(l => !isInfodiaProductionLote(l));
    if (nextValue.length !== incoming.length) cloud.needsLotesCleanup = true;
  }
  if (key === "oxmo:siloNiveles") {
    nextValue = cleanSiloNiveles(value || {});
    if (Object.keys(nextValue).length !== Object.keys(value || {}).length) cloud.needsSiloCleanup = true;
  }
  localStorage.setItem(key, JSON.stringify(nextValue));
  if (key === "oxmo:lotes") state.lotes = nextValue || [];
  if (key === "oxmo:hist") state.historial = value || [];
  if (key === "oxmo:sectores") state.sectores = value || DEFAULT_SECTORES;
  if (key === "oxmo:silos") state.silosBase = value || DEFAULT_SILOS;
  if (key === "oxmo:comunes") state.comunes = value || [];
  if (key === "oxmo:siloNiveles") state.siloNiveles = nextValue || {};
  if (key === "oxmo:siloHistorial") state.siloHistorial = value || [];
  if (key === "oxmo:infodia") state.infodia = value || state.infodia || null;
  if (key === "oxmo:usuarios") state.usuarios = Array.isArray(value) ? value.map(normalizarUsuario) : DEFAULT_USUARIOS;
  if (key === "oxmo:userStats") state.userStats = value || {};
  if (key === "oxmo:avisos") state.avisos = Array.isArray(value) ? value : [];
  cloud.applying = false;
}
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
async function configureCloud() {
  const current = cloudConfig() || {};
  const url = prompt("URL de Supabase", current.url || "");
  if (url === null) return;
  const anonKey = prompt("Anon public key de Supabase", current.anonKey || "");
  if (anonKey === null) return;
  if (!url.trim() || !anonKey.trim()) {
    if (confirm("¿Desactivar sincronización en la nube y usar solo este dispositivo?")) {
      clearCloudConfig();
      cloud.ready = false;
      cloud.status = "local";
      render();
    }
    return;
  }
  saveCloudConfig({ url: url.trim(), anonKey: anonKey.trim() });
  cloud.status = "conectando";
  render();
  await initCloud();
  if (cloud.ready) {
    await Promise.all([...SHARED_KEYS].map(key => cloudSave(key, load(key, sharedFallback(key)))));
    alert("Nube configurada. Los datos se sincronizarán en tiempo real.");
  } else {
    alert("No se pudo conectar. Revisa la URL, la anon key y la tabla oxmo_state.");
  }
}
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
    ["alertas", "Alertas"],
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
      <span>OXMO CONTROL v1.1 · ${state.user.nombre} (${state.user.rol}) · ${state.historial.length} eventos</span>
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
  return alertasHTML();
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

function inventarioHTML() {
  const lotesBase = state.filtro === "Todos" ? state.lotes : state.lotes.filter(l => l.estado === state.filtro);
  const lotes = lotesRecientes(lotesBase);
  const dist = allSectores().map(s => ({s, v: state.lotes.filter(l => l.sector === s).reduce((a,l) => a + l.masa, 0)}));
  const max = Math.max(1, ...dist.map(d => d.v));
  return `
    <div class="filters">
      ${["Todos","Disponible","Bloqueado","Pendiente","Fuera Esp"].map(f => `<button class="pill ${state.filtro === f ? "active" : ""}" data-filter="${f}">${f} (${f === "Todos" ? state.lotes.length : state.lotes.filter(l => l.estado === f).length})</button>`).join("")}
      <button class="pill" id="newLot" style="margin-left:auto;border-color:#00e5a055;color:var(--green)">+ Nuevo lote</button>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr>${["ID","Tipo","Masa","Sector","Cu%","Mo%","S%","Clasif.","Estado","Fecha",""].map(h => `<th>${h}</th>`).join("")}</tr></thead>
        <tbody>${lotes.map(l => rowHTML(l)).join("")}</tbody>
      </table>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px;margin-top:12px">
      <div class="card">
        <div class="muted-title" style="margin-bottom:10px">Por sector</div>
        ${dist.map(d => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="width:128px;color:var(--txt2);font-size:11px">${d.s}</span><div class="bar" style="flex:1;--accent:var(--blue)"><span style="--w:${(d.v/max)*100}%"></span></div><span class="mono" style="color:var(--txt2);font-size:11px">${kgToTon(d.v, 1)}</span></div>`).join("")}
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
  const labelAction = `<button class="icon-btn" data-label-lot="${esc(l.id)}" title="Imprimir etiqueta">▦</button>`;
  const actions = canEditLot(l)
    ? `<div class="mini-actions">${labelAction}<button class="icon-btn" data-edit="${esc(l.id)}">✏</button><button class="icon-btn" data-del="${esc(l.id)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button></div>`
    : `<div class="mini-actions">${labelAction}</div>`;
  return `<tr>
    <td class="mono" style="color:var(--blue-light);font-weight:800">${l.id}</td>
    <td style="color:var(--txt2)">${l.tipo}</td>
    <td class="mono">${kgToTon(l.masa, 3)}</td>
    <td><span class="tag" style="color:var(--blue-light);background:#0f3a6e">${l.sector}</span></td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.cu >= 0.51 ? C.copper : C.green}">${hasAnalysis(l) ? l.cu : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.mo >= moMinimo(l.cu) ? C.green : C.red}">${hasAnalysis(l) ? l.mo : "—"}</td>
    <td class="mono" style="color:${!hasAnalysis(l) ? C.txt3 : l.s < 0.1 ? C.green : C.red}">${hasAnalysis(l) ? l.s : "—"}</td>
    <td><span class="tag" style="background:${color}22;color:${color};border-color:${color}44">${clase}</span></td>
    <td style="color:${eColor(l.estado)}">● ${l.estado}</td>
    <td class="mono" style="color:var(--txt3);font-size:10px">${l.fecha}</td>
    <td>${actions}</td>
  </tr>`;
}
function bindInventario() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => { state.filtro = btn.dataset.filter; render(); }));
  document.querySelector("#newLot").addEventListener("click", () => { state.editando = null; state.tab = "registro"; render(); });
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => {
    const lote = state.lotes.find(l => l.id === btn.dataset.edit);
    if (!canEditLot(lote)) { alert("No tienes permiso para modificar este lote."); return; }
    state.editando = lote;
    state.tab = "registro";
    render();
  }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
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
function adminUsersHTML(rows) {
  return `
    <div style="display:grid;grid-template-columns:minmax(300px,420px) 1fr;gap:16px;align-items:start">
      <div class="card">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Crear cuenta</div>
        <form id="adminUserForm">
          <div class="field"><label>Usuario</label><input name="u" autocomplete="off" placeholder="ej: turno_a"></div>
          <div class="field"><label>Nombre</label><input name="nombre" autocomplete="off" placeholder="Nombre visible"></div>
          <div class="field"><label>Contraseña</label><input name="p" type="password" autocomplete="new-password" placeholder="Contraseña inicial"></div>
          ${selectField("rol", "Rol", "Operador", ROLES_USUARIO)}
          <button class="btn" style="width:100%">CREAR USUARIO</button>
        </form>
      </div>
      <div class="card">
        <div class="muted-title" style="margin-bottom:12px">Cuentas creadas — ${rows.length}</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Estado</th><th>Creado</th><th>Último uso</th><th>Control</th></tr></thead>
            <tbody>${rows.map(({u, stat}) => `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Inactivo"}</td>
              <td class="mono" style="color:var(--txt3)">${esc(u.creado || "-")}</td>
              <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">
                <button class="icon-btn" data-edit-user="${esc(u.u)}">Editar</button>
                <button class="icon-btn" data-pass-user="${esc(u.u)}">Clave</button>
                ${u.u !== "admin" && u.u !== userKey() ? `<button class="icon-btn" data-toggle-user="${esc(u.u)}">${u.activo !== false ? "Pausar" : "Activar"}</button><button class="icon-btn" data-delete-user="${esc(u.u)}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Eliminar</button>` : ""}
              </div></td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </div>
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
function bindAdmin() {
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
  document.querySelector("#adminUserForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    const u = String(data.u || "").trim().toLowerCase();
    const nombre = String(data.nombre || "").trim();
    const p = String(data.p || "").trim();
    if (!u || !nombre || !p) {
      alert("Completa usuario, nombre y contraseña.");
      return;
    }
    if (!/^[a-z0-9._-]{3,24}$/.test(u)) {
      alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
      return;
    }
    if (state.usuarios.some(x => x.u === u)) {
      alert("Ese usuario ya existe.");
      return;
    }
    const nuevo = normalizarUsuario({ u, nombre, p, rol: data.rol || "Operador", creado: hoy(), activo: true });
    state.usuarios.push(nuevo);
    saveUsuarios();
    ensureUserStat(nuevo);
    save("oxmo:userStats", state.userStats);
    addHist("Cuenta creada", nuevo.u, `${nuevo.nombre} (${nuevo.rol})`, C.cyan);
    render();
  });
  document.querySelectorAll("[data-toggle-user]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.toggleUser;
    state.usuarios = state.usuarios.map(x => x.u === u ? { ...x, activo: x.activo === false } : x);
    saveUsuarios();
    const estado = state.usuarios.find(x => x.u === u)?.activo === false ? "Inactivo" : "Activo";
    addHist("Estado de cuenta actualizado", u, estado, C.yellow);
    render();
  }));
  document.querySelectorAll("[data-edit-user]").forEach(btn => btn.addEventListener("click", () => {
    const original = btn.dataset.editUser;
    const actual = state.usuarios.find(x => x.u === original);
    if (!actual) return;
    const nextUserRaw = prompt("Usuario de acceso", actual.u);
    if (nextUserRaw === null) return;
    const nextUser = String(nextUserRaw || "").trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,24}$/.test(nextUser)) {
      alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
      return;
    }
    if (nextUser !== original && state.usuarios.some(x => x.u === nextUser)) {
      alert("Ese usuario ya existe.");
      return;
    }
    const nextNombreRaw = prompt("Nombre visible", actual.nombre || actual.u);
    if (nextNombreRaw === null) return;
    const nextNombre = String(nextNombreRaw || "").trim();
    if (!nextNombre) {
      alert("El nombre visible no puede quedar vacío.");
      return;
    }
    const rolesTxt = ROLES_USUARIO.join(", ");
    const nextRolRaw = prompt(`Rol (${rolesTxt})`, actual.rol || "Operador");
    if (nextRolRaw === null) return;
    const nextRol = ROLES_USUARIO.find(r => r.toLowerCase() === String(nextRolRaw).trim().toLowerCase());
    if (!nextRol) {
      alert(`Rol no válido. Usa uno de estos: ${rolesTxt}.`);
      return;
    }
    state.usuarios = state.usuarios.map(x => x.u === original ? { ...x, u: nextUser, nombre: nextNombre, rol: nextRol } : x);
    if (nextUser !== original) {
      if (state.userStats[original]) {
        state.userStats[nextUser] = { ...(state.userStats[nextUser] || {}), ...state.userStats[original] };
        delete state.userStats[original];
      }
      state.lotes = state.lotes.map(l => l.createdBy === original ? { ...l, createdBy: nextUser, createdByName: nextNombre } : l);
      state.avisos = (state.avisos || []).map(a => a.autor === original ? { ...a, autor: nextUser, autorNombre: nextNombre } : a);
      if (state.user?.u === original) state.user = { ...state.user, u: nextUser, nombre: nextNombre, rol: nextRol };
    } else if (state.user?.u === original) {
      state.user = { ...state.user, nombre: nextNombre, rol: nextRol };
    }
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    save("oxmo:lotes", state.lotes);
    save("oxmo:avisos", state.avisos || []);
    save("oxmo:user", state.user);
    addHist("Cuenta editada", nextUser, `${nextNombre} (${nextRol})`, C.cyan);
    render();
  }));
  document.querySelectorAll("[data-pass-user]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.passUser;
    const next = prompt(`Nueva contraseña para ${u}`);
    if (next === null) return;
    if (!next.trim()) { alert("La contraseña no puede quedar vacía."); return; }
    state.usuarios = state.usuarios.map(x => x.u === u ? { ...x, p: next.trim() } : x);
    saveUsuarios();
    addHist("Contraseña actualizada", u, "Cambio realizado por administrador", C.cyan);
    render();
  }));
  document.querySelectorAll("[data-delete-user]").forEach(btn => btn.addEventListener("click", () => {
    const u = btn.dataset.deleteUser;
    if (u === "admin" || u === userKey()) return;
    if (!confirm(`¿Eliminar la cuenta ${u}?`)) return;
    state.usuarios = state.usuarios.filter(x => x.u !== u);
    delete state.userStats[u];
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    addHist("Cuenta eliminada", u, "Eliminada por administrador", C.red);
    render();
  }));
}

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

function silosHTML() {
  return `<div class="grid-cards">${SILOS.map(s => {
    const color = s.nivel > 85 ? C.red : s.nivel > 60 ? C.yellow : C.green;
    return `<div class="card" style="border-top:3px solid ${color}">
      <div class="muted-title" style="color:var(--cyan);font-weight:800;margin-bottom:10px">${s.id}</div>
      <div style="height:120px;width:76px;margin:0 auto 10px;border:1px solid var(--line);background:#2d4a6a33;border-radius:5px;position:relative;overflow:hidden">
        <div style="position:absolute;left:0;right:0;bottom:0;height:${s.nivel}%;background:linear-gradient(180deg,${color}99,${color}44)"></div>
        <div class="mono" style="position:absolute;inset:0;display:grid;place-items:center;font-weight:900">${s.nivel}%</div>
      </div>
      <div class="mono" style="text-align:center;color:${color};font-weight:900">${((s.nivel/100)*s.cap*s.den).toFixed(1)} t</div>
      <div style="text-align:center;color:var(--txt2);font-size:11px">Cu: ${s.cu}% · Mo: ${s.mo}% · Turno ${s.turno}</div>
    </div>`;
  }).join("")}</div>`;
}

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

function lotesOxmoHTML() {
  const items = (state.infodia?.analisisLotes || [])
    .filter(a => /^(OXMO|OXBR)\d+-\d{2}$/.test(a.codigo) || String(a.codigo || "").includes("OSAC"))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || a.codigo.localeCompare(b.codigo));
  const oxmo = items.filter(a => a.tipoAnalisis === "lote_oxmo");
  const briquetas = items.filter(a => a.tipoAnalisis === "briqueta");
  const osac = items.filter(a => a.tipoAnalisis === "lote_osac" || String(a.codigo || "").includes("OSAC"));
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
        <thead><tr><th>ID lote</th><th>Tipo</th><th>Producto</th><th>Fecha analisis</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th>Fuente</th></tr></thead>
        <tbody>${filtered.map(a => {
          const c = clasificar(a);
          return `<tr>
            <td class="mono" style="color:var(--blue-light);font-weight:900">${a.codigo}</td>
            <td>${a.tipoAnalisis === "briqueta" ? "Briqueta" : a.tipoAnalisis === "comun_turno" ? "Comun turno" : a.tipoAnalisis === "otro_lote" ? "Otro lote" : "Lote OXMO"}</td>
            <td style="color:var(--txt2)">${a.producto || "-"}</td>
            <td class="mono">${a.fecha || "-"}</td>
            <td class="mono" style="color:${a.cu >= 0.51 ? C.copper : C.green}">${Number(a.cu || 0).toFixed(3)}</td>
            <td class="mono" style="color:${a.mo >= moMinimo(a.cu) ? C.green : C.red}">${Number(a.mo || 0).toFixed(3)}</td>
            <td class="mono" style="color:${a.s < 0.1 ? C.green : C.red}">${Number(a.s || 0).toFixed(4)}</td>
            <td><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span></td>
            <td style="color:var(--txt3);font-size:10px">${a.fuente || "-"}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">${empty}</div>`}
  </div>`;
}

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

function mezclasHTML() {
  const m = state.mix;
  const disponibles = state.lotes.filter(l => l.estado === "Disponible" && l.cu > 0);
  const sel = disponibles.filter(l => m.sel.includes(l.id));
  const masa = sel.reduce((a,l) => a + l.masa, 0);
  const cu = masa ? sel.reduce((a,l) => a + l.cu * (l.masa / masa), 0) : 0;
  const mo = masa ? sel.reduce((a,l) => a + l.mo * (l.masa / masa), 0) : 0;
  const ss = masa ? sel.reduce((a,l) => a + l.s * (l.masa / masa), 0) : 0;
  const checks = [Math.abs(cu - m.cu) <= 0.1, mo >= m.mo, ss < m.s, masa >= m.masa*.9 && masa <= m.masa*1.1];
  const score = checks.filter(Boolean).length;
  const shown = m.sector === "Todos" ? state.lotes : state.lotes.filter(l => l.sector === m.sector);
  return `<div class="mix-layout">
    <div class="box">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Objetivo</div>
      ${range("Cu objetivo", "cu", m.cu, 0, 2, .01, "%", C.green)}
      ${range("Mo mínimo", "mo", m.mo, 50, 65, .1, "%", C.blueLight)}
      ${range("S máximo", "s", m.s, 0, .5, .01, "%", C.yellow)}
      ${range("Masa objetivo", "masa", m.masa, 500, 8000, 100, "kg", C.cyan)}
      <button class="btn" id="autoMix" style="width:100%;margin-top:8px">AUTO-SELECCIONAR</button>
      <button class="btn secondary" id="clearMix" style="width:100%;margin-top:6px">Limpiar</button>
      <div class="filters" style="margin-top:12px">${["Todos", ...allSectores()].map(s => `<button class="pill ${m.sector === s ? "active" : ""}" data-mix-sector="${s}">${s}</button>`).join("")}</div>
    </div>
    <div class="box">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px"><div class="muted-title" style="color:var(--cyan)">Loza de materiales</div><div style="color:var(--txt3);font-size:10px">${m.sel.length} selec. · ${kgToTon(masa)}</div></div>
      <div class="yard">${allSectores().map(sec => {
        const ls = shown.filter(l => l.sector === sec);
        if (!ls.length) return "";
        return `<div class="sector-title"><span class="tag" style="background:#0f3a6e;color:var(--blue-light)">${sec}</span></div><div class="tile-row">${ls.map(l => {
          const c = clasificar(l);
          const isDis = l.estado === "Disponible" && l.cu > 0;
          const selected = m.sel.includes(l.id);
          return `<div class="lot-tile ${l.tipo === "Tambor" ? "tambor" : ""} ${isDis ? "available" : "disabled"} ${selected ? "selected" : ""}" data-mix-lot="${isDis ? l.id : ""}" style="--accent:${c.color}"><div class="mono" style="font-size:9px;font-weight:900">${l.id}<br>${l.cu ? `${l.cu}%` : "LAB"}</div></div>`;
        }).join("")}</div>`;
      }).join("")}</div>
    </div>
    <div class="box">
      <div style="text-align:center;border-bottom:1px solid var(--line);padding-bottom:12px;margin-bottom:12px">
        <div class="muted-title">Resultado</div>
        <div class="mono" style="font-size:34px;font-weight:900;color:${score === 4 ? C.green : score >= 2 ? C.yellow : C.red}">${score === 4 ? "OK" : score === 0 ? "—" : `${score}/4`}</div>
      </div>
      ${chemResult("Cu", cu, m.cu, checks[0], 2)}
      ${chemResult("Mo", mo, m.mo, checks[1], 70)}
      ${chemResult("S", ss, m.s, checks[2], 1)}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px">
        ${mini("Masa sel.", kgToTon(masa), checks[3] ? C.green : C.yellow)}
        ${mini("Objetivo", kgToTon(m.masa), C.txt2)}
        ${mini("Diferencia", kgToTon(masa - m.masa), checks[3] ? C.green : C.red)}
        ${mini("Lotes", String(m.sel.length), C.blueLight)}
      </div>
    </div>
  </div>`;
}
function range(label, key, value, min, max, step, unit, color) {
  return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span style="color:var(--txt2);font-size:10px">${label}</span><span class="mono" style="color:${color};font-size:11px;font-weight:900">${value}${unit}</span></div><input data-range="${key}" type="range" min="${min}" max="${max}" step="${step}" value="${value}" style="width:100%;accent-color:${color}"></div>`;
}
function chemResult(label, value, target, ok, max) {
  const color = ok ? C.green : value ? C.red : C.txt3;
  return `<div style="margin-bottom:10px"><div style="display:flex;justify-content:space-between"><span style="color:var(--txt2);font-size:11px">${label}</span><span class="mono" style="color:${color};font-size:11px;font-weight:900">${value ? `${value.toFixed(2)}% ${ok ? "✓" : "✗"}` : "—"}</span></div><div class="bar" style="--accent:${color}"><span style="--w:${Math.min((value/max)*100,100)}%"></span></div><div style="text-align:center;color:var(--txt3);font-size:8px">meta: ${target}%</div></div>`;
}
function mini(label, value, color) {
  return `<div style="background:#0f3a6e66;border-radius:5px;padding:7px"><div style="color:var(--txt3);font-size:8px">${label}</div><div class="mono" style="color:${color};font-weight:900;font-size:12px">${value}</div></div>`;
}
function bindMezclas() {
  document.querySelectorAll("[data-range]").forEach(el => el.addEventListener("input", () => { state.mix[el.dataset.range] = Number(el.value); render(); }));
  document.querySelectorAll("[data-range-input]").forEach(el => {
    const update = () => {
      const value = Number(el.value);
      if (Number.isNaN(value)) return;
      state.mix[el.dataset.rangeInput] = value;
      render();
    };
    el.addEventListener("change", update);
    el.addEventListener("keydown", e => { if (e.key === "Enter") update(); });
  });
  document.querySelectorAll("[data-mix-sector]").forEach(btn => btn.addEventListener("click", () => { state.mix.sector = btn.dataset.mixSector; render(); }));
  document.querySelectorAll("[data-mix-lot]").forEach(tile => tile.addEventListener("click", () => {
    const id = tile.dataset.mixLot;
    if (!id) return;
    state.mix.sel = state.mix.sel.includes(id) ? state.mix.sel.filter(x => x !== id) : [...state.mix.sel, id];
    render();
  }));
  document.querySelector("#clearMix").addEventListener("click", () => { state.mix.sel = []; render(); });
  document.querySelector("#autoMix").addEventListener("click", () => {
    const pool = state.lotes.filter(l => l.estado === "Disponible" && l.cu > 0);
    let selected = [];
    for (let i = 0; i < 20 && selected.reduce((a,l) => a + l.masa, 0) < state.mix.masa; i++) {
      let best = null, bestScore = -Infinity;
      for (const l of pool.filter(x => !selected.includes(x))) {
        const c = [...selected, l];
        const mass = c.reduce((a,x) => a + x.masa, 0);
        const cu = c.reduce((a,x) => a + x.cu * (x.masa / mass), 0);
        const mo = c.reduce((a,x) => a + x.mo * (x.masa / mass), 0);
        const s = c.reduce((a,x) => a + x.s * (x.masa / mass), 0);
        const sc = -Math.abs(cu - state.mix.cu) * 3 + (mo >= state.mix.mo ? 10 : -5) + (s <= state.mix.s ? 10 : -5) + (mass <= state.mix.masa ? 2 : -1);
        if (sc > bestScore) { bestScore = sc; best = l; }
      }
      if (!best) break;
      selected.push(best);
    }
    state.mix.sel = selected.map(l => l.id);
    render();
  });
}

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
function printLabels() {
  const items = state.etiquetaSel.map(id => state.lotes.find(l => l.id === id)).filter(Boolean).map(l => {
    const c = clasificar(l);
    return `<div style="display:inline-block;margin:6px;padding:14px;border:2px solid #333;border-radius:6px;font-family:monospace;width:170px;text-align:center;page-break-inside:avoid"><div style="font-size:8px;letter-spacing:2px;color:#666">OXMO CONTROL</div><h3>${l.id}</h3><div style="font-size:54px">▦</div><div>${l.tipo}</div><b>${l.masa} kg</b><div>${l.sector} · Fila ${l.fila}</div><div style="margin-top:6px">${c.clase.toUpperCase()}</div><small>${l.fecha}</small></div>`;
  }).join("");
  const w = window.open("", "_blank");
  w.document.write(`<html><head><title>Etiquetas OXMO</title></head><body>${items}<script>window.onload=()=>window.print()<\/script></body></html>`);
  w.document.close();
}

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
function bindReportes() {
  document.querySelector("#printReport").addEventListener("click", () => {
    const rows = state.lotes.map(l => `<tr><td>${l.id}</td><td>${l.tipo}</td><td>${l.masa}</td><td>${l.sector}</td><td>${hasAnalysis(l) ? l.cu : "—"}</td><td>${hasAnalysis(l) ? l.mo : "—"}</td><td>${hasAnalysis(l) ? l.s : "—"}</td><td>${clasificar(l).clase}</td><td>${l.estado}</td><td>${l.fecha}</td></tr>`).join("");
    const w = window.open("", "_blank");
    w.document.write(`<html><head><title>Reporte OXMO</title><style>body{font-family:Arial;font-size:12px;margin:20px}table{width:100%;border-collapse:collapse}th{background:#003366;color:white}td,th{padding:5px;border-bottom:1px solid #ddd}</style></head><body><h1>REPORTE OPERACIONAL SGI</h1><p>Control Operacional OXMO · ${new Date().toLocaleString("es-CL")}</p><table><tr><th>ID</th><th>Tipo</th><th>Masa</th><th>Sector</th><th>Cu</th><th>Mo</th><th>S</th><th>Clasif.</th><th>Estado</th><th>Fecha</th></tr>${rows}</table><script>window.onload=()=>window.print()<\/script></body></html>`);
    w.document.close();
  });
}

function alertasHTML() {
  const disp = state.lotes.filter(l => l.estado === "Disponible");
  const alerts = [
    ...state.lotes.filter(l => l.estado === "Fuera Esp").map(l => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`${l.id} FUERA DE ESPECIFICACIÓN`,detalle:`Mo:${l.mo}% Cu:${l.cu}% S:${l.s}% · ${l.sector}`})),
    ...SILOS.filter(s => s.nivel > 85).map(s => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`Silo ${s.id} al ${s.nivel}%`,detalle:`Masa est: ${((s.nivel/100)*s.cap*s.den).toFixed(1)}t · Programar despacho`})),
    ...state.lotes.filter(l => l.estado === "Pendiente").map(l => ({nivel:"AVISO",color:C.yellow,icon:"⚠️",msg:`${l.id} sin análisis`,detalle:`${l.tipo} · ${l.masa}kg · ${l.sector} · ${l.fecha}`})),
    {nivel:"INFO",color:C.green,icon:"ℹ️",msg:"Sistema activo",detalle:`${state.lotes.length} lotes · ${disp.length} disponibles · ${new Date().toLocaleTimeString("es-CL")}`}
  ];
  return `<div style="display:flex;flex-direction:column;gap:8px">${alerts.map(a => `<div class="card" style="border-left:4px solid ${a.color};display:flex;gap:12px"><span style="font-size:20px">${a.icon}</span><div><div><span class="tag" style="background:${a.color}22;color:${a.color};border-color:${a.color}44">${a.nivel}</span> <b style="font-size:12px">${a.msg}</b></div><div style="color:var(--txt2);font-size:11px;margin-top:4px">${a.detalle}</div></div></div>`).join("")}</div>`;
}

function silosHTML() {
  const silos = silosPonderados();
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,1fr);gap:14px;align-items:start">
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Silos de almacenamiento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;max-height:640px;overflow:auto;padding-right:4px">${silos.map(s => {
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
        <div style="text-align:center;color:var(--txt2);font-size:11px;margin-top:3px">Cu: ${s.muestras ? s.cu.toFixed(2) : "-"}% · Mo: ${s.muestras ? s.mo.toFixed(2) : "-"}% · S: ${s.muestras ? s.s.toFixed(2) : "-"}%</div>
        <div style="text-align:center;color:var(--txt3);font-size:9px;margin-top:4px">${source}${s.nivelImportado?.horaInicio ? ` · ${s.nivelImportado.horaInicio}-${s.nivelImportado.horaTermino}` : ""}</div>
        <div style="text-align:center;color:var(--txt3);font-size:9px;margin-top:4px">${source}</div>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:8px">
          <button class="icon-btn" data-silo-fill="${s.id}">Ajuste manual</button>
          <button class="icon-btn" data-silo-clear="${s.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button>
        </div>
      </div>`;
    }).join("")}</div>
    </section>
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Ingreso manual de respaldo</div>
      <div class="notice" style="margin-bottom:12px;border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">La carga normal se actualiza al subir Infodia con comunes OO300-001. Usa este formulario solo para corregir o cargar un comun puntual.</div>
      <form id="comunForm">
        <div class="form-grid">
          ${selectField("siloId","Silo",state.silosBase[0]?.id || "S-01",state.silosBase.map(s => s.id))}
          ${selectField("turno","Turno","Día",["Día","Noche"])}
          ${inputField("fecha","Fecha",hoy(),"text")}
          ${selectField("tramo","Tramo","00-02",["00-02","02-04","04-06","06-08","08-10","10-12","12-14","14-16","16-18","18-20","20-22","22-24"])}
          ${inputField("masa","Masa común (t)","8.33","number","8.33","0.01")}
          <div></div>
        </div>
        <div style="border-top:1px solid var(--line);padding-top:12px;margin-top:8px">
          <div class="chem-grid">
            ${inputField("cu","Cu %","","number","0.49","0.01")}
            ${inputField("mo","Mo %","","number","57.5","0.01")}
            ${inputField("s","S %","","number","0.08","0.01")}
          </div>
        </div>
        <button class="btn" style="width:100%;margin-top:10px">GUARDAR COMÚN</button>
      </form>
      <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:12px">
        <div class="muted-title" style="margin-bottom:10px">Comunes ingresados — ${state.comunes.length}</div>
        <div style="max-height:330px;overflow:auto">${[...state.comunes].reverse().map(c => {
          const cl = clasificar(c);
          return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #1a2e4a33">
            <div><div class="mono" style="color:var(--blue-light);font-weight:800">${c.siloId} · ${c.tramo} · ${c.turno}</div><div style="color:var(--txt2);font-size:10px">${c.fecha} · ${c.masa}t · Cu ${c.cu}% · Mo ${c.mo}% · S ${c.s}%</div></div>
            <div style="display:flex;gap:5px;align-items:center"><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span><button class="icon-btn" data-comun-del="${c.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">x</button></div>
          </div>`;
        }).join("") || `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px 0">Sin comunes registrados</div>`}</div>
      </div>
    </section>
  </div>`;
}

function bindSilos() {
  const form = document.querySelector("#comunForm");
  document.querySelectorAll("[data-silo-fill]").forEach(btn => btn.addEventListener("click", () => {
    form.elements.siloId.value = btn.dataset.siloFill;
    form.elements.cu.focus();
  }));
  document.querySelectorAll("[data-silo-clear]").forEach(btn => btn.addEventListener("click", () => {
    const siloId = btn.dataset.siloClear;
    if (!confirm(`¿Vaciar comunes de ${siloId}?`)) return;
    state.comunes = state.comunes.filter(c => c.siloId !== siloId);
    save("oxmo:comunes", state.comunes);
    addHist("Silo vaciado", siloId, "Comunes eliminados", C.red);
    render();
  }));
  document.querySelectorAll("[data-comun-del]").forEach(btn => btn.addEventListener("click", () => {
    state.comunes = state.comunes.filter(c => c.id !== btn.dataset.comunDel);
    save("oxmo:comunes", state.comunes);
    render();
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const masa = Number(data.masa);
    const cu = Number(data.cu);
    const mo = Number(data.mo);
    const s = Number(data.s);
    if (!masa || masa <= 0 || Number.isNaN(cu) || Number.isNaN(mo) || Number.isNaN(s)) {
      alert("Ingresa masa y análisis químico válidos");
      return;
    }
    const comun = {
      id: `C-${Date.now()}`,
      siloId: data.siloId,
      turno: data.turno,
      fecha: data.fecha || hoy(),
      tramo: data.tramo,
      masa: Number(masa.toFixed(2)),
      cu: Number(cu.toFixed(2)),
      mo: Number(mo.toFixed(2)),
      s: Number(s.toFixed(2)),
    };
    state.comunes.push(comun);
    save("oxmo:comunes", state.comunes);
    addHist("Común de turno ingresado", comun.siloId, `${comun.masa}t ${comun.tramo}`, clasificar(comun).color);
    render();
  });
}

function alertasHTML() {
  const disp = state.lotes.filter(l => l.estado === "Disponible");
  const alerts = [
    ...state.lotes.filter(l => l.estado === "Fuera Esp").map(l => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`${l.id} FUERA DE ESPECIFICACIÓN`,detalle:`Mo:${l.mo}% Cu:${l.cu}% S:${l.s}% · ${l.sector}`})),
    ...silosPonderados().filter(s => s.nivel > 85).map(s => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`Silo ${s.id} al ${s.nivel.toFixed(0)}%`,detalle:`Masa est: ${s.masa.toFixed(1)}t · Programar despacho`})),
    ...silosPonderados().filter(s => s.muestras && s.clase === "Fuera Esp").map(s => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`Silo ${s.id} fuera de especificación`,detalle:`Cu:${s.cu.toFixed(2)}% Mo:${s.mo.toFixed(2)}% S:${s.s.toFixed(2)}%`})),
    ...state.lotes.filter(l => l.estado === "Pendiente").map(l => ({nivel:"AVISO",color:C.yellow,icon:"⚠️",msg:`${l.id} sin análisis`,detalle:`${l.tipo} · ${l.masa}kg · ${l.sector} · ${l.fecha}`})),
    {nivel:"INFO",color:C.green,icon:"ℹ️",msg:"Sistema activo",detalle:`${state.lotes.length} lotes · ${disp.length} disponibles · ${new Date().toLocaleTimeString("es-CL")}`}
  ];
  return `<div style="display:flex;flex-direction:column;gap:8px">${alerts.map(a => `<div class="card" style="border-left:4px solid ${a.color};display:flex;gap:12px"><span style="font-size:20px">${a.icon}</span><div><div><span class="tag" style="background:${a.color}22;color:${a.color};border-color:${a.color}44">${a.nivel}</span> <b style="font-size:12px">${a.msg}</b></div><div style="color:var(--txt2);font-size:11px;margin-top:4px">${a.detalle}</div></div></div>`).join("")}</div>`;
}

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

function mezclasHTML() {
  const disponibles = state.lotes.filter(l => hasAnalysis(l));
  const seleccionados = disponibles.filter(l => state.mix.sel.includes(l.id));
  const manualItems = seleccionados.map(l => ({lote: l, kg: Math.min(l.masa, 20000 / Math.max(1, seleccionados.length))}));
  const manualMix = manualItems.length ? mezclaDe(manualItems) : null;
  const opciones = generarOpcionesMezcla();
  return `<div style="display:grid;grid-template-columns:280px 1fr;gap:12px">
    <div class="box">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Objetivo lote producción</div>
      ${mini("Masa lote", "20.00 t", C.cyan)}
      ${mini("S máximo", "< 0.10%", C.yellow)}
      ${mini("Mo alto cobre", ">= 55%", C.copper)}
      ${mini("Mo bajo cobre", "> 57%", C.green)}
      <button class="btn" id="autoMix" style="width:100%;margin-top:10px">BUSCAR OPCIONES</button>
      <button class="btn secondary" id="clearMix" style="width:100%;margin-top:6px">Limpiar selección</button>
      <div class="filters" style="margin-top:12px">${["Todos", ...allSectores()].map(s => `<button class="pill ${state.mix.sector === s ? "active" : ""}" data-mix-sector="${s}">${s}</button>`).join("")}</div>
    </div>
    <div>
      <div class="box" style="margin-bottom:12px">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Materiales disponibles para mezcla</div>
        <div class="grid-cards">${disponibles.filter(l => state.mix.sector === "Todos" || l.sector === state.mix.sector).map(l => {
          const c = clasificar(l);
          const selected = state.mix.sel.includes(l.id);
          return `<div class="card" data-mix-lot="${l.id}" style="cursor:pointer;border:2px solid ${selected ? c.color : "var(--line)"}">
            <div style="display:flex;justify-content:space-between;gap:8px"><b class="mono" style="color:var(--blue-light)">${l.id}</b><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span></div>
            <div style="color:var(--txt2);font-size:10px;margin-top:6px">${l.tipo} · ${l.sector} · ${(l.masa/1000).toFixed(2)}t</div>
            <div class="mono" style="font-size:11px;margin-top:4px">Cu ${l.cu}% · Mo ${l.mo}% · S ${l.s}%</div>
          </div>`;
        }).join("") || `<div style="color:var(--txt3);font-size:11px">No hay materiales con análisis.</div>`}</div>
      </div>
      <div class="box">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Opciones de mezcla 20 t</div>
        ${opciones.length ? opciones.map((op, idx) => mezclaOpcionHTML(op, idx)).join("") : `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px">No hay combinaciones que cumplan con los materiales actuales. Registra más lotes o análisis.</div>`}
      </div>
      ${manualMix ? `<div class="box" style="margin-top:12px;border-top:3px solid ${manualMix.color}"><div class="muted-title" style="color:var(--cyan);margin-bottom:10px">Cálculo selección manual</div>${mezclaDetalleHTML({items:manualItems, mix:manualMix})}</div>` : ""}
    </div>
  </div>`;
}

function mezclaOpcionHTML(op, idx) {
  return `<div class="card" style="border-left:4px solid ${op.mix.color};margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div><b style="color:${op.mix.color}">Opción ${idx + 1} · ${op.mix.clase}</b><div style="color:var(--txt2);font-size:10px">Consume fuera de especificación: ${(op.fueraKg/1000).toFixed(2)} t</div></div>
      <div class="mono" style="font-weight:900;color:${op.mix.ok ? C.green : C.red}">${op.mix.ok ? "CUMPLE" : "NO CUMPLE"}</div>
    </div>
    ${mezclaDetalleHTML(op)}
  </div>`;
}

function mezclaDetalleHTML(op) {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;margin-top:10px">
    ${op.items.map(x => `<div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div class="mono" style="color:var(--blue-light);font-weight:800">${x.lote.id}</div>
      <div style="color:var(--txt2);font-size:10px">${(x.kg/1000).toFixed(2)} t · ${(x.kg / x.lote.masa).toFixed(2)} ${unidadNombre(x.lote)}</div>
      <div style="color:var(--txt3);font-size:9px">Stock lote: ${(x.lote.masa/1000).toFixed(2)} t</div>
    </div>`).join("")}
    <div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div style="color:var(--txt3);font-size:9px">Resultado</div>
      <div class="mono" style="color:${op.mix.color};font-weight:900">Cu ${op.mix.cu.toFixed(3)}% · Mo ${op.mix.mo.toFixed(3)}% · S ${op.mix.s.toFixed(3)}%</div>
    </div>
  </div>
  <pre style="white-space:pre-wrap;background:#040a14;border:1px solid var(--line);border-radius:6px;padding:10px;color:var(--txt2);font-size:10px;margin:10px 0 0">${formulaMezcla(op.items, op.mix)}</pre>`;
}

function bindMezclas() {
  document.querySelectorAll("[data-mix-sector]").forEach(btn => btn.addEventListener("click", () => { state.mix.sector = btn.dataset.mixSector; render(); }));
  document.querySelectorAll("[data-mix-lot]").forEach(tile => tile.addEventListener("click", () => {
    const id = tile.dataset.mixLot;
    state.mix.sel = state.mix.sel.includes(id) ? state.mix.sel.filter(x => x !== id) : [...state.mix.sel, id];
    render();
  }));
  document.querySelector("#clearMix").addEventListener("click", () => { state.mix.sel = []; render(); });
  document.querySelector("#autoMix").addEventListener("click", () => render());
}

function silosHTML() {
  const silos = silosPonderados();
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(380px,1fr);gap:14px;align-items:start">
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Silos de almacenamiento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;max-height:640px;overflow:auto;padding-right:4px">${silos.map(s => {
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
        <div style="text-align:center;color:var(--txt2);font-size:11px;margin-top:3px">Cu: ${s.muestras ? s.cu.toFixed(2) : "-"}% · Mo: ${s.muestras ? s.mo.toFixed(2) : "-"}% · S: ${s.muestras ? s.s.toFixed(2) : "-"}%</div>
        <div style="display:flex;justify-content:center;gap:6px;margin-top:8px">
          <button class="icon-btn" data-silo-fill="${s.id}">Ajuste manual</button>
          <button class="icon-btn" data-silo-clear="${s.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button>
        </div>
      </div>`;
    }).join("")}</div>
    </section>
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Ingreso manual de respaldo</div>
      <div class="notice" style="margin-bottom:12px;border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">La carga normal se actualiza al subir Infodia con comunes OO300-001. Usa este formulario solo para corregir o cargar un comun puntual.</div>
      <form id="comunForm">
        <div class="form-grid">
          ${selectField("siloId","Silo",state.silosBase[0]?.id || "Silo 4",state.silosBase.map(s => s.id))}
          ${selectField("turno","Turno","Día",["Día","Noche"])}
          ${inputField("fecha","Fecha",hoy(),"text")}
          ${inputField("masa","Masa común (t)","50","number","50","0.01")}
          ${inputField("cu","Cu %","","number","0.49","0.01")}
          ${inputField("mo","Mo %","","number","57.5","0.01")}
          ${inputField("s","S %","","number","0.08","0.01")}
        </div>
        <button class="btn" style="width:100%;margin-top:10px">GUARDAR COMÚN</button>
      </form>
      <div style="border-top:1px solid var(--line);margin-top:16px;padding-top:12px">
        <div class="muted-title" style="margin-bottom:10px">Comunes ingresados — ${state.comunes.length}</div>
        <div style="max-height:330px;overflow:auto">${[...state.comunes].reverse().map(c => {
          const cl = clasificar(c);
          return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;padding:7px 0;border-bottom:1px solid #1a2e4a33">
            <div><div class="mono" style="color:var(--blue-light);font-weight:800">${c.siloId} · ${c.turno}</div><div style="color:var(--txt2);font-size:10px">${c.fecha} · ${c.masa}t · Cu ${c.cu}% · Mo ${c.mo}% · S ${c.s}%</div></div>
            <div style="display:flex;gap:5px;align-items:center"><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span><button class="icon-btn" data-comun-del="${c.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">x</button></div>
          </div>`;
        }).join("") || `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px 0">Sin comunes registrados</div>`}</div>
      </div>
    </section>
  </div>`;
}

function bindSilos() {
  const form = document.querySelector("#comunForm");
  document.querySelectorAll("[data-silo-fill]").forEach(btn => btn.addEventListener("click", () => {
    form.elements.siloId.value = btn.dataset.siloFill;
    form.elements.cu.focus();
  }));
  document.querySelectorAll("[data-silo-clear]").forEach(btn => btn.addEventListener("click", () => {
    const siloId = btn.dataset.siloClear;
    if (!confirm(`¿Vaciar comunes de ${siloId}?`)) return;
    state.comunes = state.comunes.filter(c => c.siloId !== siloId);
    save("oxmo:comunes", state.comunes);
    addHist("Silo vaciado", siloId, "Comunes eliminados", C.red);
    render();
  }));
  document.querySelectorAll("[data-comun-del]").forEach(btn => btn.addEventListener("click", () => {
    state.comunes = state.comunes.filter(c => c.id !== btn.dataset.comunDel);
    save("oxmo:comunes", state.comunes);
    render();
  }));
  form.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (guardarComunManual(data, "manual-silos")) render();
  });
}

function bindReportes() {
  document.querySelector("#printReport").addEventListener("click", () => {
    const fecha = new Date().toLocaleDateString("es-CL").replaceAll("-", "_");
    const filename = `reporte_${fecha}`;
    const rows = state.lotes.map(l => {
      const cl = clasificar(l);
      return `<tr><td>${l.id}</td><td>${l.tipo}</td><td>${l.masa.toLocaleString("es-CL")}</td><td>${l.sector}</td><td>${hasAnalysis(l) ? l.cu : "-"}</td><td>${hasAnalysis(l) ? l.mo : "-"}</td><td>${hasAnalysis(l) ? l.s : "-"}</td><td><span class="badge" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}66">${cl.clase}</span></td><td>${l.estado}</td><td>${l.fecha}</td></tr>`;
    }).join("");
    const html = `<html><head><title>${filename}</title><style>
      @page{size:A4 landscape;margin:10mm}
      *{box-sizing:border-box}
      html,body{width:277mm;min-height:190mm;margin:0;font-family:Arial,sans-serif;color:#182234;background:white;writing-mode:horizontal-tb}
      body{padding:0}
      .sheet{width:277mm;min-height:190mm;padding:0;background:white}
      .header{display:flex;justify-content:space-between;align-items:stretch;background:linear-gradient(90deg,#071326,#0f3a6e 55%,#c87533);color:white;border-radius:10px;margin-bottom:10px;overflow:hidden}
      .brand{padding:14px 18px}
      h1{font-size:20px;letter-spacing:.8px;margin:0 0 4px}
      .sub{font-size:11px;color:#b9dfff;letter-spacing:1.4px}
      .date{padding:14px 18px;text-align:right;background:#0002;min-width:140px;font-size:11px}
      .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:10px}
      .k{border:1px solid #d7e2ee;border-top:4px solid #1e6fd9;border-radius:8px;padding:8px 10px;background:#f7fbff}
      .k b{display:block;color:#0f3a6e;font-size:15px}
      .k span{font-size:9px;color:#60728a;text-transform:uppercase;letter-spacing:.6px}
      table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;border:1px solid #cfd8e3;border-radius:8px;overflow:hidden}
      th{background:#0f3a6e;color:white;font-size:9px;letter-spacing:.5px;text-transform:uppercase}
      td,th{padding:6px 7px;border-right:1px solid #d7e2ee;border-bottom:1px solid #d7e2ee;text-align:left;word-break:normal;overflow-wrap:anywhere;vertical-align:middle}
      td{font-size:10px}
      tr:nth-child(even) td{background:#f6f9fc}
      td:nth-child(1){font-family:Consolas,monospace;font-weight:bold;color:#1e6fd9}
      td:nth-child(3),td:nth-child(5),td:nth-child(6),td:nth-child(7){text-align:right;font-family:Consolas,monospace}
      th:nth-child(1){width:8%} th:nth-child(2){width:10%} th:nth-child(3){width:10%} th:nth-child(4){width:18%} th:nth-child(5),th:nth-child(6),th:nth-child(7){width:8%} th:nth-child(8){width:14%} th:nth-child(9){width:10%} th:nth-child(10){width:8%}
      .badge{display:inline-block;border:1px solid;border-radius:999px;padding:2px 7px;font-weight:bold;font-size:9px;white-space:nowrap}
      .small{font-size:9px;color:#687789;margin-top:8px}
      @media print{html,body,.sheet{width:277mm;min-height:190mm}.sheet{page-break-after:auto}}
    </style></head><body><main class="sheet"><div class="header"><div class="brand"><h1>REPORTE INVENTARIO DE CIRCULANTES</h1><div class="sub">OXMO · CONTROL OPERACIONAL</div></div><div class="date"><b>Fecha reporte</b><br>${new Date().toLocaleString("es-CL")}</div></div><section class="summary"><div class="k"><span>Total lotes</span><b>${state.lotes.length}</b></div><div class="k" style="border-top-color:#00e5a0"><span>Masa total</span><b>${(state.lotes.reduce((a,l)=>a+l.masa,0)/1000).toFixed(2)} t</b></div><div class="k" style="border-top-color:#c87533"><span>Alto cobre</span><b>${state.lotes.filter(l=>clasificar(l).clase==="Alto Cobre").length}</b></div><div class="k" style="border-top-color:#ff4560"><span>Fuera esp.</span><b>${state.lotes.filter(l=>clasificar(l).clase==="Fuera Esp").length}</b></div></section><table><tr><th>ID</th><th>Tipo</th><th>Masa kg</th><th>Sector</th><th>Cu %</th><th>Mo %</th><th>S %</th><th>Clasificación</th><th>Estado</th><th>Fecha</th></tr>${rows}</table><div class="small">Reporte generado desde inventario de circulantes. No incluye silos.</div></main></body></html>`;
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.left = "-1200px";
    frame.style.top = "0";
    frame.style.width = "1123px";
    frame.style.height = "794px";
    frame.style.border = "0";
    document.body.appendChild(frame);
    frame.contentDocument.open();
    frame.contentDocument.write(html);
    frame.contentDocument.close();
    frame.onload = () => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 1000);
    };
    setTimeout(() => {
      frame.contentWindow.focus();
      frame.contentWindow.print();
      setTimeout(() => frame.remove(), 1000);
    }, 250);
  });
}

function alertasHTML() {
  const disp = state.lotes.filter(l => l.estado === "Disponible");
  const alerts = [
    ...state.lotes.filter(l => l.estado === "Fuera Esp").map(l => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`${l.id} FUERA DE ESPECIFICACIÓN`,detalle:`Mo:${l.mo}% Cu:${l.cu}% S:${l.s}% · ${l.sector}`})),
    ...silosPonderados().filter(s => s.nivel > 85).map(s => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`Silo ${s.id} al ${s.nivel.toFixed(0)}%`,detalle:`Masa est: ${s.masa.toFixed(1)}t · Programar despacho`})),
    ...silosPonderados().filter(s => s.muestras && s.clase === "Fuera Esp").map(s => ({nivel:"CRÍTICO",color:C.red,icon:"🚨",msg:`Silo ${s.id} fuera de especificación`,detalle:`Cu:${s.cu.toFixed(2)}% Mo:${s.mo.toFixed(2)}% S:${s.s.toFixed(2)}%`})),
    ...state.lotes.filter(l => l.estado === "Pendiente").map(l => ({nivel:"AVISO",color:C.yellow,icon:"⚠️",msg:`${l.id} sin análisis`,detalle:`${l.tipo} · ${l.masa}kg · ${l.sector} · ${l.fecha}`})),
    {nivel:"INFO",color:C.green,icon:"ℹ️",msg:"Sistema activo",detalle:`${state.lotes.length} lotes · ${disp.length} disponibles · ${new Date().toLocaleTimeString("es-CL")}`}
  ];
  return `<div style="display:flex;flex-direction:column;gap:8px">${alerts.map(a => `<div class="card" style="border-left:4px solid ${a.color};display:flex;gap:12px"><span style="font-size:20px">${a.icon}</span><div><div><span class="tag" style="background:${a.color}22;color:${a.color};border-color:${a.color}44">${a.nivel}</span> <b style="font-size:12px">${a.msg}</b></div><div style="color:var(--txt2);font-size:11px;margin-top:4px">${a.detalle}</div></div></div>`).join("")}</div>`;
}

function buscarMejoresMezclas2() {
  const objetivoKg = Math.min(40000, Math.max(1000, Math.round(parseNum(state.mix.masa || 20000) / 1000) * 1000));
  const paso = 1000;
  const basePool = state.lotes.filter(l => hasAnalysis(l) && l.masa > 0 && (state.mix.sector === "Todos" || l.sector === state.mix.sector));
  const scoreLote = l => {
    const c = clasificar(l);
    return (c.clase === "Fuera Esp" ? -120 : 0)
      + Math.abs(Number(l.cu || 0) - parseNum(state.mix.cu)) * 35
      + Math.max(0, parseNum(state.mix.mo) - Number(l.mo || 0)) * 18
      + Math.max(0, Number(l.s || 0) - parseNum(state.mix.s)) * 90
      - Math.min(Number(l.masa || 0), objetivoKg) / 1000;
  };
  const pool = (state.mix.sel.length ? basePool.filter(l => state.mix.sel.includes(l.id)) : basePool)
    .sort((a, b) => scoreLote(a) - scoreLote(b))
    .slice(0, 18);
  const opciones = [];
  const firmas = new Set();
  const masasObjetivo = [objetivoKg];
  for (let delta = paso; delta <= 5000; delta += paso) {
    if (objetivoKg - delta >= paso) masasObjetivo.push(objetivoKg - delta);
    if (objetivoKg + delta <= 40000) masasObjetivo.push(objetivoKg + delta);
  }
  const evaluar = items => {
    const clean = items
      .map(x => ({ lote: x.lote, kg: Math.round(Number(x.kg || 0) / 1000) * 1000 }))
      .filter(x => x.kg > 0)
      .sort((a, b) => String(a.lote.id).localeCompare(String(b.lote.id)));
    if (!clean.length || clean.some(x => x.kg > x.lote.masa)) return;
    const firma = clean.map(x => `${x.lote.id}:${x.kg}`).join("|");
    if (firmas.has(firma)) return;
    firmas.add(firma);
    const mix = mezclaDe(clean);
    const diffKg = Math.abs(mix.masaKg - objetivoKg);
    if (diffKg > 5000) return;
    const fueraKg = clean.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
    const cuPenalty = Math.abs(mix.cu - parseNum(state.mix.cu)) * 160;
    const moPenalty = Math.max(0, parseNum(state.mix.mo) - mix.mo) * 120;
    const sPenalty = Math.max(0, mix.s - parseNum(state.mix.s)) * 900;
    const massPenalty = (diffKg / 1000) * 65;
    const specBonus = mix.ok ? 800 : 0;
    const exactBonus = diffKg === 0 ? 160 : 0;
    const fueraBonus = fueraKg / 1000 * 18;
    opciones.push({ items: clean, mix, fueraKg, diffKg, objetivoKg, exacta: diffKg === 0, score: specBonus + exactBonus + fueraBonus - cuPenalty - moPenalty - sPenalty - massPenalty });
  };
  for (const targetKg of masasObjetivo) {
    for (let i = 0; i < pool.length; i++) evaluar([{ lote: pool[i], kg: targetKg }]);
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let kgA = paso; kgA < targetKg; kgA += paso) {
          evaluar([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: targetKg - kgA }]);
        }
      }
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let k = j + 1; k < pool.length; k++) {
          for (let kgA = paso; kgA < targetKg - paso; kgA += paso) {
            for (let kgB = paso; kgB < targetKg - kgA; kgB += paso) {
              evaluar([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: kgB }, { lote: pool[k], kg: targetKg - kgA - kgB }]);
            }
          }
        }
      }
    }
  }
  return opciones
    .sort((a, b) => (Number(b.exacta) - Number(a.exacta)) || (a.diffKg - b.diffKg) || (b.score - a.score))
    .slice(0, 6);
}

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

function mezclaOpcionHTML(op, idx) {
  const estado = op.mix.ok ? "CUMPLE" : "MEJOR APROX.";
  return `<div class="card" style="border-left:4px solid ${op.mix.color};margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div><b style="color:${op.mix.color}">Opción ${idx + 1} · ${op.mix.clase}</b><div style="color:var(--txt2);font-size:10px">Fuera de especificación usado: ${(op.fueraKg/1000).toFixed(2)} t</div></div>
      <div class="mono" style="font-weight:900;color:${op.mix.ok ? C.green : C.yellow}">${estado}</div>
    </div>
    ${mezclaDetalleHTML(op)}
  </div>`;
}

function mezclaDetalleHTML(op) {
  return `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:8px;margin-top:10px">
    ${op.items.map(x => `<div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div class="mono" style="color:var(--blue-light);font-weight:800">${x.lote.id}</div>
      <div style="color:var(--txt2);font-size:10px">${(x.kg/1000).toFixed(0)} sacos · ${(x.kg/1000).toFixed(2)} t</div>
    </div>`).join("")}
    <div style="background:#0f3a6e55;border-radius:5px;padding:8px">
      <div style="color:var(--txt3);font-size:9px">Resultado</div>
      <div class="mono" style="color:${op.mix.color};font-weight:900">Cu ${op.mix.cu.toFixed(3)}% · Mo ${op.mix.mo.toFixed(3)}% · S ${op.mix.s.toFixed(3)}%</div>
    </div>
  </div>
  <pre style="white-space:pre-wrap;background:#040a14;border:1px solid var(--line);border-radius:6px;padding:10px;color:var(--txt2);font-size:10px;margin:10px 0 0">${formulaMezcla(op.items, op.mix)}</pre>`;
}

function mezclaOpcionHTML(op, idx) {
  const estado = op.exacta ? (op.mix.ok ? "CUMPLE" : "REVISAR") : `APROX. ${(op.diffKg / 1000).toFixed(1)} t`;
  const masaInfo = op.exacta
    ? `Masa exacta: ${(op.mix.masaKg / 1000).toFixed(2)} t`
    : `Masa aproximada: ${(op.mix.masaKg / 1000).toFixed(2)} t - diferencia ${(op.diffKg / 1000).toFixed(2)} t`;
  return `<div class="card" style="border-left:4px solid ${op.mix.color};margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div>
        <b style="color:${op.mix.color}">Opcion ${idx + 1} - ${op.mix.clase}</b>
        <div style="color:var(--txt2);font-size:10px">${masaInfo}</div>
        <div style="color:var(--txt2);font-size:10px">Fuera de especificacion usado: ${(op.fueraKg / 1000).toFixed(2)} t</div>
      </div>
      <div class="mono" style="font-weight:900;color:${op.mix.ok ? C.green : C.yellow}">${estado}</div>
    </div>
    ${mezclaDetalleHTML(op)}
  </div>`;
}

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

function tipoAnalisisACP(codigo) {
  codigo = normalizarCodigoAnalisis(codigo);
  if (/^OO300-001-\d+-\d{2}$/.test(codigo)) return "comun_turno";
  if (/^OXMO\d+-\d{2}$/.test(codigo)) return "lote_oxmo";
  if (/^OXBR\d+-\d{2}$/.test(codigo)) return "briqueta";
  if (codigo.includes("OSAC") && /-\d{2}$/.test(codigo)) return "lote_osac";
  if (/^[A-Z]{2,12}\d+-\d{2}$/.test(codigo)) return "otro_lote";
  return "";
}

function normalizarCodigoAnalisis(codigo) {
  let s = String(codigo || "").trim().toUpperCase().replace(/\s+/g, "");
  s = s.replace(/^([A-Z]+)-(?=\d)/, "$1");
  const base = s.match(/^(.+?-\d{2})(?:[-_].*)$/);
  return base ? base[1] : s;
}

function codigoPartesInventario(codigo) {
  const s = normalizarCodigoAnalisis(codigo);
  const m = s.match(/^([A-Z]+)0*(\d+)-(\d{2})$/);
  if (!m) return null;
  return { prefix: m[1], numero: String(Number(m[2])), year: m[3] };
}

function scoreMatchACP(lote, analisis) {
  const loteCodigo = normalizarCodigoAnalisis(lote.id);
  const acpCodigo = normalizarCodigoAnalisis(analisis.codigo);
  if (!loteCodigo || !acpCodigo) return 0;
  if (loteCodigo === acpCodigo) return 4;
  if (loteCodigo.startsWith(`${acpCodigo}-`) || acpCodigo.startsWith(`${loteCodigo}-`)) return 3;
  const lp = codigoPartesInventario(loteCodigo);
  const ap = codigoPartesInventario(acpCodigo);
  if (!lp || !ap) return 0;
  if (lp.prefix === ap.prefix && lp.numero === ap.numero && lp.year === ap.year) return 3;
  if (lp.numero === ap.numero && lp.year === ap.year) return 1;
  return 0;
}

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

function fusionarInfodia(prev, next) {
  if (!prev?.days?.length && !prev?.analisisACP?.length) return next;
  const days = uniqueBy([...(prev.days || []), ...(next.days || [])], d => d.fecha)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
  const analisisACP = uniqueBy([...(prev.analisisACP || []), ...(next.analisisACP || [])], a => `${a.codigo}|${a.fecha}|${a.fuente || ""}`)
    .sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")) || String(a.codigo || "").localeCompare(String(b.codigo || "")));
  const analisis = analisisACP.filter(a => a.tipoAnalisis === "comun_turno");
  const analisisLotes = analisisACP.filter(a => a.tipoAnalisis !== "comun_turno");
  const siloHistorial = uniqueBy([...(prev.siloHistorial || []), ...(next.siloHistorial || [])], h => [
    h.fecha,
    h.siloId,
    h.turno,
    h.horaInicio,
    h.horaTermino,
    h.movimiento,
  ].join("|")).sort((a, b) => String(a.fecha || "").localeCompare(String(b.fecha || "")) || String(a.siloId || "").localeCompare(String(b.siloId || "")));
  const selectedWindow = selectSiloSimulationDays(days);
  return {
    ...prev,
    ...next,
    days,
    analisis,
    analisisLotes,
    analisisACP,
    siloHistorial,
    simWindow: selectedWindow.label,
    totals: recalcularTotalesInfodia(days),
  };
}

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

function etiquetaPublicaHTML(data) {
  if (data.error || !data.lote) {
    return `<main class="login" style="padding:24px">
      <section class="box" style="width:min(420px,100%);border-top:3px solid ${C.red}">
        <div class="muted-title" style="color:var(--red);margin-bottom:8px">Etiqueta OXMO</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900;margin-bottom:8px">QR no valido</div>
        <div style="color:var(--txt2);font-size:12px;line-height:1.45">Genera nuevamente la vista previa de etiqueta desde OXMO y escanea el QR nuevo.</div>
      </section>
    </main>`;
  }
  const color = data.color || C.cyan;
  const qrData = encodeURIComponent(location.href);
  const idLen = String(data.lote || "").length;
  const idSize = idLen > 26 ? "14pt" : idLen > 20 ? "16pt" : "20pt";
  return `<style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: #eceff3; font-family: Arial, Helvetica, sans-serif; color: #111; }
    .public-wrap { min-height: 100vh; display: grid; place-items: start center; padding: 12px; }
    .label-page { width: 100mm; height: 150mm; padding: 3mm; background: #fff; box-shadow: 0 12px 34px #0003; overflow: hidden; }
    .label { width: 94mm; height: 144mm; border: .8mm solid #111; border-radius: 2.5mm; padding: 4.5mm 5mm 2.8mm; display: flex; flex-direction: column; overflow: hidden; }
    header { min-height: 19mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 4mm; border-bottom: .45mm solid #111; padding-bottom: 2.2mm; }
    header img { width: 32mm; max-height: 14mm; height: auto; object-fit: contain; margin-top: 1.2mm; }
    .system { font-size: 10pt; line-height: 1.15; font-weight: 900; letter-spacing: 2.1pt; text-align: right; white-space: pre-line; }
    .date { font-size: 7pt; color: #333; text-align: right; margin-top: 1.6mm; }
    main { flex: 1; display: flex; flex-direction: column; align-items: stretch; min-height: 0; padding-top: 3mm; }
    .lot-id { font-family: Consolas, "Courier New", monospace; font-size: ${idSize}; font-weight: 900; text-align: center; line-height: 1.05; letter-spacing: .2pt; margin: 0 0 3mm; overflow-wrap: anywhere; word-break: break-word; }
    .material { min-height: 13mm; border: .55mm solid ${esc(color)}; color: ${esc(color)}; border-radius: 2mm; padding: 1.7mm 2mm; display: flex; align-items: center; justify-content: center; font-size: 16pt; font-weight: 900; letter-spacing: 1.2pt; text-align: center; margin-bottom: 3mm; }
    .chem { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; margin-bottom: 3mm; }
    .chem div, .meta div { border: .35mm solid #222; border-radius: 1.5mm; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .chem div { min-height: 14mm; padding: 1.4mm 1mm; }
    .meta div { min-height: 13mm; padding: 1.4mm; }
    .chem b, .meta b { display: block; font-size: 6.5pt; line-height: 1; text-transform: uppercase; color: #111; margin-bottom: 1mm; letter-spacing: .3pt; }
    .chem span { font-family: Consolas, "Courier New", monospace; font-size: 13.5pt; line-height: 1; font-weight: 900; }
    .meta { display: grid; grid-template-columns: 1fr; gap: 2mm; margin-bottom: 2mm; }
    .meta span { font-size: 12pt; line-height: 1; font-weight: 900; }
    .qr-zone { flex: 1; min-height: 42mm; display: flex; align-items: center; justify-content: center; padding: 1mm 0 1.5mm; }
    .qr { width: 40mm; height: 40mm; image-rendering: pixelated; object-fit: contain; display: block; }
    footer { border-top: .35mm solid #111; padding-top: .8mm; font-size: 5.5pt; line-height: 1.2; text-align: center; color: #555; }
    @media print { @page { size: 100mm 150mm; margin: 0; } html, body { width: 100mm; height: 150mm; background: #fff; } .public-wrap { min-height: 150mm; padding: 0; display: block; } .label-page { box-shadow: none; margin: 0; } }
  </style>
  <div class="public-wrap">
    <section class="label-page">
      <div class="label">
        <header>
          <img src="./molyb-logo.webp" alt="Molyb" />
          <div>
            <div class="system">OXMO\nCONTROL</div>
            <div class="date">${esc(data.fecha || hoy())}</div>
          </div>
        </header>
        <main>
          <div class="lot-id">${esc(data.lote)}</div>
          <div class="material">${esc(String(data.material || "").toUpperCase())}</div>
          <div class="chem">
            <div><b>Cu</b><span>${esc(data.cu != null ? `${data.cu}%` : "-")}</span></div>
            <div><b>Mo</b><span>${esc(data.mo != null ? `${data.mo}%` : "-")}</span></div>
            <div><b>S</b><span>${esc(data.s != null ? `${data.s}%` : "-")}</span></div>
          </div>
          <div class="meta"><div><b>Masa</b><span>${esc(data.masa || "-")}</span></div></div>
          <div class="qr-zone"><img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=1&data=${qrData}" alt="QR ${esc(data.lote)}" /></div>
        </main>
        <footer>Zebra ZT230 · Etiqueta 100 × 150 mm · 300 dpi</footer>
      </div>
    </section>
  </div>`;
}


function publicDato(label, value) {
  return `<div class="card" style="padding:10px;text-align:center"><div style="color:var(--txt3);font-size:9px;text-transform:uppercase">${esc(label)}</div><div class="mono" style="font-weight:900;color:var(--txt)">${esc(value)}</div></div>`;
}

function printLabels() {
  const items = state.etiquetaSel.map(id => state.lotes.find(l => l.id === id)).filter(Boolean).map(l => {
    const c = clasificar(l);
    const labelParams = new URLSearchParams({
      label: "1",
      id: l.id,
      mat: c.clase,
      color: c.color,
      masa: kgToTon(l.masa, 2),
      cu: l.cu ? fmt(l.cu, 2) : "",
      mo: l.mo ? fmt(l.mo, 2) : "",
      s: l.s ? fmt(l.s, 3) : "",
      fecha: l.fecha || "",
    });
    const qrUrl = `${PUBLIC_APP_URL}etiqueta.html?${labelParams.toString()}`;
    const qrData = encodeURIComponent(qrUrl);
    const idLen = String(l.id || "").length;
    const idSize = idLen > 26 ? "14pt" : idLen > 20 ? "16pt" : "20pt";
    const chem = hasAnalysis(l)
      ? `<div class="chem"><div><b>Cu</b><span>${fmt(l.cu, 2)}%</span></div><div><b>Mo</b><span>${fmt(l.mo, 2)}%</span></div><div><b>S</b><span>${fmt(l.s, 3)}%</span></div></div>`
      : `<div class="pending">SIN ANALISIS</div>`;
    return `<section class="label-page">
      <div class="label">
        <header>
          <img src="./molyb-logo.webp" alt="Molyb" />
          <div>
            <div class="system">OXMO\nCONTROL</div>
            <div class="date">${esc(l.fecha || hoy())}</div>
          </div>
        </header>
        <main>
          <div class="lot-id" style="font-size:${idSize}">${esc(l.id)}</div>
          <div class="material" style="border-color:${c.color};color:${c.color}">${esc(c.clase.toUpperCase())}</div>
          ${chem}
          <div class="meta"><div><b>Masa</b><span>${kgToTon(l.masa, 2)}</span></div></div>
          <div class="qr-zone"><img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=520x520&margin=1&data=${qrData}" alt="QR ${esc(l.id)}" /></div>
        </main>
        <footer>Zebra ZT230 · Etiqueta 100 × 150 mm · 300 dpi</footer>
      </div>
    </section>`;
  }).join("");
  const w = window.open("", "_blank");
  if (!w) {
    alert("Permite ventanas emergentes para abrir la vista previa de etiquetas.");
    return;
  }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas OXMO</title><style>
    @page { size: 100mm 150mm; margin: 0; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #eceff3; font-family: Arial, Helvetica, sans-serif; color: #111; }
    .label-page { width: 100mm; height: 150mm; page-break-after: always; break-after: page; padding: 3mm; background: #fff; overflow: hidden; }
    .label { width: 94mm; height: 144mm; border: .8mm solid #111; border-radius: 2.5mm; padding: 4.5mm 5mm 2.8mm; display: flex; flex-direction: column; overflow: hidden; }
    header { min-height: 19mm; display: flex; justify-content: space-between; align-items: flex-start; gap: 4mm; border-bottom: .45mm solid #111; padding-bottom: 2.2mm; }
    header img { width: 32mm; max-height: 14mm; height: auto; object-fit: contain; margin-top: 1.2mm; }
    .system { font-size: 10pt; line-height: 1.15; font-weight: 900; letter-spacing: 2.1pt; text-align: right; white-space: pre-line; }
    .date { font-size: 7pt; color: #333; text-align: right; margin-top: 1.6mm; }
    main { flex: 1; display: flex; flex-direction: column; align-items: stretch; min-height: 0; padding-top: 3mm; }
    .lot-id { font-family: Consolas, "Courier New", monospace; font-weight: 900; text-align: center; line-height: 1.05; letter-spacing: .2pt; margin: 0 0 3mm; overflow-wrap: anywhere; word-break: break-word; }
    .material { min-height: 13mm; border: .55mm solid; border-radius: 2mm; padding: 1.7mm 2mm; display: flex; align-items: center; justify-content: center; font-size: 16pt; font-weight: 900; letter-spacing: 1.2pt; text-align: center; margin-bottom: 3mm; }
    .chem { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; margin-bottom: 3mm; }
    .chem div, .meta div { border: .35mm solid #222; border-radius: 1.5mm; text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .chem div { min-height: 14mm; padding: 1.4mm 1mm; }
    .meta div { min-height: 13mm; padding: 1.4mm; }
    .chem b, .meta b { display: block; font-size: 6.5pt; line-height: 1; text-transform: uppercase; color: #111; margin-bottom: 1mm; letter-spacing: .3pt; }
    .chem span { font-family: Consolas, "Courier New", monospace; font-size: 13.5pt; line-height: 1; font-weight: 900; }
    .pending { min-height: 14mm; border: .35mm solid #222; border-radius: 1.5mm; padding: 3mm; font-size: 14pt; font-weight: 900; text-align: center; margin-bottom: 3mm; display: flex; align-items: center; justify-content: center; }
    .meta { display: grid; grid-template-columns: 1fr; gap: 2mm; margin-bottom: 2mm; }
    .meta span { font-size: 12pt; line-height: 1; font-weight: 900; }
    .qr-zone { flex: 1; min-height: 42mm; display: flex; align-items: center; justify-content: center; padding: 1mm 0 1.5mm; }
    .qr { width: 40mm; height: 40mm; image-rendering: pixelated; object-fit: contain; display: block; }
    footer { border-top: .35mm solid #111; padding-top: .8mm; font-size: 5.5pt; line-height: 1.2; text-align: center; color: #555; }
    .no-print { position: fixed; top: 10px; right: 10px; display: flex; gap: 8px; z-index: 10; }
    .no-print button { padding: 9px 14px; font-weight: 900; cursor: pointer; }
    @media screen { body { display: grid; place-items: start center; gap: 12px; padding: 16px; } .label-page { box-shadow: 0 8px 30px #0003; } }
    @media print { html, body { width: 100mm; background: #fff; padding: 0; } .no-print { display: none; } .label-page { box-shadow: none; margin: 0; } }
  </style></head><body><div class="no-print"><button onclick="window.print()">Imprimir / guardar PDF</button></div>${items}</body></html>`);
  w.document.close();
}


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

function evaluarMezclaObjetivo(items, objetivo, firmas, opciones) {
  const clean = items
    .map(x => ({ lote: x.lote, kg: Math.round(Number(x.kg || 0) / 1000) * 1000 }))
    .filter(x => x.kg > 0)
    .sort((a, b) => String(a.lote.id).localeCompare(String(b.lote.id)));
  if (!clean.length || clean.some(x => x.kg > Math.floor(Number(x.lote.masa || 0) / 1000) * 1000)) return;
  const firma = clean.map(x => `${x.lote.id}:${x.kg}`).join("|");
  if (firmas.has(firma)) return;
  firmas.add(firma);

  const mix = mezclaDe(clean);
  const diffKg = Math.abs(mix.masaKg - objetivo.masa);
  if (diffKg > 5000) return;

  const cuDiff = Math.abs(mix.cu - objetivo.cu);
  const moShort = Math.max(0, objetivo.mo - mix.mo);
  const moDiff = Math.abs(mix.mo - objetivo.mo);
  const sOver = Math.max(0, mix.s - objetivo.s);
  const sDiff = Math.abs(mix.s - objetivo.s);
  const claseObjetivoAlta = objetivo.cu > 0.5;
  const claseMezclaAlta = mix.cu > 0.5;
  const clasePenalty = claseObjetivoAlta === claseMezclaAlta ? 0 : 180;
  const chemPenalty = (cuDiff * 1200) + (moShort * 1000) + (moDiff * 80) + (sOver * 16000) + (sDiff * 900) + clasePenalty;
  const massPenalty = (diffKg / 1000) * 70;
  const fueraKg = clean.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
  const targetOk = cuDiff <= 0.04 && mix.mo >= objetivo.mo && mix.s <= objetivo.s && diffKg === 0;
  mix.ok = targetOk;
  opciones.push({
    items: clean,
    mix,
    fueraKg,
    diffKg,
    objetivoKg: objetivo.masa,
    exacta: diffKg === 0,
    chemPenalty,
    score: chemPenalty + massPenalty - (fueraKg / 1000 * 14),
  });
}

function buscarMejoresMezclas2() {
  const objetivo = objetivoMezcla();
  const basePool = state.lotes
    .filter(l => hasAnalysis(l) && Number(l.masa || 0) >= 1000 && (state.mix.sector === "Todos" || l.sector === state.mix.sector))
    .filter(l => Math.floor(Number(l.masa || 0) / 1000) > 0);
  const selectedPool = state.mix.sel.length ? basePool.filter(l => state.mix.sel.includes(l.id)) : basePool;
  const relevancia = l => {
    const cl = clasificar(l).clase;
    return Math.abs(Number(l.cu || 0) - objetivo.cu) * 100
      + Math.max(0, objetivo.mo - Number(l.mo || 0)) * 22
      + Math.max(0, Number(l.s || 0) - objetivo.s) * 700
      - (cl === "Fuera Esp" ? 8 : 0)
      - Math.min(Number(l.masa || 0), objetivo.masa) / 8000;
  };
  const pool = [...selectedPool].sort((a, b) => relevancia(a) - relevancia(b)).slice(0, 18);
  const opciones = [];
  const firmas = new Set();
  const masasObjetivo = [objetivo.masa];
  for (let delta = 1000; delta <= 5000; delta += 1000) {
    if (objetivo.masa - delta >= 1000) masasObjetivo.push(objetivo.masa - delta);
    if (objetivo.masa + delta <= 40000) masasObjetivo.push(objetivo.masa + delta);
  }

  for (const targetKg of masasObjetivo) {
    for (let i = 0; i < pool.length; i++) {
      evaluarMezclaObjetivo([{ lote: pool[i], kg: targetKg }], objetivo, firmas, opciones);
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let kgA = 1000; kgA < targetKg; kgA += 1000) {
          evaluarMezclaObjetivo([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: targetKg - kgA }], objetivo, firmas, opciones);
        }
      }
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let k = j + 1; k < pool.length; k++) {
          for (let kgA = 1000; kgA < targetKg - 1000; kgA += 1000) {
            for (let kgB = 1000; kgB < targetKg - kgA; kgB += 1000) {
              evaluarMezclaObjetivo([
                { lote: pool[i], kg: kgA },
                { lote: pool[j], kg: kgB },
                { lote: pool[k], kg: targetKg - kgA - kgB },
              ], objetivo, firmas, opciones);
            }
          }
        }
      }
    }
  }

  return opciones
    .sort((a, b) => a.score - b.score || a.chemPenalty - b.chemPenalty || a.diffKg - b.diffKg || b.fueraKg - a.fueraKg)
    .slice(0, 8);
}

function mezclaOpcionHTML(op, idx) {
  const estado = op.mix.ok ? "CUMPLE" : (op.exacta ? "MEJOR QUIMICA" : `APROX. ${(op.diffKg / 1000).toFixed(1)} t`);
  const masaInfo = op.exacta
    ? `Masa exacta: ${(op.mix.masaKg / 1000).toFixed(2)} t`
    : `Masa aproximada: ${(op.mix.masaKg / 1000).toFixed(2)} t - diferencia ${(op.diffKg / 1000).toFixed(2)} t`;
  return `<div class="card" style="border-left:4px solid ${op.mix.color};margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
      <div>
        <b style="color:${op.mix.color}">Opcion ${idx + 1} - ${op.mix.clase}</b>
        <div style="color:var(--txt2);font-size:10px">${masaInfo}</div>
        <div style="color:var(--txt2);font-size:10px">Fuera de especificacion usado: ${(op.fueraKg / 1000).toFixed(2)} t</div>
      </div>
      <div class="mono" style="font-weight:900;color:${op.mix.ok ? C.green : C.yellow}">${estado}</div>
    </div>
    ${mezclaDetalleHTML(op)}
  </div>`;
}

function comunesAsignados() {
  const acp = new Map((state.infodia?.analisis || []).map(a => [normalizarCodigoAnalisis(a.codigo), a]));
  const rows = [];
  const seen = new Set();
  for (const h of state.siloHistorial || []) {
    if (!isValidSiloId(h.siloId)) continue;
    const codigos = Array.isArray(h.comunes) ? h.comunes : [];
    for (const codigo of codigos) {
      const key = `${normalizarCodigoAnalisis(codigo)}|${h.fecha}|${h.siloId}|infodia`;
      if (seen.has(key)) continue;
      seen.add(key);
      const a = acp.get(normalizarCodigoAnalisis(codigo)) || {};
      rows.push({
        id: key,
        codigo: codigo,
        fecha: a.fecha || h.fecha || "",
        siloId: h.siloId,
        turno: h.turno || "Dia",
        masa: Number(h.masaLlenado || h.llenado || h.masa || 0),
        cu: Number(a.cu ?? h.cu ?? 0),
        mo: Number(a.mo ?? h.mo ?? 0),
        s: Number(a.s ?? h.s ?? 0),
        fuente: "Infodia/ACP",
      });
    }
  }
  for (const c of state.comunes || []) {
    const key = `${c.id}|manual`;
    if (seen.has(key)) continue;
    seen.add(key);
    rows.push({ ...c, fuente: "Manual" });
  }
  return rows
    .filter(r => isValidSiloId(r.siloId))
    .sort((a, b) => fechaOrdenMs(b.fecha) - fechaOrdenMs(a.fecha) || String(b.codigo || "").localeCompare(String(a.codigo || "")));
}

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

function siloManualModalHTML(siloId) {
  if (!siloId) return "";
  return `<div class="modal-backdrop" role="dialog" aria-modal="true">
    <form class="cloud-modal" id="comunForm">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Ajuste manual de silo</div>
          <h2 style="margin:0;color:var(--txt);font-size:20px">${esc(siloId)}</h2>
          <p style="margin:8px 0 0;color:var(--txt2);font-size:12px">Usa este ingreso solo para corregir o cargar un comun puntual. La carga normal viene desde Infodia/ACP.</p>
        </div>
        <button type="button" class="icon-btn" id="siloManualClose">X</button>
      </div>
      <div class="form-grid">
        ${selectField("siloId","Silo",siloId,state.silosBase.map(s => s.id))}
        ${selectField("turno","Turno","Dia",["Dia","Noche"])}
        ${inputField("fecha","Fecha",new Date().toISOString().slice(0, 10),"date")}
        ${inputField("masa","Masa comun (t)","50","number","50","0.01")}
        ${inputField("cu","Cu %","","number","0.49","0.001")}
        ${inputField("mo","Mo %","","number","57.5","0.001")}
        ${inputField("s","S %","","number","0.08","0.0001")}
      </div>
      <button class="btn" style="width:100%;margin-top:12px">GUARDAR COMUN</button>
    </form>
  </div>`;
}

function silosHTML() {
  const silos = silosPonderados();
  const comunes = comunesAsignados();
  return `<div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,1fr);gap:14px;align-items:start">
    <section class="box" style="min-width:0">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Silos de almacenamiento</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:10px;max-height:640px;overflow:auto;padding-right:4px">${silos.map(s => {
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
      <div style="max-height:540px;overflow:auto">${comunes.map(c => {
        const cl = clasificar(c);
        return `<div class="card" style="padding:10px;margin-bottom:8px;border-left:3px solid ${cl.color}">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
            <div class="mono" style="color:var(--blue-light);font-weight:900">${esc(c.codigo || c.id)} · ${esc(c.siloId)}</div>
            <button class="icon-btn" data-silo-calc="${esc(c.siloId)}">Calculo</button>
          </div>
          <div style="color:var(--txt2);font-size:10px;margin-top:4px">${esc(c.fecha || "-")} · ${esc(c.turno || "Dia")} · ${fmt(c.masa, 2)} t · ${esc(c.fuente || "")}</div>
          <div class="mono" style="font-size:10px;color:var(--txt2);margin-top:4px">Cu ${fmt(c.cu, 3)}% · Mo ${fmt(c.mo, 3)}% · S ${fmt(c.s, 4)}%</div>
          <span class="tag" style="margin-top:6px;background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span>
        </div>`;
      }).join("") || `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px 0">Sin comunes trazables registrados.</div>`}</div>
    </section>
  </div>
  ${siloManualModalHTML(state.siloManualOpen)}
  ${state.siloCalcOpen ? siloCalculoHTML(state.siloCalcOpen) : ""}`;
}

function bindSilos() {
  document.querySelectorAll("[data-silo-fill]").forEach(btn => btn.addEventListener("click", () => {
    state.siloManualOpen = btn.dataset.siloFill;
    render();
  }));
  document.querySelectorAll("[data-silo-calc]").forEach(btn => btn.addEventListener("click", () => {
    state.siloCalcOpen = btn.dataset.siloCalc;
    render();
  }));
  document.querySelectorAll("[data-silo-clear]").forEach(btn => btn.addEventListener("click", () => {
    const siloId = btn.dataset.siloClear;
    if (!confirm(`¿Vaciar comunes manuales de ${siloId}?`)) return;
    state.comunes = state.comunes.filter(c => c.siloId !== siloId);
    save("oxmo:comunes", state.comunes);
    addHist("Silo vaciado", siloId, "Comunes manuales eliminados", C.red);
    render();
  }));
  document.querySelector("#siloManualClose")?.addEventListener("click", () => { state.siloManualOpen = ""; render(); });
  document.querySelector("#siloCalcClose")?.addEventListener("click", () => { state.siloCalcOpen = ""; render(); });
  const form = document.querySelector("#comunForm");
  form?.addEventListener("submit", e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    if (guardarComunManual(data, "manual-silos")) {
      state.siloManualOpen = "";
      render();
    }
  });
}

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
  const l = codigoClaveAnalisis(lote.id);
  const a = codigoClaveAnalisis(analisis.codigo);
  if (!l.norm || !a.norm) return 0;
  if (l.norm === a.norm) return 8;
  if (l.compact === a.compact) return 7;
  if (l.norm.startsWith(`${a.norm}-`) || a.norm.startsWith(`${l.norm}-`)) return 6;
  if (l.year && a.year && l.year === a.year) {
    const sameNumericPath = l.nums.length && a.nums.length && l.nums.join(".") === a.nums.join(".");
    if (sameNumericPath) return 6;
    if (l.serial && a.serial && l.serial === a.serial) return 3;
  }
  return 0;
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

function evaluarMezclaObjetivo(items, objetivo, firmas, opciones) {
  if (!items.length || items.some(x => x.kg <= 0)) return;
  const totalKg = items.reduce((a, x) => a + x.kg, 0);
  if (totalKg <= 0 || totalKg > 40000) return;
  if (items.some(x => x.kg > x.lote.masa + 0.001)) return;
  const firma = items
    .map(x => `${x.lote.id}:${Math.round(x.kg)}`)
    .sort()
    .join("|");
  if (firmas.has(firma)) return;
  firmas.add(firma);

  const mix = mezclaDe(items);
  const diffKg = Math.abs(totalKg - objetivo.masa);
  const cuDiff = Math.abs(mix.cu - objetivo.cu);
  const moShort = Math.max(0, objetivo.mo - mix.mo);
  const sOver = Math.max(0, mix.s - objetivo.s);
  const moDiff = Math.abs(mix.mo - objetivo.mo);
  const sDiff = Math.abs(mix.s - objetivo.s);
  const fueraKg = items.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
  const exacta = diffKg < 0.001;
  const cumpleObjetivo = exacta && cuDiff <= 0.035 && moShort <= 0 && sOver <= 0;
  const chemPenalty = (cuDiff * 60000) + (moShort * 7000) + (sOver * 120000) + (moDiff * 55) + (sDiff * 1200);
  const massPenalty = (diffKg / 1000) * 180;
  const classPenalty = cumpleObjetivo ? 0 : 220;
  const score = chemPenalty + massPenalty + classPenalty - (fueraKg / 1000) * 8;
  mix.ok = cumpleObjetivo;
  opciones.push({ items, mix, score, chemPenalty, diffKg, fueraKg, exacta, cumpleObjetivo, cuDiff, moShort, sOver });
}

function buscarMejoresMezclas2() {
  const objetivo = objetivoMezcla();
  const selectedPool = state.lotes
    .filter(l => hasAnalysis(l) && l.estado !== "Pendiente" && Number(l.masa || 0) >= 1000)
    .filter(l => state.mix.sector === "Todos" || l.sector === state.mix.sector);
  const relevancia = l => {
    const c = clasificar(l);
    return Math.abs(Number(l.cu || 0) - objetivo.cu) * 900
      + Math.max(0, objetivo.mo - Number(l.mo || 0)) * 65
      + Math.max(0, Number(l.s || 0) - objetivo.s) * 1600
      - (c.clase === "Fuera Esp" ? 8 : 0);
  };
  const selectedIds = new Set(state.mix.sel || []);
  const selected = selectedPool.filter(l => selectedIds.has(l.id));
  const basePool = selected.length ? selected : selectedPool;
  const pool = [...basePool].sort((a, b) => relevancia(a) - relevancia(b)).slice(0, 22);
  const opciones = [];
  const firmas = new Set();
  const masasObjetivo = [objetivo.masa];
  for (let delta = 1000; delta <= 5000; delta += 1000) {
    if (objetivo.masa - delta >= 1000) masasObjetivo.push(objetivo.masa - delta);
    if (objetivo.masa + delta <= 40000) masasObjetivo.push(objetivo.masa + delta);
  }

  for (const targetKg of masasObjetivo) {
    for (let i = 0; i < pool.length; i++) {
      evaluarMezclaObjetivo([{ lote: pool[i], kg: Math.min(targetKg, pool[i].masa) }], objetivo, firmas, opciones);
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let kgA = 1000; kgA < targetKg; kgA += 1000) {
          evaluarMezclaObjetivo([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: targetKg - kgA }], objetivo, firmas, opciones);
        }
      }
    }
    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        for (let k = j + 1; k < pool.length; k++) {
          for (let kgA = 1000; kgA < targetKg - 1000; kgA += 1000) {
            for (let kgB = 1000; kgB < targetKg - kgA; kgB += 1000) {
              evaluarMezclaObjetivo([
                { lote: pool[i], kg: kgA },
                { lote: pool[j], kg: kgB },
                { lote: pool[k], kg: targetKg - kgA - kgB },
              ], objetivo, firmas, opciones);
            }
          }
        }
      }
    }
  }

  const exactas = opciones.filter(o => o.exacta);
  const base = exactas.length ? exactas : opciones;
  const minCu = base.reduce((m, o) => Math.min(m, o.cuDiff), Infinity);
  const enfocadas = base.filter(o => o.cuDiff <= Math.max(minCu + 0.04, 0.08));
  return enfocadas
    .sort((a, b) =>
      a.cuDiff - b.cuDiff ||
      a.moShort - b.moShort ||
      a.sOver - b.sOver ||
      a.diffKg - b.diffKg ||
      a.chemPenalty - b.chemPenalty ||
      b.fueraKg - a.fueraKg
    )
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

// --- Ajustes finales 2026-06-14: etiquetas autoajustables, Infodia persistente y matriz de mezclas ---
function etiquetaFit(id) {
  const len = String(id || "").length;
  if (len > 28) return { idPt: 12, idMaxMm: 15, qrMm: 25 };
  if (len > 22) return { idPt: 14, idMaxMm: 17, qrMm: 27 };
  if (len > 16) return { idPt: 17, idMaxMm: 19, qrMm: 29 };
  return { idPt: 23, idMaxMm: 22, qrMm: 32 };
}

function etiquetaCSS(publicMode = false) {
  return `<style>
    @page{size:100mm 150mm;margin:0}
    *{box-sizing:border-box}
    body{margin:0;background:${publicMode ? "#f4f6f8" : "#eee"};font-family:Arial,Helvetica,sans-serif;color:#111}
    .no-print{position:fixed;right:12px;top:12px;z-index:5}.no-print button{font-weight:900;font-size:13px;padding:8px 12px}
    .public-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:10px}
    .label-page{width:100mm;height:150mm;page-break-after:always;display:flex;align-items:center;justify-content:center;padding:3.5mm;background:#fff}
    .label{width:92mm;height:142mm;border:1.2mm solid #111;border-radius:3mm;padding:5mm;display:flex;flex-direction:column;overflow:hidden;background:#fff}
    .top{display:grid;grid-template-columns:39mm 1fr;gap:3mm;align-items:start;border-bottom:.45mm solid #111;padding-bottom:3mm;flex:0 0 auto}
    .logo{width:36mm;max-height:20mm;object-fit:contain;object-position:left center}
    .brand{text-align:right}.brand b{font-size:11pt;letter-spacing:2.2pt}.brand small{display:block;font-size:7pt;margin-top:1.5mm}
    .lot-id{font-family:Consolas,'Courier New',monospace;font-weight:900;line-height:1.05;text-align:center;letter-spacing:.5pt;overflow-wrap:anywhere;word-break:break-word;display:flex;align-items:center;justify-content:center;margin:3mm 0 2.3mm;flex:0 0 auto}
    .class-box{border:.45mm solid var(--accent);color:var(--accent);font-weight:900;text-align:center;border-radius:2mm;font-size:16pt;letter-spacing:.7pt;padding:2.2mm 1mm;margin-bottom:2.7mm;flex:0 0 auto}
    .chem{display:grid;grid-template-columns:1fr 1fr 1fr;gap:2mm;margin-bottom:2.8mm;flex:0 0 auto}
    .cell{border:.35mm solid #222;border-radius:1.4mm;text-align:center;padding:1.8mm 1mm}.cell small{font-size:6.5pt;font-weight:800;display:block}.cell b{font-family:Consolas,'Courier New',monospace;font-size:13.5pt}
    .mass{border:.35mm solid #222;border-radius:1.4mm;text-align:center;padding:2mm 1mm;margin-bottom:1.2mm;flex:0 0 auto}.mass small{font-size:6.5pt;font-weight:800;display:block}.mass b{font-size:12pt}
    .qr{display:block;margin:0 auto 1mm;object-fit:contain;flex:0 0 auto}
    .foot{border-top:.35mm solid #111;text-align:center;font-size:6pt;padding-top:1mm;white-space:nowrap;flex:0 0 auto}
    @media print{body{background:#fff}.no-print{display:none}.label-page{padding:0;margin:0;width:100mm;height:150mm}}
  </style>`;
}

function etiquetaLabelHTML(data, qrUrl) {
  const fit = etiquetaFit(data.id);
  const accent = data.color || clasificar({ cu: parseNum(data.cu), mo: parseNum(data.mo), s: parseNum(data.s) }).color || "#c87333";
  const qr = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(qrUrl)}&qzone=1`;
  return `<section class="label-page">
    <div class="label" style="--accent:${accent}">
      <div class="top">
        <img class="logo" src="./molyb-logo.webp" alt="Molyb">
        <div class="brand"><b>OXMO CONTROL</b><small>${esc(data.fecha || hoy())}</small></div>
      </div>
      <div class="lot-id" style="font-size:${fit.idPt}pt;max-height:${fit.idMaxMm}mm">${esc(data.id || "SIN ID")}</div>
      <div class="class-box">${esc(String(data.mat || "SIN CLASIFICAR").toUpperCase())}</div>
      <div class="chem">
        <div class="cell"><small>CU</small><b>${esc(data.cu || "-")}%</b></div>
        <div class="cell"><small>MO</small><b>${esc(data.mo || "-")}%</b></div>
        <div class="cell"><small>S</small><b>${esc(data.s || "-")}%</b></div>
      </div>
      <div class="mass"><small>MASA</small><b>${esc(data.masa || "-")}</b></div>
      <img class="qr" style="width:${fit.qrMm}mm;height:${fit.qrMm}mm" src="${qr}" alt="QR ${esc(data.id)}">
      <div class="foot">Zebra ZT230 - Etiqueta 100 x 150 mm - 300 dpi</div>
    </div>
  </section>`;
}

function etiquetaPublicaHTML(data) {
  if (!data || !data.id) return `<style>body{font-family:Arial;background:#f4f6f8;padding:30px}</style><h1>Etiqueta no encontrada</h1><p>El QR no trae datos suficientes para reconstruir la etiqueta.</p>`;
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
      cu: l.cu ? fmt(l.cu, 3).replace(/\.?0+$/, "") : "-",
      mo: l.mo ? fmt(l.mo, 3).replace(/\.?0+$/, "") : "-",
      s: l.s ? fmt(l.s, 4).replace(/\.?0+$/, "") : "-",
      fecha: l.fecha || hoy(),
    };
    const labelParams = new URLSearchParams(data);
    const qrUrl = `${PUBLIC_APP_URL}etiqueta.html?${labelParams.toString()}`;
    return etiquetaLabelHTML(data, qrUrl);
  }).join("");
  const w = window.open("", "_blank");
  if (!w) { alert("Permite ventanas emergentes para abrir la vista previa de etiquetas."); return; }
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Etiquetas OXMO</title>${etiquetaCSS()}</head><body><div class="no-print"><button onclick="window.print()">Imprimir / guardar PDF</button></div>${items}</body></html>`);
  w.document.close();
}

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
        <div><label>Contraseña visible</label><input class="input" data-keep-case="true" data-admin-edit-pass type="text" value="${esc(user.p)}"></div>
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
        <label>Contraseña visible</label><input id="newUserPass" data-keep-case="true" type="text" class="input" placeholder="Contraseña inicial">
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

function etiquetaFit(id) {
  const len = String(id || "").length;
  if (len > 28) return { idPt: 14, idMaxMm: 12, qrMm: 25 };
  if (len > 22) return { idPt: 16, idMaxMm: 13, qrMm: 27 };
  if (len > 16) return { idPt: 18, idMaxMm: 14, qrMm: 28 };
  return { idPt: 22, idMaxMm: 15, qrMm: 31 };
}

function etiquetaCSS(publicMode = false) {
  return `<style>
    @page{size:100mm 150mm;margin:0}
    *{box-sizing:border-box}
    body{margin:0;background:${publicMode ? "#fff" : "#eee"};font-family:Arial,Helvetica,sans-serif;color:#000}
    .toolbar{position:fixed;right:8mm;top:6mm;z-index:10}.toolbar button{font-weight:900;font-size:14px;padding:8px 14px;border:2px solid #111;background:#fff;cursor:pointer}
    .sheet{width:100mm;height:150mm;padding:2mm;margin:${publicMode ? "0" : "10mm auto"};background:#fff;page-break-after:always}
    .label{width:96mm;height:146mm;border:1.2mm solid #111;border-radius:3mm;padding:3.4mm 5mm 2.4mm;display:flex;flex-direction:column;overflow:hidden}
    .top{display:flex;justify-content:space-between;align-items:flex-start;gap:4mm}
    .logo{width:38mm;max-height:14mm;object-fit:contain;object-position:left center}
    .brand{text-align:right;font-weight:900;letter-spacing:2px;font-size:14px;line-height:1.15}.date{font-size:8px;font-weight:400;letter-spacing:0;margin-top:2mm}
    .line{border-top:0.45mm solid #111;margin:3mm 0 2.2mm}
    .lot{text-align:center;font-family:Consolas,monospace;font-weight:900;line-height:1;margin:1mm auto 1.8mm;max-width:84mm;overflow-wrap:anywhere;word-break:break-word}
    .class{border:0.45mm solid var(--accent);color:var(--accent);border-radius:1.8mm;text-align:center;font-weight:900;font-size:22px;letter-spacing:1px;padding:1.4mm;margin-bottom:2.4mm}
    .chem{display:grid;grid-template-columns:repeat(3,1fr);gap:1.7mm;margin-bottom:2.3mm}.cell{border:0.35mm solid #111;border-radius:1.4mm;text-align:center;padding:1.2mm .8mm}.k{font-size:8px;font-weight:900}.v{font-family:Consolas,monospace;font-size:16px;font-weight:900;margin-top:.6mm}
    .mass{border:0.35mm solid #111;border-radius:1.4mm;text-align:center;padding:1.3mm;margin-bottom:1.2mm}.mass .v{font-size:15px;margin-top:.5mm}
    .qr{display:block;margin:0 auto 1mm;width:var(--qr);height:var(--qr);image-rendering:pixelated;flex-shrink:0}
    .foot{border-top:0.35mm solid #111;text-align:center;font-size:6px;padding-top:.7mm;margin-top:0}
    @media print{body{background:#fff}.toolbar{display:none}.sheet{margin:0;box-shadow:none}}
  </style>`;
}

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

/* Área / célula de trabajo: base para centros independientes y totalizado gerencial */
function areaTrabajoDefault() { return "General"; }
function areaTrabajoUsuario(user = state.user) {
  return String(user?.area || user?.areaCelula || "").trim() || areaTrabajoDefault();
}
function areaTrabajoCatalogo() {
  const areas = [areaTrabajoDefault(), ...(state.usuarios || []).map(u => normalizarUsuario(u).area).filter(Boolean)];
  return [...new Set(areas)].sort((a, b) => a.localeCompare(b, "es"));
}
function areaTrabajoOptionsHTML(selected = "") {
  const sel = String(selected || "").trim() || areaTrabajoDefault();
  const options = areaTrabajoCatalogo();
  if (sel && !options.includes(sel)) options.push(sel);
  return options.map(a => `<option value="${esc(a)}" ${a === sel ? "selected" : ""}>${esc(a)}</option>`).join("") + `<option value="__add__">+ Añadir área / célula...</option>`;
}
function areaTrabajoEsGlobal(user = state.user) {
  return isAdmin(user) || isGerente(user);
}
function areaTrabajoLote(lote = {}) {
  const explicit = String(lote.areaCelula || lote.area || "").trim();
  if (explicit) return explicit;
  const creador = (state.usuarios || []).map(normalizarUsuario).find(u => u.u === String(lote.createdBy || "").trim().toLowerCase());
  return areaTrabajoUsuario(creador);
}
function lotesPorAreaTrabajo(lotes = state.lotes, user = state.user) {
  if (areaTrabajoEsGlobal(user)) return lotes || [];
  const area = areaTrabajoUsuario(user);
  return (lotes || []).filter(l => areaTrabajoLote(l) === area);
}

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
        <div class="field"><label>Contraseña visible</label><input class="input" data-keep-case="true" data-admin-edit-pass type="text" value="${esc(user.p)}"></div>
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
        <div class="field"><label>Contraseña visible</label><input id="newUserPass" data-keep-case="true" type="text" class="input" placeholder="Contraseña inicial"></div>
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
      p: document.querySelector("[data-admin-edit-pass]")?.value || "",
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

syncInventarioACP();
repararIdsLotesManuales();
if (state.infodia) state.infodia = compactInfodiaFinal(state.infodia);
render();
initCloud().then(() => setTimeout(resyncCloudSnapshotFinal, 1200));


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

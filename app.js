const C = {
  blue: "#1E6FD9", blueLight: "#3A8EF5", cyan: "#00D4FF",
  green: "#00E5A0", copper: "#C87533", yellow: "#FFB800", red: "#FF4560",
  txt2: "#6A8FAF", txt3: "#2D4A6A"
};

const DEFAULT_USUARIOS = [
  { u: "admin", p: "oxmo2024", rol: "Administrador", nombre: "Administrador" },
  { u: "operador", p: "turno123", rol: "Operador", nombre: "Operador Turno" },
  { u: "encargado", p: "super456", rol: "Encargado", nombre: "Encargado Planta" },
];
const USUARIOS = DEFAULT_USUARIOS;
const ROLES_USUARIO = ["Operador", "Encargado", "Jefe de turno", "Jefe de planta", "Superintendente", "Gerente", "Administrador"];

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
  agenda: load("oxmo:agenda", {}),
  agendaMonth: load("oxmo:agendaMonth", `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`),
  agendaDay: load("oxmo:agendaDay", ""),
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
if (state.user) {
  state.user = normalizarUsuario(state.user);
  save("oxmo:user", state.user);
}
function canonicalRoleName(rol) {
  const raw = String(rol || "Operador").trim();
  if (!raw) return "Operador";
  const map = {
    "Supervisor": "Encargado",
    "supervisor": "Encargado",
    "Super intendente": "Superintendente",
    "super intendente": "Superintendente"
  };
  return map[raw] || raw;
}

function normalizeAgendaEntry(value) {
  if (!value) return { mode: "nota", note: "", tasks: [] };
  if (typeof value === "string") return { mode: "nota", note: value, tasks: [] };
  const legacyType = value.type === "tarea" ? "tarea" : value.type === "nota" ? "nota" : "";
  const mode = value.mode === "tarea" || legacyType === "tarea" ? "tarea" : "nota";
  let note = String(value.note || "");
  let tasks = Array.isArray(value.tasks) ? value.tasks : [];
  if (!note && legacyType === "nota" && value.text) note = String(value.text || "");
  if (!tasks.length && legacyType === "tarea" && value.text) {
    tasks = [{ id: "legacy-0", text: String(value.text || ""), done: Boolean(value.done) }];
  }
  tasks = tasks
    .map((t, i) => ({
      id: String(t?.id || `t-${i}`),
      text: String(t?.text || "").trim(),
      done: Boolean(t?.done)
    }))
    .filter(t => t.text);
  return { mode, note, tasks };
}
function agendaEntryHasContent(entry) {
  const e = normalizeAgendaEntry(entry);
  return Boolean(e.note.trim() || e.tasks.length);
}
function saveAgendaEntry(key, entry) {
  const clean = normalizeAgendaEntry(entry);
  if (agendaEntryHasContent(clean)) state.agenda[key] = clean;
  else delete state.agenda[key];
  save("oxmo:agenda", state.agenda);
}

function normalizarUsuario(u) {
  return {
    u: String(u?.u || "").trim().toLowerCase(),
    p: String(u?.p || ""),
    rol: canonicalRoleName(u?.rol || "Operador"),
    nombre: u?.nombre || u?.u || "Usuario",
    cargo: u?.cargo || "",
    area: u?.area || "",
    turno: u?.turno || "",
    telefono: u?.telefono || "",
    correo: u?.correo || "",
    direccion: u?.direccion || "",
    emergenciaNombre: u?.emergenciaNombre || "",
    emergenciaTelefono: u?.emergenciaTelefono || "",
    observaciones: u?.observaciones || "",
    activo: u?.activo !== false,
    creado: u?.creado || hoy(),
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
  if (key === "oxmo:infodia") state.infodia = value || null;
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
  return ["Supervisor", "Encargado"].includes(canonicalRoleName(user?.rol));
}
function isOperator(user = state.user) {
  return user?.rol === "Operador";
}
function canViewTab(id, user = state.user) {
  if (!user) return false;
  if (HIDDEN_TABS.has(id)) return false;
  if (isAdmin(user)) return true;
  if (isOperator(user)) return ["inventario", "registro", "lotesOxmo", "alertas", "avisos", "perfil"].includes(id);
  if (isSupervisor(user)) return ["inventario", "silos", "lotesOxmo", "mezclas", "reportes", "alertas", "avisos", "infodia", "perfil"].includes(id);
  return ["inventario", "silos", "lotesOxmo", "mezclas", "reportes", "alertas", "perfil"].includes(id);
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
    ["perfil", "Mi perfil"],
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
  const kpiCards = [
    kpi("Masa Disponible", masaDisp / 1000, "t", `${disp.length} lotes`, C.green, "INV", 2),
    kpi("Masa sin análisis", pend.reduce((a, l) => a + l.masa, 0) / 1000, "t", `${pend.length} lotes`, C.yellow, "LAB", 2),
    kpi("Fino Mo Total", finoMoKg / 1000, "t", "todos los analizados", C.copper, "◆", 2),
    kpi("Cu Promedio", cuProm, "%", "ponderado por masa", C.cyan, "CU", 2),
    kpi("Mo fino BC", state.lotes.filter(l => l.clasificacion === "Bajo Cobre" && l.mo > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0) / 1000, "t", "material Bajo Cobre", C.green, "BC", 2),
    kpi("Mo fino Alto Cu", state.lotes.filter(l => l.clasificacion === "Alto Cobre" && l.mo > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0) / 1000, "t", "material Alto Cobre", C.copper, "AC", 2),
    kpi("Mo fino Fuera Esp.", state.lotes.filter(l => l.estado === "Fuera Esp" && l.mo > 0).reduce((a, l) => a + (Number(l.masa || 0) * Number(l.mo || 0) / 100), 0) / 1000, "t", "material fuera de especificación", C.red, "FE", 2),
    kpi("Total Lotes", state.lotes.length, "", "según área/filtro", C.blue, "LOT", 0),
    kpi("Fuera Esp.", fuera.length, "", "lotes afectados", C.red, "!", 0)
  ];
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
        <div class="top-user-role">${esc(canonicalRoleName(state.user.rol).toUpperCase())}</div>
        <div class="top-user-name">${esc(state.user.nombre)}</div>
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
    <div class="status">${fuera.length ? `⚠ ${fuera.length} lote(s) fuera de especificación` : "Estado normal"} · Área: ${esc(state.areaFiltro || state.user.area || "Envase")} · Masa disponible con análisis: ${kgToTon(masaDisp)} · ${pend.length} sin análisis · Lotes totales: ${state.lotes.length}</div>
    <main class="main">
      <section class="dashboard-top">
        <section class="kpis kpis-dashboard">${kpiCards.join("")}</section>
        ${agendaCardHTML()}
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
      <span>OXMO CONTROL v1.1 · ${esc(state.user.nombre)} (${esc(canonicalRoleName(state.user.rol))}) · ${state.historial.length} eventos</span>
      <span>DATOS PERSISTENTES · SGI COMPATIBLE</span>
    </footer>
    ${state.cloudPanel ? cloudPanelHTML() : ""}
  `;
}
function kpi(label, value, unit, sub, color, icon, dec = 0) {
  const shown = typeof value === "number" ? value.toFixed(dec) : value;
  return `<div class="kpi" style="--accent:${color}"><div class="icon">${icon}</div><div class="kpi-label">${label}</div><div class="kpi-value">${shown}</div><div class="kpi-sub">${unit} · ${sub}</div></div>`;
}
function agendaMonthLabel(monthKey) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), (month || 1) - 1, 1);
  return date.toLocaleDateString("es-CL", { month: "long", year: "numeric" });
}
function shiftAgendaMonth(monthKey, delta) {
  const [year, month] = String(monthKey || "").split("-").map(Number);
  const date = new Date(year || new Date().getFullYear(), ((month || 1) - 1) + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function agendaCardHTML() {
  const monthKey = state.agendaMonth || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const [year, month] = monthKey.split("-").map(Number);
  const first = new Date(year, month - 1, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month, 0).getDate();
  const todayKey = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(new Date().getDate()).padStart(2, "0")}`;
  const activeDay = state.agendaDay && state.agendaDay.startsWith(monthKey) ? state.agendaDay : "";
  const entry = normalizeAgendaEntry(activeDay ? state.agenda[activeDay] : null);
  const weekdays = ["L", "M", "M", "J", "V", "S", "D"].map(d => `<span>${d}</span>`).join("");
  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push('<button class="agenda-day empty" type="button" disabled></button>');
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${monthKey}-${String(day).padStart(2, "0")}`;
    const item = normalizeAgendaEntry(state.agenda[key]);
    const classes = ["agenda-day"];
    const hasPendingTasks = item.tasks.some(t => !t.done);
    const hasDoneTasks = item.tasks.length && item.tasks.every(t => t.done);
    if (key === todayKey) classes.push("today");
    if (key === activeDay) classes.push("selected");
    if (item.note) classes.push("has-note");
    if (hasPendingTasks) classes.push("task-pending");
    if (hasDoneTasks) classes.push("task-done");
    const title = item.note || (item.tasks.length ? `${item.tasks.filter(t => t.done).length}/${item.tasks.length} tareas hechas` : "Agregar nota o tarea");
    cells.push(`<button class="${classes.join(" ")}" type="button" data-agenda-day="${key}" title="${esc(title)}"><span>${day}</span></button>`);
  }
  while (cells.length % 7 !== 0) cells.push('<button class="agenda-day empty" type="button" disabled></button>');
  const taskList = entry.tasks.length ? entry.tasks.map(t => `
    <div class="agenda-task ${t.done ? "done" : ""}">
      <button class="agenda-task-check" type="button" data-agenda-task-toggle="${esc(t.id)}">${t.done ? "✓" : ""}</button>
      <button class="agenda-task-text" type="button" data-agenda-task-toggle="${esc(t.id)}">${esc(t.text)}</button>
      <button class="agenda-task-del" type="button" data-agenda-task-del="${esc(t.id)}">×</button>
    </div>`).join("") : `<div class="agenda-help">No hay tareas para este día.</div>`;
  return `<aside class="agenda-panel">
    <div class="agenda-header">
      <div>
        <div class="kpi-label">Agenda</div>
        <div class="agenda-month">${esc(agendaMonthLabel(monthKey))}</div>
      </div>
      <div class="agenda-nav">
        <button class="icon-btn" type="button" data-agenda-nav="prev">‹</button>
        <button class="icon-btn" type="button" data-agenda-nav="next">›</button>
      </div>
    </div>
    <div class="agenda-weekdays">${weekdays}</div>
    <div class="agenda-grid">${cells.join("")}</div>
    <div class="agenda-editor compact">
      ${activeDay ? `
        <div class="agenda-editor-title">${esc(new Date(activeDay + 'T00:00:00').toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long' }))}</div>
        <div class="agenda-type-row">
          <button class="chip ${entry.mode === "nota" ? "active" : ""}" type="button" data-agenda-mode="nota">Nota</button>
          <button class="chip ${entry.mode === "tarea" ? "active" : ""}" type="button" data-agenda-mode="tarea">Tarea</button>
        </div>
        ${entry.mode === "tarea" ? `
          <div class="agenda-task-input-row">
            <input id="agendaTaskInput" class="agenda-task-input" placeholder="Agregar tarea para este día" />
            <button class="btn" type="button" id="agendaAddTaskBtn">Agregar</button>
          </div>
          <div class="agenda-task-list">${taskList}</div>
        ` : `
          <textarea id="agendaNoteInput" class="agenda-note-input" rows="3" placeholder="Escribe una nota para el día seleccionado">${esc(entry.note)}</textarea>
          <div class="agenda-editor-actions">
            <button class="btn" type="button" id="agendaSaveBtn">Guardar nota</button>
            <button class="btn secondary" type="button" id="agendaClearBtn" ${entry.note ? "" : "disabled"}>Limpiar nota</button>
          </div>
        `}
      ` : `<div class="agenda-help">Selecciona un día para agregar una nota o tarea.</div>`}
    </div>
  </aside>`;
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
  document.querySelectorAll("[data-agenda-nav]").forEach(btn => btn.addEventListener("click", () => {
    state.agendaMonth = shiftAgendaMonth(state.agendaMonth, btn.dataset.agendaNav === "prev" ? -1 : 1);
    save("oxmo:agendaMonth", state.agendaMonth);
    if (state.agendaDay && !state.agendaDay.startsWith(state.agendaMonth)) {
      state.agendaDay = "";
      save("oxmo:agendaDay", state.agendaDay);
    }
    render();
  }));
  document.querySelectorAll("[data-agenda-day]").forEach(btn => btn.addEventListener("click", () => {
    state.agendaDay = btn.dataset.agendaDay;
    save("oxmo:agendaDay", state.agendaDay);
    render();
  }));
  document.querySelectorAll("[data-agenda-mode]").forEach(btn => btn.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    entry.mode = btn.dataset.agendaMode === "tarea" ? "tarea" : "nota";
    state.agenda[key] = entry;
    save("oxmo:agenda", state.agenda);
    render();
  }));
  document.querySelector("#agendaSaveBtn")?.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    entry.mode = "nota";
    entry.note = document.querySelector("#agendaNoteInput")?.value?.trim() || "";
    saveAgendaEntry(key, entry);
    render();
  });
  document.querySelector("#agendaClearBtn")?.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    entry.note = "";
    saveAgendaEntry(key, entry);
    render();
  });
  document.querySelector("#agendaAddTaskBtn")?.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const input = document.querySelector("#agendaTaskInput");
    const value = input?.value?.trim() || "";
    if (!value) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    entry.mode = "tarea";
    entry.tasks.push({ id: `t-${Date.now()}-${Math.random().toString(16).slice(2)}`, text: value, done: false });
    saveAgendaEntry(key, entry);
    render();
  });
  document.querySelector("#agendaTaskInput")?.addEventListener("keydown", e => {
    if (e.key === "Enter") document.querySelector("#agendaAddTaskBtn")?.click();
  });
  document.querySelectorAll("[data-agenda-task-toggle]").forEach(btn => btn.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    const task = entry.tasks.find(t => t.id === btn.dataset.agendaTaskToggle);
    if (task) task.done = !task.done;
    saveAgendaEntry(key, entry);
    render();
  }));
  document.querySelectorAll("[data-agenda-task-del]").forEach(btn => btn.addEventListener("click", () => {
    const key = state.agendaDay;
    if (!key) return;
    const entry = normalizeAgendaEntry(state.agenda[key]);
    entry.tasks = entry.tasks.filter(t => t.id !== btn.dataset.agendaTaskDel);
    saveAgendaEntry(key, entry);
    render();
  }));
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
  if (state.tab === "perfil") return perfilHTML();
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
  if (state.tab === "perfil") bindPerfil();
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
    ${state.adminEditUser ? adminUserModalHTML(state.adminEditUser) : ""}
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
            <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Cargo / Área</th><th>Contacto</th><th>Estado</th><th>Último uso</th><th>Control</th></tr></thead>
            <tbody>${rows.map(({u, stat}) => `<tr>
              <td class="mono" style="color:var(--blue-light);font-weight:900">${esc(u.u)}</td>
              <td>${esc(u.nombre)}</td>
              <td>${esc(u.rol)}</td>
              <td style="color:var(--txt2);font-size:11px">${esc(u.cargo || "-")} ${u.area ? `· ${esc(u.area)}` : ""}</td>
              <td style="color:var(--txt2);font-size:11px">${esc(u.telefono || "-")} ${u.correo ? `<br>${esc(u.correo)}` : ""}</td>
              <td style="color:${u.activo !== false ? C.green : C.red}">● ${u.activo !== false ? "Activo" : "Inactivo"}</td>
              <td style="color:var(--txt2)">${esc(stat.lastSeen || "-")}</td>
              <td><div class="mini-actions">
                <button class="icon-btn" data-edit-user="${esc(u.u)}">Editar</button>
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
function userFieldsHTML(u, { admin = false } = {}) {
  const usuarioReadonly = admin ? "" : "readonly";
  const passPlaceholder = admin ? "Nueva contraseña o dejar igual" : "Dejar en blanco para mantener";
  return `
    <div class="form-grid">
      <div class="field"><label>Usuario</label><input name="u" value="${esc(u.u || "")}" ${usuarioReadonly}></div>
      <div class="field"><label>Nombre visible</label><input name="nombre" value="${esc(u.nombre || "")}" required></div>
      ${admin ? `<div class="field"><label>Contraseña</label><input name="p" type="password" placeholder="${passPlaceholder}"></div>${selectField("rol", "Rol", u.rol || "Operador", ROLES_USUARIO)}` : `<div class="field"><label>Contraseña</label><input name="p" type="password" placeholder="${passPlaceholder}"></div><div class="field"><label>Rol</label><input value="${esc(u.rol || "")}" readonly></div>`}
      <div class="field"><label>Cargo</label><input name="cargo" value="${esc(u.cargo || "")}" placeholder="Ej: Operador Envase"></div>
      <div class="field"><label>Área</label><input name="area" value="${esc(u.area || "")}" placeholder="Ej: Envase y Logística"></div>
      <div class="field"><label>Turno</label><input name="turno" value="${esc(u.turno || "")}" placeholder="Ej: Turno A / 7x7"></div>
      <div class="field"><label>Teléfono contacto</label><input name="telefono" value="${esc(u.telefono || "")}" placeholder="Ej: +56 9 1234 5678"></div>
      <div class="field"><label>Correo</label><input name="correo" value="${esc(u.correo || "")}" placeholder="correo@empresa.cl"></div>
      <div class="field"><label>Dirección</label><input name="direccion" value="${esc(u.direccion || "")}" placeholder="Opcional"></div>
      <div class="field"><label>Contacto emergencia</label><input name="emergenciaNombre" value="${esc(u.emergenciaNombre || "")}" placeholder="Nombre contacto"></div>
      <div class="field"><label>Fono emergencia</label><input name="emergenciaTelefono" value="${esc(u.emergenciaTelefono || "")}" placeholder="Teléfono contacto"></div>
      <div class="field span-2"><label>Observaciones</label><textarea name="observaciones" rows="3" placeholder="Alergias, condiciones importantes u observaciones operacionales">${esc(u.observaciones || "")}</textarea></div>
    </div>
  `;
}

function adminUserModalHTML(username) {
  const u = state.usuarios.map(normalizarUsuario).find(x => x.u === username);
  if (!u) return "";
  return `
    <div class="modal-backdrop" id="adminUserModal">
      <section class="cloud-modal" style="width:min(760px,100%);max-height:92vh;overflow:auto">
        <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:14px">
          <div>
            <div class="muted-title" style="color:var(--cyan);margin-bottom:5px">Editar usuario</div>
            <div style="font-size:18px;font-weight:900;color:var(--txt)">${esc(u.nombre)} <span class="mono" style="color:var(--txt3);font-size:12px">${esc(u.u)}</span></div>
          </div>
          <button class="icon-btn" id="closeAdminUserModal">✕</button>
        </div>
        <form id="adminEditUserForm">
          ${userFieldsHTML(u, { admin: true })}
          <div class="cloud-actions">
            <button class="btn" type="submit">GUARDAR CAMBIOS</button>
            <button class="btn secondary" type="button" id="cancelAdminUserModal">Cancelar</button>
          </div>
        </form>
      </section>
    </div>
  `;
}

function perfilHTML() {
  const u = normalizarUsuario(state.usuarios.find(x => x.u === userKey()) || state.user || {});
  return `
    <div class="box" style="max-width:920px;margin:0 auto">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:16px">
        <div>
          <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Mi perfil</div>
          <div style="font-size:20px;font-weight:900;color:var(--txt)">${esc(u.nombre)}</div>
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">Completa tus datos de contacto y emergencia. El administrador puede ver esta información para gestión operacional.</div>
        </div>
        <span class="tag" style="background:#0f3a6e;color:var(--blue-light);border-color:#1e6fd955">${esc(u.rol)}</span>
      </div>
      <form id="perfilForm">
        ${userFieldsHTML(u, { admin: false })}
        <button class="btn" style="width:100%;margin-top:10px">GUARDAR MI INFORMACIÓN</button>
      </form>
    </div>
  `;
}

function collectUserForm(form, original, { admin = false } = {}) {
  const data = Object.fromEntries(new FormData(form).entries());
  const next = {
    ...original,
    nombre: String(data.nombre || "").trim(),
    cargo: String(data.cargo || "").trim(),
    area: String(data.area || "").trim(),
    turno: String(data.turno || "").trim(),
    telefono: String(data.telefono || "").trim(),
    correo: String(data.correo || "").trim(),
    direccion: String(data.direccion || "").trim(),
    emergenciaNombre: String(data.emergenciaNombre || "").trim(),
    emergenciaTelefono: String(data.emergenciaTelefono || "").trim(),
    observaciones: String(data.observaciones || "").trim(),
  };
  if (admin) {
    next.u = String(data.u || "").trim().toLowerCase();
    next.rol = data.rol || original.rol || "Operador";
    if (String(data.p || "").trim()) next.p = String(data.p).trim();
  } else if (String(data.p || "").trim()) {
    next.p = String(data.p).trim();
  }
  return normalizarUsuario(next);
}

function savePerfilUsuario(next) {
  const original = userKey();
  state.usuarios = state.usuarios.map(x => x.u === original ? next : x);
  state.user = next;
  saveUsuarios();
  save("oxmo:user", state.user);
  addHist("Perfil actualizado", next.u, "Datos de contacto actualizados", C.cyan);
}

function bindPerfil() {
  const form = document.querySelector("#perfilForm");
  if (!form) return;
  form.addEventListener("submit", e => {
    e.preventDefault();
    const original = normalizarUsuario(state.usuarios.find(x => x.u === userKey()) || state.user || {});
    const next = collectUserForm(form, original, { admin: false });
    if (!next.nombre) { alert("El nombre visible no puede quedar vacío."); return; }
    savePerfilUsuario(next);
    alert("Información de perfil guardada.");
    render();
  });
}

function bindAdmin() {
  document.querySelectorAll("[data-admin-view]").forEach(btn => btn.addEventListener("click", () => {
    state.adminView = btn.dataset.adminView;
    render();
  }));
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
    state.adminEditUser = btn.dataset.editUser;
    render();
  }));
  document.querySelector("#closeAdminUserModal")?.addEventListener("click", () => { state.adminEditUser = null; render(); });
  document.querySelector("#cancelAdminUserModal")?.addEventListener("click", () => { state.adminEditUser = null; render(); });
  document.querySelector("#adminUserModal")?.addEventListener("click", e => {
    if (e.target?.id === "adminUserModal") { state.adminEditUser = null; render(); }
  });
  document.querySelector("#adminEditUserForm")?.addEventListener("submit", e => {
    e.preventDefault();
    const originalKey = state.adminEditUser;
    const actual = normalizarUsuario(state.usuarios.find(x => x.u === originalKey));
    if (!actual?.u) return;
    const next = collectUserForm(e.currentTarget, actual, { admin: true });
    if (!/^[a-z0-9._-]{3,24}$/.test(next.u)) {
      alert("El usuario debe tener 3 a 24 caracteres: letras, números, punto, guion o guion bajo.");
      return;
    }
    if (!next.nombre) { alert("El nombre visible no puede quedar vacío."); return; }
    if (next.u !== originalKey && state.usuarios.some(x => x.u === next.u)) {
      alert("Ese usuario ya existe.");
      return;
    }
    state.usuarios = state.usuarios.map(x => x.u === originalKey ? next : x);
    if (next.u !== originalKey) {
      if (state.userStats[originalKey]) {
        state.userStats[next.u] = { ...(state.userStats[next.u] || {}), ...state.userStats[originalKey] };
        delete state.userStats[originalKey];
      }
      state.lotes = state.lotes.map(l => l.createdBy === originalKey ? { ...l, createdBy: next.u, createdByName: next.nombre } : l);
      state.avisos = (state.avisos || []).map(a => a.autor === originalKey ? { ...a, autor: next.u, autorNombre: next.nombre } : a);
    }
    if (state.user?.u === originalKey) state.user = next;
    saveUsuarios();
    save("oxmo:userStats", state.userStats);
    save("oxmo:lotes", state.lotes);
    save("oxmo:avisos", state.avisos || []);
    save("oxmo:user", state.user);
    addHist("Cuenta editada", next.u, `${next.nombre} (${next.rol})`, C.cyan);
    state.adminEditUser = null;
    render();
  });
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
          <div style="color:var(--txt2);font-size:12px;margin-top:6px">El operador informa condiciones relevantes. Encargado y administrador pueden revisar el historial.</div>
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
  return `<style>
    html, body { margin: 0; min-height: 100%; background: #eceff3; font-family: Arial, sans-serif; color: #111; }
    .public-wrap { min-height: 100vh; display: grid; place-items: center; padding: 18px; }
    .label-page { width: 100mm; height: 150mm; padding: 4mm; background: #fff; box-shadow: 0 12px 34px #0003; overflow: hidden; }
    .label { width: 92mm; height: 142mm; border: 1mm solid #111; border-radius: 3mm; padding: 4.5mm; display: flex; flex-direction: column; overflow: hidden; box-sizing: border-box; }
    .label * { box-sizing: border-box; }
    header { display: flex; justify-content: space-between; gap: 4mm; align-items: flex-start; border-bottom: .45mm solid #111; padding-bottom: 2.5mm; }
    header img { width: 28mm; height: auto; object-fit: contain; }
    .system { font-size: 9pt; font-weight: 900; letter-spacing: 1.2pt; text-align: right; }
    .date { font-size: 7pt; color: #555; text-align: right; margin-top: 1mm; }
    main { flex: 1; display: flex; flex-direction: column; align-items: stretch; padding-top: 3mm; min-height: 0; }
    .lot-id { font-family: Consolas, monospace; font-size: 24pt; font-weight: 900; text-align: center; line-height: 1; margin-bottom: 2.5mm; }
    .material { border: .55mm solid ${esc(color)}; color: ${esc(color)}; border-radius: 2mm; padding: 2mm; font-size: 14pt; font-weight: 900; text-align: center; margin-bottom: 3mm; }
    .chem { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; margin-bottom: 3mm; }
    .chem div, .meta div { border: .35mm solid #222; border-radius: 1.5mm; padding: 1.8mm; text-align: center; }
    .chem b, .meta b { display: block; font-size: 7pt; text-transform: uppercase; color: #555; margin-bottom: 1mm; }
    .chem span { font-family: Consolas, monospace; font-size: 14pt; font-weight: 900; }
    .meta { display: grid; grid-template-columns: 1fr; gap: 2mm; margin-bottom: 3mm; }
    .meta span { font-size: 10pt; font-weight: 800; }
    .qr { width: 34mm; height: 34mm; align-self: center; image-rendering: pixelated; margin-top: 1mm; flex: 0 0 auto; }
    footer { border-top: .35mm solid #111; margin-top: auto; padding-top: 1.5mm; font-size: 6pt; text-align: center; color: #555; }
    @media print { @page { size: 100mm 150mm; margin: 0; } body { background: #fff; } .public-wrap { padding: 0; display: block; } .label-page { box-shadow: none; } }
  </style>
  <div class="public-wrap">
    <section class="label-page">
      <div class="label">
        <header>
          <img src="./molyb-logo.jpg" alt="Molyb" />
          <div>
            <div class="system">OXMO CONTROL</div>
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
          <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${qrData}" alt="QR ${esc(data.lote)}" />
        </main>
        <footer>Copia digital etiqueta OXMO - Zebra ZT230 - 100 x 150 mm</footer>
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
    const chem = hasAnalysis(l)
      ? `<div class="chem"><div><b>Cu</b><span>${fmt(l.cu, 2)}%</span></div><div><b>Mo</b><span>${fmt(l.mo, 2)}%</span></div><div><b>S</b><span>${fmt(l.s, 3)}%</span></div></div>`
      : `<div class="pending">SIN ANALISIS</div>`;
    return `<section class="label-page">
      <div class="label">
        <header>
          <img src="./molyb-logo.jpg" alt="Molyb" />
          <div>
            <div class="system">OXMO CONTROL</div>
            <div class="date">${esc(l.fecha || hoy())}</div>
          </div>
        </header>
        <main>
          <div class="lot-id">${esc(l.id)}</div>
          <div class="material" style="border-color:${c.color};color:${c.color}">${esc(c.clase.toUpperCase())}</div>
          ${chem}
          <div class="meta">
            <div><b>Masa</b><span>${kgToTon(l.masa, 2)}</span></div>
          </div>
          <img class="qr" src="https://api.qrserver.com/v1/create-qr-code/?size=420x420&data=${qrData}" alt="QR ${esc(l.id)}" />
        </main>
        <footer>Zebra ZT230 - Etiqueta 100 x 150 mm - 203 dpi</footer>
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
    html, body { margin: 0; padding: 0; background: #f3f3f3; font-family: Arial, sans-serif; color: #111; }
    .label-page { width: 100mm; height: 150mm; page-break-after: always; padding: 4mm; background: #fff; overflow: hidden; }
    .label { width: 92mm; height: 142mm; border: 1mm solid #111; border-radius: 3mm; padding: 4.5mm; display: flex; flex-direction: column; overflow: hidden; }
    header { display: flex; justify-content: space-between; gap: 4mm; align-items: flex-start; border-bottom: .45mm solid #111; padding-bottom: 2.5mm; }
    header img { width: 28mm; height: auto; object-fit: contain; }
    .system { font-size: 9pt; font-weight: 900; letter-spacing: 1.2pt; text-align: right; }
    .date { font-size: 7pt; color: #555; text-align: right; margin-top: 1mm; }
    main { flex: 1; display: flex; flex-direction: column; align-items: stretch; padding-top: 3mm; min-height: 0; }
    .lot-id { font-family: Consolas, monospace; font-size: 24pt; font-weight: 900; text-align: center; line-height: 1; margin-bottom: 2.5mm; }
    .material { border: .55mm solid; border-radius: 2mm; padding: 2mm; font-size: 14pt; font-weight: 900; text-align: center; margin-bottom: 3mm; }
    .chem { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2mm; margin-bottom: 3mm; }
    .chem div, .meta div { border: .35mm solid #222; border-radius: 1.5mm; padding: 1.8mm; text-align: center; }
    .chem b, .meta b { display: block; font-size: 7pt; text-transform: uppercase; color: #555; margin-bottom: 1mm; }
    .chem span { font-family: Consolas, monospace; font-size: 14pt; font-weight: 900; }
    .pending { border: .5mm solid #222; padding: 3mm; font-size: 14pt; font-weight: 900; text-align: center; margin-bottom: 3mm; }
    .meta { display: grid; grid-template-columns: 1fr; gap: 2mm; margin-bottom: 3mm; }
    .meta span { font-size: 10pt; font-weight: 800; }
    .qr { width: 34mm; height: 34mm; align-self: center; image-rendering: pixelated; margin-top: 1mm; flex: 0 0 auto; }
    footer { border-top: .35mm solid #111; margin-top: auto; padding-top: 1.5mm; font-size: 6pt; text-align: center; color: #555; }
    .no-print { position: fixed; top: 10px; right: 10px; display: flex; gap: 8px; }
    .no-print button { padding: 8px 12px; font-weight: 800; cursor: pointer; }
    @media screen { body { display: grid; place-items: start center; gap: 12px; padding: 16px; } .label-page { box-shadow: 0 8px 30px #0003; } }
    @media print { body { background: #fff; padding: 0; } .no-print { display: none; } .label-page { box-shadow: none; } }
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

function bindInventario() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => { state.filtro = btn.dataset.filter; render(); }));
  document.querySelector("#newLot")?.addEventListener("click", () => { state.editando = null; state.tab = "registro"; render(); });
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

repararIdsLotesManuales();
render();
initCloud();


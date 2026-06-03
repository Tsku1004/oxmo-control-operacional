const C = {
  blue: "#1E6FD9", blueLight: "#3A8EF5", cyan: "#00D4FF",
  green: "#00E5A0", copper: "#C87533", yellow: "#FFB800", red: "#FF4560",
  txt2: "#6A8FAF", txt3: "#2D4A6A"
};

const USUARIOS = [
  { u: "admin", p: "oxmo2024", rol: "Administrador", nombre: "Administrador" },
  { u: "operador", p: "turno123", rol: "Operador", nombre: "Operador Turno" },
  { u: "supervisor", p: "super456", rol: "Supervisor", nombre: "Supervisor Planta" },
];

const LOTES_DEFAULT = [];
const DEFAULT_SECTORES = ["Bodega en transito", "Planta Envase"];
const CLOUD_CONFIG_KEY = "oxmo:supabase";
const DEFAULT_CLOUD_CONFIG = {
  url: "https://obkvneyvgzraxolohmwf.supabase.co",
  anonKey: "sb_publishable_MYJYPjkMBaSbY_9ujIZRhQ_A5Ta7re0",
};
const PUBLIC_APP_URL = "https://oxmo-control-operacional.vercel.app/";
const SHARED_KEYS = new Set(["oxmo:lotes", "oxmo:hist", "oxmo:sectores", "oxmo:silos", "oxmo:comunes", "oxmo:siloNiveles", "oxmo:siloHistorial", "oxmo:infodia"]);
const cloud = { client: null, channel: null, ready: false, applying: false, status: "local", lastError: "", needsLotesCleanup: false };

const DEFAULT_SILOS = Array.from({ length: 8 }, (_, i) => ({
  id: `Silo ${i + 4}`,
  cap: 50,
}));
const SILOS = DEFAULT_SILOS.map(s => ({...s, nivel: 0, den: 1, cu: 0, mo: 0, turno: ""}));

const state = {
  user: load("oxmo:user", null),
  lotes: loadLotes(),
  historial: load("oxmo:hist", [{tiempo:"--:--",accion:"Sistema iniciado",color:C.green,loteId:"",detalle:""}]),
  tab: "inventario",
  filtro: "Todos",
  editando: null,
  sectores: load("oxmo:sectores", DEFAULT_SECTORES),
  silosBase: loadSilos(),
  comunes: load("oxmo:comunes", []),
  siloNiveles: load("oxmo:siloNiveles", {}),
  siloHistorial: load("oxmo:siloHistorial", []),
  infodia: load("oxmo:infodia", null),
  etiquetaFiltro: "Todos",
  etiquetaSel: [],
  reporteHTML: "",
  cloudPanel: false,
  cloudMsg: "",
  mixMsg: "",
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
function loadSilos() {
  const saved = load("oxmo:silos", DEFAULT_SILOS);
  if (!Array.isArray(saved) || saved.length < 8 || saved.some(s => /^S-\d+/.test(s.id || ""))) {
    save("oxmo:silos", DEFAULT_SILOS);
    return structuredClone(DEFAULT_SILOS);
  }
  return saved.map((s, i) => ({ id: s.id || `Silo ${i + 4}`, cap: Number(s.cap || 50) }));
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
  localStorage.setItem(key, JSON.stringify(nextValue));
  if (key === "oxmo:lotes") state.lotes = nextValue || [];
  if (key === "oxmo:hist") state.historial = value || [];
  if (key === "oxmo:sectores") state.sectores = value || DEFAULT_SECTORES;
  if (key === "oxmo:silos") state.silosBase = value || DEFAULT_SILOS;
  if (key === "oxmo:comunes") state.comunes = value || [];
  if (key === "oxmo:siloNiveles") state.siloNiveles = value || {};
  if (key === "oxmo:siloHistorial") state.siloHistorial = value || [];
  if (key === "oxmo:infodia") state.infodia = value || null;
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
  const nums = state.lotes.map(l => parseInt((l.id.split("-")[1] || "0"), 10));
  return `L-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
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
  const masaOperacional = nivelImportado ? Number(nivelImportado.masa || 0) : masa;
  const silo = {
    ...base,
    masa: masaOperacional,
    nivel: nivelImportado ? Number(nivelImportado.nivel || 0) : (base.cap ? Math.min(100, (masa / base.cap) * 100) : 0),
    cu: nivelImportado?.cu ?? weighted("cu"),
    mo: nivelImportado?.mo ?? weighted("mo"),
    s: nivelImportado?.s ?? weighted("s"),
    muestras: comunes.length || (nivelImportado && hasAnalysis(nivelImportado) ? 1 : 0),
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
}
function persistLotes() { save("oxmo:lotes", state.lotes); }

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
          <div class="field"><label>Usuario</label><input id="loginUser" placeholder="admin / operador / supervisor" autocomplete="username"></div>
          <div class="field"><label>Contraseña</label><input id="loginPass" type="password" placeholder="••••••••" autocomplete="current-password"></div>
          <button class="btn" id="loginBtn" style="width:100%">INGRESAR →</button>
          <div class="hint">
            <div style="letter-spacing:2px;margin-bottom:6px">CREDENCIALES DE PRUEBA</div>
            ${USUARIOS.map(x => `<div>${x.u} / ${x.p} <span style="opacity:.65">(${x.rol})</span></div>`).join("")}
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
    const found = USUARIOS.find(x => x.u === u && x.p === p);
    if (!found) {
      document.querySelector("#loginError").innerHTML = `<div class="error">Usuario o contraseña incorrectos</div>`;
      return;
    }
    state.user = found;
    save("oxmo:user", found);
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
      <div class="top-actions">
        <div style="text-align:right">
          <div style="color:var(--txt3);font-size:8px;letter-spacing:2px">${state.user.rol.toUpperCase()}</div>
          <div style="color:var(--blue-light);font-size:11px;font-weight:800">${state.user.nombre}</div>
        </div>
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
        ${kpi("Masa Disponible", masaDisp / 1000, "t", `${disp.length} lotes`, C.green, "📦", 2)}
        ${kpi("Masa Retenida", masaRet / 1000, "t", `${state.lotes.length - disp.length} lotes`, C.red, "🔒", 2)}
        ${kpi("Fino Mo", finoMoKg / 1000, "t", "Masa x %Mo", C.copper, "◆", 2)}
        ${kpi("Cu Promedio", cuProm, "%", "Lotes analizados", C.cyan, "⚗️", 2)}
        ${kpi("Total Lotes", state.lotes.length, "", "Todos los sectores", C.blue, "🗂️", 0)}
        ${kpi("Sin Análisis", pend.length, "", "Pendientes lab", C.yellow, "🔬", 0)}
      </section>
      <nav class="tabs">
        ${[
          ["inventario","📦 Inventario"],["silos","🏭 Silos"],["quimica","⚗️ Química"],["mezclas","⚡ Mezclas"],
          ["siloHistorial","🧾 Historial Silos"],["etiquetas","🏷️ Etiquetas"],["reportes","📋 Reportes"],["alertas","🚨 Alertas"]
        ].map(([id, label]) => `<button class="tab ${state.tab === id ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}
      </nav>
      <div class="filters" style="margin-bottom:12px">
        <button class="pill ${state.tab === "infodia" ? "active" : ""}" data-tab="infodia">Importar Infodia</button>
      </div>
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
    state.user = null;
    save("oxmo:user", null);
    render();
  });
  document.querySelectorAll("[data-tab]").forEach(btn => btn.addEventListener("click", () => {
    state.tab = btn.dataset.tab;
    render();
  }));
  const clock = document.querySelector("#clock");
  setTimeout(() => { if (clock) clock.textContent = new Date().toLocaleTimeString("es-CL"); }, 1000);
  const cloudBtn = document.querySelector("#cloudConfigBtn");
  if (cloudBtn) cloudBtn.addEventListener("click", configureCloud);
  bindCloudPanel();
  bindTab();
}

function tabHTML() {
  if (state.tab === "inventario") return inventarioHTML();
  if (state.tab === "silos") return silosHTML();
  if (state.tab === "quimica") return quimicaHTML();
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
  if (state.tab === "etiquetas") bindEtiquetas();
  if (state.tab === "reportes") bindReportes();
  if (state.tab === "quimica") bindQuimica();
}

function inventarioHTML() {
  const lotes = state.filtro === "Todos" ? state.lotes : state.lotes.filter(l => l.estado === state.filtro);
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
    <td><div class="mini-actions"><button class="icon-btn" data-edit="${l.id}">✏️</button><button class="icon-btn" data-del="${l.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">🗑</button></div></td>
  </tr>`;
}
function bindInventario() {
  document.querySelectorAll("[data-filter]").forEach(btn => btn.addEventListener("click", () => { state.filtro = btn.dataset.filter; render(); }));
  document.querySelector("#newLot").addEventListener("click", () => { state.editando = null; state.tab = "registro"; render(); });
  document.querySelectorAll("[data-edit]").forEach(btn => btn.addEventListener("click", () => { state.editando = state.lotes.find(l => l.id === btn.dataset.edit); state.tab = "registro"; render(); }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
}
function deleteLot(id) {
  if (!confirm(`¿Eliminar ${id}? Esta acción no se puede deshacer.`)) return;
  state.lotes = state.lotes.filter(l => l.id !== id);
  addHist("Lote eliminado", id, "", C.red);
  persistLotes();
  render();
}

function registroHTML() {
  const l = state.editando || {tipo:"Maxisaco",masa:"",sector:DEFAULT_SECTORES[0],fila:0,cu:"",mo:"",s:"",obs:"",estado:"Disponible"};
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
        ${[...state.lotes].reverse().map(x => {
          const c = clasificar(x);
          return `<div class="lot-row" style="--accent:${c.color}">
            <div>
              <div class="mono" style="color:var(--blue-light);font-weight:800">${x.id} <span style="color:var(--txt3);font-size:10px">· ${x.tipo} · ${x.sector}</span></div>
              <div style="color:var(--txt2);font-size:10px;margin-top:2px">${kgToTon(x.masa, 3)} · ${x.fecha}</div>
              <div style="margin-top:3px"><span class="tag" style="background:${c.color}22;color:${c.color};border-color:${c.color}44">${c.clase}</span> <span style="color:${eColor(x.estado)};font-size:10px">● ${x.estado}</span></div>
            </div>
            <div class="mini-actions"><button class="icon-btn" data-copy="${x.id}">📋</button><button class="icon-btn" data-del="${x.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">🗑</button></div>
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
    const masa = Number(data.masa);
    if (!masa || masa <= 0) { alert("Masa inválida"); return; }
    let sector = data.sector;
    if (sector === "Añadir sector...") {
      sector = (data.nuevoSector || "").trim();
      if (!sector) { alert("Ingresa el nombre del nuevo sector"); return; }
      state.sectores = [...new Set([...state.sectores, sector])];
      saveSectores();
    }
    const hasChem = data.cu && data.mo && data.s;
    const lote = {
      id: state.editando ? state.editando.id : nuevoId(),
      tipo: data.tipo, masa, sector, fila: Number(data.fila || 0),
      cu: data.cu ? Number(Number(data.cu).toFixed(2)) : 0,
      mo: data.mo ? Number(Number(data.mo).toFixed(3)) : 0,
      s: data.s ? Number(Number(data.s).toFixed(2)) : 0,
      obs: data.obs || "",
      fecha: state.editando ? state.editando.fecha : hoy(),
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
    state.editando = {...src, id: null, fecha: hoy()};
    render();
  }));
  document.querySelectorAll("[data-del]").forEach(btn => btn.addEventListener("click", () => deleteLot(btn.dataset.del)));
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
      ${chemBar("Cu", l.cu, l.cu >= 0.51, 3)}
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
  return `<div style="display:grid;grid-template-columns:minmax(320px,1fr) 360px;gap:14px">
    <div class="grid-cards">${silos.map(s => {
      const color = s.muestras ? s.color : C.txt3;
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
        <div style="display:flex;justify-content:center;gap:6px;margin-top:8px">
          <button class="icon-btn" data-silo-fill="${s.id}">Ingresar común</button>
          <button class="icon-btn" data-silo-clear="${s.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button>
        </div>
      </div>`;
    }).join("")}</div>
    <div class="box">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Ingreso común de turno</div>
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
    </div>
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
  return `<div style="display:grid;grid-template-columns:minmax(320px,1fr) 360px;gap:14px">
    <div class="grid-cards">${silos.map(s => {
      const color = s.muestras ? s.color : C.txt3;
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
        <div style="display:flex;justify-content:center;gap:6px;margin-top:8px">
          <button class="icon-btn" data-silo-fill="${s.id}">Ingresar común</button>
          <button class="icon-btn" data-silo-clear="${s.id}" style="background:#ff456022;color:var(--red);border-color:#ff456044">Vaciar</button>
        </div>
      </div>`;
    }).join("")}</div>
    <div class="box">
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Ingreso común de turno</div>
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
    </div>
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
    const masa = Number(data.masa), cu = Number(data.cu), mo = Number(data.mo), s = Number(data.s);
    if (!masa || masa <= 0 || Number.isNaN(cu) || Number.isNaN(mo) || Number.isNaN(s)) {
      alert("Ingresa masa y análisis químico válidos");
      return;
    }
    const comun = { id:`C-${Date.now()}`, siloId:data.siloId, turno:data.turno, fecha:data.fecha || hoy(), masa:Number(masa.toFixed(2)), cu:Number(cu.toFixed(2)), mo:Number(mo.toFixed(2)), s:Number(s.toFixed(2)) };
    state.comunes.push(comun);
    save("oxmo:comunes", state.comunes);
    addHist("Común de turno ingresado", comun.siloId, `${comun.masa}t ${comun.turno}`, clasificar(comun).color);
    render();
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
  const objetivoKg = Number(state.mix.masa || 20000);
  const paso = 1000;
  const basePool = state.lotes.filter(l => hasAnalysis(l) && l.masa > 0 && (state.mix.sector === "Todos" || l.sector === state.mix.sector));
  const pool = state.mix.sel.length ? basePool.filter(l => state.mix.sel.includes(l.id)) : basePool;
  const opciones = [];
  const evaluar = items => {
    if (items.some(x => x.kg <= 0 || x.kg > x.lote.masa)) return;
    const mix = mezclaDe(items);
    if (Math.abs(mix.masaKg - objetivoKg) > 0.01) return;
    const fueraKg = items.filter(x => clasificar(x.lote).clase === "Fuera Esp").reduce((a, x) => a + x.kg, 0);
    const cuPenalty = Math.abs(mix.cu - state.mix.cu) * 160;
    const moPenalty = Math.max(0, state.mix.mo - mix.mo) * 120;
    const sPenalty = Math.max(0, mix.s - state.mix.s) * 900;
    const specBonus = mix.ok ? 800 : 0;
    const fueraBonus = fueraKg / 1000 * 18;
    opciones.push({ items, mix, fueraKg, score: specBonus + fueraBonus - cuPenalty - moPenalty - sPenalty });
  };
  for (let i = 0; i < pool.length; i++) evaluar([{ lote: pool[i], kg: objetivoKg }]);
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let kgA = paso; kgA < objetivoKg; kgA += paso) {
        evaluar([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: objetivoKg - kgA }]);
      }
    }
  }
  for (let i = 0; i < pool.length; i++) {
    for (let j = i + 1; j < pool.length; j++) {
      for (let k = j + 1; k < pool.length; k++) {
        for (let kgA = paso; kgA < objetivoKg - paso; kgA += paso) {
          for (let kgB = paso; kgB < objetivoKg - kgA; kgB += paso) {
            evaluar([{ lote: pool[i], kg: kgA }, { lote: pool[j], kg: kgB }, { lote: pool[k], kg: objetivoKg - kgA - kgB }]);
          }
        }
      }
    }
  }
  const seen = new Set();
  return opciones.sort((a, b) => b.score - a.score).filter(op => {
    const key = op.items.map(x => `${x.lote.id}:${x.kg}`).join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 6);
}

function mezclasHTML() {
  const materiales = state.lotes.filter(l => hasAnalysis(l) && (state.mix.sector === "Todos" || l.sector === state.mix.sector));
  const opciones = buscarMejoresMezclas2();
  return `<div class="mix-layout">
    <div style="display:flex;flex-direction:column;gap:8px">
      <div class="box">
        <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Objetivo</div>
        ${range("Cu objetivo", "cu", state.mix.cu, 0, 2, 0.01, "%", C.copper)}
        ${range("Mo mínimo", "mo", state.mix.mo, 45, 65, 0.1, "%", C.green)}
        ${range("S máximo", "s", state.mix.s, 0, 0.5, 0.01, "%", C.yellow)}
        ${range("Masa lote", "masa", state.mix.masa, 5000, 30000, 1000, "kg", C.cyan)}
        <button class="btn" id="autoMix" style="width:100%;margin-top:8px">BUSCAR MEJOR COMBINACIÓN</button>
        <button class="btn secondary" id="clearMix" style="width:100%;margin-top:6px">Usar todos los materiales</button>
        <button class="btn secondary" id="resetMix" style="width:100%;margin-top:6px;border-color:#ff456055;color:var(--red)">Borrar opciones y reiniciar</button>
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
      <div class="grid-cards">${materiales.map(l => {
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
      <div class="muted-title" style="color:var(--cyan);margin-bottom:12px">Mejores opciones</div>
      ${opciones.length ? opciones.map((op, idx) => mezclaOpcionHTML(op, idx)).join("") : `<div style="color:var(--txt3);font-size:11px;text-align:center;padding:18px">No hay combinaciones posibles con el stock actual.</div>`}
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

function bindMezclas() {
  document.querySelectorAll("[data-range]").forEach(el => el.addEventListener("input", () => { state.mix[el.dataset.range] = Number(el.value); render(); }));
  document.querySelectorAll("[data-mix-sector]").forEach(btn => btn.addEventListener("click", () => { state.mix.sector = btn.dataset.mixSector; render(); }));
  document.querySelectorAll("[data-mix-lot]").forEach(tile => tile.addEventListener("click", () => {
    const id = tile.dataset.mixLot;
    state.mix.sel = state.mix.sel.includes(id) ? state.mix.sel.filter(x => x !== id) : [...state.mix.sel, id];
    render();
  }));
  document.querySelector("#clearMix").addEventListener("click", () => { state.mix.sel = []; render(); });
  document.querySelector("#resetMix").addEventListener("click", () => {
    state.mix = { cu: 0.5, mo: 57, s: 0.1, masa: 20000, sel: [], sector: "Todos" };
    state.mixMsg = "";
    render();
  });
  document.querySelector("#autoMix").addEventListener("click", () => {
    state.mixMsg = "Opciones calculadas";
    render();
    setTimeout(() => { state.mixMsg = ""; if (state.tab === "mezclas") render(); }, 2200);
  });
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
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:760px;line-height:1.45">Sube el archivo .xlsb del infodia. OXMO leera las hojas por fecha para calcular produccion diaria, fino Mo y movimiento de silos. Los lotes producidos del archivo quedan ocultos y no se agregan al inventario circulante.</div>
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
      ${miniReport("Ultimo dia", last?.fecha || "-", C.txt2)}
    </div>
    <div class="notice" style="border-color:#1e6fd955;background:#1e6fd922;color:var(--blue-light)">Detalle de dias y lotes queda guardado solo para calculo interno. La simulacion de silos usa los comunes OO300-001 por fecha y queda disponible en Historial Silos.</div>
    <div class="card" style="margin-top:14px">
      <div class="muted-title" style="margin-bottom:10px">Ultimos niveles de silos desde infodia</div>
      <div class="grid-cards">${Object.entries(state.siloNiveles || {}).map(([id, s]) => `<div class="card">
        <div class="mono" style="color:var(--blue-light);font-weight:900">${id}</div>
        <div class="mono" style="color:var(--cyan);font-size:18px;font-weight:900">${Number(s.nivel || 0).toFixed(1)}%</div>
        <div style="color:var(--txt2);font-size:11px">${Number(s.masa || 0).toFixed(2)} t - ${s.fecha || ""}</div>
      </div>`).join("")}</div>
    </div>
  </div>`;
}

function siloHistorialHTML() {
  const hist = [...(state.siloHistorial || [])].sort((a, b) => a.fecha.localeCompare(b.fecha) || String(a.siloId).localeCompare(String(b.siloId)));
  const totalLlenado = hist.reduce((a, h) => a + Number(h.masaLlenado || 0), 0);
  const conAnalisis = hist.filter(h => hasAnalysis(h)).length;
  const ultimo = hist.at(-1);
  return `<div class="box">
    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:14px">
      <div>
        <div class="muted-title" style="color:var(--cyan);margin-bottom:6px">Historial de llenado de silos</div>
        <div style="color:var(--txt);font-size:18px;font-weight:900">Simulacion Infodia + comunes ACP</div>
        <div style="color:var(--txt2);font-size:12px;margin-top:6px;max-width:780px;line-height:1.45">Caracterizacion historica generada desde las hojas diarias del Infodia y la hoja final de analisis. Los comunes OO300-001 se agrupan por fecha; si hay mas de uno en el dia, se usa promedio para caracterizar los silos llenados ese dia.</div>
      </div>
      <button class="btn secondary" data-tab="infodia">Importar nuevo Infodia</button>
    </div>
    <div class="grid-cards" style="margin-bottom:14px">
      ${miniReport("Eventos llenado", String(hist.length), C.blueLight)}
      ${miniReport("Masa llenada", `${totalLlenado.toFixed(2)} t`, C.green)}
      ${miniReport("Con analisis", String(conAnalisis), C.cyan)}
      ${miniReport("Ultimo evento", ultimo?.fecha || "-", C.copper)}
    </div>
    ${hist.length ? `<div class="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Silo</th><th>Llenado</th><th>Nivel final</th><th>Cu%</th><th>Mo%</th><th>S%</th><th>Clasif.</th><th>Comunes ACP</th></tr></thead>
        <tbody>${hist.map(h => {
          const cl = hasAnalysis(h) ? clasificar(h) : { clase: "Pendiente", color: C.yellow };
          return `<tr>
            <td class="mono" style="color:var(--txt2)">${h.fecha}</td>
            <td class="mono" style="color:var(--blue-light);font-weight:900">${h.siloId}</td>
            <td class="mono">${Number(h.masaLlenado || 0).toFixed(2)} t</td>
            <td class="mono">${Number(h.nivelFinal || 0).toFixed(1)}%</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.cyan : C.txt3}">${hasAnalysis(h) ? Number(h.cu).toFixed(3) : "-"}</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.green : C.txt3}">${hasAnalysis(h) ? Number(h.mo).toFixed(3) : "-"}</td>
            <td class="mono" style="color:${hasAnalysis(h) ? C.yellow : C.txt3}">${hasAnalysis(h) ? Number(h.s).toFixed(4) : "-"}</td>
            <td><span class="tag" style="background:${cl.color}22;color:${cl.color};border-color:${cl.color}44">${cl.clase}</span></td>
            <td style="font-size:10px;color:var(--txt2)">${(h.comunes || []).join(", ") || "Sin comun para la fecha"}</td>
          </tr>`;
        }).join("")}</tbody>
      </table>
    </div>` : `<div class="notice" style="border-color:#ffb80055;background:#ffb80022;color:var(--yellow)">Aun no hay historial. Importa el Infodia para simular llenado y caracterizacion de silos.</div>`}
  </div>`;
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
  const analisis = parseAnalisisComunes(wb);
  const days = wb.SheetNames
    .filter(name => /\d{2}-\d{2}-\d{4}/.test(name))
    .map(name => parseInfodiaSheet(name, XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: true, defval: "" })))
    .filter(Boolean);
  const siloHistorial = buildSiloHistorial(days, analisis);
  const totals = days.reduce((a, d) => ({
    lotes: a.lotes + d.lotes.length,
    produccionKg: a.produccionKg + d.produccionKg,
    kgMo: a.kgMo + d.kgMo,
    llenadoT: a.llenadoT + d.llenadoT,
    descargaT: a.descargaT + d.descargaT,
  }), { lotes: 0, produccionKg: 0, kgMo: 0, llenadoT: 0, descargaT: 0 });
  return { fileName: file.name, importedAt: new Date().toLocaleString("es-CL"), days, analisis, siloHistorial, totals };
}

function parseAnalisisComunes(wb) {
  const sheetName = wb.SheetNames.find(n => /hoja1|anal|acp|lab|quim/i.test(n)) || wb.SheetNames.at(-1);
  const ws = wb.Sheets[sheetName];
  if (!ws) return [];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: "" });
  if (!rows.length) return [];
  const header = rows[0].map(x => cellText(x));
  const idx = name => header.findIndex(h => h === cellText(name));
  const loteIdx = idx("Nro Lote");
  const fechaIdx = header.findIndex(h => h.includes("FECHA") && h.includes("ANALISIS"));
  const cuIdx = idx("Cu");
  const moIdx = idx("Mo");
  const sIdx = idx("S");
  if (loteIdx < 0 || fechaIdx < 0 || cuIdx < 0 || moIdx < 0 || sIdx < 0) return [];
  return rows.slice(1).map(r => {
    const codigo = String(r[loteIdx] || "").trim().toUpperCase();
    if (!/^OO300-001-\d+-26$/.test(codigo)) return null;
    const fecha = normalizarFechaAnalisis(r[fechaIdx]);
    const cu = parseNum(r[cuIdx]);
    const mo = parseNum(r[moIdx]);
    const s = parseNum(r[sIdx]);
    if (!fecha || !cu || !mo) return null;
    const comun = { codigo, fecha, cu, mo, s, fuente: sheetName };
    return { ...comun, ...clasificar(comun) };
  }).filter(Boolean);
}

function buildSiloHistorial(days, analisis) {
  const byDate = new Map();
  for (const a of analisis) {
    if (!byDate.has(a.fecha)) byDate.set(a.fecha, []);
    byDate.get(a.fecha).push(a);
  }
  const targetDays = days.some(d => d.fecha >= "2026-05-01" && d.fecha <= "2026-05-16")
    ? days.filter(d => d.fecha >= "2026-05-01" && d.fecha <= "2026-05-16")
    : days;
  const out = [];
  for (const day of targetDays.sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    const comunes = byDate.get(day.fecha) || [];
    const promedio = promedioAnalisis(comunes);
    for (const s of day.silos) {
      if (Number(s.llenadoT || 0) <= 0) continue;
      const rec = {
        fecha: day.fecha,
        siloId: s.id,
        silo: s.silo,
        masaLlenado: Number(s.llenadoT || 0),
        nivelFinal: Number(s.finalNivel || 0),
        comunes: comunes.map(c => c.codigo),
        cu: promedio.cu,
        mo: promedio.mo,
        s: promedio.s,
      };
      out.push({ ...rec, ...clasificar(rec) });
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
  for (let i = title; i < Math.min(rows.length, title + 25); i++) {
    const r = rows[i];
    const n = parseInt(cellText(r[1]), 10);
    if (n < 4 || n > 11) continue;
    const iniA = parsePct(r[2]);
    const finA = parsePct(r[3]);
    const tipoA = cellText(r[4]);
    const iniB = parsePct(r[5]);
    const finB = parsePct(r[6]);
    const base = state.silosBase.find(s => s.id === `Silo ${n}`) || { cap: 50 };
    const deltaA = ((finA || 0) - (iniA || 0)) * base.cap / 100;
    const deltaB = ((finB || 0) - (iniB || 0)) * base.cap / 100;
    const finalNivel = finB || finA || iniB || iniA || 0;
    out.push({
      id: `Silo ${n}`,
      silo: n,
      fecha,
      iniA,
      finA,
      tipoA,
      iniB,
      finB,
      finalNivel,
      masa: finalNivel * base.cap / 100,
      llenadoT: Math.max(0, deltaA) + Math.max(0, deltaB),
      descargaT: Math.max(0, -deltaA) + Math.max(0, -deltaB),
      netoT: deltaA + deltaB,
    });
  }
  return out;
}

function aplicarInfodia(info) {
  state.lotes = state.lotes.filter(l => !isInfodiaProductionLote(l));
  save("oxmo:lotes", state.lotes);
  const lastBySilo = {};
  state.siloHistorial = info.siloHistorial || [];
  save("oxmo:siloHistorial", state.siloHistorial);
  const histBySilo = new Map();
  for (const h of state.siloHistorial) histBySilo.set(h.siloId, h);
  for (const day of [...info.days].sort((a, b) => a.fecha.localeCompare(b.fecha))) {
    for (const s of day.silos) {
      const h = histBySilo.get(s.id);
      lastBySilo[s.id] = {
        nivel: s.finalNivel,
        masa: s.masa,
        fecha: day.fecha,
        fuente: "infodia",
        cu: h?.cu || 0,
        mo: h?.mo || 0,
        s: h?.s || 0,
        comunes: h?.comunes || [],
      };
    }
  }
  state.siloNiveles = { ...(state.siloNiveles || {}), ...lastBySilo };
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
      <label><input data-range-input="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${displayValue}" /> ${unit}</label>
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

render();
initCloud();

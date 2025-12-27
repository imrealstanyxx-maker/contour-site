const data = window.CONTOUR_DATA;

const elQ = document.getElementById("q");
const elType = document.getElementById("type");
const elAccess = document.getElementById("access");
const elList = document.getElementById("list");
const elStats = document.getElementById("stats");

function norm(s){ return (s || "").toString().toLowerCase(); }

function canSee(entry, accessMode){
  if (accessMode === "public") return entry.access === "public";
  if (accessMode === "leak") return entry.access === "public" || entry.access === "leak";
  if (accessMode === "internal") return entry.access !== "internal"; // имитация
  return true;
}

function renderStats(visible){
  const total = visible.length;
  const active = visible.filter(x => x.status === "ACTIVE").length;
  const unknown = visible.filter(x => x.status === "UNKNOWN").length;
  const spb = visible.filter(x => (x.location||"").includes("Санкт")).length;

  elStats.innerHTML = [
    stat("Записей", total),
    stat("Активных", active),
    stat("Неясный статус", unknown),
    stat("Следы СПб", spb),
  ].join("");
}

function stat(k,v){
  return `<div class="stat"><div class="k">${k}</div><div class="v">${v}</div></div>`;
}

function badgeStatus(s){
  if (s === "ACTIVE") return `<span class="badge red">ACTIVE</span>`;
  if (s === "CLOSED") return `<span class="badge green">CLOSED</span>`;
  return `<span class="badge">UNKNOWN</span>`;
}

function card(entry){
  const tags = (entry.tags || []).slice(0,5).map(t=>`<span class="tag">${t}</span>`).join("");
  const type = entry.code.split("/")[0];
  return `
  <div class="card" data-id="${entry.id}">
    <div class="row">
      <span class="badge">${type}</span>
      ${badgeStatus(entry.status)}
    </div>
    <div class="title">${entry.code} — ${entry.title}</div>
    <div class="small">${entry.teaser || ""}</div>
    <div class="small">Локация: ${entry.location || "не раскрыто"}</div>
    <div class="tags">${tags}</div>
  </div>`;
}

function apply(){
  const q = norm(elQ.value);
  const t = elType.value;
  const a = elAccess.value;

  const visible = data
    .filter(x => canSee(x, a))
    .filter(x => t === "all" ? true : (x.code || "").startsWith(t))
    .filter(x => {
      if (!q) return true;
      const hay = [
        x.id, x.code, x.title, x.location, x.teaser,
        ...(x.tags || []),
      ].map(norm).join(" ");
      return hay.includes(q);
    });

  renderStats(visible);
  elList.innerHTML = visible.map(card).join("");

  elList.querySelectorAll(".card").forEach(c => {
    c.addEventListener("click", () => {
      const id = c.getAttribute("data-id");
      window.location.href = `dossier.html?id=${encodeURIComponent(id)}&access=${encodeURIComponent(a)}`;
    });
  });
}

elQ.addEventListener("input", apply);
elType.addEventListener("change", apply);
elAccess.addEventListener("change", apply);

apply();

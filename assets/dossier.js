const data = window.CONTOUR_DATA;

function qs(name){
  return new URLSearchParams(location.search).get(name);
}

function canSee(entry, accessMode){
  if (accessMode === "public") return entry.access === "public";
  if (accessMode === "leak") return entry.access === "public" || entry.access === "leak";
  if (accessMode === "internal") return entry.access !== "internal"; // имитация
  return true;
}

function redactify(text){
  return (text || "").replace(/█+/g, m => `<span class="redacted">${m}</span>`);
}

const id = qs("id");
const access = qs("access") || "public";

const entry = data.find(x => x.id === id);

const elHead = document.getElementById("head");
const elMeta = document.getElementById("meta");
const elBlocks = document.getElementById("blocks");
const elNote = document.getElementById("editorNote");

if (!entry){
  elHead.textContent = "Досье не найдено";
  elMeta.innerHTML = `<div class="note">Запись отсутствует в текущей компиляции.</div>`;
} else if (!canSee(entry, access)){
  elHead.textContent = "Доступ запрещён";
  elMeta.innerHTML = `<div class="note">Эта запись недоступна при текущем уровне доступа.</div>`;
} else {
  elHead.textContent = `${entry.code} — ${entry.title}`;
  document.documentElement.dataset.contourKey = "CARTOTEKA-7";

  const metaPairs = Object.entries(entry.meta || {});
  const base = [
    ["Идентификатор", entry.id],
    ["Статус", entry.status],
    ["Локация", entry.location || "не раскрыто"],
    ["Уровень доступа", entry.access],
  ];

  elMeta.innerHTML = [...base, ...metaPairs].map(([k,v]) => (
    `<div class="mkey">${k}</div><div class="mval">${v}</div>`
  )).join("");

  elBlocks.innerHTML = (entry.blocks || []).map(b => `
    <div class="block">
      <div class="h">
        <div class="kind">${b.kind}</div>
        <div class="stamp">${b.stamp}</div>
      </div>
      <pre>${redactify(b.text)}</pre>
    </div>
  `).join("");

  elNote.textContent = entry.editorNote || "—";
}

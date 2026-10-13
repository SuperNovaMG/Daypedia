/* ============ Aaj Kaun Sa Day? — app logic ============ */
const $ = (s) => document.querySelector(s);

/* ---------- i18n ---------- */
const STR = {
  hi: {
    brand: "Daypedia", hero: "Daypedia",
    tagline: "Roz ek naya day, roz ek naya funda 🎉",
    featuredLabel: "⭐ FEATURED DAY • TODAY",
    todayOthers: "Aaj Ke Aur Days",
    yesterday: "🕰️ Kal Kya Tha",
    tomorrow: "⏳ Kal Kya Hoga",
    countdownText: "Naye days unlock hone me bas itna time 👀",
    explore: "🔍 Koi Aur Date Dekho",
    goBtn: "Dekho →",
    footer: "Made with 💜 for curious minds • Data curated by hand, thoda pyaar ke saath",
    navHome: "Home", navSearch: "Search", navShare: "Share",
    all: "Sab", story: "📖 Poori Story", share: "📤 Share as Image",
    why: "Kyun manaya jata hai", who: "Kisne shuru kiya", fact: "🤯 Fun fact",
    noData: "Is date ka data abhi ready nahi hai — jald aa raha hai! 🚧",
    pickDate: "Pehle koi date choose karo 📅",
    categories: { international: "International", national: "National", fun: "Fun", awareness: "Awareness", food: "Food", festival: "Festival" },
  },
  en: {
    brand: "Daypedia", hero: "Daypedia",
    tagline: "A new day, a new story — every day 🎉",
    featuredLabel: "⭐ FEATURED DAY • TODAY",
    todayOthers: "More Days Today",
    yesterday: "🕰️ Yesterday's Days",
    tomorrow: "⏳ Coming Tomorrow",
    countdownText: "New days unlock in just 👀",
    explore: "🔍 Explore Any Date",
    goBtn: "Go →",
    footer: "Made with 💜 for curious minds • Data curated by hand, with love",
    navHome: "Home", navSearch: "Search", navShare: "Share",
    all: "All", story: "📖 Full Story", share: "📤 Share as Image",
    why: "Why it's celebrated", who: "Who started it", fact: "🤯 Fun fact",
    noData: "Data for this date isn't ready yet — coming soon! 🚧",
    pickDate: "Pick a date first 📅",
    categories: { international: "International", national: "National", fun: "Fun", awareness: "Awareness", food: "Food", festival: "Festival" },
  }
};
let lang = localStorage.getItem("aksd-lang") || "hi";
let theme = localStorage.getItem("aksd-theme") || "dark";
const t = (k) => STR[lang][k];

/* ---------- IST dates ---------- */
function istParts(offsetDays = 0) {
  const now = new Date(Date.now() + offsetDays * 864e5);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit",
  });
  const [y, m, d] = fmt.format(now).split("-");
  return { key: `${m}-${d}`, label: new Intl.DateTimeFormat(lang === "hi" ? "en-IN" : "en-US",
    { timeZone: "Asia/Kolkata", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now) };
}
const TODAY = istParts(0), YEST = istParts(-1), TOMO = istParts(1);

/* ---------- state ---------- */
let DAYS = [];
let activeCat = "all";

/* ---------- helpers ---------- */
const byDate = (key) => DAYS.filter((x) => x.d === key);
const L = (entry, field) => entry[field + "_" + (lang === "hi" ? "hi" : "en")];
const catName = (c) => t("categories")[c] || c;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function dayCardHTML(e, featured = false) {
  return `
    <div class="dc-emoji">${e.emoji}</div>
    <div class="dc-cat cat-${e.cat}">${catName(e.cat)}</div>
    <h3>${esc(e.name)}</h3>
    <p class="dc-why">${esc(L(e, "why"))}</p>
    <div class="dc-detail">
      <p><b>${t("who")}:</b> ${esc(L(e, "who"))}</p>
      <p style="margin-top:8px"><b>${t("fact")}:</b> ${esc(L(e, "fact"))}</p>
    </div>
    <button class="share-mini" data-share="${esc(e.name)}">${t("share")}</button>`;
}

/* ---------- render ---------- */
function renderFeatured() {
  const list = byDate(TODAY.key);
  const box = $("#featuredCard");
  if (!list.length) { box.innerHTML = `<p class="empty">${t("noData")}</p>`; return; }
  const e = list[0];
  box.innerHTML = `
    <div class="fc-emoji">${e.emoji}</div>
    <span class="fc-cat cat-${e.cat}">${catName(e.cat)}</span>
    <div class="fc-name">${esc(e.name)}</div>
    <div class="fc-story">
      <p><b>${t("why")}:</b> ${esc(L(e, "why"))}</p>
      <p style="margin-top:8px"><b>${t("who")}:</b> ${esc(L(e, "who"))}</p>
    </div>
    <div class="fc-fact">${t("fact")}: ${esc(L(e, "fact"))}</div>
    <div class="fc-actions">
      <button class="cta-btn" data-share="${esc(e.name)}">${t("share")}</button>
    </div>`;
}

function renderChips() {
  const cats = ["all", "international", "national", "fun", "awareness", "food", "festival"];
  $("#chips").innerHTML = cats.map((c) =>
    `<button class="chip ${c === activeCat ? "active" : ""}" data-cat="${c}">${c === "all" ? t("all") : catName(c)}</button>`
  ).join("");
  document.querySelectorAll(".chip").forEach((ch) =>
    ch.addEventListener("click", () => { activeCat = ch.dataset.cat; renderChips(); renderToday(); }));
}

function renderToday() {
  let list = byDate(TODAY.key).slice(1); // skip featured
  if (activeCat !== "all") list = list.filter((e) => e.cat === activeCat);
  $("#todayGrid").innerHTML = list.length
    ? list.map((e) => `<div class="day-card" data-card>${dayCardHTML(e)}</div>`).join("")
    : `<p class="empty">${t("noData")}</p>`;
  bindCards($("#todayGrid"));
}

function renderYesterday() {
  const list = byDate(YEST.key);
  $("#yesterdayList").innerHTML = list.length
    ? list.map((e) => `<div class="list-item"><span class="li-emoji">${e.emoji}</span>
        <div><b>${esc(e.name)}</b><br><small>${catName(e.cat)} • ${esc(L(e, "why")).slice(0, 90)}…</small></div></div>`).join("")
    : `<p class="empty">${t("noData")}</p>`;
}

function renderSearch(key) {
  const list = byDate(key);
  $("#searchResults").innerHTML = list.length
    ? list.map((e) => `<div class="day-card" data-card>${dayCardHTML(e)}</div>`).join("")
    : `<p class="empty">${t("noData")}</p>`;
  bindCards($("#searchResults"));
}

function bindCards(root) {
  root.querySelectorAll("[data-card]").forEach((card) =>
    card.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-share]")) return;
      card.classList.toggle("open");
    }));
  root.querySelectorAll("[data-share]").forEach((btn) =>
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const e = DAYS.find((x) => x.name === btn.dataset.share);
      if (e) shareImage(e);
    }));
}

/* ---------- countdown to midnight IST ---------- */
function tickCountdown() {
  const now = new Date();
  const istNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const midnight = new Date(istNow);
  midnight.setHours(24, 0, 0, 0);
  let s = Math.max(0, Math.floor((midnight - istNow) / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  $("#countdown").textContent = `${h}:${m}:${sec}`;
}

/* ---------- share as image (1080x1920) ---------- */
function shareImage(e) {
  const W = 1080, H = 1920;
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const g = c.createLinearGradient(0, 0, W, H);
  const dark = document.documentElement.dataset.theme === "dark";
  if (dark) { g.addColorStop(0, "#1c0f3d"); g.addColorStop(1, "#0b0620"); }
  else { g.addColorStop(0, "#efe6ff"); g.addColorStop(1, "#ffffff"); }
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.textAlign = "center";
  const fg = dark ? "#ffffff" : "#241645", mut = dark ? "#c9b8f0" : "#6b5a9e";
  c.fillStyle = "#c95bff"; c.font = "800 54px 'Plus Jakarta Sans', sans-serif";
  c.fillText("✨ Daypedia", W / 2, 150);
  c.font = "140px sans-serif"; c.fillText(e.emoji, W / 2, 380);
  c.fillStyle = fg; c.font = "800 64px 'Plus Jakarta Sans', sans-serif";
  wrap(c, e.name, W / 2, 500, W - 160, 74);
  c.fillStyle = "#ff5fa2"; c.font = "700 40px 'Plus Jakarta Sans', sans-serif";
  c.fillText(catName(e.cat).toUpperCase(), W / 2, 700);
  c.fillStyle = mut; c.font = "400 38px 'Plus Jakarta Sans', sans-serif";
  wrap(c, L(e, "why"), W / 2, 800, W - 160, 56);
  c.fillStyle = "#38e1ff"; c.font = "700 36px 'Plus Jakarta Sans', sans-serif";
  wrap(c, "🤯 " + L(e, "fact"), W / 2, 1150, W - 160, 52);
  c.fillStyle = mut; c.font = "600 34px 'Plus Jakarta Sans', sans-serif";
  c.fillText(TODAY.label, W / 2, 1700);
  c.fillStyle = "#c95bff"; c.font = "800 36px 'Plus Jakarta Sans', sans-serif";
  c.fillText("Roz ek naya day, roz ek naya funda 🎉", W / 2, 1780);
  const a = document.createElement("a");
  a.download = "aaj-kaun-sa-day.png";
  a.href = cv.toDataURL("image/png");
  a.click();
}
function wrap(c, text, x, y, maxW, lh) {
  const words = String(text).split(" ");
  let line = "", yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (c.measureText(test).width > maxW && line) { c.fillText(line, x, yy); line = w + " "; yy += lh; }
    else line = test;
  }
  c.fillText(line, x, yy);
  return yy;
}

/* ---------- apply lang/theme ---------- */
function applyAll() {
  document.documentElement.dataset.lang = lang;
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.dataset.i18n;
    if (STR[lang][k] !== undefined) el.textContent = STR[lang][k];
  });
  $("#themeToggle").textContent = theme === "dark" ? "🌙" : "☀️";
  $("#langToggle").textContent = lang === "hi" ? "EN / हिं" : "हिं / EN";
  $("#todayDate").textContent = TODAY.label;
}

/* ---------- data loading: local first, GitHub raw as fallback ---------- */
async function loadDays() {
  const urls = [
    "days.json",
    "https://raw.githubusercontent.com/SuperNovaMG/daypedia/main/days.json"
  ];
  for (const u of urls) {
    try {
      const r = await fetch(u);
      if (r.ok) return await r.json();
    } catch (e) { /* try next source */ }
  }
  throw new Error("days data not found");
}

/* ---------- init ---------- */
async function init() {
  applyAll();
  try {
    DAYS = await loadDays();
  } catch (err) {
    $("#featuredCard").innerHTML = `<p class="empty">days.json load nahi hua 😢</p>`;
    return;
  }
  renderFeatured(); renderChips(); renderToday(); renderYesterday();
  tickCountdown(); setInterval(tickCountdown, 1000);

  $("#themeToggle").addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    localStorage.setItem("aksd-theme", theme);
    applyAll(); renderFeatured(); renderChips(); renderToday(); renderYesterday();
  });
  $("#langToggle").addEventListener("click", () => {
    lang = lang === "hi" ? "en" : "hi";
    localStorage.setItem("aksd-lang", lang);
    applyAll(); renderFeatured(); renderChips(); renderToday(); renderYesterday();
  });
  $("#dateGo").addEventListener("click", () => {
    const v = $("#dateInput").value;
    if (!v) { $("#searchResults").innerHTML = `<p class="empty">${t("pickDate")}</p>`; return; }
    renderSearch(v.slice(5));
  });
  $("#navExplore").addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector('[data-i18n="explore"]').scrollIntoView({ behavior: "smooth" });
  });
  $("#navShare").addEventListener("click", (e) => {
    e.preventDefault();
    const list = byDate(TODAY.key);
    if (list.length) shareImage(list[0]);
  });
}
document.addEventListener("DOMContentLoaded", init);

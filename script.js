/* Konvene: event data, rendering, filters, countdowns, validation, localStorage. */
"use strict";

const soon = (days, h, m = 0) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(h)}:${p(m)}`;
};

const EVENTS = [
  /* Sample upcoming events (dates move with today's date) */
  { id: "inter-cricket", name: "Inter-Hostel Cricket Cup", cat: "Sports", date: soon(2, 7, 30), venue: "Main Ground", seats: 200,
    desc: "T20 knockout between hostels. Register as a spectator or a player." },
  { id: "ml-workshop", name: "Intro to Machine Learning Workshop", cat: "Workshop", date: soon(7, 14), venue: "Seminar Hall 2", seats: 60,
    desc: "Hands-on session training your first classifier in Python. Bring a laptop." },
  { id: "hack-nov", name: "48 Hour Hackathon", cat: "Tech", date: soon(14, 9), venue: "Innovation Lab, Block C", seats: 120, featured: true,
    desc: "Build a working prototype in 48 hours with mentors from industry. Teams of up to four." },
  { id: "unplugged", name: "Campus Unplugged Night", cat: "Music", date: soon(21, 18, 30), venue: "Open Air Theatre", seats: 400, featured: true,
    desc: "Acoustic sets from student bands and one surprise headliner. Gates open at 6." },
  { id: "rangmanch", name: "Rangmanch Street Play Festival", cat: "Cultural", date: soon(28, 16), venue: "Central Plaza", seats: 250,
    desc: "Twelve teams, one theme, thirty minutes each. Vote for your favourite on the day." },
  { id: "design-sprint", name: "UI/UX Design Sprint", cat: "Workshop", date: soon(35, 10), venue: "Design Studio, Block A", seats: 40,
    desc: "Go from a problem statement to a clickable prototype in one day." },
  { id: "cp-contest", name: "Code Clash: Competitive Programming", cat: "Tech", date: soon(42, 11), venue: "Computer Centre", seats: 150,
    desc: "Three hours, eight problems, one leaderboard. Solo participation only." },
  { id: "beat-lab", name: "Beat Lab: Produce a Track in 3 Hours", cat: "Music", date: soon(56, 15), venue: "Media Room", seats: 30,
    desc: "Learn sampling and arrangement, then finish a short beat to share with the room." },
  { id: "winter-fest", name: "Winter Fest Cultural Evening", cat: "Cultural", date: soon(70, 17, 30), venue: "Auditorium", seats: 500, featured: true,
    desc: "Dance, poetry and stand-up wrapped into one evening, with food stalls outside." },

  /* Real past KIIT events */
  { id: "omega-hacquire", img: "images/omega.jpg", name: "Hacquire (Omega 6.0)", cat: "Tech", date: "2026-08-22T09:00", venue: "Campus 25", seats: 200,
    desc: "Hackathon by FED KIIT where teams build, bid and ship a product or feature, mixing tech with entrepreneurial thinking." },
  { id: "omega-fpl", img: "images/omega.jpg", name: "FED Premier League (Omega 6.0)", cat: "Business", date: "2026-08-23T09:00", venue: "Campus 25", seats: 200,
    desc: "An IPL style auction game where teams bid strategically and build their dream squad from scratch." },
  { id: "omega-show", img: "images/omega.jpg", name: "The FEDpreneur Show (Omega 6.0)", cat: "Business", date: "2026-08-23T16:00", venue: "Campus 6", seats: 500, featured: true,
    desc: "Pitches, entrepreneurship and entertainment, closing Omega 6.0 with a show by comedian Rajat Sood." },
  { id: "darted-pixels", img: "images/darted-pixels.jpg", name: "Darted Pixels", cat: "Workshop", date: "2026-10-10T10:00", venue: "KIIT University", seats: 100,
    desc: "GDG on Campus KIIT workshop on Dart and Flutter. Modify a Flappy Bird game to learn game logic, collisions, scoring and UI. Free registration." },
  { id: "hauntfest", img: "images/hauntfest.jpg", pos: "50% 38%", name: "Hauntfest Halloween: The Last Saturday", cat: "Cultural", date: "2026-10-31T16:00", venue: "Campus 6 Auditorium", seats: 400, featured: true,
    desc: "KIIT International Student's Society party of horror, fun and music, with awards for best dressed. Colour code: red, white, black." },
  { id: "kiit-karnival", img: "images/karnival.jpg", pos: "50% 40%", name: "KIIT Karnival (KIIT Fest 9.0)", cat: "Cultural", date: "2026-03-06T17:00", venue: "Karnival area, Campus 13 entry", seats: 1000,
    desc: "Two days (6 and 7 March) of funfair, food and cultural nights, with 80+ tech and non-tech events. Fee: ₹250 internal, ₹400 external." }
];
const CATS = ["All", "Tech", "Workshop", "Business", "Cultural", "Music", "Sports"];
const KEY = "konvene-registrations";

const $ = (s) => document.querySelector(s);
const state = { cat: "All", q: "", when: "upcoming", current: null };
const isPast = (e) => new Date(e.date) <= new Date();

/* ---------- storage ---------- */
const store = {
  all() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } },
  save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { toast("Storage is unavailable in this browser."); } }
};
const taken = (id) => store.all().filter((r) => r.eventId === id).length;
const left = (ev) => Math.max(ev.seats - taken(ev.id), 0);
const find = (id) => EVENTS.find((e) => e.id === id);

/* ---------- formatting ---------- */
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
const day = (d) => new Date(d).getDate();
const mon = (d) => new Date(d).toLocaleDateString("en-IN", { month: "short" });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const slug = (c) => "cat-" + c.toLowerCase();
const upcoming = () => EVENTS.filter((e) => new Date(e.date) > new Date()).sort((a, b) => new Date(a.date) - new Date(b.date));

/* ---------- countdown ---------- */
function timerHTML(date) {
  let ms = new Date(date) - new Date();
  if (ms <= 0) return '<div class="live">This event has already taken place</div>';
  const s = Math.floor(ms / 1000);
  const parts = [["Days", Math.floor(s / 86400)], ["Hours", Math.floor(s % 86400 / 3600)], ["Mins", Math.floor(s % 3600 / 60)], ["Secs", s % 60]];
  return parts.map(([l, v]) => `<div><b>${String(v).padStart(2, "0")}</b><span>${l}</span></div>`).join("");
}
function tick() {
  const next = upcoming()[0];
  if (next) $("#nextTimer").innerHTML = timerHTML(next.date);
  if (state.current && $("#eventDialog").open) $("#dTimer").innerHTML = timerHTML(state.current.date);
}

/* ---------- hero ---------- */
function renderHero() {
  const next = upcoming()[0];
  if (!next) { $("#nextTitle").textContent = "No events scheduled"; return; }
  $("#nextTitle").textContent = next.name;
  $("#nextMeta").textContent = `${fmtDate(next.date)}, ${fmtTime(next.date)} at ${next.venue}`;
  $("#heroOpen").onclick = () => openEvent(next.id);
}

/* ---------- list, search, filter ---------- */
function renderChips() {
  $("#chips").innerHTML = CATS.map((c) => `<button class="chip" type="button" aria-pressed="${c === state.cat}" data-cat="${c}">${c}</button>`).join("");
}
function renderGrid() {
  const q = state.q.trim().toLowerCase();
  $("#listTitle").textContent = state.when === "past" ? "Past events" : "Upcoming events";
  const list = EVENTS.filter((e) => (state.when === "past" ? isPast(e) : !isPast(e)) &&
    (state.cat === "All" || e.cat === state.cat) &&
    (!q || [e.name, e.venue, e.desc, e.cat].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  $("#grid").innerHTML = list.map((e) => {
    const n = left(e), past = isPast(e);
    return `<button class="card${past ? " past" : ""}" type="button" data-id="${e.id}" aria-label="${esc(e.name)}, view details">
      <div class="art ${slug(e.cat)}${e.img ? " has-img" : ""}">
        ${e.img ? `<img src="${e.img}" alt="${esc(e.name)} poster" loading="lazy" style="object-position:${e.pos || "50% 50%"}">` : ""}
        ${e.featured ? '<span class="feat">Featured</span>' : ""}
        <div class="date">${day(e.date)}<small>${mon(e.date)}</small></div>
      </div>
      <div class="card-body">
        <span class="tag">${e.cat}</span>
        <h3>${esc(e.name)}</h3>
        <p class="venue">${esc(e.venue)}</p>
        <p class="desc">${esc(e.desc)}</p>
        <div class="card-foot">
          ${past ? '<span class="ended">Ended</span>' : `<span class="seats ${n < 15 ? "low" : ""}">${n ? n + " seats left" : "Fully booked"}</span>`}
          <span class="go">View details</span>
        </div>
      </div></button>`;
  }).join("");
  $("#empty").hidden = list.length > 0;
  $("#resultInfo").textContent = `${list.length} ${list.length === 1 ? "event" : "events"} shown`;
}

/* ---------- event dialog ---------- */
function openEvent(id) {
  const ev = find(id);
  if (!ev) return;
  state.current = ev;
  $("#dArt").className = "d-art " + slug(ev.cat) + (ev.img ? " has-img" : "");
  $("#dArt").innerHTML = ev.img ? `<img src="${ev.img}" alt="${esc(ev.name)} poster">` : "";
  $("#dTag").textContent = ev.cat;
  $("#dTitle").textContent = ev.name;
  $("#dDesc").textContent = ev.desc;
  $("#dFacts").innerHTML = `<li><b>Date:</b> ${fmtDate(ev.date)}</li><li><b>Time:</b> ${fmtTime(ev.date)}</li><li><b>Venue:</b> ${esc(ev.venue)}</li>${isPast(ev) ? "" : `<li><b>Seats left:</b> ${left(ev)} of ${ev.seats}</li>`}`;
  $("#fEvent").innerHTML = '<option value="">Select an event</option>' +
    EVENTS.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join("");
  $("#fEvent").value = ev.id;
  resetForm();
  $("#dTimer").innerHTML = timerHTML(ev.date);
  const closed = isPast(ev) || left(ev) === 0;
  $("#submitBtn").disabled = closed;
  $("#submitBtn").textContent = isPast(ev) ? "This event has ended" : left(ev) === 0 ? "This event is fully booked" : "Register for this event";
  if (!$("#eventDialog").open) $("#eventDialog").showModal();
}
function resetForm() {
  $("#regForm").reset();
  $("#fEvent").value = state.current ? state.current.id : "";
  $("#regForm").hidden = false;
  $("#success").hidden = true;
  document.querySelectorAll(".field").forEach((f) => f.classList.remove("valid", "invalid"));
  document.querySelectorAll(".err").forEach((e) => (e.textContent = ""));
}

/* ---------- validation ---------- */
const rules = {
  name: (v) => !v.trim() ? "Enter your full name." : !/^[A-Za-z][A-Za-z .'-]{1,59}$/.test(v.trim()) ? "Use letters only, at least 2 characters." : "",
  email: (v) => !v.trim() ? "Enter your email address." : !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "Enter a valid email, like you@college.edu." : "",
  phone: (v) => { const d = v.replace(/[\s-]/g, "").replace(/^(\+91|0)/, "");
    return !v.trim() ? "Enter your phone number." : !/^[6-9]\d{9}$/.test(d) ? "Enter a 10 digit mobile number starting with 6 to 9." : ""; },
  event: (v) => (!v ? "Choose an event." : "")
};
const fields = { name: ["#fName", "#eName"], email: ["#fEmail", "#eEmail"], phone: ["#fPhone", "#ePhone"], event: ["#fEvent", "#eEvent"] };

function check(key) {
  const [inp, err] = fields[key];
  const msg = rules[key]($(inp).value);
  $(err).textContent = msg;
  const wrap = $(inp).closest(".field");
  wrap.classList.toggle("invalid", !!msg);
  wrap.classList.toggle("valid", !msg);
  $(inp).setAttribute("aria-invalid", msg ? "true" : "false");
  return !msg;
}
Object.keys(fields).forEach((k) => {
  const el = $(fields[k][0]);
  el.addEventListener("blur", () => check(k));
  el.addEventListener("input", () => { if (el.closest(".field").classList.contains("invalid")) check(k); });
});

$("#regForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = Object.keys(fields).map(check).every(Boolean);
  if (!ok) { const bad = document.querySelector(".field.invalid input, .field.invalid select"); if (bad) bad.focus(); return; }

  const ev = find($("#fEvent").value);
  const email = $("#fEmail").value.trim().toLowerCase();
  if (left(ev) === 0) { $("#eEvent").textContent = "That event is fully booked."; $("#fEvent").closest(".field").classList.add("invalid"); return; }
  if (store.all().some((r) => r.eventId === ev.id && r.email === email)) {
    $("#eEmail").textContent = "This email is already registered for this event.";
    $("#fEmail").closest(".field").classList.replace("valid", "invalid");
    return;
  }
  const reg = { ref: "KVN-" + Math.random().toString(36).slice(2, 8).toUpperCase(), eventId: ev.id,
    name: $("#fName").value.trim(), email, phone: $("#fPhone").value.trim(), at: new Date().toISOString() };
  store.save([...store.all(), reg]);

  $("#regForm").hidden = true;
  $("#successMsg").textContent = `${reg.name}, your seat for ${ev.name} on ${fmtDate(ev.date)} is reserved. Keep your reference ID handy and find this booking under My registrations.`;
  $("#successRef").textContent = "Reference " + reg.ref;
  $("#success").hidden = false;
  $("#success").focus();
  renderGrid(); updateCount();
  $("#dFacts").lastElementChild.innerHTML = `<b>Seats left:</b> ${left(ev)} of ${ev.seats}`;
});

/* ---------- my registrations ---------- */
function updateCount() { $("#regCount").textContent = store.all().length; }
function renderRegs() {
  const list = store.all();
  $("#regList").innerHTML = list.length ? list.map((r) => { const ev = find(r.eventId);
    return `<li><div><strong>${esc(ev ? ev.name : "Event")}</strong><small>${esc(r.name)} | ${r.ref}</small></div><button type="button" data-cancel="${r.ref}">Cancel</button></li>`; }).join("")
    : '<li><div><strong>Nothing here yet</strong><small>Open an event and register to see it listed.</small></div></li>';
}

/* ---------- theme + toast ---------- */
function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2600); }
$("#themeBtn").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  try { localStorage.setItem("konvene-theme", next); } catch (e) {}
});

/* ---------- wiring ---------- */
$("#chips").addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (!b) return; state.cat = b.dataset.cat; renderChips(); renderGrid(); });
$("#search").addEventListener("input", (e) => { state.q = e.target.value; renderGrid(); });
$("#resetBtn").addEventListener("click", () => { state.cat = "All"; state.q = ""; $("#search").value = ""; renderChips(); renderGrid(); });
$("#grid").addEventListener("click", (e) => { const c = e.target.closest("[data-id]"); if (c) openEvent(c.dataset.id); });
$("#fEvent").addEventListener("change", () => {
  const ev = find($("#fEvent").value);
  if (!ev) return;
  const keep = ["#fName", "#fEmail", "#fPhone"].map((s) => $(s).value); // keep what was typed
  openEvent(ev.id);
  ["#fName", "#fEmail", "#fPhone"].forEach((s, i) => ($(s).value = keep[i]));
});
$("#myRegsBtn").addEventListener("click", () => { renderRegs(); $("#regsDialog").showModal(); });
$("#regList").addEventListener("click", (e) => { const r = e.target.closest("[data-cancel]"); if (!r) return;
  store.save(store.all().filter((x) => x.ref !== r.dataset.cancel)); renderRegs(); renderGrid(); updateCount(); toast("Registration cancelled."); });
document.querySelectorAll("dialog").forEach((d) => {
  d.addEventListener("click", (e) => { if (e.target === d || e.target.closest("[data-close]")) d.close(); });
});

$("#seg").addEventListener("click", (e) => {
  const b = e.target.closest("[data-when]"); if (!b) return;
  state.when = b.dataset.when;
  document.querySelectorAll(".seg-btn").forEach((x) => x.setAttribute("aria-pressed", x === b));
  renderGrid();
});

renderHero(); renderChips(); renderGrid(); updateCount(); tick();
setInterval(tick, 1000);

/* Ticker: two identical groups so the loop never shows a gap */
(function () {
  const words = ["Hackathons", "Concerts", "Workshops", "Sports", "Fests"];
  const group = Array(3).fill(words).flat().map((w) => `<span>${w}</span>`).join("");
  $("#tickerTrack").innerHTML = `<div class="tg">${group}</div><div class="tg">${group}</div>`;
})();

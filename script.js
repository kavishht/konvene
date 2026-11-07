/* Konvene: event data, rendering, filters, countdowns, validation, localStorage. */
"use strict";

const EVENTS = [
  { id: "hack-nov", name: "48 Hour Hackathon", cat: "Tech", date: "2026-11-21T09:00", venue: "Innovation Lab, Block C", seats: 120, featured: true,
    desc: "Build a working prototype in 48 hours with mentors from industry. Teams of up to four." },
  { id: "ml-workshop", name: "Intro to Machine Learning Workshop", cat: "Workshop", date: "2026-11-14T14:00", venue: "Seminar Hall 2", seats: 60,
    desc: "Hands-on session training your first classifier in Python. Bring a laptop." },
  { id: "unplugged", name: "Campus Unplugged Night", cat: "Music", date: "2026-11-28T18:30", venue: "Open Air Theatre", seats: 400, featured: true,
    desc: "Acoustic sets from student bands and one surprise headliner. Gates open at 6." },
  { id: "inter-cricket", name: "Inter-Hostel Cricket Cup", cat: "Sports", date: "2026-11-09T07:30", venue: "Main Ground", seats: 200,
    desc: "T20 knockout between hostels. Register as a spectator or a player." },
  { id: "rangmanch", name: "Rangmanch Street Play Festival", cat: "Cultural", date: "2026-12-05T16:00", venue: "Central Plaza", seats: 250,
    desc: "Twelve teams, one theme, thirty minutes each. Vote for your favourite on the day." },
  { id: "design-sprint", name: "UI/UX Design Sprint", cat: "Workshop", date: "2026-12-12T10:00", venue: "Design Studio, Block A", seats: 40,
    desc: "Go from a problem statement to a clickable prototype in one day." },
  { id: "cp-contest", name: "Code Clash: Competitive Programming", cat: "Tech", date: "2026-12-19T11:00", venue: "Computer Centre", seats: 150,
    desc: "Three hours, eight problems, one leaderboard. Solo participation only." },
  { id: "beat-lab", name: "Beat Lab: Produce a Track in 3 Hours", cat: "Music", date: "2027-01-10T15:00", venue: "Media Room", seats: 30,
    desc: "Learn sampling and arrangement, then finish a short beat to share with the room." },
  { id: "winter-fest", name: "Winter Fest Cultural Evening", cat: "Cultural", date: "2027-01-24T17:30", venue: "Auditorium", seats: 500, featured: true,
    desc: "Dance, poetry and stand-up wrapped into one evening, with food stalls outside." }
];
const CATS = ["All", "Tech", "Workshop", "Music", "Sports", "Cultural"];
const KEY = "konvene-registrations";

const $ = (s) => document.querySelector(s);
const state = { cat: "All", q: "", current: null };

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
  if (ms <= 0) return '<div class="live">This event has started</div>';
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
  const list = EVENTS.filter((e) => (state.cat === "All" || e.cat === state.cat) &&
    (!q || [e.name, e.venue, e.desc, e.cat].join(" ").toLowerCase().includes(q)))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  $("#grid").innerHTML = list.map((e) => {
    const n = left(e);
    return `<button class="card" type="button" data-id="${e.id}" aria-label="${esc(e.name)}, view details">
      <div class="art ${slug(e.cat)}">
        ${e.featured ? '<span class="feat">Featured</span>' : ""}
        <div class="date">${day(e.date)}<small>${mon(e.date)}</small></div>
      </div>
      <div class="card-body">
        <span class="tag">${e.cat}</span>
        <h3>${esc(e.name)}</h3>
        <p class="venue">${esc(e.venue)}</p>
        <p class="desc">${esc(e.desc)}</p>
        <div class="card-foot">
          <span class="seats ${n < 15 ? "low" : ""}">${n ? n + " seats left" : "Fully booked"}</span>
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
  $("#dArt").className = "d-art " + slug(ev.cat);
  $("#dTag").textContent = ev.cat;
  $("#dTitle").textContent = ev.name;
  $("#dDesc").textContent = ev.desc;
  $("#dFacts").innerHTML = `<li><b>Date:</b> ${fmtDate(ev.date)}</li><li><b>Time:</b> ${fmtTime(ev.date)}</li><li><b>Venue:</b> ${esc(ev.venue)}</li><li><b>Seats left:</b> ${left(ev)} of ${ev.seats}</li>`;
  $("#fEvent").innerHTML = '<option value="">Select an event</option>' +
    EVENTS.map((e) => `<option value="${e.id}">${esc(e.name)}</option>`).join("");
  $("#fEvent").value = ev.id;
  resetForm();
  $("#dTimer").innerHTML = timerHTML(ev.date);
  const full = left(ev) === 0;
  $("#submitBtn").disabled = full;
  $("#submitBtn").textContent = full ? "This event is fully booked" : "Register for this event";
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
  $("#successMsg").textContent = `${reg.name}, your seat for ${ev.name} on ${fmtDate(ev.date)} is reserved. A confirmation was saved to ${reg.email}.`;
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

renderHero(); renderChips(); renderGrid(); updateCount(); tick();
setInterval(tick, 1000);

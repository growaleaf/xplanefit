function computeFit(controller, tier) {
  const totalSlots = controller.buttons + controller.axes + controller.hats;
  let remaining = totalSlots;
  const rows = [];

  for (const wantedCategory of CATEGORY_PRIORITY) {
    const entry = tier.core_functions.find(function (f) { return f.category === wantedCategory; });
    const need = entry ? entry.count : 0;
    if (need === 0) continue;
    const covered = Math.min(need, Math.max(remaining, 0));
    const short = need - covered;
    remaining -= covered;
    rows.push({ category: wantedCategory, need: need, covered: covered, short: short });
  }

  const totalCovered = Math.min(totalSlots, tier.total_functions);
  const totalShort = tier.total_functions - totalCovered;

  return { totalSlots: totalSlots, totalCovered: totalCovered, totalShort: totalShort, rows: rows };
}

function el(tag, className, text) {
  const e = document.createElement(tag);
  if (className) e.className = className;
  if (text !== undefined) e.textContent = text;
  return e;
}

function renderSources(container, sources) {
  container.innerHTML = "";
  const label = el("span", "sources-label", "Sources: ");
  container.appendChild(label);
  sources.forEach(function (s, i) {
    const a = el("a", null, s.label);
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    container.appendChild(a);
    if (i < sources.length - 1) container.appendChild(document.createTextNode(" · "));
  });
}

function renderResult(controller, tier) {
  const fit = computeFit(controller, tier);

  document.getElementById("result-heading").textContent =
    controller.name + " + " + tier.tier_name;

  document.getElementById("controller-slots").textContent =
    controller.buttons + " buttons, " + controller.axes + " axes, " + controller.hats + " hats (" +
    fit.totalSlots + " total input slots)";

  document.getElementById("tier-needs").textContent =
    tier.total_functions + " core controls — " + tier.tier_note;

  const summary = document.getElementById("fit-summary");
  summary.className = "fit-summary " + (fit.totalShort > 0 ? "fit-short" : "fit-full");
  summary.textContent = fit.totalShort > 0
    ? "Covers " + fit.totalCovered + " of " + tier.total_functions + " core controls — " + fit.totalShort + " left over to push to keyboard."
    : "Covers all " + tier.total_functions + " core controls on this controller alone.";

  const tbody = document.getElementById("category-rows");
  tbody.innerHTML = "";
  fit.rows.forEach(function (row) {
    const tr = document.createElement("tr");
    const tdCat = el("td", null, row.category);
    const tdNeed = el("td", null, String(row.need));
    const tdCovered = el("td", null, String(row.covered));
    const tdShort = el("td", null, row.short > 0 ? String(row.short) : "-");
    if (row.short > 0) tdShort.className = "short-cell";
    tr.appendChild(tdCat);
    tr.appendChild(tdNeed);
    tr.appendChild(tdCovered);
    tr.appendChild(tdShort);
    tbody.appendChild(tr);
  });

  const noteLines = fit.rows.filter(function (r) { return r.short > 0; }).map(function (r) {
    return r.category + ": " + r.need + " controls, " + r.covered + " slots left after higher-priority categories — push " + r.short + " to keyboard.";
  });
  const noteBox = document.getElementById("shortfall-notes");
  noteBox.innerHTML = "";
  if (noteLines.length === 0) {
    noteBox.appendChild(el("p", null, "Every core control on this aircraft class has a physical slot on this controller."));
  } else {
    noteLines.forEach(function (line) {
      noteBox.appendChild(el("p", null, line));
    });
  }

  renderSources(document.getElementById("controller-sources"), controller.sources);
  renderSources(document.getElementById("tier-sources"), [{ label: tier.source_note, url: tier.source_url }]);
}

function populateSelect(select, items, nameKey) {
  select.innerHTML = "";
  items.forEach(function (item) {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = item[nameKey];
    select.appendChild(opt);
  });
}

const PRO_PAYMENT_LINK_URL = "https://buy.stripe.com/00w4gB3Yc1TP2F68X9frW39";

function isPro(item) {
  return item.tier === "pro";
}

function visibleControllers() {
  return unlockedState ? CONTROLLERS : CONTROLLERS.filter(function (c) { return !isPro(c); });
}
function visibleTiers() {
  return unlockedState ? TIERS : TIERS.filter(function (t) { return !isPro(t); });
}

function updateUnlockUI(unlocked) {
  const unlockSection = document.getElementById("unlock-box");
  const proControllers = CONTROLLERS.filter(isPro).length;
  const proTiers = TIERS.filter(isPro).length;

  unlockSection.innerHTML = "";

  if (unlocked) {
    unlockSection.appendChild(el("p", "unlock-confirmed", "Pro unlocked — all " + CONTROLLERS.length + " controllers and " + TIERS.length + " aircraft classes available."));
    return;
  }

  const buyP = document.createElement("p");
  const buyLink = el("a", "btn", "Unlock all " + CONTROLLERS.length + " controllers / " + TIERS.length + " aircraft classes — $9 one time");
  buyLink.href = PRO_PAYMENT_LINK_URL;
  buyP.appendChild(buyLink);
  buyP.appendChild(document.createTextNode(" (adds " + proControllers + " more controllers, " + proTiers + " more aircraft class)"));
  unlockSection.appendChild(buyP);

  const form = document.createElement("form");
  form.className = "license-form";
  const label = el("label", null, "Already purchased? Paste your license key");
  label.htmlFor = "license-key-input";
  const input = document.createElement("input");
  input.type = "text";
  input.id = "license-key-input";
  input.placeholder = "XP1.…";
  const submit = document.createElement("button");
  submit.type = "submit";
  submit.textContent = "Activate";
  const msg = el("p", "license-msg", "");
  form.appendChild(label);
  form.appendChild(input);
  form.appendChild(submit);
  form.appendChild(msg);
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    verifyLicense(input.value).then(function (res) {
      if (res.ok) {
        storeLicense(input.value);
        refreshTierAndRender();
      } else {
        msg.textContent = res.reason;
      }
    });
  });
  unlockSection.appendChild(form);
}

let unlockedState = false;

function refreshTierAndRender() {
  loadStoredLicense().then(function (license) {
    unlockedState = !!license;
    updateUnlockUI(unlockedState);

    const controllerSelect = document.getElementById("controller-select");
    const tierSelect = document.getElementById("tier-select");
    const prevController = controllerSelect.value;
    const prevTier = tierSelect.value;

    populateSelect(controllerSelect, visibleControllers(), "name");
    populateSelect(tierSelect, visibleTiers(), "tier_name");

    controllerSelect.value = visibleControllers().some(function (c) { return c.id === prevController; })
      ? prevController : visibleControllers()[0].id;
    tierSelect.value = visibleTiers().some(function (t) { return t.id === prevTier; })
      ? prevTier : visibleTiers()[0].id;

    const controller = CONTROLLERS.find(function (c) { return c.id === controllerSelect.value; });
    const tier = TIERS.find(function (t) { return t.id === tierSelect.value; });
    renderResult(controller, tier);
  });
}

function init() {
  const controllerSelect = document.getElementById("controller-select");
  const tierSelect = document.getElementById("tier-select");

  function update() {
    const controller = CONTROLLERS.find(function (c) { return c.id === controllerSelect.value; });
    const tier = TIERS.find(function (t) { return t.id === tierSelect.value; });
    renderResult(controller, tier);
  }

  controllerSelect.addEventListener("change", update);
  tierSelect.addEventListener("change", update);

  refreshTierAndRender();
}

document.addEventListener("DOMContentLoaded", init);

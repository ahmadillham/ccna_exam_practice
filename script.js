(() => {
  "use strict";

  /* ---------- util */
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const BASE_TITLE = "CCNA 200-301 v1.1";
  const body = document.body;
  const content = $("#content");
  const filter = $("#filter");
  const noResults = $("#noResults");
  const srStatus = $("#srStatus");
  const pager = $("#pager");
  const menuBtn = $("#menuBtn");
  const sideScroll = $("#sideScroll");
  const mobileQuery = window.matchMedia("(max-width: 900px)");

  /* ---------- data yang di-cache sekali (tidak di-query ulang setiap navigasi) */
  const tabs = $$(".tab");
  const navs = { command: $("#nav-command"), rangkuman: $("#nav-rangkuman") };
  const linksByTab = {
    command: $$(".nav-link", navs.command),
    rangkuman: $$(".nav-link", navs.rangkuman),
  };
  const groupsByTab = {
    command: $$(".nav-group", navs.command),
    rangkuman: $$(".nav-group", navs.rangkuman),
  };
  const pages = new Map($$(".page").map((page) => [page.id, page]));
  const linkById = new Map(
    [...linksByTab.command, ...linksByTab.rangkuman].map((a) => [a.dataset.id, a])
  );
  const haystack = new Map(
    [...linkById.values()].map((a) => [a, `${a.textContent} ${a.dataset.keys || ""}`.toLowerCase()])
  );

  const lastOf = { command: "c-home", rangkuman: "s-home" };
  let currentTab = "command";
  let currentId = null;
  let activeLink = null;
  // ke mana fokus dipindah setelah navigasi: "content" (judul halaman) atau elemen tertentu.
  // Browser melepas fokus saat URL berpindah ke fragmen, jadi saat pindah tab fokus dikembalikan ke tombolnya.
  let pendingFocus = "content";

  /* ---------- pengumuman untuk screen reader */
  let announceTimer = 0;
  function announce(message) {
    clearTimeout(announceTimer);
    srStatus.textContent = "";
    announceTimer = setTimeout(() => { srStatus.textContent = message; }, 50);
  }

  /* ---------- tab (Command / Rangkuman) */
  function setTab(tab) {
    currentTab = tab;
    tabs.forEach((t) => t.setAttribute("aria-pressed", String(t.dataset.tab === tab)));
    Object.entries(navs).forEach(([name, nav]) => { nav.hidden = name !== tab; });
    applyFilter();
  }

  /* ---------- routing berbasis hash: #halaman atau #halaman--sub-judul */
  function readHash() {
    const raw = location.hash.slice(1);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw; // hash malformed (mis. %E0%A4%A) tidak boleh merusak halaman
    }
  }

  function resolve(id) {
    const el = id ? document.getElementById(id) : null;
    if (!el) return null;
    if (pages.has(el.id)) return { id: el.id, anchor: null };
    const page = el.closest(".page");
    return page ? { id: page.id, anchor: el } : null;
  }

  function focusElement(el) {
    if (!el) return;
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }

  // menggulir daftar sidebar secara manual; scrollIntoView() juga menggeser titik awal navigasi Tab
  function revealInSidebar(link) {
    const box = sideScroll.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top < box.top) sideScroll.scrollTop -= box.top - item.top + 8;
    else if (item.bottom > box.bottom) sideScroll.scrollTop += item.bottom - box.bottom + 8;
  }

  function show({ id, anchor }, { focus = "content" } = {}) {
    const page = pages.get(id);
    const tab = page.dataset.tab;
    if (tab !== currentTab) setTab(tab);
    lastOf[tab] = id;
    currentId = id;

    pages.forEach((p) => { p.hidden = p !== page; });

    if (activeLink) activeLink.removeAttribute("aria-current");
    activeLink = linkById.get(id) || null;
    if (activeLink) activeLink.setAttribute("aria-current", "page");

    const h1 = $("h1", page);
    document.title = `${h1 ? `${h1.textContent} · ` : ""}${BASE_TITLE}`;

    buildPager(id, tab);
    updateScrollable();

    const target = anchor || h1;
    if (anchor) anchor.scrollIntoView(); else window.scrollTo(0, 0);
    if (focus === "content") focusElement(target);
    else if (focus) focus.focus({ preventScroll: true });

    if (activeLink && !activeLink.hidden) revealInSidebar(activeLink);
    setMenu(false);
  }

  function route({ first = false } = {}) {
    const target = resolve(readHash()) || { id: lastOf[currentTab], anchor: null };
    // saat pertama dibuka fokus tidak direbut; navigasi berikutnya memindahkan fokus
    const focus = first ? null : pendingFocus;
    pendingFocus = "content";
    show(target, { focus });
  }

  function go(id, { focus = "content" } = {}) {
    pendingFocus = focus;
    if (location.hash === `#${id}`) route(); else location.hash = id;
  }

  window.addEventListener("hashchange", () => route());

  /* ---------- prev / next */
  function pagerLink(className, label, link) {
    const a = document.createElement("a");
    a.className = className;
    a.href = `#${link.dataset.id}`;
    const small = document.createElement("small");
    small.textContent = label;
    const span = document.createElement("span");
    span.textContent = link.textContent;
    a.append(small, span);
    return a;
  }

  function buildPager(id, tab) {
    const links = linksByTab[tab];
    const i = links.findIndex((a) => a.dataset.id === id);
    const items = [];
    if (i > 0) items.push(pagerLink("prev", "← Sebelumnya", links[i - 1]));
    if (i !== -1 && i < links.length - 1) items.push(pagerLink("next", "Berikutnya →", links[i + 1]));
    pager.replaceChildren(...items);
    pager.hidden = items.length === 0;
  }

  /* ---------- filter sidebar */
  function applyFilter() {
    const q = filter.value.trim().toLowerCase();
    let any = false;
    groupsByTab[currentTab].forEach((group) => {
      const groupHit = q !== "" && $(".nav-title", group).textContent.toLowerCase().includes(q);
      let visible = 0;
      $$(".nav-link", group).forEach((a) => {
        const ok = q === "" || groupHit || haystack.get(a).includes(q);
        a.hidden = !ok;
        if (ok) visible++;
      });
      group.hidden = visible === 0;
      if (visible > 0) any = true;
    });
    noResults.textContent = any ? "" : "Tidak ada topik yang cocok.";
  }

  filter.addEventListener("input", applyFilter);
  filter.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const first = linksByTab[currentTab].find((a) => !a.hidden);
      if (first) go(first.dataset.id);
    } else if (e.key === "Escape" && filter.value) {
      // Esc pertama menghapus filter; Esc berikutnya menutup menu / melepas fokus
      filter.value = "";
      applyFilter();
      e.stopPropagation();
    }
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      if (tab.dataset.tab !== currentTab) go(lastOf[tab.dataset.tab], { focus: tab });
    });
  });

  /* ---------- menu mobile */
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Tutup menu" : "Buka menu");
  }
  menuBtn.addEventListener("click", () => setMenu(!body.classList.contains("menu-open")));
  $("#scrim").addEventListener("click", () => setMenu(false));
  mobileQuery.addEventListener("change", (e) => { if (!e.matches) setMenu(false); });

  /* ---------- pintasan keyboard */
  const isTypingTarget = (el) =>
    el.isContentEditable || ["input", "textarea", "select"].includes(el.tagName.toLowerCase());

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const wasOpen = body.classList.contains("menu-open");
      if (wasOpen) setMenu(false);
      if (wasOpen && mobileQuery.matches) menuBtn.focus();
      else if (document.activeElement === filter) filter.blur();
    } else if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) {
      e.preventDefault();
      if (mobileQuery.matches) setMenu(true);
      filter.focus();
      filter.select();
    }
  });

  $("#skipLink").addEventListener("click", (e) => {
    e.preventDefault();
    focusElement($("h1", pages.get(currentId)));
  });

  /* ---------- tautan ke sub-judul */
  $$("h2[id], h3[id]", content).forEach((heading) => {
    const a = document.createElement("a");
    a.className = "anchor";
    a.href = `#${heading.id}`;
    a.textContent = "#";
    a.title = "Tautan ke bagian ini";
    a.setAttribute("aria-hidden", "true"); // duplikat dari judul bagi pembaca layar
    a.tabIndex = -1;
    heading.append(a);
  });

  /* ---------- tombol salin pada blok kode */
  const PROMPT = /^[A-Za-z][\w.-]*(\([\w.+-]+\))?#(?:\s|$)/;
  const codeForCopy = (code) =>
    code.textContent
      .split("\n")
      .map((line) => line.replace(PROMPT, ""))
      .join("\n")
      .replace(/\n+$/, "");

  function legacyCopy(text) {
    const previous = document.activeElement;
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch { /* diabaikan */ }
    document.body.removeChild(ta);
    if (previous && previous.focus) previous.focus({ preventScroll: true });
    return ok;
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch { /* lanjut ke fallback */ }
    }
    return legacyCopy(text);
  }

  $$(".code-block").forEach((block) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "Salin";
    btn.setAttribute("aria-label", "Salin kode");
    block.append(btn);
  });

  content.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const ok = await copyText(codeForCopy($("code", btn.parentElement)));
    btn.textContent = ok ? "Tersalin" : "Gagal";
    announce(ok ? "Kode disalin ke clipboard" : "Gagal menyalin kode");
    setTimeout(() => { btn.textContent = "Salin"; }, 1400);
  });

  /* ---------- area yang bisa di-scroll horizontal harus bisa difokus keyboard */
  function updateScrollable() {
    const page = pages.get(currentId);
    if (!page) return;
    $$(".code-block pre, .table-wrap", page).forEach((el) => {
      if (el.scrollWidth > el.clientWidth + 1) {
        const table = $("table", el);
        const name = table ? table.getAttribute("aria-label") : "Blok kode";
        el.tabIndex = 0;
        el.setAttribute("role", "region");
        el.setAttribute("aria-label", `${name}, dapat digulir`);
      } else {
        el.removeAttribute("tabindex");
        el.removeAttribute("role");
        el.removeAttribute("aria-label");
      }
    });
  }

  let resizeFrame = 0;
  const scheduleScrollableUpdate = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(updateScrollable);
  };
  window.addEventListener("resize", scheduleScrollableUpdate);
  if (document.fonts) document.fonts.addEventListener("loadingdone", scheduleScrollableUpdate);

  /* ---------- mulai */
  route({ first: true });
})();

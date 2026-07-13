"use strict";

const cleanText = (value) => value.replace(/\s+/g, " ").replace(/^✓\s*/, "").trim();

const LAB_METADATA = {
  18: {
    platform: "Diagramming tool atau Packet Tracer · Sesuai scope describe/explain.",
    acceptance: "Diagram memuat fungsi perangkat, failure domain, security controls, dan batas cloud/on-premises."
  },
  38: {
    platform: "AireOS WLC/Packet Tracer: static LAG mode on · Catalyst 9800: pilih LACP secara eksplisit."
  },
  40: {
    platform: "CML/GNS3/IOSv atau IOS XE yang mendukung VRF · Pengayaan konfigurasi."
  },
  42: {
    platform: "Multilayer switch/IOS yang mendukung HSRP · Pengayaan; ujian menekankan konsep FHRP."
  },
  45: {
    platform: "CML/GNS3/IOSv dengan dukungan MQC · Pengayaan; ujian menekankan konsep PHB."
  },
  47: { platform: "Shell dengan curl dan mock/controller API · Sesuai scope REST/JSON." },
  48: { platform: "Ansible control node + IOS sandbox · Pengayaan praktik automation." },
  50: {
    prerequisite: "Lab 01–49 atau kemampuan switching, routing, services, dan security setara.",
    devices: "2 router, 2 switch, 4–6 endpoint, serta server services/ISP simulasi.",
    platform: "Packet Tracer untuk core; CML/GNS3 bila fitur security tertentu tidak tersedia.",
    acceptance: "Nilai minimal 80/100 dan seluruh acceptance test kritis berhasil."
  },
  52: {
    prerequisite: "Routing table IPv4/IPv6, longest-prefix match, AD, metric, dan CEF.",
    devices: "Satu IOS/IOS XE router atau analisis fixture tanpa perangkat.",
    platform: "IOS/IOS XE dengan CEF; gunakan fixture routing table yang disediakan.",
    addressing: "Gunakan RIB fixture dan delapan alamat tujuan yang tercantum pada Lab 52.",
    acceptance: "Delapan keputusan forwarding cocok dengan matched prefix, AD/metric, dan next hop."
  },
  58: { platform: "Shell + mock/controller REST API dengan sertifikat lab yang dipercaya." },
  59: { platform: "Ansible control node, cisco.ios collection, dan IOS sandbox." },
  60: {
    prerequisite: "Selesaikan Lab 01–59 atau kuasai seluruh enam domain CCNA v1.1.",
    devices: "4 router, 4 switch, WLC/AP, server services, ISP, dan endpoint dual-stack.",
    platform: "Packet Tracer/CML sesuai feature matrix; automation dijalankan dari control node.",
    addressing: "IPv4 10.60.0.0/22 · IPv6 2001:db8:60::/48; gunakan tabel referensi pada jawaban.",
    acceptance: "Nilai minimal 80/100 tanpa critical security failure dan seluruh bukti tersedia."
  }
};

const getLevel = (number) => {
  if (number <= 20) return "dasar";
  if (number <= 40) return "menengah";
  return "lanjut";
};

const getDevices = (title) => {
  const value = title.toLowerCase();

  if (/wlan|wireless|wlc|\brf\b/.test(value)) {
    return "WLC/simulator, 1–3 AP, switch, dan wireless client.";
  }
  if (/\bapi\b|json|ansible|automation|terraform|compliance/.test(value)) {
    return "PC admin, editor teks, serta sandbox API/Ansible.";
  }
  if (/stp|etherchannel|vlan|switch|mac learning|access-layer/.test(value)) {
    return "2–4 switch Cisco dan 2 PC sesuai topologi.";
  }
  if (/ospf|route|routing|nat|dhcp|hsrp|fhrp|vrf|branch|dmz/.test(value)) {
    return "2–4 router/L3 switch, switch akses, dan 2–4 endpoint.";
  }
  if (/topology|architecture|component design/.test(value)) {
    return "Aplikasi diagram atau kertas; simulator bersifat opsional.";
  }
  return "Cisco Packet Tracer/CML dan perangkat sesuai skenario.";
};

const getPrerequisite = (number, title) => {
  if (LAB_METADATA[number]?.prerequisite) return LAB_METADATA[number].prerequisite;
  const value = title.toLowerCase();

  if (number === 1) return "Tidak ada; cukup mengenal koneksi console.";
  if (/ipv4|subnet|vlsm|nat|acl|dhcp/.test(value)) {
    return number <= 20
      ? "CLI dasar dan konsep IPv4/prefix."
      : "Lab IPv4, subnetting, dan routing dasar.";
  }
  if (/ipv6|dual-stack/.test(value)) {
    return "IPv6 addressing, prefix /64, dan link-local.";
  }
  if (/ospf/.test(value)) {
    return "Static routing serta pembacaan routing table.";
  }
  if (/stp|etherchannel|vlan|switch|access-layer/.test(value)) {
    return "VLAN, access port, trunk 802.1Q, dan CLI switch.";
  }
  if (/\bapi\b|json|ansible|automation|terraform|compliance/.test(value)) {
    return "Dasar JSON, HTTP, dan command line.";
  }

  const level = getLevel(number);
  if (level === "dasar") return "CLI dasar dan penggunaan simulator.";
  if (level === "menengah") return "Lab 01–20 atau kemampuan setara.";
  return "Lab 01–40 dan kebiasaan membaca output show.";
};

const getAddressing = (body) => {
  const sourceClone = body.cloneNode(true);
  sourceClone.querySelectorAll(".answer, .lab-standard").forEach((node) => node.remove());
  sourceClone.querySelectorAll("li, p, pre, h4").forEach((node) => node.append(" "));
  const source = sourceClone.textContent;
  const candidates = source.match(
    /(?:\b(?:\d{1,3}\.){3}\d{1,3}(?:\/\d{1,2})?\b)|(?:\b[0-9a-f]{0,4}:[0-9a-f:]+(?:\/\d{1,3})?\b)/gi
  ) || [];

  const unique = [...new Set(candidates)].slice(0, 4);
  return unique.length
    ? unique.join(" · ")
    : "Tidak ada skema IP khusus; ikuti parameter pada skenario.";
};

const getPlatform = (number) => {
  if (LAB_METADATA[number]?.platform) return LAB_METADATA[number].platform;
  if ([44, 57].includes(number)) return "Packet Tracer/WLC simulator; menu bergantung model controller.";
  if ([37, 39, 43, 51, 53, 54, 55, 56].includes(number)) {
    return "CML/GNS3/IOSv direkomendasikan; dukungan Packet Tracer dapat terbatas.";
  }
  return "Packet Tracer, CML, atau GNS3 sesuai interface yang tersedia.";
};

const getVerification = (answer) => {
  if (!answer) return "Cocokkan hasil dengan seluruh kriteria penerimaan.";

  const commands = [];
  answer.querySelectorAll("pre code").forEach((block) => {
    block.textContent.split("\n").forEach((rawLine) => {
      const line = rawLine.trim();
      if (
        /^(?:[A-Z0-9-]+[>#]\s*)?(?:show|ping|traceroute|nslookup|curl|ansible-playbook)\b/i.test(line)
      ) {
        const normalized = line.replace(/^[A-Z0-9-]+[>#]\s*/i, "");
        if (!commands.includes(normalized)) commands.push(normalized);
      }
    });
  });

  answer.querySelectorAll(".check code").forEach((inlineCode) => {
    const command = cleanText(inlineCode.textContent);
    if (/^(show|ping|traceroute|nslookup|ssh|curl)\b/i.test(command) && !commands.includes(command)) {
      commands.push(command);
    }
  });

  return commands.length
    ? commands.slice(0, 3).join(" · ")
    : cleanText(answer.querySelector(".check")?.textContent || "") ||
        "Cocokkan seluruh deliverable dengan rubrik pada jawaban.";
};

const getChallenge = (number) => {
  const level = getLevel(number);
  if (level === "dasar") {
    return "Ulangi tanpa jawaban, lalu ganti alamat atau nomor interface.";
  }
  if (level === "menengah") {
    return "Sisipkan satu fault, diagnosis dengan show command, lalu pulihkan.";
  }
  return "Tambahkan failure injection, bukti before/after, dan rencana rollback.";
};

const createStandardItem = (label, value, modifier = "") => {
  const item = document.createElement("div");
  item.className = ("standard-item " + modifier).trim();

  const heading = document.createElement("span");
  heading.className = "standard-label";
  heading.textContent = label;

  const content = document.createElement("p");
  content.textContent = value;

  item.append(heading, content);
  return item;
};

const addStandardPanels = () => {
  document.querySelectorAll(".lab-card").forEach((card) => {
    const body = card.querySelector(".lab-body");
    const brief = body?.querySelector(".brief");
    if (!body || !brief || body.querySelector(".lab-standard")) return;

    const number = Number(card.querySelector(".lab-number")?.textContent || 0);
    const title = cleanText(card.querySelector(".lab-title h3")?.textContent || "Lab");
    const duration =
      [...card.querySelectorAll(".tag")]
        .map((tag) => cleanText(tag.textContent))
        .find((tag) => /menit/i.test(tag)) || "30–45 menit";
    const answer = card.querySelector(".answer-content");
    const acceptance =
      LAB_METADATA[number]?.acceptance ||
      cleanText(answer?.querySelector(".check")?.textContent || "") ||
      "Seluruh tugas selesai dan hasil akhir sesuai skenario.";

    const section = document.createElement("section");
    section.className = "lab-standard";
    section.setAttribute("aria-label", "Standar pengerjaan Lab " + String(number).padStart(2, "0"));

    const header = document.createElement("header");
    header.innerHTML =
      '<span class="standard-kicker">Lab brief</span><strong>Checklist sebelum mulai</strong>';

    const grid = document.createElement("div");
    grid.className = "standard-grid";
    grid.append(
      createStandardItem("Prasyarat", getPrerequisite(number, title)),
      createStandardItem("Estimasi", duration),
      createStandardItem("Perangkat", LAB_METADATA[number]?.devices || getDevices(title)),
      createStandardItem("Platform / scope", getPlatform(number)),
      createStandardItem("Addressing", LAB_METADATA[number]?.addressing || getAddressing(body), "standard-wide"),
      createStandardItem("Target lulus", acceptance, "standard-wide"),
      createStandardItem("Verifikasi", getVerification(answer), "standard-wide standard-command"),
      createStandardItem("Tantangan +", getChallenge(number), "standard-wide standard-challenge")
    );

    section.append(header, grid);
    brief.insertAdjacentElement("afterend", section);
  });
};

const copyWithFallback = async (text) => {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall through to the local-file-compatible method below.
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.append(textarea);
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Perintah salin tidak didukung");
};

const IOS_PROMPT_PATTERN = /^([A-Za-z0-9._-]+)(?:\([^)]*\))?[>#]\s?/;

const getCopyReadyText = (text) => {
  const lines = text.split("\n");
  const promptHosts = new Set(
    lines
      .map((line) => line.match(IOS_PROMPT_PATTERN)?.[1]?.toLowerCase())
      .filter(Boolean)
  );

  // Satu perangkat: prompt dibuang agar command siap ditempel. Beberapa perangkat:
  // prompt dipertahankan supaya batas konfigurasi tidak hilang dan salah perangkat.
  const preserveDeviceBoundaries = promptHosts.size > 1;
  return lines
    .map((line) => (preserveDeviceBoundaries ? line : line.replace(IOS_PROMPT_PATTERN, "")))
    .join("\n")
    .trim();
};

const addCopyButtons = () => {
  document.querySelectorAll(".answer-content pre, .command-content pre").forEach((pre, index) => {
    if (pre.closest(".code-shell")) return;

    const code = pre.querySelector("code");
    if (!code) return;

    const shell = document.createElement("div");
    shell.className = "code-shell";
    pre.insertAdjacentElement("beforebegin", shell);
    shell.append(pre);

    const isAnswer = Boolean(pre.closest(".answer-content"));
    const blockType = isAnswer ? "jawaban lab" : "command";
    const button = document.createElement("button");
    button.className = "copy-button";
    button.type = "button";
    const defaultAriaLabel = "Salin blok " + blockType + " " + (index + 1);
    button.setAttribute("aria-label", defaultAriaLabel);
    button.innerHTML = '<span aria-hidden="true">⧉</span><span aria-live="polite">Salin</span>';
    shell.append(button);

    let feedbackTimer;
    button.addEventListener("click", async () => {
      const label = button.lastElementChild;
      clearTimeout(feedbackTimer);

      try {
        await copyWithFallback(getCopyReadyText(code.textContent));
        button.classList.add("is-copied");
        button.setAttribute("aria-label", "Berhasil menyalin blok " + blockType);
        label.textContent = "Tersalin";
      } catch {
        button.classList.add("is-error");
        button.setAttribute("aria-label", "Gagal menyalin blok " + blockType);
        label.textContent = "Gagal";
      }

      feedbackTimer = window.setTimeout(() => {
        button.classList.remove("is-copied", "is-error");
        button.setAttribute("aria-label", defaultAriaLabel);
        label.textContent = "Salin";
      }, 1800);
    });
  });
};

const QUIZ_STORAGE_KEY = "ccna-lab-atlas.quiz.v4";
const PREVIOUS_QUIZ_STORAGE_KEY = "ccna-lab-atlas.quiz.v3";
const LEGACY_QUIZ_STORAGE_KEY = "ccna-lab-atlas.quiz.v2";

const initializeQuiz = () => {
  const cards = [...document.querySelectorAll(".question-card")];
  if (!cards.length) return;

  const answeredOutput = document.querySelector("#quiz-answered");
  const correctOutput = document.querySelector("#quiz-correct");
  const percentOutput = document.querySelector("#quiz-percent");
  const resetButton = document.querySelector("#quiz-reset");
  const searchInput = document.querySelector("#quiz-search");
  const filterSelect = document.querySelector("#quiz-filter");
  const domainStatsOutput = document.querySelector("#quiz-domain-stats");
  const emptyOutput = document.querySelector("#quiz-empty");
  const results = new Map();
  const dirtyResults = new Map();
  const searchableText = new Map();
  const selectedDragItems = new Map();
  const domainShortNames = {
    "q-fundamentals": "Fundamentals",
    "q-access": "Access",
    "q-connectivity": "Connectivity",
    "q-services": "Services",
    "q-security": "Security",
    "q-automation": "Automation"
  };

  const clearCardResult = (card) => {
    card.classList.remove("is-correct", "is-wrong");
    card.querySelectorAll(".question-options label").forEach((label) => {
      label.classList.remove("is-answer", "is-wrong-choice");
    });
    card.querySelectorAll(".drop-zone").forEach((zone) => {
      zone.classList.remove("is-correct-drop", "is-wrong-drop");
    });
    card.querySelectorAll(".drop-correction").forEach((correction) => correction.remove());
    const feedback = card.querySelector(".question-feedback");
    if (feedback) feedback.textContent = "";
  };

  const isDragCard = (card) => card.dataset.questionType === "drag";

  const getDragItem = (card, key) =>
    [...card.querySelectorAll(".drag-item")].find((item) => item.dataset.key === key);

  const getDragItemLabel = (card, key) => cleanText(getDragItem(card, key)?.textContent || key);

  const clearDragSelection = (card) => {
    selectedDragItems.delete(card.id);
    card.querySelectorAll(".drag-item").forEach((item) => {
      item.classList.remove("is-selected");
      item.setAttribute("aria-pressed", "false");
    });
  };

  const releaseDropZone = (card, zone) => {
    const previousKey = zone.dataset.value;
    if (previousKey) {
      const item = getDragItem(card, previousKey);
      if (item) {
        item.hidden = false;
        item.disabled = false;
      }
    }
    delete zone.dataset.value;
    zone.classList.remove("is-filled", "is-correct-drop", "is-wrong-drop");
    const prompt = cleanText(zone.closest(".drop-row")?.querySelector(".drop-prompt")?.textContent || "pasangan ini");
    zone.querySelector("span").textContent = "Letakkan jawaban";
    zone.setAttribute("aria-label", `Tempat jawaban untuk ${prompt}`);
    zone.closest(".drop-row")?.querySelector(".drop-correction")?.remove();
  };

  const assignDragItem = (card, zone, key) => {
    const item = getDragItem(card, key);
    if (!item) return false;
    const existingZone = [...card.querySelectorAll(".drop-zone")].find(
      (candidate) => candidate !== zone && candidate.dataset.value === key
    );
    if (existingZone) releaseDropZone(card, existingZone);
    if (zone.dataset.value) releaseDropZone(card, zone);

    zone.dataset.value = key;
    zone.classList.add("is-filled");
    zone.querySelector("span").textContent = cleanText(item.textContent);
    const prompt = cleanText(zone.closest(".drop-row")?.querySelector(".drop-prompt")?.textContent || "pasangan ini");
    zone.setAttribute("aria-label", `${prompt}: ${cleanText(item.textContent)}. Pilih untuk mengosongkan atau mengganti.`);
    item.hidden = true;
    item.disabled = true;
    clearDragSelection(card);
    return true;
  };

  const getDragAssignments = (card) =>
    Object.fromEntries(
      [...card.querySelectorAll(".drop-zone[data-value]")].map((zone) => [zone.dataset.slot, zone.dataset.value])
    );

  const showCardResult = (card, selected) => {
    clearCardResult(card);
    const correctAnswer = card.dataset.answer;
    const isCorrect = selected.value === correctAnswer;
    const correctInput = [...card.querySelectorAll('input[type="radio"]')].find(
      (input) => input.value === correctAnswer
    );
    const feedback = card.querySelector(".question-feedback");

    correctInput?.closest("label")?.classList.add("is-answer");
    if (isCorrect) {
      card.classList.add("is-correct");
      if (feedback) feedback.textContent = "Benar.";
    } else {
      card.classList.add("is-wrong");
      selected.closest("label")?.classList.add("is-wrong-choice");
      if (feedback) feedback.textContent = "Belum tepat. Jawaban yang benar: " + correctAnswer + ".";
    }

    dirtyResults.delete(card.id);
    results.set(card.id, isCorrect);
    const answerDetails = card.querySelector(".question-answer");
    if (answerDetails) answerDetails.open = true;
  };

  const showDragResult = (card) => {
    clearCardResult(card);
    const zones = [...card.querySelectorAll(".drop-zone")];
    const isCorrect = zones.every((zone) => zone.dataset.value === zone.dataset.accept);
    const feedback = card.querySelector(".question-feedback");

    zones.forEach((zone) => {
      const correct = zone.dataset.value === zone.dataset.accept;
      zone.classList.add(correct ? "is-correct-drop" : "is-wrong-drop");
      if (!correct) {
        const correction = document.createElement("span");
        correction.className = "drop-correction";
        correction.textContent = `Jawaban benar: ${getDragItemLabel(card, zone.dataset.accept)}`;
        zone.closest(".drop-row")?.append(correction);
      }
    });

    card.classList.add(isCorrect ? "is-correct" : "is-wrong");
    if (feedback) {
      feedback.textContent = isCorrect
        ? "Benar. Semua pasangan tepat."
        : "Belum tepat. Periksa pasangan yang ditandai.";
    }
    dirtyResults.delete(card.id);
    results.set(card.id, isCorrect);
    const answerDetails = card.querySelector(".question-answer");
    if (answerDetails) answerDetails.open = true;
  };

  const markCardForRecheck = (card, previousResult) => {
    results.delete(card.id);
    dirtyResults.set(card.id, previousResult);
    clearCardResult(card);
    const feedback = card.querySelector(".question-feedback");
    if (feedback) feedback.textContent = "Jawaban diubah. Periksa ulang untuk memperbarui hasil.";
  };

  const getStoredState = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(QUIZ_STORAGE_KEY));
      if (value?.version === 4 && value.answers && typeof value.answers === "object") {
        return value.answers;
      }

      const remapV3Id = (oldId) => {
        const oldNumber = Number(oldId.slice(1));
        if (!Number.isInteger(oldNumber) || oldNumber < 1 || oldNumber > 150) return null;
        const offset = oldNumber <= 30 ? 0 : oldNumber <= 60 ? 10 : oldNumber <= 98 ? 20 : oldNumber <= 113 ? 32 : oldNumber <= 135 ? 37 : 45;
        return `q${String(oldNumber + offset).padStart(2, "0")}`;
      };
      const previous = JSON.parse(window.localStorage.getItem(PREVIOUS_QUIZ_STORAGE_KEY));
      if (previous?.version === 3 && previous.answers && typeof previous.answers === "object") {
        const migrated = {};
        Object.entries(previous.answers).forEach(([oldId, answer]) => {
          const newId = remapV3Id(oldId);
          if (newId) migrated[newId] = answer;
        });
        return migrated;
      }

      const legacy = JSON.parse(window.localStorage.getItem(LEGACY_QUIZ_STORAGE_KEY));
      if (legacy?.version !== 2 || !legacy.answers || typeof legacy.answers !== "object") return {};
      const migrated = {};
      Object.entries(legacy.answers).forEach(([oldId, answer]) => {
        const oldNumber = Number(oldId.slice(1));
        if (!Number.isInteger(oldNumber) || oldNumber < 1 || oldNumber > 100) return;
        const v3Offset = oldNumber <= 20 ? 0 : oldNumber <= 40 ? 10 : oldNumber <= 65 ? 20 : oldNumber <= 75 ? 33 : oldNumber <= 90 ? 38 : 45;
        const newId = remapV3Id(`q${String(oldNumber + v3Offset).padStart(2, "0")}`);
        if (newId) migrated[newId] = answer;
      });
      return migrated;
    } catch {
      return {};
    }
  };

  const saveState = () => {
    const answers = {};
    cards.forEach((card) => {
      if (isDragCard(card)) {
        const assignments = getDragAssignments(card);
        if (!Object.keys(assignments).length) return;
        answers[card.id] = {
          type: "drag",
          assignments,
          checked: results.has(card.id),
          dirtyFrom: dirtyResults.has(card.id) ? dirtyResults.get(card.id) : null
        };
        return;
      }
      const selected = card.querySelector('input[type="radio"]:checked');
      if (!selected) return;
      answers[card.id] = {
        selected: selected.value,
        checked: results.has(card.id),
        dirtyFrom: dirtyResults.has(card.id) ? dirtyResults.get(card.id) : null
      };
    });

    try {
      window.localStorage.setItem(
        QUIZ_STORAGE_KEY,
        JSON.stringify({ version: 4, answers })
      );
    } catch {
      // The quiz remains usable when storage is unavailable or full.
    }
  };

  const clearStoredState = () => {
    try {
      window.localStorage.removeItem(QUIZ_STORAGE_KEY);
      window.localStorage.removeItem(PREVIOUS_QUIZ_STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_QUIZ_STORAGE_KEY);
    } catch {
      // Reset the in-memory state even when storage is unavailable.
    }
  };

  const updateDomainStats = () => {
    if (!domainStatsOutput) return;
    const fragment = document.createDocumentFragment();

    document.querySelectorAll(".question-domain").forEach((domain) => {
      const domainCards = [...domain.querySelectorAll(".question-card")];
      if (!domainCards.length) return;
      const checked = domainCards.filter((card) => results.has(card.id)).length;
      const correct = domainCards.filter((card) => results.get(card.id) === true).length;
      const name = cleanText(domain.querySelector("h2")?.textContent || "Domain");
      const stat = document.createElement("span");
      stat.className = "quiz-domain-stat";
      stat.setAttribute(
        "aria-label",
        `${name}: ${correct} benar, ${checked} dari ${domainCards.length} diperiksa`
      );
      const label = document.createElement("span");
      label.textContent = domainShortNames[domain.id] || name;
      const value = document.createElement("b");
      value.textContent = `${correct} benar · ${checked}/${domainCards.length}`;
      stat.append(label, value);
      fragment.append(stat);
    });

    domainStatsOutput.replaceChildren(fragment);
  };

  const updateFilters = () => {
    const query = cleanText(searchInput?.value || "").toLocaleLowerCase("id");
    const filter = filterSelect?.value || "all";

    cards.forEach((card) => {
      const matchesSearch = !query || searchableText.get(card).includes(query);
      let matchesStatus = true;
      if (filter === "unanswered") matchesStatus = !results.has(card.id);
      if (filter === "correct") {
        matchesStatus = results.get(card.id) === true || dirtyResults.get(card.id) === true;
      }
      if (filter === "wrong") {
        matchesStatus = results.get(card.id) === false || dirtyResults.get(card.id) === false;
      }
      card.hidden = !(matchesSearch && matchesStatus);
    });

    document.querySelectorAll(".question-domain").forEach((domain) => {
      const domainCards = [...domain.querySelectorAll(".question-card")];
      domain.hidden = domainCards.length > 0 && domainCards.every((card) => card.hidden);
    });

    if (emptyOutput) {
      emptyOutput.hidden = cards.some((card) => !card.hidden);
    }
  };

  const updateQuizDisplay = () => {
    const correct = [...results.values()].filter(Boolean).length;
    if (answeredOutput) answeredOutput.textContent = results.size;
    if (correctOutput) correctOutput.textContent = correct;
    if (percentOutput) percentOutput.textContent = Math.round((correct / cards.length) * 100) + "%";
    updateDomainStats();
    updateFilters();
  };

  const focusAfterFilteredCard = (card) => {
    if (!card.hidden) return;
    const currentIndex = cards.indexOf(card);
    const nextCard =
      cards.find((candidate, index) => index > currentIndex && !candidate.hidden) ||
      [...cards].reverse().find((candidate, index) => cards.length - 1 - index < currentIndex && !candidate.hidden);
    const nextHeading = nextCard?.querySelector("h3");

    if (nextHeading) {
      nextHeading.tabIndex = -1;
      nextHeading.focus();
      return;
    }
    if (emptyOutput && !emptyOutput.hidden) {
      emptyOutput.tabIndex = -1;
      emptyOutput.focus();
      return;
    }
    filterSelect?.focus();
  };

  cards.forEach((card) => {
    const heading = card.querySelector("h3");
    const options = card.querySelector(".question-options");
    const checkButton = card.querySelector(".question-check");
    const answerDetails = card.querySelector(".question-answer");
    const answerSummary = answerDetails?.querySelector("summary");
    const questionNumber = cleanText(card.querySelector(".question-number")?.textContent || card.id);
    const questionTitle = cleanText(heading?.textContent || "");
    const context = `soal ${questionNumber}: ${questionTitle}`;

    if (heading && !isDragCard(card)) {
      heading.id ||= `${card.id}-title`;
      options?.setAttribute("role", "radiogroup");
      options?.setAttribute("aria-labelledby", heading.id);
    }
    checkButton?.setAttribute("aria-label", `Periksa jawaban ${context}`);
    answerSummary?.setAttribute("aria-label", `Buka atau tutup pembahasan ${context}`);
    searchableText.set(
      card,
      cleanText(
        [
          questionNumber,
          card.id,
          card.querySelector("header small")?.textContent,
          questionTitle,
          card.querySelector(".question-options")?.textContent,
          card.querySelector(".drag-layout")?.textContent
        ]
          .filter(Boolean)
          .join(" ")
      ).toLocaleLowerCase("id")
    );

    card.querySelectorAll('input[type="radio"]').forEach((input) => {
      input.addEventListener("change", () => {
        if (results.has(card.id)) {
          markCardForRecheck(card, results.get(card.id));
        }
        saveState();
        updateQuizDisplay();
      });
    });

    if (isDragCard(card)) {
      card.querySelectorAll(".drag-item").forEach((item) => {
        item.setAttribute("aria-pressed", "false");
        item.addEventListener("click", () => {
          const wasSelected = selectedDragItems.get(card.id) === item.dataset.key;
          clearDragSelection(card);
          if (!wasSelected) {
            selectedDragItems.set(card.id, item.dataset.key);
            item.classList.add("is-selected");
            item.setAttribute("aria-pressed", "true");
          }
        });
        item.addEventListener("dragstart", (event) => {
          event.dataTransfer?.setData("text/plain", item.dataset.key);
          if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
          item.classList.add("is-dragging");
        });
        item.addEventListener("dragend", () => item.classList.remove("is-dragging"));
      });

      card.querySelectorAll(".drop-zone").forEach((zone) => {
        zone.addEventListener("dragover", (event) => {
          event.preventDefault();
          zone.classList.add("is-drag-over");
          if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
        });
        zone.addEventListener("dragleave", () => zone.classList.remove("is-drag-over"));
        zone.addEventListener("drop", (event) => {
          event.preventDefault();
          zone.classList.remove("is-drag-over");
          const key = event.dataTransfer?.getData("text/plain");
          if (!key || !assignDragItem(card, zone, key)) return;
          if (results.has(card.id)) markCardForRecheck(card, results.get(card.id));
          saveState();
          updateQuizDisplay();
        });
        zone.addEventListener("click", () => {
          const selectedKey = selectedDragItems.get(card.id);
          let changed = false;
          if (selectedKey) changed = assignDragItem(card, zone, selectedKey);
          else if (zone.dataset.value) {
            releaseDropZone(card, zone);
            changed = true;
          }
          if (!changed) return;
          if (results.has(card.id)) markCardForRecheck(card, results.get(card.id));
          saveState();
          updateQuizDisplay();
        });
      });
    }

    checkButton?.addEventListener("click", () => {
      if (isDragCard(card)) {
        const zones = [...card.querySelectorAll(".drop-zone")];
        if (zones.some((zone) => !zone.dataset.value)) {
          const feedback = card.querySelector(".question-feedback");
          if (feedback) feedback.textContent = "Lengkapi semua pasangan terlebih dahulu.";
          updateQuizDisplay();
          return;
        }
        const hadFocus = card.contains(document.activeElement);
        showDragResult(card);
        saveState();
        updateQuizDisplay();
        if (hadFocus) focusAfterFilteredCard(card);
        return;
      }
      const selected = card.querySelector('input[type="radio"]:checked');
      if (!selected) {
        const feedback = card.querySelector(".question-feedback");
        if (feedback) feedback.textContent = "Pilih satu jawaban terlebih dahulu.";
        updateQuizDisplay();
        return;
      }

      const hadFocus = card.contains(document.activeElement);
      showCardResult(card, selected);
      saveState();
      updateQuizDisplay();
      if (hadFocus) focusAfterFilteredCard(card);
    });
  });

  const storedAnswers = getStoredState();
  cards.forEach((card) => {
    const storedAnswer = storedAnswers[card.id];
    if (isDragCard(card)) {
      if (!storedAnswer?.assignments || typeof storedAnswer.assignments !== "object") return;
      Object.entries(storedAnswer.assignments).forEach(([slot, key]) => {
        const zone = [...card.querySelectorAll(".drop-zone")].find((candidate) => candidate.dataset.slot === slot);
        if (zone && typeof key === "string") assignDragItem(card, zone, key);
      });
      if (storedAnswer.checked === true && [...card.querySelectorAll(".drop-zone")].every((zone) => zone.dataset.value)) {
        showDragResult(card);
      } else if (typeof storedAnswer.dirtyFrom === "boolean") {
        dirtyResults.set(card.id, storedAnswer.dirtyFrom);
        const feedback = card.querySelector(".question-feedback");
        if (feedback) feedback.textContent = "Jawaban diubah. Periksa ulang untuk memperbarui hasil.";
      }
      return;
    }
    if (!storedAnswer || typeof storedAnswer.selected !== "string") return;
    const selected = [...card.querySelectorAll('input[type="radio"]')].find(
      (input) => input.value === storedAnswer.selected
    );
    if (!selected) return;
    selected.checked = true;
    if (storedAnswer.checked === true) {
      showCardResult(card, selected);
    } else if (typeof storedAnswer.dirtyFrom === "boolean") {
      dirtyResults.set(card.id, storedAnswer.dirtyFrom);
      const feedback = card.querySelector(".question-feedback");
      if (feedback) feedback.textContent = "Jawaban diubah. Periksa ulang untuk memperbarui hasil.";
      const answerDetails = card.querySelector(".question-answer");
      if (answerDetails) answerDetails.open = true;
    }
  });

  searchInput?.addEventListener("input", updateFilters);
  filterSelect?.addEventListener("change", updateFilters);

  resetButton?.addEventListener("click", () => {
    if (!window.confirm("Hapus seluruh jawaban dan progres latihan soal?")) return;
    cards.forEach((card) => {
      card.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = false;
      });
      card.querySelectorAll(".drop-zone").forEach((zone) => releaseDropZone(card, zone));
      clearDragSelection(card);
      const answerDetails = card.querySelector(".question-answer");
      if (answerDetails) answerDetails.open = false;
      clearCardResult(card);
    });
    results.clear();
    dirtyResults.clear();
    clearStoredState();
    if (searchInput) searchInput.value = "";
    if (filterSelect) filterSelect.value = "all";
    updateQuizDisplay();
  });

  updateQuizDisplay();
};

let printDetailsState = [];

window.addEventListener("beforeprint", () => {
  printDetailsState = [...document.querySelectorAll("details")].map((details) => ({
    details,
    wasOpen: details.open
  }));
  printDetailsState.forEach(({ details }) => {
    details.open = true;
  });
});

window.addEventListener("afterprint", () => {
  printDetailsState.forEach(({ details, wasOpen }) => {
    details.open = wasOpen;
  });
  printDetailsState = [];
});

addStandardPanels();
addCopyButtons();
initializeQuiz();

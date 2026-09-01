const fs = require('fs');

const html = fs.readFileSync('labs.html', 'utf-8');
const oldGetDevices = (title) => {
  const value = title.toLowerCase();
  if (/wlan|wireless|wlc|\brf\b/.test(value)) return "WLC/simulator, 1–3 AP, switch, dan wireless client.";
  if (/\bapi\b|json|ansible|automation|terraform|compliance/.test(value)) return "PC admin, editor teks, serta sandbox API/Ansible.";
  if (/stp|etherchannel|vlan|switch|mac learning|access-layer/.test(value)) return "2–4 switch Cisco dan 2 PC sesuai topologi.";
  if (/ospf|route|routing|nat|dhcp|hsrp|fhrp|vrf|branch|dmz/.test(value)) return "2–4 router/L3 switch, switch akses, dan 2–4 endpoint.";
  if (/topology|architecture|component design/.test(value)) return "Aplikasi diagram atau kertas; simulator bersifat opsional.";
  return "Cisco Packet Tracer/CML dan perangkat sesuai skenario.";
};

const newGetDevices = (topoText) => {
  if (!topoText) return null;
  const routers = new Set();
  const switches = new Set();
  const endpoints = new Set();
  const servers = new Set();
  const wireless = new Set();

  const words = topoText.split(/[\s─┌┼┘┐│═]+/);
  words.forEach((word) => {
    const clean = word.trim().replace(/^\[|\]$/g, "").toUpperCase();
    if (!clean) return;
    if (/^R[1-9]$/.test(clean) || /^ROUTER$/.test(clean)) routers.add(clean);
    else if (/^(SW|DSW|ASW)[1-9]?$/.test(clean)) switches.add(clean);
    else if (/^PC(-[A-Z0-9]+)?$/.test(clean) || /^ADMIN-PC$/.test(clean) || /^HOST$/.test(clean)) endpoints.add(clean);
    else if (/SERVER/.test(clean) || /TFTP/.test(clean)) servers.add(clean);
    else if (/WLC/.test(clean) || /^AP[1-9]?$/.test(clean) || /^LAP[1-9]?$/.test(clean)) wireless.add(clean);
  });

  const parts = [];
  if (routers.size > 0) parts.push(`${routers.size} router`);
  if (switches.size > 0) parts.push(`${switches.size} switch`);
  if (wireless.size > 0) parts.push(`${wireless.size} perangkat wireless`);
  if (servers.size > 0) parts.push(`${servers.size} server`);
  if (endpoints.size > 0) parts.push(`${endpoints.size} PC`);

  if (parts.length > 0) {
    if (parts.length === 1) return parts[0] + " sesuai topologi.";
    const last = parts.pop();
    return parts.join(", ") + " dan " + last + " sesuai topologi.";
  }
  return null;
};

const cards = html.split('<details class="lab-card"');
cards.shift();

let discrepancies = [];

cards.forEach(card => {
  const numMatch = card.match(/<span class="lab-number">(\d+)<\/span>/);
  const titleMatch = card.match(/<span class="lab-title"><h3>(.*?)<\/h3>/);
  if (!numMatch || !titleMatch) return;
  const num = numMatch[1];
  const title = titleMatch[1];

  let topoText = null;
  const briefIdx = card.indexOf('<div class="brief">');
  const answerIdx = card.indexOf('<details class="answer">');
  if (briefIdx !== -1 && answerIdx !== -1) {
    const bodyPart = card.substring(briefIdx, answerIdx);
    const preMatch = bodyPart.match(/<pre><code>([\s\S]*?)<\/code><\/pre>/);
    if (preMatch) {
      topoText = preMatch[1];
    }
  }

  const oldOutput = oldGetDevices(title);
  const newOutput = newGetDevices(topoText) || oldOutput;

  if (oldOutput !== newOutput) {
    discrepancies.push({ num, title, oldOutput, newOutput, topoText: topoText.trim() });
  }
});

console.log(`Ditemukan ${discrepancies.length} lab dengan ketidaksesuaian/perubahan teks perangkat:\n`);
discrepancies.forEach(d => {
  console.log(`Lab ${d.num}: ${d.title}`);
  console.log(`[Topologi]\n${d.topoText}`);
  console.log(`- Teks Lama: ${d.oldOutput}`);
  console.log(`- Teks Baru: ${d.newOutput}\n`);
});

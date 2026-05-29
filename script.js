const form = document.getElementById("relationForm");
const domainInput = document.getElementById("domainInput");
const codomainInput = document.getElementById("codomainInput");
const relationInput = document.getElementById("relationInput");
const resultBox = document.getElementById("resultBox");
const mappingCanvas = document.getElementById("mappingCanvas");
const exampleBtn = document.getElementById("exampleBtn");
const resetBtn = document.getElementById("resetBtn");

function parseSet(value) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseRelation(value) {
  const pairs = [];
  const errors = [];
  const pairPattern = /\(\s*([^,()]+)\s*,\s*([^,()]+)\s*\)/g;
  let match;

  while ((match = pairPattern.exec(value)) !== null) {
    const raw = match[0];
    pairs.push({
      x: match[1].trim(),
      y: match[2].trim(),
      raw,
    });
  }

  const leftover = value
    .replace(pairPattern, "")
    .replace(/[,\s]/g, "");

  if (value.trim() && pairs.length === 0) {
    errors.push("Format relasi belum sesuai. Gunakan format seperti (1,a), (2,b).");
  } else if (leftover.length > 0) {
    errors.push("Ada bagian relasi yang tidak terbaca. Pastikan semua pasangan ditulis dalam bentuk (x,y).");
  }

  return { pairs, errors };
}

function uniqueItems(items) {
  return [...new Set(items)];
}

function analyzeRelation(domain, codomain, pairs, parseErrors) {
  const reasons = [...parseErrors];
  const domainSet = new Set(domain);
  const codomainSet = new Set(codomain);
  const invalidPairs = pairs.filter((pair) => !domainSet.has(pair.x) || !codomainSet.has(pair.y));

  if (domain.length === 0) {
    reasons.push("Himpunan A tidak boleh kosong.");
  }

  if (codomain.length === 0) {
    reasons.push("Himpunan B tidak boleh kosong.");
  }

  invalidPairs.forEach((pair) => {
    if (!domainSet.has(pair.x) && !codomainSet.has(pair.y)) {
      reasons.push(`Pasangan ${pair.raw} tidak valid karena ${pair.x} tidak ada di A dan ${pair.y} tidak ada di B.`);
    } else if (!domainSet.has(pair.x)) {
      reasons.push(`Pasangan ${pair.raw} tidak valid karena ${pair.x} tidak ada di A.`);
    } else {
      reasons.push(`Pasangan ${pair.raw} tidak valid karena ${pair.y} tidak ada di B.`);
    }
  });

  const validRelation = reasons.length === 0;
  const pairCountByDomain = new Map(domain.map((item) => [item, 0]));

  pairs.forEach((pair) => {
    if (domainSet.has(pair.x) && codomainSet.has(pair.y)) {
      pairCountByDomain.set(pair.x, pairCountByDomain.get(pair.x) + 1);
    }
  });

  const missing = domain.filter((item) => pairCountByDomain.get(item) === 0);
  const duplicated = domain.filter((item) => pairCountByDomain.get(item) > 1);
  const functionReasons = [];

  missing.forEach((item) => {
    functionReasons.push(`Elemen ${item} di A tidak memiliki pasangan di B.`);
  });

  duplicated.forEach((item) => {
    functionReasons.push(`Elemen ${item} di A memiliki lebih dari satu pasangan.`);
  });

  const isFunction = validRelation && functionReasons.length === 0;

  return {
    validRelation,
    isFunction,
    reasons,
    functionReasons,
    invalidPairs,
  };
}

function renderResult(analysis) {
  const messages = [];
  let className = "result ";
  let title = "";

  if (!analysis.validRelation) {
    className += "danger";
    title = "Relasi tidak valid";
    messages.push(...analysis.reasons);
  } else if (analysis.isFunction) {
    className += "success";
    title = "Relasi valid dan merupakan fungsi";
    messages.push("Setiap elemen A memiliki tepat satu pasangan di B.");
  } else {
    className += "warning";
    title = "Relasi valid, tetapi bukan fungsi";
    messages.push(...analysis.functionReasons);
  }

  resultBox.className = className;
  resultBox.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
    <ul>${messages.map((message) => `<li>${escapeHtml(message)}</li>`).join("")}</ul>
  `;
}

function renderMapping(domain, codomain, pairs, invalidPairs) {
  if (domain.length === 0 && codomain.length === 0) {
    mappingCanvas.innerHTML = '<p class="placeholder">Visualisasi akan muncul setelah data dianalisis.</p>';
    return;
  }

  const width = 900;
  const rowHeight = 72;
  const topPadding = 72;
  const height = Math.max(320, topPadding + Math.max(domain.length, codomain.length) * rowHeight);
  const domainX = 190;
  const codomainX = 710;
  const nodeRadius = 25;
  const invalidSet = new Set(invalidPairs.map((pair) => pair.raw));
  const validPairs = pairs.filter((pair) => !invalidSet.has(pair.raw));

  const domainPositions = new Map(domain.map((item, index) => [item, topPadding + index * rowHeight]));
  const codomainPositions = new Map(codomain.map((item, index) => [item, topPadding + index * rowHeight]));

  const arrows = validPairs
    .filter((pair) => domainPositions.has(pair.x) && codomainPositions.has(pair.y))
    .map((pair) => {
      const y1 = domainPositions.get(pair.x);
      const y2 = codomainPositions.get(pair.y);
      const midX = (domainX + codomainX) / 2;
      return `<path class="arrow" d="M ${domainX + nodeRadius} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${codomainX - nodeRadius - 8} ${y2}" marker-end="url(#arrowHead)" />`;
    })
    .join("");

  const domainNodes = domain
    .map((item) => renderNode(item, domainX, domainPositions.get(item), "domain"))
    .join("");

  const codomainNodes = codomain
    .map((item) => renderNode(item, codomainX, codomainPositions.get(item), "codomain"))
    .join("");

  const invalidNote = invalidPairs.length
    ? `<div class="invalid-note">Pasangan tidak valid tidak ditampilkan sebagai panah: ${escapeHtml(invalidPairs.map((pair) => pair.raw).join(", "))}</div>`
    : "";

  mappingCanvas.innerHTML = `
    <svg class="mapping-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Visualisasi mapping relasi dari himpunan A ke himpunan B">
      <defs>
        <marker id="arrowHead" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#2563eb"></path>
        </marker>
      </defs>
      <text class="set-title" x="${domainX}" y="32">A</text>
      <text class="set-title" x="${codomainX}" y="32">B</text>
      ${arrows}
      ${domainNodes}
      ${codomainNodes}
    </svg>
    ${invalidNote}
  `;
}

function renderNode(text, x, y, type) {
  return `
    <g>
      <circle class="node ${type}" cx="${x}" cy="${y}" r="25"></circle>
      <text class="node-text" x="${x}" y="${y}">${escapeHtml(text)}</text>
    </g>
  `;
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function runAnalysis() {
  const domain = uniqueItems(parseSet(domainInput.value));
  const codomain = uniqueItems(parseSet(codomainInput.value));
  const relation = parseRelation(relationInput.value);
  const analysis = analyzeRelation(domain, codomain, relation.pairs, relation.errors);

  renderResult(analysis);
  renderMapping(domain, codomain, relation.pairs, analysis.invalidPairs);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  runAnalysis();
});

exampleBtn.addEventListener("click", () => {
  domainInput.value = "1, 2, 3";
  codomainInput.value = "a, b, c";
  relationInput.value = "(1,a), (2,b), (3,c)";
  runAnalysis();
});

resetBtn.addEventListener("click", () => {
  form.reset();
  resultBox.className = "result empty";
  resultBox.textContent = "Masukkan data lalu tekan tombol Analisis.";
  mappingCanvas.innerHTML = '<p class="placeholder">Visualisasi akan muncul setelah data dianalisis.</p>';
});

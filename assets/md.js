/* ─── Parser del formato "ruso — español" de las clases con profesor ─── */
function parseLessonMd(text) {
  const sections = [];
  let cur = { titulo: null, items: [] };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      if (cur.items.length) sections.push(cur);
      cur = { titulo: line.replace(/^#+\s*/, ''), items: [] };
      continue;
    }
    // separador: guion largo, corto o "-" rodeado de espacios
    const m = line.match(/^(.+?)\s+[—–-]\s+(.+)$/);
    if (m) cur.items.push({ ru: m[1].trim(), es: m[2].trim() });
  }
  if (cur.items.length) sections.push(cur);
  return sections;
}

/* Quita las marcas de acento (U+0301) para que el TTS no las lea */
function stripStress(s) { return s.replace(/́/g, ''); }

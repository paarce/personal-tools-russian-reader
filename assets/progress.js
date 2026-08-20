/* ─── Progreso Leitner en localStorage ────────────────────────────
   data/vocabulary.json es la SEMILLA (lista de palabras + estado
   inicial). El avance real vive en el navegador, así que estudiar
   desde el móvil no exige hacer commit. Exportable a JSON.        */
const Progress = (() => {
  const KEY = 'rusoProgress.v1';
  const INTERVALS = { 1: 1, 2: 1, 3: 3, 4: 7, 5: 16 };
  let state = JSON.parse(localStorage.getItem(KEY) || '{}');

  const today = () => new Date().toISOString().slice(0, 10);
  const addDays = (d, n) => {
    const x = new Date(d + 'T00:00:00'); x.setDate(x.getDate() + n);
    return x.toISOString().slice(0, 10);
  };

  function save() { localStorage.setItem(KEY, JSON.stringify(state)); }

  /* Estado efectivo de una palabra: lo guardado, o lo de la semilla */
  function get(word) {
    const s = state[word.id];
    return s ? { ...word, ...s } : { ...word };
  }

  function merge(words) { return words.map(get); }

  function due(words, date = today()) {
    return merge(words).filter(w => !w.next_review || w.next_review <= date);
  }

  /* Registra una respuesta: acierto sube de caja, fallo vuelve a la 1 */
  function mark(word, ok) {
    const w = get(word);
    const box = ok ? Math.min(5, (w.box || 1) + 1) : 1;
    state[word.id] = {
      box,
      next_review: addDays(today(), INTERVALS[box]),
      seen: (w.seen || 0) + 1,
      correct: (w.correct || 0) + (ok ? 1 : 0),
      lapses: (w.lapses || 0) + (ok ? 0 : 1),
      last_review: today()
    };
    save();
    return state[word.id];
  }

  function stats(words) {
    const m = merge(words);
    const boxes = [0, 0, 0, 0, 0, 0];
    m.forEach(w => boxes[w.box || 1]++);
    return {
      total: m.length,
      dominadas: boxes[5],
      pendientes: due(words).length,
      boxes,
      tocadas: Object.keys(state).length
    };
  }

  function exportJSON(seed) {
    const out = {
      ...seed,
      updated: today(),
      words: seed.words.map(get)
    };
    return JSON.stringify(out, null, 1);
  }

  function importJSON(text) {
    const d = JSON.parse(text);
    (d.words || []).forEach(w => {
      state[w.id] = {
        box: w.box, next_review: w.next_review, seen: w.seen,
        correct: w.correct, lapses: w.lapses, last_review: w.last_review
      };
    });
    save();
  }

  function reset() { state = {}; save(); }

  return { get, merge, due, mark, stats, exportJSON, importJSON, reset, today };
})();

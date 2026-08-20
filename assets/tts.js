/* ─── TTS compartido: ElevenLabs con fallback a Web Speech ───── */
const TTS = (() => {
  let key = localStorage.getItem('elevenLabsKey') || '';
  let rate = 0.85;
  let audio = null, utt = null, btn = null;
  const VOICE = 'EXAVITQu4vr4xnSDxMaL';

  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }

  function setKey(k) { key = k.trim(); localStorage.setItem('elevenLabsKey', key); }
  function hasKey() { return !!key; }
  function setRate(r) { rate = r; }

  function stop() {
    if (audio) { audio.pause(); audio = null; }
    if (utt) { speechSynthesis.cancel(); utt = null; }
    if (btn) { btn.classList.remove('on'); btn = null; }
  }

  async function eleven(text) {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'xi-api-key': key },
      body: JSON.stringify({
        text, model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.6, similarity_boost: 0.8, speed: rate }
      })
    });
    if (!res.ok) throw new Error('ElevenLabs HTTP ' + res.status);
    const url = URL.createObjectURL(await res.blob());
    const a = new Audio(url); audio = a;
    return new Promise(resolve => {
      const done = () => { URL.revokeObjectURL(url); audio = null; resolve(); };
      a.onended = done; a.onerror = done; a.play();
    });
  }

  function web(text) {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'ru-RU'; u.rate = rate;
      const v = speechSynthesis.getVoices().find(x => x.lang.startsWith('ru'));
      if (v) u.voice = v;
      utt = u;
      u.onend = u.onerror = () => { utt = null; resolve(); };
      speechSynthesis.speak(u);
    });
  }

  /* Reproduce `text`; si `el` ya suena, lo para (toggle). */
  async function speak(text, el) {
    if (el && el.classList.contains('on')) { stop(); return; }
    stop();
    if (el) { el.classList.add('on'); btn = el; }
    try { key ? await eleven(text) : await web(text); }
    catch (e) { console.warn(e); await web(text); }
    if (btn === el && el) { el.classList.remove('on'); btn = null; }
  }

  return { speak, stop, setKey, hasKey, setRate };
})();

/* Icono play reutilizable */
const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6,3 20,12 6,21"/></svg>';

function playBtn(text) {
  const b = document.createElement('button');
  b.className = 'play';
  b.innerHTML = PLAY_SVG;
  b.onclick = e => { e.stopPropagation(); TTS.speak(text, b); };
  return b;
}

function toast(msg) {
  let t = document.querySelector('.toast');
  if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._h);
  t._h = setTimeout(() => t.classList.remove('show'), 2500);
}

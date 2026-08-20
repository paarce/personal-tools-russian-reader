# Formato de datos

El sitio es estático: HTML + JS que leen JSON. **No hay build.** Al añadir una
clase solo se escriben datos y se regenera el manifiesto.

## Añadir una clase generada

1. Escribe `lessons/generated/AAAA-MM-DD/lesson.json` (esquema abajo).
2. Ejecuta `python3 build_manifest.py`.
3. Commit. GitHub Pages la publica y aparece sola en la portada.

## Esquema de `lesson.json`

```jsonc
{
  "version": 1,
  "fecha": "2026-08-20",        // AAAA-MM-DD, también el nombre de la carpeta y el id
  "numero": 3,                   // nº de lección, correlativo
  "titulo": "Урок 3",
  "semana": 1,
  "gramatica": "Género de los sustantivos",
  "duracion_min": 15,
  "foco": "Texto en español que explica el objetivo del día.",
  "bloques": [ /* ver los tres tipos */ ]
}
```

Cada bloque comparte cabecera: `n` (orden), `titulo`, `minutos`, `intro`
(opcional), y `tipo`, que decide cómo se pinta.

### `tipo: "vocabulario"` — palabras nuevas

```jsonc
{
  "n": 1, "titulo": "Calentamiento — palabras nuevas", "minutos": 3,
  "intro": "Escucha cada una dos veces…",
  "tipo": "vocabulario",
  "items": [
    { "ru": "мужчина",        // sin acento: es lo que se manda al TTS
      "ru_stress": "мужчи́на", // con acento (U+0301): lo que se muestra
      "translit": "muzhchina",
      "es": "hombre" }
  ]
}
```

### `tipo: "repaso"` — flashcards

Igual que arriba, más `id`: **debe coincidir con el `id` de la palabra en
`data/vocabulary.json`**, porque con él se guarda el progreso Leitner.

```jsonc
{
  "n": 2, "titulo": "Repaso espaciado", "minutos": 6, "tipo": "repaso",
  "items": [
    { "id": 13, "es": "sí", "ru": "да", "ru_stress": "да", "translit": "da" }
  ]
}
```

### `tipo: "gramatica"` — reglas y frases

```jsonc
{
  "n": 3, "titulo": "Gramática en contexto", "minutos": 6, "tipo": "gramatica",
  "tema": "Género de los sustantivos",
  "explicacion": "Párrafo introductorio.",
  "reglas": [ { "regla": "Consonante final → masculino",
                "ejemplos": "брат · друг · сын" } ],
  "frases": [ { "ru": "Это мама.", "ru_stress": "Э́то ма́ма.",
                "es": "Esta es mamá.",
                "nota": "mama termina en -а: femenino regular" } ]
}
```

## `data/vocabulary.json` — semilla del vocabulario

Fuente única de las palabras y su estado Leitner inicial. Palabra:

```jsonc
{ "id": 1, "ru": "привет", "ru_stress": "приве́т", "translit": "privet",
  "es": "hola (informal)", "tema": "Saludos y cortesía",
  "box": 3, "next_review": "2026-08-22",
  "seen": 2, "correct": 2, "lapses": 0,
  "added": "2026-08-18", "source": "base-a1" }
```

Al generar una clase, **añade aquí las palabras nuevas** con un `id` no usado.

> El progreso real (box, next_review, seen…) vive en el `localStorage` del
> navegador, no en el repo: así se puede estudiar desde el móvil sin hacer
> commit. Este fichero es solo el punto de partida. Desde *Repaso → Ajustes*
> se exporta el progreso a JSON para volcarlo aquí cuando interese.

## Clases con profesor

`lessons/teacher/*.md`, formato `ruso — español`, una por línea, con `#` como
sección. No hay que tocar nada más: `build_manifest.py` las recoge.

```markdown
# Conversación práctica

Привет! Как тебя зовут? — ¡Hola! ¿Cómo te llamas?
```

## Ficheros

| Ruta | Qué es |
|---|---|
| `index.html` | Portada: lista todas las clases, filtros, stats |
| `lesson.html` | Visor único (`?id=…`), pinta md y lesson.json |
| `review.html` | Repaso Leitner sobre todo el vocabulario |
| `assets/style.css` | Estilos compartidos |
| `assets/tts.js` | Voz: ElevenLabs con fallback a Web Speech |
| `assets/md.js` | Parser del formato `ruso — español` |
| `assets/progress.js` | Leitner en localStorage + export/import |
| `data/manifest.json` | Índice de clases — **generado** |
| `data/vocabulary.json` | Semilla del vocabulario |
| `build_manifest.py` | Regenera el manifiesto |

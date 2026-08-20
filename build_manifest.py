#!/usr/bin/env python3
"""Regenera data/manifest.json escaneando lessons/.

Ejecutar tras añadir una clase nueva:  python3 build_manifest.py
"""
import json, datetime
from pathlib import Path

ROOT = Path(__file__).parent
TITULOS = {
    'clase_pronombres': 'Pronombres',
    'clase_numeros_1': 'Números (1)',
    'clase_dias_meses_numeros': 'Días, meses y números',
    'clase_conjugaciones': 'Conjugaciones',
    'clase_familia_personas': 'Familia y personas',
    'clase_familia': 'La familia',
    'clase_adjetivos_adverbios': 'Adjetivos y adverbios',
    'clase_verbos_reflexivos': 'Verbos reflexivos',
    'clase_dialogos': 'Diálogos',
    'clase_cultura_rusa': 'Cultura rusa',
    'clase_lectura_biografias': 'Lectura: biografías',
    'clase_vocabulario_completo': 'Vocabulario completo',
    'dialogo_ruso_metro': 'Diálogo: el metro',
    'ejemplo-vocabulario': 'Ejemplo de vocabulario',
}


def titulo_seccion(linea):
    """'Familia — Семья' → 'Familia' (nos quedamos con el lado español)."""
    t = linea.lstrip('#').strip()
    for sep in ('—', '–'):
        if sep in t:
            return t.split(sep)[0].strip()
    return t


def clases_profesor():
    for p in sorted((ROOT / 'lessons/teacher').glob('*.md')):
        lineas = p.read_text().splitlines()
        entradas = sum(1 for l in lineas
                       if l.strip() and not l.startswith('#') and '—' in l)
        temas = [titulo_seccion(l) for l in lineas if l.startswith('#')]
        yield {
            'id': p.stem,
            'titulo': TITULOS.get(p.stem, p.stem.replace('_', ' ').capitalize()),
            'origen': 'profesor',
            'fecha': datetime.date.fromtimestamp(p.stat().st_mtime).isoformat(),
            'formato': 'md',
            'path': f'lessons/teacher/{p.name}',
            'entradas': entradas,
            'temas': temas[:4],
        }


def clases_generadas():
    for p in sorted((ROOT / 'lessons/generated').glob('*/lesson.json')):
        d = json.loads(p.read_text())
        yield {
            'id': d['fecha'],
            'titulo': d['titulo'],
            'origen': 'ia',
            'fecha': d['fecha'],
            'formato': 'lesson-json',
            'path': f'lessons/generated/{p.parent.name}/lesson.json',
            'semana': d.get('semana'),
            'duracion_min': d.get('duracion_min'),
            'temas': [d['gramatica']] if d.get('gramatica') else [],
            'entradas': sum(len(b.get('items', [])) for b in d['bloques']),
        }


def main():
    lecciones = sorted([*clases_profesor(), *clases_generadas()],
                       key=lambda x: x['fecha'], reverse=True)
    salida = ROOT / 'data/manifest.json'
    salida.write_text(json.dumps(
        {'version': 1, 'generado': datetime.date.today().isoformat(),
         'lecciones': lecciones}, ensure_ascii=False, indent=1) + '\n')
    print(f'{len(lecciones)} lecciones → {salida.relative_to(ROOT)}')


if __name__ == '__main__':
    main()

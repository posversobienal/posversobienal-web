#!/usr/bin/env python3
# -*- coding:utf-8 -*-


from os import listdir, makedirs
from os.path import splitext, dirname
from pathlib import Path
from time import gmtime, strftime, time_ns
import json
import yaml
import hashlib
from jinja2 import Environment, FileSystemLoader
from markdown import Markdown
from markdown.inlinepatterns import SimpleTagInlineProcessor
from markdown.extensions import Extension
from random import shuffle
from bs4 import BeautifulSoup

# ------ funciones generales
def desordenar(l):
    m = l.copy()
    shuffle(m)
    return m

def orden_inverso(l):
    return l[::-1]

def fecha_prensa(t):
    return t.split('_')[0]

def md_a_html(texto, pag_propia={}):
    global dat_cfg
    global dat_rec
    global env_jinja2
    tpl = env_jinja2.from_string(texto)
    texto = tpl.render(cfg=dat_cfg, rec=dat_rec, pag=pag_propia)
    md = Markdown(extensions=markdown_extensiones, extension_configs=markdown_extensiones_config)
    return md.convert(texto)

def md_a_textoplano(texto, pag_propia={}):
    html = md_a_html(texto, pag_propia)
    textoplano = BeautifulSoup(html, 'html.parser').get_text(separator='\n', strip=True)
    return textoplano

def datos_de(tipo, archivo):
    re = {}
    po = {
        'bitacora': './datos/bitacora/{archivo}.yml',
        'publicaciones': './datos/publicaciones/{archivo}.yml',
        'mediacion_educativa': './datos/mediacion_educativa/{archivo}.yml',
    }
    if tipo in po:
        with open(po[tipo].format(archivo=archivo), 'r') as f:
            re = yaml.safe_load(f)
    return re

def datos_de_persona(k, tipo='n+l', formato='md', urlhash=''):
    if k in dat_per:
        d = dat_per[k]
        nom = d['nombre']
        ape = d['apellido']
        seu = d['seudonimo']
        if tipo == 'n+l':
            if formato == 'md':
                if len(seu) > 1:
                    return f'[{seu} <small>( {nom} {ape} )</small>](/per/{k}/{urlhash})'
                else:
                    return f'[{nom} {ape}](/per/{k}/{urlhash})'
            elif formato == 'html':
                if len(seu) > 1:
                    return f'<a href="/per/{k}/{urlhash}">{seu} <small>( {nom} {ape} )</small></a>'
                else:
                    return f'<a href="/per/{k}/{urlhash}">{nom} {ape}</a>'
    return k

def datos_de_sede(k, tipo='n+l', formato='md'):
    if k in dat_sds:
        d = dat_sds[k]
        nom = d['nombre']
        if tipo == 'n+l':
            if formato == 'md':
                return f'[{nom}](/sds/{k}/)'
            elif formato == 'html':
                return f'<a href="/sds/{k}/">{nom}</a>'
    return k

def url_dominio(texto):
    return texto.split(':')[1].strip('/')

def id_redsocial(texto):
    return texto.split('/')[-1].strip()

def leer_yml(ar):
    with open(ar, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def listar_id(tipo):
    if tipo == 'novedades':
        return sorted([splitext(ar)[0] for ar in listdir('./datos/bitacora/') if ar.endswith('.yml') ])
    return []

def idioma(tipo):
    # Corregido typo unicode en clase CSS
    html = '<div class="my-2 py-2 text-end lang" id="{lang}"></div>'
    lang = ''
    if tipo == 'esp': lang = 'esp'
    elif tipo == 'eng': lang = 'eng'
    return html.format(lang=lang) if lang else  ''

# ------ funciones de control de estado y hash
STATE_FILE = './build_state.json'

def calcular_hash_archivo(ruta):
    try:
        with open(ruta, 'rb') as f:
            return hashlib.md5(f.read()).hexdigest()
    except FileNotFoundError:
        return ""

def calcular_hash_diccionario(dic):
    s = json.dumps(dic, sort_keys=True)
    return hashlib.md5(s.encode('utf-8')).hexdigest()

def hash_global_templates(ruta_tpl='plantillas'):
    h = hashlib.md5()
    for p in Path(ruta_tpl).rglob('*'):
        if p.is_file():
            h.update(p.read_bytes())
    return h.hexdigest()

def cargar_estado():
    if Path(STATE_FILE).exists():
        with open(STATE_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"data": {}, "templates": "", "globals": "", "outputs": [], "cfg_js_hash": "", "rec_js_hash": ""}

def guardar_estado(estado):
    with open(STATE_FILE, 'w', encoding='utf-8') as f:
        json.dump(estado, f, indent=2)

# ------ configuracion general
markdown_extensiones = [ 'tables', 'attr_list', 'toc', 'abbr', 'footnotes' ]
markdown_extensiones_config = { 'tables': {}, 'attr_list': {}, 'toc': {}, 'abbr': {}, 'footnotes': {}}
ruta_public = '../docs/'
ruta_cfg_in = './datos/configuracion/'
ar_cronograma = './datos/cronograma/2024.yml'
ar_cfg_out = f'{ruta_public}dat/cfg.js'
ar_rec_out = f'{ruta_public}dat/rec.js'

# carga de configuraciones
dat_cfg = {}
for ar_cfg in listdir(ruta_cfg_in):
    if ar_cfg.endswith('.yml'):
        idc = splitext(ar_cfg)[0]
        with open(f'{ruta_cfg_in}{ar_cfg}', 'r', encoding='utf-8') as f:
            dat_cfg[idc] = yaml.safe_load(f)

with open(ar_cronograma, 'r', encoding='utf-8') as f:
    dat_cronograma = yaml.safe_load(f)
dat_cfg['cronograma'] = dat_cronograma['fechas']

# compilaciones de recursos
rutas_recursos = [
    ['./datos/artistas/', 'artistas'],
    ['./datos/personas/', 'personas'],
    ['./datos/obras/', 'obras'],
    ['./datos/sedes/', 'sedes'],
    ['./datos/publicaciones/', 'publicaciones'],
    ['./datos/mediacion_educativa/', 'mediacion_educativa'],
    ['./datos/bitacora/', 'bitacora'],
]
dat_rec = {}
for d in rutas_recursos:
    r, k = d
    if not k in dat_rec:
        dat_rec[k] = {}
    for a in sorted(listdir(r)):
        if a.endswith('.yml'):
            dat_rec[k][splitext(a)[0]] = leer_yml(f'{r}{a}')

dat_per = {}
for k in ['artistas', 'personas']:
    if k in dat_rec:
        for k2, v2 in dat_rec[k].items():
            dat_per[k2] = v2

dat_sds = {}
for k in ['sedes']:
    if k in dat_rec:
        for k2, v2 in dat_rec[k].items():
            dat_sds[k2] = v2

# Inicializar entorno Jinja2
fl = FileSystemLoader('plantillas')
env_jinja2 = Environment(loader=fl)
env_jinja2.globals.update(markdown = md_a_html)
env_jinja2.globals.update(plaintext = md_a_textoplano)
env_jinja2.globals.update(url_dominio = url_dominio)
env_jinja2.globals.update(id_redsocial = id_redsocial)
env_jinja2.globals.update(datos_de = datos_de)
env_jinja2.globals.update(listar_id = listar_id)
env_jinja2.globals.update(idioma = idioma)
env_jinja2.globals.update(desordenar = desordenar)
env_jinja2.globals.update(orden_inverso = orden_inverso)
env_jinja2.globals.update(fecha_prensa = fecha_prensa)
env_jinja2.globals.update(per = datos_de_persona)
env_jinja2.globals.update(sds = datos_de_sede)

def actualizar_todo():
    estado = cargar_estado()

    hash_globals = calcular_hash_diccionario({"cfg": dat_cfg, "rec": dat_rec})
    hash_templates = hash_global_templates('plantillas')

    globales_cambiaron = estado.get("globals") != hash_globals
    templates_cambiaron = estado.get("templates") != hash_templates

    # Actualizar JS globales solo si su contenido cambio
    hash_cfg_js = calcular_hash_diccionario(dat_cfg)
    if estado.get("cfg_js_hash") != hash_cfg_js:
        makedirs(dirname(ar_cfg_out), exist_ok=True)
        with open(ar_cfg_out, 'w', encoding='utf-8') as g:
            g.write('const cfg = ' + json.dumps(dat_cfg))

    hash_rec_js = calcular_hash_diccionario(dat_rec)
    if estado.get("rec_js_hash") != hash_rec_js:
        makedirs(dirname(ar_rec_out), exist_ok=True)
        with open(ar_rec_out, 'w', encoding='utf-8') as g:
            g.write('const rec = ' + json.dumps(dat_rec))

    nuevos_outputs = []
    nuevo_estado = {
        "data": {},
        "templates": hash_templates,
        "globals": hash_globals,
        "outputs": [],
        "cfg_js_hash": hash_cfg_js,
        "rec_js_hash": hash_rec_js
    }

    categorias_fijas = [
        ('./datos/personas/', 'persona.html', f'{ruta_public}per/', 'personas'),
        ('./datos/artistas/', 'persona_artista.html', f'{ruta_public}per/', 'artistas'),
        ('./datos/sedes/', 'sede.html', f'{ruta_public}sds/', 'sedes'),
        ('./datos/bitacora/', 'bitacora.html', f'{ruta_public}bit/', 'bitacora'),
        ('./datos/publicaciones/', 'publicaciones.html', f'{ruta_public}pub/', 'publicaciones'),
        ('./datos/mediacion_educativa/', 'mediacion_educativa.html', f'{ruta_public}edu/', 'mediacion_educativa')
    ]

    for carpeta, tpl_def, out_dir, tipo in categorias_fijas:
        if not Path(carpeta).exists(): continue
        for ar in listdir(carpeta):
            if not ar.endswith('.yml'): continue
            ruta_in = f'{carpeta}{ar}'
            dat_pag = leer_yml(ruta_in)

            if tipo in ['personas', 'artistas']:
                dat_pag['titulo'] = f"{dat_pag['nombre']} {dat_pag['apellido']}"
            elif tipo == 'sedes':
                dat_pag['titulo'] = f"Sede - {dat_pag['nombre']}"
                dat_pag['idpag'] = splitext(ar)[0]

            ruta_out = f"{out_dir}{splitext(ar)[0]}/index.html"
            hash_data = calcular_hash_archivo(ruta_in)
            hash_pagina = hashlib.md5(f"{hash_data}-{hash_globals}-{hash_templates}".encode()).hexdigest()

            estado_previo = estado.get("data", {}).get(ruta_in)

            if globales_cambiaron or templates_cambiaron or not estado_previo or estado_previo.get('hash') != hash_pagina:
                print(f"Actualizando ({tipo}): {ar}")
                makedirs(dirname(ruta_out), exist_ok=True)
                tpl = env_jinja2.get_template(tpl_def)

                context_cfg = dat_cfg.copy()
                context_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
                context_cfg['cache_actu'] = int(time_ns() / 1000)

                html = tpl.render(cfg=context_cfg, pag=dat_pag, rec=dat_rec)
                with open(ruta_out, 'w', encoding='utf-8') as f:
                    f.write(html)

            nuevo_estado["data"][ruta_in] = {"hash": hash_pagina, "output": ruta_out}
            nuevos_outputs.append(ruta_out)

    for carpeta, tipo in [('./datos/paginas/', 'paginas'), ('./datos/permanente/', 'permanente'), ('./datos/obras/', 'obras')]:
        if not Path(carpeta).exists(): continue
        for ar in listdir(carpeta):
            if not ar.endswith('.yml'): continue
            ruta_in = f'{carpeta}{ar}'
            dat_pag = leer_yml(ruta_in)

            tpl_def = dat_pag.get('html_base')
            ruta_out = ruta_public + dat_pag.get('ruta_static', '')

            if not tpl_def or not ruta_out:
                print(f"Advertencia: {ruta_in} no tiene html_base o ruta_static")
                continue

            hash_data = calcular_hash_archivo(ruta_in)
            hash_pagina = hashlib.md5(f"{hash_data}-{hash_globals}-{hash_templates}".encode()).hexdigest()

            estado_previo = estado.get("data", {}).get(ruta_in)

            if globales_cambiaron or templates_cambiaron or not estado_previo or estado_previo.get('hash') != hash_pagina:
                print(f"Actualizando ({tipo}): {ar}")
                makedirs(dirname(ruta_out), exist_ok=True)
                tpl = env_jinja2.get_template(tpl_def)

                context_cfg = dat_cfg.copy()
                context_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
                context_cfg['cache_actu'] = int(time_ns() / 1000)

                html = tpl.render(cfg=context_cfg, pag=dat_pag, rec=dat_rec)
                with open(ruta_out, 'w', encoding='utf-8') as f:
                    f.write(html)

            nuevo_estado["data"][ruta_in] = {"hash": hash_pagina, "output": ruta_out}
            nuevos_outputs.append(ruta_out)

    # Limpieza de huerfanos basada en el estado previo
    print("Verificando archivos huerfanos...")
    outputs_antiguos = estado.get("outputs", [])
    for out_ant in outputs_antiguos:
        if out_ant not in nuevos_outputs:
            p = Path(out_ant)
            if p.exists():
                print(f"Borrando huerfano: {out_ant}")
                p.unlink()
                try:
                    p.parent.rmdir()
                except OSError:
                    pass

    nuevo_estado["outputs"] = nuevos_outputs
    guardar_estado(nuevo_estado)
    print('--- Actualizacion completada!')

if __name__ == '__main__':
    actualizar_todo()

#!/usr/bin/env python3
# -*- coding:utf-8 -*-


from os import listdir, makedirs
from os.path import splitext, dirname
from time import gmtime, strftime
from shutil import rmtree
import json
import yaml

from jinja2 import Environment, FileSystemLoader

from markdown import Markdown
from markdown.inlinepatterns import SimpleTagInlineProcessor
from markdown.extensions import Extension

markdown_extensiones = [ 'tables', 'attr_list', 'toc', 'abbr', 'footnotes' ]
markdown_extensiones_config = { 'tables': {}, 'attr_list': {}, 'toc': {}, 'abbr': {}, 'footnotes': {}}


# funciones generales
def md_a_html(texto):
    global dat_cfg
    global dat_rec
    global env_jinja2

    tpl = env_jinja2.from_string(texto)
    texto = tpl.render(cfg=dat_cfg, rec=dat_rec)

    md = Markdown(extensions=markdown_extensiones, extension_configs=markdown_extensiones_config)
    return md.convert(texto)


def url_dominio(texto):
    return texto.split(':')[1].strip('/')


def leer_yml(ar):
    with open(ar, 'r') as f:
        return yaml.safe_load(f)


def borrar_contenido(ruta):
    for sr in listdir(ruta):
        rmtree(f'{ruta}{sr}')

ruta_public = '../docs/'

# actualización de configuración
ar_cfg_in = 'datos/configuracion.yml'
ar_cfg_out = f'{ruta_public}dat/cfg.js'

with open(ar_cfg_in, 'r') as f:
    dat_cfg = yaml.safe_load(f)
    with open(ar_cfg_out, 'w') as g:
        g.write('const cfg = ' + json.dumps(dat_cfg))

# compilaciones de recursos
ar_rec_out = f'{ruta_public}dat/rec.js'

rutas_recursos = [
    './datos/artistas/',
    './datos/eventos/',
    './datos/obras/',
    './datos/sedes/'
    ]
dat_rec = {}
for r in rutas_recursos:
    idr = r.split('/')[-2]
    dat_rec[idr] = {splitext(a)[0]: leer_yml(f'{r}{a}') for a in sorted(listdir(r)) if a.endswith('.yml')}

with open(ar_rec_out, 'w') as g:
    g.write('const rec = ' + json.dumps(dat_rec))


# completado de plantillas de páginas
fl = FileSystemLoader('plantillas')
env_jinja2 = Environment(loader=fl)

env_jinja2.globals.update(markdown = md_a_html)
env_jinja2.globals.update(url_dominio = url_dominio)

ruta_paginas_in = './datos/paginas/'

borrar_contenido(f'{ruta_public}pag/')

for ar in [a for a in listdir(ruta_paginas_in) if a.endswith('.yml')]:
    dat_pag = leer_yml(f'{ruta_paginas_in}{ar}')
    ruta_out = ruta_public + dat_pag['ruta_static']
    makedirs(dirname(ruta_out), exist_ok=True)

    dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())

    tpl = env_jinja2.get_template(dat_pag['html_base'])
    html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

    with open(ruta_out, 'w') as f:
        f.write(html)



# finalización
print('--- Actualización completada!')

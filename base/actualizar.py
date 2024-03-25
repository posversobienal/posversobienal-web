#!/usr/bin/env python3
# -*- coding:utf-8 -*-


from os import listdir, makedirs
from os.path import splitext, dirname
from pathlib import Path
from time import gmtime, strftime, time_ns
from shutil import rmtree
import json
import yaml
from jinja2 import Environment, FileSystemLoader
from markdown import Markdown
from markdown.inlinepatterns import SimpleTagInlineProcessor
from markdown.extensions import Extension
from random import shuffle

# ------ funciones generales
def desordenar(l):
    m = l.copy()
    shuffle(m)
    return m

def orden_inverso(l):
    return l[::-1]



def md_a_html(texto):
    global dat_cfg
    global dat_rec
    global env_jinja2
    tpl = env_jinja2.from_string(texto)
    texto = tpl.render(cfg=dat_cfg, rec=dat_rec)
    md = Markdown(extensions=markdown_extensiones, extension_configs=markdown_extensiones_config)
    return md.convert(texto)


def datos_de(tipo, archivo):
    if tipo == 'bitacora':
        ar = f'./datos/bitacora/{archivo}.yml'
        with open(ar, 'r') as f:
            return yaml.safe_load(f)
    return {}


def url_dominio(texto):
    return texto.split(':')[1].strip('/')


def id_redsocial(texto):
    return texto.split('/')[-1].strip()


def leer_yml(ar):
    with open(ar, 'r') as f:
        return yaml.safe_load(f)


def borrar_contenido(ruta):
    for sr in listdir(ruta):
        pa = Path(f'{ruta}{sr}')
        if pa.is_dir():
            rmtree(pa)


def listar_id(tipo):
    if tipo == 'novedades':
        return [splitext(ar)[0] for ar in listdir('./datos/bitacora/') if ar.endswith('.yml') ]


def idioma(tipo):
    #html = '<div class="my-2 ṕy-2 text-end lang"><img src="/rec/grafica/icon-{lang}.svg" class="icono"></div>'
    html = '<div class="my-2 ṕy-2 text-end lang" id="{lang}"></div>'
    lang = ''
    if tipo == 'esp': lang = 'esp'
    elif tipo == 'eng': lang = 'eng'

    return html.format(lang=lang) if lang else  ''


def actualizar_personas():
    # completado de plantillas para PERSONAS
    ruta_in = './datos/personas/'
    ruta_out = f'{ruta_public}/per/'
    borrar_contenido(ruta_out)

    for ar in [a for a in listdir(ruta_in) if a.endswith('.yml')]:
        print('Persona: ', ar)

        dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
        dat_pag = leer_yml(f'{ruta_in}{ar}')
        dat_pag['titulo'] = dat_pag['nombre'] + ' ' + dat_pag['apellido']

        nom_ar = splitext(ar)[0]
        arc_out = f'{ruta_out}/{nom_ar}/index.html'
        makedirs(dirname(arc_out), exist_ok=True)

        tpl = env_jinja2.get_template('persona.html')
        html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

        with open(arc_out, 'w') as f:
            f.write(html)


def actualizar_personas_artistas():
    # completado de plantillas para PERSONAS ARTISTA
    ruta_in = './datos/artistas_invitados/'
    ruta_out = f'{ruta_public}/per/'
    #borrar_contenido(ruta_out)

    for ar in [a for a in listdir(ruta_in) if a.endswith('.yml')]:
        print('Artista: ', ar)

        dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
        dat_pag = leer_yml(f'{ruta_in}{ar}')
        dat_pag['titulo'] = dat_pag['nombre'] + ' ' + dat_pag['apellido']

        nom_ar = splitext(ar)[0]
        arc_out = f'{ruta_out}/{nom_ar}/index.html'
        makedirs(dirname(arc_out), exist_ok=True)

        tpl = env_jinja2.get_template('persona_artista.html')
        html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

        with open(arc_out, 'w') as f:
            f.write(html)


def actualizar_sedes():
    # completado de plantillas para SEDESa
    ruta_in = './datos/sedes/'
    ruta_out = f'{ruta_public}sds/'
    borrar_contenido(ruta_out)

    for ar in [a for a in listdir(ruta_in) if a.endswith('.yml')]:
        print('Sede: ', ar)

        dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
        dat_cfg['cache_actu'] = int(time_ns() / 1000)
        dat_pag = leer_yml(f'{ruta_in}{ar}')
        dat_pag['titulo'] = 'Sede - ' + dat_pag['nombre']

        nom_ar = splitext(ar)[0]
        arc_out = f'{ruta_out}/{nom_ar}/index.html'
        makedirs(dirname(arc_out), exist_ok=True)

        tpl = env_jinja2.get_template('sede.html')
        html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

        with open(arc_out, 'w') as f:
            f.write(html)


def actualizar_paginas():
    # completado de plantillas de PÁGINAS
    ruta_in = './datos/paginas/'
    ruta_out = f'{ruta_public}pag/'
    borrar_contenido(ruta_out)

    for ar in [a for a in listdir(ruta_in) if a.endswith('.yml')]:
        print('Página: ', ar)

        dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
        dat_pag = leer_yml(f'{ruta_in}{ar}')

        if dat_pag['ruta_static']:

            arc_out = ruta_public + dat_pag['ruta_static']
            makedirs(dirname(arc_out), exist_ok=True)

            tpl = env_jinja2.get_template(dat_pag['html_base'])
            html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

            with open(arc_out, 'w') as f:
                f.write(html)


def actualizar_bitacora():
    # completado de plantillas de BITACORA
    ruta_in = './datos/bitacora/'
    ruta_out = f'{ruta_public}bit/'
    borrar_contenido(ruta_out)

    for ar in [a for a in listdir(ruta_in) if a.endswith('.yml')]:
        print('Bitacora: ', ar)

        dat_cfg['actualizacion'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
        dat_pag = leer_yml(f'{ruta_in}{ar}')

        nom_ar = splitext(ar)[0]
        arc_out = f'{ruta_out}/{nom_ar}/index.html'
        makedirs(dirname(arc_out), exist_ok=True)

        tpl = env_jinja2.get_template('bitacora.html')
        html = tpl.render(cfg=dat_cfg, pag=dat_pag, rec=dat_rec)

        with open(arc_out, 'w') as f:
            f.write(html)


def actualizar_todo():
    actualizar_personas()
    actualizar_personas_artistas()
    actualizar_paginas()
    actualizar_sedes()
    actualizar_bitacora()
    # finalización
    print('--- Actualización completada!')


# ------ configuracion general
markdown_extensiones = [ 'tables', 'attr_list', 'toc', 'abbr', 'footnotes' ]
markdown_extensiones_config = { 'tables': {}, 'attr_list': {}, 'toc': {}, 'abbr': {}, 'footnotes': {}}

ruta_public = '../docs/'

ar_cfg_in = 'datos/configuracion.yml'
ar_cfg_out = f'{ruta_public}dat/cfg.js'

with open(ar_cfg_in, 'r') as f:
    dat_cfg = yaml.safe_load(f)
    with open(ar_cfg_out, 'w') as g:
        g.write('const cfg = ' + json.dumps(dat_cfg))


# ------ compilaciones de recursos
ar_rec_out = f'{ruta_public}dat/rec.js'

rutas_recursos = [
    './datos/artistas_invitados/',
    './datos/personas/',
    './datos/bitacora/',
    './datos/obras/',
    './datos/sedes/'
    ]

dat_rec = {}
for r in rutas_recursos:
    idr = r.split('/')[-2]
    dat_rec[idr] = {splitext(a)[0]: leer_yml(f'{r}{a}') for a in sorted(listdir(r)) if a.endswith('.yml')}

with open(ar_rec_out, 'w') as g:
    g.write('const rec = ' + json.dumps(dat_rec))


# ------  completado de plantillas
fl = FileSystemLoader('plantillas')
env_jinja2 = Environment(loader=fl)

env_jinja2.globals.update(markdown = md_a_html)
env_jinja2.globals.update(url_dominio = url_dominio)
env_jinja2.globals.update(id_redsocial = id_redsocial)
env_jinja2.globals.update(datos_de = datos_de)
env_jinja2.globals.update(listar_id = listar_id)
env_jinja2.globals.update(idioma = idioma)
env_jinja2.globals.update(desordenar = desordenar)
env_jinja2.globals.update(orden_inverso = orden_inverso)



if __name__ == '__main__':
    actualizar_todo()

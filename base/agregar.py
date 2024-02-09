#!/usr/bin/env python3
# -*- coding:utf-8 -*-


from sys import argv
from shutil import copyfile


def normalizar(t):
    rr = [
        ['á', 'a'],
        ['é', 'e'],
        ['í', 'i'],
        ['ó', 'o'],
        ['ú', 'u'],
        ['ñ', 'n'],
        [' ', '_'],
        ['.', '_'],
        ['__', '_'],
        ['__', '_'],
        ]
    t = t.strip().lower()
    for r in rr:
        t = t.replace(r[0], r[1])
    return t


if argv[1] == 'artista':
    ree = {
        '{tipo}': argv[2] if len(argv) >= 3 else '',
        '{nombre}': argv[3] if len(argv) >= 4 else '',
        '{apellido}': argv[4] if len(argv) >= 5 else '',
        '{nacionalidad}': argv[5] if len(argv) >= 6 else '',
        }
    ar_pla = './plantillas/artista.yml'
    ruta = './datos/artistas_invitados/'
    id_nombre = normalizar(ree['{nombre}']) + '_' + normalizar(ree['{apellido}'])
    nom = id_nombre + '.yml'
    ree['{foto-obra}'] = id_nombre + '-1.jpg'
    ree['{foto-persona}'] = id_nombre + '.jpg'

    ar_yml = f'{ruta}{nom}'

    with open(ar_pla, 'r') as fi:
        pla = fi.read()
        for k, v in ree.items():
            pla = pla.replace(k, v)
        with open(ar_yml, 'w') as fo:
            fo.write(pla)

    copyfile('./plantillas/artista-obra.jpg', '../docs/rec/foto/obras/' + ree['{foto-obra}'])
    copyfile('./plantillas/artista-persona.jpg', '../docs/rec/foto/personas/' + ree['{foto-persona}'])

    print('Artista agregado!')
elif argv[1] == 'sede':
    ree = {
        '{numero_orden}': argv[2] if len(argv) >= 3 else '',
        '{nombre}': argv[3] if len(argv) >= 4 else '',
        }
    ar_pla = './plantillas/sede.yml'
    ruta = './datos/sedes/'
    nom = normalizar(ree['{numero_orden}']) + '_' + normalizar(ree['{nombre}']) + '.yml'
    ar_yml = f'{ruta}{nom}'

    with open(ar_pla, 'r') as fi:
        pla = fi.read()
        for k, v in ree.items():
            pla = pla.replace(k, v)
        with open(ar_yml, 'w') as fo:
            fo.write(pla)

    print('Sede agregada!')

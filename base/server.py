#!/usr/bin/env python
# -*- coding:utf-8 -*-

from livereload import Server, shell
from os import chdir
import webbrowser

if __name__ == '__main__':
    #r = '../'
    #chdir(r)

    h = '127.0.0.1'
    p = 8099
    l = 35729
    url = f'http://{h}:{p}'

    webbrowser.open(url)

    server = Server()

    server.watch('./datos/', shell('./actualizar_static.py'))
    #server.watch('./datos/*/*.yml', shell('./actualizar_static.py'))
    server.watch('./templates/', shell('./actualizar_static.py'))

    server.watch('../lib/', shell(''))
    server.watch('../rec/', shell(''))

    server.watch('./lib-css/*.less', shell('lessc ./lib-css/estilo.less', output='../lib/css/estilo.css'))

    server.setHeader('Access-Control-Allow-Origin', '*')
    server.setHeader('Access-Control-Allow-Methods', '*')

    server.serve(root='../', liveport=l, host=h, port=p)

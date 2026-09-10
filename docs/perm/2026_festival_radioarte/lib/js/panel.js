/**
 * Módulo para gestionar el panel flotante de fichas
 */

var Panel = (function() {
    'use strict';

    var panel = null;
    var overlay = null;
    var contenido = null;
    var btnCerrar = null;
    var imgBasePath = 'img/festival_radioarte/';

    /**
     * Inicializa el módulo
     */
    function init() {
        panel = document.getElementById('panel');
        overlay = document.getElementById('panel-overlay');
        contenido = document.getElementById('panel-contenido');
        btnCerrar = document.getElementById('panel-cerrar');

        if (!panel || !overlay || !contenido || !btnCerrar) {
            console.error('Elementos del panel no encontrados');
            return;
        }

        // Event listeners
        btnCerrar.addEventListener('click', cerrar);
        overlay.addEventListener('click', cerrar);

        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && panel.classList.contains('active')) {
                cerrar();
            }
        });
    }

    /**
     * Abre el panel con la obra correspondiente
     * @param {string} slug - Identificador de la obra
     */
    function abrir(slug) {
        var obra = Catalogo.getObra(slug);

        if (!obra) {
            console.warn('Obra no encontrada:', slug);
            return;
        }

        // Actualizar URL con hash
        if (window.location.hash !== '#' + slug) {
            history.pushState(null, '', '#' + slug);
        }

        // Renderizar contenido
        renderContenido(slug, obra);

        // Mostrar panel y overlay
        panel.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el panel
     */
    function cerrar() {
        panel.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Limpiar hash de URL
        if (window.location.hash) {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    }

    /**
     * Renderiza el contenido de la obra en el panel
     * @param {string} slug
     * @param {object} obra
     */
    function renderContenido(slug, obra) {
        var html = '';

        // Imágenes
        html += '<div class="panel-imagenes">';
        html += '<div class="panel-imagen">';
        html += '<img src="' + imgBasePath + slug + '-artista.jpg" alt="' + escapeAttr(obra.artista) + '" onerror="this.style.display=\'none\'">';
        html += '</div>';
        html += '<div class="panel-imagen">';
        html += '<img src="' + imgBasePath + slug + '-obra.jpg" alt="' + escapeAttr(obra.titulo) + '" onerror="this.style.display=\'none\'">';
        html += '</div>';
        html += '</div>';

        // Artista
        html += '<div class="panel-artista">' + escapeHtml(obra.artista) + '</div>';

        // Título
        html += '<h2 class="panel-titulo">' + escapeHtml(obra.titulo) + '</h2>';

        // Duración
        if (obra.duracion) {
            html += '<div class="panel-duracion">' + escapeHtml(obra.duracion) + '</div>';
        }

        // Sinopsis
        if (obra.sinopsis) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Sinopsis</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.sinopsis) + '</div>';
            html += '</div>';
        }

        // Ficha técnica
        if (obra.ficha) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Ficha Técnica</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.ficha) + '</div>';
            html += '</div>';
        }

        // Biografía
        if (obra.bio) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Biografía</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.bio) + '</div>';
            html += '</div>';
        }

        // Comentarios
        if (obra.comentarios) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Comentarios</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.comentarios) + '</div>';
            html += '</div>';
        }

        // Contactos
        if (obra.contactos && obra.contactos.length > 0) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Contactos</h3>';
            html += '<ul class="panel-contactos">';
            obra.contactos.forEach(function(url) {
                html += '<li><a href="' + escapeAttr(url) + '" target="_blank" rel="noopener">' + escapeHtml(url) + '</a></li>';
            });
            html += '</ul>';
            html += '</div>';
        }

        contenido.innerHTML = html;

        // Scroll al inicio del panel
        panel.scrollTop = 0;
    }

    /**
     * Escapa caracteres HTML
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Escapa caracteres para atributos HTML
     * @param {string} text
     * @returns {string}
     */
    function escapeAttr(text) {
        if (!text) return '';
        return text
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    return {
        init: init,
        abrir: abrir,
        cerrar: cerrar
    };
})();

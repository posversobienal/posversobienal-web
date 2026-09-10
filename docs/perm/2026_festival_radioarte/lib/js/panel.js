/**
 * Modulo para gestionar el panel flotante de fichas y el lightbox de imagenes
 */

var Panel = (function() {
    'use strict';

    var panel = null;
    var overlay = null;
    var contenido = null;
    var btnCerrar = null;

    var lightbox = null;
    var lightboxImg = null;
    var lightboxCerrar = null;

    var imgBasePath = 'img/festival_radioarte/';

    /**
     * Inicializa el modulo
     */
    function init() {
        panel = document.getElementById('panel');
        overlay = document.getElementById('panel-overlay');
        contenido = document.getElementById('panel-contenido');
        btnCerrar = document.getElementById('panel-cerrar');

        lightbox = document.getElementById('lightbox');
        lightboxImg = document.getElementById('lightbox-img');
        lightboxCerrar = document.getElementById('lightbox-cerrar');

        if (!panel || !overlay || !contenido || !btnCerrar) {
            console.error('Elementos del panel no encontrados');
            return;
        }

        if (!lightbox || !lightboxImg || !lightboxCerrar) {
            console.error('Elementos del lightbox no encontrados');
            return;
        }

        // Event listeners del panel
        btnCerrar.addEventListener('click', cerrar);
        overlay.addEventListener('click', cerrar);

        // Event listeners del lightbox
        lightboxCerrar.addEventListener('click', cerrarLightbox);
        lightbox.addEventListener('click', function(e) {
            // Cerrar si se clickea fuera de la imagen
            if (e.target === lightbox) {
                cerrarLightbox();
            }
        });
        // Evitar que clickear la imagen cierre el lightbox
        lightboxImg.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Event delegation para imagenes clickeables dentro del panel
        contenido.addEventListener('click', function(e) {
            var target = e.target;
            if (target.tagName === 'IMG' && target.hasAttribute('data-full-src')) {
                abrirLightbox(target.getAttribute('data-full-src'), target.getAttribute('alt'));
            }
        });

        // Cerrar con Escape (prioriza lightbox sobre panel)
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                if (lightbox.classList.contains('active')) {
                    cerrarLightbox();
                } else if (panel.classList.contains('active')) {
                    cerrar();
                }
            }
        });
    }

    /**
     * Abre el panel con la obra correspondiente
     */
    function abrir(slug) {
        var obra = Catalogo.getObra(slug);

        if (!obra) {
            console.warn('Obra no encontrada:', slug);
            return;
        }

        if (window.location.hash !== '#' + slug) {
            history.pushState(null, '', '#' + slug);
        }

        renderContenido(slug, obra);

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

        // Si el lightbox esta abierto, cerrarlo tambien
        if (lightbox.classList.contains('active')) {
            cerrarLightbox();
        }

        if (window.location.hash) {
            history.pushState(null, '', window.location.pathname + window.location.search);
        }
    }

    /**
     * Abre el lightbox con la imagen ampliada
     */
    function abrirLightbox(src, alt) {
        if (!src) return;
        lightboxImg.src = src;
        lightboxImg.alt = alt || '';
        lightbox.classList.add('active');
    }

    /**
     * Cierra el lightbox
     */
    function cerrarLightbox() {
        lightbox.classList.remove('active');
        // Limpiar src despues de la transicion para liberar memoria
        setTimeout(function() {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
            }
        }, 300);
    }

    /**
     * Renderiza el contenido de la obra en el panel
     */
    function renderContenido(slug, obra) {
        var html = '';
        var artistaSrc = imgBasePath + slug + '-artista.jpg';
        var obraSrc = imgBasePath + slug + '-obra.jpg';

        // Imagenes clickeables con data-full-src para el lightbox
        html += '<div class="panel-imagenes">';
        html += '<div class="panel-imagen">';
        html += '<img src="' + artistaSrc + '" alt="' + escapeAttr(obra.artista) + '" data-full-src="' + escapeAttr(artistaSrc) + '" onerror="this.style.display=\'none\'">';
        html += '</div>';
        html += '<div class="panel-imagen">';
        html += '<img src="' + obraSrc + '" alt="' + escapeAttr(obra.titulo) + '" data-full-src="' + escapeAttr(obraSrc) + '" onerror="this.style.display=\'none\'">';
        html += '</div>';
        html += '</div>';

        html += '<div class="panel-artista">' + escapeHtml(obra.artista) + '</div>';
        html += '<h2 class="panel-titulo">' + escapeHtml(obra.titulo) + '</h2>';

        if (obra.duracion) {
            html += '<div class="panel-duracion">' + escapeHtml(obra.duracion) + '</div>';
        }

        if (obra.sinopsis) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Sinopsis</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.sinopsis) + '</div>';
            html += '</div>';
        }

        if (obra.ficha) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Ficha Tecnica</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.ficha) + '</div>';
            html += '</div>';
        }

        if (obra.bio) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Biografia</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.bio) + '</div>';
            html += '</div>';
        }

        if (obra.comentarios) {
            html += '<div class="panel-seccion">';
            html += '<h3 class="panel-seccion-titulo">Comentarios</h3>';
            html += '<div class="panel-seccion-contenido">' + Markdown.render(obra.comentarios) + '</div>';
            html += '</div>';
        }

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
        panel.scrollTop = 0;
    }

    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

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
        cerrar: cerrar,
        abrirLightbox: abrirLightbox,
        cerrarLightbox: cerrarLightbox
    };
})();

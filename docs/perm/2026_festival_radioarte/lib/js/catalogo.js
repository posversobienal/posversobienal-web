/**
 * Módulo para cargar y gestionar el catálogo de obras
 */

var Catalogo = (function() {
    'use strict';

    var data = null;
    var container = null;

    /**
     * Inicializa el módulo
     * @param {string} containerId - ID del contenedor de la lista
     */
    function init(containerId) {
        container = document.getElementById(containerId);
        if (!container) {
            console.error('Contenedor no encontrado:', containerId);
            return;
        }
    }

    /**
     * Carga el catálogo desde JSON
     * @param {string} url - URL del archivo JSON
     * @returns {Promise}
     */
    function load(url) {
        return fetch(url)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('HTTP ' + response.status);
                }
                return response.json();
            })
            .then(function(json) {
                data = json;
                render();
                console.info('[catálogo] %d obras cargadas', Object.keys(data).length);
                return data;
            })
            .catch(function(error) {
                console.error('[catálogo] Error cargando:', error);
                throw error;
            });
    }

    /**
     * Renderiza la lista de obras en el DOM
     */
    function render() {
        if (!data || !container) {
            return;
        }

        container.innerHTML = '';

        var slugs = Object.keys(data).sort();

        slugs.forEach(function(slug) {
            var obra = data[slug];
            var li = document.createElement('li');
            li.className = 'catalogo-item';
            li.setAttribute('data-slug', slug);

            var artistaDiv = document.createElement('div');
            artistaDiv.className = 'catalogo-item-artista';
            artistaDiv.textContent = obra.artista || '—';

            var tituloDiv = document.createElement('div');
            tituloDiv.className = 'catalogo-item-titulo';
            tituloDiv.textContent = obra.titulo || '—';

            li.appendChild(artistaDiv);
            li.appendChild(tituloDiv);

            if (obra.duracion) {
                var duracionDiv = document.createElement('div');
                duracionDiv.className = 'catalogo-item-duracion';
                duracionDiv.textContent = obra.duracion;
                li.appendChild(duracionDiv);
            }

            li.addEventListener('click', function() {
                Panel.abrir(slug);
            });

            container.appendChild(li);
        });
    }

    /**
     * Obtiene una obra por su slug
     * @param {string} slug
     * @returns {object|null}
     */
    function getObra(slug) {
        if (!data || !slug) {
            return null;
        }
        return data[slug] || null;
    }

    /**
     * Obtiene todas las obras
     * @returns {object|null}
     */
    function getAll() {
        return data;
    }

    return {
        init: init,
        load: load,
        getObra: getObra,
        getAll: getAll
    };
})();

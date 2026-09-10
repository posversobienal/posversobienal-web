/**
 * Módulo principal de inicialización
 */

(function() {
    'use strict';

    /**
     * Inicializa la aplicación
     */
    function init() {
        // Inicializar módulos
        Catalogo.init('catalogo-lista');
        Panel.init();

        // Cargar catálogo
        Catalogo.load('data/catalogo.json')
            .then(function() {
                // Verificar si hay hash en URL al cargar
                checkHashOnLoad();
            })
            .catch(function(error) {
                console.error('Error inicializando:', error);
            });

        // Escuchar cambios de hash
        window.addEventListener('hashchange', function() {
            var hash = window.location.hash.slice(1);
            if (hash) {
                Panel.abrir(hash);
            }
        });
    }

    /**
     * Verifica si hay hash en URL al cargar la página
     */
    function checkHashOnLoad() {
        var hash = window.location.hash.slice(1);
        if (hash) {
            // Pequeño delay para asegurar que el DOM está listo
            setTimeout(function() {
                Panel.abrir(hash);
            }, 100);
        }
    }

    // Iniciar cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

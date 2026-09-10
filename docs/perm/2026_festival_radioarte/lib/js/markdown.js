/**
 * Wrapper para procesar Markdown a HTML usando marked.js
 */

var Markdown = (function() {
    'use strict';

    /**
     * Convierte texto Markdown a HTML
     * @param {string} text - Texto en formato Markdown
     * @returns {string} HTML procesado
     */
    function render(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }

        text = text.trim();

        if (!text) {
            return '';
        }

        // Configuración de marked para sanitización básica
        if (typeof marked !== 'undefined' && marked.parse) {
            return marked.parse(text, {
                breaks: true,
                gfm: true
            });
        }

        // Fallback si marked no está disponible: escapar HTML y preservar saltos de línea
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    /**
     * Escapa caracteres HTML especiales
     * @param {string} text
     * @returns {string}
     */
    function escapeHtml(text) {
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        render: render
    };
})();

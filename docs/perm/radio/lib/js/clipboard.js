/**
 * Atajo Escape: copia los datos del tema actual al portapapeles.
 * Formato: <disc-title> #<disc-number> - <track-number> - <track-title> - <track-author>
 * Ejemplo: 1 minute autohypnosis #29 - 05 - UCT-8 - Minimal Frank
 */

(function () {

    // Em-dash usado como placeholder en el display
    var PLACEHOLDER = '\u2014';

    function getEl(id) {
        return document.getElementById(id);
    }

    function cleanText(el) {
        if (!el) return '';
        var t = el.textContent.trim();
        if (t === PLACEHOLDER || t === '') return '';
        return t;
    }

    /**
     * Separa titulo y numero del nombre del disco.
     * "1 minute autohypnosis #29" -> { title: "1 minute autohypnosis", num: "29" }
     * "Biology"                   -> { title: "Biology", num: null }
     */
    function parseDiscName(discName) {
        var m = discName.match(/^(.+?)\s*#(\d+)\s*$/);
        if (m) {
            return { title: m[1].trim(), num: m[2] };
        }
        return { title: discName, num: null };
    }

    function buildLine() {
        var discName    = cleanText(getEl('disc-name'));
        var trackNum    = cleanText(getEl('track-number'));
        var trackTitle  = cleanText(getEl('track-title'));
        var trackArtist = cleanText(getEl('track-artist'));

        // Sin datos utiles
        if (!trackTitle && !trackArtist) return null;

        var disc = parseDiscName(discName);

        // <disc-title> #<disc-number>
        var discPart = disc.title;
        if (disc.num) {
            discPart += ' #' + disc.num;
        }

        return [
            discPart,
            trackNum    || '??',
            trackTitle  || '???',
            trackArtist || '???'
        ].join(' - ');
    }

    function copyToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        // Fallback para contextos sin Clipboard API
        return new Promise(function (resolve, reject) {
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand('copy');
                resolve();
            } catch (e) {
                reject(e);
            }
            document.body.removeChild(ta);
        });
    }

    function showToast(msg) {
        var prev = document.getElementById('copy-toast');
        if (prev) prev.remove();

        var toast = document.createElement('div');
        toast.id = 'copy-toast';
        toast.textContent = msg;
        toast.style.cssText = [
            'position: fixed',
            'bottom: 2rem',
            'left: 50%',
            'transform: translateX(-50%)',
            'max-width: 90vw',
            'background: #0a0a0a',
            'color: #ffffff',
            'padding: 0.6rem 1.4rem',
            "font-family: 'Inter', -apple-system, sans-serif",
            'font-size: 0.72rem',
            'letter-spacing: 0.04em',
            'border: 1px solid #0a0a0a',
            'z-index: 9999',
            'opacity: 0',
            'transition: opacity 0.3s',
            'white-space: nowrap',
            'overflow: hidden',
            'text-overflow: ellipsis'
        ].join(';');
        document.body.appendChild(toast);

        // Forzar reflow para que la transicion funcione
        void toast.offsetHeight;
        toast.style.opacity = '1';

        setTimeout(function () {
            toast.style.opacity = '0';
            setTimeout(function () { toast.remove(); }, 300);
        }, 2500);
    }

    // ── Listener ──
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;

        var line = buildLine();
        if (!line) {
            showToast('Sin datos del tema actual');
            return;
        }

        copyToClipboard(line)
            .then(function () {
                showToast(line);
            })
            .catch(function () {
                showToast('Error al copiar al portapapeles');
            });
    });

})();

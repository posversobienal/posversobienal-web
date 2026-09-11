(function() {
    'use strict';

    var RADIO_CONFIG = {
        host: 'giss.tv',
        mount: 'posversoradio.ogg',
        ports: [666, 667],
        statsInterval: 5
    };

    var catalogo = null;
    var catalogoIndex = {};
    var catalogReady = false;
    var currentSlug = null;
    var statsListener = null;
    var currentPortIndex = 0;

    var PROGRAMA_TIMEZONE = 'America/Argentina/Buenos_Aires';

    var currentItem = null;
    var lastMeta = null;

    function getTodayString() {
        var now = new Date();

        try {
            var parts = new Intl.DateTimeFormat('en-CA', {
                timeZone: PROGRAMA_TIMEZONE,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).formatToParts(now);

            var values = {};

            for (var i = 0; i < parts.length; i += 1) {
                values[parts[i].type] = parts[i].value;
            }

            return values.year + '-' + values.month + '-' + values.day;
        } catch (e) {
            var y = now.getFullYear();
            var m = String(now.getMonth() + 1).padStart(2, '0');
            var d = String(now.getDate()).padStart(2, '0');

            return y + '-' + m + '-' + d;
        }
    }

    var currentToday = getTodayString();

    function findProgramItemBySlugAndDate(slug, dateStr) {
        var candidates = document.querySelectorAll('[data-id="' + slug + '"]');

        for (var i = 0; i < candidates.length; i += 1) {
            if (candidates[i].getAttribute('data-date') === dateStr) {
                return candidates[i];
            }
        }

        return null;
    }

    function setLiveItem(item) {
        if (currentItem === item) {
            return;
        }

        if (currentItem) {
            var prevLi = currentItem.closest('li');

            if (prevLi) {
                prevLi.classList.remove('programa-item-live');
            }
        }

        currentItem = item;

        if (currentItem) {
            var li = currentItem.closest('li');

            if (li) {
                li.classList.add('programa-item-live');
                li.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }
        }
    }



    function init() {
        renderPrograma();
        loadCatalogo();
        startMetadataListener();
        startDayWatcher();
    }

    function renderPrograma() {
        var container = document.getElementById('programa-contenido');
        if (typeof programa_md !== 'undefined' && typeof marked !== 'undefined') {
            container.innerHTML = marked.parse(programa_md);
        }
    }

    function loadCatalogo() {
        fetch('../data/catalogo.json')
            .then(function(response) {
                if (!response.ok) throw new Error('HTTP ' + response.status);
                return response.json();
            })
            .then(function(data) {
                catalogo = data;
                buildIndex();
                catalogReady = true;
            })
            .catch(function(error) {
                console.error('[programa] Error cargando catalogo:', error);
            });
    }

    function normalize(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function buildIndex() {
        catalogoIndex = {};
        for (var slug in catalogo) {
            var item = catalogo[slug];
            var key = normalize(item.titulo) + '||' + normalize(item.artista);
            catalogoIndex[key] = slug;
        }
    }

    function findSlugByMeta(meta) {
        if (!catalogReady) return null;

        var title = meta.TITLE || '';
        var artist = meta.ARTIST || '';
        var key = normalize(title) + '||' + normalize(artist);

        if (catalogoIndex[key]) {
            return catalogoIndex[key];
        }

        for (var k in catalogoIndex) {
            var parts = k.split('||');
            if (parts[0] === normalize(title)) {
                return catalogoIndex[k];
            }
        }

        return null;
    }

    function getStreamUrl() {
        return 'https://' + RADIO_CONFIG.host + ':' +
            RADIO_CONFIG.ports[currentPortIndex] + '/' + RADIO_CONFIG.mount;
    }

    function startMetadataListener() {
        if (statsListener) statsListener.stop();
        updateEstado('connecting');

        statsListener = new IcecastMetadataStats(
            getStreamUrl(),
            {
                interval: RADIO_CONFIG.statsInterval,
                sources: ['ogg'],
                onStats: function(stats) {
                    if (stats.ogg && typeof stats.ogg === 'object') {
                        handleMetadata(stats.ogg);
                    }
                }
            }
        );
        statsListener.start();
    }

    function handleMetadata(meta) {
        lastMeta = meta;

        updateEstado('connected');
        updateEstadoObra(meta);

        var slug = findSlugByMeta(meta);

        if (!slug) {
            setLiveItem(null);
            return;
        }

        var item = findProgramItemBySlugAndDate(slug, currentToday);

        if (!item) {
            setLiveItem(null);
            return;
        }

        setLiveItem(item);
    }

    function startDayWatcher() {
        setInterval(function () {
            var today = getTodayString();

            if (today !== currentToday) {
                currentToday = today;

                setLiveItem(null);

                if (lastMeta) {
                    handleMetadata(lastMeta);
                }
            }
        }, 60000);
    }
    function markItem(slug) {
        var prev = document.querySelector('.programa-item-live');
        if (prev) {
            prev.classList.remove('programa-item-live');
            prev.classList.add('programa-item-past');
        }

        var span = document.querySelector('[data-id="' + slug + '"]');
        if (span) {
            var li = span.closest('li');
            if (li) {
                li.classList.add('programa-item-live');
                li.classList.remove('programa-item-past');
                li.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    function updateEstado(state) {
        var dot = document.getElementById('estado-dot');
        var texto = document.getElementById('estado-texto');
        if (state === 'connected') {
            dot.classList.add('connected');
            texto.textContent = 'En vivo';
        } else if (state === 'connecting') {
            dot.classList.remove('connected');
            texto.textContent = 'Conectando...';
        }
    }

    function updateEstadoObra(meta) {
        var el = document.getElementById('estado-obra');
        var title = meta.TITLE || '';
        var artist = meta.ARTIST || '';
        if (title || artist) {
            el.textContent = artist + ' - ' + title;
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

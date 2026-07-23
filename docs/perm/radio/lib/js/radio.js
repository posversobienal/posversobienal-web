/**
 * posverso radio - cliente de streaming con fichas tecnicas
 *
 * Libreria externa requerida:
 *   icecast-metadata-stats (Ethan Halsall)
 *   https://github.com/eshaz/icecast-metadata-js
 */

// ============================================================
// Configuracion
// ============================================================

var CONFIG = {
    streamUrl: 'https://giss.tv:667/posversoradio.ogg',
    catalogUrl: 'data/catalogo.json',
    statsInterval: 15,
    reconnectDelay: 5000,
    stallTimeout: 8000
};

// ============================================================
// Iconos SVG (play / pause / volumen)
// ============================================================

var ICON_PLAY =
    '<svg width="10" height="12" viewBox="0 0 10 12">' +
    '<polygon points="0,0 10,6 0,12" fill="currentColor"/></svg>';

var ICON_PAUSE =
    '<svg width="10" height="12" viewBox="0 0 10 12">' +
    '<rect x="0" y="0" width="3" height="12" fill="currentColor"/>' +
    '<rect x="7" y="0" width="3" height="12" fill="currentColor"/></svg>';

var ICON_VOL =
    '<svg width="14" height="12" viewBox="0 0 14 12">' +
    '<polygon points="0,3.5 3,3.5 7,0 7,12 3,8.5 0,8.5" fill="currentColor"/>' +
    '<path d="M9,2.5 Q12.5,6 9,9.5" stroke="currentColor" ' +
    'fill="none" stroke-width="1.2"/></svg>';

// ============================================================
// Estado
// ============================================================

var catalog = [];
var catalogIndex = {};
var currentMeta = null;
var isPlaying = false;
var startTime = 0;
var elapsedTime = 0;
var timerInterval = null;
var reconnectInterval = null;
var stallTimer = null;

// ============================================================
// Referencias al DOM
// ============================================================

var elStatusDot, elStatusText, elTrackNumber, elTrackTitle,
    elTrackArtist, elDiscName, elDiscDate, elDiscUrl,
    elFicha, elBtnPlay, elPlayerControls,
    elBtnToggle, elVolSlider, elVolIcon, elTimeDisplay, elAudio;

// ============================================================
// Catalogo
// ============================================================

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

function buildIndex(data) {
    var idx = { byTitleArtist: {}, byTitle: {} };

    data.forEach(function (item, i) {
        var t = normalize(item.title);
        var a = normalize(item.artist);
        var keyTA = t + '||' + a;

        if (!idx.byTitleArtist[keyTA]) idx.byTitleArtist[keyTA] = [];
        idx.byTitleArtist[keyTA].push(i);

        if (!idx.byTitle[t]) idx.byTitle[t] = [];
        idx.byTitle[t].push(i);
    });

    return idx;
}

function findFicha(meta) {
    if (!meta || !meta.TITLE) return null;

    var t = normalize(meta.TITLE);
    var a = normalize(meta.ARTIST || '');

    // 1: title + artist
    var keyTA = t + '||' + a;
    if (catalogIndex.byTitleArtist[keyTA]) {
        return catalog[catalogIndex.byTitleArtist[keyTA][0]];
    }

    // 2: solo title
    if (catalogIndex.byTitle[t]) {
        return catalog[catalogIndex.byTitle[t][0]];
    }

    // 3: title parcial
    for (var key in catalogIndex.byTitle) {
        if (key.indexOf(t) !== -1 || t.indexOf(key) !== -1) {
            return catalog[catalogIndex.byTitle[key][0]];
        }
    }

    return null;
}

function loadCatalog() {
    fetch(CONFIG.catalogUrl)
        .then(function (resp) {
            if (!resp.ok) throw new Error('HTTP ' + resp.status);
            return resp.json();
        })
        .then(function (data) {
            catalog = data;
            catalogIndex = buildIndex(catalog);
            console.info('[catalogo] %d fichas cargadas', catalog.length);
        })
        .catch(function (e) {
            console.error('[catalogo] Error cargando:', e);
        });
}

// ============================================================
// Display
// ============================================================

function updateDisplay(meta) {
    if (!meta || !meta.TITLE) return;

    var metaStr = JSON.stringify(meta);
    if (currentMeta === metaStr) return;
    currentMeta = metaStr;

    var ficha = findFicha(meta);

    elTrackTitle.textContent = meta.TITLE || '\u2014';
    elTrackArtist.textContent = meta.ARTIST || '\u2014';

    if (ficha) {
        elTrackNumber.textContent =
            String(ficha.track_number).padStart(2, '0');
        elDiscName.textContent = ficha.disc_name || '\u2014';
        elDiscDate.textContent = ficha.disc_date || '\u2014';

        if (ficha.disc_url) {
            elDiscUrl.innerHTML =
                '<a href="' + ficha.disc_url +
                '" target="_blank" rel="noopener">' +
                ficha.disc_url + '</a>';
        } else {
            elDiscUrl.textContent = '\u2014';
        }

        elFicha.classList.add('active');
    } else {
        elTrackNumber.textContent =
            meta.TRACKNUMBER
                ? String(meta.TRACKNUMBER).padStart(2, '0')
                : '\u2014';
        elDiscName.textContent = meta.ALBUM || '\u2014';
        elDiscDate.textContent = meta.DATE || '\u2014';
        elDiscUrl.textContent = meta.CONTACT || '\u2014';
        elFicha.classList.remove('active');
    }
}

// ============================================================
// Streaming: metadatos
// ============================================================

var statsListener = null;

function startMetadataListener() {
    if (statsListener) statsListener.stop();

    statsListener = new IcecastMetadataStats(
        CONFIG.streamUrl,
        {
            interval: CONFIG.statsInterval,
            sources: ['ogg'],
            onStats: function (stats) {
                if (stats.ogg && typeof stats.ogg === 'object') {
                    updateDisplay(stats.ogg);
                }
            }
        }
    );

    statsListener.start();
}

// ============================================================
// Player
// ============================================================

function startTimer() {
    startTime = Date.now() - elapsedTime;
    timerInterval = setInterval(function () {
        elapsedTime = Date.now() - startTime;
        var s = Math.floor(elapsedTime / 1000);
        var hh = String(Math.floor(s / 3600)).padStart(2, '0');
        var mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        var ss = String(s % 60).padStart(2, '0');
        elTimeDisplay.textContent = hh + ':' + mm + ':' + ss;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

function setConnected(connected) {
    if (connected) {
        elStatusDot.classList.add('connected');
        elStatusText.textContent = 'En vivo';
    } else {
        elStatusDot.classList.remove('connected');
        elStatusText.textContent = 'Desconectado';
    }
}

function play() {
    elAudio.play().then(function () {
        isPlaying = true;
        elBtnPlay.classList.add('hidden');
        elPlayerControls.classList.remove('hidden');
        elBtnToggle.innerHTML = ICON_PAUSE;
        elBtnToggle.setAttribute('aria-label', 'Pausa');
        setConnected(true);
        startTimer();
        startMetadataListener();
    }).catch(function (err) {
        console.error('[player] Error:', err);
        elStatusText.textContent = 'Error de conexion';
    });
}

function pause() {
    elAudio.pause();
    isPlaying = false;
    elBtnToggle.innerHTML = ICON_PLAY;
    elBtnToggle.setAttribute('aria-label', 'Reproducir');
    stopTimer();
}

function togglePlay() {
    if (isPlaying) { pause(); } else { play(); }
}

function resetStall() {
    clearTimeout(stallTimer);
    stallTimer = setTimeout(function () {
        if (isPlaying) {
            setConnected(false);
            elStatusText.textContent = 'Reconectando...';
            elAudio.load();
            elAudio.play().catch(function () {});
        }
    }, CONFIG.stallTimeout);
}

// ============================================================
// Init
// ============================================================

function init() {
    elStatusDot    = document.getElementById('status-dot');
    elStatusText   = document.getElementById('status-text');
    elTrackNumber  = document.getElementById('track-number');
    elTrackTitle   = document.getElementById('track-title');
    elTrackArtist  = document.getElementById('track-artist');
    elDiscName     = document.getElementById('disc-name');
    elDiscDate     = document.getElementById('disc-date');
    elDiscUrl      = document.getElementById('disc-url');
    elFicha        = document.getElementById('ficha');
    elBtnPlay      = document.getElementById('btn-play');
    elPlayerControls = document.getElementById('player-controls');
    elBtnToggle    = document.getElementById('btn-toggle');
    elVolSlider    = document.getElementById('vol-slider');
    elVolIcon      = document.getElementById('vol-icon');
    elTimeDisplay  = document.getElementById('time-display');
    elAudio        = document.getElementById('radio');

    // Iconos iniciales
    elBtnToggle.innerHTML = ICON_PAUSE;
    elVolIcon.innerHTML = ICON_VOL;

    // Volumen
    elAudio.volume = 0.8;

    // Eventos
    elBtnPlay.addEventListener('click', play);
    elBtnToggle.addEventListener('click', togglePlay);

    elVolSlider.addEventListener('input', function (e) {
        elAudio.volume = e.target.value / 100;
    });

    elAudio.addEventListener('playing', function () {
        setConnected(true);
    });

    elAudio.addEventListener('stalled', resetStall);
    elAudio.addEventListener('timeupdate', resetStall);

    elAudio.addEventListener('error', function () {
        if (isPlaying) {
            setConnected(false);
            elStatusText.textContent = 'Reconectando...';
            clearInterval(reconnectInterval);
            reconnectInterval = setInterval(function () {
                elAudio.load();
                elAudio.play().catch(function () {});
            }, CONFIG.reconnectDelay);
        }
    });

    // Catalogo
    loadCatalog();
}

document.addEventListener('DOMContentLoaded', init);

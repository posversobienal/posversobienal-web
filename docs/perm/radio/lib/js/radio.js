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
    host: 'giss.tv',
    mount: 'posversoradio.ogg',
    ports: [666, 667],          // orden de prioridad
    statsInterval: 5,
    reconnectDelay: 5000,
    stallTimeout: 8000,
    maxFailoverRounds: 3        // vueltas completas al array antes de rendirse
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

var currentMeta = null;
var isPlaying = false;
var startTime = 0;
var elapsedTime = 0;
var timerInterval = null;
var reconnectInterval = null;
var stallTimer = null;
var currentPortIndex = 0;
var failoverAttempts = 0;

// ============================================================
// Referencias al DOM
// ============================================================

var elStatusDot, elStatusText, elTrackNumber, elTrackTitle,
    elTrackArtist, elDiscName, elDiscDate, elDiscUrl,
    elFicha, elBtnPlay, elPlayerControls,
    elBtnToggle, elVolSlider, elVolIcon, elTimeDisplay, elAudio,
    elRadioSource, elGissPlayer, elStreamDirecto;

// ============================================================
// Metadatos directos de la transmision
// ============================================================

var EM_DASH = String.fromCharCode(8212);

function getMetaValue(meta, keys) {
    var i;
    var key;
    var value;

    for (i = 0; i < keys.length; i += 1) {
        key = keys[i];
        value = meta[key];

        if (!value && meta[key.toLowerCase()]) {
            value = meta[key.toLowerCase()];
        }

        if (value) {
            return String(value).trim();
        }
    }

    return '';
}

function getMetaUrl(meta) {
    var url = getMetaValue(meta, ['WEBSITE', 'URL', 'CONTACT']);

    if (!url) {
        return '';
    }

    // Vorbis puede unir varios valores con "; "
    url = url.split(';')[0].trim();

    if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
    }

    return url;
}

function setDiscUrl(url) {
    elDiscUrl.textContent = '';

    if (!url) {
        elDiscUrl.textContent = EM_DASH;
        return;
    }

    var link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener';
    link.textContent = url;

    elDiscUrl.appendChild(link);
}

function updateDisplay(meta) {
    if (!meta) {
        return;
    }

    var title = getMetaValue(meta, ['TITLE']);
    var artist = getMetaValue(meta, ['ARTIST']);

    if (!title && !artist) {
        return;
    }

    var metaStr = JSON.stringify(meta);

    if (currentMeta === metaStr) {
        return;
    }

    currentMeta = metaStr;

    var album = getMetaValue(meta, ['ALBUM']);
    var date = getMetaValue(meta, ['DATE']);
    var trackNumber = getMetaValue(meta, ['TRACKNUMBER']);

    elTrackNumber.textContent = '';
    elTrackArtist.textContent = artist || EM_DASH;
    elTrackNumber.textContent = trackNumber || EM_DASH;
    elDiscName.textContent = album || EM_DASH;
    elDiscDate.textContent = date || EM_DASH;

    setDiscUrl(getMetaUrl(meta));

    elFicha.classList.add('active');
}


// ============================================================
// Streaming: metadatos
// ============================================================

var statsListener = null;

function startMetadataListener() {
    if (statsListener) statsListener.stop();

    statsListener = new IcecastMetadataStats(
        getStreamUrl(),
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


function attemptPlay() {
    elAudio.play().then(function () {
        isPlaying = true;
        setConnected(true);
        resetFailover();
        clearInterval(reconnectInterval);
        startTimer();
        startMetadataListener();
    }).catch(function () {
        handleStreamFailure();
    });
}

function play() {
    elBtnPlay.classList.add('hidden');
    elPlayerControls.classList.remove('hidden');
    elBtnToggle.innerHTML = ICON_PAUSE;
    elBtnToggle.setAttribute('aria-label', 'Pausa');
    attemptPlay();
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

// ============================================================
// Construccion de URLs y failover de puertos
// ============================================================

function getStreamUrl() {
    return 'https://' + CONFIG.host + ':' +
           CONFIG.ports[currentPortIndex] + '/' + CONFIG.mount;
}

function getGissPlayerUrl() {
    return 'https://giss.tv/player/earp.php?url=' + getStreamUrl();
}

function applyCurrentPort() {
    var url = getStreamUrl();
    elRadioSource.src = url;
    elAudio.load();
    elGissPlayer.href = getGissPlayerUrl();
    elStreamDirecto.href = url;
    console.info('[stream] Puerto %d -> %s',
                 CONFIG.ports[currentPortIndex], url);
}

function tryNextPort() {
    currentPortIndex = (currentPortIndex + 1) % CONFIG.ports.length;
    failoverAttempts++;

    var max = CONFIG.ports.length * CONFIG.maxFailoverRounds;
    if (failoverAttempts > max) {
        return false;
    }

    applyCurrentPort();
    return true;
}

function resetFailover() {
    failoverAttempts = 0;
}

function handleStreamFailure() {
    if (!isPlaying) return;

    setConnected(false);
    stopTimer();

    if (tryNextPort()) {
        elStatusText.textContent =
            'Reconectando (puerto ' + CONFIG.ports[currentPortIndex] + ')...';
        elAudio.play().catch(function () {});
    } else {
        elStatusText.textContent = 'Sin conexion';
        // Reintento periodico desde el primer puerto
        clearInterval(reconnectInterval);
        reconnectInterval = setInterval(function () {
            currentPortIndex = 0;
            failoverAttempts = 0;
            applyCurrentPort();
            elAudio.play().catch(function () {});
        }, CONFIG.reconnectDelay);
    }
}

// ============================================================
// Init
// ============================================================

function init() {

    //radiosource.src   = CONFIG.streamUrl;
    elStatusDot       = document.getElementById('status-dot');
    elStatusText      = document.getElementById('status-text');
    elTrackNumber     = document.getElementById('track-number');
    elTrackTitle      = document.getElementById('track-title');
    elTrackArtist     = document.getElementById('track-artist');
    elDiscName        = document.getElementById('disc-name');
    elDiscDate        = document.getElementById('disc-date');
    elDiscUrl         = document.getElementById('disc-url');
    elFicha           = document.getElementById('ficha');
    elBtnPlay         = document.getElementById('btn-play');
    elPlayerControls  = document.getElementById('player-controls');
    elBtnToggle       = document.getElementById('btn-toggle');
    elVolSlider       = document.getElementById('vol-slider');
    elVolIcon         = document.getElementById('vol-icon');
    elTimeDisplay     = document.getElementById('time-display');
    elAudio           = document.getElementById('radio');
    elRadioSource     = document.getElementById('radiosource');
    elGissPlayer      = document.getElementById('gissplayer');
    elStreamDirecto   = document.getElementById('streamdirecto');


    // Setear URL inicial (primer puerto del array)
    applyCurrentPort();

    // Volumen
    elAudio.volume = 0.8;

    // Eventos
    elBtnPlay.addEventListener('click', play);
    elBtnToggle.addEventListener('click', togglePlay);

    elVolSlider.addEventListener('input', function (e) {
        elAudio.volume = e.target.value / 100;
    });

    // Eventos del audio con failover
    elAudio.addEventListener('playing', function () {
        resetFailover();
        setConnected(true);
        clearInterval(reconnectInterval);
    });

    elAudio.addEventListener('error', function () {
        handleStreamFailure();
    });

    elAudio.addEventListener('stalled', function () {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(function () {
            handleStreamFailure();
        }, CONFIG.stallTimeout);
    });

    elAudio.addEventListener('timeupdate', function () {
        clearTimeout(stallTimer);
        stallTimer = setTimeout(function () {
            handleStreamFailure();
        }, CONFIG.stallTimeout);
    });

    // Elemento en foco
    elBtnPlay.focus();
}

document.addEventListener('DOMContentLoaded', init);

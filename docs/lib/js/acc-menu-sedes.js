const setear_sede = (el) => {
    const dat = JSON.parse(el.querySelector('script[name=data]').innerText),
          id = el.attributes['id'].value,
          texto = `<b>${dat.nombre}</b><br>${dat.domicilio}`,
          ll = new L.LatLng(parseFloat(dat.geopos.coord[0]), parseFloat(dat.geopos.coord[1])),
          pos = L.marker(ll, {icon: iconos[dat.geopos.icono] }).bindPopup(texto).addTo(mapa),
          btn = el.querySelector('button.pin');

    btn.addEventListener('click', (ev) => {
        pos.openPopup();
        mapa.setView(ll, 17);
        window.scrollTo(0, 100);
    });
}


var cnt_mapa, mapa, iconos, centroJ;

const onload_acciones = () => {
    // seteo del mapa
    cnt_mapa = document.getElementById('osm-map');
    cnt_mapa.style = 'height:400px;';


    mapa = L.map(cnt_mapa);
    iconos = {
        'pin-hoteldada': L.icon({
            iconUrl: '/rec/grafica/pin-hoteldada.svg',
            iconSize: [51.3, 43.1],
            iconAnchor: [25.9, 43.2],
            popupAnchor: [0, -45],
        }),
        'pin-sede': L.icon({
            iconUrl: '/rec/grafica/pin-sede.svg',
            iconSize: [38.4, 43.1],
            iconAnchor: [19.4, 43.2],
            popupAnchor: [0, -45],
        })
    };
    centroJ = L.latLng('-34.59686', '-60.94954');

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    mapa.setView(centroJ, 13);

    // seleccion de sedes
    document.querySelectorAll('.sede').forEach(setear_sede);
};

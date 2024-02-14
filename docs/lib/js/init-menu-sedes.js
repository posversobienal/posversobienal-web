function setear_sede(el){
    const dat = el.attributes['data-geopos'].value.split(';').map(d => d.trim()),
          id = el.attributes['id'].value,
          texto = `<b>${dat[3]}</b><br>${dat[4]}`,
          ll = new L.LatLng(parseFloat(dat[0]), parseFloat(dat[1])),
          pos = L.marker(ll, {icon: iconos[dat[2]] }).bindPopup(texto).addTo(mapa),
          btn = el.querySelector('button.pin');
    btn.addEventListener('click', (ev) => {
        pos.openPopup();
        mapa.setView(ll, 17);
        window.scrollTo(0, 100);
    });
}

var cnt_mapa, mapa, iconos, centroJ;

window.onload = () => {
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

    const sedes = document.querySelectorAll('.sede');
    for(sede of sedes ){
        setear_sede(sede);
    }
}

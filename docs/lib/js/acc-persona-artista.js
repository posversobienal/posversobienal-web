const set_participacion = () => {
    const data_query = getQueryParams(window.location.hash.replace('#', '?'));
    const id_participacion_solicitada = data_query['p'];
    let id_participacion = id_participacion_actual;

    if(ids_participaciones.includes(id_participacion_solicitada)){
        id_participacion = id_participacion_solicitada;
    }

    let obra_actual = document.getElementById(`obra_${id_participacion}`);
    let perfil_actual = document.getElementById(`perfil_${id_participacion}`);
    obra_actual.classList.remove('oculto');
    perfil_actual.classList.remove('oculto');

    let participaciones_a_borrar = document.querySelectorAll('.oculto.participacion');
    participaciones_a_borrar.forEach(e => e.remove());
}

const onload_acciones = () => {

    let btns_ampliar_obra = document.querySelectorAll('.ampliar-imagen');

    for(el of btns_ampliar_obra){
        el.addEventListener('click', (ev)=> {
            ampliar_imagen(el.attributes['data-url'].value, '');
        });
    }
};

set_participacion();

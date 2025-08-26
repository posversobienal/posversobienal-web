const onload_acciones = () => {
    let btns_ampliar_obra = document.querySelectorAll('.ampliar-imagen');

    for(el of btns_ampliar_obra){
        el.addEventListener('click', (ev)=> {
            ampliar_imagen(el.attributes['data-url'].value, '');
        });
    }
};

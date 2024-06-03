window.addEventListener('load', () => {
    let tr = control_pagina_traducida();
    if(tr[0]){
        document.querySelector('.alerta-traduccion').classList.add('traducida');
        document.querySelector('#tr-by').innerHTML = tr[1];
    }
    resaltado_de_enlaces_actuales(document);
    hover_on_click();

    if(typeof onload_acciones === 'function') onload_acciones();

    Galeria.activar();
});


window.addEventListener('scroll', (event) => {
    if(this.scrollY > 100){
        document.body.classList.add('pagina-desplazada');
    }else{
        document.body.classList.remove('pagina-desplazada');
    }
});

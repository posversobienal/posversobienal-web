const redirigir_a_traduccion = (idioma)=>{
    window.location = `https://posversobienal-com-ar.translate.goog${window.location.pathname}?_x_tr_sl=es&_x_tr_tl=${idioma}&_x_tr_hl=${idioma}&_x_tr_pto=wapp`;
}


const ampliar_imagen = (url)=>{
    const cAct = 'activa';
    const cBlo = 'bloqueado';
    const panel = document.querySelector('#imagen_ampliada');
    const img = panel.querySelector('.imagen');
    const cerrar = panel.querySelector('.cerrar');

    panel.classList.add(cAct);
    cerrar.addEventListener('click', ()=>{
        panel.classList.remove(cAct);
        document.body.classList.remove(cBlo)
        img.attributes['src'].value = '';
    });

    img.attributes['src'].value = url;
    document.body.classList.add(cBlo)
    console.log(url, panel);

}


const control_pagina_traducida = ()=>{
    let xtb = document.querySelector('[http-equiv="X-Translated-By"]'),
        vtb = '',
        est = false;
    if(xtb){
        vtb = xtb.attributes['content'].value;
        est = true;
    }
    return [est, vtb];
}


const resaltado_de_enlaces_actuales = (contexto)=>{
    let links = contexto.querySelectorAll('a');
    for(el of links){
        if(window.location.pathname == el.attributes['href'].value){
            el.classList.add('actual');
        }
    }
}
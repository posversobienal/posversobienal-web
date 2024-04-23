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


const hover_on_click = ()=>{
    let elems = document.querySelectorAll('.hover-on-click');
    for(let el of elems){
        el.addEventListener('click', ev => {
            let el = ev.currentTarget;
            el.classList.toggle('hover');
            console.log(ev.currentTarget, '-----22')
            el.style.display='none';
            el.offsetHeight;
            el.style.display='block';
        });
    }
}


const cambiar_idioma = (obj) => {
    let elems = document.querySelectorAll('[lang]');
    let lang = obj.value;
    for(el of elems){
        console.log(el.attributes['lang'].value, lang);
        if(el.attributes['lang'].value == lang){
            el.classList.remove('d-none');
        }else{
            el.classList.add('d-none');
        }
    }
}

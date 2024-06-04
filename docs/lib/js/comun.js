const redirigir_a_traduccion = (idioma)=>{
    window.location = `https://posversobienal-com-ar.translate.goog${window.location.pathname}?_x_tr_sl=es&_x_tr_tl=${idioma}&_x_tr_hl=${idioma}&_x_tr_pto=wapp`;
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
            if(el.classList.contains('hover')){
                el.classList.remove('no-hover');
            }else{
                el.classList.add('no-hover');
            }
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


const Galeria = {
    its: undefined,
    act: undefined,
    activar: ()=> {
        if(Galeria.its === undefined){
            Galeria.its = document.querySelectorAll('.item-galeria');
        }
        Galeria.setear_items();

    },
    setear_items: () => {
        if(Galeria.its.length > 0){
            for(let i = 0; i < Galeria.its.length; i++){
                let el = Galeria.its[i];
                el.addEventListener('click', ()=> {
                    Galeria.act = i;
                    ampliar_imagen(el.attributes['src'].value);
                });
            }
        }
    },
    ampliar: (i) => {
        Galeria.its[i].click();
    },
    anterior: () => {
        let n = Galeria.act - 1;
        if(n < 0) n = Galeria.its.length - 1;
        Galeria.ampliar(n);
    },
    posterior: () => {
        let n = parseInt(Galeria.act) + 1;
        if(n >= Galeria.its.length) n = 0;
        Galeria.ampliar(n);
    }

};

const ampliar_imagen = (url)=>{
    let cAct = 'activa',
        cBlo = 'bloqueado',
        panel = document.querySelector('#imagen_ampliada'),
        img = panel.querySelector('.imagen'),
        cerrar = panel.querySelector('.cerrar'),
        anterior = panel.querySelector('.anterior'),
        posterior = panel.querySelector('.posterior');


    panel.classList.add(cAct);
    cerrar.addEventListener('click', ()=>{
        panel.classList.remove(cAct);
        document.body.classList.remove(cBlo);
        img.attributes['src'].value = '';
    });

    if(Galeria.its.length == 1){
        anterior.classList.add('oculto');
        posterior.classList.add('oculto');
    }

    anterior.addEventListener('click', Galeria.anterior);
    posterior.addEventListener('click', Galeria.posterior);

    img.attributes['src'].value = url;

    // ajustado a dimensiones disponibles
    img.style.maxWidth = `${window.innerWidth - 10}px`;
    let alto = window.innerHeight - img.offsetTop - 20;
    if(img.height > alto) img.style.maxHeight = `${alto}px`;


    document.body.classList.add(cBlo);
}

const abrir_imagen_externamente = (url) => {
    window.location.href = url;
}

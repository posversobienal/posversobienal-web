const redirigir_a_traduccion = (idioma)=>{
    window.location = `https://posversobienal-com-ar.translate.goog${window.location.pathname}?_x_tr_sl=es&_x_tr_tl=${idioma}&_x_tr_hl=${idioma}&_x_tr_pto=wapp`;
}


window.onscroll = (event) => {
    if(this.scrollY > 100){
        document.body.classList.add('pagina-desplazada')
    }else{
        document.body.classList.remove('pagina-desplazada')
    }
};

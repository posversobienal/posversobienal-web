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


/* eventos generales */
window.onscroll = (event) => {
    if(this.scrollY > 100){
        document.body.classList.add('pagina-desplazada');
    }else{
        document.body.classList.remove('pagina-desplazada');
    }
};

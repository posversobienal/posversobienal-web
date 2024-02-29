function control_pagina_traducida(){
    let xtb = document.querySelector('[http-equiv="X-Translated-By"]'),
        xtt = document.querySelector('[http-equiv="X-Translated-To"]'),
        vtb = '',
        vtx = '',
        est = false;
    if(xtb){
        vtb = xtb.attributes['content'].value;
        vtx = xtt.attributes['content'].value;
        est = true;
    }
    return [est, vtb, vtx];
}

window.onload = () => {
    let tr = control_pagina_traducida();
    if(tr[0]){
        document.querySelector('.alerta-traduccion').classList.add('traducida');
        document.querySelector('#tr-by').innerHTML = tr[1];
        document.querySelector('#tr-to').innerHTML = tr[2];
    }
}

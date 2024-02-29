function control_pagina_traducida(){
    let xtb = document.querySelector('[http-equiv="X-Translated-By"]'),
        vtb = '',
        est = false;
    if(xtb){
        vtb = xtb.attributes['content'].value;
        est = true;
    }
    return [est, vtb];
}

window.onload = () => {
    let tr = control_pagina_traducida();
    if(tr[0]){
        document.querySelector('.alerta-traduccion').classList.add('traducida');
        document.querySelector('#tr-by').innerHTML = tr[1];
    }
}

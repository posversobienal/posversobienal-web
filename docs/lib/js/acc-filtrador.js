class Filtrador {
    elem = undefined;
    cfg = undefined;
    campo = undefined;
    icono = undefined;
    cOcu = 'filtrador_ocultar_item';
    cAct = 'activo';
    html_interfaz = '<img class="icono" src="/rec/grafica/icon-buscar.svg"><span class="campo"><input type="search" name="texto"></span>';
    items = []

    constructor (el) {
        if(this.elem == undefined){
            this.elem = el;

            this.cfg = JSON.parse(this.elem.attributes['data-cfg'].value);

            this.setear_items();

            this.elem.classList.add('filtrador');
            this.elem.innerHTML = this.html_interfaz;

            this.campo = this.elem.querySelector('.campo input');
            this.icono = this.elem.querySelector('.icono');

            this.setear_eventos();
            console.log(this.cfg);

        }
    }

    setear_items(){
        this.items = document.querySelectorAll(`.${this.cfg.tipo}`);
        this.items.forEach(e => {
            let eCopia = e.cloneNode(true);
            eCopia.querySelectorAll('script').forEach(e => { e.remove() });

            e.texto = eCopia.textContent.toLocaleLowerCase().trim().replaceAll('\n', '');
            console.log(e.texto)
        });
    }

    setear_eventos(){
        this.icono.addEventListener('click', ev => {
            this.elem.classList.toggle(this.cAct);
            if(this.elem.classList.contains(this.cAct)){
                this.campo.focus();
            }else{
                this.filtrar('');
            }
        });

        ['keyup', 'change', 'input'].forEach(et => {
            this.campo.addEventListener(et, ev=> {
                this.filtrar(ev.target.value.toLocaleLowerCase());
            });
        });

    }

    filtrar(bus){
        this.items.forEach(e => {
            if(e.texto.includes(bus)){
                e.classList.remove(this.cOcu);
            }else{
                e.classList.add(this.cOcu);
            }
        });
    }


}

var filtrador = window.filtrador_aqui;

window.addEventListener('load', () => {
    if(filtrador){ cc = new Filtrador(filtrador); }
});

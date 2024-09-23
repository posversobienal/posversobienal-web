class Cronograma {
    elem = undefined;
    data = undefined;
    filtro = undefined;
    cfg = undefined;
    cLsEventos = 'lista-de-eventos';
    html_mes = '<div class="mes" name="{mes_id}"><h3 class="mes_titulo">{mes_nomb}</h3><ul class="fechas"></ul></div>';
    html_evn = `<li><div class="evento">
                   <div class="ev_titulo">
                      <h5><span class="dia">{dia_nomb} {dia_nume}</span> <span class="hora">({horario})</span></h5>
                      <p class="px-1">{lugar}</p>
                   </div>
                   <div class="ficha">
                      <p class="titular"><span class="tipo">{tipo}</span> <span class="titulo">{titulo}</span></p>
                      <p class="texto">{texto}</p>
                   </div>
               </div></li>`;

    constructor (el, da, fi) {
        if(this.elem == undefined){
            this.elem = el;
            this.data = da;
            this.filtro = fi;
            this.cfg = JSON.parse(this.elem.attributes['data-cfg'].value);

            this.filtrar();
            this.generar();
            this.posprocesar();

            if(this.cfg.menu_filtrado){
                this.utilidad_filtrado();
            }

            if(this.cfg.filtro_x_tipo){
                this.filtrar_por_tipo(this.cfg.filtro_x_tipo);
            }

        }
    }

    filtrar() {
        if(this.filtro){
            let k = undefined;
            for(k of Object.keys(this.filtro)){
                if(k == 'sede'){
                    let sede_actual = this.filtro[k];
                    let data_filtrada = this.data.cronograma;
                    let k_meses = Object.keys(data_filtrada);
                    for(let k_mes of k_meses){
                        let k_dias = Object.keys(data_filtrada[k_mes]);
                        for(let k_dia of k_dias){
                            let v_dia = data_filtrada[k_mes][k_dia];
                            let k_horas = Object.keys(v_dia.eventos);
                            for(let k_hora of k_horas){
                                let v_evento = v_dia.eventos[k_hora]
                                if(!(v_evento.lugar === sede_actual)){
                                    data_filtrada[k_mes][k_dia]['eventos'][k_hora]['ignorar'] = true;
                                }
                            }
                        }
                    }
                    this.data.cronograma = data_filtrada;
                }
            }
        }
    }

    generar() {
        let k_meses = Object.keys(this.data.cronograma);
        let cnt = document.createElement('div');
        cnt.classList.add(this.cLsEventos);

        let h_meses = [];
        for(let k_mes of k_meses){
            h_meses.push(this.html_mes.format({
                mes_id: k_mes,
                mes_nomb: k_mes.toLocaleUpperCase(),
            }));
        }
        cnt.innerHTML = h_meses.join('');

        this.elem.appendChild(cnt);

        for(let k_mes of k_meses){
            let k_dias = Object.keys(this.data.cronograma[k_mes]);
            for(let k_dia of k_dias){
                let v_dia = this.data.cronograma[k_mes][k_dia];
                let k_horas = Object.keys(v_dia.eventos);
                for(let k_hora of k_horas){
                    let v_evento = v_dia.eventos[k_hora]
                    let d_evento = this.html_evn.format({
                        dia_nume: k_dia,
                        dia_nomb: v_dia.dia,
                        horario: k_hora,
                        lugar: this.lugar_html(v_evento.lugar),
                        tipo: v_evento.tipo,
                        titulo: this.titulo_html(v_evento.titulo, v_evento.url),
                        texto: v_evento.texto,
                    })

                    if(!v_evento.ignorar){
                        this.elem.querySelector(`[name=${k_mes}] .fechas`).innerHTML += d_evento;
                    }

                }
            }
        }
    }

    posprocesar(){
        // ocultar los meses que no tienen eventos para la sede actual
        this.elem.querySelectorAll('.fechas').forEach(el => {
            if(el.innerHTML === ''){
                el.parentElement.remove();
            }
        });

        // eliminar todo si no hay eventos para la sede actual
        if(this.elem.querySelector(`.${this.cLsEventos}`).innerHTML === ''){
            this.elem.parentElement.remove();
        }
    }

    utilidad_filtrado(){
        let menu = document.createElement('div');
        menu.innerHTML = '<button>Mostrar Todos</button><span>o filtrar por:</span><br>';
        menu.classList.add('menu-filtrado');
        let tipos = [];
        let tagtipo = this.elem.querySelectorAll('span.tipo');
        tagtipo.forEach(el => {
            let v = el.innerHTML;
            if(v == ''){ v = '-Sin definir-'}
            if( !tipos.includes(v)){
                tipos.push(v);
            }
        });
        tipos.sort().forEach(v=>{
            let btn = document.createElement('button');
            btn.innerHTML = v
            menu.appendChild(btn);
        });

        menu.innerHTML = `<div class="icono" title="Filtrado por TIPO"><img src="/rec/grafica/icon-filtrar.svg" width="30"></div><div class="contenido">${menu.innerHTML}</div>`;

        this.elem.appendChild(menu);

        menu.querySelectorAll('button').forEach(el=>{
            el.addEventListener('click', ev=>{
                this.filtrar_por_tipo(el.innerHTML);
            })
        });

    }

    filtrar_por_tipo(tipos){
        if(typeof tipos === 'string'){ tipos = [tipos]; }

        let cOc = 'ocultar';
        let eventos = this.elem.querySelectorAll('.evento');
        eventos.forEach(el=>{ el.parentElement.classList.add(cOc) });
        tipos.forEach(id_tipo=>{
            if(id_tipo !== 'Mostrar Todos'){
                if(id_tipo == '-Sin definir-'){
                    id_tipo = '';
                }
                eventos.forEach(el=>{
                    let tipo = el.querySelector('.tipo');
                    if(tipo.innerHTML === id_tipo){
                        el.parentElement.classList.remove(cOc);
                    }else{}
                });
            }
        });
    }

    lugar_html(lugar_id) {
        let nombre = this.data.sedes.nombres[lugar_id][0],
            con_link = this.data.sedes.nombres[lugar_id][1];
        if(nombre !== ''){
            let info = con_link ? `<a href="/sds/${lugar_id}/">${nombre}</a>` : `<span>${nombre}</span>`;
            return `<p class="lugar">${info}</p>`;
        }
        return '';
    }

    titulo_html(titulo, url) {
        if(url !== undefined){
            return `<a href="${url}">${titulo}</a>`;
        }
        return titulo;
    }


}

var cr_completo = window.cronograma_completo_aqui,
    cr_x_sede = window.cronograma_por_sede_aqui,
    cc =  undefined,
    cs =  undefined;

window.addEventListener('load', () => {
    if(cr_completo){ cc = new Cronograma(cr_completo, cfg); }
    if(cr_x_sede){
        cs = new Cronograma(
            cr_x_sede, cfg,
            {'sede': cr_x_sede.attributes.data_idsede.value}
        );
    }
});

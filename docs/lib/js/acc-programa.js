class Programa {
    elem = undefined;
    data = undefined;
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

    constructor (el, da) {
        if(this.elem == undefined){
            this.elem = el;
            this.data = da;

            this.generar()
        }
    }

    generar() {
        let k_meses = Object.keys(this.data.programa);
        let cnt = document.createElement('div');

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
            let k_dias = Object.keys(this.data.programa[k_mes]);
            for(let k_dia of k_dias){
                let v_dia = this.data.programa[k_mes][k_dia];
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

                    this.elem.querySelector(`[name=${k_mes}] .fechas`).innerHTML += d_evento;
                }
            }
        }

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
        console.log(titulo, url)
        if(url !== undefined){
            return `<a href="${url}">${titulo}</a>`;
        }
        return titulo;
    }

}

window.addEventListener('load', () => {
    let pc = new Programa(window.programa_completo_aqui, cfg)
});

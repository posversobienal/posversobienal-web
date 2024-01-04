"use strict";

const Fondo = {
    asignar: () => {
        let ids_obras = Object.keys(rec.obras),
            id_elegido = ids_obras[parseInt(Math.random() * (ids_obras.length - 1))],
            obra_elegida = rec.obras[id_elegido],
            archivo_foto = obra_elegida.fotos[0],
            autoria = rec.artistas[obra_elegida.autoria];

        fondo_img.style.backgroundImage = `url(/rec/foto/obras/${archivo_foto})`;

        fondo_link.href = `/pag/artistas_invitados/#${obra_elegida.autoria}`;
        fondo_link.title = `Obra de ${autoria.nombre} ${autoria.apellido}`;
    },

    setear_interactividad: () => {
        fondo_link.addEventListener('mouseenter', (e)=>{
            titular.classList.add('ocultar');
            fondo_img.classList.add('resaltar');
        });
        fondo_link.addEventListener('mouseleave', (e)=>{
            titular.classList.remove('ocultar');
            fondo_img.classList.remove('resaltar');
        });

        document.addEventListener('mousemove', (e) => {
            const x = e.clientX,
                  y = e.clientY,
                  xp = Math.round(x * 100 / window.innerWidth),
                  yp = Math.round(y * 100 / window.innerHeight);
            fondo_img.style.backgroundPosition = `${xp}% ${yp}%`;
        });
    }
};



// inicializar
Fondo.setear_interactividad();
Fondo.asignar();

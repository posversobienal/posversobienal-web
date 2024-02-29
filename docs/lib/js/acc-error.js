const visor = document.querySelector('#vcanvas'),
      _hydraSeteo = {
          canvas: visor,
          detectAudio: false,
          makeGlobal: true,
      },
      _hydra = new Hydra(_hydraSeteo),
      tipografias = ["sans", "letter", "serif", "monospace"],
      composicion = [
          ()=>{
              speed = 0.2;
              voronoi(2, 2, 2).brightness(-0.1)
                  .modulate(text(t0).scale([3,-3].ease()).invert())
                  .diff(text(t1).scale(0.9).rotate(0, 0.2))
                  .modulate(text(t2).invert().scroll(0, 0, 0, 0.3))
                  .modulateScale(text(t3).invert().scale(3).scroll(0,0,1))
                  .thresh()
                  .out()
          },
          ()=>{
              speed = 0.8
              osc(10)
                  .brightness(-0.1)
                  .modulate(text(t0).scale([3,-3].ease()).invert())
                  .diff(text(t1).scale(0.9).rotate(0, 0.2))
                  .modulate(text(t2).invert().scroll(0, 0, 0, 0.3))
                  .modulateScale(text(t3).invert().scale(3).scroll(0,0,1))
                  .thresh()
                  .out()
          },
          ()=>{
              solid()
                  .diff(text(t0).invert().scale(0.9).scrollX(0.1,0.1).kaleid(1))
                  .diff(text(t1).scale(0.9).rotate(0, 0.2))
                  .diff(text(t2).invert().scroll(0, 0, 0, 0.3))
                  .diff(text(t3).invert().scale(3).scroll(0,0,1))
                  .thresh(0.1)
                  .out()
          },
          ()=>{
              speed = 0.3
              osc(10).invert().thresh()
                  .modulate(noise(1), 0.5)
                  .modulateRotate(text(t0).invert().scale(0.9).scrollX(0.1,0.1).kaleid(1))
                  .modulateRotate(text(t1).invert().rotate(0, -1))
                  .modulateRotate(text(t2).invert().scrollY(0, -2))
                  .modulateRotate(text(t3).invert().rotate(0,0.1).scroll(0,0,1))
                  .out()
          },
          ()=>{
              speed = 0.3
              solid()
                  .diff(text(t0).invert().scrollY(0,0.1))
                  .diff(text(t1).invert().scrollY(0,0.2))
                  .diff(text(t2).invert().scrollY(0,0.3))
                  .diff(text(t3).invert().scrollY(0,0.4))
                  .out()
          },
          ()=>{
              let v1 = Math.random() - Math.random(),
                  v2 = Math.random() - Math.random(),
                  v3 = Math.random() - Math.random(),
                  v4 = Math.random() - Math.random();
              speed = 0.3
              solid()
                  .diff(text(t0).invert().rotate(0,v1))
                  .diff(text(t1).invert().rotate(0,v2))
                  .diff(text(t2).invert().rotate(0,v3))
                  .diff(text(t3).invert().rotate(0,v4))
                  .scroll(0, 0,v1-v2, v3-v4)
                  .out()

          },
          ()=>{
              let v1 = 5 * (Math.random() - Math.random()),
                  v2 = 2 * (Math.random() - Math.random()),
                  v3 = 3 * (Math.random() - Math.random()),
                  v4 = 4 * (Math.random() - Math.random());
              speed = 0.2
              solid()
                  .diff(text(t0).invert().rotate(0, v1).scale([v1 + v2, v3 + v4]))
                  .diff(text(t1).invert().rotate(0, v2).scale([v3 + v2, v4 + v2]))
                  .diff(text(t2).invert().rotate(0, v2).scale([v4 + v2, v1 + v3]))
                  .diff(text(t3).invert().rotate(0, v4).scale([v1 + v2, v2 + v1]))
                  .out()
          },
          ()=>{
              speed = 0.3
              solid()
                  .diff(text(t0).invert().scrollY(0,0.1))
                  .diff(text(t1).invert().scrollY(0,0.2))
                  .diff(text(t2).invert().scrollY(0,0.3))
                  .diff(text(t3).invert().scrollY(0,0.4))
                  .kaleid(1+(Math.random()*9))
                  .out()
          },
          ()=>{
              speed = 0.3
              solid()
                  .diff(text(t0).invert().rotate(0,1))
                  .diff(text(t1).invert(1).rotate(0,2))
                  .diff(text(t2).invert().rotate(0,3))
                  .diff(text(t3).invert(1).rotate(0,4))
                  .kaleid(1+(Math.random()*9))
                  .scroll(0.5,0.5, 0.1, 0.2)
                  .out()
          },
      ];

var t0, t1, t2, t3 = '';

const onload_acciones = ()=>{
    hydraText.font = tipografias[
        parseInt(Math.random() * tipografias.length)
    ];
    t0 = window.location.protocol;
    t1 = window.location.host;
    t2 = window.location.pathname;
    t3 = window.location.hash;

    composicion[parseInt(Math.random() * composicion.length)]()
};

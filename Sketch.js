const width = 1000;
const height = 800;
const tau = 2*Math.PI;
const slotSize = 30;
let frame = 0;       
const gameCanvas = document.getElementById("gameCanvas");        

const ctx = gameCanvas.getContext("2d");

const star = {
    pos: vec(0, 0),
    radius: 30,
};
const planet = new Planet(100, 0, 2000, 200, 250, 45, 0, 0.0001, star);
const moon = new Planet(30, 0, 500, 180, 210, 20, 0, 0.003, planet);
function loop(){
    mouse.space = screenToSpace(mouse.screen);
    ctx.fillStyle = "black";
    ctx.fillRect(-width, -height, width*2, height*2)
    camera.run();
    planet.run();
    planet.display();
    moon.run();
    moon.display();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    frame ++;
}
setInterval(loop, 1000/60);

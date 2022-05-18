const width = 1000;
const height = 800;


const gameCanvas = document.getElementById("gameCanvas");
const ctx = gameCanvas.getContext("2d");
let frame = 0;
let sun = {x: 0, y: 0, mass: 100};
let planets = [{x: 0, y: 0, mass: 40, start: 0, speed: 0.01, xOrbitScale: 150, yOrbitScale: 140}];

let moons = [{x: 0, y:0, mass: 5, start: 20, speed: 0.1, xOrbitScale: 70, yOrbitScale: 80, orbit: planets[0]}];

let camera = {
	x: 0,
	y: 0,
	target: planets[0],
	run: function(){
		this.x += ((width/2-this.target.x)-this.x)/10;
		this.y += ((height/2-this.target.y)-this.y)/10;
	}
};
function loop(){
	ctx.translate(-camera.x, -camera.y);
	ctx.fillStyle = "green";
	ctx.fillRect(0, 0, width, height);
	camera.run();
	ctx.translate(camera.x, camera.y);
	ctx.fillStyle = "yellow";
	ctx.fillRect(sun.x, sun.y, sun.mass, sun.mass);
	ctx.fillStyle = "white";
	for(let i = 0 ; i < planets.length ; i ++){
		ctx.fillRect(planets[i].x, planets[i].y, planets[i].mass, planets[i].mass);
		planets[i].x = Math.cos((planets[i].start+frame)*planets[i].speed)*planets[i].xOrbitScale;
		planets[i].y = Math.sin((planets[i].start+frame)*planets[i].speed)*planets[i].yOrbitScale;
	}
	ctx.fillStyle = "black";
	for(let i = 0 ; i < moons.length ; i ++){
		ctx.fillRect(moons[i].x, moons[i].y, moons[i].mass, moons[i].mass);
		moons[i].x = moons[i].orbit.x + Math.cos((moons[i].start+frame)*moons[i].speed)*moons[i].xOrbitScale;
		moons[i].y = moons[i].orbit.y +Math.sin((moons[i].start+frame)*moons[i].speed)*moons[i].yOrbitScale;
	}
	frame ++;
}


setInterval(loop, 30);


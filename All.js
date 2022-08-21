const vec = (function () {
    const func = function (x, y) {
        return {
            x: x,
            y: y,
        };
    };
    func.add = function (a, b) {
        return {
            x: a.x + b.x,
            y: a.y + b.y,
        };
    };
    func.sub = function (a, b) {
        return {
            x: a.x - b.x,
            y: a.y - b.y,
        };
    };
    func.mult = function (a, mult) {
        return {
            x: a.x * mult,
            y: a.y * mult,
        };
    };
    func.div = function (a, mult) {
        return {
            x: a.x / mult,
            y: a.y / mult,
        };
    };
    func.mag = function (a) {
        return Math.hypot(a.x, a.y);
    };
    func.dot = function (a, b) {
        return a.x * b.x + a.y * b.y;
    };
    func.norm = function (a) {
        const len = vec.mag(a);
        return {
            x: a.x / len,
            y: a.y / len,
        };
    };
    func.limit = function (a, lim) {
        let multi;
        const len = vec.mag(a);
        multi = len <= lim ? 1 : lim / len;
        a.x *= multi;
        a.y *= multi;
        return a;
    };
    func.angleBetween = function (a, b) {
        return Math.acos(vec.dot(a, b) / (vec.mag(a) * vec.mag(b)));
    };
    func.toAngle = function (a) {
        return Math.atan2(a.y, a.x);
    };
    func.fromAngle = function (angle) {
        return vec(Math.cos(angle), Math.sin(angle));
    };
    func.copy = function (a) {
        return vec(a.x, a.y);
    };
    return func;
})();
const tau = Math.PI * 2;
const camera = {
    pos: vec(0, 0),
    rotation: 0,
    target: moon,
    run: function () {
        this.pos.x += (-this.target.pos.x - this.pos.x) / 10;
        this.pos.y += (-this.target.pos.y - this.pos.y) / 10;
        //this.rotation += (-this.target.rotation-this.rotation)/10;
        this.rotation += 0.001;
        ctx.setTransform(1, 0, 0, 1, width / 2, height / 2);
        ctx.rotate(this.rotation);
        ctx.translate(this.pos.x, this.pos.y);
    }
};
function angleToPoint(x, y, x2, y2) {
    return -Math.atan2(x - x2, y - y2) - 1.5708;
}
function getPointOnOrbit(i, orbitRadiusX, orbitRadiusY, orbitRotation) {
    return { x: (Math.cos(i) * orbitRadiusX) * Math.cos(orbitRotation) - (Math.sin(i) * orbitRadiusY) * Math.sin(orbitRotation), y: (Math.cos(i) * orbitRadiusX) * Math.sin(orbitRotation) + (Math.sin(i) * orbitRadiusY) * Math.cos(orbitRotation) }; // This is just absurd
}
function screenToSpace(pos) {
    return vec.sub(rotatePoint(vec.sub(pos, vec(width / 2, height / 2)), -camera.rotation), camera.pos);
}
function rotatePoint(pos, angle) {
    return { x: pos.x * Math.cos(angle) - pos.y * Math.sin(angle), y: pos.x * Math.sin(angle) + pos.y * Math.cos(angle) };
}
function dist(a, b, c, d) {
    return Math.abs(Math.sqrt((Math.max(a, c) - Math.min(a, c)) ** 2 + (Math.max(b, d) - Math.min(b, d)) ** 2));
}
const mouse = {
    screen: vec(0, 0),
    space: vec(0, 0),
    pressed: false
};
gameCanvas.addEventListener("mousemove", (e) => {
    mouse.screen = { x: e.clientX, y: e.clientY };
});

const separation = 0.010,
    cohesion = 0.025,
    alignment = 0.15,
    sepSight = 30,
    alignSight = 50,
    cohesionSight = Infinity;

const ids = ['white', 'red', 'green', 'blue', 'purple'];
const drones = [];
class Drone {
    constructor(id = 'white') {
        this.pos = vec(Math.random()*50+200, Math.random()*50+200);
        this.velocity = vec(0, 0);
        this.acceleration = vec.norm(vec(Math.random()*2-1, Math.random()*2-1));
        
        this.id = id;
        this.active = true;
        this.maxVelocity = 1;
        this.target = null;
        this.podId = 0;
    }
    update() {
        this.pos = vec.add(this.pos, this.velocity);
        this.velocity = vec.add(this.velocity, this.acceleration);
        vec.limit(this.velocity, this.maxVelocity);
        
        let sepDir = vec(0, 0);
        let center = this.pos,
            close = 0;
        let angle = vec(0, 0);
        
        for (const drone of drones) {
            const dist = Math.hypot(this.pos.x-drone.pos.x, this.pos.y-drone.pos.y);
            if (!drone.active || drone === this) continue;
            
            const scale = 1-dist/30+0.1;
            
            if (dist < sepSight) {
                sepDir = vec.add(
                    sepDir,
                    vec.mult(vec.sub(this.pos, drone.pos), scale)
                );
            }
            
            if (drone.id !== this.id) continue;
            
            if (dist < cohesionSight) {
                center = vec.add(
                    center,
                    drone.pos,
                );
            }
            if (dist < alignSight) angle = vec.add(angle, drone.velocity);
            close ++;
        }
        
        // Cohesion
        center = vec.div(center, close);
        const dirToCenter = vec.sub(center, this.pos);
        if (center.x && center.y && close) {
            
            this.acceleration = vec.norm(
                vec.add(this.acceleration, vec.mult(vec.norm(dirToCenter), cohesion))
            );
        }
        
        // Separation
        if (sepDir.x && sepDir.y) sepDir = vec.mult(sepDir, separation);
        this.acceleration = vec.norm(
            vec.add(this.acceleration, sepDir)
        );
        
        // Alignment
        if (close) {
            const currentAcc = vec.copy(this.acceleration);
            this.acceleration = vec.norm(
                vec.add(this.acceleration, vec.mult(vec.div(angle, close), alignment))
            );
        }
        
        // Targeting
        if (pods[this.podId]?.target) {
            const dirToTarget = vec.sub(
                vec(pods[this.podId].target.pos.x, pods[this.podId].target.pos.y),
                this.pos
            );
            
            this.acceleration = vec.norm(vec.add(
                this.acceleration,
                vec.mult(vec.norm(dirToTarget), 0.1)
            ));
            
            
            if (Math.hypot(dirToTarget.x, dirToTarget.y) < pods[this.podId].target.radius) {
                this.active = false;
            }
        }
        
        // Obstacles
        for (const obj of gravityObj) {
            if (obj === pods[this.podId]?.target) continue;
            const dist = Math.hypot(obj.pos.x-this.pos.x, obj.pos.y-this.pos.y);
            if (dist < 80 * obj.radius/30) {
            
                const scale = 0.5-(dist-30)/100+0;
                const dirToObs = vec.sub(this.pos, obj.pos)
                
                this.acceleration = vec.norm(vec.add(
                    this.acceleration,
                    vec.mult(vec.norm(dirToObs), scale)
                ));
            }
        }
        
        
        
        
        // Boundaries
        if (this.pos.x < 50) {
            this.acceleration = vec.norm(
                vec.add(
                    this.acceleration,
                    vec(0.5-this.pos.x/100, 0)
                )
            );
        }
        if (this.pos.x > 650) {
            this.acceleration = vec.norm(
                vec.add(
                    this.acceleration,
                    vec(-(0.5-(650-this.pos.x)/100), 0)
                )
            );
        }
        if (this.pos.y < 50) {
            this.acceleration = vec.norm(
                vec.add(
                    this.acceleration,
                    vec(0, 0.5-this.pos.y/100)
                )
            );
        }
        if (this.pos.y > 650) {
            this.acceleration = vec.norm(
                vec.add(
                    this.acceleration,
                    vec(0, -(0.5-(650-this.pos.y)/100))
                )
            );
        }
    }
    display() {
        ctx.fillStyle = ctx.strokeStyle = this.id;
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 2, 0, tau);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.velocity.x*4, this.pos.y + this.velocity.y*4);
        ctx.closePath();
        ctx.stroke();
    }
    
    static createTypeFromId(id) {
        return ids[id];
    }
}

for (let i = 0; i < 50; i ++) {
    drones.push(new Drone());
}
const pods = [
    {
        type: null,
        target: planet,
    }
];


class Planet {
	constructor(radius, startRotation, rotationSpeed, orbitRadiusX, orbitRadiusY, orbitRotation, orbitStart, orbitSpeed, orbitTarget) {
		this.orbitRadiusX = orbitRadiusX;
		this.orbitRadiusY = orbitRadiusY;
		this.orbitRotation = orbitRotation;
		this.orbitStart = orbitStart;
		this.orbitSpeed = orbitSpeed;
		this.radius = radius;
		this.rotationSpeed = rotationSpeed;//The number of frames that pass before a planet makes one full rotation
		this.rotation = startRotation;
		this.pointOnOrbit = orbitStart;
		this.orbitTarget = orbitTarget;
		this.pos = getPointOnOrbit(orbitStart, orbitRadiusX, orbitRadiusY, orbitRotation);
		this.slots = Array(Math.floor(tau*radius));
	}
	display() {
	    let previousTransform = ctx.getTransform();
	    ctx.translate(this.pos.x, this.pos.y);
	    ctx.rotate(this.rotation);
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.ellipse(0, 0, this.radius, this.radius, 0, 0, 2 * Math.PI);
		ctx.fill();
		ctx.fillStyle = "grey";
		ctx.beginPath();
		ctx.ellipse(0, 0, this.radius, this.radius, 0, 0, Math.PI);
		ctx.fill();
		ctx.setTransform(previousTransform);
		
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.setLineDash([5, 10]);
		ctx.ellipse(this.orbitTarget.pos.x, this.orbitTarget.pos.y, this.orbitRadiusX, this.orbitRadiusY, this.orbitRotation, 0, 2 * Math.PI);
		ctx.stroke();
	}
	run() {
	    this.pointOnOrbit += this.orbitSpeed;
	    this.rotation += (2*Math.PI)/this.rotationSpeed;
	    
	    
	    this.pos = vec.add(getPointOnOrbit(this.pointOnOrbit, this.orbitRadiusX, this.orbitRadiusY, this.orbitRotation), this.orbitTarget.pos?this.orbitTarget.pos:this.orbitTarget);
	    
	    if(dist(mouse.space.x, mouse.space.y, this.pos.x, this.pos.y)<this.radius){
	        camera.target = this;
	    }
	}
}

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
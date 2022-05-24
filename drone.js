const separation = 0.005,
    cohesion = 0.025,
    alignment = 0.15,
    sepSight = 20,
    alignSight = 50,
    cohesionSight = Infinity;

const obstacles = [
    vec(350, 350),
];

const ids = ['white', 'red', 'green', 'blue', 'purple'];
class Drone {
    constructor(id = 'white') {
        this.pos = vec(Math.random()*50+200, Math.random()*50+200);
        this.velocity = vec(0, 0);
        this.acceleration = vec.norm(vec(Math.random()*2-1, Math.random()*2-1));
        
        this.id = id;
        this.active = true;
        this.maxVelocity = 1;
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
            if (drone === this) continue;
            
            const scale = 1-dist/50+0.1;
            
            if (dist < sepSight) {
                sepDir = vec.add(
                    sepDir,
                    vec.sub(this.pos, drone.pos)
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
        const dirToTarget = vec.sub(
            vec(mouseX, mouseY),
            this.pos
        );
        
        this.acceleration = vec.norm(vec.add(
            this.acceleration,
            vec.mult(vec.norm(dirToTarget), 0.1)
        ));
        
        if (Math.hypot(dirToTarget.x, dirToTarget.y) < 30) {
            this.active = false;
        }
        
        // Obstacles
        for (const obs of obstacles) {
            const dist = Math.hypot(obs.x-this.pos.x, obs.y-this.pos.y);
            if (dist > 80) continue;
            
            const scale = 0.5-(dist-30)/100+0;
            const dirToObs = vec.sub(this.pos, obs)
            
            this.acceleration = vec.norm(vec.add(
                this.acceleration,
                vec.mult(vec.norm(dirToObs), scale)
            ));
            
            
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
        ctx.arc(this.pos.x, this.pos.y, 3, 0, tau);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.velocity.x*7, this.pos.y + this.velocity.y*7);
        ctx.closePath();
        ctx.stroke();
    }
    
    static createTypeFromId(id) {
        return ids[id];
    }
}

const drones = [];


for (let i = 0; i < 100; i ++) {
    drones.push(new Drone(Drone.createTypeFromId(i % 5)));
}

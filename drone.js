const separation = 0.005,
    cohesion = 0.025,
    alignment = 0.15,
    sepSight = 20,
    alignSight = 50,
    cohesionSight = 500;

class Drone {
    constructor() {
        this.pos = vec(Math.random()*50+200, Math.random()*50+200);
        this.velocity = vec(0, 0);
        this.acceleration = vec.norm(vec(Math.random()*2-1, Math.random()*2-1));
    }
    update() {
        this.pos = vec.add(this.pos, this.velocity);
        this.velocity = vec.add(this.velocity, this.acceleration);
        vec.limit(this.velocity, 4);
        
        let sepDir = vec(0, 0);
        let center = this.pos,
            close = 0;
        let angle = vec(0, 0);
        // console.log(center);
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
            if (dist < cohesionSight) {
                center = vec.add(
                    center,
                    drone.pos,
                );
            }
            if (dist < alignSight) angle = vec.add(angle, drone.velocity);
            close ++;
        }
        
        if (sepDir.x && sepDir.y) sepDir = vec.mult(sepDir, separation);
        
        if (center.x && center.y && close) {
            center = vec.div(center, close);
            const dirToCenter = vec.norm(vec.sub(center, this.pos));
            
            this.acceleration = vec.norm(
                vec.add(this.acceleration, vec.mult(dirToCenter, cohesion))
            );
        }
        this.acceleration = vec.norm(
            vec.add(this.acceleration, sepDir)
        );
        
        if (close) {
            const currentAcc = vec.copy(this.acceleration);
            this.acceleration = vec.norm(
                vec.add(this.acceleration, vec.mult(vec.div(angle, close), alignment))
            );
        }
        
        if (this === drone[0]) {
            // ctx.beginPath();
            // ctx.strokeStyle = 'green';
            // ctx.lineWidth = 4;
            // ctx.moveTo(this.pos.x, this.pos.y);
            // ctx.lineTo(this.pos.x + angle.x*5, this.pos.y+angle.y*5);
            // ctx.stroke();
            // ctx.lineWidth = 1;
            // ctx.closePath();
        }
        
        
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
        ctx.fillStyle = ctx.strokeStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, 3, 0, tau);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(this.pos.x, this.pos.y);
        ctx.lineTo(this.pos.x + this.velocity.x*2, this.pos.y + this.velocity.y*2);
        ctx.closePath();
        ctx.stroke();
    }
}

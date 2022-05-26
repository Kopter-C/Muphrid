const separation = 0.010,
    cohesion = 0.025,
    alignment = 0.15,
    sepSight = 30,
    alignSight = 50,
    cohesionSight = Infinity;

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

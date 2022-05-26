
const asteroids = [];
class Asteroid {
    constructor() {
        this.pos = vec(207, 208);
        this.velocity = vec(0, 1);
        this.acceleration = vec(0, 0);
        this.radius = 5;
    }
    update() {
        this.pos = vec.add(this.pos, this.velocity);
        this.velocity = vec.add(this.velocity, this.acceleration);
        //vec.limit(this.velocity, 5);
        
        for (const obj of gravityObj) {
            const dirToObj = vec.sub(obj.pos, this.pos);
            const distsq = dirToObj.x*dirToObj.x+dirToObj.y*dirToObj.y;
            const mag = 3 * (obj.radius * this.radius) / distsq;
            
            this.acceleration = vec.mult(vec.norm(
                vec.add(this.acceleration, dirToObj)
            ), mag);
            
        }
    }
    display() {
        ctx.fillStyle = 'white'
        ctx.fillRect(this.pos.x, this.pos.y, 15, 15);
    }
    
}
asteroids.push(new Asteroid());

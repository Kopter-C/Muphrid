const vec = (function() {
    const func = function(x, y) {
        return {
            x: x,
            y: y,
        };
    };
    func.add = function(a, b) {
        return {
            x: a.x+b.x,
            y: a.y+b.y,
        };
    };
    func.sub = function(a, b) {
        return {
            x: a.x-b.x,
            y: a.y-b.y,
        };
    };
    func.mult = function(a, mult) {
        return {
            x: a.x*mult,
            y: a.y*mult,
        };
    };
    func.div = function(a, mult) {
        return {
            x: a.x/mult,
            y: a.y/mult,
        };
    };
    func.mag = function(a) {
        return Math.hypot(a.x, a.y);
    };
    func.dot = function(a, b) {
        return a.x*b.x+a.y*b.y;
    };
    func.norm = function(a) {
        const len = vec.mag(a);
        return {
            x: a.x/len,
            y: a.y/len,
        };
    };
    func.limit = function(a, lim) {
        let multi;
        const len = vec.mag(a);
        multi = len <= lim ? 1 : lim/len;
        
        a.x *= multi;
        a.y *= multi;
    };
    func.angleBetween = function(a, b) {
        return Math.acos(vec.dot(a,b)/(vec.mag(a)*vec.mag(b)));
    }
    func.toAngle = function(a) {
        return Math.atan2(a.y, a.x);
    };
    func.fromAngle = function(angle) {
        return vec(Math.cos(angle), Math.sin(angle));
    };
    func.copy = function(a) {
        return vec(a.x, a.y);
    };
    return func;
})();

const timers = (function() {
    const pObj = {};
    let id = 0;
    function func() {
        for (let i in pObj) {
            if (--pObj[i][1] <= 0) {
                pObj[i][0]();
                delete pObj[i];
            }
        }
    }
    func.add = function(f, t) {
        pObj[id] = [f, t*0.06];
        return id++;
    };
    func.remove = function(timerId) {
        delete pObj[timerId];
    }
    
    return func;
})();
const tau = Math.PI*2;
const camera = {
	pos: {x:0, y:0},
	rotation: 0,
	target: moon,
	run: function(){// Must be run in loop
		this.pos.x += (-this.target.pos.x-this.pos.x)/10;
		this.pos.y += (-this.target.pos.y-this.pos.y)/10;
		//this.rotation += (-this.target.rotation-this.rotation)/10;
		this.rotation += 0.001;
		ctx.setTransform(1, 0, 0, 1, width/2, height/2);
		ctx.rotate(this.rotation);
		ctx.translate(this.pos.x, this.pos.y);
	}
};
function angleToPoint(x, y, x2, y2){
	return -Math.atan2(x-x2, y-y2)-1.5708;
}
function getPointOnOrbit(i, orbitRadiusX, orbitRadiusY, orbitRotation){
	return {x: (Math.cos(i)*orbitRadiusX)*Math.cos(orbitRotation)-(Math.sin(i)*orbitRadiusY)*Math.sin(orbitRotation), y: (Math.cos(i)*orbitRadiusX)*Math.sin(orbitRotation)+(Math.sin(i)*orbitRadiusY)*Math.cos(orbitRotation)};// This is just absurd
}

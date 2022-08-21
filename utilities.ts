type vec2 = {
    x: number,
    y: number
}

const vec = (function() {
    const func = function(x: number, y: number): vec2 {
        return {
            x: x,
            y: y,
        };
    };
    func.add = function(a: vec2, b: vec2): vec2 {
        return {
            x: a.x+b.x,
            y: a.y+b.y,
        };
    };
    func.sub = function(a: vec2, b: vec2): vec2 {
        return {
            x: a.x-b.x,
            y: a.y-b.y,
        };
    };
    func.mult = function(a: vec2, mult: number): vec2 {
        return {
            x: a.x*mult,
            y: a.y*mult,
        };
    };
    func.div = function(a: vec2, mult: number): vec2 {
        return {
            x: a.x/mult,
            y: a.y/mult,
        };
    };
    func.mag = function(a: vec2): number {
        return Math.hypot(a.x, a.y);
    };
    func.dot = function(a: vec2, b: vec2) {
        return a.x*b.x+a.y*b.y;
    };
    func.norm = function(a: vec2): vec2 {
        const len: number = vec.mag(a);
        return {
            x: a.x/len,
            y: a.y/len,
        };
    };
    func.limit = function(a: vec2, lim: number): vec2 {
        let multi: number;
        const len: number = vec.mag(a);
        multi = len <= lim ? 1 : lim/len;
        
        a.x *= multi;
        a.y *= multi;
        return a;
    };
    func.angleBetween = function(a: vec2, b: vec2): number {
        return Math.acos(vec.dot(a,b)/(vec.mag(a)*vec.mag(b)));
    }
    func.toAngle = function(a: vec2): number {
        return Math.atan2(a.y, a.x);
    };
    func.fromAngle = function(angle: number): vec2 {
        return vec(Math.cos(angle), Math.sin(angle));
    };
    func.copy = function(a: vec2): vec2 {
        return vec(a.x, a.y);
    };
    return func;
})();


const tau: number = Math.PI*2;

const camera = {
	pos: vec(0, 0),
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
function angleToPoint(x: number, y: number, x2: number, y2: number): number{
	return -Math.atan2(x-x2, y-y2)-1.5708;
}
function getPointOnOrbit(i: number, orbitRadiusX: number, orbitRadiusY: number, orbitRotation: number): vec2{
	return {x: (Math.cos(i)*orbitRadiusX)*Math.cos(orbitRotation)-(Math.sin(i)*orbitRadiusY)*Math.sin(orbitRotation), y: (Math.cos(i)*orbitRadiusX)*Math.sin(orbitRotation)+(Math.sin(i)*orbitRadiusY)*Math.cos(orbitRotation)};// This is just absurd
}
function screenToSpace(pos: vec2): vec2{
    return vec.sub(rotatePoint(vec.sub(pos, vec(width/2, height/2)), -camera.rotation), camera.pos);
}
function rotatePoint(pos: vec2, angle: number): vec2{
    return {x:pos.x*Math.cos(angle)-pos.y*Math.sin(angle), y: pos.x*Math.sin(angle)+pos.y*Math.cos(angle)};
}
function dist(a: number, b: number, c: number, d: number){
    return Math.abs(Math.sqrt((Math.max(a, c)-Math.min(a, c))**2+(Math.max(b, d)-Math.min(b, d))**2));
}

const mouse = {
	screen: vec(0, 0),
	space: vec(0, 0),
	pressed: false
};
gameCanvas.addEventListener("mousemove", (e)=>{
	mouse.screen = {x: e.clientX, y: e.clientY};
});
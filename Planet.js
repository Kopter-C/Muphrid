function getPointOnOrbit(i, orbitRadusX, orbitRadiusY, orbitRotation){
	return {x: (Math.cos(i)*orbitRadiusX)*Math.cos(orbitRotation)-(Math.sin(i)*orbitRadiusY)*Math.sin(orbitRotation), y: (cos(i)*orbitRadiusX)*sin(orbitRotation)+(sin(i)*orbitRadiusY)*cos(orbitRotation)];// This is just absurd
}
class Planet {
	constructor(radius, orbitRadiusX, orbitRadiusY, orbitRotation, orbitStart, orbitSpeed) {
		this.orbitRadiusX = orbitRadiusX;
		this.orbitRadiusY = orbitRadiusY;
		this.orbitRotation = orbitRotation;
		this.orbitStart = orbitStart;
		this.orbitSpeed = orbitSpeed;
		this.pos = getPointOnOrbit(orbitStart);
	}
	display() {
		ctx.fillStyle = "white";
		ctx.beginShape();
		ctx.ellipse(this.pos.x, this.pos.y, this.radius, this.radius, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
}

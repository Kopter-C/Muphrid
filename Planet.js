function getPointOnOrbit(i, orbitRadiusX, orbitRadiusY, orbitRotation){
	return {x: (Math.cos(i)*orbitRadiusX)*Math.cos(orbitRotation)-(Math.sin(i)*orbitRadiusY)*Math.sin(orbitRotation), y: (Math.cos(i)*orbitRadiusX)*Math.sin(orbitRotation)+(Math.sin(i)*orbitRadiusY)*Math.cos(orbitRotation)};// This is just absurd
}
class Planet {
	constructor(radius, orbitRadiusX, orbitRadiusY, orbitRotation, orbitStart, orbitSpeed, orbitTarget) {
		this.orbitRadiusX = orbitRadiusX;
		this.orbitRadiusY = orbitRadiusY;
		this.orbitRotation = orbitRotation;
		this.orbitStart = orbitStart;
		this.orbitSpeed = orbitSpeed;
		this.radius = radius;
		this.pointOnOrbit = orbitStart;
		this.orbitTarget = orbitTarget;
		this.pos = getPointOnOrbit(orbitStart, orbitRadiusX, orbitRadiusY, orbitRotation);
	}
	display() {
		ctx.fillStyle = "white";
		ctx.beginPath();
		ctx.ellipse(this.pos.x, this.pos.y, this.radius, this.radius, 0, 0, 2 * Math.PI);
		ctx.fill();
	}
	run() {
		this.pointOnOrbit += this.orbitSpeed;
		this.pos = vec.add(getPointOnOrbit(this.pointOnOrbit, this.orbitRadiusX, this.orbitRadiusY, this.orbitRotation), this.orbitTarget.pos?this.orbitTarget.pos:this.orbitTarget);
	}
}

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

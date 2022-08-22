
type vec2 = {
    x: number,
    y: number
}
type body = {
    pos: vec2
}
type building = "mine" | "store" | "launcher" | "refinery";
type materialAmount = [string, number];
type orbit = {
    radius: number,
    rotationSpeed: number,
    orbitRadiusX: number,
    orbitRadiusY: number,
    orbitRotation: number,
    orbitStart: number, 
    orbitSpeed: number, 
    orbitTarget: body, 
};

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

Object.prototype[Symbol.iterator] = function() {
    // This allows me to use the spread operator with objects which is very useful for vectors
    
    /*
    What are iterators?
    
    Iterators are what tells the interpreter how to iterate over an object. Iterators are used in 'for...of' loops and with the spread syntax (...)
    
    Here's how to use them:
    https://www.youtube.com/watch?v=2oU-DfdWM0c
    
    */
    
    const values = Object.values(this); // Gets all of the values in the object
    let index = -1;
    
    return { // This is just the needed syntax to get iterators to work
        next() {
            return {
                value: values[++index], // Increase the index and get the new current value
                done: index === values.length, // If index is equal to the number of object, it's done
            };
        }
    };
};


class Planet {
    private readonly name: string;
    private readonly orbit: orbit;
    private readonly radius: number;
    private orbitPos: number;
    private pos: vec2;
    public slots: string[];
    public storage: number;
    public amounts: object;
    private rotation: number;
	constructor(name: string, radius: number, orbitData: orbit, atmo: number, type: string, materials: materialAmount[]) {
		this.name = name;
        this.orbit = orbitData;
        this.radius = radius;
        this.orbitPos = this.orbit.orbitStart;
		this.pos = getPointOnOrbit(this.orbit, this.orbitPos);
		this.slots = Array(Math.floor(tau*(radius-atmo)/(slotSize+30))).fill("");
		this.storage = 20;
		this.amounts = {};
		this.rotation = 0;
	}
	onFocus(){//Run when focus changes
	    document.getElementById("planet-name").innerHTML = this.name;
	    document.getElementById("planet-type").innerHTML = `Type: ${this.type}`;
	}
	canBuy(thing: building) {
        let canBuy = false;
        for(let i in buildingMaterials[thing]){
            if(!this.amounts[i]) return false;
            if(this.amounts[i] < buildingMaterials[thing][i])return false;
	    }//Loop over all the requrements, and if one is missing, return false.
	    return true;
	}
	addThing(thing){
	    if(!this.canBuy(thing)) return;
	    let empty = [];
	    for(let i in buildingMaterials[thing]){
            this.amounts[i] -= buildingMaterials[thing][i];
	    }//Use materials
	    for(let i = 0 ; i < this.slots.length ; i ++){
	        if(this.slots[i] === ""){
	            empty.push(i);
	        }
	    }//Find all empty slots
	    this.slots[Math.floor(empty[Math.floor(Math.random()*empty.length)])] = thing;//Build in random empty slot
	}
	removeThing(thing){
	    let things = [];
	    for(let i in this.slots){
	        if(this.slots[i] === thing){
	            things.push(i);
	        }
	    }//Find all of thing
	    if(things.length){
	        this.slots[Math.floor(things[Math.floor(Math.random()*things.length)])] = "";//Remove a random one
	    }
	}
	display() {
		ctx.strokeStyle = "rgb(201, 193, 193)";
		ctx.lineWidth = 2 + (1-camera.scale)*8;
		ctx.beginPath();
		ctx.setLineDash([10, 5]);
		ctx.ellipse(this.orbitTarget.pos.x, this.orbitTarget.pos.y, this.orbitRadiusX, this.orbitRadiusY, this.orbitRotation, 0, 2 * Math.PI);
		ctx.stroke();
	    let previousTransform = ctx.getTransform();//Used in place of pushMatrix
	    ctx.translate(this.pos.x, this.pos.y);
	    ctx.rotate(this.rotation);
	    if (this.img) {
	        ctx.drawImage(this.img, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
	    } else {
            ctx.fillStyle = "grey";
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius, this.radius, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = "white";
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius-this.atmo, this.radius-this.atmo, 0, 0, 2 * Math.PI);
            ctx.fill();
	    }
		
		ctx.setLineDash([]);
		ctx.lineWidth = this.radius / 25;
        ctx.shadowBlur = '10';
		for(let i in this.slots){
		    ctx.rotate(tau/this.slots.length);
		    if(this.slots[i] === "mine"){
		        ctx.shadowColor = ctx.strokeStyle = ctx.fillStyle = 'rgb(214, 81, 81)';
		        ctx.beginPath();
		        ctx.moveTo(0.24 * this.radius, -0.02 * this.radius);
		        ctx.lineTo(0.6 * this.radius, -0.1 * this.radius);
		        ctx.lineTo(0.5 * this.radius, 0.1 * this.radius);
		        ctx.lineTo(0.25 * this.radius, 0.02 * this.radius);
		        ctx.lineTo(0.25 * this.radius, -0.02 * this.radius);
		        ctx.stroke();
		        ctx.fill();
		        ctx.closePath();
		    }
		    else if(this.slots[i] === "store"){
    		    ctx.shadowColor = ctx.strokeStyle = ctx.fillStyle = 'rgb(108, 201, 217)';
		        ctx.beginPath();
		        ctx.arc(0.24 * this.radius, 0, 0.04 * this.radius, 0, tau);
		        ctx.arc(0.5 * this.radius, 0, 0.06 * this.radius, 0, tau);
		        ctx.stroke();
		        ctx.fill();
		        ctx.closePath();
		    }
		    else if(this.slots[i] === "refinery"){
		        ctx.shadowColor = ctx.strokeStyle = ctx.fillStyle = 'rgb(242, 190, 87)';
		        ctx.beginPath();
		        ctx.moveTo(0.24 * this.radius, 0 * this.radius);
		        ctx.lineTo(0.3 * this.radius, -0.05 * this.radius);
		        ctx.lineTo(0.44 * this.radius, -0.05 * this.radius);
		        ctx.lineTo(0.5 * this.radius, 0 * this.radius);
		        ctx.lineTo(0.44 * this.radius, 0.05 * this.radius);
		        ctx.lineTo(0.3 * this.radius, 0.05 * this.radius);
		        ctx.lineTo(0.24 * this.radius, 0 * this.radius);
		        ctx.stroke();
		        ctx.fill();
		        ctx.closePath();
		    }
		    else if(this.slots[i] === "launcher"){
		        ctx.shadowColor = ctx.strokeStyle = 'rgb(96, 168, 117)';
		        ctx.beginPath();
		        ctx.moveTo(0.24 * this.radius, 0 * this.radius);
		        ctx.lineTo(0.5 * this.radius, 0 * this.radius);
		        ctx.lineTo(0.5 * this.radius, -0.1 * this.radius);
		        ctx.lineTo(0.5 * this.radius, 0.1 * this.radius);
		      //  ctx.lineTo(0.44 * this.radius, 0.05 * this.radius);
		      //  ctx.lineTo(0.3 * this.radius, 0.05 * this.radius);
		      //  ctx.lineTo(0.24 * this.radius, 0 * this.radius);
		        ctx.stroke();
		        ctx.closePath();
		    }
		    else{
		        ctx.fillStyle = 'transparent';
		    }
	        ctx.shadowColor = 'transparent';
		    
		    
		}
		ctx.setTransform(previousTransform);// popMatrix()
	    ctx.setTransform(1, 0, 0, 1, 0, 0);// resetMatrix() (previousTransform still exists)
	    
	    let pos = {x: this.pos.x, y: this.pos.y}; //copy
	    pos = vec.add(vec.mult(rotatePoint(vec.add(pos, camera.pos), camera.rotation), camera.scale), {x: width/2, y: height/2});
	    if(pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height-50){
	        
    	    ctx.font = "30px Google Sans";
    	    pos.x = Math.max(Math.min(pos.x, width-ctx.measureText(this.name).width - 12), 5);
    	    pos.y = Math.max(Math.min(pos.y, height-100), 30);
	        if(dist(mouse.screen, pos) < this.radius/5){
	             camera.target = this;
	        }
    	    ctx.fillStyle = 'rgb(173, 173, 173, 0.5)';
    	    ctx.fillRect(pos.x, pos.y - 30, ctx.measureText(this.name).width + 6, 35);
    	    ctx.fillStyle = 'rgb(214, 81, 81)';
    		ctx.fillText(this.name, pos.x + 3, pos.y - 3);
	    }
	    
		ctx.setTransform(previousTransform);// popMatrix()
	}
	updateUI () {
	    if(keys['b']){
    	    if(keys['m']){
    	        this.addThing('mine');
    	        keys['m'] = false;
    	    }
    	    if(keys['s']){
    	        this.addThing('store');
    	        keys['s'] = false;
    	    }
    	    if(keys['l']){
    	        this.addThing('launcher');
    	        keys['l'] = false;
    	    }
    	    if(keys['r']){
    	        this.addThing('refinery');
    	        keys['r'] = false;
    	    }
	    }
	    let data = `<h6 style = "font-size: 20px;">Materials:</h6>`;
        for(let i in this.amounts){
            if(this.materials.filter(mat => mat[0] === i).length){
                var pm = this.materials.filter(mat => mat[0] === i)[0][1];
                var gm = miningRates[i];
            }// Get amount per second.. but it's not quite per second
            data += `<h6 style = "font-size: 15px">${i}: ${Math.round(this.amounts[i])} ${this.materials.filter(mat => mat[0] === i).length?`(${Math.floor((pm*gm)*1000)/100*this.slots.filter(s => s === "mine").length})`:''}</h6>`;
        }
        data += `<h6 style = "font-size: 15px;">Storage: ${Math.round(this.storage)}</h6>`;
        document.getElementById("extra-data-div").innerHTML = data;
    }
    run() {
        this.pos = vec.add(getPointOnOrbit(this), this.orbitTarget.pos?this.orbitTarget.pos:this.orbitTarget);
        
        this.pointOnOrbit += this.orbitSpeed;
        
        const dirToStar = vec.sub(this.pos, star.pos);
        this.rotation = Math.atan2(dirToStar.y, dirToStar.x);
        
        if (this.canPower) this.runStructures?.();
        
        if(dist(mouse.space, this.pos)<this.radius){
	        camera.target = this;
	        this.onFocus();
	    }
	}
	runStructures() {
        this.storage = 50;
        for(let building of this.slots){
            if(building === "store"){
                this.storage += 100;
            }
        }
        for(let amount in this.amounts){
            this.storage -= this.amounts[amount];
        }
        
        if(keys['l']){
            let launcher = -1;
            for(let i in this.slots){
                if(this.slots[i] === "launcher"){
                    if(launcher == -1){
                        launcher = i;
                    }
                    if(dist(vec.add(this.pos, {x:Math.cos(this.rotation+(Number(launcher)+3.55)*(tau/this.slots.length))*100, y:this.pos.y+Math.sin(this.rotation+(Number(launcher)+3.55)*(tau/this.slots.length))*100}), mouse.space) > dist(vec.add(this.pos, {x:Math.cos(this.rotation+(Number(i)+3.55)*(tau/this.slots.length))*100, y:this.pos.y+Math.sin(this.rotation+(Number(i)+3.55)*(tau/this.slots.length))*100}), mouse.space)){
                        launcher = i;
                    }
                }
            }//Find closest launcher to mouse
            if(launcher != -1){
                let ang = angleToPoint(this.pos, mouse.space);
                let tt = {pos: vec.add(this.pos, {
x: Math.cos(this.rotation+(Number(launcher)+3.55)*(tau/this.slots.length))*100,
y: Math.sin(this.rotation+(Number(launcher)+3.55)*(tau/this.slots.length))*100
                }), dr: {x: Math.cos(ang)*8, y: Math.sin(ang)*8}};
                
                
                tracerLoop:// later we can use this to break out of this loop
                for(let i = 0 ; i < 100 ; i ++){
                    ctx.fillStyle = 'white';
                    ctx.fillRect(tt.pos.x, tt.pos.y, 10, 10);
                    tt.dr = vec.add(tt.dr, getGravityAtPoint(tt.pos, getPlanetsAtTime(frame+i)));
                    tt.pos = vec.add(tt.pos, tt.dr);
                    
                    for(let planet of planets){
                        if(dist(planet.pos, tt.pos)<planet.radius){
                            break tracerLoop;// this seems to be the only way to break out of a nested loop
                        }
                    }
                }
            }
        }
        for(let i in this.slots){
            let t = this.materials[Math.floor(Math.random()*this.materials.length)][0];
            if(this.slots[i] === 'mine'){
                if(this.amounts[t] === undefined) this.amounts[t] = 0;
                if(this.storage > 0) this.amounts[t] += miningRates[t];
            }
            if(this.slots[i] === 'refinery'){
                let tries = 50;
                let thingToRefine;
                do{
                    thingToRefine = Object.keys(this.amounts)[Math.floor(Math.random()*Object.keys(this.amounts).length)];
                    tries --;
                }//find a random thing on the planet that can be refined
                while(tries > 0 &&( !rawToFinished[thingToRefine] || this.amounts[t] <= 0));
                if(tries > 0){
                    this.amounts[thingToRefine] -= conversionRates[rawToFinished[thingToRefine]];
                    if(!this.amounts[rawToFinished[thingToRefine]]){
                        this.amounts[rawToFinished[thingToRefine]] = 0;
                    }
                    this.amounts[rawToFinished[thingToRefine]] += conversionRates[rawToFinished[thingToRefine]];//Increase the finished version of t based on the conversion rates
                }//refine it
            }
        }
	}
	getMaterial(wanted) {
        for (let i = this.materials.length; i --;) {
            if (this.materials[i][0] === wanted) return i;
        }
        return -1;
	}
}
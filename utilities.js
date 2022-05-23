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

if (typeof Map === 'function') {
    module.exports = Map;
}
else {
    module.exports = Similar;
}

function Similar() {
    this.list = [];
    this.lastHas = null;
    this.size = 0;
    
    return this;
}

Similar.prototype.get = function(key) {
    var len = this.list.length,
        i;
    
    if (this.lastGet && this.lastGet.key === key) {
        return this.lastGet.val;
    }
    
    for (i = 0; i < len; i++) {
        if (this.list[i].key === key) {
            this.lastGet = this.list[i];
            return this.list[i];
        }
    }
    
    return null;
};

Similar.prototype.set = function(key, val) {
    this.list.push({ key: key, val: val });
    this.size++;
    return this;
};

Similar.prototype.delete = function(key) {
    var len = this.list.length,
        i;    
    for (i = 0; i < len; i++) {
        if (this.list[i].key === key) {
            break;
        }
    }
    
    if (this.list.splice(i, 1).length) {
        this.size--;
    }
    
    return this;
};

Similar.prototype.has = Similar.prototype.get;  
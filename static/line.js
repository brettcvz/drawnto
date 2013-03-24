var lines = {};
var Line = function(button1, button2) {
    //standardize
    if (button1.cmp(button2) > 0) {
        var tmp = button1; button1 = button2; button2 = tmp;
    }
    if (!Line.isValid(button1, button2)) {
        return null;
    }
    this.b1 = button1;
    this.b2 = button2;
    this.active = false;

    //direction
    this.down = this.b1.y < this.b2.y;
    this.right = this.b1.x < this.b2.x;
    this.left = this.b1.x > this.b2.x;
    this.diagonal = this.down && (this.right || this.left);

    lines[[button1.x,button1.y,button2.x,button2.y].join(",")] = this;
    return this;
};

Line.get = function(b1, b2) {
    //standardize
    if (b1.cmp(b2) > 0) {
        var tmp = b1; b1 = b2; b2 = tmp;
    }
    return lines[[b1.x,b1.y,b2.x,b2.y].join(",")];
};

Line.isValid = function(b1, b2) {
    return Math.abs(b1.x - b2.x) <= 1 && Math.abs(b1.y - b2.y) <= 1;
};

Line.prototype._render = function(){
    this._dom = $("<hr/>").addClass("line");
    this._dom.toggleClass("right", this.right);
    this._dom.toggleClass("left", this.left);
    this._dom.toggleClass("down", this.down);

    //calculate position
    var x = ui.gridSize * this.b1.x;
    var y = ui.gridSize * this.b1.y;

    var length;
    if (this.right) {
        if (this.down) {
            // '\'
            x += ui.gridSize * 0.29;
            y += ui.gridSize;
            length = ui.gridSize * 1.414;
        } else {
            // '-'
            x += ui.gridSize / 2;
            y += ui.gridSize / 2;
            length = ui.gridSize;
        }
    } else if (this.down) {
        if (this.left) {
            // '/'
            x += -ui.gridSize * 0.71;
            y += ui.gridSize;
            length = ui.gridSize * 1.414;
        } else {
            // '|'
            x += 0;
            y += ui.gridSize;
            length = ui.gridSize;
        }
    }
    this._dom.css("left", x);
    this._dom.css("top", y);
    this._dom.css("width", length);
    this._dom.css("border-width", ui.lineWidth);
};

Line.prototype.draw = function(){
    if (!this._dom) {
        this._render();
    }
    this._dom.toggleClass("active", this.active);

    return this._dom;
};

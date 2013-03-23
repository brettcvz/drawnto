var globals = {};
/*Button*/
var buttons = {};
var Button = function(x, y) {
    this.x = x;
    this.y = y;
    this.active = false;

    if (!buttons[x]) { buttons[x] = {};}
    buttons[x][y] = this;
};

Button.get = function(x, y) {
    return buttons[x] ? buttons[x][y] : undefined;
};

Button.prototype._render = function(){
    this._dom = $("<div></div>").addClass("button");
    var nub = $("<div></div>").addClass("nub");
    this._dom.append(nub);

    //calculate position
    var width = 100;
    var height = 100;
    var offsetX = 10;
    var offsetY = 10;
    this._dom.css("left", offsetX + width * this.x);
    this._dom.css("top", offsetY + height * this.y);

    this.setupListeners();
};

Button.prototype.setupListeners = function() {
    var curr = this;
    this._dom.on('mousedown', function(){
        globals.drawing = true;
        globals.last = curr;
        curr.activate();
        return false;
    });
    this._dom.on('mouseenter', function(){
        if (globals.drawing) {
            if (globals.last) {
                var line = Line.get(curr, globals.last);
                if (line) {
                    line.active = true;
                    line.draw();
                } else {
                    console.log("No line between", curr, globals.last);
                }
            }
            globals.last = curr;
            curr.activate();
        }
        return false;
    });
};

Button.prototype.activate = function() {
    this.active = true;
    this.draw();
};

Button.prototype.draw = function(){
    if (!this._dom) {
        this._render();
    }
    this._dom.toggleClass("active", this.active);

    return this._dom;
};

Button.prototype.cmp = function(button2){
    return (this.y * 3 + this.x) - (button2.y * 3 + button2.x);
};

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
    var width = 100;
    var height = 100;
    var x = width * this.b1.x;
    var y = width * this.b1.y;

    if (this.right) {
        if (this.down) {
            // '\'
            x += 25;
            y += 90;
        } else {
            // '-'
            x += 40;
            y += 40;
        }
    } else if (this.down) {
        if (this.left) {
            // '/'
            x += -72;
            y += 90;
        } else {
            // '|'
            x += 0;
            y += 80;
        }
    }
    this._dom.css("left", x);
    this._dom.css("top", y);
};

Line.prototype.draw = function(){
    if (!this._dom) {
        this._render();
    }
    this._dom.toggleClass("active", this.active);

    return this._dom;
};

$(function(){
    var pattern = $(".pattern-container");
    var buttons = [];
    for (var i = 0; i < 9; i++) {
        var x = i % 3;
        var y = ~~(i / 3);
        var button = new Button(x,y);
        pattern.append(button.draw());
        //adding lines
        for (var j = 0; j < buttons.length; j++) {
            var b1 = buttons[j];
            console.log(b1, button, Line.isValid(b1, button), Line.get(b1, button));
            if (Line.isValid(b1, button) && !Line.get(b1, button)){
                var line = new Line(b1, button);
                pattern.append(line.draw());
            }
        }
        buttons.push(button);
    }
    var drawing = false;
    pattern.on('mousedown', function(){
        globals.drawing = true;
        return false;
    });
    $(window).on('mouseup', function(){
        globals.drawing = false;
    });
});

function setup(button) {
};

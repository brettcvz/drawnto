var globals = {};
var ui = {
    rows: 3,
    cols: 3,
    gridSize: 200,
    buttonSize: 80,
    nubRadius: 20,
    lineWidth: 4
};

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
    this._dom.width(ui.buttonSize).height(ui.buttonSize);
    var nub = $("<div></div>").addClass("nub");
    nub.width(ui.nubRadius * 2).height(ui.nubRadius * 2);
    nub.css('border-radius', ui.nubRadius);
    margin = ui.buttonSize / 2 - ui.nubRadius;
    nub.css('margin', margin);
    this._dom.append(nub);

    //calculate position
    var offset = (ui.gridSize - ui.buttonSize) / 2;
    this._dom.css("left", offset + ui.gridSize * this.x);
    this._dom.css("top", offset + ui.gridSize * this.y);

    this.setupListeners();
};

Button.prototype.setupListeners = function() {
    var curr = this;
    this._dom.on('touchstart', function(){
        globals.drawing = true;
        globals.last = curr;
        curr.activate();
        return false;
    });
    this._dom.on('touchmove', function(){
        if (globals.drawing) {
            if (globals.last) {
                var line = Line.get(curr, globals.last);
                if (line) {
                    line.active = true;
                    line.draw();
                    globals.last = curr;
                    curr.activate();
                } else {
                    //up
                    globals.drawing = false;
                }
            }
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
    return (this.y * ui.rows + this.x) - (button2.y * ui.rows + button2.x);
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

$(function(){
    var width = $(window).width();
    console.log(width);
    ui.gridSize = width / 4;
    ui.buttonSize = ui.gridSize * 0.8;
    ui.nubRadius = ui.buttonSize * 0.25;
    ui.lineWidth = ui.nubRadius * 0.15;
    var pattern = $(".pattern-container");
    pattern.css("margin-left", width/8);
    var buttons = [];
    for (var x = 0; x < ui.cols; x++) {
        for (var y = 0; y < ui.rows; y++) {
            var button = new Button(x,y);
            pattern.append(button.draw());
            //adding lines
            for (var j = 0; j < buttons.length; j++) {
                var b1 = buttons[j];
                if (Line.isValid(b1, button) && !Line.get(b1, button)){
                    var line = new Line(b1, button);
                    pattern.append(line.draw());
                }
            }
            buttons.push(button);
        }
    }

    var drawing = false;
    pattern.on('mousedown touchstart', function(){
        globals.drawing = true;
        return false;
    });
    $(window).on('mouseup touchend', function(){
        globals.drawing = false;
    });
});

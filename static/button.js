/*Button*/
var buttons = {};
var Button = function(x, y) {
    this.x = x;
    this.y = y;
    this.active = false;
    this.text = '';

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
    nub.css('margin', margin + "px");
    nub.css('font-size', ui.nubRadius + "px");
    nub.css('line-height', (ui.nubRadius * 1.9) + "px");
    this._nub = nub;
    this._dom.append(nub);

    //calculate position
    var offset = (ui.gridSize - ui.buttonSize) / 2;
    this._dom.css("left", offset + ui.gridSize * this.x);
    this._dom.css("top", offset + ui.gridSize * this.y);
};

Button.prototype.setupListeners = function() {
    var curr = this;
    this._dom.on('mousedown touchstart', function(){
        globals.drawing = true;
        curr.activate();
        return false;
    });
    this._dom.on('mouseenter', function(){
        if (globals.drawing) {
            curr.activate();
        }
        return false;
    });
};

Button.prototype.activate = function() {
    this.active = true;
    var last = globals.stack.length ? globals.stack[globals.stack.length - 1] : undefined;
    if (last && last != this) {
        var line = Line.get(this, last);
        if (line) {
            line.active = true;
            line.draw();
            globals.stack.push(this);
            this.text = globals.stack.length;
        } else {
            //up
            this.active = false;
            finish();
        }
    } else if (last != this) {
        globals.stack.push(this);
        this.text = globals.stack.length;
    }
    this.draw();
};

Button.prototype.deactivate = function() {
    this.active = false;
    this.text = '';
    this.draw();
};

Button.prototype.draw = function(){
    if (!this._dom) {
        this._render();
    }
    this._dom.toggleClass("active", this.active);
    this._nub.text(this.text);

    return this._dom;
};

Button.prototype.cmp = function(button2){
    return (this.y * ui.rows + this.x) - (button2.y * ui.rows + button2.x);
};

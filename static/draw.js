var globals = {
    drawing: false,
    stack: []
};
var ui = {
    rows: 3,
    cols: 3,
    gridSize: 200,
    buttonSize: 80,
    nubRadius: 20,
    lineWidth: 4,
    offsetX: 100,
    offsetY: 100
};

$(function(){
    var width = $(window).width();
    ui.gridSize = width / 4;
    ui.buttonSize = ui.gridSize * 0.6;
    ui.nubRadius = ui.buttonSize * 0.4;
    ui.lineWidth = ui.nubRadius * 0.15;
    var pattern = $(".pattern-container");
    ui.offsetX = width/8;
    ui.offsetY = 100;
    pattern.css("margin-left", ui.offsetX);
    var buttons = [];
    for (var x = 0; x < ui.cols; x++) {
        for (var y = 0; y < ui.rows; y++) {
            var button = new Button(x,y);
            pattern.append(button.draw());
            button.setupListeners();
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

    pattern.on('mousedown touchstart', function(){
        globals.drawing = true;
        return false;
    });
    pattern.on('touchmove', function(e){
        if (!globals.drawing) {return;}

        var touch = e.originalEvent.touches[0];
        var x = touch.clientX;
        var y = touch.clientY;
        //calculate position
        x -= ui.offsetX;
        y -= ui.offsetY;
        var col = Math.min(~~(x / ui.gridSize), ui.cols - 1);
        var row = Math.min(~~(y / ui.gridSize), ui.rows - 1);
        var xhit = Math.abs((col + 0.5) * ui.gridSize - x) < ui.buttonSize / 2;
        var yhit = Math.abs((row + 0.5) * ui.gridSize - y) < ui.buttonSize / 2;
        console.log(col, row, xhit, yhit);
        if (xhit && yhit) {
            var button = Button.get(col, row).activate();
        }
    });

    $(window).on('mouseup touchend', function(){
        finish();
    });
});

var finish = function(){
    var code = globals.stack.map(function(button){
        return button.y * ui.rows + button.x;
    });
    if (code.length) {
        var sequence = code.join(",");
        console.log(code.join(","));
        $.ajax({
            url: "/lookup",
            data: {sequence: sequence},
            dataType: 'json',
            success: function(data){
                if (!data.url) {
                    alert('Sequence not found');
                } else {
                    var go = confirm("Go to "+data.name+" ("+data.url+")?");
                    if (go) {
                        window.location.href = data.url;
                    }
                }
                reset();
            },
            error: function(jqXHR){
                if (jqXHR.status == 404) {
                    alert('Sequence not found');
                } else {
                    alert('Error in lookup up sequence, please try again');
                }
                reset();
            }
        });
    }
};
var reset = function(){
    globals.stack = [];
    globals.drawing = false;
    for (var x in buttons) {
        for (var y in buttons[x]) {
            buttons[x][y].deactivate();
        }
    }
    for (var key in lines) {
        lines[key].active = false;
        lines[key].draw();
    }
};

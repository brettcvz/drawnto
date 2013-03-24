var ui = {
    rows: 3,
    cols: 3,
    gridSize: 100,
    buttonSize: 80,
    nubRadius: 20,
    lineWidth: 4,
    offsetX: 100,
    offsetY: 100
};
var globals = {
    stack: []
};

$(function(){
    var pattern = $(".pattern-container");
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

    var seq = sequence.split(",");
    console.log(seq);
    for (var i = 0; i < seq.length; i++) {
        var index = parseInt(seq[i], 10);
        y = index % ui.cols;
        x = ~~(index / ui.rows);
        Button.get(x,y).activate();
    }
});

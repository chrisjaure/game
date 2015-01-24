var PIXI = require('pixi.js');
var Scene = require('../engine/scene');

function winScene (game) {
    var scene = new Scene(game);
    var text = new PIXI.Text('You Win!!!!!', {
        fill: 'white'
    });
    scene.stage.addChild(text);
    scene.on('update', function update() {
        if (scene.active && game.keyboard.space) {
            scene.active = false;
        }
    })
    .on('active', function() {
        scene.stage.visible = true;
    })
    .on('inactive', function () {
        scene.stage.visible = false;
    });
    scene.active = false;
    scene.stage.visible = false;
    return scene;
}

module.exports = winScene;

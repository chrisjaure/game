var PIXI = require('pixi.js');
var kb = require('kb-controls');
var Scene = require('../engine/scene');

function startScene (game) {
    var scene = new Scene(game);
    var text = new PIXI.Text('Press space to start', {
        fill: 'white'
    });
    scene.stage.addChild(text);
    scene.keyboard = kb({
        '<space>': 'space'
    });
    scene.on('update', function update() {
        if (scene.active && scene.keyboard.space) {
            scene.active = false;
        }
    })
    .on('inactive', function () {
        scene.stage.visible = false;
    });
    scene.active = true;
    return scene;
}

module.exports = startScene;

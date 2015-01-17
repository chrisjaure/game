var PIXI = require('pixi.js');
var kb = require('kb-controls');
var Scene = require('../engine/scene');

function startScene (game) {
    var scene = new Scene(game);
    scene.on('create', function(){
        var text = new PIXI.Text('Press space to start', {
            fill: 'white'
        });
        this.stage.addChild(text);
        this.keyboard = kb({
            '<space>': 'space'
        });
    }, scene)
    .on('update', function update() {
        if (this.active && this.keyboard.space) {
            this.active = false;
        }
    }, scene)
    .on('inactive', function () {
        this.stage.visible = false;
    }, scene);
    scene.active = true;
    return scene;
}

module.exports = startScene;

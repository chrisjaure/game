var PIXI = require('pixi.js');
var kb = require('kb-controls');
var Scene = require('../engine/scene');

var startScene = new Scene('start')
    .on('create', function(){
        var text = new PIXI.Text('Press space to start', {
            fill: 'white'
        });
        this.stage.addChild(text);
        this.keyboard = kb({
            '<space>': 'space'
        });
    }, startScene)
    .on('update', function update() {
        if (this.active && this.keyboard.space) {
            this.active = false;
        }
    }, startScene)
    .on('inactive', function () {
        this.stage.visible = false;
    }, startScene);
startScene.active = true;

module.exports = startScene;

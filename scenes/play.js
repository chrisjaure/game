var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');

var playScene = new Scene('play');
var player = new Player();
playScene.addEntity(player);
playScene.active = false;
playScene.on('create', function () {
    this.stage.visible = false;
}, playScene);
playScene.on('active', function () {
    this.stage.visible = true;
}, playScene);

module.exports = playScene;

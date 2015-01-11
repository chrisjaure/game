var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');

var playScene = new Scene('play');
var player = new Player();
var laser = new Laser();

playScene.addEntity(player);
playScene.addEntity(laser);
playScene.active = false;
playScene.on('create', function () {
    this.stage.visible = false;
}, playScene);
playScene.on('active', function () {
    this.stage.visible = true;
}, playScene);
player.on('shoot', function () {
    if (player.direction) {
        let bounds = player.entity.getBounds();
        bounds.x = bounds.x + 32;
        bounds.y = bounds.y + 32;
        laser.shoot(bounds, player.direction);
    }
});

module.exports = playScene;

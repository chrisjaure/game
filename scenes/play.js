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
        laser.shoot({ x: player.entity.x, y: player.entity.y }, player.direction);
    }
});

window.laser = laser;

module.exports = playScene;

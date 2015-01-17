var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');

function playScene (game) {
	var scene = new Scene(game);
	var player = new Player(scene, game);
	var laser = new Laser(scene, game);

	scene.active = false;
	scene.on('create', function () {
	    this.stage.visible = false;
	}, scene);
	scene.on('active', function () {
	    this.stage.visible = true;
	}, scene);
	player.on('shoot', function () {
	    if (player.direction) {
	        let bounds = player.entity.getBounds();
	        bounds.x = bounds.x + 32;
	        bounds.y = bounds.y + 32;
	        laser.shoot(bounds, player.direction);
	    }
	});

	return scene;
}

module.exports = playScene;

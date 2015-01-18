var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');
var Rock = require('../entities/rock');

function playScene (game) {
	var scene = new Scene(game);
	var player = new Player(scene, game, {
		x: game.renderer.width / 2,
		y: game.renderer.height / 2
	});
	var laser = new Laser(scene, game);
	var rocks = [];
	rocks.push(new Rock(scene, game));

	scene.active = false;
	scene.stage.visible = false;
	scene.on('active', function () {
		scene.stage.visible = true;
		setInterval(function(){
			let rock = new Rock(scene, game);
			rock.create();
			rock.addToScene();
		}, 1000);
	});
	game.on('load', function() {
		player.addToScene();
	});
	player.on('shoot', function () {
		laser.shoot(player.getGunPosition(), player.direction);
	});

	return scene;
}

module.exports = playScene;

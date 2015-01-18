var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');
var Rock = require('../entities/rock');

function playScene (game) {
	var scene = new Scene(game);
	Player.preload(game);
	Laser.preload(game);
	game.on('load', function() {
		var player = new Player(game, {
			x: game.renderer.width / 2,
			y: game.renderer.height / 2
		});
		var rocks = [];

		scene.active = false;
		scene.stage.visible = false;
		scene.on('active', function () {
			scene.stage.visible = true;
			setInterval(function(){
				let rock = new Rock(game);
				rock.addToScene(scene);
			}, 1000);
		});
		player.addToScene(scene);
		player.on('shoot', function () {
			let laser = new Laser(game, player.getGunPosition());
			laser.addToScene(scene);
		});
	});

	return scene;
}

module.exports = playScene;

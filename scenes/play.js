var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');
var Rock = require('../entities/rock');
var utils = require('../engine/utils');


function playScene (game) {
	var scene = new Scene(game);
	Player.preload(game);
	Laser.preload(game);
	game.on('load', function() {
		var player = new Player(game, {
			x: game.renderer.width / 6,
			y: game.renderer.height / 2
		});
		var rocks = [];
		var lasers = [];

		scene.active = false;
		scene.stage.visible = false;
		scene.on('active', function () {
			scene.stage.visible = true;
			scene.stage.alpha = 1;
			player.reset();
			rocks.forEach(rock => rock.removeFromScene());
			rocks = [];
		});
		scene.on('update', function(time){
			if (time % 52 === 0) {
				let rock = new Rock(game);
				rock.addToScene(scene);
				rocks.push(rock);
			}
			rocks = rocks.filter(rock => !rock.removed);
			lasers = lasers.filter(laser => !laser.removed);
			utils.collide(player, rocks, function(player, rock) {
				rock.removeFromScene();
				scene.stage.alpha -= 0.05;
				player.shineGet();
				if (scene.stage.alpha < 0) {
					scene.emit('win');
				}
			});
		});
		player.addToScene(scene);
		player.on('shoot', function () {
			let laser = new Laser(game, player.getGunPosition());
			laser.addToScene(scene);
			lasers.push(laser);
		});
	});

	return scene;
}

module.exports = playScene;
var PIXI = require('pixi.js');
var Howl = require('howler').Howl;
var TWEEN = require('tween.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Laser = require('../entities/laser');
var Rock = require('../entities/rock');
var Dust = require('../entities/dust');
var utils = require('../engine/utils');

function playScene (game) {
	var scene = new Scene(game);
	var bgMusic = new Howl({ urls: ['assets/gurdonark_-_Relief.mp3'], volume: 0.5 });
	var stageTween;
	Player.preload(game);
	Laser.preload(game);
	game.on('load', function() {
		var player = new Player(game, {
			x: game.renderer.width / 6,
			y: game.renderer.height / 2
		});
		var rocks = [];
		var dust = [];
		var lasers = [];

		scene.active = false;
		scene.stage.visible = false;
		scene.on('active', function () {
			scene.stage.visible = true;
			scene.stage.alpha = 1;
			player.reset();
			rocks.forEach(rock => rock.removeFromScene());
			rocks = [];
			dust.forEach(d => d.removeFromScene());
			dust = [];
			bgMusic.play();
			stageTween = new TWEEN.Tween(scene.stage);
		});
		scene.on('inactive', function() {
			// bgMusic.stop();
		});
		scene.on('update', function(time){
			if (Math.round(time) % 104 === 0) {
				let rock = new Rock(game);
				rock.addToScene(scene);
				rocks.push(rock);
			}
			if (Math.round(time) % 52 === 0) {
				let d = new Dust(game);
				d.addToScene(scene);
				dust.push(d);
			}
			rocks = rocks.filter(rock => !rock.removed);
			dust = dust.filter(d => !d.removed);
			lasers = lasers.filter(laser => !laser.removed);
			utils.collide(player, dust, function(player, d) {
				d.removeFromScene();
				stageTween.to({ alpha: '-0.03' }, 200).start();
				player.shineGet();
			});
			utils.collide(player, rocks, function(player, rock) {
				rock.removeFromScene();
				player.hit();
				if (scene.stage.alpha < 0.97) {
					stageTween.to({ alpha: '+0.03' }, 200).start();
				}
			});
			if (scene.stage.alpha < 0) {
				scene.emit('win');
			}
		});
		scene.on('render', function(time) {
			if (stageTween) {
				stageTween.update(time);
			}
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
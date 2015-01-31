var PIXI = require('pixi.js');
var Howl = require('howler').Howl;
var TWEEN = require('tween.js');
var Scene = require('../engine/scene');
var Player = require('../entities/player');
var Rock = require('../entities/rock');
var Dust = require('../entities/dust');
var utils = require('../engine/utils');
var curry = require('curry');

function playScene (game) {
	var scene = new Scene(game);
	var bgMusic = new Howl({ urls: ['assets/gurdonark_-_Relief.mp3'], volume: 0.5 });
	var stageTween;
	var rocks = [];
	var dust = [];
	var player;
	var flash = new PIXI.Graphics();

	var playerRockCollide = function(time, player, rock) {
		rock.removeFromScene();
		player.hit();
		if (scene.stage.alpha < 0.97) {
			stageTween.to({ alpha: '+0.03' }, 200).start();
		}
		flash.visible = true;
		flash.lastVisible = time;
	};

	var playerDustCollide = function(time, player, dust) {
		dust.removeFromScene();
		stageTween.to({ alpha: '-0.03' }, 200).start();
		player.shineGet();
	};

	flash.beginFill(0xffffff);
	flash.drawRect(0, 0, game.renderer.width, game.renderer.height);
	flash.endFill();
	flash.visible = false;
	scene.stage.addChild(flash);
	Player.preload(game);
	game.on('load', function() {
		scene.active = false;
		scene.stage.visible = false;
		player = new Player(game, {
			x: game.renderer.width / 6,
			y: game.renderer.height / 2
		});
		player.addToScene(scene);
	});
	scene.on('active', function () {
		scene.stage.visible = true;
		scene.stage.alpha = 1;
		player.reset();
		rocks.forEach(rock => rock.removeFromScene());
		rocks = [];
		dust.forEach(d => d.removeFromScene());
		dust = [];
		bgMusic.stop().play();
		stageTween = new TWEEN.Tween(scene.stage);
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
		dust = dust.filter(dust => !dust.removed);
		utils.collide(player, dust, curry(playerDustCollide)(time));
		utils.collide(player, rocks, curry(playerRockCollide)(time));
		if (scene.stage.alpha < 0) {
			scene.emit('win');
		}
		if (time - flash.lastVisible > 10) {
			flash.visible = false;
		}
	});
	scene.on('render', function(time) {
		if (stageTween) {
			stageTween.update(time);
		}
	});

	return scene;
}

module.exports = playScene;
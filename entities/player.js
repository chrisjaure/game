var PIXI = require('pixi.js');
var utils = require('../engine/utils');
var Entity = require('../engine/entity');
var collide = require('box-collide');

class Player extends Entity {
	constructor () {
		this.assets = ['assets/ship.png'];
	}

	create (scene, game) {
		super.create(scene, game);

		var image = new PIXI.ImageLoader(this.assets[0]);
		image.loadFramedSpriteSheet(32, 32, 'ship');

		this.flyFrames = image.frames.slice(1, 5);
		this.stopFrames = image.frames.slice(5, 12);

		var container = this.container = new PIXI.DisplayObjectContainer();
		container.pivot = { x: 16, y: 16 };
		container.x = 150;
		container.y = 150;

		var entity = this.entity = new PIXI.MovieClip(image.frames.slice(0, 1));
		this.speed = 8;
		entity.scale = { x: 2, y: 2 };
		entity.animationSpeed = 0.3;
		entity.loop = false;
		entity.position = { x: -16, y: -16 };

		container.addChild(entity);

		scene.stage.addChild(container);
	}

	update () {
		var keyboard = this.game.keyboard;

		if (keyboard.left) {
			this.container.x -= this.speed;
			this.container.rotation = Math.PI * 0.5;
			this.animateDirection('left');
		}
		else if (keyboard.right) {
			this.container.x += this.speed;
			this.container.rotation = Math.PI * 1.5;
			this.animateDirection('right');
		}
		else if (keyboard.up) {
			this.container.y -= this.speed;
			this.container.rotation = Math.PI;
			this.animateDirection('up');
		}
		else if (keyboard.down) {
			this.container.y += this.speed;
			this.container.rotation = 0;
			this.animateDirection('down');
		}
		else {
			this.entity.stop();
			this.entity.textures = this.stopFrames;
			this.entity.play();
		}

		if (keyboard.space) {
			var time = Date.now();
			if (time - this.lastShoot > 500 || !this.lastShoot) {
				this.emit('shoot');
				this.lastShoot = time;
			}
		}

		if (utils.outOfWorldBounds(this.entity.getBounds(), this.game.renderer)) {
			this.resetPosition();
		}

		utils.showBoundingBox(this.entity);
	}
	animateDirection (dir) {
		this.direction = dir;
		if (!this.entity.playing) {
			this.entity.textures = this.flyFrames;
			if ( this.entity.currentFrame + 1 !== this.entity.totalFrames) {
				this.entity.gotoAndPlay(this.entity.currentFrame);
			}
			else {
				this.entity.gotoAndPlay(0);
			}
		}
	}
	resetPosition () {
		var bounds = this.entity.getBounds();
		if (bounds.x < 0) {
			this.container.x = bounds.width / 2;
		}
		if (bounds.y < 0) {
			this.container.y = bounds.height / 2;
		}
		if (bounds.x + bounds.width > this.game.renderer.width) {
			this.container.x = this.game.renderer.width - bounds.width / 2;
		}
		if (bounds.y + bounds.height > this.game.renderer.height) {
			this.container.y = this.game.renderer.height - bounds.height / 2;
		}
	}
}

module.exports = Player;

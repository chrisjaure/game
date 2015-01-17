var PIXI = require('pixi.js');
var utils = require('../engine/utils');
var Entity = require('../engine/entity');
var collide = require('box-collide');

class Player extends Entity {
	constructor (scene, game, options) {
		this.assets = ['assets/ship.png'];
		super(...arguments);
	}

	create () {
		var image = new PIXI.ImageLoader(this.assets[0]);
		image.loadFramedSpriteSheet(32, 32, 'ship');

		this.flyFrames = image.frames.slice(1, 5);
		this.stopFrames = image.frames.slice(5, 12);

		var container = this.container = new PIXI.DisplayObjectContainer();
		container.x = this.options.x || 0;
		container.y = this.options.y || 0;
		container.rotation = Math.PI * 1.5;

		var entity = this.entity = new PIXI.MovieClip(this.flyFrames);
		this.speed = 6;
		entity.scale = { x: 2, y: 2 };
		entity.animationSpeed = 0.3;
		entity.loop = true;
		entity.play();
		this.direction = 'right';

		container.addChild(entity);

		var bounds = entity.getBounds();
		container.pivot = { x: bounds.width, y: bounds.height };

		this.scene.stage.addChild(container);

		this.scene.on('render', () => {
			if (this.game.debug) {
				utils.showBoundingBox(this.container);
			}
		});
	}

	update () {
		var keyboard = this.game.keyboard;

		if (keyboard.left) {
			this.container.x -= this.speed;
			// this.container.rotation = Math.PI * 0.5;
			// this.animateDirection('left');
		}
		else if (keyboard.right) {
			this.container.x += this.speed;
			// this.container.rotation = Math.PI * 1.5;
			// this.animateDirection('right');
		}
		else if (keyboard.up) {
			this.container.y -= this.speed;
			// this.container.rotation = Math.PI;
			// this.animateDirection('up');
		}
		else if (keyboard.down) {
			this.container.y += this.speed;
			// this.container.rotation = 0;
			// this.animateDirection('down');
		}
		else {
			// this.entity.stop();
			// this.entity.textures = this.stopFrames;
			// this.entity.play();
		}

		if (keyboard.space) {
			var time = Date.now();
			if (time - this.lastShoot > 500 || !this.lastShoot) {
				this.emit('shoot');
				this.lastShoot = time;
			}
		}

		this.positionInWorld();
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
	positionInWorld () {
		var bounds = this.container.getBounds();
		if (this.container.x - this.container.pivot.x < 0) {
			this.container.x = bounds.width / 2;
		}
		if (this.container.y - this.container.pivot.y < 0) {
			this.container.y = bounds.height / 2;
		}
		if (this.container.x - this.container.pivot.x + bounds.width > this.game.renderer.width) {
			this.container.x = this.game.renderer.width - bounds.width / 2;
		}
		if (this.container.y - this.container.pivot.y + bounds.height > this.game.renderer.height) {
			this.container.y = this.game.renderer.height - bounds.height / 2;
		}
	}
	getGunPosition () {
		let bounds = this.entity.getBounds();
        bounds.x = bounds.x + bounds.width;
        bounds.y = bounds.y + bounds.width / 2 - 2;
        return bounds;
	}
}

module.exports = Player;

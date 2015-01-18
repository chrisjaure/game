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

		var entity = this.entity = new PIXI.DisplayObjectContainer();
		entity.x = this.options.x || 0;
		entity.y = this.options.y || 0;
		entity.rotation = Math.PI * 1.5;

		var sprite = this.sprite = new PIXI.MovieClip(this.flyFrames);
		this.speed = 6;
		sprite.scale = { x: 2, y: 2 };
		sprite.animationSpeed = 0.3;
		sprite.loop = true;
		sprite.play();
		this.direction = 'right';

		entity.addChild(sprite);

		var bounds = sprite.getBounds();
		entity.pivot = { x: bounds.width, y: bounds.height };

		this.scene.on('render', () => {
			if (this.game.debug) {
				utils.showBoundingBox(this.entity);
			}
		});
	}

	update () {
		var keyboard = this.game.keyboard;

		if (keyboard.left) {
			this.entity.x -= this.speed / 4;
		}
		if (keyboard.right) {
			this.entity.x += this.speed / 4;
		}
		if (keyboard.up) {
			this.entity.y -= this.speed;
		}
		if (keyboard.down) {
			this.entity.y += this.speed;
		}

		if (keyboard.space) {
			var time = Date.now();
			if (time - this.lastShoot > 500 || !this.lastShoot) {
				this.emit('shoot');
				this.lastShoot = time;
			}
		}

		this.positionInBounds();
	}
	positionInBounds () {
		var bounds = this.entity.getBounds();
		if (this.entity.x - this.entity.pivot.x < 0) {
			this.entity.x = bounds.width / 2;
		}
		if (this.entity.y - this.entity.pivot.y < 0) {
			this.entity.y = bounds.height / 2;
		}
		if (this.entity.x - this.entity.pivot.x + bounds.width > this.game.renderer.width) {
			this.entity.x = this.game.renderer.width - bounds.width / 2;
		}
		if (this.entity.y - this.entity.pivot.y + bounds.height > this.game.renderer.height) {
			this.entity.y = this.game.renderer.height - bounds.height / 2;
		}
	}
	getGunPosition () {
		let bounds = this.sprite.getBounds();
        bounds.x = bounds.x + bounds.width;
        bounds.y = bounds.y + bounds.width / 2 - 2;
        return bounds;
	}
}

module.exports = Player;

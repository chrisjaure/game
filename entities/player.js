var PIXI = require('pixi.js');
var utils = require('../engine/utils');
var Entity = require('../engine/entity');
var collide = require('box-collide');

class Player extends Entity {
	static preload (game) {
        game.on('preload', assets => assets.push('assets/ship.png'));
    }
	constructor () {
		super(...arguments);
		this.assets = ['assets/ship.png'];

		var image = new PIXI.ImageLoader(this.assets[0]);
		image.loadFramedSpriteSheet(32, 32, 'ship');

		this.flyFrames = image.frames.slice(1, 5);
		this.stopFrames = image.frames.slice(5, 12);

		var entity = this.entity = new PIXI.DisplayObjectContainer();
		entity.x = this.options.x || 0;
		entity.y = this.options.y || 0;
		entity.scale = { x: 2, y: 2 };

		var sprite = this.sprite = new PIXI.MovieClip(this.flyFrames);
		this.speed = 6;
		sprite.animationSpeed = 0.1;
		sprite.loop = true;
		sprite.play();
		sprite.rotation = Math.PI * 1.5;
		sprite.position.y = sprite.height;

		entity.addChild(sprite);

		var bounds = sprite.getBounds();
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
		if (this.entity.x < 0) {
			this.entity.x = 0;
		}
		if (this.entity.y < 0) {
			this.entity.y = 0;
		}
		if (this.entity.x + this.entity.width > this.game.renderer.width) {
			this.entity.x = this.game.renderer.width - this.entity.width;
		}
		if (this.entity.y + this.entity.height > this.game.renderer.height) {
			this.entity.y = this.game.renderer.height - this.entity.height;
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

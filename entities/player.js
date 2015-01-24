var PIXI = require('pixi.js');
var utils = require('../engine/utils');
var Entity = require('../engine/entity');
var collide = require('box-collide');
var Howl = require('howler').Howl;

class Player extends Entity {
	static preload (game) {
        game.on('preload', assets => assets.push('assets/ship.png'));
    }
	constructor () {
		super(...arguments);
		this.assets = ['assets/ship.png'];
		this.speed = 6;

		var image = new PIXI.ImageLoader(this.assets[0]);
		image.loadFramedSpriteSheet(32, 32, 'ship');

		this.flyFrames = image.frames.slice(1, 5);
		this.stopFrames = image.frames.slice(5, 12);

		var entity = this.entity = new PIXI.DisplayObjectContainer();
		entity.x = this.options.x || 0;
		entity.y = this.options.y || 0;
		entity.scale = { x: 2, y: 2 };

		var sprite = this.sprite = new PIXI.MovieClip(this.flyFrames);
		sprite.animationSpeed = 2 / 60;
		sprite.loop = true;
		sprite.play();
		sprite.rotation = Math.PI * 1.5;
		sprite.position.y = sprite.height;

		entity.addChild(sprite);

		this.shineGetSound = new Howl({ urls: ['assets/shineget.wav'], volume: 0.6 });
	}
	reset () {
		this.speed = 6;
		this.entity.x = this.options.x || 0;
		this.entity.y = this.options.y || 0;
	}
	shineGet () {
		this.speed -= 0.1;
		this.shineGetSound.play();
	}
	update () {
		var keyboard = this.game.keyboard;

		if (keyboard.left) {
			// this.entity.x -= this.speed / 4;
		}
		if (keyboard.right) {
			// this.entity.x += this.speed / 4;
		}
		if (keyboard.up) {
			this.entity.y -= this.speed;
		}
		if (keyboard.down) {
			this.entity.y += this.speed;
		}

		// if (keyboard.space) {
		// 	var time = Date.now();
		// 	if (time - this.lastShoot > 500 || !this.lastShoot) {
		// 		this.emit('shoot');
		// 		this.lastShoot = time;
		// 	}
		// }

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
        return {
        	x: this.entity.x + this.entity.width,
        	y: this.entity.y + this.entity.height / 2 - 2,
        	width: this.entity.width,
        	height: this.entity.height
        };
	}
}

module.exports = Player;

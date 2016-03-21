var PIXI = require('pixi.js');
var TWEEN = require('tween.js');
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
		this.boundingType = 'circle';

		var frames = utils.getFramesFromSpriteSheet(PIXI.utils.TextureCache[this.assets[0]].baseTexture, 32, 32)

		this.flyFrames = frames.slice(1, 5);
		this.stopFrames = frames.slice(5, 12);

		var entity = this.entity = new PIXI.Container();
		entity.x = this.options.x || 0;
		entity.y = this.options.y || 0;
		entity.scale = { x: 2, y: 2 };

		var sprite = this.sprite = new PIXI.extras.MovieClip(this.flyFrames);
		sprite.animationSpeed = 1 / 5;
		sprite.loop = true;
		sprite.play();
		sprite.rotation = Math.PI * 1.5;
		sprite.position.y = sprite.height;

		entity.addChild(sprite);

		this.shineGetSound = new Howl({ urls: ['assets/shineget.wav'], volume: 0.6 });
		this.hitSound = new Howl({ urls: ['assets/hit.wav'] });

		entity.tween = new TWEEN.Tween(entity);
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
	hit () {
		this.speed += 0.2;
		if (this.speed > 6) {
			this.speed = 6;
		}
		this.hitSound.play();
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
			this.shouldTween = false;
			this.entity.y -= this.speed;
			this.tweenTo = 'up';
		}
		if (keyboard.down) {
			this.shouldTween = false;
			this.entity.y += this.speed;
			this.tweenTo = 'down';
		}

		if (this.tweenTo && !keyboard.up && !keyboard.down) {
			let tweenTo = 0;
			this.shouldTween = true;
			if (this.tweenTo === 'up') {
				tweenTo = Math.max(0, this.entity.y - this.speed * 2);
			}
			else {
				tweenTo = Math.min(this.game.worldBounds.height - this.entity.height, this.entity.y + this.speed * 2);
			}
			this.entity.tween
				.to({ y: tweenTo }, 150)
				.easing(TWEEN.Easing.Quadratic.Out)
				.start();
			this.tweenTo = null;
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
	render (time) {
		super.render(...arguments);
		if (this.shouldTween) {
			this.shouldTween = this.entity.tween.update(time);
		}
	}
	positionInBounds () {
		var worldBounds = this.game.worldBounds;
		if (this.entity.x < 0) {
			this.entity.x = 0;
		}
		if (this.entity.y < 0) {
			this.entity.y = 0;
		}
		if (this.entity.x + this.entity.width > worldBounds.width) {
			this.entity.x = worldBounds.width - this.entity.width;
		}
		if (this.entity.y + this.entity.height > worldBounds.height) {
			this.entity.y = worldBounds.height - this.entity.height;
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

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

		var entity = this.entity = new PIXI.MovieClip(image.frames.slice(0, 1));
		this.speed = 5;
		entity.scale = { x: 1.5, y: 1.5 };
		entity.animationSpeed = 0.3;
		entity.loop = false;
		entity.anchor = { x: 0.5, y: 0.5 };

		scene.stage.addChild(this.entity);
// 		utils.showBoundingBox(this.entity);
	}

	update () {
		var keyboard = this.game.keyboard;
		var origX = this.entity.x;
		var origY = this.entity.y;
		if (keyboard.left) {
			this.entity.x -= this.speed;
			this.entity.rotation = Math.PI * 0.5;
			this.animateDirection('left');
		}
		else if (keyboard.right) {
			this.entity.x += this.speed;
			this.entity.rotation = Math.PI * 1.5;
			this.animateDirection('right');
		}
		else if (keyboard.up) {
			this.entity.y -= this.speed;
			this.entity.rotation = Math.PI;
			this.animateDirection('up');
		}
		else if (keyboard.down) {
			this.entity.y += this.speed;
			this.entity.rotation = 0;
			this.animateDirection('down');
		}
		else {
			this.entity.stop();
			this.entity.textures = this.stopFrames;
			this.entity.play();
		}
		if (utils.outOfWorldBounds(this.entity, this.game.renderer)) {
			this.entity.x = origX;
			this.entity.y = origY;
		}
	}
	animateDirection (dir) {
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
}

module.exports = Player;

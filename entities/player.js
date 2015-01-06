var PIXI = require('pixi.js');
var utils = require('../utils');
var collide = require('box-collide');

var Player = function(game) {
	this.game = game;
	this.assets = ['assets/sprite1.json'];
};
Player.prototype = {
    create: function() {
    	this.walkRightFrames = utils.frameRange(88, 95, 'sprite');
        this.walkLeftFrames = utils.frameRange(71, 78, 'sprite');
        this.walkUpFrames = utils.frameRange(62, 69, 'sprite');
        this.walkDownFrames = utils.frameRange(80, 87, 'sprite');

		this.speed = 2;
		this.entity = new PIXI.MovieClip(this.walkLeftFrames);
		this.entity.animationSpeed = 0.1;
		this.entity.loop = false;

		this.game.stage.addChild(this.entity);
		utils.setBoundingBox(this.entity, {
			x: 15, y: this.entity.height - 8, width: 32, height: 8
		});
// 		utils.showBoundingBox(this.entity);
    },
    update: function() {
    	var keyboard = this.game.keyboard;
    	var origX = this.entity.x;
    	var origY = this.entity.y;
    	if (keyboard.left) {
    		this.entity.x -= this.speed;
    		this.animateDirection('left', this.walkLeftFrames);
    	}
    	else if (keyboard.right) {
    		this.entity.x += this.speed;
    		this.animateDirection('right', this.walkRightFrames);
    	}
    	else if (keyboard.up) {
    		this.entity.y -= this.speed;
    		this.animateDirection('up', this.walkUpFrames);
    	}
    	else if (keyboard.down) {
    		this.entity.y += this.speed;
    		this.animateDirection('down', this.walkDownFrames);
    	}
    	else {
    		this.entity.stop();
    	}
    	if (utils.outOfWorldBounds(this.entity, this.game.renderer)
    		|| (this.game.objects[1].entity.body && collide(utils.getBounds(this.entity), utils.getBounds(this.game.objects[1].entity)))) {
    		this.entity.x = origX;
    		this.entity.y = origY;
    	}
    },
    animateDirection: function(dir, frames) {
    	if (!this.entity.playing || dir !== this.direction) {
			this.entity.textures = frames;
			if (dir == this.direction && this.entity.currentFrame + 1 !== this.entity.totalFrames) {
				this.entity.gotoAndPlay(this.entity.currentFrame);
			}
			else {
				this.entity.gotoAndPlay(0);
			}
			this.direction = dir;
    	}
    }
};

module.exports = Player;
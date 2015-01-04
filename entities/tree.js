var PIXI = require('pixi.js');
var utils = require('../utils');

var Tree = function(game) {
	this.game = game;
	this.assets = ['assets/tree.png'];
};
Tree.prototype = {
	create: function() {
		this.entity = PIXI.Sprite.fromImage(this.assets[0]);
		this.entity.x = 100;
		this.entity.y = 100;
		this.game.stage.addChild(this.entity);
		utils.setBoundingBox(this.entity, { x: 35, y: 70, height: 6, width: 30 });
// 		utils.showBoundingBox(this.entity);
	},
	update: function() {
		
	}
};

module.exports = Tree;
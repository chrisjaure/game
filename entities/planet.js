var PIXI = require('pixi.js');
var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Planet extends Entity {
	constructor(scene, game, options) {
		super(...arguments);
	}
	create () {
		var entity = this.entity = new PIXI.Graphics();
		entity.beginFill(this.options.color || 0xff0000);
        entity.drawCircle(this.options.x || 0, this.options.y || 0, this.options.radius || 100);
        entity.endFill();
	}
}

module.exports = Planet;
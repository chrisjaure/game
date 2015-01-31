var Entity = require('../engine/entity');
var utils = require('../engine/utils');
var random = require('random-ext');

class Rock extends Entity {
	constructor (game) {
		super(...arguments);
		this.speed = 2;
		this.boundingType = 'circle';
		var radius = random.integer(40, 15);
		var entity = this.entity = new game.PIXI.Graphics();
		entity.beginFill(0x7f8b8f);
        entity.drawCircle(radius, radius, radius);
        entity.endFill();
        entity.x = game.renderer.width - entity.width;
        entity.y = random.integer(game.renderer.height - entity.height, entity.height);
	}
	update () {
		if (utils.outOfWorldBounds(this.entity, this.game.renderer)) {
			this.removeFromScene();
            return;
        }
		this.entity.x -= this.speed;
	}
}

module.exports = Rock;
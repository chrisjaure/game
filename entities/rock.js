var Entity = require('../engine/entity');
var utils = require('../engine/utils');
var random = require('random-ext');
var boxCollide = require('box-collide');

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
        entity.x = game.worldBounds.width;
        entity.y = random.integer(game.worldBounds.height - entity.height, entity.height);
	}
	update () {
		if (!boxCollide(this.entity, this.game.worldBounds)) {
			this.removeFromScene();
            return;
        }
		this.entity.x -= this.speed;
	}
}

module.exports = Rock;
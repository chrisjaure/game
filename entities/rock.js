var Entity = require('../engine/entity');
var utils = require('../engine/utils');
var random = require('random-ext');

class Rock extends Entity {
	constructor (game) {
		super(...arguments);
		this.speed = 2;
		var entity = this.entity = new game.PIXI.Graphics();
		entity.beginFill(0x7f8b8f);
        entity.drawCircle(5, 5, 5);
        entity.endFill();
        entity.x = game.renderer.width - 10;
        entity.y = random.integer(game.renderer.height - 5, 5);
	}
	update () {
		if (utils.outOfWorldBounds(this.entity, this.game.renderer)) {
			this.removeFromScene();
            return;
        }
		// this.entity.y += this.speed;
		this.entity.x -= this.speed;
	}
}

module.exports = Rock;
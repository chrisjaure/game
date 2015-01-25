var Entity = require('../engine/entity');
var utils = require('../engine/utils');
var random = require('random-ext');

class Rock extends Entity {
	constructor (game) {
		super(...arguments);
		this.speed = 3;
		var entity = this.entity = new game.PIXI.Graphics();
		entity.beginFill(0xfff756);
        entity.drawCircle(4, 4, 4);
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
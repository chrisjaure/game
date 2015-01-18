var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Rock extends Entity {
	constructor () {
		super(...arguments);
		this.speed = 2;
		var entity = this.entity = new this.game.PIXI.Graphics();
		entity.beginFill(0x7f8b8f);
        entity.drawCircle(20, 20, 20);
        entity.endFill();
	}
	update () {
		if (utils.outOfWorldBounds(this.entity, this.game.renderer)) {
			this.removeFromScene();
            return;
        }
		this.entity.y += this.speed;
		this.entity.x += this.speed;
	}
}

module.exports = Rock;
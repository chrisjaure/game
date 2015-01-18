var Entity = require('../engine/entity');

class Rock extends Entity {
	constructor () {
		this.speed = 2;
		super(...arguments);
	}
	create () {
		var entity = this.entity = new this.game.PIXI.Graphics();
		entity.beginFill(0x7f8b8f);
        entity.drawCircle(0, 0, 20);
        entity.endFill();
	}
	update () {
		this.entity.y += this.speed;
		this.entity.x += this.speed;
	}
}

module.exports = Rock;
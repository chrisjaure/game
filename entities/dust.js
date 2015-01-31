var Entity = require('../engine/entity');
var utils = require('../engine/utils');
var random = require('random-ext');
var boxCollide = require('box-collide');

class Dust extends Entity {
	constructor (game) {
		super(...arguments);
		this.speed = 3;
		this.boundingType = 'circle';
		var entity = this.entity = new game.PIXI.Graphics();
		entity.beginFill(0xfff756);
        entity.drawCircle(4, 4, 4);
        entity.endFill();
        entity.x = game.renderer.width;
        entity.y = random.integer(game.renderer.height - entity.height, entity.height);
	}
	update () {
		if (!boxCollide(this.entity, this.game.worldBounds)) {
			this.removeFromScene();
            return;
        }
		this.entity.x -= this.speed;
	}
}

module.exports = Dust;
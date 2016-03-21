var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Meter extends Entity {
	constructor (game) {
		super(...arguments);
		var entity = this.entity = new game.PIXI.Container();
		var outline = this.outline = new game.PIXI.Graphics();
		var bar = this.bar = new game.PIXI.Graphics();
		outline.lineStyle(1, 0x000000);
		outline.beginFill(0xffffff);
		outline.drawRect(0, 0, 100, 20);
		bar.position = { x: 1.5, y: 1.5 };
		entity.addChild(outline);
		entity.addChild(bar);
	}
	update () {}
	render () {}
	setPercent (percent) {
		this.bar.clear();
		this.bar.beginFill(0xe9a600)
		this.bar.drawRect(0, 0, 98 * percent, 18);
		this.bar.endFill();
	}
}

module.exports = Meter;

var PIXI = require('pixi.js');
var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Laser extends Entity {
    static preload (game) {
    }
    constructor (game, options) {
        super(...arguments);
        this.speed = 6;

        var entity = this.entity = new PIXI.DisplayObjectContainer();

        var box = new PIXI.Graphics();
        box.beginFill(0xff0000);
        box.drawRect(0, 0, 10, 4);
        box.endFill();
        entity.addChild(box);

        entity.x = this.options.x;
        entity.y = this.options.y + 1;

        entity.addChild(box);
    }
    update () {
        if (utils.outOfWorldBounds(this.entity, this.game.renderer)) {
            this.removeFromScene()
        }
        this.entity.x += this.speed;
    }
}

module.exports = Laser;

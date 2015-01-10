var PIXI = require('pixi.js');

class Scene {
    constructor(name) {
        this.name = name;
        this.entities = [];
        this.stage = new PIXI.DisplayObjectContainer();
    }
    create(game) {
        this.game = game;
        game.stage.addChild(this.stage);
        this.entities.forEach(entity => {
            if (entity.create) {
                entity.create(this);
            }
        });
    }
    update() {
        this.entities.forEach(entity => {
            if (entity.update) {
                entity.update(this);
            }
        });
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
}

module.exports = Scene;

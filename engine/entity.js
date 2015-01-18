var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');

class Entity extends EventEmitter {
    constructor (game, options) {
        this.game = game;
        this.options = options;
    }
    addToScene (scene) {
        scene.stage.addChild(this.entity);
        if (this.update) {
            this.boundUpdate = this.update.bind(this);
            scene.on('update', this.boundUpdate);
        }
        if (this.render) {
            scene.on('render', this.render.bind(this));
        }
        this.scene = scene;
    }
    removeFromScene () {
        this.scene.stage.removeChild(this.entity);
        if (this.update) {
            this.scene.removeListener('update', this.boundUpdate);
        }
        if (this.render) {
            this.scene.removeListener('render', this.render);
        }
        this.scene = null;
    }
}

module.exports = Entity;

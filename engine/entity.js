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
        if (this.entity.body) {
            this.entity.body.stage.removeChild(this.entity.body);
        }
        if (this.update) {
            this.scene.removeListener('update', this.boundUpdate);
        }
        if (this.render) {
            this.scene.removeListener('render', this.render);
        }
        this.scene = null;
        this.removed = true;
    }
    getBoundingBox () {
        let bounds = {
            // x. 
        }
        object.body.x = object.x;
        object.body.y = object.y;
        object.body.pivot = object.pivot;
        object.body.rotation = object.rotation;
    }
}

module.exports = Entity;

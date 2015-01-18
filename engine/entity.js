var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');

class Entity extends EventEmitter {
    constructor (scene, game, options) {
        this.scene = scene;
        this.game = game;
        this.options = options;
        if (this.assets) {
            game.on('preload', assets => {
                assets.push.apply(assets, this.assets);
            });
        }
        if (this.create) {
            game.on('load', this.create.bind(this));
        }
        if (this.update) {
            scene.on('update', this.update.bind(this));
        }
        if (this.render) {
            scene.on('render', this.render.bind(this));
        }
    }
    addToScene () {
        this.scene.stage.addChild(this.entity);
    }
}

module.exports = Entity;

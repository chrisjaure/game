var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');

class Entity extends EventEmitter {
    constructor (entity, boundingBox) {
        this.entity = entity;
        if (boundingBox) {
            this.setBoundingBox(boundingBox);
        }
    }
    create (scene, game) {
        this.scene = scene;
        this.game = game;
    }
    update () {}
    setBoundingBox (opts) {
        opts = opts || {};
        var box = new PIXI.Rectangle(
            opts.x || 0,
            opts.y || 0,
            opts.width || object.width,
            opts.height || object.height
        );
        this.body = box;
    }
}

module.exports = Entity;

var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');
var active = Symbol('active');

class Scene extends EventEmitter {
    constructor (name) {
        this.name = name;
        this.entities = [];
        this.stage = new PIXI.DisplayObjectContainer();
    }
    create (game) {
        this.game = game;
        game.stage.addChild(this.stage);
        this.entities.forEach(entity => {
            if (entity.create) {
                entity.create(this);
            }
        });
        this.emit('create');
    }
    update () {
        this.entities.forEach(entity => {
            if (entity.update) {
                entity.update(this);
            }
        });
        this.emit('update');
    }
    addEntity (entity) {
        this.entities.push(entity);
    }
    set active (value) {
        var event = (value) ? 'active' : 'inactive';
        this[active] = value;
        this.emit(event);
    }
    get active () {
        return this[active];
    }
}

module.exports = Scene;

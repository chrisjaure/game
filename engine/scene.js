var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');
var active = Symbol('active');

class Scene extends EventEmitter {
    constructor (game) {
        this.game = game;
        this.stage = new PIXI.DisplayObjectContainer();
        game.on('create', this.create.bind(this));
    }
    create () {
        this.game.stage.addChild(this.stage);
        this.game.on('update', () => {
            if (this[active]) {
                this.emit('update');
            }
        });
        this.game.on('render', () => {
            if (this[active]) {
                this.emit('render');
            }
        });
        this.emit('create');
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

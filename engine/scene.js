var PIXI = require('pixi.js');
var EventEmitter = require('eventemitter3');
var active = Symbol('active');

class Scene extends EventEmitter {
    constructor (game) {
        super();
        this.game = game;
        this.stage = new PIXI.Container();
        game.stage.addChild(this.stage);
        game.on('update', (time) => {
            if (this[active]) {
                this.emit('update', time);
            }
        });
        game.on('render', (time) => {
            if (this[active]) {
                this.emit('render', time);
            }
        });
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

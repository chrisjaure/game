import PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
const active = Symbol('active');

export default class Scene extends EventEmitter {
    constructor(game, options) {
        super();
        this.game = game;
        this.stage = new PIXI.Container();
        this.active = false;
        this.stage.visible = false;
        this.options = Object.assign({
            hideOnInactive: true,
            showOnActive: true
        }, options);
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
        this.on('active', () => {
            if (this.options.showOnActive) {
                this.stage.visible = true;
            }
        });
        this.on('inactive', () => {
            if (this.options.hideOnInactive) {
                this.stage.visible = false;
            }
        });
    }
    set active(value) {
        const event = (value) ? 'active' : 'inactive';
        this[active] = value;
        this.emit(event);
    }
    get active() {
        return this[active];
    }
}

import PIXI from 'pixi.js';
import EventEmitter from 'eventemitter3';
import { showBoundingBox } from './utils';

export default class Entity extends EventEmitter {
    constructor(game, options) {
        super();
        this.game = game;
        this.options = options;
    }
    addToScene(scene) {
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
    removeFromScene() {
        if (!this.scene) {
            return;
        }
        this.scene.stage.removeChild(this.entity);
        if (this.body) {
            this.scene.stage.removeChild(this.body);
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
    getBoundingBox() {
        if (this.boundingType === 'circle') {
            return {
                x: this.entity.x,
                y: this.entity.y,
                radius: this.entity.width / 2
            };
        }
        return {
            x: this.entity.x,
            y: this.entity.y,
            width: this.entity.width,
            height: this.entity.height
        };
    }
    render() {
        if (this.game.debug && this.scene) {
            showBoundingBox(this, this.scene.stage);
        }
    }
}

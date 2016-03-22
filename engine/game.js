import PIXI from 'pixi.js';
import kb from 'kb-controls';
import EventEmitter from 'eventemitter3';
import Stats from 'stats-js';
import raf from 'raf';

export default class Game extends EventEmitter {
    constructor(
        { width = 600, height = 400, background = 0xffffff, resolution = window.devicePixelRatio }) {
        super();
        this.PIXI = PIXI;
        this.width = width;
        this.height = height;
        PIXI.SCALE_MODES.DEFAULT = PIXI.SCALE_MODES.NEAREST;

        this.stage = new PIXI.Container(background);
        this.renderer = PIXI.autoDetectRenderer(width, height, {
            resolution
        });
        this.renderer.view.style.width = `${width}px`;
        this.renderer.view.style.height = `${height}px`;
        document.body.appendChild(this.renderer.view);

        this.keyboard = kb({
            '<left>': 'left',
            'A': 'left',
            '<right>': 'right',
            'D': 'right',
            '<up>': 'up',
            'W': 'up',
            '<down>': 'down',
            'S': 'down',
            '<space>': 'space'
        });
    }
    preload(cb) {
        const assets = [];
        this.emit('preload', assets);
        if (assets.length) {
            assets.forEach((asset) => PIXI.loader.add(asset, asset));
            PIXI.loader.on('complete', cb);
            PIXI.loader.load();
        }
        else {
            cb();
        }
    }
    boot(cb=() => {}) {
        this.preload(() => {
            this.emit('load');
            raf(function tick(time) {
                this.update(time);
                this.render(time);
                raf(tick.bind(this));
            }.bind(this));
            cb();
        });
        if (this.debug) {
            this.stats = new Stats();
            // Align top-left
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            document.body.appendChild(this.stats.domElement);
        }
    }
    update(time) {
        this.emit('update', time);
    }
    render(time) {
        if (this.debug) {
            this.stats.begin();
        }
        this.emit('render', time);
        this.renderer.render(this.stage);
        if (this.debug) {
            this.stats.end();
        }
    }
    get worldBounds() {
        return {
            x: 0,
            y: 0,
            width: this.renderer.width / this.renderer.resolution,
            height: this.renderer.height / this.renderer.resolution
        };
    }
}

var PIXI = require('pixi.js');
var kb = require('kb-controls');
var EventEmitter = require('eventemitter3');
var Stats = require('stats-js');
var utils = require('./utils');
var raf = require('raf');

class Game extends EventEmitter {
    constructor ({ width = 600, height = 400 }) {
        this.PIXI = PIXI;
        this.width = width;
        this.height = height;
        PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

        this.stage = new PIXI.Stage(0x1e1f33);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
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
    preload (cb) {
        var assets = [];
        var loader;
        this.emit('preload', assets);
        if (assets.length) {
            loader = new PIXI.AssetLoader(assets);
            loader.on('onComplete', cb);
            loader.load();
        }
        else {
            cb();
        }
    }
    boot (cb) {
        cb = cb || function(){};
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
            document.body.appendChild( this.stats.domElement );
        }
    }
    update (time) {
        this.emit('update', time);
    }
    render (time) {
        if (this.debug) {
            this.stats.begin();
        }
        this.emit('render', time);
        this.renderer.render(this.stage);
        if (this.debug) {
            this.stats.end();
        }
    }
    get worldBounds () {
        return {
            x: 0,
            y: 0,
            width: this.renderer.width,
            height: this.renderer.height
        };
    }
}

module.exports = Game;

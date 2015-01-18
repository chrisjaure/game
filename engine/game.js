var PIXI = require('pixi.js');
var kb = require('kb-controls');
var ticker = require('ticker');
var EventEmitter = require('eventemitter3');
var Stats = require('stats-js');
var utils = require('./utils');

class Game extends EventEmitter {
    constructor (width = 620, height = 400) {
        this.PIXI = PIXI;
        this.width = width;
        this.height = height;
        PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

        this.stage = new PIXI.Stage(0x1e1f33);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
        document.body.appendChild(this.renderer.view);

        this.keyboard = kb({
            '<left>': 'left',
            '<right>': 'right',
            '<up>': 'up',
            '<down>': 'down',
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
        this.preload(function(){
            this.emit('load');
            this.ticker = ticker(window, 60)
                .on('tick', this.update.bind(this))
                .on('draw', this.render.bind(this));
            cb();
        }.bind(this));
        if (this.debug) {
            this.stats = new Stats();
            // Align top-left
            this.stats.domElement.style.position = 'absolute';
            this.stats.domElement.style.left = '0px';
            this.stats.domElement.style.top = '0px';
            document.body.appendChild( this.stats.domElement );
        }
    }
    update () {
        this.emit('update', Date.now());
    }
    render () {
        if (this.debug) {
            this.stats.begin();
        }
        this.emit('render');
        this.renderer.render(this.stage);
        if (this.debug) {
            this.stats.end();
        }
    }
}

module.exports = Game;

var PIXI = require('pixi.js');
var kb = require('kb-controls');
var ticker = require('ticker');
var EventEmitter = require('eventemitter3');
var utils = require('./utils');

class Game extends EventEmitter {
    constructor (width = 620, height = 400) {
        this.scenes = new Map();
        this.width = width;
        this.height = height;
        PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;
    }
    create () {
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

        this.scenes.forEach(scene => scene.create(this));

        this.ticker = ticker(window, 60)
            .on('tick', this.update.bind(this))
            .on('draw', this.render.bind(this));

        this.emit('create');
    }
    preload (cb) {
        var assets = [];
        var loader;
        this.scenes.forEach(scene => {
            if (scene.entities) {
                scene.entities.forEach(entity => {
                    if (entity.assets) {
                        assets = assets.concat(entity.assets);
                    }
                });
            }
        });
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
            this.create();
            cb();
        }.bind(this));
    }
    update () {
        this.scenes.forEach(scene => {
            if (scene.active && scene.update) {
                scene.update(this);
            }
        });
        this.emit('update');
    }
    render () {
        this.renderer.render(this.stage);
        this.emit('render');
    }
    addScene (scene) {
        this.scenes.set(scene.name, scene);
    }
}

module.exports = Game;

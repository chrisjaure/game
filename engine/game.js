var PIXI = require('pixi.js');
var kb = require('kb-controls');
var ticker = require('ticker');
var utils = require('./utils');

var Game = function(width = 620, height = 400) {
    this.objects = [];
    this.scenes = new Map();
    this.width = width;
    this.height = height;
};
Game.prototype = {
    create: function() {
        this.stage = new PIXI.Stage(0x000000);
        this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
        document.body.appendChild(this.renderer.view);

        this.keyboard = kb({
            '<left>': 'left',
            '<right>': 'right',
            '<up>': 'up',
            '<down>': 'down'
        });

        this.scenes.forEach(scene => scene.create(this));

        this.ticker = ticker(window, 60)
            .on('tick', this.update.bind(this))
            .on('draw', this.render.bind(this));
    },
    preload: function(cb) {
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
    },
    boot: function(cb) {
        cb = cb || function(){};
        this.preload(function(){
            this.create();
            cb();
        }.bind(this));
    },
    update: function() {
        this.scenes.forEach(scene => {
            if (scene.active && scene.update) {
                scene.update(this);
            }
        });
        this.stage.children = utils.ySort(this.stage.children);
    },
    render: function() {
        this.renderer.render(this.stage);
    },
    addScene: function(scene) {
        this.scenes.set(scene.name, scene);
    }
};

module.exports = Game;

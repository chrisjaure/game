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

        this.objects.forEach(function(obj) {
            if (obj.create) {
                obj.create(this);
            }
        }.bind(this));

        this.ticker = ticker(window, 60).on('tick', function(){
            this.update();
        }.bind(this)).on('draw', function(){
            this.render();
        }.bind(this));
    },
    preload: function(cb) {
        var assets = [];
        var loader;
        this.objects.forEach(function(obj) {
            if (obj.assets) {
                assets = assets.concat(obj.assets);
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
        this.objects.forEach(function(obj) {
            if (obj.update) {
                obj.update(this);
            }
        }.bind(this));
        this.stage.children = utils.ySort(this.stage.children);
    },
    render: function() {
        this.renderer.render(this.stage);
    },
    add: function(obj) {
        this.objects.push(new obj(this));
    }
};

module.exports = Game;

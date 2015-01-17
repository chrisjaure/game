var PIXI = require('pixi.js');
var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Laser extends Entity {
    constructor () {
        this.assets = ['assets/laser.png'];
        this.speed = 6;
        this.lasers = [];
    }
    create (scene, game) {
        super.create(scene, game);

        var image = new PIXI.ImageLoader(this.assets[0]);
        image.loadFramedSpriteSheet(14, 7, 'laser');
        this.stopFrames = image.frames;
        scene.on('update', this.update.bind(this));
        scene.on('render', () => {
            if (game.debug) {
                this.lasers.forEach((laser) => {
                    utils.showBoundingBox(laser);
                });
            }
        });
    }
    shoot (start, direction) {
        var laser = new PIXI.DisplayObjectContainer();
        laser.direction = direction;
        var hitAnimation = new PIXI.MovieClip(this.stopFrames);
        hitAnimation.loop = false;
        hitAnimation.animationSpeed = 0.4;
        hitAnimation.visible = false;
        hitAnimation.scale = { x: 2, y: 2 };
        hitAnimation.x = -12;
        hitAnimation.y = -9;
        laser.addChild(hitAnimation);

        var box = new PIXI.Graphics();
        box.beginFill(0xff0000);
        box.drawRect(0, 0, 4, 10);
        box.endFill();
        laser.addChild(box);

        laser.x = start.x;
        laser.y = start.y;
        laser.pivot = { x: 2, y: 5 };

        switch (direction) {
            case 'left':
                laser.rotation = Math.PI * 0.5;
                break;
            case 'right':
                laser.rotation = Math.PI * 1.5;
                break;
            case 'up':
                laser.rotation = Math.PI * 2;
                break;
        }

        laser.addChild(box);

        this.scene.stage.addChild(laser);
        this.lasers.push(laser);
    }
    update () {
        this.lasers.filter(laser => {
            if (laser.done) {
                this.scene.stage.removeChild(laser);
                if (laser.body && laser.body.stage) {
                    laser.body.stage.removeChild(laser.body);
                }
                return false;
            }
            return true;
        }).forEach(laser => {
            var bounds = {
                x: laser.x - laser.pivot.x,
                y: laser.y - laser.pivot.y,
                width: laser.width,
                height: laser.height
            };
            if (utils.outOfWorldBounds(bounds, this.game.renderer)) {
                laser.children[0].visible = true;
                laser.children[0].play();
                laser.children[0].onComplete = function () {
                    laser.done = true;
                };
                laser.children[1].visible = false;
                return;
            }
            switch (laser.direction) {
                case 'up':
                    laser.y -= this.speed;
                    break;
                case 'down':
                    laser.y += this.speed;
                    break;
                case 'left':
                    laser.x -= this.speed;
                    break;
                case 'right':
                    laser.x += this.speed;
                    break;
            }
        });
    }
}

module.exports = Laser;

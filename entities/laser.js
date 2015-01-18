var PIXI = require('pixi.js');
var Entity = require('../engine/entity');
var utils = require('../engine/utils');

class Laser extends Entity {
    static preload (game) {
        game.on('preload', assets => assets.push('assets/laser.png'));
    }
    constructor (game, options) {
        super(...arguments);
        this.assets = ['assets/laser.png'];
        this.speed = 6;
        var image = new PIXI.ImageLoader(this.assets[0]);
        image.loadFramedSpriteSheet(14, 7, 'laser');
        this.stopFrames = image.frames;

        var laser = this.entity = new PIXI.DisplayObjectContainer();
        laser.direction = this.options.direction || 'right';
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

        laser.x = this.options.x;
        laser.y = this.options.y + 1;
        laser.pivot = { x: 2, y: 5 };

        switch (laser.direction) {
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
    }
    update () {
        var bounds = {
            x: this.entity.x - this.entity.pivot.x,
            y: this.entity.y - this.entity.pivot.y,
            width: this.entity.width,
            height: this.entity.height
        };
        if (this.remove) {
            this.removeFromScene();
            return;
        }
        if (this.removing) {
            return;
        }
        if (utils.outOfWorldBounds(bounds, this.game.renderer)) {
            this.entity.children[0].visible = true;
            this.entity.children[0].play();
            this.entity.children[0].onComplete = ( () => this.remove = true );
            this.entity.children[1].visible = false;
            this.removing = true;
            return;
        }
        switch (this.entity.direction) {
            case 'up':
                this.entity.y -= this.speed;
                break;
            case 'down':
                this.entity.y += this.speed;
                break;
            case 'left':
                this.entity.x -= this.speed;
                break;
            case 'right':
                this.entity.x += this.speed;
                break;
        }
    }
    render () {
        if (this.game.debug) {
            utils.showBoundingBox(this.entity);
        }
    }
}

module.exports = Laser;

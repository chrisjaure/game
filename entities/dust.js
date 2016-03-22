import Entity from '../engine/entity';
import random from 'random-ext';
import boxCollide from 'box-collide';

export default class Dust extends Entity {
    constructor(game, ...args) {
        super(game, ...args);
        this.speed = 3;
        this.boundingType = 'circle';
        const entity = this.entity = new game.PIXI.Graphics();
        entity.beginFill(0xfff756);
        entity.drawCircle(4, 4, 4);
        entity.endFill();
        entity.x = game.worldBounds.width;
        entity.y = random.integer(game.worldBounds.height - entity.height, entity.height);
    }
    update() {
        if (!boxCollide(this.entity, this.game.worldBounds)) {
            this.removeFromScene();
            return;
        }
        this.entity.x -= this.speed;
    }
}

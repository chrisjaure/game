import Entity from '../engine/entity';
import random from 'random-ext';
import boxCollide from 'box-collide';

export default class Rock extends Entity {
    constructor(game, ...args) {
        super(game, ...args);
        this.speed = 2;
        this.boundingType = 'circle';
        const radius = random.integer(40, 15);
        const entity = this.entity = new game.PIXI.Graphics();
        entity.beginFill(0x7f8b8f);
        entity.drawCircle(radius, radius, radius);
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

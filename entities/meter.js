import Entity from '../engine/entity';

export default class Meter extends Entity {
    constructor(game, ...args) {
        super(game, ...args);
        const entity = this.entity = new game.PIXI.Container();
        const outline = this.outline = new game.PIXI.Graphics();
        const bar = this.bar = new game.PIXI.Graphics();
        outline.lineStyle(1, 0x000000);
        outline.beginFill(0xffffff);
        outline.drawRect(0, 0, 100, 20);
        bar.position = { x: 1.5, y: 1.5 };
        entity.addChild(outline);
        entity.addChild(bar);
    }
    update() {}
    render() {}
    setPercent(percent) {
        this.bar.clear();
        this.bar.beginFill(0xe9a600)
        this.bar.drawRect(0, 0, 98 * percent, 18);
        this.bar.endFill();
    }
}

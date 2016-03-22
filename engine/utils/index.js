import PIXI from 'pixi.js';
import boxCollide from 'box-collide';

const circleCollide = (circle1, circle2) => {
    const dx = (circle1.x + circle1.radius) - (circle2.x + circle2.radius);
    const dy = (circle1.y + circle1.radius) - (circle2.y + circle2.radius);
    const distance = Math.sqrt(dx * dx + dy * dy);

    return (distance < circle1.radius + circle2.radius);
};

export function collide(collection1, collection2, cb) {
    if (!Array.isArray(collection1)) {
        collection1 = [collection1];
    }
    if (!Array.isArray(collection2)) {
        collection2 = [collection2];
    }
    collection1.forEach(item1 => {
        const item1Bounds = item1.getBoundingBox();
        collection2.forEach(item2 => {
            const item2Bounds = item2.getBoundingBox();
            if (item1Bounds.radius !== undefined && item2Bounds.radius !== undefined) {
                if (circleCollide(item1Bounds, item2Bounds)) {
                    cb(item1, item2);
                }
            }
            else if (boxCollide(item1.getBoundingBox(), item2.getBoundingBox())) {
                cb(item1, item2);
            }
        });
    });
};

export function frameRange(start, end, prefix) {
    const frames = [];
    for (let i = start; i <= end; i++) {
        frames.push(new PIXI.Texture.fromFrame((prefix || null) + i));
    }
    return frames;
};

export function showBoundingBox(object, stage) {
    if (!stage) {
        return;
    }
    const bounds = object.getBoundingBox();
    if (!object.body) {
        const box = new PIXI.Graphics();
        box.alpha = 0.3;
        stage.addChild(box);
        object.body = box;
    }
    object.body.clear();
    object.body.x = bounds.x;
    object.body.y = bounds.y;
    object.body.lineStyle(2, 0x00ff00, 1);
    if (bounds.radius !== undefined) {
        object.body.drawCircle(bounds.radius, bounds.radius, bounds.radius);
    }
    else {
        object.body.drawRect(0, 0, bounds.width, bounds.height);
    }
};

export function getFramesFromSpriteSheet(baseTexture, frameWidth, frameHeight) {
    const frames = [];
    for (let i = 0; i < baseTexture.width - frameWidth; i += frameWidth) {
        frames.push(
            new PIXI.Texture(baseTexture, new PIXI.Rectangle(i, 0, frameWidth, frameHeight))
        );
    }
    return frames;
}

import PIXI from 'pixi.js';
import TWEEN from 'tween.js';
import Scene from '../engine/scene';

export default function backgroundScene(game) {
    const scene = new Scene(game);
    const scrollSpeed = 0.5;
    const bgPath = 'assets/4954464378_990a3e54a1_b.jpg';
    let tile;

    scene.active = false;
    scene.stage.visible = false;
    game.on('preload', (assets) => {
        assets.push(bgPath);
    });
    game.on('load', () => {
        const sprite = PIXI.Sprite.fromImage(bgPath);
        sprite.scale = { x: 0.65, y: 0.65 };
        scene.stage.addChild(sprite);
        const texture = new PIXI.Graphics();
        texture.beginFill(0x440002);
        texture.drawCircle(0, 0, game.renderer.width);
        texture.endFill();
        tile = new PIXI.extras.TilingSprite(texture.generateTexture(), game.renderer.width, game.renderer.height);
        tile.position.y = tile.height / 2;
        scene.stage.addChild(tile);
        tile.tween = new TWEEN.Tween(tile.position);
    });
    scene.on('active', () => {
        scene.stage.visible = true;
    });
    scene.on('update', () => {
        tile.tilePosition.x -= scrollSpeed;
        if (game.keyboard.up) {
            tile.position.y += 0.2;
            scene.tweenTo = '+4';
        }
        if (game.keyboard.down && tile.position.y > tile.height / 2) {
            tile.position.y -= 0.2;
            scene.tweenTo = '-4';
        }
        else if (scene.tweenTo) {
            tile.tween
                .to({ y: scene.tweenTo }, 600)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();
            scene.tweenTo = null;
            scene.shouldTween = true;
        }
    });
    scene.on('render', (time) => {
        if (scene.shouldTween) {
            scene.shouldTween = tile.tween.update(time);
        }
    });
    return scene;
}

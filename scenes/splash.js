import PIXI from 'pixi.js';
import kb from 'kb-controls';
import Scene from '../engine/scene';

export default function splashScene(game) {
    const scene = new Scene(game);
    const bgPath = 'assets/splash.png';
    let prompt;
    let lastUpdate;
    game.on('preload', (assets) => {
        assets.push(bgPath);
    });
    game.on('load', () => {
        const sprite = PIXI.Sprite.fromImage(bgPath);
        sprite.scale = { x: 6, y: 6 };
        sprite.position.x = game.worldBounds.width / 2 - sprite.width / 2;
        scene.stage.addChild(sprite);

        prompt = new PIXI.Text('Press space to start.', { fill: 'white', font: '32px Arial' });
        prompt.height = prompt.height / game.renderer.resolution;
        prompt.width = prompt.width / game.renderer.resolution;
        scene.stage.addChild(prompt);
        prompt.position = {
            x: game.worldBounds.width / 2 - prompt.width / 2,
            y: sprite.height
        };
        prompt.visible = false;
    });
    scene.on('update', function update(time) {
        if (!lastUpdate) {
            lastUpdate = time;
        }
        if (time - lastUpdate > 1000) {
            prompt.visible = !prompt.visible;
            lastUpdate = time;
        }
        if (game.keyboard.space) {
            scene.active = false;
        }
    });
    scene.stage.visible = true;
    scene.active = true;
    return scene;
}

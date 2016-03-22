import PIXI from 'pixi.js';
import { Howl } from 'howler';
import TWEEN from 'tween.js';
import curry from 'curry';
import random from 'random-ext';
import Scene from '../engine/scene';
import Player from '../entities/player';
import Rock from '../entities/rock';
import Dust from '../entities/dust';
import Meter from '../entities/meter';
import { collide } from '../engine/utils';

export default function playScene(game) {
    const scene = new Scene(game);
    const bgMusic = new Howl({ urls: ['assets/gurdonark_-_Relief.mp3'], volume: 0.5 });
    const flash = new PIXI.Graphics();
    const maxCollected = 32;
    let stageTween;
    let rocks = [];
    let dust = [];
    let player;
    let stardustMeter;
    let collectedNum = 0;

    const playerRockCollide = (time, player, rock) => {
        rock.removeFromScene();
        player.hit();
        if (scene.stage.alpha < 0.94) {
            stageTween.to({ alpha: '+0.06' }, 200).start();
        }
        flash.visible = true;
        flash.lastVisible = time;
        collectedNum -= 2;
        if (collectedNum < 0) {
            collectedNum = 0;
        }
        stardustMeter.setPercent(collectedNum / maxCollected);
    };

    const playerDustCollide = (time, player, dust) => {
        dust.removeFromScene();
        stageTween.to({ alpha: '-0.03' }, 200).start();
        player.shineGet();
        collectedNum += 1;
        stardustMeter.setPercent(collectedNum / maxCollected);
    };

    flash.beginFill(0xffffff);
    flash.drawRect(0, 0, game.worldBounds.width, game.worldBounds.height);
    flash.endFill();
    flash.visible = false;
    scene.stage.addChild(flash);
    Player.preload(game);
    game.on('load', () => {
        scene.active = false;
        scene.stage.visible = false;
        player = new Player(game, {
            x: game.worldBounds.width / 6,
            y: game.worldBounds.height / 2
        });
        player.addToScene(scene);
        stardustMeter = new Meter(game);
        stardustMeter.addToScene(scene);
    });
    scene.on('active', () => {
        scene.stage.visible = true;
        scene.stage.alpha = 1;
        player.reset();
        rocks.forEach(rock => rock.removeFromScene());
        rocks = [];
        dust.forEach(d => d.removeFromScene());
        dust = [];
        bgMusic.stop().play();
        stageTween = new TWEEN.Tween(scene.stage);
        stardustMeter.setPercent(0);
        collectedNum = 0;
    });
    scene.on('update', (time) => {
        if (Math.round(time) % 104 === 0) {
            const rock = new Rock(game);
            rock.addToScene(scene);
            rocks.push(rock);
        }
        if (Math.round(time) % 52 === 0) {
            const d = new Dust(game);
            d.addToScene(scene);
            dust.push(d);
        }
        rocks = rocks.filter(rock => !rock.removed);
        dust = dust.filter(dust => !dust.removed);
        collide(player, dust, curry(playerDustCollide)(time));
        collide(player, rocks, curry(playerRockCollide)(time));
        if (collectedNum >= maxCollected) {
            scene.emit('win');
        }
        if (time - flash.lastVisible > 30) {
            flash.visible = false;
        }
        if (time - flash.lastVisible > 120) {
            scene.stage.position = { x: 0, y: 0};
        }
        else if (flash.lastVisible) {
            scene.stage.position = {
                x: random.integer(5,-5),
                y: random.integer(5,-5)
            };
        }
    });
    scene.on('render', (time) => {
        if (stageTween) {
            stageTween.update(time);
        }
    });

    return scene;
}

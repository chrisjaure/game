var PIXI = require('pixi.js');
var TWEEN = require('tween.js');
var Scene = require('../engine/scene');

function winScene (game) {
    var scene = new Scene(game);
    var text = new PIXI.Text(`Finally the two girls
laying their heavy heads down
drift peacefully off to sleep.`, {
        fill: 'white'
    });
    var bg = new PIXI.Graphics();

    bg.beginFill(0x1e1f33);
    bg.drawRect(game.worldBounds.x, game.worldBounds.y, game.worldBounds.width, game.worldBounds.height);
    bg.endFill();
    scene.stage.addChild(bg);

    text.position = { x: 10, y: 10 };
    scene.stage.addChild(text);

    scene.on('update', function update() {
        if (scene.active && game.keyboard.space) {
            scene.active = false;
        }
    })
    .on('active', function() {
        scene.stage.visible = true;
        text.alpha = 0;
        text.tween = null;
        bg.alpha = 0;
        bg.tween = new TWEEN.Tween(bg);
        bg.tween.to({ alpha: 1 }, 2000)
        .onComplete(function() {
            bg.tween = null;
            text.tween = new TWEEN.Tween(text).to({ alpha: 1 }, 1000).start();
        })
        .start();
    })
    .on('inactive', function () {
        scene.stage.visible = false;
    })
    .on('update', function(time) {
        if (bg.tween) {
            bg.tween.update(time);
        }
        if (text.tween) {
            text.tween.update(time);
        }
    });
    scene.active = false;
    scene.stage.visible = false;
    return scene;
}

module.exports = winScene;
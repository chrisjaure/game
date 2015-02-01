var PIXI = require('pixi.js');
var TWEEN = require('tween.js');
var Scene = require('../engine/scene');

function winScene (game) {
    var scene = new Scene(game);
    var text = new PIXI.Text(`And the two girls put their heavy heads down
and drift peacefully off to sleep.`, {
        fill: 'white'
    });
    var bg = new PIXI.Graphics();
    var bgTween;

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
        bg.alpha = 0;
        bgTween = new TWEEN.Tween(bg);
        bgTween.to({ alpha: 1 }, 5000).start();
    })
    .on('inactive', function () {
        scene.stage.visible = false;
    })
    .on('update', function(time) {
        if (bgTween) {
            bgTween.update(time);
        }
    });
    scene.active = false;
    scene.stage.visible = false;
    return scene;
}

module.exports = winScene;

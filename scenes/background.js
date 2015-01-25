var PIXI = require('pixi.js');
var TWEEN = require('tween.js');
var Scene = require('../engine/scene');

function backgroundScene (game) {
	var scene = new Scene(game);
	var scrollSpeed = 0.5;
	var bgPath = 'assets/4954464378_990a3e54a1_b.jpg';
	var tile;

	scene.active = false;
    scene.stage.visible = false;
    game.on('preload', function(assets) {
    	assets.push(bgPath);
    });
    game.on('load', function() {
    	var sprite = PIXI.Sprite.fromImage(bgPath);
    	sprite.scale = { x: 0.65, y: 0.65 };
    	scene.stage.addChild(sprite);
    	var texture = new PIXI.Graphics();
		texture.beginFill(0x440002);
        texture.drawCircle(0, 0, game.renderer.width);
        texture.endFill();
    	tile = new PIXI.TilingSprite(texture.generateTexture(), game.renderer.width, game.renderer.height);
    	tile.position.y = tile.height / 2;
    	scene.stage.addChild(tile);
    	tile.tween = new TWEEN.Tween(tile.position);
    });
	scene.on('active', function () {
	    scene.stage.visible = true;
	});
	scene.on('update', function() {
		tile.tilePosition.x -= scrollSpeed;
		if (game.keyboard.up) {
			tile.position.y += 0.2;
			this.tweenTo = '+4';
		}
		if (game.keyboard.down && tile.position.y > tile.height / 2) {
			tile.position.y -= 0.2;
			this.tweenTo = '-4';
		}
		else if (this.tweenTo) {
			tile.tween
				.to({ y: this.tweenTo }, 600)
				.easing(TWEEN.Easing.Quadratic.Out)
				.start();
			this.tweenTo = null;
			this.shouldTween = true;
		}
	});
	scene.on('render', function(time) {
		if (this.shouldTween) {
			this.shouldTween = tile.tween.update(time);
		}
	});
	return scene;
}

module.exports = backgroundScene;

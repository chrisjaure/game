var PIXI = require('pixi.js');
var Scene = require('../engine/scene');

function backgroundScene (game) {
	var scene = new Scene(game);
	var scrollSpeed = 0.8;
	var tile;

	scene.active = false;
    scene.stage.visible = false;
    game.on('preload', function(assets) {
    	assets.push('assets/spacebg.png');
    });
    game.on('load', function() {
    	var sprite = PIXI.Sprite.fromImage('assets/spacebg.png');
    	scene.stage.addChild(sprite);
    	var texture = new PIXI.Graphics();
		texture.beginFill(0x8f0a04);
        texture.drawCircle(0, 0, game.renderer.width);
        texture.endFill();
    	tile = new PIXI.TilingSprite(texture.generateTexture(), game.renderer.width, game.renderer.height);
    	tile.position.y = tile.height / 2;
    	scene.stage.addChild(tile);
    });
	scene.on('active', function () {
	    scene.stage.visible = true;
	});
	scene.on('update', function() {
		tile.tilePosition.x -= scrollSpeed;
		if (game.keyboard.right && !game.keyboard.left) {
			tile.tilePosition.x -= scrollSpeed * 3;
		}
		if (game.keyboard.up) {
			tile.position.y += 0.5;
		}
		if (game.keyboard.down && tile.position.y > tile.height / 2) {
			tile.position.y -= 0.5;
		}
	});
	return scene;
}

module.exports = backgroundScene;

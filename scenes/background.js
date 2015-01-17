var PIXI = require('pixi.js');
var Scene = require('../engine/scene');
var Planet = require('../entities/planet');

function backgroundScene (game) {
	var scene = new Scene(game);
	var planet = new Planet(scene, game, {
		x: game.renderer.width / 2,
		y: game.renderer.height / 2,
		color: 0x8f0a04,
		radius: game.renderer.height / 2
	});
	var scrollSpeed = 0.8;
	var tile;

	scene.active = false;
    scene.stage.visible = false;
    scene.on('create', function() {
    	var planetTexture = planet.entity.generateTexture();
    	tile = new PIXI.TilingSprite(planetTexture, game.renderer.width, game.renderer.height);
    	tile.position.y = tile.height / 2;
    	scene.stage.addChild(tile);
    });
	scene.on('active', function () {
	    scene.stage.visible = true;
	});
	scene.on('update', function() {
		tile.tilePosition.x -= scrollSpeed;
		if (game.keyboard.right) {
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

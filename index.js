var Game = require('./engine/game');
var Scene = require('./engine/scene');

// entities
var Player = require('./entities/player');
var Tree = require('./entities/tree');

var game = new Game();
var startScene = new Scene('startScene');
var player = new Player();
startScene.addEntity(player);
startScene.active = true;
game.addScene(startScene);
// game.add(Player);
// game.add(Tree);
game.boot();

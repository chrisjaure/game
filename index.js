var Game = require('./engine/game');

// entities
var Player = require('./entities/player');
var Tree = require('./entities/tree');

var game = new Game();
game.add(Player);
game.add(Tree);
game.boot();

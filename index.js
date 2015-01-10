var Game = require('./engine/game');
var Scene = require('./engine/scene');

// entities
var Player = require('./entities/player');
var Tree = require('./entities/tree');

// scenes
var start = require('./scenes/start');
var play = require('./scenes/play');

var game = new Game();
game.addScene(start);
game.addScene(play);

start.on('inactive', function () {
    play.active = true;
});

game.boot();

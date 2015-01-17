var Game = require('./engine/game');
var Scene = require('./engine/scene');

// new game
var game = new Game();

// scenes
var start = require('./scenes/start')(game);
var background = require('./scenes/background')(game);
var play = require('./scenes/play')(game);

start.on('inactive', function () {
    play.active = true;
    background.active = true;
});
game.debug = true;
game.boot();

window.game = game;

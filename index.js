var Game = require('./engine/game');

// new game
var game = new Game();

// scenes
var start = require('./scenes/start')(game);
var background = require('./scenes/background')(game);
var play = require('./scenes/play')(game);
var win = require('./scenes/win')(game);

start.on('inactive', function () {
    play.active = true;
    background.active = true;
});
play.on('win', function() {
	play.active = false;
	background.active = false;
	win.active = true;
});
win.on('inactive', function(){
	play.active = true;
    background.active = true;
});
game.debug = true;
game.boot();

window.game = game;

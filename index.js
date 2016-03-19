var es6polyfill = require('babel-polyfill');
var Game = require('./engine/game');

// new game
var game = new Game({ background: 0x1e1f33 });

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
if (typeof BUILD === 'undefined') {
	game.debug = true;
}
game.boot();

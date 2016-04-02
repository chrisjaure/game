import es6polyfill from 'babel-polyfill';
import Game from './engine/game';
import createSplashScene from './scenes/splash';
import createStartScene from './scenes/start';
import createBackgroundScene from './scenes/background';
import createPlayScene from './scenes/play';
import createWinScene from './scenes/win';

// new game
const game = new Game({ background: 0x1e1f33 });

// scenes
const splash = createSplashScene(game);
const start = createStartScene(game);
const background = createBackgroundScene(game);
const play = createPlayScene(game);
const win = createWinScene(game);

splash.active = true;
splash.on('inactive', () => {
    start.active = true;
});
start.on('inactive', () => {
    play.active = true;
    background.active = true;
});
play.on('win', () => {
    play.active = false;
    background.active = false;
    win.active = true;
});
win.on('inactive', () => {
    play.active = true;
    background.active = true;
});
if (typeof BUILD === 'undefined') {
    game.debug = true;
}
game.boot();

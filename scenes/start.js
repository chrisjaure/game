var PIXI = require('pixi.js');
var kb = require('kb-controls');
var Scene = require('../engine/scene');

const introText = [
// pane
`In the night
a little voice whispers
restless,

"Sissy? Sissy! Are you awake?"`,

// pane
`Another voice
a little older than the first
mumbles,

"What now?"`,

// pane 
`"Sissy, I can't sleep."

After a thoughtful pause
the second voice replies,

"Hmm. I know what will make you sleepy."

"What?"`,

// pane
`"Stardust!"

"OK!
But we better watch out for asteroids."

And together they chanted,

"3, 2, 1, blast off!"`
];

function startScene (game) {
    var scene = new Scene(game);
    var panes;
    var activePane = 0;
    var shouldTransition = false;
    var transitionPane = function() {
        if (activePane === panes.length - 1) {
            scene.active = false;
            return;
        }
        panes[activePane].visible = false;
        panes[++activePane].visible = true;
    };
    var prompt = new PIXI.Text('Press space to continue.', { fill: 'white', font: '32px Arial' });
    prompt.height = prompt.height / game.renderer.resolution;
    prompt.width = prompt.width / game.renderer.resolution;
    scene.stage.addChild(prompt);
    prompt.position = {
        x: game.worldBounds.width - prompt.width - 10,
        y: game.worldBounds.height - prompt.height
    };
    scene.on('update', function update() {
        if (game.keyboard.space) {
            if (shouldTransition) {
                transitionPane();
            }
            shouldTransition = false;
        }
        else {
            shouldTransition = true;
        }
    })
    .on('inactive', function () {
        scene.stage.visible = false;
    });
    scene.active = true;
    panes = introText.map(text => {
        var pane = makeTextPane(text);
        pane.visible = false;
        scene.stage.addChild(pane);
        return pane;
    });
    panes[0].visible = true;
    return scene;
}

function makeTextPane (text) {
    var pane = new PIXI.Text(text, {
        fill: 'white'
    });
    pane.position = {x: 10, y: 10 };
    return pane;
}

module.exports = startScene;

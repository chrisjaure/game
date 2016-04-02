import PIXI from 'pixi.js';
import kb from 'kb-controls';
import Scene from '../engine/scene';

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

export default function startScene(game) {
    const scene = new Scene(game);
    let panes;
    let activePane = 0;
    let shouldTransition = false;
    const transitionPane = () => {
        if (activePane === panes.length - 1) {
            scene.active = false;
            return;
        }
        panes[activePane].visible = false;
        panes[++activePane].visible = true;
    };
    const prompt = new PIXI.Text('Press space to continue.', { fill: 'white', font: '32px Arial' });
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
    });
    panes = introText.map(text => {
        const pane = makeTextPane(text);
        pane.visible = false;
        scene.stage.addChild(pane);
        return pane;
    });
    panes[0].visible = true;
    return scene;
}

function makeTextPane(text) {
    const pane = new PIXI.Text(text, {
        fill: 'white'
    });
    pane.position = {x: 10, y: 10 };
    return pane;
}

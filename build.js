(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/Cjaure/game/engine/entity.js":[function(require,module,exports){
"use strict";

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var PIXI = require("pixi.js");
var EventEmitter = require("eventemitter3");
var utils = require("./utils");

var Entity = (function () {
  var _EventEmitter = EventEmitter;
  var Entity = function Entity(game, options) {
    this.game = game;
    this.options = options;
  };

  _inherits(Entity, _EventEmitter);

  Entity.prototype.addToScene = function (scene) {
    scene.stage.addChild(this.entity);
    if (this.update) {
      this.boundUpdate = this.update.bind(this);
      scene.on("update", this.boundUpdate);
    }
    if (this.render) {
      scene.on("render", this.render.bind(this));
    }
    this.scene = scene;
  };

  Entity.prototype.removeFromScene = function () {
    if (!this.scene) {
      return;
    }
    this.scene.stage.removeChild(this.entity);
    if (this.body) {
      this.scene.stage.removeChild(this.body);
    }
    if (this.update) {
      this.scene.removeListener("update", this.boundUpdate);
    }
    if (this.render) {
      this.scene.removeListener("render", this.render);
    }
    this.scene = null;
    this.removed = true;
  };

  Entity.prototype.getBoundingBox = function () {
    if (this.boundingType === "circle") {
      return {
        x: this.entity.x,
        y: this.entity.y,
        radius: this.entity.width / 2
      };
    }
    return {
      x: this.entity.x,
      y: this.entity.y,
      width: this.entity.width,
      height: this.entity.height
    };
  };

  Entity.prototype.render = function () {
    if (this.game.debug && this.scene) {
      utils.showBoundingBox(this, this.scene.stage);
    }
  };

  return Entity;
})();

module.exports = Entity;

},{"./utils":"/Users/Cjaure/game/engine/utils/index.js","eventemitter3":"/Users/Cjaure/game/node_modules/eventemitter3/index.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js"}],"/Users/Cjaure/game/engine/game.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var PIXI = require("pixi.js");
var kb = require("kb-controls");
var EventEmitter = require("eventemitter3");
var Stats = require("stats-js");
var utils = require("./utils");
var raf = require("raf");

var Game = (function () {
  var _EventEmitter = EventEmitter;
  var Game = function Game(_ref) {
    var _ref$width = _ref.width;
    var width = _ref$width === undefined ? 600 : _ref$width;
    var _ref$height = _ref.height;
    var height = _ref$height === undefined ? 400 : _ref$height;
    this.PIXI = PIXI;
    this.width = width;
    this.height = height;
    PIXI.scaleModes.DEFAULT = PIXI.scaleModes.NEAREST;

    this.stage = new PIXI.Stage(1974067);
    this.renderer = PIXI.autoDetectRenderer(this.width, this.height);
    document.body.appendChild(this.renderer.view);

    this.keyboard = kb({
      "<left>": "left",
      A: "left",
      "<right>": "right",
      D: "right",
      "<up>": "up",
      W: "up",
      "<down>": "down",
      S: "down",
      "<space>": "space"
    });
  };

  _inherits(Game, _EventEmitter);

  Game.prototype.preload = function (cb) {
    var assets = [];
    var loader;
    this.emit("preload", assets);
    if (assets.length) {
      loader = new PIXI.AssetLoader(assets);
      loader.on("onComplete", cb);
      loader.load();
    } else {
      cb();
    }
  };

  Game.prototype.boot = function (cb) {
    var _this = this;
    cb = cb || function () {};
    this.preload(function () {
      _this.emit("load");
      raf((function tick(time) {
        this.update(time);
        this.render(time);
        raf(tick.bind(this));
      }).bind(_this));
      cb();
    });
    if (this.debug) {
      this.stats = new Stats();
      // Align top-left
      this.stats.domElement.style.position = "absolute";
      this.stats.domElement.style.left = "0px";
      this.stats.domElement.style.top = "0px";
      document.body.appendChild(this.stats.domElement);
    }
  };

  Game.prototype.update = function (time) {
    this.emit("update", time);
  };

  Game.prototype.render = function (time) {
    if (this.debug) {
      this.stats.begin();
    }
    this.emit("render", time);
    this.renderer.render(this.stage);
    if (this.debug) {
      this.stats.end();
    }
  };

  _prototypeProperties(Game, null, {
    worldBounds: {
      get: function () {
        return {
          x: 0,
          y: 0,
          width: this.renderer.width,
          height: this.renderer.height
        };
      },
      enumerable: true
    }
  });

  return Game;
})();

module.exports = Game;

},{"./utils":"/Users/Cjaure/game/engine/utils/index.js","eventemitter3":"/Users/Cjaure/game/node_modules/eventemitter3/index.js","kb-controls":"/Users/Cjaure/game/node_modules/kb-controls/index.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js","raf":"/Users/Cjaure/game/node_modules/raf/index.js","stats-js":"/Users/Cjaure/game/node_modules/stats-js/build/stats.min.js"}],"/Users/Cjaure/game/engine/scene.js":[function(require,module,exports){
"use strict";

var _prototypeProperties = function (child, staticProps, instanceProps) {
  if (staticProps) Object.defineProperties(child, staticProps);
  if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var PIXI = require("pixi.js");
var EventEmitter = require("eventemitter3");
var active = Symbol("active");

var Scene = (function () {
  var _EventEmitter = EventEmitter;
  var Scene = function Scene(game) {
    var _this = this;
    this.game = game;
    this.stage = new PIXI.DisplayObjectContainer();
    game.stage.addChild(this.stage);
    game.on("update", function (time) {
      if (_this[active]) {
        _this.emit("update", time);
      }
    });
    game.on("render", function (time) {
      if (_this[active]) {
        _this.emit("render", time);
      }
    });
  };

  _inherits(Scene, _EventEmitter);

  _prototypeProperties(Scene, null, {
    active: {
      set: function (value) {
        var event = value ? "active" : "inactive";
        this[active] = value;
        this.emit(event);
      },
      get: function () {
        return this[active];
      },
      enumerable: true
    }
  });

  return Scene;
})();

module.exports = Scene;

},{"eventemitter3":"/Users/Cjaure/game/node_modules/eventemitter3/index.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js"}],"/Users/Cjaure/game/engine/utils/index.js":[function(require,module,exports){
"use strict";

var PIXI = require("pixi.js");
var boxCollide = require("box-collide");

var circleCollide = function (circle1, circle2) {
  var dx = circle1.x + circle1.radius - (circle2.x + circle2.radius);
  var dy = circle1.y + circle1.radius - (circle2.y + circle2.radius);
  var distance = Math.sqrt(dx * dx + dy * dy);

  return distance < circle1.radius + circle2.radius;
};

exports.collide = function (collection1, collection2, cb) {
  if (!Array.isArray(collection1)) {
    collection1 = [collection1];
  }
  if (!Array.isArray(collection2)) {
    collection2 = [collection2];
  }
  collection1.forEach(function (item1) {
    var item1Bounds = item1.getBoundingBox();
    collection2.forEach(function (item2) {
      var item2Bounds = item2.getBoundingBox();
      if (item1Bounds.radius !== undefined && item2Bounds.radius !== undefined) {
        if (circleCollide(item1Bounds, item2Bounds)) {
          cb(item1, item2);
        }
      } else if (boxCollide(item1.getBoundingBox(), item2.getBoundingBox())) {
        cb(item1, item2);
      }
    });
  });
};

exports.frameRange = function (start, end, prefix) {
  var frames = [];
  for (var i = start; i <= end; i++) {
    frames.push(new PIXI.Texture.fromFrame((prefix || null) + i));
  }
  return frames;
};

exports.showBoundingBox = function (object, stage) {
  if (!stage) {
    return;
  }
  var bounds = object.getBoundingBox();
  if (!object.body) {
    var box = new PIXI.Graphics();
    box.alpha = 0.3;
    stage.addChild(box);
    object.body = box;
  }
  object.body.clear();
  object.body.x = bounds.x;
  object.body.y = bounds.y;
  object.body.lineStyle(2, 65280, 1);
  if (bounds.radius !== undefined) {
    object.body.drawCircle(bounds.radius, bounds.radius, bounds.radius);
  } else {
    object.body.drawRect(0, 0, bounds.width, bounds.height);
  }
};

},{"box-collide":"/Users/Cjaure/game/node_modules/box-collide/index.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js"}],"/Users/Cjaure/game/entities/dust.js":[function(require,module,exports){
"use strict";

var _slice = Array.prototype.slice;
var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var Entity = require("../engine/entity");
var utils = require("../engine/utils");
var random = require("random-ext");
var boxCollide = require("box-collide");

var Dust = (function () {
  var _Entity = Entity;
  var Dust = function Dust(game) {
    var _get2;
    (_get2 = _get(Object.getPrototypeOf(Dust.prototype), "constructor", this)).call.apply(_get2, [this].concat(_slice.call(arguments)));
    this.speed = 3;
    this.boundingType = "circle";
    var entity = this.entity = new game.PIXI.Graphics();
    entity.beginFill(16774998);
    entity.drawCircle(4, 4, 4);
    entity.endFill();
    entity.x = game.renderer.width;
    entity.y = random.integer(game.renderer.height - entity.height, entity.height);
  };

  _inherits(Dust, _Entity);

  Dust.prototype.update = function () {
    if (!boxCollide(this.entity, this.game.worldBounds)) {
      this.removeFromScene();
      return;
    }
    this.entity.x -= this.speed;
  };

  return Dust;
})();

module.exports = Dust;

},{"../engine/entity":"/Users/Cjaure/game/engine/entity.js","../engine/utils":"/Users/Cjaure/game/engine/utils/index.js","box-collide":"/Users/Cjaure/game/node_modules/box-collide/index.js","random-ext":"/Users/Cjaure/game/node_modules/random-ext/index.js"}],"/Users/Cjaure/game/entities/player.js":[function(require,module,exports){
"use strict";

var _slice = Array.prototype.slice;
var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var PIXI = require("pixi.js");
var TWEEN = require("tween.js");
var utils = require("../engine/utils");
var Entity = require("../engine/entity");
var collide = require("box-collide");
var Howl = require("howler").Howl;

var Player = (function () {
  var _Entity = Entity;
  var Player = function Player() {
    var _get2;
    (_get2 = _get(Object.getPrototypeOf(Player.prototype), "constructor", this)).call.apply(_get2, [this].concat(_slice.call(arguments)));
    this.assets = ["assets/ship.png"];
    this.speed = 6;
    this.boundingType = "circle";

    var image = new PIXI.ImageLoader(this.assets[0]);
    image.loadFramedSpriteSheet(32, 32, "ship");

    this.flyFrames = image.frames.slice(1, 5);
    this.stopFrames = image.frames.slice(5, 12);

    var entity = this.entity = new PIXI.DisplayObjectContainer();
    entity.x = this.options.x || 0;
    entity.y = this.options.y || 0;
    entity.scale = { x: 2, y: 2 };

    var sprite = this.sprite = new PIXI.MovieClip(this.flyFrames);
    sprite.animationSpeed = 1 / 60;
    sprite.loop = true;
    sprite.play();
    sprite.rotation = Math.PI * 1.5;
    sprite.position.y = sprite.height;

    entity.addChild(sprite);

    this.shineGetSound = new Howl({ urls: ["assets/shineget.wav"], volume: 0.6 });
    this.hitSound = new Howl({ urls: ["assets/hit.wav"] });

    entity.tween = new TWEEN.Tween(entity);
  };

  _inherits(Player, _Entity);

  Player.preload = function (game) {
    game.on("preload", function (assets) {
      return assets.push("assets/ship.png");
    });
  };

  Player.prototype.reset = function () {
    this.speed = 6;
    this.entity.x = this.options.x || 0;
    this.entity.y = this.options.y || 0;
  };

  Player.prototype.shineGet = function () {
    this.speed -= 0.1;
    this.shineGetSound.play();
  };

  Player.prototype.hit = function () {
    this.speed += 0.1;
    if (this.speed > 6) {
      this.speed = 6;
    }
    this.hitSound.play();
  };

  Player.prototype.update = function () {
    var keyboard = this.game.keyboard;

    if (keyboard.left) {}
    if (keyboard.right) {}
    if (keyboard.up) {
      this.shouldTween = false;
      this.entity.y -= this.speed;
      this.tweenTo = "up";
    }
    if (keyboard.down) {
      this.shouldTween = false;
      this.entity.y += this.speed;
      this.tweenTo = "down";
    }

    if (this.tweenTo && !keyboard.up && !keyboard.down) {
      var tweenTo = 0;
      this.shouldTween = true;
      if (this.tweenTo === "up") {
        tweenTo = Math.max(0, this.entity.y - this.speed * 2);
      } else {
        tweenTo = Math.min(this.game.renderer.height - this.entity.height, this.entity.y + this.speed * 2);
      }
      this.entity.tween.to({ y: tweenTo }, 150).easing(TWEEN.Easing.Quadratic.Out).start();
      this.tweenTo = null;
    }

    // if (keyboard.space) {
    // 	var time = Date.now();
    // 	if (time - this.lastShoot > 500 || !this.lastShoot) {
    // 		this.emit('shoot');
    // 		this.lastShoot = time;
    // 	}
    // }

    this.positionInBounds();
  };

  Player.prototype.render = function (time) {
    var _get3;
    (_get3 = _get(Object.getPrototypeOf(Player.prototype), "render", this)).call.apply(_get3, [this].concat(_slice.call(arguments)));
    if (this.shouldTween) {
      this.shouldTween = this.entity.tween.update(time);
    }
  };

  Player.prototype.positionInBounds = function () {
    if (this.entity.x < 0) {
      this.entity.x = 0;
    }
    if (this.entity.y < 0) {
      this.entity.y = 0;
    }
    if (this.entity.x + this.entity.width > this.game.renderer.width) {
      this.entity.x = this.game.renderer.width - this.entity.width;
    }
    if (this.entity.y + this.entity.height > this.game.renderer.height) {
      this.entity.y = this.game.renderer.height - this.entity.height;
    }
  };

  Player.prototype.getGunPosition = function () {
    return {
      x: this.entity.x + this.entity.width,
      y: this.entity.y + this.entity.height / 2 - 2,
      width: this.entity.width,
      height: this.entity.height
    };
  };

  return Player;
})();

module.exports = Player;
// this.entity.x -= this.speed / 4;
// this.entity.x += this.speed / 4;

},{"../engine/entity":"/Users/Cjaure/game/engine/entity.js","../engine/utils":"/Users/Cjaure/game/engine/utils/index.js","box-collide":"/Users/Cjaure/game/node_modules/box-collide/index.js","howler":"/Users/Cjaure/game/node_modules/howler/howler.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js","tween.js":"/Users/Cjaure/game/node_modules/tween.js/index.js"}],"/Users/Cjaure/game/entities/rock.js":[function(require,module,exports){
"use strict";

var _slice = Array.prototype.slice;
var _get = function get(object, property, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    return desc.value;
  } else {
    var getter = desc.get;
    if (getter === undefined) {
      return undefined;
    }
    return getter.call(receiver);
  }
};

var _inherits = function (child, parent) {
  if (typeof parent !== "function" && parent !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof parent);
  }
  child.prototype = Object.create(parent && parent.prototype, {
    constructor: {
      value: child,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (parent) child.__proto__ = parent;
};

var Entity = require("../engine/entity");
var utils = require("../engine/utils");
var random = require("random-ext");
var boxCollide = require("box-collide");

var Rock = (function () {
  var _Entity = Entity;
  var Rock = function Rock(game) {
    var _get2;
    (_get2 = _get(Object.getPrototypeOf(Rock.prototype), "constructor", this)).call.apply(_get2, [this].concat(_slice.call(arguments)));
    this.speed = 2;
    this.boundingType = "circle";
    var radius = random.integer(40, 15);
    var entity = this.entity = new game.PIXI.Graphics();
    entity.beginFill(8358799);
    entity.drawCircle(radius, radius, radius);
    entity.endFill();
    entity.x = game.renderer.width;
    entity.y = random.integer(game.renderer.height - entity.height, entity.height);
  };

  _inherits(Rock, _Entity);

  Rock.prototype.update = function () {
    if (!boxCollide(this.entity, this.game.worldBounds)) {
      this.removeFromScene();
      return;
    }
    this.entity.x -= this.speed;
  };

  return Rock;
})();

module.exports = Rock;

},{"../engine/entity":"/Users/Cjaure/game/engine/entity.js","../engine/utils":"/Users/Cjaure/game/engine/utils/index.js","box-collide":"/Users/Cjaure/game/node_modules/box-collide/index.js","random-ext":"/Users/Cjaure/game/node_modules/random-ext/index.js"}],"/Users/Cjaure/game/index.js":[function(require,module,exports){
"use strict";

var Game = require("./engine/game");

// new game
var game = new Game({});

// scenes
var start = require("./scenes/start")(game);
var background = require("./scenes/background")(game);
var play = require("./scenes/play")(game);
var win = require("./scenes/win")(game);

start.on("inactive", function () {
  play.active = true;
  background.active = true;
});
play.on("win", function () {
  play.active = false;
  background.active = false;
  win.active = true;
});
win.on("inactive", function () {
  play.active = true;
  background.active = true;
});
game.debug = true;
game.boot();

},{"./engine/game":"/Users/Cjaure/game/engine/game.js","./scenes/background":"/Users/Cjaure/game/scenes/background.js","./scenes/play":"/Users/Cjaure/game/scenes/play.js","./scenes/start":"/Users/Cjaure/game/scenes/start.js","./scenes/win":"/Users/Cjaure/game/scenes/win.js"}],"/Users/Cjaure/game/node_modules/box-collide/index.js":[function(require,module,exports){
module.exports = function (ra, rb) {
    var a = norm(ra), b = norm(rb);
    var inx = isect(a.left, b.left, b.right)
        || isect(a.right, b.left, b.right)
        || inside(a.left, a.right, b.left, b.right)
        || inside(b.left, b.right, a.left, a.right)
    ;
    var iny = isect(a.top, b.top, b.bottom)
        || isect(a.bottom, b.top, b.bottom)
        || inside(a.top, a.bottom, b.top, b.bottom)
        || inside(b.top, b.bottom, a.top, a.bottom)
    ;
    return inx && iny;
};

function isect (x, lower, upper) {
    return x >= lower && x <= upper;
}

function inside (a0, a1, b0, b1) {
    return a0 >= b0 && a1 <= b1;
}

function norm (q) {
    var p = {
        left: q.left,
        right: q.right,
        top: q.top,
        bottom: q.bottom
    };
    if (p.left === undefined && q.x !== undefined) p.left = q.x;
    if (p.top === undefined && q.y !== undefined) p.top = q.y;
    
    var w = q.width || 0, h = q.height || 0;
    
    if (p.right === undefined && q.x !== undefined) p.right = q.x + w;
    if (p.bottom === undefined && q.y !== undefined) p.bottom = q.y + h;
    return p;
}

},{}],"/Users/Cjaure/game/node_modules/curry/curry.js":[function(require,module,exports){
var slice = Array.prototype.slice;
var toArray = function(a){ return slice.call(a) }
var tail = function(a){ return slice.call(a, 1) }

// fn, [value] -> fn
//-- create a curried function, incorporating any number of
//-- pre-existing arguments (e.g. if you're further currying a function).
var createFn = function(fn, args, totalArity){
    var remainingArity = totalArity - args.length;

    switch (remainingArity) {
        case 0: return function(){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 1: return function(a){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 2: return function(a,b){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 3: return function(a,b,c){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 4: return function(a,b,c,d){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 5: return function(a,b,c,d,e){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 6: return function(a,b,c,d,e,f){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 7: return function(a,b,c,d,e,f,g){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 8: return function(a,b,c,d,e,f,g,h){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 9: return function(a,b,c,d,e,f,g,h,i){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        case 10: return function(a,b,c,d,e,f,g,h,i,j){ return processInvocation(fn, concatArgs(args, arguments), totalArity) };
        default: return createEvalFn(fn, args, remainingArity);
    }
}

// [value], arguments -> [value]
//-- concat new arguments onto old arguments array
var concatArgs = function(args1, args2){
    return args1.concat(toArray(args2));
}

// fn, [value], int -> fn
//-- create a function of the correct arity by the use of eval,
//-- so that curry can handle functions of any arity
var createEvalFn = function(fn, args, arity){
    var argList = makeArgList(arity);

    //-- hack for IE's faulty eval parsing -- http://stackoverflow.com/a/6807726
    var fnStr = 'false||' +
                'function(' + argList + '){ return processInvocation(fn, concatArgs(args, arguments)); }';
    return eval(fnStr);
}

var makeArgList = function(len){
    var a = [];
    for ( var i = 0; i < len; i += 1 ) a.push('a' + i.toString());
    return a.join(',');
}

var trimArrLength = function(arr, length){
    if ( arr.length > length ) return arr.slice(0, length);
    else return arr;
}

// fn, [value] -> value
//-- handle a function being invoked.
//-- if the arg list is long enough, the function will be called
//-- otherwise, a new curried version is created.
var processInvocation = function(fn, argsArr, totalArity){
    argsArr = trimArrLength(argsArr, totalArity);

    if ( argsArr.length === totalArity ) return fn.apply(null, argsArr);
    return createFn(fn, argsArr, totalArity);
}

// fn -> fn
//-- curries a function! <3
var curry = function(fn){
    return createFn(fn, [], fn.length);
}

// num, fn -> fn
//-- curries a function to a certain arity! <33
curry.to = curry(function(arity, fn){
    return createFn(fn, [], arity);
});

// num, fn -> fn
//-- adapts a function in the context-first style
//-- to a curried version. <3333
curry.adaptTo = curry(function(num, fn){
    return curry.to(num, function(context){
        var args = tail(arguments).concat(context);
        return fn.apply(this, args);
    });
})

// fn -> fn
//-- adapts a function in the context-first style to
//-- a curried version. <333
curry.adapt = function(fn){
    return curry.adaptTo(fn.length, fn)
}


module.exports = curry;

},{}],"/Users/Cjaure/game/node_modules/eventemitter3/index.js":[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) delete this._events[event];
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

//
// Expose the module.
//
module.exports = EventEmitter;

},{}],"/Users/Cjaure/game/node_modules/howler/howler.js":[function(require,module,exports){
/*!
 *  howler.js v1.1.25
 *  howlerjs.com
 *
 *  (c) 2013-2014, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {
  // setup
  var cache = {};

  // setup the audio context
  var ctx = null,
    usingWebAudio = true,
    noAudio = false;
  try {
    if (typeof AudioContext !== 'undefined') {
      ctx = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
      ctx = new webkitAudioContext();
    } else {
      usingWebAudio = false;
    }
  } catch(e) {
    usingWebAudio = false;
  }

  if (!usingWebAudio) {
    if (typeof Audio !== 'undefined') {
      try {
        new Audio();
      } catch(e) {
        noAudio = true;
      }
    } else {
      noAudio = true;
    }
  }

  // create a master gain node
  if (usingWebAudio) {
    var masterGain = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
    masterGain.gain.value = 1;
    masterGain.connect(ctx.destination);
  }

  // create global controller
  var HowlerGlobal = function(codecs) {
    this._volume = 1;
    this._muted = false;
    this.usingWebAudio = usingWebAudio;
    this.ctx = ctx;
    this.noAudio = noAudio;
    this._howls = [];
    this._codecs = codecs;
    this.iOSAutoEnable = true;
  };
  HowlerGlobal.prototype = {
    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        if (usingWebAudio) {
          masterGain.gain.value = vol;
        }

        // loop through cache and change volume of all nodes that are using HTML5 Audio
        for (var key in self._howls) {
          if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
            // loop through the audio nodes
            for (var i=0; i<self._howls[key]._audioNode.length; i++) {
              self._howls[key]._audioNode[i].volume = self._howls[key]._volume * self._volume;
            }
          }
        }

        return self;
      }

      // return the current global volume
      return (usingWebAudio) ? masterGain.gain.value : self._volume;
    },

    /**
     * Mute all sounds.
     * @return {Howler}
     */
    mute: function() {
      this._setMuted(true);

      return this;
    },

    /**
     * Unmute all sounds.
     * @return {Howler}
     */
    unmute: function() {
      this._setMuted(false);

      return this;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    _setMuted: function(muted) {
      var self = this;

      self._muted = muted;

      if (usingWebAudio) {
        masterGain.gain.value = muted ? 0 : self._volume;
      }

      for (var key in self._howls) {
        if (self._howls.hasOwnProperty(key) && self._howls[key]._webAudio === false) {
          // loop through the audio nodes
          for (var i=0; i<self._howls[key]._audioNode.length; i++) {
            self._howls[key]._audioNode[i].muted = muted;
          }
        }
      }
    },

    /**
     * Check for codec support.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return this._codecs[ext];
    },

    /**
     * iOS will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableiOSAudio: function() {
      var self = this;

      // only run this on iOS if audio isn't already eanbled
      if (ctx && (self._iOSEnabled || !/iPhone|iPad|iPod/i.test(navigator.userAgent))) {
        return;
      }

      self._iOSEnabled = false;

      // call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS
      var unlock = function() {
        // create an empty buffer
        var buffer = ctx.createBuffer(1, 1, 22050);
        var source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);

        // play the empty buffer
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // setup a timeout to check that we are unlocked on the next event loop
        setTimeout(function() {
          if ((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
            // update the unlocked state and prevent this check from happening again
            self._iOSEnabled = true;
            self.iOSAutoEnable = false;

            // remove the touch start listener
            window.removeEventListener('touchstart', unlock, false);
          }
        }, 0);
      };

      // setup a touch start listener to attempt an unlock in
      window.addEventListener('touchstart', unlock, false);

      return self;
    }
  };

  // check for browser codec support
  var audioTest = null;
  var codecs = {};
  if (!noAudio) {
    audioTest = new Audio();
    codecs = {
      mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/, ''),
      opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
      ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
      wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
      aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
      m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
      weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, '')
    };
  }

  // allow access to the global audio controls
  var Howler = new HowlerGlobal(codecs);

  // setup the audio object
  var Howl = function(o) {
    var self = this;

    // setup the defaults
    self._autoplay = o.autoplay || false;
    self._buffer = o.buffer || false;
    self._duration = o.duration || 0;
    self._format = o.format || null;
    self._loop = o.loop || false;
    self._loaded = false;
    self._sprite = o.sprite || {};
    self._src = o.src || '';
    self._pos3d = o.pos3d || [0, 0, -0.5];
    self._volume = o.volume !== undefined ? o.volume : 1;
    self._urls = o.urls || [];
    self._rate = o.rate || 1;

    // allow forcing of a specific panningModel ('equalpower' or 'HRTF'),
    // if none is specified, defaults to 'equalpower' and switches to 'HRTF'
    // if 3d sound is used
    self._model = o.model || null;

    // setup event functions
    self._onload = [o.onload || function() {}];
    self._onloaderror = [o.onloaderror || function() {}];
    self._onend = [o.onend || function() {}];
    self._onpause = [o.onpause || function() {}];
    self._onplay = [o.onplay || function() {}];

    self._onendTimer = [];

    // Web Audio or HTML5 Audio?
    self._webAudio = usingWebAudio && !self._buffer;

    // check if we need to fall back to HTML5 Audio
    self._audioNode = [];
    if (self._webAudio) {
      self._setupAudioNode();
    }

    // automatically try to enable audio on iOS
    if (typeof ctx !== 'undefined' && ctx && Howler.iOSAutoEnable) {
      Howler._enableiOSAudio();
    }

    // add this to an array of Howl's to allow global control
    Howler._howls.push(self);

    // load the track
    self.load();
  };

  // setup all of the methods
  Howl.prototype = {
    /**
     * Load an audio file.
     * @return {Howl}
     */
    load: function() {
      var self = this,
        url = null;

      // if no audio is available, quit immediately
      if (noAudio) {
        self.on('loaderror');
        return;
      }

      // loop through source URLs and pick the first one that is compatible
      for (var i=0; i<self._urls.length; i++) {
        var ext, urlItem;

        if (self._format) {
          // use specified audio format if available
          ext = self._format;
        } else {
          // figure out the filetype (whether an extension or base64 data)
          urlItem = self._urls[i];
          ext = /^data:audio\/([^;,]+);/i.exec(urlItem);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(urlItem.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          } else {
            self.on('loaderror');
            return;
          }
        }

        if (codecs[ext]) {
          url = self._urls[i];
          break;
        }
      }

      if (!url) {
        self.on('loaderror');
        return;
      }

      self._src = url;

      if (self._webAudio) {
        loadBuffer(self, url);
      } else {
        var newNode = new Audio();

        // listen for errors with HTML5 audio (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror)
        newNode.addEventListener('error', function () {
          if (newNode.error && newNode.error.code === 4) {
            HowlerGlobal.noAudio = true;
          }

          self.on('loaderror', {type: newNode.error ? newNode.error.code : 0});
        }, false);

        self._audioNode.push(newNode);

        // setup the new audio node
        newNode.src = url;
        newNode._pos = 0;
        newNode.preload = 'auto';
        newNode.volume = (Howler._muted) ? 0 : self._volume * Howler.volume();

        // setup the event listener to start playing the sound
        // as soon as it has buffered enough
        var listener = function() {
          // round up the duration when using HTML5 Audio to account for the lower precision
          self._duration = Math.ceil(newNode.duration * 10) / 10;

          // setup a sprite if none is defined
          if (Object.getOwnPropertyNames(self._sprite).length === 0) {
            self._sprite = {_default: [0, self._duration * 1000]};
          }

          if (!self._loaded) {
            self._loaded = true;
            self.on('load');
          }

          if (self._autoplay) {
            self.play();
          }

          // clear the event listener
          newNode.removeEventListener('canplaythrough', listener, false);
        };
        newNode.addEventListener('canplaythrough', listener, false);
        newNode.load();
      }

      return self;
    },

    /**
     * Get/set the URLs to be pulled from to play in this source.
     * @param  {Array} urls  Arry of URLs to load from
     * @return {Howl}        Returns self or the current URLs
     */
    urls: function(urls) {
      var self = this;

      if (urls) {
        self.stop();
        self._urls = (typeof urls === 'string') ? [urls] : urls;
        self._loaded = false;
        self.load();

        return self;
      } else {
        return self._urls;
      }
    },

    /**
     * Play a sound from the current time (0 by default).
     * @param  {String}   sprite   (optional) Plays from the specified position in the sound sprite definition.
     * @param  {Function} callback (optional) Returns the unique playback id for this sound instance.
     * @return {Howl}
     */
    play: function(sprite, callback) {
      var self = this;

      // if no sprite was passed but a callback was, update the variables
      if (typeof sprite === 'function') {
        callback = sprite;
      }

      // use the default sprite if none is passed
      if (!sprite || typeof sprite === 'function') {
        sprite = '_default';
      }

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.play(sprite, callback);
        });

        return self;
      }

      // if the sprite doesn't exist, play nothing
      if (!self._sprite[sprite]) {
        if (typeof callback === 'function') callback();
        return self;
      }

      // get the node to playback
      self._inactiveNode(function(node) {
        // persist the sprite being played
        node._sprite = sprite;

        // determine where to start playing from
        var pos = (node._pos > 0) ? node._pos : self._sprite[sprite][0] / 1000;

        // determine how long to play for
        var duration = 0;
        if (self._webAudio) {
          duration = self._sprite[sprite][1] / 1000 - node._pos;
          if (node._pos > 0) {
            pos = self._sprite[sprite][0] / 1000 + pos;
          }
        } else {
          duration = self._sprite[sprite][1] / 1000 - (pos - self._sprite[sprite][0] / 1000);
        }

        // determine if this sound should be looped
        var loop = !!(self._loop || self._sprite[sprite][2]);

        // set timer to fire the 'onend' event
        var soundId = (typeof callback === 'string') ? callback : Math.round(Date.now() * Math.random()) + '',
          timerId;
        (function() {
          var data = {
            id: soundId,
            sprite: sprite,
            loop: loop
          };
          timerId = setTimeout(function() {
            // if looping, restart the track
            if (!self._webAudio && loop) {
              self.stop(data.id).play(sprite, data.id);
            }

            // set web audio node to paused at end
            if (self._webAudio && !loop) {
              self._nodeById(data.id).paused = true;
              self._nodeById(data.id)._pos = 0;

              // clear the end timer
              self._clearEndTimer(data.id);
            }

            // end the track if it is HTML audio and a sprite
            if (!self._webAudio && !loop) {
              self.stop(data.id);
            }

            // fire ended event
            self.on('end', soundId);
          }, duration * 1000);

          // store the reference to the timer
          self._onendTimer.push({timer: timerId, id: data.id});
        })();

        if (self._webAudio) {
          var loopStart = self._sprite[sprite][0] / 1000,
            loopEnd = self._sprite[sprite][1] / 1000;

          // set the play id to this node and load into context
          node.id = soundId;
          node.paused = false;
          refreshBuffer(self, [loop, loopStart, loopEnd], soundId);
          self._playStart = ctx.currentTime;
          node.gain.value = self._volume;

          if (typeof node.bufferSource.start === 'undefined') {
            node.bufferSource.noteGrainOn(0, pos, duration);
          } else {
            node.bufferSource.start(0, pos, duration);
          }
        } else {
          if (node.readyState === 4 || !node.readyState && navigator.isCocoonJS) {
            node.readyState = 4;
            node.id = soundId;
            node.currentTime = pos;
            node.muted = Howler._muted || node.muted;
            node.volume = self._volume * Howler.volume();
            setTimeout(function() { node.play(); }, 0);
          } else {
            self._clearEndTimer(soundId);

            (function(){
              var sound = self,
                playSprite = sprite,
                fn = callback,
                newNode = node;
              var listener = function() {
                sound.play(playSprite, fn);

                // clear the event listener
                newNode.removeEventListener('canplaythrough', listener, false);
              };
              newNode.addEventListener('canplaythrough', listener, false);
            })();

            return self;
          }
        }

        // fire the play event and send the soundId back in the callback
        self.on('play');
        if (typeof callback === 'function') callback(soundId);

        return self;
      });

      return self;
    },

    /**
     * Pause playback and save the current position.
     * @param {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pause(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = self.pos(null, id);

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;
          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else {
          activeNode.pause();
        }
      }

      self.on('pause');

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl}
     */
    stop: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.stop(id);
        });

        return self;
      }

      // clear 'onend' timer
      self._clearEndTimer(id);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        activeNode._pos = 0;

        if (self._webAudio) {
          // make sure the sound has been created
          if (!activeNode.bufferSource || activeNode.paused) {
            return self;
          }

          activeNode.paused = true;

          if (typeof activeNode.bufferSource.stop === 'undefined') {
            activeNode.bufferSource.noteOff(0);
          } else {
            activeNode.bufferSource.stop(0);
          }
        } else if (!isNaN(activeNode.duration)) {
          activeNode.pause();
          activeNode.currentTime = 0;
        }
      }

      return self;
    },

    /**
     * Mute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    mute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.mute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = 0;
        } else {
          activeNode.muted = true;
        }
      }

      return self;
    },

    /**
     * Unmute this sound.
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl}
     */
    unmute: function(id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.unmute(id);
        });

        return self;
      }

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (self._webAudio) {
          activeNode.gain.value = self._volume;
        } else {
          activeNode.muted = false;
        }
      }

      return self;
    },

    /**
     * Get/set volume of this sound.
     * @param  {Float}  vol Volume from 0.0 to 1.0.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}     Returns self or current volume.
     */
    volume: function(vol, id) {
      var self = this;

      // make sure volume is a number
      vol = parseFloat(vol);

      if (vol >= 0 && vol <= 1) {
        self._volume = vol;

        // if the sound hasn't been loaded, add it to the event queue
        if (!self._loaded) {
          self.on('play', function() {
            self.volume(vol, id);
          });

          return self;
        }

        var activeNode = (id) ? self._nodeById(id) : self._activeNode();
        if (activeNode) {
          if (self._webAudio) {
            activeNode.gain.value = vol;
          } else {
            activeNode.volume = vol * Howler.volume();
          }
        }

        return self;
      } else {
        return self._volume;
      }
    },

    /**
     * Get/set whether to loop the sound.
     * @param  {Boolean} loop To loop or not to loop, that is the question.
     * @return {Howl/Boolean}      Returns self or current looping value.
     */
    loop: function(loop) {
      var self = this;

      if (typeof loop === 'boolean') {
        self._loop = loop;

        return self;
      } else {
        return self._loop;
      }
    },

    /**
     * Get/set sound sprite definition.
     * @param  {Object} sprite Example: {spriteName: [offset, duration, loop]}
     *                @param {Integer} offset   Where to begin playback in milliseconds
     *                @param {Integer} duration How long to play in milliseconds
     *                @param {Boolean} loop     (optional) Set true to loop this sprite
     * @return {Howl}        Returns current sprite sheet or self.
     */
    sprite: function(sprite) {
      var self = this;

      if (typeof sprite === 'object') {
        self._sprite = sprite;

        return self;
      } else {
        return self._sprite;
      }
    },

    /**
     * Get/set the position of playback.
     * @param  {Float}  pos The position to move current playback to.
     * @param  {String} id  (optional) The play instance ID.
     * @return {Howl/Float}      Returns self or current playback position.
     */
    pos: function(pos, id) {
      var self = this;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.pos(pos);
        });

        return typeof pos === 'number' ? self : self._pos || 0;
      }

      // make sure we are dealing with a number for pos
      pos = parseFloat(pos);

      var activeNode = (id) ? self._nodeById(id) : self._activeNode();
      if (activeNode) {
        if (pos >= 0) {
          self.pause(id);
          activeNode._pos = pos;
          self.play(activeNode._sprite, id);

          return self;
        } else {
          return self._webAudio ? activeNode._pos + (ctx.currentTime - self._playStart) : activeNode.currentTime;
        }
      } else if (pos >= 0) {
        return self;
      } else {
        // find the first inactive node to return the pos for
        for (var i=0; i<self._audioNode.length; i++) {
          if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
            return (self._webAudio) ? self._audioNode[i]._pos : self._audioNode[i].currentTime;
          }
        }
      }
    },

    /**
     * Get/set the 3D position of the audio source.
     * The most common usage is to set the 'x' position
     * to affect the left/right ear panning. Setting any value higher than
     * 1.0 will begin to decrease the volume of the sound as it moves further away.
     * NOTE: This only works with Web Audio API, HTML5 Audio playback
     * will not be affected.
     * @param  {Float}  x  The x-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  y  The y-position of the playback from -1000.0 to 1000.0
     * @param  {Float}  z  The z-position of the playback from -1000.0 to 1000.0
     * @param  {String} id (optional) The play instance ID.
     * @return {Howl/Array}   Returns self or the current 3D position: [x, y, z]
     */
    pos3d: function(x, y, z, id) {
      var self = this;

      // set a default for the optional 'y' & 'z'
      y = (typeof y === 'undefined' || !y) ? 0 : y;
      z = (typeof z === 'undefined' || !z) ? -0.5 : z;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('play', function() {
          self.pos3d(x, y, z, id);
        });

        return self;
      }

      if (x >= 0 || x < 0) {
        if (self._webAudio) {
          var activeNode = (id) ? self._nodeById(id) : self._activeNode();
          if (activeNode) {
            self._pos3d = [x, y, z];
            activeNode.panner.setPosition(x, y, z);
            activeNode.panner.panningModel = self._model || 'HRTF';
          }
        }
      } else {
        return self._pos3d;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes.
     * @param  {Number}   from     The volume to fade from (0.0 to 1.0).
     * @param  {Number}   to       The volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback (optional) Fired when the fade is complete.
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fade: function(from, to, len, callback, id) {
      var self = this,
        diff = Math.abs(from - to),
        dir = from > to ? 'down' : 'up',
        steps = diff / 0.01,
        stepTime = len / steps;

      // if the sound hasn't been loaded, add it to the event queue
      if (!self._loaded) {
        self.on('load', function() {
          self.fade(from, to, len, callback, id);
        });

        return self;
      }

      // set the volume to the start position
      self.volume(from, id);

      for (var i=1; i<=steps; i++) {
        (function() {
          var change = self._volume + (dir === 'up' ? 0.01 : -0.01) * i,
            vol = Math.round(1000 * change) / 1000,
            toVol = to;

          setTimeout(function() {
            self.volume(vol, id);

            if (vol === toVol) {
              if (callback) callback();
            }
          }, stepTime * i);
        })();
      }
    },

    /**
     * [DEPRECATED] Fade in the current sound.
     * @param  {Float}    to      Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len     Time in milliseconds to fade.
     * @param  {Function} callback
     * @return {Howl}
     */
    fadeIn: function(to, len, callback) {
      return this.volume(0).play().fade(0, to, len, callback);
    },

    /**
     * [DEPRECATED] Fade out the current sound and pause when finished.
     * @param  {Float}    to       Volume to fade to (0.0 to 1.0).
     * @param  {Number}   len      Time in milliseconds to fade.
     * @param  {Function} callback
     * @param  {String}   id       (optional) The play instance ID.
     * @return {Howl}
     */
    fadeOut: function(to, len, callback, id) {
      var self = this;

      return self.fade(self._volume, to, len, function() {
        if (callback) callback();
        self.pause(id);

        // fire ended event
        self.on('end');
      }, id);
    },

    /**
     * Get an audio node by ID.
     * @return {Howl} Audio node.
     */
    _nodeById: function(id) {
      var self = this,
        node = self._audioNode[0];

      // find the node with this ID
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].id === id) {
          node = self._audioNode[i];
          break;
        }
      }

      return node;
    },

    /**
     * Get the first active audio node.
     * @return {Howl} Audio node.
     */
    _activeNode: function() {
      var self = this,
        node = null;

      // find the first playing node
      for (var i=0; i<self._audioNode.length; i++) {
        if (!self._audioNode[i].paused) {
          node = self._audioNode[i];
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      return node;
    },

    /**
     * Get the first inactive audio node.
     * If there is none, create a new one and add it to the pool.
     * @param  {Function} callback Function to call when the audio node is ready.
     */
    _inactiveNode: function(callback) {
      var self = this,
        node = null;

      // find first inactive node to recycle
      for (var i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused && self._audioNode[i].readyState === 4) {
          // send the node back for use by the new play instance
          callback(self._audioNode[i]);
          node = true;
          break;
        }
      }

      // remove excess inactive nodes
      self._drainPool();

      if (node) {
        return;
      }

      // create new node if there are no inactives
      var newNode;
      if (self._webAudio) {
        newNode = self._setupAudioNode();
        callback(newNode);
      } else {
        self.load();
        newNode = self._audioNode[self._audioNode.length - 1];

        // listen for the correct load event and fire the callback
        var listenerEvent = navigator.isCocoonJS ? 'canplaythrough' : 'loadedmetadata';
        var listener = function() {
          newNode.removeEventListener(listenerEvent, listener, false);
          callback(newNode);
        };
        newNode.addEventListener(listenerEvent, listener, false);
      }
    },

    /**
     * If there are more than 5 inactive audio nodes in the pool, clear out the rest.
     */
    _drainPool: function() {
      var self = this,
        inactive = 0,
        i;

      // count the number of inactive nodes
      for (i=0; i<self._audioNode.length; i++) {
        if (self._audioNode[i].paused) {
          inactive++;
        }
      }

      // remove excess inactive nodes
      for (i=self._audioNode.length-1; i>=0; i--) {
        if (inactive <= 5) {
          break;
        }

        if (self._audioNode[i].paused) {
          // disconnect the audio source if using Web Audio
          if (self._webAudio) {
            self._audioNode[i].disconnect(0);
          }

          inactive--;
          self._audioNode.splice(i, 1);
        }
      }
    },

    /**
     * Clear 'onend' timeout before it ends.
     * @param  {String} soundId  The play instance ID.
     */
    _clearEndTimer: function(soundId) {
      var self = this,
        index = 0;

      // loop through the timers to find the one associated with this sound
      for (var i=0; i<self._onendTimer.length; i++) {
        if (self._onendTimer[i].id === soundId) {
          index = i;
          break;
        }
      }

      var timer = self._onendTimer[index];
      if (timer) {
        clearTimeout(timer.timer);
        self._onendTimer.splice(index, 1);
      }
    },

    /**
     * Setup the gain node and panner for a Web Audio instance.
     * @return {Object} The new audio node.
     */
    _setupAudioNode: function() {
      var self = this,
        node = self._audioNode,
        index = self._audioNode.length;

      // create gain node
      node[index] = (typeof ctx.createGain === 'undefined') ? ctx.createGainNode() : ctx.createGain();
      node[index].gain.value = self._volume;
      node[index].paused = true;
      node[index]._pos = 0;
      node[index].readyState = 4;
      node[index].connect(masterGain);

      // create the panner
      node[index].panner = ctx.createPanner();
      node[index].panner.panningModel = self._model || 'equalpower';
      node[index].panner.setPosition(self._pos3d[0], self._pos3d[1], self._pos3d[2]);
      node[index].panner.connect(node[index]);

      return node[index];
    },

    /**
     * Call/set custom events.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Function to call.
     * @return {Howl}
     */
    on: function(event, fn) {
      var self = this,
        events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(fn);
      } else {
        for (var i=0; i<events.length; i++) {
          if (fn) {
            events[i].call(self, fn);
          } else {
            events[i].call(self);
          }
        }
      }

      return self;
    },

    /**
     * Remove a custom event.
     * @param  {String}   event Event type.
     * @param  {Function} fn    Listener to remove.
     * @return {Howl}
     */
    off: function(event, fn) {
      var self = this,
        events = self['_on' + event],
        fnString = fn ? fn.toString() : null;

      if (fnString) {
        // loop through functions in the event for comparison
        for (var i=0; i<events.length; i++) {
          if (fnString === events[i].toString()) {
            events.splice(i, 1);
            break;
          }
        }
      } else {
        self['_on' + event] = [];
      }

      return self;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all play instances attached to this sound.
     */
    unload: function() {
      var self = this;

      // stop playing any active nodes
      var nodes = self._audioNode;
      for (var i=0; i<self._audioNode.length; i++) {
        // stop the sound if it is currently playing
        if (!nodes[i].paused) {
          self.stop(nodes[i].id);
          self.on('end', nodes[i].id);
        }

        if (!self._webAudio) {
          // remove the source if using HTML5 Audio
          nodes[i].src = '';
        } else {
          // disconnect the output from the master gain
          nodes[i].disconnect(0);
        }
      }

      // make sure all timeouts are cleared
      for (i=0; i<self._onendTimer.length; i++) {
        clearTimeout(self._onendTimer[i].timer);
      }

      // remove the reference in the global Howler object
      var index = Howler._howls.indexOf(self);
      if (index !== null && index >= 0) {
        Howler._howls.splice(index, 1);
      }

      // delete this sound from the cache
      delete cache[self._src];
      self = null;
    }

  };

  // only define these functions when using WebAudio
  if (usingWebAudio) {

    /**
     * Buffer a sound from URL (or from cache) and decode to audio source (Web Audio API).
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var loadBuffer = function(obj, url) {
      // check if the buffer has already been cached
      if (url in cache) {
        // set the duration from the cache
        obj._duration = cache[url].duration;

        // load the sound into this object
        loadSound(obj);
        return;
      }
      
      if (/^data:[^;]+;base64,/.test(url)) {
        // Decode base64 data-URIs because some browsers cannot load data-URIs with XMLHttpRequest.
        var data = atob(url.split(',')[1]);
        var dataView = new Uint8Array(data.length);
        for (var i=0; i<data.length; ++i) {
          dataView[i] = data.charCodeAt(i);
        }
        
        decodeAudioData(dataView.buffer, obj, url);
      } else {
        // load the buffer from the URL
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function() {
          decodeAudioData(xhr.response, obj, url);
        };
        xhr.onerror = function() {
          // if there is an error, switch the sound to HTML Audio
          if (obj._webAudio) {
            obj._buffer = true;
            obj._webAudio = false;
            obj._audioNode = [];
            delete obj._gainNode;
            delete cache[url];
            obj.load();
          }
        };
        try {
          xhr.send();
        } catch (e) {
          xhr.onerror();
        }
      }
    };

    /**
     * Decode audio data from an array buffer.
     * @param  {ArrayBuffer} arraybuffer The audio data.
     * @param  {Object} obj The Howl object for the sound to load.
     * @param  {String} url The path to the sound file.
     */
    var decodeAudioData = function(arraybuffer, obj, url) {
      // decode the buffer into an audio source
      ctx.decodeAudioData(
        arraybuffer,
        function(buffer) {
          if (buffer) {
            cache[url] = buffer;
            loadSound(obj, buffer);
          }
        },
        function(err) {
          obj.on('loaderror');
        }
      );
    };

    /**
     * Finishes loading the Web Audio API sound and fires the loaded event
     * @param  {Object}  obj    The Howl object for the sound to load.
     * @param  {Objecct} buffer The decoded buffer sound source.
     */
    var loadSound = function(obj, buffer) {
      // set the duration
      obj._duration = (buffer) ? buffer.duration : obj._duration;

      // setup a sprite if none is defined
      if (Object.getOwnPropertyNames(obj._sprite).length === 0) {
        obj._sprite = {_default: [0, obj._duration * 1000]};
      }

      // fire the loaded event
      if (!obj._loaded) {
        obj._loaded = true;
        obj.on('load');
      }

      if (obj._autoplay) {
        obj.play();
      }
    };

    /**
     * Load the sound back into the buffer source.
     * @param  {Object} obj   The sound to load.
     * @param  {Array}  loop  Loop boolean, pos, and duration.
     * @param  {String} id    (optional) The play instance ID.
     */
    var refreshBuffer = function(obj, loop, id) {
      // determine which node to connect to
      var node = obj._nodeById(id);

      // setup the buffer source for playback
      node.bufferSource = ctx.createBufferSource();
      node.bufferSource.buffer = cache[obj._src];
      node.bufferSource.connect(node.panner);
      node.bufferSource.loop = loop[0];
      if (loop[0]) {
        node.bufferSource.loopStart = loop[1];
        node.bufferSource.loopEnd = loop[1] + loop[2];
      }
      node.bufferSource.playbackRate.value = obj._rate;
    };

  }

  /**
   * Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
   */
  if (typeof define === 'function' && define.amd) {
    define(function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  /**
   * Add support for CommonJS libraries such as browserify.
   */
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // define globally in case AMD is not available or available but not used

  if (typeof window !== 'undefined') {
    window.Howler = Howler;
    window.Howl = Howl;
  }

})();

},{}],"/Users/Cjaure/game/node_modules/kb-controls/index.js":[function(require,module,exports){
var ever = require('ever')
  , vkey = require('vkey')
  , max = Math.max

module.exports = function(el, bindings, state) {
  var root = null
  if(bindings === undefined || !el.ownerDocument) {
    state = bindings
    bindings = el
    el = this.document.body
    try {
      root = window.top.document.body
    } catch(e){}
  }

  var ee = ever(el)
    , re = root ? ever(root) : ee
    , measured = {}
    , enabled = true

  state = state || {}

  state.bindings = bindings

  // always initialize the state.
  for(var key in bindings) {
    if(bindings[key] === 'enabled' ||
       bindings[key] === 'enable' ||
       bindings[key] === 'disable' ||
       bindings[key] === 'destroy' ||
       bindings[key] === 'bindings') {
      throw new Error(bindings[key]+' is reserved')
    }
    state[bindings[key]] = 0
    measured[key] = 1
  }

  re.on('keyup', wrapped(onoff(kb, false)))
  re.on('keydown', wrapped(onoff(kb, true)))
  ee.on('mouseup', wrapped(onoff(mouse, false)))
  ee.on('mousedown', wrapped(onoff(mouse, true)))

  state.enabled = function() {
    return enabled
  }

  state.enable = enable_disable(true)
  state.disable = enable_disable(false)
  state.destroy = function() {
    re.removeAllListeners()
    ee.removeAllListeners()
  }
  return state

  function clear() {
    // always initialize the state.
    for(var key in bindings) {
      state[bindings[key]] = 0
      measured[key] = 1
    }
  }

  function enable_disable(on_or_off) {
    return function() {
      clear()
      enabled = on_or_off
      return this
    }
  }

  function wrapped(fn) {
    return function(ev) {
      if(enabled) {
        fn(ev)
      } else {
        return
      }
    }
  }

  function onoff(find, on_or_off) {
    return function(ev) {
      var key = find(ev)
        , binding = bindings[key]

      if(binding) {
        state[binding] += on_or_off ? max(measured[key]--, 0) : -(measured[key] = 1)

        if(!on_or_off && state[binding] < 0) {
          state[binding] = 0
        }
      }
    }
  }

  function mouse(ev) {
    return '<mouse '+ev.which+'>'
  }

  function kb(ev) {
    return vkey[ev.keyCode] || ev.char
  }
}

},{"ever":"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/index.js","vkey":"/Users/Cjaure/game/node_modules/kb-controls/node_modules/vkey/index.js"}],"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/index.js":[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;

module.exports = function (elem) {
    return new Ever(elem);
};

function Ever (elem) {
    this.element = elem;
}

Ever.prototype = new EventEmitter;

Ever.prototype.on = function (name, cb, useCapture) {
    if (!this._events) this._events = {};
    if (!this._events[name]) this._events[name] = [];
    this._events[name].push(cb);
    this.element.addEventListener(name, cb, useCapture || false);

    return this;
};
Ever.prototype.addListener = Ever.prototype.on;

Ever.prototype.removeListener = function (type, listener, useCapture) {
    if (!this._events) this._events = {};
    this.element.removeEventListener(type, listener, useCapture || false);
    
    var xs = this.listeners(type);
    var ix = xs.indexOf(listener);
    if (ix >= 0) xs.splice(ix, 1);

    return this;
};

Ever.prototype.removeAllListeners = function (type) {
    var self = this;
    function removeAll (t) {
        var xs = self.listeners(t);
        for (var i = 0; i < xs.length; i++) {
            self.removeListener(t, xs[i]);
        }
    }
    
    if (type) {
        removeAll(type)
    }
    else if (self._events) {
        for (var key in self._events) {
            if (key) removeAll(key);
        }
    }
    return EventEmitter.prototype.removeAllListeners.apply(self, arguments);
}

var initSignatures = require('./init.json');

Ever.prototype.emit = function (name, ev) {
    if (typeof name === 'object') {
        ev = name;
        name = ev.type;
    }
    
    if (!isEvent(ev)) {
        var type = Ever.typeOf(name);
        
        var opts = ev || {};
        if (opts.type === undefined) opts.type = name;
        
        ev = document.createEvent(type + 's');
        var init = typeof ev['init' + type] === 'function'
            ? 'init' + type : 'initEvent'
        ;
        
        var sig = initSignatures[init];
        var used = {};
        var args = [];
        
        for (var i = 0; i < sig.length; i++) {
            var key = sig[i];
            args.push(opts[key]);
            used[key] = true;
        }
        ev[init].apply(ev, args);
        
        // attach remaining unused options to the object
        for (var key in opts) {
            if (!used[key]) ev[key] = opts[key];
        }
    }
    return this.element.dispatchEvent(ev);
};

function isEvent (ev) {
    var s = Object.prototype.toString.call(ev);
    return /\[object \S+Event\]/.test(s);
}

Ever.types = require('./types.json');
Ever.typeOf = (function () {
    var types = {};
    for (var key in Ever.types) {
        var ts = Ever.types[key];
        for (var i = 0; i < ts.length; i++) {
            types[ts[i]] = key;
        }
    }
    
    return function (name) {
        return types[name] || 'Event';
    };
})();;

},{"./init.json":"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/init.json","./types.json":"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/types.json","events":"/Users/Cjaure/game/node_modules/watchify/node_modules/browserify/node_modules/events/events.js"}],"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/init.json":[function(require,module,exports){
module.exports={
  "initEvent" : [
    "type",
    "canBubble", 
    "cancelable"
  ],
  "initUIEvent" : [
    "type",
    "canBubble", 
    "cancelable", 
    "view", 
    "detail"
  ],
  "initMouseEvent" : [
    "type",
    "canBubble", 
    "cancelable", 
    "view", 
    "detail", 
    "screenX", 
    "screenY", 
    "clientX", 
    "clientY", 
    "ctrlKey", 
    "altKey", 
    "shiftKey", 
    "metaKey", 
    "button",
    "relatedTarget"
  ],
  "initMutationEvent" : [
    "type",
    "canBubble", 
    "cancelable", 
    "relatedNode", 
    "prevValue", 
    "newValue", 
    "attrName", 
    "attrChange"
  ]
}

},{}],"/Users/Cjaure/game/node_modules/kb-controls/node_modules/ever/types.json":[function(require,module,exports){
module.exports={
  "MouseEvent" : [
    "click",
    "mousedown",
    "mouseup",
    "mouseover",
    "mousemove",
    "mouseout"
  ],
  "KeyBoardEvent" : [
    "keydown",
    "keyup",
    "keypress"
  ],
  "MutationEvent" : [
    "DOMSubtreeModified",
    "DOMNodeInserted",
    "DOMNodeRemoved",
    "DOMNodeRemovedFromDocument",
    "DOMNodeInsertedIntoDocument",
    "DOMAttrModified",
    "DOMCharacterDataModified"
  ],
  "HTMLEvent" : [
    "load",
    "unload",
    "abort",
    "error",
    "select",
    "change",
    "submit",
    "reset",
    "focus",
    "blur",
    "resize",
    "scroll"
  ],
  "UIEvent" : [
    "DOMFocusIn",
    "DOMFocusOut",
    "DOMActivate"
  ]
}

},{}],"/Users/Cjaure/game/node_modules/kb-controls/node_modules/vkey/index.js":[function(require,module,exports){
var ua = typeof window !== 'undefined' ? window.navigator.userAgent : ''
  , isOSX = /OS X/.test(ua)
  , isOpera = /Opera/.test(ua)
  , maybeFirefox = !/like Gecko/.test(ua) && !isOpera

var i, output = module.exports = {
  0:  isOSX ? '<menu>' : '<UNK>'
, 1:  '<mouse 1>'
, 2:  '<mouse 2>'
, 3:  '<break>'
, 4:  '<mouse 3>'
, 5:  '<mouse 4>'
, 6:  '<mouse 5>'
, 8:  '<backspace>'
, 9:  '<tab>'
, 12: '<clear>'
, 13: '<enter>'
, 16: '<shift>'
, 17: '<control>'
, 18: '<alt>'
, 19: '<pause>'
, 20: '<caps-lock>'
, 21: '<ime-hangul>'
, 23: '<ime-junja>'
, 24: '<ime-final>'
, 25: '<ime-kanji>'
, 27: '<escape>'
, 28: '<ime-convert>'
, 29: '<ime-nonconvert>'
, 30: '<ime-accept>'
, 31: '<ime-mode-change>'
, 27: '<escape>'
, 32: '<space>'
, 33: '<page-up>'
, 34: '<page-down>'
, 35: '<end>'
, 36: '<home>'
, 37: '<left>'
, 38: '<up>'
, 39: '<right>'
, 40: '<down>'
, 41: '<select>'
, 42: '<print>'
, 43: '<execute>'
, 44: '<snapshot>'
, 45: '<insert>'
, 46: '<delete>'
, 47: '<help>'
, 91: '<meta>'  // meta-left -- no one handles left and right properly, so we coerce into one.
, 92: '<meta>'  // meta-right
, 93: isOSX ? '<meta>' : '<menu>'      // chrome,opera,safari all report this for meta-right (osx mbp).
, 95: '<sleep>'
, 106: '<num-*>'
, 107: '<num-+>'
, 108: '<num-enter>'
, 109: '<num-->'
, 110: '<num-.>'
, 111: '<num-/>'
, 144: '<num-lock>'
, 145: '<scroll-lock>'
, 160: '<shift-left>'
, 161: '<shift-right>'
, 162: '<control-left>'
, 163: '<control-right>'
, 164: '<alt-left>'
, 165: '<alt-right>'
, 166: '<browser-back>'
, 167: '<browser-forward>'
, 168: '<browser-refresh>'
, 169: '<browser-stop>'
, 170: '<browser-search>'
, 171: '<browser-favorites>'
, 172: '<browser-home>'

  // ff/osx reports '<volume-mute>' for '-'
, 173: isOSX && maybeFirefox ? '-' : '<volume-mute>'
, 174: '<volume-down>'
, 175: '<volume-up>'
, 176: '<next-track>'
, 177: '<prev-track>'
, 178: '<stop>'
, 179: '<play-pause>'
, 180: '<launch-mail>'
, 181: '<launch-media-select>'
, 182: '<launch-app 1>'
, 183: '<launch-app 2>'
, 186: ';'
, 187: '='
, 188: ','
, 189: '-'
, 190: '.'
, 191: '/'
, 192: '`'
, 219: '['
, 220: '\\'
, 221: ']'
, 222: "'"
, 223: '<meta>'
, 224: '<meta>'       // firefox reports meta here.
, 226: '<alt-gr>'
, 229: '<ime-process>'
, 231: isOpera ? '`' : '<unicode>'
, 246: '<attention>'
, 247: '<crsel>'
, 248: '<exsel>'
, 249: '<erase-eof>'
, 250: '<play>'
, 251: '<zoom>'
, 252: '<no-name>'
, 253: '<pa-1>'
, 254: '<clear>'
}

for(i = 58; i < 65; ++i) {
  output[i] = String.fromCharCode(i)
}

// 0-9
for(i = 48; i < 58; ++i) {
  output[i] = (i - 48)+''
}

// A-Z
for(i = 65; i < 91; ++i) {
  output[i] = String.fromCharCode(i)
}

// num0-9
for(i = 96; i < 106; ++i) {
  output[i] = '<num-'+(i - 96)+'>'
}

// F1-F24
for(i = 112; i < 136; ++i) {
  output[i] = 'F'+(i-111)
}

},{}],"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js":[function(require,module,exports){
/**
 * @license
 * pixi.js - v2.2.0
 * Copyright (c) 2012-2014, Mat Groves
 * http://goodboydigital.com/
 *
 * Compiled: 2014-12-12
 *
 * pixi.js is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license.php
 */
(function(){var a=this,b=b||{};b.WEBGL_RENDERER=0,b.CANVAS_RENDERER=1,b.VERSION="v2.2.0",b.blendModes={NORMAL:0,ADD:1,MULTIPLY:2,SCREEN:3,OVERLAY:4,DARKEN:5,LIGHTEN:6,COLOR_DODGE:7,COLOR_BURN:8,HARD_LIGHT:9,SOFT_LIGHT:10,DIFFERENCE:11,EXCLUSION:12,HUE:13,SATURATION:14,COLOR:15,LUMINOSITY:16},b.scaleModes={DEFAULT:0,LINEAR:0,NEAREST:1},b._UID=0,"undefined"!=typeof Float32Array?(b.Float32Array=Float32Array,b.Uint16Array=Uint16Array,b.Uint32Array=Uint32Array,b.ArrayBuffer=ArrayBuffer):(b.Float32Array=Array,b.Uint16Array=Array),b.INTERACTION_FREQUENCY=30,b.AUTO_PREVENT_DEFAULT=!0,b.PI_2=2*Math.PI,b.RAD_TO_DEG=180/Math.PI,b.DEG_TO_RAD=Math.PI/180,b.RETINA_PREFIX="@2x",b.dontSayHello=!1,b.defaultRenderOptions={view:null,transparent:!1,antialias:!1,preserveDrawingBuffer:!1,resolution:1,clearBeforeRender:!0,autoResize:!1},b.sayHello=function(a){if(!b.dontSayHello){if(navigator.userAgent.toLowerCase().indexOf("chrome")>-1){var c=["%c %c %c Pixi.js "+b.VERSION+" - "+a+"  %c  %c  http://www.pixijs.com/  %c %c ♥%c♥%c♥ ","background: #ff66a5","background: #ff66a5","color: #ff66a5; background: #030307;","background: #ff66a5","background: #ffc3dc","background: #ff66a5","color: #ff2424; background: #fff","color: #ff2424; background: #fff","color: #ff2424; background: #fff"];console.log.apply(console,c)}else window.console&&console.log("Pixi.js "+b.VERSION+" - http://www.pixijs.com/");b.dontSayHello=!0}},b.Point=function(a,b){this.x=a||0,this.y=b||0},b.Point.prototype.clone=function(){return new b.Point(this.x,this.y)},b.Point.prototype.set=function(a,b){this.x=a||0,this.y=b||(0!==b?this.x:0)},b.Point.prototype.constructor=b.Point,b.Rectangle=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Rectangle.prototype.clone=function(){return new b.Rectangle(this.x,this.y,this.width,this.height)},b.Rectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.Rectangle.prototype.constructor=b.Rectangle,b.EmptyRectangle=new b.Rectangle(0,0,0,0),b.Polygon=function(a){if(a instanceof Array||(a=Array.prototype.slice.call(arguments)),a[0]instanceof b.Point){for(var c=[],d=0,e=a.length;e>d;d++)c.push(a[d].x,a[d].y);a=c}this.closed=!0,this.points=a},b.Polygon.prototype.clone=function(){var a=this.points.slice();return new b.Polygon(a)},b.Polygon.prototype.contains=function(a,b){for(var c=!1,d=this.points.length/2,e=0,f=d-1;d>e;f=e++){var g=this.points[2*e],h=this.points[2*e+1],i=this.points[2*f],j=this.points[2*f+1],k=h>b!=j>b&&(i-g)*(b-h)/(j-h)+g>a;k&&(c=!c)}return c},b.Polygon.prototype.constructor=b.Polygon,b.Circle=function(a,b,c){this.x=a||0,this.y=b||0,this.radius=c||0},b.Circle.prototype.clone=function(){return new b.Circle(this.x,this.y,this.radius)},b.Circle.prototype.contains=function(a,b){if(this.radius<=0)return!1;var c=this.x-a,d=this.y-b,e=this.radius*this.radius;return c*=c,d*=d,e>=c+d},b.Circle.prototype.getBounds=function(){return new b.Rectangle(this.x-this.radius,this.y-this.radius,2*this.radius,2*this.radius)},b.Circle.prototype.constructor=b.Circle,b.Ellipse=function(a,b,c,d){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0},b.Ellipse.prototype.clone=function(){return new b.Ellipse(this.x,this.y,this.width,this.height)},b.Ellipse.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=(a-this.x)/this.width,d=(b-this.y)/this.height;return c*=c,d*=d,1>=c+d},b.Ellipse.prototype.getBounds=function(){return new b.Rectangle(this.x-this.width,this.y-this.height,this.width,this.height)},b.Ellipse.prototype.constructor=b.Ellipse,b.RoundedRectangle=function(a,b,c,d,e){this.x=a||0,this.y=b||0,this.width=c||0,this.height=d||0,this.radius=e||20},b.RoundedRectangle.prototype.clone=function(){return new b.RoundedRectangle(this.x,this.y,this.width,this.height,this.radius)},b.RoundedRectangle.prototype.contains=function(a,b){if(this.width<=0||this.height<=0)return!1;var c=this.x;if(a>=c&&a<=c+this.width){var d=this.y;if(b>=d&&b<=d+this.height)return!0}return!1},b.RoundedRectangle.prototype.constructor=b.RoundedRectangle,b.Matrix=function(){this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0},b.Matrix.prototype.fromArray=function(a){this.a=a[0],this.b=a[1],this.c=a[3],this.d=a[4],this.tx=a[2],this.ty=a[5]},b.Matrix.prototype.toArray=function(a){this.array||(this.array=new b.Float32Array(9));var c=this.array;return a?(c[0]=this.a,c[1]=this.b,c[2]=0,c[3]=this.c,c[4]=this.d,c[5]=0,c[6]=this.tx,c[7]=this.ty,c[8]=1):(c[0]=this.a,c[1]=this.c,c[2]=this.tx,c[3]=this.b,c[4]=this.d,c[5]=this.ty,c[6]=0,c[7]=0,c[8]=1),c},b.Matrix.prototype.apply=function(a,c){return c=c||new b.Point,c.x=this.a*a.x+this.c*a.y+this.tx,c.y=this.b*a.x+this.d*a.y+this.ty,c},b.Matrix.prototype.applyInverse=function(a,c){c=c||new b.Point;var d=1/(this.a*this.d+this.c*-this.b);return c.x=this.d*d*a.x+-this.c*d*a.y+(this.ty*this.c-this.tx*this.d)*d,c.y=this.a*d*a.y+-this.b*d*a.x+(-this.ty*this.a+this.tx*this.b)*d,c},b.Matrix.prototype.translate=function(a,b){return this.tx+=a,this.ty+=b,this},b.Matrix.prototype.scale=function(a,b){return this.a*=a,this.d*=b,this.c*=a,this.b*=b,this.tx*=a,this.ty*=b,this},b.Matrix.prototype.rotate=function(a){var b=Math.cos(a),c=Math.sin(a),d=this.a,e=this.c,f=this.tx;return this.a=d*b-this.b*c,this.b=d*c+this.b*b,this.c=e*b-this.d*c,this.d=e*c+this.d*b,this.tx=f*b-this.ty*c,this.ty=f*c+this.ty*b,this},b.Matrix.prototype.append=function(a){var b=this.a,c=this.b,d=this.c,e=this.d;return this.a=a.a*b+a.b*d,this.b=a.a*c+a.b*e,this.c=a.c*b+a.d*d,this.d=a.c*c+a.d*e,this.tx=a.tx*b+a.ty*d+this.tx,this.ty=a.tx*c+a.ty*e+this.ty,this},b.Matrix.prototype.identity=function(){return this.a=1,this.b=0,this.c=0,this.d=1,this.tx=0,this.ty=0,this},b.identityMatrix=new b.Matrix,b.DisplayObject=function(){this.position=new b.Point,this.scale=new b.Point(1,1),this.pivot=new b.Point(0,0),this.rotation=0,this.alpha=1,this.visible=!0,this.hitArea=null,this.buttonMode=!1,this.renderable=!1,this.parent=null,this.stage=null,this.worldAlpha=1,this._interactive=!1,this.defaultCursor="pointer",this.worldTransform=new b.Matrix,this._sr=0,this._cr=1,this.filterArea=null,this._bounds=new b.Rectangle(0,0,1,1),this._currentBounds=null,this._mask=null,this._cacheAsBitmap=!1,this._cacheIsDirty=!1},b.DisplayObject.prototype.constructor=b.DisplayObject,Object.defineProperty(b.DisplayObject.prototype,"interactive",{get:function(){return this._interactive},set:function(a){this._interactive=a,this.stage&&(this.stage.dirty=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"worldVisible",{get:function(){var a=this;do{if(!a.visible)return!1;a=a.parent}while(a);return!0}}),Object.defineProperty(b.DisplayObject.prototype,"mask",{get:function(){return this._mask},set:function(a){this._mask&&(this._mask.isMask=!1),this._mask=a,this._mask&&(this._mask.isMask=!0)}}),Object.defineProperty(b.DisplayObject.prototype,"filters",{get:function(){return this._filters},set:function(a){if(a){for(var b=[],c=0;c<a.length;c++)for(var d=a[c].passes,e=0;e<d.length;e++)b.push(d[e]);this._filterBlock={target:this,filterPasses:b}}this._filters=a}}),Object.defineProperty(b.DisplayObject.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap!==a&&(a?this._generateCachedSprite():this._destroyCachedSprite(),this._cacheAsBitmap=a)}}),b.DisplayObject.prototype.updateTransform=function(){var a,c,d,e,f,g,h=this.parent.worldTransform,i=this.worldTransform;this.rotation%b.PI_2?(this.rotation!==this.rotationCache&&(this.rotationCache=this.rotation,this._sr=Math.sin(this.rotation),this._cr=Math.cos(this.rotation)),a=this._cr*this.scale.x,c=this._sr*this.scale.x,d=-this._sr*this.scale.y,e=this._cr*this.scale.y,f=this.position.x,g=this.position.y,(this.pivot.x||this.pivot.y)&&(f-=this.pivot.x*a+this.pivot.y*d,g-=this.pivot.x*c+this.pivot.y*e),i.a=a*h.a+c*h.c,i.b=a*h.b+c*h.d,i.c=d*h.a+e*h.c,i.d=d*h.b+e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty):(a=this.scale.x,e=this.scale.y,f=this.position.x-this.pivot.x*a,g=this.position.y-this.pivot.y*e,i.a=a*h.a,i.b=a*h.b,i.c=e*h.c,i.d=e*h.d,i.tx=f*h.a+g*h.c+h.tx,i.ty=f*h.b+g*h.d+h.ty),this.worldAlpha=this.alpha*this.parent.worldAlpha},b.DisplayObject.prototype.displayObjectUpdateTransform=b.DisplayObject.prototype.updateTransform,b.DisplayObject.prototype.getBounds=function(a){return a=a,b.EmptyRectangle},b.DisplayObject.prototype.getLocalBounds=function(){return this.getBounds(b.identityMatrix)},b.DisplayObject.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0)},b.DisplayObject.prototype.generateTexture=function(a,c,d){var e=this.getLocalBounds(),f=new b.RenderTexture(0|e.width,0|e.height,d,c,a);return b.DisplayObject._tempMatrix.tx=-e.x,b.DisplayObject._tempMatrix.ty=-e.y,f.render(this,b.DisplayObject._tempMatrix),f},b.DisplayObject.prototype.updateCache=function(){this._generateCachedSprite()},b.DisplayObject.prototype.toGlobal=function(a){return this.displayObjectUpdateTransform(),this.worldTransform.apply(a)},b.DisplayObject.prototype.toLocal=function(a,b){return b&&(a=b.toGlobal(a)),this.displayObjectUpdateTransform(),this.worldTransform.applyInverse(a)},b.DisplayObject.prototype._renderCachedSprite=function(a){this._cachedSprite.worldAlpha=this.worldAlpha,a.gl?b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a):b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a)},b.DisplayObject.prototype._generateCachedSprite=function(){this._cacheAsBitmap=!1;var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.texture.resize(0|a.width,0|a.height);else{var c=new b.RenderTexture(0|a.width,0|a.height);this._cachedSprite=new b.Sprite(c),this._cachedSprite.worldTransform=this.worldTransform}var d=this._filters;this._filters=null,this._cachedSprite.filters=d,b.DisplayObject._tempMatrix.tx=-a.x,b.DisplayObject._tempMatrix.ty=-a.y,this._cachedSprite.texture.render(this,b.DisplayObject._tempMatrix,!0),this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._filters=d,this._cacheAsBitmap=!0},b.DisplayObject.prototype._destroyCachedSprite=function(){this._cachedSprite&&(this._cachedSprite.texture.destroy(!0),this._cachedSprite=null)},b.DisplayObject.prototype._renderWebGL=function(a){a=a},b.DisplayObject.prototype._renderCanvas=function(a){a=a},b.DisplayObject._tempMatrix=new b.Matrix,Object.defineProperty(b.DisplayObject.prototype,"x",{get:function(){return this.position.x},set:function(a){this.position.x=a}}),Object.defineProperty(b.DisplayObject.prototype,"y",{get:function(){return this.position.y},set:function(a){this.position.y=a}}),b.DisplayObjectContainer=function(){b.DisplayObject.call(this),this.children=[]},b.DisplayObjectContainer.prototype=Object.create(b.DisplayObject.prototype),b.DisplayObjectContainer.prototype.constructor=b.DisplayObjectContainer,Object.defineProperty(b.DisplayObjectContainer.prototype,"width",{get:function(){return this.scale.x*this.getLocalBounds().width},set:function(a){var b=this.getLocalBounds().width;this.scale.x=0!==b?a/b:1,this._width=a}}),Object.defineProperty(b.DisplayObjectContainer.prototype,"height",{get:function(){return this.scale.y*this.getLocalBounds().height},set:function(a){var b=this.getLocalBounds().height;this.scale.y=0!==b?a/b:1,this._height=a}}),b.DisplayObjectContainer.prototype.addChild=function(a){return this.addChildAt(a,this.children.length)},b.DisplayObjectContainer.prototype.addChildAt=function(a,b){if(b>=0&&b<=this.children.length)return a.parent&&a.parent.removeChild(a),a.parent=this,this.children.splice(b,0,a),this.stage&&a.setStageReference(this.stage),a;throw new Error(a+"addChildAt: The index "+b+" supplied is out of bounds "+this.children.length)},b.DisplayObjectContainer.prototype.swapChildren=function(a,b){if(a!==b){var c=this.getChildIndex(a),d=this.getChildIndex(b);if(0>c||0>d)throw new Error("swapChildren: Both the supplied DisplayObjects must be a child of the caller.");this.children[c]=b,this.children[d]=a}},b.DisplayObjectContainer.prototype.getChildIndex=function(a){var b=this.children.indexOf(a);if(-1===b)throw new Error("The supplied DisplayObject must be a child of the caller");return b},b.DisplayObjectContainer.prototype.setChildIndex=function(a,b){if(0>b||b>=this.children.length)throw new Error("The supplied index is out of bounds");var c=this.getChildIndex(a);this.children.splice(c,1),this.children.splice(b,0,a)},b.DisplayObjectContainer.prototype.getChildAt=function(a){if(0>a||a>=this.children.length)throw new Error("getChildAt: Supplied index "+a+" does not exist in the child list, or the supplied DisplayObject must be a child of the caller");return this.children[a]},b.DisplayObjectContainer.prototype.removeChild=function(a){var b=this.children.indexOf(a);if(-1!==b)return this.removeChildAt(b)},b.DisplayObjectContainer.prototype.removeChildAt=function(a){var b=this.getChildAt(a);return this.stage&&b.removeStageReference(),b.parent=void 0,this.children.splice(a,1),b},b.DisplayObjectContainer.prototype.removeChildren=function(a,b){var c=a||0,d="number"==typeof b?b:this.children.length,e=d-c;if(e>0&&d>=e){for(var f=this.children.splice(c,e),g=0;g<f.length;g++){var h=f[g];this.stage&&h.removeStageReference(),h.parent=void 0}return f}if(0===e&&0===this.children.length)return[];throw new Error("removeChildren: Range Error, numeric values are outside the acceptable range")},b.DisplayObjectContainer.prototype.updateTransform=function(){if(this.visible&&(this.displayObjectUpdateTransform(),!this._cacheAsBitmap))for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform()},b.DisplayObjectContainer.prototype.displayObjectContainerUpdateTransform=b.DisplayObjectContainer.prototype.updateTransform,b.DisplayObjectContainer.prototype.getBounds=function(){if(0===this.children.length)return b.EmptyRectangle;for(var a,c,d,e=1/0,f=1/0,g=-1/0,h=-1/0,i=!1,j=0,k=this.children.length;k>j;j++){var l=this.children[j];l.visible&&(i=!0,a=this.children[j].getBounds(),e=e<a.x?e:a.x,f=f<a.y?f:a.y,c=a.width+a.x,d=a.height+a.y,g=g>c?g:c,h=h>d?h:d)}if(!i)return b.EmptyRectangle;var m=this._bounds;return m.x=e,m.y=f,m.width=g-e,m.height=h-f,m},b.DisplayObjectContainer.prototype.getLocalBounds=function(){var a=this.worldTransform;this.worldTransform=b.identityMatrix;for(var c=0,d=this.children.length;d>c;c++)this.children[c].updateTransform();var e=this.getBounds();return this.worldTransform=a,e},b.DisplayObjectContainer.prototype.setStageReference=function(a){this.stage=a,this._interactive&&(this.stage.dirty=!0);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d.setStageReference(a)}},b.DisplayObjectContainer.prototype.removeStageReference=function(){for(var a=0,b=this.children.length;b>a;a++){var c=this.children[a];c.removeStageReference()}this._interactive&&(this.stage.dirty=!0),this.stage=null},b.DisplayObjectContainer.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;var b,c;if(this._mask||this._filters){for(this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);a.spriteBatch.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),a.spriteBatch.start()}else for(b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.DisplayObjectContainer.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){if(this._cacheAsBitmap)return this._renderCachedSprite(a),void 0;this._mask&&a.maskManager.pushMask(this._mask,a);for(var b=0,c=this.children.length;c>b;b++){var d=this.children[b];d._renderCanvas(a)}this._mask&&a.maskManager.popMask(a)}},b.Sprite=function(a){b.DisplayObjectContainer.call(this),this.anchor=new b.Point,this.texture=a||b.Texture.emptyTexture,this._width=0,this._height=0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.shader=null,this.texture.baseTexture.hasLoaded?this.onTextureUpdate():this.texture.on("update",this.onTextureUpdate.bind(this)),this.renderable=!0},b.Sprite.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Sprite.prototype.constructor=b.Sprite,Object.defineProperty(b.Sprite.prototype,"width",{get:function(){return this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Sprite.prototype,"height",{get:function(){return this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Sprite.prototype.setTexture=function(a){this.texture=a,this.cachedTint=16777215},b.Sprite.prototype.onTextureUpdate=function(){this._width&&(this.scale.x=this._width/this.texture.frame.width),this._height&&(this.scale.y=this._height/this.texture.frame.height)},b.Sprite.prototype.getBounds=function(a){var b=this.texture.frame.width,c=this.texture.frame.height,d=b*(1-this.anchor.x),e=b*-this.anchor.x,f=c*(1-this.anchor.y),g=c*-this.anchor.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=-1/0,p=-1/0,q=1/0,r=1/0;if(0===j&&0===k)0>i&&(i*=-1),0>l&&(l*=-1),q=i*e+m,o=i*d+m,r=l*g+n,p=l*f+n;else{var s=i*e+k*g+m,t=l*g+j*e+n,u=i*d+k*g+m,v=l*g+j*d+n,w=i*d+k*f+m,x=l*f+j*d+n,y=i*e+k*f+m,z=l*f+j*e+n;q=q>s?s:q,q=q>u?u:q,q=q>w?w:q,q=q>y?y:q,r=r>t?t:r,r=r>v?v:r,r=r>x?x:r,r=r>z?z:r,o=s>o?s:o,o=u>o?u:o,o=w>o?w:o,o=y>o?y:o,p=t>p?t:p,p=v>p?v:p,p=x>p?x:p,p=z>p?z:p}var A=this._bounds;return A.x=q,A.width=o-q,A.y=r,A.height=p-r,this._currentBounds=A,A},b.Sprite.prototype._renderWebGL=function(a){if(this.visible&&!(this.alpha<=0)){var b,c;if(this._mask||this._filters){var d=a.spriteBatch;for(this._filters&&(d.flush(),a.filterManager.pushFilter(this._filterBlock)),this._mask&&(d.stop(),a.maskManager.pushMask(this.mask,a),d.start()),d.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a);d.stop(),this._mask&&a.maskManager.popMask(this._mask,a),this._filters&&a.filterManager.popFilter(),d.start()}else for(a.spriteBatch.render(this),b=0,c=this.children.length;c>b;b++)this.children[b]._renderWebGL(a)}},b.Sprite.prototype._renderCanvas=function(a){if(!(this.visible===!1||0===this.alpha||this.texture.crop.width<=0||this.texture.crop.height<=0)){if(this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,a.context.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a),this.texture.valid){var c=this.texture.baseTexture.resolution/a.resolution;a.context.globalAlpha=this.worldAlpha,a.smoothProperty&&a.scaleMode!==this.texture.baseTexture.scaleMode&&(a.scaleMode=this.texture.baseTexture.scaleMode,a.context[a.smoothProperty]=a.scaleMode===b.scaleModes.LINEAR);var d=this.texture.trim?this.texture.trim.x-this.anchor.x*this.texture.trim.width:this.anchor.x*-this.texture.frame.width,e=this.texture.trim?this.texture.trim.y-this.anchor.y*this.texture.trim.height:this.anchor.y*-this.texture.frame.height;a.roundPixels?(a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution|0,this.worldTransform.ty*a.resolution|0),d=0|d,e=0|e):a.context.setTransform(this.worldTransform.a,this.worldTransform.b,this.worldTransform.c,this.worldTransform.d,this.worldTransform.tx*a.resolution,this.worldTransform.ty*a.resolution),16777215!==this.tint?(this.cachedTint!==this.tint&&(this.cachedTint=this.tint,this.tintedTexture=b.CanvasTinter.getTintedTexture(this,this.tint)),a.context.drawImage(this.tintedTexture,0,0,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)):a.context.drawImage(this.texture.baseTexture.source,this.texture.crop.x,this.texture.crop.y,this.texture.crop.width,this.texture.crop.height,d/c,e/c,this.texture.crop.width/c,this.texture.crop.height/c)}for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Sprite.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache'+this);return new b.Sprite(c)},b.Sprite.fromImage=function(a,c,d){var e=b.Texture.fromImage(a,c,d);return new b.Sprite(e)},b.SpriteBatch=function(a){b.DisplayObjectContainer.call(this),this.textureThing=a,this.ready=!1},b.SpriteBatch.prototype=Object.create(b.DisplayObjectContainer.prototype),b.SpriteBatch.prototype.constructor=b.SpriteBatch,b.SpriteBatch.prototype.initWebGL=function(a){this.fastSpriteBatch=new b.WebGLFastSpriteBatch(a),this.ready=!0},b.SpriteBatch.prototype.updateTransform=function(){this.displayObjectUpdateTransform()},b.SpriteBatch.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||!this.children.length||(this.ready||this.initWebGL(a.gl),a.spriteBatch.stop(),a.shaderManager.setShader(a.shaderManager.fastShader),this.fastSpriteBatch.begin(this,a),this.fastSpriteBatch.render(this),a.spriteBatch.start())},b.SpriteBatch.prototype._renderCanvas=function(a){if(this.visible&&!(this.alpha<=0)&&this.children.length){var b=a.context;b.globalAlpha=this.worldAlpha,this.displayObjectUpdateTransform();for(var c=this.worldTransform,d=!0,e=0;e<this.children.length;e++){var f=this.children[e];if(f.visible){var g=f.texture,h=g.frame;if(b.globalAlpha=this.worldAlpha*f.alpha,f.rotation%(2*Math.PI)===0)d&&(b.setTransform(c.a,c.b,c.c,c.d,c.tx,c.ty),d=!1),b.drawImage(g.baseTexture.source,h.x,h.y,h.width,h.height,f.anchor.x*-h.width*f.scale.x+f.position.x+.5|0,f.anchor.y*-h.height*f.scale.y+f.position.y+.5|0,h.width*f.scale.x,h.height*f.scale.y);else{d||(d=!0),f.displayObjectUpdateTransform();var i=f.worldTransform;a.roundPixels?b.setTransform(i.a,i.b,i.c,i.d,0|i.tx,0|i.ty):b.setTransform(i.a,i.b,i.c,i.d,i.tx,i.ty),b.drawImage(g.baseTexture.source,h.x,h.y,h.width,h.height,f.anchor.x*-h.width+.5|0,f.anchor.y*-h.height+.5|0,h.width,h.height)}}}}},b.MovieClip=function(a){b.Sprite.call(this,a[0]),this.textures=a,this.animationSpeed=1,this.loop=!0,this.onComplete=null,this.currentFrame=0,this.playing=!1},b.MovieClip.prototype=Object.create(b.Sprite.prototype),b.MovieClip.prototype.constructor=b.MovieClip,Object.defineProperty(b.MovieClip.prototype,"totalFrames",{get:function(){return this.textures.length}}),b.MovieClip.prototype.stop=function(){this.playing=!1},b.MovieClip.prototype.play=function(){this.playing=!0},b.MovieClip.prototype.gotoAndStop=function(a){this.playing=!1,this.currentFrame=a;var b=this.currentFrame+.5|0;this.setTexture(this.textures[b%this.textures.length])},b.MovieClip.prototype.gotoAndPlay=function(a){this.currentFrame=a,this.playing=!0},b.MovieClip.prototype.updateTransform=function(){if(this.displayObjectContainerUpdateTransform(),this.playing){this.currentFrame+=this.animationSpeed;var a=this.currentFrame+.5|0;this.currentFrame=this.currentFrame%this.textures.length,this.loop||a<this.textures.length?this.setTexture(this.textures[a%this.textures.length]):a>=this.textures.length&&(this.gotoAndStop(this.textures.length-1),this.onComplete&&this.onComplete())}},b.MovieClip.fromFrames=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromFrame(a[d]));return new b.MovieClip(c)},b.MovieClip.fromImages=function(a){for(var c=[],d=0;d<a.length;d++)c.push(new b.Texture.fromImage(a[d]));return new b.MovieClip(c)},b.FilterBlock=function(){this.visible=!0,this.renderable=!0},b.FilterBlock.prototype.constructor=b.FilterBlock,b.Text=function(a,c){this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.resolution=1,b.Sprite.call(this,b.Texture.fromCanvas(this.canvas)),this.setText(a),this.setStyle(c)},b.Text.prototype=Object.create(b.Sprite.prototype),b.Text.prototype.constructor=b.Text,Object.defineProperty(b.Text.prototype,"width",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.x*this.texture.frame.width},set:function(a){this.scale.x=a/this.texture.frame.width,this._width=a}}),Object.defineProperty(b.Text.prototype,"height",{get:function(){return this.dirty&&(this.updateText(),this.dirty=!1),this.scale.y*this.texture.frame.height},set:function(a){this.scale.y=a/this.texture.frame.height,this._height=a}}),b.Text.prototype.setStyle=function(a){a=a||{},a.font=a.font||"bold 20pt Arial",a.fill=a.fill||"black",a.align=a.align||"left",a.stroke=a.stroke||"black",a.strokeThickness=a.strokeThickness||0,a.wordWrap=a.wordWrap||!1,a.wordWrapWidth=a.wordWrapWidth||100,a.dropShadow=a.dropShadow||!1,a.dropShadowAngle=a.dropShadowAngle||Math.PI/6,a.dropShadowDistance=a.dropShadowDistance||4,a.dropShadowColor=a.dropShadowColor||"black",this.style=a,this.dirty=!0},b.Text.prototype.setText=function(a){this.text=a.toString()||" ",this.dirty=!0},b.Text.prototype.updateText=function(){this.texture.baseTexture.resolution=this.resolution,this.context.font=this.style.font;var a=this.text;this.style.wordWrap&&(a=this.wordWrap(this.text));for(var b=a.split(/(?:\r\n|\r|\n)/),c=[],d=0,e=this.determineFontProperties(this.style.font),f=0;f<b.length;f++){var g=this.context.measureText(b[f]).width;c[f]=g,d=Math.max(d,g)}var h=d+this.style.strokeThickness;this.style.dropShadow&&(h+=this.style.dropShadowDistance),this.canvas.width=(h+this.context.lineWidth)*this.resolution;var i=e.fontSize+this.style.strokeThickness,j=i*b.length;this.style.dropShadow&&(j+=this.style.dropShadowDistance),this.canvas.height=j*this.resolution,this.context.scale(this.resolution,this.resolution),navigator.isCocoonJS&&this.context.clearRect(0,0,this.canvas.width,this.canvas.height),this.context.font=this.style.font,this.context.strokeStyle=this.style.stroke,this.context.lineWidth=this.style.strokeThickness,this.context.textBaseline="alphabetic";var k,l;if(this.style.dropShadow){this.context.fillStyle=this.style.dropShadowColor;var m=Math.sin(this.style.dropShadowAngle)*this.style.dropShadowDistance,n=Math.cos(this.style.dropShadowAngle)*this.style.dropShadowDistance;for(f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.fill&&this.context.fillText(b[f],k+m,l+n)}for(this.context.fillStyle=this.style.fill,f=0;f<b.length;f++)k=this.style.strokeThickness/2,l=this.style.strokeThickness/2+f*i+e.ascent,"right"===this.style.align?k+=d-c[f]:"center"===this.style.align&&(k+=(d-c[f])/2),this.style.stroke&&this.style.strokeThickness&&this.context.strokeText(b[f],k,l),this.style.fill&&this.context.fillText(b[f],k,l);this.updateTexture()},b.Text.prototype.updateTexture=function(){this.texture.baseTexture.width=this.canvas.width,this.texture.baseTexture.height=this.canvas.height,this.texture.crop.width=this.texture.frame.width=this.canvas.width,this.texture.crop.height=this.texture.frame.height=this.canvas.height,this._width=this.canvas.width,this._height=this.canvas.height,this.texture.baseTexture.dirty()},b.Text.prototype._renderWebGL=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderWebGL.call(this,a)},b.Text.prototype._renderCanvas=function(a){this.dirty&&(this.resolution=a.resolution,this.updateText(),this.dirty=!1),b.Sprite.prototype._renderCanvas.call(this,a)},b.Text.prototype.determineFontProperties=function(a){var c=b.Text.fontPropertiesCache[a];if(!c){c={};var d=b.Text.fontPropertiesCanvas,e=b.Text.fontPropertiesContext;e.font=a;var f=Math.ceil(e.measureText("|Mq").width),g=Math.ceil(e.measureText("M").width),h=2*g;g=1.4*g|0,d.width=f,d.height=h,e.fillStyle="#f00",e.fillRect(0,0,f,h),e.font=a,e.textBaseline="alphabetic",e.fillStyle="#000",e.fillText("|MÉq",0,g);var i,j,k=e.getImageData(0,0,f,h).data,l=k.length,m=4*f,n=0,o=!1;for(i=0;g>i;i++){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n+=m}for(c.ascent=g-i,n=l-m,o=!1,i=h;i>g;i--){for(j=0;m>j;j+=4)if(255!==k[n+j]){o=!0;break}if(o)break;n-=m}c.descent=i-g,c.descent+=6,c.fontSize=c.ascent+c.descent,b.Text.fontPropertiesCache[a]=c}return c},b.Text.prototype.wordWrap=function(a){for(var b="",c=a.split("\n"),d=0;d<c.length;d++){for(var e=this.style.wordWrapWidth,f=c[d].split(" "),g=0;g<f.length;g++){var h=this.context.measureText(f[g]).width,i=h+this.context.measureText(" ").width;0===g||i>e?(g>0&&(b+="\n"),b+=f[g],e=this.style.wordWrapWidth-h):(e-=i,b+=" "+f[g])}d<c.length-1&&(b+="\n")}return b},b.Text.prototype.getBounds=function(a){return this.dirty&&(this.updateText(),this.dirty=!1),b.Sprite.prototype.getBounds.call(this,a)},b.Text.prototype.destroy=function(a){this.context=null,this.canvas=null,this.texture.destroy(void 0===a?!0:a)},b.Text.fontPropertiesCache={},b.Text.fontPropertiesCanvas=document.createElement("canvas"),b.Text.fontPropertiesContext=b.Text.fontPropertiesCanvas.getContext("2d"),b.BitmapText=function(a,c){b.DisplayObjectContainer.call(this),this.textWidth=0,this.textHeight=0,this._pool=[],this.setText(a),this.setStyle(c),this.updateText(),this.dirty=!1},b.BitmapText.prototype=Object.create(b.DisplayObjectContainer.prototype),b.BitmapText.prototype.constructor=b.BitmapText,b.BitmapText.prototype.setText=function(a){this.text=a||" ",this.dirty=!0},b.BitmapText.prototype.setStyle=function(a){a=a||{},a.align=a.align||"left",this.style=a;var c=a.font.split(" ");this.fontName=c[c.length-1],this.fontSize=c.length>=2?parseInt(c[c.length-2],10):b.BitmapText.fonts[this.fontName].size,this.dirty=!0,this.tint=a.tint},b.BitmapText.prototype.updateText=function(){for(var a=b.BitmapText.fonts[this.fontName],c=new b.Point,d=null,e=[],f=0,g=[],h=0,i=this.fontSize/a.size,j=0;j<this.text.length;j++){var k=this.text.charCodeAt(j);if(/(?:\r\n|\r|\n)/.test(this.text.charAt(j)))g.push(c.x),f=Math.max(f,c.x),h++,c.x=0,c.y+=a.lineHeight,d=null;else{var l=a.chars[k];l&&(d&&l.kerning[d]&&(c.x+=l.kerning[d]),e.push({texture:l.texture,line:h,charCode:k,position:new b.Point(c.x+l.xOffset,c.y+l.yOffset)}),c.x+=l.xAdvance,d=k)}}g.push(c.x),f=Math.max(f,c.x);var m=[];for(j=0;h>=j;j++){var n=0;"right"===this.style.align?n=f-g[j]:"center"===this.style.align&&(n=(f-g[j])/2),m.push(n)}var o=this.children.length,p=e.length,q=this.tint||16777215;for(j=0;p>j;j++){var r=o>j?this.children[j]:this._pool.pop();r?r.setTexture(e[j].texture):r=new b.Sprite(e[j].texture),r.position.x=(e[j].position.x+m[e[j].line])*i,r.position.y=e[j].position.y*i,r.scale.x=r.scale.y=i,r.tint=q,r.parent||this.addChild(r)}for(;this.children.length>p;){var s=this.getChildAt(this.children.length-1);this._pool.push(s),this.removeChild(s)}this.textWidth=f*i,this.textHeight=(c.y+a.lineHeight)*i},b.BitmapText.prototype.updateTransform=function(){this.dirty&&(this.updateText(),this.dirty=!1),b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.BitmapText.fonts={},b.InteractionData=function(){this.global=new b.Point,this.target=null,this.originalEvent=null},b.InteractionData.prototype.getLocalPosition=function(a,c){var d=a.worldTransform,e=this.global,f=d.a,g=d.c,h=d.tx,i=d.b,j=d.d,k=d.ty,l=1/(f*j+g*-i);return c=c||new b.Point,c.x=j*l*e.x+-g*l*e.y+(k*g-h*j)*l,c.y=f*l*e.y+-i*l*e.x+(-k*f+h*i)*l,c},b.InteractionData.prototype.constructor=b.InteractionData,b.InteractionManager=function(a){this.stage=a,this.mouse=new b.InteractionData,this.touches={},this.tempPoint=new b.Point,this.mouseoverEnabled=!0,this.pool=[],this.interactiveItems=[],this.interactionDOMElement=null,this.onMouseMove=this.onMouseMove.bind(this),this.onMouseDown=this.onMouseDown.bind(this),this.onMouseOut=this.onMouseOut.bind(this),this.onMouseUp=this.onMouseUp.bind(this),this.onTouchStart=this.onTouchStart.bind(this),this.onTouchEnd=this.onTouchEnd.bind(this),this.onTouchMove=this.onTouchMove.bind(this),this.last=0,this.currentCursorStyle="inherit",this.mouseOut=!1,this.resolution=1,this._tempPoint=new b.Point},b.InteractionManager.prototype.constructor=b.InteractionManager,b.InteractionManager.prototype.collectInteractiveSprite=function(a,b){for(var c=a.children,d=c.length,e=d-1;e>=0;e--){var f=c[e];
f._interactive?(b.interactiveChildren=!0,this.interactiveItems.push(f),f.children.length>0&&this.collectInteractiveSprite(f,f)):(f.__iParent=null,f.children.length>0&&this.collectInteractiveSprite(f,b))}},b.InteractionManager.prototype.setTarget=function(a){this.target=a,this.resolution=a.resolution,null===this.interactionDOMElement&&this.setTargetDomElement(a.view)},b.InteractionManager.prototype.setTargetDomElement=function(a){this.removeEvents(),window.navigator.msPointerEnabled&&(a.style["-ms-content-zooming"]="none",a.style["-ms-touch-action"]="none"),this.interactionDOMElement=a,a.addEventListener("mousemove",this.onMouseMove,!0),a.addEventListener("mousedown",this.onMouseDown,!0),a.addEventListener("mouseout",this.onMouseOut,!0),a.addEventListener("touchstart",this.onTouchStart,!0),a.addEventListener("touchend",this.onTouchEnd,!0),a.addEventListener("touchmove",this.onTouchMove,!0),window.addEventListener("mouseup",this.onMouseUp,!0)},b.InteractionManager.prototype.removeEvents=function(){this.interactionDOMElement&&(this.interactionDOMElement.style["-ms-content-zooming"]="",this.interactionDOMElement.style["-ms-touch-action"]="",this.interactionDOMElement.removeEventListener("mousemove",this.onMouseMove,!0),this.interactionDOMElement.removeEventListener("mousedown",this.onMouseDown,!0),this.interactionDOMElement.removeEventListener("mouseout",this.onMouseOut,!0),this.interactionDOMElement.removeEventListener("touchstart",this.onTouchStart,!0),this.interactionDOMElement.removeEventListener("touchend",this.onTouchEnd,!0),this.interactionDOMElement.removeEventListener("touchmove",this.onTouchMove,!0),this.interactionDOMElement=null,window.removeEventListener("mouseup",this.onMouseUp,!0))},b.InteractionManager.prototype.update=function(){if(this.target){var a=Date.now(),c=a-this.last;if(c=c*b.INTERACTION_FREQUENCY/1e3,!(1>c)){this.last=a;var d=0;this.dirty&&this.rebuildInteractiveGraph();var e=this.interactiveItems.length,f="inherit",g=!1;for(d=0;e>d;d++){var h=this.interactiveItems[d];h.__hit=this.hitTest(h,this.mouse),this.mouse.target=h,h.__hit&&!g?(h.buttonMode&&(f=h.defaultCursor),h.interactiveChildren||(g=!0),h.__isOver||(h.mouseover&&h.mouseover(this.mouse),h.__isOver=!0)):h.__isOver&&(h.mouseout&&h.mouseout(this.mouse),h.__isOver=!1)}this.currentCursorStyle!==f&&(this.currentCursorStyle=f,this.interactionDOMElement.style.cursor=f)}}},b.InteractionManager.prototype.rebuildInteractiveGraph=function(){this.dirty=!1;for(var a=this.interactiveItems.length,b=0;a>b;b++)this.interactiveItems[b].interactiveChildren=!1;this.interactiveItems=[],this.stage.interactive&&this.interactiveItems.push(this.stage),this.collectInteractiveSprite(this.stage,this.stage)},b.InteractionManager.prototype.onMouseMove=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactionDOMElement.getBoundingClientRect();this.mouse.global.x=(a.clientX-b.left)*(this.target.width/b.width)/this.resolution,this.mouse.global.y=(a.clientY-b.top)*(this.target.height/b.height)/this.resolution;for(var c=this.interactiveItems.length,d=0;c>d;d++){var e=this.interactiveItems[d];e.mousemove&&e.mousemove(this.mouse)}},b.InteractionManager.prototype.onMouseDown=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a,b.AUTO_PREVENT_DEFAULT&&this.mouse.originalEvent.preventDefault();for(var c=this.interactiveItems.length,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightdown":"mousedown",g=e?"rightclick":"click",h=e?"__rightIsDown":"__mouseIsDown",i=e?"__isRightDown":"__isDown",j=0;c>j;j++){var k=this.interactiveItems[j];if((k[f]||k[g])&&(k[h]=!0,k.__hit=this.hitTest(k,this.mouse),k.__hit&&(k[f]&&k[f](this.mouse),k[i]=!0,!k.interactiveChildren)))break}},b.InteractionManager.prototype.onMouseOut=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;var b=this.interactiveItems.length;this.interactionDOMElement.style.cursor="inherit";for(var c=0;b>c;c++){var d=this.interactiveItems[c];d.__isOver&&(this.mouse.target=d,d.mouseout&&d.mouseout(this.mouse),d.__isOver=!1)}this.mouseOut=!0,this.mouse.global.x=-1e4,this.mouse.global.y=-1e4},b.InteractionManager.prototype.onMouseUp=function(a){this.dirty&&this.rebuildInteractiveGraph(),this.mouse.originalEvent=a;for(var b=this.interactiveItems.length,c=!1,d=this.mouse.originalEvent,e=2===d.button||3===d.which,f=e?"rightup":"mouseup",g=e?"rightclick":"click",h=e?"rightupoutside":"mouseupoutside",i=e?"__isRightDown":"__isDown",j=0;b>j;j++){var k=this.interactiveItems[j];(k[g]||k[f]||k[h])&&(k.__hit=this.hitTest(k,this.mouse),k.__hit&&!c?(k[f]&&k[f](this.mouse),k[i]&&k[g]&&k[g](this.mouse),k.interactiveChildren||(c=!0)):k[i]&&k[h]&&k[h](this.mouse),k[i]=!1)}},b.InteractionManager.prototype.hitTest=function(a,c){var d=c.global;if(!a.worldVisible)return!1;a.worldTransform.applyInverse(d,this._tempPoint);var e,f=this._tempPoint.x,g=this._tempPoint.y;if(c.target=a,a.hitArea&&a.hitArea.contains)return a.hitArea.contains(f,g);if(a instanceof b.Sprite){var h,i=a.texture.frame.width,j=a.texture.frame.height,k=-i*a.anchor.x;if(f>k&&k+i>f&&(h=-j*a.anchor.y,g>h&&h+j>g))return!0}else if(a instanceof b.Graphics){var l=a.graphicsData;for(e=0;e<l.length;e++){var m=l[e];if(m.fill&&m.shape&&m.shape.contains(f,g))return!0}}var n=a.children.length;for(e=0;n>e;e++){var o=a.children[e],p=this.hitTest(o,c);if(p)return c.target=a,!0}return!1},b.InteractionManager.prototype.onTouchMove=function(a){this.dirty&&this.rebuildInteractiveGraph();var b,c=this.interactionDOMElement.getBoundingClientRect(),d=a.changedTouches,e=0;for(e=0;e<d.length;e++){var f=d[e];b=this.touches[f.identifier],b.originalEvent=a,b.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,b.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(b.global.x=f.clientX,b.global.y=f.clientY);for(var g=0;g<this.interactiveItems.length;g++){var h=this.interactiveItems[g];h.touchmove&&h.__touchData&&h.__touchData[f.identifier]&&h.touchmove(b)}}},b.InteractionManager.prototype.onTouchStart=function(a){this.dirty&&this.rebuildInteractiveGraph();var c=this.interactionDOMElement.getBoundingClientRect();b.AUTO_PREVENT_DEFAULT&&a.preventDefault();for(var d=a.changedTouches,e=0;e<d.length;e++){var f=d[e],g=this.pool.pop();g||(g=new b.InteractionData),g.originalEvent=a,this.touches[f.identifier]=g,g.global.x=(f.clientX-c.left)*(this.target.width/c.width)/this.resolution,g.global.y=(f.clientY-c.top)*(this.target.height/c.height)/this.resolution,!navigator.isCocoonJS||c.left||c.top||a.target.style.width||a.target.style.height||(g.global.x=f.clientX,g.global.y=f.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];if((j.touchstart||j.tap)&&(j.__hit=this.hitTest(j,g),j.__hit&&(j.touchstart&&j.touchstart(g),j.__isDown=!0,j.__touchData=j.__touchData||{},j.__touchData[f.identifier]=g,!j.interactiveChildren)))break}}},b.InteractionManager.prototype.onTouchEnd=function(a){this.dirty&&this.rebuildInteractiveGraph();for(var b=this.interactionDOMElement.getBoundingClientRect(),c=a.changedTouches,d=0;d<c.length;d++){var e=c[d],f=this.touches[e.identifier],g=!1;f.global.x=(e.clientX-b.left)*(this.target.width/b.width)/this.resolution,f.global.y=(e.clientY-b.top)*(this.target.height/b.height)/this.resolution,!navigator.isCocoonJS||b.left||b.top||a.target.style.width||a.target.style.height||(f.global.x=e.clientX,f.global.y=e.clientY);for(var h=this.interactiveItems.length,i=0;h>i;i++){var j=this.interactiveItems[i];j.__touchData&&j.__touchData[e.identifier]&&(j.__hit=this.hitTest(j,j.__touchData[e.identifier]),f.originalEvent=a,(j.touchend||j.tap)&&(j.__hit&&!g?(j.touchend&&j.touchend(f),j.__isDown&&j.tap&&j.tap(f),j.interactiveChildren||(g=!0)):j.__isDown&&j.touchendoutside&&j.touchendoutside(f),j.__isDown=!1),j.__touchData[e.identifier]=null)}this.pool.push(f),this.touches[e.identifier]=null}},b.Stage=function(a){b.DisplayObjectContainer.call(this),this.worldTransform=new b.Matrix,this.interactive=!0,this.interactionManager=new b.InteractionManager(this),this.dirty=!0,this.stage=this,this.stage.hitArea=new b.Rectangle(0,0,1e5,1e5),this.setBackgroundColor(a)},b.Stage.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Stage.prototype.constructor=b.Stage,b.Stage.prototype.setInteractionDelegate=function(a){this.interactionManager.setTargetDomElement(a)},b.Stage.prototype.updateTransform=function(){this.worldAlpha=1;for(var a=0,b=this.children.length;b>a;a++)this.children[a].updateTransform();this.dirty&&(this.dirty=!1,this.interactionManager.dirty=!0),this.interactive&&this.interactionManager.update()},b.Stage.prototype.setBackgroundColor=function(a){this.backgroundColor=a||0,this.backgroundColorSplit=b.hex2rgb(this.backgroundColor);var c=this.backgroundColor.toString(16);c="000000".substr(0,6-c.length)+c,this.backgroundColorString="#"+c},b.Stage.prototype.getMousePosition=function(){return this.interactionManager.mouse.global},function(a){for(var b=0,c=["ms","moz","webkit","o"],d=0;d<c.length&&!a.requestAnimationFrame;++d)a.requestAnimationFrame=a[c[d]+"RequestAnimationFrame"],a.cancelAnimationFrame=a[c[d]+"CancelAnimationFrame"]||a[c[d]+"CancelRequestAnimationFrame"];a.requestAnimationFrame||(a.requestAnimationFrame=function(c){var d=(new Date).getTime(),e=Math.max(0,16-(d-b)),f=a.setTimeout(function(){c(d+e)},e);return b=d+e,f}),a.cancelAnimationFrame||(a.cancelAnimationFrame=function(a){clearTimeout(a)}),a.requestAnimFrame=a.requestAnimationFrame}(this),b.hex2rgb=function(a){return[(a>>16&255)/255,(a>>8&255)/255,(255&a)/255]},b.rgb2hex=function(a){return(255*a[0]<<16)+(255*a[1]<<8)+255*a[2]},"function"!=typeof Function.prototype.bind&&(Function.prototype.bind=function(){return function(a){function b(){for(var d=arguments.length,f=new Array(d);d--;)f[d]=arguments[d];return f=e.concat(f),c.apply(this instanceof b?this:a,f)}var c=this,d=arguments.length-1,e=[];if(d>0)for(e.length=d;d--;)e[d]=arguments[d+1];if("function"!=typeof c)throw new TypeError;return b.prototype=function f(a){return a&&(f.prototype=a),this instanceof f?void 0:new f}(c.prototype),b}}()),b.AjaxRequest=function(){var a=["Msxml2.XMLHTTP.6.0","Msxml2.XMLHTTP.3.0","Microsoft.XMLHTTP"];if(!window.ActiveXObject)return window.XMLHttpRequest?new window.XMLHttpRequest:!1;for(var b=0;b<a.length;b++)try{return new window.ActiveXObject(a[b])}catch(c){}},b.canUseNewCanvasBlendModes=function(){if("undefined"==typeof document)return!1;var a=document.createElement("canvas");a.width=1,a.height=1;var b=a.getContext("2d");return b.fillStyle="#000",b.fillRect(0,0,1,1),b.globalCompositeOperation="multiply",b.fillStyle="#fff",b.fillRect(0,0,1,1),0===b.getImageData(0,0,1,1).data[0]},b.getNextPowerOfTwo=function(a){if(a>0&&0===(a&a-1))return a;for(var b=1;a>b;)b<<=1;return b},b.isPowerOfTwo=function(a,b){return a>0&&0===(a&a-1)&&b>0&&0===(b&b-1)},b.EventTarget={call:function(a){a&&(a=a.prototype||a,b.EventTarget.mixin(a))},mixin:function(a){a.listeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?this._listeners[a].slice():[]},a.emit=a.dispatchEvent=function(a,c){if(this._listeners=this._listeners||{},"object"==typeof a&&(c=a,a=a.type),c&&c.__isEventObject===!0||(c=new b.Event(this,a,c)),this._listeners&&this._listeners[a]){var d,e=this._listeners[a].slice(0),f=e.length,g=e[0];for(d=0;f>d;g=e[++d])if(g.call(this,c),c.stoppedImmediate)return this;if(c.stopped)return this}return this.parent&&this.parent.emit&&this.parent.emit.call(this.parent,a,c),this},a.on=a.addEventListener=function(a,b){return this._listeners=this._listeners||{},(this._listeners[a]=this._listeners[a]||[]).push(b),this},a.once=function(a,b){function c(){b.apply(d.off(a,c),arguments)}this._listeners=this._listeners||{};var d=this;return c._originalHandler=b,this.on(a,c)},a.off=a.removeEventListener=function(a,b){if(this._listeners=this._listeners||{},!this._listeners[a])return this;for(var c=this._listeners[a],d=b?c.length:0;d-->0;)(c[d]===b||c[d]._originalHandler===b)&&c.splice(d,1);return 0===c.length&&delete this._listeners[a],this},a.removeAllListeners=function(a){return this._listeners=this._listeners||{},this._listeners[a]?(delete this._listeners[a],this):this}}},b.Event=function(a,b,c){this.__isEventObject=!0,this.stopped=!1,this.stoppedImmediate=!1,this.target=a,this.type=b,this.data=c,this.content=c,this.timeStamp=Date.now()},b.Event.prototype.stopPropagation=function(){this.stopped=!0},b.Event.prototype.stopImmediatePropagation=function(){this.stoppedImmediate=!0},b.autoDetectRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}();return e?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.autoDetectRecommendedRenderer=function(a,c,d){a||(a=800),c||(c=600);var e=function(){try{var a=document.createElement("canvas");return!!window.WebGLRenderingContext&&(a.getContext("webgl")||a.getContext("experimental-webgl"))}catch(b){return!1}}(),f=/Android/i.test(navigator.userAgent);return e&&!f?new b.WebGLRenderer(a,c,d):new b.CanvasRenderer(a,c,d)},b.PolyK={},b.PolyK.Triangulate=function(a){var c=!0,d=a.length>>1;if(3>d)return[];for(var e=[],f=[],g=0;d>g;g++)f.push(g);g=0;for(var h=d;h>3;){var i=f[(g+0)%h],j=f[(g+1)%h],k=f[(g+2)%h],l=a[2*i],m=a[2*i+1],n=a[2*j],o=a[2*j+1],p=a[2*k],q=a[2*k+1],r=!1;if(b.PolyK._convex(l,m,n,o,p,q,c)){r=!0;for(var s=0;h>s;s++){var t=f[s];if(t!==i&&t!==j&&t!==k&&b.PolyK._PointInTriangle(a[2*t],a[2*t+1],l,m,n,o,p,q)){r=!1;break}}}if(r)e.push(i,j,k),f.splice((g+1)%h,1),h--,g=0;else if(g++>3*h){if(!c)return null;for(e=[],f=[],g=0;d>g;g++)f.push(g);g=0,h=d,c=!1}}return e.push(f[0],f[1],f[2]),e},b.PolyK._PointInTriangle=function(a,b,c,d,e,f,g,h){var i=g-c,j=h-d,k=e-c,l=f-d,m=a-c,n=b-d,o=i*i+j*j,p=i*k+j*l,q=i*m+j*n,r=k*k+l*l,s=k*m+l*n,t=1/(o*r-p*p),u=(r*q-p*s)*t,v=(o*s-p*q)*t;return u>=0&&v>=0&&1>u+v},b.PolyK._convex=function(a,b,c,d,e,f,g){return(b-d)*(e-c)+(c-a)*(f-d)>=0===g},b.initDefaultShaders=function(){},b.CompileVertexShader=function(a,c){return b._CompileShader(a,c,a.VERTEX_SHADER)},b.CompileFragmentShader=function(a,c){return b._CompileShader(a,c,a.FRAGMENT_SHADER)},b._CompileShader=function(a,b,c){var d=b.join("\n"),e=a.createShader(c);return a.shaderSource(e,d),a.compileShader(e),a.getShaderParameter(e,a.COMPILE_STATUS)?e:(window.console.log(a.getShaderInfoLog(e)),null)},b.compileProgram=function(a,c,d){var e=b.CompileFragmentShader(a,d),f=b.CompileVertexShader(a,c),g=a.createProgram();return a.attachShader(g,f),a.attachShader(g,e),a.linkProgram(g),a.getProgramParameter(g,a.LINK_STATUS)||window.console.log("Could not initialise shaders"),g},b.PixiShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.textureCount=0,this.firstRun=!0,this.dirty=!0,this.attributes=[],this.init()},b.PixiShader.prototype.constructor=b.PixiShader,b.PixiShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc||b.PixiShader.defaultVertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aTextureCoord,this.colorAttribute];for(var d in this.uniforms)this.uniforms[d].uniformLocation=a.getUniformLocation(c,d);this.initUniforms(),this.program=c},b.PixiShader.prototype.initUniforms=function(){this.textureCount=1;var a,b=this.gl;for(var c in this.uniforms){a=this.uniforms[c];var d=a.type;"sampler2D"===d?(a._init=!1,null!==a.value&&this.initSampler2D(a)):"mat2"===d||"mat3"===d||"mat4"===d?(a.glMatrix=!0,a.glValueLength=1,"mat2"===d?a.glFunc=b.uniformMatrix2fv:"mat3"===d?a.glFunc=b.uniformMatrix3fv:"mat4"===d&&(a.glFunc=b.uniformMatrix4fv)):(a.glFunc=b["uniform"+d],a.glValueLength="2f"===d||"2i"===d?2:"3f"===d||"3i"===d?3:"4f"===d||"4i"===d?4:1)}},b.PixiShader.prototype.initSampler2D=function(a){if(a.value&&a.value.baseTexture&&a.value.baseTexture.hasLoaded){var b=this.gl;if(b.activeTexture(b["TEXTURE"+this.textureCount]),b.bindTexture(b.TEXTURE_2D,a.value.baseTexture._glTextures[b.id]),a.textureData){var c=a.textureData,d=c.magFilter?c.magFilter:b.LINEAR,e=c.minFilter?c.minFilter:b.LINEAR,f=c.wrapS?c.wrapS:b.CLAMP_TO_EDGE,g=c.wrapT?c.wrapT:b.CLAMP_TO_EDGE,h=c.luminance?b.LUMINANCE:b.RGBA;if(c.repeat&&(f=b.REPEAT,g=b.REPEAT),b.pixelStorei(b.UNPACK_FLIP_Y_WEBGL,!!c.flipY),c.width){var i=c.width?c.width:512,j=c.height?c.height:2,k=c.border?c.border:0;b.texImage2D(b.TEXTURE_2D,0,h,i,j,k,h,b.UNSIGNED_BYTE,null)}else b.texImage2D(b.TEXTURE_2D,0,h,b.RGBA,b.UNSIGNED_BYTE,a.value.baseTexture.source);b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MAG_FILTER,d),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_MIN_FILTER,e),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_S,f),b.texParameteri(b.TEXTURE_2D,b.TEXTURE_WRAP_T,g)}b.uniform1i(a.uniformLocation,this.textureCount),a._init=!0,this.textureCount++}},b.PixiShader.prototype.syncUniforms=function(){this.textureCount=1;var a,c=this.gl;for(var d in this.uniforms)a=this.uniforms[d],1===a.glValueLength?a.glMatrix===!0?a.glFunc.call(c,a.uniformLocation,a.transpose,a.value):a.glFunc.call(c,a.uniformLocation,a.value):2===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y):3===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z):4===a.glValueLength?a.glFunc.call(c,a.uniformLocation,a.value.x,a.value.y,a.value.z,a.value.w):"sampler2D"===a.type&&(a._init?(c.activeTexture(c["TEXTURE"+this.textureCount]),a.value.baseTexture._dirty[c.id]?b.instances[c.id].updateTexture(a.value.baseTexture):c.bindTexture(c.TEXTURE_2D,a.value.baseTexture._glTextures[c.id]),c.uniform1i(a.uniformLocation,this.textureCount),this.textureCount++):this.initSampler2D(a))},b.PixiShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.PixiShader.defaultVertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","attribute vec4 aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","varying vec4 vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   gl_Position = vec4( ((aVertexPosition + offsetVector) / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vColor = vec4(aColor.rgb * aColor.a, aColor.a);","}"],b.PixiFastShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision lowp float;","varying vec2 vTextureCoord;","varying float vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aPositionCoord;","attribute vec2 aScale;","attribute float aRotation;","attribute vec2 aTextureCoord;","attribute float aColor;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform mat3 uMatrix;","varying vec2 vTextureCoord;","varying float vColor;","const vec2 center = vec2(-1.0, 1.0);","void main(void) {","   vec2 v;","   vec2 sv = aVertexPosition * aScale;","   v.x = (sv.x) * cos(aRotation) - (sv.y) * sin(aRotation);","   v.y = (sv.x) * sin(aRotation) + (sv.y) * cos(aRotation);","   v = ( uMatrix * vec3(v + aPositionCoord , 1.0) ).xy ;","   gl_Position = vec4( ( v / projectionVector) + center , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","   vColor = aColor;","}"],this.textureCount=0,this.init()},b.PixiFastShader.prototype.constructor=b.PixiFastShader,b.PixiFastShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.dimensions=a.getUniformLocation(c,"dimensions"),this.uMatrix=a.getUniformLocation(c,"uMatrix"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aPositionCoord=a.getAttribLocation(c,"aPositionCoord"),this.aScale=a.getAttribLocation(c,"aScale"),this.aRotation=a.getAttribLocation(c,"aRotation"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.colorAttribute=a.getAttribLocation(c,"aColor"),-1===this.colorAttribute&&(this.colorAttribute=2),this.attributes=[this.aVertexPosition,this.aPositionCoord,this.aScale,this.aRotation,this.aTextureCoord,this.colorAttribute],this.program=c},b.PixiFastShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.StripShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","uniform float alpha;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * alpha;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec2 aTextureCoord;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","varying vec2 vTextureCoord;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, v.y / -projectionVector.y + 1.0 , 0.0, 1.0);","   vTextureCoord = aTextureCoord;","}"],this.init()},b.StripShader.prototype.constructor=b.StripShader,b.StripShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.uSampler=a.getUniformLocation(c,"uSampler"),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.aTextureCoord=a.getAttribLocation(c,"aTextureCoord"),this.attributes=[this.aVertexPosition,this.aTextureCoord],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.StripShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.PrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","attribute vec4 aColor;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform float alpha;","uniform float flipY;","uniform vec3 tint;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);","   vColor = aColor * vec4(tint * alpha, alpha);","}"],this.init()},b.PrimitiveShader.prototype.constructor=b.PrimitiveShader,b.PrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.flipY=a.getUniformLocation(c,"flipY"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.colorAttribute=a.getAttribLocation(c,"aColor"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.PrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attributes=null},b.ComplexPrimitiveShader=function(a){this._UID=b._UID++,this.gl=a,this.program=null,this.fragmentSrc=["precision mediump float;","varying vec4 vColor;","void main(void) {","   gl_FragColor = vColor;","}"],this.vertexSrc=["attribute vec2 aVertexPosition;","uniform mat3 translationMatrix;","uniform vec2 projectionVector;","uniform vec2 offsetVector;","uniform vec3 tint;","uniform float alpha;","uniform vec3 color;","uniform float flipY;","varying vec4 vColor;","void main(void) {","   vec3 v = translationMatrix * vec3(aVertexPosition , 1.0);","   v -= offsetVector.xyx;","   gl_Position = vec4( v.x / projectionVector.x -1.0, (v.y / projectionVector.y * -flipY) + flipY , 0.0, 1.0);","   vColor = vec4(color * alpha * tint, alpha);","}"],this.init()},b.ComplexPrimitiveShader.prototype.constructor=b.ComplexPrimitiveShader,b.ComplexPrimitiveShader.prototype.init=function(){var a=this.gl,c=b.compileProgram(a,this.vertexSrc,this.fragmentSrc);a.useProgram(c),this.projectionVector=a.getUniformLocation(c,"projectionVector"),this.offsetVector=a.getUniformLocation(c,"offsetVector"),this.tintColor=a.getUniformLocation(c,"tint"),this.color=a.getUniformLocation(c,"color"),this.flipY=a.getUniformLocation(c,"flipY"),this.aVertexPosition=a.getAttribLocation(c,"aVertexPosition"),this.attributes=[this.aVertexPosition,this.colorAttribute],this.translationMatrix=a.getUniformLocation(c,"translationMatrix"),this.alpha=a.getUniformLocation(c,"alpha"),this.program=c},b.ComplexPrimitiveShader.prototype.destroy=function(){this.gl.deleteProgram(this.program),this.uniforms=null,this.gl=null,this.attribute=null},b.WebGLGraphics=function(){},b.WebGLGraphics.renderGraphics=function(a,c){var d,e=c.gl,f=c.projection,g=c.offset,h=c.shaderManager.primitiveShader;a.dirty&&b.WebGLGraphics.updateGraphics(a,e);for(var i=a._webGL[e.id],j=0;j<i.data.length;j++)1===i.data[j].mode?(d=i.data[j],c.stencilManager.pushStencil(a,d,c),e.drawElements(e.TRIANGLE_FAN,4,e.UNSIGNED_SHORT,2*(d.indices.length-4)),c.stencilManager.popStencil(a,d,c)):(d=i.data[j],c.shaderManager.setShader(h),h=c.shaderManager.primitiveShader,e.uniformMatrix3fv(h.translationMatrix,!1,a.worldTransform.toArray(!0)),e.uniform1f(h.flipY,1),e.uniform2f(h.projectionVector,f.x,-f.y),e.uniform2f(h.offsetVector,-g.x,-g.y),e.uniform3fv(h.tintColor,b.hex2rgb(a.tint)),e.uniform1f(h.alpha,a.worldAlpha),e.bindBuffer(e.ARRAY_BUFFER,d.buffer),e.vertexAttribPointer(h.aVertexPosition,2,e.FLOAT,!1,24,0),e.vertexAttribPointer(h.colorAttribute,4,e.FLOAT,!1,24,8),e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,d.indexBuffer),e.drawElements(e.TRIANGLE_STRIP,d.indices.length,e.UNSIGNED_SHORT,0))},b.WebGLGraphics.updateGraphics=function(a,c){var d=a._webGL[c.id];d||(d=a._webGL[c.id]={lastIndex:0,data:[],gl:c}),a.dirty=!1;var e;if(a.clearDirty){for(a.clearDirty=!1,e=0;e<d.data.length;e++){var f=d.data[e];f.reset(),b.WebGLGraphics.graphicsDataPool.push(f)}d.data=[],d.lastIndex=0}var g;for(e=d.lastIndex;e<a.graphicsData.length;e++){var h=a.graphicsData[e];if(h.type===b.Graphics.POLY){if(h.points=h.shape.points.slice(),h.shape.closed&&(h.points[0]!==h.points[h.points.length-2]||h.points[1]!==h.points[h.points.length-1])&&h.points.push(h.points[0],h.points[1]),h.fill&&h.points.length>=6)if(h.points.length<12){g=b.WebGLGraphics.switchMode(d,0);var i=b.WebGLGraphics.buildPoly(h,g);i||(g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g))}else g=b.WebGLGraphics.switchMode(d,1),b.WebGLGraphics.buildComplexPoly(h,g);h.lineWidth>0&&(g=b.WebGLGraphics.switchMode(d,0),b.WebGLGraphics.buildLine(h,g))}else g=b.WebGLGraphics.switchMode(d,0),h.type===b.Graphics.RECT?b.WebGLGraphics.buildRectangle(h,g):h.type===b.Graphics.CIRC||h.type===b.Graphics.ELIP?b.WebGLGraphics.buildCircle(h,g):h.type===b.Graphics.RREC&&b.WebGLGraphics.buildRoundedRectangle(h,g);d.lastIndex++}for(e=0;e<d.data.length;e++)g=d.data[e],g.dirty&&g.upload()},b.WebGLGraphics.switchMode=function(a,c){var d;return a.data.length?(d=a.data[a.data.length-1],(d.mode!==c||1===c)&&(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d))):(d=b.WebGLGraphics.graphicsDataPool.pop()||new b.WebGLGraphicsData(a.gl),d.mode=c,a.data.push(d)),d.dirty=!0,d},b.WebGLGraphics.buildRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height;if(a.fill){var i=b.hex2rgb(a.fillColor),j=a.fillAlpha,k=i[0]*j,l=i[1]*j,m=i[2]*j,n=c.points,o=c.indices,p=n.length/6;n.push(e,f),n.push(k,l,m,j),n.push(e+g,f),n.push(k,l,m,j),n.push(e,f+h),n.push(k,l,m,j),n.push(e+g,f+h),n.push(k,l,m,j),o.push(p,p,p+1,p+2,p+3,p+3)}if(a.lineWidth){var q=a.points;a.points=[e,f,e+g,f,e+g,f+h,e,f+h,e,f],b.WebGLGraphics.buildLine(a,c),a.points=q}},b.WebGLGraphics.buildRoundedRectangle=function(a,c){var d=a.shape,e=d.x,f=d.y,g=d.width,h=d.height,i=d.radius,j=[];if(j.push(e,f+i),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e,f+h-i,e,f+h,e+i,f+h)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g-i,f+h,e+g,f+h,e+g,f+h-i)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+g,f+i,e+g,f,e+g-i,f)),j=j.concat(b.WebGLGraphics.quadraticBezierCurve(e+i,f,e,f,e,f+i)),a.fill){var k=b.hex2rgb(a.fillColor),l=a.fillAlpha,m=k[0]*l,n=k[1]*l,o=k[2]*l,p=c.points,q=c.indices,r=p.length/6,s=b.PolyK.Triangulate(j),t=0;for(t=0;t<s.length;t+=3)q.push(s[t]+r),q.push(s[t]+r),q.push(s[t+1]+r),q.push(s[t+2]+r),q.push(s[t+2]+r);for(t=0;t<j.length;t++)p.push(j[t],j[++t],m,n,o,l)}if(a.lineWidth){var u=a.points;a.points=j,b.WebGLGraphics.buildLine(a,c),a.points=u}},b.WebGLGraphics.quadraticBezierCurve=function(a,b,c,d,e,f){function g(a,b,c){var d=b-a;return a+d*c}for(var h,i,j,k,l,m,n=20,o=[],p=0,q=0;n>=q;q++)p=q/n,h=g(a,c,p),i=g(b,d,p),j=g(c,e,p),k=g(d,f,p),l=g(h,j,p),m=g(i,k,p),o.push(l,m);return o},b.WebGLGraphics.buildCircle=function(a,c){var d,e,f=a.shape,g=f.x,h=f.y;a.type===b.Graphics.CIRC?(d=f.radius,e=f.radius):(d=f.width,e=f.height);var i=40,j=2*Math.PI/i,k=0;if(a.fill){var l=b.hex2rgb(a.fillColor),m=a.fillAlpha,n=l[0]*m,o=l[1]*m,p=l[2]*m,q=c.points,r=c.indices,s=q.length/6;for(r.push(s),k=0;i+1>k;k++)q.push(g,h,n,o,p,m),q.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e,n,o,p,m),r.push(s++,s++);r.push(s-1)}if(a.lineWidth){var t=a.points;for(a.points=[],k=0;i+1>k;k++)a.points.push(g+Math.sin(j*k)*d,h+Math.cos(j*k)*e);b.WebGLGraphics.buildLine(a,c),a.points=t}},b.WebGLGraphics.buildLine=function(a,c){var d=0,e=a.points;if(0!==e.length){if(a.lineWidth%2)for(d=0;d<e.length;d++)e[d]+=.5;var f=new b.Point(e[0],e[1]),g=new b.Point(e[e.length-2],e[e.length-1]);if(f.x===g.x&&f.y===g.y){e=e.slice(),e.pop(),e.pop(),g=new b.Point(e[e.length-2],e[e.length-1]);var h=g.x+.5*(f.x-g.x),i=g.y+.5*(f.y-g.y);e.unshift(h,i),e.push(h,i)}var j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,A,B,C,D,E,F,G=c.points,H=c.indices,I=e.length/2,J=e.length,K=G.length/6,L=a.lineWidth/2,M=b.hex2rgb(a.lineColor),N=a.lineAlpha,O=M[0]*N,P=M[1]*N,Q=M[2]*N;for(l=e[0],m=e[1],n=e[2],o=e[3],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(l-r,m-s,O,P,Q,N),G.push(l+r,m+s,O,P,Q,N),d=1;I-1>d;d++)l=e[2*(d-1)],m=e[2*(d-1)+1],n=e[2*d],o=e[2*d+1],p=e[2*(d+1)],q=e[2*(d+1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,t=-(o-q),u=n-p,F=Math.sqrt(t*t+u*u),t/=F,u/=F,t*=L,u*=L,x=-s+m-(-s+o),y=-r+n-(-r+l),z=(-r+l)*(-s+o)-(-r+n)*(-s+m),A=-u+q-(-u+o),B=-t+n-(-t+p),C=(-t+p)*(-u+o)-(-t+n)*(-u+q),D=x*B-A*y,Math.abs(D)<.1?(D+=10.1,G.push(n-r,o-s,O,P,Q,N),G.push(n+r,o+s,O,P,Q,N)):(j=(y*C-B*z)/D,k=(A*z-x*C)/D,E=(j-n)*(j-n)+(k-o)+(k-o),E>19600?(v=r-t,w=s-u,F=Math.sqrt(v*v+w*w),v/=F,w/=F,v*=L,w*=L,G.push(n-v,o-w),G.push(O,P,Q,N),G.push(n+v,o+w),G.push(O,P,Q,N),G.push(n-v,o-w),G.push(O,P,Q,N),J++):(G.push(j,k),G.push(O,P,Q,N),G.push(n-(j-n),o-(k-o)),G.push(O,P,Q,N)));
for(l=e[2*(I-2)],m=e[2*(I-2)+1],n=e[2*(I-1)],o=e[2*(I-1)+1],r=-(m-o),s=l-n,F=Math.sqrt(r*r+s*s),r/=F,s/=F,r*=L,s*=L,G.push(n-r,o-s),G.push(O,P,Q,N),G.push(n+r,o+s),G.push(O,P,Q,N),H.push(K),d=0;J>d;d++)H.push(K++);H.push(K-1)}},b.WebGLGraphics.buildComplexPoly=function(a,c){var d=a.points.slice();if(!(d.length<6)){var e=c.indices;c.points=d,c.alpha=a.fillAlpha,c.color=b.hex2rgb(a.fillColor);for(var f,g,h=1/0,i=-1/0,j=1/0,k=-1/0,l=0;l<d.length;l+=2)f=d[l],g=d[l+1],h=h>f?f:h,i=f>i?f:i,j=j>g?g:j,k=g>k?g:k;d.push(h,j,i,j,i,k,h,k);var m=d.length/2;for(l=0;m>l;l++)e.push(l)}},b.WebGLGraphics.buildPoly=function(a,c){var d=a.points;if(!(d.length<6)){var e=c.points,f=c.indices,g=d.length/2,h=b.hex2rgb(a.fillColor),i=a.fillAlpha,j=h[0]*i,k=h[1]*i,l=h[2]*i,m=b.PolyK.Triangulate(d);if(!m)return!1;var n=e.length/6,o=0;for(o=0;o<m.length;o+=3)f.push(m[o]+n),f.push(m[o]+n),f.push(m[o+1]+n),f.push(m[o+2]+n),f.push(m[o+2]+n);for(o=0;g>o;o++)e.push(d[2*o],d[2*o+1],j,k,l,i);return!0}},b.WebGLGraphics.graphicsDataPool=[],b.WebGLGraphicsData=function(a){this.gl=a,this.color=[0,0,0],this.points=[],this.indices=[],this.buffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.mode=1,this.alpha=1,this.dirty=!0},b.WebGLGraphicsData.prototype.reset=function(){this.points=[],this.indices=[]},b.WebGLGraphicsData.prototype.upload=function(){var a=this.gl;this.glPoints=new b.Float32Array(this.points),a.bindBuffer(a.ARRAY_BUFFER,this.buffer),a.bufferData(a.ARRAY_BUFFER,this.glPoints,a.STATIC_DRAW),this.glIndicies=new b.Uint16Array(this.indices),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.glIndicies,a.STATIC_DRAW),this.dirty=!1},b.glContexts=[],b.instances=[],b.WebGLRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("webGL"),b.defaultRenderer=this),this.type=b.WEBGL_RENDERER,this.resolution=d.resolution,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.preserveDrawingBuffer=d.preserveDrawingBuffer,this.clearBeforeRender=d.clearBeforeRender,this.width=a||800,this.height=c||600,this.view=d.view||document.createElement("canvas"),this.contextLostBound=this.handleContextLost.bind(this),this.contextRestoredBound=this.handleContextRestored.bind(this),this.view.addEventListener("webglcontextlost",this.contextLostBound,!1),this.view.addEventListener("webglcontextrestored",this.contextRestoredBound,!1),this._contextOptions={alpha:this.transparent,antialias:d.antialias,premultipliedAlpha:this.transparent&&"notMultiplied"!==this.transparent,stencil:!0,preserveDrawingBuffer:d.preserveDrawingBuffer},this.projection=new b.Point,this.offset=new b.Point(0,0),this.shaderManager=new b.WebGLShaderManager,this.spriteBatch=new b.WebGLSpriteBatch,this.maskManager=new b.WebGLMaskManager,this.filterManager=new b.WebGLFilterManager,this.stencilManager=new b.WebGLStencilManager,this.blendModeManager=new b.WebGLBlendModeManager,this.renderSession={},this.renderSession.gl=this.gl,this.renderSession.drawCount=0,this.renderSession.shaderManager=this.shaderManager,this.renderSession.maskManager=this.maskManager,this.renderSession.filterManager=this.filterManager,this.renderSession.blendModeManager=this.blendModeManager,this.renderSession.spriteBatch=this.spriteBatch,this.renderSession.stencilManager=this.stencilManager,this.renderSession.renderer=this,this.renderSession.resolution=this.resolution,this.initContext(),this.mapBlendModes()},b.WebGLRenderer.prototype.constructor=b.WebGLRenderer,b.WebGLRenderer.prototype.initContext=function(){var a=this.view.getContext("webgl",this._contextOptions)||this.view.getContext("experimental-webgl",this._contextOptions);if(this.gl=a,!a)throw new Error("This browser does not support webGL. Try using the canvas renderer");this.glContextId=a.id=b.WebGLRenderer.glContextId++,b.glContexts[this.glContextId]=a,b.instances[this.glContextId]=this,a.disable(a.DEPTH_TEST),a.disable(a.CULL_FACE),a.enable(a.BLEND),this.shaderManager.setContext(a),this.spriteBatch.setContext(a),this.maskManager.setContext(a),this.filterManager.setContext(a),this.blendModeManager.setContext(a),this.stencilManager.setContext(a),this.renderSession.gl=this.gl,this.resize(this.width,this.height)},b.WebGLRenderer.prototype.render=function(a){if(!this.contextLost){this.__stage!==a&&(a.interactive&&a.interactionManager.removeEvents(),this.__stage=a),a.updateTransform();var b=this.gl;a._interactive?a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)):a._interactiveEventsAdded&&(a._interactiveEventsAdded=!1,a.interactionManager.setTarget(this)),b.viewport(0,0,this.width,this.height),b.bindFramebuffer(b.FRAMEBUFFER,null),this.clearBeforeRender&&(this.transparent?b.clearColor(0,0,0,0):b.clearColor(a.backgroundColorSplit[0],a.backgroundColorSplit[1],a.backgroundColorSplit[2],1),b.clear(b.COLOR_BUFFER_BIT)),this.renderDisplayObject(a,this.projection)}},b.WebGLRenderer.prototype.renderDisplayObject=function(a,c,d){this.renderSession.blendModeManager.setBlendMode(b.blendModes.NORMAL),this.renderSession.drawCount=0,this.renderSession.flipY=d?-1:1,this.renderSession.projection=c,this.renderSession.offset=this.offset,this.spriteBatch.begin(this.renderSession),this.filterManager.begin(this.renderSession,d),a._renderWebGL(this.renderSession),this.spriteBatch.end()},b.WebGLRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px"),this.gl.viewport(0,0,this.width,this.height),this.projection.x=this.width/2/this.resolution,this.projection.y=-this.height/2/this.resolution},b.WebGLRenderer.prototype.updateTexture=function(a){if(a.hasLoaded){var c=this.gl;return a._glTextures[c.id]||(a._glTextures[c.id]=c.createTexture()),c.bindTexture(c.TEXTURE_2D,a._glTextures[c.id]),c.pixelStorei(c.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultipliedAlpha),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,a.source),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MAG_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),a.mipmap&&b.isPowerOfTwo(a.width,a.height)?(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR_MIPMAP_LINEAR:c.NEAREST_MIPMAP_NEAREST),c.generateMipmap(c.TEXTURE_2D)):c.texParameteri(c.TEXTURE_2D,c.TEXTURE_MIN_FILTER,a.scaleMode===b.scaleModes.LINEAR?c.LINEAR:c.NEAREST),a._powerOf2?(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.REPEAT),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.REPEAT)):(c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_S,c.CLAMP_TO_EDGE),c.texParameteri(c.TEXTURE_2D,c.TEXTURE_WRAP_T,c.CLAMP_TO_EDGE)),a._dirty[c.id]=!1,a._glTextures[c.id]}},b.WebGLRenderer.prototype.handleContextLost=function(a){a.preventDefault(),this.contextLost=!0},b.WebGLRenderer.prototype.handleContextRestored=function(){this.initContext();for(var a in b.TextureCache){var c=b.TextureCache[a].baseTexture;c._glTextures=[]}this.contextLost=!1},b.WebGLRenderer.prototype.destroy=function(){this.view.removeEventListener("webglcontextlost",this.contextLostBound),this.view.removeEventListener("webglcontextrestored",this.contextRestoredBound),b.glContexts[this.glContextId]=null,this.projection=null,this.offset=null,this.shaderManager.destroy(),this.spriteBatch.destroy(),this.maskManager.destroy(),this.filterManager.destroy(),this.shaderManager=null,this.spriteBatch=null,this.maskManager=null,this.filterManager=null,this.gl=null,this.renderSession=null},b.WebGLRenderer.prototype.mapBlendModes=function(){var a=this.gl;b.blendModesWebGL||(b.blendModesWebGL=[],b.blendModesWebGL[b.blendModes.NORMAL]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.ADD]=[a.SRC_ALPHA,a.DST_ALPHA],b.blendModesWebGL[b.blendModes.MULTIPLY]=[a.DST_COLOR,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SCREEN]=[a.SRC_ALPHA,a.ONE],b.blendModesWebGL[b.blendModes.OVERLAY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DARKEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LIGHTEN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_DODGE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR_BURN]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HARD_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SOFT_LIGHT]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.DIFFERENCE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.EXCLUSION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.HUE]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.SATURATION]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.COLOR]=[a.ONE,a.ONE_MINUS_SRC_ALPHA],b.blendModesWebGL[b.blendModes.LUMINOSITY]=[a.ONE,a.ONE_MINUS_SRC_ALPHA])},b.WebGLRenderer.glContextId=0,b.WebGLBlendModeManager=function(){this.currentBlendMode=99999},b.WebGLBlendModeManager.prototype.constructor=b.WebGLBlendModeManager,b.WebGLBlendModeManager.prototype.setContext=function(a){this.gl=a},b.WebGLBlendModeManager.prototype.setBlendMode=function(a){if(this.currentBlendMode===a)return!1;this.currentBlendMode=a;var c=b.blendModesWebGL[this.currentBlendMode];return this.gl.blendFunc(c[0],c[1]),!0},b.WebGLBlendModeManager.prototype.destroy=function(){this.gl=null},b.WebGLMaskManager=function(){},b.WebGLMaskManager.prototype.constructor=b.WebGLMaskManager,b.WebGLMaskManager.prototype.setContext=function(a){this.gl=a},b.WebGLMaskManager.prototype.pushMask=function(a,c){var d=c.gl;a.dirty&&b.WebGLGraphics.updateGraphics(a,d),a._webGL[d.id].data.length&&c.stencilManager.pushStencil(a,a._webGL[d.id].data[0],c)},b.WebGLMaskManager.prototype.popMask=function(a,b){var c=this.gl;b.stencilManager.popStencil(a,a._webGL[c.id].data[0],b)},b.WebGLMaskManager.prototype.destroy=function(){this.gl=null},b.WebGLStencilManager=function(){this.stencilStack=[],this.reverse=!0,this.count=0},b.WebGLStencilManager.prototype.setContext=function(a){this.gl=a},b.WebGLStencilManager.prototype.pushStencil=function(a,b,c){var d=this.gl;this.bindGraphics(a,b,c),0===this.stencilStack.length&&(d.enable(d.STENCIL_TEST),d.clear(d.STENCIL_BUFFER_BIT),this.reverse=!0,this.count=0),this.stencilStack.push(b);var e=this.count;d.colorMask(!1,!1,!1,!1),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),1===b.mode?(d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),this.reverse?d.stencilFunc(d.EQUAL,255-(e+1),255):d.stencilFunc(d.EQUAL,e+1,255),this.reverse=!this.reverse):(this.reverse?(d.stencilFunc(d.EQUAL,e,255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,255-e,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e+1,255):d.stencilFunc(d.EQUAL,255-(e+1),255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP),this.count++},b.WebGLStencilManager.prototype.bindGraphics=function(a,c,d){this._currentGraphics=a;var e,f=this.gl,g=d.projection,h=d.offset;1===c.mode?(e=d.shaderManager.complexPrimitiveShader,d.shaderManager.setShader(e),f.uniform1f(e.flipY,d.flipY),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform3fv(e.color,c.color),f.uniform1f(e.alpha,a.worldAlpha*c.alpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,8,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer)):(e=d.shaderManager.primitiveShader,d.shaderManager.setShader(e),f.uniformMatrix3fv(e.translationMatrix,!1,a.worldTransform.toArray(!0)),f.uniform1f(e.flipY,d.flipY),f.uniform2f(e.projectionVector,g.x,-g.y),f.uniform2f(e.offsetVector,-h.x,-h.y),f.uniform3fv(e.tintColor,b.hex2rgb(a.tint)),f.uniform1f(e.alpha,a.worldAlpha),f.bindBuffer(f.ARRAY_BUFFER,c.buffer),f.vertexAttribPointer(e.aVertexPosition,2,f.FLOAT,!1,24,0),f.vertexAttribPointer(e.colorAttribute,4,f.FLOAT,!1,24,8),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,c.indexBuffer))},b.WebGLStencilManager.prototype.popStencil=function(a,b,c){var d=this.gl;if(this.stencilStack.pop(),this.count--,0===this.stencilStack.length)d.disable(d.STENCIL_TEST);else{var e=this.count;this.bindGraphics(a,b,c),d.colorMask(!1,!1,!1,!1),1===b.mode?(this.reverse=!this.reverse,this.reverse?(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)):(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)),d.drawElements(d.TRIANGLE_FAN,4,d.UNSIGNED_SHORT,2*(b.indices.length-4)),d.stencilFunc(d.ALWAYS,0,255),d.stencilOp(d.KEEP,d.KEEP,d.INVERT),d.drawElements(d.TRIANGLE_FAN,b.indices.length-4,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)):(this.reverse?(d.stencilFunc(d.EQUAL,e+1,255),d.stencilOp(d.KEEP,d.KEEP,d.DECR)):(d.stencilFunc(d.EQUAL,255-(e+1),255),d.stencilOp(d.KEEP,d.KEEP,d.INCR)),d.drawElements(d.TRIANGLE_STRIP,b.indices.length,d.UNSIGNED_SHORT,0),this.reverse?d.stencilFunc(d.EQUAL,e,255):d.stencilFunc(d.EQUAL,255-e,255)),d.colorMask(!0,!0,!0,!0),d.stencilOp(d.KEEP,d.KEEP,d.KEEP)}},b.WebGLStencilManager.prototype.destroy=function(){this.stencilStack=null,this.gl=null},b.WebGLShaderManager=function(){this.maxAttibs=10,this.attribState=[],this.tempAttribState=[];for(var a=0;a<this.maxAttibs;a++)this.attribState[a]=!1;this.stack=[]},b.WebGLShaderManager.prototype.constructor=b.WebGLShaderManager,b.WebGLShaderManager.prototype.setContext=function(a){this.gl=a,this.primitiveShader=new b.PrimitiveShader(a),this.complexPrimitiveShader=new b.ComplexPrimitiveShader(a),this.defaultShader=new b.PixiShader(a),this.fastShader=new b.PixiFastShader(a),this.stripShader=new b.StripShader(a),this.setShader(this.defaultShader)},b.WebGLShaderManager.prototype.setAttribs=function(a){var b;for(b=0;b<this.tempAttribState.length;b++)this.tempAttribState[b]=!1;for(b=0;b<a.length;b++){var c=a[b];this.tempAttribState[c]=!0}var d=this.gl;for(b=0;b<this.attribState.length;b++)this.attribState[b]!==this.tempAttribState[b]&&(this.attribState[b]=this.tempAttribState[b],this.tempAttribState[b]?d.enableVertexAttribArray(b):d.disableVertexAttribArray(b))},b.WebGLShaderManager.prototype.setShader=function(a){return this._currentId===a._UID?!1:(this._currentId=a._UID,this.currentShader=a,this.gl.useProgram(a.program),this.setAttribs(a.attributes),!0)},b.WebGLShaderManager.prototype.destroy=function(){this.attribState=null,this.tempAttribState=null,this.primitiveShader.destroy(),this.complexPrimitiveShader.destroy(),this.defaultShader.destroy(),this.fastShader.destroy(),this.stripShader.destroy(),this.gl=null},b.WebGLSpriteBatch=function(){this.vertSize=5,this.size=2e3;var a=4*this.size*4*this.vertSize,c=6*this.size;this.vertices=new b.ArrayBuffer(a),this.positions=new b.Float32Array(this.vertices),this.colors=new b.Uint32Array(this.vertices),this.indices=new b.Uint16Array(c),this.lastIndexCount=0;for(var d=0,e=0;c>d;d+=6,e+=4)this.indices[d+0]=e+0,this.indices[d+1]=e+1,this.indices[d+2]=e+2,this.indices[d+3]=e+0,this.indices[d+4]=e+2,this.indices[d+5]=e+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.dirty=!0,this.textures=[],this.blendModes=[],this.shaders=[],this.sprites=[],this.defaultShader=new b.AbstractFilter(["precision lowp float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * vColor ;","}"])},b.WebGLSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW),this.currentBlendMode=99999;var c=new b.PixiShader(a);c.fragmentSrc=this.defaultShader.fragmentSrc,c.uniforms={},c.init(),this.defaultShader.shaders[a.id]=c},b.WebGLSpriteBatch.prototype.begin=function(a){this.renderSession=a,this.shader=this.renderSession.shaderManager.defaultShader,this.start()},b.WebGLSpriteBatch.prototype.end=function(){this.flush()},b.WebGLSpriteBatch.prototype.render=function(a){var b=a.texture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=b.baseTexture);var c=b._uvs;if(c){var d,e,f,g,h=a.anchor.x,i=a.anchor.y;if(b.trim){var j=b.trim;e=j.x-h*j.width,d=e+b.crop.width,g=j.y-i*j.height,f=g+b.crop.height}else d=b.frame.width*(1-h),e=b.frame.width*-h,f=b.frame.height*(1-i),g=b.frame.height*-i;var k=4*this.currentBatchSize*this.vertSize,l=b.baseTexture.resolution,m=a.worldTransform,n=m.a/l,o=m.b/l,p=m.c/l,q=m.d/l,r=m.tx,s=m.ty,t=this.colors,u=this.positions;this.renderSession.roundPixels?(u[k]=n*e+p*g+r|0,u[k+1]=q*g+o*e+s|0,u[k+5]=n*d+p*g+r|0,u[k+6]=q*g+o*d+s|0,u[k+10]=n*d+p*f+r|0,u[k+11]=q*f+o*d+s|0,u[k+15]=n*e+p*f+r|0,u[k+16]=q*f+o*e+s|0):(u[k]=n*e+p*g+r,u[k+1]=q*g+o*e+s,u[k+5]=n*d+p*g+r,u[k+6]=q*g+o*d+s,u[k+10]=n*d+p*f+r,u[k+11]=q*f+o*d+s,u[k+15]=n*e+p*f+r,u[k+16]=q*f+o*e+s),u[k+2]=c.x0,u[k+3]=c.y0,u[k+7]=c.x1,u[k+8]=c.y1,u[k+12]=c.x2,u[k+13]=c.y2,u[k+17]=c.x3,u[k+18]=c.y3;var v=a.tint;t[k+4]=t[k+9]=t[k+14]=t[k+19]=(v>>16)+(65280&v)+((255&v)<<16)+(255*a.worldAlpha<<24),this.sprites[this.currentBatchSize++]=a}},b.WebGLSpriteBatch.prototype.renderTilingSprite=function(a){var c=a.tilingTexture;this.currentBatchSize>=this.size&&(this.flush(),this.currentBaseTexture=c.baseTexture),a._uvs||(a._uvs=new b.TextureUvs);var d=a._uvs;a.tilePosition.x%=c.baseTexture.width*a.tileScaleOffset.x,a.tilePosition.y%=c.baseTexture.height*a.tileScaleOffset.y;var e=a.tilePosition.x/(c.baseTexture.width*a.tileScaleOffset.x),f=a.tilePosition.y/(c.baseTexture.height*a.tileScaleOffset.y),g=a.width/c.baseTexture.width/(a.tileScale.x*a.tileScaleOffset.x),h=a.height/c.baseTexture.height/(a.tileScale.y*a.tileScaleOffset.y);d.x0=0-e,d.y0=0-f,d.x1=1*g-e,d.y1=0-f,d.x2=1*g-e,d.y2=1*h-f,d.x3=0-e,d.y3=1*h-f;var i=a.tint,j=(i>>16)+(65280&i)+((255&i)<<16)+(255*a.alpha<<24),k=this.positions,l=this.colors,m=a.width,n=a.height,o=a.anchor.x,p=a.anchor.y,q=m*(1-o),r=m*-o,s=n*(1-p),t=n*-p,u=4*this.currentBatchSize*this.vertSize,v=c.baseTexture.resolution,w=a.worldTransform,x=w.a/v,y=w.b/v,z=w.c/v,A=w.d/v,B=w.tx,C=w.ty;k[u++]=x*r+z*t+B,k[u++]=A*t+y*r+C,k[u++]=d.x0,k[u++]=d.y0,l[u++]=j,k[u++]=x*q+z*t+B,k[u++]=A*t+y*q+C,k[u++]=d.x1,k[u++]=d.y1,l[u++]=j,k[u++]=x*q+z*s+B,k[u++]=A*s+y*q+C,k[u++]=d.x2,k[u++]=d.y2,l[u++]=j,k[u++]=x*r+z*s+B,k[u++]=A*s+y*r+C,k[u++]=d.x3,k[u++]=d.y3,l[u++]=j,this.sprites[this.currentBatchSize++]=a},b.WebGLSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a,c=this.gl;if(this.dirty){this.dirty=!1,c.activeTexture(c.TEXTURE0),c.bindBuffer(c.ARRAY_BUFFER,this.vertexBuffer),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a=this.defaultShader.shaders[c.id];var d=4*this.vertSize;c.vertexAttribPointer(a.aVertexPosition,2,c.FLOAT,!1,d,0),c.vertexAttribPointer(a.aTextureCoord,2,c.FLOAT,!1,d,8),c.vertexAttribPointer(a.colorAttribute,4,c.UNSIGNED_BYTE,!0,d,16)}if(this.currentBatchSize>.5*this.size)c.bufferSubData(c.ARRAY_BUFFER,0,this.vertices);else{var e=this.positions.subarray(0,4*this.currentBatchSize*this.vertSize);c.bufferSubData(c.ARRAY_BUFFER,0,e)}for(var f,g,h,i,j=0,k=0,l=null,m=this.renderSession.blendModeManager.currentBlendMode,n=null,o=!1,p=!1,q=0,r=this.currentBatchSize;r>q;q++){if(i=this.sprites[q],f=i.texture.baseTexture,g=i.blendMode,h=i.shader||this.defaultShader,o=m!==g,p=n!==h,(l!==f||o||p)&&(this.renderBatch(l,j,k),k=q,j=0,l=f,o&&(m=g,this.renderSession.blendModeManager.setBlendMode(m)),p)){n=h,a=n.shaders[c.id],a||(a=new b.PixiShader(c),a.fragmentSrc=n.fragmentSrc,a.uniforms=n.uniforms,a.init(),n.shaders[c.id]=a),this.renderSession.shaderManager.setShader(a),a.dirty&&a.syncUniforms();var s=this.renderSession.projection;c.uniform2f(a.projectionVector,s.x,s.y);var t=this.renderSession.offset;c.uniform2f(a.offsetVector,t.x,t.y)}j++}this.renderBatch(l,j,k),this.currentBatchSize=0}},b.WebGLSpriteBatch.prototype.renderBatch=function(a,b,c){if(0!==b){var d=this.gl;a._dirty[d.id]?this.renderSession.renderer.updateTexture(a):d.bindTexture(d.TEXTURE_2D,a._glTextures[d.id]),d.drawElements(d.TRIANGLES,6*b,d.UNSIGNED_SHORT,6*c*2),this.renderSession.drawCount++}},b.WebGLSpriteBatch.prototype.stop=function(){this.flush(),this.dirty=!0},b.WebGLSpriteBatch.prototype.start=function(){this.dirty=!0},b.WebGLSpriteBatch.prototype.destroy=function(){this.vertices=null,this.indices=null,this.gl.deleteBuffer(this.vertexBuffer),this.gl.deleteBuffer(this.indexBuffer),this.currentBaseTexture=null,this.gl=null},b.WebGLFastSpriteBatch=function(a){this.vertSize=10,this.maxSize=6e3,this.size=this.maxSize;var c=4*this.size*this.vertSize,d=6*this.maxSize;this.vertices=new b.Float32Array(c),this.indices=new b.Uint16Array(d),this.vertexBuffer=null,this.indexBuffer=null,this.lastIndexCount=0;for(var e=0,f=0;d>e;e+=6,f+=4)this.indices[e+0]=f+0,this.indices[e+1]=f+1,this.indices[e+2]=f+2,this.indices[e+3]=f+0,this.indices[e+4]=f+2,this.indices[e+5]=f+3;this.drawing=!1,this.currentBatchSize=0,this.currentBaseTexture=null,this.currentBlendMode=0,this.renderSession=null,this.shader=null,this.matrix=null,this.setContext(a)},b.WebGLFastSpriteBatch.prototype.constructor=b.WebGLFastSpriteBatch,b.WebGLFastSpriteBatch.prototype.setContext=function(a){this.gl=a,this.vertexBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,this.indices,a.STATIC_DRAW),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertices,a.DYNAMIC_DRAW)},b.WebGLFastSpriteBatch.prototype.begin=function(a,b){this.renderSession=b,this.shader=this.renderSession.shaderManager.fastShader,this.matrix=a.worldTransform.toArray(!0),this.start()},b.WebGLFastSpriteBatch.prototype.end=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.render=function(a){var b=a.children,c=b[0];if(c.texture._uvs){this.currentBaseTexture=c.texture.baseTexture,c.blendMode!==this.renderSession.blendModeManager.currentBlendMode&&(this.flush(),this.renderSession.blendModeManager.setBlendMode(c.blendMode));for(var d=0,e=b.length;e>d;d++)this.renderSprite(b[d]);this.flush()}},b.WebGLFastSpriteBatch.prototype.renderSprite=function(a){if(a.visible&&(a.texture.baseTexture===this.currentBaseTexture||(this.flush(),this.currentBaseTexture=a.texture.baseTexture,a.texture._uvs))){var b,c,d,e,f,g,h,i,j=this.vertices;if(b=a.texture._uvs,c=a.texture.frame.width,d=a.texture.frame.height,a.texture.trim){var k=a.texture.trim;f=k.x-a.anchor.x*k.width,e=f+a.texture.crop.width,h=k.y-a.anchor.y*k.height,g=h+a.texture.crop.height}else e=a.texture.frame.width*(1-a.anchor.x),f=a.texture.frame.width*-a.anchor.x,g=a.texture.frame.height*(1-a.anchor.y),h=a.texture.frame.height*-a.anchor.y;i=4*this.currentBatchSize*this.vertSize,j[i++]=f,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x0,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=h,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x1,j[i++]=b.y1,j[i++]=a.alpha,j[i++]=e,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x2,j[i++]=b.y2,j[i++]=a.alpha,j[i++]=f,j[i++]=g,j[i++]=a.position.x,j[i++]=a.position.y,j[i++]=a.scale.x,j[i++]=a.scale.y,j[i++]=a.rotation,j[i++]=b.x3,j[i++]=b.y3,j[i++]=a.alpha,this.currentBatchSize++,this.currentBatchSize>=this.size&&this.flush()}},b.WebGLFastSpriteBatch.prototype.flush=function(){if(0!==this.currentBatchSize){var a=this.gl;if(this.currentBaseTexture._glTextures[a.id]||this.renderSession.renderer.updateTexture(this.currentBaseTexture,a),a.bindTexture(a.TEXTURE_2D,this.currentBaseTexture._glTextures[a.id]),this.currentBatchSize>.5*this.size)a.bufferSubData(a.ARRAY_BUFFER,0,this.vertices);else{var b=this.vertices.subarray(0,4*this.currentBatchSize*this.vertSize);a.bufferSubData(a.ARRAY_BUFFER,0,b)}a.drawElements(a.TRIANGLES,6*this.currentBatchSize,a.UNSIGNED_SHORT,0),this.currentBatchSize=0,this.renderSession.drawCount++}},b.WebGLFastSpriteBatch.prototype.stop=function(){this.flush()},b.WebGLFastSpriteBatch.prototype.start=function(){var a=this.gl;a.activeTexture(a.TEXTURE0),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer);var b=this.renderSession.projection;a.uniform2f(this.shader.projectionVector,b.x,b.y),a.uniformMatrix3fv(this.shader.uMatrix,!1,this.matrix);var c=4*this.vertSize;a.vertexAttribPointer(this.shader.aVertexPosition,2,a.FLOAT,!1,c,0),a.vertexAttribPointer(this.shader.aPositionCoord,2,a.FLOAT,!1,c,8),a.vertexAttribPointer(this.shader.aScale,2,a.FLOAT,!1,c,16),a.vertexAttribPointer(this.shader.aRotation,1,a.FLOAT,!1,c,24),a.vertexAttribPointer(this.shader.aTextureCoord,2,a.FLOAT,!1,c,28),a.vertexAttribPointer(this.shader.colorAttribute,1,a.FLOAT,!1,c,36)},b.WebGLFilterManager=function(){this.filterStack=[],this.offsetX=0,this.offsetY=0},b.WebGLFilterManager.prototype.constructor=b.WebGLFilterManager,b.WebGLFilterManager.prototype.setContext=function(a){this.gl=a,this.texturePool=[],this.initShaderBuffers()},b.WebGLFilterManager.prototype.begin=function(a,b){this.renderSession=a,this.defaultShader=a.shaderManager.defaultShader;var c=this.renderSession.projection;this.width=2*c.x,this.height=2*-c.y,this.buffer=b},b.WebGLFilterManager.prototype.pushFilter=function(a){var c=this.gl,d=this.renderSession.projection,e=this.renderSession.offset;a._filterArea=a.target.filterArea||a.target.getBounds(),this.filterStack.push(a);var f=a.filterPasses[0];this.offsetX+=a._filterArea.x,this.offsetY+=a._filterArea.y;var g=this.texturePool.pop();g?g.resize(this.width,this.height):g=new b.FilterTexture(this.gl,this.width,this.height),c.bindTexture(c.TEXTURE_2D,g.texture);var h=a._filterArea,i=f.padding;h.x-=i,h.y-=i,h.width+=2*i,h.height+=2*i,h.x<0&&(h.x=0),h.width>this.width&&(h.width=this.width),h.y<0&&(h.y=0),h.height>this.height&&(h.height=this.height),c.bindFramebuffer(c.FRAMEBUFFER,g.frameBuffer),c.viewport(0,0,h.width,h.height),d.x=h.width/2,d.y=-h.height/2,e.x=-h.x,e.y=-h.y,c.colorMask(!0,!0,!0,!0),c.clearColor(0,0,0,0),c.clear(c.COLOR_BUFFER_BIT),a._glFilterTexture=g},b.WebGLFilterManager.prototype.popFilter=function(){var a=this.gl,c=this.filterStack.pop(),d=c._filterArea,e=c._glFilterTexture,f=this.renderSession.projection,g=this.renderSession.offset;if(c.filterPasses.length>1){a.viewport(0,0,d.width,d.height),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=0,this.vertexArray[1]=d.height,this.vertexArray[2]=d.width,this.vertexArray[3]=d.height,this.vertexArray[4]=0,this.vertexArray[5]=0,this.vertexArray[6]=d.width,this.vertexArray[7]=0,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray);var h=e,i=this.texturePool.pop();i||(i=new b.FilterTexture(this.gl,this.width,this.height)),i.resize(this.width,this.height),a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.clear(a.COLOR_BUFFER_BIT),a.disable(a.BLEND);for(var j=0;j<c.filterPasses.length-1;j++){var k=c.filterPasses[j];a.bindFramebuffer(a.FRAMEBUFFER,i.frameBuffer),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,h.texture),this.applyFilterPass(k,d,d.width,d.height);var l=h;h=i,i=l}a.enable(a.BLEND),e=h,this.texturePool.push(i)}var m=c.filterPasses[c.filterPasses.length-1];this.offsetX-=d.x,this.offsetY-=d.y;var n=this.width,o=this.height,p=0,q=0,r=this.buffer;if(0===this.filterStack.length)a.colorMask(!0,!0,!0,!0);else{var s=this.filterStack[this.filterStack.length-1];d=s._filterArea,n=d.width,o=d.height,p=d.x,q=d.y,r=s._glFilterTexture.frameBuffer}f.x=n/2,f.y=-o/2,g.x=p,g.y=q,d=c._filterArea;var t=d.x-p,u=d.y-q;a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),this.vertexArray[0]=t,this.vertexArray[1]=u+d.height,this.vertexArray[2]=t+d.width,this.vertexArray[3]=u+d.height,this.vertexArray[4]=t,this.vertexArray[5]=u,this.vertexArray[6]=t+d.width,this.vertexArray[7]=u,a.bufferSubData(a.ARRAY_BUFFER,0,this.vertexArray),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),this.uvArray[2]=d.width/this.width,this.uvArray[5]=d.height/this.height,this.uvArray[6]=d.width/this.width,this.uvArray[7]=d.height/this.height,a.bufferSubData(a.ARRAY_BUFFER,0,this.uvArray),a.viewport(0,0,n,o),a.bindFramebuffer(a.FRAMEBUFFER,r),a.activeTexture(a.TEXTURE0),a.bindTexture(a.TEXTURE_2D,e.texture),this.applyFilterPass(m,d,n,o),this.texturePool.push(e),c._glFilterTexture=null},b.WebGLFilterManager.prototype.applyFilterPass=function(a,c,d,e){var f=this.gl,g=a.shaders[f.id];g||(g=new b.PixiShader(f),g.fragmentSrc=a.fragmentSrc,g.uniforms=a.uniforms,g.init(),a.shaders[f.id]=g),this.renderSession.shaderManager.setShader(g),f.uniform2f(g.projectionVector,d/2,-e/2),f.uniform2f(g.offsetVector,0,0),a.uniforms.dimensions&&(a.uniforms.dimensions.value[0]=this.width,a.uniforms.dimensions.value[1]=this.height,a.uniforms.dimensions.value[2]=this.vertexArray[0],a.uniforms.dimensions.value[3]=this.vertexArray[5]),g.syncUniforms(),f.bindBuffer(f.ARRAY_BUFFER,this.vertexBuffer),f.vertexAttribPointer(g.aVertexPosition,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.uvBuffer),f.vertexAttribPointer(g.aTextureCoord,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ARRAY_BUFFER,this.colorBuffer),f.vertexAttribPointer(g.colorAttribute,2,f.FLOAT,!1,0,0),f.bindBuffer(f.ELEMENT_ARRAY_BUFFER,this.indexBuffer),f.drawElements(f.TRIANGLES,6,f.UNSIGNED_SHORT,0),this.renderSession.drawCount++},b.WebGLFilterManager.prototype.initShaderBuffers=function(){var a=this.gl;this.vertexBuffer=a.createBuffer(),this.uvBuffer=a.createBuffer(),this.colorBuffer=a.createBuffer(),this.indexBuffer=a.createBuffer(),this.vertexArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.vertexBuffer),a.bufferData(a.ARRAY_BUFFER,this.vertexArray,a.STATIC_DRAW),this.uvArray=new b.Float32Array([0,0,1,0,0,1,1,1]),a.bindBuffer(a.ARRAY_BUFFER,this.uvBuffer),a.bufferData(a.ARRAY_BUFFER,this.uvArray,a.STATIC_DRAW),this.colorArray=new b.Float32Array([1,16777215,1,16777215,1,16777215,1,16777215]),a.bindBuffer(a.ARRAY_BUFFER,this.colorBuffer),a.bufferData(a.ARRAY_BUFFER,this.colorArray,a.STATIC_DRAW),a.bindBuffer(a.ELEMENT_ARRAY_BUFFER,this.indexBuffer),a.bufferData(a.ELEMENT_ARRAY_BUFFER,new Uint16Array([0,1,2,1,3,2]),a.STATIC_DRAW)},b.WebGLFilterManager.prototype.destroy=function(){var a=this.gl;this.filterStack=null,this.offsetX=0,this.offsetY=0;for(var b=0;b<this.texturePool.length;b++)this.texturePool[b].destroy();this.texturePool=null,a.deleteBuffer(this.vertexBuffer),a.deleteBuffer(this.uvBuffer),a.deleteBuffer(this.colorBuffer),a.deleteBuffer(this.indexBuffer)},b.FilterTexture=function(a,c,d,e){this.gl=a,this.frameBuffer=a.createFramebuffer(),this.texture=a.createTexture(),e=e||b.scaleModes.DEFAULT,a.bindTexture(a.TEXTURE_2D,this.texture),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MAG_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_MIN_FILTER,e===b.scaleModes.LINEAR?a.LINEAR:a.NEAREST),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_S,a.CLAMP_TO_EDGE),a.texParameteri(a.TEXTURE_2D,a.TEXTURE_WRAP_T,a.CLAMP_TO_EDGE),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.bindFramebuffer(a.FRAMEBUFFER,this.frameBuffer),a.framebufferTexture2D(a.FRAMEBUFFER,a.COLOR_ATTACHMENT0,a.TEXTURE_2D,this.texture,0),this.renderBuffer=a.createRenderbuffer(),a.bindRenderbuffer(a.RENDERBUFFER,this.renderBuffer),a.framebufferRenderbuffer(a.FRAMEBUFFER,a.DEPTH_STENCIL_ATTACHMENT,a.RENDERBUFFER,this.renderBuffer),this.resize(c,d)
},b.FilterTexture.prototype.constructor=b.FilterTexture,b.FilterTexture.prototype.clear=function(){var a=this.gl;a.clearColor(0,0,0,0),a.clear(a.COLOR_BUFFER_BIT)},b.FilterTexture.prototype.resize=function(a,b){if(this.width!==a||this.height!==b){this.width=a,this.height=b;var c=this.gl;c.bindTexture(c.TEXTURE_2D,this.texture),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,a,b,0,c.RGBA,c.UNSIGNED_BYTE,null),c.bindRenderbuffer(c.RENDERBUFFER,this.renderBuffer),c.renderbufferStorage(c.RENDERBUFFER,c.DEPTH_STENCIL,a,b)}},b.FilterTexture.prototype.destroy=function(){var a=this.gl;a.deleteFramebuffer(this.frameBuffer),a.deleteTexture(this.texture),this.frameBuffer=null,this.texture=null},b.CanvasBuffer=function(a,b){this.width=a,this.height=b,this.canvas=document.createElement("canvas"),this.context=this.canvas.getContext("2d"),this.canvas.width=a,this.canvas.height=b},b.CanvasBuffer.prototype.constructor=b.CanvasBuffer,b.CanvasBuffer.prototype.clear=function(){this.context.setTransform(1,0,0,1,0,0),this.context.clearRect(0,0,this.width,this.height)},b.CanvasBuffer.prototype.resize=function(a,b){this.width=this.canvas.width=a,this.height=this.canvas.height=b},b.CanvasMaskManager=function(){},b.CanvasMaskManager.prototype.constructor=b.CanvasMaskManager,b.CanvasMaskManager.prototype.pushMask=function(a,c){var d=c.context;d.save();var e=a.alpha,f=a.worldTransform,g=c.resolution;d.setTransform(f.a*g,f.b*g,f.c*g,f.d*g,f.tx*g,f.ty*g),b.CanvasGraphics.renderGraphicsMask(a,d),d.clip(),a.worldAlpha=e},b.CanvasMaskManager.prototype.popMask=function(a){a.context.restore()},b.CanvasTinter=function(){},b.CanvasTinter.getTintedTexture=function(a,c){var d=a.texture;c=b.CanvasTinter.roundColor(c);var e="#"+("00000"+(0|c).toString(16)).substr(-6);if(d.tintCache=d.tintCache||{},d.tintCache[e])return d.tintCache[e];var f=b.CanvasTinter.canvas||document.createElement("canvas");if(b.CanvasTinter.tintMethod(d,c,f),b.CanvasTinter.convertTintToImage){var g=new Image;g.src=f.toDataURL(),d.tintCache[e]=g}else d.tintCache[e]=f,b.CanvasTinter.canvas=null;return f},b.CanvasTinter.tintWithMultiply=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="multiply",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithOverlay=function(a,b,c){var d=c.getContext("2d"),e=a.crop;c.width=e.width,c.height=e.height,d.globalCompositeOperation="copy",d.fillStyle="#"+("00000"+(0|b).toString(16)).substr(-6),d.fillRect(0,0,e.width,e.height),d.globalCompositeOperation="destination-atop",d.drawImage(a.baseTexture.source,e.x,e.y,e.width,e.height,0,0,e.width,e.height)},b.CanvasTinter.tintWithPerPixel=function(a,c,d){var e=d.getContext("2d"),f=a.crop;d.width=f.width,d.height=f.height,e.globalCompositeOperation="copy",e.drawImage(a.baseTexture.source,f.x,f.y,f.width,f.height,0,0,f.width,f.height);for(var g=b.hex2rgb(c),h=g[0],i=g[1],j=g[2],k=e.getImageData(0,0,f.width,f.height),l=k.data,m=0;m<l.length;m+=4)l[m+0]*=h,l[m+1]*=i,l[m+2]*=j;e.putImageData(k,0,0)},b.CanvasTinter.roundColor=function(a){var c=b.CanvasTinter.cacheStepsPerColorChannel,d=b.hex2rgb(a);return d[0]=Math.min(255,d[0]/c*c),d[1]=Math.min(255,d[1]/c*c),d[2]=Math.min(255,d[2]/c*c),b.rgb2hex(d)},b.CanvasTinter.cacheStepsPerColorChannel=8,b.CanvasTinter.convertTintToImage=!1,b.CanvasTinter.canUseMultiply=b.canUseNewCanvasBlendModes(),b.CanvasTinter.tintMethod=b.CanvasTinter.canUseMultiply?b.CanvasTinter.tintWithMultiply:b.CanvasTinter.tintWithPerPixel,b.CanvasRenderer=function(a,c,d){if(d)for(var e in b.defaultRenderOptions)"undefined"==typeof d[e]&&(d[e]=b.defaultRenderOptions[e]);else d=b.defaultRenderOptions;b.defaultRenderer||(b.sayHello("Canvas"),b.defaultRenderer=this),this.type=b.CANVAS_RENDERER,this.resolution=d.resolution,this.clearBeforeRender=d.clearBeforeRender,this.transparent=d.transparent,this.autoResize=d.autoResize||!1,this.width=a||800,this.height=c||600,this.width*=this.resolution,this.height*=this.resolution,this.view=d.view||document.createElement("canvas"),this.context=this.view.getContext("2d",{alpha:this.transparent}),this.refresh=!0,this.view.width=this.width*this.resolution,this.view.height=this.height*this.resolution,this.count=0,this.maskManager=new b.CanvasMaskManager,this.renderSession={context:this.context,maskManager:this.maskManager,scaleMode:null,smoothProperty:null,roundPixels:!1},this.mapBlendModes(),this.resize(a,c),"imageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="imageSmoothingEnabled":"webkitImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="webkitImageSmoothingEnabled":"mozImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="mozImageSmoothingEnabled":"oImageSmoothingEnabled"in this.context?this.renderSession.smoothProperty="oImageSmoothingEnabled":"msImageSmoothingEnabled"in this.context&&(this.renderSession.smoothProperty="msImageSmoothingEnabled")},b.CanvasRenderer.prototype.constructor=b.CanvasRenderer,b.CanvasRenderer.prototype.render=function(a){a.updateTransform(),this.context.setTransform(1,0,0,1,0,0),this.context.globalAlpha=1,this.renderSession.currentBlendMode=b.blendModes.NORMAL,this.context.globalCompositeOperation=b.blendModesCanvas[b.blendModes.NORMAL],navigator.isCocoonJS&&this.view.screencanvas&&(this.context.fillStyle="black",this.context.clear()),this.clearBeforeRender&&(this.transparent?this.context.clearRect(0,0,this.width,this.height):(this.context.fillStyle=a.backgroundColorString,this.context.fillRect(0,0,this.width,this.height))),this.renderDisplayObject(a),a.interactive&&(a._interactiveEventsAdded||(a._interactiveEventsAdded=!0,a.interactionManager.setTarget(this)))},b.CanvasRenderer.prototype.destroy=function(a){"undefined"==typeof a&&(a=!0),a&&this.view.parent&&this.view.parent.removeChild(this.view),this.view=null,this.context=null,this.maskManager=null,this.renderSession=null},b.CanvasRenderer.prototype.resize=function(a,b){this.width=a*this.resolution,this.height=b*this.resolution,this.view.width=this.width,this.view.height=this.height,this.autoResize&&(this.view.style.width=this.width/this.resolution+"px",this.view.style.height=this.height/this.resolution+"px")},b.CanvasRenderer.prototype.renderDisplayObject=function(a,b){this.renderSession.context=b||this.context,this.renderSession.resolution=this.resolution,a._renderCanvas(this.renderSession)},b.CanvasRenderer.prototype.mapBlendModes=function(){b.blendModesCanvas||(b.blendModesCanvas=[],b.canUseNewCanvasBlendModes()?(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="multiply",b.blendModesCanvas[b.blendModes.SCREEN]="screen",b.blendModesCanvas[b.blendModes.OVERLAY]="overlay",b.blendModesCanvas[b.blendModes.DARKEN]="darken",b.blendModesCanvas[b.blendModes.LIGHTEN]="lighten",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="color-dodge",b.blendModesCanvas[b.blendModes.COLOR_BURN]="color-burn",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="hard-light",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="soft-light",b.blendModesCanvas[b.blendModes.DIFFERENCE]="difference",b.blendModesCanvas[b.blendModes.EXCLUSION]="exclusion",b.blendModesCanvas[b.blendModes.HUE]="hue",b.blendModesCanvas[b.blendModes.SATURATION]="saturation",b.blendModesCanvas[b.blendModes.COLOR]="color",b.blendModesCanvas[b.blendModes.LUMINOSITY]="luminosity"):(b.blendModesCanvas[b.blendModes.NORMAL]="source-over",b.blendModesCanvas[b.blendModes.ADD]="lighter",b.blendModesCanvas[b.blendModes.MULTIPLY]="source-over",b.blendModesCanvas[b.blendModes.SCREEN]="source-over",b.blendModesCanvas[b.blendModes.OVERLAY]="source-over",b.blendModesCanvas[b.blendModes.DARKEN]="source-over",b.blendModesCanvas[b.blendModes.LIGHTEN]="source-over",b.blendModesCanvas[b.blendModes.COLOR_DODGE]="source-over",b.blendModesCanvas[b.blendModes.COLOR_BURN]="source-over",b.blendModesCanvas[b.blendModes.HARD_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.SOFT_LIGHT]="source-over",b.blendModesCanvas[b.blendModes.DIFFERENCE]="source-over",b.blendModesCanvas[b.blendModes.EXCLUSION]="source-over",b.blendModesCanvas[b.blendModes.HUE]="source-over",b.blendModesCanvas[b.blendModes.SATURATION]="source-over",b.blendModesCanvas[b.blendModes.COLOR]="source-over",b.blendModesCanvas[b.blendModes.LUMINOSITY]="source-over"))},b.CanvasGraphics=function(){},b.CanvasGraphics.renderGraphics=function(a,c){var d=a.worldAlpha;a.dirty&&(this.updateGraphicsTint(a),a.dirty=!1);for(var e=0;e<a.graphicsData.length;e++){var f=a.graphicsData[e],g=f.shape,h=f._fillTint,i=f._lineTint;if(c.lineWidth=f.lineWidth,f.type===b.Graphics.POLY){c.beginPath();var j=g.points;c.moveTo(j[0],j[1]);for(var k=1;k<j.length/2;k++)c.lineTo(j[2*k],j[2*k+1]);g.closed&&c.lineTo(j[0],j[1]),j[0]===j[j.length-2]&&j[1]===j[j.length-1]&&c.closePath(),f.fill&&(c.globalAlpha=f.fillAlpha*d,c.fillStyle="#"+("00000"+(0|h).toString(16)).substr(-6),c.fill()),f.lineWidth&&(c.globalAlpha=f.lineAlpha*d,c.strokeStyle="#"+("00000"+(0|i).toString(16)).substr(-6),c.stroke())}else if(f.type===b.Graphics.RECT)(f.fillColor||0===f.fillColor)&&(c.globalAlpha=f.fillAlpha*d,c.fillStyle="#"+("00000"+(0|h).toString(16)).substr(-6),c.fillRect(g.x,g.y,g.width,g.height)),f.lineWidth&&(c.globalAlpha=f.lineAlpha*d,c.strokeStyle="#"+("00000"+(0|i).toString(16)).substr(-6),c.strokeRect(g.x,g.y,g.width,g.height));else if(f.type===b.Graphics.CIRC)c.beginPath(),c.arc(g.x,g.y,g.radius,0,2*Math.PI),c.closePath(),f.fill&&(c.globalAlpha=f.fillAlpha*d,c.fillStyle="#"+("00000"+(0|h).toString(16)).substr(-6),c.fill()),f.lineWidth&&(c.globalAlpha=f.lineAlpha*d,c.strokeStyle="#"+("00000"+(0|i).toString(16)).substr(-6),c.stroke());else if(f.type===b.Graphics.ELIP){var l=2*g.width,m=2*g.height,n=g.x-l/2,o=g.y-m/2;c.beginPath();var p=.5522848,q=l/2*p,r=m/2*p,s=n+l,t=o+m,u=n+l/2,v=o+m/2;c.moveTo(n,v),c.bezierCurveTo(n,v-r,u-q,o,u,o),c.bezierCurveTo(u+q,o,s,v-r,s,v),c.bezierCurveTo(s,v+r,u+q,t,u,t),c.bezierCurveTo(u-q,t,n,v+r,n,v),c.closePath(),f.fill&&(c.globalAlpha=f.fillAlpha*d,c.fillStyle="#"+("00000"+(0|h).toString(16)).substr(-6),c.fill()),f.lineWidth&&(c.globalAlpha=f.lineAlpha*d,c.strokeStyle="#"+("00000"+(0|i).toString(16)).substr(-6),c.stroke())}else if(f.type===b.Graphics.RREC){var w=g.x,x=g.y,y=g.width,z=g.height,A=g.radius,B=Math.min(y,z)/2|0;A=A>B?B:A,c.beginPath(),c.moveTo(w,x+A),c.lineTo(w,x+z-A),c.quadraticCurveTo(w,x+z,w+A,x+z),c.lineTo(w+y-A,x+z),c.quadraticCurveTo(w+y,x+z,w+y,x+z-A),c.lineTo(w+y,x+A),c.quadraticCurveTo(w+y,x,w+y-A,x),c.lineTo(w+A,x),c.quadraticCurveTo(w,x,w,x+A),c.closePath(),(f.fillColor||0===f.fillColor)&&(c.globalAlpha=f.fillAlpha*d,c.fillStyle="#"+("00000"+(0|h).toString(16)).substr(-6),c.fill()),f.lineWidth&&(c.globalAlpha=f.lineAlpha*d,c.strokeStyle="#"+("00000"+(0|i).toString(16)).substr(-6),c.stroke())}}},b.CanvasGraphics.renderGraphicsMask=function(a,c){var d=a.graphicsData.length;if(0!==d){d>1&&(d=1,window.console.log("Pixi.js warning: masks in canvas can only mask using the first path in the graphics object"));for(var e=0;1>e;e++){var f=a.graphicsData[e],g=f.shape;if(f.type===b.Graphics.POLY){c.beginPath();var h=g.points;c.moveTo(h[0],h[1]);for(var i=1;i<h.length/2;i++)c.lineTo(h[2*i],h[2*i+1]);h[0]===h[h.length-2]&&h[1]===h[h.length-1]&&c.closePath()}else if(f.type===b.Graphics.RECT)c.beginPath(),c.rect(g.x,g.y,g.width,g.height),c.closePath();else if(f.type===b.Graphics.CIRC)c.beginPath(),c.arc(g.x,g.y,g.radius,0,2*Math.PI),c.closePath();else if(f.type===b.Graphics.ELIP){var j=2*g.width,k=2*g.height,l=g.x-j/2,m=g.y-k/2;c.beginPath();var n=.5522848,o=j/2*n,p=k/2*n,q=l+j,r=m+k,s=l+j/2,t=m+k/2;c.moveTo(l,t),c.bezierCurveTo(l,t-p,s-o,m,s,m),c.bezierCurveTo(s+o,m,q,t-p,q,t),c.bezierCurveTo(q,t+p,s+o,r,s,r),c.bezierCurveTo(s-o,r,l,t+p,l,t),c.closePath()}else if(f.type===b.Graphics.RREC){var u=g.points,v=u[0],w=u[1],x=u[2],y=u[3],z=u[4],A=Math.min(x,y)/2|0;z=z>A?A:z,c.beginPath(),c.moveTo(v,w+z),c.lineTo(v,w+y-z),c.quadraticCurveTo(v,w+y,v+z,w+y),c.lineTo(v+x-z,w+y),c.quadraticCurveTo(v+x,w+y,v+x,w+y-z),c.lineTo(v+x,w+z),c.quadraticCurveTo(v+x,w,v+x-z,w),c.lineTo(v+z,w),c.quadraticCurveTo(v,w,v,w+z),c.closePath()}}}},b.CanvasGraphics.updateGraphicsTint=function(a){if(16777215!==a.tint)for(var b=(a.tint>>16&255)/255,c=(a.tint>>8&255)/255,d=(255&a.tint)/255,e=0;e<a.graphicsData.length;e++){var f=a.graphicsData[e],g=0|f.fillColor,h=0|f.lineColor;f._fillTint=((g>>16&255)/255*b*255<<16)+((g>>8&255)/255*c*255<<8)+(255&g)/255*d*255,f._lineTint=((h>>16&255)/255*b*255<<16)+((h>>8&255)/255*c*255<<8)+(255&h)/255*d*255}},b.Graphics=function(){b.DisplayObjectContainer.call(this),this.renderable=!0,this.fillAlpha=1,this.lineWidth=0,this.lineColor=0,this.graphicsData=[],this.tint=16777215,this.blendMode=b.blendModes.NORMAL,this.currentPath=null,this._webGL=[],this.isMask=!1,this.boundsPadding=0,this._localBounds=new b.Rectangle(0,0,1,1),this.dirty=!0,this.webGLDirty=!1,this.cachedSpriteDirty=!1},b.Graphics.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Graphics.prototype.constructor=b.Graphics,Object.defineProperty(b.Graphics.prototype,"cacheAsBitmap",{get:function(){return this._cacheAsBitmap},set:function(a){this._cacheAsBitmap=a,this._cacheAsBitmap?this._generateCachedSprite():(this.destroyCachedSprite(),this.dirty=!0)}}),b.Graphics.prototype.lineStyle=function(a,c,d){if(this.lineWidth=a||0,this.lineColor=c||0,this.lineAlpha=arguments.length<3?1:d,this.currentPath){if(this.currentPath.shape.points.length)return this.drawShape(new b.Polygon(this.currentPath.shape.points.slice(-2))),this;this.currentPath.lineWidth=this.lineWidth,this.currentPath.lineColor=this.lineColor,this.currentPath.lineAlpha=this.lineAlpha}return this},b.Graphics.prototype.moveTo=function(a,c){return this.drawShape(new b.Polygon([a,c])),this},b.Graphics.prototype.lineTo=function(a,b){return this.currentPath.shape.points.push(a,b),this.dirty=!0,this},b.Graphics.prototype.quadraticCurveTo=function(a,b,c,d){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);var e,f,g=20,h=this.currentPath.shape.points;0===h.length&&this.moveTo(0,0);for(var i=h[h.length-2],j=h[h.length-1],k=0,l=1;g>=l;l++)k=l/g,e=i+(a-i)*k,f=j+(b-j)*k,h.push(e+(a+(c-a)*k-e)*k,f+(b+(d-b)*k-f)*k);return this.dirty=!0,this},b.Graphics.prototype.bezierCurveTo=function(a,b,c,d,e,f){this.currentPath?0===this.currentPath.shape.points.length&&(this.currentPath.shape.points=[0,0]):this.moveTo(0,0);for(var g,h,i,j,k,l=20,m=this.currentPath.shape.points,n=m[m.length-2],o=m[m.length-1],p=0,q=1;l>=q;q++)p=q/l,g=1-p,h=g*g,i=h*g,j=p*p,k=j*p,m.push(i*n+3*h*p*a+3*g*j*c+k*e,i*o+3*h*p*b+3*g*j*d+k*f);return this.dirty=!0,this},b.Graphics.prototype.arcTo=function(a,b,c,d,e){this.currentPath?0===this.currentPath.shape.points.length&&this.currentPath.shape.points.push(a,b):this.moveTo(a,b);var f=this.currentPath.shape.points,g=f[f.length-2],h=f[f.length-1],i=h-b,j=g-a,k=d-b,l=c-a,m=Math.abs(i*l-j*k);if(1e-8>m||0===e)(f[f.length-2]!==a||f[f.length-1]!==b)&&f.push(a,b);else{var n=i*i+j*j,o=k*k+l*l,p=i*k+j*l,q=e*Math.sqrt(n)/m,r=e*Math.sqrt(o)/m,s=q*p/n,t=r*p/o,u=q*l+r*j,v=q*k+r*i,w=j*(r+s),x=i*(r+s),y=l*(q+t),z=k*(q+t),A=Math.atan2(x-v,w-u),B=Math.atan2(z-v,y-u);this.arc(u+a,v+b,e,A,B,j*k>l*i)}return this.dirty=!0,this},b.Graphics.prototype.arc=function(a,b,c,d,e,f){var g,h=a+Math.cos(d)*c,i=b+Math.sin(d)*c;if(this.currentPath?(g=this.currentPath.shape.points,0===g.length?g.push(h,i):(g[g.length-2]!==h||g[g.length-1]!==i)&&g.push(h,i)):(this.moveTo(h,i),g=this.currentPath.shape.points),d===e)return this;!f&&d>=e?e+=2*Math.PI:f&&e>=d&&(d+=2*Math.PI);var j=f?-1*(d-e):e-d,k=Math.abs(j)/(2*Math.PI)*40;if(0===j)return this;for(var l=j/(2*k),m=2*l,n=Math.cos(l),o=Math.sin(l),p=k-1,q=p%1/p,r=0;p>=r;r++){var s=r+q*r,t=l+d+m*s,u=Math.cos(t),v=-Math.sin(t);g.push((n*u+o*v)*c+a,(n*-v+o*u)*c+b)}return this.dirty=!0,this},b.Graphics.prototype.beginFill=function(a,b){return this.filling=!0,this.fillColor=a||0,this.fillAlpha=void 0===b?1:b,this.currentPath&&this.currentPath.shape.points.length<=2&&(this.currentPath.fill=this.filling,this.currentPath.fillColor=this.fillColor,this.currentPath.fillAlpha=this.fillAlpha),this},b.Graphics.prototype.endFill=function(){return this.filling=!1,this.fillColor=null,this.fillAlpha=1,this},b.Graphics.prototype.drawRect=function(a,c,d,e){return this.drawShape(new b.Rectangle(a,c,d,e)),this},b.Graphics.prototype.drawRoundedRect=function(a,c,d,e,f){return this.drawShape(new b.RoundedRectangle(a,c,d,e,f)),this},b.Graphics.prototype.drawCircle=function(a,c,d){return this.drawShape(new b.Circle(a,c,d)),this},b.Graphics.prototype.drawEllipse=function(a,c,d,e){return this.drawShape(new b.Ellipse(a,c,d,e)),this},b.Graphics.prototype.drawPolygon=function(a){return a instanceof Array||(a=Array.prototype.slice.call(arguments)),this.drawShape(new b.Polygon(a)),this},b.Graphics.prototype.clear=function(){return this.lineWidth=0,this.filling=!1,this.dirty=!0,this.clearDirty=!0,this.graphicsData=[],this},b.Graphics.prototype.generateTexture=function(a,c){a=a||1;var d=this.getBounds(),e=new b.CanvasBuffer(d.width*a,d.height*a),f=b.Texture.fromCanvas(e.canvas,c);return f.baseTexture.resolution=a,e.context.scale(a,a),e.context.translate(-d.x,-d.y),b.CanvasGraphics.renderGraphics(this,e.context),f},b.Graphics.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.worldAlpha=this.worldAlpha,b.Sprite.prototype._renderWebGL.call(this._cachedSprite,a),void 0;if(a.spriteBatch.stop(),a.blendModeManager.setBlendMode(this.blendMode),this._mask&&a.maskManager.pushMask(this._mask,a),this._filters&&a.filterManager.pushFilter(this._filterBlock),this.blendMode!==a.spriteBatch.currentBlendMode){a.spriteBatch.currentBlendMode=this.blendMode;var c=b.blendModesWebGL[a.spriteBatch.currentBlendMode];a.spriteBatch.gl.blendFunc(c[0],c[1])}if(this.webGLDirty&&(this.dirty=!0,this.webGLDirty=!1),b.WebGLGraphics.renderGraphics(this,a),this.children.length){a.spriteBatch.start();for(var d=0,e=this.children.length;e>d;d++)this.children[d]._renderWebGL(a);a.spriteBatch.stop()}this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this.mask,a),a.drawCount++,a.spriteBatch.start()}},b.Graphics.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha&&this.isMask!==!0){if(this._cacheAsBitmap)return(this.dirty||this.cachedSpriteDirty)&&(this._generateCachedSprite(),this.updateCachedSpriteTexture(),this.cachedSpriteDirty=!1,this.dirty=!1),this._cachedSprite.alpha=this.alpha,b.Sprite.prototype._renderCanvas.call(this._cachedSprite,a),void 0;var c=a.context,d=this.worldTransform;this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]),this._mask&&a.maskManager.pushMask(this._mask,a);var e=a.resolution;c.setTransform(d.a*e,d.b*e,d.c*e,d.d*e,d.tx*e,d.ty*e),b.CanvasGraphics.renderGraphics(this,c);for(var f=0,g=this.children.length;g>f;f++)this.children[f]._renderCanvas(a);this._mask&&a.maskManager.popMask(a)}},b.Graphics.prototype.getBounds=function(a){if(this.isMask)return b.EmptyRectangle;this.dirty&&(this.updateLocalBounds(),this.webGLDirty=!0,this.cachedSpriteDirty=!0,this.dirty=!1);var c=this._localBounds,d=c.x,e=c.width+c.x,f=c.y,g=c.height+c.y,h=a||this.worldTransform,i=h.a,j=h.b,k=h.c,l=h.d,m=h.tx,n=h.ty,o=i*e+k*g+m,p=l*g+j*e+n,q=i*d+k*g+m,r=l*g+j*d+n,s=i*d+k*f+m,t=l*f+j*d+n,u=i*e+k*f+m,v=l*f+j*e+n,w=o,x=p,y=o,z=p;return y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,z=z>r?r:z,z=z>t?t:z,z=z>v?v:z,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w,x=r>x?r:x,x=t>x?t:x,x=v>x?v:x,this._bounds.x=y,this._bounds.width=w-y,this._bounds.y=z,this._bounds.height=x-z,this._bounds},b.Graphics.prototype.updateLocalBounds=function(){var a=1/0,c=-1/0,d=1/0,e=-1/0;if(this.graphicsData.length)for(var f,g,h,i,j,k,l=0;l<this.graphicsData.length;l++){var m=this.graphicsData[l],n=m.type,o=m.lineWidth;if(f=m.shape,n===b.Graphics.RECT||n===b.Graphics.RREC)h=f.x-o/2,i=f.y-o/2,j=f.width+o,k=f.height+o,a=a>h?h:a,c=h+j>c?h+j:c,d=d>i?i:d,e=i+k>e?i+k:e;else if(n===b.Graphics.CIRC)h=f.x,i=f.y,j=f.radius+o/2,k=f.radius+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else if(n===b.Graphics.ELIP)h=f.x,i=f.y,j=f.width+o/2,k=f.height+o/2,a=a>h-j?h-j:a,c=h+j>c?h+j:c,d=d>i-k?i-k:d,e=i+k>e?i+k:e;else{g=f.points;for(var p=0;p<g.length;p+=2)h=g[p],i=g[p+1],a=a>h-o?h-o:a,c=h+o>c?h+o:c,d=d>i-o?i-o:d,e=i+o>e?i+o:e}}else a=0,c=0,d=0,e=0;var q=this.boundsPadding;this._localBounds.x=a-q,this._localBounds.width=c-a+2*q,this._localBounds.y=d-q,this._localBounds.height=e-d+2*q},b.Graphics.prototype._generateCachedSprite=function(){var a=this.getLocalBounds();if(this._cachedSprite)this._cachedSprite.buffer.resize(a.width,a.height);else{var c=new b.CanvasBuffer(a.width,a.height),d=b.Texture.fromCanvas(c.canvas);this._cachedSprite=new b.Sprite(d),this._cachedSprite.buffer=c,this._cachedSprite.worldTransform=this.worldTransform}this._cachedSprite.anchor.x=-(a.x/a.width),this._cachedSprite.anchor.y=-(a.y/a.height),this._cachedSprite.buffer.context.translate(-a.x,-a.y),this.worldAlpha=1,b.CanvasGraphics.renderGraphics(this,this._cachedSprite.buffer.context),this._cachedSprite.alpha=this.alpha},b.Graphics.prototype.updateCachedSpriteTexture=function(){var a=this._cachedSprite,b=a.texture,c=a.buffer.canvas;b.baseTexture.width=c.width,b.baseTexture.height=c.height,b.crop.width=b.frame.width=c.width,b.crop.height=b.frame.height=c.height,a._width=c.width,a._height=c.height,b.baseTexture.dirty()},b.Graphics.prototype.destroyCachedSprite=function(){this._cachedSprite.texture.destroy(!0),this._cachedSprite=null},b.Graphics.prototype.drawShape=function(a){this.currentPath&&this.currentPath.shape.points.length<=2&&this.graphicsData.pop(),this.currentPath=null;var c=new b.GraphicsData(this.lineWidth,this.lineColor,this.lineAlpha,this.fillColor,this.fillAlpha,this.filling,a);return this.graphicsData.push(c),c.type===b.Graphics.POLY&&(c.shape.closed=this.filling,this.currentPath=c),this.dirty=!0,c},b.GraphicsData=function(a,b,c,d,e,f,g){this.lineWidth=a,this.lineColor=b,this.lineAlpha=c,this._lineTint=b,this.fillColor=d,this.fillAlpha=e,this._fillTint=d,this.fill=f,this.shape=g,this.type=g.type},b.Graphics.POLY=0,b.Graphics.RECT=1,b.Graphics.CIRC=2,b.Graphics.ELIP=3,b.Graphics.RREC=4,b.Polygon.prototype.type=b.Graphics.POLY,b.Rectangle.prototype.type=b.Graphics.RECT,b.Circle.prototype.type=b.Graphics.CIRC,b.Ellipse.prototype.type=b.Graphics.ELIP,b.RoundedRectangle.prototype.type=b.Graphics.RREC,b.Strip=function(a){b.DisplayObjectContainer.call(this),this.texture=a,this.uvs=new b.Float32Array([0,1,1,1,1,0,0,1]),this.vertices=new b.Float32Array([0,0,100,0,100,100,0,100]),this.colors=new b.Float32Array([1,1,1,1]),this.indices=new b.Uint16Array([0,1,2,3]),this.dirty=!0,this.blendMode=b.blendModes.NORMAL,this.canvasPadding=0,this.drawMode=b.Strip.DrawModes.TRIANGLE_STRIP},b.Strip.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Strip.prototype.constructor=b.Strip,b.Strip.prototype._renderWebGL=function(a){!this.visible||this.alpha<=0||(a.spriteBatch.stop(),this._vertexBuffer||this._initWebGL(a),a.shaderManager.setShader(a.shaderManager.stripShader),this._renderStrip(a),a.spriteBatch.start())},b.Strip.prototype._initWebGL=function(a){var b=a.gl;this._vertexBuffer=b.createBuffer(),this._indexBuffer=b.createBuffer(),this._uvBuffer=b.createBuffer(),this._colorBuffer=b.createBuffer(),b.bindBuffer(b.ARRAY_BUFFER,this._vertexBuffer),b.bufferData(b.ARRAY_BUFFER,this.vertices,b.DYNAMIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._uvBuffer),b.bufferData(b.ARRAY_BUFFER,this.uvs,b.STATIC_DRAW),b.bindBuffer(b.ARRAY_BUFFER,this._colorBuffer),b.bufferData(b.ARRAY_BUFFER,this.colors,b.STATIC_DRAW),b.bindBuffer(b.ELEMENT_ARRAY_BUFFER,this._indexBuffer),b.bufferData(b.ELEMENT_ARRAY_BUFFER,this.indices,b.STATIC_DRAW)},b.Strip.prototype._renderStrip=function(a){var c=a.gl,d=a.projection,e=a.offset,f=a.shaderManager.stripShader,g=this.drawMode===b.Strip.DrawModes.TRIANGLE_STRIP?c.TRIANGLE_STRIP:c.TRIANGLES;a.blendModeManager.setBlendMode(this.blendMode),c.uniformMatrix3fv(f.translationMatrix,!1,this.worldTransform.toArray(!0)),c.uniform2f(f.projectionVector,d.x,-d.y),c.uniform2f(f.offsetVector,-e.x,-e.y),c.uniform1f(f.alpha,this.worldAlpha),this.dirty?(this.dirty=!1,c.bindBuffer(c.ARRAY_BUFFER,this._vertexBuffer),c.bufferData(c.ARRAY_BUFFER,this.vertices,c.STATIC_DRAW),c.vertexAttribPointer(f.aVertexPosition,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ARRAY_BUFFER,this._uvBuffer),c.bufferData(c.ARRAY_BUFFER,this.uvs,c.STATIC_DRAW),c.vertexAttribPointer(f.aTextureCoord,2,c.FLOAT,!1,0,0),c.activeTexture(c.TEXTURE0),this.texture.baseTexture._dirty[c.id]?a.renderer.updateTexture(this.texture.baseTexture):c.bindTexture(c.TEXTURE_2D,this.texture.baseTexture._glTextures[c.id]),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this._indexBuffer),c.bufferData(c.ELEMENT_ARRAY_BUFFER,this.indices,c.STATIC_DRAW)):(c.bindBuffer(c.ARRAY_BUFFER,this._vertexBuffer),c.bufferSubData(c.ARRAY_BUFFER,0,this.vertices),c.vertexAttribPointer(f.aVertexPosition,2,c.FLOAT,!1,0,0),c.bindBuffer(c.ARRAY_BUFFER,this._uvBuffer),c.vertexAttribPointer(f.aTextureCoord,2,c.FLOAT,!1,0,0),c.activeTexture(c.TEXTURE0),this.texture.baseTexture._dirty[c.id]?a.renderer.updateTexture(this.texture.baseTexture):c.bindTexture(c.TEXTURE_2D,this.texture.baseTexture._glTextures[c.id]),c.bindBuffer(c.ELEMENT_ARRAY_BUFFER,this._indexBuffer)),c.drawElements(g,this.indices.length,c.UNSIGNED_SHORT,0)},b.Strip.prototype._renderCanvas=function(a){var c=a.context,d=this.worldTransform;a.roundPixels?c.setTransform(d.a,d.b,d.c,d.d,0|d.tx,0|d.ty):c.setTransform(d.a,d.b,d.c,d.d,d.tx,d.ty),this.drawMode===b.Strip.DrawModes.TRIANGLE_STRIP?this._renderCanvasTriangleStrip(c):this._renderCanvasTriangles(c)},b.Strip.prototype._renderCanvasTriangleStrip=function(a){var b=this.vertices,c=this.uvs,d=b.length/2;this.count++;for(var e=0;d-2>e;e++){var f=2*e;this._renderCanvasDrawTriangle(a,b,c,f,f+2,f+4)}},b.Strip.prototype._renderCanvasTriangles=function(a){var b=this.vertices,c=this.uvs,d=this.indices,e=d.length;this.count++;for(var f=0;e>f;f+=3){var g=2*d[f],h=2*d[f+1],i=2*d[f+2];this._renderCanvasDrawTriangle(a,b,c,g,h,i)}},b.Strip.prototype._renderCanvasDrawTriangle=function(a,b,c,d,e,f){var g=this.texture.baseTexture.source,h=this.texture.width,i=this.texture.height,j=b[d],k=b[e],l=b[f],m=b[d+1],n=b[e+1],o=b[f+1],p=c[d]*h,q=c[e]*h,r=c[f]*h,s=c[d+1]*i,t=c[e+1]*i,u=c[f+1]*i;if(this.canvasPadding>0){var v=this.canvasPadding/this.worldTransform.a,w=this.canvasPadding/this.worldTransform.d,x=(j+k+l)/3,y=(m+n+o)/3,z=j-x,A=m-y,B=Math.sqrt(z*z+A*A);j=x+z/B*(B+v),m=y+A/B*(B+w),z=k-x,A=n-y,B=Math.sqrt(z*z+A*A),k=x+z/B*(B+v),n=y+A/B*(B+w),z=l-x,A=o-y,B=Math.sqrt(z*z+A*A),l=x+z/B*(B+v),o=y+A/B*(B+w)}a.save(),a.beginPath(),a.moveTo(j,m),a.lineTo(k,n),a.lineTo(l,o),a.closePath(),a.clip();var C=p*t+s*r+q*u-t*r-s*q-p*u,D=j*t+s*l+k*u-t*l-s*k-j*u,E=p*k+j*r+q*l-k*r-j*q-p*l,F=p*t*l+s*k*r+j*q*u-j*t*r-s*q*l-p*k*u,G=m*t+s*o+n*u-t*o-s*n-m*u,H=p*n+m*r+q*o-n*r-m*q-p*o,I=p*t*o+s*n*r+m*q*u-m*t*r-s*q*o-p*n*u;a.transform(D/C,G/C,E/C,H/C,F/C,I/C),a.drawImage(g,0,0),a.restore()},b.Strip.prototype.renderStripFlat=function(a){var b=this.context,c=a.vertices,d=c.length/2;this.count++,b.beginPath();for(var e=1;d-2>e;e++){var f=2*e,g=c[f],h=c[f+2],i=c[f+4],j=c[f+1],k=c[f+3],l=c[f+5];b.moveTo(g,j),b.lineTo(h,k),b.lineTo(i,l)}b.fillStyle="#FF0000",b.fill(),b.closePath()},b.Strip.prototype.onTextureUpdate=function(){this.updateFrame=!0},b.Strip.prototype.getBounds=function(a){for(var c=a||this.worldTransform,d=c.a,e=c.b,f=c.c,g=c.d,h=c.tx,i=c.ty,j=-1/0,k=-1/0,l=1/0,m=1/0,n=this.vertices,o=0,p=n.length;p>o;o+=2){var q=n[o],r=n[o+1],s=d*q+f*r+h,t=g*r+e*q+i;l=l>s?s:l,m=m>t?t:m,j=s>j?s:j,k=t>k?t:k}if(l===-1/0||1/0===k)return b.EmptyRectangle;var u=this._bounds;return u.x=l,u.width=j-l,u.y=m,u.height=k-m,this._currentBounds=u,u},b.Strip.DrawModes={TRIANGLE_STRIP:0,TRIANGLES:1},b.Rope=function(a,c){b.Strip.call(this,a),this.points=c,this.vertices=new b.Float32Array(4*c.length),this.uvs=new b.Float32Array(4*c.length),this.colors=new b.Float32Array(2*c.length),this.indices=new b.Uint16Array(2*c.length),this.refresh()},b.Rope.prototype=Object.create(b.Strip.prototype),b.Rope.prototype.constructor=b.Rope,b.Rope.prototype.refresh=function(){var a=this.points;if(!(a.length<1)){var b=this.uvs,c=a[0],d=this.indices,e=this.colors;this.count-=.2,b[0]=0,b[1]=0,b[2]=0,b[3]=1,e[0]=1,e[1]=1,d[0]=0,d[1]=1;for(var f,g,h,i=a.length,j=1;i>j;j++)f=a[j],g=4*j,h=j/(i-1),j%2?(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1):(b[g]=h,b[g+1]=0,b[g+2]=h,b[g+3]=1),g=2*j,e[g]=1,e[g+1]=1,g=2*j,d[g]=g,d[g+1]=g+1,c=f}},b.Rope.prototype.updateTransform=function(){var a=this.points;if(!(a.length<1)){var c,d=a[0],e={x:0,y:0};this.count-=.2;for(var f,g,h,i,j,k=this.vertices,l=a.length,m=0;l>m;m++)f=a[m],g=4*m,c=m<a.length-1?a[m+1]:f,e.y=-(c.x-d.x),e.x=c.y-d.y,h=10*(1-m/(l-1)),h>1&&(h=1),i=Math.sqrt(e.x*e.x+e.y*e.y),j=this.texture.height/2,e.x/=i,e.y/=i,e.x*=j,e.y*=j,k[g]=f.x+e.x,k[g+1]=f.y+e.y,k[g+2]=f.x-e.x,k[g+3]=f.y-e.y,d=f;b.DisplayObjectContainer.prototype.updateTransform.call(this)}},b.Rope.prototype.setTexture=function(a){this.texture=a},b.TilingSprite=function(a,c,d){b.Sprite.call(this,a),this._width=c||100,this._height=d||100,this.tileScale=new b.Point(1,1),this.tileScaleOffset=new b.Point(1,1),this.tilePosition=new b.Point(0,0),this.renderable=!0,this.tint=16777215,this.blendMode=b.blendModes.NORMAL},b.TilingSprite.prototype=Object.create(b.Sprite.prototype),b.TilingSprite.prototype.constructor=b.TilingSprite,Object.defineProperty(b.TilingSprite.prototype,"width",{get:function(){return this._width},set:function(a){this._width=a}}),Object.defineProperty(b.TilingSprite.prototype,"height",{get:function(){return this._height},set:function(a){this._height=a}}),b.TilingSprite.prototype.setTexture=function(a){this.texture!==a&&(this.texture=a,this.refreshTexture=!0,this.cachedTint=16777215)},b.TilingSprite.prototype._renderWebGL=function(a){if(this.visible!==!1&&0!==this.alpha){var c,d;for(this._mask&&(a.spriteBatch.stop(),a.maskManager.pushMask(this.mask,a),a.spriteBatch.start()),this._filters&&(a.spriteBatch.flush(),a.filterManager.pushFilter(this._filterBlock)),!this.tilingTexture||this.refreshTexture?(this.generateTilingTexture(!0),this.tilingTexture&&this.tilingTexture.needsUpdate&&(b.updateWebGLTexture(this.tilingTexture.baseTexture,a.gl),this.tilingTexture.needsUpdate=!1)):a.spriteBatch.renderTilingSprite(this),c=0,d=this.children.length;d>c;c++)this.children[c]._renderWebGL(a);a.spriteBatch.stop(),this._filters&&a.filterManager.popFilter(),this._mask&&a.maskManager.popMask(this._mask,a),a.spriteBatch.start()}},b.TilingSprite.prototype._renderCanvas=function(a){if(this.visible!==!1&&0!==this.alpha){var c=a.context;this._mask&&a.maskManager.pushMask(this._mask,c),c.globalAlpha=this.worldAlpha;var d,e,f=this.worldTransform,g=a.resolution;if(c.setTransform(f.a*g,f.b*g,f.c*g,f.d*g,f.tx*g,f.ty*g),!this.__tilePattern||this.refreshTexture){if(this.generateTilingTexture(!1),!this.tilingTexture)return;this.__tilePattern=c.createPattern(this.tilingTexture.baseTexture.source,"repeat")}this.blendMode!==a.currentBlendMode&&(a.currentBlendMode=this.blendMode,c.globalCompositeOperation=b.blendModesCanvas[a.currentBlendMode]);var h=this.tilePosition,i=this.tileScale;for(h.x%=this.tilingTexture.baseTexture.width,h.y%=this.tilingTexture.baseTexture.height,c.scale(i.x,i.y),c.translate(h.x+this.anchor.x*-this._width,h.y+this.anchor.y*-this._height),c.fillStyle=this.__tilePattern,c.fillRect(-h.x,-h.y,this._width/i.x,this._height/i.y),c.scale(1/i.x,1/i.y),c.translate(-h.x+this.anchor.x*this._width,-h.y+this.anchor.y*this._height),this._mask&&a.maskManager.popMask(a.context),d=0,e=this.children.length;e>d;d++)this.children[d]._renderCanvas(a)
}},b.TilingSprite.prototype.getBounds=function(){var a=this._width,b=this._height,c=a*(1-this.anchor.x),d=a*-this.anchor.x,e=b*(1-this.anchor.y),f=b*-this.anchor.y,g=this.worldTransform,h=g.a,i=g.b,j=g.c,k=g.d,l=g.tx,m=g.ty,n=h*d+j*f+l,o=k*f+i*d+m,p=h*c+j*f+l,q=k*f+i*c+m,r=h*c+j*e+l,s=k*e+i*c+m,t=h*d+j*e+l,u=k*e+i*d+m,v=-1/0,w=-1/0,x=1/0,y=1/0;x=x>n?n:x,x=x>p?p:x,x=x>r?r:x,x=x>t?t:x,y=y>o?o:y,y=y>q?q:y,y=y>s?s:y,y=y>u?u:y,v=n>v?n:v,v=p>v?p:v,v=r>v?r:v,v=t>v?t:v,w=o>w?o:w,w=q>w?q:w,w=s>w?s:w,w=u>w?u:w;var z=this._bounds;return z.x=x,z.width=v-x,z.y=y,z.height=w-y,this._currentBounds=z,z},b.TilingSprite.prototype.onTextureUpdate=function(){},b.TilingSprite.prototype.generateTilingTexture=function(a){if(this.texture.baseTexture.hasLoaded){var c,d,e=this.originalTexture||this.texture,f=e.frame,g=f.width!==e.baseTexture.width||f.height!==e.baseTexture.height,h=!1;if(a?(c=b.getNextPowerOfTwo(f.width),d=b.getNextPowerOfTwo(f.height),(f.width!==c||f.height!==d||e.baseTexture.width!==c||e.baseTexture.height||d)&&(h=!0)):g&&(c=f.width,d=f.height,h=!0),h){var i;this.tilingTexture&&this.tilingTexture.isTiling?(i=this.tilingTexture.canvasBuffer,i.resize(c,d),this.tilingTexture.baseTexture.width=c,this.tilingTexture.baseTexture.height=d,this.tilingTexture.needsUpdate=!0):(i=new b.CanvasBuffer(c,d),this.tilingTexture=b.Texture.fromCanvas(i.canvas),this.tilingTexture.canvasBuffer=i,this.tilingTexture.isTiling=!0),i.context.drawImage(e.baseTexture.source,e.crop.x,e.crop.y,e.crop.width,e.crop.height,0,0,c,d),this.tileScaleOffset.x=f.width/c,this.tileScaleOffset.y=f.height/d}else this.tilingTexture&&this.tilingTexture.isTiling&&this.tilingTexture.destroy(!0),this.tileScaleOffset.x=1,this.tileScaleOffset.y=1,this.tilingTexture=e;this.refreshTexture=!1,this.originalTexture=this.texture,this.texture=this.tilingTexture,this.tilingTexture.baseTexture._powerOf2=!0}};var c={radDeg:180/Math.PI,degRad:Math.PI/180,temp:[],Float32Array:"undefined"==typeof Float32Array?Array:Float32Array,Uint16Array:"undefined"==typeof Uint16Array?Array:Uint16Array};c.BoneData=function(a,b){this.name=a,this.parent=b},c.BoneData.prototype={length:0,x:0,y:0,rotation:0,scaleX:1,scaleY:1,inheritScale:!0,inheritRotation:!0,flipX:!1,flipY:!1},c.SlotData=function(a,b){this.name=a,this.boneData=b},c.SlotData.prototype={r:1,g:1,b:1,a:1,attachmentName:null,additiveBlending:!1},c.IkConstraintData=function(a){this.name=a,this.bones=[]},c.IkConstraintData.prototype={target:null,bendDirection:1,mix:1},c.Bone=function(a,b,c){this.data=a,this.skeleton=b,this.parent=c,this.setToSetupPose()},c.Bone.yDown=!1,c.Bone.prototype={x:0,y:0,rotation:0,rotationIK:0,scaleX:1,scaleY:1,flipX:!1,flipY:!1,m00:0,m01:0,worldX:0,m10:0,m11:0,worldY:0,worldRotation:0,worldScaleX:1,worldScaleY:1,worldFlipX:!1,worldFlipY:!1,updateWorldTransform:function(){var a=this.parent;if(a)this.worldX=this.x*a.m00+this.y*a.m01+a.worldX,this.worldY=this.x*a.m10+this.y*a.m11+a.worldY,this.data.inheritScale?(this.worldScaleX=a.worldScaleX*this.scaleX,this.worldScaleY=a.worldScaleY*this.scaleY):(this.worldScaleX=this.scaleX,this.worldScaleY=this.scaleY),this.worldRotation=this.data.inheritRotation?a.worldRotation+this.rotationIK:this.rotationIK,this.worldFlipX=a.worldFlipX!=this.flipX,this.worldFlipY=a.worldFlipY!=this.flipY;else{var b=this.skeleton.flipX,d=this.skeleton.flipY;this.worldX=b?-this.x:this.x,this.worldY=d!=c.Bone.yDown?-this.y:this.y,this.worldScaleX=this.scaleX,this.worldScaleY=this.scaleY,this.worldRotation=this.rotationIK,this.worldFlipX=b!=this.flipX,this.worldFlipY=d!=this.flipY}var e=this.worldRotation*c.degRad,f=Math.cos(e),g=Math.sin(e);this.worldFlipX?(this.m00=-f*this.worldScaleX,this.m01=g*this.worldScaleY):(this.m00=f*this.worldScaleX,this.m01=-g*this.worldScaleY),this.worldFlipY!=c.Bone.yDown?(this.m10=-g*this.worldScaleX,this.m11=-f*this.worldScaleY):(this.m10=g*this.worldScaleX,this.m11=f*this.worldScaleY)},setToSetupPose:function(){var a=this.data;this.x=a.x,this.y=a.y,this.rotation=a.rotation,this.rotationIK=this.rotation,this.scaleX=a.scaleX,this.scaleY=a.scaleY,this.flipX=a.flipX,this.flipY=a.flipY},worldToLocal:function(a){var b=a[0]-this.worldX,d=a[1]-this.worldY,e=this.m00,f=this.m10,g=this.m01,h=this.m11;this.worldFlipX!=(this.worldFlipY!=c.Bone.yDown)&&(e=-e,h=-h);var i=1/(e*h-g*f);a[0]=b*e*i-d*g*i,a[1]=d*h*i-b*f*i},localToWorld:function(a){var b=a[0],c=a[1];a[0]=b*this.m00+c*this.m01+this.worldX,a[1]=b*this.m10+c*this.m11+this.worldY}},c.Slot=function(a,b){this.data=a,this.bone=b,this.setToSetupPose()},c.Slot.prototype={r:1,g:1,b:1,a:1,_attachmentTime:0,attachment:null,attachmentVertices:[],setAttachment:function(a){this.attachment=a,this._attachmentTime=this.bone.skeleton.time,this.attachmentVertices.length=0},setAttachmentTime:function(a){this._attachmentTime=this.bone.skeleton.time-a},getAttachmentTime:function(){return this.bone.skeleton.time-this._attachmentTime},setToSetupPose:function(){var a=this.data;this.r=a.r,this.g=a.g,this.b=a.b,this.a=a.a;for(var b=this.bone.skeleton.data.slots,c=0,d=b.length;d>c;c++)if(b[c]==a){this.setAttachment(a.attachmentName?this.bone.skeleton.getAttachmentBySlotIndex(c,a.attachmentName):null);break}}},c.IkConstraint=function(a,b){this.data=a,this.mix=a.mix,this.bendDirection=a.bendDirection,this.bones=[];for(var c=0,d=a.bones.length;d>c;c++)this.bones.push(b.findBone(a.bones[c].name));this.target=b.findBone(a.target.name)},c.IkConstraint.prototype={apply:function(){var a=this.target,b=this.bones;switch(b.length){case 1:c.IkConstraint.apply1(b[0],a.worldX,a.worldY,this.mix);break;case 2:c.IkConstraint.apply2(b[0],b[1],a.worldX,a.worldY,this.bendDirection,this.mix)}}},c.IkConstraint.apply1=function(a,b,d,e){var f=a.data.inheritRotation&&a.parent?a.parent.worldRotation:0,g=a.rotation,h=Math.atan2(d-a.worldY,b-a.worldX)*c.radDeg-f;a.rotationIK=g+(h-g)*e},c.IkConstraint.apply2=function(a,b,d,e,f,g){var h=b.rotation,i=a.rotation;if(!g)return b.rotationIK=h,a.rotationIK=i,void 0;var j,k,l=c.temp,m=a.parent;m?(l[0]=d,l[1]=e,m.worldToLocal(l),d=(l[0]-a.x)*m.worldScaleX,e=(l[1]-a.y)*m.worldScaleY):(d-=a.x,e-=a.y),b.parent==a?(j=b.x,k=b.y):(l[0]=b.x,l[1]=b.y,b.parent.localToWorld(l),a.worldToLocal(l),j=l[0],k=l[1]);var n=j*a.worldScaleX,o=k*a.worldScaleY,p=Math.atan2(o,n),q=Math.sqrt(n*n+o*o),r=b.data.length*b.worldScaleX,s=2*q*r;if(1e-4>s)return b.rotationIK=h+(Math.atan2(e,d)*c.radDeg-i-h)*g,void 0;var t=(d*d+e*e-q*q-r*r)/s;-1>t?t=-1:t>1&&(t=1);var u=Math.acos(t)*f,v=q+r*t,w=r*Math.sin(u),x=Math.atan2(e*v-d*w,d*v+e*w),y=(x-p)*c.radDeg-i;y>180?y-=360:-180>y&&(y+=360),a.rotationIK=i+y*g,y=(u+p)*c.radDeg-h,y>180?y-=360:-180>y&&(y+=360),b.rotationIK=h+(y+a.worldRotation-b.parent.worldRotation)*g},c.Skin=function(a){this.name=a,this.attachments={}},c.Skin.prototype={addAttachment:function(a,b,c){this.attachments[a+":"+b]=c},getAttachment:function(a,b){return this.attachments[a+":"+b]},_attachAll:function(a,b){for(var c in b.attachments){var d=c.indexOf(":"),e=parseInt(c.substring(0,d)),f=c.substring(d+1),g=a.slots[e];if(g.attachment&&g.attachment.name==f){var h=this.getAttachment(e,f);h&&g.setAttachment(h)}}}},c.Animation=function(a,b,c){this.name=a,this.timelines=b,this.duration=c},c.Animation.prototype={apply:function(a,b,c,d,e){d&&0!=this.duration&&(c%=this.duration,b%=this.duration);for(var f=this.timelines,g=0,h=f.length;h>g;g++)f[g].apply(a,b,c,e,1)},mix:function(a,b,c,d,e,f){d&&0!=this.duration&&(c%=this.duration,b%=this.duration);for(var g=this.timelines,h=0,i=g.length;i>h;h++)g[h].apply(a,b,c,e,f)}},c.Animation.binarySearch=function(a,b,c){var d=0,e=Math.floor(a.length/c)-2;if(!e)return c;for(var f=e>>>1;;){if(a[(f+1)*c]<=b?d=f+1:e=f,d==e)return(d+1)*c;f=d+e>>>1}},c.Animation.binarySearch1=function(a,b){var c=0,d=a.length-2;if(!d)return 1;for(var e=d>>>1;;){if(a[e+1]<=b?c=e+1:d=e,c==d)return c+1;e=c+d>>>1}},c.Animation.linearSearch=function(a,b,c){for(var d=0,e=a.length-c;e>=d;d+=c)if(a[d]>b)return d;return-1},c.Curves=function(){this.curves=[]},c.Curves.prototype={setLinear:function(a){this.curves[19*a]=0},setStepped:function(a){this.curves[19*a]=1},setCurve:function(a,b,c,d,e){var f=.1,g=f*f,h=g*f,i=3*f,j=3*g,k=6*g,l=6*h,m=2*-b+d,n=2*-c+e,o=3*(b-d)+1,p=3*(c-e)+1,q=b*i+m*j+o*h,r=c*i+n*j+p*h,s=m*k+o*l,t=n*k+p*l,u=o*l,v=p*l,w=19*a,x=this.curves;x[w++]=2;for(var y=q,z=r,A=w+19-1;A>w;w+=2)x[w]=y,x[w+1]=z,q+=s,r+=t,s+=u,t+=v,y+=q,z+=r},getCurvePercent:function(a,b){b=0>b?0:b>1?1:b;var c=this.curves,d=19*a,e=c[d];if(0===e)return b;if(1==e)return 0;d++;for(var f=0,g=d,h=d+19-1;h>d;d+=2)if(f=c[d],f>=b){var i,j;return d==g?(i=0,j=0):(i=c[d-2],j=c[d-1]),j+(c[d+1]-j)*(b-i)/(f-i)}var k=c[d-1];return k+(1-k)*(b-f)/(1-f)}},c.RotateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=2*a},c.RotateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c},apply:function(a,b,d,e,f){var g=this.frames;if(!(d<g[0])){var h=a.bones[this.boneIndex];if(d>=g[g.length-2]){for(var i=h.data.rotation+g[g.length-1]-h.rotation;i>180;)i-=360;for(;-180>i;)i+=360;return h.rotation+=i*f,void 0}var j=c.Animation.binarySearch(g,d,2),k=g[j-1],l=g[j],m=1-(d-l)/(g[j-2]-l);m=this.curves.getCurvePercent(j/2-1,m);for(var i=g[j+1]-k;i>180;)i-=360;for(;-180>i;)i+=360;for(i=h.data.rotation+(k+i*m)-h.rotation;i>180;)i-=360;for(;-180>i;)i+=360;h.rotation+=i*f}}},c.TranslateTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.TranslateTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d,e,f){var g=this.frames;if(!(d<g[0])){var h=a.bones[this.boneIndex];if(d>=g[g.length-3])return h.x+=(h.data.x+g[g.length-2]-h.x)*f,h.y+=(h.data.y+g[g.length-1]-h.y)*f,void 0;var i=c.Animation.binarySearch(g,d,3),j=g[i-2],k=g[i-1],l=g[i],m=1-(d-l)/(g[i+-3]-l);m=this.curves.getCurvePercent(i/3-1,m),h.x+=(h.data.x+j+(g[i+1]-j)*m-h.x)*f,h.y+=(h.data.y+k+(g[i+2]-k)*m-h.y)*f}}},c.ScaleTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.ScaleTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d,e,f){var g=this.frames;if(!(d<g[0])){var h=a.bones[this.boneIndex];if(d>=g[g.length-3])return h.scaleX+=(h.data.scaleX*g[g.length-2]-h.scaleX)*f,h.scaleY+=(h.data.scaleY*g[g.length-1]-h.scaleY)*f,void 0;var i=c.Animation.binarySearch(g,d,3),j=g[i-2],k=g[i-1],l=g[i],m=1-(d-l)/(g[i+-3]-l);m=this.curves.getCurvePercent(i/3-1,m),h.scaleX+=(h.data.scaleX*(j+(g[i+1]-j)*m)-h.scaleX)*f,h.scaleY+=(h.data.scaleY*(k+(g[i+2]-k)*m)-h.scaleY)*f}}},c.ColorTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=5*a},c.ColorTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length/5},setFrame:function(a,b,c,d,e,f){a*=5,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d,this.frames[a+3]=e,this.frames[a+4]=f},apply:function(a,b,d,e,f){var g=this.frames;if(!(d<g[0])){var h,i,j,k;if(d>=g[g.length-5]){var l=g.length-1;h=g[l-3],i=g[l-2],j=g[l-1],k=g[l]}else{var m=c.Animation.binarySearch(g,d,5),n=g[m-4],o=g[m-3],p=g[m-2],q=g[m-1],r=g[m],s=1-(d-r)/(g[m-5]-r);s=this.curves.getCurvePercent(m/5-1,s),h=n+(g[m+1]-n)*s,i=o+(g[m+2]-o)*s,j=p+(g[m+3]-p)*s,k=q+(g[m+4]-q)*s}var t=a.slots[this.slotIndex];1>f?(t.r+=(h-t.r)*f,t.g+=(i-t.g)*f,t.b+=(j-t.b)*f,t.a+=(k-t.a)*f):(t.r=h,t.g=i,t.b=j,t.a=k)}}},c.AttachmentTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=a,this.attachmentNames=[],this.attachmentNames.length=a},c.AttachmentTimeline.prototype={slotIndex:0,getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.attachmentNames[a]=c},apply:function(a,b,d){var e=this.frames;if(d<e[0])return b>d&&this.apply(a,b,Number.MAX_VALUE,null,0),void 0;b>d&&(b=-1);var f=d>=e[e.length-1]?e.length-1:c.Animation.binarySearch1(e,d)-1;if(!(e[f]<b)){var g=this.attachmentNames[f];a.slots[this.slotIndex].setAttachment(g?a.getAttachmentBySlotIndex(this.slotIndex,g):null)}}},c.EventTimeline=function(a){this.frames=[],this.frames.length=a,this.events=[],this.events.length=a},c.EventTimeline.prototype={getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.events[a]=c},apply:function(a,b,d,e,f){if(e){var g=this.frames,h=g.length;if(b>d)this.apply(a,b,Number.MAX_VALUE,e,f),b=-1;else if(b>=g[h-1])return;if(!(d<g[0])){var i;if(b<g[0])i=0;else{i=c.Animation.binarySearch1(g,b);for(var j=g[i];i>0&&g[i-1]==j;)i--}for(var k=this.events;h>i&&d>=g[i];i++)e.push(k[i])}}}},c.DrawOrderTimeline=function(a){this.frames=[],this.frames.length=a,this.drawOrders=[],this.drawOrders.length=a},c.DrawOrderTimeline.prototype={getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.drawOrders[a]=c},apply:function(a,b,d){var e=this.frames;if(!(d<e[0])){var f;f=d>=e[e.length-1]?e.length-1:c.Animation.binarySearch1(e,d)-1;var g=a.drawOrder,h=a.slots,i=this.drawOrders[f];if(i)for(var j=0,k=i.length;k>j;j++)g[j]=a.slots[i[j]];else for(var j=0,k=h.length;k>j;j++)g[j]=h[j]}}},c.FfdTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=a,this.frameVertices=[],this.frameVertices.length=a},c.FfdTimeline.prototype={slotIndex:0,attachment:0,getFrameCount:function(){return this.frames.length},setFrame:function(a,b,c){this.frames[a]=b,this.frameVertices[a]=c},apply:function(a,b,d,e,f){var g=a.slots[this.slotIndex];if(g.attachment==this.attachment){var h=this.frames;if(!(d<h[0])){var i=this.frameVertices,j=i[0].length,k=g.attachmentVertices;if(k.length!=j&&(f=1),k.length=j,d>=h[h.length-1]){var l=i[h.length-1];if(1>f)for(var m=0;j>m;m++)k[m]+=(l[m]-k[m])*f;else for(var m=0;j>m;m++)k[m]=l[m]}else{var n=c.Animation.binarySearch1(h,d),o=h[n],p=1-(d-o)/(h[n-1]-o);p=this.curves.getCurvePercent(n-1,0>p?0:p>1?1:p);var q=i[n-1],r=i[n];if(1>f)for(var m=0;j>m;m++){var s=q[m];k[m]+=(s+(r[m]-s)*p-k[m])*f}else for(var m=0;j>m;m++){var s=q[m];k[m]=s+(r[m]-s)*p}}}}}},c.IkConstraintTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=3*a},c.IkConstraintTimeline.prototype={ikConstraintIndex:0,getFrameCount:function(){return this.frames.length/3},setFrame:function(a,b,c,d){a*=3,this.frames[a]=b,this.frames[a+1]=c,this.frames[a+2]=d},apply:function(a,b,d,e,f){var g=this.frames;if(!(d<g[0])){var h=a.ikConstraints[this.ikConstraintIndex];if(d>=g[g.length-3])return h.mix+=(g[g.length-2]-h.mix)*f,h.bendDirection=g[g.length-1],void 0;var i=c.Animation.binarySearch(g,d,3),j=g[i+-2],k=g[i],l=1-(d-k)/(g[i+-3]-k);l=this.curves.getCurvePercent(i/3-1,l);var m=j+(g[i+1]-j)*l;h.mix+=(m-h.mix)*f,h.bendDirection=g[i+-1]}}},c.FlipXTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=2*a},c.FlipXTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c?1:0},apply:function(a,b,d){var e=this.frames;if(d<e[0])return b>d&&this.apply(a,b,Number.MAX_VALUE,null,0),void 0;b>d&&(b=-1);var f=(d>=e[e.length-2]?e.length:c.Animation.binarySearch(e,d,2))-2;e[f]<b||(a.bones[boneIndex].flipX=0!=e[f+1])}},c.FlipYTimeline=function(a){this.curves=new c.Curves(a),this.frames=[],this.frames.length=2*a},c.FlipYTimeline.prototype={boneIndex:0,getFrameCount:function(){return this.frames.length/2},setFrame:function(a,b,c){a*=2,this.frames[a]=b,this.frames[a+1]=c?1:0},apply:function(a,b,d){var e=this.frames;if(d<e[0])return b>d&&this.apply(a,b,Number.MAX_VALUE,null,0),void 0;b>d&&(b=-1);var f=(d>=e[e.length-2]?e.length:c.Animation.binarySearch(e,d,2))-2;e[f]<b||(a.bones[boneIndex].flipY=0!=e[f+1])}},c.SkeletonData=function(){this.bones=[],this.slots=[],this.skins=[],this.events=[],this.animations=[],this.ikConstraints=[]},c.SkeletonData.prototype={name:null,defaultSkin:null,width:0,height:0,version:null,hash:null,findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return slot[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].name==a)return c;return-1},findSkin:function(a){for(var b=this.skins,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findEvent:function(a){for(var b=this.events,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findAnimation:function(a){for(var b=this.animations,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},findIkConstraint:function(a){for(var b=this.ikConstraints,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null}},c.Skeleton=function(a){this.data=a,this.bones=[];for(var b=0,d=a.bones.length;d>b;b++){var e=a.bones[b],f=e.parent?this.bones[a.bones.indexOf(e.parent)]:null;this.bones.push(new c.Bone(e,this,f))}this.slots=[],this.drawOrder=[];for(var b=0,d=a.slots.length;d>b;b++){var g=a.slots[b],h=this.bones[a.bones.indexOf(g.boneData)],i=new c.Slot(g,h);this.slots.push(i),this.drawOrder.push(i)}this.ikConstraints=[];for(var b=0,d=a.ikConstraints.length;d>b;b++)this.ikConstraints.push(new c.IkConstraint(a.ikConstraints[b],this));this.boneCache=[],this.updateCache()},c.Skeleton.prototype={x:0,y:0,skin:null,r:1,g:1,b:1,a:1,time:0,flipX:!1,flipY:!1,updateCache:function(){var a=this.ikConstraints,b=a.length,c=b+1,d=this.boneCache;d.length>c&&(d.length=c);for(var e=0,f=d.length;f>e;e++)d[e].length=0;for(;d.length<c;)d[d.length]=[];var g=d[0],h=this.bones;a:for(var e=0,f=h.length;f>e;e++){var i=h[e],j=i;do{for(var k=0;b>k;k++)for(var l=a[k],m=l.bones[0],n=l.bones[l.bones.length-1];;){if(j==n){d[k].push(i),d[k+1].push(i);continue a}if(n==m)break;n=n.parent}j=j.parent}while(j);g[g.length]=i}},updateWorldTransform:function(){for(var a=this.bones,b=0,c=a.length;c>b;b++){var d=a[b];d.rotationIK=d.rotation}for(var b=0,e=this.boneCache.length-1;;){for(var f=this.boneCache[b],g=0,h=f.length;h>g;g++)f[g].updateWorldTransform();if(b==e)break;this.ikConstraints[b].apply(),b++}},setToSetupPose:function(){this.setBonesToSetupPose(),this.setSlotsToSetupPose()},setBonesToSetupPose:function(){for(var a=this.bones,b=0,c=a.length;c>b;b++)a[b].setToSetupPose();for(var d=this.ikConstraints,b=0,c=d.length;c>b;b++){var e=d[b];e.bendDirection=e.data.bendDirection,e.mix=e.data.mix}},setSlotsToSetupPose:function(){for(var a=this.slots,b=this.drawOrder,c=0,d=a.length;d>c;c++)b[c]=a[c],a[c].setToSetupPose(c)},getRootBone:function(){return this.bones.length?this.bones[0]:null},findBone:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findBoneIndex:function(a){for(var b=this.bones,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},findSlot:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},findSlotIndex:function(a){for(var b=this.slots,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return c;return-1},setSkinByName:function(a){var b=this.data.findSkin(a);if(!b)throw"Skin not found: "+a;this.setSkin(b)},setSkin:function(a){if(a)if(this.skin)a._attachAll(this,this.skin);else for(var b=this.slots,c=0,d=b.length;d>c;c++){var e=b[c],f=e.data.attachmentName;if(f){var g=a.getAttachment(c,f);g&&e.setAttachment(g)}}this.skin=a},getAttachmentBySlotName:function(a,b){return this.getAttachmentBySlotIndex(this.data.findSlotIndex(a),b)},getAttachmentBySlotIndex:function(a,b){if(this.skin){var c=this.skin.getAttachment(a,b);if(c)return c}return this.data.defaultSkin?this.data.defaultSkin.getAttachment(a,b):null},setAttachment:function(a,b){for(var c=this.slots,d=0,e=c.length;e>d;d++){var f=c[d];if(f.data.name==a){var g=null;if(b&&(g=this.getAttachmentBySlotIndex(d,b),!g))throw"Attachment not found: "+b+", for slot: "+a;return f.setAttachment(g),void 0}}throw"Slot not found: "+a},findIkConstraint:function(a){for(var b=this.ikConstraints,c=0,d=b.length;d>c;c++)if(b[c].data.name==a)return b[c];return null},update:function(a){this.time+=a}},c.EventData=function(a){this.name=a},c.EventData.prototype={intValue:0,floatValue:0,stringValue:null},c.Event=function(a){this.data=a},c.Event.prototype={intValue:0,floatValue:0,stringValue:null},c.AttachmentType={region:0,boundingbox:1,mesh:2,skinnedmesh:3},c.RegionAttachment=function(a){this.name=a,this.offset=[],this.offset.length=8,this.uvs=[],this.uvs.length=8},c.RegionAttachment.prototype={type:c.AttachmentType.region,x:0,y:0,rotation:0,scaleX:1,scaleY:1,width:0,height:0,r:1,g:1,b:1,a:1,path:null,rendererObject:null,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,setUVs:function(a,b,c,d,e){var f=this.uvs;e?(f[2]=a,f[3]=d,f[4]=a,f[5]=b,f[6]=c,f[7]=b,f[0]=c,f[1]=d):(f[0]=a,f[1]=d,f[2]=a,f[3]=b,f[4]=c,f[5]=b,f[6]=c,f[7]=d)},updateOffset:function(){var a=this.width/this.regionOriginalWidth*this.scaleX,b=this.height/this.regionOriginalHeight*this.scaleY,d=-this.width/2*this.scaleX+this.regionOffsetX*a,e=-this.height/2*this.scaleY+this.regionOffsetY*b,f=d+this.regionWidth*a,g=e+this.regionHeight*b,h=this.rotation*c.degRad,i=Math.cos(h),j=Math.sin(h),k=d*i+this.x,l=d*j,m=e*i+this.y,n=e*j,o=f*i+this.x,p=f*j,q=g*i+this.y,r=g*j,s=this.offset;s[0]=k-n,s[1]=m+l,s[2]=k-r,s[3]=q+l,s[4]=o-r,s[5]=q+p,s[6]=o-n,s[7]=m+p},computeVertices:function(a,b,c,d){a+=c.worldX,b+=c.worldY;var e=c.m00,f=c.m01,g=c.m10,h=c.m11,i=this.offset;d[0]=i[0]*e+i[1]*f+a,d[1]=i[0]*g+i[1]*h+b,d[2]=i[2]*e+i[3]*f+a,d[3]=i[2]*g+i[3]*h+b,d[4]=i[4]*e+i[5]*f+a,d[5]=i[4]*g+i[5]*h+b,d[6]=i[6]*e+i[7]*f+a,d[7]=i[6]*g+i[7]*h+b}},c.MeshAttachment=function(a){this.name=a},c.MeshAttachment.prototype={type:c.AttachmentType.mesh,vertices:null,uvs:null,regionUVs:null,triangles:null,hullLength:0,r:1,g:1,b:1,a:1,path:null,rendererObject:null,regionU:0,regionV:0,regionU2:0,regionV2:0,regionRotate:!1,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,edges:null,width:0,height:0,updateUVs:function(){var a=this.regionU2-this.regionU,b=this.regionV2-this.regionV,d=this.regionUVs.length;if(this.uvs&&this.uvs.length==d||(this.uvs=new c.Float32Array(d)),this.regionRotate)for(var e=0;d>e;e+=2)this.uvs[e]=this.regionU+this.regionUVs[e+1]*a,this.uvs[e+1]=this.regionV+b-this.regionUVs[e]*b;else for(var e=0;d>e;e+=2)this.uvs[e]=this.regionU+this.regionUVs[e]*a,this.uvs[e+1]=this.regionV+this.regionUVs[e+1]*b},computeWorldVertices:function(a,b,c,d){var e=c.bone;a+=e.worldX,b+=e.worldY;var f=e.m00,g=e.m01,h=e.m10,i=e.m11,j=this.vertices,k=j.length;c.attachmentVertices.length==k&&(j=c.attachmentVertices);for(var l=0;k>l;l+=2){var m=j[l],n=j[l+1];d[l]=m*f+n*g+a,d[l+1]=m*h+n*i+b}}},c.SkinnedMeshAttachment=function(a){this.name=a},c.SkinnedMeshAttachment.prototype={type:c.AttachmentType.skinnedmesh,bones:null,weights:null,uvs:null,regionUVs:null,triangles:null,hullLength:0,r:1,g:1,b:1,a:1,path:null,rendererObject:null,regionU:0,regionV:0,regionU2:0,regionV2:0,regionRotate:!1,regionOffsetX:0,regionOffsetY:0,regionWidth:0,regionHeight:0,regionOriginalWidth:0,regionOriginalHeight:0,edges:null,width:0,height:0,updateUVs:function(){var a=this.regionU2-this.regionU,b=this.regionV2-this.regionV,d=this.regionUVs.length;if(this.uvs&&this.uvs.length==d||(this.uvs=new c.Float32Array(d)),this.regionRotate)for(var e=0;d>e;e+=2)this.uvs[e]=this.regionU+this.regionUVs[e+1]*a,this.uvs[e+1]=this.regionV+b-this.regionUVs[e]*b;else for(var e=0;d>e;e+=2)this.uvs[e]=this.regionU+this.regionUVs[e]*a,this.uvs[e+1]=this.regionV+this.regionUVs[e+1]*b},computeWorldVertices:function(a,b,c,d){var e,f,g,h,i,j,k,l=c.bone.skeleton.bones,m=this.weights,n=this.bones,o=0,p=0,q=0,r=0,s=n.length;if(c.attachmentVertices.length)for(var t=c.attachmentVertices;s>p;o+=2){for(f=0,g=0,e=n[p++]+p;e>p;p++,q+=3,r+=2)h=l[n[p]],i=m[q]+t[r],j=m[q+1]+t[r+1],k=m[q+2],f+=(i*h.m00+j*h.m01+h.worldX)*k,g+=(i*h.m10+j*h.m11+h.worldY)*k;d[o]=f+a,d[o+1]=g+b}else for(;s>p;o+=2){for(f=0,g=0,e=n[p++]+p;e>p;p++,q+=3)h=l[n[p]],i=m[q],j=m[q+1],k=m[q+2],f+=(i*h.m00+j*h.m01+h.worldX)*k,g+=(i*h.m10+j*h.m11+h.worldY)*k;d[o]=f+a,d[o+1]=g+b}}},c.BoundingBoxAttachment=function(a){this.name=a,this.vertices=[]},c.BoundingBoxAttachment.prototype={type:c.AttachmentType.boundingbox,computeWorldVertices:function(a,b,c,d){a+=c.worldX,b+=c.worldY;for(var e=c.m00,f=c.m01,g=c.m10,h=c.m11,i=this.vertices,j=0,k=i.length;k>j;j+=2){var l=i[j],m=i[j+1];d[j]=l*e+m*f+a,d[j+1]=l*g+m*h+b}}},c.AnimationStateData=function(a){this.skeletonData=a,this.animationToMixTime={}},c.AnimationStateData.prototype={defaultMix:0,setMixByName:function(a,b,c){var d=this.skeletonData.findAnimation(a);if(!d)throw"Animation not found: "+a;var e=this.skeletonData.findAnimation(b);if(!e)throw"Animation not found: "+b;this.setMix(d,e,c)},setMix:function(a,b,c){this.animationToMixTime[a.name+":"+b.name]=c},getMix:function(a,b){var c=a.name+":"+b.name;return this.animationToMixTime.hasOwnProperty(c)?this.animationToMixTime[c]:this.defaultMix}},c.TrackEntry=function(){},c.TrackEntry.prototype={next:null,previous:null,animation:null,loop:!1,delay:0,time:0,lastTime:-1,endTime:0,timeScale:1,mixTime:0,mixDuration:0,mix:1,onStart:null,onEnd:null,onComplete:null,onEvent:null},c.AnimationState=function(a){this.data=a,this.tracks=[],this.events=[]},c.AnimationState.prototype={onStart:null,onEnd:null,onComplete:null,onEvent:null,timeScale:1,update:function(a){a*=this.timeScale;for(var b=0;b<this.tracks.length;b++){var c=this.tracks[b];if(c){if(c.time+=a*c.timeScale,c.previous){var d=a*c.previous.timeScale;c.previous.time+=d,c.mixTime+=d}var e=c.next;e?(e.time=c.lastTime-e.delay,e.time>=0&&this.setCurrent(b,e)):!c.loop&&c.lastTime>=c.endTime&&this.clearTrack(b)}}},apply:function(a){for(var b=0;b<this.tracks.length;b++){var c=this.tracks[b];if(c){this.events.length=0;var d=c.time,e=c.lastTime,f=c.endTime,g=c.loop;!g&&d>f&&(d=f);var h=c.previous;if(h){var i=h.time;!h.loop&&i>h.endTime&&(i=h.endTime),h.animation.apply(a,i,i,h.loop,null);var j=c.mixTime/c.mixDuration*c.mix;j>=1&&(j=1,c.previous=null),c.animation.mix(a,c.lastTime,d,g,this.events,j)}else 1==c.mix?c.animation.apply(a,c.lastTime,d,g,this.events):c.animation.mix(a,c.lastTime,d,g,this.events,c.mix);for(var k=0,l=this.events.length;l>k;k++){var m=this.events[k];c.onEvent&&c.onEvent(b,m),this.onEvent&&this.onEvent(b,m)}if(g?e%f>d%f:f>e&&d>=f){var n=Math.floor(d/f);c.onComplete&&c.onComplete(b,n),this.onComplete&&this.onComplete(b,n)}c.lastTime=c.time}}},clearTracks:function(){for(var a=0,b=this.tracks.length;b>a;a++)this.clearTrack(a);this.tracks.length=0},clearTrack:function(a){if(!(a>=this.tracks.length)){var b=this.tracks[a];b&&(b.onEnd&&b.onEnd(a),this.onEnd&&this.onEnd(a),this.tracks[a]=null)}},_expandToIndex:function(a){if(a<this.tracks.length)return this.tracks[a];for(;a>=this.tracks.length;)this.tracks.push(null);return null},setCurrent:function(a,b){var c=this._expandToIndex(a);if(c){var d=c.previous;c.previous=null,c.onEnd&&c.onEnd(a),this.onEnd&&this.onEnd(a),b.mixDuration=this.data.getMix(c.animation,b.animation),b.mixDuration>0&&(b.mixTime=0,b.previous=d&&c.mixTime/c.mixDuration<.5?d:c)}this.tracks[a]=b,b.onStart&&b.onStart(a),this.onStart&&this.onStart(a)},setAnimationByName:function(a,b,c){var d=this.data.skeletonData.findAnimation(b);if(!d)throw"Animation not found: "+b;return this.setAnimation(a,d,c)},setAnimation:function(a,b,d){var e=new c.TrackEntry;return e.animation=b,e.loop=d,e.endTime=b.duration,this.setCurrent(a,e),e},addAnimationByName:function(a,b,c,d){var e=this.data.skeletonData.findAnimation(b);if(!e)throw"Animation not found: "+b;return this.addAnimation(a,e,c,d)},addAnimation:function(a,b,d,e){var f=new c.TrackEntry;f.animation=b,f.loop=d,f.endTime=b.duration;var g=this._expandToIndex(a);if(g){for(;g.next;)g=g.next;g.next=f}else this.tracks[a]=f;return 0>=e&&(g?e+=g.endTime-this.data.getMix(g.animation,b):e=0),f.delay=e,f},getCurrent:function(a){return a>=this.tracks.length?null:this.tracks[a]}},c.SkeletonJson=function(a){this.attachmentLoader=a},c.SkeletonJson.prototype={scale:1,readSkeletonData:function(a,b){var d=new c.SkeletonData;d.name=b;var e=a.skeleton;e&&(d.hash=e.hash,d.version=e.spine,d.width=e.width||0,d.height=e.height||0);for(var f=a.bones,g=0,h=f.length;h>g;g++){var i=f[g],j=null;if(i.parent&&(j=d.findBone(i.parent),!j))throw"Parent bone not found: "+i.parent;var k=new c.BoneData(i.name,j);k.length=(i.length||0)*this.scale,k.x=(i.x||0)*this.scale,k.y=(i.y||0)*this.scale,k.rotation=i.rotation||0,k.scaleX=i.hasOwnProperty("scaleX")?i.scaleX:1,k.scaleY=i.hasOwnProperty("scaleY")?i.scaleY:1,k.inheritScale=i.hasOwnProperty("inheritScale")?i.inheritScale:!0,k.inheritRotation=i.hasOwnProperty("inheritRotation")?i.inheritRotation:!0,d.bones.push(k)}var l=a.ik;if(l)for(var g=0,h=l.length;h>g;g++){for(var m=l[g],n=new c.IkConstraintData(m.name),f=m.bones,o=0,p=f.length;p>o;o++){var q=d.findBone(f[o]);if(!q)throw"IK bone not found: "+f[o];n.bones.push(q)}if(n.target=d.findBone(m.target),!n.target)throw"Target bone not found: "+m.target;n.bendDirection=!m.hasOwnProperty("bendPositive")||m.bendPositive?1:-1,n.mix=m.hasOwnProperty("mix")?m.mix:1,d.ikConstraints.push(n)}for(var r=a.slots,g=0,h=r.length;h>g;g++){var s=r[g],k=d.findBone(s.bone);if(!k)throw"Slot bone not found: "+s.bone;var t=new c.SlotData(s.name,k),u=s.color;u&&(t.r=this.toColor(u,0),t.g=this.toColor(u,1),t.b=this.toColor(u,2),t.a=this.toColor(u,3)),t.attachmentName=s.attachment,t.additiveBlending=s.additive&&"true"==s.additive,d.slots.push(t)}var v=a.skins;for(var w in v)if(v.hasOwnProperty(w)){var x=v[w],y=new c.Skin(w);for(var z in x)if(x.hasOwnProperty(z)){var A=d.findSlotIndex(z),B=x[z];for(var C in B)if(B.hasOwnProperty(C)){var D=this.readAttachment(y,C,B[C]);D&&y.addAttachment(A,C,D)}}d.skins.push(y),"default"==y.name&&(d.defaultSkin=y)}var E=a.events;for(var F in E)if(E.hasOwnProperty(F)){var G=E[F],H=new c.EventData(F);H.intValue=G["int"]||0,H.floatValue=G["float"]||0,H.stringValue=G.string||null,d.events.push(H)}var I=a.animations;for(var J in I)I.hasOwnProperty(J)&&this.readAnimation(J,I[J],d);return d},readAttachment:function(a,b,d){b=d.name||b;var e=c.AttachmentType[d.type||"region"],f=d.path||b,g=this.scale;if(e==c.AttachmentType.region){var h=this.attachmentLoader.newRegionAttachment(a,b,f);if(!h)return null;h.path=f,h.x=(d.x||0)*g,h.y=(d.y||0)*g,h.scaleX=d.hasOwnProperty("scaleX")?d.scaleX:1,h.scaleY=d.hasOwnProperty("scaleY")?d.scaleY:1,h.rotation=d.rotation||0,h.width=(d.width||0)*g,h.height=(d.height||0)*g;var i=d.color;return i&&(h.r=this.toColor(i,0),h.g=this.toColor(i,1),h.b=this.toColor(i,2),h.a=this.toColor(i,3)),h.updateOffset(),h}if(e==c.AttachmentType.mesh){var j=this.attachmentLoader.newMeshAttachment(a,b,f);return j?(j.path=f,j.vertices=this.getFloatArray(d,"vertices",g),j.triangles=this.getIntArray(d,"triangles"),j.regionUVs=this.getFloatArray(d,"uvs",1),j.updateUVs(),i=d.color,i&&(j.r=this.toColor(i,0),j.g=this.toColor(i,1),j.b=this.toColor(i,2),j.a=this.toColor(i,3)),j.hullLength=2*(d.hull||0),d.edges&&(j.edges=this.getIntArray(d,"edges")),j.width=(d.width||0)*g,j.height=(d.height||0)*g,j):null}if(e==c.AttachmentType.skinnedmesh){var j=this.attachmentLoader.newSkinnedMeshAttachment(a,b,f);if(!j)return null;j.path=f;for(var k=this.getFloatArray(d,"uvs",1),l=this.getFloatArray(d,"vertices",1),m=[],n=[],o=0,p=l.length;p>o;){var q=0|l[o++];n[n.length]=q;for(var r=o+4*q;r>o;)n[n.length]=l[o],m[m.length]=l[o+1]*g,m[m.length]=l[o+2]*g,m[m.length]=l[o+3],o+=4}return j.bones=n,j.weights=m,j.triangles=this.getIntArray(d,"triangles"),j.regionUVs=k,j.updateUVs(),i=d.color,i&&(j.r=this.toColor(i,0),j.g=this.toColor(i,1),j.b=this.toColor(i,2),j.a=this.toColor(i,3)),j.hullLength=2*(d.hull||0),d.edges&&(j.edges=this.getIntArray(d,"edges")),j.width=(d.width||0)*g,j.height=(d.height||0)*g,j
}if(e==c.AttachmentType.boundingbox){for(var s=this.attachmentLoader.newBoundingBoxAttachment(a,b),l=d.vertices,o=0,p=l.length;p>o;o++)s.vertices.push(l[o]*g);return s}throw"Unknown attachment type: "+e},readAnimation:function(a,b,d){var e=[],f=0,g=b.slots;for(var h in g)if(g.hasOwnProperty(h)){var i=g[h],j=d.findSlotIndex(h);for(var k in i)if(i.hasOwnProperty(k)){var l=i[k];if("color"==k){var m=new c.ColorTimeline(l.length);m.slotIndex=j;for(var n=0,o=0,p=l.length;p>o;o++){var q=l[o],r=q.color,s=this.toColor(r,0),t=this.toColor(r,1),u=this.toColor(r,2),v=this.toColor(r,3);m.setFrame(n,q.time,s,t,u,v),this.readCurve(m,n,q),n++}e.push(m),f=Math.max(f,m.frames[5*m.getFrameCount()-5])}else{if("attachment"!=k)throw"Invalid timeline type for a slot: "+k+" ("+h+")";var m=new c.AttachmentTimeline(l.length);m.slotIndex=j;for(var n=0,o=0,p=l.length;p>o;o++){var q=l[o];m.setFrame(n++,q.time,q.name)}e.push(m),f=Math.max(f,m.frames[m.getFrameCount()-1])}}}var w=b.bones;for(var x in w)if(w.hasOwnProperty(x)){var y=d.findBoneIndex(x);if(-1==y)throw"Bone not found: "+x;var z=w[x];for(var k in z)if(z.hasOwnProperty(k)){var l=z[k];if("rotate"==k){var m=new c.RotateTimeline(l.length);m.boneIndex=y;for(var n=0,o=0,p=l.length;p>o;o++){var q=l[o];m.setFrame(n,q.time,q.angle),this.readCurve(m,n,q),n++}e.push(m),f=Math.max(f,m.frames[2*m.getFrameCount()-2])}else if("translate"==k||"scale"==k){var m,A=1;"scale"==k?m=new c.ScaleTimeline(l.length):(m=new c.TranslateTimeline(l.length),A=this.scale),m.boneIndex=y;for(var n=0,o=0,p=l.length;p>o;o++){var q=l[o],B=(q.x||0)*A,C=(q.y||0)*A;m.setFrame(n,q.time,B,C),this.readCurve(m,n,q),n++}e.push(m),f=Math.max(f,m.frames[3*m.getFrameCount()-3])}else{if("flipX"!=k&&"flipY"!=k)throw"Invalid timeline type for a bone: "+k+" ("+x+")";var B="flipX"==k,m=B?new c.FlipXTimeline(l.length):new c.FlipYTimeline(l.length);m.boneIndex=y;for(var D=B?"x":"y",n=0,o=0,p=l.length;p>o;o++){var q=l[o];m.setFrame(n,q.time,q[D]||!1),n++}e.push(m),f=Math.max(f,m.frames[2*m.getFrameCount()-2])}}}var E=b.ik;for(var F in E)if(E.hasOwnProperty(F)){var G=d.findIkConstraint(F),l=E[F],m=new c.IkConstraintTimeline(l.length);m.ikConstraintIndex=d.ikConstraints.indexOf(G);for(var n=0,o=0,p=l.length;p>o;o++){var q=l[o],H=q.hasOwnProperty("mix")?q.mix:1,I=!q.hasOwnProperty("bendPositive")||q.bendPositive?1:-1;m.setFrame(n,q.time,H,I),this.readCurve(m,n,q),n++}e.push(m),f=Math.max(f,m.frames[3*m.frameCount-3])}var J=b.ffd;for(var K in J){var L=d.findSkin(K),i=J[K];for(h in i){var j=d.findSlotIndex(h),M=i[h];for(var N in M){var l=M[N],m=new c.FfdTimeline(l.length),O=L.getAttachment(j,N);if(!O)throw"FFD attachment not found: "+N;m.slotIndex=j,m.attachment=O;var P,Q=O.type==c.AttachmentType.mesh;P=Q?O.vertices.length:O.weights.length/3*2;for(var n=0,o=0,p=l.length;p>o;o++){var R,q=l[o];if(q.vertices){var S=q.vertices,R=[];R.length=P;var T=q.offset||0,U=S.length;if(1==this.scale)for(var V=0;U>V;V++)R[V+T]=S[V];else for(var V=0;U>V;V++)R[V+T]=S[V]*this.scale;if(Q)for(var W=O.vertices,V=0,U=R.length;U>V;V++)R[V]+=W[V]}else Q?R=O.vertices:(R=[],R.length=P);m.setFrame(n,q.time,R),this.readCurve(m,n,q),n++}e[e.length]=m,f=Math.max(f,m.frames[m.frameCount-1])}}}var X=b.drawOrder;if(X||(X=b.draworder),X){for(var m=new c.DrawOrderTimeline(X.length),Y=d.slots.length,n=0,o=0,p=X.length;p>o;o++){var Z=X[o],$=null;if(Z.offsets){$=[],$.length=Y;for(var V=Y-1;V>=0;V--)$[V]=-1;var _=Z.offsets,ab=[];ab.length=Y-_.length;for(var bb=0,cb=0,V=0,U=_.length;U>V;V++){var db=_[V],j=d.findSlotIndex(db.slot);if(-1==j)throw"Slot not found: "+db.slot;for(;bb!=j;)ab[cb++]=bb++;$[bb+db.offset]=bb++}for(;Y>bb;)ab[cb++]=bb++;for(var V=Y-1;V>=0;V--)-1==$[V]&&($[V]=ab[--cb])}m.setFrame(n++,Z.time,$)}e.push(m),f=Math.max(f,m.frames[m.getFrameCount()-1])}var eb=b.events;if(eb){for(var m=new c.EventTimeline(eb.length),n=0,o=0,p=eb.length;p>o;o++){var fb=eb[o],gb=d.findEvent(fb.name);if(!gb)throw"Event not found: "+fb.name;var hb=new c.Event(gb);hb.intValue=fb.hasOwnProperty("int")?fb["int"]:gb.intValue,hb.floatValue=fb.hasOwnProperty("float")?fb["float"]:gb.floatValue,hb.stringValue=fb.hasOwnProperty("string")?fb.string:gb.stringValue,m.setFrame(n++,fb.time,hb)}e.push(m),f=Math.max(f,m.frames[m.getFrameCount()-1])}d.animations.push(new c.Animation(a,e,f))},readCurve:function(a,b,c){var d=c.curve;d?"stepped"==d?a.curves.setStepped(b):d instanceof Array&&a.curves.setCurve(b,d[0],d[1],d[2],d[3]):a.curves.setLinear(b)},toColor:function(a,b){if(8!=a.length)throw"Color hexidecimal length must be 8, recieved: "+a;return parseInt(a.substring(2*b,2*b+2),16)/255},getFloatArray:function(a,b,d){var e=a[b],f=new c.Float32Array(e.length),g=0,h=e.length;if(1==d)for(;h>g;g++)f[g]=e[g];else for(;h>g;g++)f[g]=e[g]*d;return f},getIntArray:function(a,b){for(var d=a[b],e=new c.Uint16Array(d.length),f=0,g=d.length;g>f;f++)e[f]=0|d[f];return e}},c.Atlas=function(a,b){this.textureLoader=b,this.pages=[],this.regions=[];var d=new c.AtlasReader(a),e=[];e.length=4;for(var f=null;;){var g=d.readLine();if(null===g)break;if(g=d.trim(g),g.length)if(f){var h=new c.AtlasRegion;h.name=g,h.page=f,h.rotate="true"==d.readValue(),d.readTuple(e);var i=parseInt(e[0]),j=parseInt(e[1]);d.readTuple(e);var k=parseInt(e[0]),l=parseInt(e[1]);h.u=i/f.width,h.v=j/f.height,h.rotate?(h.u2=(i+l)/f.width,h.v2=(j+k)/f.height):(h.u2=(i+k)/f.width,h.v2=(j+l)/f.height),h.x=i,h.y=j,h.width=Math.abs(k),h.height=Math.abs(l),4==d.readTuple(e)&&(h.splits=[parseInt(e[0]),parseInt(e[1]),parseInt(e[2]),parseInt(e[3])],4==d.readTuple(e)&&(h.pads=[parseInt(e[0]),parseInt(e[1]),parseInt(e[2]),parseInt(e[3])],d.readTuple(e))),h.originalWidth=parseInt(e[0]),h.originalHeight=parseInt(e[1]),d.readTuple(e),h.offsetX=parseInt(e[0]),h.offsetY=parseInt(e[1]),h.index=parseInt(d.readValue()),this.regions.push(h)}else{f=new c.AtlasPage,f.name=g,2==d.readTuple(e)&&(f.width=parseInt(e[0]),f.height=parseInt(e[1]),d.readTuple(e)),f.format=c.Atlas.Format[e[0]],d.readTuple(e),f.minFilter=c.Atlas.TextureFilter[e[0]],f.magFilter=c.Atlas.TextureFilter[e[1]];var m=d.readValue();f.uWrap=c.Atlas.TextureWrap.clampToEdge,f.vWrap=c.Atlas.TextureWrap.clampToEdge,"x"==m?f.uWrap=c.Atlas.TextureWrap.repeat:"y"==m?f.vWrap=c.Atlas.TextureWrap.repeat:"xy"==m&&(f.uWrap=f.vWrap=c.Atlas.TextureWrap.repeat),b.load(f,g,this),this.pages.push(f)}else f=null}},c.Atlas.prototype={findRegion:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++)if(b[c].name==a)return b[c];return null},dispose:function(){for(var a=this.pages,b=0,c=a.length;c>b;b++)this.textureLoader.unload(a[b].rendererObject)},updateUVs:function(a){for(var b=this.regions,c=0,d=b.length;d>c;c++){var e=b[c];e.page==a&&(e.u=e.x/a.width,e.v=e.y/a.height,e.rotate?(e.u2=(e.x+e.height)/a.width,e.v2=(e.y+e.width)/a.height):(e.u2=(e.x+e.width)/a.width,e.v2=(e.y+e.height)/a.height))}}},c.Atlas.Format={alpha:0,intensity:1,luminanceAlpha:2,rgb565:3,rgba4444:4,rgb888:5,rgba8888:6},c.Atlas.TextureFilter={nearest:0,linear:1,mipMap:2,mipMapNearestNearest:3,mipMapLinearNearest:4,mipMapNearestLinear:5,mipMapLinearLinear:6},c.Atlas.TextureWrap={mirroredRepeat:0,clampToEdge:1,repeat:2},c.AtlasPage=function(){},c.AtlasPage.prototype={name:null,format:null,minFilter:null,magFilter:null,uWrap:null,vWrap:null,rendererObject:null,width:0,height:0},c.AtlasRegion=function(){},c.AtlasRegion.prototype={page:null,name:null,x:0,y:0,width:0,height:0,u:0,v:0,u2:0,v2:0,offsetX:0,offsetY:0,originalWidth:0,originalHeight:0,index:0,rotate:!1,splits:null,pads:null},c.AtlasReader=function(a){this.lines=a.split(/\r\n|\r|\n/)},c.AtlasReader.prototype={index:0,trim:function(a){return a.replace(/^\s+|\s+$/g,"")},readLine:function(){return this.index>=this.lines.length?null:this.lines[this.index++]},readValue:function(){var a=this.readLine(),b=a.indexOf(":");if(-1==b)throw"Invalid line: "+a;return this.trim(a.substring(b+1))},readTuple:function(a){var b=this.readLine(),c=b.indexOf(":");if(-1==c)throw"Invalid line: "+b;for(var d=0,e=c+1;3>d;d++){var f=b.indexOf(",",e);if(-1==f)break;a[d]=this.trim(b.substr(e,f-e)),e=f+1}return a[d]=this.trim(b.substring(e)),d+1}},c.AtlasAttachmentLoader=function(a){this.atlas=a},c.AtlasAttachmentLoader.prototype={newRegionAttachment:function(a,b,d){var e=this.atlas.findRegion(d);if(!e)throw"Region not found in atlas: "+d+" (region attachment: "+b+")";var f=new c.RegionAttachment(b);return f.rendererObject=e,f.setUVs(e.u,e.v,e.u2,e.v2,e.rotate),f.regionOffsetX=e.offsetX,f.regionOffsetY=e.offsetY,f.regionWidth=e.width,f.regionHeight=e.height,f.regionOriginalWidth=e.originalWidth,f.regionOriginalHeight=e.originalHeight,f},newMeshAttachment:function(a,b,d){var e=this.atlas.findRegion(d);if(!e)throw"Region not found in atlas: "+d+" (mesh attachment: "+b+")";var f=new c.MeshAttachment(b);return f.rendererObject=e,f.regionU=e.u,f.regionV=e.v,f.regionU2=e.u2,f.regionV2=e.v2,f.regionRotate=e.rotate,f.regionOffsetX=e.offsetX,f.regionOffsetY=e.offsetY,f.regionWidth=e.width,f.regionHeight=e.height,f.regionOriginalWidth=e.originalWidth,f.regionOriginalHeight=e.originalHeight,f},newSkinnedMeshAttachment:function(a,b,d){var e=this.atlas.findRegion(d);if(!e)throw"Region not found in atlas: "+d+" (skinned mesh attachment: "+b+")";var f=new c.SkinnedMeshAttachment(b);return f.rendererObject=e,f.regionU=e.u,f.regionV=e.v,f.regionU2=e.u2,f.regionV2=e.v2,f.regionRotate=e.rotate,f.regionOffsetX=e.offsetX,f.regionOffsetY=e.offsetY,f.regionWidth=e.width,f.regionHeight=e.height,f.regionOriginalWidth=e.originalWidth,f.regionOriginalHeight=e.originalHeight,f},newBoundingBoxAttachment:function(a,b){return new c.BoundingBoxAttachment(b)}},c.SkeletonBounds=function(){this.polygonPool=[],this.polygons=[],this.boundingBoxes=[]},c.SkeletonBounds.prototype={minX:0,minY:0,maxX:0,maxY:0,update:function(a,b){var d=a.slots,e=d.length,f=a.x,g=a.y,h=this.boundingBoxes,i=this.polygonPool,j=this.polygons;h.length=0;for(var k=0,l=j.length;l>k;k++)i.push(j[k]);j.length=0;for(var k=0;e>k;k++){var m=d[k],n=m.attachment;if(n.type==c.AttachmentType.boundingbox){h.push(n);var o,p=i.length;p>0?(o=i[p-1],i.splice(p-1,1)):o=[],j.push(o),o.length=n.vertices.length,n.computeWorldVertices(f,g,m.bone,o)}}b&&this.aabbCompute()},aabbCompute:function(){for(var a=this.polygons,b=Number.MAX_VALUE,c=Number.MAX_VALUE,d=Number.MIN_VALUE,e=Number.MIN_VALUE,f=0,g=a.length;g>f;f++)for(var h=a[f],i=0,j=h.length;j>i;i+=2){var k=h[i],l=h[i+1];b=Math.min(b,k),c=Math.min(c,l),d=Math.max(d,k),e=Math.max(e,l)}this.minX=b,this.minY=c,this.maxX=d,this.maxY=e},aabbContainsPoint:function(a,b){return a>=this.minX&&a<=this.maxX&&b>=this.minY&&b<=this.maxY},aabbIntersectsSegment:function(a,b,c,d){var e=this.minX,f=this.minY,g=this.maxX,h=this.maxY;if(e>=a&&e>=c||f>=b&&f>=d||a>=g&&c>=g||b>=h&&d>=h)return!1;var i=(d-b)/(c-a),j=i*(e-a)+b;if(j>f&&h>j)return!0;if(j=i*(g-a)+b,j>f&&h>j)return!0;var k=(f-b)/i+a;return k>e&&g>k?!0:(k=(h-b)/i+a,k>e&&g>k?!0:!1)},aabbIntersectsSkeleton:function(a){return this.minX<a.maxX&&this.maxX>a.minX&&this.minY<a.maxY&&this.maxY>a.minY},containsPoint:function(a,b){for(var c=this.polygons,d=0,e=c.length;e>d;d++)if(this.polygonContainsPoint(c[d],a,b))return this.boundingBoxes[d];return null},intersectsSegment:function(a,b,c,d){for(var e=this.polygons,f=0,g=e.length;g>f;f++)if(e[f].intersectsSegment(a,b,c,d))return this.boundingBoxes[f];return null},polygonContainsPoint:function(a,b,c){for(var d=a.length,e=d-2,f=!1,g=0;d>g;g+=2){var h=a[g+1],i=a[e+1];if(c>h&&i>=c||c>i&&h>=c){var j=a[g];j+(c-h)/(i-h)*(a[e]-j)<b&&(f=!f)}e=g}return f},polygonIntersectsSegment:function(a,b,c,d,e){for(var f=a.length,g=b-d,h=c-e,i=b*e-c*d,j=a[f-2],k=a[f-1],l=0;f>l;l+=2){var m=a[l],n=a[l+1],o=j*n-k*m,p=j-m,q=k-n,r=g*q-h*p,s=(i*p-g*o)/r;if((s>=j&&m>=s||s>=m&&j>=s)&&(s>=b&&d>=s||s>=d&&b>=s)){var t=(i*q-h*o)/r;if((t>=k&&n>=t||t>=n&&k>=t)&&(t>=c&&e>=t||t>=e&&c>=t))return!0}j=m,k=n}return!1},getPolygon:function(a){var b=this.boundingBoxes.indexOf(a);return-1==b?null:this.polygons[b]},getWidth:function(){return this.maxX-this.minX},getHeight:function(){return this.maxY-this.minY}},c.Bone.yDown=!0,b.AnimCache={},b.SpineTextureLoader=function(a,c){b.EventTarget.call(this),this.basePath=a,this.crossorigin=c,this.loadingCount=0},b.SpineTextureLoader.prototype=b.SpineTextureLoader,b.SpineTextureLoader.prototype.load=function(a,c){if(a.rendererObject=b.BaseTexture.fromImage(this.basePath+"/"+c,this.crossorigin),!a.rendererObject.hasLoaded){var d=this;++d.loadingCount,a.rendererObject.addEventListener("loaded",function(){--d.loadingCount,d.dispatchEvent({type:"loadedBaseTexture",content:d})})}},b.SpineTextureLoader.prototype.unload=function(a){a.destroy(!0)},b.Spine=function(a){if(b.DisplayObjectContainer.call(this),this.spineData=b.AnimCache[a],!this.spineData)throw new Error("Spine data must be preloaded using PIXI.SpineLoader or PIXI.AssetLoader: "+a);this.skeleton=new c.Skeleton(this.spineData),this.skeleton.updateWorldTransform(),this.stateData=new c.AnimationStateData(this.spineData),this.state=new c.AnimationState(this.stateData),this.slotContainers=[];for(var d=0,e=this.skeleton.drawOrder.length;e>d;d++){var f=this.skeleton.drawOrder[d],g=f.attachment,h=new b.DisplayObjectContainer;if(this.slotContainers.push(h),this.addChild(h),g instanceof c.RegionAttachment){var i=g.rendererObject.name,j=this.createSprite(f,g);f.currentSprite=j,f.currentSpriteName=i,h.addChild(j)}else{if(!(g instanceof c.MeshAttachment))continue;var k=this.createMesh(f,g);f.currentMesh=k,f.currentMeshName=g.name,h.addChild(k)}}this.autoUpdate=!0},b.Spine.prototype=Object.create(b.DisplayObjectContainer.prototype),b.Spine.prototype.constructor=b.Spine,Object.defineProperty(b.Spine.prototype,"autoUpdate",{get:function(){return this.updateTransform===b.Spine.prototype.autoUpdateTransform},set:function(a){this.updateTransform=a?b.Spine.prototype.autoUpdateTransform:b.DisplayObjectContainer.prototype.updateTransform}}),b.Spine.prototype.update=function(a){this.state.update(a),this.state.apply(this.skeleton),this.skeleton.updateWorldTransform();for(var d=this.skeleton.drawOrder,e=0,f=d.length;f>e;e++){var g=d[e],h=g.attachment,i=this.slotContainers[e];if(h){var j=h.type;if(j===c.AttachmentType.region){if(h.rendererObject&&(!g.currentSpriteName||g.currentSpriteName!==h.name)){var k=h.rendererObject.name;if(void 0!==g.currentSprite&&(g.currentSprite.visible=!1),g.sprites=g.sprites||{},void 0!==g.sprites[k])g.sprites[k].visible=!0;else{var l=this.createSprite(g,h);i.addChild(l)}g.currentSprite=g.sprites[k],g.currentSpriteName=k}var m=g.bone;i.position.x=m.worldX+h.x*m.m00+h.y*m.m01,i.position.y=m.worldY+h.x*m.m10+h.y*m.m11,i.scale.x=m.worldScaleX,i.scale.y=m.worldScaleY,i.rotation=-(g.bone.worldRotation*c.degRad),g.currentSprite.tint=b.rgb2hex([g.r,g.g,g.b])}else{if(j!==c.AttachmentType.skinnedmesh){i.visible=!1;continue}if(!g.currentMeshName||g.currentMeshName!==h.name){var n=h.name;if(void 0!==g.currentMesh&&(g.currentMesh.visible=!1),g.meshes=g.meshes||{},void 0!==g.meshes[n])g.meshes[n].visible=!0;else{var o=this.createMesh(g,h);i.addChild(o)}g.currentMesh=g.meshes[n],g.currentMeshName=n}h.computeWorldVertices(g.bone.skeleton.x,g.bone.skeleton.y,g,g.currentMesh.vertices)}i.visible=!0,i.alpha=g.a}else i.visible=!1}},b.Spine.prototype.autoUpdateTransform=function(){this.lastTime=this.lastTime||Date.now();var a=.001*(Date.now()-this.lastTime);this.lastTime=Date.now(),this.update(a),b.DisplayObjectContainer.prototype.updateTransform.call(this)},b.Spine.prototype.createSprite=function(a,d){var e=d.rendererObject,f=e.page.rendererObject,g=new b.Rectangle(e.x,e.y,e.rotate?e.height:e.width,e.rotate?e.width:e.height),h=new b.Texture(f,g),i=new b.Sprite(h),j=e.rotate?.5*Math.PI:0;return i.scale.set(e.width/e.originalWidth,e.height/e.originalHeight),i.rotation=j-d.rotation*c.degRad,i.anchor.x=i.anchor.y=.5,a.sprites=a.sprites||{},a.sprites[e.name]=i,i},b.Spine.prototype.createMesh=function(a,c){var d=c.rendererObject,e=d.page.rendererObject,f=new b.Texture(e),g=new b.Strip(f);return g.drawMode=b.Strip.DrawModes.TRIANGLES,g.canvasPadding=1.5,g.vertices=new b.Float32Array(c.uvs.length),g.uvs=c.uvs,g.indices=c.triangles,a.meshes=a.meshes||{},a.meshes[c.name]=g,g},b.BaseTextureCache={},b.BaseTextureCacheIdGenerator=0,b.BaseTexture=function(a,c){if(this.resolution=1,this.width=100,this.height=100,this.scaleMode=c||b.scaleModes.DEFAULT,this.hasLoaded=!1,this.source=a,this._UID=b._UID++,this.premultipliedAlpha=!0,this._glTextures=[],this.mipmap=!1,this._dirty=[!0,!0,!0,!0],a){if((this.source.complete||this.source.getContext)&&this.source.width&&this.source.height)this.hasLoaded=!0,this.width=this.source.naturalWidth||this.source.width,this.height=this.source.naturalHeight||this.source.height,this.dirty();else{var d=this;this.source.onload=function(){d.hasLoaded=!0,d.width=d.source.naturalWidth||d.source.width,d.height=d.source.naturalHeight||d.source.height,d.dirty(),d.dispatchEvent({type:"loaded",content:d})},this.source.onerror=function(){d.dispatchEvent({type:"error",content:d})}}this.imageUrl=null,this._powerOf2=!1}},b.BaseTexture.prototype.constructor=b.BaseTexture,b.EventTarget.mixin(b.BaseTexture.prototype),b.BaseTexture.prototype.destroy=function(){this.imageUrl?(delete b.BaseTextureCache[this.imageUrl],delete b.TextureCache[this.imageUrl],this.imageUrl=null,navigator.isCocoonJS||(this.source.src="")):this.source&&this.source._pixiId&&delete b.BaseTextureCache[this.source._pixiId],this.source=null,this.unloadFromGPU()},b.BaseTexture.prototype.updateSourceImage=function(a){this.hasLoaded=!1,this.source.src=null,this.source.src=a},b.BaseTexture.prototype.dirty=function(){for(var a=0;a<this._glTextures.length;a++)this._dirty[a]=!0},b.BaseTexture.prototype.unloadFromGPU=function(){this.dirty();for(var a=this._glTextures.length-1;a>=0;a--){var c=this._glTextures[a],d=b.glContexts[a];d&&c&&d.deleteTexture(c)}this._glTextures.length=0,this.dirty()},b.BaseTexture.fromImage=function(a,c,d){var e=b.BaseTextureCache[a];if(void 0===c&&-1===a.indexOf("data:")&&(c=!0),!e){var f=new Image;c&&(f.crossOrigin=""),f.src=a,e=new b.BaseTexture(f,d),e.imageUrl=a,b.BaseTextureCache[a]=e,-1!==a.indexOf(b.RETINA_PREFIX+".")&&(e.resolution=2)}return e},b.BaseTexture.fromCanvas=function(a,c){a._pixiId||(a._pixiId="canvas_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.BaseTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.TextureCache={},b.FrameCache={},b.TextureCacheIdGenerator=0,b.Texture=function(a,c,d,e){this.noFrame=!1,c||(this.noFrame=!0,c=new b.Rectangle(0,0,1,1)),a instanceof b.Texture&&(a=a.baseTexture),this.baseTexture=a,this.frame=c,this.trim=e,this.valid=!1,this.requiresUpdate=!1,this._uvs=null,this.width=0,this.height=0,this.crop=d||new b.Rectangle(0,0,1,1),a.hasLoaded?(this.noFrame&&(c=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(c)):a.addEventListener("loaded",this.onBaseTextureLoaded.bind(this))},b.Texture.prototype.constructor=b.Texture,b.EventTarget.mixin(b.Texture.prototype),b.Texture.prototype.onBaseTextureLoaded=function(){var a=this.baseTexture;a.removeEventListener("loaded",this.onLoaded),this.noFrame&&(this.frame=new b.Rectangle(0,0,a.width,a.height)),this.setFrame(this.frame),this.dispatchEvent({type:"update",content:this})},b.Texture.prototype.destroy=function(a){a&&this.baseTexture.destroy(),this.valid=!1},b.Texture.prototype.setFrame=function(a){if(this.noFrame=!1,this.frame=a,this.width=a.width,this.height=a.height,this.crop.x=a.x,this.crop.y=a.y,this.crop.width=a.width,this.crop.height=a.height,!this.trim&&(a.x+a.width>this.baseTexture.width||a.y+a.height>this.baseTexture.height))throw new Error("Texture Error: frame does not fit inside the base Texture dimensions "+this);this.valid=a&&a.width&&a.height&&this.baseTexture.source&&this.baseTexture.hasLoaded,this.trim&&(this.width=this.trim.width,this.height=this.trim.height,this.frame.width=this.trim.width,this.frame.height=this.trim.height),this.valid&&this._updateUvs()},b.Texture.prototype._updateUvs=function(){this._uvs||(this._uvs=new b.TextureUvs);var a=this.crop,c=this.baseTexture.width,d=this.baseTexture.height;this._uvs.x0=a.x/c,this._uvs.y0=a.y/d,this._uvs.x1=(a.x+a.width)/c,this._uvs.y1=a.y/d,this._uvs.x2=(a.x+a.width)/c,this._uvs.y2=(a.y+a.height)/d,this._uvs.x3=a.x/c,this._uvs.y3=(a.y+a.height)/d},b.Texture.fromImage=function(a,c,d){var e=b.TextureCache[a];return e||(e=new b.Texture(b.BaseTexture.fromImage(a,c,d)),b.TextureCache[a]=e),e},b.Texture.fromFrame=function(a){var c=b.TextureCache[a];if(!c)throw new Error('The frameId "'+a+'" does not exist in the texture cache ');return c},b.Texture.fromCanvas=function(a,c){var d=b.BaseTexture.fromCanvas(a,c);return new b.Texture(d)},b.Texture.addTextureToCache=function(a,c){b.TextureCache[c]=a},b.Texture.removeTextureFromCache=function(a){var c=b.TextureCache[a];return delete b.TextureCache[a],delete b.BaseTextureCache[a],c},b.TextureUvs=function(){this.x0=0,this.y0=0,this.x1=0,this.y1=0,this.x2=0,this.y2=0,this.x3=0,this.y3=0},b.Texture.emptyTexture=new b.Texture(new b.BaseTexture),b.RenderTexture=function(a,c,d,e,f){if(this.width=a||100,this.height=c||100,this.resolution=f||1,this.frame=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.crop=new b.Rectangle(0,0,this.width*this.resolution,this.height*this.resolution),this.baseTexture=new b.BaseTexture,this.baseTexture.width=this.width*this.resolution,this.baseTexture.height=this.height*this.resolution,this.baseTexture._glTextures=[],this.baseTexture.resolution=this.resolution,this.baseTexture.scaleMode=e||b.scaleModes.DEFAULT,this.baseTexture.hasLoaded=!0,b.Texture.call(this,this.baseTexture,new b.Rectangle(0,0,this.width,this.height)),this.renderer=d||b.defaultRenderer,this.renderer.type===b.WEBGL_RENDERER){var g=this.renderer.gl;this.baseTexture._dirty[g.id]=!1,this.textureBuffer=new b.FilterTexture(g,this.width*this.resolution,this.height*this.resolution,this.baseTexture.scaleMode),this.baseTexture._glTextures[g.id]=this.textureBuffer.texture,this.render=this.renderWebGL,this.projection=new b.Point(.5*this.width,.5*-this.height)}else this.render=this.renderCanvas,this.textureBuffer=new b.CanvasBuffer(this.width*this.resolution,this.height*this.resolution),this.baseTexture.source=this.textureBuffer.canvas;this.valid=!0,this._updateUvs()},b.RenderTexture.prototype=Object.create(b.Texture.prototype),b.RenderTexture.prototype.constructor=b.RenderTexture,b.RenderTexture.prototype.resize=function(a,c,d){(a!==this.width||c!==this.height)&&(this.valid=a>0&&c>0,this.width=this.frame.width=this.crop.width=a,this.height=this.frame.height=this.crop.height=c,d&&(this.baseTexture.width=this.width,this.baseTexture.height=this.height),this.renderer.type===b.WEBGL_RENDERER&&(this.projection.x=this.width/2,this.projection.y=-this.height/2),this.valid&&this.textureBuffer.resize(this.width*this.resolution,this.height*this.resolution))},b.RenderTexture.prototype.clear=function(){this.valid&&(this.renderer.type===b.WEBGL_RENDERER&&this.renderer.gl.bindFramebuffer(this.renderer.gl.FRAMEBUFFER,this.textureBuffer.frameBuffer),this.textureBuffer.clear())},b.RenderTexture.prototype.renderWebGL=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),d.translate(0,2*this.projection.y),b&&d.append(b),d.scale(1,-1),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();var h=this.renderer.gl;h.viewport(0,0,this.width*this.resolution,this.height*this.resolution),h.bindFramebuffer(h.FRAMEBUFFER,this.textureBuffer.frameBuffer),c&&this.textureBuffer.clear(),this.renderer.spriteBatch.dirty=!0,this.renderer.renderDisplayObject(a,this.projection,this.textureBuffer.frameBuffer),this.renderer.spriteBatch.dirty=!0}},b.RenderTexture.prototype.renderCanvas=function(a,b,c){if(this.valid){var d=a.worldTransform;d.identity(),b&&d.append(b),a.worldAlpha=1;for(var e=a.children,f=0,g=e.length;g>f;f++)e[f].updateTransform();c&&this.textureBuffer.clear();var h=this.textureBuffer.context,i=this.renderer.resolution;this.renderer.resolution=this.resolution,this.renderer.renderDisplayObject(a,h),this.renderer.resolution=i}},b.RenderTexture.prototype.getImage=function(){var a=new Image;return a.src=this.getBase64(),a},b.RenderTexture.prototype.getBase64=function(){return this.getCanvas().toDataURL()},b.RenderTexture.prototype.getCanvas=function(){if(this.renderer.type===b.WEBGL_RENDERER){var a=this.renderer.gl,c=this.textureBuffer.width,d=this.textureBuffer.height,e=new Uint8Array(4*c*d);a.bindFramebuffer(a.FRAMEBUFFER,this.textureBuffer.frameBuffer),a.readPixels(0,0,c,d,a.RGBA,a.UNSIGNED_BYTE,e),a.bindFramebuffer(a.FRAMEBUFFER,null);var f=new b.CanvasBuffer(c,d),g=f.context.getImageData(0,0,c,d);return g.data.set(e),f.context.putImageData(g,0,0),f.canvas}return this.textureBuffer.canvas},b.RenderTexture.tempMatrix=new b.Matrix,b.VideoTexture=function(a,c){if(!a)throw new Error("No video source element specified.");(a.readyState===a.HAVE_ENOUGH_DATA||a.readyState===a.HAVE_FUTURE_DATA)&&a.width&&a.height&&(a.complete=!0),b.BaseTexture.call(this,a,c),this.autoUpdate=!1,this.updateBound=this._onUpdate.bind(this),a.complete||(this._onCanPlay=this.onCanPlay.bind(this),a.addEventListener("canplay",this._onCanPlay),a.addEventListener("canplaythrough",this._onCanPlay),a.addEventListener("play",this.onPlayStart.bind(this)),a.addEventListener("pause",this.onPlayStop.bind(this)))},b.VideoTexture.prototype=Object.create(b.BaseTexture.prototype),b.VideoTexture.constructor=b.VideoTexture,b.VideoTexture.prototype._onUpdate=function(){this.autoUpdate&&(window.requestAnimationFrame(this.updateBound),this.dirty())},b.VideoTexture.prototype.onPlayStart=function(){this.autoUpdate||(window.requestAnimationFrame(this.updateBound),this.autoUpdate=!0)},b.VideoTexture.prototype.onPlayStop=function(){this.autoUpdate=!1},b.VideoTexture.prototype.onCanPlay=function(){"canplaythrough"===event.type&&(this.hasLoaded=!0,this.source&&(this.source.removeEventListener("canplay",this._onCanPlay),this.source.removeEventListener("canplaythrough",this._onCanPlay),this.width=this.source.videoWidth,this.height=this.source.videoHeight,this.__loaded||(this.__loaded=!0,this.dispatchEvent({type:"loaded",content:this}))))},b.VideoTexture.prototype.destroy=function(){this.source&&this.source._pixiId&&(b.BaseTextureCache[this.source._pixiId]=null,delete b.BaseTextureCache[this.source._pixiId],this.source._pixiId=null,delete this.source._pixiId),b.BaseTexture.prototype.destroy.call(this)},b.VideoTexture.baseTextureFromVideo=function(a,c){a._pixiId||(a._pixiId="video_"+b.TextureCacheIdGenerator++);var d=b.BaseTextureCache[a._pixiId];return d||(d=new b.VideoTexture(a,c),b.BaseTextureCache[a._pixiId]=d),d},b.VideoTexture.textureFromVideo=function(a,c){var d=b.VideoTexture.baseTextureFromVideo(a,c);return new b.Texture(d)},b.VideoTexture.fromUrl=function(a,c){var d=document.createElement("video");return d.src=a,d.autoPlay=!0,d.play(),b.VideoTexture.textureFromVideo(d,c)},b.AssetLoader=function(a,c){this.assetURLs=a,this.crossorigin=c,this.loadersByType={jpg:b.ImageLoader,jpeg:b.ImageLoader,png:b.ImageLoader,gif:b.ImageLoader,webp:b.ImageLoader,json:b.JsonLoader,atlas:b.AtlasLoader,anim:b.SpineLoader,xml:b.BitmapFontLoader,fnt:b.BitmapFontLoader}},b.EventTarget.mixin(b.AssetLoader.prototype),b.AssetLoader.prototype.constructor=b.AssetLoader,b.AssetLoader.prototype._getDataType=function(a){var b="data:",c=a.slice(0,b.length).toLowerCase();if(c===b){var d=a.slice(b.length),e=d.indexOf(",");if(-1===e)return null;var f=d.slice(0,e).split(";")[0];return f&&"text/plain"!==f.toLowerCase()?f.split("/").pop().toLowerCase():"txt"}return null},b.AssetLoader.prototype.load=function(){function a(a){b.onAssetLoaded(a.data.content)}var b=this;this.loadCount=this.assetURLs.length;for(var c=0;c<this.assetURLs.length;c++){var d=this.assetURLs[c],e=this._getDataType(d);e||(e=d.split("?").shift().split(".").pop().toLowerCase());var f=this.loadersByType[e];if(!f)throw new Error(e+" is an unsupported file type");var g=new f(d,this.crossorigin);g.on("loaded",a),g.load()}},b.AssetLoader.prototype.onAssetLoaded=function(a){this.loadCount--,this.emit("onProgress",{content:this,loader:a}),this.onProgress&&this.onProgress(a),this.loadCount||(this.emit("onComplete",{content:this}),this.onComplete&&this.onComplete())},b.JsonLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.loaded=!1},b.JsonLoader.prototype.constructor=b.JsonLoader,b.EventTarget.mixin(b.JsonLoader.prototype),b.JsonLoader.prototype.load=function(){window.XDomainRequest&&this.crossorigin?(this.ajaxRequest=new window.XDomainRequest,this.ajaxRequest.timeout=3e3,this.ajaxRequest.onerror=this.onError.bind(this),this.ajaxRequest.ontimeout=this.onError.bind(this),this.ajaxRequest.onprogress=function(){},this.ajaxRequest.onload=this.onJSONLoaded.bind(this)):(this.ajaxRequest=window.XMLHttpRequest?new window.XMLHttpRequest:new window.ActiveXObject("Microsoft.XMLHTTP"),this.ajaxRequest.onreadystatechange=this.onReadyStateChanged.bind(this)),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.send()},b.JsonLoader.prototype.onReadyStateChanged=function(){4!==this.ajaxRequest.readyState||200!==this.ajaxRequest.status&&-1!==window.location.href.indexOf("http")||this.onJSONLoaded()},b.JsonLoader.prototype.onJSONLoaded=function(){if(!this.ajaxRequest.responseText)return this.onError(),void 0;if(this.json=JSON.parse(this.ajaxRequest.responseText),this.json.frames){var a=this.baseUrl+this.json.meta.image,d=new b.ImageLoader(a,this.crossorigin),e=this.json.frames;this.texture=d.texture.baseTexture,d.addEventListener("loaded",this.onLoaded.bind(this));for(var f in e){var g=e[f].frame;if(g){var h=new b.Rectangle(g.x,g.y,g.w,g.h),i=h.clone(),j=null;if(e[f].trimmed){var k=e[f].sourceSize,l=e[f].spriteSourceSize;j=new b.Rectangle(l.x,l.y,k.w,k.h)}b.TextureCache[f]=new b.Texture(this.texture,h,i,j)}}d.load()}else if(this.json.bones)if(b.AnimCache[this.url])this.onLoaded();else{var m=this.url.substr(0,this.url.lastIndexOf("."))+".atlas",n=new b.JsonLoader(m,this.crossorigin),o=this;n.onJSONLoaded=function(){if(!this.ajaxRequest.responseText)return this.onError(),void 0;var a=new b.SpineTextureLoader(this.url.substring(0,this.url.lastIndexOf("/"))),d=new c.Atlas(this.ajaxRequest.responseText,a),e=new c.AtlasAttachmentLoader(d),f=new c.SkeletonJson(e),g=f.readSkeletonData(o.json);b.AnimCache[o.url]=g,o.spine=g,o.spineAtlas=d,o.spineAtlasLoader=n,a.loadingCount>0?a.addEventListener("loadedBaseTexture",function(a){a.content.content.loadingCount<=0&&o.onLoaded()}):o.onLoaded()},n.load()}else this.onLoaded()},b.JsonLoader.prototype.onLoaded=function(){this.loaded=!0,this.dispatchEvent({type:"loaded",content:this})},b.JsonLoader.prototype.onError=function(){this.dispatchEvent({type:"error",content:this})},b.AtlasLoader=function(a,b){this.url=a,this.baseUrl=a.replace(/[^\/]*$/,""),this.crossorigin=b,this.loaded=!1},b.AtlasLoader.constructor=b.AtlasLoader,b.EventTarget.mixin(b.AtlasLoader.prototype),b.AtlasLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onAtlasLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/json"),this.ajaxRequest.send(null)},b.AtlasLoader.prototype.onAtlasLoaded=function(){if(4===this.ajaxRequest.readyState)if(200===this.ajaxRequest.status||-1===window.location.href.indexOf("http")){this.atlas={meta:{image:[]},frames:[]};var a=this.ajaxRequest.responseText.split(/\r?\n/),c=-3,d=0,e=null,f=!1,g=0,h=0,i=this.onLoaded.bind(this);for(g=0;g<a.length;g++)if(a[g]=a[g].replace(/^\s+|\s+$/g,""),""===a[g]&&(f=g+1),a[g].length>0){if(f===g)this.atlas.meta.image.push(a[g]),d=this.atlas.meta.image.length-1,this.atlas.frames.push({}),c=-3;else if(c>0)if(c%7===1)null!=e&&(this.atlas.frames[d][e.name]=e),e={name:a[g],frame:{}};else{var j=a[g].split(" ");if(c%7===3)e.frame.x=Number(j[1].replace(",","")),e.frame.y=Number(j[2]);else if(c%7===4)e.frame.w=Number(j[1].replace(",","")),e.frame.h=Number(j[2]);
else if(c%7===5){var k={x:0,y:0,w:Number(j[1].replace(",","")),h:Number(j[2])};k.w>e.frame.w||k.h>e.frame.h?(e.trimmed=!0,e.realSize=k):e.trimmed=!1}}c++}if(null!=e&&(this.atlas.frames[d][e.name]=e),this.atlas.meta.image.length>0){for(this.images=[],h=0;h<this.atlas.meta.image.length;h++){var l=this.baseUrl+this.atlas.meta.image[h],m=this.atlas.frames[h];this.images.push(new b.ImageLoader(l,this.crossorigin));for(g in m){var n=m[g].frame;n&&(b.TextureCache[g]=new b.Texture(this.images[h].texture.baseTexture,{x:n.x,y:n.y,width:n.w,height:n.h}),m[g].trimmed&&(b.TextureCache[g].realSize=m[g].realSize,b.TextureCache[g].trim.x=0,b.TextureCache[g].trim.y=0))}}for(this.currentImageId=0,h=0;h<this.images.length;h++)this.images[h].on("loaded",i);this.images[this.currentImageId].load()}else this.onLoaded()}else this.onError()},b.AtlasLoader.prototype.onLoaded=function(){this.images.length-1>this.currentImageId?(this.currentImageId++,this.images[this.currentImageId].load()):(this.loaded=!0,this.emit("loaded",{content:this}))},b.AtlasLoader.prototype.onError=function(){this.emit("error",{content:this})},b.SpriteSheetLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null,this.frames={}},b.SpriteSheetLoader.prototype.constructor=b.SpriteSheetLoader,b.EventTarget.mixin(b.SpriteSheetLoader.prototype),b.SpriteSheetLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpriteSheetLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader=function(a,c){this.texture=b.Texture.fromImage(a,c),this.frames=[]},b.ImageLoader.prototype.constructor=b.ImageLoader,b.EventTarget.mixin(b.ImageLoader.prototype),b.ImageLoader.prototype.load=function(){this.texture.baseTexture.hasLoaded?this.onLoaded():this.texture.baseTexture.on("loaded",this.onLoaded.bind(this))},b.ImageLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.ImageLoader.prototype.loadFramedSpriteSheet=function(a,c,d){this.frames=[];for(var e=Math.floor(this.texture.width/a),f=Math.floor(this.texture.height/c),g=0,h=0;f>h;h++)for(var i=0;e>i;i++,g++){var j=new b.Texture(this.texture.baseTexture,{x:i*a,y:h*c,width:a,height:c});this.frames.push(j),d&&(b.TextureCache[d+"-"+g]=j)}this.load()},b.BitmapFontLoader=function(a,b){this.url=a,this.crossorigin=b,this.baseUrl=a.replace(/[^\/]*$/,""),this.texture=null},b.BitmapFontLoader.prototype.constructor=b.BitmapFontLoader,b.EventTarget.mixin(b.BitmapFontLoader.prototype),b.BitmapFontLoader.prototype.load=function(){this.ajaxRequest=new b.AjaxRequest,this.ajaxRequest.onreadystatechange=this.onXMLLoaded.bind(this),this.ajaxRequest.open("GET",this.url,!0),this.ajaxRequest.overrideMimeType&&this.ajaxRequest.overrideMimeType("application/xml"),this.ajaxRequest.send(null)},b.BitmapFontLoader.prototype.onXMLLoaded=function(){if(4===this.ajaxRequest.readyState&&(200===this.ajaxRequest.status||-1===window.location.protocol.indexOf("http"))){var a=this.ajaxRequest.responseXML;if(!a||/MSIE 9/i.test(navigator.userAgent)||navigator.isCocoonJS)if("function"==typeof window.DOMParser){var c=new DOMParser;a=c.parseFromString(this.ajaxRequest.responseText,"text/xml")}else{var d=document.createElement("div");d.innerHTML=this.ajaxRequest.responseText,a=d}var e=this.baseUrl+a.getElementsByTagName("page")[0].getAttribute("file"),f=new b.ImageLoader(e,this.crossorigin);this.texture=f.texture.baseTexture;var g={},h=a.getElementsByTagName("info")[0],i=a.getElementsByTagName("common")[0];g.font=h.getAttribute("face"),g.size=parseInt(h.getAttribute("size"),10),g.lineHeight=parseInt(i.getAttribute("lineHeight"),10),g.chars={};for(var j=a.getElementsByTagName("char"),k=0;k<j.length;k++){var l=parseInt(j[k].getAttribute("id"),10),m=new b.Rectangle(parseInt(j[k].getAttribute("x"),10),parseInt(j[k].getAttribute("y"),10),parseInt(j[k].getAttribute("width"),10),parseInt(j[k].getAttribute("height"),10));g.chars[l]={xOffset:parseInt(j[k].getAttribute("xoffset"),10),yOffset:parseInt(j[k].getAttribute("yoffset"),10),xAdvance:parseInt(j[k].getAttribute("xadvance"),10),kerning:{},texture:b.TextureCache[l]=new b.Texture(this.texture,m)}}var n=a.getElementsByTagName("kerning");for(k=0;k<n.length;k++){var o=parseInt(n[k].getAttribute("first"),10),p=parseInt(n[k].getAttribute("second"),10),q=parseInt(n[k].getAttribute("amount"),10);g.chars[p].kerning[o]=q}b.BitmapText.fonts[g.font]=g,f.addEventListener("loaded",this.onLoaded.bind(this)),f.load()}},b.BitmapFontLoader.prototype.onLoaded=function(){this.emit("loaded",{content:this})},b.SpineLoader=function(a,b){this.url=a,this.crossorigin=b,this.loaded=!1},b.SpineLoader.prototype.constructor=b.SpineLoader,b.EventTarget.mixin(b.SpineLoader.prototype),b.SpineLoader.prototype.load=function(){var a=this,c=new b.JsonLoader(this.url,this.crossorigin);c.on("loaded",function(b){a.json=b.data.content.json,a.onLoaded()}),c.load()},b.SpineLoader.prototype.onLoaded=function(){this.loaded=!0,this.emit("loaded",{content:this})},b.AbstractFilter=function(a,b){this.passes=[this],this.shaders=[],this.dirty=!0,this.padding=0,this.uniforms=b||{},this.fragmentSrc=a||[]},b.AbstractFilter.prototype.constructor=b.AbstractFilter,b.AbstractFilter.prototype.syncUniforms=function(){for(var a=0,b=this.shaders.length;b>a;a++)this.shaders[a].dirty=!0},b.AlphaMaskFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={mask:{type:"sampler2D",value:a},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mask.value.x=a.width,this.uniforms.mask.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D mask;","uniform sampler2D uSampler;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   mapCords *= dimensions.xy / mapDimensions;","   vec4 original =  texture2D(uSampler, vTextureCoord);","   float maskAlpha =  texture2D(mask, mapCords).r;","   original *= maskAlpha;","   gl_FragColor =  original;","}"]},b.AlphaMaskFilter.prototype=Object.create(b.AbstractFilter.prototype),b.AlphaMaskFilter.prototype.constructor=b.AlphaMaskFilter,b.AlphaMaskFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.mask.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.mask.value.height,this.uniforms.mask.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.AlphaMaskFilter.prototype,"map",{get:function(){return this.uniforms.mask.value},set:function(a){this.uniforms.mask.value=a}}),b.ColorMatrixFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={matrix:{type:"mat4",value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform mat4 matrix;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord) * matrix;","}"]},b.ColorMatrixFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorMatrixFilter.prototype.constructor=b.ColorMatrixFilter,Object.defineProperty(b.ColorMatrixFilter.prototype,"matrix",{get:function(){return this.uniforms.matrix.value},set:function(a){this.uniforms.matrix.value=a}}),b.GrayFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={gray:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float gray;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(0.2126*gl_FragColor.r + 0.7152*gl_FragColor.g + 0.0722*gl_FragColor.b), gray);","}"]},b.GrayFilter.prototype=Object.create(b.AbstractFilter.prototype),b.GrayFilter.prototype.constructor=b.GrayFilter,Object.defineProperty(b.GrayFilter.prototype,"gray",{get:function(){return this.uniforms.gray.value},set:function(a){this.uniforms.gray.value=a}}),b.DisplacementFilter=function(a){b.AbstractFilter.call(this),this.passes=[this],a.baseTexture._powerOf2=!0,this.uniforms={displacementMap:{type:"sampler2D",value:a},scale:{type:"2f",value:{x:30,y:30}},offset:{type:"2f",value:{x:0,y:0}},mapDimensions:{type:"2f",value:{x:1,y:5112}},dimensions:{type:"4fv",value:[0,0,0,0]}},a.baseTexture.hasLoaded?(this.uniforms.mapDimensions.value.x=a.width,this.uniforms.mapDimensions.value.y=a.height):(this.boundLoadedFunction=this.onTextureLoaded.bind(this),a.baseTexture.on("loaded",this.boundLoadedFunction)),this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D displacementMap;","uniform sampler2D uSampler;","uniform vec2 scale;","uniform vec2 offset;","uniform vec4 dimensions;","uniform vec2 mapDimensions;","void main(void) {","   vec2 mapCords = vTextureCoord.xy;","   mapCords += (dimensions.zw + offset)/ dimensions.xy ;","   mapCords.y *= -1.0;","   mapCords.y += 1.0;","   vec2 matSample = texture2D(displacementMap, mapCords).xy;","   matSample -= 0.5;","   matSample *= scale;","   matSample /= mapDimensions;","   gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.x + matSample.x, vTextureCoord.y + matSample.y));","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb, 1.0);","   vec2 cord = vTextureCoord;","}"]},b.DisplacementFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DisplacementFilter.prototype.constructor=b.DisplacementFilter,b.DisplacementFilter.prototype.onTextureLoaded=function(){this.uniforms.mapDimensions.value.x=this.uniforms.displacementMap.value.width,this.uniforms.mapDimensions.value.y=this.uniforms.displacementMap.value.height,this.uniforms.displacementMap.value.baseTexture.off("loaded",this.boundLoadedFunction)},Object.defineProperty(b.DisplacementFilter.prototype,"map",{get:function(){return this.uniforms.displacementMap.value},set:function(a){this.uniforms.displacementMap.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.uniforms.scale.value=a}}),Object.defineProperty(b.DisplacementFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.uniforms.offset.value=a}}),b.PixelateFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:0},dimensions:{type:"4fv",value:new b.Float32Array([1e4,100,10,10])},pixelSize:{type:"2f",value:{x:10,y:10}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 testDim;","uniform vec4 dimensions;","uniform vec2 pixelSize;","uniform sampler2D uSampler;","void main(void) {","   vec2 coord = vTextureCoord;","   vec2 size = dimensions.xy/pixelSize;","   vec2 color = floor( ( vTextureCoord * size ) ) / size + pixelSize/dimensions.xy * 0.5;","   gl_FragColor = texture2D(uSampler, color);","}"]},b.PixelateFilter.prototype=Object.create(b.AbstractFilter.prototype),b.PixelateFilter.prototype.constructor=b.PixelateFilter,Object.defineProperty(b.PixelateFilter.prototype,"size",{get:function(){return this.uniforms.pixelSize.value},set:function(a){this.dirty=!0,this.uniforms.pixelSize.value=a}}),b.BlurXFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 4.0*blur, vTextureCoord.y)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x - blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + blur, vTextureCoord.y)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 2.0*blur, vTextureCoord.y)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 3.0*blur, vTextureCoord.y)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x + 4.0*blur, vTextureCoord.y)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurXFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurXFilter.prototype.constructor=b.BlurXFilter,Object.defineProperty(b.BlurXFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.dirty=!0,this.uniforms.blur.value=1/7e3*a}}),b.BlurYFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","   vec4 sum = vec4(0.0);","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 4.0*blur)) * 0.05;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y - blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y)) * 0.16;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + blur)) * 0.15;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 2.0*blur)) * 0.12;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 3.0*blur)) * 0.09;","   sum += texture2D(uSampler, vec2(vTextureCoord.x, vTextureCoord.y + 4.0*blur)) * 0.05;","   gl_FragColor = sum;","}"]},b.BlurYFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurYFilter.prototype.constructor=b.BlurYFilter,Object.defineProperty(b.BlurYFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.BlurFilter=function(){this.blurXFilter=new b.BlurXFilter,this.blurYFilter=new b.BlurYFilter,this.passes=[this.blurXFilter,this.blurYFilter]},b.BlurFilter.prototype=Object.create(b.AbstractFilter.prototype),b.BlurFilter.prototype.constructor=b.BlurFilter,Object.defineProperty(b.BlurFilter.prototype,"blur",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=this.blurYFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurX",{get:function(){return this.blurXFilter.blur},set:function(a){this.blurXFilter.blur=a}}),Object.defineProperty(b.BlurFilter.prototype,"blurY",{get:function(){return this.blurYFilter.blur},set:function(a){this.blurYFilter.blur=a}}),b.InvertFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={invert:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float invert;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( (vec3(1)-gl_FragColor.rgb) * gl_FragColor.a, gl_FragColor.rgb, 1.0 - invert);","}"]},b.InvertFilter.prototype=Object.create(b.AbstractFilter.prototype),b.InvertFilter.prototype.constructor=b.InvertFilter,Object.defineProperty(b.InvertFilter.prototype,"invert",{get:function(){return this.uniforms.invert.value},set:function(a){this.uniforms.invert.value=a}}),b.SepiaFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={sepia:{type:"1f",value:1}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float sepia;","uniform sampler2D uSampler;","const mat3 sepiaMatrix = mat3(0.3588, 0.7044, 0.1368, 0.2990, 0.5870, 0.1140, 0.2392, 0.4696, 0.0912);","void main(void) {","   gl_FragColor = texture2D(uSampler, vTextureCoord);","   gl_FragColor.rgb = mix( gl_FragColor.rgb, gl_FragColor.rgb * sepiaMatrix, sepia);","}"]},b.SepiaFilter.prototype=Object.create(b.AbstractFilter.prototype),b.SepiaFilter.prototype.constructor=b.SepiaFilter,Object.defineProperty(b.SepiaFilter.prototype,"sepia",{get:function(){return this.uniforms.sepia.value},set:function(a){this.uniforms.sepia.value=a}}),b.TwistFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={radius:{type:"1f",value:.5},angle:{type:"1f",value:5},offset:{type:"2f",value:{x:.5,y:.5}}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float radius;","uniform float angle;","uniform vec2 offset;","void main(void) {","   vec2 coord = vTextureCoord - offset;","   float distance = length(coord);","   if (distance < radius) {","       float ratio = (radius - distance) / radius;","       float angleMod = ratio * ratio * angle;","       float s = sin(angleMod);","       float c = cos(angleMod);","       coord = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);","   }","   gl_FragColor = texture2D(uSampler, coord+offset);","}"]},b.TwistFilter.prototype=Object.create(b.AbstractFilter.prototype),b.TwistFilter.prototype.constructor=b.TwistFilter,Object.defineProperty(b.TwistFilter.prototype,"offset",{get:function(){return this.uniforms.offset.value},set:function(a){this.dirty=!0,this.uniforms.offset.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"radius",{get:function(){return this.uniforms.radius.value},set:function(a){this.dirty=!0,this.uniforms.radius.value=a}}),Object.defineProperty(b.TwistFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.ColorStepFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={step:{type:"1f",value:5}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform sampler2D uSampler;","uniform float step;","void main(void) {","   vec4 color = texture2D(uSampler, vTextureCoord);","   color = floor(color * step) / step;","   gl_FragColor = color;","}"]},b.ColorStepFilter.prototype=Object.create(b.AbstractFilter.prototype),b.ColorStepFilter.prototype.constructor=b.ColorStepFilter,Object.defineProperty(b.ColorStepFilter.prototype,"step",{get:function(){return this.uniforms.step.value},set:function(a){this.uniforms.step.value=a}}),b.DotScreenFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={scale:{type:"1f",value:1},angle:{type:"1f",value:5},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec4 dimensions;","uniform sampler2D uSampler;","uniform float angle;","uniform float scale;","float pattern() {","   float s = sin(angle), c = cos(angle);","   vec2 tex = vTextureCoord * dimensions.xy;","   vec2 point = vec2(","       c * tex.x - s * tex.y,","       s * tex.x + c * tex.y","   ) * scale;","   return (sin(point.x) * sin(point.y)) * 4.0;","}","void main() {","   vec4 color = texture2D(uSampler, vTextureCoord);","   float average = (color.r + color.g + color.b) / 3.0;","   gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);","}"]},b.DotScreenFilter.prototype=Object.create(b.AbstractFilter.prototype),b.DotScreenFilter.prototype.constructor=b.DotScreenFilter,Object.defineProperty(b.DotScreenFilter.prototype,"scale",{get:function(){return this.uniforms.scale.value},set:function(a){this.dirty=!0,this.uniforms.scale.value=a}}),Object.defineProperty(b.DotScreenFilter.prototype,"angle",{get:function(){return this.uniforms.angle.value},set:function(a){this.dirty=!0,this.uniforms.angle.value=a}}),b.CrossHatchFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={blur:{type:"1f",value:1/512}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform float blur;","uniform sampler2D uSampler;","void main(void) {","    float lum = length(texture2D(uSampler, vTextureCoord.xy).rgb);","    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);","    if (lum < 1.00) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.75) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.50) {","        if (mod(gl_FragCoord.x + gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","    if (lum < 0.3) {","        if (mod(gl_FragCoord.x - gl_FragCoord.y - 5.0, 10.0) == 0.0) {","            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);","        }","    }","}"]},b.CrossHatchFilter.prototype=Object.create(b.AbstractFilter.prototype),b.CrossHatchFilter.prototype.constructor=b.CrossHatchFilter,Object.defineProperty(b.CrossHatchFilter.prototype,"blur",{get:function(){return this.uniforms.blur.value/(1/7e3)},set:function(a){this.uniforms.blur.value=1/7e3*a}}),b.RGBSplitFilter=function(){b.AbstractFilter.call(this),this.passes=[this],this.uniforms={red:{type:"2f",value:{x:20,y:20}},green:{type:"2f",value:{x:-20,y:20}},blue:{type:"2f",value:{x:20,y:-20}},dimensions:{type:"4fv",value:[0,0,0,0]}},this.fragmentSrc=["precision mediump float;","varying vec2 vTextureCoord;","varying vec4 vColor;","uniform vec2 red;","uniform vec2 green;","uniform vec2 blue;","uniform vec4 dimensions;","uniform sampler2D uSampler;","void main(void) {","   gl_FragColor.r = texture2D(uSampler, vTextureCoord + red/dimensions.xy).r;","   gl_FragColor.g = texture2D(uSampler, vTextureCoord + green/dimensions.xy).g;","   gl_FragColor.b = texture2D(uSampler, vTextureCoord + blue/dimensions.xy).b;","   gl_FragColor.a = texture2D(uSampler, vTextureCoord).a;","}"]},b.RGBSplitFilter.prototype=Object.create(b.AbstractFilter.prototype),b.RGBSplitFilter.prototype.constructor=b.RGBSplitFilter,Object.defineProperty(b.RGBSplitFilter.prototype,"red",{get:function(){return this.uniforms.red.value},set:function(a){this.uniforms.red.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"green",{get:function(){return this.uniforms.green.value},set:function(a){this.uniforms.green.value=a}}),Object.defineProperty(b.RGBSplitFilter.prototype,"blue",{get:function(){return this.uniforms.blue.value},set:function(a){this.uniforms.blue.value=a}}),"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=b),exports.PIXI=b):"undefined"!=typeof define&&define.amd?define(b):a.PIXI=b}).call(this);
},{}],"/Users/Cjaure/game/node_modules/raf/index.js":[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]
  , isNative = true

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  isNative = false

  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  if(!isNative) {
    return raf.call(global, fn)
  }
  return raf.call(global, function() {
    try{
      fn.apply(this, arguments)
    } catch(e) {
      setTimeout(function() { throw e }, 0)
    }
  })
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":"/Users/Cjaure/game/node_modules/raf/node_modules/performance-now/lib/performance-now.js"}],"/Users/Cjaure/game/node_modules/raf/node_modules/performance-now/lib/performance-now.js":[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.6.3
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

/*
//@ sourceMappingURL=performance-now.map
*/

}).call(this,require('_process'))

},{"_process":"/Users/Cjaure/game/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js"}],"/Users/Cjaure/game/node_modules/random-ext/index.js":[function(require,module,exports){
/*!
 * random-ext
 * https://github.com/bkumar2/random-ext.git
 *
 * Copyright 2014 Bipul Kumar
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *   http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function _array(length, elementFunction, args) {
	var array = [];
	if (length != null) {
		for (var i = 0; i < length; ++i) {
			array[i] = elementFunction.apply(this, args);
		}
	} else {
		throw "length is required.";
	}
	return array;
}

function boolean() {
	return Math.random() < 0.5;
}

function booleanArray(length) {
	return _array(length, boolean);
}

function float(limit, min) {
	if (limit != null) {
		if (min != null) {
			return (Math.random() * (limit - min)) + min;
		} else {
			return Math.random() * limit;
		}
	} else {
		throw "max is required.";
	}
}

function floatArray(length, limit, min) {
	return _array(length, float, [ limit, min ]);
}

function integer(max, min) {
	if (max != null) {
		if (min != null) {
			if (max < min) {
				throw "max [" + max + "] is less than min [" + min
				"]";
			}
			return Math.floor(Math.random() * (max - min + 1)) + min;
		} else {
			return Math.floor(Math.random() * (max + 1));
		}
	} else {
		throw "max is required.";
	}
}

function integerArray(length, max, min) {
	return _array(length, integer, [ max, min ]);
}

function _normalizeRanges(ranges) {
	if (randomExt.DEBUG) {
		console.log("Normalizing ranges:", ranges);
	}
	ranges.sort(function(a, b) {
		return a[0] - b[0];
	});
	if (randomExt.DEBUG) {
		console.log("sorted ranges:", ranges);
	}
	for (var i = 0; i < ranges.length - 1; ++i) {
		for (var j = i + 1; j < ranges.length; ++j) {
			// remove right contained
			if (ranges[i][1] >= ranges[j][1]) {
				ranges.splice(j, 1);
				j--;
			} else
			// fix overlap
			if (ranges[i][1] >= ranges[j][0]) {
				ranges[j][0] = ranges[i][1] + 1;
			}
			if (randomExt.DEBUG) {
				console.log("iteration (" + i + "," + j + "):", ranges);
			}
		}
	}
	if (randomExt.DEBUG) {
		console.log("Normalized ranges:", ranges);
	}
}

function _integerFromRanges(ranges) {
	_normalizeRanges(ranges);
	if (ranges != null) {
		var span = 0;
		for (var i = 0; i < ranges.length; ++i) {
			span += (ranges[i][1] - ranges[i][0] + 1);
		}
		var randomNumber = Math.floor(Math.random() * span);
		for (var i = 0; i < ranges.length; ++i) {
			randomNumber += ranges[i][0];
			if (randomNumber <= ranges[i][1]) {
				break;
			} else {
				randomNumber -= (ranges[i][1] + 1);
			}
		}
		return randomNumber;
	} else {
		throw "ranges is required.";
	}
}

function _integerArrayFromRanges(length, ranges) {
	var numberArray = [];
	if (length != null && ranges != null) {
		for (var i = 0; i < length; ++i) {
			numberArray[i] = _integerFromRanges(ranges);
		}
	} else {
		throw "length and ranges is required.";
	}
	return numberArray;
}

function _stringFromRanges(maxLength, minLength, ranges) {
	var dString = "";
	var length = integer(maxLength, minLength);
	var unicodeNumbers = _integerArrayFromRanges(length, ranges);
	dString = String.fromCharCode.apply(this, unicodeNumbers);
	return dString;
}

function date(endDate, startDate) {
	if (endDate == null) {
		throw "end date is required.";
	}
	var endDateTime = endDate.getTime();
	var startDateTime = startDate != null ? startDate.getTime() : 0;
	return new Date(integer(endDateTime, startDateTime));
}

function dateArray(length, endDate, startDate) {
	return _array(length, date, [ endDate, startDate ]);
}

function string(maxLength, minLength) {
	if (randomExt.DEBUG) {
		console.log("string maxLength:", maxLength, " minLength:",
				minLength);
	}
	return _stringFromRanges(maxLength, minLength, [ [ 32, 126 ] ]);
}

function stringArray(arrayLength, stringMaxLength, stringMinLength) {
	return _array(arrayLength, string, [ stringMaxLength,
			stringMinLength ]);
}

function restrictedString(content, maxLength, minLength) {
	var ranges = [];
	for (var i = 0; i < content.length; ++i) {
		var contentType = content[i];
		switch (contentType) {
		case randomExt.CHAR_TYPE.SPECIAL:
			ranges = ranges.concat([ [ 33, 47 ], [ 58, 64 ], [ 91, 96 ],
					[ 123, 126 ] ]);
			break;
		case randomExt.CHAR_TYPE.SPACE:
			ranges = ranges.concat([ [ 32, 32 ] ]);
			break;
		case randomExt.CHAR_TYPE.NUMERIC:
			ranges = ranges.concat([ [ 48, 57 ] ]);
			break;
		case randomExt.CHAR_TYPE.UPPERCASE:
			ranges = ranges.concat([ [ 65, 90 ] ]);
			break;
		case randomExt.CHAR_TYPE.LOWERCASE:
			ranges = ranges.concat([ [ 97, 122 ] ]);
			break;
		case randomExt.CHAR_TYPE.HEX:
			ranges = ranges.concat([ [ 48, 57 ], [ 97, 104 ] ]);
			break;
		default:
			if (typeof contentType === "string") {
				for (var j = 0; j < contentType.length; ++j) {
					ranges = ranges.concat([ [ contentType.charCodeAt(j),
							contentType.charCodeAt(j) ] ]);
				}
			}
		}
	}
	return _stringFromRanges(maxLength, minLength, ranges);
}

function restrictedStringArray(arrayLength, content, stringMaxLength,
		stringMinLength) {
	return _array(arrayLength, restrictedString, [ content,
			stringMaxLength, stringMinLength ]);
}

function _fromDescriptor(randomDescriptor) {
	var randomValue = null;
	if (randomDescriptor == null || !randomDescriptor.shift
			|| randomDescriptor.length <= 0
			|| typeof randomDescriptor[0] !== "function") {
		randomValue = randomDescriptor;
	} else {
		var randomFunction = randomDescriptor[0];
		if (randomDescriptor.length > 1) {
			var propertyValueArgs = randomDescriptor.slice(1,
					randomDescriptor.length);
			randomValue = randomFunction.apply(this, propertyValueArgs);
		} else {
			randomValue = randomFunction();
		}
	}
	return randomValue;
}

function object(template) {
	if (randomExt.DEBUG) {
		console.log("object template:", template);
	}
	var newObject = {};
	var properties = Object.getOwnPropertyNames(template);
	for (var i = 0; i < properties.length; ++i) {
		var property = properties[i];
		var randomDescriptor = template[property];
		newObject[property] = _fromDescriptor(randomDescriptor);
	}
	return newObject;
}

function objectArray(length, template) {
	return _array(length, object, [ template ]);
}

function stringPattern(pattern, variableDefinition) {
	var stringPattern = pattern;
	var properties = Object.getOwnPropertyNames(variableDefinition);
	var replacedStringArray = new Array();
	for (var i = 0; i < stringPattern.length; ++i) {
		if (variableDefinition.hasOwnProperty(stringPattern[i])) {
			replacedStringArray[i] = _fromDescriptor(variableDefinition[stringPattern[i]]);
		} else {
			replacedStringArray[i] = stringPattern[i];
		}
	}
	return replacedStringArray.join("");
}

function stringPatternArray(length, pattern, variableDefinition) {
	return _array(length, stringPattern, [ pattern,
			variableDefinition ]);
}

function pick(array) {
	if (array == null) {
		throw "input array is null or undefined.";
	}
	return array[integer(array.length - 1)];
}

function shuffle(array) {
	if (array == null) {
		throw "input array is null or undefined.";
	}
	for (var i = 0; i < array.length; ++i) {
		var randomIndex = integer(array.length - 1);
		var temp = array[randomIndex];
		array[randomIndex] = array[i];
		array[i] = temp;
	}
}

function color() {
	return '#'.concat((Math.random()*0xFFFFFF<<0).toString(16));
}

var randomExt = {
	boolean : boolean,
	booleanArray : booleanArray,
	integer : integer,
	integerArray : integerArray,
	float : float,
	floatArray : floatArray,
	date : date,
	dateArray : dateArray,
	string : string,
	stringArray : stringArray,
	restrictedString : restrictedString,
	restrictedStringArray : restrictedStringArray,
	object : object,
	objectArray : objectArray,
	stringPattern : stringPattern,
	stringPatternArray : stringPatternArray,
	pick : pick,
	shuffle : shuffle,
	color: color,
	CHAR_TYPE : {
		LOWERCASE : 0,
		UPPERCASE : 1,
		NUMERIC : 2,
		SPECIAL : 3,
		SPACE : 4,
		HEX : 5
	},
	DEBUG : false
};

module.exports = randomExt;

},{}],"/Users/Cjaure/game/node_modules/stats-js/build/stats.min.js":[function(require,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
var Stats=function(){var l=Date.now(),m=l,g=0,n=Infinity,o=0,h=0,p=Infinity,q=0,r=0,s=0,f=document.createElement("div");f.id="stats";f.addEventListener("mousedown",function(b){b.preventDefault();t(++s%2)},!1);f.style.cssText="width:80px;opacity:0.9;cursor:pointer";var a=document.createElement("div");a.id="fps";a.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#002";f.appendChild(a);var i=document.createElement("div");i.id="fpsText";i.style.cssText="color:#0ff;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";
i.innerHTML="FPS";a.appendChild(i);var c=document.createElement("div");c.id="fpsGraph";c.style.cssText="position:relative;width:74px;height:30px;background-color:#0ff";for(a.appendChild(c);74>c.children.length;){var j=document.createElement("span");j.style.cssText="width:1px;height:30px;float:left;background-color:#113";c.appendChild(j)}var d=document.createElement("div");d.id="ms";d.style.cssText="padding:0 0 3px 3px;text-align:left;background-color:#020;display:none";f.appendChild(d);var k=document.createElement("div");
k.id="msText";k.style.cssText="color:#0f0;font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:bold;line-height:15px";k.innerHTML="MS";d.appendChild(k);var e=document.createElement("div");e.id="msGraph";e.style.cssText="position:relative;width:74px;height:30px;background-color:#0f0";for(d.appendChild(e);74>e.children.length;)j=document.createElement("span"),j.style.cssText="width:1px;height:30px;float:left;background-color:#131",e.appendChild(j);var t=function(b){s=b;switch(s){case 0:a.style.display=
"block";d.style.display="none";break;case 1:a.style.display="none",d.style.display="block"}};return{REVISION:12,domElement:f,setMode:t,begin:function(){l=Date.now()},end:function(){var b=Date.now();g=b-l;n=Math.min(n,g);o=Math.max(o,g);k.textContent=g+" MS ("+n+"-"+o+")";var a=Math.min(30,30-30*(g/200));e.appendChild(e.firstChild).style.height=a+"px";r++;b>m+1E3&&(h=Math.round(1E3*r/(b-m)),p=Math.min(p,h),q=Math.max(q,h),i.textContent=h+" FPS ("+p+"-"+q+")",a=Math.min(30,30-30*(h/100)),c.appendChild(c.firstChild).style.height=
a+"px",m=b,r=0);return b},update:function(){l=this.end()}}};"object"===typeof module&&(module.exports=Stats);

},{}],"/Users/Cjaure/game/node_modules/tween.js/index.js":[function(require,module,exports){
/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/sole/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/sole/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

// Date.now shim for (ahem) Internet Explo(d|r)er
if ( Date.now === undefined ) {

	Date.now = function () {

		return new Date().valueOf();

	};

}

var TWEEN = TWEEN || ( function () {

	var _tweens = [];

	return {

		REVISION: '14',

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function ( tween ) {

			_tweens.push( tween );

		},

		remove: function ( tween ) {

			var i = _tweens.indexOf( tween );

			if ( i !== -1 ) {

				_tweens.splice( i, 1 );

			}

		},

		update: function ( time ) {

			if ( _tweens.length === 0 ) return false;

			var i = 0;

			time = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );

			while ( i < _tweens.length ) {

				if ( _tweens[ i ].update( time ) ) {

					i++;

				} else {

					_tweens.splice( i, 1 );

				}

			}

			return true;

		}
	};

} )();

TWEEN.Tween = function ( object ) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for ( var field in object ) {

		_valuesStart[ field ] = parseFloat(object[field], 10);

	}

	this.to = function ( properties, duration ) {

		if ( duration !== undefined ) {

			_duration = duration;

		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function ( time ) {

		TWEEN.add( this );

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : ( typeof window !== 'undefined' && window.performance !== undefined && window.performance.now !== undefined ? window.performance.now() : Date.now() );
		_startTime += _delayTime;

		for ( var property in _valuesEnd ) {

			// check if an Array was provided as property value
			if ( _valuesEnd[ property ] instanceof Array ) {

				if ( _valuesEnd[ property ].length === 0 ) {

					continue;

				}

				// create a local copy of the Array with the start value at the front
				_valuesEnd[ property ] = [ _object[ property ] ].concat( _valuesEnd[ property ] );

			}

			_valuesStart[ property ] = _object[ property ];

			if( ( _valuesStart[ property ] instanceof Array ) === false ) {
				_valuesStart[ property ] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[ property ] = _valuesStart[ property ] || 0;

		}

		return this;

	};

	this.stop = function () {

		if ( !_isPlaying ) {
			return this;
		}

		TWEEN.remove( this );
		_isPlaying = false;

		if ( _onStopCallback !== null ) {

			_onStopCallback.call( _object );

		}

		this.stopChainedTweens();
		return this;

	};

	this.stopChainedTweens = function () {

		for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

			_chainedTweens[ i ].stop();

		}

	};

	this.delay = function ( amount ) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function ( times ) {

		_repeat = times;
		return this;

	};

	this.yoyo = function( yoyo ) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function ( easing ) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function ( interpolation ) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function ( callback ) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function ( callback ) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function ( callback ) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function ( callback ) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function ( time ) {

		var property;

		if ( time < _startTime ) {

			return true;

		}

		if ( _onStartCallbackFired === false ) {

			if ( _onStartCallback !== null ) {

				_onStartCallback.call( _object );

			}

			_onStartCallbackFired = true;

		}

		var elapsed = ( time - _startTime ) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		var value = _easingFunction( elapsed );

		for ( property in _valuesEnd ) {

			var start = _valuesStart[ property ] || 0;
			var end = _valuesEnd[ property ];

			if ( end instanceof Array ) {

				_object[ property ] = _interpolationFunction( end, value );

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if ( typeof(end) === "string" ) {
					end = start + parseFloat(end, 10);
				}

				// protect against non numeric properties.
				if ( typeof(end) === "number" ) {
					_object[ property ] = start + ( end - start ) * value;
				}

			}

		}

		if ( _onUpdateCallback !== null ) {

			_onUpdateCallback.call( _object, value );

		}

		if ( elapsed == 1 ) {

			if ( _repeat > 0 ) {

				if( isFinite( _repeat ) ) {
					_repeat--;
				}

				// reassign starting values, restart by making startTime = now
				for( property in _valuesStartRepeat ) {

					if ( typeof( _valuesEnd[ property ] ) === "string" ) {
						_valuesStartRepeat[ property ] = _valuesStartRepeat[ property ] + parseFloat(_valuesEnd[ property ], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[ property ];
						_valuesStartRepeat[ property ] = _valuesEnd[ property ];
						_valuesEnd[ property ] = tmp;
					}

					_valuesStart[ property ] = _valuesStartRepeat[ property ];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				_startTime = time + _delayTime;

				return true;

			} else {

				if ( _onCompleteCallback !== null ) {

					_onCompleteCallback.call( _object );

				}

				for ( var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++ ) {

					_chainedTweens[ i ].start( time );

				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function ( k ) {

			return k;

		}

	},

	Quadratic: {

		In: function ( k ) {

			return k * k;

		},

		Out: function ( k ) {

			return k * ( 2 - k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k;
			return - 0.5 * ( --k * ( k - 2 ) - 1 );

		}

	},

	Cubic: {

		In: function ( k ) {

			return k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k + 2 );

		}

	},

	Quartic: {

		In: function ( k ) {

			return k * k * k * k;

		},

		Out: function ( k ) {

			return 1 - ( --k * k * k * k );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return 0.5 * k * k * k * k;
			return - 0.5 * ( ( k -= 2 ) * k * k * k - 2 );

		}

	},

	Quintic: {

		In: function ( k ) {

			return k * k * k * k * k;

		},

		Out: function ( k ) {

			return --k * k * k * k * k + 1;

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1 ) return 0.5 * k * k * k * k * k;
			return 0.5 * ( ( k -= 2 ) * k * k * k * k + 2 );

		}

	},

	Sinusoidal: {

		In: function ( k ) {

			return 1 - Math.cos( k * Math.PI / 2 );

		},

		Out: function ( k ) {

			return Math.sin( k * Math.PI / 2 );

		},

		InOut: function ( k ) {

			return 0.5 * ( 1 - Math.cos( Math.PI * k ) );

		}

	},

	Exponential: {

		In: function ( k ) {

			return k === 0 ? 0 : Math.pow( 1024, k - 1 );

		},

		Out: function ( k ) {

			return k === 1 ? 1 : 1 - Math.pow( 2, - 10 * k );

		},

		InOut: function ( k ) {

			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( ( k *= 2 ) < 1 ) return 0.5 * Math.pow( 1024, k - 1 );
			return 0.5 * ( - Math.pow( 2, - 10 * ( k - 1 ) ) + 2 );

		}

	},

	Circular: {

		In: function ( k ) {

			return 1 - Math.sqrt( 1 - k * k );

		},

		Out: function ( k ) {

			return Math.sqrt( 1 - ( --k * k ) );

		},

		InOut: function ( k ) {

			if ( ( k *= 2 ) < 1) return - 0.5 * ( Math.sqrt( 1 - k * k) - 1);
			return 0.5 * ( Math.sqrt( 1 - ( k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return - ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );

		},

		Out: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			return ( a * Math.pow( 2, - 10 * k) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) + 1 );

		},

		InOut: function ( k ) {

			var s, a = 0.1, p = 0.4;
			if ( k === 0 ) return 0;
			if ( k === 1 ) return 1;
			if ( !a || a < 1 ) { a = 1; s = p / 4; }
			else s = p * Math.asin( 1 / a ) / ( 2 * Math.PI );
			if ( ( k *= 2 ) < 1 ) return - 0.5 * ( a * Math.pow( 2, 10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) );
			return a * Math.pow( 2, -10 * ( k -= 1 ) ) * Math.sin( ( k - s ) * ( 2 * Math.PI ) / p ) * 0.5 + 1;

		}

	},

	Back: {

		In: function ( k ) {

			var s = 1.70158;
			return k * k * ( ( s + 1 ) * k - s );

		},

		Out: function ( k ) {

			var s = 1.70158;
			return --k * k * ( ( s + 1 ) * k + s ) + 1;

		},

		InOut: function ( k ) {

			var s = 1.70158 * 1.525;
			if ( ( k *= 2 ) < 1 ) return 0.5 * ( k * k * ( ( s + 1 ) * k - s ) );
			return 0.5 * ( ( k -= 2 ) * k * ( ( s + 1 ) * k + s ) + 2 );

		}

	},

	Bounce: {

		In: function ( k ) {

			return 1 - TWEEN.Easing.Bounce.Out( 1 - k );

		},

		Out: function ( k ) {

			if ( k < ( 1 / 2.75 ) ) {

				return 7.5625 * k * k;

			} else if ( k < ( 2 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;

			} else if ( k < ( 2.5 / 2.75 ) ) {

				return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;

			} else {

				return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;

			}

		},

		InOut: function ( k ) {

			if ( k < 0.5 ) return TWEEN.Easing.Bounce.In( k * 2 ) * 0.5;
			return TWEEN.Easing.Bounce.Out( k * 2 - 1 ) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.Linear;

		if ( k < 0 ) return fn( v[ 0 ], v[ 1 ], f );
		if ( k > 1 ) return fn( v[ m ], v[ m - 1 ], m - f );

		return fn( v[ i ], v[ i + 1 > m ? m : i + 1 ], f - i );

	},

	Bezier: function ( v, k ) {

		var b = 0, n = v.length - 1, pw = Math.pow, bn = TWEEN.Interpolation.Utils.Bernstein, i;

		for ( i = 0; i <= n; i++ ) {
			b += pw( 1 - k, n - i ) * pw( k, i ) * v[ i ] * bn( n, i );
		}

		return b;

	},

	CatmullRom: function ( v, k ) {

		var m = v.length - 1, f = m * k, i = Math.floor( f ), fn = TWEEN.Interpolation.Utils.CatmullRom;

		if ( v[ 0 ] === v[ m ] ) {

			if ( k < 0 ) i = Math.floor( f = m * ( 1 + k ) );

			return fn( v[ ( i - 1 + m ) % m ], v[ i ], v[ ( i + 1 ) % m ], v[ ( i + 2 ) % m ], f - i );

		} else {

			if ( k < 0 ) return v[ 0 ] - ( fn( v[ 0 ], v[ 0 ], v[ 1 ], v[ 1 ], -f ) - v[ 0 ] );
			if ( k > 1 ) return v[ m ] - ( fn( v[ m ], v[ m ], v[ m - 1 ], v[ m - 1 ], f - m ) - v[ m ] );

			return fn( v[ i ? i - 1 : 0 ], v[ i ], v[ m < i + 1 ? m : i + 1 ], v[ m < i + 2 ? m : i + 2 ], f - i );

		}

	},

	Utils: {

		Linear: function ( p0, p1, t ) {

			return ( p1 - p0 ) * t + p0;

		},

		Bernstein: function ( n , i ) {

			var fc = TWEEN.Interpolation.Utils.Factorial;
			return fc( n ) / fc( i ) / fc( n - i );

		},

		Factorial: ( function () {

			var a = [ 1 ];

			return function ( n ) {

				var s = 1, i;
				if ( a[ n ] ) return a[ n ];
				for ( i = n; i > 1; i-- ) s *= i;
				return a[ n ] = s;

			};

		} )(),

		CatmullRom: function ( p0, p1, p2, p3, t ) {

			var v0 = ( p2 - p0 ) * 0.5, v1 = ( p3 - p1 ) * 0.5, t2 = t * t, t3 = t * t2;
			return ( 2 * p1 - 2 * p2 + v0 + v1 ) * t3 + ( - 3 * p1 + 3 * p2 - 2 * v0 - v1 ) * t2 + v0 * t + p1;

		}

	}

};

module.exports=TWEEN;
},{}],"/Users/Cjaure/game/node_modules/watchify/node_modules/browserify/node_modules/events/events.js":[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],"/Users/Cjaure/game/node_modules/watchify/node_modules/browserify/node_modules/process/browser.js":[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],"/Users/Cjaure/game/scenes/background.js":[function(require,module,exports){
"use strict";

var PIXI = require("pixi.js");
var TWEEN = require("tween.js");
var Scene = require("../engine/scene");

function backgroundScene(game) {
  var scene = new Scene(game);
  var scrollSpeed = 0.5;
  var bgPath = "assets/4954464378_990a3e54a1_b.jpg";
  var tile;

  scene.active = false;
  scene.stage.visible = false;
  game.on("preload", function (assets) {
    assets.push(bgPath);
  });
  game.on("load", function () {
    var sprite = PIXI.Sprite.fromImage(bgPath);
    sprite.scale = { x: 0.65, y: 0.65 };
    scene.stage.addChild(sprite);
    var texture = new PIXI.Graphics();
    texture.beginFill(4456450);
    texture.drawCircle(0, 0, game.renderer.width);
    texture.endFill();
    tile = new PIXI.TilingSprite(texture.generateTexture(), game.renderer.width, game.renderer.height);
    tile.position.y = tile.height / 2;
    scene.stage.addChild(tile);
    tile.tween = new TWEEN.Tween(tile.position);
  });
  scene.on("active", function () {
    scene.stage.visible = true;
  });
  scene.on("update", function () {
    tile.tilePosition.x -= scrollSpeed;
    if (game.keyboard.up) {
      tile.position.y += 0.2;
      this.tweenTo = "+4";
    }
    if (game.keyboard.down && tile.position.y > tile.height / 2) {
      tile.position.y -= 0.2;
      this.tweenTo = "-4";
    } else if (this.tweenTo) {
      tile.tween.to({ y: this.tweenTo }, 600).easing(TWEEN.Easing.Quadratic.Out).start();
      this.tweenTo = null;
      this.shouldTween = true;
    }
  });
  scene.on("render", function (time) {
    if (this.shouldTween) {
      this.shouldTween = tile.tween.update(time);
    }
  });
  return scene;
}

module.exports = backgroundScene;

},{"../engine/scene":"/Users/Cjaure/game/engine/scene.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js","tween.js":"/Users/Cjaure/game/node_modules/tween.js/index.js"}],"/Users/Cjaure/game/scenes/play.js":[function(require,module,exports){
"use strict";

var PIXI = require("pixi.js");
var Howl = require("howler").Howl;
var TWEEN = require("tween.js");
var curry = require("curry");
var random = require("random-ext");
var Scene = require("../engine/scene");
var Player = require("../entities/player");
var Rock = require("../entities/rock");
var Dust = require("../entities/dust");
var utils = require("../engine/utils");

function playScene(game) {
  var scene = new Scene(game);
  var bgMusic = new Howl({ urls: ["assets/gurdonark_-_Relief.mp3"], volume: 0.5 });
  var stageTween;
  var rocks = [];
  var dust = [];
  var player;
  var flash = new PIXI.Graphics();

  var playerRockCollide = function (time, player, rock) {
    rock.removeFromScene();
    player.hit();
    if (scene.stage.alpha < 0.94) {
      stageTween.to({ alpha: "+0.06" }, 200).start();
    }
    flash.visible = true;
    flash.lastVisible = time;
  };

  var playerDustCollide = function (time, player, dust) {
    dust.removeFromScene();
    stageTween.to({ alpha: "-0.03" }, 200).start();
    player.shineGet();
  };

  flash.beginFill(16777215);
  flash.drawRect(0, 0, game.renderer.width, game.renderer.height);
  flash.endFill();
  flash.visible = false;
  scene.stage.addChild(flash);
  Player.preload(game);
  game.on("load", function () {
    scene.active = false;
    scene.stage.visible = false;
    player = new Player(game, {
      x: game.renderer.width / 6,
      y: game.renderer.height / 2
    });
    player.addToScene(scene);
  });
  scene.on("active", function () {
    scene.stage.visible = true;
    scene.stage.alpha = 1;
    player.reset();
    rocks.forEach(function (rock) {
      return rock.removeFromScene();
    });
    rocks = [];
    dust.forEach(function (d) {
      return d.removeFromScene();
    });
    dust = [];
    bgMusic.stop().play();
    stageTween = new TWEEN.Tween(scene.stage);
  });
  scene.on("update", function (time) {
    if (Math.round(time) % 104 === 0) {
      var rock = new Rock(game);
      rock.addToScene(scene);
      rocks.push(rock);
    }
    if (Math.round(time) % 52 === 0) {
      var d = new Dust(game);
      d.addToScene(scene);
      dust.push(d);
    }
    rocks = rocks.filter(function (rock) {
      return !rock.removed;
    });
    dust = dust.filter(function (dust) {
      return !dust.removed;
    });
    utils.collide(player, dust, curry(playerDustCollide)(time));
    utils.collide(player, rocks, curry(playerRockCollide)(time));
    if (scene.stage.alpha < 0) {
      scene.emit("win");
    }
    if (time - flash.lastVisible > 30) {
      flash.visible = false;
    }
    if (time - flash.lastVisible > 120) {
      scene.stage.position = { x: 0, y: 0 };
    } else if (flash.lastVisible) {
      scene.stage.position = {
        x: random.integer(5, -5),
        y: random.integer(5, -5)
      };
    }
  });
  scene.on("render", function (time) {
    if (stageTween) {
      stageTween.update(time);
    }
  });

  return scene;
}

module.exports = playScene;

},{"../engine/scene":"/Users/Cjaure/game/engine/scene.js","../engine/utils":"/Users/Cjaure/game/engine/utils/index.js","../entities/dust":"/Users/Cjaure/game/entities/dust.js","../entities/player":"/Users/Cjaure/game/entities/player.js","../entities/rock":"/Users/Cjaure/game/entities/rock.js","curry":"/Users/Cjaure/game/node_modules/curry/curry.js","howler":"/Users/Cjaure/game/node_modules/howler/howler.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js","random-ext":"/Users/Cjaure/game/node_modules/random-ext/index.js","tween.js":"/Users/Cjaure/game/node_modules/tween.js/index.js"}],"/Users/Cjaure/game/scenes/start.js":[function(require,module,exports){
"use strict";

var PIXI = require("pixi.js");
var kb = require("kb-controls");
var Scene = require("../engine/scene");

function startScene(game) {
  var scene = new Scene(game);
  var text = new PIXI.Text("Press space to start", {
    fill: "white"
  });
  scene.stage.addChild(text);
  scene.on("update", function update() {
    if (scene.active && game.keyboard.space) {
      scene.active = false;
    }
  }).on("inactive", function () {
    scene.stage.visible = false;
  });
  scene.active = true;
  return scene;
}

module.exports = startScene;

},{"../engine/scene":"/Users/Cjaure/game/engine/scene.js","kb-controls":"/Users/Cjaure/game/node_modules/kb-controls/index.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js"}],"/Users/Cjaure/game/scenes/win.js":[function(require,module,exports){
"use strict";

var PIXI = require("pixi.js");
var Scene = require("../engine/scene");

function winScene(game) {
  var scene = new Scene(game);
  var text = new PIXI.Text("You Win!!!!!", {
    fill: "white"
  });
  scene.stage.addChild(text);
  scene.on("update", function update() {
    if (scene.active && game.keyboard.space) {
      scene.active = false;
    }
  }).on("active", function () {
    scene.stage.visible = true;
  }).on("inactive", function () {
    scene.stage.visible = false;
  });
  scene.active = false;
  scene.stage.visible = false;
  return scene;
}

module.exports = winScene;

},{"../engine/scene":"/Users/Cjaure/game/engine/scene.js","pixi.js":"/Users/Cjaure/game/node_modules/pixi.js/bin/pixi.js"}]},{},["/Users/Cjaure/game/index.js"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy93YXRjaGlmeS9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL1VzZXJzL0NqYXVyZS9nYW1lL2VuZ2luZS9lbnRpdHkuanMiLCIvVXNlcnMvQ2phdXJlL2dhbWUvZW5naW5lL2dhbWUuanMiLCIvVXNlcnMvQ2phdXJlL2dhbWUvZW5naW5lL3NjZW5lLmpzIiwiL1VzZXJzL0NqYXVyZS9nYW1lL2VuZ2luZS91dGlscy9pbmRleC5qcyIsIi9Vc2Vycy9DamF1cmUvZ2FtZS9lbnRpdGllcy9kdXN0LmpzIiwiL1VzZXJzL0NqYXVyZS9nYW1lL2VudGl0aWVzL3BsYXllci5qcyIsIi9Vc2Vycy9DamF1cmUvZ2FtZS9lbnRpdGllcy9yb2NrLmpzIiwiL1VzZXJzL0NqYXVyZS9nYW1lL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2JveC1jb2xsaWRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2N1cnJ5L2N1cnJ5LmpzIiwibm9kZV9tb2R1bGVzL2V2ZW50ZW1pdHRlcjMvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaG93bGVyL2hvd2xlci5qcyIsIm5vZGVfbW9kdWxlcy9rYi1jb250cm9scy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rYi1jb250cm9scy9ub2RlX21vZHVsZXMvZXZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9rYi1jb250cm9scy9ub2RlX21vZHVsZXMvZXZlci9pbml0Lmpzb24iLCJub2RlX21vZHVsZXMva2ItY29udHJvbHMvbm9kZV9tb2R1bGVzL2V2ZXIvdHlwZXMuanNvbiIsIm5vZGVfbW9kdWxlcy9rYi1jb250cm9scy9ub2RlX21vZHVsZXMvdmtleS9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9waXhpLmpzL2Jpbi9waXhpLmpzIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwibm9kZV9tb2R1bGVzL3JhbmRvbS1leHQvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc3RhdHMtanMvYnVpbGQvc3RhdHMubWluLmpzIiwibm9kZV9tb2R1bGVzL3R3ZWVuLmpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanMiLCIvVXNlcnMvQ2phdXJlL2dhbWUvc2NlbmVzL2JhY2tncm91bmQuanMiLCIvVXNlcnMvQ2phdXJlL2dhbWUvc2NlbmVzL3BsYXkuanMiLCIvVXNlcnMvQ2phdXJlL2dhbWUvc2NlbmVzL3N0YXJ0LmpzIiwiL1VzZXJzL0NqYXVyZS9nYW1lL3NjZW5lcy93aW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0FBLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixJQUFJLFlBQVksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDNUMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDOztJQUV6QixNQUFNO3NCQUFTLFlBQVk7TUFBM0IsTUFBTSxHQUNJLFNBRFYsTUFBTSxDQUNLLElBQUksRUFBRSxPQUFPLEVBQUU7QUFDeEIsUUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsUUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7R0FDMUI7O1lBSkMsTUFBTTs7QUFBTixRQUFNLFdBS1IsVUFBVSxHQUFDLFVBQUMsS0FBSyxFQUFFO0FBQ2YsU0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNiLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsV0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ3hDO0FBQ0QsUUFBSSxJQUFJLENBQUMsTUFBTSxFQUFFO0FBQ2IsV0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztLQUM5QztBQUNELFFBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0dBQ3RCOztBQWZDLFFBQU0sV0FnQlIsZUFBZSxHQUFDLFlBQUc7QUFDZixRQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNiLGFBQU87S0FDVjtBQUNELFFBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUMsUUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1gsVUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQztBQUNELFFBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtBQUNiLFVBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7S0FDekQ7QUFDRCxRQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7QUFDYixVQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3BEO0FBQ0QsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbEIsUUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7R0FDdkI7O0FBaENDLFFBQU0sV0FpQ1IsY0FBYyxHQUFDLFlBQUc7QUFDZCxRQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssUUFBUSxFQUFFO0FBQ2hDLGFBQU87QUFDSCxTQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hCLFNBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEIsY0FBTSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLENBQUM7T0FDaEMsQ0FBQztLQUNMO0FBQ0QsV0FBTztBQUNILE9BQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDaEIsT0FBQyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoQixXQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQ3hCLFlBQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07S0FDN0IsQ0FBQztHQUNMOztBQS9DQyxRQUFNLFdBZ0RSLE1BQU0sR0FBQyxZQUFHO0FBQ04sUUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQy9CLFdBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDakQ7R0FDSjs7U0FwREMsTUFBTTs7O0FBdURaLE1BQU0sQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDM0R4QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ2hDLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM1QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQy9CLElBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs7SUFFbkIsSUFBSTtzQkFBUyxZQUFZO01BQXpCLElBQUksR0FDTSxTQURWLElBQUksT0FDc0M7MEJBQTdCLEtBQUs7UUFBTCxLQUFLLDhCQUFHLEdBQUc7MkJBQUUsTUFBTTtRQUFOLE1BQU0sK0JBQUcsR0FBRztBQUNwQyxRQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNqQixRQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNuQixRQUFJLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUNyQixRQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQzs7QUFFbEQsUUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBUSxDQUFDLENBQUM7QUFDdEMsUUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDakUsWUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFDZixjQUFRLEVBQUUsTUFBTTtBQUNoQixTQUFLLE1BQU07QUFDWCxlQUFTLEVBQUUsT0FBTztBQUNsQixTQUFLLE9BQU87QUFDWixZQUFNLEVBQUUsSUFBSTtBQUNaLFNBQUssSUFBSTtBQUNULGNBQVEsRUFBRSxNQUFNO0FBQ2hCLFNBQUssTUFBTTtBQUNYLGVBQVMsRUFBRSxPQUFPO0tBQ3JCLENBQUMsQ0FBQztHQUNOOztZQXRCQyxJQUFJOztBQUFKLE1BQUksV0F1Qk4sT0FBTyxHQUFDLFVBQUMsRUFBRSxFQUFFO0FBQ1QsUUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLFFBQUksTUFBTSxDQUFDO0FBQ1gsUUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDN0IsUUFBSSxNQUFNLENBQUMsTUFBTSxFQUFFO0FBQ2YsWUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUN0QyxZQUFNLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsQ0FBQztBQUM1QixZQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDakIsTUFDSTtBQUNELFFBQUUsRUFBRSxDQUFDO0tBQ1I7R0FDSjs7QUFuQ0MsTUFBSSxXQW9DTixJQUFJLEdBQUMsVUFBQyxFQUFFLEVBQUU7O0FBQ04sTUFBRSxHQUFHLEVBQUUsSUFBSSxZQUFVLEVBQUUsQ0FBQztBQUN4QixRQUFJLENBQUMsT0FBTyxDQUFDLFlBQU07QUFDZixZQUFLLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNsQixTQUFHLENBQUMsQ0FBQSxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUU7QUFDcEIsWUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNsQixZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2xCLFdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDeEIsQ0FBQSxDQUFDLElBQUksT0FBTSxDQUFDLENBQUM7QUFDZCxRQUFFLEVBQUUsQ0FBQztLQUNSLENBQUMsQ0FBQztBQUNILFFBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNaLFVBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLEVBQUUsQ0FBQzs7QUFFekIsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUM7QUFDbEQsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7QUFDekMsVUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUM7QUFDeEMsY0FBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUUsQ0FBQztLQUN0RDtHQUNKOztBQXZEQyxNQUFJLFdBd0ROLE1BQU0sR0FBQyxVQUFDLElBQUksRUFBRTtBQUNWLFFBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO0dBQzdCOztBQTFEQyxNQUFJLFdBMkROLE1BQU0sR0FBQyxVQUFDLElBQUksRUFBRTtBQUNWLFFBQUksSUFBSSxDQUFDLEtBQUssRUFBRTtBQUNaLFVBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDdEI7QUFDRCxRQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMxQixRQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDakMsUUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFO0FBQ1osVUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztLQUNwQjtHQUNKOzt1QkFwRUMsSUFBSTtBQXFFRixlQUFXO1dBQUMsWUFBRztBQUNmLGVBQU87QUFDSCxXQUFDLEVBQUUsQ0FBQztBQUNKLFdBQUMsRUFBRSxDQUFDO0FBQ0osZUFBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSztBQUMxQixnQkFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTTtTQUMvQixDQUFDO09BQ0w7Ozs7O1NBNUVDLElBQUk7OztBQStFVixNQUFNLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RGdEIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLElBQUksWUFBWSxHQUFHLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUM1QyxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7O0lBRXhCLEtBQUs7c0JBQVMsWUFBWTtNQUExQixLQUFLLEdBQ0ssU0FEVixLQUFLLENBQ00sSUFBSSxFQUFFOztBQUNmLFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUMvQyxRQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDaEMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDeEIsVUFBSSxNQUFLLE1BQU0sQ0FBQyxFQUFFO0FBQ2QsY0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQzdCO0tBQ0osQ0FBQyxDQUFDO0FBQ0gsUUFBSSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBQyxJQUFJLEVBQUs7QUFDeEIsVUFBSSxNQUFLLE1BQU0sQ0FBQyxFQUFFO0FBQ2QsY0FBSyxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO09BQzdCO0tBQ0osQ0FBQyxDQUFDO0dBQ047O1lBZkMsS0FBSzs7dUJBQUwsS0FBSztBQXFCSCxVQUFNO1dBTEMsVUFBQyxLQUFLLEVBQUU7QUFDZixZQUFJLEtBQUssR0FBRyxBQUFDLEtBQUssR0FBSSxRQUFRLEdBQUcsVUFBVSxDQUFDO0FBQzVDLFlBQUksQ0FBQyxNQUFNLENBQUMsR0FBRyxLQUFLLENBQUM7QUFDckIsWUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNwQjtXQUNVLFlBQUc7QUFDVixlQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUN2Qjs7Ozs7U0F2QkMsS0FBSzs7O0FBMEJYLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDOzs7OztBQzlCdkIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7QUFFeEMsSUFBSSxhQUFhLEdBQUcsVUFBUyxPQUFPLEVBQUUsT0FBTyxFQUFFO0FBQzNDLE1BQUksRUFBRSxHQUFHLEFBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFLLE9BQU8sQ0FBQyxDQUFDLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQSxBQUFDLENBQUM7QUFDckUsTUFBSSxFQUFFLEdBQUcsQUFBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLElBQUssT0FBTyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFBLEFBQUMsQ0FBQztBQUNyRSxNQUFJLFFBQVEsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDOztBQUU1QyxTQUFRLFFBQVEsR0FBRyxPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUU7Q0FDdkQsQ0FBQzs7QUFFRixPQUFPLENBQUMsT0FBTyxHQUFHLFVBQVMsV0FBVyxFQUFFLFdBQVcsRUFBRSxFQUFFLEVBQUU7QUFDckQsTUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDN0IsZUFBVyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7R0FDL0I7QUFDRCxNQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUM3QixlQUFXLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztHQUMvQjtBQUNELGFBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDekIsUUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3pDLGVBQVcsQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLLEVBQUk7QUFDekIsVUFBSSxXQUFXLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3pDLFVBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxTQUFTLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxTQUFTLEVBQUU7QUFDdEUsWUFBSSxhQUFhLENBQUMsV0FBVyxFQUFFLFdBQVcsQ0FBQyxFQUFFO0FBQ3pDLFlBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUM7U0FDcEI7T0FDSixNQUNJLElBQUksVUFBVSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsRUFBRSxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsRUFBRTtBQUNqRSxVQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDO09BQ3BCO0tBQ0osQ0FBQyxDQUFDO0dBQ04sQ0FBQyxDQUFDO0NBQ04sQ0FBQzs7QUFFRixPQUFPLENBQUMsVUFBVSxHQUFHLFVBQVMsS0FBSyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUU7QUFDOUMsTUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDO0FBQ2hCLE9BQUssSUFBSSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDL0IsVUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQSxHQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDakU7QUFDRCxTQUFPLE1BQU0sQ0FBQztDQUNqQixDQUFDOztBQUVGLE9BQU8sQ0FBQyxlQUFlLEdBQUcsVUFBUyxNQUFNLEVBQUUsS0FBSyxFQUFFO0FBQzlDLE1BQUksQ0FBQyxLQUFLLEVBQUU7QUFDUixXQUFPO0dBQ1Y7QUFDRCxNQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDckMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7QUFDZCxRQUFJLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUM5QixPQUFHLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztBQUNoQixTQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ3BCLFVBQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0dBQ3JCO0FBQ0QsUUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixRQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3pCLFFBQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUM7QUFDekIsUUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLEtBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUN0QyxNQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssU0FBUyxFQUFFO0FBQzdCLFVBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDdkU7QUFFRyxVQUFNLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQzNEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQzlETCxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUN6QyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUN2QyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbkMsSUFBSSxVQUFVLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDOztJQUVsQyxJQUFJO2dCQUFTLE1BQU07TUFBbkIsSUFBSSxHQUNHLFNBRFAsSUFBSSxDQUNJLElBQUksRUFBRTs7QUFDbEIsd0NBRkksSUFBSSwrRUFFQyxTQUFTLElBQUU7QUFDcEIsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixRQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQztBQUM3QixRQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNwRCxVQUFNLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3JCLFVBQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUMzQixVQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakIsVUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztBQUMvQixVQUFNLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7R0FDckY7O1lBWEksSUFBSTs7QUFBSixNQUFJLFdBWVQsTUFBTSxHQUFDLFlBQUc7QUFDVCxRQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNwRCxVQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDZCxhQUFPO0tBQ1Y7QUFDUCxRQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0dBQzVCOztTQWxCSSxJQUFJOzs7QUFxQlYsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxQnRCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7QUFDaEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDekMsSUFBSSxPQUFPLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBQ3JDLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7O0lBRTVCLE1BQU07Z0JBQVMsTUFBTTtNQUFyQixNQUFNLEdBSUMsU0FKUCxNQUFNLEdBSUk7O0FBQ2Qsd0NBTEksTUFBTSwrRUFLRCxTQUFTLElBQUU7QUFDcEIsUUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDbEMsUUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixRQUFJLENBQUMsWUFBWSxHQUFHLFFBQVEsQ0FBQzs7QUFFN0IsUUFBSSxLQUFLLEdBQUcsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNqRCxTQUFLLENBQUMscUJBQXFCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQzs7QUFFNUMsUUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDMUMsUUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRTVDLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztBQUM3RCxVQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixVQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMvQixVQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7O0FBRTlCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5RCxVQUFNLENBQUMsY0FBYyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDL0IsVUFBTSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDbkIsVUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ2QsVUFBTSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztBQUNoQyxVQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDOztBQUVsQyxVQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDOztBQUV4QixRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMscUJBQXFCLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztBQUM5RSxRQUFJLENBQUMsUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUM7O0FBRXZELFVBQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3ZDOztZQWxDSSxNQUFNOztBQUFOLFFBQU0sQ0FDSixPQUFPLEdBQUMsVUFBQyxJQUFJLEVBQUU7QUFDZixRQUFJLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxVQUFBLE1BQU07YUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO0tBQUEsQ0FBQyxDQUFDO0dBQ2hFOztBQUhDLFFBQU0sV0FtQ1gsS0FBSyxHQUFDLFlBQUc7QUFDUixRQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLFFBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNwQyxRQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7R0FDcEM7O0FBdkNJLFFBQU0sV0F3Q1gsUUFBUSxHQUFDLFlBQUc7QUFDWCxRQUFJLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQztBQUNsQixRQUFJLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxDQUFDO0dBQzFCOztBQTNDSSxRQUFNLFdBNENYLEdBQUcsR0FBQyxZQUFHO0FBQ04sUUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHLENBQUM7QUFDbEIsUUFBSSxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRTtBQUNuQixVQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztLQUNmO0FBQ0QsUUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUNyQjs7QUFsREksUUFBTSxXQW1EWCxNQUFNLEdBQUMsWUFBRztBQUNULFFBQUksUUFBUSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDOztBQUVsQyxRQUFJLFFBQVEsQ0FBQyxJQUFJLEVBQUUsRUFFbEI7QUFDRCxRQUFJLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFFbkI7QUFDRCxRQUFJLFFBQVEsQ0FBQyxFQUFFLEVBQUU7QUFDaEIsVUFBSSxDQUFDLFdBQVcsR0FBRyxLQUFLLENBQUM7QUFDekIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztBQUM1QixVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNwQjtBQUNELFFBQUksUUFBUSxDQUFDLElBQUksRUFBRTtBQUNsQixVQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QixVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDO0FBQzVCLFVBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDO0tBQ3RCOztBQUVELFFBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFO0FBQ25ELFVBQUksT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNoQixVQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQztBQUN4QixVQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssSUFBSSxFQUFFO0FBQzFCLGVBQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDO09BQ3RELE1BQ0k7QUFDSixlQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztPQUNuRztBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUNmLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FDdkIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUNsQyxLQUFLLEVBQUUsQ0FBQztBQUNWLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ3BCOzs7Ozs7Ozs7O0FBVUQsUUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7R0FDeEI7O0FBaEdJLFFBQU0sV0FpR1gsTUFBTSxHQUFDLFVBQUMsSUFBSSxFQUFFOztBQUNiLHdDQWxHSSxNQUFNLDBFQWtHTSxTQUFTLElBQUU7QUFDM0IsUUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xEO0dBQ0Q7O0FBdEdJLFFBQU0sV0F1R1gsZ0JBQWdCLEdBQUMsWUFBRztBQUNuQixRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN0QixVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7QUFDRCxRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUN0QixVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDbEI7QUFDRCxRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNqRSxVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUM7S0FDN0Q7QUFDRCxRQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtBQUNuRSxVQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUM7S0FDL0Q7R0FDRDs7QUFwSEksUUFBTSxXQXFIWCxjQUFjLEdBQUMsWUFBRztBQUNYLFdBQU87QUFDTixPQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQ3BDLE9BQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLEdBQUcsQ0FBQztBQUM3QyxXQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0FBQ3hCLFlBQU0sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU07S0FDMUIsQ0FBQztHQUNSOztTQTVISSxNQUFNOzs7QUErSFosTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3RJeEIsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDekMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ25DLElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQzs7SUFFbEMsSUFBSTtnQkFBUyxNQUFNO01BQW5CLElBQUksR0FDRyxTQURQLElBQUksQ0FDSSxJQUFJLEVBQUU7O0FBQ2xCLHdDQUZJLElBQUksK0VBRUMsU0FBUyxJQUFFO0FBQ3BCLFFBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ2YsUUFBSSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7QUFDN0IsUUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7QUFDcEMsUUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7QUFDcEQsVUFBTSxDQUFDLFNBQVMsQ0FBQyxPQUFRLENBQUMsQ0FBQztBQUNyQixVQUFNLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDMUMsVUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ2pCLFVBQU0sQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7QUFDL0IsVUFBTSxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0dBQ3JGOztZQVpJLElBQUk7O0FBQUosTUFBSSxXQWFULE1BQU0sR0FBQyxZQUFHO0FBQ1QsUUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDcEQsVUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ2QsYUFBTztLQUNWO0FBQ1AsUUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQztHQUM1Qjs7U0FuQkksSUFBSTs7O0FBc0JWLE1BQU0sQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDOzs7OztBQzNCdEIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDOzs7QUFHcEMsSUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7OztBQUd4QixJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QyxJQUFJLFVBQVUsR0FBRyxPQUFPLENBQUMscUJBQXFCLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN0RCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOztBQUV4QyxLQUFLLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxZQUFZO0FBQzdCLE1BQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0FBQ25CLFlBQVUsQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO0NBQzVCLENBQUMsQ0FBQztBQUNILElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLFlBQVc7QUFDekIsTUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBVSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDMUIsS0FBRyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7Q0FDbEIsQ0FBQyxDQUFDO0FBQ0gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxVQUFVLEVBQUUsWUFBVTtBQUM1QixNQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNoQixZQUFVLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztDQUM1QixDQUFDLENBQUM7QUFDSCxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztBQUNsQixJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7OztBQ3pCWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDejBDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2VUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcHZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUN0RkEsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNoQyxJQUFJLEtBQUssR0FBRyxPQUFPLENBQUMsaUJBQWlCLENBQUMsQ0FBQzs7QUFFdkMsU0FBUyxlQUFlLENBQUUsSUFBSSxFQUFFO0FBQy9CLE1BQUksS0FBSyxHQUFHLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzVCLE1BQUksV0FBVyxHQUFHLEdBQUcsQ0FBQztBQUN0QixNQUFJLE1BQU0sR0FBRyxvQ0FBb0MsQ0FBQztBQUNsRCxNQUFJLElBQUksQ0FBQzs7QUFFVCxPQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNsQixPQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDNUIsTUFBSSxDQUFDLEVBQUUsQ0FBQyxTQUFTLEVBQUUsVUFBUyxNQUFNLEVBQUU7QUFDbkMsVUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztHQUNwQixDQUFDLENBQUM7QUFDSCxNQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFXO0FBQzFCLFFBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLFVBQU0sQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQztBQUNwQyxTQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM3QixRQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUNyQyxXQUFPLENBQUMsU0FBUyxDQUFDLE9BQVEsQ0FBQyxDQUFDO0FBQ3RCLFdBQU8sQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQzlDLFdBQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNyQixRQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ25HLFFBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDO0FBQ2xDLFNBQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLFFBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztHQUM1QyxDQUFDLENBQUM7QUFDTixPQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFZO0FBQzNCLFNBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztHQUM5QixDQUFDLENBQUM7QUFDSCxPQUFLLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxZQUFXO0FBQzdCLFFBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLFdBQVcsQ0FBQztBQUNuQyxRQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztBQUN2QixVQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQztLQUNwQjtBQUNELFFBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDNUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksR0FBRyxDQUFDO0FBQ3ZCLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0tBQ3BCLE1BQ0ksSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO0FBQ3RCLFVBQUksQ0FBQyxLQUFLLENBQ1IsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FDNUIsTUFBTSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUNsQyxLQUFLLEVBQUUsQ0FBQztBQUNWLFVBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO0dBQ0QsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakMsUUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLFVBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDM0M7R0FDRCxDQUFDLENBQUM7QUFDSCxTQUFPLEtBQUssQ0FBQztDQUNiOztBQUVELE1BQU0sQ0FBQyxPQUFPLEdBQUcsZUFBZSxDQUFDOzs7OztBQzFEakMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQzlCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDbEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ2hDLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM3QixJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDbkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFDdkMsSUFBSSxNQUFNLEdBQUcsT0FBTyxDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFDM0MsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdkMsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDdkMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXZDLFNBQVMsU0FBUyxDQUFFLElBQUksRUFBRTtBQUN6QixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixNQUFJLE9BQU8sR0FBRyxJQUFJLElBQUksQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLCtCQUErQixDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUM7QUFDakYsTUFBSSxVQUFVLENBQUM7QUFDZixNQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDZixNQUFJLElBQUksR0FBRyxFQUFFLENBQUM7QUFDZCxNQUFJLE1BQU0sQ0FBQztBQUNYLE1BQUksS0FBSyxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDOztBQUVoQyxNQUFJLGlCQUFpQixHQUFHLFVBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDcEQsUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLFVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUNiLFFBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsSUFBSSxFQUFFO0FBQzdCLGdCQUFVLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0tBQy9DO0FBQ0QsU0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDckIsU0FBSyxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7R0FDekIsQ0FBQzs7QUFFRixNQUFJLGlCQUFpQixHQUFHLFVBQVMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUU7QUFDcEQsUUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO0FBQ3ZCLGNBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDL0MsVUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDO0dBQ2xCLENBQUM7O0FBRUYsT0FBSyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUMxQixPQUFLLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRSxPQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEIsT0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDdEIsT0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDNUIsUUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNyQixNQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxZQUFXO0FBQzFCLFNBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3JCLFNBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUM1QixVQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ3pCLE9BQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxDQUFDO0FBQzFCLE9BQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO0tBQzNCLENBQUMsQ0FBQztBQUNILFVBQU0sQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDekIsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWTtBQUM5QixTQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7QUFDM0IsU0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDO0FBQ3RCLFVBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNmLFNBQUssQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJO2FBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtLQUFBLENBQUMsQ0FBQztBQUM5QyxTQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ1gsUUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFBLENBQUM7YUFBSSxDQUFDLENBQUMsZUFBZSxFQUFFO0tBQUEsQ0FBQyxDQUFDO0FBQ3ZDLFFBQUksR0FBRyxFQUFFLENBQUM7QUFDVixXQUFPLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDdEIsY0FBVSxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7R0FDMUMsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsVUFBUyxJQUFJLEVBQUM7QUFDaEMsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLEVBQUU7QUFDakMsVUFBSSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDMUIsVUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QixXQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2pCO0FBQ0QsUUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLEVBQUU7QUFDaEMsVUFBSSxDQUFDLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdkIsT0FBQyxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNwQixVQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ2I7QUFDRCxTQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7YUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO0tBQUEsQ0FBQyxDQUFDO0FBQzVDLFFBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTthQUFJLENBQUMsSUFBSSxDQUFDLE9BQU87S0FBQSxDQUFDLENBQUM7QUFDMUMsU0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDNUQsU0FBSyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDN0QsUUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLEVBQUU7QUFDMUIsV0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUNsQjtBQUNELFFBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxXQUFXLEdBQUcsRUFBRSxFQUFFO0FBQ2xDLFdBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0tBQ3RCO0FBQ0QsUUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFdBQVcsR0FBRyxHQUFHLEVBQUU7QUFDbkMsV0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQztLQUNyQyxNQUNJLElBQUksS0FBSyxDQUFDLFdBQVcsRUFBRTtBQUMzQixXQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsR0FBRztBQUN0QixTQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdkIsU0FBQyxFQUFFLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDO09BQ3ZCLENBQUM7S0FDRjtHQUNELENBQUMsQ0FBQztBQUNILE9BQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVMsSUFBSSxFQUFFO0FBQ2pDLFFBQUksVUFBVSxFQUFFO0FBQ2YsZ0JBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDeEI7R0FDRCxDQUFDLENBQUM7O0FBRUgsU0FBTyxLQUFLLENBQUM7Q0FDYjs7QUFFRCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQzs7Ozs7QUN0RzNCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5QixJQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDaEMsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXZDLFNBQVMsVUFBVSxDQUFFLElBQUksRUFBRTtBQUN2QixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixNQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUU7QUFDN0MsUUFBSSxFQUFFLE9BQU87R0FDaEIsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDM0IsT0FBSyxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxNQUFNLEdBQUc7QUFDakMsUUFBSSxLQUFLLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFO0FBQ3JDLFdBQUssQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0tBQ3hCO0dBQ0osQ0FBQyxDQUNELEVBQUUsQ0FBQyxVQUFVLEVBQUUsWUFBWTtBQUN4QixTQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7R0FDL0IsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDcEIsU0FBTyxLQUFLLENBQUM7Q0FDaEI7O0FBRUQsTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUM7Ozs7O0FDdEI1QixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7QUFDOUIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXZDLFNBQVMsUUFBUSxDQUFFLElBQUksRUFBRTtBQUNyQixNQUFJLEtBQUssR0FBRyxJQUFJLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM1QixNQUFJLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFO0FBQ3JDLFFBQUksRUFBRSxPQUFPO0dBQ2hCLENBQUMsQ0FBQztBQUNILE9BQUssQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzNCLE9BQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxFQUFFLFNBQVMsTUFBTSxHQUFHO0FBQ2pDLFFBQUksS0FBSyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRTtBQUNyQyxXQUFLLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztLQUN4QjtHQUNKLENBQUMsQ0FDRCxFQUFFLENBQUMsUUFBUSxFQUFFLFlBQVc7QUFDckIsU0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0dBQzlCLENBQUM7QUFFRSxTQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7R0FDL0IsQ0FBQyxDQUFDO0FBQ0gsT0FBSyxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDckIsT0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0FBQzVCLFNBQU8sS0FBSyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQSVhJID0gcmVxdWlyZSgncGl4aS5qcycpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4vdXRpbHMnKTtcblxuY2xhc3MgRW50aXR5IGV4dGVuZHMgRXZlbnRFbWl0dGVyIHtcbiAgICBjb25zdHJ1Y3RvciAoZ2FtZSwgb3B0aW9ucykge1xuICAgICAgICB0aGlzLmdhbWUgPSBnYW1lO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBhZGRUb1NjZW5lIChzY2VuZSkge1xuICAgICAgICBzY2VuZS5zdGFnZS5hZGRDaGlsZCh0aGlzLmVudGl0eSk7XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5ib3VuZFVwZGF0ZSA9IHRoaXMudXBkYXRlLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBzY2VuZS5vbigndXBkYXRlJywgdGhpcy5ib3VuZFVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVuZGVyKSB7XG4gICAgICAgICAgICBzY2VuZS5vbigncmVuZGVyJywgdGhpcy5yZW5kZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zY2VuZSA9IHNjZW5lO1xuICAgIH1cbiAgICByZW1vdmVGcm9tU2NlbmUgKCkge1xuICAgICAgICBpZiAoIXRoaXMuc2NlbmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjZW5lLnN0YWdlLnJlbW92ZUNoaWxkKHRoaXMuZW50aXR5KTtcbiAgICAgICAgaWYgKHRoaXMuYm9keSkge1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5zdGFnZS5yZW1vdmVDaGlsZCh0aGlzLmJvZHkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnVwZGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5zY2VuZS5yZW1vdmVMaXN0ZW5lcigndXBkYXRlJywgdGhpcy5ib3VuZFVwZGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVuZGVyKSB7XG4gICAgICAgICAgICB0aGlzLnNjZW5lLnJlbW92ZUxpc3RlbmVyKCdyZW5kZXInLCB0aGlzLnJlbmRlcik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5zY2VuZSA9IG51bGw7XG4gICAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgfVxuICAgIGdldEJvdW5kaW5nQm94ICgpIHtcbiAgICAgICAgaWYgKHRoaXMuYm91bmRpbmdUeXBlID09PSAnY2lyY2xlJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLmVudGl0eS54LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMuZW50aXR5LnksXG4gICAgICAgICAgICAgICAgcmFkaXVzOiB0aGlzLmVudGl0eS53aWR0aCAvIDJcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHRoaXMuZW50aXR5LngsXG4gICAgICAgICAgICB5OiB0aGlzLmVudGl0eS55LFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuZW50aXR5LndpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLmVudGl0eS5oZWlnaHRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmVuZGVyICgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2FtZS5kZWJ1ZyAmJiB0aGlzLnNjZW5lKSB7XG4gICAgICAgICAgICB1dGlscy5zaG93Qm91bmRpbmdCb3godGhpcywgdGhpcy5zY2VuZS5zdGFnZSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRW50aXR5O1xuIiwidmFyIFBJWEkgPSByZXF1aXJlKCdwaXhpLmpzJyk7XG52YXIga2IgPSByZXF1aXJlKCdrYi1jb250cm9scycpO1xudmFyIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50ZW1pdHRlcjMnKTtcbnZhciBTdGF0cyA9IHJlcXVpcmUoJ3N0YXRzLWpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuL3V0aWxzJyk7XG52YXIgcmFmID0gcmVxdWlyZSgncmFmJyk7XG5cbmNsYXNzIEdhbWUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yICh7IHdpZHRoID0gNjAwLCBoZWlnaHQgPSA0MDAgfSkge1xuICAgICAgICB0aGlzLlBJWEkgPSBQSVhJO1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBQSVhJLnNjYWxlTW9kZXMuREVGQVVMVCA9IFBJWEkuc2NhbGVNb2Rlcy5ORUFSRVNUO1xuXG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5TdGFnZSgweDFlMWYzMyk7XG4gICAgICAgIHRoaXMucmVuZGVyZXIgPSBQSVhJLmF1dG9EZXRlY3RSZW5kZXJlcih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5yZW5kZXJlci52aWV3KTtcblxuICAgICAgICB0aGlzLmtleWJvYXJkID0ga2Ioe1xuICAgICAgICAgICAgJzxsZWZ0Pic6ICdsZWZ0JyxcbiAgICAgICAgICAgICdBJzogJ2xlZnQnLFxuICAgICAgICAgICAgJzxyaWdodD4nOiAncmlnaHQnLFxuICAgICAgICAgICAgJ0QnOiAncmlnaHQnLFxuICAgICAgICAgICAgJzx1cD4nOiAndXAnLFxuICAgICAgICAgICAgJ1cnOiAndXAnLFxuICAgICAgICAgICAgJzxkb3duPic6ICdkb3duJyxcbiAgICAgICAgICAgICdTJzogJ2Rvd24nLFxuICAgICAgICAgICAgJzxzcGFjZT4nOiAnc3BhY2UnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBwcmVsb2FkIChjYikge1xuICAgICAgICB2YXIgYXNzZXRzID0gW107XG4gICAgICAgIHZhciBsb2FkZXI7XG4gICAgICAgIHRoaXMuZW1pdCgncHJlbG9hZCcsIGFzc2V0cyk7XG4gICAgICAgIGlmIChhc3NldHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBsb2FkZXIgPSBuZXcgUElYSS5Bc3NldExvYWRlcihhc3NldHMpO1xuICAgICAgICAgICAgbG9hZGVyLm9uKCdvbkNvbXBsZXRlJywgY2IpO1xuICAgICAgICAgICAgbG9hZGVyLmxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNiKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgYm9vdCAoY2IpIHtcbiAgICAgICAgY2IgPSBjYiB8fCBmdW5jdGlvbigpe307XG4gICAgICAgIHRoaXMucHJlbG9hZCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmVtaXQoJ2xvYWQnKTtcbiAgICAgICAgICAgIHJhZihmdW5jdGlvbiB0aWNrKHRpbWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZSh0aW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcih0aW1lKTtcbiAgICAgICAgICAgICAgICByYWYodGljay5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgICAgICBjYigpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMgPSBuZXcgU3RhdHMoKTtcbiAgICAgICAgICAgIC8vIEFsaWduIHRvcC1sZWZ0XG4gICAgICAgICAgICB0aGlzLnN0YXRzLmRvbUVsZW1lbnQuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICAgICAgICAgICAgdGhpcy5zdGF0cy5kb21FbGVtZW50LnN0eWxlLmxlZnQgPSAnMHB4JztcbiAgICAgICAgICAgIHRoaXMuc3RhdHMuZG9tRWxlbWVudC5zdHlsZS50b3AgPSAnMHB4JztcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoIHRoaXMuc3RhdHMuZG9tRWxlbWVudCApO1xuICAgICAgICB9XG4gICAgfVxuICAgIHVwZGF0ZSAodGltZSkge1xuICAgICAgICB0aGlzLmVtaXQoJ3VwZGF0ZScsIHRpbWUpO1xuICAgIH1cbiAgICByZW5kZXIgKHRpbWUpIHtcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMuYmVnaW4oKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVtaXQoJ3JlbmRlcicsIHRpbWUpO1xuICAgICAgICB0aGlzLnJlbmRlcmVyLnJlbmRlcih0aGlzLnN0YWdlKTtcbiAgICAgICAgaWYgKHRoaXMuZGVidWcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdHMuZW5kKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0IHdvcmxkQm91bmRzICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgd2lkdGg6IHRoaXMucmVuZGVyZXIud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMucmVuZGVyZXIuaGVpZ2h0XG4gICAgICAgIH07XG4gICAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbWU7XG4iLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBFdmVudEVtaXR0ZXIgPSByZXF1aXJlKCdldmVudGVtaXR0ZXIzJyk7XG52YXIgYWN0aXZlID0gU3ltYm9sKCdhY3RpdmUnKTtcblxuY2xhc3MgU2NlbmUgZXh0ZW5kcyBFdmVudEVtaXR0ZXIge1xuICAgIGNvbnN0cnVjdG9yIChnYW1lKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IGdhbWU7XG4gICAgICAgIHRoaXMuc3RhZ2UgPSBuZXcgUElYSS5EaXNwbGF5T2JqZWN0Q29udGFpbmVyKCk7XG4gICAgICAgIGdhbWUuc3RhZ2UuYWRkQ2hpbGQodGhpcy5zdGFnZSk7XG4gICAgICAgIGdhbWUub24oJ3VwZGF0ZScsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpc1thY3RpdmVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCd1cGRhdGUnLCB0aW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGdhbWUub24oJ3JlbmRlcicsICh0aW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpc1thY3RpdmVdKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbWl0KCdyZW5kZXInLCB0aW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHNldCBhY3RpdmUgKHZhbHVlKSB7XG4gICAgICAgIHZhciBldmVudCA9ICh2YWx1ZSkgPyAnYWN0aXZlJyA6ICdpbmFjdGl2ZSc7XG4gICAgICAgIHRoaXNbYWN0aXZlXSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmVtaXQoZXZlbnQpO1xuICAgIH1cbiAgICBnZXQgYWN0aXZlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXNbYWN0aXZlXTtcbiAgICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU2NlbmU7XG4iLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBib3hDb2xsaWRlID0gcmVxdWlyZSgnYm94LWNvbGxpZGUnKTtcblxudmFyIGNpcmNsZUNvbGxpZGUgPSBmdW5jdGlvbihjaXJjbGUxLCBjaXJjbGUyKSB7XG4gICAgdmFyIGR4ID0gKGNpcmNsZTEueCArIGNpcmNsZTEucmFkaXVzKSAtIChjaXJjbGUyLnggKyBjaXJjbGUyLnJhZGl1cyk7XG4gICAgdmFyIGR5ID0gKGNpcmNsZTEueSArIGNpcmNsZTEucmFkaXVzKSAtIChjaXJjbGUyLnkgKyBjaXJjbGUyLnJhZGl1cyk7XG4gICAgdmFyIGRpc3RhbmNlID0gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcbiAgICBcbiAgICByZXR1cm4gKGRpc3RhbmNlIDwgY2lyY2xlMS5yYWRpdXMgKyBjaXJjbGUyLnJhZGl1cyk7XG59O1xuXG5leHBvcnRzLmNvbGxpZGUgPSBmdW5jdGlvbihjb2xsZWN0aW9uMSwgY29sbGVjdGlvbjIsIGNiKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbGxlY3Rpb24xKSkge1xuICAgICAgICBjb2xsZWN0aW9uMSA9IFtjb2xsZWN0aW9uMV07XG4gICAgfVxuICAgIGlmICghQXJyYXkuaXNBcnJheShjb2xsZWN0aW9uMikpIHtcbiAgICAgICAgY29sbGVjdGlvbjIgPSBbY29sbGVjdGlvbjJdO1xuICAgIH1cbiAgICBjb2xsZWN0aW9uMS5mb3JFYWNoKGl0ZW0xID0+IHtcbiAgICAgICAgbGV0IGl0ZW0xQm91bmRzID0gaXRlbTEuZ2V0Qm91bmRpbmdCb3goKTtcbiAgICAgICAgY29sbGVjdGlvbjIuZm9yRWFjaChpdGVtMiA9PiB7XG4gICAgICAgICAgICBsZXQgaXRlbTJCb3VuZHMgPSBpdGVtMi5nZXRCb3VuZGluZ0JveCgpO1xuICAgICAgICAgICAgaWYgKGl0ZW0xQm91bmRzLnJhZGl1cyAhPT0gdW5kZWZpbmVkICYmIGl0ZW0yQm91bmRzLnJhZGl1cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNpcmNsZUNvbGxpZGUoaXRlbTFCb3VuZHMsIGl0ZW0yQm91bmRzKSkge1xuICAgICAgICAgICAgICAgICAgICBjYihpdGVtMSwgaXRlbTIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGJveENvbGxpZGUoaXRlbTEuZ2V0Qm91bmRpbmdCb3goKSwgaXRlbTIuZ2V0Qm91bmRpbmdCb3goKSkpIHtcbiAgICAgICAgICAgICAgICBjYihpdGVtMSwgaXRlbTIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydHMuZnJhbWVSYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBlbmQsIHByZWZpeCkge1xuICAgIHZhciBmcmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPD0gZW5kOyBpKyspIHtcbiAgICAgICAgZnJhbWVzLnB1c2gobmV3IFBJWEkuVGV4dHVyZS5mcm9tRnJhbWUoKHByZWZpeCB8fCBudWxsKSArIGkpKTtcbiAgICB9XG4gICAgcmV0dXJuIGZyYW1lcztcbn07XG5cbmV4cG9ydHMuc2hvd0JvdW5kaW5nQm94ID0gZnVuY3Rpb24ob2JqZWN0LCBzdGFnZSkge1xuICAgIGlmICghc3RhZ2UpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYm91bmRzID0gb2JqZWN0LmdldEJvdW5kaW5nQm94KCk7XG4gICAgaWYgKCFvYmplY3QuYm9keSkge1xuICAgICAgICBsZXQgYm94ID0gbmV3IFBJWEkuR3JhcGhpY3MoKTtcbiAgICAgICAgYm94LmFscGhhID0gMC4zO1xuICAgICAgICBzdGFnZS5hZGRDaGlsZChib3gpO1xuICAgICAgICBvYmplY3QuYm9keSA9IGJveDtcbiAgICB9XG4gICAgb2JqZWN0LmJvZHkuY2xlYXIoKTtcbiAgICBvYmplY3QuYm9keS54ID0gYm91bmRzLng7XG4gICAgb2JqZWN0LmJvZHkueSA9IGJvdW5kcy55O1xuICAgIG9iamVjdC5ib2R5LmxpbmVTdHlsZSgyLCAweDAwZmYwMCwgMSk7XG4gICAgaWYgKGJvdW5kcy5yYWRpdXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBvYmplY3QuYm9keS5kcmF3Q2lyY2xlKGJvdW5kcy5yYWRpdXMsIGJvdW5kcy5yYWRpdXMsIGJvdW5kcy5yYWRpdXMpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgb2JqZWN0LmJvZHkuZHJhd1JlY3QoMCwgMCwgYm91bmRzLndpZHRoLCBib3VuZHMuaGVpZ2h0KTtcbiAgICB9XG59O1xuIiwidmFyIEVudGl0eSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9lbnRpdHknKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL2VuZ2luZS91dGlscycpO1xudmFyIHJhbmRvbSA9IHJlcXVpcmUoJ3JhbmRvbS1leHQnKTtcbnZhciBib3hDb2xsaWRlID0gcmVxdWlyZSgnYm94LWNvbGxpZGUnKTtcblxuY2xhc3MgRHVzdCBleHRlbmRzIEVudGl0eSB7XG5cdGNvbnN0cnVjdG9yIChnYW1lKSB7XG5cdFx0c3VwZXIoLi4uYXJndW1lbnRzKTtcblx0XHR0aGlzLnNwZWVkID0gMztcblx0XHR0aGlzLmJvdW5kaW5nVHlwZSA9ICdjaXJjbGUnO1xuXHRcdHZhciBlbnRpdHkgPSB0aGlzLmVudGl0eSA9IG5ldyBnYW1lLlBJWEkuR3JhcGhpY3MoKTtcblx0XHRlbnRpdHkuYmVnaW5GaWxsKDB4ZmZmNzU2KTtcbiAgICAgICAgZW50aXR5LmRyYXdDaXJjbGUoNCwgNCwgNCk7XG4gICAgICAgIGVudGl0eS5lbmRGaWxsKCk7XG4gICAgICAgIGVudGl0eS54ID0gZ2FtZS5yZW5kZXJlci53aWR0aDtcbiAgICAgICAgZW50aXR5LnkgPSByYW5kb20uaW50ZWdlcihnYW1lLnJlbmRlcmVyLmhlaWdodCAtIGVudGl0eS5oZWlnaHQsIGVudGl0eS5oZWlnaHQpO1xuXHR9XG5cdHVwZGF0ZSAoKSB7XG5cdFx0aWYgKCFib3hDb2xsaWRlKHRoaXMuZW50aXR5LCB0aGlzLmdhbWUud29ybGRCb3VuZHMpKSB7XG5cdFx0XHR0aGlzLnJlbW92ZUZyb21TY2VuZSgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cdFx0dGhpcy5lbnRpdHkueCAtPSB0aGlzLnNwZWVkO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRHVzdDsiLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBUV0VFTiA9IHJlcXVpcmUoJ3R3ZWVuLmpzJyk7XG52YXIgdXRpbHMgPSByZXF1aXJlKCcuLi9lbmdpbmUvdXRpbHMnKTtcbnZhciBFbnRpdHkgPSByZXF1aXJlKCcuLi9lbmdpbmUvZW50aXR5Jyk7XG52YXIgY29sbGlkZSA9IHJlcXVpcmUoJ2JveC1jb2xsaWRlJyk7XG52YXIgSG93bCA9IHJlcXVpcmUoJ2hvd2xlcicpLkhvd2w7XG5cbmNsYXNzIFBsYXllciBleHRlbmRzIEVudGl0eSB7XG5cdHN0YXRpYyBwcmVsb2FkIChnYW1lKSB7XG4gICAgICAgIGdhbWUub24oJ3ByZWxvYWQnLCBhc3NldHMgPT4gYXNzZXRzLnB1c2goJ2Fzc2V0cy9zaGlwLnBuZycpKTtcbiAgICB9XG5cdGNvbnN0cnVjdG9yICgpIHtcblx0XHRzdXBlciguLi5hcmd1bWVudHMpO1xuXHRcdHRoaXMuYXNzZXRzID0gWydhc3NldHMvc2hpcC5wbmcnXTtcblx0XHR0aGlzLnNwZWVkID0gNjtcblx0XHR0aGlzLmJvdW5kaW5nVHlwZSA9ICdjaXJjbGUnO1xuXG5cdFx0dmFyIGltYWdlID0gbmV3IFBJWEkuSW1hZ2VMb2FkZXIodGhpcy5hc3NldHNbMF0pO1xuXHRcdGltYWdlLmxvYWRGcmFtZWRTcHJpdGVTaGVldCgzMiwgMzIsICdzaGlwJyk7XG5cblx0XHR0aGlzLmZseUZyYW1lcyA9IGltYWdlLmZyYW1lcy5zbGljZSgxLCA1KTtcblx0XHR0aGlzLnN0b3BGcmFtZXMgPSBpbWFnZS5mcmFtZXMuc2xpY2UoNSwgMTIpO1xuXG5cdFx0dmFyIGVudGl0eSA9IHRoaXMuZW50aXR5ID0gbmV3IFBJWEkuRGlzcGxheU9iamVjdENvbnRhaW5lcigpO1xuXHRcdGVudGl0eS54ID0gdGhpcy5vcHRpb25zLnggfHwgMDtcblx0XHRlbnRpdHkueSA9IHRoaXMub3B0aW9ucy55IHx8IDA7XG5cdFx0ZW50aXR5LnNjYWxlID0geyB4OiAyLCB5OiAyIH07XG5cblx0XHR2YXIgc3ByaXRlID0gdGhpcy5zcHJpdGUgPSBuZXcgUElYSS5Nb3ZpZUNsaXAodGhpcy5mbHlGcmFtZXMpO1xuXHRcdHNwcml0ZS5hbmltYXRpb25TcGVlZCA9IDEgLyA2MDtcblx0XHRzcHJpdGUubG9vcCA9IHRydWU7XG5cdFx0c3ByaXRlLnBsYXkoKTtcblx0XHRzcHJpdGUucm90YXRpb24gPSBNYXRoLlBJICogMS41O1xuXHRcdHNwcml0ZS5wb3NpdGlvbi55ID0gc3ByaXRlLmhlaWdodDtcblxuXHRcdGVudGl0eS5hZGRDaGlsZChzcHJpdGUpO1xuXG5cdFx0dGhpcy5zaGluZUdldFNvdW5kID0gbmV3IEhvd2woeyB1cmxzOiBbJ2Fzc2V0cy9zaGluZWdldC53YXYnXSwgdm9sdW1lOiAwLjYgfSk7XG5cdFx0dGhpcy5oaXRTb3VuZCA9IG5ldyBIb3dsKHsgdXJsczogWydhc3NldHMvaGl0LndhdiddIH0pO1xuXG5cdFx0ZW50aXR5LnR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKGVudGl0eSk7XG5cdH1cblx0cmVzZXQgKCkge1xuXHRcdHRoaXMuc3BlZWQgPSA2O1xuXHRcdHRoaXMuZW50aXR5LnggPSB0aGlzLm9wdGlvbnMueCB8fCAwO1xuXHRcdHRoaXMuZW50aXR5LnkgPSB0aGlzLm9wdGlvbnMueSB8fCAwO1xuXHR9XG5cdHNoaW5lR2V0ICgpIHtcblx0XHR0aGlzLnNwZWVkIC09IDAuMTtcblx0XHR0aGlzLnNoaW5lR2V0U291bmQucGxheSgpO1xuXHR9XG5cdGhpdCAoKSB7XG5cdFx0dGhpcy5zcGVlZCArPSAwLjE7XG5cdFx0aWYgKHRoaXMuc3BlZWQgPiA2KSB7XG5cdFx0XHR0aGlzLnNwZWVkID0gNjtcblx0XHR9XG5cdFx0dGhpcy5oaXRTb3VuZC5wbGF5KCk7XG5cdH1cblx0dXBkYXRlICgpIHtcblx0XHR2YXIga2V5Ym9hcmQgPSB0aGlzLmdhbWUua2V5Ym9hcmQ7XG5cblx0XHRpZiAoa2V5Ym9hcmQubGVmdCkge1xuXHRcdFx0Ly8gdGhpcy5lbnRpdHkueCAtPSB0aGlzLnNwZWVkIC8gNDtcblx0XHR9XG5cdFx0aWYgKGtleWJvYXJkLnJpZ2h0KSB7XG5cdFx0XHQvLyB0aGlzLmVudGl0eS54ICs9IHRoaXMuc3BlZWQgLyA0O1xuXHRcdH1cblx0XHRpZiAoa2V5Ym9hcmQudXApIHtcblx0XHRcdHRoaXMuc2hvdWxkVHdlZW4gPSBmYWxzZTtcblx0XHRcdHRoaXMuZW50aXR5LnkgLT0gdGhpcy5zcGVlZDtcblx0XHRcdHRoaXMudHdlZW5UbyA9ICd1cCc7XG5cdFx0fVxuXHRcdGlmIChrZXlib2FyZC5kb3duKSB7XG5cdFx0XHR0aGlzLnNob3VsZFR3ZWVuID0gZmFsc2U7XG5cdFx0XHR0aGlzLmVudGl0eS55ICs9IHRoaXMuc3BlZWQ7XG5cdFx0XHR0aGlzLnR3ZWVuVG8gPSAnZG93bic7IFxuXHRcdH1cblxuXHRcdGlmICh0aGlzLnR3ZWVuVG8gJiYgIWtleWJvYXJkLnVwICYmICFrZXlib2FyZC5kb3duKSB7XG5cdFx0XHRsZXQgdHdlZW5UbyA9IDA7XG5cdFx0XHR0aGlzLnNob3VsZFR3ZWVuID0gdHJ1ZTtcblx0XHRcdGlmICh0aGlzLnR3ZWVuVG8gPT09ICd1cCcpIHtcblx0XHRcdFx0dHdlZW5UbyA9IE1hdGgubWF4KDAsIHRoaXMuZW50aXR5LnkgLSB0aGlzLnNwZWVkICogMik7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dHdlZW5UbyA9IE1hdGgubWluKHRoaXMuZ2FtZS5yZW5kZXJlci5oZWlnaHQgLSB0aGlzLmVudGl0eS5oZWlnaHQsIHRoaXMuZW50aXR5LnkgKyB0aGlzLnNwZWVkICogMik7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLmVudGl0eS50d2VlblxuXHRcdFx0XHQudG8oeyB5OiB0d2VlblRvIH0sIDE1MClcblx0XHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhZHJhdGljLk91dClcblx0XHRcdFx0LnN0YXJ0KCk7XG5cdFx0XHR0aGlzLnR3ZWVuVG8gPSBudWxsO1xuXHRcdH1cblxuXHRcdC8vIGlmIChrZXlib2FyZC5zcGFjZSkge1xuXHRcdC8vIFx0dmFyIHRpbWUgPSBEYXRlLm5vdygpO1xuXHRcdC8vIFx0aWYgKHRpbWUgLSB0aGlzLmxhc3RTaG9vdCA+IDUwMCB8fCAhdGhpcy5sYXN0U2hvb3QpIHtcblx0XHQvLyBcdFx0dGhpcy5lbWl0KCdzaG9vdCcpO1xuXHRcdC8vIFx0XHR0aGlzLmxhc3RTaG9vdCA9IHRpbWU7XG5cdFx0Ly8gXHR9XG5cdFx0Ly8gfVxuXG5cdFx0dGhpcy5wb3NpdGlvbkluQm91bmRzKCk7XG5cdH1cblx0cmVuZGVyICh0aW1lKSB7XG5cdFx0c3VwZXIucmVuZGVyKC4uLmFyZ3VtZW50cyk7XG5cdFx0aWYgKHRoaXMuc2hvdWxkVHdlZW4pIHtcblx0XHRcdHRoaXMuc2hvdWxkVHdlZW4gPSB0aGlzLmVudGl0eS50d2Vlbi51cGRhdGUodGltZSk7XG5cdFx0fVxuXHR9XG5cdHBvc2l0aW9uSW5Cb3VuZHMgKCkge1xuXHRcdGlmICh0aGlzLmVudGl0eS54IDwgMCkge1xuXHRcdFx0dGhpcy5lbnRpdHkueCA9IDA7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmVudGl0eS55IDwgMCkge1xuXHRcdFx0dGhpcy5lbnRpdHkueSA9IDA7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmVudGl0eS54ICsgdGhpcy5lbnRpdHkud2lkdGggPiB0aGlzLmdhbWUucmVuZGVyZXIud2lkdGgpIHtcblx0XHRcdHRoaXMuZW50aXR5LnggPSB0aGlzLmdhbWUucmVuZGVyZXIud2lkdGggLSB0aGlzLmVudGl0eS53aWR0aDtcblx0XHR9XG5cdFx0aWYgKHRoaXMuZW50aXR5LnkgKyB0aGlzLmVudGl0eS5oZWlnaHQgPiB0aGlzLmdhbWUucmVuZGVyZXIuaGVpZ2h0KSB7XG5cdFx0XHR0aGlzLmVudGl0eS55ID0gdGhpcy5nYW1lLnJlbmRlcmVyLmhlaWdodCAtIHRoaXMuZW50aXR5LmhlaWdodDtcblx0XHR9XG5cdH1cblx0Z2V0R3VuUG9zaXRpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICBcdHg6IHRoaXMuZW50aXR5LnggKyB0aGlzLmVudGl0eS53aWR0aCxcbiAgICAgICAgXHR5OiB0aGlzLmVudGl0eS55ICsgdGhpcy5lbnRpdHkuaGVpZ2h0IC8gMiAtIDIsXG4gICAgICAgIFx0d2lkdGg6IHRoaXMuZW50aXR5LndpZHRoLFxuICAgICAgICBcdGhlaWdodDogdGhpcy5lbnRpdHkuaGVpZ2h0XG4gICAgICAgIH07XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBQbGF5ZXI7XG4iLCJ2YXIgRW50aXR5ID0gcmVxdWlyZSgnLi4vZW5naW5lL2VudGl0eScpO1xudmFyIHV0aWxzID0gcmVxdWlyZSgnLi4vZW5naW5lL3V0aWxzJyk7XG52YXIgcmFuZG9tID0gcmVxdWlyZSgncmFuZG9tLWV4dCcpO1xudmFyIGJveENvbGxpZGUgPSByZXF1aXJlKCdib3gtY29sbGlkZScpO1xuXG5jbGFzcyBSb2NrIGV4dGVuZHMgRW50aXR5IHtcblx0Y29uc3RydWN0b3IgKGdhbWUpIHtcblx0XHRzdXBlciguLi5hcmd1bWVudHMpO1xuXHRcdHRoaXMuc3BlZWQgPSAyO1xuXHRcdHRoaXMuYm91bmRpbmdUeXBlID0gJ2NpcmNsZSc7XG5cdFx0dmFyIHJhZGl1cyA9IHJhbmRvbS5pbnRlZ2VyKDQwLCAxNSk7XG5cdFx0dmFyIGVudGl0eSA9IHRoaXMuZW50aXR5ID0gbmV3IGdhbWUuUElYSS5HcmFwaGljcygpO1xuXHRcdGVudGl0eS5iZWdpbkZpbGwoMHg3ZjhiOGYpO1xuICAgICAgICBlbnRpdHkuZHJhd0NpcmNsZShyYWRpdXMsIHJhZGl1cywgcmFkaXVzKTtcbiAgICAgICAgZW50aXR5LmVuZEZpbGwoKTtcbiAgICAgICAgZW50aXR5LnggPSBnYW1lLnJlbmRlcmVyLndpZHRoO1xuICAgICAgICBlbnRpdHkueSA9IHJhbmRvbS5pbnRlZ2VyKGdhbWUucmVuZGVyZXIuaGVpZ2h0IC0gZW50aXR5LmhlaWdodCwgZW50aXR5LmhlaWdodCk7XG5cdH1cblx0dXBkYXRlICgpIHtcblx0XHRpZiAoIWJveENvbGxpZGUodGhpcy5lbnRpdHksIHRoaXMuZ2FtZS53b3JsZEJvdW5kcykpIHtcblx0XHRcdHRoaXMucmVtb3ZlRnJvbVNjZW5lKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblx0XHR0aGlzLmVudGl0eS54IC09IHRoaXMuc3BlZWQ7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBSb2NrOyIsInZhciBHYW1lID0gcmVxdWlyZSgnLi9lbmdpbmUvZ2FtZScpO1xuXG4vLyBuZXcgZ2FtZVxudmFyIGdhbWUgPSBuZXcgR2FtZSh7fSk7XG5cbi8vIHNjZW5lc1xudmFyIHN0YXJ0ID0gcmVxdWlyZSgnLi9zY2VuZXMvc3RhcnQnKShnYW1lKTtcbnZhciBiYWNrZ3JvdW5kID0gcmVxdWlyZSgnLi9zY2VuZXMvYmFja2dyb3VuZCcpKGdhbWUpO1xudmFyIHBsYXkgPSByZXF1aXJlKCcuL3NjZW5lcy9wbGF5JykoZ2FtZSk7XG52YXIgd2luID0gcmVxdWlyZSgnLi9zY2VuZXMvd2luJykoZ2FtZSk7XG5cbnN0YXJ0Lm9uKCdpbmFjdGl2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICBwbGF5LmFjdGl2ZSA9IHRydWU7XG4gICAgYmFja2dyb3VuZC5hY3RpdmUgPSB0cnVlO1xufSk7XG5wbGF5Lm9uKCd3aW4nLCBmdW5jdGlvbigpIHtcblx0cGxheS5hY3RpdmUgPSBmYWxzZTtcblx0YmFja2dyb3VuZC5hY3RpdmUgPSBmYWxzZTtcblx0d2luLmFjdGl2ZSA9IHRydWU7XG59KTtcbndpbi5vbignaW5hY3RpdmUnLCBmdW5jdGlvbigpe1xuXHRwbGF5LmFjdGl2ZSA9IHRydWU7XG4gICAgYmFja2dyb3VuZC5hY3RpdmUgPSB0cnVlO1xufSk7XG5nYW1lLmRlYnVnID0gdHJ1ZTtcbmdhbWUuYm9vdCgpO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAocmEsIHJiKSB7XG4gICAgdmFyIGEgPSBub3JtKHJhKSwgYiA9IG5vcm0ocmIpO1xuICAgIHZhciBpbnggPSBpc2VjdChhLmxlZnQsIGIubGVmdCwgYi5yaWdodClcbiAgICAgICAgfHwgaXNlY3QoYS5yaWdodCwgYi5sZWZ0LCBiLnJpZ2h0KVxuICAgICAgICB8fCBpbnNpZGUoYS5sZWZ0LCBhLnJpZ2h0LCBiLmxlZnQsIGIucmlnaHQpXG4gICAgICAgIHx8IGluc2lkZShiLmxlZnQsIGIucmlnaHQsIGEubGVmdCwgYS5yaWdodClcbiAgICA7XG4gICAgdmFyIGlueSA9IGlzZWN0KGEudG9wLCBiLnRvcCwgYi5ib3R0b20pXG4gICAgICAgIHx8IGlzZWN0KGEuYm90dG9tLCBiLnRvcCwgYi5ib3R0b20pXG4gICAgICAgIHx8IGluc2lkZShhLnRvcCwgYS5ib3R0b20sIGIudG9wLCBiLmJvdHRvbSlcbiAgICAgICAgfHwgaW5zaWRlKGIudG9wLCBiLmJvdHRvbSwgYS50b3AsIGEuYm90dG9tKVxuICAgIDtcbiAgICByZXR1cm4gaW54ICYmIGlueTtcbn07XG5cbmZ1bmN0aW9uIGlzZWN0ICh4LCBsb3dlciwgdXBwZXIpIHtcbiAgICByZXR1cm4geCA+PSBsb3dlciAmJiB4IDw9IHVwcGVyO1xufVxuXG5mdW5jdGlvbiBpbnNpZGUgKGEwLCBhMSwgYjAsIGIxKSB7XG4gICAgcmV0dXJuIGEwID49IGIwICYmIGExIDw9IGIxO1xufVxuXG5mdW5jdGlvbiBub3JtIChxKSB7XG4gICAgdmFyIHAgPSB7XG4gICAgICAgIGxlZnQ6IHEubGVmdCxcbiAgICAgICAgcmlnaHQ6IHEucmlnaHQsXG4gICAgICAgIHRvcDogcS50b3AsXG4gICAgICAgIGJvdHRvbTogcS5ib3R0b21cbiAgICB9O1xuICAgIGlmIChwLmxlZnQgPT09IHVuZGVmaW5lZCAmJiBxLnggIT09IHVuZGVmaW5lZCkgcC5sZWZ0ID0gcS54O1xuICAgIGlmIChwLnRvcCA9PT0gdW5kZWZpbmVkICYmIHEueSAhPT0gdW5kZWZpbmVkKSBwLnRvcCA9IHEueTtcbiAgICBcbiAgICB2YXIgdyA9IHEud2lkdGggfHwgMCwgaCA9IHEuaGVpZ2h0IHx8IDA7XG4gICAgXG4gICAgaWYgKHAucmlnaHQgPT09IHVuZGVmaW5lZCAmJiBxLnggIT09IHVuZGVmaW5lZCkgcC5yaWdodCA9IHEueCArIHc7XG4gICAgaWYgKHAuYm90dG9tID09PSB1bmRlZmluZWQgJiYgcS55ICE9PSB1bmRlZmluZWQpIHAuYm90dG9tID0gcS55ICsgaDtcbiAgICByZXR1cm4gcDtcbn1cbiIsInZhciBzbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcbnZhciB0b0FycmF5ID0gZnVuY3Rpb24oYSl7IHJldHVybiBzbGljZS5jYWxsKGEpIH1cbnZhciB0YWlsID0gZnVuY3Rpb24oYSl7IHJldHVybiBzbGljZS5jYWxsKGEsIDEpIH1cblxuLy8gZm4sIFt2YWx1ZV0gLT4gZm5cbi8vLS0gY3JlYXRlIGEgY3VycmllZCBmdW5jdGlvbiwgaW5jb3Jwb3JhdGluZyBhbnkgbnVtYmVyIG9mXG4vLy0tIHByZS1leGlzdGluZyBhcmd1bWVudHMgKGUuZy4gaWYgeW91J3JlIGZ1cnRoZXIgY3VycnlpbmcgYSBmdW5jdGlvbikuXG52YXIgY3JlYXRlRm4gPSBmdW5jdGlvbihmbiwgYXJncywgdG90YWxBcml0eSl7XG4gICAgdmFyIHJlbWFpbmluZ0FyaXR5ID0gdG90YWxBcml0eSAtIGFyZ3MubGVuZ3RoO1xuXG4gICAgc3dpdGNoIChyZW1haW5pbmdBcml0eSkge1xuICAgICAgICBjYXNlIDA6IHJldHVybiBmdW5jdGlvbigpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24oYSl7IHJldHVybiBwcm9jZXNzSW52b2NhdGlvbihmbiwgY29uY2F0QXJncyhhcmdzLCBhcmd1bWVudHMpLCB0b3RhbEFyaXR5KSB9O1xuICAgICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbihhLGIpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24oYSxiLGMpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYSxiLGMsZCl7IHJldHVybiBwcm9jZXNzSW52b2NhdGlvbihmbiwgY29uY2F0QXJncyhhcmdzLCBhcmd1bWVudHMpLCB0b3RhbEFyaXR5KSB9O1xuICAgICAgICBjYXNlIDU6IHJldHVybiBmdW5jdGlvbihhLGIsYyxkLGUpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSA2OiByZXR1cm4gZnVuY3Rpb24oYSxiLGMsZCxlLGYpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSA3OiByZXR1cm4gZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyl7IHJldHVybiBwcm9jZXNzSW52b2NhdGlvbihmbiwgY29uY2F0QXJncyhhcmdzLCBhcmd1bWVudHMpLCB0b3RhbEFyaXR5KSB9O1xuICAgICAgICBjYXNlIDg6IHJldHVybiBmdW5jdGlvbihhLGIsYyxkLGUsZixnLGgpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSA5OiByZXR1cm4gZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoLGkpeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgY2FzZSAxMDogcmV0dXJuIGZ1bmN0aW9uKGEsYixjLGQsZSxmLGcsaCxpLGopeyByZXR1cm4gcHJvY2Vzc0ludm9jYXRpb24oZm4sIGNvbmNhdEFyZ3MoYXJncywgYXJndW1lbnRzKSwgdG90YWxBcml0eSkgfTtcbiAgICAgICAgZGVmYXVsdDogcmV0dXJuIGNyZWF0ZUV2YWxGbihmbiwgYXJncywgcmVtYWluaW5nQXJpdHkpO1xuICAgIH1cbn1cblxuLy8gW3ZhbHVlXSwgYXJndW1lbnRzIC0+IFt2YWx1ZV1cbi8vLS0gY29uY2F0IG5ldyBhcmd1bWVudHMgb250byBvbGQgYXJndW1lbnRzIGFycmF5XG52YXIgY29uY2F0QXJncyA9IGZ1bmN0aW9uKGFyZ3MxLCBhcmdzMil7XG4gICAgcmV0dXJuIGFyZ3MxLmNvbmNhdCh0b0FycmF5KGFyZ3MyKSk7XG59XG5cbi8vIGZuLCBbdmFsdWVdLCBpbnQgLT4gZm5cbi8vLS0gY3JlYXRlIGEgZnVuY3Rpb24gb2YgdGhlIGNvcnJlY3QgYXJpdHkgYnkgdGhlIHVzZSBvZiBldmFsLFxuLy8tLSBzbyB0aGF0IGN1cnJ5IGNhbiBoYW5kbGUgZnVuY3Rpb25zIG9mIGFueSBhcml0eVxudmFyIGNyZWF0ZUV2YWxGbiA9IGZ1bmN0aW9uKGZuLCBhcmdzLCBhcml0eSl7XG4gICAgdmFyIGFyZ0xpc3QgPSBtYWtlQXJnTGlzdChhcml0eSk7XG5cbiAgICAvLy0tIGhhY2sgZm9yIElFJ3MgZmF1bHR5IGV2YWwgcGFyc2luZyAtLSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS82ODA3NzI2XG4gICAgdmFyIGZuU3RyID0gJ2ZhbHNlfHwnICtcbiAgICAgICAgICAgICAgICAnZnVuY3Rpb24oJyArIGFyZ0xpc3QgKyAnKXsgcmV0dXJuIHByb2Nlc3NJbnZvY2F0aW9uKGZuLCBjb25jYXRBcmdzKGFyZ3MsIGFyZ3VtZW50cykpOyB9JztcbiAgICByZXR1cm4gZXZhbChmblN0cik7XG59XG5cbnZhciBtYWtlQXJnTGlzdCA9IGZ1bmN0aW9uKGxlbil7XG4gICAgdmFyIGEgPSBbXTtcbiAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMSApIGEucHVzaCgnYScgKyBpLnRvU3RyaW5nKCkpO1xuICAgIHJldHVybiBhLmpvaW4oJywnKTtcbn1cblxudmFyIHRyaW1BcnJMZW5ndGggPSBmdW5jdGlvbihhcnIsIGxlbmd0aCl7XG4gICAgaWYgKCBhcnIubGVuZ3RoID4gbGVuZ3RoICkgcmV0dXJuIGFyci5zbGljZSgwLCBsZW5ndGgpO1xuICAgIGVsc2UgcmV0dXJuIGFycjtcbn1cblxuLy8gZm4sIFt2YWx1ZV0gLT4gdmFsdWVcbi8vLS0gaGFuZGxlIGEgZnVuY3Rpb24gYmVpbmcgaW52b2tlZC5cbi8vLS0gaWYgdGhlIGFyZyBsaXN0IGlzIGxvbmcgZW5vdWdoLCB0aGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWRcbi8vLS0gb3RoZXJ3aXNlLCBhIG5ldyBjdXJyaWVkIHZlcnNpb24gaXMgY3JlYXRlZC5cbnZhciBwcm9jZXNzSW52b2NhdGlvbiA9IGZ1bmN0aW9uKGZuLCBhcmdzQXJyLCB0b3RhbEFyaXR5KXtcbiAgICBhcmdzQXJyID0gdHJpbUFyckxlbmd0aChhcmdzQXJyLCB0b3RhbEFyaXR5KTtcblxuICAgIGlmICggYXJnc0Fyci5sZW5ndGggPT09IHRvdGFsQXJpdHkgKSByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJnc0Fycik7XG4gICAgcmV0dXJuIGNyZWF0ZUZuKGZuLCBhcmdzQXJyLCB0b3RhbEFyaXR5KTtcbn1cblxuLy8gZm4gLT4gZm5cbi8vLS0gY3VycmllcyBhIGZ1bmN0aW9uISA8M1xudmFyIGN1cnJ5ID0gZnVuY3Rpb24oZm4pe1xuICAgIHJldHVybiBjcmVhdGVGbihmbiwgW10sIGZuLmxlbmd0aCk7XG59XG5cbi8vIG51bSwgZm4gLT4gZm5cbi8vLS0gY3VycmllcyBhIGZ1bmN0aW9uIHRvIGEgY2VydGFpbiBhcml0eSEgPDMzXG5jdXJyeS50byA9IGN1cnJ5KGZ1bmN0aW9uKGFyaXR5LCBmbil7XG4gICAgcmV0dXJuIGNyZWF0ZUZuKGZuLCBbXSwgYXJpdHkpO1xufSk7XG5cbi8vIG51bSwgZm4gLT4gZm5cbi8vLS0gYWRhcHRzIGEgZnVuY3Rpb24gaW4gdGhlIGNvbnRleHQtZmlyc3Qgc3R5bGVcbi8vLS0gdG8gYSBjdXJyaWVkIHZlcnNpb24uIDwzMzMzXG5jdXJyeS5hZGFwdFRvID0gY3VycnkoZnVuY3Rpb24obnVtLCBmbil7XG4gICAgcmV0dXJuIGN1cnJ5LnRvKG51bSwgZnVuY3Rpb24oY29udGV4dCl7XG4gICAgICAgIHZhciBhcmdzID0gdGFpbChhcmd1bWVudHMpLmNvbmNhdChjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH0pO1xufSlcblxuLy8gZm4gLT4gZm5cbi8vLS0gYWRhcHRzIGEgZnVuY3Rpb24gaW4gdGhlIGNvbnRleHQtZmlyc3Qgc3R5bGUgdG9cbi8vLS0gYSBjdXJyaWVkIHZlcnNpb24uIDwzMzNcbmN1cnJ5LmFkYXB0ID0gZnVuY3Rpb24oZm4pe1xuICAgIHJldHVybiBjdXJyeS5hZGFwdFRvKGZuLmxlbmd0aCwgZm4pXG59XG5cblxubW9kdWxlLmV4cG9ydHMgPSBjdXJyeTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBSZXByZXNlbnRhdGlvbiBvZiBhIHNpbmdsZSBFdmVudEVtaXR0ZXIgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQuXG4gKiBAcGFyYW0ge01peGVkfSBjb250ZXh0IENvbnRleHQgZm9yIGZ1bmN0aW9uIGV4ZWN1dGlvbi5cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gb25jZSBPbmx5IGVtaXQgb25jZVxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIEVFKGZuLCBjb250ZXh0LCBvbmNlKSB7XG4gIHRoaXMuZm4gPSBmbjtcbiAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgdGhpcy5vbmNlID0gb25jZSB8fCBmYWxzZTtcbn1cblxuLyoqXG4gKiBNaW5pbWFsIEV2ZW50RW1pdHRlciBpbnRlcmZhY2UgdGhhdCBpcyBtb2xkZWQgYWdhaW5zdCB0aGUgTm9kZS5qc1xuICogRXZlbnRFbWl0dGVyIGludGVyZmFjZS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBhcGkgcHVibGljXG4gKi9cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHsgLyogTm90aGluZyB0byBzZXQgKi8gfVxuXG4vKipcbiAqIEhvbGRzIHRoZSBhc3NpZ25lZCBFdmVudEVtaXR0ZXJzIGJ5IG5hbWUuXG4gKlxuICogQHR5cGUge09iamVjdH1cbiAqIEBwcml2YXRlXG4gKi9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcblxuLyoqXG4gKiBSZXR1cm4gYSBsaXN0IG9mIGFzc2lnbmVkIGV2ZW50IGxpc3RlbmVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgVGhlIGV2ZW50cyB0aGF0IHNob3VsZCBiZSBsaXN0ZWQuXG4gKiBAcmV0dXJucyB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uIGxpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW2V2ZW50XSkgcmV0dXJuIFtdO1xuICBpZiAodGhpcy5fZXZlbnRzW2V2ZW50XS5mbikgcmV0dXJuIFt0aGlzLl9ldmVudHNbZXZlbnRdLmZuXTtcblxuICBmb3IgKHZhciBpID0gMCwgbCA9IHRoaXMuX2V2ZW50c1tldmVudF0ubGVuZ3RoLCBlZSA9IG5ldyBBcnJheShsKTsgaSA8IGw7IGkrKykge1xuICAgIGVlW2ldID0gdGhpcy5fZXZlbnRzW2V2ZW50XVtpXS5mbjtcbiAgfVxuXG4gIHJldHVybiBlZTtcbn07XG5cbi8qKlxuICogRW1pdCBhbiBldmVudCB0byBhbGwgcmVnaXN0ZXJlZCBldmVudCBsaXN0ZW5lcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50IFRoZSBuYW1lIG9mIHRoZSBldmVudC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBJbmRpY2F0aW9uIGlmIHdlJ3ZlIGVtaXR0ZWQgYW4gZXZlbnQuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KGV2ZW50LCBhMSwgYTIsIGEzLCBhNCwgYTUpIHtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1tldmVudF0pIHJldHVybiBmYWxzZTtcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgbGVuID0gYXJndW1lbnRzLmxlbmd0aFxuICAgICwgYXJnc1xuICAgICwgaTtcblxuICBpZiAoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGxpc3RlbmVycy5mbikge1xuICAgIGlmIChsaXN0ZW5lcnMub25jZSkgdGhpcy5yZW1vdmVMaXN0ZW5lcihldmVudCwgbGlzdGVuZXJzLmZuLCB0cnVlKTtcblxuICAgIHN3aXRjaCAobGVuKSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCksIHRydWU7XG4gICAgICBjYXNlIDI6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEpLCB0cnVlO1xuICAgICAgY2FzZSAzOiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiksIHRydWU7XG4gICAgICBjYXNlIDQ6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMyksIHRydWU7XG4gICAgICBjYXNlIDU6IHJldHVybiBsaXN0ZW5lcnMuZm4uY2FsbChsaXN0ZW5lcnMuY29udGV4dCwgYTEsIGEyLCBhMywgYTQpLCB0cnVlO1xuICAgICAgY2FzZSA2OiByZXR1cm4gbGlzdGVuZXJzLmZuLmNhbGwobGlzdGVuZXJzLmNvbnRleHQsIGExLCBhMiwgYTMsIGE0LCBhNSksIHRydWU7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgIH1cblxuICAgIGxpc3RlbmVycy5mbi5hcHBseShsaXN0ZW5lcnMuY29udGV4dCwgYXJncyk7XG4gIH0gZWxzZSB7XG4gICAgdmFyIGxlbmd0aCA9IGxpc3RlbmVycy5sZW5ndGhcbiAgICAgICwgajtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGxpc3RlbmVyc1tpXS5vbmNlKSB0aGlzLnJlbW92ZUxpc3RlbmVyKGV2ZW50LCBsaXN0ZW5lcnNbaV0uZm4sIHRydWUpO1xuXG4gICAgICBzd2l0Y2ggKGxlbikge1xuICAgICAgICBjYXNlIDE6IGxpc3RlbmVyc1tpXS5mbi5jYWxsKGxpc3RlbmVyc1tpXS5jb250ZXh0KTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMjogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExKTsgYnJlYWs7XG4gICAgICAgIGNhc2UgMzogbGlzdGVuZXJzW2ldLmZuLmNhbGwobGlzdGVuZXJzW2ldLmNvbnRleHQsIGExLCBhMik7IGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGlmICghYXJncykgZm9yIChqID0gMSwgYXJncyA9IG5ldyBBcnJheShsZW4gLTEpOyBqIDwgbGVuOyBqKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaiAtIDFdID0gYXJndW1lbnRzW2pdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGxpc3RlbmVyc1tpXS5mbi5hcHBseShsaXN0ZW5lcnNbaV0uY29udGV4dCwgYXJncyk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgbmV3IEV2ZW50TGlzdGVuZXIgZm9yIHRoZSBnaXZlbiBldmVudC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgTmFtZSBvZiB0aGUgZXZlbnQuXG4gKiBAcGFyYW0ge0Z1bmN0b259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gZnVuY3Rpb24gb24oZXZlbnQsIGZuLCBjb250ZXh0KSB7XG4gIHZhciBsaXN0ZW5lciA9IG5ldyBFRShmbiwgY29udGV4dCB8fCB0aGlzKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gIGlmICghdGhpcy5fZXZlbnRzW2V2ZW50XSkgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IGxpc3RlbmVyO1xuICBlbHNlIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0uZm4pIHRoaXMuX2V2ZW50c1tldmVudF0ucHVzaChsaXN0ZW5lcik7XG4gICAgZWxzZSB0aGlzLl9ldmVudHNbZXZlbnRdID0gW1xuICAgICAgdGhpcy5fZXZlbnRzW2V2ZW50XSwgbGlzdGVuZXJcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vKipcbiAqIEFkZCBhbiBFdmVudExpc3RlbmVyIHRoYXQncyBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBOYW1lIG9mIHRoZSBldmVudC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuIENhbGxiYWNrIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtNaXhlZH0gY29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgZnVuY3Rpb24uXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbiBvbmNlKGV2ZW50LCBmbiwgY29udGV4dCkge1xuICB2YXIgbGlzdGVuZXIgPSBuZXcgRUUoZm4sIGNvbnRleHQgfHwgdGhpcywgdHJ1ZSk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpIHRoaXMuX2V2ZW50cyA9IHt9O1xuICBpZiAoIXRoaXMuX2V2ZW50c1tldmVudF0pIHRoaXMuX2V2ZW50c1tldmVudF0gPSBsaXN0ZW5lcjtcbiAgZWxzZSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbZXZlbnRdLmZuKSB0aGlzLl9ldmVudHNbZXZlbnRdLnB1c2gobGlzdGVuZXIpO1xuICAgIGVsc2UgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IFtcbiAgICAgIHRoaXMuX2V2ZW50c1tldmVudF0sIGxpc3RlbmVyXG4gICAgXTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLyoqXG4gKiBSZW1vdmUgZXZlbnQgbGlzdGVuZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2Ugd2FudCB0byByZW1vdmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBUaGUgbGlzdGVuZXIgdGhhdCB3ZSBuZWVkIHRvIGZpbmQuXG4gKiBAcGFyYW0ge0Jvb2xlYW59IG9uY2UgT25seSByZW1vdmUgb25jZSBsaXN0ZW5lcnMuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIoZXZlbnQsIGZuLCBvbmNlKSB7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbZXZlbnRdKSByZXR1cm4gdGhpcztcblxuICB2YXIgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICwgZXZlbnRzID0gW107XG5cbiAgaWYgKGZuKSB7XG4gICAgaWYgKGxpc3RlbmVycy5mbiAmJiAobGlzdGVuZXJzLmZuICE9PSBmbiB8fCAob25jZSAmJiAhbGlzdGVuZXJzLm9uY2UpKSkge1xuICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzKTtcbiAgICB9XG4gICAgaWYgKCFsaXN0ZW5lcnMuZm4pIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBsaXN0ZW5lcnMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChsaXN0ZW5lcnNbaV0uZm4gIT09IGZuIHx8IChvbmNlICYmICFsaXN0ZW5lcnNbaV0ub25jZSkpIHtcbiAgICAgICAgZXZlbnRzLnB1c2gobGlzdGVuZXJzW2ldKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvL1xuICAvLyBSZXNldCB0aGUgYXJyYXksIG9yIHJlbW92ZSBpdCBjb21wbGV0ZWx5IGlmIHdlIGhhdmUgbm8gbW9yZSBsaXN0ZW5lcnMuXG4gIC8vXG4gIGlmIChldmVudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IGV2ZW50cy5sZW5ndGggPT09IDEgPyBldmVudHNbMF0gOiBldmVudHM7XG4gIH0gZWxzZSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1tldmVudF07XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8qKlxuICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb3Igb25seSB0aGUgbGlzdGVuZXJzIGZvciB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBUaGUgZXZlbnQgd2FudCB0byByZW1vdmUgYWxsIGxpc3RlbmVycyBmb3IuXG4gKiBAYXBpIHB1YmxpY1xuICovXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uIHJlbW92ZUFsbExpc3RlbmVycyhldmVudCkge1xuICBpZiAoIXRoaXMuX2V2ZW50cykgcmV0dXJuIHRoaXM7XG5cbiAgaWYgKGV2ZW50KSBkZWxldGUgdGhpcy5fZXZlbnRzW2V2ZW50XTtcbiAgZWxzZSB0aGlzLl9ldmVudHMgPSB7fTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vXG4vLyBBbGlhcyBtZXRob2RzIG5hbWVzIGJlY2F1c2UgcGVvcGxlIHJvbGwgbGlrZSB0aGF0LlxuLy9cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub2ZmID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lcjtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uO1xuXG4vL1xuLy8gVGhpcyBmdW5jdGlvbiBkb2Vzbid0IGFwcGx5IGFueW1vcmUuXG4vL1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbiBzZXRNYXhMaXN0ZW5lcnMoKSB7XG4gIHJldHVybiB0aGlzO1xufTtcblxuLy9cbi8vIEV4cG9zZSB0aGUgbW9kdWxlLlxuLy9cbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyMiA9IEV2ZW50RW1pdHRlcjtcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIzID0gRXZlbnRFbWl0dGVyO1xuXG4vL1xuLy8gRXhwb3NlIHRoZSBtb2R1bGUuXG4vL1xubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG4iLCIvKiFcbiAqICBob3dsZXIuanMgdjEuMS4yNVxuICogIGhvd2xlcmpzLmNvbVxuICpcbiAqICAoYykgMjAxMy0yMDE0LCBKYW1lcyBTaW1wc29uIG9mIEdvbGRGaXJlIFN0dWRpb3NcbiAqICBnb2xkZmlyZXN0dWRpb3MuY29tXG4gKlxuICogIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuICAvLyBzZXR1cFxuICB2YXIgY2FjaGUgPSB7fTtcblxuICAvLyBzZXR1cCB0aGUgYXVkaW8gY29udGV4dFxuICB2YXIgY3R4ID0gbnVsbCxcbiAgICB1c2luZ1dlYkF1ZGlvID0gdHJ1ZSxcbiAgICBub0F1ZGlvID0gZmFsc2U7XG4gIHRyeSB7XG4gICAgaWYgKHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBjdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygd2Via2l0QXVkaW9Db250ZXh0ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgY3R4ID0gbmV3IHdlYmtpdEF1ZGlvQ29udGV4dCgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB1c2luZ1dlYkF1ZGlvID0gZmFsc2U7XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICB1c2luZ1dlYkF1ZGlvID0gZmFsc2U7XG4gIH1cblxuICBpZiAoIXVzaW5nV2ViQXVkaW8pIHtcbiAgICBpZiAodHlwZW9mIEF1ZGlvICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbmV3IEF1ZGlvKCk7XG4gICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgbm9BdWRpbyA9IHRydWU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG5vQXVkaW8gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIC8vIGNyZWF0ZSBhIG1hc3RlciBnYWluIG5vZGVcbiAgaWYgKHVzaW5nV2ViQXVkaW8pIHtcbiAgICB2YXIgbWFzdGVyR2FpbiA9ICh0eXBlb2YgY3R4LmNyZWF0ZUdhaW4gPT09ICd1bmRlZmluZWQnKSA/IGN0eC5jcmVhdGVHYWluTm9kZSgpIDogY3R4LmNyZWF0ZUdhaW4oKTtcbiAgICBtYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAxO1xuICAgIG1hc3RlckdhaW4uY29ubmVjdChjdHguZGVzdGluYXRpb24pO1xuICB9XG5cbiAgLy8gY3JlYXRlIGdsb2JhbCBjb250cm9sbGVyXG4gIHZhciBIb3dsZXJHbG9iYWwgPSBmdW5jdGlvbihjb2RlY3MpIHtcbiAgICB0aGlzLl92b2x1bWUgPSAxO1xuICAgIHRoaXMuX211dGVkID0gZmFsc2U7XG4gICAgdGhpcy51c2luZ1dlYkF1ZGlvID0gdXNpbmdXZWJBdWRpbztcbiAgICB0aGlzLmN0eCA9IGN0eDtcbiAgICB0aGlzLm5vQXVkaW8gPSBub0F1ZGlvO1xuICAgIHRoaXMuX2hvd2xzID0gW107XG4gICAgdGhpcy5fY29kZWNzID0gY29kZWNzO1xuICAgIHRoaXMuaU9TQXV0b0VuYWJsZSA9IHRydWU7XG4gIH07XG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgZ2xvYmFsIHZvbHVtZSBmb3IgYWxsIHNvdW5kcy5cbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gdm9sIFZvbHVtZSBmcm9tIDAuMCB0byAxLjAuXG4gICAgICogQHJldHVybiB7SG93bGVyL0Zsb2F0fSAgICAgUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgdm9sdW1lLlxuICAgICAqL1xuICAgIHZvbHVtZTogZnVuY3Rpb24odm9sKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB2b2x1bWUgaXMgYSBudW1iZXJcbiAgICAgIHZvbCA9IHBhcnNlRmxvYXQodm9sKTtcblxuICAgICAgaWYgKHZvbCA+PSAwICYmIHZvbCA8PSAxKSB7XG4gICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcblxuICAgICAgICBpZiAodXNpbmdXZWJBdWRpbykge1xuICAgICAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IHZvbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGxvb3AgdGhyb3VnaCBjYWNoZSBhbmQgY2hhbmdlIHZvbHVtZSBvZiBhbGwgbm9kZXMgdGhhdCBhcmUgdXNpbmcgSFRNTDUgQXVkaW9cbiAgICAgICAgZm9yICh2YXIga2V5IGluIHNlbGYuX2hvd2xzKSB7XG4gICAgICAgICAgaWYgKHNlbGYuX2hvd2xzLmhhc093blByb3BlcnR5KGtleSkgJiYgc2VsZi5faG93bHNba2V5XS5fd2ViQXVkaW8gPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAvLyBsb29wIHRocm91Z2ggdGhlIGF1ZGlvIG5vZGVzXG4gICAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5faG93bHNba2V5XS5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2hvd2xzW2tleV0uX2F1ZGlvTm9kZVtpXS52b2x1bWUgPSBzZWxmLl9ob3dsc1trZXldLl92b2x1bWUgKiBzZWxmLl92b2x1bWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIHJldHVybiB0aGUgY3VycmVudCBnbG9iYWwgdm9sdW1lXG4gICAgICByZXR1cm4gKHVzaW5nV2ViQXVkaW8pID8gbWFzdGVyR2Fpbi5nYWluLnZhbHVlIDogc2VsZi5fdm9sdW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNdXRlIGFsbCBzb3VuZHMuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIG11dGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdGhpcy5fc2V0TXV0ZWQodHJ1ZSk7XG5cbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbm11dGUgYWxsIHNvdW5kcy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgdW5tdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuX3NldE11dGVkKGZhbHNlKTtcblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBtdXRpbmcgYW5kIHVubXV0aW5nIGdsb2JhbGx5LlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IG11dGVkIElzIG11dGVkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBfc2V0TXV0ZWQ6IGZ1bmN0aW9uKG11dGVkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYuX211dGVkID0gbXV0ZWQ7XG5cbiAgICAgIGlmICh1c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIG1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IG11dGVkID8gMCA6IHNlbGYuX3ZvbHVtZTtcbiAgICAgIH1cblxuICAgICAgZm9yICh2YXIga2V5IGluIHNlbGYuX2hvd2xzKSB7XG4gICAgICAgIGlmIChzZWxmLl9ob3dscy5oYXNPd25Qcm9wZXJ0eShrZXkpICYmIHNlbGYuX2hvd2xzW2tleV0uX3dlYkF1ZGlvID09PSBmYWxzZSkge1xuICAgICAgICAgIC8vIGxvb3AgdGhyb3VnaCB0aGUgYXVkaW8gbm9kZXNcbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5faG93bHNba2V5XS5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzZWxmLl9ob3dsc1trZXldLl9hdWRpb05vZGVbaV0ubXV0ZWQgPSBtdXRlZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGNvZGVjIHN1cHBvcnQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBleHQgQXVkaW8gZmlsZSBleHRlbnRpb24uXG4gICAgICogQHJldHVybiB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBjb2RlY3M6IGZ1bmN0aW9uKGV4dCkge1xuICAgICAgcmV0dXJuIHRoaXMuX2NvZGVjc1tleHRdO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBpT1Mgd2lsbCBvbmx5IGFsbG93IGF1ZGlvIHRvIGJlIHBsYXllZCBhZnRlciBhIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAgICogQXR0ZW1wdCB0byBhdXRvbWF0aWNhbGx5IHVubG9jayBhdWRpbyBvbiB0aGUgZmlyc3QgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBDb25jZXB0IGZyb206IGh0dHA6Ly9wYXVsYmFrYXVzLmNvbS90dXRvcmlhbHMvaHRtbDUvd2ViLWF1ZGlvLW9uLWlvcy9cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgX2VuYWJsZWlPU0F1ZGlvOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gb25seSBydW4gdGhpcyBvbiBpT1MgaWYgYXVkaW8gaXNuJ3QgYWxyZWFkeSBlYW5ibGVkXG4gICAgICBpZiAoY3R4ICYmIChzZWxmLl9pT1NFbmFibGVkIHx8ICEvaVBob25lfGlQYWR8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5faU9TRW5hYmxlZCA9IGZhbHNlO1xuXG4gICAgICAvLyBjYWxsIHRoaXMgbWV0aG9kIG9uIHRvdWNoIHN0YXJ0IHRvIGNyZWF0ZSBhbmQgcGxheSBhIGJ1ZmZlcixcbiAgICAgIC8vIHRoZW4gY2hlY2sgaWYgdGhlIGF1ZGlvIGFjdHVhbGx5IHBsYXllZCB0byBkZXRlcm1pbmUgaWZcbiAgICAgIC8vIGF1ZGlvIGhhcyBub3cgYmVlbiB1bmxvY2tlZCBvbiBpT1NcbiAgICAgIHZhciB1bmxvY2sgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gY3JlYXRlIGFuIGVtcHR5IGJ1ZmZlclxuICAgICAgICB2YXIgYnVmZmVyID0gY3R4LmNyZWF0ZUJ1ZmZlcigxLCAxLCAyMjA1MCk7XG4gICAgICAgIHZhciBzb3VyY2UgPSBjdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSBidWZmZXI7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KGN0eC5kZXN0aW5hdGlvbik7XG5cbiAgICAgICAgLy8gcGxheSB0aGUgZW1wdHkgYnVmZmVyXG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNvdXJjZS5ub3RlT24oMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc291cmNlLnN0YXJ0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2V0dXAgYSB0aW1lb3V0IHRvIGNoZWNrIHRoYXQgd2UgYXJlIHVubG9ja2VkIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3BcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICBpZiAoKHNvdXJjZS5wbGF5YmFja1N0YXRlID09PSBzb3VyY2UuUExBWUlOR19TVEFURSB8fCBzb3VyY2UucGxheWJhY2tTdGF0ZSA9PT0gc291cmNlLkZJTklTSEVEX1NUQVRFKSkge1xuICAgICAgICAgICAgLy8gdXBkYXRlIHRoZSB1bmxvY2tlZCBzdGF0ZSBhbmQgcHJldmVudCB0aGlzIGNoZWNrIGZyb20gaGFwcGVuaW5nIGFnYWluXG4gICAgICAgICAgICBzZWxmLl9pT1NFbmFibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHNlbGYuaU9TQXV0b0VuYWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyByZW1vdmUgdGhlIHRvdWNoIHN0YXJ0IGxpc3RlbmVyXG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHVubG9jaywgZmFsc2UpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMCk7XG4gICAgICB9O1xuXG4gICAgICAvLyBzZXR1cCBhIHRvdWNoIHN0YXJ0IGxpc3RlbmVyIHRvIGF0dGVtcHQgYW4gdW5sb2NrIGluXG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hzdGFydCcsIHVubG9jaywgZmFsc2UpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gIH07XG5cbiAgLy8gY2hlY2sgZm9yIGJyb3dzZXIgY29kZWMgc3VwcG9ydFxuICB2YXIgYXVkaW9UZXN0ID0gbnVsbDtcbiAgdmFyIGNvZGVjcyA9IHt9O1xuICBpZiAoIW5vQXVkaW8pIHtcbiAgICBhdWRpb1Rlc3QgPSBuZXcgQXVkaW8oKTtcbiAgICBjb2RlY3MgPSB7XG4gICAgICBtcDM6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcGVnOycpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICBvcHVzOiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vb2dnOyBjb2RlY3M9XCJvcHVzXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgb2dnOiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vb2dnOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICB3YXY6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93YXY7IGNvZGVjcz1cIjFcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICBhYWM6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIG00YTogISEoYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LW00YTsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL200YTsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIG1wNDogISEoYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LW1wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL21wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgIHdlYmE6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93ZWJtOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJylcbiAgICB9O1xuICB9XG5cbiAgLy8gYWxsb3cgYWNjZXNzIHRvIHRoZSBnbG9iYWwgYXVkaW8gY29udHJvbHNcbiAgdmFyIEhvd2xlciA9IG5ldyBIb3dsZXJHbG9iYWwoY29kZWNzKTtcblxuICAvLyBzZXR1cCB0aGUgYXVkaW8gb2JqZWN0XG4gIHZhciBIb3dsID0gZnVuY3Rpb24obykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIHNldHVwIHRoZSBkZWZhdWx0c1xuICAgIHNlbGYuX2F1dG9wbGF5ID0gby5hdXRvcGxheSB8fCBmYWxzZTtcbiAgICBzZWxmLl9idWZmZXIgPSBvLmJ1ZmZlciB8fCBmYWxzZTtcbiAgICBzZWxmLl9kdXJhdGlvbiA9IG8uZHVyYXRpb24gfHwgMDtcbiAgICBzZWxmLl9mb3JtYXQgPSBvLmZvcm1hdCB8fCBudWxsO1xuICAgIHNlbGYuX2xvb3AgPSBvLmxvb3AgfHwgZmFsc2U7XG4gICAgc2VsZi5fbG9hZGVkID0gZmFsc2U7XG4gICAgc2VsZi5fc3ByaXRlID0gby5zcHJpdGUgfHwge307XG4gICAgc2VsZi5fc3JjID0gby5zcmMgfHwgJyc7XG4gICAgc2VsZi5fcG9zM2QgPSBvLnBvczNkIHx8IFswLCAwLCAtMC41XTtcbiAgICBzZWxmLl92b2x1bWUgPSBvLnZvbHVtZSAhPT0gdW5kZWZpbmVkID8gby52b2x1bWUgOiAxO1xuICAgIHNlbGYuX3VybHMgPSBvLnVybHMgfHwgW107XG4gICAgc2VsZi5fcmF0ZSA9IG8ucmF0ZSB8fCAxO1xuXG4gICAgLy8gYWxsb3cgZm9yY2luZyBvZiBhIHNwZWNpZmljIHBhbm5pbmdNb2RlbCAoJ2VxdWFscG93ZXInIG9yICdIUlRGJyksXG4gICAgLy8gaWYgbm9uZSBpcyBzcGVjaWZpZWQsIGRlZmF1bHRzIHRvICdlcXVhbHBvd2VyJyBhbmQgc3dpdGNoZXMgdG8gJ0hSVEYnXG4gICAgLy8gaWYgM2Qgc291bmQgaXMgdXNlZFxuICAgIHNlbGYuX21vZGVsID0gby5tb2RlbCB8fCBudWxsO1xuXG4gICAgLy8gc2V0dXAgZXZlbnQgZnVuY3Rpb25zXG4gICAgc2VsZi5fb25sb2FkID0gW28ub25sb2FkIHx8IGZ1bmN0aW9uKCkge31dO1xuICAgIHNlbGYuX29ubG9hZGVycm9yID0gW28ub25sb2FkZXJyb3IgfHwgZnVuY3Rpb24oKSB7fV07XG4gICAgc2VsZi5fb25lbmQgPSBbby5vbmVuZCB8fCBmdW5jdGlvbigpIHt9XTtcbiAgICBzZWxmLl9vbnBhdXNlID0gW28ub25wYXVzZSB8fCBmdW5jdGlvbigpIHt9XTtcbiAgICBzZWxmLl9vbnBsYXkgPSBbby5vbnBsYXkgfHwgZnVuY3Rpb24oKSB7fV07XG5cbiAgICBzZWxmLl9vbmVuZFRpbWVyID0gW107XG5cbiAgICAvLyBXZWIgQXVkaW8gb3IgSFRNTDUgQXVkaW8/XG4gICAgc2VsZi5fd2ViQXVkaW8gPSB1c2luZ1dlYkF1ZGlvICYmICFzZWxmLl9idWZmZXI7XG5cbiAgICAvLyBjaGVjayBpZiB3ZSBuZWVkIHRvIGZhbGwgYmFjayB0byBIVE1MNSBBdWRpb1xuICAgIHNlbGYuX2F1ZGlvTm9kZSA9IFtdO1xuICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgc2VsZi5fc2V0dXBBdWRpb05vZGUoKTtcbiAgICB9XG5cbiAgICAvLyBhdXRvbWF0aWNhbGx5IHRyeSB0byBlbmFibGUgYXVkaW8gb24gaU9TXG4gICAgaWYgKHR5cGVvZiBjdHggIT09ICd1bmRlZmluZWQnICYmIGN0eCAmJiBIb3dsZXIuaU9TQXV0b0VuYWJsZSkge1xuICAgICAgSG93bGVyLl9lbmFibGVpT1NBdWRpbygpO1xuICAgIH1cblxuICAgIC8vIGFkZCB0aGlzIHRvIGFuIGFycmF5IG9mIEhvd2wncyB0byBhbGxvdyBnbG9iYWwgY29udHJvbFxuICAgIEhvd2xlci5faG93bHMucHVzaChzZWxmKTtcblxuICAgIC8vIGxvYWQgdGhlIHRyYWNrXG4gICAgc2VsZi5sb2FkKCk7XG4gIH07XG5cbiAgLy8gc2V0dXAgYWxsIG9mIHRoZSBtZXRob2RzXG4gIEhvd2wucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIExvYWQgYW4gYXVkaW8gZmlsZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICB1cmwgPSBudWxsO1xuXG4gICAgICAvLyBpZiBubyBhdWRpbyBpcyBhdmFpbGFibGUsIHF1aXQgaW1tZWRpYXRlbHlcbiAgICAgIGlmIChub0F1ZGlvKSB7XG4gICAgICAgIHNlbGYub24oJ2xvYWRlcnJvcicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGxvb3AgdGhyb3VnaCBzb3VyY2UgVVJMcyBhbmQgcGljayB0aGUgZmlyc3Qgb25lIHRoYXQgaXMgY29tcGF0aWJsZVxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3VybHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGV4dCwgdXJsSXRlbTtcblxuICAgICAgICBpZiAoc2VsZi5fZm9ybWF0KSB7XG4gICAgICAgICAgLy8gdXNlIHNwZWNpZmllZCBhdWRpbyBmb3JtYXQgaWYgYXZhaWxhYmxlXG4gICAgICAgICAgZXh0ID0gc2VsZi5fZm9ybWF0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGZpZ3VyZSBvdXQgdGhlIGZpbGV0eXBlICh3aGV0aGVyIGFuIGV4dGVuc2lvbiBvciBiYXNlNjQgZGF0YSlcbiAgICAgICAgICB1cmxJdGVtID0gc2VsZi5fdXJsc1tpXTtcbiAgICAgICAgICBleHQgPSAvXmRhdGE6YXVkaW9cXC8oW147LF0rKTsvaS5leGVjKHVybEl0ZW0pO1xuICAgICAgICAgIGlmICghZXh0KSB7XG4gICAgICAgICAgICBleHQgPSAvXFwuKFteLl0rKSQvLmV4ZWModXJsSXRlbS5zcGxpdCgnPycsIDEpWzBdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICBleHQgPSBleHRbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5vbignbG9hZGVycm9yJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvZGVjc1tleHRdKSB7XG4gICAgICAgICAgdXJsID0gc2VsZi5fdXJsc1tpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoIXVybCkge1xuICAgICAgICBzZWxmLm9uKCdsb2FkZXJyb3InKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9zcmMgPSB1cmw7XG5cbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICBsb2FkQnVmZmVyKHNlbGYsIHVybCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgbmV3Tm9kZSA9IG5ldyBBdWRpbygpO1xuXG4gICAgICAgIC8vIGxpc3RlbiBmb3IgZXJyb3JzIHdpdGggSFRNTDUgYXVkaW8gKGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMtYXV0aG9yLXZpZXcvc3BlYy5odG1sI21lZGlhZXJyb3IpXG4gICAgICAgIG5ld05vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKG5ld05vZGUuZXJyb3IgJiYgbmV3Tm9kZS5lcnJvci5jb2RlID09PSA0KSB7XG4gICAgICAgICAgICBIb3dsZXJHbG9iYWwubm9BdWRpbyA9IHRydWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5vbignbG9hZGVycm9yJywge3R5cGU6IG5ld05vZGUuZXJyb3IgPyBuZXdOb2RlLmVycm9yLmNvZGUgOiAwfSk7XG4gICAgICAgIH0sIGZhbHNlKTtcblxuICAgICAgICBzZWxmLl9hdWRpb05vZGUucHVzaChuZXdOb2RlKTtcblxuICAgICAgICAvLyBzZXR1cCB0aGUgbmV3IGF1ZGlvIG5vZGVcbiAgICAgICAgbmV3Tm9kZS5zcmMgPSB1cmw7XG4gICAgICAgIG5ld05vZGUuX3BvcyA9IDA7XG4gICAgICAgIG5ld05vZGUucHJlbG9hZCA9ICdhdXRvJztcbiAgICAgICAgbmV3Tm9kZS52b2x1bWUgPSAoSG93bGVyLl9tdXRlZCkgPyAwIDogc2VsZi5fdm9sdW1lICogSG93bGVyLnZvbHVtZSgpO1xuXG4gICAgICAgIC8vIHNldHVwIHRoZSBldmVudCBsaXN0ZW5lciB0byBzdGFydCBwbGF5aW5nIHRoZSBzb3VuZFxuICAgICAgICAvLyBhcyBzb29uIGFzIGl0IGhhcyBidWZmZXJlZCBlbm91Z2hcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgLy8gcm91bmQgdXAgdGhlIGR1cmF0aW9uIHdoZW4gdXNpbmcgSFRNTDUgQXVkaW8gdG8gYWNjb3VudCBmb3IgdGhlIGxvd2VyIHByZWNpc2lvblxuICAgICAgICAgIHNlbGYuX2R1cmF0aW9uID0gTWF0aC5jZWlsKG5ld05vZGUuZHVyYXRpb24gKiAxMCkgLyAxMDtcblxuICAgICAgICAgIC8vIHNldHVwIGEgc3ByaXRlIGlmIG5vbmUgaXMgZGVmaW5lZFxuICAgICAgICAgIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhzZWxmLl9zcHJpdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgc2VsZi5fc3ByaXRlID0ge19kZWZhdWx0OiBbMCwgc2VsZi5fZHVyYXRpb24gKiAxMDAwXX07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgICAgIHNlbGYuX2xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgICBzZWxmLm9uKCdsb2FkJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNlbGYuX2F1dG9wbGF5KSB7XG4gICAgICAgICAgICBzZWxmLnBsYXkoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBjbGVhciB0aGUgZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgICBuZXdOb2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgfTtcbiAgICAgICAgbmV3Tm9kZS5hZGRFdmVudExpc3RlbmVyKCdjYW5wbGF5dGhyb3VnaCcsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgIG5ld05vZGUubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgVVJMcyB0byBiZSBwdWxsZWQgZnJvbSB0byBwbGF5IGluIHRoaXMgc291cmNlLlxuICAgICAqIEBwYXJhbSAge0FycmF5fSB1cmxzICBBcnJ5IG9mIFVSTHMgdG8gbG9hZCBmcm9tXG4gICAgICogQHJldHVybiB7SG93bH0gICAgICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBVUkxzXG4gICAgICovXG4gICAgdXJsczogZnVuY3Rpb24odXJscykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAodXJscykge1xuICAgICAgICBzZWxmLnN0b3AoKTtcbiAgICAgICAgc2VsZi5fdXJscyA9ICh0eXBlb2YgdXJscyA9PT0gJ3N0cmluZycpID8gW3VybHNdIDogdXJscztcbiAgICAgICAgc2VsZi5fbG9hZGVkID0gZmFsc2U7XG4gICAgICAgIHNlbGYubG9hZCgpO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3VybHM7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBsYXkgYSBzb3VuZCBmcm9tIHRoZSBjdXJyZW50IHRpbWUgKDAgYnkgZGVmYXVsdCkuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIHNwcml0ZSAgIChvcHRpb25hbCkgUGxheXMgZnJvbSB0aGUgc3BlY2lmaWVkIHBvc2l0aW9uIGluIHRoZSBzb3VuZCBzcHJpdGUgZGVmaW5pdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgKG9wdGlvbmFsKSBSZXR1cm5zIHRoZSB1bmlxdWUgcGxheWJhY2sgaWQgZm9yIHRoaXMgc291bmQgaW5zdGFuY2UuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBwbGF5OiBmdW5jdGlvbihzcHJpdGUsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIGlmIG5vIHNwcml0ZSB3YXMgcGFzc2VkIGJ1dCBhIGNhbGxiYWNrIHdhcywgdXBkYXRlIHRoZSB2YXJpYWJsZXNcbiAgICAgIGlmICh0eXBlb2Ygc3ByaXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gc3ByaXRlO1xuICAgICAgfVxuXG4gICAgICAvLyB1c2UgdGhlIGRlZmF1bHQgc3ByaXRlIGlmIG5vbmUgaXMgcGFzc2VkXG4gICAgICBpZiAoIXNwcml0ZSB8fCB0eXBlb2Ygc3ByaXRlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNwcml0ZSA9ICdfZGVmYXVsdCc7XG4gICAgICB9XG5cbiAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgIHNlbGYub24oJ2xvYWQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnBsYXkoc3ByaXRlLCBjYWxsYmFjayk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBpZiB0aGUgc3ByaXRlIGRvZXNuJ3QgZXhpc3QsIHBsYXkgbm90aGluZ1xuICAgICAgaWYgKCFzZWxmLl9zcHJpdGVbc3ByaXRlXSkge1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjaygpO1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gZ2V0IHRoZSBub2RlIHRvIHBsYXliYWNrXG4gICAgICBzZWxmLl9pbmFjdGl2ZU5vZGUoZnVuY3Rpb24obm9kZSkge1xuICAgICAgICAvLyBwZXJzaXN0IHRoZSBzcHJpdGUgYmVpbmcgcGxheWVkXG4gICAgICAgIG5vZGUuX3Nwcml0ZSA9IHNwcml0ZTtcblxuICAgICAgICAvLyBkZXRlcm1pbmUgd2hlcmUgdG8gc3RhcnQgcGxheWluZyBmcm9tXG4gICAgICAgIHZhciBwb3MgPSAobm9kZS5fcG9zID4gMCkgPyBub2RlLl9wb3MgOiBzZWxmLl9zcHJpdGVbc3ByaXRlXVswXSAvIDEwMDA7XG5cbiAgICAgICAgLy8gZGV0ZXJtaW5lIGhvdyBsb25nIHRvIHBsYXkgZm9yXG4gICAgICAgIHZhciBkdXJhdGlvbiA9IDA7XG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIGR1cmF0aW9uID0gc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMV0gLyAxMDAwIC0gbm9kZS5fcG9zO1xuICAgICAgICAgIGlmIChub2RlLl9wb3MgPiAwKSB7XG4gICAgICAgICAgICBwb3MgPSBzZWxmLl9zcHJpdGVbc3ByaXRlXVswXSAvIDEwMDAgKyBwb3M7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGR1cmF0aW9uID0gc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMV0gLyAxMDAwIC0gKHBvcyAtIHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBkZXRlcm1pbmUgaWYgdGhpcyBzb3VuZCBzaG91bGQgYmUgbG9vcGVkXG4gICAgICAgIHZhciBsb29wID0gISEoc2VsZi5fbG9vcCB8fCBzZWxmLl9zcHJpdGVbc3ByaXRlXVsyXSk7XG5cbiAgICAgICAgLy8gc2V0IHRpbWVyIHRvIGZpcmUgdGhlICdvbmVuZCcgZXZlbnRcbiAgICAgICAgdmFyIHNvdW5kSWQgPSAodHlwZW9mIGNhbGxiYWNrID09PSAnc3RyaW5nJykgPyBjYWxsYmFjayA6IE1hdGgucm91bmQoRGF0ZS5ub3coKSAqIE1hdGgucmFuZG9tKCkpICsgJycsXG4gICAgICAgICAgdGltZXJJZDtcbiAgICAgICAgKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBkYXRhID0ge1xuICAgICAgICAgICAgaWQ6IHNvdW5kSWQsXG4gICAgICAgICAgICBzcHJpdGU6IHNwcml0ZSxcbiAgICAgICAgICAgIGxvb3A6IGxvb3BcbiAgICAgICAgICB9O1xuICAgICAgICAgIHRpbWVySWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gaWYgbG9vcGluZywgcmVzdGFydCB0aGUgdHJhY2tcbiAgICAgICAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgbG9vcCkge1xuICAgICAgICAgICAgICBzZWxmLnN0b3AoZGF0YS5pZCkucGxheShzcHJpdGUsIGRhdGEuaWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBzZXQgd2ViIGF1ZGlvIG5vZGUgdG8gcGF1c2VkIGF0IGVuZFxuICAgICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmICFsb29wKSB7XG4gICAgICAgICAgICAgIHNlbGYuX25vZGVCeUlkKGRhdGEuaWQpLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICAgIHNlbGYuX25vZGVCeUlkKGRhdGEuaWQpLl9wb3MgPSAwO1xuXG4gICAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBlbmQgdGltZXJcbiAgICAgICAgICAgICAgc2VsZi5fY2xlYXJFbmRUaW1lcihkYXRhLmlkKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZW5kIHRoZSB0cmFjayBpZiBpdCBpcyBIVE1MIGF1ZGlvIGFuZCBhIHNwcml0ZVxuICAgICAgICAgICAgaWYgKCFzZWxmLl93ZWJBdWRpbyAmJiAhbG9vcCkge1xuICAgICAgICAgICAgICBzZWxmLnN0b3AoZGF0YS5pZCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGZpcmUgZW5kZWQgZXZlbnRcbiAgICAgICAgICAgIHNlbGYub24oJ2VuZCcsIHNvdW5kSWQpO1xuICAgICAgICAgIH0sIGR1cmF0aW9uICogMTAwMCk7XG5cbiAgICAgICAgICAvLyBzdG9yZSB0aGUgcmVmZXJlbmNlIHRvIHRoZSB0aW1lclxuICAgICAgICAgIHNlbGYuX29uZW5kVGltZXIucHVzaCh7dGltZXI6IHRpbWVySWQsIGlkOiBkYXRhLmlkfSk7XG4gICAgICAgIH0pKCk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgdmFyIGxvb3BTdGFydCA9IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMCxcbiAgICAgICAgICAgIGxvb3BFbmQgPSBzZWxmLl9zcHJpdGVbc3ByaXRlXVsxXSAvIDEwMDA7XG5cbiAgICAgICAgICAvLyBzZXQgdGhlIHBsYXkgaWQgdG8gdGhpcyBub2RlIGFuZCBsb2FkIGludG8gY29udGV4dFxuICAgICAgICAgIG5vZGUuaWQgPSBzb3VuZElkO1xuICAgICAgICAgIG5vZGUucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgcmVmcmVzaEJ1ZmZlcihzZWxmLCBbbG9vcCwgbG9vcFN0YXJ0LCBsb29wRW5kXSwgc291bmRJZCk7XG4gICAgICAgICAgc2VsZi5fcGxheVN0YXJ0ID0gY3R4LmN1cnJlbnRUaW1lO1xuICAgICAgICAgIG5vZGUuZ2Fpbi52YWx1ZSA9IHNlbGYuX3ZvbHVtZTtcblxuICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS5idWZmZXJTb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5ub3RlR3JhaW5PbigwLCBwb3MsIGR1cmF0aW9uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbm9kZS5idWZmZXJTb3VyY2Uuc3RhcnQoMCwgcG9zLCBkdXJhdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChub2RlLnJlYWR5U3RhdGUgPT09IDQgfHwgIW5vZGUucmVhZHlTdGF0ZSAmJiBuYXZpZ2F0b3IuaXNDb2Nvb25KUykge1xuICAgICAgICAgICAgbm9kZS5yZWFkeVN0YXRlID0gNDtcbiAgICAgICAgICAgIG5vZGUuaWQgPSBzb3VuZElkO1xuICAgICAgICAgICAgbm9kZS5jdXJyZW50VGltZSA9IHBvcztcbiAgICAgICAgICAgIG5vZGUubXV0ZWQgPSBIb3dsZXIuX211dGVkIHx8IG5vZGUubXV0ZWQ7XG4gICAgICAgICAgICBub2RlLnZvbHVtZSA9IHNlbGYuX3ZvbHVtZSAqIEhvd2xlci52b2x1bWUoKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IG5vZGUucGxheSgpOyB9LCAwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZi5fY2xlYXJFbmRUaW1lcihzb3VuZElkKTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIHZhciBzb3VuZCA9IHNlbGYsXG4gICAgICAgICAgICAgICAgcGxheVNwcml0ZSA9IHNwcml0ZSxcbiAgICAgICAgICAgICAgICBmbiA9IGNhbGxiYWNrLFxuICAgICAgICAgICAgICAgIG5ld05vZGUgPSBub2RlO1xuICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5wbGF5KHBsYXlTcHJpdGUsIGZuKTtcblxuICAgICAgICAgICAgICAgIC8vIGNsZWFyIHRoZSBldmVudCBsaXN0ZW5lclxuICAgICAgICAgICAgICAgIG5ld05vZGUucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2FucGxheXRocm91Z2gnLCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICBuZXdOb2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2NhbnBsYXl0aHJvdWdoJywgbGlzdGVuZXIsIGZhbHNlKTtcbiAgICAgICAgICAgIH0pKCk7XG5cbiAgICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGZpcmUgdGhlIHBsYXkgZXZlbnQgYW5kIHNlbmQgdGhlIHNvdW5kSWQgYmFjayBpbiB0aGUgY2FsbGJhY2tcbiAgICAgICAgc2VsZi5vbigncGxheScpO1xuICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSBjYWxsYmFjayhzb3VuZElkKTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGF1c2UgcGxheWJhY2sgYW5kIHNhdmUgdGhlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlkIChvcHRpb25hbCkgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBwYXVzZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gaWYgdGhlIHNvdW5kIGhhc24ndCBiZWVuIGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBldmVudCBxdWV1ZVxuICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgc2VsZi5vbigncGxheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYucGF1c2UoaWQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gY2xlYXIgJ29uZW5kJyB0aW1lclxuICAgICAgc2VsZi5fY2xlYXJFbmRUaW1lcihpZCk7XG5cbiAgICAgIHZhciBhY3RpdmVOb2RlID0gKGlkKSA/IHNlbGYuX25vZGVCeUlkKGlkKSA6IHNlbGYuX2FjdGl2ZU5vZGUoKTtcbiAgICAgIGlmIChhY3RpdmVOb2RlKSB7XG4gICAgICAgIGFjdGl2ZU5vZGUuX3BvcyA9IHNlbGYucG9zKG51bGwsIGlkKTtcblxuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHNvdW5kIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgICAgICBpZiAoIWFjdGl2ZU5vZGUuYnVmZmVyU291cmNlIHx8IGFjdGl2ZU5vZGUucGF1c2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhY3RpdmVOb2RlLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgaWYgKHR5cGVvZiBhY3RpdmVOb2RlLmJ1ZmZlclNvdXJjZS5zdG9wID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgYWN0aXZlTm9kZS5idWZmZXJTb3VyY2Uubm90ZU9mZigwKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0aXZlTm9kZS5idWZmZXJTb3VyY2Uuc3RvcCgwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZlTm9kZS5wYXVzZSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHNlbGYub24oJ3BhdXNlJyk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wIHBsYXliYWNrIGFuZCByZXNldCB0byBzdGFydC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gaWYgdGhlIHNvdW5kIGhhc24ndCBiZWVuIGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBldmVudCBxdWV1ZVxuICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgc2VsZi5vbigncGxheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RvcChpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBjbGVhciAnb25lbmQnIHRpbWVyXG4gICAgICBzZWxmLl9jbGVhckVuZFRpbWVyKGlkKTtcblxuICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgYWN0aXZlTm9kZS5fcG9zID0gMDtcblxuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHNvdW5kIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgICAgICBpZiAoIWFjdGl2ZU5vZGUuYnVmZmVyU291cmNlIHx8IGFjdGl2ZU5vZGUucGF1c2VkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBhY3RpdmVOb2RlLnBhdXNlZCA9IHRydWU7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGFjdGl2ZU5vZGUuYnVmZmVyU291cmNlLnN0b3AgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLmJ1ZmZlclNvdXJjZS5ub3RlT2ZmKDApO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhY3RpdmVOb2RlLmJ1ZmZlclNvdXJjZS5zdG9wKDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICghaXNOYU4oYWN0aXZlTm9kZS5kdXJhdGlvbikpIHtcbiAgICAgICAgICBhY3RpdmVOb2RlLnBhdXNlKCk7XG4gICAgICAgICAgYWN0aXZlTm9kZS5jdXJyZW50VGltZSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE11dGUgdGhpcyBzb3VuZC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkIChvcHRpb25hbCkgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBtdXRlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdwbGF5JywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5tdXRlKGlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIHZhciBhY3RpdmVOb2RlID0gKGlkKSA/IHNlbGYuX25vZGVCeUlkKGlkKSA6IHNlbGYuX2FjdGl2ZU5vZGUoKTtcbiAgICAgIGlmIChhY3RpdmVOb2RlKSB7XG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIGFjdGl2ZU5vZGUuZ2Fpbi52YWx1ZSA9IDA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYWN0aXZlTm9kZS5tdXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubXV0ZSB0aGlzIHNvdW5kLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHVubXV0ZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gaWYgdGhlIHNvdW5kIGhhc24ndCBiZWVuIGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBldmVudCBxdWV1ZVxuICAgICAgaWYgKCFzZWxmLl9sb2FkZWQpIHtcbiAgICAgICAgc2VsZi5vbigncGxheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYudW5tdXRlKGlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIHZhciBhY3RpdmVOb2RlID0gKGlkKSA/IHNlbGYuX25vZGVCeUlkKGlkKSA6IHNlbGYuX2FjdGl2ZU5vZGUoKTtcbiAgICAgIGlmIChhY3RpdmVOb2RlKSB7XG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIGFjdGl2ZU5vZGUuZ2Fpbi52YWx1ZSA9IHNlbGYuX3ZvbHVtZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhY3RpdmVOb2RlLm11dGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdm9sdW1lIG9mIHRoaXMgc291bmQuXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICB2b2wgVm9sdW1lIGZyb20gMC4wIHRvIDEuMC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGlkICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2wvRmxvYXR9ICAgICBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCB2b2x1bWUuXG4gICAgICovXG4gICAgdm9sdW1lOiBmdW5jdGlvbih2b2wsIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSB2b2x1bWUgaXMgYSBudW1iZXJcbiAgICAgIHZvbCA9IHBhcnNlRmxvYXQodm9sKTtcblxuICAgICAgaWYgKHZvbCA+PSAwICYmIHZvbCA8PSAxKSB7XG4gICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcblxuICAgICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgICAgc2VsZi5vbigncGxheScsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi52b2x1bWUodm9sLCBpZCk7XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3RpdmVOb2RlID0gKGlkKSA/IHNlbGYuX25vZGVCeUlkKGlkKSA6IHNlbGYuX2FjdGl2ZU5vZGUoKTtcbiAgICAgICAgaWYgKGFjdGl2ZU5vZGUpIHtcbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUuZ2Fpbi52YWx1ZSA9IHZvbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYWN0aXZlTm9kZS52b2x1bWUgPSB2b2wgKiBIb3dsZXIudm9sdW1lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fdm9sdW1lO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHdoZXRoZXIgdG8gbG9vcCB0aGUgc291bmQuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gbG9vcCBUbyBsb29wIG9yIG5vdCB0byBsb29wLCB0aGF0IGlzIHRoZSBxdWVzdGlvbi5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL0Jvb2xlYW59ICAgICAgUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgbG9vcGluZyB2YWx1ZS5cbiAgICAgKi9cbiAgICBsb29wOiBmdW5jdGlvbihsb29wKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgbG9vcCA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHNlbGYuX2xvb3AgPSBsb29wO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX2xvb3A7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgc291bmQgc3ByaXRlIGRlZmluaXRpb24uXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBzcHJpdGUgRXhhbXBsZToge3Nwcml0ZU5hbWU6IFtvZmZzZXQsIGR1cmF0aW9uLCBsb29wXX1cbiAgICAgKiAgICAgICAgICAgICAgICBAcGFyYW0ge0ludGVnZXJ9IG9mZnNldCAgIFdoZXJlIHRvIGJlZ2luIHBsYXliYWNrIGluIG1pbGxpc2Vjb25kc1xuICAgICAqICAgICAgICAgICAgICAgIEBwYXJhbSB7SW50ZWdlcn0gZHVyYXRpb24gSG93IGxvbmcgdG8gcGxheSBpbiBtaWxsaXNlY29uZHNcbiAgICAgKiAgICAgICAgICAgICAgICBAcGFyYW0ge0Jvb2xlYW59IGxvb3AgICAgIChvcHRpb25hbCkgU2V0IHRydWUgdG8gbG9vcCB0aGlzIHNwcml0ZVxuICAgICAqIEByZXR1cm4ge0hvd2x9ICAgICAgICBSZXR1cm5zIGN1cnJlbnQgc3ByaXRlIHNoZWV0IG9yIHNlbGYuXG4gICAgICovXG4gICAgc3ByaXRlOiBmdW5jdGlvbihzcHJpdGUpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBzcHJpdGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHNlbGYuX3Nwcml0ZSA9IHNwcml0ZTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9zcHJpdGU7XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIHBvc2l0aW9uIG9mIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge0Zsb2F0fSAgcG9zIFRoZSBwb3NpdGlvbiB0byBtb3ZlIGN1cnJlbnQgcGxheWJhY2sgdG8uXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBpZCAgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL0Zsb2F0fSAgICAgIFJldHVybnMgc2VsZiBvciBjdXJyZW50IHBsYXliYWNrIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIHBvczogZnVuY3Rpb24ocG9zLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5wb3MocG9zKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHR5cGVvZiBwb3MgPT09ICdudW1iZXInID8gc2VsZiA6IHNlbGYuX3BvcyB8fCAwO1xuICAgICAgfVxuXG4gICAgICAvLyBtYWtlIHN1cmUgd2UgYXJlIGRlYWxpbmcgd2l0aCBhIG51bWJlciBmb3IgcG9zXG4gICAgICBwb3MgPSBwYXJzZUZsb2F0KHBvcyk7XG5cbiAgICAgIHZhciBhY3RpdmVOb2RlID0gKGlkKSA/IHNlbGYuX25vZGVCeUlkKGlkKSA6IHNlbGYuX2FjdGl2ZU5vZGUoKTtcbiAgICAgIGlmIChhY3RpdmVOb2RlKSB7XG4gICAgICAgIGlmIChwb3MgPj0gMCkge1xuICAgICAgICAgIHNlbGYucGF1c2UoaWQpO1xuICAgICAgICAgIGFjdGl2ZU5vZGUuX3BvcyA9IHBvcztcbiAgICAgICAgICBzZWxmLnBsYXkoYWN0aXZlTm9kZS5fc3ByaXRlLCBpZCk7XG5cbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fd2ViQXVkaW8gPyBhY3RpdmVOb2RlLl9wb3MgKyAoY3R4LmN1cnJlbnRUaW1lIC0gc2VsZi5fcGxheVN0YXJ0KSA6IGFjdGl2ZU5vZGUuY3VycmVudFRpbWU7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocG9zID49IDApIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaW5kIHRoZSBmaXJzdCBpbmFjdGl2ZSBub2RlIHRvIHJldHVybiB0aGUgcG9zIGZvclxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHNlbGYuX2F1ZGlvTm9kZVtpXS5wYXVzZWQgJiYgc2VsZi5fYXVkaW9Ob2RlW2ldLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgIHJldHVybiAoc2VsZi5fd2ViQXVkaW8pID8gc2VsZi5fYXVkaW9Ob2RlW2ldLl9wb3MgOiBzZWxmLl9hdWRpb05vZGVbaV0uY3VycmVudFRpbWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIDNEIHBvc2l0aW9uIG9mIHRoZSBhdWRpbyBzb3VyY2UuXG4gICAgICogVGhlIG1vc3QgY29tbW9uIHVzYWdlIGlzIHRvIHNldCB0aGUgJ3gnIHBvc2l0aW9uXG4gICAgICogdG8gYWZmZWN0IHRoZSBsZWZ0L3JpZ2h0IGVhciBwYW5uaW5nLiBTZXR0aW5nIGFueSB2YWx1ZSBoaWdoZXIgdGhhblxuICAgICAqIDEuMCB3aWxsIGJlZ2luIHRvIGRlY3JlYXNlIHRoZSB2b2x1bWUgb2YgdGhlIHNvdW5kIGFzIGl0IG1vdmVzIGZ1cnRoZXIgYXdheS5cbiAgICAgKiBOT1RFOiBUaGlzIG9ubHkgd29ya3Mgd2l0aCBXZWIgQXVkaW8gQVBJLCBIVE1MNSBBdWRpbyBwbGF5YmFja1xuICAgICAqIHdpbGwgbm90IGJlIGFmZmVjdGVkLlxuICAgICAqIEBwYXJhbSAge0Zsb2F0fSAgeCAgVGhlIHgtcG9zaXRpb24gb2YgdGhlIHBsYXliYWNrIGZyb20gLTEwMDAuMCB0byAxMDAwLjBcbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gIHkgIFRoZSB5LXBvc2l0aW9uIG9mIHRoZSBwbGF5YmFjayBmcm9tIC0xMDAwLjAgdG8gMTAwMC4wXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICB6ICBUaGUgei1wb3NpdGlvbiBvZiB0aGUgcGxheWJhY2sgZnJvbSAtMTAwMC4wIHRvIDEwMDAuMFxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL0FycmF5fSAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCAzRCBwb3NpdGlvbjogW3gsIHksIHpdXG4gICAgICovXG4gICAgcG9zM2Q6IGZ1bmN0aW9uKHgsIHksIHosIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIHNldCBhIGRlZmF1bHQgZm9yIHRoZSBvcHRpb25hbCAneScgJiAneidcbiAgICAgIHkgPSAodHlwZW9mIHkgPT09ICd1bmRlZmluZWQnIHx8ICF5KSA/IDAgOiB5O1xuICAgICAgeiA9ICh0eXBlb2YgeiA9PT0gJ3VuZGVmaW5lZCcgfHwgIXopID8gLTAuNSA6IHo7XG5cbiAgICAgIC8vIGlmIHRoZSBzb3VuZCBoYXNuJ3QgYmVlbiBsb2FkZWQsIGFkZCBpdCB0byB0aGUgZXZlbnQgcXVldWVcbiAgICAgIGlmICghc2VsZi5fbG9hZGVkKSB7XG4gICAgICAgIHNlbGYub24oJ3BsYXknLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnBvczNkKHgsIHksIHosIGlkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIGlmICh4ID49IDAgfHwgeCA8IDApIHtcbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgdmFyIGFjdGl2ZU5vZGUgPSAoaWQpID8gc2VsZi5fbm9kZUJ5SWQoaWQpIDogc2VsZi5fYWN0aXZlTm9kZSgpO1xuICAgICAgICAgIGlmIChhY3RpdmVOb2RlKSB7XG4gICAgICAgICAgICBzZWxmLl9wb3MzZCA9IFt4LCB5LCB6XTtcbiAgICAgICAgICAgIGFjdGl2ZU5vZGUucGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopO1xuICAgICAgICAgICAgYWN0aXZlTm9kZS5wYW5uZXIucGFubmluZ01vZGVsID0gc2VsZi5fbW9kZWwgfHwgJ0hSVEYnO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3BvczNkO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmFkZSBhIGN1cnJlbnRseSBwbGF5aW5nIHNvdW5kIGJldHdlZW4gdHdvIHZvbHVtZXMuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIGZyb20gICAgIFRoZSB2b2x1bWUgdG8gZmFkZSBmcm9tICgwLjAgdG8gMS4wKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgdG8gICAgICAgVGhlIHZvbHVtZSB0byBmYWRlIHRvICgwLjAgdG8gMS4wKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgbGVuICAgICAgVGltZSBpbiBtaWxsaXNlY29uZHMgdG8gZmFkZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgKG9wdGlvbmFsKSBGaXJlZCB3aGVuIHRoZSBmYWRlIGlzIGNvbXBsZXRlLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBpZCAgICAgICAob3B0aW9uYWwpIFRoZSBwbGF5IGluc3RhbmNlIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgZmFkZTogZnVuY3Rpb24oZnJvbSwgdG8sIGxlbiwgY2FsbGJhY2ssIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGRpZmYgPSBNYXRoLmFicyhmcm9tIC0gdG8pLFxuICAgICAgICBkaXIgPSBmcm9tID4gdG8gPyAnZG93bicgOiAndXAnLFxuICAgICAgICBzdGVwcyA9IGRpZmYgLyAwLjAxLFxuICAgICAgICBzdGVwVGltZSA9IGxlbiAvIHN0ZXBzO1xuXG4gICAgICAvLyBpZiB0aGUgc291bmQgaGFzbid0IGJlZW4gbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGV2ZW50IHF1ZXVlXG4gICAgICBpZiAoIXNlbGYuX2xvYWRlZCkge1xuICAgICAgICBzZWxmLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5mYWRlKGZyb20sIHRvLCBsZW4sIGNhbGxiYWNrLCBpZCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBzZXQgdGhlIHZvbHVtZSB0byB0aGUgc3RhcnQgcG9zaXRpb25cbiAgICAgIHNlbGYudm9sdW1lKGZyb20sIGlkKTtcblxuICAgICAgZm9yICh2YXIgaT0xOyBpPD1zdGVwczsgaSsrKSB7XG4gICAgICAgIChmdW5jdGlvbigpIHtcbiAgICAgICAgICB2YXIgY2hhbmdlID0gc2VsZi5fdm9sdW1lICsgKGRpciA9PT0gJ3VwJyA/IDAuMDEgOiAtMC4wMSkgKiBpLFxuICAgICAgICAgICAgdm9sID0gTWF0aC5yb3VuZCgxMDAwICogY2hhbmdlKSAvIDEwMDAsXG4gICAgICAgICAgICB0b1ZvbCA9IHRvO1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYudm9sdW1lKHZvbCwgaWQpO1xuXG4gICAgICAgICAgICBpZiAodm9sID09PSB0b1ZvbCkge1xuICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgc3RlcFRpbWUgKiBpKTtcbiAgICAgICAgfSkoKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogW0RFUFJFQ0FURURdIEZhZGUgaW4gdGhlIGN1cnJlbnQgc291bmQuXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICAgIHRvICAgICAgVm9sdW1lIHRvIGZhZGUgdG8gKDAuMCB0byAxLjApLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICBsZW4gICAgIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIGZhZGUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGNhbGxiYWNrXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBmYWRlSW46IGZ1bmN0aW9uKHRvLCBsZW4sIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gdGhpcy52b2x1bWUoMCkucGxheSgpLmZhZGUoMCwgdG8sIGxlbiwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBbREVQUkVDQVRFRF0gRmFkZSBvdXQgdGhlIGN1cnJlbnQgc291bmQgYW5kIHBhdXNlIHdoZW4gZmluaXNoZWQuXG4gICAgICogQHBhcmFtICB7RmxvYXR9ICAgIHRvICAgICAgIFZvbHVtZSB0byBmYWRlIHRvICgwLjAgdG8gMS4wKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgbGVuICAgICAgVGltZSBpbiBtaWxsaXNlY29uZHMgdG8gZmFkZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgaWQgICAgICAgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIGZhZGVPdXQ6IGZ1bmN0aW9uKHRvLCBsZW4sIGNhbGxiYWNrLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICByZXR1cm4gc2VsZi5mYWRlKHNlbGYuX3ZvbHVtZSwgdG8sIGxlbiwgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soKTtcbiAgICAgICAgc2VsZi5wYXVzZShpZCk7XG5cbiAgICAgICAgLy8gZmlyZSBlbmRlZCBldmVudFxuICAgICAgICBzZWxmLm9uKCdlbmQnKTtcbiAgICAgIH0sIGlkKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFuIGF1ZGlvIG5vZGUgYnkgSUQuXG4gICAgICogQHJldHVybiB7SG93bH0gQXVkaW8gbm9kZS5cbiAgICAgKi9cbiAgICBfbm9kZUJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG5vZGUgPSBzZWxmLl9hdWRpb05vZGVbMF07XG5cbiAgICAgIC8vIGZpbmQgdGhlIG5vZGUgd2l0aCB0aGlzIElEXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9hdWRpb05vZGVbaV0uaWQgPT09IGlkKSB7XG4gICAgICAgICAgbm9kZSA9IHNlbGYuX2F1ZGlvTm9kZVtpXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaXJzdCBhY3RpdmUgYXVkaW8gbm9kZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfSBBdWRpbyBub2RlLlxuICAgICAqL1xuICAgIF9hY3RpdmVOb2RlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgbm9kZSA9IG51bGw7XG5cbiAgICAgIC8vIGZpbmQgdGhlIGZpcnN0IHBsYXlpbmcgbm9kZVxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2F1ZGlvTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXNlbGYuX2F1ZGlvTm9kZVtpXS5wYXVzZWQpIHtcbiAgICAgICAgICBub2RlID0gc2VsZi5fYXVkaW9Ob2RlW2ldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZSBleGNlc3MgaW5hY3RpdmUgbm9kZXNcbiAgICAgIHNlbGYuX2RyYWluUG9vbCgpO1xuXG4gICAgICByZXR1cm4gbm9kZTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBmaXJzdCBpbmFjdGl2ZSBhdWRpbyBub2RlLlxuICAgICAqIElmIHRoZXJlIGlzIG5vbmUsIGNyZWF0ZSBhIG5ldyBvbmUgYW5kIGFkZCBpdCB0byB0aGUgcG9vbC5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gY2FsbGJhY2sgRnVuY3Rpb24gdG8gY2FsbCB3aGVuIHRoZSBhdWRpbyBub2RlIGlzIHJlYWR5LlxuICAgICAqL1xuICAgIF9pbmFjdGl2ZU5vZGU6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIG5vZGUgPSBudWxsO1xuXG4gICAgICAvLyBmaW5kIGZpcnN0IGluYWN0aXZlIG5vZGUgdG8gcmVjeWNsZVxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2F1ZGlvTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fYXVkaW9Ob2RlW2ldLnBhdXNlZCAmJiBzZWxmLl9hdWRpb05vZGVbaV0ucmVhZHlTdGF0ZSA9PT0gNCkge1xuICAgICAgICAgIC8vIHNlbmQgdGhlIG5vZGUgYmFjayBmb3IgdXNlIGJ5IHRoZSBuZXcgcGxheSBpbnN0YW5jZVxuICAgICAgICAgIGNhbGxiYWNrKHNlbGYuX2F1ZGlvTm9kZVtpXSk7XG4gICAgICAgICAgbm9kZSA9IHRydWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcmVtb3ZlIGV4Y2VzcyBpbmFjdGl2ZSBub2Rlc1xuICAgICAgc2VsZi5fZHJhaW5Qb29sKCk7XG5cbiAgICAgIGlmIChub2RlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gY3JlYXRlIG5ldyBub2RlIGlmIHRoZXJlIGFyZSBubyBpbmFjdGl2ZXNcbiAgICAgIHZhciBuZXdOb2RlO1xuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIG5ld05vZGUgPSBzZWxmLl9zZXR1cEF1ZGlvTm9kZSgpO1xuICAgICAgICBjYWxsYmFjayhuZXdOb2RlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYubG9hZCgpO1xuICAgICAgICBuZXdOb2RlID0gc2VsZi5fYXVkaW9Ob2RlW3NlbGYuX2F1ZGlvTm9kZS5sZW5ndGggLSAxXTtcblxuICAgICAgICAvLyBsaXN0ZW4gZm9yIHRoZSBjb3JyZWN0IGxvYWQgZXZlbnQgYW5kIGZpcmUgdGhlIGNhbGxiYWNrXG4gICAgICAgIHZhciBsaXN0ZW5lckV2ZW50ID0gbmF2aWdhdG9yLmlzQ29jb29uSlMgPyAnY2FucGxheXRocm91Z2gnIDogJ2xvYWRlZG1ldGFkYXRhJztcbiAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbmV3Tm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKGxpc3RlbmVyRXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgY2FsbGJhY2sobmV3Tm9kZSk7XG4gICAgICAgIH07XG4gICAgICAgIG5ld05vZGUuYWRkRXZlbnRMaXN0ZW5lcihsaXN0ZW5lckV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBJZiB0aGVyZSBhcmUgbW9yZSB0aGFuIDUgaW5hY3RpdmUgYXVkaW8gbm9kZXMgaW4gdGhlIHBvb2wsIGNsZWFyIG91dCB0aGUgcmVzdC5cbiAgICAgKi9cbiAgICBfZHJhaW5Qb29sOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgaW5hY3RpdmUgPSAwLFxuICAgICAgICBpO1xuXG4gICAgICAvLyBjb3VudCB0aGUgbnVtYmVyIG9mIGluYWN0aXZlIG5vZGVzXG4gICAgICBmb3IgKGk9MDsgaTxzZWxmLl9hdWRpb05vZGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX2F1ZGlvTm9kZVtpXS5wYXVzZWQpIHtcbiAgICAgICAgICBpbmFjdGl2ZSsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHJlbW92ZSBleGNlc3MgaW5hY3RpdmUgbm9kZXNcbiAgICAgIGZvciAoaT1zZWxmLl9hdWRpb05vZGUubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuICAgICAgICBpZiAoaW5hY3RpdmUgPD0gNSkge1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuX2F1ZGlvTm9kZVtpXS5wYXVzZWQpIHtcbiAgICAgICAgICAvLyBkaXNjb25uZWN0IHRoZSBhdWRpbyBzb3VyY2UgaWYgdXNpbmcgV2ViIEF1ZGlvXG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICBzZWxmLl9hdWRpb05vZGVbaV0uZGlzY29ubmVjdCgwKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpbmFjdGl2ZS0tO1xuICAgICAgICAgIHNlbGYuX2F1ZGlvTm9kZS5zcGxpY2UoaSwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgJ29uZW5kJyB0aW1lb3V0IGJlZm9yZSBpdCBlbmRzLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gc291bmRJZCAgVGhlIHBsYXkgaW5zdGFuY2UgSUQuXG4gICAgICovXG4gICAgX2NsZWFyRW5kVGltZXI6IGZ1bmN0aW9uKHNvdW5kSWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgICAvLyBsb29wIHRocm91Z2ggdGhlIHRpbWVycyB0byBmaW5kIHRoZSBvbmUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgc291bmRcbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9vbmVuZFRpbWVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9vbmVuZFRpbWVyW2ldLmlkID09PSBzb3VuZElkKSB7XG4gICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB0aW1lciA9IHNlbGYuX29uZW5kVGltZXJbaW5kZXhdO1xuICAgICAgaWYgKHRpbWVyKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aW1lci50aW1lcik7XG4gICAgICAgIHNlbGYuX29uZW5kVGltZXIuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU2V0dXAgdGhlIGdhaW4gbm9kZSBhbmQgcGFubmVyIGZvciBhIFdlYiBBdWRpbyBpbnN0YW5jZS5cbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9IFRoZSBuZXcgYXVkaW8gbm9kZS5cbiAgICAgKi9cbiAgICBfc2V0dXBBdWRpb05vZGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBub2RlID0gc2VsZi5fYXVkaW9Ob2RlLFxuICAgICAgICBpbmRleCA9IHNlbGYuX2F1ZGlvTm9kZS5sZW5ndGg7XG5cbiAgICAgIC8vIGNyZWF0ZSBnYWluIG5vZGVcbiAgICAgIG5vZGVbaW5kZXhdID0gKHR5cGVvZiBjdHguY3JlYXRlR2FpbiA9PT0gJ3VuZGVmaW5lZCcpID8gY3R4LmNyZWF0ZUdhaW5Ob2RlKCkgOiBjdHguY3JlYXRlR2FpbigpO1xuICAgICAgbm9kZVtpbmRleF0uZ2Fpbi52YWx1ZSA9IHNlbGYuX3ZvbHVtZTtcbiAgICAgIG5vZGVbaW5kZXhdLnBhdXNlZCA9IHRydWU7XG4gICAgICBub2RlW2luZGV4XS5fcG9zID0gMDtcbiAgICAgIG5vZGVbaW5kZXhdLnJlYWR5U3RhdGUgPSA0O1xuICAgICAgbm9kZVtpbmRleF0uY29ubmVjdChtYXN0ZXJHYWluKTtcblxuICAgICAgLy8gY3JlYXRlIHRoZSBwYW5uZXJcbiAgICAgIG5vZGVbaW5kZXhdLnBhbm5lciA9IGN0eC5jcmVhdGVQYW5uZXIoKTtcbiAgICAgIG5vZGVbaW5kZXhdLnBhbm5lci5wYW5uaW5nTW9kZWwgPSBzZWxmLl9tb2RlbCB8fCAnZXF1YWxwb3dlcic7XG4gICAgICBub2RlW2luZGV4XS5wYW5uZXIuc2V0UG9zaXRpb24oc2VsZi5fcG9zM2RbMF0sIHNlbGYuX3BvczNkWzFdLCBzZWxmLl9wb3MzZFsyXSk7XG4gICAgICBub2RlW2luZGV4XS5wYW5uZXIuY29ubmVjdChub2RlW2luZGV4XSk7XG5cbiAgICAgIHJldHVybiBub2RlW2luZGV4XTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2FsbC9zZXQgY3VzdG9tIGV2ZW50cy5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgdHlwZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgRnVuY3Rpb24gdG8gY2FsbC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbihldmVudCwgZm4pIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgZXZlbnRzID0gc2VsZlsnX29uJyArIGV2ZW50XTtcblxuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBldmVudHMucHVzaChmbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8ZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGZuKSB7XG4gICAgICAgICAgICBldmVudHNbaV0uY2FsbChzZWxmLCBmbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGV2ZW50c1tpXS5jYWxsKHNlbGYpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgY3VzdG9tIGV2ZW50LlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBldmVudCBFdmVudCB0eXBlLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICBMaXN0ZW5lciB0byByZW1vdmUuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBmbikge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLFxuICAgICAgICBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdLFxuICAgICAgICBmblN0cmluZyA9IGZuID8gZm4udG9TdHJpbmcoKSA6IG51bGw7XG5cbiAgICAgIGlmIChmblN0cmluZykge1xuICAgICAgICAvLyBsb29wIHRocm91Z2ggZnVuY3Rpb25zIGluIHRoZSBldmVudCBmb3IgY29tcGFyaXNvblxuICAgICAgICBmb3IgKHZhciBpPTA7IGk8ZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGZuU3RyaW5nID09PSBldmVudHNbaV0udG9TdHJpbmcoKSkge1xuICAgICAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2VsZlsnX29uJyArIGV2ZW50XSA9IFtdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5sb2FkIGFuZCBkZXN0cm95IHRoZSBjdXJyZW50IEhvd2wgb2JqZWN0LlxuICAgICAqIFRoaXMgd2lsbCBpbW1lZGlhdGVseSBzdG9wIGFsbCBwbGF5IGluc3RhbmNlcyBhdHRhY2hlZCB0byB0aGlzIHNvdW5kLlxuICAgICAqL1xuICAgIHVubG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIHN0b3AgcGxheWluZyBhbnkgYWN0aXZlIG5vZGVzXG4gICAgICB2YXIgbm9kZXMgPSBzZWxmLl9hdWRpb05vZGU7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fYXVkaW9Ob2RlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIHN0b3AgdGhlIHNvdW5kIGlmIGl0IGlzIGN1cnJlbnRseSBwbGF5aW5nXG4gICAgICAgIGlmICghbm9kZXNbaV0ucGF1c2VkKSB7XG4gICAgICAgICAgc2VsZi5zdG9wKG5vZGVzW2ldLmlkKTtcbiAgICAgICAgICBzZWxmLm9uKCdlbmQnLCBub2Rlc1tpXS5pZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgLy8gcmVtb3ZlIHRoZSBzb3VyY2UgaWYgdXNpbmcgSFRNTDUgQXVkaW9cbiAgICAgICAgICBub2Rlc1tpXS5zcmMgPSAnJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBkaXNjb25uZWN0IHRoZSBvdXRwdXQgZnJvbSB0aGUgbWFzdGVyIGdhaW5cbiAgICAgICAgICBub2Rlc1tpXS5kaXNjb25uZWN0KDApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIG1ha2Ugc3VyZSBhbGwgdGltZW91dHMgYXJlIGNsZWFyZWRcbiAgICAgIGZvciAoaT0wOyBpPHNlbGYuX29uZW5kVGltZXIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX29uZW5kVGltZXJbaV0udGltZXIpO1xuICAgICAgfVxuXG4gICAgICAvLyByZW1vdmUgdGhlIHJlZmVyZW5jZSBpbiB0aGUgZ2xvYmFsIEhvd2xlciBvYmplY3RcbiAgICAgIHZhciBpbmRleCA9IEhvd2xlci5faG93bHMuaW5kZXhPZihzZWxmKTtcbiAgICAgIGlmIChpbmRleCAhPT0gbnVsbCAmJiBpbmRleCA+PSAwKSB7XG4gICAgICAgIEhvd2xlci5faG93bHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgIH1cblxuICAgICAgLy8gZGVsZXRlIHRoaXMgc291bmQgZnJvbSB0aGUgY2FjaGVcbiAgICAgIGRlbGV0ZSBjYWNoZVtzZWxmLl9zcmNdO1xuICAgICAgc2VsZiA9IG51bGw7XG4gICAgfVxuXG4gIH07XG5cbiAgLy8gb25seSBkZWZpbmUgdGhlc2UgZnVuY3Rpb25zIHdoZW4gdXNpbmcgV2ViQXVkaW9cbiAgaWYgKHVzaW5nV2ViQXVkaW8pIHtcblxuICAgIC8qKlxuICAgICAqIEJ1ZmZlciBhIHNvdW5kIGZyb20gVVJMIChvciBmcm9tIGNhY2hlKSBhbmQgZGVjb2RlIHRvIGF1ZGlvIHNvdXJjZSAoV2ViIEF1ZGlvIEFQSSkuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvYmogVGhlIEhvd2wgb2JqZWN0IGZvciB0aGUgc291bmQgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IHVybCBUaGUgcGF0aCB0byB0aGUgc291bmQgZmlsZS5cbiAgICAgKi9cbiAgICB2YXIgbG9hZEJ1ZmZlciA9IGZ1bmN0aW9uKG9iaiwgdXJsKSB7XG4gICAgICAvLyBjaGVjayBpZiB0aGUgYnVmZmVyIGhhcyBhbHJlYWR5IGJlZW4gY2FjaGVkXG4gICAgICBpZiAodXJsIGluIGNhY2hlKSB7XG4gICAgICAgIC8vIHNldCB0aGUgZHVyYXRpb24gZnJvbSB0aGUgY2FjaGVcbiAgICAgICAgb2JqLl9kdXJhdGlvbiA9IGNhY2hlW3VybF0uZHVyYXRpb247XG5cbiAgICAgICAgLy8gbG9hZCB0aGUgc291bmQgaW50byB0aGlzIG9iamVjdFxuICAgICAgICBsb2FkU291bmQob2JqKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgXG4gICAgICBpZiAoL15kYXRhOlteO10rO2Jhc2U2NCwvLnRlc3QodXJsKSkge1xuICAgICAgICAvLyBEZWNvZGUgYmFzZTY0IGRhdGEtVVJJcyBiZWNhdXNlIHNvbWUgYnJvd3NlcnMgY2Fubm90IGxvYWQgZGF0YS1VUklzIHdpdGggWE1MSHR0cFJlcXVlc3QuXG4gICAgICAgIHZhciBkYXRhID0gYXRvYih1cmwuc3BsaXQoJywnKVsxXSk7XG4gICAgICAgIHZhciBkYXRhVmlldyA9IG5ldyBVaW50OEFycmF5KGRhdGEubGVuZ3RoKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBkYXRhVmlld1tpXSA9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgZGVjb2RlQXVkaW9EYXRhKGRhdGFWaWV3LmJ1ZmZlciwgb2JqLCB1cmwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gbG9hZCB0aGUgYnVmZmVyIGZyb20gdGhlIFVSTFxuICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHhoci5vcGVuKCdHRVQnLCB1cmwsIHRydWUpO1xuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGRlY29kZUF1ZGlvRGF0YSh4aHIucmVzcG9uc2UsIG9iaiwgdXJsKTtcbiAgICAgICAgfTtcbiAgICAgICAgeGhyLm9uZXJyb3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAvLyBpZiB0aGVyZSBpcyBhbiBlcnJvciwgc3dpdGNoIHRoZSBzb3VuZCB0byBIVE1MIEF1ZGlvXG4gICAgICAgICAgaWYgKG9iai5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIG9iai5fYnVmZmVyID0gdHJ1ZTtcbiAgICAgICAgICAgIG9iai5fd2ViQXVkaW8gPSBmYWxzZTtcbiAgICAgICAgICAgIG9iai5fYXVkaW9Ob2RlID0gW107XG4gICAgICAgICAgICBkZWxldGUgb2JqLl9nYWluTm9kZTtcbiAgICAgICAgICAgIGRlbGV0ZSBjYWNoZVt1cmxdO1xuICAgICAgICAgICAgb2JqLmxvYWQoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgeGhyLnNlbmQoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIHhoci5vbmVycm9yKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVjb2RlIGF1ZGlvIGRhdGEgZnJvbSBhbiBhcnJheSBidWZmZXIuXG4gICAgICogQHBhcmFtICB7QXJyYXlCdWZmZXJ9IGFycmF5YnVmZmVyIFRoZSBhdWRpbyBkYXRhLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb2JqIFRoZSBIb3dsIG9iamVjdCBmb3IgdGhlIHNvdW5kIHRvIGxvYWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSB1cmwgVGhlIHBhdGggdG8gdGhlIHNvdW5kIGZpbGUuXG4gICAgICovXG4gICAgdmFyIGRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyLCBvYmosIHVybCkge1xuICAgICAgLy8gZGVjb2RlIHRoZSBidWZmZXIgaW50byBhbiBhdWRpbyBzb3VyY2VcbiAgICAgIGN0eC5kZWNvZGVBdWRpb0RhdGEoXG4gICAgICAgIGFycmF5YnVmZmVyLFxuICAgICAgICBmdW5jdGlvbihidWZmZXIpIHtcbiAgICAgICAgICBpZiAoYnVmZmVyKSB7XG4gICAgICAgICAgICBjYWNoZVt1cmxdID0gYnVmZmVyO1xuICAgICAgICAgICAgbG9hZFNvdW5kKG9iaiwgYnVmZmVyKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIG9iai5vbignbG9hZGVycm9yJyk7XG4gICAgICAgIH1cbiAgICAgICk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIEZpbmlzaGVzIGxvYWRpbmcgdGhlIFdlYiBBdWRpbyBBUEkgc291bmQgYW5kIGZpcmVzIHRoZSBsb2FkZWQgZXZlbnRcbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9ICBvYmogICAgVGhlIEhvd2wgb2JqZWN0IGZvciB0aGUgc291bmQgdG8gbG9hZC5cbiAgICAgKiBAcGFyYW0gIHtPYmplY2N0fSBidWZmZXIgVGhlIGRlY29kZWQgYnVmZmVyIHNvdW5kIHNvdXJjZS5cbiAgICAgKi9cbiAgICB2YXIgbG9hZFNvdW5kID0gZnVuY3Rpb24ob2JqLCBidWZmZXIpIHtcbiAgICAgIC8vIHNldCB0aGUgZHVyYXRpb25cbiAgICAgIG9iai5fZHVyYXRpb24gPSAoYnVmZmVyKSA/IGJ1ZmZlci5kdXJhdGlvbiA6IG9iai5fZHVyYXRpb247XG5cbiAgICAgIC8vIHNldHVwIGEgc3ByaXRlIGlmIG5vbmUgaXMgZGVmaW5lZFxuICAgICAgaWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iai5fc3ByaXRlKS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgb2JqLl9zcHJpdGUgPSB7X2RlZmF1bHQ6IFswLCBvYmouX2R1cmF0aW9uICogMTAwMF19O1xuICAgICAgfVxuXG4gICAgICAvLyBmaXJlIHRoZSBsb2FkZWQgZXZlbnRcbiAgICAgIGlmICghb2JqLl9sb2FkZWQpIHtcbiAgICAgICAgb2JqLl9sb2FkZWQgPSB0cnVlO1xuICAgICAgICBvYmoub24oJ2xvYWQnKTtcbiAgICAgIH1cblxuICAgICAgaWYgKG9iai5fYXV0b3BsYXkpIHtcbiAgICAgICAgb2JqLnBsYXkoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgc291bmQgYmFjayBpbnRvIHRoZSBidWZmZXIgc291cmNlLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gb2JqICAgVGhlIHNvdW5kIHRvIGxvYWQuXG4gICAgICogQHBhcmFtICB7QXJyYXl9ICBsb29wICBMb29wIGJvb2xlYW4sIHBvcywgYW5kIGR1cmF0aW9uLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gaWQgICAgKG9wdGlvbmFsKSBUaGUgcGxheSBpbnN0YW5jZSBJRC5cbiAgICAgKi9cbiAgICB2YXIgcmVmcmVzaEJ1ZmZlciA9IGZ1bmN0aW9uKG9iaiwgbG9vcCwgaWQpIHtcbiAgICAgIC8vIGRldGVybWluZSB3aGljaCBub2RlIHRvIGNvbm5lY3QgdG9cbiAgICAgIHZhciBub2RlID0gb2JqLl9ub2RlQnlJZChpZCk7XG5cbiAgICAgIC8vIHNldHVwIHRoZSBidWZmZXIgc291cmNlIGZvciBwbGF5YmFja1xuICAgICAgbm9kZS5idWZmZXJTb3VyY2UgPSBjdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBub2RlLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBjYWNoZVtvYmouX3NyY107XG4gICAgICBub2RlLmJ1ZmZlclNvdXJjZS5jb25uZWN0KG5vZGUucGFubmVyKTtcbiAgICAgIG5vZGUuYnVmZmVyU291cmNlLmxvb3AgPSBsb29wWzBdO1xuICAgICAgaWYgKGxvb3BbMF0pIHtcbiAgICAgICAgbm9kZS5idWZmZXJTb3VyY2UubG9vcFN0YXJ0ID0gbG9vcFsxXTtcbiAgICAgICAgbm9kZS5idWZmZXJTb3VyY2UubG9vcEVuZCA9IGxvb3BbMV0gKyBsb29wWzJdO1xuICAgICAgfVxuICAgICAgbm9kZS5idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gb2JqLl9yYXRlO1xuICAgIH07XG5cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGQgc3VwcG9ydCBmb3IgQU1EIChBc3luY2hyb25vdXMgTW9kdWxlIERlZmluaXRpb24pIGxpYnJhcmllcyBzdWNoIGFzIHJlcXVpcmUuanMuXG4gICAqL1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgSG93bGVyOiBIb3dsZXIsXG4gICAgICAgIEhvd2w6IEhvd2xcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQWRkIHN1cHBvcnQgZm9yIENvbW1vbkpTIGxpYnJhcmllcyBzdWNoIGFzIGJyb3dzZXJpZnkuXG4gICAqL1xuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgZXhwb3J0cy5Ib3dsZXIgPSBIb3dsZXI7XG4gICAgZXhwb3J0cy5Ib3dsID0gSG93bDtcbiAgfVxuXG4gIC8vIGRlZmluZSBnbG9iYWxseSBpbiBjYXNlIEFNRCBpcyBub3QgYXZhaWxhYmxlIG9yIGF2YWlsYWJsZSBidXQgbm90IHVzZWRcblxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuSG93bGVyID0gSG93bGVyO1xuICAgIHdpbmRvdy5Ib3dsID0gSG93bDtcbiAgfVxuXG59KSgpO1xuIiwidmFyIGV2ZXIgPSByZXF1aXJlKCdldmVyJylcbiAgLCB2a2V5ID0gcmVxdWlyZSgndmtleScpXG4gICwgbWF4ID0gTWF0aC5tYXhcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihlbCwgYmluZGluZ3MsIHN0YXRlKSB7XG4gIHZhciByb290ID0gbnVsbFxuICBpZihiaW5kaW5ncyA9PT0gdW5kZWZpbmVkIHx8ICFlbC5vd25lckRvY3VtZW50KSB7XG4gICAgc3RhdGUgPSBiaW5kaW5nc1xuICAgIGJpbmRpbmdzID0gZWxcbiAgICBlbCA9IHRoaXMuZG9jdW1lbnQuYm9keVxuICAgIHRyeSB7XG4gICAgICByb290ID0gd2luZG93LnRvcC5kb2N1bWVudC5ib2R5XG4gICAgfSBjYXRjaChlKXt9XG4gIH1cblxuICB2YXIgZWUgPSBldmVyKGVsKVxuICAgICwgcmUgPSByb290ID8gZXZlcihyb290KSA6IGVlXG4gICAgLCBtZWFzdXJlZCA9IHt9XG4gICAgLCBlbmFibGVkID0gdHJ1ZVxuXG4gIHN0YXRlID0gc3RhdGUgfHwge31cblxuICBzdGF0ZS5iaW5kaW5ncyA9IGJpbmRpbmdzXG5cbiAgLy8gYWx3YXlzIGluaXRpYWxpemUgdGhlIHN0YXRlLlxuICBmb3IodmFyIGtleSBpbiBiaW5kaW5ncykge1xuICAgIGlmKGJpbmRpbmdzW2tleV0gPT09ICdlbmFibGVkJyB8fFxuICAgICAgIGJpbmRpbmdzW2tleV0gPT09ICdlbmFibGUnIHx8XG4gICAgICAgYmluZGluZ3Nba2V5XSA9PT0gJ2Rpc2FibGUnIHx8XG4gICAgICAgYmluZGluZ3Nba2V5XSA9PT0gJ2Rlc3Ryb3knIHx8XG4gICAgICAgYmluZGluZ3Nba2V5XSA9PT0gJ2JpbmRpbmdzJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGJpbmRpbmdzW2tleV0rJyBpcyByZXNlcnZlZCcpXG4gICAgfVxuICAgIHN0YXRlW2JpbmRpbmdzW2tleV1dID0gMFxuICAgIG1lYXN1cmVkW2tleV0gPSAxXG4gIH1cblxuICByZS5vbigna2V5dXAnLCB3cmFwcGVkKG9ub2ZmKGtiLCBmYWxzZSkpKVxuICByZS5vbigna2V5ZG93bicsIHdyYXBwZWQob25vZmYoa2IsIHRydWUpKSlcbiAgZWUub24oJ21vdXNldXAnLCB3cmFwcGVkKG9ub2ZmKG1vdXNlLCBmYWxzZSkpKVxuICBlZS5vbignbW91c2Vkb3duJywgd3JhcHBlZChvbm9mZihtb3VzZSwgdHJ1ZSkpKVxuXG4gIHN0YXRlLmVuYWJsZWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZW5hYmxlZFxuICB9XG5cbiAgc3RhdGUuZW5hYmxlID0gZW5hYmxlX2Rpc2FibGUodHJ1ZSlcbiAgc3RhdGUuZGlzYWJsZSA9IGVuYWJsZV9kaXNhYmxlKGZhbHNlKVxuICBzdGF0ZS5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgcmUucmVtb3ZlQWxsTGlzdGVuZXJzKClcbiAgICBlZS5yZW1vdmVBbGxMaXN0ZW5lcnMoKVxuICB9XG4gIHJldHVybiBzdGF0ZVxuXG4gIGZ1bmN0aW9uIGNsZWFyKCkge1xuICAgIC8vIGFsd2F5cyBpbml0aWFsaXplIHRoZSBzdGF0ZS5cbiAgICBmb3IodmFyIGtleSBpbiBiaW5kaW5ncykge1xuICAgICAgc3RhdGVbYmluZGluZ3Nba2V5XV0gPSAwXG4gICAgICBtZWFzdXJlZFtrZXldID0gMVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGVuYWJsZV9kaXNhYmxlKG9uX29yX29mZikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNsZWFyKClcbiAgICAgIGVuYWJsZWQgPSBvbl9vcl9vZmZcbiAgICAgIHJldHVybiB0aGlzXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gd3JhcHBlZChmbikge1xuICAgIHJldHVybiBmdW5jdGlvbihldikge1xuICAgICAgaWYoZW5hYmxlZCkge1xuICAgICAgICBmbihldilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9ub2ZmKGZpbmQsIG9uX29yX29mZikge1xuICAgIHJldHVybiBmdW5jdGlvbihldikge1xuICAgICAgdmFyIGtleSA9IGZpbmQoZXYpXG4gICAgICAgICwgYmluZGluZyA9IGJpbmRpbmdzW2tleV1cblxuICAgICAgaWYoYmluZGluZykge1xuICAgICAgICBzdGF0ZVtiaW5kaW5nXSArPSBvbl9vcl9vZmYgPyBtYXgobWVhc3VyZWRba2V5XS0tLCAwKSA6IC0obWVhc3VyZWRba2V5XSA9IDEpXG5cbiAgICAgICAgaWYoIW9uX29yX29mZiAmJiBzdGF0ZVtiaW5kaW5nXSA8IDApIHtcbiAgICAgICAgICBzdGF0ZVtiaW5kaW5nXSA9IDBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1vdXNlKGV2KSB7XG4gICAgcmV0dXJuICc8bW91c2UgJytldi53aGljaCsnPidcbiAgfVxuXG4gIGZ1bmN0aW9uIGtiKGV2KSB7XG4gICAgcmV0dXJuIHZrZXlbZXYua2V5Q29kZV0gfHwgZXYuY2hhclxuICB9XG59XG4iLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChlbGVtKSB7XG4gICAgcmV0dXJuIG5ldyBFdmVyKGVsZW0pO1xufTtcblxuZnVuY3Rpb24gRXZlciAoZWxlbSkge1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW07XG59XG5cbkV2ZXIucHJvdG90eXBlID0gbmV3IEV2ZW50RW1pdHRlcjtcblxuRXZlci5wcm90b3R5cGUub24gPSBmdW5jdGlvbiAobmFtZSwgY2IsIHVzZUNhcHR1cmUpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cykgdGhpcy5fZXZlbnRzID0ge307XG4gICAgaWYgKCF0aGlzLl9ldmVudHNbbmFtZV0pIHRoaXMuX2V2ZW50c1tuYW1lXSA9IFtdO1xuICAgIHRoaXMuX2V2ZW50c1tuYW1lXS5wdXNoKGNiKTtcbiAgICB0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihuYW1lLCBjYiwgdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5FdmVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IEV2ZXIucHJvdG90eXBlLm9uO1xuXG5FdmVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uICh0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSkge1xuICAgIGlmICghdGhpcy5fZXZlbnRzKSB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lciwgdXNlQ2FwdHVyZSB8fCBmYWxzZSk7XG4gICAgXG4gICAgdmFyIHhzID0gdGhpcy5saXN0ZW5lcnModHlwZSk7XG4gICAgdmFyIGl4ID0geHMuaW5kZXhPZihsaXN0ZW5lcik7XG4gICAgaWYgKGl4ID49IDApIHhzLnNwbGljZShpeCwgMSk7XG5cbiAgICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uICh0eXBlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGZ1bmN0aW9uIHJlbW92ZUFsbCAodCkge1xuICAgICAgICB2YXIgeHMgPSBzZWxmLmxpc3RlbmVycyh0KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB4cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5yZW1vdmVMaXN0ZW5lcih0LCB4c1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgaWYgKHR5cGUpIHtcbiAgICAgICAgcmVtb3ZlQWxsKHR5cGUpXG4gICAgfVxuICAgIGVsc2UgaWYgKHNlbGYuX2V2ZW50cykge1xuICAgICAgICBmb3IgKHZhciBrZXkgaW4gc2VsZi5fZXZlbnRzKSB7XG4gICAgICAgICAgICBpZiAoa2V5KSByZW1vdmVBbGwoa2V5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMuYXBwbHkoc2VsZiwgYXJndW1lbnRzKTtcbn1cblxudmFyIGluaXRTaWduYXR1cmVzID0gcmVxdWlyZSgnLi9pbml0Lmpzb24nKTtcblxuRXZlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uIChuYW1lLCBldikge1xuICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgZXYgPSBuYW1lO1xuICAgICAgICBuYW1lID0gZXYudHlwZTtcbiAgICB9XG4gICAgXG4gICAgaWYgKCFpc0V2ZW50KGV2KSkge1xuICAgICAgICB2YXIgdHlwZSA9IEV2ZXIudHlwZU9mKG5hbWUpO1xuICAgICAgICBcbiAgICAgICAgdmFyIG9wdHMgPSBldiB8fCB7fTtcbiAgICAgICAgaWYgKG9wdHMudHlwZSA9PT0gdW5kZWZpbmVkKSBvcHRzLnR5cGUgPSBuYW1lO1xuICAgICAgICBcbiAgICAgICAgZXYgPSBkb2N1bWVudC5jcmVhdGVFdmVudCh0eXBlICsgJ3MnKTtcbiAgICAgICAgdmFyIGluaXQgPSB0eXBlb2YgZXZbJ2luaXQnICsgdHlwZV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICAgID8gJ2luaXQnICsgdHlwZSA6ICdpbml0RXZlbnQnXG4gICAgICAgIDtcbiAgICAgICAgXG4gICAgICAgIHZhciBzaWcgPSBpbml0U2lnbmF0dXJlc1tpbml0XTtcbiAgICAgICAgdmFyIHVzZWQgPSB7fTtcbiAgICAgICAgdmFyIGFyZ3MgPSBbXTtcbiAgICAgICAgXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2lnLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIga2V5ID0gc2lnW2ldO1xuICAgICAgICAgICAgYXJncy5wdXNoKG9wdHNba2V5XSk7XG4gICAgICAgICAgICB1c2VkW2tleV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGV2W2luaXRdLmFwcGx5KGV2LCBhcmdzKTtcbiAgICAgICAgXG4gICAgICAgIC8vIGF0dGFjaCByZW1haW5pbmcgdW51c2VkIG9wdGlvbnMgdG8gdGhlIG9iamVjdFxuICAgICAgICBmb3IgKHZhciBrZXkgaW4gb3B0cykge1xuICAgICAgICAgICAgaWYgKCF1c2VkW2tleV0pIGV2W2tleV0gPSBvcHRzW2tleV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZWxlbWVudC5kaXNwYXRjaEV2ZW50KGV2KTtcbn07XG5cbmZ1bmN0aW9uIGlzRXZlbnQgKGV2KSB7XG4gICAgdmFyIHMgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoZXYpO1xuICAgIHJldHVybiAvXFxbb2JqZWN0IFxcUytFdmVudFxcXS8udGVzdChzKTtcbn1cblxuRXZlci50eXBlcyA9IHJlcXVpcmUoJy4vdHlwZXMuanNvbicpO1xuRXZlci50eXBlT2YgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciB0eXBlcyA9IHt9O1xuICAgIGZvciAodmFyIGtleSBpbiBFdmVyLnR5cGVzKSB7XG4gICAgICAgIHZhciB0cyA9IEV2ZXIudHlwZXNba2V5XTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHlwZXNbdHNbaV1dID0ga2V5O1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIHJldHVybiBmdW5jdGlvbiAobmFtZSkge1xuICAgICAgICByZXR1cm4gdHlwZXNbbmFtZV0gfHwgJ0V2ZW50JztcbiAgICB9O1xufSkoKTs7XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiaW5pdEV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJjYW5CdWJibGVcIiwgXG4gICAgXCJjYW5jZWxhYmxlXCJcbiAgXSxcbiAgXCJpbml0VUlFdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiY2FuQnViYmxlXCIsIFxuICAgIFwiY2FuY2VsYWJsZVwiLCBcbiAgICBcInZpZXdcIiwgXG4gICAgXCJkZXRhaWxcIlxuICBdLFxuICBcImluaXRNb3VzZUV2ZW50XCIgOiBbXG4gICAgXCJ0eXBlXCIsXG4gICAgXCJjYW5CdWJibGVcIiwgXG4gICAgXCJjYW5jZWxhYmxlXCIsIFxuICAgIFwidmlld1wiLCBcbiAgICBcImRldGFpbFwiLCBcbiAgICBcInNjcmVlblhcIiwgXG4gICAgXCJzY3JlZW5ZXCIsIFxuICAgIFwiY2xpZW50WFwiLCBcbiAgICBcImNsaWVudFlcIiwgXG4gICAgXCJjdHJsS2V5XCIsIFxuICAgIFwiYWx0S2V5XCIsIFxuICAgIFwic2hpZnRLZXlcIiwgXG4gICAgXCJtZXRhS2V5XCIsIFxuICAgIFwiYnV0dG9uXCIsXG4gICAgXCJyZWxhdGVkVGFyZ2V0XCJcbiAgXSxcbiAgXCJpbml0TXV0YXRpb25FdmVudFwiIDogW1xuICAgIFwidHlwZVwiLFxuICAgIFwiY2FuQnViYmxlXCIsIFxuICAgIFwiY2FuY2VsYWJsZVwiLCBcbiAgICBcInJlbGF0ZWROb2RlXCIsIFxuICAgIFwicHJldlZhbHVlXCIsIFxuICAgIFwibmV3VmFsdWVcIiwgXG4gICAgXCJhdHRyTmFtZVwiLCBcbiAgICBcImF0dHJDaGFuZ2VcIlxuICBdXG59XG4iLCJtb2R1bGUuZXhwb3J0cz17XG4gIFwiTW91c2VFdmVudFwiIDogW1xuICAgIFwiY2xpY2tcIixcbiAgICBcIm1vdXNlZG93blwiLFxuICAgIFwibW91c2V1cFwiLFxuICAgIFwibW91c2VvdmVyXCIsXG4gICAgXCJtb3VzZW1vdmVcIixcbiAgICBcIm1vdXNlb3V0XCJcbiAgXSxcbiAgXCJLZXlCb2FyZEV2ZW50XCIgOiBbXG4gICAgXCJrZXlkb3duXCIsXG4gICAgXCJrZXl1cFwiLFxuICAgIFwia2V5cHJlc3NcIlxuICBdLFxuICBcIk11dGF0aW9uRXZlbnRcIiA6IFtcbiAgICBcIkRPTVN1YnRyZWVNb2RpZmllZFwiLFxuICAgIFwiRE9NTm9kZUluc2VydGVkXCIsXG4gICAgXCJET01Ob2RlUmVtb3ZlZFwiLFxuICAgIFwiRE9NTm9kZVJlbW92ZWRGcm9tRG9jdW1lbnRcIixcbiAgICBcIkRPTU5vZGVJbnNlcnRlZEludG9Eb2N1bWVudFwiLFxuICAgIFwiRE9NQXR0ck1vZGlmaWVkXCIsXG4gICAgXCJET01DaGFyYWN0ZXJEYXRhTW9kaWZpZWRcIlxuICBdLFxuICBcIkhUTUxFdmVudFwiIDogW1xuICAgIFwibG9hZFwiLFxuICAgIFwidW5sb2FkXCIsXG4gICAgXCJhYm9ydFwiLFxuICAgIFwiZXJyb3JcIixcbiAgICBcInNlbGVjdFwiLFxuICAgIFwiY2hhbmdlXCIsXG4gICAgXCJzdWJtaXRcIixcbiAgICBcInJlc2V0XCIsXG4gICAgXCJmb2N1c1wiLFxuICAgIFwiYmx1clwiLFxuICAgIFwicmVzaXplXCIsXG4gICAgXCJzY3JvbGxcIlxuICBdLFxuICBcIlVJRXZlbnRcIiA6IFtcbiAgICBcIkRPTUZvY3VzSW5cIixcbiAgICBcIkRPTUZvY3VzT3V0XCIsXG4gICAgXCJET01BY3RpdmF0ZVwiXG4gIF1cbn1cbiIsInZhciB1YSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQgOiAnJ1xuICAsIGlzT1NYID0gL09TIFgvLnRlc3QodWEpXG4gICwgaXNPcGVyYSA9IC9PcGVyYS8udGVzdCh1YSlcbiAgLCBtYXliZUZpcmVmb3ggPSAhL2xpa2UgR2Vja28vLnRlc3QodWEpICYmICFpc09wZXJhXG5cbnZhciBpLCBvdXRwdXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgMDogIGlzT1NYID8gJzxtZW51PicgOiAnPFVOSz4nXG4sIDE6ICAnPG1vdXNlIDE+J1xuLCAyOiAgJzxtb3VzZSAyPidcbiwgMzogICc8YnJlYWs+J1xuLCA0OiAgJzxtb3VzZSAzPidcbiwgNTogICc8bW91c2UgND4nXG4sIDY6ICAnPG1vdXNlIDU+J1xuLCA4OiAgJzxiYWNrc3BhY2U+J1xuLCA5OiAgJzx0YWI+J1xuLCAxMjogJzxjbGVhcj4nXG4sIDEzOiAnPGVudGVyPidcbiwgMTY6ICc8c2hpZnQ+J1xuLCAxNzogJzxjb250cm9sPidcbiwgMTg6ICc8YWx0PidcbiwgMTk6ICc8cGF1c2U+J1xuLCAyMDogJzxjYXBzLWxvY2s+J1xuLCAyMTogJzxpbWUtaGFuZ3VsPidcbiwgMjM6ICc8aW1lLWp1bmphPidcbiwgMjQ6ICc8aW1lLWZpbmFsPidcbiwgMjU6ICc8aW1lLWthbmppPidcbiwgMjc6ICc8ZXNjYXBlPidcbiwgMjg6ICc8aW1lLWNvbnZlcnQ+J1xuLCAyOTogJzxpbWUtbm9uY29udmVydD4nXG4sIDMwOiAnPGltZS1hY2NlcHQ+J1xuLCAzMTogJzxpbWUtbW9kZS1jaGFuZ2U+J1xuLCAyNzogJzxlc2NhcGU+J1xuLCAzMjogJzxzcGFjZT4nXG4sIDMzOiAnPHBhZ2UtdXA+J1xuLCAzNDogJzxwYWdlLWRvd24+J1xuLCAzNTogJzxlbmQ+J1xuLCAzNjogJzxob21lPidcbiwgMzc6ICc8bGVmdD4nXG4sIDM4OiAnPHVwPidcbiwgMzk6ICc8cmlnaHQ+J1xuLCA0MDogJzxkb3duPidcbiwgNDE6ICc8c2VsZWN0PidcbiwgNDI6ICc8cHJpbnQ+J1xuLCA0MzogJzxleGVjdXRlPidcbiwgNDQ6ICc8c25hcHNob3Q+J1xuLCA0NTogJzxpbnNlcnQ+J1xuLCA0NjogJzxkZWxldGU+J1xuLCA0NzogJzxoZWxwPidcbiwgOTE6ICc8bWV0YT4nICAvLyBtZXRhLWxlZnQgLS0gbm8gb25lIGhhbmRsZXMgbGVmdCBhbmQgcmlnaHQgcHJvcGVybHksIHNvIHdlIGNvZXJjZSBpbnRvIG9uZS5cbiwgOTI6ICc8bWV0YT4nICAvLyBtZXRhLXJpZ2h0XG4sIDkzOiBpc09TWCA/ICc8bWV0YT4nIDogJzxtZW51PicgICAgICAvLyBjaHJvbWUsb3BlcmEsc2FmYXJpIGFsbCByZXBvcnQgdGhpcyBmb3IgbWV0YS1yaWdodCAob3N4IG1icCkuXG4sIDk1OiAnPHNsZWVwPidcbiwgMTA2OiAnPG51bS0qPidcbiwgMTA3OiAnPG51bS0rPidcbiwgMTA4OiAnPG51bS1lbnRlcj4nXG4sIDEwOTogJzxudW0tLT4nXG4sIDExMDogJzxudW0tLj4nXG4sIDExMTogJzxudW0tLz4nXG4sIDE0NDogJzxudW0tbG9jaz4nXG4sIDE0NTogJzxzY3JvbGwtbG9jaz4nXG4sIDE2MDogJzxzaGlmdC1sZWZ0PidcbiwgMTYxOiAnPHNoaWZ0LXJpZ2h0PidcbiwgMTYyOiAnPGNvbnRyb2wtbGVmdD4nXG4sIDE2MzogJzxjb250cm9sLXJpZ2h0PidcbiwgMTY0OiAnPGFsdC1sZWZ0PidcbiwgMTY1OiAnPGFsdC1yaWdodD4nXG4sIDE2NjogJzxicm93c2VyLWJhY2s+J1xuLCAxNjc6ICc8YnJvd3Nlci1mb3J3YXJkPidcbiwgMTY4OiAnPGJyb3dzZXItcmVmcmVzaD4nXG4sIDE2OTogJzxicm93c2VyLXN0b3A+J1xuLCAxNzA6ICc8YnJvd3Nlci1zZWFyY2g+J1xuLCAxNzE6ICc8YnJvd3Nlci1mYXZvcml0ZXM+J1xuLCAxNzI6ICc8YnJvd3Nlci1ob21lPidcblxuICAvLyBmZi9vc3ggcmVwb3J0cyAnPHZvbHVtZS1tdXRlPicgZm9yICctJ1xuLCAxNzM6IGlzT1NYICYmIG1heWJlRmlyZWZveCA/ICctJyA6ICc8dm9sdW1lLW11dGU+J1xuLCAxNzQ6ICc8dm9sdW1lLWRvd24+J1xuLCAxNzU6ICc8dm9sdW1lLXVwPidcbiwgMTc2OiAnPG5leHQtdHJhY2s+J1xuLCAxNzc6ICc8cHJldi10cmFjaz4nXG4sIDE3ODogJzxzdG9wPidcbiwgMTc5OiAnPHBsYXktcGF1c2U+J1xuLCAxODA6ICc8bGF1bmNoLW1haWw+J1xuLCAxODE6ICc8bGF1bmNoLW1lZGlhLXNlbGVjdD4nXG4sIDE4MjogJzxsYXVuY2gtYXBwIDE+J1xuLCAxODM6ICc8bGF1bmNoLWFwcCAyPidcbiwgMTg2OiAnOydcbiwgMTg3OiAnPSdcbiwgMTg4OiAnLCdcbiwgMTg5OiAnLSdcbiwgMTkwOiAnLidcbiwgMTkxOiAnLydcbiwgMTkyOiAnYCdcbiwgMjE5OiAnWydcbiwgMjIwOiAnXFxcXCdcbiwgMjIxOiAnXSdcbiwgMjIyOiBcIidcIlxuLCAyMjM6ICc8bWV0YT4nXG4sIDIyNDogJzxtZXRhPicgICAgICAgLy8gZmlyZWZveCByZXBvcnRzIG1ldGEgaGVyZS5cbiwgMjI2OiAnPGFsdC1ncj4nXG4sIDIyOTogJzxpbWUtcHJvY2Vzcz4nXG4sIDIzMTogaXNPcGVyYSA/ICdgJyA6ICc8dW5pY29kZT4nXG4sIDI0NjogJzxhdHRlbnRpb24+J1xuLCAyNDc6ICc8Y3JzZWw+J1xuLCAyNDg6ICc8ZXhzZWw+J1xuLCAyNDk6ICc8ZXJhc2UtZW9mPidcbiwgMjUwOiAnPHBsYXk+J1xuLCAyNTE6ICc8em9vbT4nXG4sIDI1MjogJzxuby1uYW1lPidcbiwgMjUzOiAnPHBhLTE+J1xuLCAyNTQ6ICc8Y2xlYXI+J1xufVxuXG5mb3IoaSA9IDU4OyBpIDwgNjU7ICsraSkge1xuICBvdXRwdXRbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXG59XG5cbi8vIDAtOVxuZm9yKGkgPSA0ODsgaSA8IDU4OyArK2kpIHtcbiAgb3V0cHV0W2ldID0gKGkgLSA0OCkrJydcbn1cblxuLy8gQS1aXG5mb3IoaSA9IDY1OyBpIDwgOTE7ICsraSkge1xuICBvdXRwdXRbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXG59XG5cbi8vIG51bTAtOVxuZm9yKGkgPSA5NjsgaSA8IDEwNjsgKytpKSB7XG4gIG91dHB1dFtpXSA9ICc8bnVtLScrKGkgLSA5NikrJz4nXG59XG5cbi8vIEYxLUYyNFxuZm9yKGkgPSAxMTI7IGkgPCAxMzY7ICsraSkge1xuICBvdXRwdXRbaV0gPSAnRicrKGktMTExKVxufVxuIiwiLyoqXG4gKiBAbGljZW5zZVxuICogcGl4aS5qcyAtIHYyLjIuMFxuICogQ29weXJpZ2h0IChjKSAyMDEyLTIwMTQsIE1hdCBHcm92ZXNcbiAqIGh0dHA6Ly9nb29kYm95ZGlnaXRhbC5jb20vXG4gKlxuICogQ29tcGlsZWQ6IDIwMTQtMTItMTJcbiAqXG4gKiBwaXhpLmpzIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cbiAqIGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwXG4gKi9cbihmdW5jdGlvbigpe3ZhciBhPXRoaXMsYj1ifHx7fTtiLldFQkdMX1JFTkRFUkVSPTAsYi5DQU5WQVNfUkVOREVSRVI9MSxiLlZFUlNJT049XCJ2Mi4yLjBcIixiLmJsZW5kTW9kZXM9e05PUk1BTDowLEFERDoxLE1VTFRJUExZOjIsU0NSRUVOOjMsT1ZFUkxBWTo0LERBUktFTjo1LExJR0hURU46NixDT0xPUl9ET0RHRTo3LENPTE9SX0JVUk46OCxIQVJEX0xJR0hUOjksU09GVF9MSUdIVDoxMCxESUZGRVJFTkNFOjExLEVYQ0xVU0lPTjoxMixIVUU6MTMsU0FUVVJBVElPTjoxNCxDT0xPUjoxNSxMVU1JTk9TSVRZOjE2fSxiLnNjYWxlTW9kZXM9e0RFRkFVTFQ6MCxMSU5FQVI6MCxORUFSRVNUOjF9LGIuX1VJRD0wLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBGbG9hdDMyQXJyYXk/KGIuRmxvYXQzMkFycmF5PUZsb2F0MzJBcnJheSxiLlVpbnQxNkFycmF5PVVpbnQxNkFycmF5LGIuVWludDMyQXJyYXk9VWludDMyQXJyYXksYi5BcnJheUJ1ZmZlcj1BcnJheUJ1ZmZlcik6KGIuRmxvYXQzMkFycmF5PUFycmF5LGIuVWludDE2QXJyYXk9QXJyYXkpLGIuSU5URVJBQ1RJT05fRlJFUVVFTkNZPTMwLGIuQVVUT19QUkVWRU5UX0RFRkFVTFQ9ITAsYi5QSV8yPTIqTWF0aC5QSSxiLlJBRF9UT19ERUc9MTgwL01hdGguUEksYi5ERUdfVE9fUkFEPU1hdGguUEkvMTgwLGIuUkVUSU5BX1BSRUZJWD1cIkAyeFwiLGIuZG9udFNheUhlbGxvPSExLGIuZGVmYXVsdFJlbmRlck9wdGlvbnM9e3ZpZXc6bnVsbCx0cmFuc3BhcmVudDohMSxhbnRpYWxpYXM6ITEscHJlc2VydmVEcmF3aW5nQnVmZmVyOiExLHJlc29sdXRpb246MSxjbGVhckJlZm9yZVJlbmRlcjohMCxhdXRvUmVzaXplOiExfSxiLnNheUhlbGxvPWZ1bmN0aW9uKGEpe2lmKCFiLmRvbnRTYXlIZWxsbyl7aWYobmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLmluZGV4T2YoXCJjaHJvbWVcIik+LTEpe3ZhciBjPVtcIiVjICVjICVjIFBpeGkuanMgXCIrYi5WRVJTSU9OK1wiIC0gXCIrYStcIiAgJWMgICVjICBodHRwOi8vd3d3LnBpeGlqcy5jb20vICAlYyAlYyDimaUlY+KZpSVj4pmlIFwiLFwiYmFja2dyb3VuZDogI2ZmNjZhNVwiLFwiYmFja2dyb3VuZDogI2ZmNjZhNVwiLFwiY29sb3I6ICNmZjY2YTU7IGJhY2tncm91bmQ6ICMwMzAzMDc7XCIsXCJiYWNrZ3JvdW5kOiAjZmY2NmE1XCIsXCJiYWNrZ3JvdW5kOiAjZmZjM2RjXCIsXCJiYWNrZ3JvdW5kOiAjZmY2NmE1XCIsXCJjb2xvcjogI2ZmMjQyNDsgYmFja2dyb3VuZDogI2ZmZlwiLFwiY29sb3I6ICNmZjI0MjQ7IGJhY2tncm91bmQ6ICNmZmZcIixcImNvbG9yOiAjZmYyNDI0OyBiYWNrZ3JvdW5kOiAjZmZmXCJdO2NvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsYyl9ZWxzZSB3aW5kb3cuY29uc29sZSYmY29uc29sZS5sb2coXCJQaXhpLmpzIFwiK2IuVkVSU0lPTitcIiAtIGh0dHA6Ly93d3cucGl4aWpzLmNvbS9cIik7Yi5kb250U2F5SGVsbG89ITB9fSxiLlBvaW50PWZ1bmN0aW9uKGEsYil7dGhpcy54PWF8fDAsdGhpcy55PWJ8fDB9LGIuUG9pbnQucHJvdG90eXBlLmNsb25lPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBiLlBvaW50KHRoaXMueCx0aGlzLnkpfSxiLlBvaW50LnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8KDAhPT1iP3RoaXMueDowKX0sYi5Qb2ludC5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Qb2ludCxiLlJlY3RhbmdsZT1mdW5jdGlvbihhLGIsYyxkKXt0aGlzLng9YXx8MCx0aGlzLnk9Ynx8MCx0aGlzLndpZHRoPWN8fDAsdGhpcy5oZWlnaHQ9ZHx8MH0sYi5SZWN0YW5nbGUucHJvdG90eXBlLmNsb25lPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBiLlJlY3RhbmdsZSh0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpfSxiLlJlY3RhbmdsZS5wcm90b3R5cGUuY29udGFpbnM9ZnVuY3Rpb24oYSxiKXtpZih0aGlzLndpZHRoPD0wfHx0aGlzLmhlaWdodDw9MClyZXR1cm4hMTt2YXIgYz10aGlzLng7aWYoYT49YyYmYTw9Yyt0aGlzLndpZHRoKXt2YXIgZD10aGlzLnk7aWYoYj49ZCYmYjw9ZCt0aGlzLmhlaWdodClyZXR1cm4hMH1yZXR1cm4hMX0sYi5SZWN0YW5nbGUucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUmVjdGFuZ2xlLGIuRW1wdHlSZWN0YW5nbGU9bmV3IGIuUmVjdGFuZ2xlKDAsMCwwLDApLGIuUG9seWdvbj1mdW5jdGlvbihhKXtpZihhIGluc3RhbmNlb2YgQXJyYXl8fChhPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpLGFbMF1pbnN0YW5jZW9mIGIuUG9pbnQpe2Zvcih2YXIgYz1bXSxkPTAsZT1hLmxlbmd0aDtlPmQ7ZCsrKWMucHVzaChhW2RdLngsYVtkXS55KTthPWN9dGhpcy5jbG9zZWQ9ITAsdGhpcy5wb2ludHM9YX0sYi5Qb2x5Z29uLnByb3RvdHlwZS5jbG9uZT1mdW5jdGlvbigpe3ZhciBhPXRoaXMucG9pbnRzLnNsaWNlKCk7cmV0dXJuIG5ldyBiLlBvbHlnb24oYSl9LGIuUG9seWdvbi5wcm90b3R5cGUuY29udGFpbnM9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9ITEsZD10aGlzLnBvaW50cy5sZW5ndGgvMixlPTAsZj1kLTE7ZD5lO2Y9ZSsrKXt2YXIgZz10aGlzLnBvaW50c1syKmVdLGg9dGhpcy5wb2ludHNbMiplKzFdLGk9dGhpcy5wb2ludHNbMipmXSxqPXRoaXMucG9pbnRzWzIqZisxXSxrPWg+YiE9aj5iJiYoaS1nKSooYi1oKS8oai1oKStnPmE7ayYmKGM9IWMpfXJldHVybiBjfSxiLlBvbHlnb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUG9seWdvbixiLkNpcmNsZT1mdW5jdGlvbihhLGIsYyl7dGhpcy54PWF8fDAsdGhpcy55PWJ8fDAsdGhpcy5yYWRpdXM9Y3x8MH0sYi5DaXJjbGUucHJvdG90eXBlLmNsb25lPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBiLkNpcmNsZSh0aGlzLngsdGhpcy55LHRoaXMucmFkaXVzKX0sYi5DaXJjbGUucHJvdG90eXBlLmNvbnRhaW5zPWZ1bmN0aW9uKGEsYil7aWYodGhpcy5yYWRpdXM8PTApcmV0dXJuITE7dmFyIGM9dGhpcy54LWEsZD10aGlzLnktYixlPXRoaXMucmFkaXVzKnRoaXMucmFkaXVzO3JldHVybiBjKj1jLGQqPWQsZT49YytkfSxiLkNpcmNsZS5wcm90b3R5cGUuZ2V0Qm91bmRzPWZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBiLlJlY3RhbmdsZSh0aGlzLngtdGhpcy5yYWRpdXMsdGhpcy55LXRoaXMucmFkaXVzLDIqdGhpcy5yYWRpdXMsMip0aGlzLnJhZGl1cyl9LGIuQ2lyY2xlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNpcmNsZSxiLkVsbGlwc2U9ZnVuY3Rpb24oYSxiLGMsZCl7dGhpcy54PWF8fDAsdGhpcy55PWJ8fDAsdGhpcy53aWR0aD1jfHwwLHRoaXMuaGVpZ2h0PWR8fDB9LGIuRWxsaXBzZS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuRWxsaXBzZSh0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpfSxiLkVsbGlwc2UucHJvdG90eXBlLmNvbnRhaW5zPWZ1bmN0aW9uKGEsYil7aWYodGhpcy53aWR0aDw9MHx8dGhpcy5oZWlnaHQ8PTApcmV0dXJuITE7dmFyIGM9KGEtdGhpcy54KS90aGlzLndpZHRoLGQ9KGItdGhpcy55KS90aGlzLmhlaWdodDtyZXR1cm4gYyo9YyxkKj1kLDE+PWMrZH0sYi5FbGxpcHNlLnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuUmVjdGFuZ2xlKHRoaXMueC10aGlzLndpZHRoLHRoaXMueS10aGlzLmhlaWdodCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KX0sYi5FbGxpcHNlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkVsbGlwc2UsYi5Sb3VuZGVkUmVjdGFuZ2xlPWZ1bmN0aW9uKGEsYixjLGQsZSl7dGhpcy54PWF8fDAsdGhpcy55PWJ8fDAsdGhpcy53aWR0aD1jfHwwLHRoaXMuaGVpZ2h0PWR8fDAsdGhpcy5yYWRpdXM9ZXx8MjB9LGIuUm91bmRlZFJlY3RhbmdsZS5wcm90b3R5cGUuY2xvbmU9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IGIuUm91bmRlZFJlY3RhbmdsZSh0aGlzLngsdGhpcy55LHRoaXMud2lkdGgsdGhpcy5oZWlnaHQsdGhpcy5yYWRpdXMpfSxiLlJvdW5kZWRSZWN0YW5nbGUucHJvdG90eXBlLmNvbnRhaW5zPWZ1bmN0aW9uKGEsYil7aWYodGhpcy53aWR0aDw9MHx8dGhpcy5oZWlnaHQ8PTApcmV0dXJuITE7dmFyIGM9dGhpcy54O2lmKGE+PWMmJmE8PWMrdGhpcy53aWR0aCl7dmFyIGQ9dGhpcy55O2lmKGI+PWQmJmI8PWQrdGhpcy5oZWlnaHQpcmV0dXJuITB9cmV0dXJuITF9LGIuUm91bmRlZFJlY3RhbmdsZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Sb3VuZGVkUmVjdGFuZ2xlLGIuTWF0cml4PWZ1bmN0aW9uKCl7dGhpcy5hPTEsdGhpcy5iPTAsdGhpcy5jPTAsdGhpcy5kPTEsdGhpcy50eD0wLHRoaXMudHk9MH0sYi5NYXRyaXgucHJvdG90eXBlLmZyb21BcnJheT1mdW5jdGlvbihhKXt0aGlzLmE9YVswXSx0aGlzLmI9YVsxXSx0aGlzLmM9YVszXSx0aGlzLmQ9YVs0XSx0aGlzLnR4PWFbMl0sdGhpcy50eT1hWzVdfSxiLk1hdHJpeC5wcm90b3R5cGUudG9BcnJheT1mdW5jdGlvbihhKXt0aGlzLmFycmF5fHwodGhpcy5hcnJheT1uZXcgYi5GbG9hdDMyQXJyYXkoOSkpO3ZhciBjPXRoaXMuYXJyYXk7cmV0dXJuIGE/KGNbMF09dGhpcy5hLGNbMV09dGhpcy5iLGNbMl09MCxjWzNdPXRoaXMuYyxjWzRdPXRoaXMuZCxjWzVdPTAsY1s2XT10aGlzLnR4LGNbN109dGhpcy50eSxjWzhdPTEpOihjWzBdPXRoaXMuYSxjWzFdPXRoaXMuYyxjWzJdPXRoaXMudHgsY1szXT10aGlzLmIsY1s0XT10aGlzLmQsY1s1XT10aGlzLnR5LGNbNl09MCxjWzddPTAsY1s4XT0xKSxjfSxiLk1hdHJpeC5wcm90b3R5cGUuYXBwbHk9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYz1jfHxuZXcgYi5Qb2ludCxjLng9dGhpcy5hKmEueCt0aGlzLmMqYS55K3RoaXMudHgsYy55PXRoaXMuYiphLngrdGhpcy5kKmEueSt0aGlzLnR5LGN9LGIuTWF0cml4LnByb3RvdHlwZS5hcHBseUludmVyc2U9ZnVuY3Rpb24oYSxjKXtjPWN8fG5ldyBiLlBvaW50O3ZhciBkPTEvKHRoaXMuYSp0aGlzLmQrdGhpcy5jKi10aGlzLmIpO3JldHVybiBjLng9dGhpcy5kKmQqYS54Ky10aGlzLmMqZCphLnkrKHRoaXMudHkqdGhpcy5jLXRoaXMudHgqdGhpcy5kKSpkLGMueT10aGlzLmEqZCphLnkrLXRoaXMuYipkKmEueCsoLXRoaXMudHkqdGhpcy5hK3RoaXMudHgqdGhpcy5iKSpkLGN9LGIuTWF0cml4LnByb3RvdHlwZS50cmFuc2xhdGU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy50eCs9YSx0aGlzLnR5Kz1iLHRoaXN9LGIuTWF0cml4LnByb3RvdHlwZS5zY2FsZT1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmEqPWEsdGhpcy5kKj1iLHRoaXMuYyo9YSx0aGlzLmIqPWIsdGhpcy50eCo9YSx0aGlzLnR5Kj1iLHRoaXN9LGIuTWF0cml4LnByb3RvdHlwZS5yb3RhdGU9ZnVuY3Rpb24oYSl7dmFyIGI9TWF0aC5jb3MoYSksYz1NYXRoLnNpbihhKSxkPXRoaXMuYSxlPXRoaXMuYyxmPXRoaXMudHg7cmV0dXJuIHRoaXMuYT1kKmItdGhpcy5iKmMsdGhpcy5iPWQqYyt0aGlzLmIqYix0aGlzLmM9ZSpiLXRoaXMuZCpjLHRoaXMuZD1lKmMrdGhpcy5kKmIsdGhpcy50eD1mKmItdGhpcy50eSpjLHRoaXMudHk9ZipjK3RoaXMudHkqYix0aGlzfSxiLk1hdHJpeC5wcm90b3R5cGUuYXBwZW5kPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuYSxjPXRoaXMuYixkPXRoaXMuYyxlPXRoaXMuZDtyZXR1cm4gdGhpcy5hPWEuYSpiK2EuYipkLHRoaXMuYj1hLmEqYythLmIqZSx0aGlzLmM9YS5jKmIrYS5kKmQsdGhpcy5kPWEuYypjK2EuZCplLHRoaXMudHg9YS50eCpiK2EudHkqZCt0aGlzLnR4LHRoaXMudHk9YS50eCpjK2EudHkqZSt0aGlzLnR5LHRoaXN9LGIuTWF0cml4LnByb3RvdHlwZS5pZGVudGl0eT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmE9MSx0aGlzLmI9MCx0aGlzLmM9MCx0aGlzLmQ9MSx0aGlzLnR4PTAsdGhpcy50eT0wLHRoaXN9LGIuaWRlbnRpdHlNYXRyaXg9bmV3IGIuTWF0cml4LGIuRGlzcGxheU9iamVjdD1mdW5jdGlvbigpe3RoaXMucG9zaXRpb249bmV3IGIuUG9pbnQsdGhpcy5zY2FsZT1uZXcgYi5Qb2ludCgxLDEpLHRoaXMucGl2b3Q9bmV3IGIuUG9pbnQoMCwwKSx0aGlzLnJvdGF0aW9uPTAsdGhpcy5hbHBoYT0xLHRoaXMudmlzaWJsZT0hMCx0aGlzLmhpdEFyZWE9bnVsbCx0aGlzLmJ1dHRvbk1vZGU9ITEsdGhpcy5yZW5kZXJhYmxlPSExLHRoaXMucGFyZW50PW51bGwsdGhpcy5zdGFnZT1udWxsLHRoaXMud29ybGRBbHBoYT0xLHRoaXMuX2ludGVyYWN0aXZlPSExLHRoaXMuZGVmYXVsdEN1cnNvcj1cInBvaW50ZXJcIix0aGlzLndvcmxkVHJhbnNmb3JtPW5ldyBiLk1hdHJpeCx0aGlzLl9zcj0wLHRoaXMuX2NyPTEsdGhpcy5maWx0ZXJBcmVhPW51bGwsdGhpcy5fYm91bmRzPW5ldyBiLlJlY3RhbmdsZSgwLDAsMSwxKSx0aGlzLl9jdXJyZW50Qm91bmRzPW51bGwsdGhpcy5fbWFzaz1udWxsLHRoaXMuX2NhY2hlQXNCaXRtYXA9ITEsdGhpcy5fY2FjaGVJc0RpcnR5PSExfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRGlzcGxheU9iamVjdCxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcImludGVyYWN0aXZlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9pbnRlcmFjdGl2ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX2ludGVyYWN0aXZlPWEsdGhpcy5zdGFnZSYmKHRoaXMuc3RhZ2UuZGlydHk9ITApfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLFwid29ybGRWaXNpYmxlXCIse2dldDpmdW5jdGlvbigpe3ZhciBhPXRoaXM7ZG97aWYoIWEudmlzaWJsZSlyZXR1cm4hMTthPWEucGFyZW50fXdoaWxlKGEpO3JldHVybiEwfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLFwibWFza1wiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5fbWFza30sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX21hc2smJih0aGlzLl9tYXNrLmlzTWFzaz0hMSksdGhpcy5fbWFzaz1hLHRoaXMuX21hc2smJih0aGlzLl9tYXNrLmlzTWFzaz0hMCl9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUsXCJmaWx0ZXJzXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9maWx0ZXJzfSxzZXQ6ZnVuY3Rpb24oYSl7aWYoYSl7Zm9yKHZhciBiPVtdLGM9MDtjPGEubGVuZ3RoO2MrKylmb3IodmFyIGQ9YVtjXS5wYXNzZXMsZT0wO2U8ZC5sZW5ndGg7ZSsrKWIucHVzaChkW2VdKTt0aGlzLl9maWx0ZXJCbG9jaz17dGFyZ2V0OnRoaXMsZmlsdGVyUGFzc2VzOmJ9fXRoaXMuX2ZpbHRlcnM9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcImNhY2hlQXNCaXRtYXBcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuX2NhY2hlQXNCaXRtYXB9LHNldDpmdW5jdGlvbihhKXt0aGlzLl9jYWNoZUFzQml0bWFwIT09YSYmKGE/dGhpcy5fZ2VuZXJhdGVDYWNoZWRTcHJpdGUoKTp0aGlzLl9kZXN0cm95Q2FjaGVkU3ByaXRlKCksdGhpcy5fY2FjaGVBc0JpdG1hcD1hKX19KSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3ZhciBhLGMsZCxlLGYsZyxoPXRoaXMucGFyZW50LndvcmxkVHJhbnNmb3JtLGk9dGhpcy53b3JsZFRyYW5zZm9ybTt0aGlzLnJvdGF0aW9uJWIuUElfMj8odGhpcy5yb3RhdGlvbiE9PXRoaXMucm90YXRpb25DYWNoZSYmKHRoaXMucm90YXRpb25DYWNoZT10aGlzLnJvdGF0aW9uLHRoaXMuX3NyPU1hdGguc2luKHRoaXMucm90YXRpb24pLHRoaXMuX2NyPU1hdGguY29zKHRoaXMucm90YXRpb24pKSxhPXRoaXMuX2NyKnRoaXMuc2NhbGUueCxjPXRoaXMuX3NyKnRoaXMuc2NhbGUueCxkPS10aGlzLl9zcip0aGlzLnNjYWxlLnksZT10aGlzLl9jcip0aGlzLnNjYWxlLnksZj10aGlzLnBvc2l0aW9uLngsZz10aGlzLnBvc2l0aW9uLnksKHRoaXMucGl2b3QueHx8dGhpcy5waXZvdC55KSYmKGYtPXRoaXMucGl2b3QueCphK3RoaXMucGl2b3QueSpkLGctPXRoaXMucGl2b3QueCpjK3RoaXMucGl2b3QueSplKSxpLmE9YSpoLmErYypoLmMsaS5iPWEqaC5iK2MqaC5kLGkuYz1kKmguYStlKmguYyxpLmQ9ZCpoLmIrZSpoLmQsaS50eD1mKmguYStnKmguYytoLnR4LGkudHk9ZipoLmIrZypoLmQraC50eSk6KGE9dGhpcy5zY2FsZS54LGU9dGhpcy5zY2FsZS55LGY9dGhpcy5wb3NpdGlvbi54LXRoaXMucGl2b3QueCphLGc9dGhpcy5wb3NpdGlvbi55LXRoaXMucGl2b3QueSplLGkuYT1hKmguYSxpLmI9YSpoLmIsaS5jPWUqaC5jLGkuZD1lKmguZCxpLnR4PWYqaC5hK2cqaC5jK2gudHgsaS50eT1mKmguYitnKmguZCtoLnR5KSx0aGlzLndvcmxkQWxwaGE9dGhpcy5hbHBoYSp0aGlzLnBhcmVudC53b3JsZEFscGhhfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm09Yi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm0sYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9YSxiLkVtcHR5UmVjdGFuZ2xlfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLmdldExvY2FsQm91bmRzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0Qm91bmRzKGIuaWRlbnRpdHlNYXRyaXgpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnNldFN0YWdlUmVmZXJlbmNlPWZ1bmN0aW9uKGEpe3RoaXMuc3RhZ2U9YSx0aGlzLl9pbnRlcmFjdGl2ZSYmKHRoaXMuc3RhZ2UuZGlydHk9ITApfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLmdlbmVyYXRlVGV4dHVyZT1mdW5jdGlvbihhLGMsZCl7dmFyIGU9dGhpcy5nZXRMb2NhbEJvdW5kcygpLGY9bmV3IGIuUmVuZGVyVGV4dHVyZSgwfGUud2lkdGgsMHxlLmhlaWdodCxkLGMsYSk7cmV0dXJuIGIuRGlzcGxheU9iamVjdC5fdGVtcE1hdHJpeC50eD0tZS54LGIuRGlzcGxheU9iamVjdC5fdGVtcE1hdHJpeC50eT0tZS55LGYucmVuZGVyKHRoaXMsYi5EaXNwbGF5T2JqZWN0Ll90ZW1wTWF0cml4KSxmfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLnVwZGF0ZUNhY2hlPWZ1bmN0aW9uKCl7dGhpcy5fZ2VuZXJhdGVDYWNoZWRTcHJpdGUoKX0sYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS50b0dsb2JhbD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5kaXNwbGF5T2JqZWN0VXBkYXRlVHJhbnNmb3JtKCksdGhpcy53b3JsZFRyYW5zZm9ybS5hcHBseShhKX0sYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS50b0xvY2FsPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGImJihhPWIudG9HbG9iYWwoYSkpLHRoaXMuZGlzcGxheU9iamVjdFVwZGF0ZVRyYW5zZm9ybSgpLHRoaXMud29ybGRUcmFuc2Zvcm0uYXBwbHlJbnZlcnNlKGEpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9yZW5kZXJDYWNoZWRTcHJpdGU9ZnVuY3Rpb24oYSl7dGhpcy5fY2FjaGVkU3ByaXRlLndvcmxkQWxwaGE9dGhpcy53b3JsZEFscGhhLGEuZ2w/Yi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJXZWJHTC5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKTpiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcy5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKX0sYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZS5fZ2VuZXJhdGVDYWNoZWRTcHJpdGU9ZnVuY3Rpb24oKXt0aGlzLl9jYWNoZUFzQml0bWFwPSExO3ZhciBhPXRoaXMuZ2V0TG9jYWxCb3VuZHMoKTtpZih0aGlzLl9jYWNoZWRTcHJpdGUpdGhpcy5fY2FjaGVkU3ByaXRlLnRleHR1cmUucmVzaXplKDB8YS53aWR0aCwwfGEuaGVpZ2h0KTtlbHNle3ZhciBjPW5ldyBiLlJlbmRlclRleHR1cmUoMHxhLndpZHRoLDB8YS5oZWlnaHQpO3RoaXMuX2NhY2hlZFNwcml0ZT1uZXcgYi5TcHJpdGUoYyksdGhpcy5fY2FjaGVkU3ByaXRlLndvcmxkVHJhbnNmb3JtPXRoaXMud29ybGRUcmFuc2Zvcm19dmFyIGQ9dGhpcy5fZmlsdGVyczt0aGlzLl9maWx0ZXJzPW51bGwsdGhpcy5fY2FjaGVkU3ByaXRlLmZpbHRlcnM9ZCxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgudHg9LWEueCxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgudHk9LWEueSx0aGlzLl9jYWNoZWRTcHJpdGUudGV4dHVyZS5yZW5kZXIodGhpcyxiLkRpc3BsYXlPYmplY3QuX3RlbXBNYXRyaXgsITApLHRoaXMuX2NhY2hlZFNwcml0ZS5hbmNob3IueD0tKGEueC9hLndpZHRoKSx0aGlzLl9jYWNoZWRTcHJpdGUuYW5jaG9yLnk9LShhLnkvYS5oZWlnaHQpLHRoaXMuX2ZpbHRlcnM9ZCx0aGlzLl9jYWNoZUFzQml0bWFwPSEwfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9kZXN0cm95Q2FjaGVkU3ByaXRlPWZ1bmN0aW9uKCl7dGhpcy5fY2FjaGVkU3ByaXRlJiYodGhpcy5fY2FjaGVkU3ByaXRlLnRleHR1cmUuZGVzdHJveSghMCksdGhpcy5fY2FjaGVkU3ByaXRlPW51bGwpfSxiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXthPWF9LGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXthPWF9LGIuRGlzcGxheU9iamVjdC5fdGVtcE1hdHJpeD1uZXcgYi5NYXRyaXgsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxheU9iamVjdC5wcm90b3R5cGUsXCJ4XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBvc2l0aW9uLnh9LHNldDpmdW5jdGlvbihhKXt0aGlzLnBvc2l0aW9uLng9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0LnByb3RvdHlwZSxcInlcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucG9zaXRpb24ueX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMucG9zaXRpb24ueT1hfX0pLGIuRGlzcGxheU9iamVjdENvbnRhaW5lcj1mdW5jdGlvbigpe2IuRGlzcGxheU9iamVjdC5jYWxsKHRoaXMpLHRoaXMuY2hpbGRyZW49W119LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkRpc3BsYXlPYmplY3QucHJvdG90eXBlKSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRGlzcGxheU9iamVjdENvbnRhaW5lcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSxcIndpZHRoXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYWxlLngqdGhpcy5nZXRMb2NhbEJvdW5kcygpLndpZHRofSxzZXQ6ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5nZXRMb2NhbEJvdW5kcygpLndpZHRoO3RoaXMuc2NhbGUueD0wIT09Yj9hL2I6MSx0aGlzLl93aWR0aD1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLFwiaGVpZ2h0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnNjYWxlLnkqdGhpcy5nZXRMb2NhbEJvdW5kcygpLmhlaWdodH0sc2V0OmZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZ2V0TG9jYWxCb3VuZHMoKS5oZWlnaHQ7dGhpcy5zY2FsZS55PTAhPT1iP2EvYjoxLHRoaXMuX2hlaWdodD1hfX0pLGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuYWRkQ2hpbGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuYWRkQ2hpbGRBdChhLHRoaXMuY2hpbGRyZW4ubGVuZ3RoKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5hZGRDaGlsZEF0PWZ1bmN0aW9uKGEsYil7aWYoYj49MCYmYjw9dGhpcy5jaGlsZHJlbi5sZW5ndGgpcmV0dXJuIGEucGFyZW50JiZhLnBhcmVudC5yZW1vdmVDaGlsZChhKSxhLnBhcmVudD10aGlzLHRoaXMuY2hpbGRyZW4uc3BsaWNlKGIsMCxhKSx0aGlzLnN0YWdlJiZhLnNldFN0YWdlUmVmZXJlbmNlKHRoaXMuc3RhZ2UpLGE7dGhyb3cgbmV3IEVycm9yKGErXCJhZGRDaGlsZEF0OiBUaGUgaW5kZXggXCIrYitcIiBzdXBwbGllZCBpcyBvdXQgb2YgYm91bmRzIFwiK3RoaXMuY2hpbGRyZW4ubGVuZ3RoKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zd2FwQ2hpbGRyZW49ZnVuY3Rpb24oYSxiKXtpZihhIT09Yil7dmFyIGM9dGhpcy5nZXRDaGlsZEluZGV4KGEpLGQ9dGhpcy5nZXRDaGlsZEluZGV4KGIpO2lmKDA+Y3x8MD5kKXRocm93IG5ldyBFcnJvcihcInN3YXBDaGlsZHJlbjogQm90aCB0aGUgc3VwcGxpZWQgRGlzcGxheU9iamVjdHMgbXVzdCBiZSBhIGNoaWxkIG9mIHRoZSBjYWxsZXIuXCIpO3RoaXMuY2hpbGRyZW5bY109Yix0aGlzLmNoaWxkcmVuW2RdPWF9fSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmdldENoaWxkSW5kZXg9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5jaGlsZHJlbi5pbmRleE9mKGEpO2lmKC0xPT09Yil0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgRGlzcGxheU9iamVjdCBtdXN0IGJlIGEgY2hpbGQgb2YgdGhlIGNhbGxlclwiKTtyZXR1cm4gYn0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zZXRDaGlsZEluZGV4PWZ1bmN0aW9uKGEsYil7aWYoMD5ifHxiPj10aGlzLmNoaWxkcmVuLmxlbmd0aCl0aHJvdyBuZXcgRXJyb3IoXCJUaGUgc3VwcGxpZWQgaW5kZXggaXMgb3V0IG9mIGJvdW5kc1wiKTt2YXIgYz10aGlzLmdldENoaWxkSW5kZXgoYSk7dGhpcy5jaGlsZHJlbi5zcGxpY2UoYywxKSx0aGlzLmNoaWxkcmVuLnNwbGljZShiLDAsYSl9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZ2V0Q2hpbGRBdD1mdW5jdGlvbihhKXtpZigwPmF8fGE+PXRoaXMuY2hpbGRyZW4ubGVuZ3RoKXRocm93IG5ldyBFcnJvcihcImdldENoaWxkQXQ6IFN1cHBsaWVkIGluZGV4IFwiK2ErXCIgZG9lcyBub3QgZXhpc3QgaW4gdGhlIGNoaWxkIGxpc3QsIG9yIHRoZSBzdXBwbGllZCBEaXNwbGF5T2JqZWN0IG11c3QgYmUgYSBjaGlsZCBvZiB0aGUgY2FsbGVyXCIpO3JldHVybiB0aGlzLmNoaWxkcmVuW2FdfSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnJlbW92ZUNoaWxkPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuY2hpbGRyZW4uaW5kZXhPZihhKTtpZigtMSE9PWIpcmV0dXJuIHRoaXMucmVtb3ZlQ2hpbGRBdChiKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5yZW1vdmVDaGlsZEF0PWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMuZ2V0Q2hpbGRBdChhKTtyZXR1cm4gdGhpcy5zdGFnZSYmYi5yZW1vdmVTdGFnZVJlZmVyZW5jZSgpLGIucGFyZW50PXZvaWQgMCx0aGlzLmNoaWxkcmVuLnNwbGljZShhLDEpLGJ9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUucmVtb3ZlQ2hpbGRyZW49ZnVuY3Rpb24oYSxiKXt2YXIgYz1hfHwwLGQ9XCJudW1iZXJcIj09dHlwZW9mIGI/Yjp0aGlzLmNoaWxkcmVuLmxlbmd0aCxlPWQtYztpZihlPjAmJmQ+PWUpe2Zvcih2YXIgZj10aGlzLmNoaWxkcmVuLnNwbGljZShjLGUpLGc9MDtnPGYubGVuZ3RoO2crKyl7dmFyIGg9ZltnXTt0aGlzLnN0YWdlJiZoLnJlbW92ZVN0YWdlUmVmZXJlbmNlKCksaC5wYXJlbnQ9dm9pZCAwfXJldHVybiBmfWlmKDA9PT1lJiYwPT09dGhpcy5jaGlsZHJlbi5sZW5ndGgpcmV0dXJuW107dGhyb3cgbmV3IEVycm9yKFwicmVtb3ZlQ2hpbGRyZW46IFJhbmdlIEVycm9yLCBudW1lcmljIHZhbHVlcyBhcmUgb3V0c2lkZSB0aGUgYWNjZXB0YWJsZSByYW5nZVwiKX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm09ZnVuY3Rpb24oKXtpZih0aGlzLnZpc2libGUmJih0aGlzLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKSwhdGhpcy5fY2FjaGVBc0JpdG1hcCkpZm9yKHZhciBhPTAsYj10aGlzLmNoaWxkcmVuLmxlbmd0aDtiPmE7YSsrKXRoaXMuY2hpbGRyZW5bYV0udXBkYXRlVHJhbnNmb3JtKCl9LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZGlzcGxheU9iamVjdENvbnRhaW5lclVwZGF0ZVRyYW5zZm9ybT1iLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe2lmKDA9PT10aGlzLmNoaWxkcmVuLmxlbmd0aClyZXR1cm4gYi5FbXB0eVJlY3RhbmdsZTtmb3IodmFyIGEsYyxkLGU9MS8wLGY9MS8wLGc9LTEvMCxoPS0xLzAsaT0hMSxqPTAsaz10aGlzLmNoaWxkcmVuLmxlbmd0aDtrPmo7aisrKXt2YXIgbD10aGlzLmNoaWxkcmVuW2pdO2wudmlzaWJsZSYmKGk9ITAsYT10aGlzLmNoaWxkcmVuW2pdLmdldEJvdW5kcygpLGU9ZTxhLng/ZTphLngsZj1mPGEueT9mOmEueSxjPWEud2lkdGgrYS54LGQ9YS5oZWlnaHQrYS55LGc9Zz5jP2c6YyxoPWg+ZD9oOmQpfWlmKCFpKXJldHVybiBiLkVtcHR5UmVjdGFuZ2xlO3ZhciBtPXRoaXMuX2JvdW5kcztyZXR1cm4gbS54PWUsbS55PWYsbS53aWR0aD1nLWUsbS5oZWlnaHQ9aC1mLG19LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUuZ2V0TG9jYWxCb3VuZHM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLndvcmxkVHJhbnNmb3JtO3RoaXMud29ybGRUcmFuc2Zvcm09Yi5pZGVudGl0eU1hdHJpeDtmb3IodmFyIGM9MCxkPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2Q+YztjKyspdGhpcy5jaGlsZHJlbltjXS51cGRhdGVUcmFuc2Zvcm0oKTt2YXIgZT10aGlzLmdldEJvdW5kcygpO3JldHVybiB0aGlzLndvcmxkVHJhbnNmb3JtPWEsZX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5zZXRTdGFnZVJlZmVyZW5jZT1mdW5jdGlvbihhKXt0aGlzLnN0YWdlPWEsdGhpcy5faW50ZXJhY3RpdmUmJih0aGlzLnN0YWdlLmRpcnR5PSEwKTtmb3IodmFyIGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspe3ZhciBkPXRoaXMuY2hpbGRyZW5bYl07ZC5zZXRTdGFnZVJlZmVyZW5jZShhKX19LGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUucmVtb3ZlU3RhZ2VSZWZlcmVuY2U9ZnVuY3Rpb24oKXtmb3IodmFyIGE9MCxiPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2I+YTthKyspe3ZhciBjPXRoaXMuY2hpbGRyZW5bYV07Yy5yZW1vdmVTdGFnZVJlZmVyZW5jZSgpfXRoaXMuX2ludGVyYWN0aXZlJiYodGhpcy5zdGFnZS5kaXJ0eT0hMCksdGhpcy5zdGFnZT1udWxsfSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUmJiEodGhpcy5hbHBoYTw9MCkpe2lmKHRoaXMuX2NhY2hlQXNCaXRtYXApcmV0dXJuIHRoaXMuX3JlbmRlckNhY2hlZFNwcml0ZShhKSx2b2lkIDA7dmFyIGIsYztpZih0aGlzLl9tYXNrfHx0aGlzLl9maWx0ZXJzKXtmb3IodGhpcy5fZmlsdGVycyYmKGEuc3ByaXRlQmF0Y2guZmx1c2goKSxhLmZpbHRlck1hbmFnZXIucHVzaEZpbHRlcih0aGlzLl9maWx0ZXJCbG9jaykpLHRoaXMuX21hc2smJihhLnNwcml0ZUJhdGNoLnN0b3AoKSxhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMubWFzayxhKSxhLnNwcml0ZUJhdGNoLnN0YXJ0KCkpLGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspdGhpcy5jaGlsZHJlbltiXS5fcmVuZGVyV2ViR0woYSk7YS5zcHJpdGVCYXRjaC5zdG9wKCksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKHRoaXMuX21hc2ssYSksdGhpcy5fZmlsdGVycyYmYS5maWx0ZXJNYW5hZ2VyLnBvcEZpbHRlcigpLGEuc3ByaXRlQmF0Y2guc3RhcnQoKX1lbHNlIGZvcihiPTAsYz10aGlzLmNoaWxkcmVuLmxlbmd0aDtjPmI7YisrKXRoaXMuY2hpbGRyZW5bYl0uX3JlbmRlcldlYkdMKGEpfX0sYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzPWZ1bmN0aW9uKGEpe2lmKHRoaXMudmlzaWJsZSE9PSExJiYwIT09dGhpcy5hbHBoYSl7aWYodGhpcy5fY2FjaGVBc0JpdG1hcClyZXR1cm4gdGhpcy5fcmVuZGVyQ2FjaGVkU3ByaXRlKGEpLHZvaWQgMDt0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMuX21hc2ssYSk7Zm9yKHZhciBiPTAsYz10aGlzLmNoaWxkcmVuLmxlbmd0aDtjPmI7YisrKXt2YXIgZD10aGlzLmNoaWxkcmVuW2JdO2QuX3JlbmRlckNhbnZhcyhhKX10aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2soYSl9fSxiLlNwcml0ZT1mdW5jdGlvbihhKXtiLkRpc3BsYXlPYmplY3RDb250YWluZXIuY2FsbCh0aGlzKSx0aGlzLmFuY2hvcj1uZXcgYi5Qb2ludCx0aGlzLnRleHR1cmU9YXx8Yi5UZXh0dXJlLmVtcHR5VGV4dHVyZSx0aGlzLl93aWR0aD0wLHRoaXMuX2hlaWdodD0wLHRoaXMudGludD0xNjc3NzIxNSx0aGlzLmJsZW5kTW9kZT1iLmJsZW5kTW9kZXMuTk9STUFMLHRoaXMuc2hhZGVyPW51bGwsdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLmhhc0xvYWRlZD90aGlzLm9uVGV4dHVyZVVwZGF0ZSgpOnRoaXMudGV4dHVyZS5vbihcInVwZGF0ZVwiLHRoaXMub25UZXh0dXJlVXBkYXRlLmJpbmQodGhpcykpLHRoaXMucmVuZGVyYWJsZT0hMH0sYi5TcHJpdGUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSksYi5TcHJpdGUucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3ByaXRlLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlNwcml0ZS5wcm90b3R5cGUsXCJ3aWR0aFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zY2FsZS54KnRoaXMudGV4dHVyZS5mcmFtZS53aWR0aH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuc2NhbGUueD1hL3RoaXMudGV4dHVyZS5mcmFtZS53aWR0aCx0aGlzLl93aWR0aD1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlNwcml0ZS5wcm90b3R5cGUsXCJoZWlnaHRcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuc2NhbGUueSp0aGlzLnRleHR1cmUuZnJhbWUuaGVpZ2h0fSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5zY2FsZS55PWEvdGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodCx0aGlzLl9oZWlnaHQ9YX19KSxiLlNwcml0ZS5wcm90b3R5cGUuc2V0VGV4dHVyZT1mdW5jdGlvbihhKXt0aGlzLnRleHR1cmU9YSx0aGlzLmNhY2hlZFRpbnQ9MTY3NzcyMTV9LGIuU3ByaXRlLnByb3RvdHlwZS5vblRleHR1cmVVcGRhdGU9ZnVuY3Rpb24oKXt0aGlzLl93aWR0aCYmKHRoaXMuc2NhbGUueD10aGlzLl93aWR0aC90aGlzLnRleHR1cmUuZnJhbWUud2lkdGgpLHRoaXMuX2hlaWdodCYmKHRoaXMuc2NhbGUueT10aGlzLl9oZWlnaHQvdGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodCl9LGIuU3ByaXRlLnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy50ZXh0dXJlLmZyYW1lLndpZHRoLGM9dGhpcy50ZXh0dXJlLmZyYW1lLmhlaWdodCxkPWIqKDEtdGhpcy5hbmNob3IueCksZT1iKi10aGlzLmFuY2hvci54LGY9YyooMS10aGlzLmFuY2hvci55KSxnPWMqLXRoaXMuYW5jaG9yLnksaD1hfHx0aGlzLndvcmxkVHJhbnNmb3JtLGk9aC5hLGo9aC5iLGs9aC5jLGw9aC5kLG09aC50eCxuPWgudHksbz0tMS8wLHA9LTEvMCxxPTEvMCxyPTEvMDtpZigwPT09aiYmMD09PWspMD5pJiYoaSo9LTEpLDA+bCYmKGwqPS0xKSxxPWkqZSttLG89aSpkK20scj1sKmcrbixwPWwqZituO2Vsc2V7dmFyIHM9aSplK2sqZyttLHQ9bCpnK2oqZStuLHU9aSpkK2sqZyttLHY9bCpnK2oqZCtuLHc9aSpkK2sqZittLHg9bCpmK2oqZCtuLHk9aSplK2sqZittLHo9bCpmK2oqZStuO3E9cT5zP3M6cSxxPXE+dT91OnEscT1xPnc/dzpxLHE9cT55P3k6cSxyPXI+dD90OnIscj1yPnY/djpyLHI9cj54P3g6cixyPXI+ej96OnIsbz1zPm8/czpvLG89dT5vP3U6byxvPXc+bz93Om8sbz15Pm8/eTpvLHA9dD5wP3Q6cCxwPXY+cD92OnAscD14PnA/eDpwLHA9ej5wP3o6cH12YXIgQT10aGlzLl9ib3VuZHM7cmV0dXJuIEEueD1xLEEud2lkdGg9by1xLEEueT1yLEEuaGVpZ2h0PXAtcix0aGlzLl9jdXJyZW50Qm91bmRzPUEsQX0sYi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUmJiEodGhpcy5hbHBoYTw9MCkpe3ZhciBiLGM7aWYodGhpcy5fbWFza3x8dGhpcy5fZmlsdGVycyl7dmFyIGQ9YS5zcHJpdGVCYXRjaDtmb3IodGhpcy5fZmlsdGVycyYmKGQuZmx1c2goKSxhLmZpbHRlck1hbmFnZXIucHVzaEZpbHRlcih0aGlzLl9maWx0ZXJCbG9jaykpLHRoaXMuX21hc2smJihkLnN0b3AoKSxhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMubWFzayxhKSxkLnN0YXJ0KCkpLGQucmVuZGVyKHRoaXMpLGI9MCxjPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2M+YjtiKyspdGhpcy5jaGlsZHJlbltiXS5fcmVuZGVyV2ViR0woYSk7ZC5zdG9wKCksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKHRoaXMuX21hc2ssYSksdGhpcy5fZmlsdGVycyYmYS5maWx0ZXJNYW5hZ2VyLnBvcEZpbHRlcigpLGQuc3RhcnQoKX1lbHNlIGZvcihhLnNwcml0ZUJhdGNoLnJlbmRlcih0aGlzKSxiPTAsYz10aGlzLmNoaWxkcmVuLmxlbmd0aDtjPmI7YisrKXRoaXMuY2hpbGRyZW5bYl0uX3JlbmRlcldlYkdMKGEpfX0sYi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJDYW52YXM9ZnVuY3Rpb24oYSl7aWYoISh0aGlzLnZpc2libGU9PT0hMXx8MD09PXRoaXMuYWxwaGF8fHRoaXMudGV4dHVyZS5jcm9wLndpZHRoPD0wfHx0aGlzLnRleHR1cmUuY3JvcC5oZWlnaHQ8PTApKXtpZih0aGlzLmJsZW5kTW9kZSE9PWEuY3VycmVudEJsZW5kTW9kZSYmKGEuY3VycmVudEJsZW5kTW9kZT10aGlzLmJsZW5kTW9kZSxhLmNvbnRleHQuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPWIuYmxlbmRNb2Rlc0NhbnZhc1thLmN1cnJlbnRCbGVuZE1vZGVdKSx0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMuX21hc2ssYSksdGhpcy50ZXh0dXJlLnZhbGlkKXt2YXIgYz10aGlzLnRleHR1cmUuYmFzZVRleHR1cmUucmVzb2x1dGlvbi9hLnJlc29sdXRpb247YS5jb250ZXh0Lmdsb2JhbEFscGhhPXRoaXMud29ybGRBbHBoYSxhLnNtb290aFByb3BlcnR5JiZhLnNjYWxlTW9kZSE9PXRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zY2FsZU1vZGUmJihhLnNjYWxlTW9kZT10aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuc2NhbGVNb2RlLGEuY29udGV4dFthLnNtb290aFByb3BlcnR5XT1hLnNjYWxlTW9kZT09PWIuc2NhbGVNb2Rlcy5MSU5FQVIpO3ZhciBkPXRoaXMudGV4dHVyZS50cmltP3RoaXMudGV4dHVyZS50cmltLngtdGhpcy5hbmNob3IueCp0aGlzLnRleHR1cmUudHJpbS53aWR0aDp0aGlzLmFuY2hvci54Ki10aGlzLnRleHR1cmUuZnJhbWUud2lkdGgsZT10aGlzLnRleHR1cmUudHJpbT90aGlzLnRleHR1cmUudHJpbS55LXRoaXMuYW5jaG9yLnkqdGhpcy50ZXh0dXJlLnRyaW0uaGVpZ2h0OnRoaXMuYW5jaG9yLnkqLXRoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHQ7YS5yb3VuZFBpeGVscz8oYS5jb250ZXh0LnNldFRyYW5zZm9ybSh0aGlzLndvcmxkVHJhbnNmb3JtLmEsdGhpcy53b3JsZFRyYW5zZm9ybS5iLHRoaXMud29ybGRUcmFuc2Zvcm0uYyx0aGlzLndvcmxkVHJhbnNmb3JtLmQsdGhpcy53b3JsZFRyYW5zZm9ybS50eCphLnJlc29sdXRpb258MCx0aGlzLndvcmxkVHJhbnNmb3JtLnR5KmEucmVzb2x1dGlvbnwwKSxkPTB8ZCxlPTB8ZSk6YS5jb250ZXh0LnNldFRyYW5zZm9ybSh0aGlzLndvcmxkVHJhbnNmb3JtLmEsdGhpcy53b3JsZFRyYW5zZm9ybS5iLHRoaXMud29ybGRUcmFuc2Zvcm0uYyx0aGlzLndvcmxkVHJhbnNmb3JtLmQsdGhpcy53b3JsZFRyYW5zZm9ybS50eCphLnJlc29sdXRpb24sdGhpcy53b3JsZFRyYW5zZm9ybS50eSphLnJlc29sdXRpb24pLDE2Nzc3MjE1IT09dGhpcy50aW50Pyh0aGlzLmNhY2hlZFRpbnQhPT10aGlzLnRpbnQmJih0aGlzLmNhY2hlZFRpbnQ9dGhpcy50aW50LHRoaXMudGludGVkVGV4dHVyZT1iLkNhbnZhc1RpbnRlci5nZXRUaW50ZWRUZXh0dXJlKHRoaXMsdGhpcy50aW50KSksYS5jb250ZXh0LmRyYXdJbWFnZSh0aGlzLnRpbnRlZFRleHR1cmUsMCwwLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoLHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodCxkL2MsZS9jLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoL2MsdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0L2MpKTphLmNvbnRleHQuZHJhd0ltYWdlKHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2UsdGhpcy50ZXh0dXJlLmNyb3AueCx0aGlzLnRleHR1cmUuY3JvcC55LHRoaXMudGV4dHVyZS5jcm9wLndpZHRoLHRoaXMudGV4dHVyZS5jcm9wLmhlaWdodCxkL2MsZS9jLHRoaXMudGV4dHVyZS5jcm9wLndpZHRoL2MsdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0L2MpfWZvcih2YXIgZj0wLGc9dGhpcy5jaGlsZHJlbi5sZW5ndGg7Zz5mO2YrKyl0aGlzLmNoaWxkcmVuW2ZdLl9yZW5kZXJDYW52YXMoYSk7dGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKGEpfX0sYi5TcHJpdGUuZnJvbUZyYW1lPWZ1bmN0aW9uKGEpe3ZhciBjPWIuVGV4dHVyZUNhY2hlW2FdO2lmKCFjKXRocm93IG5ldyBFcnJvcignVGhlIGZyYW1lSWQgXCInK2ErJ1wiIGRvZXMgbm90IGV4aXN0IGluIHRoZSB0ZXh0dXJlIGNhY2hlJyt0aGlzKTtyZXR1cm4gbmV3IGIuU3ByaXRlKGMpfSxiLlNwcml0ZS5mcm9tSW1hZ2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIuVGV4dHVyZS5mcm9tSW1hZ2UoYSxjLGQpO3JldHVybiBuZXcgYi5TcHJpdGUoZSl9LGIuU3ByaXRlQmF0Y2g9ZnVuY3Rpb24oYSl7Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy50ZXh0dXJlVGhpbmc9YSx0aGlzLnJlYWR5PSExfSxiLlNwcml0ZUJhdGNoLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuU3ByaXRlQmF0Y2gucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3ByaXRlQmF0Y2gsYi5TcHJpdGVCYXRjaC5wcm90b3R5cGUuaW5pdFdlYkdMPWZ1bmN0aW9uKGEpe3RoaXMuZmFzdFNwcml0ZUJhdGNoPW5ldyBiLldlYkdMRmFzdFNwcml0ZUJhdGNoKGEpLHRoaXMucmVhZHk9ITB9LGIuU3ByaXRlQmF0Y2gucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3RoaXMuZGlzcGxheU9iamVjdFVwZGF0ZVRyYW5zZm9ybSgpfSxiLlNwcml0ZUJhdGNoLnByb3RvdHlwZS5fcmVuZGVyV2ViR0w9ZnVuY3Rpb24oYSl7IXRoaXMudmlzaWJsZXx8dGhpcy5hbHBoYTw9MHx8IXRoaXMuY2hpbGRyZW4ubGVuZ3RofHwodGhpcy5yZWFkeXx8dGhpcy5pbml0V2ViR0woYS5nbCksYS5zcHJpdGVCYXRjaC5zdG9wKCksYS5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihhLnNoYWRlck1hbmFnZXIuZmFzdFNoYWRlciksdGhpcy5mYXN0U3ByaXRlQmF0Y2guYmVnaW4odGhpcyxhKSx0aGlzLmZhc3RTcHJpdGVCYXRjaC5yZW5kZXIodGhpcyksYS5zcHJpdGVCYXRjaC5zdGFydCgpKX0sYi5TcHJpdGVCYXRjaC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUmJiEodGhpcy5hbHBoYTw9MCkmJnRoaXMuY2hpbGRyZW4ubGVuZ3RoKXt2YXIgYj1hLmNvbnRleHQ7Yi5nbG9iYWxBbHBoYT10aGlzLndvcmxkQWxwaGEsdGhpcy5kaXNwbGF5T2JqZWN0VXBkYXRlVHJhbnNmb3JtKCk7Zm9yKHZhciBjPXRoaXMud29ybGRUcmFuc2Zvcm0sZD0hMCxlPTA7ZTx0aGlzLmNoaWxkcmVuLmxlbmd0aDtlKyspe3ZhciBmPXRoaXMuY2hpbGRyZW5bZV07aWYoZi52aXNpYmxlKXt2YXIgZz1mLnRleHR1cmUsaD1nLmZyYW1lO2lmKGIuZ2xvYmFsQWxwaGE9dGhpcy53b3JsZEFscGhhKmYuYWxwaGEsZi5yb3RhdGlvbiUoMipNYXRoLlBJKT09PTApZCYmKGIuc2V0VHJhbnNmb3JtKGMuYSxjLmIsYy5jLGMuZCxjLnR4LGMudHkpLGQ9ITEpLGIuZHJhd0ltYWdlKGcuYmFzZVRleHR1cmUuc291cmNlLGgueCxoLnksaC53aWR0aCxoLmhlaWdodCxmLmFuY2hvci54Ki1oLndpZHRoKmYuc2NhbGUueCtmLnBvc2l0aW9uLngrLjV8MCxmLmFuY2hvci55Ki1oLmhlaWdodCpmLnNjYWxlLnkrZi5wb3NpdGlvbi55Ky41fDAsaC53aWR0aCpmLnNjYWxlLngsaC5oZWlnaHQqZi5zY2FsZS55KTtlbHNle2R8fChkPSEwKSxmLmRpc3BsYXlPYmplY3RVcGRhdGVUcmFuc2Zvcm0oKTt2YXIgaT1mLndvcmxkVHJhbnNmb3JtO2Eucm91bmRQaXhlbHM/Yi5zZXRUcmFuc2Zvcm0oaS5hLGkuYixpLmMsaS5kLDB8aS50eCwwfGkudHkpOmIuc2V0VHJhbnNmb3JtKGkuYSxpLmIsaS5jLGkuZCxpLnR4LGkudHkpLGIuZHJhd0ltYWdlKGcuYmFzZVRleHR1cmUuc291cmNlLGgueCxoLnksaC53aWR0aCxoLmhlaWdodCxmLmFuY2hvci54Ki1oLndpZHRoKy41fDAsZi5hbmNob3IueSotaC5oZWlnaHQrLjV8MCxoLndpZHRoLGguaGVpZ2h0KX19fX19LGIuTW92aWVDbGlwPWZ1bmN0aW9uKGEpe2IuU3ByaXRlLmNhbGwodGhpcyxhWzBdKSx0aGlzLnRleHR1cmVzPWEsdGhpcy5hbmltYXRpb25TcGVlZD0xLHRoaXMubG9vcD0hMCx0aGlzLm9uQ29tcGxldGU9bnVsbCx0aGlzLmN1cnJlbnRGcmFtZT0wLHRoaXMucGxheWluZz0hMX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5TcHJpdGUucHJvdG90eXBlKSxiLk1vdmllQ2xpcC5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Nb3ZpZUNsaXAsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuTW92aWVDbGlwLnByb3RvdHlwZSxcInRvdGFsRnJhbWVzXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnRleHR1cmVzLmxlbmd0aH19KSxiLk1vdmllQ2xpcC5wcm90b3R5cGUuc3RvcD1mdW5jdGlvbigpe3RoaXMucGxheWluZz0hMX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlLnBsYXk9ZnVuY3Rpb24oKXt0aGlzLnBsYXlpbmc9ITB9LGIuTW92aWVDbGlwLnByb3RvdHlwZS5nb3RvQW5kU3RvcD1mdW5jdGlvbihhKXt0aGlzLnBsYXlpbmc9ITEsdGhpcy5jdXJyZW50RnJhbWU9YTt2YXIgYj10aGlzLmN1cnJlbnRGcmFtZSsuNXwwO3RoaXMuc2V0VGV4dHVyZSh0aGlzLnRleHR1cmVzW2IldGhpcy50ZXh0dXJlcy5sZW5ndGhdKX0sYi5Nb3ZpZUNsaXAucHJvdG90eXBlLmdvdG9BbmRQbGF5PWZ1bmN0aW9uKGEpe3RoaXMuY3VycmVudEZyYW1lPWEsdGhpcy5wbGF5aW5nPSEwfSxiLk1vdmllQ2xpcC5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCl7aWYodGhpcy5kaXNwbGF5T2JqZWN0Q29udGFpbmVyVXBkYXRlVHJhbnNmb3JtKCksdGhpcy5wbGF5aW5nKXt0aGlzLmN1cnJlbnRGcmFtZSs9dGhpcy5hbmltYXRpb25TcGVlZDt2YXIgYT10aGlzLmN1cnJlbnRGcmFtZSsuNXwwO3RoaXMuY3VycmVudEZyYW1lPXRoaXMuY3VycmVudEZyYW1lJXRoaXMudGV4dHVyZXMubGVuZ3RoLHRoaXMubG9vcHx8YTx0aGlzLnRleHR1cmVzLmxlbmd0aD90aGlzLnNldFRleHR1cmUodGhpcy50ZXh0dXJlc1thJXRoaXMudGV4dHVyZXMubGVuZ3RoXSk6YT49dGhpcy50ZXh0dXJlcy5sZW5ndGgmJih0aGlzLmdvdG9BbmRTdG9wKHRoaXMudGV4dHVyZXMubGVuZ3RoLTEpLHRoaXMub25Db21wbGV0ZSYmdGhpcy5vbkNvbXBsZXRlKCkpfX0sYi5Nb3ZpZUNsaXAuZnJvbUZyYW1lcz1mdW5jdGlvbihhKXtmb3IodmFyIGM9W10sZD0wO2Q8YS5sZW5ndGg7ZCsrKWMucHVzaChuZXcgYi5UZXh0dXJlLmZyb21GcmFtZShhW2RdKSk7cmV0dXJuIG5ldyBiLk1vdmllQ2xpcChjKX0sYi5Nb3ZpZUNsaXAuZnJvbUltYWdlcz1mdW5jdGlvbihhKXtmb3IodmFyIGM9W10sZD0wO2Q8YS5sZW5ndGg7ZCsrKWMucHVzaChuZXcgYi5UZXh0dXJlLmZyb21JbWFnZShhW2RdKSk7cmV0dXJuIG5ldyBiLk1vdmllQ2xpcChjKX0sYi5GaWx0ZXJCbG9jaz1mdW5jdGlvbigpe3RoaXMudmlzaWJsZT0hMCx0aGlzLnJlbmRlcmFibGU9ITB9LGIuRmlsdGVyQmxvY2sucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuRmlsdGVyQmxvY2ssYi5UZXh0PWZ1bmN0aW9uKGEsYyl7dGhpcy5jYW52YXM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSx0aGlzLmNvbnRleHQ9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLHRoaXMucmVzb2x1dGlvbj0xLGIuU3ByaXRlLmNhbGwodGhpcyxiLlRleHR1cmUuZnJvbUNhbnZhcyh0aGlzLmNhbnZhcykpLHRoaXMuc2V0VGV4dChhKSx0aGlzLnNldFN0eWxlKGMpfSxiLlRleHQucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5TcHJpdGUucHJvdG90eXBlKSxiLlRleHQucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuVGV4dCxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5UZXh0LnByb3RvdHlwZSxcIndpZHRoXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpcnR5JiYodGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMSksdGhpcy5zY2FsZS54KnRoaXMudGV4dHVyZS5mcmFtZS53aWR0aH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuc2NhbGUueD1hL3RoaXMudGV4dHVyZS5mcmFtZS53aWR0aCx0aGlzLl93aWR0aD1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlRleHQucHJvdG90eXBlLFwiaGVpZ2h0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmRpcnR5JiYodGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMSksdGhpcy5zY2FsZS55KnRoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHR9LHNldDpmdW5jdGlvbihhKXt0aGlzLnNjYWxlLnk9YS90aGlzLnRleHR1cmUuZnJhbWUuaGVpZ2h0LHRoaXMuX2hlaWdodD1hfX0pLGIuVGV4dC5wcm90b3R5cGUuc2V0U3R5bGU9ZnVuY3Rpb24oYSl7YT1hfHx7fSxhLmZvbnQ9YS5mb250fHxcImJvbGQgMjBwdCBBcmlhbFwiLGEuZmlsbD1hLmZpbGx8fFwiYmxhY2tcIixhLmFsaWduPWEuYWxpZ258fFwibGVmdFwiLGEuc3Ryb2tlPWEuc3Ryb2tlfHxcImJsYWNrXCIsYS5zdHJva2VUaGlja25lc3M9YS5zdHJva2VUaGlja25lc3N8fDAsYS53b3JkV3JhcD1hLndvcmRXcmFwfHwhMSxhLndvcmRXcmFwV2lkdGg9YS53b3JkV3JhcFdpZHRofHwxMDAsYS5kcm9wU2hhZG93PWEuZHJvcFNoYWRvd3x8ITEsYS5kcm9wU2hhZG93QW5nbGU9YS5kcm9wU2hhZG93QW5nbGV8fE1hdGguUEkvNixhLmRyb3BTaGFkb3dEaXN0YW5jZT1hLmRyb3BTaGFkb3dEaXN0YW5jZXx8NCxhLmRyb3BTaGFkb3dDb2xvcj1hLmRyb3BTaGFkb3dDb2xvcnx8XCJibGFja1wiLHRoaXMuc3R5bGU9YSx0aGlzLmRpcnR5PSEwfSxiLlRleHQucHJvdG90eXBlLnNldFRleHQ9ZnVuY3Rpb24oYSl7dGhpcy50ZXh0PWEudG9TdHJpbmcoKXx8XCIgXCIsdGhpcy5kaXJ0eT0hMH0sYi5UZXh0LnByb3RvdHlwZS51cGRhdGVUZXh0PWZ1bmN0aW9uKCl7dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnJlc29sdXRpb249dGhpcy5yZXNvbHV0aW9uLHRoaXMuY29udGV4dC5mb250PXRoaXMuc3R5bGUuZm9udDt2YXIgYT10aGlzLnRleHQ7dGhpcy5zdHlsZS53b3JkV3JhcCYmKGE9dGhpcy53b3JkV3JhcCh0aGlzLnRleHQpKTtmb3IodmFyIGI9YS5zcGxpdCgvKD86XFxyXFxufFxccnxcXG4pLyksYz1bXSxkPTAsZT10aGlzLmRldGVybWluZUZvbnRQcm9wZXJ0aWVzKHRoaXMuc3R5bGUuZm9udCksZj0wO2Y8Yi5sZW5ndGg7ZisrKXt2YXIgZz10aGlzLmNvbnRleHQubWVhc3VyZVRleHQoYltmXSkud2lkdGg7Y1tmXT1nLGQ9TWF0aC5tYXgoZCxnKX12YXIgaD1kK3RoaXMuc3R5bGUuc3Ryb2tlVGhpY2tuZXNzO3RoaXMuc3R5bGUuZHJvcFNoYWRvdyYmKGgrPXRoaXMuc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlKSx0aGlzLmNhbnZhcy53aWR0aD0oaCt0aGlzLmNvbnRleHQubGluZVdpZHRoKSp0aGlzLnJlc29sdXRpb247dmFyIGk9ZS5mb250U2l6ZSt0aGlzLnN0eWxlLnN0cm9rZVRoaWNrbmVzcyxqPWkqYi5sZW5ndGg7dGhpcy5zdHlsZS5kcm9wU2hhZG93JiYoais9dGhpcy5zdHlsZS5kcm9wU2hhZG93RGlzdGFuY2UpLHRoaXMuY2FudmFzLmhlaWdodD1qKnRoaXMucmVzb2x1dGlvbix0aGlzLmNvbnRleHQuc2NhbGUodGhpcy5yZXNvbHV0aW9uLHRoaXMucmVzb2x1dGlvbiksbmF2aWdhdG9yLmlzQ29jb29uSlMmJnRoaXMuY29udGV4dC5jbGVhclJlY3QoMCwwLHRoaXMuY2FudmFzLndpZHRoLHRoaXMuY2FudmFzLmhlaWdodCksdGhpcy5jb250ZXh0LmZvbnQ9dGhpcy5zdHlsZS5mb250LHRoaXMuY29udGV4dC5zdHJva2VTdHlsZT10aGlzLnN0eWxlLnN0cm9rZSx0aGlzLmNvbnRleHQubGluZVdpZHRoPXRoaXMuc3R5bGUuc3Ryb2tlVGhpY2tuZXNzLHRoaXMuY29udGV4dC50ZXh0QmFzZWxpbmU9XCJhbHBoYWJldGljXCI7dmFyIGssbDtpZih0aGlzLnN0eWxlLmRyb3BTaGFkb3cpe3RoaXMuY29udGV4dC5maWxsU3R5bGU9dGhpcy5zdHlsZS5kcm9wU2hhZG93Q29sb3I7dmFyIG09TWF0aC5zaW4odGhpcy5zdHlsZS5kcm9wU2hhZG93QW5nbGUpKnRoaXMuc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlLG49TWF0aC5jb3ModGhpcy5zdHlsZS5kcm9wU2hhZG93QW5nbGUpKnRoaXMuc3R5bGUuZHJvcFNoYWRvd0Rpc3RhbmNlO2ZvcihmPTA7ZjxiLmxlbmd0aDtmKyspaz10aGlzLnN0eWxlLnN0cm9rZVRoaWNrbmVzcy8yLGw9dGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3MvMitmKmkrZS5hc2NlbnQsXCJyaWdodFwiPT09dGhpcy5zdHlsZS5hbGlnbj9rKz1kLWNbZl06XCJjZW50ZXJcIj09PXRoaXMuc3R5bGUuYWxpZ24mJihrKz0oZC1jW2ZdKS8yKSx0aGlzLnN0eWxlLmZpbGwmJnRoaXMuY29udGV4dC5maWxsVGV4dChiW2ZdLGsrbSxsK24pfWZvcih0aGlzLmNvbnRleHQuZmlsbFN0eWxlPXRoaXMuc3R5bGUuZmlsbCxmPTA7ZjxiLmxlbmd0aDtmKyspaz10aGlzLnN0eWxlLnN0cm9rZVRoaWNrbmVzcy8yLGw9dGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3MvMitmKmkrZS5hc2NlbnQsXCJyaWdodFwiPT09dGhpcy5zdHlsZS5hbGlnbj9rKz1kLWNbZl06XCJjZW50ZXJcIj09PXRoaXMuc3R5bGUuYWxpZ24mJihrKz0oZC1jW2ZdKS8yKSx0aGlzLnN0eWxlLnN0cm9rZSYmdGhpcy5zdHlsZS5zdHJva2VUaGlja25lc3MmJnRoaXMuY29udGV4dC5zdHJva2VUZXh0KGJbZl0sayxsKSx0aGlzLnN0eWxlLmZpbGwmJnRoaXMuY29udGV4dC5maWxsVGV4dChiW2ZdLGssbCk7dGhpcy51cGRhdGVUZXh0dXJlKCl9LGIuVGV4dC5wcm90b3R5cGUudXBkYXRlVGV4dHVyZT1mdW5jdGlvbigpe3RoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS53aWR0aD10aGlzLmNhbnZhcy53aWR0aCx0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuaGVpZ2h0PXRoaXMuY2FudmFzLmhlaWdodCx0aGlzLnRleHR1cmUuY3JvcC53aWR0aD10aGlzLnRleHR1cmUuZnJhbWUud2lkdGg9dGhpcy5jYW52YXMud2lkdGgsdGhpcy50ZXh0dXJlLmNyb3AuaGVpZ2h0PXRoaXMudGV4dHVyZS5mcmFtZS5oZWlnaHQ9dGhpcy5jYW52YXMuaGVpZ2h0LHRoaXMuX3dpZHRoPXRoaXMuY2FudmFzLndpZHRoLHRoaXMuX2hlaWdodD10aGlzLmNhbnZhcy5oZWlnaHQsdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLmRpcnR5KCl9LGIuVGV4dC5wcm90b3R5cGUuX3JlbmRlcldlYkdMPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJih0aGlzLnJlc29sdXRpb249YS5yZXNvbHV0aW9uLHRoaXMudXBkYXRlVGV4dCgpLHRoaXMuZGlydHk9ITEpLGIuU3ByaXRlLnByb3RvdHlwZS5fcmVuZGVyV2ViR0wuY2FsbCh0aGlzLGEpfSxiLlRleHQucHJvdG90eXBlLl9yZW5kZXJDYW52YXM9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmKHRoaXMucmVzb2x1dGlvbj1hLnJlc29sdXRpb24sdGhpcy51cGRhdGVUZXh0KCksdGhpcy5kaXJ0eT0hMSksYi5TcHJpdGUucHJvdG90eXBlLl9yZW5kZXJDYW52YXMuY2FsbCh0aGlzLGEpfSxiLlRleHQucHJvdG90eXBlLmRldGVybWluZUZvbnRQcm9wZXJ0aWVzPWZ1bmN0aW9uKGEpe3ZhciBjPWIuVGV4dC5mb250UHJvcGVydGllc0NhY2hlW2FdO2lmKCFjKXtjPXt9O3ZhciBkPWIuVGV4dC5mb250UHJvcGVydGllc0NhbnZhcyxlPWIuVGV4dC5mb250UHJvcGVydGllc0NvbnRleHQ7ZS5mb250PWE7dmFyIGY9TWF0aC5jZWlsKGUubWVhc3VyZVRleHQoXCJ8TXFcIikud2lkdGgpLGc9TWF0aC5jZWlsKGUubWVhc3VyZVRleHQoXCJNXCIpLndpZHRoKSxoPTIqZztnPTEuNCpnfDAsZC53aWR0aD1mLGQuaGVpZ2h0PWgsZS5maWxsU3R5bGU9XCIjZjAwXCIsZS5maWxsUmVjdCgwLDAsZixoKSxlLmZvbnQ9YSxlLnRleHRCYXNlbGluZT1cImFscGhhYmV0aWNcIixlLmZpbGxTdHlsZT1cIiMwMDBcIixlLmZpbGxUZXh0KFwifE3DiXFcIiwwLGcpO3ZhciBpLGosaz1lLmdldEltYWdlRGF0YSgwLDAsZixoKS5kYXRhLGw9ay5sZW5ndGgsbT00KmYsbj0wLG89ITE7Zm9yKGk9MDtnPmk7aSsrKXtmb3Ioaj0wO20+ajtqKz00KWlmKDI1NSE9PWtbbitqXSl7bz0hMDticmVha31pZihvKWJyZWFrO24rPW19Zm9yKGMuYXNjZW50PWctaSxuPWwtbSxvPSExLGk9aDtpPmc7aS0tKXtmb3Ioaj0wO20+ajtqKz00KWlmKDI1NSE9PWtbbitqXSl7bz0hMDticmVha31pZihvKWJyZWFrO24tPW19Yy5kZXNjZW50PWktZyxjLmRlc2NlbnQrPTYsYy5mb250U2l6ZT1jLmFzY2VudCtjLmRlc2NlbnQsYi5UZXh0LmZvbnRQcm9wZXJ0aWVzQ2FjaGVbYV09Y31yZXR1cm4gY30sYi5UZXh0LnByb3RvdHlwZS53b3JkV3JhcD1mdW5jdGlvbihhKXtmb3IodmFyIGI9XCJcIixjPWEuc3BsaXQoXCJcXG5cIiksZD0wO2Q8Yy5sZW5ndGg7ZCsrKXtmb3IodmFyIGU9dGhpcy5zdHlsZS53b3JkV3JhcFdpZHRoLGY9Y1tkXS5zcGxpdChcIiBcIiksZz0wO2c8Zi5sZW5ndGg7ZysrKXt2YXIgaD10aGlzLmNvbnRleHQubWVhc3VyZVRleHQoZltnXSkud2lkdGgsaT1oK3RoaXMuY29udGV4dC5tZWFzdXJlVGV4dChcIiBcIikud2lkdGg7MD09PWd8fGk+ZT8oZz4wJiYoYis9XCJcXG5cIiksYis9ZltnXSxlPXRoaXMuc3R5bGUud29yZFdyYXBXaWR0aC1oKTooZS09aSxiKz1cIiBcIitmW2ddKX1kPGMubGVuZ3RoLTEmJihiKz1cIlxcblwiKX1yZXR1cm4gYn0sYi5UZXh0LnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZGlydHkmJih0aGlzLnVwZGF0ZVRleHQoKSx0aGlzLmRpcnR5PSExKSxiLlNwcml0ZS5wcm90b3R5cGUuZ2V0Qm91bmRzLmNhbGwodGhpcyxhKX0sYi5UZXh0LnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKGEpe3RoaXMuY29udGV4dD1udWxsLHRoaXMuY2FudmFzPW51bGwsdGhpcy50ZXh0dXJlLmRlc3Ryb3kodm9pZCAwPT09YT8hMDphKX0sYi5UZXh0LmZvbnRQcm9wZXJ0aWVzQ2FjaGU9e30sYi5UZXh0LmZvbnRQcm9wZXJ0aWVzQ2FudmFzPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksYi5UZXh0LmZvbnRQcm9wZXJ0aWVzQ29udGV4dD1iLlRleHQuZm9udFByb3BlcnRpZXNDYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLGIuQml0bWFwVGV4dD1mdW5jdGlvbihhLGMpe2IuRGlzcGxheU9iamVjdENvbnRhaW5lci5jYWxsKHRoaXMpLHRoaXMudGV4dFdpZHRoPTAsdGhpcy50ZXh0SGVpZ2h0PTAsdGhpcy5fcG9vbD1bXSx0aGlzLnNldFRleHQoYSksdGhpcy5zZXRTdHlsZShjKSx0aGlzLnVwZGF0ZVRleHQoKSx0aGlzLmRpcnR5PSExfSxiLkJpdG1hcFRleHQucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSksYi5CaXRtYXBUZXh0LnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkJpdG1hcFRleHQsYi5CaXRtYXBUZXh0LnByb3RvdHlwZS5zZXRUZXh0PWZ1bmN0aW9uKGEpe3RoaXMudGV4dD1hfHxcIiBcIix0aGlzLmRpcnR5PSEwfSxiLkJpdG1hcFRleHQucHJvdG90eXBlLnNldFN0eWxlPWZ1bmN0aW9uKGEpe2E9YXx8e30sYS5hbGlnbj1hLmFsaWdufHxcImxlZnRcIix0aGlzLnN0eWxlPWE7dmFyIGM9YS5mb250LnNwbGl0KFwiIFwiKTt0aGlzLmZvbnROYW1lPWNbYy5sZW5ndGgtMV0sdGhpcy5mb250U2l6ZT1jLmxlbmd0aD49Mj9wYXJzZUludChjW2MubGVuZ3RoLTJdLDEwKTpiLkJpdG1hcFRleHQuZm9udHNbdGhpcy5mb250TmFtZV0uc2l6ZSx0aGlzLmRpcnR5PSEwLHRoaXMudGludD1hLnRpbnR9LGIuQml0bWFwVGV4dC5wcm90b3R5cGUudXBkYXRlVGV4dD1mdW5jdGlvbigpe2Zvcih2YXIgYT1iLkJpdG1hcFRleHQuZm9udHNbdGhpcy5mb250TmFtZV0sYz1uZXcgYi5Qb2ludCxkPW51bGwsZT1bXSxmPTAsZz1bXSxoPTAsaT10aGlzLmZvbnRTaXplL2Euc2l6ZSxqPTA7ajx0aGlzLnRleHQubGVuZ3RoO2orKyl7dmFyIGs9dGhpcy50ZXh0LmNoYXJDb2RlQXQoaik7aWYoLyg/OlxcclxcbnxcXHJ8XFxuKS8udGVzdCh0aGlzLnRleHQuY2hhckF0KGopKSlnLnB1c2goYy54KSxmPU1hdGgubWF4KGYsYy54KSxoKyssYy54PTAsYy55Kz1hLmxpbmVIZWlnaHQsZD1udWxsO2Vsc2V7dmFyIGw9YS5jaGFyc1trXTtsJiYoZCYmbC5rZXJuaW5nW2RdJiYoYy54Kz1sLmtlcm5pbmdbZF0pLGUucHVzaCh7dGV4dHVyZTpsLnRleHR1cmUsbGluZTpoLGNoYXJDb2RlOmsscG9zaXRpb246bmV3IGIuUG9pbnQoYy54K2wueE9mZnNldCxjLnkrbC55T2Zmc2V0KX0pLGMueCs9bC54QWR2YW5jZSxkPWspfX1nLnB1c2goYy54KSxmPU1hdGgubWF4KGYsYy54KTt2YXIgbT1bXTtmb3Ioaj0wO2g+PWo7aisrKXt2YXIgbj0wO1wicmlnaHRcIj09PXRoaXMuc3R5bGUuYWxpZ24/bj1mLWdbal06XCJjZW50ZXJcIj09PXRoaXMuc3R5bGUuYWxpZ24mJihuPShmLWdbal0pLzIpLG0ucHVzaChuKX12YXIgbz10aGlzLmNoaWxkcmVuLmxlbmd0aCxwPWUubGVuZ3RoLHE9dGhpcy50aW50fHwxNjc3NzIxNTtmb3Ioaj0wO3A+ajtqKyspe3ZhciByPW8+aj90aGlzLmNoaWxkcmVuW2pdOnRoaXMuX3Bvb2wucG9wKCk7cj9yLnNldFRleHR1cmUoZVtqXS50ZXh0dXJlKTpyPW5ldyBiLlNwcml0ZShlW2pdLnRleHR1cmUpLHIucG9zaXRpb24ueD0oZVtqXS5wb3NpdGlvbi54K21bZVtqXS5saW5lXSkqaSxyLnBvc2l0aW9uLnk9ZVtqXS5wb3NpdGlvbi55Kmksci5zY2FsZS54PXIuc2NhbGUueT1pLHIudGludD1xLHIucGFyZW50fHx0aGlzLmFkZENoaWxkKHIpfWZvcig7dGhpcy5jaGlsZHJlbi5sZW5ndGg+cDspe3ZhciBzPXRoaXMuZ2V0Q2hpbGRBdCh0aGlzLmNoaWxkcmVuLmxlbmd0aC0xKTt0aGlzLl9wb29sLnB1c2gocyksdGhpcy5yZW1vdmVDaGlsZChzKX10aGlzLnRleHRXaWR0aD1mKmksdGhpcy50ZXh0SGVpZ2h0PShjLnkrYS5saW5lSGVpZ2h0KSppfSxiLkJpdG1hcFRleHQucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybT1mdW5jdGlvbigpe3RoaXMuZGlydHkmJih0aGlzLnVwZGF0ZVRleHQoKSx0aGlzLmRpcnR5PSExKSxiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybS5jYWxsKHRoaXMpfSxiLkJpdG1hcFRleHQuZm9udHM9e30sYi5JbnRlcmFjdGlvbkRhdGE9ZnVuY3Rpb24oKXt0aGlzLmdsb2JhbD1uZXcgYi5Qb2ludCx0aGlzLnRhcmdldD1udWxsLHRoaXMub3JpZ2luYWxFdmVudD1udWxsfSxiLkludGVyYWN0aW9uRGF0YS5wcm90b3R5cGUuZ2V0TG9jYWxQb3NpdGlvbj1mdW5jdGlvbihhLGMpe3ZhciBkPWEud29ybGRUcmFuc2Zvcm0sZT10aGlzLmdsb2JhbCxmPWQuYSxnPWQuYyxoPWQudHgsaT1kLmIsaj1kLmQsaz1kLnR5LGw9MS8oZipqK2cqLWkpO3JldHVybiBjPWN8fG5ldyBiLlBvaW50LGMueD1qKmwqZS54Ky1nKmwqZS55KyhrKmctaCpqKSpsLGMueT1mKmwqZS55Ky1pKmwqZS54KygtaypmK2gqaSkqbCxjfSxiLkludGVyYWN0aW9uRGF0YS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5JbnRlcmFjdGlvbkRhdGEsYi5JbnRlcmFjdGlvbk1hbmFnZXI9ZnVuY3Rpb24oYSl7dGhpcy5zdGFnZT1hLHRoaXMubW91c2U9bmV3IGIuSW50ZXJhY3Rpb25EYXRhLHRoaXMudG91Y2hlcz17fSx0aGlzLnRlbXBQb2ludD1uZXcgYi5Qb2ludCx0aGlzLm1vdXNlb3ZlckVuYWJsZWQ9ITAsdGhpcy5wb29sPVtdLHRoaXMuaW50ZXJhY3RpdmVJdGVtcz1bXSx0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudD1udWxsLHRoaXMub25Nb3VzZU1vdmU9dGhpcy5vbk1vdXNlTW92ZS5iaW5kKHRoaXMpLHRoaXMub25Nb3VzZURvd249dGhpcy5vbk1vdXNlRG93bi5iaW5kKHRoaXMpLHRoaXMub25Nb3VzZU91dD10aGlzLm9uTW91c2VPdXQuYmluZCh0aGlzKSx0aGlzLm9uTW91c2VVcD10aGlzLm9uTW91c2VVcC5iaW5kKHRoaXMpLHRoaXMub25Ub3VjaFN0YXJ0PXRoaXMub25Ub3VjaFN0YXJ0LmJpbmQodGhpcyksdGhpcy5vblRvdWNoRW5kPXRoaXMub25Ub3VjaEVuZC5iaW5kKHRoaXMpLHRoaXMub25Ub3VjaE1vdmU9dGhpcy5vblRvdWNoTW92ZS5iaW5kKHRoaXMpLHRoaXMubGFzdD0wLHRoaXMuY3VycmVudEN1cnNvclN0eWxlPVwiaW5oZXJpdFwiLHRoaXMubW91c2VPdXQ9ITEsdGhpcy5yZXNvbHV0aW9uPTEsdGhpcy5fdGVtcFBvaW50PW5ldyBiLlBvaW50fSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5JbnRlcmFjdGlvbk1hbmFnZXIsYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLmNvbGxlY3RJbnRlcmFjdGl2ZVNwcml0ZT1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1hLmNoaWxkcmVuLGQ9Yy5sZW5ndGgsZT1kLTE7ZT49MDtlLS0pe3ZhciBmPWNbZV07XG5mLl9pbnRlcmFjdGl2ZT8oYi5pbnRlcmFjdGl2ZUNoaWxkcmVuPSEwLHRoaXMuaW50ZXJhY3RpdmVJdGVtcy5wdXNoKGYpLGYuY2hpbGRyZW4ubGVuZ3RoPjAmJnRoaXMuY29sbGVjdEludGVyYWN0aXZlU3ByaXRlKGYsZikpOihmLl9faVBhcmVudD1udWxsLGYuY2hpbGRyZW4ubGVuZ3RoPjAmJnRoaXMuY29sbGVjdEludGVyYWN0aXZlU3ByaXRlKGYsYikpfX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnNldFRhcmdldD1mdW5jdGlvbihhKXt0aGlzLnRhcmdldD1hLHRoaXMucmVzb2x1dGlvbj1hLnJlc29sdXRpb24sbnVsbD09PXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50JiZ0aGlzLnNldFRhcmdldERvbUVsZW1lbnQoYS52aWV3KX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnNldFRhcmdldERvbUVsZW1lbnQ9ZnVuY3Rpb24oYSl7dGhpcy5yZW1vdmVFdmVudHMoKSx3aW5kb3cubmF2aWdhdG9yLm1zUG9pbnRlckVuYWJsZWQmJihhLnN0eWxlW1wiLW1zLWNvbnRlbnQtem9vbWluZ1wiXT1cIm5vbmVcIixhLnN0eWxlW1wiLW1zLXRvdWNoLWFjdGlvblwiXT1cIm5vbmVcIiksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQ9YSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIix0aGlzLm9uTW91c2VNb3ZlLCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIix0aGlzLm9uTW91c2VEb3duLCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLHRoaXMub25Nb3VzZU91dCwhMCksYS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2hzdGFydFwiLHRoaXMub25Ub3VjaFN0YXJ0LCEwKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJ0b3VjaGVuZFwiLHRoaXMub25Ub3VjaEVuZCwhMCksYS5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsdGhpcy5vblRvdWNoTW92ZSwhMCksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZXVwXCIsdGhpcy5vbk1vdXNlVXAsITApfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRzPWZ1bmN0aW9uKCl7dGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQmJih0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZVtcIi1tcy1jb250ZW50LXpvb21pbmdcIl09XCJcIix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZVtcIi1tcy10b3VjaC1hY3Rpb25cIl09XCJcIix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsdGhpcy5vbk1vdXNlTW92ZSwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLHRoaXMub25Nb3VzZURvd24sITApLHRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZW91dFwiLHRoaXMub25Nb3VzZU91dCwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoc3RhcnRcIix0aGlzLm9uVG91Y2hTdGFydCwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInRvdWNoZW5kXCIsdGhpcy5vblRvdWNoRW5kLCEwKSx0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsdGhpcy5vblRvdWNoTW92ZSwhMCksdGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQ9bnVsbCx3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcIm1vdXNldXBcIix0aGlzLm9uTW91c2VVcCwhMCkpfSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7aWYodGhpcy50YXJnZXQpe3ZhciBhPURhdGUubm93KCksYz1hLXRoaXMubGFzdDtpZihjPWMqYi5JTlRFUkFDVElPTl9GUkVRVUVOQ1kvMWUzLCEoMT5jKSl7dGhpcy5sYXN0PWE7dmFyIGQ9MDt0aGlzLmRpcnR5JiZ0aGlzLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoKCk7dmFyIGU9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxmPVwiaW5oZXJpdFwiLGc9ITE7Zm9yKGQ9MDtlPmQ7ZCsrKXt2YXIgaD10aGlzLmludGVyYWN0aXZlSXRlbXNbZF07aC5fX2hpdD10aGlzLmhpdFRlc3QoaCx0aGlzLm1vdXNlKSx0aGlzLm1vdXNlLnRhcmdldD1oLGguX19oaXQmJiFnPyhoLmJ1dHRvbk1vZGUmJihmPWguZGVmYXVsdEN1cnNvciksaC5pbnRlcmFjdGl2ZUNoaWxkcmVufHwoZz0hMCksaC5fX2lzT3Zlcnx8KGgubW91c2VvdmVyJiZoLm1vdXNlb3Zlcih0aGlzLm1vdXNlKSxoLl9faXNPdmVyPSEwKSk6aC5fX2lzT3ZlciYmKGgubW91c2VvdXQmJmgubW91c2VvdXQodGhpcy5tb3VzZSksaC5fX2lzT3Zlcj0hMSl9dGhpcy5jdXJyZW50Q3Vyc29yU3R5bGUhPT1mJiYodGhpcy5jdXJyZW50Q3Vyc29yU3R5bGU9Zix0aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5zdHlsZS5jdXJzb3I9Zil9fX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoPWZ1bmN0aW9uKCl7dGhpcy5kaXJ0eT0hMTtmb3IodmFyIGE9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxiPTA7YT5iO2IrKyl0aGlzLmludGVyYWN0aXZlSXRlbXNbYl0uaW50ZXJhY3RpdmVDaGlsZHJlbj0hMTt0aGlzLmludGVyYWN0aXZlSXRlbXM9W10sdGhpcy5zdGFnZS5pbnRlcmFjdGl2ZSYmdGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLnB1c2godGhpcy5zdGFnZSksdGhpcy5jb2xsZWN0SW50ZXJhY3RpdmVTcHJpdGUodGhpcy5zdGFnZSx0aGlzLnN0YWdlKX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VNb3ZlPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKSx0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQ9YTt2YXIgYj10aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTt0aGlzLm1vdXNlLmdsb2JhbC54PShhLmNsaWVudFgtYi5sZWZ0KSoodGhpcy50YXJnZXQud2lkdGgvYi53aWR0aCkvdGhpcy5yZXNvbHV0aW9uLHRoaXMubW91c2UuZ2xvYmFsLnk9KGEuY2xpZW50WS1iLnRvcCkqKHRoaXMudGFyZ2V0LmhlaWdodC9iLmhlaWdodCkvdGhpcy5yZXNvbHV0aW9uO2Zvcih2YXIgYz10aGlzLmludGVyYWN0aXZlSXRlbXMubGVuZ3RoLGQ9MDtjPmQ7ZCsrKXt2YXIgZT10aGlzLmludGVyYWN0aXZlSXRlbXNbZF07ZS5tb3VzZW1vdmUmJmUubW91c2Vtb3ZlKHRoaXMubW91c2UpfX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VEb3duPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKSx0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQ9YSxiLkFVVE9fUFJFVkVOVF9ERUZBVUxUJiZ0aGlzLm1vdXNlLm9yaWdpbmFsRXZlbnQucHJldmVudERlZmF1bHQoKTtmb3IodmFyIGM9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxkPXRoaXMubW91c2Uub3JpZ2luYWxFdmVudCxlPTI9PT1kLmJ1dHRvbnx8Mz09PWQud2hpY2gsZj1lP1wicmlnaHRkb3duXCI6XCJtb3VzZWRvd25cIixnPWU/XCJyaWdodGNsaWNrXCI6XCJjbGlja1wiLGg9ZT9cIl9fcmlnaHRJc0Rvd25cIjpcIl9fbW91c2VJc0Rvd25cIixpPWU/XCJfX2lzUmlnaHREb3duXCI6XCJfX2lzRG93blwiLGo9MDtjPmo7aisrKXt2YXIgaz10aGlzLmludGVyYWN0aXZlSXRlbXNbal07aWYoKGtbZl18fGtbZ10pJiYoa1toXT0hMCxrLl9faGl0PXRoaXMuaGl0VGVzdChrLHRoaXMubW91c2UpLGsuX19oaXQmJihrW2ZdJiZrW2ZdKHRoaXMubW91c2UpLGtbaV09ITAsIWsuaW50ZXJhY3RpdmVDaGlsZHJlbikpKWJyZWFrfX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VPdXQ9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmdGhpcy5yZWJ1aWxkSW50ZXJhY3RpdmVHcmFwaCgpLHRoaXMubW91c2Uub3JpZ2luYWxFdmVudD1hO3ZhciBiPXRoaXMuaW50ZXJhY3RpdmVJdGVtcy5sZW5ndGg7dGhpcy5pbnRlcmFjdGlvbkRPTUVsZW1lbnQuc3R5bGUuY3Vyc29yPVwiaW5oZXJpdFwiO2Zvcih2YXIgYz0wO2I+YztjKyspe3ZhciBkPXRoaXMuaW50ZXJhY3RpdmVJdGVtc1tjXTtkLl9faXNPdmVyJiYodGhpcy5tb3VzZS50YXJnZXQ9ZCxkLm1vdXNlb3V0JiZkLm1vdXNlb3V0KHRoaXMubW91c2UpLGQuX19pc092ZXI9ITEpfXRoaXMubW91c2VPdXQ9ITAsdGhpcy5tb3VzZS5nbG9iYWwueD0tMWU0LHRoaXMubW91c2UuZ2xvYmFsLnk9LTFlNH0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uTW91c2VVcD1mdW5jdGlvbihhKXt0aGlzLmRpcnR5JiZ0aGlzLnJlYnVpbGRJbnRlcmFjdGl2ZUdyYXBoKCksdGhpcy5tb3VzZS5vcmlnaW5hbEV2ZW50PWE7Zm9yKHZhciBiPXRoaXMuaW50ZXJhY3RpdmVJdGVtcy5sZW5ndGgsYz0hMSxkPXRoaXMubW91c2Uub3JpZ2luYWxFdmVudCxlPTI9PT1kLmJ1dHRvbnx8Mz09PWQud2hpY2gsZj1lP1wicmlnaHR1cFwiOlwibW91c2V1cFwiLGc9ZT9cInJpZ2h0Y2xpY2tcIjpcImNsaWNrXCIsaD1lP1wicmlnaHR1cG91dHNpZGVcIjpcIm1vdXNldXBvdXRzaWRlXCIsaT1lP1wiX19pc1JpZ2h0RG93blwiOlwiX19pc0Rvd25cIixqPTA7Yj5qO2orKyl7dmFyIGs9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zW2pdOyhrW2ddfHxrW2ZdfHxrW2hdKSYmKGsuX19oaXQ9dGhpcy5oaXRUZXN0KGssdGhpcy5tb3VzZSksay5fX2hpdCYmIWM/KGtbZl0mJmtbZl0odGhpcy5tb3VzZSksa1tpXSYma1tnXSYma1tnXSh0aGlzLm1vdXNlKSxrLmludGVyYWN0aXZlQ2hpbGRyZW58fChjPSEwKSk6a1tpXSYma1toXSYma1toXSh0aGlzLm1vdXNlKSxrW2ldPSExKX19LGIuSW50ZXJhY3Rpb25NYW5hZ2VyLnByb3RvdHlwZS5oaXRUZXN0PWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yy5nbG9iYWw7aWYoIWEud29ybGRWaXNpYmxlKXJldHVybiExO2Eud29ybGRUcmFuc2Zvcm0uYXBwbHlJbnZlcnNlKGQsdGhpcy5fdGVtcFBvaW50KTt2YXIgZSxmPXRoaXMuX3RlbXBQb2ludC54LGc9dGhpcy5fdGVtcFBvaW50Lnk7aWYoYy50YXJnZXQ9YSxhLmhpdEFyZWEmJmEuaGl0QXJlYS5jb250YWlucylyZXR1cm4gYS5oaXRBcmVhLmNvbnRhaW5zKGYsZyk7aWYoYSBpbnN0YW5jZW9mIGIuU3ByaXRlKXt2YXIgaCxpPWEudGV4dHVyZS5mcmFtZS53aWR0aCxqPWEudGV4dHVyZS5mcmFtZS5oZWlnaHQsaz0taSphLmFuY2hvci54O2lmKGY+ayYmaytpPmYmJihoPS1qKmEuYW5jaG9yLnksZz5oJiZoK2o+ZykpcmV0dXJuITB9ZWxzZSBpZihhIGluc3RhbmNlb2YgYi5HcmFwaGljcyl7dmFyIGw9YS5ncmFwaGljc0RhdGE7Zm9yKGU9MDtlPGwubGVuZ3RoO2UrKyl7dmFyIG09bFtlXTtpZihtLmZpbGwmJm0uc2hhcGUmJm0uc2hhcGUuY29udGFpbnMoZixnKSlyZXR1cm4hMH19dmFyIG49YS5jaGlsZHJlbi5sZW5ndGg7Zm9yKGU9MDtuPmU7ZSsrKXt2YXIgbz1hLmNoaWxkcmVuW2VdLHA9dGhpcy5oaXRUZXN0KG8sYyk7aWYocClyZXR1cm4gYy50YXJnZXQ9YSwhMH1yZXR1cm4hMX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uVG91Y2hNb3ZlPWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKTt2YXIgYixjPXRoaXMuaW50ZXJhY3Rpb25ET01FbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLGQ9YS5jaGFuZ2VkVG91Y2hlcyxlPTA7Zm9yKGU9MDtlPGQubGVuZ3RoO2UrKyl7dmFyIGY9ZFtlXTtiPXRoaXMudG91Y2hlc1tmLmlkZW50aWZpZXJdLGIub3JpZ2luYWxFdmVudD1hLGIuZ2xvYmFsLng9KGYuY2xpZW50WC1jLmxlZnQpKih0aGlzLnRhcmdldC53aWR0aC9jLndpZHRoKS90aGlzLnJlc29sdXRpb24sYi5nbG9iYWwueT0oZi5jbGllbnRZLWMudG9wKSoodGhpcy50YXJnZXQuaGVpZ2h0L2MuaGVpZ2h0KS90aGlzLnJlc29sdXRpb24sIW5hdmlnYXRvci5pc0NvY29vbkpTfHxjLmxlZnR8fGMudG9wfHxhLnRhcmdldC5zdHlsZS53aWR0aHx8YS50YXJnZXQuc3R5bGUuaGVpZ2h0fHwoYi5nbG9iYWwueD1mLmNsaWVudFgsYi5nbG9iYWwueT1mLmNsaWVudFkpO2Zvcih2YXIgZz0wO2c8dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aDtnKyspe3ZhciBoPXRoaXMuaW50ZXJhY3RpdmVJdGVtc1tnXTtoLnRvdWNobW92ZSYmaC5fX3RvdWNoRGF0YSYmaC5fX3RvdWNoRGF0YVtmLmlkZW50aWZpZXJdJiZoLnRvdWNobW92ZShiKX19fSxiLkludGVyYWN0aW9uTWFuYWdlci5wcm90b3R5cGUub25Ub3VjaFN0YXJ0PWZ1bmN0aW9uKGEpe3RoaXMuZGlydHkmJnRoaXMucmVidWlsZEludGVyYWN0aXZlR3JhcGgoKTt2YXIgYz10aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtiLkFVVE9fUFJFVkVOVF9ERUZBVUxUJiZhLnByZXZlbnREZWZhdWx0KCk7Zm9yKHZhciBkPWEuY2hhbmdlZFRvdWNoZXMsZT0wO2U8ZC5sZW5ndGg7ZSsrKXt2YXIgZj1kW2VdLGc9dGhpcy5wb29sLnBvcCgpO2d8fChnPW5ldyBiLkludGVyYWN0aW9uRGF0YSksZy5vcmlnaW5hbEV2ZW50PWEsdGhpcy50b3VjaGVzW2YuaWRlbnRpZmllcl09ZyxnLmdsb2JhbC54PShmLmNsaWVudFgtYy5sZWZ0KSoodGhpcy50YXJnZXQud2lkdGgvYy53aWR0aCkvdGhpcy5yZXNvbHV0aW9uLGcuZ2xvYmFsLnk9KGYuY2xpZW50WS1jLnRvcCkqKHRoaXMudGFyZ2V0LmhlaWdodC9jLmhlaWdodCkvdGhpcy5yZXNvbHV0aW9uLCFuYXZpZ2F0b3IuaXNDb2Nvb25KU3x8Yy5sZWZ0fHxjLnRvcHx8YS50YXJnZXQuc3R5bGUud2lkdGh8fGEudGFyZ2V0LnN0eWxlLmhlaWdodHx8KGcuZ2xvYmFsLng9Zi5jbGllbnRYLGcuZ2xvYmFsLnk9Zi5jbGllbnRZKTtmb3IodmFyIGg9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxpPTA7aD5pO2krKyl7dmFyIGo9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zW2ldO2lmKChqLnRvdWNoc3RhcnR8fGoudGFwKSYmKGouX19oaXQ9dGhpcy5oaXRUZXN0KGosZyksai5fX2hpdCYmKGoudG91Y2hzdGFydCYmai50b3VjaHN0YXJ0KGcpLGouX19pc0Rvd249ITAsai5fX3RvdWNoRGF0YT1qLl9fdG91Y2hEYXRhfHx7fSxqLl9fdG91Y2hEYXRhW2YuaWRlbnRpZmllcl09Zywhai5pbnRlcmFjdGl2ZUNoaWxkcmVuKSkpYnJlYWt9fX0sYi5JbnRlcmFjdGlvbk1hbmFnZXIucHJvdG90eXBlLm9uVG91Y2hFbmQ9ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eSYmdGhpcy5yZWJ1aWxkSW50ZXJhY3RpdmVHcmFwaCgpO2Zvcih2YXIgYj10aGlzLmludGVyYWN0aW9uRE9NRWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxjPWEuY2hhbmdlZFRvdWNoZXMsZD0wO2Q8Yy5sZW5ndGg7ZCsrKXt2YXIgZT1jW2RdLGY9dGhpcy50b3VjaGVzW2UuaWRlbnRpZmllcl0sZz0hMTtmLmdsb2JhbC54PShlLmNsaWVudFgtYi5sZWZ0KSoodGhpcy50YXJnZXQud2lkdGgvYi53aWR0aCkvdGhpcy5yZXNvbHV0aW9uLGYuZ2xvYmFsLnk9KGUuY2xpZW50WS1iLnRvcCkqKHRoaXMudGFyZ2V0LmhlaWdodC9iLmhlaWdodCkvdGhpcy5yZXNvbHV0aW9uLCFuYXZpZ2F0b3IuaXNDb2Nvb25KU3x8Yi5sZWZ0fHxiLnRvcHx8YS50YXJnZXQuc3R5bGUud2lkdGh8fGEudGFyZ2V0LnN0eWxlLmhlaWdodHx8KGYuZ2xvYmFsLng9ZS5jbGllbnRYLGYuZ2xvYmFsLnk9ZS5jbGllbnRZKTtmb3IodmFyIGg9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zLmxlbmd0aCxpPTA7aD5pO2krKyl7dmFyIGo9dGhpcy5pbnRlcmFjdGl2ZUl0ZW1zW2ldO2ouX190b3VjaERhdGEmJmouX190b3VjaERhdGFbZS5pZGVudGlmaWVyXSYmKGouX19oaXQ9dGhpcy5oaXRUZXN0KGosai5fX3RvdWNoRGF0YVtlLmlkZW50aWZpZXJdKSxmLm9yaWdpbmFsRXZlbnQ9YSwoai50b3VjaGVuZHx8ai50YXApJiYoai5fX2hpdCYmIWc/KGoudG91Y2hlbmQmJmoudG91Y2hlbmQoZiksai5fX2lzRG93biYmai50YXAmJmoudGFwKGYpLGouaW50ZXJhY3RpdmVDaGlsZHJlbnx8KGc9ITApKTpqLl9faXNEb3duJiZqLnRvdWNoZW5kb3V0c2lkZSYmai50b3VjaGVuZG91dHNpZGUoZiksai5fX2lzRG93bj0hMSksai5fX3RvdWNoRGF0YVtlLmlkZW50aWZpZXJdPW51bGwpfXRoaXMucG9vbC5wdXNoKGYpLHRoaXMudG91Y2hlc1tlLmlkZW50aWZpZXJdPW51bGx9fSxiLlN0YWdlPWZ1bmN0aW9uKGEpe2IuRGlzcGxheU9iamVjdENvbnRhaW5lci5jYWxsKHRoaXMpLHRoaXMud29ybGRUcmFuc2Zvcm09bmV3IGIuTWF0cml4LHRoaXMuaW50ZXJhY3RpdmU9ITAsdGhpcy5pbnRlcmFjdGlvbk1hbmFnZXI9bmV3IGIuSW50ZXJhY3Rpb25NYW5hZ2VyKHRoaXMpLHRoaXMuZGlydHk9ITAsdGhpcy5zdGFnZT10aGlzLHRoaXMuc3RhZ2UuaGl0QXJlYT1uZXcgYi5SZWN0YW5nbGUoMCwwLDFlNSwxZTUpLHRoaXMuc2V0QmFja2dyb3VuZENvbG9yKGEpfSxiLlN0YWdlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUpLGIuU3RhZ2UucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuU3RhZ2UsYi5TdGFnZS5wcm90b3R5cGUuc2V0SW50ZXJhY3Rpb25EZWxlZ2F0ZT1mdW5jdGlvbihhKXt0aGlzLmludGVyYWN0aW9uTWFuYWdlci5zZXRUYXJnZXREb21FbGVtZW50KGEpfSxiLlN0YWdlLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm09ZnVuY3Rpb24oKXt0aGlzLndvcmxkQWxwaGE9MTtmb3IodmFyIGE9MCxiPXRoaXMuY2hpbGRyZW4ubGVuZ3RoO2I+YTthKyspdGhpcy5jaGlsZHJlblthXS51cGRhdGVUcmFuc2Zvcm0oKTt0aGlzLmRpcnR5JiYodGhpcy5kaXJ0eT0hMSx0aGlzLmludGVyYWN0aW9uTWFuYWdlci5kaXJ0eT0hMCksdGhpcy5pbnRlcmFjdGl2ZSYmdGhpcy5pbnRlcmFjdGlvbk1hbmFnZXIudXBkYXRlKCl9LGIuU3RhZ2UucHJvdG90eXBlLnNldEJhY2tncm91bmRDb2xvcj1mdW5jdGlvbihhKXt0aGlzLmJhY2tncm91bmRDb2xvcj1hfHwwLHRoaXMuYmFja2dyb3VuZENvbG9yU3BsaXQ9Yi5oZXgycmdiKHRoaXMuYmFja2dyb3VuZENvbG9yKTt2YXIgYz10aGlzLmJhY2tncm91bmRDb2xvci50b1N0cmluZygxNik7Yz1cIjAwMDAwMFwiLnN1YnN0cigwLDYtYy5sZW5ndGgpK2MsdGhpcy5iYWNrZ3JvdW5kQ29sb3JTdHJpbmc9XCIjXCIrY30sYi5TdGFnZS5wcm90b3R5cGUuZ2V0TW91c2VQb3NpdGlvbj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmludGVyYWN0aW9uTWFuYWdlci5tb3VzZS5nbG9iYWx9LGZ1bmN0aW9uKGEpe2Zvcih2YXIgYj0wLGM9W1wibXNcIixcIm1velwiLFwid2Via2l0XCIsXCJvXCJdLGQ9MDtkPGMubGVuZ3RoJiYhYS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7KytkKWEucmVxdWVzdEFuaW1hdGlvbkZyYW1lPWFbY1tkXStcIlJlcXVlc3RBbmltYXRpb25GcmFtZVwiXSxhLmNhbmNlbEFuaW1hdGlvbkZyYW1lPWFbY1tkXStcIkNhbmNlbEFuaW1hdGlvbkZyYW1lXCJdfHxhW2NbZF0rXCJDYW5jZWxSZXF1ZXN0QW5pbWF0aW9uRnJhbWVcIl07YS5yZXF1ZXN0QW5pbWF0aW9uRnJhbWV8fChhLnJlcXVlc3RBbmltYXRpb25GcmFtZT1mdW5jdGlvbihjKXt2YXIgZD0obmV3IERhdGUpLmdldFRpbWUoKSxlPU1hdGgubWF4KDAsMTYtKGQtYikpLGY9YS5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YyhkK2UpfSxlKTtyZXR1cm4gYj1kK2UsZn0pLGEuY2FuY2VsQW5pbWF0aW9uRnJhbWV8fChhLmNhbmNlbEFuaW1hdGlvbkZyYW1lPWZ1bmN0aW9uKGEpe2NsZWFyVGltZW91dChhKX0pLGEucmVxdWVzdEFuaW1GcmFtZT1hLnJlcXVlc3RBbmltYXRpb25GcmFtZX0odGhpcyksYi5oZXgycmdiPWZ1bmN0aW9uKGEpe3JldHVyblsoYT4+MTYmMjU1KS8yNTUsKGE+PjgmMjU1KS8yNTUsKDI1NSZhKS8yNTVdfSxiLnJnYjJoZXg9ZnVuY3Rpb24oYSl7cmV0dXJuKDI1NSphWzBdPDwxNikrKDI1NSphWzFdPDw4KSsyNTUqYVsyXX0sXCJmdW5jdGlvblwiIT10eXBlb2YgRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQmJihGdW5jdGlvbi5wcm90b3R5cGUuYmluZD1mdW5jdGlvbigpe3JldHVybiBmdW5jdGlvbihhKXtmdW5jdGlvbiBiKCl7Zm9yKHZhciBkPWFyZ3VtZW50cy5sZW5ndGgsZj1uZXcgQXJyYXkoZCk7ZC0tOylmW2RdPWFyZ3VtZW50c1tkXTtyZXR1cm4gZj1lLmNvbmNhdChmKSxjLmFwcGx5KHRoaXMgaW5zdGFuY2VvZiBiP3RoaXM6YSxmKX12YXIgYz10aGlzLGQ9YXJndW1lbnRzLmxlbmd0aC0xLGU9W107aWYoZD4wKWZvcihlLmxlbmd0aD1kO2QtLTspZVtkXT1hcmd1bWVudHNbZCsxXTtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBjKXRocm93IG5ldyBUeXBlRXJyb3I7cmV0dXJuIGIucHJvdG90eXBlPWZ1bmN0aW9uIGYoYSl7cmV0dXJuIGEmJihmLnByb3RvdHlwZT1hKSx0aGlzIGluc3RhbmNlb2YgZj92b2lkIDA6bmV3IGZ9KGMucHJvdG90eXBlKSxifX0oKSksYi5BamF4UmVxdWVzdD1mdW5jdGlvbigpe3ZhciBhPVtcIk1zeG1sMi5YTUxIVFRQLjYuMFwiLFwiTXN4bWwyLlhNTEhUVFAuMy4wXCIsXCJNaWNyb3NvZnQuWE1MSFRUUFwiXTtpZighd2luZG93LkFjdGl2ZVhPYmplY3QpcmV0dXJuIHdpbmRvdy5YTUxIdHRwUmVxdWVzdD9uZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0OiExO2Zvcih2YXIgYj0wO2I8YS5sZW5ndGg7YisrKXRyeXtyZXR1cm4gbmV3IHdpbmRvdy5BY3RpdmVYT2JqZWN0KGFbYl0pfWNhdGNoKGMpe319LGIuY2FuVXNlTmV3Q2FudmFzQmxlbmRNb2Rlcz1mdW5jdGlvbigpe2lmKFwidW5kZWZpbmVkXCI9PXR5cGVvZiBkb2N1bWVudClyZXR1cm4hMTt2YXIgYT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO2Eud2lkdGg9MSxhLmhlaWdodD0xO3ZhciBiPWEuZ2V0Q29udGV4dChcIjJkXCIpO3JldHVybiBiLmZpbGxTdHlsZT1cIiMwMDBcIixiLmZpbGxSZWN0KDAsMCwxLDEpLGIuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPVwibXVsdGlwbHlcIixiLmZpbGxTdHlsZT1cIiNmZmZcIixiLmZpbGxSZWN0KDAsMCwxLDEpLDA9PT1iLmdldEltYWdlRGF0YSgwLDAsMSwxKS5kYXRhWzBdfSxiLmdldE5leHRQb3dlck9mVHdvPWZ1bmN0aW9uKGEpe2lmKGE+MCYmMD09PShhJmEtMSkpcmV0dXJuIGE7Zm9yKHZhciBiPTE7YT5iOyliPDw9MTtyZXR1cm4gYn0sYi5pc1Bvd2VyT2ZUd289ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT4wJiYwPT09KGEmYS0xKSYmYj4wJiYwPT09KGImYi0xKX0sYi5FdmVudFRhcmdldD17Y2FsbDpmdW5jdGlvbihhKXthJiYoYT1hLnByb3RvdHlwZXx8YSxiLkV2ZW50VGFyZ2V0Lm1peGluKGEpKX0sbWl4aW46ZnVuY3Rpb24oYSl7YS5saXN0ZW5lcnM9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuX2xpc3RlbmVycz10aGlzLl9saXN0ZW5lcnN8fHt9LHRoaXMuX2xpc3RlbmVyc1thXT90aGlzLl9saXN0ZW5lcnNbYV0uc2xpY2UoKTpbXX0sYS5lbWl0PWEuZGlzcGF0Y2hFdmVudD1mdW5jdGlvbihhLGMpe2lmKHRoaXMuX2xpc3RlbmVycz10aGlzLl9saXN0ZW5lcnN8fHt9LFwib2JqZWN0XCI9PXR5cGVvZiBhJiYoYz1hLGE9YS50eXBlKSxjJiZjLl9faXNFdmVudE9iamVjdD09PSEwfHwoYz1uZXcgYi5FdmVudCh0aGlzLGEsYykpLHRoaXMuX2xpc3RlbmVycyYmdGhpcy5fbGlzdGVuZXJzW2FdKXt2YXIgZCxlPXRoaXMuX2xpc3RlbmVyc1thXS5zbGljZSgwKSxmPWUubGVuZ3RoLGc9ZVswXTtmb3IoZD0wO2Y+ZDtnPWVbKytkXSlpZihnLmNhbGwodGhpcyxjKSxjLnN0b3BwZWRJbW1lZGlhdGUpcmV0dXJuIHRoaXM7aWYoYy5zdG9wcGVkKXJldHVybiB0aGlzfXJldHVybiB0aGlzLnBhcmVudCYmdGhpcy5wYXJlbnQuZW1pdCYmdGhpcy5wYXJlbnQuZW1pdC5jYWxsKHRoaXMucGFyZW50LGEsYyksdGhpc30sYS5vbj1hLmFkZEV2ZW50TGlzdGVuZXI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5fbGlzdGVuZXJzPXRoaXMuX2xpc3RlbmVyc3x8e30sKHRoaXMuX2xpc3RlbmVyc1thXT10aGlzLl9saXN0ZW5lcnNbYV18fFtdKS5wdXNoKGIpLHRoaXN9LGEub25jZT1mdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoKXtiLmFwcGx5KGQub2ZmKGEsYyksYXJndW1lbnRzKX10aGlzLl9saXN0ZW5lcnM9dGhpcy5fbGlzdGVuZXJzfHx7fTt2YXIgZD10aGlzO3JldHVybiBjLl9vcmlnaW5hbEhhbmRsZXI9Yix0aGlzLm9uKGEsYyl9LGEub2ZmPWEucmVtb3ZlRXZlbnRMaXN0ZW5lcj1mdW5jdGlvbihhLGIpe2lmKHRoaXMuX2xpc3RlbmVycz10aGlzLl9saXN0ZW5lcnN8fHt9LCF0aGlzLl9saXN0ZW5lcnNbYV0pcmV0dXJuIHRoaXM7Zm9yKHZhciBjPXRoaXMuX2xpc3RlbmVyc1thXSxkPWI/Yy5sZW5ndGg6MDtkLS0+MDspKGNbZF09PT1ifHxjW2RdLl9vcmlnaW5hbEhhbmRsZXI9PT1iKSYmYy5zcGxpY2UoZCwxKTtyZXR1cm4gMD09PWMubGVuZ3RoJiZkZWxldGUgdGhpcy5fbGlzdGVuZXJzW2FdLHRoaXN9LGEucmVtb3ZlQWxsTGlzdGVuZXJzPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9saXN0ZW5lcnM9dGhpcy5fbGlzdGVuZXJzfHx7fSx0aGlzLl9saXN0ZW5lcnNbYV0/KGRlbGV0ZSB0aGlzLl9saXN0ZW5lcnNbYV0sdGhpcyk6dGhpc319fSxiLkV2ZW50PWZ1bmN0aW9uKGEsYixjKXt0aGlzLl9faXNFdmVudE9iamVjdD0hMCx0aGlzLnN0b3BwZWQ9ITEsdGhpcy5zdG9wcGVkSW1tZWRpYXRlPSExLHRoaXMudGFyZ2V0PWEsdGhpcy50eXBlPWIsdGhpcy5kYXRhPWMsdGhpcy5jb250ZW50PWMsdGhpcy50aW1lU3RhbXA9RGF0ZS5ub3coKX0sYi5FdmVudC5wcm90b3R5cGUuc3RvcFByb3BhZ2F0aW9uPWZ1bmN0aW9uKCl7dGhpcy5zdG9wcGVkPSEwfSxiLkV2ZW50LnByb3RvdHlwZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb249ZnVuY3Rpb24oKXt0aGlzLnN0b3BwZWRJbW1lZGlhdGU9ITB9LGIuYXV0b0RldGVjdFJlbmRlcmVyPWZ1bmN0aW9uKGEsYyxkKXthfHwoYT04MDApLGN8fChjPTYwMCk7dmFyIGU9ZnVuY3Rpb24oKXt0cnl7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtyZXR1cm4hIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQmJihhLmdldENvbnRleHQoXCJ3ZWJnbFwiKXx8YS5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpKX1jYXRjaChiKXtyZXR1cm4hMX19KCk7cmV0dXJuIGU/bmV3IGIuV2ViR0xSZW5kZXJlcihhLGMsZCk6bmV3IGIuQ2FudmFzUmVuZGVyZXIoYSxjLGQpfSxiLmF1dG9EZXRlY3RSZWNvbW1lbmRlZFJlbmRlcmVyPWZ1bmN0aW9uKGEsYyxkKXthfHwoYT04MDApLGN8fChjPTYwMCk7dmFyIGU9ZnVuY3Rpb24oKXt0cnl7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtyZXR1cm4hIXdpbmRvdy5XZWJHTFJlbmRlcmluZ0NvbnRleHQmJihhLmdldENvbnRleHQoXCJ3ZWJnbFwiKXx8YS5nZXRDb250ZXh0KFwiZXhwZXJpbWVudGFsLXdlYmdsXCIpKX1jYXRjaChiKXtyZXR1cm4hMX19KCksZj0vQW5kcm9pZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7cmV0dXJuIGUmJiFmP25ldyBiLldlYkdMUmVuZGVyZXIoYSxjLGQpOm5ldyBiLkNhbnZhc1JlbmRlcmVyKGEsYyxkKX0sYi5Qb2x5Sz17fSxiLlBvbHlLLlRyaWFuZ3VsYXRlPWZ1bmN0aW9uKGEpe3ZhciBjPSEwLGQ9YS5sZW5ndGg+PjE7aWYoMz5kKXJldHVybltdO2Zvcih2YXIgZT1bXSxmPVtdLGc9MDtkPmc7ZysrKWYucHVzaChnKTtnPTA7Zm9yKHZhciBoPWQ7aD4zOyl7dmFyIGk9ZlsoZyswKSVoXSxqPWZbKGcrMSklaF0saz1mWyhnKzIpJWhdLGw9YVsyKmldLG09YVsyKmkrMV0sbj1hWzIqal0sbz1hWzIqaisxXSxwPWFbMiprXSxxPWFbMiprKzFdLHI9ITE7aWYoYi5Qb2x5Sy5fY29udmV4KGwsbSxuLG8scCxxLGMpKXtyPSEwO2Zvcih2YXIgcz0wO2g+cztzKyspe3ZhciB0PWZbc107aWYodCE9PWkmJnQhPT1qJiZ0IT09ayYmYi5Qb2x5Sy5fUG9pbnRJblRyaWFuZ2xlKGFbMip0XSxhWzIqdCsxXSxsLG0sbixvLHAscSkpe3I9ITE7YnJlYWt9fX1pZihyKWUucHVzaChpLGosayksZi5zcGxpY2UoKGcrMSklaCwxKSxoLS0sZz0wO2Vsc2UgaWYoZysrPjMqaCl7aWYoIWMpcmV0dXJuIG51bGw7Zm9yKGU9W10sZj1bXSxnPTA7ZD5nO2crKylmLnB1c2goZyk7Zz0wLGg9ZCxjPSExfX1yZXR1cm4gZS5wdXNoKGZbMF0sZlsxXSxmWzJdKSxlfSxiLlBvbHlLLl9Qb2ludEluVHJpYW5nbGU9ZnVuY3Rpb24oYSxiLGMsZCxlLGYsZyxoKXt2YXIgaT1nLWMsaj1oLWQsaz1lLWMsbD1mLWQsbT1hLWMsbj1iLWQsbz1pKmkraipqLHA9aSprK2oqbCxxPWkqbStqKm4scj1rKmsrbCpsLHM9ayptK2wqbix0PTEvKG8qci1wKnApLHU9KHIqcS1wKnMpKnQsdj0obypzLXAqcSkqdDtyZXR1cm4gdT49MCYmdj49MCYmMT51K3Z9LGIuUG9seUsuX2NvbnZleD1mdW5jdGlvbihhLGIsYyxkLGUsZixnKXtyZXR1cm4oYi1kKSooZS1jKSsoYy1hKSooZi1kKT49MD09PWd9LGIuaW5pdERlZmF1bHRTaGFkZXJzPWZ1bmN0aW9uKCl7fSxiLkNvbXBpbGVWZXJ0ZXhTaGFkZXI9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYi5fQ29tcGlsZVNoYWRlcihhLGMsYS5WRVJURVhfU0hBREVSKX0sYi5Db21waWxlRnJhZ21lbnRTaGFkZXI9ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYi5fQ29tcGlsZVNoYWRlcihhLGMsYS5GUkFHTUVOVF9TSEFERVIpfSxiLl9Db21waWxlU2hhZGVyPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1iLmpvaW4oXCJcXG5cIiksZT1hLmNyZWF0ZVNoYWRlcihjKTtyZXR1cm4gYS5zaGFkZXJTb3VyY2UoZSxkKSxhLmNvbXBpbGVTaGFkZXIoZSksYS5nZXRTaGFkZXJQYXJhbWV0ZXIoZSxhLkNPTVBJTEVfU1RBVFVTKT9lOih3aW5kb3cuY29uc29sZS5sb2coYS5nZXRTaGFkZXJJbmZvTG9nKGUpKSxudWxsKX0sYi5jb21waWxlUHJvZ3JhbT1mdW5jdGlvbihhLGMsZCl7dmFyIGU9Yi5Db21waWxlRnJhZ21lbnRTaGFkZXIoYSxkKSxmPWIuQ29tcGlsZVZlcnRleFNoYWRlcihhLGMpLGc9YS5jcmVhdGVQcm9ncmFtKCk7cmV0dXJuIGEuYXR0YWNoU2hhZGVyKGcsZiksYS5hdHRhY2hTaGFkZXIoZyxlKSxhLmxpbmtQcm9ncmFtKGcpLGEuZ2V0UHJvZ3JhbVBhcmFtZXRlcihnLGEuTElOS19TVEFUVVMpfHx3aW5kb3cuY29uc29sZS5sb2coXCJDb3VsZCBub3QgaW5pdGlhbGlzZSBzaGFkZXJzXCIpLGd9LGIuUGl4aVNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIGxvd3AgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpICogdkNvbG9yIDtcIixcIn1cIl0sdGhpcy50ZXh0dXJlQ291bnQ9MCx0aGlzLmZpcnN0UnVuPSEwLHRoaXMuZGlydHk9ITAsdGhpcy5hdHRyaWJ1dGVzPVtdLHRoaXMuaW5pdCgpfSxiLlBpeGlTaGFkZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuUGl4aVNoYWRlcixiLlBpeGlTaGFkZXIucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9Yi5jb21waWxlUHJvZ3JhbShhLHRoaXMudmVydGV4U3JjfHxiLlBpeGlTaGFkZXIuZGVmYXVsdFZlcnRleFNyYyx0aGlzLmZyYWdtZW50U3JjKTthLnVzZVByb2dyYW0oYyksdGhpcy51U2FtcGxlcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwidVNhbXBsZXJcIiksdGhpcy5wcm9qZWN0aW9uVmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJwcm9qZWN0aW9uVmVjdG9yXCIpLHRoaXMub2Zmc2V0VmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJvZmZzZXRWZWN0b3JcIiksdGhpcy5kaW1lbnNpb25zPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJkaW1lbnNpb25zXCIpLHRoaXMuYVZlcnRleFBvc2l0aW9uPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFWZXJ0ZXhQb3NpdGlvblwiKSx0aGlzLmFUZXh0dXJlQ29vcmQ9YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYVRleHR1cmVDb29yZFwiKSx0aGlzLmNvbG9yQXR0cmlidXRlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFDb2xvclwiKSwtMT09PXRoaXMuY29sb3JBdHRyaWJ1dGUmJih0aGlzLmNvbG9yQXR0cmlidXRlPTIpLHRoaXMuYXR0cmlidXRlcz1bdGhpcy5hVmVydGV4UG9zaXRpb24sdGhpcy5hVGV4dHVyZUNvb3JkLHRoaXMuY29sb3JBdHRyaWJ1dGVdO2Zvcih2YXIgZCBpbiB0aGlzLnVuaWZvcm1zKXRoaXMudW5pZm9ybXNbZF0udW5pZm9ybUxvY2F0aW9uPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsZCk7dGhpcy5pbml0VW5pZm9ybXMoKSx0aGlzLnByb2dyYW09Y30sYi5QaXhpU2hhZGVyLnByb3RvdHlwZS5pbml0VW5pZm9ybXM9ZnVuY3Rpb24oKXt0aGlzLnRleHR1cmVDb3VudD0xO3ZhciBhLGI9dGhpcy5nbDtmb3IodmFyIGMgaW4gdGhpcy51bmlmb3Jtcyl7YT10aGlzLnVuaWZvcm1zW2NdO3ZhciBkPWEudHlwZTtcInNhbXBsZXIyRFwiPT09ZD8oYS5faW5pdD0hMSxudWxsIT09YS52YWx1ZSYmdGhpcy5pbml0U2FtcGxlcjJEKGEpKTpcIm1hdDJcIj09PWR8fFwibWF0M1wiPT09ZHx8XCJtYXQ0XCI9PT1kPyhhLmdsTWF0cml4PSEwLGEuZ2xWYWx1ZUxlbmd0aD0xLFwibWF0MlwiPT09ZD9hLmdsRnVuYz1iLnVuaWZvcm1NYXRyaXgyZnY6XCJtYXQzXCI9PT1kP2EuZ2xGdW5jPWIudW5pZm9ybU1hdHJpeDNmdjpcIm1hdDRcIj09PWQmJihhLmdsRnVuYz1iLnVuaWZvcm1NYXRyaXg0ZnYpKTooYS5nbEZ1bmM9YltcInVuaWZvcm1cIitkXSxhLmdsVmFsdWVMZW5ndGg9XCIyZlwiPT09ZHx8XCIyaVwiPT09ZD8yOlwiM2ZcIj09PWR8fFwiM2lcIj09PWQ/MzpcIjRmXCI9PT1kfHxcIjRpXCI9PT1kPzQ6MSl9fSxiLlBpeGlTaGFkZXIucHJvdG90eXBlLmluaXRTYW1wbGVyMkQ9ZnVuY3Rpb24oYSl7aWYoYS52YWx1ZSYmYS52YWx1ZS5iYXNlVGV4dHVyZSYmYS52YWx1ZS5iYXNlVGV4dHVyZS5oYXNMb2FkZWQpe3ZhciBiPXRoaXMuZ2w7aWYoYi5hY3RpdmVUZXh0dXJlKGJbXCJURVhUVVJFXCIrdGhpcy50ZXh0dXJlQ291bnRdKSxiLmJpbmRUZXh0dXJlKGIuVEVYVFVSRV8yRCxhLnZhbHVlLmJhc2VUZXh0dXJlLl9nbFRleHR1cmVzW2IuaWRdKSxhLnRleHR1cmVEYXRhKXt2YXIgYz1hLnRleHR1cmVEYXRhLGQ9Yy5tYWdGaWx0ZXI/Yy5tYWdGaWx0ZXI6Yi5MSU5FQVIsZT1jLm1pbkZpbHRlcj9jLm1pbkZpbHRlcjpiLkxJTkVBUixmPWMud3JhcFM/Yy53cmFwUzpiLkNMQU1QX1RPX0VER0UsZz1jLndyYXBUP2Mud3JhcFQ6Yi5DTEFNUF9UT19FREdFLGg9Yy5sdW1pbmFuY2U/Yi5MVU1JTkFOQ0U6Yi5SR0JBO2lmKGMucmVwZWF0JiYoZj1iLlJFUEVBVCxnPWIuUkVQRUFUKSxiLnBpeGVsU3RvcmVpKGIuVU5QQUNLX0ZMSVBfWV9XRUJHTCwhIWMuZmxpcFkpLGMud2lkdGgpe3ZhciBpPWMud2lkdGg/Yy53aWR0aDo1MTIsaj1jLmhlaWdodD9jLmhlaWdodDoyLGs9Yy5ib3JkZXI/Yy5ib3JkZXI6MDtiLnRleEltYWdlMkQoYi5URVhUVVJFXzJELDAsaCxpLGosayxoLGIuVU5TSUdORURfQllURSxudWxsKX1lbHNlIGIudGV4SW1hZ2UyRChiLlRFWFRVUkVfMkQsMCxoLGIuUkdCQSxiLlVOU0lHTkVEX0JZVEUsYS52YWx1ZS5iYXNlVGV4dHVyZS5zb3VyY2UpO2IudGV4UGFyYW1ldGVyaShiLlRFWFRVUkVfMkQsYi5URVhUVVJFX01BR19GSUxURVIsZCksYi50ZXhQYXJhbWV0ZXJpKGIuVEVYVFVSRV8yRCxiLlRFWFRVUkVfTUlOX0ZJTFRFUixlKSxiLnRleFBhcmFtZXRlcmkoYi5URVhUVVJFXzJELGIuVEVYVFVSRV9XUkFQX1MsZiksYi50ZXhQYXJhbWV0ZXJpKGIuVEVYVFVSRV8yRCxiLlRFWFRVUkVfV1JBUF9ULGcpfWIudW5pZm9ybTFpKGEudW5pZm9ybUxvY2F0aW9uLHRoaXMudGV4dHVyZUNvdW50KSxhLl9pbml0PSEwLHRoaXMudGV4dHVyZUNvdW50Kyt9fSxiLlBpeGlTaGFkZXIucHJvdG90eXBlLnN5bmNVbmlmb3Jtcz1mdW5jdGlvbigpe3RoaXMudGV4dHVyZUNvdW50PTE7dmFyIGEsYz10aGlzLmdsO2Zvcih2YXIgZCBpbiB0aGlzLnVuaWZvcm1zKWE9dGhpcy51bmlmb3Jtc1tkXSwxPT09YS5nbFZhbHVlTGVuZ3RoP2EuZ2xNYXRyaXg9PT0hMD9hLmdsRnVuYy5jYWxsKGMsYS51bmlmb3JtTG9jYXRpb24sYS50cmFuc3Bvc2UsYS52YWx1ZSk6YS5nbEZ1bmMuY2FsbChjLGEudW5pZm9ybUxvY2F0aW9uLGEudmFsdWUpOjI9PT1hLmdsVmFsdWVMZW5ndGg/YS5nbEZ1bmMuY2FsbChjLGEudW5pZm9ybUxvY2F0aW9uLGEudmFsdWUueCxhLnZhbHVlLnkpOjM9PT1hLmdsVmFsdWVMZW5ndGg/YS5nbEZ1bmMuY2FsbChjLGEudW5pZm9ybUxvY2F0aW9uLGEudmFsdWUueCxhLnZhbHVlLnksYS52YWx1ZS56KTo0PT09YS5nbFZhbHVlTGVuZ3RoP2EuZ2xGdW5jLmNhbGwoYyxhLnVuaWZvcm1Mb2NhdGlvbixhLnZhbHVlLngsYS52YWx1ZS55LGEudmFsdWUueixhLnZhbHVlLncpOlwic2FtcGxlcjJEXCI9PT1hLnR5cGUmJihhLl9pbml0PyhjLmFjdGl2ZVRleHR1cmUoY1tcIlRFWFRVUkVcIit0aGlzLnRleHR1cmVDb3VudF0pLGEudmFsdWUuYmFzZVRleHR1cmUuX2RpcnR5W2MuaWRdP2IuaW5zdGFuY2VzW2MuaWRdLnVwZGF0ZVRleHR1cmUoYS52YWx1ZS5iYXNlVGV4dHVyZSk6Yy5iaW5kVGV4dHVyZShjLlRFWFRVUkVfMkQsYS52YWx1ZS5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1tjLmlkXSksYy51bmlmb3JtMWkoYS51bmlmb3JtTG9jYXRpb24sdGhpcy50ZXh0dXJlQ291bnQpLHRoaXMudGV4dHVyZUNvdW50KyspOnRoaXMuaW5pdFNhbXBsZXIyRChhKSl9LGIuUGl4aVNoYWRlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLnByb2dyYW0pLHRoaXMudW5pZm9ybXM9bnVsbCx0aGlzLmdsPW51bGwsdGhpcy5hdHRyaWJ1dGVzPW51bGx9LGIuUGl4aVNoYWRlci5kZWZhdWx0VmVydGV4U3JjPVtcImF0dHJpYnV0ZSB2ZWMyIGFWZXJ0ZXhQb3NpdGlvbjtcIixcImF0dHJpYnV0ZSB2ZWMyIGFUZXh0dXJlQ29vcmQ7XCIsXCJhdHRyaWJ1dGUgdmVjNCBhQ29sb3I7XCIsXCJ1bmlmb3JtIHZlYzIgcHJvamVjdGlvblZlY3RvcjtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXRWZWN0b3I7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJjb25zdCB2ZWMyIGNlbnRlciA9IHZlYzIoLTEuMCwgMS4wKTtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoICgoYVZlcnRleFBvc2l0aW9uICsgb2Zmc2V0VmVjdG9yKSAvIHByb2plY3Rpb25WZWN0b3IpICsgY2VudGVyICwgMC4wLCAxLjApO1wiLFwiICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XCIsXCIgICB2Q29sb3IgPSB2ZWM0KGFDb2xvci5yZ2IgKiBhQ29sb3IuYSwgYUNvbG9yLmEpO1wiLFwifVwiXSxiLlBpeGlGYXN0U2hhZGVyPWZ1bmN0aW9uKGEpe3RoaXMuX1VJRD1iLl9VSUQrKyx0aGlzLmdsPWEsdGhpcy5wcm9ncmFtPW51bGwsdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyBmbG9hdCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpICogdkNvbG9yIDtcIixcIn1cIl0sdGhpcy52ZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzIgYVBvc2l0aW9uQ29vcmQ7XCIsXCJhdHRyaWJ1dGUgdmVjMiBhU2NhbGU7XCIsXCJhdHRyaWJ1dGUgZmxvYXQgYVJvdGF0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzIgYVRleHR1cmVDb29yZDtcIixcImF0dHJpYnV0ZSBmbG9hdCBhQ29sb3I7XCIsXCJ1bmlmb3JtIHZlYzIgcHJvamVjdGlvblZlY3RvcjtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXRWZWN0b3I7XCIsXCJ1bmlmb3JtIG1hdDMgdU1hdHJpeDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyBmbG9hdCB2Q29sb3I7XCIsXCJjb25zdCB2ZWMyIGNlbnRlciA9IHZlYzIoLTEuMCwgMS4wKTtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWMyIHY7XCIsXCIgICB2ZWMyIHN2ID0gYVZlcnRleFBvc2l0aW9uICogYVNjYWxlO1wiLFwiICAgdi54ID0gKHN2LngpICogY29zKGFSb3RhdGlvbikgLSAoc3YueSkgKiBzaW4oYVJvdGF0aW9uKTtcIixcIiAgIHYueSA9IChzdi54KSAqIHNpbihhUm90YXRpb24pICsgKHN2LnkpICogY29zKGFSb3RhdGlvbik7XCIsXCIgICB2ID0gKCB1TWF0cml4ICogdmVjMyh2ICsgYVBvc2l0aW9uQ29vcmQgLCAxLjApICkueHkgO1wiLFwiICAgZ2xfUG9zaXRpb24gPSB2ZWM0KCAoIHYgLyBwcm9qZWN0aW9uVmVjdG9yKSArIGNlbnRlciAsIDAuMCwgMS4wKTtcIixcIiAgIHZUZXh0dXJlQ29vcmQgPSBhVGV4dHVyZUNvb3JkO1wiLFwiICAgdkNvbG9yID0gYUNvbG9yO1wiLFwifVwiXSx0aGlzLnRleHR1cmVDb3VudD0wLHRoaXMuaW5pdCgpfSxiLlBpeGlGYXN0U2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlBpeGlGYXN0U2hhZGVyLGIuUGl4aUZhc3RTaGFkZXIucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9Yi5jb21waWxlUHJvZ3JhbShhLHRoaXMudmVydGV4U3JjLHRoaXMuZnJhZ21lbnRTcmMpO2EudXNlUHJvZ3JhbShjKSx0aGlzLnVTYW1wbGVyPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1U2FtcGxlclwiKSx0aGlzLnByb2plY3Rpb25WZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInByb2plY3Rpb25WZWN0b3JcIiksdGhpcy5vZmZzZXRWZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcIm9mZnNldFZlY3RvclwiKSx0aGlzLmRpbWVuc2lvbnM9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImRpbWVuc2lvbnNcIiksdGhpcy51TWF0cml4PWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1TWF0cml4XCIpLHRoaXMuYVZlcnRleFBvc2l0aW9uPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFWZXJ0ZXhQb3NpdGlvblwiKSx0aGlzLmFQb3NpdGlvbkNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFQb3NpdGlvbkNvb3JkXCIpLHRoaXMuYVNjYWxlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFTY2FsZVwiKSx0aGlzLmFSb3RhdGlvbj1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhUm90YXRpb25cIiksdGhpcy5hVGV4dHVyZUNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFUZXh0dXJlQ29vcmRcIiksdGhpcy5jb2xvckF0dHJpYnV0ZT1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhQ29sb3JcIiksLTE9PT10aGlzLmNvbG9yQXR0cmlidXRlJiYodGhpcy5jb2xvckF0dHJpYnV0ZT0yKSx0aGlzLmF0dHJpYnV0ZXM9W3RoaXMuYVZlcnRleFBvc2l0aW9uLHRoaXMuYVBvc2l0aW9uQ29vcmQsdGhpcy5hU2NhbGUsdGhpcy5hUm90YXRpb24sdGhpcy5hVGV4dHVyZUNvb3JkLHRoaXMuY29sb3JBdHRyaWJ1dGVdLHRoaXMucHJvZ3JhbT1jfSxiLlBpeGlGYXN0U2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZXM9bnVsbH0sYi5TdHJpcFNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInVuaWZvcm0gZmxvYXQgYWxwaGE7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkpKSAqIGFscGhhO1wiLFwifVwiXSx0aGlzLnZlcnRleFNyYz1bXCJhdHRyaWJ1dGUgdmVjMiBhVmVydGV4UG9zaXRpb247XCIsXCJhdHRyaWJ1dGUgdmVjMiBhVGV4dHVyZUNvb3JkO1wiLFwidW5pZm9ybSBtYXQzIHRyYW5zbGF0aW9uTWF0cml4O1wiLFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMyB2ID0gdHJhbnNsYXRpb25NYXRyaXggKiB2ZWMzKGFWZXJ0ZXhQb3NpdGlvbiAsIDEuMCk7XCIsXCIgICB2IC09IG9mZnNldFZlY3Rvci54eXg7XCIsXCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoIHYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCB2LnkgLyAtcHJvamVjdGlvblZlY3Rvci55ICsgMS4wICwgMC4wLCAxLjApO1wiLFwiICAgdlRleHR1cmVDb29yZCA9IGFUZXh0dXJlQ29vcmQ7XCIsXCJ9XCJdLHRoaXMuaW5pdCgpfSxiLlN0cmlwU2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlN0cmlwU2hhZGVyLGIuU3RyaXBTaGFkZXIucHJvdG90eXBlLmluaXQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9Yi5jb21waWxlUHJvZ3JhbShhLHRoaXMudmVydGV4U3JjLHRoaXMuZnJhZ21lbnRTcmMpO2EudXNlUHJvZ3JhbShjKSx0aGlzLnVTYW1wbGVyPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ1U2FtcGxlclwiKSx0aGlzLnByb2plY3Rpb25WZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInByb2plY3Rpb25WZWN0b3JcIiksdGhpcy5vZmZzZXRWZWN0b3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcIm9mZnNldFZlY3RvclwiKSx0aGlzLmNvbG9yQXR0cmlidXRlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFDb2xvclwiKSx0aGlzLmFWZXJ0ZXhQb3NpdGlvbj1hLmdldEF0dHJpYkxvY2F0aW9uKGMsXCJhVmVydGV4UG9zaXRpb25cIiksdGhpcy5hVGV4dHVyZUNvb3JkPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFUZXh0dXJlQ29vcmRcIiksdGhpcy5hdHRyaWJ1dGVzPVt0aGlzLmFWZXJ0ZXhQb3NpdGlvbix0aGlzLmFUZXh0dXJlQ29vcmRdLHRoaXMudHJhbnNsYXRpb25NYXRyaXg9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRyYW5zbGF0aW9uTWF0cml4XCIpLHRoaXMuYWxwaGE9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImFscGhhXCIpLHRoaXMucHJvZ3JhbT1jfSxiLlN0cmlwU2hhZGVyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbC5kZWxldGVQcm9ncmFtKHRoaXMucHJvZ3JhbSksdGhpcy51bmlmb3Jtcz1udWxsLHRoaXMuZ2w9bnVsbCx0aGlzLmF0dHJpYnV0ZT1udWxsfSxiLlByaW1pdGl2ZVNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHZDb2xvcjtcIixcIn1cIl0sdGhpcy52ZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwiYXR0cmlidXRlIHZlYzQgYUNvbG9yO1wiLFwidW5pZm9ybSBtYXQzIHRyYW5zbGF0aW9uTWF0cml4O1wiLFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFwidW5pZm9ybSBmbG9hdCBhbHBoYTtcIixcInVuaWZvcm0gZmxvYXQgZmxpcFk7XCIsXCJ1bmlmb3JtIHZlYzMgdGludDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMyB2ID0gdHJhbnNsYXRpb25NYXRyaXggKiB2ZWMzKGFWZXJ0ZXhQb3NpdGlvbiAsIDEuMCk7XCIsXCIgICB2IC09IG9mZnNldFZlY3Rvci54eXg7XCIsXCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoIHYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCAodi55IC8gcHJvamVjdGlvblZlY3Rvci55ICogLWZsaXBZKSArIGZsaXBZICwgMC4wLCAxLjApO1wiLFwiICAgdkNvbG9yID0gYUNvbG9yICogdmVjNCh0aW50ICogYWxwaGEsIGFscGhhKTtcIixcIn1cIl0sdGhpcy5pbml0KCl9LGIuUHJpbWl0aXZlU2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlByaW1pdGl2ZVNoYWRlcixiLlByaW1pdGl2ZVNoYWRlci5wcm90b3R5cGUuaW5pdD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2wsYz1iLmNvbXBpbGVQcm9ncmFtKGEsdGhpcy52ZXJ0ZXhTcmMsdGhpcy5mcmFnbWVudFNyYyk7YS51c2VQcm9ncmFtKGMpLHRoaXMucHJvamVjdGlvblZlY3Rvcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwicHJvamVjdGlvblZlY3RvclwiKSx0aGlzLm9mZnNldFZlY3Rvcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwib2Zmc2V0VmVjdG9yXCIpLHRoaXMudGludENvbG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJ0aW50XCIpLHRoaXMuZmxpcFk9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImZsaXBZXCIpLHRoaXMuYVZlcnRleFBvc2l0aW9uPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFWZXJ0ZXhQb3NpdGlvblwiKSx0aGlzLmNvbG9yQXR0cmlidXRlPWEuZ2V0QXR0cmliTG9jYXRpb24oYyxcImFDb2xvclwiKSx0aGlzLmF0dHJpYnV0ZXM9W3RoaXMuYVZlcnRleFBvc2l0aW9uLHRoaXMuY29sb3JBdHRyaWJ1dGVdLHRoaXMudHJhbnNsYXRpb25NYXRyaXg9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRyYW5zbGF0aW9uTWF0cml4XCIpLHRoaXMuYWxwaGE9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcImFscGhhXCIpLHRoaXMucHJvZ3JhbT1jfSxiLlByaW1pdGl2ZVNoYWRlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLnByb2dyYW0pLHRoaXMudW5pZm9ybXM9bnVsbCx0aGlzLmdsPW51bGwsdGhpcy5hdHRyaWJ1dGVzPW51bGx9LGIuQ29tcGxleFByaW1pdGl2ZVNoYWRlcj1mdW5jdGlvbihhKXt0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5nbD1hLHRoaXMucHJvZ3JhbT1udWxsLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHZDb2xvcjtcIixcIn1cIl0sdGhpcy52ZXJ0ZXhTcmM9W1wiYXR0cmlidXRlIHZlYzIgYVZlcnRleFBvc2l0aW9uO1wiLFwidW5pZm9ybSBtYXQzIHRyYW5zbGF0aW9uTWF0cml4O1wiLFwidW5pZm9ybSB2ZWMyIHByb2plY3Rpb25WZWN0b3I7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0VmVjdG9yO1wiLFwidW5pZm9ybSB2ZWMzIHRpbnQ7XCIsXCJ1bmlmb3JtIGZsb2F0IGFscGhhO1wiLFwidW5pZm9ybSB2ZWMzIGNvbG9yO1wiLFwidW5pZm9ybSBmbG9hdCBmbGlwWTtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMyB2ID0gdHJhbnNsYXRpb25NYXRyaXggKiB2ZWMzKGFWZXJ0ZXhQb3NpdGlvbiAsIDEuMCk7XCIsXCIgICB2IC09IG9mZnNldFZlY3Rvci54eXg7XCIsXCIgICBnbF9Qb3NpdGlvbiA9IHZlYzQoIHYueCAvIHByb2plY3Rpb25WZWN0b3IueCAtMS4wLCAodi55IC8gcHJvamVjdGlvblZlY3Rvci55ICogLWZsaXBZKSArIGZsaXBZICwgMC4wLCAxLjApO1wiLFwiICAgdkNvbG9yID0gdmVjNChjb2xvciAqIGFscGhhICogdGludCwgYWxwaGEpO1wiLFwifVwiXSx0aGlzLmluaXQoKX0sYi5Db21wbGV4UHJpbWl0aXZlU2hhZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNvbXBsZXhQcmltaXRpdmVTaGFkZXIsYi5Db21wbGV4UHJpbWl0aXZlU2hhZGVyLnByb3RvdHlwZS5pbml0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nbCxjPWIuY29tcGlsZVByb2dyYW0oYSx0aGlzLnZlcnRleFNyYyx0aGlzLmZyYWdtZW50U3JjKTthLnVzZVByb2dyYW0oYyksdGhpcy5wcm9qZWN0aW9uVmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJwcm9qZWN0aW9uVmVjdG9yXCIpLHRoaXMub2Zmc2V0VmVjdG9yPWEuZ2V0VW5pZm9ybUxvY2F0aW9uKGMsXCJvZmZzZXRWZWN0b3JcIiksdGhpcy50aW50Q29sb3I9YS5nZXRVbmlmb3JtTG9jYXRpb24oYyxcInRpbnRcIiksdGhpcy5jb2xvcj1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwiY29sb3JcIiksdGhpcy5mbGlwWT1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwiZmxpcFlcIiksdGhpcy5hVmVydGV4UG9zaXRpb249YS5nZXRBdHRyaWJMb2NhdGlvbihjLFwiYVZlcnRleFBvc2l0aW9uXCIpLHRoaXMuYXR0cmlidXRlcz1bdGhpcy5hVmVydGV4UG9zaXRpb24sdGhpcy5jb2xvckF0dHJpYnV0ZV0sdGhpcy50cmFuc2xhdGlvbk1hdHJpeD1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwidHJhbnNsYXRpb25NYXRyaXhcIiksdGhpcy5hbHBoYT1hLmdldFVuaWZvcm1Mb2NhdGlvbihjLFwiYWxwaGFcIiksdGhpcy5wcm9ncmFtPWN9LGIuQ29tcGxleFByaW1pdGl2ZVNoYWRlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuZ2wuZGVsZXRlUHJvZ3JhbSh0aGlzLnByb2dyYW0pLHRoaXMudW5pZm9ybXM9bnVsbCx0aGlzLmdsPW51bGwsdGhpcy5hdHRyaWJ1dGU9bnVsbH0sYi5XZWJHTEdyYXBoaWNzPWZ1bmN0aW9uKCl7fSxiLldlYkdMR3JhcGhpY3MucmVuZGVyR3JhcGhpY3M9ZnVuY3Rpb24oYSxjKXt2YXIgZCxlPWMuZ2wsZj1jLnByb2plY3Rpb24sZz1jLm9mZnNldCxoPWMuc2hhZGVyTWFuYWdlci5wcmltaXRpdmVTaGFkZXI7YS5kaXJ0eSYmYi5XZWJHTEdyYXBoaWNzLnVwZGF0ZUdyYXBoaWNzKGEsZSk7Zm9yKHZhciBpPWEuX3dlYkdMW2UuaWRdLGo9MDtqPGkuZGF0YS5sZW5ndGg7aisrKTE9PT1pLmRhdGFbal0ubW9kZT8oZD1pLmRhdGFbal0sYy5zdGVuY2lsTWFuYWdlci5wdXNoU3RlbmNpbChhLGQsYyksZS5kcmF3RWxlbWVudHMoZS5UUklBTkdMRV9GQU4sNCxlLlVOU0lHTkVEX1NIT1JULDIqKGQuaW5kaWNlcy5sZW5ndGgtNCkpLGMuc3RlbmNpbE1hbmFnZXIucG9wU3RlbmNpbChhLGQsYykpOihkPWkuZGF0YVtqXSxjLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKGgpLGg9Yy5zaGFkZXJNYW5hZ2VyLnByaW1pdGl2ZVNoYWRlcixlLnVuaWZvcm1NYXRyaXgzZnYoaC50cmFuc2xhdGlvbk1hdHJpeCwhMSxhLndvcmxkVHJhbnNmb3JtLnRvQXJyYXkoITApKSxlLnVuaWZvcm0xZihoLmZsaXBZLDEpLGUudW5pZm9ybTJmKGgucHJvamVjdGlvblZlY3RvcixmLngsLWYueSksZS51bmlmb3JtMmYoaC5vZmZzZXRWZWN0b3IsLWcueCwtZy55KSxlLnVuaWZvcm0zZnYoaC50aW50Q29sb3IsYi5oZXgycmdiKGEudGludCkpLGUudW5pZm9ybTFmKGguYWxwaGEsYS53b3JsZEFscGhhKSxlLmJpbmRCdWZmZXIoZS5BUlJBWV9CVUZGRVIsZC5idWZmZXIpLGUudmVydGV4QXR0cmliUG9pbnRlcihoLmFWZXJ0ZXhQb3NpdGlvbiwyLGUuRkxPQVQsITEsMjQsMCksZS52ZXJ0ZXhBdHRyaWJQb2ludGVyKGguY29sb3JBdHRyaWJ1dGUsNCxlLkZMT0FULCExLDI0LDgpLGUuYmluZEJ1ZmZlcihlLkVMRU1FTlRfQVJSQVlfQlVGRkVSLGQuaW5kZXhCdWZmZXIpLGUuZHJhd0VsZW1lbnRzKGUuVFJJQU5HTEVfU1RSSVAsZC5pbmRpY2VzLmxlbmd0aCxlLlVOU0lHTkVEX1NIT1JULDApKX0sYi5XZWJHTEdyYXBoaWNzLnVwZGF0ZUdyYXBoaWNzPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS5fd2ViR0xbYy5pZF07ZHx8KGQ9YS5fd2ViR0xbYy5pZF09e2xhc3RJbmRleDowLGRhdGE6W10sZ2w6Y30pLGEuZGlydHk9ITE7dmFyIGU7aWYoYS5jbGVhckRpcnR5KXtmb3IoYS5jbGVhckRpcnR5PSExLGU9MDtlPGQuZGF0YS5sZW5ndGg7ZSsrKXt2YXIgZj1kLmRhdGFbZV07Zi5yZXNldCgpLGIuV2ViR0xHcmFwaGljcy5ncmFwaGljc0RhdGFQb29sLnB1c2goZil9ZC5kYXRhPVtdLGQubGFzdEluZGV4PTB9dmFyIGc7Zm9yKGU9ZC5sYXN0SW5kZXg7ZTxhLmdyYXBoaWNzRGF0YS5sZW5ndGg7ZSsrKXt2YXIgaD1hLmdyYXBoaWNzRGF0YVtlXTtpZihoLnR5cGU9PT1iLkdyYXBoaWNzLlBPTFkpe2lmKGgucG9pbnRzPWguc2hhcGUucG9pbnRzLnNsaWNlKCksaC5zaGFwZS5jbG9zZWQmJihoLnBvaW50c1swXSE9PWgucG9pbnRzW2gucG9pbnRzLmxlbmd0aC0yXXx8aC5wb2ludHNbMV0hPT1oLnBvaW50c1toLnBvaW50cy5sZW5ndGgtMV0pJiZoLnBvaW50cy5wdXNoKGgucG9pbnRzWzBdLGgucG9pbnRzWzFdKSxoLmZpbGwmJmgucG9pbnRzLmxlbmd0aD49NilpZihoLnBvaW50cy5sZW5ndGg8MTIpe2c9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwwKTt2YXIgaT1iLldlYkdMR3JhcGhpY3MuYnVpbGRQb2x5KGgsZyk7aXx8KGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwxKSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDb21wbGV4UG9seShoLGcpKX1lbHNlIGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwxKSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDb21wbGV4UG9seShoLGcpO2gubGluZVdpZHRoPjAmJihnPWIuV2ViR0xHcmFwaGljcy5zd2l0Y2hNb2RlKGQsMCksYi5XZWJHTEdyYXBoaWNzLmJ1aWxkTGluZShoLGcpKX1lbHNlIGc9Yi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGUoZCwwKSxoLnR5cGU9PT1iLkdyYXBoaWNzLlJFQ1Q/Yi5XZWJHTEdyYXBoaWNzLmJ1aWxkUmVjdGFuZ2xlKGgsZyk6aC50eXBlPT09Yi5HcmFwaGljcy5DSVJDfHxoLnR5cGU9PT1iLkdyYXBoaWNzLkVMSVA/Yi5XZWJHTEdyYXBoaWNzLmJ1aWxkQ2lyY2xlKGgsZyk6aC50eXBlPT09Yi5HcmFwaGljcy5SUkVDJiZiLldlYkdMR3JhcGhpY3MuYnVpbGRSb3VuZGVkUmVjdGFuZ2xlKGgsZyk7ZC5sYXN0SW5kZXgrK31mb3IoZT0wO2U8ZC5kYXRhLmxlbmd0aDtlKyspZz1kLmRhdGFbZV0sZy5kaXJ0eSYmZy51cGxvYWQoKX0sYi5XZWJHTEdyYXBoaWNzLnN3aXRjaE1vZGU9ZnVuY3Rpb24oYSxjKXt2YXIgZDtyZXR1cm4gYS5kYXRhLmxlbmd0aD8oZD1hLmRhdGFbYS5kYXRhLmxlbmd0aC0xXSwoZC5tb2RlIT09Y3x8MT09PWMpJiYoZD1iLldlYkdMR3JhcGhpY3MuZ3JhcGhpY3NEYXRhUG9vbC5wb3AoKXx8bmV3IGIuV2ViR0xHcmFwaGljc0RhdGEoYS5nbCksZC5tb2RlPWMsYS5kYXRhLnB1c2goZCkpKTooZD1iLldlYkdMR3JhcGhpY3MuZ3JhcGhpY3NEYXRhUG9vbC5wb3AoKXx8bmV3IGIuV2ViR0xHcmFwaGljc0RhdGEoYS5nbCksZC5tb2RlPWMsYS5kYXRhLnB1c2goZCkpLGQuZGlydHk9ITAsZH0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkUmVjdGFuZ2xlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS5zaGFwZSxlPWQueCxmPWQueSxnPWQud2lkdGgsaD1kLmhlaWdodDtpZihhLmZpbGwpe3ZhciBpPWIuaGV4MnJnYihhLmZpbGxDb2xvciksaj1hLmZpbGxBbHBoYSxrPWlbMF0qaixsPWlbMV0qaixtPWlbMl0qaixuPWMucG9pbnRzLG89Yy5pbmRpY2VzLHA9bi5sZW5ndGgvNjtuLnB1c2goZSxmKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUrZyxmKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUsZitoKSxuLnB1c2goayxsLG0saiksbi5wdXNoKGUrZyxmK2gpLG4ucHVzaChrLGwsbSxqKSxvLnB1c2gocCxwLHArMSxwKzIscCszLHArMyl9aWYoYS5saW5lV2lkdGgpe3ZhciBxPWEucG9pbnRzO2EucG9pbnRzPVtlLGYsZStnLGYsZStnLGYraCxlLGYraCxlLGZdLGIuV2ViR0xHcmFwaGljcy5idWlsZExpbmUoYSxjKSxhLnBvaW50cz1xfX0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkUm91bmRlZFJlY3RhbmdsZT1mdW5jdGlvbihhLGMpe3ZhciBkPWEuc2hhcGUsZT1kLngsZj1kLnksZz1kLndpZHRoLGg9ZC5oZWlnaHQsaT1kLnJhZGl1cyxqPVtdO2lmKGoucHVzaChlLGYraSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZSxmK2gtaSxlLGYraCxlK2ksZitoKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStnLWksZitoLGUrZyxmK2gsZStnLGYraC1pKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStnLGYraSxlK2csZixlK2ctaSxmKSksaj1qLmNvbmNhdChiLldlYkdMR3JhcGhpY3MucXVhZHJhdGljQmV6aWVyQ3VydmUoZStpLGYsZSxmLGUsZitpKSksYS5maWxsKXt2YXIgaz1iLmhleDJyZ2IoYS5maWxsQ29sb3IpLGw9YS5maWxsQWxwaGEsbT1rWzBdKmwsbj1rWzFdKmwsbz1rWzJdKmwscD1jLnBvaW50cyxxPWMuaW5kaWNlcyxyPXAubGVuZ3RoLzYscz1iLlBvbHlLLlRyaWFuZ3VsYXRlKGopLHQ9MDtmb3IodD0wO3Q8cy5sZW5ndGg7dCs9MylxLnB1c2goc1t0XStyKSxxLnB1c2goc1t0XStyKSxxLnB1c2goc1t0KzFdK3IpLHEucHVzaChzW3QrMl0rcikscS5wdXNoKHNbdCsyXStyKTtmb3IodD0wO3Q8ai5sZW5ndGg7dCsrKXAucHVzaChqW3RdLGpbKyt0XSxtLG4sbyxsKX1pZihhLmxpbmVXaWR0aCl7dmFyIHU9YS5wb2ludHM7YS5wb2ludHM9aixiLldlYkdMR3JhcGhpY3MuYnVpbGRMaW5lKGEsYyksYS5wb2ludHM9dX19LGIuV2ViR0xHcmFwaGljcy5xdWFkcmF0aWNCZXppZXJDdXJ2ZT1mdW5jdGlvbihhLGIsYyxkLGUsZil7ZnVuY3Rpb24gZyhhLGIsYyl7dmFyIGQ9Yi1hO3JldHVybiBhK2QqY31mb3IodmFyIGgsaSxqLGssbCxtLG49MjAsbz1bXSxwPTAscT0wO24+PXE7cSsrKXA9cS9uLGg9ZyhhLGMscCksaT1nKGIsZCxwKSxqPWcoYyxlLHApLGs9ZyhkLGYscCksbD1nKGgsaixwKSxtPWcoaSxrLHApLG8ucHVzaChsLG0pO3JldHVybiBvfSxiLldlYkdMR3JhcGhpY3MuYnVpbGRDaXJjbGU9ZnVuY3Rpb24oYSxjKXt2YXIgZCxlLGY9YS5zaGFwZSxnPWYueCxoPWYueTthLnR5cGU9PT1iLkdyYXBoaWNzLkNJUkM/KGQ9Zi5yYWRpdXMsZT1mLnJhZGl1cyk6KGQ9Zi53aWR0aCxlPWYuaGVpZ2h0KTt2YXIgaT00MCxqPTIqTWF0aC5QSS9pLGs9MDtpZihhLmZpbGwpe3ZhciBsPWIuaGV4MnJnYihhLmZpbGxDb2xvciksbT1hLmZpbGxBbHBoYSxuPWxbMF0qbSxvPWxbMV0qbSxwPWxbMl0qbSxxPWMucG9pbnRzLHI9Yy5pbmRpY2VzLHM9cS5sZW5ndGgvNjtmb3Ioci5wdXNoKHMpLGs9MDtpKzE+aztrKyspcS5wdXNoKGcsaCxuLG8scCxtKSxxLnB1c2goZytNYXRoLnNpbihqKmspKmQsaCtNYXRoLmNvcyhqKmspKmUsbixvLHAsbSksci5wdXNoKHMrKyxzKyspO3IucHVzaChzLTEpfWlmKGEubGluZVdpZHRoKXt2YXIgdD1hLnBvaW50cztmb3IoYS5wb2ludHM9W10saz0wO2krMT5rO2srKylhLnBvaW50cy5wdXNoKGcrTWF0aC5zaW4oaiprKSpkLGgrTWF0aC5jb3MoaiprKSplKTtiLldlYkdMR3JhcGhpY3MuYnVpbGRMaW5lKGEsYyksYS5wb2ludHM9dH19LGIuV2ViR0xHcmFwaGljcy5idWlsZExpbmU9ZnVuY3Rpb24oYSxjKXt2YXIgZD0wLGU9YS5wb2ludHM7aWYoMCE9PWUubGVuZ3RoKXtpZihhLmxpbmVXaWR0aCUyKWZvcihkPTA7ZDxlLmxlbmd0aDtkKyspZVtkXSs9LjU7dmFyIGY9bmV3IGIuUG9pbnQoZVswXSxlWzFdKSxnPW5ldyBiLlBvaW50KGVbZS5sZW5ndGgtMl0sZVtlLmxlbmd0aC0xXSk7aWYoZi54PT09Zy54JiZmLnk9PT1nLnkpe2U9ZS5zbGljZSgpLGUucG9wKCksZS5wb3AoKSxnPW5ldyBiLlBvaW50KGVbZS5sZW5ndGgtMl0sZVtlLmxlbmd0aC0xXSk7dmFyIGg9Zy54Ky41KihmLngtZy54KSxpPWcueSsuNSooZi55LWcueSk7ZS51bnNoaWZ0KGgsaSksZS5wdXNoKGgsaSl9dmFyIGosayxsLG0sbixvLHAscSxyLHMsdCx1LHYsdyx4LHkseixBLEIsQyxELEUsRixHPWMucG9pbnRzLEg9Yy5pbmRpY2VzLEk9ZS5sZW5ndGgvMixKPWUubGVuZ3RoLEs9Ry5sZW5ndGgvNixMPWEubGluZVdpZHRoLzIsTT1iLmhleDJyZ2IoYS5saW5lQ29sb3IpLE49YS5saW5lQWxwaGEsTz1NWzBdKk4sUD1NWzFdKk4sUT1NWzJdKk47Zm9yKGw9ZVswXSxtPWVbMV0sbj1lWzJdLG89ZVszXSxyPS0obS1vKSxzPWwtbixGPU1hdGguc3FydChyKnIrcypzKSxyLz1GLHMvPUYscio9TCxzKj1MLEcucHVzaChsLXIsbS1zLE8sUCxRLE4pLEcucHVzaChsK3IsbStzLE8sUCxRLE4pLGQ9MTtJLTE+ZDtkKyspbD1lWzIqKGQtMSldLG09ZVsyKihkLTEpKzFdLG49ZVsyKmRdLG89ZVsyKmQrMV0scD1lWzIqKGQrMSldLHE9ZVsyKihkKzEpKzFdLHI9LShtLW8pLHM9bC1uLEY9TWF0aC5zcXJ0KHIqcitzKnMpLHIvPUYscy89RixyKj1MLHMqPUwsdD0tKG8tcSksdT1uLXAsRj1NYXRoLnNxcnQodCp0K3UqdSksdC89Rix1Lz1GLHQqPUwsdSo9TCx4PS1zK20tKC1zK28pLHk9LXIrbi0oLXIrbCksej0oLXIrbCkqKC1zK28pLSgtcituKSooLXMrbSksQT0tdStxLSgtdStvKSxCPS10K24tKC10K3ApLEM9KC10K3ApKigtdStvKS0oLXQrbikqKC11K3EpLEQ9eCpCLUEqeSxNYXRoLmFicyhEKTwuMT8oRCs9MTAuMSxHLnB1c2gobi1yLG8tcyxPLFAsUSxOKSxHLnB1c2gobityLG8rcyxPLFAsUSxOKSk6KGo9KHkqQy1CKnopL0Qsaz0oQSp6LXgqQykvRCxFPShqLW4pKihqLW4pKyhrLW8pKyhrLW8pLEU+MTk2MDA/KHY9ci10LHc9cy11LEY9TWF0aC5zcXJ0KHYqdit3KncpLHYvPUYsdy89Rix2Kj1MLHcqPUwsRy5wdXNoKG4tdixvLXcpLEcucHVzaChPLFAsUSxOKSxHLnB1c2gobit2LG8rdyksRy5wdXNoKE8sUCxRLE4pLEcucHVzaChuLXYsby13KSxHLnB1c2goTyxQLFEsTiksSisrKTooRy5wdXNoKGosayksRy5wdXNoKE8sUCxRLE4pLEcucHVzaChuLShqLW4pLG8tKGstbykpLEcucHVzaChPLFAsUSxOKSkpO1xuZm9yKGw9ZVsyKihJLTIpXSxtPWVbMiooSS0yKSsxXSxuPWVbMiooSS0xKV0sbz1lWzIqKEktMSkrMV0scj0tKG0tbykscz1sLW4sRj1NYXRoLnNxcnQocipyK3Mqcyksci89RixzLz1GLHIqPUwscyo9TCxHLnB1c2gobi1yLG8tcyksRy5wdXNoKE8sUCxRLE4pLEcucHVzaChuK3IsbytzKSxHLnB1c2goTyxQLFEsTiksSC5wdXNoKEspLGQ9MDtKPmQ7ZCsrKUgucHVzaChLKyspO0gucHVzaChLLTEpfX0sYi5XZWJHTEdyYXBoaWNzLmJ1aWxkQ29tcGxleFBvbHk9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLnBvaW50cy5zbGljZSgpO2lmKCEoZC5sZW5ndGg8Nikpe3ZhciBlPWMuaW5kaWNlcztjLnBvaW50cz1kLGMuYWxwaGE9YS5maWxsQWxwaGEsYy5jb2xvcj1iLmhleDJyZ2IoYS5maWxsQ29sb3IpO2Zvcih2YXIgZixnLGg9MS8wLGk9LTEvMCxqPTEvMCxrPS0xLzAsbD0wO2w8ZC5sZW5ndGg7bCs9MilmPWRbbF0sZz1kW2wrMV0saD1oPmY/ZjpoLGk9Zj5pP2Y6aSxqPWo+Zz9nOmosaz1nPms/ZzprO2QucHVzaChoLGosaSxqLGksayxoLGspO3ZhciBtPWQubGVuZ3RoLzI7Zm9yKGw9MDttPmw7bCsrKWUucHVzaChsKX19LGIuV2ViR0xHcmFwaGljcy5idWlsZFBvbHk9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLnBvaW50cztpZighKGQubGVuZ3RoPDYpKXt2YXIgZT1jLnBvaW50cyxmPWMuaW5kaWNlcyxnPWQubGVuZ3RoLzIsaD1iLmhleDJyZ2IoYS5maWxsQ29sb3IpLGk9YS5maWxsQWxwaGEsaj1oWzBdKmksaz1oWzFdKmksbD1oWzJdKmksbT1iLlBvbHlLLlRyaWFuZ3VsYXRlKGQpO2lmKCFtKXJldHVybiExO3ZhciBuPWUubGVuZ3RoLzYsbz0wO2ZvcihvPTA7bzxtLmxlbmd0aDtvKz0zKWYucHVzaChtW29dK24pLGYucHVzaChtW29dK24pLGYucHVzaChtW28rMV0rbiksZi5wdXNoKG1bbysyXStuKSxmLnB1c2gobVtvKzJdK24pO2ZvcihvPTA7Zz5vO28rKyllLnB1c2goZFsyKm9dLGRbMipvKzFdLGosayxsLGkpO3JldHVybiEwfX0sYi5XZWJHTEdyYXBoaWNzLmdyYXBoaWNzRGF0YVBvb2w9W10sYi5XZWJHTEdyYXBoaWNzRGF0YT1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy5jb2xvcj1bMCwwLDBdLHRoaXMucG9pbnRzPVtdLHRoaXMuaW5kaWNlcz1bXSx0aGlzLmJ1ZmZlcj1hLmNyZWF0ZUJ1ZmZlcigpLHRoaXMuaW5kZXhCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLm1vZGU9MSx0aGlzLmFscGhhPTEsdGhpcy5kaXJ0eT0hMH0sYi5XZWJHTEdyYXBoaWNzRGF0YS5wcm90b3R5cGUucmVzZXQ9ZnVuY3Rpb24oKXt0aGlzLnBvaW50cz1bXSx0aGlzLmluZGljZXM9W119LGIuV2ViR0xHcmFwaGljc0RhdGEucHJvdG90eXBlLnVwbG9hZD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2w7dGhpcy5nbFBvaW50cz1uZXcgYi5GbG9hdDMyQXJyYXkodGhpcy5wb2ludHMpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLmJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMuZ2xQb2ludHMsYS5TVEFUSUNfRFJBVyksdGhpcy5nbEluZGljaWVzPW5ldyBiLlVpbnQxNkFycmF5KHRoaXMuaW5kaWNlcyksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5nbEluZGljaWVzLGEuU1RBVElDX0RSQVcpLHRoaXMuZGlydHk9ITF9LGIuZ2xDb250ZXh0cz1bXSxiLmluc3RhbmNlcz1bXSxiLldlYkdMUmVuZGVyZXI9ZnVuY3Rpb24oYSxjLGQpe2lmKGQpZm9yKHZhciBlIGluIGIuZGVmYXVsdFJlbmRlck9wdGlvbnMpXCJ1bmRlZmluZWRcIj09dHlwZW9mIGRbZV0mJihkW2VdPWIuZGVmYXVsdFJlbmRlck9wdGlvbnNbZV0pO2Vsc2UgZD1iLmRlZmF1bHRSZW5kZXJPcHRpb25zO2IuZGVmYXVsdFJlbmRlcmVyfHwoYi5zYXlIZWxsbyhcIndlYkdMXCIpLGIuZGVmYXVsdFJlbmRlcmVyPXRoaXMpLHRoaXMudHlwZT1iLldFQkdMX1JFTkRFUkVSLHRoaXMucmVzb2x1dGlvbj1kLnJlc29sdXRpb24sdGhpcy50cmFuc3BhcmVudD1kLnRyYW5zcGFyZW50LHRoaXMuYXV0b1Jlc2l6ZT1kLmF1dG9SZXNpemV8fCExLHRoaXMucHJlc2VydmVEcmF3aW5nQnVmZmVyPWQucHJlc2VydmVEcmF3aW5nQnVmZmVyLHRoaXMuY2xlYXJCZWZvcmVSZW5kZXI9ZC5jbGVhckJlZm9yZVJlbmRlcix0aGlzLndpZHRoPWF8fDgwMCx0aGlzLmhlaWdodD1jfHw2MDAsdGhpcy52aWV3PWQudmlld3x8ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSx0aGlzLmNvbnRleHRMb3N0Qm91bmQ9dGhpcy5oYW5kbGVDb250ZXh0TG9zdC5iaW5kKHRoaXMpLHRoaXMuY29udGV4dFJlc3RvcmVkQm91bmQ9dGhpcy5oYW5kbGVDb250ZXh0UmVzdG9yZWQuYmluZCh0aGlzKSx0aGlzLnZpZXcuYWRkRXZlbnRMaXN0ZW5lcihcIndlYmdsY29udGV4dGxvc3RcIix0aGlzLmNvbnRleHRMb3N0Qm91bmQsITEpLHRoaXMudmlldy5hZGRFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0cmVzdG9yZWRcIix0aGlzLmNvbnRleHRSZXN0b3JlZEJvdW5kLCExKSx0aGlzLl9jb250ZXh0T3B0aW9ucz17YWxwaGE6dGhpcy50cmFuc3BhcmVudCxhbnRpYWxpYXM6ZC5hbnRpYWxpYXMscHJlbXVsdGlwbGllZEFscGhhOnRoaXMudHJhbnNwYXJlbnQmJlwibm90TXVsdGlwbGllZFwiIT09dGhpcy50cmFuc3BhcmVudCxzdGVuY2lsOiEwLHByZXNlcnZlRHJhd2luZ0J1ZmZlcjpkLnByZXNlcnZlRHJhd2luZ0J1ZmZlcn0sdGhpcy5wcm9qZWN0aW9uPW5ldyBiLlBvaW50LHRoaXMub2Zmc2V0PW5ldyBiLlBvaW50KDAsMCksdGhpcy5zaGFkZXJNYW5hZ2VyPW5ldyBiLldlYkdMU2hhZGVyTWFuYWdlcix0aGlzLnNwcml0ZUJhdGNoPW5ldyBiLldlYkdMU3ByaXRlQmF0Y2gsdGhpcy5tYXNrTWFuYWdlcj1uZXcgYi5XZWJHTE1hc2tNYW5hZ2VyLHRoaXMuZmlsdGVyTWFuYWdlcj1uZXcgYi5XZWJHTEZpbHRlck1hbmFnZXIsdGhpcy5zdGVuY2lsTWFuYWdlcj1uZXcgYi5XZWJHTFN0ZW5jaWxNYW5hZ2VyLHRoaXMuYmxlbmRNb2RlTWFuYWdlcj1uZXcgYi5XZWJHTEJsZW5kTW9kZU1hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uPXt9LHRoaXMucmVuZGVyU2Vzc2lvbi5nbD10aGlzLmdsLHRoaXMucmVuZGVyU2Vzc2lvbi5kcmF3Q291bnQ9MCx0aGlzLnJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlcj10aGlzLnNoYWRlck1hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uLm1hc2tNYW5hZ2VyPXRoaXMubWFza01hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uLmZpbHRlck1hbmFnZXI9dGhpcy5maWx0ZXJNYW5hZ2VyLHRoaXMucmVuZGVyU2Vzc2lvbi5ibGVuZE1vZGVNYW5hZ2VyPXRoaXMuYmxlbmRNb2RlTWFuYWdlcix0aGlzLnJlbmRlclNlc3Npb24uc3ByaXRlQmF0Y2g9dGhpcy5zcHJpdGVCYXRjaCx0aGlzLnJlbmRlclNlc3Npb24uc3RlbmNpbE1hbmFnZXI9dGhpcy5zdGVuY2lsTWFuYWdlcix0aGlzLnJlbmRlclNlc3Npb24ucmVuZGVyZXI9dGhpcyx0aGlzLnJlbmRlclNlc3Npb24ucmVzb2x1dGlvbj10aGlzLnJlc29sdXRpb24sdGhpcy5pbml0Q29udGV4dCgpLHRoaXMubWFwQmxlbmRNb2RlcygpfSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuV2ViR0xSZW5kZXJlcixiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLmluaXRDb250ZXh0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy52aWV3LmdldENvbnRleHQoXCJ3ZWJnbFwiLHRoaXMuX2NvbnRleHRPcHRpb25zKXx8dGhpcy52aWV3LmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIix0aGlzLl9jb250ZXh0T3B0aW9ucyk7aWYodGhpcy5nbD1hLCFhKXRocm93IG5ldyBFcnJvcihcIlRoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHdlYkdMLiBUcnkgdXNpbmcgdGhlIGNhbnZhcyByZW5kZXJlclwiKTt0aGlzLmdsQ29udGV4dElkPWEuaWQ9Yi5XZWJHTFJlbmRlcmVyLmdsQ29udGV4dElkKyssYi5nbENvbnRleHRzW3RoaXMuZ2xDb250ZXh0SWRdPWEsYi5pbnN0YW5jZXNbdGhpcy5nbENvbnRleHRJZF09dGhpcyxhLmRpc2FibGUoYS5ERVBUSF9URVNUKSxhLmRpc2FibGUoYS5DVUxMX0ZBQ0UpLGEuZW5hYmxlKGEuQkxFTkQpLHRoaXMuc2hhZGVyTWFuYWdlci5zZXRDb250ZXh0KGEpLHRoaXMuc3ByaXRlQmF0Y2guc2V0Q29udGV4dChhKSx0aGlzLm1hc2tNYW5hZ2VyLnNldENvbnRleHQoYSksdGhpcy5maWx0ZXJNYW5hZ2VyLnNldENvbnRleHQoYSksdGhpcy5ibGVuZE1vZGVNYW5hZ2VyLnNldENvbnRleHQoYSksdGhpcy5zdGVuY2lsTWFuYWdlci5zZXRDb250ZXh0KGEpLHRoaXMucmVuZGVyU2Vzc2lvbi5nbD10aGlzLmdsLHRoaXMucmVzaXplKHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpfSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihhKXtpZighdGhpcy5jb250ZXh0TG9zdCl7dGhpcy5fX3N0YWdlIT09YSYmKGEuaW50ZXJhY3RpdmUmJmEuaW50ZXJhY3Rpb25NYW5hZ2VyLnJlbW92ZUV2ZW50cygpLHRoaXMuX19zdGFnZT1hKSxhLnVwZGF0ZVRyYW5zZm9ybSgpO3ZhciBiPXRoaXMuZ2w7YS5faW50ZXJhY3RpdmU/YS5faW50ZXJhY3RpdmVFdmVudHNBZGRlZHx8KGEuX2ludGVyYWN0aXZlRXZlbnRzQWRkZWQ9ITAsYS5pbnRlcmFjdGlvbk1hbmFnZXIuc2V0VGFyZ2V0KHRoaXMpKTphLl9pbnRlcmFjdGl2ZUV2ZW50c0FkZGVkJiYoYS5faW50ZXJhY3RpdmVFdmVudHNBZGRlZD0hMSxhLmludGVyYWN0aW9uTWFuYWdlci5zZXRUYXJnZXQodGhpcykpLGIudmlld3BvcnQoMCwwLHRoaXMud2lkdGgsdGhpcy5oZWlnaHQpLGIuYmluZEZyYW1lYnVmZmVyKGIuRlJBTUVCVUZGRVIsbnVsbCksdGhpcy5jbGVhckJlZm9yZVJlbmRlciYmKHRoaXMudHJhbnNwYXJlbnQ/Yi5jbGVhckNvbG9yKDAsMCwwLDApOmIuY2xlYXJDb2xvcihhLmJhY2tncm91bmRDb2xvclNwbGl0WzBdLGEuYmFja2dyb3VuZENvbG9yU3BsaXRbMV0sYS5iYWNrZ3JvdW5kQ29sb3JTcGxpdFsyXSwxKSxiLmNsZWFyKGIuQ09MT1JfQlVGRkVSX0JJVCkpLHRoaXMucmVuZGVyRGlzcGxheU9iamVjdChhLHRoaXMucHJvamVjdGlvbil9fSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlckRpc3BsYXlPYmplY3Q9ZnVuY3Rpb24oYSxjLGQpe3RoaXMucmVuZGVyU2Vzc2lvbi5ibGVuZE1vZGVNYW5hZ2VyLnNldEJsZW5kTW9kZShiLmJsZW5kTW9kZXMuTk9STUFMKSx0aGlzLnJlbmRlclNlc3Npb24uZHJhd0NvdW50PTAsdGhpcy5yZW5kZXJTZXNzaW9uLmZsaXBZPWQ/LTE6MSx0aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbj1jLHRoaXMucmVuZGVyU2Vzc2lvbi5vZmZzZXQ9dGhpcy5vZmZzZXQsdGhpcy5zcHJpdGVCYXRjaC5iZWdpbih0aGlzLnJlbmRlclNlc3Npb24pLHRoaXMuZmlsdGVyTWFuYWdlci5iZWdpbih0aGlzLnJlbmRlclNlc3Npb24sZCksYS5fcmVuZGVyV2ViR0wodGhpcy5yZW5kZXJTZXNzaW9uKSx0aGlzLnNwcml0ZUJhdGNoLmVuZCgpfSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLnJlc2l6ZT1mdW5jdGlvbihhLGIpe3RoaXMud2lkdGg9YSp0aGlzLnJlc29sdXRpb24sdGhpcy5oZWlnaHQ9Yip0aGlzLnJlc29sdXRpb24sdGhpcy52aWV3LndpZHRoPXRoaXMud2lkdGgsdGhpcy52aWV3LmhlaWdodD10aGlzLmhlaWdodCx0aGlzLmF1dG9SZXNpemUmJih0aGlzLnZpZXcuc3R5bGUud2lkdGg9dGhpcy53aWR0aC90aGlzLnJlc29sdXRpb24rXCJweFwiLHRoaXMudmlldy5zdHlsZS5oZWlnaHQ9dGhpcy5oZWlnaHQvdGhpcy5yZXNvbHV0aW9uK1wicHhcIiksdGhpcy5nbC52aWV3cG9ydCgwLDAsdGhpcy53aWR0aCx0aGlzLmhlaWdodCksdGhpcy5wcm9qZWN0aW9uLng9dGhpcy53aWR0aC8yL3RoaXMucmVzb2x1dGlvbix0aGlzLnByb2plY3Rpb24ueT0tdGhpcy5oZWlnaHQvMi90aGlzLnJlc29sdXRpb259LGIuV2ViR0xSZW5kZXJlci5wcm90b3R5cGUudXBkYXRlVGV4dHVyZT1mdW5jdGlvbihhKXtpZihhLmhhc0xvYWRlZCl7dmFyIGM9dGhpcy5nbDtyZXR1cm4gYS5fZ2xUZXh0dXJlc1tjLmlkXXx8KGEuX2dsVGV4dHVyZXNbYy5pZF09Yy5jcmVhdGVUZXh0dXJlKCkpLGMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELGEuX2dsVGV4dHVyZXNbYy5pZF0pLGMucGl4ZWxTdG9yZWkoYy5VTlBBQ0tfUFJFTVVMVElQTFlfQUxQSEFfV0VCR0wsYS5wcmVtdWx0aXBsaWVkQWxwaGEpLGMudGV4SW1hZ2UyRChjLlRFWFRVUkVfMkQsMCxjLlJHQkEsYy5SR0JBLGMuVU5TSUdORURfQllURSxhLnNvdXJjZSksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfTUFHX0ZJTFRFUixhLnNjYWxlTW9kZT09PWIuc2NhbGVNb2Rlcy5MSU5FQVI/Yy5MSU5FQVI6Yy5ORUFSRVNUKSxhLm1pcG1hcCYmYi5pc1Bvd2VyT2ZUd28oYS53aWR0aCxhLmhlaWdodCk/KGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX01JTl9GSUxURVIsYS5zY2FsZU1vZGU9PT1iLnNjYWxlTW9kZXMuTElORUFSP2MuTElORUFSX01JUE1BUF9MSU5FQVI6Yy5ORUFSRVNUX01JUE1BUF9ORUFSRVNUKSxjLmdlbmVyYXRlTWlwbWFwKGMuVEVYVFVSRV8yRCkpOmMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX01JTl9GSUxURVIsYS5zY2FsZU1vZGU9PT1iLnNjYWxlTW9kZXMuTElORUFSP2MuTElORUFSOmMuTkVBUkVTVCksYS5fcG93ZXJPZjI/KGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyxjLlJFUEVBVCksYy50ZXhQYXJhbWV0ZXJpKGMuVEVYVFVSRV8yRCxjLlRFWFRVUkVfV1JBUF9ULGMuUkVQRUFUKSk6KGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfUyxjLkNMQU1QX1RPX0VER0UpLGMudGV4UGFyYW1ldGVyaShjLlRFWFRVUkVfMkQsYy5URVhUVVJFX1dSQVBfVCxjLkNMQU1QX1RPX0VER0UpKSxhLl9kaXJ0eVtjLmlkXT0hMSxhLl9nbFRleHR1cmVzW2MuaWRdfX0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5oYW5kbGVDb250ZXh0TG9zdD1mdW5jdGlvbihhKXthLnByZXZlbnREZWZhdWx0KCksdGhpcy5jb250ZXh0TG9zdD0hMH0sYi5XZWJHTFJlbmRlcmVyLnByb3RvdHlwZS5oYW5kbGVDb250ZXh0UmVzdG9yZWQ9ZnVuY3Rpb24oKXt0aGlzLmluaXRDb250ZXh0KCk7Zm9yKHZhciBhIGluIGIuVGV4dHVyZUNhY2hlKXt2YXIgYz1iLlRleHR1cmVDYWNoZVthXS5iYXNlVGV4dHVyZTtjLl9nbFRleHR1cmVzPVtdfXRoaXMuY29udGV4dExvc3Q9ITF9LGIuV2ViR0xSZW5kZXJlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMudmlldy5yZW1vdmVFdmVudExpc3RlbmVyKFwid2ViZ2xjb250ZXh0bG9zdFwiLHRoaXMuY29udGV4dExvc3RCb3VuZCksdGhpcy52aWV3LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJ3ZWJnbGNvbnRleHRyZXN0b3JlZFwiLHRoaXMuY29udGV4dFJlc3RvcmVkQm91bmQpLGIuZ2xDb250ZXh0c1t0aGlzLmdsQ29udGV4dElkXT1udWxsLHRoaXMucHJvamVjdGlvbj1udWxsLHRoaXMub2Zmc2V0PW51bGwsdGhpcy5zaGFkZXJNYW5hZ2VyLmRlc3Ryb3koKSx0aGlzLnNwcml0ZUJhdGNoLmRlc3Ryb3koKSx0aGlzLm1hc2tNYW5hZ2VyLmRlc3Ryb3koKSx0aGlzLmZpbHRlck1hbmFnZXIuZGVzdHJveSgpLHRoaXMuc2hhZGVyTWFuYWdlcj1udWxsLHRoaXMuc3ByaXRlQmF0Y2g9bnVsbCx0aGlzLm1hc2tNYW5hZ2VyPW51bGwsdGhpcy5maWx0ZXJNYW5hZ2VyPW51bGwsdGhpcy5nbD1udWxsLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsfSxiLldlYkdMUmVuZGVyZXIucHJvdG90eXBlLm1hcEJsZW5kTW9kZXM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO2IuYmxlbmRNb2Rlc1dlYkdMfHwoYi5ibGVuZE1vZGVzV2ViR0w9W10sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLk5PUk1BTF09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLkFERF09W2EuU1JDX0FMUEhBLGEuRFNUX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuTVVMVElQTFldPVthLkRTVF9DT0xPUixhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5TQ1JFRU5dPVthLlNSQ19BTFBIQSxhLk9ORV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLk9WRVJMQVldPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5MSUdIVEVOXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuQ09MT1JfRE9ER0VdPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuSEFSRF9MSUdIVF09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLlNPRlRfTElHSFRdPVthLk9ORSxhLk9ORV9NSU5VU19TUkNfQUxQSEFdLGIuYmxlbmRNb2Rlc1dlYkdMW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuRVhDTFVTSU9OXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuSFVFXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuU0FUVVJBVElPTl09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0sYi5ibGVuZE1vZGVzV2ViR0xbYi5ibGVuZE1vZGVzLkNPTE9SXT1bYS5PTkUsYS5PTkVfTUlOVVNfU1JDX0FMUEhBXSxiLmJsZW5kTW9kZXNXZWJHTFtiLmJsZW5kTW9kZXMuTFVNSU5PU0lUWV09W2EuT05FLGEuT05FX01JTlVTX1NSQ19BTFBIQV0pfSxiLldlYkdMUmVuZGVyZXIuZ2xDb250ZXh0SWQ9MCxiLldlYkdMQmxlbmRNb2RlTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuY3VycmVudEJsZW5kTW9kZT05OTk5OX0sYi5XZWJHTEJsZW5kTW9kZU1hbmFnZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLGIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLnByb3RvdHlwZS5zZXRDb250ZXh0PWZ1bmN0aW9uKGEpe3RoaXMuZ2w9YX0sYi5XZWJHTEJsZW5kTW9kZU1hbmFnZXIucHJvdG90eXBlLnNldEJsZW5kTW9kZT1mdW5jdGlvbihhKXtpZih0aGlzLmN1cnJlbnRCbGVuZE1vZGU9PT1hKXJldHVybiExO3RoaXMuY3VycmVudEJsZW5kTW9kZT1hO3ZhciBjPWIuYmxlbmRNb2Rlc1dlYkdMW3RoaXMuY3VycmVudEJsZW5kTW9kZV07cmV0dXJuIHRoaXMuZ2wuYmxlbmRGdW5jKGNbMF0sY1sxXSksITB9LGIuV2ViR0xCbGVuZE1vZGVNYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5nbD1udWxsfSxiLldlYkdMTWFza01hbmFnZXI9ZnVuY3Rpb24oKXt9LGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5XZWJHTE1hc2tNYW5hZ2VyLGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWF9LGIuV2ViR0xNYXNrTWFuYWdlci5wcm90b3R5cGUucHVzaE1hc2s9ZnVuY3Rpb24oYSxjKXt2YXIgZD1jLmdsO2EuZGlydHkmJmIuV2ViR0xHcmFwaGljcy51cGRhdGVHcmFwaGljcyhhLGQpLGEuX3dlYkdMW2QuaWRdLmRhdGEubGVuZ3RoJiZjLnN0ZW5jaWxNYW5hZ2VyLnB1c2hTdGVuY2lsKGEsYS5fd2ViR0xbZC5pZF0uZGF0YVswXSxjKX0sYi5XZWJHTE1hc2tNYW5hZ2VyLnByb3RvdHlwZS5wb3BNYXNrPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcy5nbDtiLnN0ZW5jaWxNYW5hZ2VyLnBvcFN0ZW5jaWwoYSxhLl93ZWJHTFtjLmlkXS5kYXRhWzBdLGIpfSxiLldlYkdMTWFza01hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLmdsPW51bGx9LGIuV2ViR0xTdGVuY2lsTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuc3RlbmNpbFN0YWNrPVtdLHRoaXMucmV2ZXJzZT0hMCx0aGlzLmNvdW50PTB9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWF9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUucHVzaFN0ZW5jaWw9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMuZ2w7dGhpcy5iaW5kR3JhcGhpY3MoYSxiLGMpLDA9PT10aGlzLnN0ZW5jaWxTdGFjay5sZW5ndGgmJihkLmVuYWJsZShkLlNURU5DSUxfVEVTVCksZC5jbGVhcihkLlNURU5DSUxfQlVGRkVSX0JJVCksdGhpcy5yZXZlcnNlPSEwLHRoaXMuY291bnQ9MCksdGhpcy5zdGVuY2lsU3RhY2sucHVzaChiKTt2YXIgZT10aGlzLmNvdW50O2QuY29sb3JNYXNrKCExLCExLCExLCExKSxkLnN0ZW5jaWxGdW5jKGQuQUxXQVlTLDAsMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuSU5WRVJUKSwxPT09Yi5tb2RlPyhkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTixiLmluZGljZXMubGVuZ3RoLTQsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtZSwyNTUpLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5ERUNSKSk6KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTiw0LGQuVU5TSUdORURfU0hPUlQsMiooYi5pbmRpY2VzLmxlbmd0aC00KSksdGhpcy5yZXZlcnNlP2Quc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KTpkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsZSsxLDI1NSksdGhpcy5yZXZlcnNlPSF0aGlzLnJldmVyc2UpOih0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOQ1IpKTooZC5zdGVuY2lsRnVuYyhkLkVRVUFMLDI1NS1lLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLkRFQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX1NUUklQLGIuaW5kaWNlcy5sZW5ndGgsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/ZC5zdGVuY2lsRnVuYyhkLkVRVUFMLGUrMSwyNTUpOmQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KSksZC5jb2xvck1hc2soITAsITAsITAsITApLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5LRUVQKSx0aGlzLmNvdW50Kyt9LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUuYmluZEdyYXBoaWNzPWZ1bmN0aW9uKGEsYyxkKXt0aGlzLl9jdXJyZW50R3JhcGhpY3M9YTt2YXIgZSxmPXRoaXMuZ2wsZz1kLnByb2plY3Rpb24saD1kLm9mZnNldDsxPT09Yy5tb2RlPyhlPWQuc2hhZGVyTWFuYWdlci5jb21wbGV4UHJpbWl0aXZlU2hhZGVyLGQuc2hhZGVyTWFuYWdlci5zZXRTaGFkZXIoZSksZi51bmlmb3JtMWYoZS5mbGlwWSxkLmZsaXBZKSxmLnVuaWZvcm1NYXRyaXgzZnYoZS50cmFuc2xhdGlvbk1hdHJpeCwhMSxhLndvcmxkVHJhbnNmb3JtLnRvQXJyYXkoITApKSxmLnVuaWZvcm0yZihlLnByb2plY3Rpb25WZWN0b3IsZy54LC1nLnkpLGYudW5pZm9ybTJmKGUub2Zmc2V0VmVjdG9yLC1oLngsLWgueSksZi51bmlmb3JtM2Z2KGUudGludENvbG9yLGIuaGV4MnJnYihhLnRpbnQpKSxmLnVuaWZvcm0zZnYoZS5jb2xvcixjLmNvbG9yKSxmLnVuaWZvcm0xZihlLmFscGhhLGEud29ybGRBbHBoYSpjLmFscGhhKSxmLmJpbmRCdWZmZXIoZi5BUlJBWV9CVUZGRVIsYy5idWZmZXIpLGYudmVydGV4QXR0cmliUG9pbnRlcihlLmFWZXJ0ZXhQb3NpdGlvbiwyLGYuRkxPQVQsITEsOCwwKSxmLmJpbmRCdWZmZXIoZi5FTEVNRU5UX0FSUkFZX0JVRkZFUixjLmluZGV4QnVmZmVyKSk6KGU9ZC5zaGFkZXJNYW5hZ2VyLnByaW1pdGl2ZVNoYWRlcixkLnNoYWRlck1hbmFnZXIuc2V0U2hhZGVyKGUpLGYudW5pZm9ybU1hdHJpeDNmdihlLnRyYW5zbGF0aW9uTWF0cml4LCExLGEud29ybGRUcmFuc2Zvcm0udG9BcnJheSghMCkpLGYudW5pZm9ybTFmKGUuZmxpcFksZC5mbGlwWSksZi51bmlmb3JtMmYoZS5wcm9qZWN0aW9uVmVjdG9yLGcueCwtZy55KSxmLnVuaWZvcm0yZihlLm9mZnNldFZlY3RvciwtaC54LC1oLnkpLGYudW5pZm9ybTNmdihlLnRpbnRDb2xvcixiLmhleDJyZ2IoYS50aW50KSksZi51bmlmb3JtMWYoZS5hbHBoYSxhLndvcmxkQWxwaGEpLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUixjLmJ1ZmZlciksZi52ZXJ0ZXhBdHRyaWJQb2ludGVyKGUuYVZlcnRleFBvc2l0aW9uLDIsZi5GTE9BVCwhMSwyNCwwKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZS5jb2xvckF0dHJpYnV0ZSw0LGYuRkxPQVQsITEsMjQsOCksZi5iaW5kQnVmZmVyKGYuRUxFTUVOVF9BUlJBWV9CVUZGRVIsYy5pbmRleEJ1ZmZlcikpfSxiLldlYkdMU3RlbmNpbE1hbmFnZXIucHJvdG90eXBlLnBvcFN0ZW5jaWw9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMuZ2w7aWYodGhpcy5zdGVuY2lsU3RhY2sucG9wKCksdGhpcy5jb3VudC0tLDA9PT10aGlzLnN0ZW5jaWxTdGFjay5sZW5ndGgpZC5kaXNhYmxlKGQuU1RFTkNJTF9URVNUKTtlbHNle3ZhciBlPXRoaXMuY291bnQ7dGhpcy5iaW5kR3JhcGhpY3MoYSxiLGMpLGQuY29sb3JNYXNrKCExLCExLCExLCExKSwxPT09Yi5tb2RlPyh0aGlzLnJldmVyc2U9IXRoaXMucmV2ZXJzZSx0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCwyNTUtKGUrMSksMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuSU5DUikpOihkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsZSsxLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLkRFQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX0ZBTiw0LGQuVU5TSUdORURfU0hPUlQsMiooYi5pbmRpY2VzLmxlbmd0aC00KSksZC5zdGVuY2lsRnVuYyhkLkFMV0FZUywwLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOVkVSVCksZC5kcmF3RWxlbWVudHMoZC5UUklBTkdMRV9GQU4sYi5pbmRpY2VzLmxlbmd0aC00LGQuVU5TSUdORURfU0hPUlQsMCksdGhpcy5yZXZlcnNlP2Quc3RlbmNpbEZ1bmMoZC5FUVVBTCxlLDI1NSk6ZC5zdGVuY2lsRnVuYyhkLkVRVUFMLDI1NS1lLDI1NSkpOih0aGlzLnJldmVyc2U/KGQuc3RlbmNpbEZ1bmMoZC5FUVVBTCxlKzEsMjU1KSxkLnN0ZW5jaWxPcChkLktFRVAsZC5LRUVQLGQuREVDUikpOihkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsMjU1LShlKzEpLDI1NSksZC5zdGVuY2lsT3AoZC5LRUVQLGQuS0VFUCxkLklOQ1IpKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFX1NUUklQLGIuaW5kaWNlcy5sZW5ndGgsZC5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLnJldmVyc2U/ZC5zdGVuY2lsRnVuYyhkLkVRVUFMLGUsMjU1KTpkLnN0ZW5jaWxGdW5jKGQuRVFVQUwsMjU1LWUsMjU1KSksZC5jb2xvck1hc2soITAsITAsITAsITApLGQuc3RlbmNpbE9wKGQuS0VFUCxkLktFRVAsZC5LRUVQKX19LGIuV2ViR0xTdGVuY2lsTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuc3RlbmNpbFN0YWNrPW51bGwsdGhpcy5nbD1udWxsfSxiLldlYkdMU2hhZGVyTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMubWF4QXR0aWJzPTEwLHRoaXMuYXR0cmliU3RhdGU9W10sdGhpcy50ZW1wQXR0cmliU3RhdGU9W107Zm9yKHZhciBhPTA7YTx0aGlzLm1heEF0dGliczthKyspdGhpcy5hdHRyaWJTdGF0ZVthXT0hMTt0aGlzLnN0YWNrPVtdfSxiLldlYkdMU2hhZGVyTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5XZWJHTFNoYWRlck1hbmFnZXIsYi5XZWJHTFNoYWRlck1hbmFnZXIucHJvdG90eXBlLnNldENvbnRleHQ9ZnVuY3Rpb24oYSl7dGhpcy5nbD1hLHRoaXMucHJpbWl0aXZlU2hhZGVyPW5ldyBiLlByaW1pdGl2ZVNoYWRlcihhKSx0aGlzLmNvbXBsZXhQcmltaXRpdmVTaGFkZXI9bmV3IGIuQ29tcGxleFByaW1pdGl2ZVNoYWRlcihhKSx0aGlzLmRlZmF1bHRTaGFkZXI9bmV3IGIuUGl4aVNoYWRlcihhKSx0aGlzLmZhc3RTaGFkZXI9bmV3IGIuUGl4aUZhc3RTaGFkZXIoYSksdGhpcy5zdHJpcFNoYWRlcj1uZXcgYi5TdHJpcFNoYWRlcihhKSx0aGlzLnNldFNoYWRlcih0aGlzLmRlZmF1bHRTaGFkZXIpfSxiLldlYkdMU2hhZGVyTWFuYWdlci5wcm90b3R5cGUuc2V0QXR0cmlicz1mdW5jdGlvbihhKXt2YXIgYjtmb3IoYj0wO2I8dGhpcy50ZW1wQXR0cmliU3RhdGUubGVuZ3RoO2IrKyl0aGlzLnRlbXBBdHRyaWJTdGF0ZVtiXT0hMTtmb3IoYj0wO2I8YS5sZW5ndGg7YisrKXt2YXIgYz1hW2JdO3RoaXMudGVtcEF0dHJpYlN0YXRlW2NdPSEwfXZhciBkPXRoaXMuZ2w7Zm9yKGI9MDtiPHRoaXMuYXR0cmliU3RhdGUubGVuZ3RoO2IrKyl0aGlzLmF0dHJpYlN0YXRlW2JdIT09dGhpcy50ZW1wQXR0cmliU3RhdGVbYl0mJih0aGlzLmF0dHJpYlN0YXRlW2JdPXRoaXMudGVtcEF0dHJpYlN0YXRlW2JdLHRoaXMudGVtcEF0dHJpYlN0YXRlW2JdP2QuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYik6ZC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoYikpfSxiLldlYkdMU2hhZGVyTWFuYWdlci5wcm90b3R5cGUuc2V0U2hhZGVyPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLl9jdXJyZW50SWQ9PT1hLl9VSUQ/ITE6KHRoaXMuX2N1cnJlbnRJZD1hLl9VSUQsdGhpcy5jdXJyZW50U2hhZGVyPWEsdGhpcy5nbC51c2VQcm9ncmFtKGEucHJvZ3JhbSksdGhpcy5zZXRBdHRyaWJzKGEuYXR0cmlidXRlcyksITApfSxiLldlYkdMU2hhZGVyTWFuYWdlci5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuYXR0cmliU3RhdGU9bnVsbCx0aGlzLnRlbXBBdHRyaWJTdGF0ZT1udWxsLHRoaXMucHJpbWl0aXZlU2hhZGVyLmRlc3Ryb3koKSx0aGlzLmNvbXBsZXhQcmltaXRpdmVTaGFkZXIuZGVzdHJveSgpLHRoaXMuZGVmYXVsdFNoYWRlci5kZXN0cm95KCksdGhpcy5mYXN0U2hhZGVyLmRlc3Ryb3koKSx0aGlzLnN0cmlwU2hhZGVyLmRlc3Ryb3koKSx0aGlzLmdsPW51bGx9LGIuV2ViR0xTcHJpdGVCYXRjaD1mdW5jdGlvbigpe3RoaXMudmVydFNpemU9NSx0aGlzLnNpemU9MmUzO3ZhciBhPTQqdGhpcy5zaXplKjQqdGhpcy52ZXJ0U2l6ZSxjPTYqdGhpcy5zaXplO3RoaXMudmVydGljZXM9bmV3IGIuQXJyYXlCdWZmZXIoYSksdGhpcy5wb3NpdGlvbnM9bmV3IGIuRmxvYXQzMkFycmF5KHRoaXMudmVydGljZXMpLHRoaXMuY29sb3JzPW5ldyBiLlVpbnQzMkFycmF5KHRoaXMudmVydGljZXMpLHRoaXMuaW5kaWNlcz1uZXcgYi5VaW50MTZBcnJheShjKSx0aGlzLmxhc3RJbmRleENvdW50PTA7Zm9yKHZhciBkPTAsZT0wO2M+ZDtkKz02LGUrPTQpdGhpcy5pbmRpY2VzW2QrMF09ZSswLHRoaXMuaW5kaWNlc1tkKzFdPWUrMSx0aGlzLmluZGljZXNbZCsyXT1lKzIsdGhpcy5pbmRpY2VzW2QrM109ZSswLHRoaXMuaW5kaWNlc1tkKzRdPWUrMix0aGlzLmluZGljZXNbZCs1XT1lKzM7dGhpcy5kcmF3aW5nPSExLHRoaXMuY3VycmVudEJhdGNoU2l6ZT0wLHRoaXMuY3VycmVudEJhc2VUZXh0dXJlPW51bGwsdGhpcy5kaXJ0eT0hMCx0aGlzLnRleHR1cmVzPVtdLHRoaXMuYmxlbmRNb2Rlcz1bXSx0aGlzLnNoYWRlcnM9W10sdGhpcy5zcHJpdGVzPVtdLHRoaXMuZGVmYXVsdFNoYWRlcj1uZXcgYi5BYnN0cmFjdEZpbHRlcihbXCJwcmVjaXNpb24gbG93cCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCkgKiB2Q29sb3IgO1wiLFwifVwiXSl9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy52ZXJ0ZXhCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRpY2VzLGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGljZXMsYS5EWU5BTUlDX0RSQVcpLHRoaXMuY3VycmVudEJsZW5kTW9kZT05OTk5OTt2YXIgYz1uZXcgYi5QaXhpU2hhZGVyKGEpO2MuZnJhZ21lbnRTcmM9dGhpcy5kZWZhdWx0U2hhZGVyLmZyYWdtZW50U3JjLGMudW5pZm9ybXM9e30sYy5pbml0KCksdGhpcy5kZWZhdWx0U2hhZGVyLnNoYWRlcnNbYS5pZF09Y30sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhKXt0aGlzLnJlbmRlclNlc3Npb249YSx0aGlzLnNoYWRlcj10aGlzLnJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5kZWZhdWx0U2hhZGVyLHRoaXMuc3RhcnQoKX0sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5lbmQ9ZnVuY3Rpb24oKXt0aGlzLmZsdXNoKCl9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGEpe3ZhciBiPWEudGV4dHVyZTt0aGlzLmN1cnJlbnRCYXRjaFNpemU+PXRoaXMuc2l6ZSYmKHRoaXMuZmx1c2goKSx0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1iLmJhc2VUZXh0dXJlKTt2YXIgYz1iLl91dnM7aWYoYyl7dmFyIGQsZSxmLGcsaD1hLmFuY2hvci54LGk9YS5hbmNob3IueTtpZihiLnRyaW0pe3ZhciBqPWIudHJpbTtlPWoueC1oKmoud2lkdGgsZD1lK2IuY3JvcC53aWR0aCxnPWoueS1pKmouaGVpZ2h0LGY9ZytiLmNyb3AuaGVpZ2h0fWVsc2UgZD1iLmZyYW1lLndpZHRoKigxLWgpLGU9Yi5mcmFtZS53aWR0aCotaCxmPWIuZnJhbWUuaGVpZ2h0KigxLWkpLGc9Yi5mcmFtZS5oZWlnaHQqLWk7dmFyIGs9NCp0aGlzLmN1cnJlbnRCYXRjaFNpemUqdGhpcy52ZXJ0U2l6ZSxsPWIuYmFzZVRleHR1cmUucmVzb2x1dGlvbixtPWEud29ybGRUcmFuc2Zvcm0sbj1tLmEvbCxvPW0uYi9sLHA9bS5jL2wscT1tLmQvbCxyPW0udHgscz1tLnR5LHQ9dGhpcy5jb2xvcnMsdT10aGlzLnBvc2l0aW9uczt0aGlzLnJlbmRlclNlc3Npb24ucm91bmRQaXhlbHM/KHVba109biplK3AqZytyfDAsdVtrKzFdPXEqZytvKmUrc3wwLHVbays1XT1uKmQrcCpnK3J8MCx1W2srNl09cSpnK28qZCtzfDAsdVtrKzEwXT1uKmQrcCpmK3J8MCx1W2srMTFdPXEqZitvKmQrc3wwLHVbaysxNV09biplK3AqZityfDAsdVtrKzE2XT1xKmYrbyplK3N8MCk6KHVba109biplK3AqZytyLHVbaysxXT1xKmcrbyplK3MsdVtrKzVdPW4qZCtwKmcrcix1W2srNl09cSpnK28qZCtzLHVbaysxMF09bipkK3AqZityLHVbaysxMV09cSpmK28qZCtzLHVbaysxNV09biplK3AqZityLHVbaysxNl09cSpmK28qZStzKSx1W2srMl09Yy54MCx1W2srM109Yy55MCx1W2srN109Yy54MSx1W2srOF09Yy55MSx1W2srMTJdPWMueDIsdVtrKzEzXT1jLnkyLHVbaysxN109Yy54Myx1W2srMThdPWMueTM7dmFyIHY9YS50aW50O3Rbays0XT10W2srOV09dFtrKzE0XT10W2srMTldPSh2Pj4xNikrKDY1MjgwJnYpKygoMjU1JnYpPDwxNikrKDI1NSphLndvcmxkQWxwaGE8PDI0KSx0aGlzLnNwcml0ZXNbdGhpcy5jdXJyZW50QmF0Y2hTaXplKytdPWF9fSxiLldlYkdMU3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlclRpbGluZ1Nwcml0ZT1mdW5jdGlvbihhKXt2YXIgYz1hLnRpbGluZ1RleHR1cmU7dGhpcy5jdXJyZW50QmF0Y2hTaXplPj10aGlzLnNpemUmJih0aGlzLmZsdXNoKCksdGhpcy5jdXJyZW50QmFzZVRleHR1cmU9Yy5iYXNlVGV4dHVyZSksYS5fdXZzfHwoYS5fdXZzPW5ldyBiLlRleHR1cmVVdnMpO3ZhciBkPWEuX3V2czthLnRpbGVQb3NpdGlvbi54JT1jLmJhc2VUZXh0dXJlLndpZHRoKmEudGlsZVNjYWxlT2Zmc2V0LngsYS50aWxlUG9zaXRpb24ueSU9Yy5iYXNlVGV4dHVyZS5oZWlnaHQqYS50aWxlU2NhbGVPZmZzZXQueTt2YXIgZT1hLnRpbGVQb3NpdGlvbi54LyhjLmJhc2VUZXh0dXJlLndpZHRoKmEudGlsZVNjYWxlT2Zmc2V0LngpLGY9YS50aWxlUG9zaXRpb24ueS8oYy5iYXNlVGV4dHVyZS5oZWlnaHQqYS50aWxlU2NhbGVPZmZzZXQueSksZz1hLndpZHRoL2MuYmFzZVRleHR1cmUud2lkdGgvKGEudGlsZVNjYWxlLngqYS50aWxlU2NhbGVPZmZzZXQueCksaD1hLmhlaWdodC9jLmJhc2VUZXh0dXJlLmhlaWdodC8oYS50aWxlU2NhbGUueSphLnRpbGVTY2FsZU9mZnNldC55KTtkLngwPTAtZSxkLnkwPTAtZixkLngxPTEqZy1lLGQueTE9MC1mLGQueDI9MSpnLWUsZC55Mj0xKmgtZixkLngzPTAtZSxkLnkzPTEqaC1mO3ZhciBpPWEudGludCxqPShpPj4xNikrKDY1MjgwJmkpKygoMjU1JmkpPDwxNikrKDI1NSphLmFscGhhPDwyNCksaz10aGlzLnBvc2l0aW9ucyxsPXRoaXMuY29sb3JzLG09YS53aWR0aCxuPWEuaGVpZ2h0LG89YS5hbmNob3IueCxwPWEuYW5jaG9yLnkscT1tKigxLW8pLHI9bSotbyxzPW4qKDEtcCksdD1uKi1wLHU9NCp0aGlzLmN1cnJlbnRCYXRjaFNpemUqdGhpcy52ZXJ0U2l6ZSx2PWMuYmFzZVRleHR1cmUucmVzb2x1dGlvbix3PWEud29ybGRUcmFuc2Zvcm0seD13LmEvdix5PXcuYi92LHo9dy5jL3YsQT13LmQvdixCPXcudHgsQz13LnR5O2tbdSsrXT14KnIreip0K0Isa1t1KytdPUEqdCt5KnIrQyxrW3UrK109ZC54MCxrW3UrK109ZC55MCxsW3UrK109aixrW3UrK109eCpxK3oqdCtCLGtbdSsrXT1BKnQreSpxK0Msa1t1KytdPWQueDEsa1t1KytdPWQueTEsbFt1KytdPWosa1t1KytdPXgqcSt6KnMrQixrW3UrK109QSpzK3kqcStDLGtbdSsrXT1kLngyLGtbdSsrXT1kLnkyLGxbdSsrXT1qLGtbdSsrXT14KnIreipzK0Isa1t1KytdPUEqcyt5KnIrQyxrW3UrK109ZC54MyxrW3UrK109ZC55MyxsW3UrK109aix0aGlzLnNwcml0ZXNbdGhpcy5jdXJyZW50QmF0Y2hTaXplKytdPWF9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuZmx1c2g9ZnVuY3Rpb24oKXtpZigwIT09dGhpcy5jdXJyZW50QmF0Y2hTaXplKXt2YXIgYSxjPXRoaXMuZ2w7aWYodGhpcy5kaXJ0eSl7dGhpcy5kaXJ0eT0hMSxjLmFjdGl2ZVRleHR1cmUoYy5URVhUVVJFMCksYy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLHRoaXMudmVydGV4QnVmZmVyKSxjLmJpbmRCdWZmZXIoYy5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmluZGV4QnVmZmVyKSxhPXRoaXMuZGVmYXVsdFNoYWRlci5zaGFkZXJzW2MuaWRdO3ZhciBkPTQqdGhpcy52ZXJ0U2l6ZTtjLnZlcnRleEF0dHJpYlBvaW50ZXIoYS5hVmVydGV4UG9zaXRpb24sMixjLkZMT0FULCExLGQsMCksYy52ZXJ0ZXhBdHRyaWJQb2ludGVyKGEuYVRleHR1cmVDb29yZCwyLGMuRkxPQVQsITEsZCw4KSxjLnZlcnRleEF0dHJpYlBvaW50ZXIoYS5jb2xvckF0dHJpYnV0ZSw0LGMuVU5TSUdORURfQllURSwhMCxkLDE2KX1pZih0aGlzLmN1cnJlbnRCYXRjaFNpemU+LjUqdGhpcy5zaXplKWMuYnVmZmVyU3ViRGF0YShjLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGljZXMpO2Vsc2V7dmFyIGU9dGhpcy5wb3NpdGlvbnMuc3ViYXJyYXkoMCw0KnRoaXMuY3VycmVudEJhdGNoU2l6ZSp0aGlzLnZlcnRTaXplKTtjLmJ1ZmZlclN1YkRhdGEoYy5BUlJBWV9CVUZGRVIsMCxlKX1mb3IodmFyIGYsZyxoLGksaj0wLGs9MCxsPW51bGwsbT10aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5jdXJyZW50QmxlbmRNb2RlLG49bnVsbCxvPSExLHA9ITEscT0wLHI9dGhpcy5jdXJyZW50QmF0Y2hTaXplO3I+cTtxKyspe2lmKGk9dGhpcy5zcHJpdGVzW3FdLGY9aS50ZXh0dXJlLmJhc2VUZXh0dXJlLGc9aS5ibGVuZE1vZGUsaD1pLnNoYWRlcnx8dGhpcy5kZWZhdWx0U2hhZGVyLG89bSE9PWcscD1uIT09aCwobCE9PWZ8fG98fHApJiYodGhpcy5yZW5kZXJCYXRjaChsLGosayksaz1xLGo9MCxsPWYsbyYmKG09Zyx0aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5zZXRCbGVuZE1vZGUobSkpLHApKXtuPWgsYT1uLnNoYWRlcnNbYy5pZF0sYXx8KGE9bmV3IGIuUGl4aVNoYWRlcihjKSxhLmZyYWdtZW50U3JjPW4uZnJhZ21lbnRTcmMsYS51bmlmb3Jtcz1uLnVuaWZvcm1zLGEuaW5pdCgpLG4uc2hhZGVyc1tjLmlkXT1hKSx0aGlzLnJlbmRlclNlc3Npb24uc2hhZGVyTWFuYWdlci5zZXRTaGFkZXIoYSksYS5kaXJ0eSYmYS5zeW5jVW5pZm9ybXMoKTt2YXIgcz10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbjtjLnVuaWZvcm0yZihhLnByb2plY3Rpb25WZWN0b3Iscy54LHMueSk7dmFyIHQ9dGhpcy5yZW5kZXJTZXNzaW9uLm9mZnNldDtjLnVuaWZvcm0yZihhLm9mZnNldFZlY3Rvcix0LngsdC55KX1qKyt9dGhpcy5yZW5kZXJCYXRjaChsLGosayksdGhpcy5jdXJyZW50QmF0Y2hTaXplPTB9fSxiLldlYkdMU3ByaXRlQmF0Y2gucHJvdG90eXBlLnJlbmRlckJhdGNoPWZ1bmN0aW9uKGEsYixjKXtpZigwIT09Yil7dmFyIGQ9dGhpcy5nbDthLl9kaXJ0eVtkLmlkXT90aGlzLnJlbmRlclNlc3Npb24ucmVuZGVyZXIudXBkYXRlVGV4dHVyZShhKTpkLmJpbmRUZXh0dXJlKGQuVEVYVFVSRV8yRCxhLl9nbFRleHR1cmVzW2QuaWRdKSxkLmRyYXdFbGVtZW50cyhkLlRSSUFOR0xFUyw2KmIsZC5VTlNJR05FRF9TSE9SVCw2KmMqMiksdGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudCsrfX0sYi5XZWJHTFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5mbHVzaCgpLHRoaXMuZGlydHk9ITB9LGIuV2ViR0xTcHJpdGVCYXRjaC5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmRpcnR5PSEwfSxiLldlYkdMU3ByaXRlQmF0Y2gucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt0aGlzLnZlcnRpY2VzPW51bGwsdGhpcy5pbmRpY2VzPW51bGwsdGhpcy5nbC5kZWxldGVCdWZmZXIodGhpcy52ZXJ0ZXhCdWZmZXIpLHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuaW5kZXhCdWZmZXIpLHRoaXMuY3VycmVudEJhc2VUZXh0dXJlPW51bGwsdGhpcy5nbD1udWxsfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoPWZ1bmN0aW9uKGEpe3RoaXMudmVydFNpemU9MTAsdGhpcy5tYXhTaXplPTZlMyx0aGlzLnNpemU9dGhpcy5tYXhTaXplO3ZhciBjPTQqdGhpcy5zaXplKnRoaXMudmVydFNpemUsZD02KnRoaXMubWF4U2l6ZTt0aGlzLnZlcnRpY2VzPW5ldyBiLkZsb2F0MzJBcnJheShjKSx0aGlzLmluZGljZXM9bmV3IGIuVWludDE2QXJyYXkoZCksdGhpcy52ZXJ0ZXhCdWZmZXI9bnVsbCx0aGlzLmluZGV4QnVmZmVyPW51bGwsdGhpcy5sYXN0SW5kZXhDb3VudD0wO2Zvcih2YXIgZT0wLGY9MDtkPmU7ZSs9NixmKz00KXRoaXMuaW5kaWNlc1tlKzBdPWYrMCx0aGlzLmluZGljZXNbZSsxXT1mKzEsdGhpcy5pbmRpY2VzW2UrMl09ZisyLHRoaXMuaW5kaWNlc1tlKzNdPWYrMCx0aGlzLmluZGljZXNbZSs0XT1mKzIsdGhpcy5pbmRpY2VzW2UrNV09ZiszO3RoaXMuZHJhd2luZz0hMSx0aGlzLmN1cnJlbnRCYXRjaFNpemU9MCx0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1udWxsLHRoaXMuY3VycmVudEJsZW5kTW9kZT0wLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsLHRoaXMuc2hhZGVyPW51bGwsdGhpcy5tYXRyaXg9bnVsbCx0aGlzLnNldENvbnRleHQoYSl9LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gsYi5XZWJHTEZhc3RTcHJpdGVCYXRjaC5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy52ZXJ0ZXhCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRpY2VzLGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGljZXMsYS5EWU5BTUlDX0RSQVcpfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhLGIpe3RoaXMucmVuZGVyU2Vzc2lvbj1iLHRoaXMuc2hhZGVyPXRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLmZhc3RTaGFkZXIsdGhpcy5tYXRyaXg9YS53b3JsZFRyYW5zZm9ybS50b0FycmF5KCEwKSx0aGlzLnN0YXJ0KCl9LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmVuZD1mdW5jdGlvbigpe3RoaXMuZmx1c2goKX0sYi5XZWJHTEZhc3RTcHJpdGVCYXRjaC5wcm90b3R5cGUucmVuZGVyPWZ1bmN0aW9uKGEpe3ZhciBiPWEuY2hpbGRyZW4sYz1iWzBdO2lmKGMudGV4dHVyZS5fdXZzKXt0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZT1jLnRleHR1cmUuYmFzZVRleHR1cmUsYy5ibGVuZE1vZGUhPT10aGlzLnJlbmRlclNlc3Npb24uYmxlbmRNb2RlTWFuYWdlci5jdXJyZW50QmxlbmRNb2RlJiYodGhpcy5mbHVzaCgpLHRoaXMucmVuZGVyU2Vzc2lvbi5ibGVuZE1vZGVNYW5hZ2VyLnNldEJsZW5kTW9kZShjLmJsZW5kTW9kZSkpO2Zvcih2YXIgZD0wLGU9Yi5sZW5ndGg7ZT5kO2QrKyl0aGlzLnJlbmRlclNwcml0ZShiW2RdKTt0aGlzLmZsdXNoKCl9fSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5yZW5kZXJTcHJpdGU9ZnVuY3Rpb24oYSl7aWYoYS52aXNpYmxlJiYoYS50ZXh0dXJlLmJhc2VUZXh0dXJlPT09dGhpcy5jdXJyZW50QmFzZVRleHR1cmV8fCh0aGlzLmZsdXNoKCksdGhpcy5jdXJyZW50QmFzZVRleHR1cmU9YS50ZXh0dXJlLmJhc2VUZXh0dXJlLGEudGV4dHVyZS5fdXZzKSkpe3ZhciBiLGMsZCxlLGYsZyxoLGksaj10aGlzLnZlcnRpY2VzO2lmKGI9YS50ZXh0dXJlLl91dnMsYz1hLnRleHR1cmUuZnJhbWUud2lkdGgsZD1hLnRleHR1cmUuZnJhbWUuaGVpZ2h0LGEudGV4dHVyZS50cmltKXt2YXIgaz1hLnRleHR1cmUudHJpbTtmPWsueC1hLmFuY2hvci54Kmsud2lkdGgsZT1mK2EudGV4dHVyZS5jcm9wLndpZHRoLGg9ay55LWEuYW5jaG9yLnkqay5oZWlnaHQsZz1oK2EudGV4dHVyZS5jcm9wLmhlaWdodH1lbHNlIGU9YS50ZXh0dXJlLmZyYW1lLndpZHRoKigxLWEuYW5jaG9yLngpLGY9YS50ZXh0dXJlLmZyYW1lLndpZHRoKi1hLmFuY2hvci54LGc9YS50ZXh0dXJlLmZyYW1lLmhlaWdodCooMS1hLmFuY2hvci55KSxoPWEudGV4dHVyZS5mcmFtZS5oZWlnaHQqLWEuYW5jaG9yLnk7aT00KnRoaXMuY3VycmVudEJhdGNoU2l6ZSp0aGlzLnZlcnRTaXplLGpbaSsrXT1mLGpbaSsrXT1oLGpbaSsrXT1hLnBvc2l0aW9uLngsaltpKytdPWEucG9zaXRpb24ueSxqW2krK109YS5zY2FsZS54LGpbaSsrXT1hLnNjYWxlLnksaltpKytdPWEucm90YXRpb24saltpKytdPWIueDAsaltpKytdPWIueTEsaltpKytdPWEuYWxwaGEsaltpKytdPWUsaltpKytdPWgsaltpKytdPWEucG9zaXRpb24ueCxqW2krK109YS5wb3NpdGlvbi55LGpbaSsrXT1hLnNjYWxlLngsaltpKytdPWEuc2NhbGUueSxqW2krK109YS5yb3RhdGlvbixqW2krK109Yi54MSxqW2krK109Yi55MSxqW2krK109YS5hbHBoYSxqW2krK109ZSxqW2krK109ZyxqW2krK109YS5wb3NpdGlvbi54LGpbaSsrXT1hLnBvc2l0aW9uLnksaltpKytdPWEuc2NhbGUueCxqW2krK109YS5zY2FsZS55LGpbaSsrXT1hLnJvdGF0aW9uLGpbaSsrXT1iLngyLGpbaSsrXT1iLnkyLGpbaSsrXT1hLmFscGhhLGpbaSsrXT1mLGpbaSsrXT1nLGpbaSsrXT1hLnBvc2l0aW9uLngsaltpKytdPWEucG9zaXRpb24ueSxqW2krK109YS5zY2FsZS54LGpbaSsrXT1hLnNjYWxlLnksaltpKytdPWEucm90YXRpb24saltpKytdPWIueDMsaltpKytdPWIueTMsaltpKytdPWEuYWxwaGEsdGhpcy5jdXJyZW50QmF0Y2hTaXplKyssdGhpcy5jdXJyZW50QmF0Y2hTaXplPj10aGlzLnNpemUmJnRoaXMuZmx1c2goKX19LGIuV2ViR0xGYXN0U3ByaXRlQmF0Y2gucHJvdG90eXBlLmZsdXNoPWZ1bmN0aW9uKCl7aWYoMCE9PXRoaXMuY3VycmVudEJhdGNoU2l6ZSl7dmFyIGE9dGhpcy5nbDtpZih0aGlzLmN1cnJlbnRCYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1thLmlkXXx8dGhpcy5yZW5kZXJTZXNzaW9uLnJlbmRlcmVyLnVwZGF0ZVRleHR1cmUodGhpcy5jdXJyZW50QmFzZVRleHR1cmUsYSksYS5iaW5kVGV4dHVyZShhLlRFWFRVUkVfMkQsdGhpcy5jdXJyZW50QmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbYS5pZF0pLHRoaXMuY3VycmVudEJhdGNoU2l6ZT4uNSp0aGlzLnNpemUpYS5idWZmZXJTdWJEYXRhKGEuQVJSQVlfQlVGRkVSLDAsdGhpcy52ZXJ0aWNlcyk7ZWxzZXt2YXIgYj10aGlzLnZlcnRpY2VzLnN1YmFycmF5KDAsNCp0aGlzLmN1cnJlbnRCYXRjaFNpemUqdGhpcy52ZXJ0U2l6ZSk7YS5idWZmZXJTdWJEYXRhKGEuQVJSQVlfQlVGRkVSLDAsYil9YS5kcmF3RWxlbWVudHMoYS5UUklBTkdMRVMsNip0aGlzLmN1cnJlbnRCYXRjaFNpemUsYS5VTlNJR05FRF9TSE9SVCwwKSx0aGlzLmN1cnJlbnRCYXRjaFNpemU9MCx0aGlzLnJlbmRlclNlc3Npb24uZHJhd0NvdW50Kyt9fSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5mbHVzaCgpfSxiLldlYkdMRmFzdFNwcml0ZUJhdGNoLnByb3RvdHlwZS5zdGFydD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2w7YS5hY3RpdmVUZXh0dXJlKGEuVEVYVFVSRTApLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5iaW5kQnVmZmVyKGEuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5pbmRleEJ1ZmZlcik7dmFyIGI9dGhpcy5yZW5kZXJTZXNzaW9uLnByb2plY3Rpb247YS51bmlmb3JtMmYodGhpcy5zaGFkZXIucHJvamVjdGlvblZlY3RvcixiLngsYi55KSxhLnVuaWZvcm1NYXRyaXgzZnYodGhpcy5zaGFkZXIudU1hdHJpeCwhMSx0aGlzLm1hdHJpeCk7dmFyIGM9NCp0aGlzLnZlcnRTaXplO2EudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hVmVydGV4UG9zaXRpb24sMixhLkZMT0FULCExLGMsMCksYS52ZXJ0ZXhBdHRyaWJQb2ludGVyKHRoaXMuc2hhZGVyLmFQb3NpdGlvbkNvb3JkLDIsYS5GTE9BVCwhMSxjLDgpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hU2NhbGUsMixhLkZMT0FULCExLGMsMTYpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hUm90YXRpb24sMSxhLkZMT0FULCExLGMsMjQpLGEudmVydGV4QXR0cmliUG9pbnRlcih0aGlzLnNoYWRlci5hVGV4dHVyZUNvb3JkLDIsYS5GTE9BVCwhMSxjLDI4KSxhLnZlcnRleEF0dHJpYlBvaW50ZXIodGhpcy5zaGFkZXIuY29sb3JBdHRyaWJ1dGUsMSxhLkZMT0FULCExLGMsMzYpfSxiLldlYkdMRmlsdGVyTWFuYWdlcj1mdW5jdGlvbigpe3RoaXMuZmlsdGVyU3RhY2s9W10sdGhpcy5vZmZzZXRYPTAsdGhpcy5vZmZzZXRZPTB9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLldlYkdMRmlsdGVyTWFuYWdlcixiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuc2V0Q29udGV4dD1mdW5jdGlvbihhKXt0aGlzLmdsPWEsdGhpcy50ZXh0dXJlUG9vbD1bXSx0aGlzLmluaXRTaGFkZXJCdWZmZXJzKCl9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5iZWdpbj1mdW5jdGlvbihhLGIpe3RoaXMucmVuZGVyU2Vzc2lvbj1hLHRoaXMuZGVmYXVsdFNoYWRlcj1hLnNoYWRlck1hbmFnZXIuZGVmYXVsdFNoYWRlcjt2YXIgYz10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbjt0aGlzLndpZHRoPTIqYy54LHRoaXMuaGVpZ2h0PTIqLWMueSx0aGlzLmJ1ZmZlcj1ifSxiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUucHVzaEZpbHRlcj1mdW5jdGlvbihhKXt2YXIgYz10aGlzLmdsLGQ9dGhpcy5yZW5kZXJTZXNzaW9uLnByb2plY3Rpb24sZT10aGlzLnJlbmRlclNlc3Npb24ub2Zmc2V0O2EuX2ZpbHRlckFyZWE9YS50YXJnZXQuZmlsdGVyQXJlYXx8YS50YXJnZXQuZ2V0Qm91bmRzKCksdGhpcy5maWx0ZXJTdGFjay5wdXNoKGEpO3ZhciBmPWEuZmlsdGVyUGFzc2VzWzBdO3RoaXMub2Zmc2V0WCs9YS5fZmlsdGVyQXJlYS54LHRoaXMub2Zmc2V0WSs9YS5fZmlsdGVyQXJlYS55O3ZhciBnPXRoaXMudGV4dHVyZVBvb2wucG9wKCk7Zz9nLnJlc2l6ZSh0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KTpnPW5ldyBiLkZpbHRlclRleHR1cmUodGhpcy5nbCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSxjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCxnLnRleHR1cmUpO3ZhciBoPWEuX2ZpbHRlckFyZWEsaT1mLnBhZGRpbmc7aC54LT1pLGgueS09aSxoLndpZHRoKz0yKmksaC5oZWlnaHQrPTIqaSxoLng8MCYmKGgueD0wKSxoLndpZHRoPnRoaXMud2lkdGgmJihoLndpZHRoPXRoaXMud2lkdGgpLGgueTwwJiYoaC55PTApLGguaGVpZ2h0PnRoaXMuaGVpZ2h0JiYoaC5oZWlnaHQ9dGhpcy5oZWlnaHQpLGMuYmluZEZyYW1lYnVmZmVyKGMuRlJBTUVCVUZGRVIsZy5mcmFtZUJ1ZmZlciksYy52aWV3cG9ydCgwLDAsaC53aWR0aCxoLmhlaWdodCksZC54PWgud2lkdGgvMixkLnk9LWguaGVpZ2h0LzIsZS54PS1oLngsZS55PS1oLnksYy5jb2xvck1hc2soITAsITAsITAsITApLGMuY2xlYXJDb2xvcigwLDAsMCwwKSxjLmNsZWFyKGMuQ09MT1JfQlVGRkVSX0JJVCksYS5fZ2xGaWx0ZXJUZXh0dXJlPWd9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5wb3BGaWx0ZXI9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsLGM9dGhpcy5maWx0ZXJTdGFjay5wb3AoKSxkPWMuX2ZpbHRlckFyZWEsZT1jLl9nbEZpbHRlclRleHR1cmUsZj10aGlzLnJlbmRlclNlc3Npb24ucHJvamVjdGlvbixnPXRoaXMucmVuZGVyU2Vzc2lvbi5vZmZzZXQ7aWYoYy5maWx0ZXJQYXNzZXMubGVuZ3RoPjEpe2Eudmlld3BvcnQoMCwwLGQud2lkdGgsZC5oZWlnaHQpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksdGhpcy52ZXJ0ZXhBcnJheVswXT0wLHRoaXMudmVydGV4QXJyYXlbMV09ZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVsyXT1kLndpZHRoLHRoaXMudmVydGV4QXJyYXlbM109ZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVs0XT0wLHRoaXMudmVydGV4QXJyYXlbNV09MCx0aGlzLnZlcnRleEFycmF5WzZdPWQud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVs3XT0wLGEuYnVmZmVyU3ViRGF0YShhLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGV4QXJyYXkpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSx0aGlzLnV2QXJyYXlbMl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs1XT1kLmhlaWdodC90aGlzLmhlaWdodCx0aGlzLnV2QXJyYXlbNl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs3XT1kLmhlaWdodC90aGlzLmhlaWdodCxhLmJ1ZmZlclN1YkRhdGEoYS5BUlJBWV9CVUZGRVIsMCx0aGlzLnV2QXJyYXkpO3ZhciBoPWUsaT10aGlzLnRleHR1cmVQb29sLnBvcCgpO2l8fChpPW5ldyBiLkZpbHRlclRleHR1cmUodGhpcy5nbCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSksaS5yZXNpemUodGhpcy53aWR0aCx0aGlzLmhlaWdodCksYS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUixpLmZyYW1lQnVmZmVyKSxhLmNsZWFyKGEuQ09MT1JfQlVGRkVSX0JJVCksYS5kaXNhYmxlKGEuQkxFTkQpO2Zvcih2YXIgaj0wO2o8Yy5maWx0ZXJQYXNzZXMubGVuZ3RoLTE7aisrKXt2YXIgaz1jLmZpbHRlclBhc3Nlc1tqXTthLmJpbmRGcmFtZWJ1ZmZlcihhLkZSQU1FQlVGRkVSLGkuZnJhbWVCdWZmZXIpLGEuYWN0aXZlVGV4dHVyZShhLlRFWFRVUkUwKSxhLmJpbmRUZXh0dXJlKGEuVEVYVFVSRV8yRCxoLnRleHR1cmUpLHRoaXMuYXBwbHlGaWx0ZXJQYXNzKGssZCxkLndpZHRoLGQuaGVpZ2h0KTt2YXIgbD1oO2g9aSxpPWx9YS5lbmFibGUoYS5CTEVORCksZT1oLHRoaXMudGV4dHVyZVBvb2wucHVzaChpKX12YXIgbT1jLmZpbHRlclBhc3Nlc1tjLmZpbHRlclBhc3Nlcy5sZW5ndGgtMV07dGhpcy5vZmZzZXRYLT1kLngsdGhpcy5vZmZzZXRZLT1kLnk7dmFyIG49dGhpcy53aWR0aCxvPXRoaXMuaGVpZ2h0LHA9MCxxPTAscj10aGlzLmJ1ZmZlcjtpZigwPT09dGhpcy5maWx0ZXJTdGFjay5sZW5ndGgpYS5jb2xvck1hc2soITAsITAsITAsITApO2Vsc2V7dmFyIHM9dGhpcy5maWx0ZXJTdGFja1t0aGlzLmZpbHRlclN0YWNrLmxlbmd0aC0xXTtkPXMuX2ZpbHRlckFyZWEsbj1kLndpZHRoLG89ZC5oZWlnaHQscD1kLngscT1kLnkscj1zLl9nbEZpbHRlclRleHR1cmUuZnJhbWVCdWZmZXJ9Zi54PW4vMixmLnk9LW8vMixnLng9cCxnLnk9cSxkPWMuX2ZpbHRlckFyZWE7dmFyIHQ9ZC54LXAsdT1kLnktcTthLmJpbmRCdWZmZXIoYS5BUlJBWV9CVUZGRVIsdGhpcy52ZXJ0ZXhCdWZmZXIpLHRoaXMudmVydGV4QXJyYXlbMF09dCx0aGlzLnZlcnRleEFycmF5WzFdPXUrZC5oZWlnaHQsdGhpcy52ZXJ0ZXhBcnJheVsyXT10K2Qud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVszXT11K2QuaGVpZ2h0LHRoaXMudmVydGV4QXJyYXlbNF09dCx0aGlzLnZlcnRleEFycmF5WzVdPXUsdGhpcy52ZXJ0ZXhBcnJheVs2XT10K2Qud2lkdGgsdGhpcy52ZXJ0ZXhBcnJheVs3XT11LGEuYnVmZmVyU3ViRGF0YShhLkFSUkFZX0JVRkZFUiwwLHRoaXMudmVydGV4QXJyYXkpLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSx0aGlzLnV2QXJyYXlbMl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs1XT1kLmhlaWdodC90aGlzLmhlaWdodCx0aGlzLnV2QXJyYXlbNl09ZC53aWR0aC90aGlzLndpZHRoLHRoaXMudXZBcnJheVs3XT1kLmhlaWdodC90aGlzLmhlaWdodCxhLmJ1ZmZlclN1YkRhdGEoYS5BUlJBWV9CVUZGRVIsMCx0aGlzLnV2QXJyYXkpLGEudmlld3BvcnQoMCwwLG4sbyksYS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUixyKSxhLmFjdGl2ZVRleHR1cmUoYS5URVhUVVJFMCksYS5iaW5kVGV4dHVyZShhLlRFWFRVUkVfMkQsZS50ZXh0dXJlKSx0aGlzLmFwcGx5RmlsdGVyUGFzcyhtLGQsbixvKSx0aGlzLnRleHR1cmVQb29sLnB1c2goZSksYy5fZ2xGaWx0ZXJUZXh0dXJlPW51bGx9LGIuV2ViR0xGaWx0ZXJNYW5hZ2VyLnByb3RvdHlwZS5hcHBseUZpbHRlclBhc3M9ZnVuY3Rpb24oYSxjLGQsZSl7dmFyIGY9dGhpcy5nbCxnPWEuc2hhZGVyc1tmLmlkXTtnfHwoZz1uZXcgYi5QaXhpU2hhZGVyKGYpLGcuZnJhZ21lbnRTcmM9YS5mcmFnbWVudFNyYyxnLnVuaWZvcm1zPWEudW5pZm9ybXMsZy5pbml0KCksYS5zaGFkZXJzW2YuaWRdPWcpLHRoaXMucmVuZGVyU2Vzc2lvbi5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihnKSxmLnVuaWZvcm0yZihnLnByb2plY3Rpb25WZWN0b3IsZC8yLC1lLzIpLGYudW5pZm9ybTJmKGcub2Zmc2V0VmVjdG9yLDAsMCksYS51bmlmb3Jtcy5kaW1lbnNpb25zJiYoYS51bmlmb3Jtcy5kaW1lbnNpb25zLnZhbHVlWzBdPXRoaXMud2lkdGgsYS51bmlmb3Jtcy5kaW1lbnNpb25zLnZhbHVlWzFdPXRoaXMuaGVpZ2h0LGEudW5pZm9ybXMuZGltZW5zaW9ucy52YWx1ZVsyXT10aGlzLnZlcnRleEFycmF5WzBdLGEudW5pZm9ybXMuZGltZW5zaW9ucy52YWx1ZVszXT10aGlzLnZlcnRleEFycmF5WzVdKSxnLnN5bmNVbmlmb3JtcygpLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksZi52ZXJ0ZXhBdHRyaWJQb2ludGVyKGcuYVZlcnRleFBvc2l0aW9uLDIsZi5GTE9BVCwhMSwwLDApLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLnV2QnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZy5hVGV4dHVyZUNvb3JkLDIsZi5GTE9BVCwhMSwwLDApLGYuYmluZEJ1ZmZlcihmLkFSUkFZX0JVRkZFUix0aGlzLmNvbG9yQnVmZmVyKSxmLnZlcnRleEF0dHJpYlBvaW50ZXIoZy5jb2xvckF0dHJpYnV0ZSwyLGYuRkxPQVQsITEsMCwwKSxmLmJpbmRCdWZmZXIoZi5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmluZGV4QnVmZmVyKSxmLmRyYXdFbGVtZW50cyhmLlRSSUFOR0xFUyw2LGYuVU5TSUdORURfU0hPUlQsMCksdGhpcy5yZW5kZXJTZXNzaW9uLmRyYXdDb3VudCsrfSxiLldlYkdMRmlsdGVyTWFuYWdlci5wcm90b3R5cGUuaW5pdFNoYWRlckJ1ZmZlcnM9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO3RoaXMudmVydGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksdGhpcy51dkJ1ZmZlcj1hLmNyZWF0ZUJ1ZmZlcigpLHRoaXMuY29sb3JCdWZmZXI9YS5jcmVhdGVCdWZmZXIoKSx0aGlzLmluZGV4QnVmZmVyPWEuY3JlYXRlQnVmZmVyKCksdGhpcy52ZXJ0ZXhBcnJheT1uZXcgYi5GbG9hdDMyQXJyYXkoWzAsMCwxLDAsMCwxLDEsMV0pLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLnZlcnRleEJ1ZmZlciksYS5idWZmZXJEYXRhKGEuQVJSQVlfQlVGRkVSLHRoaXMudmVydGV4QXJyYXksYS5TVEFUSUNfRFJBVyksdGhpcy51dkFycmF5PW5ldyBiLkZsb2F0MzJBcnJheShbMCwwLDEsMCwwLDEsMSwxXSksYS5iaW5kQnVmZmVyKGEuQVJSQVlfQlVGRkVSLHRoaXMudXZCdWZmZXIpLGEuYnVmZmVyRGF0YShhLkFSUkFZX0JVRkZFUix0aGlzLnV2QXJyYXksYS5TVEFUSUNfRFJBVyksdGhpcy5jb2xvckFycmF5PW5ldyBiLkZsb2F0MzJBcnJheShbMSwxNjc3NzIxNSwxLDE2Nzc3MjE1LDEsMTY3NzcyMTUsMSwxNjc3NzIxNV0pLGEuYmluZEJ1ZmZlcihhLkFSUkFZX0JVRkZFUix0aGlzLmNvbG9yQnVmZmVyKSxhLmJ1ZmZlckRhdGEoYS5BUlJBWV9CVUZGRVIsdGhpcy5jb2xvckFycmF5LGEuU1RBVElDX0RSQVcpLGEuYmluZEJ1ZmZlcihhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kZXhCdWZmZXIpLGEuYnVmZmVyRGF0YShhLkVMRU1FTlRfQVJSQVlfQlVGRkVSLG5ldyBVaW50MTZBcnJheShbMCwxLDIsMSwzLDJdKSxhLlNUQVRJQ19EUkFXKX0sYi5XZWJHTEZpbHRlck1hbmFnZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO3RoaXMuZmlsdGVyU3RhY2s9bnVsbCx0aGlzLm9mZnNldFg9MCx0aGlzLm9mZnNldFk9MDtmb3IodmFyIGI9MDtiPHRoaXMudGV4dHVyZVBvb2wubGVuZ3RoO2IrKyl0aGlzLnRleHR1cmVQb29sW2JdLmRlc3Ryb3koKTt0aGlzLnRleHR1cmVQb29sPW51bGwsYS5kZWxldGVCdWZmZXIodGhpcy52ZXJ0ZXhCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMudXZCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMuY29sb3JCdWZmZXIpLGEuZGVsZXRlQnVmZmVyKHRoaXMuaW5kZXhCdWZmZXIpfSxiLkZpbHRlclRleHR1cmU9ZnVuY3Rpb24oYSxjLGQsZSl7dGhpcy5nbD1hLHRoaXMuZnJhbWVCdWZmZXI9YS5jcmVhdGVGcmFtZWJ1ZmZlcigpLHRoaXMudGV4dHVyZT1hLmNyZWF0ZVRleHR1cmUoKSxlPWV8fGIuc2NhbGVNb2Rlcy5ERUZBVUxULGEuYmluZFRleHR1cmUoYS5URVhUVVJFXzJELHRoaXMudGV4dHVyZSksYS50ZXhQYXJhbWV0ZXJpKGEuVEVYVFVSRV8yRCxhLlRFWFRVUkVfTUFHX0ZJTFRFUixlPT09Yi5zY2FsZU1vZGVzLkxJTkVBUj9hLkxJTkVBUjphLk5FQVJFU1QpLGEudGV4UGFyYW1ldGVyaShhLlRFWFRVUkVfMkQsYS5URVhUVVJFX01JTl9GSUxURVIsZT09PWIuc2NhbGVNb2Rlcy5MSU5FQVI/YS5MSU5FQVI6YS5ORUFSRVNUKSxhLnRleFBhcmFtZXRlcmkoYS5URVhUVVJFXzJELGEuVEVYVFVSRV9XUkFQX1MsYS5DTEFNUF9UT19FREdFKSxhLnRleFBhcmFtZXRlcmkoYS5URVhUVVJFXzJELGEuVEVYVFVSRV9XUkFQX1QsYS5DTEFNUF9UT19FREdFKSxhLmJpbmRGcmFtZWJ1ZmZlcihhLkZSQU1FQlVGRkVSLHRoaXMuZnJhbWVCdWZmZXIpLGEuYmluZEZyYW1lYnVmZmVyKGEuRlJBTUVCVUZGRVIsdGhpcy5mcmFtZUJ1ZmZlciksYS5mcmFtZWJ1ZmZlclRleHR1cmUyRChhLkZSQU1FQlVGRkVSLGEuQ09MT1JfQVRUQUNITUVOVDAsYS5URVhUVVJFXzJELHRoaXMudGV4dHVyZSwwKSx0aGlzLnJlbmRlckJ1ZmZlcj1hLmNyZWF0ZVJlbmRlcmJ1ZmZlcigpLGEuYmluZFJlbmRlcmJ1ZmZlcihhLlJFTkRFUkJVRkZFUix0aGlzLnJlbmRlckJ1ZmZlciksYS5mcmFtZWJ1ZmZlclJlbmRlcmJ1ZmZlcihhLkZSQU1FQlVGRkVSLGEuREVQVEhfU1RFTkNJTF9BVFRBQ0hNRU5ULGEuUkVOREVSQlVGRkVSLHRoaXMucmVuZGVyQnVmZmVyKSx0aGlzLnJlc2l6ZShjLGQpXG59LGIuRmlsdGVyVGV4dHVyZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5GaWx0ZXJUZXh0dXJlLGIuRmlsdGVyVGV4dHVyZS5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmdsO2EuY2xlYXJDb2xvcigwLDAsMCwwKSxhLmNsZWFyKGEuQ09MT1JfQlVGRkVSX0JJVCl9LGIuRmlsdGVyVGV4dHVyZS5wcm90b3R5cGUucmVzaXplPWZ1bmN0aW9uKGEsYil7aWYodGhpcy53aWR0aCE9PWF8fHRoaXMuaGVpZ2h0IT09Yil7dGhpcy53aWR0aD1hLHRoaXMuaGVpZ2h0PWI7dmFyIGM9dGhpcy5nbDtjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCx0aGlzLnRleHR1cmUpLGMudGV4SW1hZ2UyRChjLlRFWFRVUkVfMkQsMCxjLlJHQkEsYSxiLDAsYy5SR0JBLGMuVU5TSUdORURfQllURSxudWxsKSxjLmJpbmRSZW5kZXJidWZmZXIoYy5SRU5ERVJCVUZGRVIsdGhpcy5yZW5kZXJCdWZmZXIpLGMucmVuZGVyYnVmZmVyU3RvcmFnZShjLlJFTkRFUkJVRkZFUixjLkRFUFRIX1NURU5DSUwsYSxiKX19LGIuRmlsdGVyVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3ZhciBhPXRoaXMuZ2w7YS5kZWxldGVGcmFtZWJ1ZmZlcih0aGlzLmZyYW1lQnVmZmVyKSxhLmRlbGV0ZVRleHR1cmUodGhpcy50ZXh0dXJlKSx0aGlzLmZyYW1lQnVmZmVyPW51bGwsdGhpcy50ZXh0dXJlPW51bGx9LGIuQ2FudmFzQnVmZmVyPWZ1bmN0aW9uKGEsYil7dGhpcy53aWR0aD1hLHRoaXMuaGVpZ2h0PWIsdGhpcy5jYW52YXM9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKSx0aGlzLmNvbnRleHQ9dGhpcy5jYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpLHRoaXMuY2FudmFzLndpZHRoPWEsdGhpcy5jYW52YXMuaGVpZ2h0PWJ9LGIuQ2FudmFzQnVmZmVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNhbnZhc0J1ZmZlcixiLkNhbnZhc0J1ZmZlci5wcm90b3R5cGUuY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLmNvbnRleHQuc2V0VHJhbnNmb3JtKDEsMCwwLDEsMCwwKSx0aGlzLmNvbnRleHQuY2xlYXJSZWN0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KX0sYi5DYW52YXNCdWZmZXIucHJvdG90eXBlLnJlc2l6ZT1mdW5jdGlvbihhLGIpe3RoaXMud2lkdGg9dGhpcy5jYW52YXMud2lkdGg9YSx0aGlzLmhlaWdodD10aGlzLmNhbnZhcy5oZWlnaHQ9Yn0sYi5DYW52YXNNYXNrTWFuYWdlcj1mdW5jdGlvbigpe30sYi5DYW52YXNNYXNrTWFuYWdlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5DYW52YXNNYXNrTWFuYWdlcixiLkNhbnZhc01hc2tNYW5hZ2VyLnByb3RvdHlwZS5wdXNoTWFzaz1mdW5jdGlvbihhLGMpe3ZhciBkPWMuY29udGV4dDtkLnNhdmUoKTt2YXIgZT1hLmFscGhhLGY9YS53b3JsZFRyYW5zZm9ybSxnPWMucmVzb2x1dGlvbjtkLnNldFRyYW5zZm9ybShmLmEqZyxmLmIqZyxmLmMqZyxmLmQqZyxmLnR4KmcsZi50eSpnKSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzTWFzayhhLGQpLGQuY2xpcCgpLGEud29ybGRBbHBoYT1lfSxiLkNhbnZhc01hc2tNYW5hZ2VyLnByb3RvdHlwZS5wb3BNYXNrPWZ1bmN0aW9uKGEpe2EuY29udGV4dC5yZXN0b3JlKCl9LGIuQ2FudmFzVGludGVyPWZ1bmN0aW9uKCl7fSxiLkNhbnZhc1RpbnRlci5nZXRUaW50ZWRUZXh0dXJlPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS50ZXh0dXJlO2M9Yi5DYW52YXNUaW50ZXIucm91bmRDb2xvcihjKTt2YXIgZT1cIiNcIisoXCIwMDAwMFwiKygwfGMpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KTtpZihkLnRpbnRDYWNoZT1kLnRpbnRDYWNoZXx8e30sZC50aW50Q2FjaGVbZV0pcmV0dXJuIGQudGludENhY2hlW2VdO3ZhciBmPWIuQ2FudmFzVGludGVyLmNhbnZhc3x8ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtpZihiLkNhbnZhc1RpbnRlci50aW50TWV0aG9kKGQsYyxmKSxiLkNhbnZhc1RpbnRlci5jb252ZXJ0VGludFRvSW1hZ2Upe3ZhciBnPW5ldyBJbWFnZTtnLnNyYz1mLnRvRGF0YVVSTCgpLGQudGludENhY2hlW2VdPWd9ZWxzZSBkLnRpbnRDYWNoZVtlXT1mLGIuQ2FudmFzVGludGVyLmNhbnZhcz1udWxsO3JldHVybiBmfSxiLkNhbnZhc1RpbnRlci50aW50V2l0aE11bHRpcGx5PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmdldENvbnRleHQoXCIyZFwiKSxlPWEuY3JvcDtjLndpZHRoPWUud2lkdGgsYy5oZWlnaHQ9ZS5oZWlnaHQsZC5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxiKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksZC5maWxsUmVjdCgwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJtdWx0aXBseVwiLGQuZHJhd0ltYWdlKGEuYmFzZVRleHR1cmUuc291cmNlLGUueCxlLnksZS53aWR0aCxlLmhlaWdodCwwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJkZXN0aW5hdGlvbi1hdG9wXCIsZC5kcmF3SW1hZ2UoYS5iYXNlVGV4dHVyZS5zb3VyY2UsZS54LGUueSxlLndpZHRoLGUuaGVpZ2h0LDAsMCxlLndpZHRoLGUuaGVpZ2h0KX0sYi5DYW52YXNUaW50ZXIudGludFdpdGhPdmVybGF5PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1jLmdldENvbnRleHQoXCIyZFwiKSxlPWEuY3JvcDtjLndpZHRoPWUud2lkdGgsYy5oZWlnaHQ9ZS5oZWlnaHQsZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJjb3B5XCIsZC5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxiKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksZC5maWxsUmVjdCgwLDAsZS53aWR0aCxlLmhlaWdodCksZC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249XCJkZXN0aW5hdGlvbi1hdG9wXCIsZC5kcmF3SW1hZ2UoYS5iYXNlVGV4dHVyZS5zb3VyY2UsZS54LGUueSxlLndpZHRoLGUuaGVpZ2h0LDAsMCxlLndpZHRoLGUuaGVpZ2h0KX0sYi5DYW52YXNUaW50ZXIudGludFdpdGhQZXJQaXhlbD1mdW5jdGlvbihhLGMsZCl7dmFyIGU9ZC5nZXRDb250ZXh0KFwiMmRcIiksZj1hLmNyb3A7ZC53aWR0aD1mLndpZHRoLGQuaGVpZ2h0PWYuaGVpZ2h0LGUuZ2xvYmFsQ29tcG9zaXRlT3BlcmF0aW9uPVwiY29weVwiLGUuZHJhd0ltYWdlKGEuYmFzZVRleHR1cmUuc291cmNlLGYueCxmLnksZi53aWR0aCxmLmhlaWdodCwwLDAsZi53aWR0aCxmLmhlaWdodCk7Zm9yKHZhciBnPWIuaGV4MnJnYihjKSxoPWdbMF0saT1nWzFdLGo9Z1syXSxrPWUuZ2V0SW1hZ2VEYXRhKDAsMCxmLndpZHRoLGYuaGVpZ2h0KSxsPWsuZGF0YSxtPTA7bTxsLmxlbmd0aDttKz00KWxbbSswXSo9aCxsW20rMV0qPWksbFttKzJdKj1qO2UucHV0SW1hZ2VEYXRhKGssMCwwKX0sYi5DYW52YXNUaW50ZXIucm91bmRDb2xvcj1mdW5jdGlvbihhKXt2YXIgYz1iLkNhbnZhc1RpbnRlci5jYWNoZVN0ZXBzUGVyQ29sb3JDaGFubmVsLGQ9Yi5oZXgycmdiKGEpO3JldHVybiBkWzBdPU1hdGgubWluKDI1NSxkWzBdL2MqYyksZFsxXT1NYXRoLm1pbigyNTUsZFsxXS9jKmMpLGRbMl09TWF0aC5taW4oMjU1LGRbMl0vYypjKSxiLnJnYjJoZXgoZCl9LGIuQ2FudmFzVGludGVyLmNhY2hlU3RlcHNQZXJDb2xvckNoYW5uZWw9OCxiLkNhbnZhc1RpbnRlci5jb252ZXJ0VGludFRvSW1hZ2U9ITEsYi5DYW52YXNUaW50ZXIuY2FuVXNlTXVsdGlwbHk9Yi5jYW5Vc2VOZXdDYW52YXNCbGVuZE1vZGVzKCksYi5DYW52YXNUaW50ZXIudGludE1ldGhvZD1iLkNhbnZhc1RpbnRlci5jYW5Vc2VNdWx0aXBseT9iLkNhbnZhc1RpbnRlci50aW50V2l0aE11bHRpcGx5OmIuQ2FudmFzVGludGVyLnRpbnRXaXRoUGVyUGl4ZWwsYi5DYW52YXNSZW5kZXJlcj1mdW5jdGlvbihhLGMsZCl7aWYoZClmb3IodmFyIGUgaW4gYi5kZWZhdWx0UmVuZGVyT3B0aW9ucylcInVuZGVmaW5lZFwiPT10eXBlb2YgZFtlXSYmKGRbZV09Yi5kZWZhdWx0UmVuZGVyT3B0aW9uc1tlXSk7ZWxzZSBkPWIuZGVmYXVsdFJlbmRlck9wdGlvbnM7Yi5kZWZhdWx0UmVuZGVyZXJ8fChiLnNheUhlbGxvKFwiQ2FudmFzXCIpLGIuZGVmYXVsdFJlbmRlcmVyPXRoaXMpLHRoaXMudHlwZT1iLkNBTlZBU19SRU5ERVJFUix0aGlzLnJlc29sdXRpb249ZC5yZXNvbHV0aW9uLHRoaXMuY2xlYXJCZWZvcmVSZW5kZXI9ZC5jbGVhckJlZm9yZVJlbmRlcix0aGlzLnRyYW5zcGFyZW50PWQudHJhbnNwYXJlbnQsdGhpcy5hdXRvUmVzaXplPWQuYXV0b1Jlc2l6ZXx8ITEsdGhpcy53aWR0aD1hfHw4MDAsdGhpcy5oZWlnaHQ9Y3x8NjAwLHRoaXMud2lkdGgqPXRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCo9dGhpcy5yZXNvbHV0aW9uLHRoaXMudmlldz1kLnZpZXd8fGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIiksdGhpcy5jb250ZXh0PXRoaXMudmlldy5nZXRDb250ZXh0KFwiMmRcIix7YWxwaGE6dGhpcy50cmFuc3BhcmVudH0pLHRoaXMucmVmcmVzaD0hMCx0aGlzLnZpZXcud2lkdGg9dGhpcy53aWR0aCp0aGlzLnJlc29sdXRpb24sdGhpcy52aWV3LmhlaWdodD10aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24sdGhpcy5jb3VudD0wLHRoaXMubWFza01hbmFnZXI9bmV3IGIuQ2FudmFzTWFza01hbmFnZXIsdGhpcy5yZW5kZXJTZXNzaW9uPXtjb250ZXh0OnRoaXMuY29udGV4dCxtYXNrTWFuYWdlcjp0aGlzLm1hc2tNYW5hZ2VyLHNjYWxlTW9kZTpudWxsLHNtb290aFByb3BlcnR5Om51bGwscm91bmRQaXhlbHM6ITF9LHRoaXMubWFwQmxlbmRNb2RlcygpLHRoaXMucmVzaXplKGEsYyksXCJpbWFnZVNtb290aGluZ0VuYWJsZWRcImluIHRoaXMuY29udGV4dD90aGlzLnJlbmRlclNlc3Npb24uc21vb3RoUHJvcGVydHk9XCJpbWFnZVNtb290aGluZ0VuYWJsZWRcIjpcIndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZFwiaW4gdGhpcy5jb250ZXh0P3RoaXMucmVuZGVyU2Vzc2lvbi5zbW9vdGhQcm9wZXJ0eT1cIndlYmtpdEltYWdlU21vb3RoaW5nRW5hYmxlZFwiOlwibW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkXCJpbiB0aGlzLmNvbnRleHQ/dGhpcy5yZW5kZXJTZXNzaW9uLnNtb290aFByb3BlcnR5PVwibW96SW1hZ2VTbW9vdGhpbmdFbmFibGVkXCI6XCJvSW1hZ2VTbW9vdGhpbmdFbmFibGVkXCJpbiB0aGlzLmNvbnRleHQ/dGhpcy5yZW5kZXJTZXNzaW9uLnNtb290aFByb3BlcnR5PVwib0ltYWdlU21vb3RoaW5nRW5hYmxlZFwiOlwibXNJbWFnZVNtb290aGluZ0VuYWJsZWRcImluIHRoaXMuY29udGV4dCYmKHRoaXMucmVuZGVyU2Vzc2lvbi5zbW9vdGhQcm9wZXJ0eT1cIm1zSW1hZ2VTbW9vdGhpbmdFbmFibGVkXCIpfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkNhbnZhc1JlbmRlcmVyLGIuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlcj1mdW5jdGlvbihhKXthLnVwZGF0ZVRyYW5zZm9ybSgpLHRoaXMuY29udGV4dC5zZXRUcmFuc2Zvcm0oMSwwLDAsMSwwLDApLHRoaXMuY29udGV4dC5nbG9iYWxBbHBoYT0xLHRoaXMucmVuZGVyU2Vzc2lvbi5jdXJyZW50QmxlbmRNb2RlPWIuYmxlbmRNb2Rlcy5OT1JNQUwsdGhpcy5jb250ZXh0Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj1iLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLk5PUk1BTF0sbmF2aWdhdG9yLmlzQ29jb29uSlMmJnRoaXMudmlldy5zY3JlZW5jYW52YXMmJih0aGlzLmNvbnRleHQuZmlsbFN0eWxlPVwiYmxhY2tcIix0aGlzLmNvbnRleHQuY2xlYXIoKSksdGhpcy5jbGVhckJlZm9yZVJlbmRlciYmKHRoaXMudHJhbnNwYXJlbnQ/dGhpcy5jb250ZXh0LmNsZWFyUmVjdCgwLDAsdGhpcy53aWR0aCx0aGlzLmhlaWdodCk6KHRoaXMuY29udGV4dC5maWxsU3R5bGU9YS5iYWNrZ3JvdW5kQ29sb3JTdHJpbmcsdGhpcy5jb250ZXh0LmZpbGxSZWN0KDAsMCx0aGlzLndpZHRoLHRoaXMuaGVpZ2h0KSkpLHRoaXMucmVuZGVyRGlzcGxheU9iamVjdChhKSxhLmludGVyYWN0aXZlJiYoYS5faW50ZXJhY3RpdmVFdmVudHNBZGRlZHx8KGEuX2ludGVyYWN0aXZlRXZlbnRzQWRkZWQ9ITAsYS5pbnRlcmFjdGlvbk1hbmFnZXIuc2V0VGFyZ2V0KHRoaXMpKSl9LGIuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmRlc3Ryb3k9ZnVuY3Rpb24oYSl7XCJ1bmRlZmluZWRcIj09dHlwZW9mIGEmJihhPSEwKSxhJiZ0aGlzLnZpZXcucGFyZW50JiZ0aGlzLnZpZXcucGFyZW50LnJlbW92ZUNoaWxkKHRoaXMudmlldyksdGhpcy52aWV3PW51bGwsdGhpcy5jb250ZXh0PW51bGwsdGhpcy5tYXNrTWFuYWdlcj1udWxsLHRoaXMucmVuZGVyU2Vzc2lvbj1udWxsfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZXNpemU9ZnVuY3Rpb24oYSxiKXt0aGlzLndpZHRoPWEqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0PWIqdGhpcy5yZXNvbHV0aW9uLHRoaXMudmlldy53aWR0aD10aGlzLndpZHRoLHRoaXMudmlldy5oZWlnaHQ9dGhpcy5oZWlnaHQsdGhpcy5hdXRvUmVzaXplJiYodGhpcy52aWV3LnN0eWxlLndpZHRoPXRoaXMud2lkdGgvdGhpcy5yZXNvbHV0aW9uK1wicHhcIix0aGlzLnZpZXcuc3R5bGUuaGVpZ2h0PXRoaXMuaGVpZ2h0L3RoaXMucmVzb2x1dGlvbitcInB4XCIpfSxiLkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJEaXNwbGF5T2JqZWN0PWZ1bmN0aW9uKGEsYil7dGhpcy5yZW5kZXJTZXNzaW9uLmNvbnRleHQ9Ynx8dGhpcy5jb250ZXh0LHRoaXMucmVuZGVyU2Vzc2lvbi5yZXNvbHV0aW9uPXRoaXMucmVzb2x1dGlvbixhLl9yZW5kZXJDYW52YXModGhpcy5yZW5kZXJTZXNzaW9uKX0sYi5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUubWFwQmxlbmRNb2Rlcz1mdW5jdGlvbigpe2IuYmxlbmRNb2Rlc0NhbnZhc3x8KGIuYmxlbmRNb2Rlc0NhbnZhcz1bXSxiLmNhblVzZU5ld0NhbnZhc0JsZW5kTW9kZXMoKT8oYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5OT1JNQUxdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkFERF09XCJsaWdodGVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5NVUxUSVBMWV09XCJtdWx0aXBseVwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0NSRUVOXT1cInNjcmVlblwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuT1ZFUkxBWV09XCJvdmVybGF5XCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVwiZGFya2VuXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5MSUdIVEVOXT1cImxpZ2h0ZW5cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkNPTE9SX0RPREdFXT1cImNvbG9yLWRvZGdlXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1cImNvbG9yLWJ1cm5cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhBUkRfTElHSFRdPVwiaGFyZC1saWdodFwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU09GVF9MSUdIVF09XCJzb2Z0LWxpZ2h0XCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1cImRpZmZlcmVuY2VcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkVYQ0xVU0lPTl09XCJleGNsdXNpb25cIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhVRV09XCJodWVcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLlNBVFVSQVRJT05dPVwic2F0dXJhdGlvblwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuQ09MT1JdPVwiY29sb3JcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxVTUlOT1NJVFldPVwibHVtaW5vc2l0eVwiKTooYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5OT1JNQUxdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkFERF09XCJsaWdodGVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5NVUxUSVBMWV09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0NSRUVOXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5PVkVSTEFZXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5EQVJLRU5dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxJR0hURU5dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkNPTE9SX0RPREdFXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5DT0xPUl9CVVJOXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5IQVJEX0xJR0hUXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5TT0ZUX0xJR0hUXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5ESUZGRVJFTkNFXT1cInNvdXJjZS1vdmVyXCIsYi5ibGVuZE1vZGVzQ2FudmFzW2IuYmxlbmRNb2Rlcy5FWENMVVNJT05dPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkhVRV09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuU0FUVVJBVElPTl09XCJzb3VyY2Utb3ZlclwiLGIuYmxlbmRNb2Rlc0NhbnZhc1tiLmJsZW5kTW9kZXMuQ09MT1JdPVwic291cmNlLW92ZXJcIixiLmJsZW5kTW9kZXNDYW52YXNbYi5ibGVuZE1vZGVzLkxVTUlOT1NJVFldPVwic291cmNlLW92ZXJcIikpfSxiLkNhbnZhc0dyYXBoaWNzPWZ1bmN0aW9uKCl7fSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9YS53b3JsZEFscGhhO2EuZGlydHkmJih0aGlzLnVwZGF0ZUdyYXBoaWNzVGludChhKSxhLmRpcnR5PSExKTtmb3IodmFyIGU9MDtlPGEuZ3JhcGhpY3NEYXRhLmxlbmd0aDtlKyspe3ZhciBmPWEuZ3JhcGhpY3NEYXRhW2VdLGc9Zi5zaGFwZSxoPWYuX2ZpbGxUaW50LGk9Zi5fbGluZVRpbnQ7aWYoYy5saW5lV2lkdGg9Zi5saW5lV2lkdGgsZi50eXBlPT09Yi5HcmFwaGljcy5QT0xZKXtjLmJlZ2luUGF0aCgpO3ZhciBqPWcucG9pbnRzO2MubW92ZVRvKGpbMF0salsxXSk7Zm9yKHZhciBrPTE7azxqLmxlbmd0aC8yO2srKyljLmxpbmVUbyhqWzIqa10salsyKmsrMV0pO2cuY2xvc2VkJiZjLmxpbmVUbyhqWzBdLGpbMV0pLGpbMF09PT1qW2oubGVuZ3RoLTJdJiZqWzFdPT09altqLmxlbmd0aC0xXSYmYy5jbG9zZVBhdGgoKSxmLmZpbGwmJihjLmdsb2JhbEFscGhhPWYuZmlsbEFscGhhKmQsYy5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxoKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5maWxsKCkpLGYubGluZVdpZHRoJiYoYy5nbG9iYWxBbHBoYT1mLmxpbmVBbHBoYSpkLGMuc3Ryb2tlU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxpKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5zdHJva2UoKSl9ZWxzZSBpZihmLnR5cGU9PT1iLkdyYXBoaWNzLlJFQ1QpKGYuZmlsbENvbG9yfHwwPT09Zi5maWxsQ29sb3IpJiYoYy5nbG9iYWxBbHBoYT1mLmZpbGxBbHBoYSpkLGMuZmlsbFN0eWxlPVwiI1wiKyhcIjAwMDAwXCIrKDB8aCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuZmlsbFJlY3QoZy54LGcueSxnLndpZHRoLGcuaGVpZ2h0KSksZi5saW5lV2lkdGgmJihjLmdsb2JhbEFscGhhPWYubGluZUFscGhhKmQsYy5zdHJva2VTdHlsZT1cIiNcIisoXCIwMDAwMFwiKygwfGkpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KSxjLnN0cm9rZVJlY3QoZy54LGcueSxnLndpZHRoLGcuaGVpZ2h0KSk7ZWxzZSBpZihmLnR5cGU9PT1iLkdyYXBoaWNzLkNJUkMpYy5iZWdpblBhdGgoKSxjLmFyYyhnLngsZy55LGcucmFkaXVzLDAsMipNYXRoLlBJKSxjLmNsb3NlUGF0aCgpLGYuZmlsbCYmKGMuZ2xvYmFsQWxwaGE9Zi5maWxsQWxwaGEqZCxjLmZpbGxTdHlsZT1cIiNcIisoXCIwMDAwMFwiKygwfGgpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KSxjLmZpbGwoKSksZi5saW5lV2lkdGgmJihjLmdsb2JhbEFscGhhPWYubGluZUFscGhhKmQsYy5zdHJva2VTdHlsZT1cIiNcIisoXCIwMDAwMFwiKygwfGkpLnRvU3RyaW5nKDE2KSkuc3Vic3RyKC02KSxjLnN0cm9rZSgpKTtlbHNlIGlmKGYudHlwZT09PWIuR3JhcGhpY3MuRUxJUCl7dmFyIGw9MipnLndpZHRoLG09MipnLmhlaWdodCxuPWcueC1sLzIsbz1nLnktbS8yO2MuYmVnaW5QYXRoKCk7dmFyIHA9LjU1MjI4NDgscT1sLzIqcCxyPW0vMipwLHM9bitsLHQ9byttLHU9bitsLzIsdj1vK20vMjtjLm1vdmVUbyhuLHYpLGMuYmV6aWVyQ3VydmVUbyhuLHYtcix1LXEsbyx1LG8pLGMuYmV6aWVyQ3VydmVUbyh1K3EsbyxzLHYtcixzLHYpLGMuYmV6aWVyQ3VydmVUbyhzLHYrcix1K3EsdCx1LHQpLGMuYmV6aWVyQ3VydmVUbyh1LXEsdCxuLHYrcixuLHYpLGMuY2xvc2VQYXRoKCksZi5maWxsJiYoYy5nbG9iYWxBbHBoYT1mLmZpbGxBbHBoYSpkLGMuZmlsbFN0eWxlPVwiI1wiKyhcIjAwMDAwXCIrKDB8aCkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuZmlsbCgpKSxmLmxpbmVXaWR0aCYmKGMuZ2xvYmFsQWxwaGE9Zi5saW5lQWxwaGEqZCxjLnN0cm9rZVN0eWxlPVwiI1wiKyhcIjAwMDAwXCIrKDB8aSkudG9TdHJpbmcoMTYpKS5zdWJzdHIoLTYpLGMuc3Ryb2tlKCkpfWVsc2UgaWYoZi50eXBlPT09Yi5HcmFwaGljcy5SUkVDKXt2YXIgdz1nLngseD1nLnkseT1nLndpZHRoLHo9Zy5oZWlnaHQsQT1nLnJhZGl1cyxCPU1hdGgubWluKHkseikvMnwwO0E9QT5CP0I6QSxjLmJlZ2luUGF0aCgpLGMubW92ZVRvKHcseCtBKSxjLmxpbmVUbyh3LHgrei1BKSxjLnF1YWRyYXRpY0N1cnZlVG8odyx4K3osdytBLHgreiksYy5saW5lVG8odyt5LUEseCt6KSxjLnF1YWRyYXRpY0N1cnZlVG8odyt5LHgreix3K3kseCt6LUEpLGMubGluZVRvKHcreSx4K0EpLGMucXVhZHJhdGljQ3VydmVUbyh3K3kseCx3K3ktQSx4KSxjLmxpbmVUbyh3K0EseCksYy5xdWFkcmF0aWNDdXJ2ZVRvKHcseCx3LHgrQSksYy5jbG9zZVBhdGgoKSwoZi5maWxsQ29sb3J8fDA9PT1mLmZpbGxDb2xvcikmJihjLmdsb2JhbEFscGhhPWYuZmlsbEFscGhhKmQsYy5maWxsU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxoKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5maWxsKCkpLGYubGluZVdpZHRoJiYoYy5nbG9iYWxBbHBoYT1mLmxpbmVBbHBoYSpkLGMuc3Ryb2tlU3R5bGU9XCIjXCIrKFwiMDAwMDBcIisoMHxpKS50b1N0cmluZygxNikpLnN1YnN0cigtNiksYy5zdHJva2UoKSl9fX0sYi5DYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljc01hc2s9ZnVuY3Rpb24oYSxjKXt2YXIgZD1hLmdyYXBoaWNzRGF0YS5sZW5ndGg7aWYoMCE9PWQpe2Q+MSYmKGQ9MSx3aW5kb3cuY29uc29sZS5sb2coXCJQaXhpLmpzIHdhcm5pbmc6IG1hc2tzIGluIGNhbnZhcyBjYW4gb25seSBtYXNrIHVzaW5nIHRoZSBmaXJzdCBwYXRoIGluIHRoZSBncmFwaGljcyBvYmplY3RcIikpO2Zvcih2YXIgZT0wOzE+ZTtlKyspe3ZhciBmPWEuZ3JhcGhpY3NEYXRhW2VdLGc9Zi5zaGFwZTtpZihmLnR5cGU9PT1iLkdyYXBoaWNzLlBPTFkpe2MuYmVnaW5QYXRoKCk7dmFyIGg9Zy5wb2ludHM7Yy5tb3ZlVG8oaFswXSxoWzFdKTtmb3IodmFyIGk9MTtpPGgubGVuZ3RoLzI7aSsrKWMubGluZVRvKGhbMippXSxoWzIqaSsxXSk7aFswXT09PWhbaC5sZW5ndGgtMl0mJmhbMV09PT1oW2gubGVuZ3RoLTFdJiZjLmNsb3NlUGF0aCgpfWVsc2UgaWYoZi50eXBlPT09Yi5HcmFwaGljcy5SRUNUKWMuYmVnaW5QYXRoKCksYy5yZWN0KGcueCxnLnksZy53aWR0aCxnLmhlaWdodCksYy5jbG9zZVBhdGgoKTtlbHNlIGlmKGYudHlwZT09PWIuR3JhcGhpY3MuQ0lSQyljLmJlZ2luUGF0aCgpLGMuYXJjKGcueCxnLnksZy5yYWRpdXMsMCwyKk1hdGguUEkpLGMuY2xvc2VQYXRoKCk7ZWxzZSBpZihmLnR5cGU9PT1iLkdyYXBoaWNzLkVMSVApe3ZhciBqPTIqZy53aWR0aCxrPTIqZy5oZWlnaHQsbD1nLngtai8yLG09Zy55LWsvMjtjLmJlZ2luUGF0aCgpO3ZhciBuPS41NTIyODQ4LG89ai8yKm4scD1rLzIqbixxPWwraixyPW0rayxzPWwrai8yLHQ9bStrLzI7Yy5tb3ZlVG8obCx0KSxjLmJlemllckN1cnZlVG8obCx0LXAscy1vLG0scyxtKSxjLmJlemllckN1cnZlVG8ocytvLG0scSx0LXAscSx0KSxjLmJlemllckN1cnZlVG8ocSx0K3AscytvLHIscyxyKSxjLmJlemllckN1cnZlVG8ocy1vLHIsbCx0K3AsbCx0KSxjLmNsb3NlUGF0aCgpfWVsc2UgaWYoZi50eXBlPT09Yi5HcmFwaGljcy5SUkVDKXt2YXIgdT1nLnBvaW50cyx2PXVbMF0sdz11WzFdLHg9dVsyXSx5PXVbM10sej11WzRdLEE9TWF0aC5taW4oeCx5KS8yfDA7ej16PkE/QTp6LGMuYmVnaW5QYXRoKCksYy5tb3ZlVG8odix3K3opLGMubGluZVRvKHYsdyt5LXopLGMucXVhZHJhdGljQ3VydmVUbyh2LHcreSx2K3osdyt5KSxjLmxpbmVUbyh2K3gteix3K3kpLGMucXVhZHJhdGljQ3VydmVUbyh2K3gsdyt5LHYreCx3K3kteiksYy5saW5lVG8odit4LHcreiksYy5xdWFkcmF0aWNDdXJ2ZVRvKHYreCx3LHYreC16LHcpLGMubGluZVRvKHYreix3KSxjLnF1YWRyYXRpY0N1cnZlVG8odix3LHYsdyt6KSxjLmNsb3NlUGF0aCgpfX19fSxiLkNhbnZhc0dyYXBoaWNzLnVwZGF0ZUdyYXBoaWNzVGludD1mdW5jdGlvbihhKXtpZigxNjc3NzIxNSE9PWEudGludClmb3IodmFyIGI9KGEudGludD4+MTYmMjU1KS8yNTUsYz0oYS50aW50Pj44JjI1NSkvMjU1LGQ9KDI1NSZhLnRpbnQpLzI1NSxlPTA7ZTxhLmdyYXBoaWNzRGF0YS5sZW5ndGg7ZSsrKXt2YXIgZj1hLmdyYXBoaWNzRGF0YVtlXSxnPTB8Zi5maWxsQ29sb3IsaD0wfGYubGluZUNvbG9yO2YuX2ZpbGxUaW50PSgoZz4+MTYmMjU1KS8yNTUqYioyNTU8PDE2KSsoKGc+PjgmMjU1KS8yNTUqYyoyNTU8PDgpKygyNTUmZykvMjU1KmQqMjU1LGYuX2xpbmVUaW50PSgoaD4+MTYmMjU1KS8yNTUqYioyNTU8PDE2KSsoKGg+PjgmMjU1KS8yNTUqYyoyNTU8PDgpKygyNTUmaCkvMjU1KmQqMjU1fX0sYi5HcmFwaGljcz1mdW5jdGlvbigpe2IuRGlzcGxheU9iamVjdENvbnRhaW5lci5jYWxsKHRoaXMpLHRoaXMucmVuZGVyYWJsZT0hMCx0aGlzLmZpbGxBbHBoYT0xLHRoaXMubGluZVdpZHRoPTAsdGhpcy5saW5lQ29sb3I9MCx0aGlzLmdyYXBoaWNzRGF0YT1bXSx0aGlzLnRpbnQ9MTY3NzcyMTUsdGhpcy5ibGVuZE1vZGU9Yi5ibGVuZE1vZGVzLk5PUk1BTCx0aGlzLmN1cnJlbnRQYXRoPW51bGwsdGhpcy5fd2ViR0w9W10sdGhpcy5pc01hc2s9ITEsdGhpcy5ib3VuZHNQYWRkaW5nPTAsdGhpcy5fbG9jYWxCb3VuZHM9bmV3IGIuUmVjdGFuZ2xlKDAsMCwxLDEpLHRoaXMuZGlydHk9ITAsdGhpcy53ZWJHTERpcnR5PSExLHRoaXMuY2FjaGVkU3ByaXRlRGlydHk9ITF9LGIuR3JhcGhpY3MucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSksYi5HcmFwaGljcy5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5HcmFwaGljcyxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5HcmFwaGljcy5wcm90b3R5cGUsXCJjYWNoZUFzQml0bWFwXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl9jYWNoZUFzQml0bWFwfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5fY2FjaGVBc0JpdG1hcD1hLHRoaXMuX2NhY2hlQXNCaXRtYXA/dGhpcy5fZ2VuZXJhdGVDYWNoZWRTcHJpdGUoKToodGhpcy5kZXN0cm95Q2FjaGVkU3ByaXRlKCksdGhpcy5kaXJ0eT0hMCl9fSksYi5HcmFwaGljcy5wcm90b3R5cGUubGluZVN0eWxlPWZ1bmN0aW9uKGEsYyxkKXtpZih0aGlzLmxpbmVXaWR0aD1hfHwwLHRoaXMubGluZUNvbG9yPWN8fDAsdGhpcy5saW5lQWxwaGE9YXJndW1lbnRzLmxlbmd0aDwzPzE6ZCx0aGlzLmN1cnJlbnRQYXRoKXtpZih0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuZHJhd1NoYXBlKG5ldyBiLlBvbHlnb24odGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMuc2xpY2UoLTIpKSksdGhpczt0aGlzLmN1cnJlbnRQYXRoLmxpbmVXaWR0aD10aGlzLmxpbmVXaWR0aCx0aGlzLmN1cnJlbnRQYXRoLmxpbmVDb2xvcj10aGlzLmxpbmVDb2xvcix0aGlzLmN1cnJlbnRQYXRoLmxpbmVBbHBoYT10aGlzLmxpbmVBbHBoYX1yZXR1cm4gdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUubW92ZVRvPWZ1bmN0aW9uKGEsYyl7cmV0dXJuIHRoaXMuZHJhd1NoYXBlKG5ldyBiLlBvbHlnb24oW2EsY10pKSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5saW5lVG89ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMucHVzaChhLGIpLHRoaXMuZGlydHk9ITAsdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUucXVhZHJhdGljQ3VydmVUbz1mdW5jdGlvbihhLGIsYyxkKXt0aGlzLmN1cnJlbnRQYXRoPzA9PT10aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGgmJih0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cz1bMCwwXSk6dGhpcy5tb3ZlVG8oMCwwKTt2YXIgZSxmLGc9MjAsaD10aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50czswPT09aC5sZW5ndGgmJnRoaXMubW92ZVRvKDAsMCk7Zm9yKHZhciBpPWhbaC5sZW5ndGgtMl0saj1oW2gubGVuZ3RoLTFdLGs9MCxsPTE7Zz49bDtsKyspaz1sL2csZT1pKyhhLWkpKmssZj1qKyhiLWopKmssaC5wdXNoKGUrKGErKGMtYSkqay1lKSprLGYrKGIrKGQtYikqay1mKSprKTtyZXR1cm4gdGhpcy5kaXJ0eT0hMCx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5iZXppZXJDdXJ2ZVRvPWZ1bmN0aW9uKGEsYixjLGQsZSxmKXt0aGlzLmN1cnJlbnRQYXRoPzA9PT10aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGgmJih0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cz1bMCwwXSk6dGhpcy5tb3ZlVG8oMCwwKTtmb3IodmFyIGcsaCxpLGosayxsPTIwLG09dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMsbj1tW20ubGVuZ3RoLTJdLG89bVttLmxlbmd0aC0xXSxwPTAscT0xO2w+PXE7cSsrKXA9cS9sLGc9MS1wLGg9ZypnLGk9aCpnLGo9cCpwLGs9aipwLG0ucHVzaChpKm4rMypoKnAqYSszKmcqaipjK2sqZSxpKm8rMypoKnAqYiszKmcqaipkK2sqZik7cmV0dXJuIHRoaXMuZGlydHk9ITAsdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuYXJjVG89ZnVuY3Rpb24oYSxiLGMsZCxlKXt0aGlzLmN1cnJlbnRQYXRoPzA9PT10aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGgmJnRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLnB1c2goYSxiKTp0aGlzLm1vdmVUbyhhLGIpO3ZhciBmPXRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLGc9ZltmLmxlbmd0aC0yXSxoPWZbZi5sZW5ndGgtMV0saT1oLWIsaj1nLWEsaz1kLWIsbD1jLWEsbT1NYXRoLmFicyhpKmwtaiprKTtpZigxZS04Pm18fDA9PT1lKShmW2YubGVuZ3RoLTJdIT09YXx8ZltmLmxlbmd0aC0xXSE9PWIpJiZmLnB1c2goYSxiKTtlbHNle3ZhciBuPWkqaStqKmosbz1rKmsrbCpsLHA9aSprK2oqbCxxPWUqTWF0aC5zcXJ0KG4pL20scj1lKk1hdGguc3FydChvKS9tLHM9cSpwL24sdD1yKnAvbyx1PXEqbCtyKmosdj1xKmsrcippLHc9aioocitzKSx4PWkqKHIrcykseT1sKihxK3QpLHo9ayoocSt0KSxBPU1hdGguYXRhbjIoeC12LHctdSksQj1NYXRoLmF0YW4yKHotdix5LXUpO3RoaXMuYXJjKHUrYSx2K2IsZSxBLEIsaiprPmwqaSl9cmV0dXJuIHRoaXMuZGlydHk9ITAsdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuYXJjPWZ1bmN0aW9uKGEsYixjLGQsZSxmKXt2YXIgZyxoPWErTWF0aC5jb3MoZCkqYyxpPWIrTWF0aC5zaW4oZCkqYztpZih0aGlzLmN1cnJlbnRQYXRoPyhnPXRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLDA9PT1nLmxlbmd0aD9nLnB1c2goaCxpKTooZ1tnLmxlbmd0aC0yXSE9PWh8fGdbZy5sZW5ndGgtMV0hPT1pKSYmZy5wdXNoKGgsaSkpOih0aGlzLm1vdmVUbyhoLGkpLGc9dGhpcy5jdXJyZW50UGF0aC5zaGFwZS5wb2ludHMpLGQ9PT1lKXJldHVybiB0aGlzOyFmJiZkPj1lP2UrPTIqTWF0aC5QSTpmJiZlPj1kJiYoZCs9MipNYXRoLlBJKTt2YXIgaj1mPy0xKihkLWUpOmUtZCxrPU1hdGguYWJzKGopLygyKk1hdGguUEkpKjQwO2lmKDA9PT1qKXJldHVybiB0aGlzO2Zvcih2YXIgbD1qLygyKmspLG09MipsLG49TWF0aC5jb3MobCksbz1NYXRoLnNpbihsKSxwPWstMSxxPXAlMS9wLHI9MDtwPj1yO3IrKyl7dmFyIHM9citxKnIsdD1sK2QrbSpzLHU9TWF0aC5jb3ModCksdj0tTWF0aC5zaW4odCk7Zy5wdXNoKChuKnUrbyp2KSpjK2EsKG4qLXYrbyp1KSpjK2IpfXJldHVybiB0aGlzLmRpcnR5PSEwLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmJlZ2luRmlsbD1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmZpbGxpbmc9ITAsdGhpcy5maWxsQ29sb3I9YXx8MCx0aGlzLmZpbGxBbHBoYT12b2lkIDA9PT1iPzE6Yix0aGlzLmN1cnJlbnRQYXRoJiZ0aGlzLmN1cnJlbnRQYXRoLnNoYXBlLnBvaW50cy5sZW5ndGg8PTImJih0aGlzLmN1cnJlbnRQYXRoLmZpbGw9dGhpcy5maWxsaW5nLHRoaXMuY3VycmVudFBhdGguZmlsbENvbG9yPXRoaXMuZmlsbENvbG9yLHRoaXMuY3VycmVudFBhdGguZmlsbEFscGhhPXRoaXMuZmlsbEFscGhhKSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5lbmRGaWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZmlsbGluZz0hMSx0aGlzLmZpbGxDb2xvcj1udWxsLHRoaXMuZmlsbEFscGhhPTEsdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZHJhd1JlY3Q9ZnVuY3Rpb24oYSxjLGQsZSl7cmV0dXJuIHRoaXMuZHJhd1NoYXBlKG5ldyBiLlJlY3RhbmdsZShhLGMsZCxlKSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZHJhd1JvdW5kZWRSZWN0PWZ1bmN0aW9uKGEsYyxkLGUsZil7cmV0dXJuIHRoaXMuZHJhd1NoYXBlKG5ldyBiLlJvdW5kZWRSZWN0YW5nbGUoYSxjLGQsZSxmKSksdGhpc30sYi5HcmFwaGljcy5wcm90b3R5cGUuZHJhd0NpcmNsZT1mdW5jdGlvbihhLGMsZCl7cmV0dXJuIHRoaXMuZHJhd1NoYXBlKG5ldyBiLkNpcmNsZShhLGMsZCkpLHRoaXN9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRyYXdFbGxpcHNlPWZ1bmN0aW9uKGEsYyxkLGUpe3JldHVybiB0aGlzLmRyYXdTaGFwZShuZXcgYi5FbGxpcHNlKGEsYyxkLGUpKSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5kcmF3UG9seWdvbj1mdW5jdGlvbihhKXtyZXR1cm4gYSBpbnN0YW5jZW9mIEFycmF5fHwoYT1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpKSx0aGlzLmRyYXdTaGFwZShuZXcgYi5Qb2x5Z29uKGEpKSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3JldHVybiB0aGlzLmxpbmVXaWR0aD0wLHRoaXMuZmlsbGluZz0hMSx0aGlzLmRpcnR5PSEwLHRoaXMuY2xlYXJEaXJ0eT0hMCx0aGlzLmdyYXBoaWNzRGF0YT1bXSx0aGlzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS5nZW5lcmF0ZVRleHR1cmU9ZnVuY3Rpb24oYSxjKXthPWF8fDE7dmFyIGQ9dGhpcy5nZXRCb3VuZHMoKSxlPW5ldyBiLkNhbnZhc0J1ZmZlcihkLndpZHRoKmEsZC5oZWlnaHQqYSksZj1iLlRleHR1cmUuZnJvbUNhbnZhcyhlLmNhbnZhcyxjKTtyZXR1cm4gZi5iYXNlVGV4dHVyZS5yZXNvbHV0aW9uPWEsZS5jb250ZXh0LnNjYWxlKGEsYSksZS5jb250ZXh0LnRyYW5zbGF0ZSgtZC54LC1kLnkpLGIuQ2FudmFzR3JhcGhpY3MucmVuZGVyR3JhcGhpY3ModGhpcyxlLmNvbnRleHQpLGZ9LGIuR3JhcGhpY3MucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUhPT0hMSYmMCE9PXRoaXMuYWxwaGEmJnRoaXMuaXNNYXNrIT09ITApe2lmKHRoaXMuX2NhY2hlQXNCaXRtYXApcmV0dXJuKHRoaXMuZGlydHl8fHRoaXMuY2FjaGVkU3ByaXRlRGlydHkpJiYodGhpcy5fZ2VuZXJhdGVDYWNoZWRTcHJpdGUoKSx0aGlzLnVwZGF0ZUNhY2hlZFNwcml0ZVRleHR1cmUoKSx0aGlzLmNhY2hlZFNwcml0ZURpcnR5PSExLHRoaXMuZGlydHk9ITEpLHRoaXMuX2NhY2hlZFNwcml0ZS53b3JsZEFscGhhPXRoaXMud29ybGRBbHBoYSxiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlcldlYkdMLmNhbGwodGhpcy5fY2FjaGVkU3ByaXRlLGEpLHZvaWQgMDtpZihhLnNwcml0ZUJhdGNoLnN0b3AoKSxhLmJsZW5kTW9kZU1hbmFnZXIuc2V0QmxlbmRNb2RlKHRoaXMuYmxlbmRNb2RlKSx0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMuX21hc2ssYSksdGhpcy5fZmlsdGVycyYmYS5maWx0ZXJNYW5hZ2VyLnB1c2hGaWx0ZXIodGhpcy5fZmlsdGVyQmxvY2spLHRoaXMuYmxlbmRNb2RlIT09YS5zcHJpdGVCYXRjaC5jdXJyZW50QmxlbmRNb2RlKXthLnNwcml0ZUJhdGNoLmN1cnJlbnRCbGVuZE1vZGU9dGhpcy5ibGVuZE1vZGU7dmFyIGM9Yi5ibGVuZE1vZGVzV2ViR0xbYS5zcHJpdGVCYXRjaC5jdXJyZW50QmxlbmRNb2RlXTthLnNwcml0ZUJhdGNoLmdsLmJsZW5kRnVuYyhjWzBdLGNbMV0pfWlmKHRoaXMud2ViR0xEaXJ0eSYmKHRoaXMuZGlydHk9ITAsdGhpcy53ZWJHTERpcnR5PSExKSxiLldlYkdMR3JhcGhpY3MucmVuZGVyR3JhcGhpY3ModGhpcyxhKSx0aGlzLmNoaWxkcmVuLmxlbmd0aCl7YS5zcHJpdGVCYXRjaC5zdGFydCgpO2Zvcih2YXIgZD0wLGU9dGhpcy5jaGlsZHJlbi5sZW5ndGg7ZT5kO2QrKyl0aGlzLmNoaWxkcmVuW2RdLl9yZW5kZXJXZWJHTChhKTthLnNwcml0ZUJhdGNoLnN0b3AoKX10aGlzLl9maWx0ZXJzJiZhLmZpbHRlck1hbmFnZXIucG9wRmlsdGVyKCksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKHRoaXMubWFzayxhKSxhLmRyYXdDb3VudCsrLGEuc3ByaXRlQmF0Y2guc3RhcnQoKX19LGIuR3JhcGhpY3MucHJvdG90eXBlLl9yZW5kZXJDYW52YXM9ZnVuY3Rpb24oYSl7aWYodGhpcy52aXNpYmxlIT09ITEmJjAhPT10aGlzLmFscGhhJiZ0aGlzLmlzTWFzayE9PSEwKXtpZih0aGlzLl9jYWNoZUFzQml0bWFwKXJldHVybih0aGlzLmRpcnR5fHx0aGlzLmNhY2hlZFNwcml0ZURpcnR5KSYmKHRoaXMuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlKCksdGhpcy51cGRhdGVDYWNoZWRTcHJpdGVUZXh0dXJlKCksdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eT0hMSx0aGlzLmRpcnR5PSExKSx0aGlzLl9jYWNoZWRTcHJpdGUuYWxwaGE9dGhpcy5hbHBoYSxiLlNwcml0ZS5wcm90b3R5cGUuX3JlbmRlckNhbnZhcy5jYWxsKHRoaXMuX2NhY2hlZFNwcml0ZSxhKSx2b2lkIDA7dmFyIGM9YS5jb250ZXh0LGQ9dGhpcy53b3JsZFRyYW5zZm9ybTt0aGlzLmJsZW5kTW9kZSE9PWEuY3VycmVudEJsZW5kTW9kZSYmKGEuY3VycmVudEJsZW5kTW9kZT10aGlzLmJsZW5kTW9kZSxjLmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbj1iLmJsZW5kTW9kZXNDYW52YXNbYS5jdXJyZW50QmxlbmRNb2RlXSksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wdXNoTWFzayh0aGlzLl9tYXNrLGEpO3ZhciBlPWEucmVzb2x1dGlvbjtjLnNldFRyYW5zZm9ybShkLmEqZSxkLmIqZSxkLmMqZSxkLmQqZSxkLnR4KmUsZC50eSplKSxiLkNhbnZhc0dyYXBoaWNzLnJlbmRlckdyYXBoaWNzKHRoaXMsYyk7Zm9yKHZhciBmPTAsZz10aGlzLmNoaWxkcmVuLmxlbmd0aDtnPmY7ZisrKXRoaXMuY2hpbGRyZW5bZl0uX3JlbmRlckNhbnZhcyhhKTt0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2soYSl9fSxiLkdyYXBoaWNzLnByb3RvdHlwZS5nZXRCb3VuZHM9ZnVuY3Rpb24oYSl7aWYodGhpcy5pc01hc2spcmV0dXJuIGIuRW1wdHlSZWN0YW5nbGU7dGhpcy5kaXJ0eSYmKHRoaXMudXBkYXRlTG9jYWxCb3VuZHMoKSx0aGlzLndlYkdMRGlydHk9ITAsdGhpcy5jYWNoZWRTcHJpdGVEaXJ0eT0hMCx0aGlzLmRpcnR5PSExKTt2YXIgYz10aGlzLl9sb2NhbEJvdW5kcyxkPWMueCxlPWMud2lkdGgrYy54LGY9Yy55LGc9Yy5oZWlnaHQrYy55LGg9YXx8dGhpcy53b3JsZFRyYW5zZm9ybSxpPWguYSxqPWguYixrPWguYyxsPWguZCxtPWgudHgsbj1oLnR5LG89aSplK2sqZyttLHA9bCpnK2oqZStuLHE9aSpkK2sqZyttLHI9bCpnK2oqZCtuLHM9aSpkK2sqZittLHQ9bCpmK2oqZCtuLHU9aSplK2sqZittLHY9bCpmK2oqZStuLHc9byx4PXAseT1vLHo9cDtyZXR1cm4geT15PnE/cTp5LHk9eT5zP3M6eSx5PXk+dT91Onksej16PnI/cjp6LHo9ej50P3Q6eix6PXo+dj92Onosdz1xPnc/cTp3LHc9cz53P3M6dyx3PXU+dz91OncseD1yPng/cjp4LHg9dD54P3Q6eCx4PXY+eD92OngsdGhpcy5fYm91bmRzLng9eSx0aGlzLl9ib3VuZHMud2lkdGg9dy15LHRoaXMuX2JvdW5kcy55PXosdGhpcy5fYm91bmRzLmhlaWdodD14LXosdGhpcy5fYm91bmRzfSxiLkdyYXBoaWNzLnByb3RvdHlwZS51cGRhdGVMb2NhbEJvdW5kcz1mdW5jdGlvbigpe3ZhciBhPTEvMCxjPS0xLzAsZD0xLzAsZT0tMS8wO2lmKHRoaXMuZ3JhcGhpY3NEYXRhLmxlbmd0aClmb3IodmFyIGYsZyxoLGksaixrLGw9MDtsPHRoaXMuZ3JhcGhpY3NEYXRhLmxlbmd0aDtsKyspe3ZhciBtPXRoaXMuZ3JhcGhpY3NEYXRhW2xdLG49bS50eXBlLG89bS5saW5lV2lkdGg7aWYoZj1tLnNoYXBlLG49PT1iLkdyYXBoaWNzLlJFQ1R8fG49PT1iLkdyYXBoaWNzLlJSRUMpaD1mLngtby8yLGk9Zi55LW8vMixqPWYud2lkdGgrbyxrPWYuaGVpZ2h0K28sYT1hPmg/aDphLGM9aCtqPmM/aCtqOmMsZD1kPmk/aTpkLGU9aStrPmU/aStrOmU7ZWxzZSBpZihuPT09Yi5HcmFwaGljcy5DSVJDKWg9Zi54LGk9Zi55LGo9Zi5yYWRpdXMrby8yLGs9Zi5yYWRpdXMrby8yLGE9YT5oLWo/aC1qOmEsYz1oK2o+Yz9oK2o6YyxkPWQ+aS1rP2ktazpkLGU9aStrPmU/aStrOmU7ZWxzZSBpZihuPT09Yi5HcmFwaGljcy5FTElQKWg9Zi54LGk9Zi55LGo9Zi53aWR0aCtvLzIsaz1mLmhlaWdodCtvLzIsYT1hPmgtaj9oLWo6YSxjPWgraj5jP2grajpjLGQ9ZD5pLWs/aS1rOmQsZT1pK2s+ZT9pK2s6ZTtlbHNle2c9Zi5wb2ludHM7Zm9yKHZhciBwPTA7cDxnLmxlbmd0aDtwKz0yKWg9Z1twXSxpPWdbcCsxXSxhPWE+aC1vP2gtbzphLGM9aCtvPmM/aCtvOmMsZD1kPmktbz9pLW86ZCxlPWkrbz5lP2krbzplfX1lbHNlIGE9MCxjPTAsZD0wLGU9MDt2YXIgcT10aGlzLmJvdW5kc1BhZGRpbmc7dGhpcy5fbG9jYWxCb3VuZHMueD1hLXEsdGhpcy5fbG9jYWxCb3VuZHMud2lkdGg9Yy1hKzIqcSx0aGlzLl9sb2NhbEJvdW5kcy55PWQtcSx0aGlzLl9sb2NhbEJvdW5kcy5oZWlnaHQ9ZS1kKzIqcX0sYi5HcmFwaGljcy5wcm90b3R5cGUuX2dlbmVyYXRlQ2FjaGVkU3ByaXRlPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5nZXRMb2NhbEJvdW5kcygpO2lmKHRoaXMuX2NhY2hlZFNwcml0ZSl0aGlzLl9jYWNoZWRTcHJpdGUuYnVmZmVyLnJlc2l6ZShhLndpZHRoLGEuaGVpZ2h0KTtlbHNle3ZhciBjPW5ldyBiLkNhbnZhc0J1ZmZlcihhLndpZHRoLGEuaGVpZ2h0KSxkPWIuVGV4dHVyZS5mcm9tQ2FudmFzKGMuY2FudmFzKTt0aGlzLl9jYWNoZWRTcHJpdGU9bmV3IGIuU3ByaXRlKGQpLHRoaXMuX2NhY2hlZFNwcml0ZS5idWZmZXI9Yyx0aGlzLl9jYWNoZWRTcHJpdGUud29ybGRUcmFuc2Zvcm09dGhpcy53b3JsZFRyYW5zZm9ybX10aGlzLl9jYWNoZWRTcHJpdGUuYW5jaG9yLng9LShhLngvYS53aWR0aCksdGhpcy5fY2FjaGVkU3ByaXRlLmFuY2hvci55PS0oYS55L2EuaGVpZ2h0KSx0aGlzLl9jYWNoZWRTcHJpdGUuYnVmZmVyLmNvbnRleHQudHJhbnNsYXRlKC1hLngsLWEueSksdGhpcy53b3JsZEFscGhhPTEsYi5DYW52YXNHcmFwaGljcy5yZW5kZXJHcmFwaGljcyh0aGlzLHRoaXMuX2NhY2hlZFNwcml0ZS5idWZmZXIuY29udGV4dCksdGhpcy5fY2FjaGVkU3ByaXRlLmFscGhhPXRoaXMuYWxwaGF9LGIuR3JhcGhpY3MucHJvdG90eXBlLnVwZGF0ZUNhY2hlZFNwcml0ZVRleHR1cmU9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLl9jYWNoZWRTcHJpdGUsYj1hLnRleHR1cmUsYz1hLmJ1ZmZlci5jYW52YXM7Yi5iYXNlVGV4dHVyZS53aWR0aD1jLndpZHRoLGIuYmFzZVRleHR1cmUuaGVpZ2h0PWMuaGVpZ2h0LGIuY3JvcC53aWR0aD1iLmZyYW1lLndpZHRoPWMud2lkdGgsYi5jcm9wLmhlaWdodD1iLmZyYW1lLmhlaWdodD1jLmhlaWdodCxhLl93aWR0aD1jLndpZHRoLGEuX2hlaWdodD1jLmhlaWdodCxiLmJhc2VUZXh0dXJlLmRpcnR5KCl9LGIuR3JhcGhpY3MucHJvdG90eXBlLmRlc3Ryb3lDYWNoZWRTcHJpdGU9ZnVuY3Rpb24oKXt0aGlzLl9jYWNoZWRTcHJpdGUudGV4dHVyZS5kZXN0cm95KCEwKSx0aGlzLl9jYWNoZWRTcHJpdGU9bnVsbH0sYi5HcmFwaGljcy5wcm90b3R5cGUuZHJhd1NoYXBlPWZ1bmN0aW9uKGEpe3RoaXMuY3VycmVudFBhdGgmJnRoaXMuY3VycmVudFBhdGguc2hhcGUucG9pbnRzLmxlbmd0aDw9MiYmdGhpcy5ncmFwaGljc0RhdGEucG9wKCksdGhpcy5jdXJyZW50UGF0aD1udWxsO3ZhciBjPW5ldyBiLkdyYXBoaWNzRGF0YSh0aGlzLmxpbmVXaWR0aCx0aGlzLmxpbmVDb2xvcix0aGlzLmxpbmVBbHBoYSx0aGlzLmZpbGxDb2xvcix0aGlzLmZpbGxBbHBoYSx0aGlzLmZpbGxpbmcsYSk7cmV0dXJuIHRoaXMuZ3JhcGhpY3NEYXRhLnB1c2goYyksYy50eXBlPT09Yi5HcmFwaGljcy5QT0xZJiYoYy5zaGFwZS5jbG9zZWQ9dGhpcy5maWxsaW5nLHRoaXMuY3VycmVudFBhdGg9YyksdGhpcy5kaXJ0eT0hMCxjfSxiLkdyYXBoaWNzRGF0YT1mdW5jdGlvbihhLGIsYyxkLGUsZixnKXt0aGlzLmxpbmVXaWR0aD1hLHRoaXMubGluZUNvbG9yPWIsdGhpcy5saW5lQWxwaGE9Yyx0aGlzLl9saW5lVGludD1iLHRoaXMuZmlsbENvbG9yPWQsdGhpcy5maWxsQWxwaGE9ZSx0aGlzLl9maWxsVGludD1kLHRoaXMuZmlsbD1mLHRoaXMuc2hhcGU9Zyx0aGlzLnR5cGU9Zy50eXBlfSxiLkdyYXBoaWNzLlBPTFk9MCxiLkdyYXBoaWNzLlJFQ1Q9MSxiLkdyYXBoaWNzLkNJUkM9MixiLkdyYXBoaWNzLkVMSVA9MyxiLkdyYXBoaWNzLlJSRUM9NCxiLlBvbHlnb24ucHJvdG90eXBlLnR5cGU9Yi5HcmFwaGljcy5QT0xZLGIuUmVjdGFuZ2xlLnByb3RvdHlwZS50eXBlPWIuR3JhcGhpY3MuUkVDVCxiLkNpcmNsZS5wcm90b3R5cGUudHlwZT1iLkdyYXBoaWNzLkNJUkMsYi5FbGxpcHNlLnByb3RvdHlwZS50eXBlPWIuR3JhcGhpY3MuRUxJUCxiLlJvdW5kZWRSZWN0YW5nbGUucHJvdG90eXBlLnR5cGU9Yi5HcmFwaGljcy5SUkVDLGIuU3RyaXA9ZnVuY3Rpb24oYSl7Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy50ZXh0dXJlPWEsdGhpcy51dnM9bmV3IGIuRmxvYXQzMkFycmF5KFswLDEsMSwxLDEsMCwwLDFdKSx0aGlzLnZlcnRpY2VzPW5ldyBiLkZsb2F0MzJBcnJheShbMCwwLDEwMCwwLDEwMCwxMDAsMCwxMDBdKSx0aGlzLmNvbG9ycz1uZXcgYi5GbG9hdDMyQXJyYXkoWzEsMSwxLDFdKSx0aGlzLmluZGljZXM9bmV3IGIuVWludDE2QXJyYXkoWzAsMSwyLDNdKSx0aGlzLmRpcnR5PSEwLHRoaXMuYmxlbmRNb2RlPWIuYmxlbmRNb2Rlcy5OT1JNQUwsdGhpcy5jYW52YXNQYWRkaW5nPTAsdGhpcy5kcmF3TW9kZT1iLlN0cmlwLkRyYXdNb2Rlcy5UUklBTkdMRV9TVFJJUH0sYi5TdHJpcC5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlKSxiLlN0cmlwLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlN0cmlwLGIuU3RyaXAucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXshdGhpcy52aXNpYmxlfHx0aGlzLmFscGhhPD0wfHwoYS5zcHJpdGVCYXRjaC5zdG9wKCksdGhpcy5fdmVydGV4QnVmZmVyfHx0aGlzLl9pbml0V2ViR0woYSksYS5zaGFkZXJNYW5hZ2VyLnNldFNoYWRlcihhLnNoYWRlck1hbmFnZXIuc3RyaXBTaGFkZXIpLHRoaXMuX3JlbmRlclN0cmlwKGEpLGEuc3ByaXRlQmF0Y2guc3RhcnQoKSl9LGIuU3RyaXAucHJvdG90eXBlLl9pbml0V2ViR0w9ZnVuY3Rpb24oYSl7dmFyIGI9YS5nbDt0aGlzLl92ZXJ0ZXhCdWZmZXI9Yi5jcmVhdGVCdWZmZXIoKSx0aGlzLl9pbmRleEJ1ZmZlcj1iLmNyZWF0ZUJ1ZmZlcigpLHRoaXMuX3V2QnVmZmVyPWIuY3JlYXRlQnVmZmVyKCksdGhpcy5fY29sb3JCdWZmZXI9Yi5jcmVhdGVCdWZmZXIoKSxiLmJpbmRCdWZmZXIoYi5BUlJBWV9CVUZGRVIsdGhpcy5fdmVydGV4QnVmZmVyKSxiLmJ1ZmZlckRhdGEoYi5BUlJBWV9CVUZGRVIsdGhpcy52ZXJ0aWNlcyxiLkRZTkFNSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX3V2QnVmZmVyKSxiLmJ1ZmZlckRhdGEoYi5BUlJBWV9CVUZGRVIsdGhpcy51dnMsYi5TVEFUSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuQVJSQVlfQlVGRkVSLHRoaXMuX2NvbG9yQnVmZmVyKSxiLmJ1ZmZlckRhdGEoYi5BUlJBWV9CVUZGRVIsdGhpcy5jb2xvcnMsYi5TVEFUSUNfRFJBVyksYi5iaW5kQnVmZmVyKGIuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kZXhCdWZmZXIpLGIuYnVmZmVyRGF0YShiLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuaW5kaWNlcyxiLlNUQVRJQ19EUkFXKX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlclN0cmlwPWZ1bmN0aW9uKGEpe3ZhciBjPWEuZ2wsZD1hLnByb2plY3Rpb24sZT1hLm9mZnNldCxmPWEuc2hhZGVyTWFuYWdlci5zdHJpcFNoYWRlcixnPXRoaXMuZHJhd01vZGU9PT1iLlN0cmlwLkRyYXdNb2Rlcy5UUklBTkdMRV9TVFJJUD9jLlRSSUFOR0xFX1NUUklQOmMuVFJJQU5HTEVTO2EuYmxlbmRNb2RlTWFuYWdlci5zZXRCbGVuZE1vZGUodGhpcy5ibGVuZE1vZGUpLGMudW5pZm9ybU1hdHJpeDNmdihmLnRyYW5zbGF0aW9uTWF0cml4LCExLHRoaXMud29ybGRUcmFuc2Zvcm0udG9BcnJheSghMCkpLGMudW5pZm9ybTJmKGYucHJvamVjdGlvblZlY3RvcixkLngsLWQueSksYy51bmlmb3JtMmYoZi5vZmZzZXRWZWN0b3IsLWUueCwtZS55KSxjLnVuaWZvcm0xZihmLmFscGhhLHRoaXMud29ybGRBbHBoYSksdGhpcy5kaXJ0eT8odGhpcy5kaXJ0eT0hMSxjLmJpbmRCdWZmZXIoYy5BUlJBWV9CVUZGRVIsdGhpcy5fdmVydGV4QnVmZmVyKSxjLmJ1ZmZlckRhdGEoYy5BUlJBWV9CVUZGRVIsdGhpcy52ZXJ0aWNlcyxjLlNUQVRJQ19EUkFXKSxjLnZlcnRleEF0dHJpYlBvaW50ZXIoZi5hVmVydGV4UG9zaXRpb24sMixjLkZMT0FULCExLDAsMCksYy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLHRoaXMuX3V2QnVmZmVyKSxjLmJ1ZmZlckRhdGEoYy5BUlJBWV9CVUZGRVIsdGhpcy51dnMsYy5TVEFUSUNfRFJBVyksYy52ZXJ0ZXhBdHRyaWJQb2ludGVyKGYuYVRleHR1cmVDb29yZCwyLGMuRkxPQVQsITEsMCwwKSxjLmFjdGl2ZVRleHR1cmUoYy5URVhUVVJFMCksdGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLl9kaXJ0eVtjLmlkXT9hLnJlbmRlcmVyLnVwZGF0ZVRleHR1cmUodGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlKTpjLmJpbmRUZXh0dXJlKGMuVEVYVFVSRV8yRCx0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuX2dsVGV4dHVyZXNbYy5pZF0pLGMuYmluZEJ1ZmZlcihjLkVMRU1FTlRfQVJSQVlfQlVGRkVSLHRoaXMuX2luZGV4QnVmZmVyKSxjLmJ1ZmZlckRhdGEoYy5FTEVNRU5UX0FSUkFZX0JVRkZFUix0aGlzLmluZGljZXMsYy5TVEFUSUNfRFJBVykpOihjLmJpbmRCdWZmZXIoYy5BUlJBWV9CVUZGRVIsdGhpcy5fdmVydGV4QnVmZmVyKSxjLmJ1ZmZlclN1YkRhdGEoYy5BUlJBWV9CVUZGRVIsMCx0aGlzLnZlcnRpY2VzKSxjLnZlcnRleEF0dHJpYlBvaW50ZXIoZi5hVmVydGV4UG9zaXRpb24sMixjLkZMT0FULCExLDAsMCksYy5iaW5kQnVmZmVyKGMuQVJSQVlfQlVGRkVSLHRoaXMuX3V2QnVmZmVyKSxjLnZlcnRleEF0dHJpYlBvaW50ZXIoZi5hVGV4dHVyZUNvb3JkLDIsYy5GTE9BVCwhMSwwLDApLGMuYWN0aXZlVGV4dHVyZShjLlRFWFRVUkUwKSx0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuX2RpcnR5W2MuaWRdP2EucmVuZGVyZXIudXBkYXRlVGV4dHVyZSh0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUpOmMuYmluZFRleHR1cmUoYy5URVhUVVJFXzJELHRoaXMudGV4dHVyZS5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1tjLmlkXSksYy5iaW5kQnVmZmVyKGMuRUxFTUVOVF9BUlJBWV9CVUZGRVIsdGhpcy5faW5kZXhCdWZmZXIpKSxjLmRyYXdFbGVtZW50cyhnLHRoaXMuaW5kaWNlcy5sZW5ndGgsYy5VTlNJR05FRF9TSE9SVCwwKX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlckNhbnZhcz1mdW5jdGlvbihhKXt2YXIgYz1hLmNvbnRleHQsZD10aGlzLndvcmxkVHJhbnNmb3JtO2Eucm91bmRQaXhlbHM/Yy5zZXRUcmFuc2Zvcm0oZC5hLGQuYixkLmMsZC5kLDB8ZC50eCwwfGQudHkpOmMuc2V0VHJhbnNmb3JtKGQuYSxkLmIsZC5jLGQuZCxkLnR4LGQudHkpLHRoaXMuZHJhd01vZGU9PT1iLlN0cmlwLkRyYXdNb2Rlcy5UUklBTkdMRV9TVFJJUD90aGlzLl9yZW5kZXJDYW52YXNUcmlhbmdsZVN0cmlwKGMpOnRoaXMuX3JlbmRlckNhbnZhc1RyaWFuZ2xlcyhjKX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlckNhbnZhc1RyaWFuZ2xlU3RyaXA9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy52ZXJ0aWNlcyxjPXRoaXMudXZzLGQ9Yi5sZW5ndGgvMjt0aGlzLmNvdW50Kys7Zm9yKHZhciBlPTA7ZC0yPmU7ZSsrKXt2YXIgZj0yKmU7dGhpcy5fcmVuZGVyQ2FudmFzRHJhd1RyaWFuZ2xlKGEsYixjLGYsZisyLGYrNCl9fSxiLlN0cmlwLnByb3RvdHlwZS5fcmVuZGVyQ2FudmFzVHJpYW5nbGVzPWZ1bmN0aW9uKGEpe3ZhciBiPXRoaXMudmVydGljZXMsYz10aGlzLnV2cyxkPXRoaXMuaW5kaWNlcyxlPWQubGVuZ3RoO3RoaXMuY291bnQrKztmb3IodmFyIGY9MDtlPmY7Zis9Myl7dmFyIGc9MipkW2ZdLGg9MipkW2YrMV0saT0yKmRbZisyXTt0aGlzLl9yZW5kZXJDYW52YXNEcmF3VHJpYW5nbGUoYSxiLGMsZyxoLGkpfX0sYi5TdHJpcC5wcm90b3R5cGUuX3JlbmRlckNhbnZhc0RyYXdUcmlhbmdsZT1mdW5jdGlvbihhLGIsYyxkLGUsZil7dmFyIGc9dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLnNvdXJjZSxoPXRoaXMudGV4dHVyZS53aWR0aCxpPXRoaXMudGV4dHVyZS5oZWlnaHQsaj1iW2RdLGs9YltlXSxsPWJbZl0sbT1iW2QrMV0sbj1iW2UrMV0sbz1iW2YrMV0scD1jW2RdKmgscT1jW2VdKmgscj1jW2ZdKmgscz1jW2QrMV0qaSx0PWNbZSsxXSppLHU9Y1tmKzFdKmk7aWYodGhpcy5jYW52YXNQYWRkaW5nPjApe3ZhciB2PXRoaXMuY2FudmFzUGFkZGluZy90aGlzLndvcmxkVHJhbnNmb3JtLmEsdz10aGlzLmNhbnZhc1BhZGRpbmcvdGhpcy53b3JsZFRyYW5zZm9ybS5kLHg9KGoraytsKS8zLHk9KG0rbitvKS8zLHo9ai14LEE9bS15LEI9TWF0aC5zcXJ0KHoqeitBKkEpO2o9eCt6L0IqKEIrdiksbT15K0EvQiooQit3KSx6PWsteCxBPW4teSxCPU1hdGguc3FydCh6KnorQSpBKSxrPXgrei9CKihCK3YpLG49eStBL0IqKEIrdyksej1sLXgsQT1vLXksQj1NYXRoLnNxcnQoeip6K0EqQSksbD14K3ovQiooQit2KSxvPXkrQS9CKihCK3cpfWEuc2F2ZSgpLGEuYmVnaW5QYXRoKCksYS5tb3ZlVG8oaixtKSxhLmxpbmVUbyhrLG4pLGEubGluZVRvKGwsbyksYS5jbG9zZVBhdGgoKSxhLmNsaXAoKTt2YXIgQz1wKnQrcypyK3EqdS10KnItcypxLXAqdSxEPWoqdCtzKmwrayp1LXQqbC1zKmstaip1LEU9cCprK2oqcitxKmwtaypyLWoqcS1wKmwsRj1wKnQqbCtzKmsqcitqKnEqdS1qKnQqci1zKnEqbC1wKmsqdSxHPW0qdCtzKm8rbip1LXQqby1zKm4tbSp1LEg9cCpuK20qcitxKm8tbipyLW0qcS1wKm8sST1wKnQqbytzKm4qcittKnEqdS1tKnQqci1zKnEqby1wKm4qdTthLnRyYW5zZm9ybShEL0MsRy9DLEUvQyxIL0MsRi9DLEkvQyksYS5kcmF3SW1hZ2UoZywwLDApLGEucmVzdG9yZSgpfSxiLlN0cmlwLnByb3RvdHlwZS5yZW5kZXJTdHJpcEZsYXQ9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5jb250ZXh0LGM9YS52ZXJ0aWNlcyxkPWMubGVuZ3RoLzI7dGhpcy5jb3VudCsrLGIuYmVnaW5QYXRoKCk7Zm9yKHZhciBlPTE7ZC0yPmU7ZSsrKXt2YXIgZj0yKmUsZz1jW2ZdLGg9Y1tmKzJdLGk9Y1tmKzRdLGo9Y1tmKzFdLGs9Y1tmKzNdLGw9Y1tmKzVdO2IubW92ZVRvKGcsaiksYi5saW5lVG8oaCxrKSxiLmxpbmVUbyhpLGwpfWIuZmlsbFN0eWxlPVwiI0ZGMDAwMFwiLGIuZmlsbCgpLGIuY2xvc2VQYXRoKCl9LGIuU3RyaXAucHJvdG90eXBlLm9uVGV4dHVyZVVwZGF0ZT1mdW5jdGlvbigpe3RoaXMudXBkYXRlRnJhbWU9ITB9LGIuU3RyaXAucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbihhKXtmb3IodmFyIGM9YXx8dGhpcy53b3JsZFRyYW5zZm9ybSxkPWMuYSxlPWMuYixmPWMuYyxnPWMuZCxoPWMudHgsaT1jLnR5LGo9LTEvMCxrPS0xLzAsbD0xLzAsbT0xLzAsbj10aGlzLnZlcnRpY2VzLG89MCxwPW4ubGVuZ3RoO3A+bztvKz0yKXt2YXIgcT1uW29dLHI9bltvKzFdLHM9ZCpxK2YqcitoLHQ9ZypyK2UqcStpO2w9bD5zP3M6bCxtPW0+dD90Om0saj1zPmo/czpqLGs9dD5rP3Q6a31pZihsPT09LTEvMHx8MS8wPT09aylyZXR1cm4gYi5FbXB0eVJlY3RhbmdsZTt2YXIgdT10aGlzLl9ib3VuZHM7cmV0dXJuIHUueD1sLHUud2lkdGg9ai1sLHUueT1tLHUuaGVpZ2h0PWstbSx0aGlzLl9jdXJyZW50Qm91bmRzPXUsdX0sYi5TdHJpcC5EcmF3TW9kZXM9e1RSSUFOR0xFX1NUUklQOjAsVFJJQU5HTEVTOjF9LGIuUm9wZT1mdW5jdGlvbihhLGMpe2IuU3RyaXAuY2FsbCh0aGlzLGEpLHRoaXMucG9pbnRzPWMsdGhpcy52ZXJ0aWNlcz1uZXcgYi5GbG9hdDMyQXJyYXkoNCpjLmxlbmd0aCksdGhpcy51dnM9bmV3IGIuRmxvYXQzMkFycmF5KDQqYy5sZW5ndGgpLHRoaXMuY29sb3JzPW5ldyBiLkZsb2F0MzJBcnJheSgyKmMubGVuZ3RoKSx0aGlzLmluZGljZXM9bmV3IGIuVWludDE2QXJyYXkoMipjLmxlbmd0aCksdGhpcy5yZWZyZXNoKCl9LGIuUm9wZS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLlN0cmlwLnByb3RvdHlwZSksYi5Sb3BlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlJvcGUsYi5Sb3BlLnByb3RvdHlwZS5yZWZyZXNoPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5wb2ludHM7aWYoIShhLmxlbmd0aDwxKSl7dmFyIGI9dGhpcy51dnMsYz1hWzBdLGQ9dGhpcy5pbmRpY2VzLGU9dGhpcy5jb2xvcnM7dGhpcy5jb3VudC09LjIsYlswXT0wLGJbMV09MCxiWzJdPTAsYlszXT0xLGVbMF09MSxlWzFdPTEsZFswXT0wLGRbMV09MTtmb3IodmFyIGYsZyxoLGk9YS5sZW5ndGgsaj0xO2k+ajtqKyspZj1hW2pdLGc9NCpqLGg9ai8oaS0xKSxqJTI/KGJbZ109aCxiW2crMV09MCxiW2crMl09aCxiW2crM109MSk6KGJbZ109aCxiW2crMV09MCxiW2crMl09aCxiW2crM109MSksZz0yKmosZVtnXT0xLGVbZysxXT0xLGc9MipqLGRbZ109ZyxkW2crMV09ZysxLGM9Zn19LGIuUm9wZS5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5wb2ludHM7aWYoIShhLmxlbmd0aDwxKSl7dmFyIGMsZD1hWzBdLGU9e3g6MCx5OjB9O3RoaXMuY291bnQtPS4yO2Zvcih2YXIgZixnLGgsaSxqLGs9dGhpcy52ZXJ0aWNlcyxsPWEubGVuZ3RoLG09MDtsPm07bSsrKWY9YVttXSxnPTQqbSxjPW08YS5sZW5ndGgtMT9hW20rMV06ZixlLnk9LShjLngtZC54KSxlLng9Yy55LWQueSxoPTEwKigxLW0vKGwtMSkpLGg+MSYmKGg9MSksaT1NYXRoLnNxcnQoZS54KmUueCtlLnkqZS55KSxqPXRoaXMudGV4dHVyZS5oZWlnaHQvMixlLngvPWksZS55Lz1pLGUueCo9aixlLnkqPWosa1tnXT1mLngrZS54LGtbZysxXT1mLnkrZS55LGtbZysyXT1mLngtZS54LGtbZyszXT1mLnktZS55LGQ9ZjtiLkRpc3BsYXlPYmplY3RDb250YWluZXIucHJvdG90eXBlLnVwZGF0ZVRyYW5zZm9ybS5jYWxsKHRoaXMpfX0sYi5Sb3BlLnByb3RvdHlwZS5zZXRUZXh0dXJlPWZ1bmN0aW9uKGEpe3RoaXMudGV4dHVyZT1hfSxiLlRpbGluZ1Nwcml0ZT1mdW5jdGlvbihhLGMsZCl7Yi5TcHJpdGUuY2FsbCh0aGlzLGEpLHRoaXMuX3dpZHRoPWN8fDEwMCx0aGlzLl9oZWlnaHQ9ZHx8MTAwLHRoaXMudGlsZVNjYWxlPW5ldyBiLlBvaW50KDEsMSksdGhpcy50aWxlU2NhbGVPZmZzZXQ9bmV3IGIuUG9pbnQoMSwxKSx0aGlzLnRpbGVQb3NpdGlvbj1uZXcgYi5Qb2ludCgwLDApLHRoaXMucmVuZGVyYWJsZT0hMCx0aGlzLnRpbnQ9MTY3NzcyMTUsdGhpcy5ibGVuZE1vZGU9Yi5ibGVuZE1vZGVzLk5PUk1BTH0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5TcHJpdGUucHJvdG90eXBlKSxiLlRpbGluZ1Nwcml0ZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5UaWxpbmdTcHJpdGUsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuVGlsaW5nU3ByaXRlLnByb3RvdHlwZSxcIndpZHRoXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLl93aWR0aH0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuX3dpZHRoPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuVGlsaW5nU3ByaXRlLnByb3RvdHlwZSxcImhlaWdodFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5faGVpZ2h0fSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5faGVpZ2h0PWF9fSksYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLnNldFRleHR1cmU9ZnVuY3Rpb24oYSl7dGhpcy50ZXh0dXJlIT09YSYmKHRoaXMudGV4dHVyZT1hLHRoaXMucmVmcmVzaFRleHR1cmU9ITAsdGhpcy5jYWNoZWRUaW50PTE2Nzc3MjE1KX0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLl9yZW5kZXJXZWJHTD1mdW5jdGlvbihhKXtpZih0aGlzLnZpc2libGUhPT0hMSYmMCE9PXRoaXMuYWxwaGEpe3ZhciBjLGQ7Zm9yKHRoaXMuX21hc2smJihhLnNwcml0ZUJhdGNoLnN0b3AoKSxhLm1hc2tNYW5hZ2VyLnB1c2hNYXNrKHRoaXMubWFzayxhKSxhLnNwcml0ZUJhdGNoLnN0YXJ0KCkpLHRoaXMuX2ZpbHRlcnMmJihhLnNwcml0ZUJhdGNoLmZsdXNoKCksYS5maWx0ZXJNYW5hZ2VyLnB1c2hGaWx0ZXIodGhpcy5fZmlsdGVyQmxvY2spKSwhdGhpcy50aWxpbmdUZXh0dXJlfHx0aGlzLnJlZnJlc2hUZXh0dXJlPyh0aGlzLmdlbmVyYXRlVGlsaW5nVGV4dHVyZSghMCksdGhpcy50aWxpbmdUZXh0dXJlJiZ0aGlzLnRpbGluZ1RleHR1cmUubmVlZHNVcGRhdGUmJihiLnVwZGF0ZVdlYkdMVGV4dHVyZSh0aGlzLnRpbGluZ1RleHR1cmUuYmFzZVRleHR1cmUsYS5nbCksdGhpcy50aWxpbmdUZXh0dXJlLm5lZWRzVXBkYXRlPSExKSk6YS5zcHJpdGVCYXRjaC5yZW5kZXJUaWxpbmdTcHJpdGUodGhpcyksYz0wLGQ9dGhpcy5jaGlsZHJlbi5sZW5ndGg7ZD5jO2MrKyl0aGlzLmNoaWxkcmVuW2NdLl9yZW5kZXJXZWJHTChhKTthLnNwcml0ZUJhdGNoLnN0b3AoKSx0aGlzLl9maWx0ZXJzJiZhLmZpbHRlck1hbmFnZXIucG9wRmlsdGVyKCksdGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wb3BNYXNrKHRoaXMuX21hc2ssYSksYS5zcHJpdGVCYXRjaC5zdGFydCgpfX0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLl9yZW5kZXJDYW52YXM9ZnVuY3Rpb24oYSl7aWYodGhpcy52aXNpYmxlIT09ITEmJjAhPT10aGlzLmFscGhhKXt2YXIgYz1hLmNvbnRleHQ7dGhpcy5fbWFzayYmYS5tYXNrTWFuYWdlci5wdXNoTWFzayh0aGlzLl9tYXNrLGMpLGMuZ2xvYmFsQWxwaGE9dGhpcy53b3JsZEFscGhhO3ZhciBkLGUsZj10aGlzLndvcmxkVHJhbnNmb3JtLGc9YS5yZXNvbHV0aW9uO2lmKGMuc2V0VHJhbnNmb3JtKGYuYSpnLGYuYipnLGYuYypnLGYuZCpnLGYudHgqZyxmLnR5KmcpLCF0aGlzLl9fdGlsZVBhdHRlcm58fHRoaXMucmVmcmVzaFRleHR1cmUpe2lmKHRoaXMuZ2VuZXJhdGVUaWxpbmdUZXh0dXJlKCExKSwhdGhpcy50aWxpbmdUZXh0dXJlKXJldHVybjt0aGlzLl9fdGlsZVBhdHRlcm49Yy5jcmVhdGVQYXR0ZXJuKHRoaXMudGlsaW5nVGV4dHVyZS5iYXNlVGV4dHVyZS5zb3VyY2UsXCJyZXBlYXRcIil9dGhpcy5ibGVuZE1vZGUhPT1hLmN1cnJlbnRCbGVuZE1vZGUmJihhLmN1cnJlbnRCbGVuZE1vZGU9dGhpcy5ibGVuZE1vZGUsYy5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb249Yi5ibGVuZE1vZGVzQ2FudmFzW2EuY3VycmVudEJsZW5kTW9kZV0pO3ZhciBoPXRoaXMudGlsZVBvc2l0aW9uLGk9dGhpcy50aWxlU2NhbGU7Zm9yKGgueCU9dGhpcy50aWxpbmdUZXh0dXJlLmJhc2VUZXh0dXJlLndpZHRoLGgueSU9dGhpcy50aWxpbmdUZXh0dXJlLmJhc2VUZXh0dXJlLmhlaWdodCxjLnNjYWxlKGkueCxpLnkpLGMudHJhbnNsYXRlKGgueCt0aGlzLmFuY2hvci54Ki10aGlzLl93aWR0aCxoLnkrdGhpcy5hbmNob3IueSotdGhpcy5faGVpZ2h0KSxjLmZpbGxTdHlsZT10aGlzLl9fdGlsZVBhdHRlcm4sYy5maWxsUmVjdCgtaC54LC1oLnksdGhpcy5fd2lkdGgvaS54LHRoaXMuX2hlaWdodC9pLnkpLGMuc2NhbGUoMS9pLngsMS9pLnkpLGMudHJhbnNsYXRlKC1oLngrdGhpcy5hbmNob3IueCp0aGlzLl93aWR0aCwtaC55K3RoaXMuYW5jaG9yLnkqdGhpcy5faGVpZ2h0KSx0aGlzLl9tYXNrJiZhLm1hc2tNYW5hZ2VyLnBvcE1hc2soYS5jb250ZXh0KSxkPTAsZT10aGlzLmNoaWxkcmVuLmxlbmd0aDtlPmQ7ZCsrKXRoaXMuY2hpbGRyZW5bZF0uX3JlbmRlckNhbnZhcyhhKVxufX0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe3ZhciBhPXRoaXMuX3dpZHRoLGI9dGhpcy5faGVpZ2h0LGM9YSooMS10aGlzLmFuY2hvci54KSxkPWEqLXRoaXMuYW5jaG9yLngsZT1iKigxLXRoaXMuYW5jaG9yLnkpLGY9YiotdGhpcy5hbmNob3IueSxnPXRoaXMud29ybGRUcmFuc2Zvcm0saD1nLmEsaT1nLmIsaj1nLmMsaz1nLmQsbD1nLnR4LG09Zy50eSxuPWgqZCtqKmYrbCxvPWsqZitpKmQrbSxwPWgqYytqKmYrbCxxPWsqZitpKmMrbSxyPWgqYytqKmUrbCxzPWsqZStpKmMrbSx0PWgqZCtqKmUrbCx1PWsqZStpKmQrbSx2PS0xLzAsdz0tMS8wLHg9MS8wLHk9MS8wO3g9eD5uP246eCx4PXg+cD9wOngseD14PnI/cjp4LHg9eD50P3Q6eCx5PXk+bz9vOnkseT15PnE/cTp5LHk9eT5zP3M6eSx5PXk+dT91Onksdj1uPnY/bjp2LHY9cD52P3A6dix2PXI+dj9yOnYsdj10PnY/dDp2LHc9bz53P286dyx3PXE+dz9xOncsdz1zPnc/czp3LHc9dT53P3U6dzt2YXIgej10aGlzLl9ib3VuZHM7cmV0dXJuIHoueD14LHoud2lkdGg9di14LHoueT15LHouaGVpZ2h0PXcteSx0aGlzLl9jdXJyZW50Qm91bmRzPXosen0sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLm9uVGV4dHVyZVVwZGF0ZT1mdW5jdGlvbigpe30sYi5UaWxpbmdTcHJpdGUucHJvdG90eXBlLmdlbmVyYXRlVGlsaW5nVGV4dHVyZT1mdW5jdGlvbihhKXtpZih0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUuaGFzTG9hZGVkKXt2YXIgYyxkLGU9dGhpcy5vcmlnaW5hbFRleHR1cmV8fHRoaXMudGV4dHVyZSxmPWUuZnJhbWUsZz1mLndpZHRoIT09ZS5iYXNlVGV4dHVyZS53aWR0aHx8Zi5oZWlnaHQhPT1lLmJhc2VUZXh0dXJlLmhlaWdodCxoPSExO2lmKGE/KGM9Yi5nZXROZXh0UG93ZXJPZlR3byhmLndpZHRoKSxkPWIuZ2V0TmV4dFBvd2VyT2ZUd28oZi5oZWlnaHQpLChmLndpZHRoIT09Y3x8Zi5oZWlnaHQhPT1kfHxlLmJhc2VUZXh0dXJlLndpZHRoIT09Y3x8ZS5iYXNlVGV4dHVyZS5oZWlnaHR8fGQpJiYoaD0hMCkpOmcmJihjPWYud2lkdGgsZD1mLmhlaWdodCxoPSEwKSxoKXt2YXIgaTt0aGlzLnRpbGluZ1RleHR1cmUmJnRoaXMudGlsaW5nVGV4dHVyZS5pc1RpbGluZz8oaT10aGlzLnRpbGluZ1RleHR1cmUuY2FudmFzQnVmZmVyLGkucmVzaXplKGMsZCksdGhpcy50aWxpbmdUZXh0dXJlLmJhc2VUZXh0dXJlLndpZHRoPWMsdGhpcy50aWxpbmdUZXh0dXJlLmJhc2VUZXh0dXJlLmhlaWdodD1kLHRoaXMudGlsaW5nVGV4dHVyZS5uZWVkc1VwZGF0ZT0hMCk6KGk9bmV3IGIuQ2FudmFzQnVmZmVyKGMsZCksdGhpcy50aWxpbmdUZXh0dXJlPWIuVGV4dHVyZS5mcm9tQ2FudmFzKGkuY2FudmFzKSx0aGlzLnRpbGluZ1RleHR1cmUuY2FudmFzQnVmZmVyPWksdGhpcy50aWxpbmdUZXh0dXJlLmlzVGlsaW5nPSEwKSxpLmNvbnRleHQuZHJhd0ltYWdlKGUuYmFzZVRleHR1cmUuc291cmNlLGUuY3JvcC54LGUuY3JvcC55LGUuY3JvcC53aWR0aCxlLmNyb3AuaGVpZ2h0LDAsMCxjLGQpLHRoaXMudGlsZVNjYWxlT2Zmc2V0Lng9Zi53aWR0aC9jLHRoaXMudGlsZVNjYWxlT2Zmc2V0Lnk9Zi5oZWlnaHQvZH1lbHNlIHRoaXMudGlsaW5nVGV4dHVyZSYmdGhpcy50aWxpbmdUZXh0dXJlLmlzVGlsaW5nJiZ0aGlzLnRpbGluZ1RleHR1cmUuZGVzdHJveSghMCksdGhpcy50aWxlU2NhbGVPZmZzZXQueD0xLHRoaXMudGlsZVNjYWxlT2Zmc2V0Lnk9MSx0aGlzLnRpbGluZ1RleHR1cmU9ZTt0aGlzLnJlZnJlc2hUZXh0dXJlPSExLHRoaXMub3JpZ2luYWxUZXh0dXJlPXRoaXMudGV4dHVyZSx0aGlzLnRleHR1cmU9dGhpcy50aWxpbmdUZXh0dXJlLHRoaXMudGlsaW5nVGV4dHVyZS5iYXNlVGV4dHVyZS5fcG93ZXJPZjI9ITB9fTt2YXIgYz17cmFkRGVnOjE4MC9NYXRoLlBJLGRlZ1JhZDpNYXRoLlBJLzE4MCx0ZW1wOltdLEZsb2F0MzJBcnJheTpcInVuZGVmaW5lZFwiPT10eXBlb2YgRmxvYXQzMkFycmF5P0FycmF5OkZsb2F0MzJBcnJheSxVaW50MTZBcnJheTpcInVuZGVmaW5lZFwiPT10eXBlb2YgVWludDE2QXJyYXk/QXJyYXk6VWludDE2QXJyYXl9O2MuQm9uZURhdGE9ZnVuY3Rpb24oYSxiKXt0aGlzLm5hbWU9YSx0aGlzLnBhcmVudD1ifSxjLkJvbmVEYXRhLnByb3RvdHlwZT17bGVuZ3RoOjAseDowLHk6MCxyb3RhdGlvbjowLHNjYWxlWDoxLHNjYWxlWToxLGluaGVyaXRTY2FsZTohMCxpbmhlcml0Um90YXRpb246ITAsZmxpcFg6ITEsZmxpcFk6ITF9LGMuU2xvdERhdGE9ZnVuY3Rpb24oYSxiKXt0aGlzLm5hbWU9YSx0aGlzLmJvbmVEYXRhPWJ9LGMuU2xvdERhdGEucHJvdG90eXBlPXtyOjEsZzoxLGI6MSxhOjEsYXR0YWNobWVudE5hbWU6bnVsbCxhZGRpdGl2ZUJsZW5kaW5nOiExfSxjLklrQ29uc3RyYWludERhdGE9ZnVuY3Rpb24oYSl7dGhpcy5uYW1lPWEsdGhpcy5ib25lcz1bXX0sYy5Ja0NvbnN0cmFpbnREYXRhLnByb3RvdHlwZT17dGFyZ2V0Om51bGwsYmVuZERpcmVjdGlvbjoxLG1peDoxfSxjLkJvbmU9ZnVuY3Rpb24oYSxiLGMpe3RoaXMuZGF0YT1hLHRoaXMuc2tlbGV0b249Yix0aGlzLnBhcmVudD1jLHRoaXMuc2V0VG9TZXR1cFBvc2UoKX0sYy5Cb25lLnlEb3duPSExLGMuQm9uZS5wcm90b3R5cGU9e3g6MCx5OjAscm90YXRpb246MCxyb3RhdGlvbklLOjAsc2NhbGVYOjEsc2NhbGVZOjEsZmxpcFg6ITEsZmxpcFk6ITEsbTAwOjAsbTAxOjAsd29ybGRYOjAsbTEwOjAsbTExOjAsd29ybGRZOjAsd29ybGRSb3RhdGlvbjowLHdvcmxkU2NhbGVYOjEsd29ybGRTY2FsZVk6MSx3b3JsZEZsaXBYOiExLHdvcmxkRmxpcFk6ITEsdXBkYXRlV29ybGRUcmFuc2Zvcm06ZnVuY3Rpb24oKXt2YXIgYT10aGlzLnBhcmVudDtpZihhKXRoaXMud29ybGRYPXRoaXMueCphLm0wMCt0aGlzLnkqYS5tMDErYS53b3JsZFgsdGhpcy53b3JsZFk9dGhpcy54KmEubTEwK3RoaXMueSphLm0xMSthLndvcmxkWSx0aGlzLmRhdGEuaW5oZXJpdFNjYWxlPyh0aGlzLndvcmxkU2NhbGVYPWEud29ybGRTY2FsZVgqdGhpcy5zY2FsZVgsdGhpcy53b3JsZFNjYWxlWT1hLndvcmxkU2NhbGVZKnRoaXMuc2NhbGVZKToodGhpcy53b3JsZFNjYWxlWD10aGlzLnNjYWxlWCx0aGlzLndvcmxkU2NhbGVZPXRoaXMuc2NhbGVZKSx0aGlzLndvcmxkUm90YXRpb249dGhpcy5kYXRhLmluaGVyaXRSb3RhdGlvbj9hLndvcmxkUm90YXRpb24rdGhpcy5yb3RhdGlvbklLOnRoaXMucm90YXRpb25JSyx0aGlzLndvcmxkRmxpcFg9YS53b3JsZEZsaXBYIT10aGlzLmZsaXBYLHRoaXMud29ybGRGbGlwWT1hLndvcmxkRmxpcFkhPXRoaXMuZmxpcFk7ZWxzZXt2YXIgYj10aGlzLnNrZWxldG9uLmZsaXBYLGQ9dGhpcy5za2VsZXRvbi5mbGlwWTt0aGlzLndvcmxkWD1iPy10aGlzLng6dGhpcy54LHRoaXMud29ybGRZPWQhPWMuQm9uZS55RG93bj8tdGhpcy55OnRoaXMueSx0aGlzLndvcmxkU2NhbGVYPXRoaXMuc2NhbGVYLHRoaXMud29ybGRTY2FsZVk9dGhpcy5zY2FsZVksdGhpcy53b3JsZFJvdGF0aW9uPXRoaXMucm90YXRpb25JSyx0aGlzLndvcmxkRmxpcFg9YiE9dGhpcy5mbGlwWCx0aGlzLndvcmxkRmxpcFk9ZCE9dGhpcy5mbGlwWX12YXIgZT10aGlzLndvcmxkUm90YXRpb24qYy5kZWdSYWQsZj1NYXRoLmNvcyhlKSxnPU1hdGguc2luKGUpO3RoaXMud29ybGRGbGlwWD8odGhpcy5tMDA9LWYqdGhpcy53b3JsZFNjYWxlWCx0aGlzLm0wMT1nKnRoaXMud29ybGRTY2FsZVkpOih0aGlzLm0wMD1mKnRoaXMud29ybGRTY2FsZVgsdGhpcy5tMDE9LWcqdGhpcy53b3JsZFNjYWxlWSksdGhpcy53b3JsZEZsaXBZIT1jLkJvbmUueURvd24/KHRoaXMubTEwPS1nKnRoaXMud29ybGRTY2FsZVgsdGhpcy5tMTE9LWYqdGhpcy53b3JsZFNjYWxlWSk6KHRoaXMubTEwPWcqdGhpcy53b3JsZFNjYWxlWCx0aGlzLm0xMT1mKnRoaXMud29ybGRTY2FsZVkpfSxzZXRUb1NldHVwUG9zZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuZGF0YTt0aGlzLng9YS54LHRoaXMueT1hLnksdGhpcy5yb3RhdGlvbj1hLnJvdGF0aW9uLHRoaXMucm90YXRpb25JSz10aGlzLnJvdGF0aW9uLHRoaXMuc2NhbGVYPWEuc2NhbGVYLHRoaXMuc2NhbGVZPWEuc2NhbGVZLHRoaXMuZmxpcFg9YS5mbGlwWCx0aGlzLmZsaXBZPWEuZmxpcFl9LHdvcmxkVG9Mb2NhbDpmdW5jdGlvbihhKXt2YXIgYj1hWzBdLXRoaXMud29ybGRYLGQ9YVsxXS10aGlzLndvcmxkWSxlPXRoaXMubTAwLGY9dGhpcy5tMTAsZz10aGlzLm0wMSxoPXRoaXMubTExO3RoaXMud29ybGRGbGlwWCE9KHRoaXMud29ybGRGbGlwWSE9Yy5Cb25lLnlEb3duKSYmKGU9LWUsaD0taCk7dmFyIGk9MS8oZSpoLWcqZik7YVswXT1iKmUqaS1kKmcqaSxhWzFdPWQqaCppLWIqZippfSxsb2NhbFRvV29ybGQ6ZnVuY3Rpb24oYSl7dmFyIGI9YVswXSxjPWFbMV07YVswXT1iKnRoaXMubTAwK2MqdGhpcy5tMDErdGhpcy53b3JsZFgsYVsxXT1iKnRoaXMubTEwK2MqdGhpcy5tMTErdGhpcy53b3JsZFl9fSxjLlNsb3Q9ZnVuY3Rpb24oYSxiKXt0aGlzLmRhdGE9YSx0aGlzLmJvbmU9Yix0aGlzLnNldFRvU2V0dXBQb3NlKCl9LGMuU2xvdC5wcm90b3R5cGU9e3I6MSxnOjEsYjoxLGE6MSxfYXR0YWNobWVudFRpbWU6MCxhdHRhY2htZW50Om51bGwsYXR0YWNobWVudFZlcnRpY2VzOltdLHNldEF0dGFjaG1lbnQ6ZnVuY3Rpb24oYSl7dGhpcy5hdHRhY2htZW50PWEsdGhpcy5fYXR0YWNobWVudFRpbWU9dGhpcy5ib25lLnNrZWxldG9uLnRpbWUsdGhpcy5hdHRhY2htZW50VmVydGljZXMubGVuZ3RoPTB9LHNldEF0dGFjaG1lbnRUaW1lOmZ1bmN0aW9uKGEpe3RoaXMuX2F0dGFjaG1lbnRUaW1lPXRoaXMuYm9uZS5za2VsZXRvbi50aW1lLWF9LGdldEF0dGFjaG1lbnRUaW1lOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYm9uZS5za2VsZXRvbi50aW1lLXRoaXMuX2F0dGFjaG1lbnRUaW1lfSxzZXRUb1NldHVwUG9zZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMuZGF0YTt0aGlzLnI9YS5yLHRoaXMuZz1hLmcsdGhpcy5iPWEuYix0aGlzLmE9YS5hO2Zvcih2YXIgYj10aGlzLmJvbmUuc2tlbGV0b24uZGF0YS5zbG90cyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY109PWEpe3RoaXMuc2V0QXR0YWNobWVudChhLmF0dGFjaG1lbnROYW1lP3RoaXMuYm9uZS5za2VsZXRvbi5nZXRBdHRhY2htZW50QnlTbG90SW5kZXgoYyxhLmF0dGFjaG1lbnROYW1lKTpudWxsKTticmVha319fSxjLklrQ29uc3RyYWludD1mdW5jdGlvbihhLGIpe3RoaXMuZGF0YT1hLHRoaXMubWl4PWEubWl4LHRoaXMuYmVuZERpcmVjdGlvbj1hLmJlbmREaXJlY3Rpb24sdGhpcy5ib25lcz1bXTtmb3IodmFyIGM9MCxkPWEuYm9uZXMubGVuZ3RoO2Q+YztjKyspdGhpcy5ib25lcy5wdXNoKGIuZmluZEJvbmUoYS5ib25lc1tjXS5uYW1lKSk7dGhpcy50YXJnZXQ9Yi5maW5kQm9uZShhLnRhcmdldC5uYW1lKX0sYy5Ja0NvbnN0cmFpbnQucHJvdG90eXBlPXthcHBseTpmdW5jdGlvbigpe3ZhciBhPXRoaXMudGFyZ2V0LGI9dGhpcy5ib25lcztzd2l0Y2goYi5sZW5ndGgpe2Nhc2UgMTpjLklrQ29uc3RyYWludC5hcHBseTEoYlswXSxhLndvcmxkWCxhLndvcmxkWSx0aGlzLm1peCk7YnJlYWs7Y2FzZSAyOmMuSWtDb25zdHJhaW50LmFwcGx5MihiWzBdLGJbMV0sYS53b3JsZFgsYS53b3JsZFksdGhpcy5iZW5kRGlyZWN0aW9uLHRoaXMubWl4KX19fSxjLklrQ29uc3RyYWludC5hcHBseTE9ZnVuY3Rpb24oYSxiLGQsZSl7dmFyIGY9YS5kYXRhLmluaGVyaXRSb3RhdGlvbiYmYS5wYXJlbnQ/YS5wYXJlbnQud29ybGRSb3RhdGlvbjowLGc9YS5yb3RhdGlvbixoPU1hdGguYXRhbjIoZC1hLndvcmxkWSxiLWEud29ybGRYKSpjLnJhZERlZy1mO2Eucm90YXRpb25JSz1nKyhoLWcpKmV9LGMuSWtDb25zdHJhaW50LmFwcGx5Mj1mdW5jdGlvbihhLGIsZCxlLGYsZyl7dmFyIGg9Yi5yb3RhdGlvbixpPWEucm90YXRpb247aWYoIWcpcmV0dXJuIGIucm90YXRpb25JSz1oLGEucm90YXRpb25JSz1pLHZvaWQgMDt2YXIgaixrLGw9Yy50ZW1wLG09YS5wYXJlbnQ7bT8obFswXT1kLGxbMV09ZSxtLndvcmxkVG9Mb2NhbChsKSxkPShsWzBdLWEueCkqbS53b3JsZFNjYWxlWCxlPShsWzFdLWEueSkqbS53b3JsZFNjYWxlWSk6KGQtPWEueCxlLT1hLnkpLGIucGFyZW50PT1hPyhqPWIueCxrPWIueSk6KGxbMF09Yi54LGxbMV09Yi55LGIucGFyZW50LmxvY2FsVG9Xb3JsZChsKSxhLndvcmxkVG9Mb2NhbChsKSxqPWxbMF0saz1sWzFdKTt2YXIgbj1qKmEud29ybGRTY2FsZVgsbz1rKmEud29ybGRTY2FsZVkscD1NYXRoLmF0YW4yKG8sbikscT1NYXRoLnNxcnQobipuK28qbykscj1iLmRhdGEubGVuZ3RoKmIud29ybGRTY2FsZVgscz0yKnEqcjtpZigxZS00PnMpcmV0dXJuIGIucm90YXRpb25JSz1oKyhNYXRoLmF0YW4yKGUsZCkqYy5yYWREZWctaS1oKSpnLHZvaWQgMDt2YXIgdD0oZCpkK2UqZS1xKnEtcipyKS9zOy0xPnQ/dD0tMTp0PjEmJih0PTEpO3ZhciB1PU1hdGguYWNvcyh0KSpmLHY9cStyKnQsdz1yKk1hdGguc2luKHUpLHg9TWF0aC5hdGFuMihlKnYtZCp3LGQqditlKncpLHk9KHgtcCkqYy5yYWREZWctaTt5PjE4MD95LT0zNjA6LTE4MD55JiYoeSs9MzYwKSxhLnJvdGF0aW9uSUs9aSt5KmcseT0odStwKSpjLnJhZERlZy1oLHk+MTgwP3ktPTM2MDotMTgwPnkmJih5Kz0zNjApLGIucm90YXRpb25JSz1oKyh5K2Eud29ybGRSb3RhdGlvbi1iLnBhcmVudC53b3JsZFJvdGF0aW9uKSpnfSxjLlNraW49ZnVuY3Rpb24oYSl7dGhpcy5uYW1lPWEsdGhpcy5hdHRhY2htZW50cz17fX0sYy5Ta2luLnByb3RvdHlwZT17YWRkQXR0YWNobWVudDpmdW5jdGlvbihhLGIsYyl7dGhpcy5hdHRhY2htZW50c1thK1wiOlwiK2JdPWN9LGdldEF0dGFjaG1lbnQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5hdHRhY2htZW50c1thK1wiOlwiK2JdfSxfYXR0YWNoQWxsOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjIGluIGIuYXR0YWNobWVudHMpe3ZhciBkPWMuaW5kZXhPZihcIjpcIiksZT1wYXJzZUludChjLnN1YnN0cmluZygwLGQpKSxmPWMuc3Vic3RyaW5nKGQrMSksZz1hLnNsb3RzW2VdO2lmKGcuYXR0YWNobWVudCYmZy5hdHRhY2htZW50Lm5hbWU9PWYpe3ZhciBoPXRoaXMuZ2V0QXR0YWNobWVudChlLGYpO2gmJmcuc2V0QXR0YWNobWVudChoKX19fX0sYy5BbmltYXRpb249ZnVuY3Rpb24oYSxiLGMpe3RoaXMubmFtZT1hLHRoaXMudGltZWxpbmVzPWIsdGhpcy5kdXJhdGlvbj1jfSxjLkFuaW1hdGlvbi5wcm90b3R5cGU9e2FwcGx5OmZ1bmN0aW9uKGEsYixjLGQsZSl7ZCYmMCE9dGhpcy5kdXJhdGlvbiYmKGMlPXRoaXMuZHVyYXRpb24sYiU9dGhpcy5kdXJhdGlvbik7Zm9yKHZhciBmPXRoaXMudGltZWxpbmVzLGc9MCxoPWYubGVuZ3RoO2g+ZztnKyspZltnXS5hcHBseShhLGIsYyxlLDEpfSxtaXg6ZnVuY3Rpb24oYSxiLGMsZCxlLGYpe2QmJjAhPXRoaXMuZHVyYXRpb24mJihjJT10aGlzLmR1cmF0aW9uLGIlPXRoaXMuZHVyYXRpb24pO2Zvcih2YXIgZz10aGlzLnRpbWVsaW5lcyxoPTAsaT1nLmxlbmd0aDtpPmg7aCsrKWdbaF0uYXBwbHkoYSxiLGMsZSxmKX19LGMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaD1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9MCxlPU1hdGguZmxvb3IoYS5sZW5ndGgvYyktMjtpZighZSlyZXR1cm4gYztmb3IodmFyIGY9ZT4+PjE7Oyl7aWYoYVsoZisxKSpjXTw9Yj9kPWYrMTplPWYsZD09ZSlyZXR1cm4oZCsxKSpjO2Y9ZCtlPj4+MX19LGMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaDE9ZnVuY3Rpb24oYSxiKXt2YXIgYz0wLGQ9YS5sZW5ndGgtMjtpZighZClyZXR1cm4gMTtmb3IodmFyIGU9ZD4+PjE7Oyl7aWYoYVtlKzFdPD1iP2M9ZSsxOmQ9ZSxjPT1kKXJldHVybiBjKzE7ZT1jK2Q+Pj4xfX0sYy5BbmltYXRpb24ubGluZWFyU2VhcmNoPWZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9MCxlPWEubGVuZ3RoLWM7ZT49ZDtkKz1jKWlmKGFbZF0+YilyZXR1cm4gZDtyZXR1cm4tMX0sYy5DdXJ2ZXM9ZnVuY3Rpb24oKXt0aGlzLmN1cnZlcz1bXX0sYy5DdXJ2ZXMucHJvdG90eXBlPXtzZXRMaW5lYXI6ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXNbMTkqYV09MH0sc2V0U3RlcHBlZDpmdW5jdGlvbihhKXt0aGlzLmN1cnZlc1sxOSphXT0xfSxzZXRDdXJ2ZTpmdW5jdGlvbihhLGIsYyxkLGUpe3ZhciBmPS4xLGc9ZipmLGg9ZypmLGk9MypmLGo9MypnLGs9NipnLGw9NipoLG09MiotYitkLG49MiotYytlLG89MyooYi1kKSsxLHA9MyooYy1lKSsxLHE9YippK20qaitvKmgscj1jKmkrbipqK3AqaCxzPW0qaytvKmwsdD1uKmsrcCpsLHU9bypsLHY9cCpsLHc9MTkqYSx4PXRoaXMuY3VydmVzO3hbdysrXT0yO2Zvcih2YXIgeT1xLHo9cixBPXcrMTktMTtBPnc7dys9Mil4W3ddPXkseFt3KzFdPXoscSs9cyxyKz10LHMrPXUsdCs9dix5Kz1xLHorPXJ9LGdldEN1cnZlUGVyY2VudDpmdW5jdGlvbihhLGIpe2I9MD5iPzA6Yj4xPzE6Yjt2YXIgYz10aGlzLmN1cnZlcyxkPTE5KmEsZT1jW2RdO2lmKDA9PT1lKXJldHVybiBiO2lmKDE9PWUpcmV0dXJuIDA7ZCsrO2Zvcih2YXIgZj0wLGc9ZCxoPWQrMTktMTtoPmQ7ZCs9MilpZihmPWNbZF0sZj49Yil7dmFyIGksajtyZXR1cm4gZD09Zz8oaT0wLGo9MCk6KGk9Y1tkLTJdLGo9Y1tkLTFdKSxqKyhjW2QrMV0taikqKGItaSkvKGYtaSl9dmFyIGs9Y1tkLTFdO3JldHVybiBrKygxLWspKihiLWYpLygxLWYpfX0sYy5Sb3RhdGVUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1uZXcgYy5DdXJ2ZXMoYSksdGhpcy5mcmFtZXM9W10sdGhpcy5mcmFtZXMubGVuZ3RoPTIqYX0sYy5Sb3RhdGVUaW1lbGluZS5wcm90b3R5cGU9e2JvbmVJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzJ9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXthKj0yLHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jfSxhcHBseTpmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnPXRoaXMuZnJhbWVzO2lmKCEoZDxnWzBdKSl7dmFyIGg9YS5ib25lc1t0aGlzLmJvbmVJbmRleF07aWYoZD49Z1tnLmxlbmd0aC0yXSl7Zm9yKHZhciBpPWguZGF0YS5yb3RhdGlvbitnW2cubGVuZ3RoLTFdLWgucm90YXRpb247aT4xODA7KWktPTM2MDtmb3IoOy0xODA+aTspaSs9MzYwO3JldHVybiBoLnJvdGF0aW9uKz1pKmYsdm9pZCAwfXZhciBqPWMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaChnLGQsMiksaz1nW2otMV0sbD1nW2pdLG09MS0oZC1sKS8oZ1tqLTJdLWwpO209dGhpcy5jdXJ2ZXMuZ2V0Q3VydmVQZXJjZW50KGovMi0xLG0pO2Zvcih2YXIgaT1nW2orMV0taztpPjE4MDspaS09MzYwO2Zvcig7LTE4MD5pOylpKz0zNjA7Zm9yKGk9aC5kYXRhLnJvdGF0aW9uKyhrK2kqbSktaC5yb3RhdGlvbjtpPjE4MDspaS09MzYwO2Zvcig7LTE4MD5pOylpKz0zNjA7aC5yb3RhdGlvbis9aSpmfX19LGMuVHJhbnNsYXRlVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD0zKmF9LGMuVHJhbnNsYXRlVGltZWxpbmUucHJvdG90eXBlPXtib25lSW5kZXg6MCxnZXRGcmFtZUNvdW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZnJhbWVzLmxlbmd0aC8zfSxzZXRGcmFtZTpmdW5jdGlvbihhLGIsYyxkKXthKj0zLHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jLHRoaXMuZnJhbWVzW2ErMl09ZH0sYXBwbHk6ZnVuY3Rpb24oYSxiLGQsZSxmKXt2YXIgZz10aGlzLmZyYW1lcztpZighKGQ8Z1swXSkpe3ZhciBoPWEuYm9uZXNbdGhpcy5ib25lSW5kZXhdO2lmKGQ+PWdbZy5sZW5ndGgtM10pcmV0dXJuIGgueCs9KGguZGF0YS54K2dbZy5sZW5ndGgtMl0taC54KSpmLGgueSs9KGguZGF0YS55K2dbZy5sZW5ndGgtMV0taC55KSpmLHZvaWQgMDt2YXIgaT1jLkFuaW1hdGlvbi5iaW5hcnlTZWFyY2goZyxkLDMpLGo9Z1tpLTJdLGs9Z1tpLTFdLGw9Z1tpXSxtPTEtKGQtbCkvKGdbaSstM10tbCk7bT10aGlzLmN1cnZlcy5nZXRDdXJ2ZVBlcmNlbnQoaS8zLTEsbSksaC54Kz0oaC5kYXRhLngraisoZ1tpKzFdLWopKm0taC54KSpmLGgueSs9KGguZGF0YS55K2srKGdbaSsyXS1rKSptLWgueSkqZn19fSxjLlNjYWxlVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD0zKmF9LGMuU2NhbGVUaW1lbGluZS5wcm90b3R5cGU9e2JvbmVJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzN9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjLGQpe2EqPTMsdGhpcy5mcmFtZXNbYV09Yix0aGlzLmZyYW1lc1thKzFdPWMsdGhpcy5mcmFtZXNbYSsyXT1kfSxhcHBseTpmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnPXRoaXMuZnJhbWVzO2lmKCEoZDxnWzBdKSl7dmFyIGg9YS5ib25lc1t0aGlzLmJvbmVJbmRleF07aWYoZD49Z1tnLmxlbmd0aC0zXSlyZXR1cm4gaC5zY2FsZVgrPShoLmRhdGEuc2NhbGVYKmdbZy5sZW5ndGgtMl0taC5zY2FsZVgpKmYsaC5zY2FsZVkrPShoLmRhdGEuc2NhbGVZKmdbZy5sZW5ndGgtMV0taC5zY2FsZVkpKmYsdm9pZCAwO3ZhciBpPWMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaChnLGQsMyksaj1nW2ktMl0saz1nW2ktMV0sbD1nW2ldLG09MS0oZC1sKS8oZ1tpKy0zXS1sKTttPXRoaXMuY3VydmVzLmdldEN1cnZlUGVyY2VudChpLzMtMSxtKSxoLnNjYWxlWCs9KGguZGF0YS5zY2FsZVgqKGorKGdbaSsxXS1qKSptKS1oLnNjYWxlWCkqZixoLnNjYWxlWSs9KGguZGF0YS5zY2FsZVkqKGsrKGdbaSsyXS1rKSptKS1oLnNjYWxlWSkqZn19fSxjLkNvbG9yVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD01KmF9LGMuQ29sb3JUaW1lbGluZS5wcm90b3R5cGU9e3Nsb3RJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzV9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjLGQsZSxmKXthKj01LHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jLHRoaXMuZnJhbWVzW2ErMl09ZCx0aGlzLmZyYW1lc1thKzNdPWUsdGhpcy5mcmFtZXNbYSs0XT1mfSxhcHBseTpmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnPXRoaXMuZnJhbWVzO2lmKCEoZDxnWzBdKSl7dmFyIGgsaSxqLGs7aWYoZD49Z1tnLmxlbmd0aC01XSl7dmFyIGw9Zy5sZW5ndGgtMTtoPWdbbC0zXSxpPWdbbC0yXSxqPWdbbC0xXSxrPWdbbF19ZWxzZXt2YXIgbT1jLkFuaW1hdGlvbi5iaW5hcnlTZWFyY2goZyxkLDUpLG49Z1ttLTRdLG89Z1ttLTNdLHA9Z1ttLTJdLHE9Z1ttLTFdLHI9Z1ttXSxzPTEtKGQtcikvKGdbbS01XS1yKTtzPXRoaXMuY3VydmVzLmdldEN1cnZlUGVyY2VudChtLzUtMSxzKSxoPW4rKGdbbSsxXS1uKSpzLGk9bysoZ1ttKzJdLW8pKnMsaj1wKyhnW20rM10tcCkqcyxrPXErKGdbbSs0XS1xKSpzfXZhciB0PWEuc2xvdHNbdGhpcy5zbG90SW5kZXhdOzE+Zj8odC5yKz0oaC10LnIpKmYsdC5nKz0oaS10LmcpKmYsdC5iKz0oai10LmIpKmYsdC5hKz0oay10LmEpKmYpOih0LnI9aCx0Lmc9aSx0LmI9aix0LmE9ayl9fX0sYy5BdHRhY2htZW50VGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD1hLHRoaXMuYXR0YWNobWVudE5hbWVzPVtdLHRoaXMuYXR0YWNobWVudE5hbWVzLmxlbmd0aD1hfSxjLkF0dGFjaG1lbnRUaW1lbGluZS5wcm90b3R5cGU9e3Nsb3RJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RofSxzZXRGcmFtZTpmdW5jdGlvbihhLGIsYyl7dGhpcy5mcmFtZXNbYV09Yix0aGlzLmF0dGFjaG1lbnROYW1lc1thXT1jfSxhcHBseTpmdW5jdGlvbihhLGIsZCl7dmFyIGU9dGhpcy5mcmFtZXM7aWYoZDxlWzBdKXJldHVybiBiPmQmJnRoaXMuYXBwbHkoYSxiLE51bWJlci5NQVhfVkFMVUUsbnVsbCwwKSx2b2lkIDA7Yj5kJiYoYj0tMSk7dmFyIGY9ZD49ZVtlLmxlbmd0aC0xXT9lLmxlbmd0aC0xOmMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaDEoZSxkKS0xO2lmKCEoZVtmXTxiKSl7dmFyIGc9dGhpcy5hdHRhY2htZW50TmFtZXNbZl07YS5zbG90c1t0aGlzLnNsb3RJbmRleF0uc2V0QXR0YWNobWVudChnP2EuZ2V0QXR0YWNobWVudEJ5U2xvdEluZGV4KHRoaXMuc2xvdEluZGV4LGcpOm51bGwpfX19LGMuRXZlbnRUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmZyYW1lcz1bXSx0aGlzLmZyYW1lcy5sZW5ndGg9YSx0aGlzLmV2ZW50cz1bXSx0aGlzLmV2ZW50cy5sZW5ndGg9YX0sYy5FdmVudFRpbWVsaW5lLnByb3RvdHlwZT17Z2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGh9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXt0aGlzLmZyYW1lc1thXT1iLHRoaXMuZXZlbnRzW2FdPWN9LGFwcGx5OmZ1bmN0aW9uKGEsYixkLGUsZil7aWYoZSl7dmFyIGc9dGhpcy5mcmFtZXMsaD1nLmxlbmd0aDtpZihiPmQpdGhpcy5hcHBseShhLGIsTnVtYmVyLk1BWF9WQUxVRSxlLGYpLGI9LTE7ZWxzZSBpZihiPj1nW2gtMV0pcmV0dXJuO2lmKCEoZDxnWzBdKSl7dmFyIGk7aWYoYjxnWzBdKWk9MDtlbHNle2k9Yy5BbmltYXRpb24uYmluYXJ5U2VhcmNoMShnLGIpO2Zvcih2YXIgaj1nW2ldO2k+MCYmZ1tpLTFdPT1qOylpLS19Zm9yKHZhciBrPXRoaXMuZXZlbnRzO2g+aSYmZD49Z1tpXTtpKyspZS5wdXNoKGtbaV0pfX19fSxjLkRyYXdPcmRlclRpbWVsaW5lPWZ1bmN0aW9uKGEpe3RoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD1hLHRoaXMuZHJhd09yZGVycz1bXSx0aGlzLmRyYXdPcmRlcnMubGVuZ3RoPWF9LGMuRHJhd09yZGVyVGltZWxpbmUucHJvdG90eXBlPXtnZXRGcmFtZUNvdW50OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZnJhbWVzLmxlbmd0aH0sc2V0RnJhbWU6ZnVuY3Rpb24oYSxiLGMpe3RoaXMuZnJhbWVzW2FdPWIsdGhpcy5kcmF3T3JkZXJzW2FdPWN9LGFwcGx5OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzLmZyYW1lcztpZighKGQ8ZVswXSkpe3ZhciBmO2Y9ZD49ZVtlLmxlbmd0aC0xXT9lLmxlbmd0aC0xOmMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaDEoZSxkKS0xO3ZhciBnPWEuZHJhd09yZGVyLGg9YS5zbG90cyxpPXRoaXMuZHJhd09yZGVyc1tmXTtpZihpKWZvcih2YXIgaj0wLGs9aS5sZW5ndGg7az5qO2orKylnW2pdPWEuc2xvdHNbaVtqXV07ZWxzZSBmb3IodmFyIGo9MCxrPWgubGVuZ3RoO2s+ajtqKyspZ1tqXT1oW2pdfX19LGMuRmZkVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD1hLHRoaXMuZnJhbWVWZXJ0aWNlcz1bXSx0aGlzLmZyYW1lVmVydGljZXMubGVuZ3RoPWF9LGMuRmZkVGltZWxpbmUucHJvdG90eXBlPXtzbG90SW5kZXg6MCxhdHRhY2htZW50OjAsZ2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGh9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXt0aGlzLmZyYW1lc1thXT1iLHRoaXMuZnJhbWVWZXJ0aWNlc1thXT1jfSxhcHBseTpmdW5jdGlvbihhLGIsZCxlLGYpe3ZhciBnPWEuc2xvdHNbdGhpcy5zbG90SW5kZXhdO2lmKGcuYXR0YWNobWVudD09dGhpcy5hdHRhY2htZW50KXt2YXIgaD10aGlzLmZyYW1lcztpZighKGQ8aFswXSkpe3ZhciBpPXRoaXMuZnJhbWVWZXJ0aWNlcyxqPWlbMF0ubGVuZ3RoLGs9Zy5hdHRhY2htZW50VmVydGljZXM7aWYoay5sZW5ndGghPWomJihmPTEpLGsubGVuZ3RoPWosZD49aFtoLmxlbmd0aC0xXSl7dmFyIGw9aVtoLmxlbmd0aC0xXTtpZigxPmYpZm9yKHZhciBtPTA7aj5tO20rKylrW21dKz0obFttXS1rW21dKSpmO2Vsc2UgZm9yKHZhciBtPTA7aj5tO20rKylrW21dPWxbbV19ZWxzZXt2YXIgbj1jLkFuaW1hdGlvbi5iaW5hcnlTZWFyY2gxKGgsZCksbz1oW25dLHA9MS0oZC1vKS8oaFtuLTFdLW8pO3A9dGhpcy5jdXJ2ZXMuZ2V0Q3VydmVQZXJjZW50KG4tMSwwPnA/MDpwPjE/MTpwKTt2YXIgcT1pW24tMV0scj1pW25dO2lmKDE+Zilmb3IodmFyIG09MDtqPm07bSsrKXt2YXIgcz1xW21dO2tbbV0rPShzKyhyW21dLXMpKnAta1ttXSkqZn1lbHNlIGZvcih2YXIgbT0wO2o+bTttKyspe3ZhciBzPXFbbV07a1ttXT1zKyhyW21dLXMpKnB9fX19fX0sYy5Ja0NvbnN0cmFpbnRUaW1lbGluZT1mdW5jdGlvbihhKXt0aGlzLmN1cnZlcz1uZXcgYy5DdXJ2ZXMoYSksdGhpcy5mcmFtZXM9W10sdGhpcy5mcmFtZXMubGVuZ3RoPTMqYX0sYy5Ja0NvbnN0cmFpbnRUaW1lbGluZS5wcm90b3R5cGU9e2lrQ29uc3RyYWludEluZGV4OjAsZ2V0RnJhbWVDb3VudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmZyYW1lcy5sZW5ndGgvM30sc2V0RnJhbWU6ZnVuY3Rpb24oYSxiLGMsZCl7YSo9Myx0aGlzLmZyYW1lc1thXT1iLHRoaXMuZnJhbWVzW2ErMV09Yyx0aGlzLmZyYW1lc1thKzJdPWR9LGFwcGx5OmZ1bmN0aW9uKGEsYixkLGUsZil7dmFyIGc9dGhpcy5mcmFtZXM7aWYoIShkPGdbMF0pKXt2YXIgaD1hLmlrQ29uc3RyYWludHNbdGhpcy5pa0NvbnN0cmFpbnRJbmRleF07aWYoZD49Z1tnLmxlbmd0aC0zXSlyZXR1cm4gaC5taXgrPShnW2cubGVuZ3RoLTJdLWgubWl4KSpmLGguYmVuZERpcmVjdGlvbj1nW2cubGVuZ3RoLTFdLHZvaWQgMDt2YXIgaT1jLkFuaW1hdGlvbi5iaW5hcnlTZWFyY2goZyxkLDMpLGo9Z1tpKy0yXSxrPWdbaV0sbD0xLShkLWspLyhnW2krLTNdLWspO2w9dGhpcy5jdXJ2ZXMuZ2V0Q3VydmVQZXJjZW50KGkvMy0xLGwpO3ZhciBtPWorKGdbaSsxXS1qKSpsO2gubWl4Kz0obS1oLm1peCkqZixoLmJlbmREaXJlY3Rpb249Z1tpKy0xXX19fSxjLkZsaXBYVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD0yKmF9LGMuRmxpcFhUaW1lbGluZS5wcm90b3R5cGU9e2JvbmVJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzJ9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXthKj0yLHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jPzE6MH0sYXBwbHk6ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPXRoaXMuZnJhbWVzO2lmKGQ8ZVswXSlyZXR1cm4gYj5kJiZ0aGlzLmFwcGx5KGEsYixOdW1iZXIuTUFYX1ZBTFVFLG51bGwsMCksdm9pZCAwO2I+ZCYmKGI9LTEpO3ZhciBmPShkPj1lW2UubGVuZ3RoLTJdP2UubGVuZ3RoOmMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaChlLGQsMikpLTI7ZVtmXTxifHwoYS5ib25lc1tib25lSW5kZXhdLmZsaXBYPTAhPWVbZisxXSl9fSxjLkZsaXBZVGltZWxpbmU9ZnVuY3Rpb24oYSl7dGhpcy5jdXJ2ZXM9bmV3IGMuQ3VydmVzKGEpLHRoaXMuZnJhbWVzPVtdLHRoaXMuZnJhbWVzLmxlbmd0aD0yKmF9LGMuRmxpcFlUaW1lbGluZS5wcm90b3R5cGU9e2JvbmVJbmRleDowLGdldEZyYW1lQ291bnQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5mcmFtZXMubGVuZ3RoLzJ9LHNldEZyYW1lOmZ1bmN0aW9uKGEsYixjKXthKj0yLHRoaXMuZnJhbWVzW2FdPWIsdGhpcy5mcmFtZXNbYSsxXT1jPzE6MH0sYXBwbHk6ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPXRoaXMuZnJhbWVzO2lmKGQ8ZVswXSlyZXR1cm4gYj5kJiZ0aGlzLmFwcGx5KGEsYixOdW1iZXIuTUFYX1ZBTFVFLG51bGwsMCksdm9pZCAwO2I+ZCYmKGI9LTEpO3ZhciBmPShkPj1lW2UubGVuZ3RoLTJdP2UubGVuZ3RoOmMuQW5pbWF0aW9uLmJpbmFyeVNlYXJjaChlLGQsMikpLTI7ZVtmXTxifHwoYS5ib25lc1tib25lSW5kZXhdLmZsaXBZPTAhPWVbZisxXSl9fSxjLlNrZWxldG9uRGF0YT1mdW5jdGlvbigpe3RoaXMuYm9uZXM9W10sdGhpcy5zbG90cz1bXSx0aGlzLnNraW5zPVtdLHRoaXMuZXZlbnRzPVtdLHRoaXMuYW5pbWF0aW9ucz1bXSx0aGlzLmlrQ29uc3RyYWludHM9W119LGMuU2tlbGV0b25EYXRhLnByb3RvdHlwZT17bmFtZTpudWxsLGRlZmF1bHRTa2luOm51bGwsd2lkdGg6MCxoZWlnaHQ6MCx2ZXJzaW9uOm51bGwsaGFzaDpudWxsLGZpbmRCb25lOmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLmJvbmVzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfSxmaW5kQm9uZUluZGV4OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLmJvbmVzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBjO3JldHVybi0xfSxmaW5kU2xvdDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5zbG90cyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10ubmFtZT09YSlyZXR1cm4gc2xvdFtjXTtyZXR1cm4gbnVsbH0sZmluZFNsb3RJbmRleDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5zbG90cyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10ubmFtZT09YSlyZXR1cm4gYztyZXR1cm4tMX0sZmluZFNraW46ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuc2tpbnMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9LGZpbmRFdmVudDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5ldmVudHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9LGZpbmRBbmltYXRpb246ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuYW5pbWF0aW9ucyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10ubmFtZT09YSlyZXR1cm4gYltjXTtyZXR1cm4gbnVsbH0sZmluZElrQ29uc3RyYWludDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5pa0NvbnN0cmFpbnRzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfX0sYy5Ta2VsZXRvbj1mdW5jdGlvbihhKXt0aGlzLmRhdGE9YSx0aGlzLmJvbmVzPVtdO2Zvcih2YXIgYj0wLGQ9YS5ib25lcy5sZW5ndGg7ZD5iO2IrKyl7dmFyIGU9YS5ib25lc1tiXSxmPWUucGFyZW50P3RoaXMuYm9uZXNbYS5ib25lcy5pbmRleE9mKGUucGFyZW50KV06bnVsbDt0aGlzLmJvbmVzLnB1c2gobmV3IGMuQm9uZShlLHRoaXMsZikpfXRoaXMuc2xvdHM9W10sdGhpcy5kcmF3T3JkZXI9W107Zm9yKHZhciBiPTAsZD1hLnNsb3RzLmxlbmd0aDtkPmI7YisrKXt2YXIgZz1hLnNsb3RzW2JdLGg9dGhpcy5ib25lc1thLmJvbmVzLmluZGV4T2YoZy5ib25lRGF0YSldLGk9bmV3IGMuU2xvdChnLGgpO3RoaXMuc2xvdHMucHVzaChpKSx0aGlzLmRyYXdPcmRlci5wdXNoKGkpfXRoaXMuaWtDb25zdHJhaW50cz1bXTtmb3IodmFyIGI9MCxkPWEuaWtDb25zdHJhaW50cy5sZW5ndGg7ZD5iO2IrKyl0aGlzLmlrQ29uc3RyYWludHMucHVzaChuZXcgYy5Ja0NvbnN0cmFpbnQoYS5pa0NvbnN0cmFpbnRzW2JdLHRoaXMpKTt0aGlzLmJvbmVDYWNoZT1bXSx0aGlzLnVwZGF0ZUNhY2hlKCl9LGMuU2tlbGV0b24ucHJvdG90eXBlPXt4OjAseTowLHNraW46bnVsbCxyOjEsZzoxLGI6MSxhOjEsdGltZTowLGZsaXBYOiExLGZsaXBZOiExLHVwZGF0ZUNhY2hlOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5pa0NvbnN0cmFpbnRzLGI9YS5sZW5ndGgsYz1iKzEsZD10aGlzLmJvbmVDYWNoZTtkLmxlbmd0aD5jJiYoZC5sZW5ndGg9Yyk7Zm9yKHZhciBlPTAsZj1kLmxlbmd0aDtmPmU7ZSsrKWRbZV0ubGVuZ3RoPTA7Zm9yKDtkLmxlbmd0aDxjOylkW2QubGVuZ3RoXT1bXTt2YXIgZz1kWzBdLGg9dGhpcy5ib25lczthOmZvcih2YXIgZT0wLGY9aC5sZW5ndGg7Zj5lO2UrKyl7dmFyIGk9aFtlXSxqPWk7ZG97Zm9yKHZhciBrPTA7Yj5rO2srKylmb3IodmFyIGw9YVtrXSxtPWwuYm9uZXNbMF0sbj1sLmJvbmVzW2wuYm9uZXMubGVuZ3RoLTFdOzspe2lmKGo9PW4pe2Rba10ucHVzaChpKSxkW2srMV0ucHVzaChpKTtjb250aW51ZSBhfWlmKG49PW0pYnJlYWs7bj1uLnBhcmVudH1qPWoucGFyZW50fXdoaWxlKGopO2dbZy5sZW5ndGhdPWl9fSx1cGRhdGVXb3JsZFRyYW5zZm9ybTpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzLmJvbmVzLGI9MCxjPWEubGVuZ3RoO2M+YjtiKyspe3ZhciBkPWFbYl07ZC5yb3RhdGlvbklLPWQucm90YXRpb259Zm9yKHZhciBiPTAsZT10aGlzLmJvbmVDYWNoZS5sZW5ndGgtMTs7KXtmb3IodmFyIGY9dGhpcy5ib25lQ2FjaGVbYl0sZz0wLGg9Zi5sZW5ndGg7aD5nO2crKylmW2ddLnVwZGF0ZVdvcmxkVHJhbnNmb3JtKCk7aWYoYj09ZSlicmVhazt0aGlzLmlrQ29uc3RyYWludHNbYl0uYXBwbHkoKSxiKyt9fSxzZXRUb1NldHVwUG9zZTpmdW5jdGlvbigpe3RoaXMuc2V0Qm9uZXNUb1NldHVwUG9zZSgpLHRoaXMuc2V0U2xvdHNUb1NldHVwUG9zZSgpfSxzZXRCb25lc1RvU2V0dXBQb3NlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMuYm9uZXMsYj0wLGM9YS5sZW5ndGg7Yz5iO2IrKylhW2JdLnNldFRvU2V0dXBQb3NlKCk7Zm9yKHZhciBkPXRoaXMuaWtDb25zdHJhaW50cyxiPTAsYz1kLmxlbmd0aDtjPmI7YisrKXt2YXIgZT1kW2JdO2UuYmVuZERpcmVjdGlvbj1lLmRhdGEuYmVuZERpcmVjdGlvbixlLm1peD1lLmRhdGEubWl4fX0sc2V0U2xvdHNUb1NldHVwUG9zZTpmdW5jdGlvbigpe2Zvcih2YXIgYT10aGlzLnNsb3RzLGI9dGhpcy5kcmF3T3JkZXIsYz0wLGQ9YS5sZW5ndGg7ZD5jO2MrKyliW2NdPWFbY10sYVtjXS5zZXRUb1NldHVwUG9zZShjKX0sZ2V0Um9vdEJvbmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ib25lcy5sZW5ndGg/dGhpcy5ib25lc1swXTpudWxsfSxmaW5kQm9uZTpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5ib25lcyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKWlmKGJbY10uZGF0YS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfSxmaW5kQm9uZUluZGV4OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLmJvbmVzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5kYXRhLm5hbWU9PWEpcmV0dXJuIGM7cmV0dXJuLTF9LGZpbmRTbG90OmZ1bmN0aW9uKGEpe2Zvcih2YXIgYj10aGlzLnNsb3RzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5kYXRhLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9LGZpbmRTbG90SW5kZXg6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKylpZihiW2NdLmRhdGEubmFtZT09YSlyZXR1cm4gYztyZXR1cm4tMX0sc2V0U2tpbkJ5TmFtZTpmdW5jdGlvbihhKXt2YXIgYj10aGlzLmRhdGEuZmluZFNraW4oYSk7aWYoIWIpdGhyb3dcIlNraW4gbm90IGZvdW5kOiBcIithO3RoaXMuc2V0U2tpbihiKX0sc2V0U2tpbjpmdW5jdGlvbihhKXtpZihhKWlmKHRoaXMuc2tpbilhLl9hdHRhY2hBbGwodGhpcyx0aGlzLnNraW4pO2Vsc2UgZm9yKHZhciBiPXRoaXMuc2xvdHMsYz0wLGQ9Yi5sZW5ndGg7ZD5jO2MrKyl7dmFyIGU9YltjXSxmPWUuZGF0YS5hdHRhY2htZW50TmFtZTtpZihmKXt2YXIgZz1hLmdldEF0dGFjaG1lbnQoYyxmKTtnJiZlLnNldEF0dGFjaG1lbnQoZyl9fXRoaXMuc2tpbj1hfSxnZXRBdHRhY2htZW50QnlTbG90TmFtZTpmdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLmdldEF0dGFjaG1lbnRCeVNsb3RJbmRleCh0aGlzLmRhdGEuZmluZFNsb3RJbmRleChhKSxiKX0sZ2V0QXR0YWNobWVudEJ5U2xvdEluZGV4OmZ1bmN0aW9uKGEsYil7aWYodGhpcy5za2luKXt2YXIgYz10aGlzLnNraW4uZ2V0QXR0YWNobWVudChhLGIpO2lmKGMpcmV0dXJuIGN9cmV0dXJuIHRoaXMuZGF0YS5kZWZhdWx0U2tpbj90aGlzLmRhdGEuZGVmYXVsdFNraW4uZ2V0QXR0YWNobWVudChhLGIpOm51bGx9LHNldEF0dGFjaG1lbnQ6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9dGhpcy5zbG90cyxkPTAsZT1jLmxlbmd0aDtlPmQ7ZCsrKXt2YXIgZj1jW2RdO2lmKGYuZGF0YS5uYW1lPT1hKXt2YXIgZz1udWxsO2lmKGImJihnPXRoaXMuZ2V0QXR0YWNobWVudEJ5U2xvdEluZGV4KGQsYiksIWcpKXRocm93XCJBdHRhY2htZW50IG5vdCBmb3VuZDogXCIrYitcIiwgZm9yIHNsb3Q6IFwiK2E7cmV0dXJuIGYuc2V0QXR0YWNobWVudChnKSx2b2lkIDB9fXRocm93XCJTbG90IG5vdCBmb3VuZDogXCIrYX0sZmluZElrQ29uc3RyYWludDpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5pa0NvbnN0cmFpbnRzLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5kYXRhLm5hbWU9PWEpcmV0dXJuIGJbY107cmV0dXJuIG51bGx9LHVwZGF0ZTpmdW5jdGlvbihhKXt0aGlzLnRpbWUrPWF9fSxjLkV2ZW50RGF0YT1mdW5jdGlvbihhKXt0aGlzLm5hbWU9YX0sYy5FdmVudERhdGEucHJvdG90eXBlPXtpbnRWYWx1ZTowLGZsb2F0VmFsdWU6MCxzdHJpbmdWYWx1ZTpudWxsfSxjLkV2ZW50PWZ1bmN0aW9uKGEpe3RoaXMuZGF0YT1hfSxjLkV2ZW50LnByb3RvdHlwZT17aW50VmFsdWU6MCxmbG9hdFZhbHVlOjAsc3RyaW5nVmFsdWU6bnVsbH0sYy5BdHRhY2htZW50VHlwZT17cmVnaW9uOjAsYm91bmRpbmdib3g6MSxtZXNoOjIsc2tpbm5lZG1lc2g6M30sYy5SZWdpb25BdHRhY2htZW50PWZ1bmN0aW9uKGEpe3RoaXMubmFtZT1hLHRoaXMub2Zmc2V0PVtdLHRoaXMub2Zmc2V0Lmxlbmd0aD04LHRoaXMudXZzPVtdLHRoaXMudXZzLmxlbmd0aD04fSxjLlJlZ2lvbkF0dGFjaG1lbnQucHJvdG90eXBlPXt0eXBlOmMuQXR0YWNobWVudFR5cGUucmVnaW9uLHg6MCx5OjAscm90YXRpb246MCxzY2FsZVg6MSxzY2FsZVk6MSx3aWR0aDowLGhlaWdodDowLHI6MSxnOjEsYjoxLGE6MSxwYXRoOm51bGwscmVuZGVyZXJPYmplY3Q6bnVsbCxyZWdpb25PZmZzZXRYOjAscmVnaW9uT2Zmc2V0WTowLHJlZ2lvbldpZHRoOjAscmVnaW9uSGVpZ2h0OjAscmVnaW9uT3JpZ2luYWxXaWR0aDowLHJlZ2lvbk9yaWdpbmFsSGVpZ2h0OjAsc2V0VVZzOmZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9dGhpcy51dnM7ZT8oZlsyXT1hLGZbM109ZCxmWzRdPWEsZls1XT1iLGZbNl09YyxmWzddPWIsZlswXT1jLGZbMV09ZCk6KGZbMF09YSxmWzFdPWQsZlsyXT1hLGZbM109YixmWzRdPWMsZls1XT1iLGZbNl09YyxmWzddPWQpfSx1cGRhdGVPZmZzZXQ6ZnVuY3Rpb24oKXt2YXIgYT10aGlzLndpZHRoL3RoaXMucmVnaW9uT3JpZ2luYWxXaWR0aCp0aGlzLnNjYWxlWCxiPXRoaXMuaGVpZ2h0L3RoaXMucmVnaW9uT3JpZ2luYWxIZWlnaHQqdGhpcy5zY2FsZVksZD0tdGhpcy53aWR0aC8yKnRoaXMuc2NhbGVYK3RoaXMucmVnaW9uT2Zmc2V0WCphLGU9LXRoaXMuaGVpZ2h0LzIqdGhpcy5zY2FsZVkrdGhpcy5yZWdpb25PZmZzZXRZKmIsZj1kK3RoaXMucmVnaW9uV2lkdGgqYSxnPWUrdGhpcy5yZWdpb25IZWlnaHQqYixoPXRoaXMucm90YXRpb24qYy5kZWdSYWQsaT1NYXRoLmNvcyhoKSxqPU1hdGguc2luKGgpLGs9ZCppK3RoaXMueCxsPWQqaixtPWUqaSt0aGlzLnksbj1lKmosbz1mKmkrdGhpcy54LHA9ZipqLHE9ZyppK3RoaXMueSxyPWcqaixzPXRoaXMub2Zmc2V0O3NbMF09ay1uLHNbMV09bStsLHNbMl09ay1yLHNbM109cStsLHNbNF09by1yLHNbNV09cStwLHNbNl09by1uLHNbN109bStwfSxjb21wdXRlVmVydGljZXM6ZnVuY3Rpb24oYSxiLGMsZCl7YSs9Yy53b3JsZFgsYis9Yy53b3JsZFk7dmFyIGU9Yy5tMDAsZj1jLm0wMSxnPWMubTEwLGg9Yy5tMTEsaT10aGlzLm9mZnNldDtkWzBdPWlbMF0qZStpWzFdKmYrYSxkWzFdPWlbMF0qZytpWzFdKmgrYixkWzJdPWlbMl0qZStpWzNdKmYrYSxkWzNdPWlbMl0qZytpWzNdKmgrYixkWzRdPWlbNF0qZStpWzVdKmYrYSxkWzVdPWlbNF0qZytpWzVdKmgrYixkWzZdPWlbNl0qZStpWzddKmYrYSxkWzddPWlbNl0qZytpWzddKmgrYn19LGMuTWVzaEF0dGFjaG1lbnQ9ZnVuY3Rpb24oYSl7dGhpcy5uYW1lPWF9LGMuTWVzaEF0dGFjaG1lbnQucHJvdG90eXBlPXt0eXBlOmMuQXR0YWNobWVudFR5cGUubWVzaCx2ZXJ0aWNlczpudWxsLHV2czpudWxsLHJlZ2lvblVWczpudWxsLHRyaWFuZ2xlczpudWxsLGh1bGxMZW5ndGg6MCxyOjEsZzoxLGI6MSxhOjEscGF0aDpudWxsLHJlbmRlcmVyT2JqZWN0Om51bGwscmVnaW9uVTowLHJlZ2lvblY6MCxyZWdpb25VMjowLHJlZ2lvblYyOjAscmVnaW9uUm90YXRlOiExLHJlZ2lvbk9mZnNldFg6MCxyZWdpb25PZmZzZXRZOjAscmVnaW9uV2lkdGg6MCxyZWdpb25IZWlnaHQ6MCxyZWdpb25PcmlnaW5hbFdpZHRoOjAscmVnaW9uT3JpZ2luYWxIZWlnaHQ6MCxlZGdlczpudWxsLHdpZHRoOjAsaGVpZ2h0OjAsdXBkYXRlVVZzOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5yZWdpb25VMi10aGlzLnJlZ2lvblUsYj10aGlzLnJlZ2lvblYyLXRoaXMucmVnaW9uVixkPXRoaXMucmVnaW9uVVZzLmxlbmd0aDtpZih0aGlzLnV2cyYmdGhpcy51dnMubGVuZ3RoPT1kfHwodGhpcy51dnM9bmV3IGMuRmxvYXQzMkFycmF5KGQpKSx0aGlzLnJlZ2lvblJvdGF0ZSlmb3IodmFyIGU9MDtkPmU7ZSs9Mil0aGlzLnV2c1tlXT10aGlzLnJlZ2lvblUrdGhpcy5yZWdpb25VVnNbZSsxXSphLHRoaXMudXZzW2UrMV09dGhpcy5yZWdpb25WK2ItdGhpcy5yZWdpb25VVnNbZV0qYjtlbHNlIGZvcih2YXIgZT0wO2Q+ZTtlKz0yKXRoaXMudXZzW2VdPXRoaXMucmVnaW9uVSt0aGlzLnJlZ2lvblVWc1tlXSphLHRoaXMudXZzW2UrMV09dGhpcy5yZWdpb25WK3RoaXMucmVnaW9uVVZzW2UrMV0qYn0sY29tcHV0ZVdvcmxkVmVydGljZXM6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGU9Yy5ib25lO2ErPWUud29ybGRYLGIrPWUud29ybGRZO3ZhciBmPWUubTAwLGc9ZS5tMDEsaD1lLm0xMCxpPWUubTExLGo9dGhpcy52ZXJ0aWNlcyxrPWoubGVuZ3RoO2MuYXR0YWNobWVudFZlcnRpY2VzLmxlbmd0aD09ayYmKGo9Yy5hdHRhY2htZW50VmVydGljZXMpO2Zvcih2YXIgbD0wO2s+bDtsKz0yKXt2YXIgbT1qW2xdLG49altsKzFdO2RbbF09bSpmK24qZythLGRbbCsxXT1tKmgrbippK2J9fX0sYy5Ta2lubmVkTWVzaEF0dGFjaG1lbnQ9ZnVuY3Rpb24oYSl7dGhpcy5uYW1lPWF9LGMuU2tpbm5lZE1lc2hBdHRhY2htZW50LnByb3RvdHlwZT17dHlwZTpjLkF0dGFjaG1lbnRUeXBlLnNraW5uZWRtZXNoLGJvbmVzOm51bGwsd2VpZ2h0czpudWxsLHV2czpudWxsLHJlZ2lvblVWczpudWxsLHRyaWFuZ2xlczpudWxsLGh1bGxMZW5ndGg6MCxyOjEsZzoxLGI6MSxhOjEscGF0aDpudWxsLHJlbmRlcmVyT2JqZWN0Om51bGwscmVnaW9uVTowLHJlZ2lvblY6MCxyZWdpb25VMjowLHJlZ2lvblYyOjAscmVnaW9uUm90YXRlOiExLHJlZ2lvbk9mZnNldFg6MCxyZWdpb25PZmZzZXRZOjAscmVnaW9uV2lkdGg6MCxyZWdpb25IZWlnaHQ6MCxyZWdpb25PcmlnaW5hbFdpZHRoOjAscmVnaW9uT3JpZ2luYWxIZWlnaHQ6MCxlZGdlczpudWxsLHdpZHRoOjAsaGVpZ2h0OjAsdXBkYXRlVVZzOmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5yZWdpb25VMi10aGlzLnJlZ2lvblUsYj10aGlzLnJlZ2lvblYyLXRoaXMucmVnaW9uVixkPXRoaXMucmVnaW9uVVZzLmxlbmd0aDtpZih0aGlzLnV2cyYmdGhpcy51dnMubGVuZ3RoPT1kfHwodGhpcy51dnM9bmV3IGMuRmxvYXQzMkFycmF5KGQpKSx0aGlzLnJlZ2lvblJvdGF0ZSlmb3IodmFyIGU9MDtkPmU7ZSs9Mil0aGlzLnV2c1tlXT10aGlzLnJlZ2lvblUrdGhpcy5yZWdpb25VVnNbZSsxXSphLHRoaXMudXZzW2UrMV09dGhpcy5yZWdpb25WK2ItdGhpcy5yZWdpb25VVnNbZV0qYjtlbHNlIGZvcih2YXIgZT0wO2Q+ZTtlKz0yKXRoaXMudXZzW2VdPXRoaXMucmVnaW9uVSt0aGlzLnJlZ2lvblVWc1tlXSphLHRoaXMudXZzW2UrMV09dGhpcy5yZWdpb25WK3RoaXMucmVnaW9uVVZzW2UrMV0qYn0sY29tcHV0ZVdvcmxkVmVydGljZXM6ZnVuY3Rpb24oYSxiLGMsZCl7dmFyIGUsZixnLGgsaSxqLGssbD1jLmJvbmUuc2tlbGV0b24uYm9uZXMsbT10aGlzLndlaWdodHMsbj10aGlzLmJvbmVzLG89MCxwPTAscT0wLHI9MCxzPW4ubGVuZ3RoO2lmKGMuYXR0YWNobWVudFZlcnRpY2VzLmxlbmd0aClmb3IodmFyIHQ9Yy5hdHRhY2htZW50VmVydGljZXM7cz5wO28rPTIpe2ZvcihmPTAsZz0wLGU9bltwKytdK3A7ZT5wO3ArKyxxKz0zLHIrPTIpaD1sW25bcF1dLGk9bVtxXSt0W3JdLGo9bVtxKzFdK3RbcisxXSxrPW1bcSsyXSxmKz0oaSpoLm0wMCtqKmgubTAxK2gud29ybGRYKSprLGcrPShpKmgubTEwK2oqaC5tMTEraC53b3JsZFkpKms7ZFtvXT1mK2EsZFtvKzFdPWcrYn1lbHNlIGZvcig7cz5wO28rPTIpe2ZvcihmPTAsZz0wLGU9bltwKytdK3A7ZT5wO3ArKyxxKz0zKWg9bFtuW3BdXSxpPW1bcV0saj1tW3ErMV0saz1tW3ErMl0sZis9KGkqaC5tMDAraipoLm0wMStoLndvcmxkWCkqayxnKz0oaSpoLm0xMCtqKmgubTExK2gud29ybGRZKSprO2Rbb109ZithLGRbbysxXT1nK2J9fX0sYy5Cb3VuZGluZ0JveEF0dGFjaG1lbnQ9ZnVuY3Rpb24oYSl7dGhpcy5uYW1lPWEsdGhpcy52ZXJ0aWNlcz1bXX0sYy5Cb3VuZGluZ0JveEF0dGFjaG1lbnQucHJvdG90eXBlPXt0eXBlOmMuQXR0YWNobWVudFR5cGUuYm91bmRpbmdib3gsY29tcHV0ZVdvcmxkVmVydGljZXM6ZnVuY3Rpb24oYSxiLGMsZCl7YSs9Yy53b3JsZFgsYis9Yy53b3JsZFk7Zm9yKHZhciBlPWMubTAwLGY9Yy5tMDEsZz1jLm0xMCxoPWMubTExLGk9dGhpcy52ZXJ0aWNlcyxqPTAsaz1pLmxlbmd0aDtrPmo7ais9Mil7dmFyIGw9aVtqXSxtPWlbaisxXTtkW2pdPWwqZSttKmYrYSxkW2orMV09bCpnK20qaCtifX19LGMuQW5pbWF0aW9uU3RhdGVEYXRhPWZ1bmN0aW9uKGEpe3RoaXMuc2tlbGV0b25EYXRhPWEsdGhpcy5hbmltYXRpb25Ub01peFRpbWU9e319LGMuQW5pbWF0aW9uU3RhdGVEYXRhLnByb3RvdHlwZT17ZGVmYXVsdE1peDowLHNldE1peEJ5TmFtZTpmdW5jdGlvbihhLGIsYyl7dmFyIGQ9dGhpcy5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihhKTtpZighZCl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYTt2YXIgZT10aGlzLnNrZWxldG9uRGF0YS5maW5kQW5pbWF0aW9uKGIpO2lmKCFlKXRocm93XCJBbmltYXRpb24gbm90IGZvdW5kOiBcIitiO3RoaXMuc2V0TWl4KGQsZSxjKX0sc2V0TWl4OmZ1bmN0aW9uKGEsYixjKXt0aGlzLmFuaW1hdGlvblRvTWl4VGltZVthLm5hbWUrXCI6XCIrYi5uYW1lXT1jfSxnZXRNaXg6ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLm5hbWUrXCI6XCIrYi5uYW1lO3JldHVybiB0aGlzLmFuaW1hdGlvblRvTWl4VGltZS5oYXNPd25Qcm9wZXJ0eShjKT90aGlzLmFuaW1hdGlvblRvTWl4VGltZVtjXTp0aGlzLmRlZmF1bHRNaXh9fSxjLlRyYWNrRW50cnk9ZnVuY3Rpb24oKXt9LGMuVHJhY2tFbnRyeS5wcm90b3R5cGU9e25leHQ6bnVsbCxwcmV2aW91czpudWxsLGFuaW1hdGlvbjpudWxsLGxvb3A6ITEsZGVsYXk6MCx0aW1lOjAsbGFzdFRpbWU6LTEsZW5kVGltZTowLHRpbWVTY2FsZToxLG1peFRpbWU6MCxtaXhEdXJhdGlvbjowLG1peDoxLG9uU3RhcnQ6bnVsbCxvbkVuZDpudWxsLG9uQ29tcGxldGU6bnVsbCxvbkV2ZW50Om51bGx9LGMuQW5pbWF0aW9uU3RhdGU9ZnVuY3Rpb24oYSl7dGhpcy5kYXRhPWEsdGhpcy50cmFja3M9W10sdGhpcy5ldmVudHM9W119LGMuQW5pbWF0aW9uU3RhdGUucHJvdG90eXBlPXtvblN0YXJ0Om51bGwsb25FbmQ6bnVsbCxvbkNvbXBsZXRlOm51bGwsb25FdmVudDpudWxsLHRpbWVTY2FsZToxLHVwZGF0ZTpmdW5jdGlvbihhKXthKj10aGlzLnRpbWVTY2FsZTtmb3IodmFyIGI9MDtiPHRoaXMudHJhY2tzLmxlbmd0aDtiKyspe3ZhciBjPXRoaXMudHJhY2tzW2JdO2lmKGMpe2lmKGMudGltZSs9YSpjLnRpbWVTY2FsZSxjLnByZXZpb3VzKXt2YXIgZD1hKmMucHJldmlvdXMudGltZVNjYWxlO2MucHJldmlvdXMudGltZSs9ZCxjLm1peFRpbWUrPWR9dmFyIGU9Yy5uZXh0O2U/KGUudGltZT1jLmxhc3RUaW1lLWUuZGVsYXksZS50aW1lPj0wJiZ0aGlzLnNldEN1cnJlbnQoYixlKSk6IWMubG9vcCYmYy5sYXN0VGltZT49Yy5lbmRUaW1lJiZ0aGlzLmNsZWFyVHJhY2soYil9fX0sYXBwbHk6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPTA7Yjx0aGlzLnRyYWNrcy5sZW5ndGg7YisrKXt2YXIgYz10aGlzLnRyYWNrc1tiXTtpZihjKXt0aGlzLmV2ZW50cy5sZW5ndGg9MDt2YXIgZD1jLnRpbWUsZT1jLmxhc3RUaW1lLGY9Yy5lbmRUaW1lLGc9Yy5sb29wOyFnJiZkPmYmJihkPWYpO3ZhciBoPWMucHJldmlvdXM7aWYoaCl7dmFyIGk9aC50aW1lOyFoLmxvb3AmJmk+aC5lbmRUaW1lJiYoaT1oLmVuZFRpbWUpLGguYW5pbWF0aW9uLmFwcGx5KGEsaSxpLGgubG9vcCxudWxsKTt2YXIgaj1jLm1peFRpbWUvYy5taXhEdXJhdGlvbipjLm1peDtqPj0xJiYoaj0xLGMucHJldmlvdXM9bnVsbCksYy5hbmltYXRpb24ubWl4KGEsYy5sYXN0VGltZSxkLGcsdGhpcy5ldmVudHMsail9ZWxzZSAxPT1jLm1peD9jLmFuaW1hdGlvbi5hcHBseShhLGMubGFzdFRpbWUsZCxnLHRoaXMuZXZlbnRzKTpjLmFuaW1hdGlvbi5taXgoYSxjLmxhc3RUaW1lLGQsZyx0aGlzLmV2ZW50cyxjLm1peCk7Zm9yKHZhciBrPTAsbD10aGlzLmV2ZW50cy5sZW5ndGg7bD5rO2srKyl7dmFyIG09dGhpcy5ldmVudHNba107Yy5vbkV2ZW50JiZjLm9uRXZlbnQoYixtKSx0aGlzLm9uRXZlbnQmJnRoaXMub25FdmVudChiLG0pfWlmKGc/ZSVmPmQlZjpmPmUmJmQ+PWYpe3ZhciBuPU1hdGguZmxvb3IoZC9mKTtjLm9uQ29tcGxldGUmJmMub25Db21wbGV0ZShiLG4pLHRoaXMub25Db21wbGV0ZSYmdGhpcy5vbkNvbXBsZXRlKGIsbil9Yy5sYXN0VGltZT1jLnRpbWV9fX0sY2xlYXJUcmFja3M6ZnVuY3Rpb24oKXtmb3IodmFyIGE9MCxiPXRoaXMudHJhY2tzLmxlbmd0aDtiPmE7YSsrKXRoaXMuY2xlYXJUcmFjayhhKTt0aGlzLnRyYWNrcy5sZW5ndGg9MH0sY2xlYXJUcmFjazpmdW5jdGlvbihhKXtpZighKGE+PXRoaXMudHJhY2tzLmxlbmd0aCkpe3ZhciBiPXRoaXMudHJhY2tzW2FdO2ImJihiLm9uRW5kJiZiLm9uRW5kKGEpLHRoaXMub25FbmQmJnRoaXMub25FbmQoYSksdGhpcy50cmFja3NbYV09bnVsbCl9fSxfZXhwYW5kVG9JbmRleDpmdW5jdGlvbihhKXtpZihhPHRoaXMudHJhY2tzLmxlbmd0aClyZXR1cm4gdGhpcy50cmFja3NbYV07Zm9yKDthPj10aGlzLnRyYWNrcy5sZW5ndGg7KXRoaXMudHJhY2tzLnB1c2gobnVsbCk7cmV0dXJuIG51bGx9LHNldEN1cnJlbnQ6ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLl9leHBhbmRUb0luZGV4KGEpO2lmKGMpe3ZhciBkPWMucHJldmlvdXM7Yy5wcmV2aW91cz1udWxsLGMub25FbmQmJmMub25FbmQoYSksdGhpcy5vbkVuZCYmdGhpcy5vbkVuZChhKSxiLm1peER1cmF0aW9uPXRoaXMuZGF0YS5nZXRNaXgoYy5hbmltYXRpb24sYi5hbmltYXRpb24pLGIubWl4RHVyYXRpb24+MCYmKGIubWl4VGltZT0wLGIucHJldmlvdXM9ZCYmYy5taXhUaW1lL2MubWl4RHVyYXRpb248LjU/ZDpjKX10aGlzLnRyYWNrc1thXT1iLGIub25TdGFydCYmYi5vblN0YXJ0KGEpLHRoaXMub25TdGFydCYmdGhpcy5vblN0YXJ0KGEpfSxzZXRBbmltYXRpb25CeU5hbWU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPXRoaXMuZGF0YS5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihiKTtpZighZCl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYjtyZXR1cm4gdGhpcy5zZXRBbmltYXRpb24oYSxkLGMpfSxzZXRBbmltYXRpb246ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPW5ldyBjLlRyYWNrRW50cnk7cmV0dXJuIGUuYW5pbWF0aW9uPWIsZS5sb29wPWQsZS5lbmRUaW1lPWIuZHVyYXRpb24sdGhpcy5zZXRDdXJyZW50KGEsZSksZX0sYWRkQW5pbWF0aW9uQnlOYW1lOmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPXRoaXMuZGF0YS5za2VsZXRvbkRhdGEuZmluZEFuaW1hdGlvbihiKTtpZighZSl0aHJvd1wiQW5pbWF0aW9uIG5vdCBmb3VuZDogXCIrYjtyZXR1cm4gdGhpcy5hZGRBbmltYXRpb24oYSxlLGMsZCl9LGFkZEFuaW1hdGlvbjpmdW5jdGlvbihhLGIsZCxlKXt2YXIgZj1uZXcgYy5UcmFja0VudHJ5O2YuYW5pbWF0aW9uPWIsZi5sb29wPWQsZi5lbmRUaW1lPWIuZHVyYXRpb247dmFyIGc9dGhpcy5fZXhwYW5kVG9JbmRleChhKTtpZihnKXtmb3IoO2cubmV4dDspZz1nLm5leHQ7Zy5uZXh0PWZ9ZWxzZSB0aGlzLnRyYWNrc1thXT1mO3JldHVybiAwPj1lJiYoZz9lKz1nLmVuZFRpbWUtdGhpcy5kYXRhLmdldE1peChnLmFuaW1hdGlvbixiKTplPTApLGYuZGVsYXk9ZSxmfSxnZXRDdXJyZW50OmZ1bmN0aW9uKGEpe3JldHVybiBhPj10aGlzLnRyYWNrcy5sZW5ndGg/bnVsbDp0aGlzLnRyYWNrc1thXX19LGMuU2tlbGV0b25Kc29uPWZ1bmN0aW9uKGEpe3RoaXMuYXR0YWNobWVudExvYWRlcj1hfSxjLlNrZWxldG9uSnNvbi5wcm90b3R5cGU9e3NjYWxlOjEscmVhZFNrZWxldG9uRGF0YTpmdW5jdGlvbihhLGIpe3ZhciBkPW5ldyBjLlNrZWxldG9uRGF0YTtkLm5hbWU9Yjt2YXIgZT1hLnNrZWxldG9uO2UmJihkLmhhc2g9ZS5oYXNoLGQudmVyc2lvbj1lLnNwaW5lLGQud2lkdGg9ZS53aWR0aHx8MCxkLmhlaWdodD1lLmhlaWdodHx8MCk7Zm9yKHZhciBmPWEuYm9uZXMsZz0wLGg9Zi5sZW5ndGg7aD5nO2crKyl7dmFyIGk9ZltnXSxqPW51bGw7aWYoaS5wYXJlbnQmJihqPWQuZmluZEJvbmUoaS5wYXJlbnQpLCFqKSl0aHJvd1wiUGFyZW50IGJvbmUgbm90IGZvdW5kOiBcIitpLnBhcmVudDt2YXIgaz1uZXcgYy5Cb25lRGF0YShpLm5hbWUsaik7ay5sZW5ndGg9KGkubGVuZ3RofHwwKSp0aGlzLnNjYWxlLGsueD0oaS54fHwwKSp0aGlzLnNjYWxlLGsueT0oaS55fHwwKSp0aGlzLnNjYWxlLGsucm90YXRpb249aS5yb3RhdGlvbnx8MCxrLnNjYWxlWD1pLmhhc093blByb3BlcnR5KFwic2NhbGVYXCIpP2kuc2NhbGVYOjEsay5zY2FsZVk9aS5oYXNPd25Qcm9wZXJ0eShcInNjYWxlWVwiKT9pLnNjYWxlWToxLGsuaW5oZXJpdFNjYWxlPWkuaGFzT3duUHJvcGVydHkoXCJpbmhlcml0U2NhbGVcIik/aS5pbmhlcml0U2NhbGU6ITAsay5pbmhlcml0Um90YXRpb249aS5oYXNPd25Qcm9wZXJ0eShcImluaGVyaXRSb3RhdGlvblwiKT9pLmluaGVyaXRSb3RhdGlvbjohMCxkLmJvbmVzLnB1c2goayl9dmFyIGw9YS5paztpZihsKWZvcih2YXIgZz0wLGg9bC5sZW5ndGg7aD5nO2crKyl7Zm9yKHZhciBtPWxbZ10sbj1uZXcgYy5Ja0NvbnN0cmFpbnREYXRhKG0ubmFtZSksZj1tLmJvbmVzLG89MCxwPWYubGVuZ3RoO3A+bztvKyspe3ZhciBxPWQuZmluZEJvbmUoZltvXSk7aWYoIXEpdGhyb3dcIklLIGJvbmUgbm90IGZvdW5kOiBcIitmW29dO24uYm9uZXMucHVzaChxKX1pZihuLnRhcmdldD1kLmZpbmRCb25lKG0udGFyZ2V0KSwhbi50YXJnZXQpdGhyb3dcIlRhcmdldCBib25lIG5vdCBmb3VuZDogXCIrbS50YXJnZXQ7bi5iZW5kRGlyZWN0aW9uPSFtLmhhc093blByb3BlcnR5KFwiYmVuZFBvc2l0aXZlXCIpfHxtLmJlbmRQb3NpdGl2ZT8xOi0xLG4ubWl4PW0uaGFzT3duUHJvcGVydHkoXCJtaXhcIik/bS5taXg6MSxkLmlrQ29uc3RyYWludHMucHVzaChuKX1mb3IodmFyIHI9YS5zbG90cyxnPTAsaD1yLmxlbmd0aDtoPmc7ZysrKXt2YXIgcz1yW2ddLGs9ZC5maW5kQm9uZShzLmJvbmUpO2lmKCFrKXRocm93XCJTbG90IGJvbmUgbm90IGZvdW5kOiBcIitzLmJvbmU7dmFyIHQ9bmV3IGMuU2xvdERhdGEocy5uYW1lLGspLHU9cy5jb2xvcjt1JiYodC5yPXRoaXMudG9Db2xvcih1LDApLHQuZz10aGlzLnRvQ29sb3IodSwxKSx0LmI9dGhpcy50b0NvbG9yKHUsMiksdC5hPXRoaXMudG9Db2xvcih1LDMpKSx0LmF0dGFjaG1lbnROYW1lPXMuYXR0YWNobWVudCx0LmFkZGl0aXZlQmxlbmRpbmc9cy5hZGRpdGl2ZSYmXCJ0cnVlXCI9PXMuYWRkaXRpdmUsZC5zbG90cy5wdXNoKHQpfXZhciB2PWEuc2tpbnM7Zm9yKHZhciB3IGluIHYpaWYodi5oYXNPd25Qcm9wZXJ0eSh3KSl7dmFyIHg9dlt3XSx5PW5ldyBjLlNraW4odyk7Zm9yKHZhciB6IGluIHgpaWYoeC5oYXNPd25Qcm9wZXJ0eSh6KSl7dmFyIEE9ZC5maW5kU2xvdEluZGV4KHopLEI9eFt6XTtmb3IodmFyIEMgaW4gQilpZihCLmhhc093blByb3BlcnR5KEMpKXt2YXIgRD10aGlzLnJlYWRBdHRhY2htZW50KHksQyxCW0NdKTtEJiZ5LmFkZEF0dGFjaG1lbnQoQSxDLEQpfX1kLnNraW5zLnB1c2goeSksXCJkZWZhdWx0XCI9PXkubmFtZSYmKGQuZGVmYXVsdFNraW49eSl9dmFyIEU9YS5ldmVudHM7Zm9yKHZhciBGIGluIEUpaWYoRS5oYXNPd25Qcm9wZXJ0eShGKSl7dmFyIEc9RVtGXSxIPW5ldyBjLkV2ZW50RGF0YShGKTtILmludFZhbHVlPUdbXCJpbnRcIl18fDAsSC5mbG9hdFZhbHVlPUdbXCJmbG9hdFwiXXx8MCxILnN0cmluZ1ZhbHVlPUcuc3RyaW5nfHxudWxsLGQuZXZlbnRzLnB1c2goSCl9dmFyIEk9YS5hbmltYXRpb25zO2Zvcih2YXIgSiBpbiBJKUkuaGFzT3duUHJvcGVydHkoSikmJnRoaXMucmVhZEFuaW1hdGlvbihKLElbSl0sZCk7cmV0dXJuIGR9LHJlYWRBdHRhY2htZW50OmZ1bmN0aW9uKGEsYixkKXtiPWQubmFtZXx8Yjt2YXIgZT1jLkF0dGFjaG1lbnRUeXBlW2QudHlwZXx8XCJyZWdpb25cIl0sZj1kLnBhdGh8fGIsZz10aGlzLnNjYWxlO2lmKGU9PWMuQXR0YWNobWVudFR5cGUucmVnaW9uKXt2YXIgaD10aGlzLmF0dGFjaG1lbnRMb2FkZXIubmV3UmVnaW9uQXR0YWNobWVudChhLGIsZik7aWYoIWgpcmV0dXJuIG51bGw7aC5wYXRoPWYsaC54PShkLnh8fDApKmcsaC55PShkLnl8fDApKmcsaC5zY2FsZVg9ZC5oYXNPd25Qcm9wZXJ0eShcInNjYWxlWFwiKT9kLnNjYWxlWDoxLGguc2NhbGVZPWQuaGFzT3duUHJvcGVydHkoXCJzY2FsZVlcIik/ZC5zY2FsZVk6MSxoLnJvdGF0aW9uPWQucm90YXRpb258fDAsaC53aWR0aD0oZC53aWR0aHx8MCkqZyxoLmhlaWdodD0oZC5oZWlnaHR8fDApKmc7dmFyIGk9ZC5jb2xvcjtyZXR1cm4gaSYmKGgucj10aGlzLnRvQ29sb3IoaSwwKSxoLmc9dGhpcy50b0NvbG9yKGksMSksaC5iPXRoaXMudG9Db2xvcihpLDIpLGguYT10aGlzLnRvQ29sb3IoaSwzKSksaC51cGRhdGVPZmZzZXQoKSxofWlmKGU9PWMuQXR0YWNobWVudFR5cGUubWVzaCl7dmFyIGo9dGhpcy5hdHRhY2htZW50TG9hZGVyLm5ld01lc2hBdHRhY2htZW50KGEsYixmKTtyZXR1cm4gaj8oai5wYXRoPWYsai52ZXJ0aWNlcz10aGlzLmdldEZsb2F0QXJyYXkoZCxcInZlcnRpY2VzXCIsZyksai50cmlhbmdsZXM9dGhpcy5nZXRJbnRBcnJheShkLFwidHJpYW5nbGVzXCIpLGoucmVnaW9uVVZzPXRoaXMuZ2V0RmxvYXRBcnJheShkLFwidXZzXCIsMSksai51cGRhdGVVVnMoKSxpPWQuY29sb3IsaSYmKGoucj10aGlzLnRvQ29sb3IoaSwwKSxqLmc9dGhpcy50b0NvbG9yKGksMSksai5iPXRoaXMudG9Db2xvcihpLDIpLGouYT10aGlzLnRvQ29sb3IoaSwzKSksai5odWxsTGVuZ3RoPTIqKGQuaHVsbHx8MCksZC5lZGdlcyYmKGouZWRnZXM9dGhpcy5nZXRJbnRBcnJheShkLFwiZWRnZXNcIikpLGoud2lkdGg9KGQud2lkdGh8fDApKmcsai5oZWlnaHQ9KGQuaGVpZ2h0fHwwKSpnLGopOm51bGx9aWYoZT09Yy5BdHRhY2htZW50VHlwZS5za2lubmVkbWVzaCl7dmFyIGo9dGhpcy5hdHRhY2htZW50TG9hZGVyLm5ld1NraW5uZWRNZXNoQXR0YWNobWVudChhLGIsZik7aWYoIWopcmV0dXJuIG51bGw7ai5wYXRoPWY7Zm9yKHZhciBrPXRoaXMuZ2V0RmxvYXRBcnJheShkLFwidXZzXCIsMSksbD10aGlzLmdldEZsb2F0QXJyYXkoZCxcInZlcnRpY2VzXCIsMSksbT1bXSxuPVtdLG89MCxwPWwubGVuZ3RoO3A+bzspe3ZhciBxPTB8bFtvKytdO25bbi5sZW5ndGhdPXE7Zm9yKHZhciByPW8rNCpxO3I+bzspbltuLmxlbmd0aF09bFtvXSxtW20ubGVuZ3RoXT1sW28rMV0qZyxtW20ubGVuZ3RoXT1sW28rMl0qZyxtW20ubGVuZ3RoXT1sW28rM10sbys9NH1yZXR1cm4gai5ib25lcz1uLGoud2VpZ2h0cz1tLGoudHJpYW5nbGVzPXRoaXMuZ2V0SW50QXJyYXkoZCxcInRyaWFuZ2xlc1wiKSxqLnJlZ2lvblVWcz1rLGoudXBkYXRlVVZzKCksaT1kLmNvbG9yLGkmJihqLnI9dGhpcy50b0NvbG9yKGksMCksai5nPXRoaXMudG9Db2xvcihpLDEpLGouYj10aGlzLnRvQ29sb3IoaSwyKSxqLmE9dGhpcy50b0NvbG9yKGksMykpLGouaHVsbExlbmd0aD0yKihkLmh1bGx8fDApLGQuZWRnZXMmJihqLmVkZ2VzPXRoaXMuZ2V0SW50QXJyYXkoZCxcImVkZ2VzXCIpKSxqLndpZHRoPShkLndpZHRofHwwKSpnLGouaGVpZ2h0PShkLmhlaWdodHx8MCkqZyxqXG59aWYoZT09Yy5BdHRhY2htZW50VHlwZS5ib3VuZGluZ2JveCl7Zm9yKHZhciBzPXRoaXMuYXR0YWNobWVudExvYWRlci5uZXdCb3VuZGluZ0JveEF0dGFjaG1lbnQoYSxiKSxsPWQudmVydGljZXMsbz0wLHA9bC5sZW5ndGg7cD5vO28rKylzLnZlcnRpY2VzLnB1c2gobFtvXSpnKTtyZXR1cm4gc310aHJvd1wiVW5rbm93biBhdHRhY2htZW50IHR5cGU6IFwiK2V9LHJlYWRBbmltYXRpb246ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPVtdLGY9MCxnPWIuc2xvdHM7Zm9yKHZhciBoIGluIGcpaWYoZy5oYXNPd25Qcm9wZXJ0eShoKSl7dmFyIGk9Z1toXSxqPWQuZmluZFNsb3RJbmRleChoKTtmb3IodmFyIGsgaW4gaSlpZihpLmhhc093blByb3BlcnR5KGspKXt2YXIgbD1pW2tdO2lmKFwiY29sb3JcIj09ayl7dmFyIG09bmV3IGMuQ29sb3JUaW1lbGluZShsLmxlbmd0aCk7bS5zbG90SW5kZXg9ajtmb3IodmFyIG49MCxvPTAscD1sLmxlbmd0aDtwPm87bysrKXt2YXIgcT1sW29dLHI9cS5jb2xvcixzPXRoaXMudG9Db2xvcihyLDApLHQ9dGhpcy50b0NvbG9yKHIsMSksdT10aGlzLnRvQ29sb3IociwyKSx2PXRoaXMudG9Db2xvcihyLDMpO20uc2V0RnJhbWUobixxLnRpbWUscyx0LHUsdiksdGhpcy5yZWFkQ3VydmUobSxuLHEpLG4rK31lLnB1c2gobSksZj1NYXRoLm1heChmLG0uZnJhbWVzWzUqbS5nZXRGcmFtZUNvdW50KCktNV0pfWVsc2V7aWYoXCJhdHRhY2htZW50XCIhPWspdGhyb3dcIkludmFsaWQgdGltZWxpbmUgdHlwZSBmb3IgYSBzbG90OiBcIitrK1wiIChcIitoK1wiKVwiO3ZhciBtPW5ldyBjLkF0dGFjaG1lbnRUaW1lbGluZShsLmxlbmd0aCk7bS5zbG90SW5kZXg9ajtmb3IodmFyIG49MCxvPTAscD1sLmxlbmd0aDtwPm87bysrKXt2YXIgcT1sW29dO20uc2V0RnJhbWUobisrLHEudGltZSxxLm5hbWUpfWUucHVzaChtKSxmPU1hdGgubWF4KGYsbS5mcmFtZXNbbS5nZXRGcmFtZUNvdW50KCktMV0pfX19dmFyIHc9Yi5ib25lcztmb3IodmFyIHggaW4gdylpZih3Lmhhc093blByb3BlcnR5KHgpKXt2YXIgeT1kLmZpbmRCb25lSW5kZXgoeCk7aWYoLTE9PXkpdGhyb3dcIkJvbmUgbm90IGZvdW5kOiBcIit4O3ZhciB6PXdbeF07Zm9yKHZhciBrIGluIHopaWYoei5oYXNPd25Qcm9wZXJ0eShrKSl7dmFyIGw9eltrXTtpZihcInJvdGF0ZVwiPT1rKXt2YXIgbT1uZXcgYy5Sb3RhdGVUaW1lbGluZShsLmxlbmd0aCk7bS5ib25lSW5kZXg9eTtmb3IodmFyIG49MCxvPTAscD1sLmxlbmd0aDtwPm87bysrKXt2YXIgcT1sW29dO20uc2V0RnJhbWUobixxLnRpbWUscS5hbmdsZSksdGhpcy5yZWFkQ3VydmUobSxuLHEpLG4rK31lLnB1c2gobSksZj1NYXRoLm1heChmLG0uZnJhbWVzWzIqbS5nZXRGcmFtZUNvdW50KCktMl0pfWVsc2UgaWYoXCJ0cmFuc2xhdGVcIj09a3x8XCJzY2FsZVwiPT1rKXt2YXIgbSxBPTE7XCJzY2FsZVwiPT1rP209bmV3IGMuU2NhbGVUaW1lbGluZShsLmxlbmd0aCk6KG09bmV3IGMuVHJhbnNsYXRlVGltZWxpbmUobC5sZW5ndGgpLEE9dGhpcy5zY2FsZSksbS5ib25lSW5kZXg9eTtmb3IodmFyIG49MCxvPTAscD1sLmxlbmd0aDtwPm87bysrKXt2YXIgcT1sW29dLEI9KHEueHx8MCkqQSxDPShxLnl8fDApKkE7bS5zZXRGcmFtZShuLHEudGltZSxCLEMpLHRoaXMucmVhZEN1cnZlKG0sbixxKSxuKyt9ZS5wdXNoKG0pLGY9TWF0aC5tYXgoZixtLmZyYW1lc1szKm0uZ2V0RnJhbWVDb3VudCgpLTNdKX1lbHNle2lmKFwiZmxpcFhcIiE9ayYmXCJmbGlwWVwiIT1rKXRocm93XCJJbnZhbGlkIHRpbWVsaW5lIHR5cGUgZm9yIGEgYm9uZTogXCIraytcIiAoXCIreCtcIilcIjt2YXIgQj1cImZsaXBYXCI9PWssbT1CP25ldyBjLkZsaXBYVGltZWxpbmUobC5sZW5ndGgpOm5ldyBjLkZsaXBZVGltZWxpbmUobC5sZW5ndGgpO20uYm9uZUluZGV4PXk7Zm9yKHZhciBEPUI/XCJ4XCI6XCJ5XCIsbj0wLG89MCxwPWwubGVuZ3RoO3A+bztvKyspe3ZhciBxPWxbb107bS5zZXRGcmFtZShuLHEudGltZSxxW0RdfHwhMSksbisrfWUucHVzaChtKSxmPU1hdGgubWF4KGYsbS5mcmFtZXNbMiptLmdldEZyYW1lQ291bnQoKS0yXSl9fX12YXIgRT1iLmlrO2Zvcih2YXIgRiBpbiBFKWlmKEUuaGFzT3duUHJvcGVydHkoRikpe3ZhciBHPWQuZmluZElrQ29uc3RyYWludChGKSxsPUVbRl0sbT1uZXcgYy5Ja0NvbnN0cmFpbnRUaW1lbGluZShsLmxlbmd0aCk7bS5pa0NvbnN0cmFpbnRJbmRleD1kLmlrQ29uc3RyYWludHMuaW5kZXhPZihHKTtmb3IodmFyIG49MCxvPTAscD1sLmxlbmd0aDtwPm87bysrKXt2YXIgcT1sW29dLEg9cS5oYXNPd25Qcm9wZXJ0eShcIm1peFwiKT9xLm1peDoxLEk9IXEuaGFzT3duUHJvcGVydHkoXCJiZW5kUG9zaXRpdmVcIil8fHEuYmVuZFBvc2l0aXZlPzE6LTE7bS5zZXRGcmFtZShuLHEudGltZSxILEkpLHRoaXMucmVhZEN1cnZlKG0sbixxKSxuKyt9ZS5wdXNoKG0pLGY9TWF0aC5tYXgoZixtLmZyYW1lc1szKm0uZnJhbWVDb3VudC0zXSl9dmFyIEo9Yi5mZmQ7Zm9yKHZhciBLIGluIEope3ZhciBMPWQuZmluZFNraW4oSyksaT1KW0tdO2ZvcihoIGluIGkpe3ZhciBqPWQuZmluZFNsb3RJbmRleChoKSxNPWlbaF07Zm9yKHZhciBOIGluIE0pe3ZhciBsPU1bTl0sbT1uZXcgYy5GZmRUaW1lbGluZShsLmxlbmd0aCksTz1MLmdldEF0dGFjaG1lbnQoaixOKTtpZighTyl0aHJvd1wiRkZEIGF0dGFjaG1lbnQgbm90IGZvdW5kOiBcIitOO20uc2xvdEluZGV4PWosbS5hdHRhY2htZW50PU87dmFyIFAsUT1PLnR5cGU9PWMuQXR0YWNobWVudFR5cGUubWVzaDtQPVE/Ty52ZXJ0aWNlcy5sZW5ndGg6Ty53ZWlnaHRzLmxlbmd0aC8zKjI7Zm9yKHZhciBuPTAsbz0wLHA9bC5sZW5ndGg7cD5vO28rKyl7dmFyIFIscT1sW29dO2lmKHEudmVydGljZXMpe3ZhciBTPXEudmVydGljZXMsUj1bXTtSLmxlbmd0aD1QO3ZhciBUPXEub2Zmc2V0fHwwLFU9Uy5sZW5ndGg7aWYoMT09dGhpcy5zY2FsZSlmb3IodmFyIFY9MDtVPlY7VisrKVJbVitUXT1TW1ZdO2Vsc2UgZm9yKHZhciBWPTA7VT5WO1YrKylSW1YrVF09U1tWXSp0aGlzLnNjYWxlO2lmKFEpZm9yKHZhciBXPU8udmVydGljZXMsVj0wLFU9Ui5sZW5ndGg7VT5WO1YrKylSW1ZdKz1XW1ZdfWVsc2UgUT9SPU8udmVydGljZXM6KFI9W10sUi5sZW5ndGg9UCk7bS5zZXRGcmFtZShuLHEudGltZSxSKSx0aGlzLnJlYWRDdXJ2ZShtLG4scSksbisrfWVbZS5sZW5ndGhdPW0sZj1NYXRoLm1heChmLG0uZnJhbWVzW20uZnJhbWVDb3VudC0xXSl9fX12YXIgWD1iLmRyYXdPcmRlcjtpZihYfHwoWD1iLmRyYXdvcmRlciksWCl7Zm9yKHZhciBtPW5ldyBjLkRyYXdPcmRlclRpbWVsaW5lKFgubGVuZ3RoKSxZPWQuc2xvdHMubGVuZ3RoLG49MCxvPTAscD1YLmxlbmd0aDtwPm87bysrKXt2YXIgWj1YW29dLCQ9bnVsbDtpZihaLm9mZnNldHMpeyQ9W10sJC5sZW5ndGg9WTtmb3IodmFyIFY9WS0xO1Y+PTA7Vi0tKSRbVl09LTE7dmFyIF89Wi5vZmZzZXRzLGFiPVtdO2FiLmxlbmd0aD1ZLV8ubGVuZ3RoO2Zvcih2YXIgYmI9MCxjYj0wLFY9MCxVPV8ubGVuZ3RoO1U+VjtWKyspe3ZhciBkYj1fW1ZdLGo9ZC5maW5kU2xvdEluZGV4KGRiLnNsb3QpO2lmKC0xPT1qKXRocm93XCJTbG90IG5vdCBmb3VuZDogXCIrZGIuc2xvdDtmb3IoO2JiIT1qOylhYltjYisrXT1iYisrOyRbYmIrZGIub2Zmc2V0XT1iYisrfWZvcig7WT5iYjspYWJbY2IrK109YmIrKztmb3IodmFyIFY9WS0xO1Y+PTA7Vi0tKS0xPT0kW1ZdJiYoJFtWXT1hYlstLWNiXSl9bS5zZXRGcmFtZShuKyssWi50aW1lLCQpfWUucHVzaChtKSxmPU1hdGgubWF4KGYsbS5mcmFtZXNbbS5nZXRGcmFtZUNvdW50KCktMV0pfXZhciBlYj1iLmV2ZW50cztpZihlYil7Zm9yKHZhciBtPW5ldyBjLkV2ZW50VGltZWxpbmUoZWIubGVuZ3RoKSxuPTAsbz0wLHA9ZWIubGVuZ3RoO3A+bztvKyspe3ZhciBmYj1lYltvXSxnYj1kLmZpbmRFdmVudChmYi5uYW1lKTtpZighZ2IpdGhyb3dcIkV2ZW50IG5vdCBmb3VuZDogXCIrZmIubmFtZTt2YXIgaGI9bmV3IGMuRXZlbnQoZ2IpO2hiLmludFZhbHVlPWZiLmhhc093blByb3BlcnR5KFwiaW50XCIpP2ZiW1wiaW50XCJdOmdiLmludFZhbHVlLGhiLmZsb2F0VmFsdWU9ZmIuaGFzT3duUHJvcGVydHkoXCJmbG9hdFwiKT9mYltcImZsb2F0XCJdOmdiLmZsb2F0VmFsdWUsaGIuc3RyaW5nVmFsdWU9ZmIuaGFzT3duUHJvcGVydHkoXCJzdHJpbmdcIik/ZmIuc3RyaW5nOmdiLnN0cmluZ1ZhbHVlLG0uc2V0RnJhbWUobisrLGZiLnRpbWUsaGIpfWUucHVzaChtKSxmPU1hdGgubWF4KGYsbS5mcmFtZXNbbS5nZXRGcmFtZUNvdW50KCktMV0pfWQuYW5pbWF0aW9ucy5wdXNoKG5ldyBjLkFuaW1hdGlvbihhLGUsZikpfSxyZWFkQ3VydmU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWMuY3VydmU7ZD9cInN0ZXBwZWRcIj09ZD9hLmN1cnZlcy5zZXRTdGVwcGVkKGIpOmQgaW5zdGFuY2VvZiBBcnJheSYmYS5jdXJ2ZXMuc2V0Q3VydmUoYixkWzBdLGRbMV0sZFsyXSxkWzNdKTphLmN1cnZlcy5zZXRMaW5lYXIoYil9LHRvQ29sb3I6ZnVuY3Rpb24oYSxiKXtpZig4IT1hLmxlbmd0aCl0aHJvd1wiQ29sb3IgaGV4aWRlY2ltYWwgbGVuZ3RoIG11c3QgYmUgOCwgcmVjaWV2ZWQ6IFwiK2E7cmV0dXJuIHBhcnNlSW50KGEuc3Vic3RyaW5nKDIqYiwyKmIrMiksMTYpLzI1NX0sZ2V0RmxvYXRBcnJheTpmdW5jdGlvbihhLGIsZCl7dmFyIGU9YVtiXSxmPW5ldyBjLkZsb2F0MzJBcnJheShlLmxlbmd0aCksZz0wLGg9ZS5sZW5ndGg7aWYoMT09ZClmb3IoO2g+ZztnKyspZltnXT1lW2ddO2Vsc2UgZm9yKDtoPmc7ZysrKWZbZ109ZVtnXSpkO3JldHVybiBmfSxnZXRJbnRBcnJheTpmdW5jdGlvbihhLGIpe2Zvcih2YXIgZD1hW2JdLGU9bmV3IGMuVWludDE2QXJyYXkoZC5sZW5ndGgpLGY9MCxnPWQubGVuZ3RoO2c+ZjtmKyspZVtmXT0wfGRbZl07cmV0dXJuIGV9fSxjLkF0bGFzPWZ1bmN0aW9uKGEsYil7dGhpcy50ZXh0dXJlTG9hZGVyPWIsdGhpcy5wYWdlcz1bXSx0aGlzLnJlZ2lvbnM9W107dmFyIGQ9bmV3IGMuQXRsYXNSZWFkZXIoYSksZT1bXTtlLmxlbmd0aD00O2Zvcih2YXIgZj1udWxsOzspe3ZhciBnPWQucmVhZExpbmUoKTtpZihudWxsPT09ZylicmVhaztpZihnPWQudHJpbShnKSxnLmxlbmd0aClpZihmKXt2YXIgaD1uZXcgYy5BdGxhc1JlZ2lvbjtoLm5hbWU9ZyxoLnBhZ2U9ZixoLnJvdGF0ZT1cInRydWVcIj09ZC5yZWFkVmFsdWUoKSxkLnJlYWRUdXBsZShlKTt2YXIgaT1wYXJzZUludChlWzBdKSxqPXBhcnNlSW50KGVbMV0pO2QucmVhZFR1cGxlKGUpO3ZhciBrPXBhcnNlSW50KGVbMF0pLGw9cGFyc2VJbnQoZVsxXSk7aC51PWkvZi53aWR0aCxoLnY9ai9mLmhlaWdodCxoLnJvdGF0ZT8oaC51Mj0oaStsKS9mLndpZHRoLGgudjI9KGoraykvZi5oZWlnaHQpOihoLnUyPShpK2spL2Yud2lkdGgsaC52Mj0oaitsKS9mLmhlaWdodCksaC54PWksaC55PWosaC53aWR0aD1NYXRoLmFicyhrKSxoLmhlaWdodD1NYXRoLmFicyhsKSw0PT1kLnJlYWRUdXBsZShlKSYmKGguc3BsaXRzPVtwYXJzZUludChlWzBdKSxwYXJzZUludChlWzFdKSxwYXJzZUludChlWzJdKSxwYXJzZUludChlWzNdKV0sND09ZC5yZWFkVHVwbGUoZSkmJihoLnBhZHM9W3BhcnNlSW50KGVbMF0pLHBhcnNlSW50KGVbMV0pLHBhcnNlSW50KGVbMl0pLHBhcnNlSW50KGVbM10pXSxkLnJlYWRUdXBsZShlKSkpLGgub3JpZ2luYWxXaWR0aD1wYXJzZUludChlWzBdKSxoLm9yaWdpbmFsSGVpZ2h0PXBhcnNlSW50KGVbMV0pLGQucmVhZFR1cGxlKGUpLGgub2Zmc2V0WD1wYXJzZUludChlWzBdKSxoLm9mZnNldFk9cGFyc2VJbnQoZVsxXSksaC5pbmRleD1wYXJzZUludChkLnJlYWRWYWx1ZSgpKSx0aGlzLnJlZ2lvbnMucHVzaChoKX1lbHNle2Y9bmV3IGMuQXRsYXNQYWdlLGYubmFtZT1nLDI9PWQucmVhZFR1cGxlKGUpJiYoZi53aWR0aD1wYXJzZUludChlWzBdKSxmLmhlaWdodD1wYXJzZUludChlWzFdKSxkLnJlYWRUdXBsZShlKSksZi5mb3JtYXQ9Yy5BdGxhcy5Gb3JtYXRbZVswXV0sZC5yZWFkVHVwbGUoZSksZi5taW5GaWx0ZXI9Yy5BdGxhcy5UZXh0dXJlRmlsdGVyW2VbMF1dLGYubWFnRmlsdGVyPWMuQXRsYXMuVGV4dHVyZUZpbHRlcltlWzFdXTt2YXIgbT1kLnJlYWRWYWx1ZSgpO2YudVdyYXA9Yy5BdGxhcy5UZXh0dXJlV3JhcC5jbGFtcFRvRWRnZSxmLnZXcmFwPWMuQXRsYXMuVGV4dHVyZVdyYXAuY2xhbXBUb0VkZ2UsXCJ4XCI9PW0/Zi51V3JhcD1jLkF0bGFzLlRleHR1cmVXcmFwLnJlcGVhdDpcInlcIj09bT9mLnZXcmFwPWMuQXRsYXMuVGV4dHVyZVdyYXAucmVwZWF0OlwieHlcIj09bSYmKGYudVdyYXA9Zi52V3JhcD1jLkF0bGFzLlRleHR1cmVXcmFwLnJlcGVhdCksYi5sb2FkKGYsZyx0aGlzKSx0aGlzLnBhZ2VzLnB1c2goZil9ZWxzZSBmPW51bGx9fSxjLkF0bGFzLnByb3RvdHlwZT17ZmluZFJlZ2lvbjpmdW5jdGlvbihhKXtmb3IodmFyIGI9dGhpcy5yZWdpb25zLGM9MCxkPWIubGVuZ3RoO2Q+YztjKyspaWYoYltjXS5uYW1lPT1hKXJldHVybiBiW2NdO3JldHVybiBudWxsfSxkaXNwb3NlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMucGFnZXMsYj0wLGM9YS5sZW5ndGg7Yz5iO2IrKyl0aGlzLnRleHR1cmVMb2FkZXIudW5sb2FkKGFbYl0ucmVuZGVyZXJPYmplY3QpfSx1cGRhdGVVVnM6ZnVuY3Rpb24oYSl7Zm9yKHZhciBiPXRoaXMucmVnaW9ucyxjPTAsZD1iLmxlbmd0aDtkPmM7YysrKXt2YXIgZT1iW2NdO2UucGFnZT09YSYmKGUudT1lLngvYS53aWR0aCxlLnY9ZS55L2EuaGVpZ2h0LGUucm90YXRlPyhlLnUyPShlLngrZS5oZWlnaHQpL2Eud2lkdGgsZS52Mj0oZS55K2Uud2lkdGgpL2EuaGVpZ2h0KTooZS51Mj0oZS54K2Uud2lkdGgpL2Eud2lkdGgsZS52Mj0oZS55K2UuaGVpZ2h0KS9hLmhlaWdodCkpfX19LGMuQXRsYXMuRm9ybWF0PXthbHBoYTowLGludGVuc2l0eToxLGx1bWluYW5jZUFscGhhOjIscmdiNTY1OjMscmdiYTQ0NDQ6NCxyZ2I4ODg6NSxyZ2JhODg4ODo2fSxjLkF0bGFzLlRleHR1cmVGaWx0ZXI9e25lYXJlc3Q6MCxsaW5lYXI6MSxtaXBNYXA6MixtaXBNYXBOZWFyZXN0TmVhcmVzdDozLG1pcE1hcExpbmVhck5lYXJlc3Q6NCxtaXBNYXBOZWFyZXN0TGluZWFyOjUsbWlwTWFwTGluZWFyTGluZWFyOjZ9LGMuQXRsYXMuVGV4dHVyZVdyYXA9e21pcnJvcmVkUmVwZWF0OjAsY2xhbXBUb0VkZ2U6MSxyZXBlYXQ6Mn0sYy5BdGxhc1BhZ2U9ZnVuY3Rpb24oKXt9LGMuQXRsYXNQYWdlLnByb3RvdHlwZT17bmFtZTpudWxsLGZvcm1hdDpudWxsLG1pbkZpbHRlcjpudWxsLG1hZ0ZpbHRlcjpudWxsLHVXcmFwOm51bGwsdldyYXA6bnVsbCxyZW5kZXJlck9iamVjdDpudWxsLHdpZHRoOjAsaGVpZ2h0OjB9LGMuQXRsYXNSZWdpb249ZnVuY3Rpb24oKXt9LGMuQXRsYXNSZWdpb24ucHJvdG90eXBlPXtwYWdlOm51bGwsbmFtZTpudWxsLHg6MCx5OjAsd2lkdGg6MCxoZWlnaHQ6MCx1OjAsdjowLHUyOjAsdjI6MCxvZmZzZXRYOjAsb2Zmc2V0WTowLG9yaWdpbmFsV2lkdGg6MCxvcmlnaW5hbEhlaWdodDowLGluZGV4OjAscm90YXRlOiExLHNwbGl0czpudWxsLHBhZHM6bnVsbH0sYy5BdGxhc1JlYWRlcj1mdW5jdGlvbihhKXt0aGlzLmxpbmVzPWEuc3BsaXQoL1xcclxcbnxcXHJ8XFxuLyl9LGMuQXRsYXNSZWFkZXIucHJvdG90eXBlPXtpbmRleDowLHRyaW06ZnVuY3Rpb24oYSl7cmV0dXJuIGEucmVwbGFjZSgvXlxccyt8XFxzKyQvZyxcIlwiKX0scmVhZExpbmU6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5pbmRleD49dGhpcy5saW5lcy5sZW5ndGg/bnVsbDp0aGlzLmxpbmVzW3RoaXMuaW5kZXgrK119LHJlYWRWYWx1ZTpmdW5jdGlvbigpe3ZhciBhPXRoaXMucmVhZExpbmUoKSxiPWEuaW5kZXhPZihcIjpcIik7aWYoLTE9PWIpdGhyb3dcIkludmFsaWQgbGluZTogXCIrYTtyZXR1cm4gdGhpcy50cmltKGEuc3Vic3RyaW5nKGIrMSkpfSxyZWFkVHVwbGU6ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5yZWFkTGluZSgpLGM9Yi5pbmRleE9mKFwiOlwiKTtpZigtMT09Yyl0aHJvd1wiSW52YWxpZCBsaW5lOiBcIitiO2Zvcih2YXIgZD0wLGU9YysxOzM+ZDtkKyspe3ZhciBmPWIuaW5kZXhPZihcIixcIixlKTtpZigtMT09ZilicmVhazthW2RdPXRoaXMudHJpbShiLnN1YnN0cihlLGYtZSkpLGU9ZisxfXJldHVybiBhW2RdPXRoaXMudHJpbShiLnN1YnN0cmluZyhlKSksZCsxfX0sYy5BdGxhc0F0dGFjaG1lbnRMb2FkZXI9ZnVuY3Rpb24oYSl7dGhpcy5hdGxhcz1hfSxjLkF0bGFzQXR0YWNobWVudExvYWRlci5wcm90b3R5cGU9e25ld1JlZ2lvbkF0dGFjaG1lbnQ6ZnVuY3Rpb24oYSxiLGQpe3ZhciBlPXRoaXMuYXRsYXMuZmluZFJlZ2lvbihkKTtpZighZSl0aHJvd1wiUmVnaW9uIG5vdCBmb3VuZCBpbiBhdGxhczogXCIrZCtcIiAocmVnaW9uIGF0dGFjaG1lbnQ6IFwiK2IrXCIpXCI7dmFyIGY9bmV3IGMuUmVnaW9uQXR0YWNobWVudChiKTtyZXR1cm4gZi5yZW5kZXJlck9iamVjdD1lLGYuc2V0VVZzKGUudSxlLnYsZS51MixlLnYyLGUucm90YXRlKSxmLnJlZ2lvbk9mZnNldFg9ZS5vZmZzZXRYLGYucmVnaW9uT2Zmc2V0WT1lLm9mZnNldFksZi5yZWdpb25XaWR0aD1lLndpZHRoLGYucmVnaW9uSGVpZ2h0PWUuaGVpZ2h0LGYucmVnaW9uT3JpZ2luYWxXaWR0aD1lLm9yaWdpbmFsV2lkdGgsZi5yZWdpb25PcmlnaW5hbEhlaWdodD1lLm9yaWdpbmFsSGVpZ2h0LGZ9LG5ld01lc2hBdHRhY2htZW50OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzLmF0bGFzLmZpbmRSZWdpb24oZCk7aWYoIWUpdGhyb3dcIlJlZ2lvbiBub3QgZm91bmQgaW4gYXRsYXM6IFwiK2QrXCIgKG1lc2ggYXR0YWNobWVudDogXCIrYitcIilcIjt2YXIgZj1uZXcgYy5NZXNoQXR0YWNobWVudChiKTtyZXR1cm4gZi5yZW5kZXJlck9iamVjdD1lLGYucmVnaW9uVT1lLnUsZi5yZWdpb25WPWUudixmLnJlZ2lvblUyPWUudTIsZi5yZWdpb25WMj1lLnYyLGYucmVnaW9uUm90YXRlPWUucm90YXRlLGYucmVnaW9uT2Zmc2V0WD1lLm9mZnNldFgsZi5yZWdpb25PZmZzZXRZPWUub2Zmc2V0WSxmLnJlZ2lvbldpZHRoPWUud2lkdGgsZi5yZWdpb25IZWlnaHQ9ZS5oZWlnaHQsZi5yZWdpb25PcmlnaW5hbFdpZHRoPWUub3JpZ2luYWxXaWR0aCxmLnJlZ2lvbk9yaWdpbmFsSGVpZ2h0PWUub3JpZ2luYWxIZWlnaHQsZn0sbmV3U2tpbm5lZE1lc2hBdHRhY2htZW50OmZ1bmN0aW9uKGEsYixkKXt2YXIgZT10aGlzLmF0bGFzLmZpbmRSZWdpb24oZCk7aWYoIWUpdGhyb3dcIlJlZ2lvbiBub3QgZm91bmQgaW4gYXRsYXM6IFwiK2QrXCIgKHNraW5uZWQgbWVzaCBhdHRhY2htZW50OiBcIitiK1wiKVwiO3ZhciBmPW5ldyBjLlNraW5uZWRNZXNoQXR0YWNobWVudChiKTtyZXR1cm4gZi5yZW5kZXJlck9iamVjdD1lLGYucmVnaW9uVT1lLnUsZi5yZWdpb25WPWUudixmLnJlZ2lvblUyPWUudTIsZi5yZWdpb25WMj1lLnYyLGYucmVnaW9uUm90YXRlPWUucm90YXRlLGYucmVnaW9uT2Zmc2V0WD1lLm9mZnNldFgsZi5yZWdpb25PZmZzZXRZPWUub2Zmc2V0WSxmLnJlZ2lvbldpZHRoPWUud2lkdGgsZi5yZWdpb25IZWlnaHQ9ZS5oZWlnaHQsZi5yZWdpb25PcmlnaW5hbFdpZHRoPWUub3JpZ2luYWxXaWR0aCxmLnJlZ2lvbk9yaWdpbmFsSGVpZ2h0PWUub3JpZ2luYWxIZWlnaHQsZn0sbmV3Qm91bmRpbmdCb3hBdHRhY2htZW50OmZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyBjLkJvdW5kaW5nQm94QXR0YWNobWVudChiKX19LGMuU2tlbGV0b25Cb3VuZHM9ZnVuY3Rpb24oKXt0aGlzLnBvbHlnb25Qb29sPVtdLHRoaXMucG9seWdvbnM9W10sdGhpcy5ib3VuZGluZ0JveGVzPVtdfSxjLlNrZWxldG9uQm91bmRzLnByb3RvdHlwZT17bWluWDowLG1pblk6MCxtYXhYOjAsbWF4WTowLHVwZGF0ZTpmdW5jdGlvbihhLGIpe3ZhciBkPWEuc2xvdHMsZT1kLmxlbmd0aCxmPWEueCxnPWEueSxoPXRoaXMuYm91bmRpbmdCb3hlcyxpPXRoaXMucG9seWdvblBvb2wsaj10aGlzLnBvbHlnb25zO2gubGVuZ3RoPTA7Zm9yKHZhciBrPTAsbD1qLmxlbmd0aDtsPms7aysrKWkucHVzaChqW2tdKTtqLmxlbmd0aD0wO2Zvcih2YXIgaz0wO2U+aztrKyspe3ZhciBtPWRba10sbj1tLmF0dGFjaG1lbnQ7aWYobi50eXBlPT1jLkF0dGFjaG1lbnRUeXBlLmJvdW5kaW5nYm94KXtoLnB1c2gobik7dmFyIG8scD1pLmxlbmd0aDtwPjA/KG89aVtwLTFdLGkuc3BsaWNlKHAtMSwxKSk6bz1bXSxqLnB1c2gobyksby5sZW5ndGg9bi52ZXJ0aWNlcy5sZW5ndGgsbi5jb21wdXRlV29ybGRWZXJ0aWNlcyhmLGcsbS5ib25lLG8pfX1iJiZ0aGlzLmFhYmJDb21wdXRlKCl9LGFhYmJDb21wdXRlOmZ1bmN0aW9uKCl7Zm9yKHZhciBhPXRoaXMucG9seWdvbnMsYj1OdW1iZXIuTUFYX1ZBTFVFLGM9TnVtYmVyLk1BWF9WQUxVRSxkPU51bWJlci5NSU5fVkFMVUUsZT1OdW1iZXIuTUlOX1ZBTFVFLGY9MCxnPWEubGVuZ3RoO2c+ZjtmKyspZm9yKHZhciBoPWFbZl0saT0wLGo9aC5sZW5ndGg7aj5pO2krPTIpe3ZhciBrPWhbaV0sbD1oW2krMV07Yj1NYXRoLm1pbihiLGspLGM9TWF0aC5taW4oYyxsKSxkPU1hdGgubWF4KGQsayksZT1NYXRoLm1heChlLGwpfXRoaXMubWluWD1iLHRoaXMubWluWT1jLHRoaXMubWF4WD1kLHRoaXMubWF4WT1lfSxhYWJiQ29udGFpbnNQb2ludDpmdW5jdGlvbihhLGIpe3JldHVybiBhPj10aGlzLm1pblgmJmE8PXRoaXMubWF4WCYmYj49dGhpcy5taW5ZJiZiPD10aGlzLm1heFl9LGFhYmJJbnRlcnNlY3RzU2VnbWVudDpmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT10aGlzLm1pblgsZj10aGlzLm1pblksZz10aGlzLm1heFgsaD10aGlzLm1heFk7aWYoZT49YSYmZT49Y3x8Zj49YiYmZj49ZHx8YT49ZyYmYz49Z3x8Yj49aCYmZD49aClyZXR1cm4hMTt2YXIgaT0oZC1iKS8oYy1hKSxqPWkqKGUtYSkrYjtpZihqPmYmJmg+ailyZXR1cm4hMDtpZihqPWkqKGctYSkrYixqPmYmJmg+ailyZXR1cm4hMDt2YXIgaz0oZi1iKS9pK2E7cmV0dXJuIGs+ZSYmZz5rPyEwOihrPShoLWIpL2krYSxrPmUmJmc+az8hMDohMSl9LGFhYmJJbnRlcnNlY3RzU2tlbGV0b246ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubWluWDxhLm1heFgmJnRoaXMubWF4WD5hLm1pblgmJnRoaXMubWluWTxhLm1heFkmJnRoaXMubWF4WT5hLm1pbll9LGNvbnRhaW5zUG9pbnQ6ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9dGhpcy5wb2x5Z29ucyxkPTAsZT1jLmxlbmd0aDtlPmQ7ZCsrKWlmKHRoaXMucG9seWdvbkNvbnRhaW5zUG9pbnQoY1tkXSxhLGIpKXJldHVybiB0aGlzLmJvdW5kaW5nQm94ZXNbZF07cmV0dXJuIG51bGx9LGludGVyc2VjdHNTZWdtZW50OmZ1bmN0aW9uKGEsYixjLGQpe2Zvcih2YXIgZT10aGlzLnBvbHlnb25zLGY9MCxnPWUubGVuZ3RoO2c+ZjtmKyspaWYoZVtmXS5pbnRlcnNlY3RzU2VnbWVudChhLGIsYyxkKSlyZXR1cm4gdGhpcy5ib3VuZGluZ0JveGVzW2ZdO3JldHVybiBudWxsfSxwb2x5Z29uQ29udGFpbnNQb2ludDpmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPWEubGVuZ3RoLGU9ZC0yLGY9ITEsZz0wO2Q+ZztnKz0yKXt2YXIgaD1hW2crMV0saT1hW2UrMV07aWYoYz5oJiZpPj1jfHxjPmkmJmg+PWMpe3ZhciBqPWFbZ107aisoYy1oKS8oaS1oKSooYVtlXS1qKTxiJiYoZj0hZil9ZT1nfXJldHVybiBmfSxwb2x5Z29uSW50ZXJzZWN0c1NlZ21lbnQ6ZnVuY3Rpb24oYSxiLGMsZCxlKXtmb3IodmFyIGY9YS5sZW5ndGgsZz1iLWQsaD1jLWUsaT1iKmUtYypkLGo9YVtmLTJdLGs9YVtmLTFdLGw9MDtmPmw7bCs9Mil7dmFyIG09YVtsXSxuPWFbbCsxXSxvPWoqbi1rKm0scD1qLW0scT1rLW4scj1nKnEtaCpwLHM9KGkqcC1nKm8pL3I7aWYoKHM+PWomJm0+PXN8fHM+PW0mJmo+PXMpJiYocz49YiYmZD49c3x8cz49ZCYmYj49cykpe3ZhciB0PShpKnEtaCpvKS9yO2lmKCh0Pj1rJiZuPj10fHx0Pj1uJiZrPj10KSYmKHQ+PWMmJmU+PXR8fHQ+PWUmJmM+PXQpKXJldHVybiEwfWo9bSxrPW59cmV0dXJuITF9LGdldFBvbHlnb246ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5ib3VuZGluZ0JveGVzLmluZGV4T2YoYSk7cmV0dXJuLTE9PWI/bnVsbDp0aGlzLnBvbHlnb25zW2JdfSxnZXRXaWR0aDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1heFgtdGhpcy5taW5YfSxnZXRIZWlnaHQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5tYXhZLXRoaXMubWluWX19LGMuQm9uZS55RG93bj0hMCxiLkFuaW1DYWNoZT17fSxiLlNwaW5lVGV4dHVyZUxvYWRlcj1mdW5jdGlvbihhLGMpe2IuRXZlbnRUYXJnZXQuY2FsbCh0aGlzKSx0aGlzLmJhc2VQYXRoPWEsdGhpcy5jcm9zc29yaWdpbj1jLHRoaXMubG9hZGluZ0NvdW50PTB9LGIuU3BpbmVUZXh0dXJlTG9hZGVyLnByb3RvdHlwZT1iLlNwaW5lVGV4dHVyZUxvYWRlcixiLlNwaW5lVGV4dHVyZUxvYWRlci5wcm90b3R5cGUubG9hZD1mdW5jdGlvbihhLGMpe2lmKGEucmVuZGVyZXJPYmplY3Q9Yi5CYXNlVGV4dHVyZS5mcm9tSW1hZ2UodGhpcy5iYXNlUGF0aCtcIi9cIitjLHRoaXMuY3Jvc3NvcmlnaW4pLCFhLnJlbmRlcmVyT2JqZWN0Lmhhc0xvYWRlZCl7dmFyIGQ9dGhpczsrK2QubG9hZGluZ0NvdW50LGEucmVuZGVyZXJPYmplY3QuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZFwiLGZ1bmN0aW9uKCl7LS1kLmxvYWRpbmdDb3VudCxkLmRpc3BhdGNoRXZlbnQoe3R5cGU6XCJsb2FkZWRCYXNlVGV4dHVyZVwiLGNvbnRlbnQ6ZH0pfSl9fSxiLlNwaW5lVGV4dHVyZUxvYWRlci5wcm90b3R5cGUudW5sb2FkPWZ1bmN0aW9uKGEpe2EuZGVzdHJveSghMCl9LGIuU3BpbmU9ZnVuY3Rpb24oYSl7aWYoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLmNhbGwodGhpcyksdGhpcy5zcGluZURhdGE9Yi5BbmltQ2FjaGVbYV0sIXRoaXMuc3BpbmVEYXRhKXRocm93IG5ldyBFcnJvcihcIlNwaW5lIGRhdGEgbXVzdCBiZSBwcmVsb2FkZWQgdXNpbmcgUElYSS5TcGluZUxvYWRlciBvciBQSVhJLkFzc2V0TG9hZGVyOiBcIithKTt0aGlzLnNrZWxldG9uPW5ldyBjLlNrZWxldG9uKHRoaXMuc3BpbmVEYXRhKSx0aGlzLnNrZWxldG9uLnVwZGF0ZVdvcmxkVHJhbnNmb3JtKCksdGhpcy5zdGF0ZURhdGE9bmV3IGMuQW5pbWF0aW9uU3RhdGVEYXRhKHRoaXMuc3BpbmVEYXRhKSx0aGlzLnN0YXRlPW5ldyBjLkFuaW1hdGlvblN0YXRlKHRoaXMuc3RhdGVEYXRhKSx0aGlzLnNsb3RDb250YWluZXJzPVtdO2Zvcih2YXIgZD0wLGU9dGhpcy5za2VsZXRvbi5kcmF3T3JkZXIubGVuZ3RoO2U+ZDtkKyspe3ZhciBmPXRoaXMuc2tlbGV0b24uZHJhd09yZGVyW2RdLGc9Zi5hdHRhY2htZW50LGg9bmV3IGIuRGlzcGxheU9iamVjdENvbnRhaW5lcjtpZih0aGlzLnNsb3RDb250YWluZXJzLnB1c2goaCksdGhpcy5hZGRDaGlsZChoKSxnIGluc3RhbmNlb2YgYy5SZWdpb25BdHRhY2htZW50KXt2YXIgaT1nLnJlbmRlcmVyT2JqZWN0Lm5hbWUsaj10aGlzLmNyZWF0ZVNwcml0ZShmLGcpO2YuY3VycmVudFNwcml0ZT1qLGYuY3VycmVudFNwcml0ZU5hbWU9aSxoLmFkZENoaWxkKGopfWVsc2V7aWYoIShnIGluc3RhbmNlb2YgYy5NZXNoQXR0YWNobWVudCkpY29udGludWU7dmFyIGs9dGhpcy5jcmVhdGVNZXNoKGYsZyk7Zi5jdXJyZW50TWVzaD1rLGYuY3VycmVudE1lc2hOYW1lPWcubmFtZSxoLmFkZENoaWxkKGspfX10aGlzLmF1dG9VcGRhdGU9ITB9LGIuU3BpbmUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZSksYi5TcGluZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5TcGluZSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5TcGluZS5wcm90b3R5cGUsXCJhdXRvVXBkYXRlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVwZGF0ZVRyYW5zZm9ybT09PWIuU3BpbmUucHJvdG90eXBlLmF1dG9VcGRhdGVUcmFuc2Zvcm19LHNldDpmdW5jdGlvbihhKXt0aGlzLnVwZGF0ZVRyYW5zZm9ybT1hP2IuU3BpbmUucHJvdG90eXBlLmF1dG9VcGRhdGVUcmFuc2Zvcm06Yi5EaXNwbGF5T2JqZWN0Q29udGFpbmVyLnByb3RvdHlwZS51cGRhdGVUcmFuc2Zvcm19fSksYi5TcGluZS5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEpe3RoaXMuc3RhdGUudXBkYXRlKGEpLHRoaXMuc3RhdGUuYXBwbHkodGhpcy5za2VsZXRvbiksdGhpcy5za2VsZXRvbi51cGRhdGVXb3JsZFRyYW5zZm9ybSgpO2Zvcih2YXIgZD10aGlzLnNrZWxldG9uLmRyYXdPcmRlcixlPTAsZj1kLmxlbmd0aDtmPmU7ZSsrKXt2YXIgZz1kW2VdLGg9Zy5hdHRhY2htZW50LGk9dGhpcy5zbG90Q29udGFpbmVyc1tlXTtpZihoKXt2YXIgaj1oLnR5cGU7aWYoaj09PWMuQXR0YWNobWVudFR5cGUucmVnaW9uKXtpZihoLnJlbmRlcmVyT2JqZWN0JiYoIWcuY3VycmVudFNwcml0ZU5hbWV8fGcuY3VycmVudFNwcml0ZU5hbWUhPT1oLm5hbWUpKXt2YXIgaz1oLnJlbmRlcmVyT2JqZWN0Lm5hbWU7aWYodm9pZCAwIT09Zy5jdXJyZW50U3ByaXRlJiYoZy5jdXJyZW50U3ByaXRlLnZpc2libGU9ITEpLGcuc3ByaXRlcz1nLnNwcml0ZXN8fHt9LHZvaWQgMCE9PWcuc3ByaXRlc1trXSlnLnNwcml0ZXNba10udmlzaWJsZT0hMDtlbHNle3ZhciBsPXRoaXMuY3JlYXRlU3ByaXRlKGcsaCk7aS5hZGRDaGlsZChsKX1nLmN1cnJlbnRTcHJpdGU9Zy5zcHJpdGVzW2tdLGcuY3VycmVudFNwcml0ZU5hbWU9a312YXIgbT1nLmJvbmU7aS5wb3NpdGlvbi54PW0ud29ybGRYK2gueCptLm0wMCtoLnkqbS5tMDEsaS5wb3NpdGlvbi55PW0ud29ybGRZK2gueCptLm0xMCtoLnkqbS5tMTEsaS5zY2FsZS54PW0ud29ybGRTY2FsZVgsaS5zY2FsZS55PW0ud29ybGRTY2FsZVksaS5yb3RhdGlvbj0tKGcuYm9uZS53b3JsZFJvdGF0aW9uKmMuZGVnUmFkKSxnLmN1cnJlbnRTcHJpdGUudGludD1iLnJnYjJoZXgoW2cucixnLmcsZy5iXSl9ZWxzZXtpZihqIT09Yy5BdHRhY2htZW50VHlwZS5za2lubmVkbWVzaCl7aS52aXNpYmxlPSExO2NvbnRpbnVlfWlmKCFnLmN1cnJlbnRNZXNoTmFtZXx8Zy5jdXJyZW50TWVzaE5hbWUhPT1oLm5hbWUpe3ZhciBuPWgubmFtZTtpZih2b2lkIDAhPT1nLmN1cnJlbnRNZXNoJiYoZy5jdXJyZW50TWVzaC52aXNpYmxlPSExKSxnLm1lc2hlcz1nLm1lc2hlc3x8e30sdm9pZCAwIT09Zy5tZXNoZXNbbl0pZy5tZXNoZXNbbl0udmlzaWJsZT0hMDtlbHNle3ZhciBvPXRoaXMuY3JlYXRlTWVzaChnLGgpO2kuYWRkQ2hpbGQobyl9Zy5jdXJyZW50TWVzaD1nLm1lc2hlc1tuXSxnLmN1cnJlbnRNZXNoTmFtZT1ufWguY29tcHV0ZVdvcmxkVmVydGljZXMoZy5ib25lLnNrZWxldG9uLngsZy5ib25lLnNrZWxldG9uLnksZyxnLmN1cnJlbnRNZXNoLnZlcnRpY2VzKX1pLnZpc2libGU9ITAsaS5hbHBoYT1nLmF9ZWxzZSBpLnZpc2libGU9ITF9fSxiLlNwaW5lLnByb3RvdHlwZS5hdXRvVXBkYXRlVHJhbnNmb3JtPWZ1bmN0aW9uKCl7dGhpcy5sYXN0VGltZT10aGlzLmxhc3RUaW1lfHxEYXRlLm5vdygpO3ZhciBhPS4wMDEqKERhdGUubm93KCktdGhpcy5sYXN0VGltZSk7dGhpcy5sYXN0VGltZT1EYXRlLm5vdygpLHRoaXMudXBkYXRlKGEpLGIuRGlzcGxheU9iamVjdENvbnRhaW5lci5wcm90b3R5cGUudXBkYXRlVHJhbnNmb3JtLmNhbGwodGhpcyl9LGIuU3BpbmUucHJvdG90eXBlLmNyZWF0ZVNwcml0ZT1mdW5jdGlvbihhLGQpe3ZhciBlPWQucmVuZGVyZXJPYmplY3QsZj1lLnBhZ2UucmVuZGVyZXJPYmplY3QsZz1uZXcgYi5SZWN0YW5nbGUoZS54LGUueSxlLnJvdGF0ZT9lLmhlaWdodDplLndpZHRoLGUucm90YXRlP2Uud2lkdGg6ZS5oZWlnaHQpLGg9bmV3IGIuVGV4dHVyZShmLGcpLGk9bmV3IGIuU3ByaXRlKGgpLGo9ZS5yb3RhdGU/LjUqTWF0aC5QSTowO3JldHVybiBpLnNjYWxlLnNldChlLndpZHRoL2Uub3JpZ2luYWxXaWR0aCxlLmhlaWdodC9lLm9yaWdpbmFsSGVpZ2h0KSxpLnJvdGF0aW9uPWotZC5yb3RhdGlvbipjLmRlZ1JhZCxpLmFuY2hvci54PWkuYW5jaG9yLnk9LjUsYS5zcHJpdGVzPWEuc3ByaXRlc3x8e30sYS5zcHJpdGVzW2UubmFtZV09aSxpfSxiLlNwaW5lLnByb3RvdHlwZS5jcmVhdGVNZXNoPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yy5yZW5kZXJlck9iamVjdCxlPWQucGFnZS5yZW5kZXJlck9iamVjdCxmPW5ldyBiLlRleHR1cmUoZSksZz1uZXcgYi5TdHJpcChmKTtyZXR1cm4gZy5kcmF3TW9kZT1iLlN0cmlwLkRyYXdNb2Rlcy5UUklBTkdMRVMsZy5jYW52YXNQYWRkaW5nPTEuNSxnLnZlcnRpY2VzPW5ldyBiLkZsb2F0MzJBcnJheShjLnV2cy5sZW5ndGgpLGcudXZzPWMudXZzLGcuaW5kaWNlcz1jLnRyaWFuZ2xlcyxhLm1lc2hlcz1hLm1lc2hlc3x8e30sYS5tZXNoZXNbYy5uYW1lXT1nLGd9LGIuQmFzZVRleHR1cmVDYWNoZT17fSxiLkJhc2VUZXh0dXJlQ2FjaGVJZEdlbmVyYXRvcj0wLGIuQmFzZVRleHR1cmU9ZnVuY3Rpb24oYSxjKXtpZih0aGlzLnJlc29sdXRpb249MSx0aGlzLndpZHRoPTEwMCx0aGlzLmhlaWdodD0xMDAsdGhpcy5zY2FsZU1vZGU9Y3x8Yi5zY2FsZU1vZGVzLkRFRkFVTFQsdGhpcy5oYXNMb2FkZWQ9ITEsdGhpcy5zb3VyY2U9YSx0aGlzLl9VSUQ9Yi5fVUlEKyssdGhpcy5wcmVtdWx0aXBsaWVkQWxwaGE9ITAsdGhpcy5fZ2xUZXh0dXJlcz1bXSx0aGlzLm1pcG1hcD0hMSx0aGlzLl9kaXJ0eT1bITAsITAsITAsITBdLGEpe2lmKCh0aGlzLnNvdXJjZS5jb21wbGV0ZXx8dGhpcy5zb3VyY2UuZ2V0Q29udGV4dCkmJnRoaXMuc291cmNlLndpZHRoJiZ0aGlzLnNvdXJjZS5oZWlnaHQpdGhpcy5oYXNMb2FkZWQ9ITAsdGhpcy53aWR0aD10aGlzLnNvdXJjZS5uYXR1cmFsV2lkdGh8fHRoaXMuc291cmNlLndpZHRoLHRoaXMuaGVpZ2h0PXRoaXMuc291cmNlLm5hdHVyYWxIZWlnaHR8fHRoaXMuc291cmNlLmhlaWdodCx0aGlzLmRpcnR5KCk7ZWxzZXt2YXIgZD10aGlzO3RoaXMuc291cmNlLm9ubG9hZD1mdW5jdGlvbigpe2QuaGFzTG9hZGVkPSEwLGQud2lkdGg9ZC5zb3VyY2UubmF0dXJhbFdpZHRofHxkLnNvdXJjZS53aWR0aCxkLmhlaWdodD1kLnNvdXJjZS5uYXR1cmFsSGVpZ2h0fHxkLnNvdXJjZS5oZWlnaHQsZC5kaXJ0eSgpLGQuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImxvYWRlZFwiLGNvbnRlbnQ6ZH0pfSx0aGlzLnNvdXJjZS5vbmVycm9yPWZ1bmN0aW9uKCl7ZC5kaXNwYXRjaEV2ZW50KHt0eXBlOlwiZXJyb3JcIixjb250ZW50OmR9KX19dGhpcy5pbWFnZVVybD1udWxsLHRoaXMuX3Bvd2VyT2YyPSExfX0sYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5CYXNlVGV4dHVyZSxiLkV2ZW50VGFyZ2V0Lm1peGluKGIuQmFzZVRleHR1cmUucHJvdG90eXBlKSxiLkJhc2VUZXh0dXJlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5pbWFnZVVybD8oZGVsZXRlIGIuQmFzZVRleHR1cmVDYWNoZVt0aGlzLmltYWdlVXJsXSxkZWxldGUgYi5UZXh0dXJlQ2FjaGVbdGhpcy5pbWFnZVVybF0sdGhpcy5pbWFnZVVybD1udWxsLG5hdmlnYXRvci5pc0NvY29vbkpTfHwodGhpcy5zb3VyY2Uuc3JjPVwiXCIpKTp0aGlzLnNvdXJjZSYmdGhpcy5zb3VyY2UuX3BpeGlJZCYmZGVsZXRlIGIuQmFzZVRleHR1cmVDYWNoZVt0aGlzLnNvdXJjZS5fcGl4aUlkXSx0aGlzLnNvdXJjZT1udWxsLHRoaXMudW5sb2FkRnJvbUdQVSgpfSxiLkJhc2VUZXh0dXJlLnByb3RvdHlwZS51cGRhdGVTb3VyY2VJbWFnZT1mdW5jdGlvbihhKXt0aGlzLmhhc0xvYWRlZD0hMSx0aGlzLnNvdXJjZS5zcmM9bnVsbCx0aGlzLnNvdXJjZS5zcmM9YX0sYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUuZGlydHk9ZnVuY3Rpb24oKXtmb3IodmFyIGE9MDthPHRoaXMuX2dsVGV4dHVyZXMubGVuZ3RoO2ErKyl0aGlzLl9kaXJ0eVthXT0hMH0sYi5CYXNlVGV4dHVyZS5wcm90b3R5cGUudW5sb2FkRnJvbUdQVT1mdW5jdGlvbigpe3RoaXMuZGlydHkoKTtmb3IodmFyIGE9dGhpcy5fZ2xUZXh0dXJlcy5sZW5ndGgtMTthPj0wO2EtLSl7dmFyIGM9dGhpcy5fZ2xUZXh0dXJlc1thXSxkPWIuZ2xDb250ZXh0c1thXTtkJiZjJiZkLmRlbGV0ZVRleHR1cmUoYyl9dGhpcy5fZ2xUZXh0dXJlcy5sZW5ndGg9MCx0aGlzLmRpcnR5KCl9LGIuQmFzZVRleHR1cmUuZnJvbUltYWdlPWZ1bmN0aW9uKGEsYyxkKXt2YXIgZT1iLkJhc2VUZXh0dXJlQ2FjaGVbYV07aWYodm9pZCAwPT09YyYmLTE9PT1hLmluZGV4T2YoXCJkYXRhOlwiKSYmKGM9ITApLCFlKXt2YXIgZj1uZXcgSW1hZ2U7YyYmKGYuY3Jvc3NPcmlnaW49XCJcIiksZi5zcmM9YSxlPW5ldyBiLkJhc2VUZXh0dXJlKGYsZCksZS5pbWFnZVVybD1hLGIuQmFzZVRleHR1cmVDYWNoZVthXT1lLC0xIT09YS5pbmRleE9mKGIuUkVUSU5BX1BSRUZJWCtcIi5cIikmJihlLnJlc29sdXRpb249Mil9cmV0dXJuIGV9LGIuQmFzZVRleHR1cmUuZnJvbUNhbnZhcz1mdW5jdGlvbihhLGMpe2EuX3BpeGlJZHx8KGEuX3BpeGlJZD1cImNhbnZhc19cIitiLlRleHR1cmVDYWNoZUlkR2VuZXJhdG9yKyspO3ZhciBkPWIuQmFzZVRleHR1cmVDYWNoZVthLl9waXhpSWRdO3JldHVybiBkfHwoZD1uZXcgYi5CYXNlVGV4dHVyZShhLGMpLGIuQmFzZVRleHR1cmVDYWNoZVthLl9waXhpSWRdPWQpLGR9LGIuVGV4dHVyZUNhY2hlPXt9LGIuRnJhbWVDYWNoZT17fSxiLlRleHR1cmVDYWNoZUlkR2VuZXJhdG9yPTAsYi5UZXh0dXJlPWZ1bmN0aW9uKGEsYyxkLGUpe3RoaXMubm9GcmFtZT0hMSxjfHwodGhpcy5ub0ZyYW1lPSEwLGM9bmV3IGIuUmVjdGFuZ2xlKDAsMCwxLDEpKSxhIGluc3RhbmNlb2YgYi5UZXh0dXJlJiYoYT1hLmJhc2VUZXh0dXJlKSx0aGlzLmJhc2VUZXh0dXJlPWEsdGhpcy5mcmFtZT1jLHRoaXMudHJpbT1lLHRoaXMudmFsaWQ9ITEsdGhpcy5yZXF1aXJlc1VwZGF0ZT0hMSx0aGlzLl91dnM9bnVsbCx0aGlzLndpZHRoPTAsdGhpcy5oZWlnaHQ9MCx0aGlzLmNyb3A9ZHx8bmV3IGIuUmVjdGFuZ2xlKDAsMCwxLDEpLGEuaGFzTG9hZGVkPyh0aGlzLm5vRnJhbWUmJihjPW5ldyBiLlJlY3RhbmdsZSgwLDAsYS53aWR0aCxhLmhlaWdodCkpLHRoaXMuc2V0RnJhbWUoYykpOmEuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZFwiLHRoaXMub25CYXNlVGV4dHVyZUxvYWRlZC5iaW5kKHRoaXMpKX0sYi5UZXh0dXJlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlRleHR1cmUsYi5FdmVudFRhcmdldC5taXhpbihiLlRleHR1cmUucHJvdG90eXBlKSxiLlRleHR1cmUucHJvdG90eXBlLm9uQmFzZVRleHR1cmVMb2FkZWQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLmJhc2VUZXh0dXJlO2EucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImxvYWRlZFwiLHRoaXMub25Mb2FkZWQpLHRoaXMubm9GcmFtZSYmKHRoaXMuZnJhbWU9bmV3IGIuUmVjdGFuZ2xlKDAsMCxhLndpZHRoLGEuaGVpZ2h0KSksdGhpcy5zZXRGcmFtZSh0aGlzLmZyYW1lKSx0aGlzLmRpc3BhdGNoRXZlbnQoe3R5cGU6XCJ1cGRhdGVcIixjb250ZW50OnRoaXN9KX0sYi5UZXh0dXJlLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKGEpe2EmJnRoaXMuYmFzZVRleHR1cmUuZGVzdHJveSgpLHRoaXMudmFsaWQ9ITF9LGIuVGV4dHVyZS5wcm90b3R5cGUuc2V0RnJhbWU9ZnVuY3Rpb24oYSl7aWYodGhpcy5ub0ZyYW1lPSExLHRoaXMuZnJhbWU9YSx0aGlzLndpZHRoPWEud2lkdGgsdGhpcy5oZWlnaHQ9YS5oZWlnaHQsdGhpcy5jcm9wLng9YS54LHRoaXMuY3JvcC55PWEueSx0aGlzLmNyb3Aud2lkdGg9YS53aWR0aCx0aGlzLmNyb3AuaGVpZ2h0PWEuaGVpZ2h0LCF0aGlzLnRyaW0mJihhLngrYS53aWR0aD50aGlzLmJhc2VUZXh0dXJlLndpZHRofHxhLnkrYS5oZWlnaHQ+dGhpcy5iYXNlVGV4dHVyZS5oZWlnaHQpKXRocm93IG5ldyBFcnJvcihcIlRleHR1cmUgRXJyb3I6IGZyYW1lIGRvZXMgbm90IGZpdCBpbnNpZGUgdGhlIGJhc2UgVGV4dHVyZSBkaW1lbnNpb25zIFwiK3RoaXMpO3RoaXMudmFsaWQ9YSYmYS53aWR0aCYmYS5oZWlnaHQmJnRoaXMuYmFzZVRleHR1cmUuc291cmNlJiZ0aGlzLmJhc2VUZXh0dXJlLmhhc0xvYWRlZCx0aGlzLnRyaW0mJih0aGlzLndpZHRoPXRoaXMudHJpbS53aWR0aCx0aGlzLmhlaWdodD10aGlzLnRyaW0uaGVpZ2h0LHRoaXMuZnJhbWUud2lkdGg9dGhpcy50cmltLndpZHRoLHRoaXMuZnJhbWUuaGVpZ2h0PXRoaXMudHJpbS5oZWlnaHQpLHRoaXMudmFsaWQmJnRoaXMuX3VwZGF0ZVV2cygpfSxiLlRleHR1cmUucHJvdG90eXBlLl91cGRhdGVVdnM9ZnVuY3Rpb24oKXt0aGlzLl91dnN8fCh0aGlzLl91dnM9bmV3IGIuVGV4dHVyZVV2cyk7dmFyIGE9dGhpcy5jcm9wLGM9dGhpcy5iYXNlVGV4dHVyZS53aWR0aCxkPXRoaXMuYmFzZVRleHR1cmUuaGVpZ2h0O3RoaXMuX3V2cy54MD1hLngvYyx0aGlzLl91dnMueTA9YS55L2QsdGhpcy5fdXZzLngxPShhLngrYS53aWR0aCkvYyx0aGlzLl91dnMueTE9YS55L2QsdGhpcy5fdXZzLngyPShhLngrYS53aWR0aCkvYyx0aGlzLl91dnMueTI9KGEueSthLmhlaWdodCkvZCx0aGlzLl91dnMueDM9YS54L2MsdGhpcy5fdXZzLnkzPShhLnkrYS5oZWlnaHQpL2R9LGIuVGV4dHVyZS5mcm9tSW1hZ2U9ZnVuY3Rpb24oYSxjLGQpe3ZhciBlPWIuVGV4dHVyZUNhY2hlW2FdO3JldHVybiBlfHwoZT1uZXcgYi5UZXh0dXJlKGIuQmFzZVRleHR1cmUuZnJvbUltYWdlKGEsYyxkKSksYi5UZXh0dXJlQ2FjaGVbYV09ZSksZX0sYi5UZXh0dXJlLmZyb21GcmFtZT1mdW5jdGlvbihhKXt2YXIgYz1iLlRleHR1cmVDYWNoZVthXTtpZighYyl0aHJvdyBuZXcgRXJyb3IoJ1RoZSBmcmFtZUlkIFwiJythKydcIiBkb2VzIG5vdCBleGlzdCBpbiB0aGUgdGV4dHVyZSBjYWNoZSAnKTtyZXR1cm4gY30sYi5UZXh0dXJlLmZyb21DYW52YXM9ZnVuY3Rpb24oYSxjKXt2YXIgZD1iLkJhc2VUZXh0dXJlLmZyb21DYW52YXMoYSxjKTtyZXR1cm4gbmV3IGIuVGV4dHVyZShkKX0sYi5UZXh0dXJlLmFkZFRleHR1cmVUb0NhY2hlPWZ1bmN0aW9uKGEsYyl7Yi5UZXh0dXJlQ2FjaGVbY109YX0sYi5UZXh0dXJlLnJlbW92ZVRleHR1cmVGcm9tQ2FjaGU9ZnVuY3Rpb24oYSl7dmFyIGM9Yi5UZXh0dXJlQ2FjaGVbYV07cmV0dXJuIGRlbGV0ZSBiLlRleHR1cmVDYWNoZVthXSxkZWxldGUgYi5CYXNlVGV4dHVyZUNhY2hlW2FdLGN9LGIuVGV4dHVyZVV2cz1mdW5jdGlvbigpe3RoaXMueDA9MCx0aGlzLnkwPTAsdGhpcy54MT0wLHRoaXMueTE9MCx0aGlzLngyPTAsdGhpcy55Mj0wLHRoaXMueDM9MCx0aGlzLnkzPTB9LGIuVGV4dHVyZS5lbXB0eVRleHR1cmU9bmV3IGIuVGV4dHVyZShuZXcgYi5CYXNlVGV4dHVyZSksYi5SZW5kZXJUZXh0dXJlPWZ1bmN0aW9uKGEsYyxkLGUsZil7aWYodGhpcy53aWR0aD1hfHwxMDAsdGhpcy5oZWlnaHQ9Y3x8MTAwLHRoaXMucmVzb2x1dGlvbj1mfHwxLHRoaXMuZnJhbWU9bmV3IGIuUmVjdGFuZ2xlKDAsMCx0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24pLHRoaXMuY3JvcD1uZXcgYi5SZWN0YW5nbGUoMCwwLHRoaXMud2lkdGgqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0KnRoaXMucmVzb2x1dGlvbiksdGhpcy5iYXNlVGV4dHVyZT1uZXcgYi5CYXNlVGV4dHVyZSx0aGlzLmJhc2VUZXh0dXJlLndpZHRoPXRoaXMud2lkdGgqdGhpcy5yZXNvbHV0aW9uLHRoaXMuYmFzZVRleHR1cmUuaGVpZ2h0PXRoaXMuaGVpZ2h0KnRoaXMucmVzb2x1dGlvbix0aGlzLmJhc2VUZXh0dXJlLl9nbFRleHR1cmVzPVtdLHRoaXMuYmFzZVRleHR1cmUucmVzb2x1dGlvbj10aGlzLnJlc29sdXRpb24sdGhpcy5iYXNlVGV4dHVyZS5zY2FsZU1vZGU9ZXx8Yi5zY2FsZU1vZGVzLkRFRkFVTFQsdGhpcy5iYXNlVGV4dHVyZS5oYXNMb2FkZWQ9ITAsYi5UZXh0dXJlLmNhbGwodGhpcyx0aGlzLmJhc2VUZXh0dXJlLG5ldyBiLlJlY3RhbmdsZSgwLDAsdGhpcy53aWR0aCx0aGlzLmhlaWdodCkpLHRoaXMucmVuZGVyZXI9ZHx8Yi5kZWZhdWx0UmVuZGVyZXIsdGhpcy5yZW5kZXJlci50eXBlPT09Yi5XRUJHTF9SRU5ERVJFUil7dmFyIGc9dGhpcy5yZW5kZXJlci5nbDt0aGlzLmJhc2VUZXh0dXJlLl9kaXJ0eVtnLmlkXT0hMSx0aGlzLnRleHR1cmVCdWZmZXI9bmV3IGIuRmlsdGVyVGV4dHVyZShnLHRoaXMud2lkdGgqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0KnRoaXMucmVzb2x1dGlvbix0aGlzLmJhc2VUZXh0dXJlLnNjYWxlTW9kZSksdGhpcy5iYXNlVGV4dHVyZS5fZ2xUZXh0dXJlc1tnLmlkXT10aGlzLnRleHR1cmVCdWZmZXIudGV4dHVyZSx0aGlzLnJlbmRlcj10aGlzLnJlbmRlcldlYkdMLHRoaXMucHJvamVjdGlvbj1uZXcgYi5Qb2ludCguNSp0aGlzLndpZHRoLC41Ki10aGlzLmhlaWdodCl9ZWxzZSB0aGlzLnJlbmRlcj10aGlzLnJlbmRlckNhbnZhcyx0aGlzLnRleHR1cmVCdWZmZXI9bmV3IGIuQ2FudmFzQnVmZmVyKHRoaXMud2lkdGgqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0KnRoaXMucmVzb2x1dGlvbiksdGhpcy5iYXNlVGV4dHVyZS5zb3VyY2U9dGhpcy50ZXh0dXJlQnVmZmVyLmNhbnZhczt0aGlzLnZhbGlkPSEwLHRoaXMuX3VwZGF0ZVV2cygpfSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5UZXh0dXJlLnByb3RvdHlwZSksYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlJlbmRlclRleHR1cmUsYi5SZW5kZXJUZXh0dXJlLnByb3RvdHlwZS5yZXNpemU9ZnVuY3Rpb24oYSxjLGQpeyhhIT09dGhpcy53aWR0aHx8YyE9PXRoaXMuaGVpZ2h0KSYmKHRoaXMudmFsaWQ9YT4wJiZjPjAsdGhpcy53aWR0aD10aGlzLmZyYW1lLndpZHRoPXRoaXMuY3JvcC53aWR0aD1hLHRoaXMuaGVpZ2h0PXRoaXMuZnJhbWUuaGVpZ2h0PXRoaXMuY3JvcC5oZWlnaHQ9YyxkJiYodGhpcy5iYXNlVGV4dHVyZS53aWR0aD10aGlzLndpZHRoLHRoaXMuYmFzZVRleHR1cmUuaGVpZ2h0PXRoaXMuaGVpZ2h0KSx0aGlzLnJlbmRlcmVyLnR5cGU9PT1iLldFQkdMX1JFTkRFUkVSJiYodGhpcy5wcm9qZWN0aW9uLng9dGhpcy53aWR0aC8yLHRoaXMucHJvamVjdGlvbi55PS10aGlzLmhlaWdodC8yKSx0aGlzLnZhbGlkJiZ0aGlzLnRleHR1cmVCdWZmZXIucmVzaXplKHRoaXMud2lkdGgqdGhpcy5yZXNvbHV0aW9uLHRoaXMuaGVpZ2h0KnRoaXMucmVzb2x1dGlvbikpfSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7dGhpcy52YWxpZCYmKHRoaXMucmVuZGVyZXIudHlwZT09PWIuV0VCR0xfUkVOREVSRVImJnRoaXMucmVuZGVyZXIuZ2wuYmluZEZyYW1lYnVmZmVyKHRoaXMucmVuZGVyZXIuZ2wuRlJBTUVCVUZGRVIsdGhpcy50ZXh0dXJlQnVmZmVyLmZyYW1lQnVmZmVyKSx0aGlzLnRleHR1cmVCdWZmZXIuY2xlYXIoKSl9LGIuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUucmVuZGVyV2ViR0w9ZnVuY3Rpb24oYSxiLGMpe2lmKHRoaXMudmFsaWQpe3ZhciBkPWEud29ybGRUcmFuc2Zvcm07ZC5pZGVudGl0eSgpLGQudHJhbnNsYXRlKDAsMip0aGlzLnByb2plY3Rpb24ueSksYiYmZC5hcHBlbmQoYiksZC5zY2FsZSgxLC0xKSxhLndvcmxkQWxwaGE9MTtmb3IodmFyIGU9YS5jaGlsZHJlbixmPTAsZz1lLmxlbmd0aDtnPmY7ZisrKWVbZl0udXBkYXRlVHJhbnNmb3JtKCk7dmFyIGg9dGhpcy5yZW5kZXJlci5nbDtoLnZpZXdwb3J0KDAsMCx0aGlzLndpZHRoKnRoaXMucmVzb2x1dGlvbix0aGlzLmhlaWdodCp0aGlzLnJlc29sdXRpb24pLGguYmluZEZyYW1lYnVmZmVyKGguRlJBTUVCVUZGRVIsdGhpcy50ZXh0dXJlQnVmZmVyLmZyYW1lQnVmZmVyKSxjJiZ0aGlzLnRleHR1cmVCdWZmZXIuY2xlYXIoKSx0aGlzLnJlbmRlcmVyLnNwcml0ZUJhdGNoLmRpcnR5PSEwLHRoaXMucmVuZGVyZXIucmVuZGVyRGlzcGxheU9iamVjdChhLHRoaXMucHJvamVjdGlvbix0aGlzLnRleHR1cmVCdWZmZXIuZnJhbWVCdWZmZXIpLHRoaXMucmVuZGVyZXIuc3ByaXRlQmF0Y2guZGlydHk9ITB9fSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLnJlbmRlckNhbnZhcz1mdW5jdGlvbihhLGIsYyl7aWYodGhpcy52YWxpZCl7dmFyIGQ9YS53b3JsZFRyYW5zZm9ybTtkLmlkZW50aXR5KCksYiYmZC5hcHBlbmQoYiksYS53b3JsZEFscGhhPTE7Zm9yKHZhciBlPWEuY2hpbGRyZW4sZj0wLGc9ZS5sZW5ndGg7Zz5mO2YrKyllW2ZdLnVwZGF0ZVRyYW5zZm9ybSgpO2MmJnRoaXMudGV4dHVyZUJ1ZmZlci5jbGVhcigpO3ZhciBoPXRoaXMudGV4dHVyZUJ1ZmZlci5jb250ZXh0LGk9dGhpcy5yZW5kZXJlci5yZXNvbHV0aW9uO3RoaXMucmVuZGVyZXIucmVzb2x1dGlvbj10aGlzLnJlc29sdXRpb24sdGhpcy5yZW5kZXJlci5yZW5kZXJEaXNwbGF5T2JqZWN0KGEsaCksdGhpcy5yZW5kZXJlci5yZXNvbHV0aW9uPWl9fSxiLlJlbmRlclRleHR1cmUucHJvdG90eXBlLmdldEltYWdlPWZ1bmN0aW9uKCl7dmFyIGE9bmV3IEltYWdlO3JldHVybiBhLnNyYz10aGlzLmdldEJhc2U2NCgpLGF9LGIuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuZ2V0QmFzZTY0PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuZ2V0Q2FudmFzKCkudG9EYXRhVVJMKCl9LGIuUmVuZGVyVGV4dHVyZS5wcm90b3R5cGUuZ2V0Q2FudmFzPWZ1bmN0aW9uKCl7aWYodGhpcy5yZW5kZXJlci50eXBlPT09Yi5XRUJHTF9SRU5ERVJFUil7dmFyIGE9dGhpcy5yZW5kZXJlci5nbCxjPXRoaXMudGV4dHVyZUJ1ZmZlci53aWR0aCxkPXRoaXMudGV4dHVyZUJ1ZmZlci5oZWlnaHQsZT1uZXcgVWludDhBcnJheSg0KmMqZCk7YS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUix0aGlzLnRleHR1cmVCdWZmZXIuZnJhbWVCdWZmZXIpLGEucmVhZFBpeGVscygwLDAsYyxkLGEuUkdCQSxhLlVOU0lHTkVEX0JZVEUsZSksYS5iaW5kRnJhbWVidWZmZXIoYS5GUkFNRUJVRkZFUixudWxsKTt2YXIgZj1uZXcgYi5DYW52YXNCdWZmZXIoYyxkKSxnPWYuY29udGV4dC5nZXRJbWFnZURhdGEoMCwwLGMsZCk7cmV0dXJuIGcuZGF0YS5zZXQoZSksZi5jb250ZXh0LnB1dEltYWdlRGF0YShnLDAsMCksZi5jYW52YXN9cmV0dXJuIHRoaXMudGV4dHVyZUJ1ZmZlci5jYW52YXN9LGIuUmVuZGVyVGV4dHVyZS50ZW1wTWF0cml4PW5ldyBiLk1hdHJpeCxiLlZpZGVvVGV4dHVyZT1mdW5jdGlvbihhLGMpe2lmKCFhKXRocm93IG5ldyBFcnJvcihcIk5vIHZpZGVvIHNvdXJjZSBlbGVtZW50IHNwZWNpZmllZC5cIik7KGEucmVhZHlTdGF0ZT09PWEuSEFWRV9FTk9VR0hfREFUQXx8YS5yZWFkeVN0YXRlPT09YS5IQVZFX0ZVVFVSRV9EQVRBKSYmYS53aWR0aCYmYS5oZWlnaHQmJihhLmNvbXBsZXRlPSEwKSxiLkJhc2VUZXh0dXJlLmNhbGwodGhpcyxhLGMpLHRoaXMuYXV0b1VwZGF0ZT0hMSx0aGlzLnVwZGF0ZUJvdW5kPXRoaXMuX29uVXBkYXRlLmJpbmQodGhpcyksYS5jb21wbGV0ZXx8KHRoaXMuX29uQ2FuUGxheT10aGlzLm9uQ2FuUGxheS5iaW5kKHRoaXMpLGEuYWRkRXZlbnRMaXN0ZW5lcihcImNhbnBsYXlcIix0aGlzLl9vbkNhblBsYXkpLGEuYWRkRXZlbnRMaXN0ZW5lcihcImNhbnBsYXl0aHJvdWdoXCIsdGhpcy5fb25DYW5QbGF5KSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJwbGF5XCIsdGhpcy5vblBsYXlTdGFydC5iaW5kKHRoaXMpKSxhLmFkZEV2ZW50TGlzdGVuZXIoXCJwYXVzZVwiLHRoaXMub25QbGF5U3RvcC5iaW5kKHRoaXMpKSl9LGIuVmlkZW9UZXh0dXJlLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQmFzZVRleHR1cmUucHJvdG90eXBlKSxiLlZpZGVvVGV4dHVyZS5jb25zdHJ1Y3Rvcj1iLlZpZGVvVGV4dHVyZSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUuX29uVXBkYXRlPWZ1bmN0aW9uKCl7dGhpcy5hdXRvVXBkYXRlJiYod2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSh0aGlzLnVwZGF0ZUJvdW5kKSx0aGlzLmRpcnR5KCkpfSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUub25QbGF5U3RhcnQ9ZnVuY3Rpb24oKXt0aGlzLmF1dG9VcGRhdGV8fCh3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMudXBkYXRlQm91bmQpLHRoaXMuYXV0b1VwZGF0ZT0hMCl9LGIuVmlkZW9UZXh0dXJlLnByb3RvdHlwZS5vblBsYXlTdG9wPWZ1bmN0aW9uKCl7dGhpcy5hdXRvVXBkYXRlPSExfSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUub25DYW5QbGF5PWZ1bmN0aW9uKCl7XCJjYW5wbGF5dGhyb3VnaFwiPT09ZXZlbnQudHlwZSYmKHRoaXMuaGFzTG9hZGVkPSEwLHRoaXMuc291cmNlJiYodGhpcy5zb3VyY2UucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImNhbnBsYXlcIix0aGlzLl9vbkNhblBsYXkpLHRoaXMuc291cmNlLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjYW5wbGF5dGhyb3VnaFwiLHRoaXMuX29uQ2FuUGxheSksdGhpcy53aWR0aD10aGlzLnNvdXJjZS52aWRlb1dpZHRoLHRoaXMuaGVpZ2h0PXRoaXMuc291cmNlLnZpZGVvSGVpZ2h0LHRoaXMuX19sb2FkZWR8fCh0aGlzLl9fbG9hZGVkPSEwLHRoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImxvYWRlZFwiLGNvbnRlbnQ6dGhpc30pKSkpfSxiLlZpZGVvVGV4dHVyZS5wcm90b3R5cGUuZGVzdHJveT1mdW5jdGlvbigpe3RoaXMuc291cmNlJiZ0aGlzLnNvdXJjZS5fcGl4aUlkJiYoYi5CYXNlVGV4dHVyZUNhY2hlW3RoaXMuc291cmNlLl9waXhpSWRdPW51bGwsZGVsZXRlIGIuQmFzZVRleHR1cmVDYWNoZVt0aGlzLnNvdXJjZS5fcGl4aUlkXSx0aGlzLnNvdXJjZS5fcGl4aUlkPW51bGwsZGVsZXRlIHRoaXMuc291cmNlLl9waXhpSWQpLGIuQmFzZVRleHR1cmUucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKX0sYi5WaWRlb1RleHR1cmUuYmFzZVRleHR1cmVGcm9tVmlkZW89ZnVuY3Rpb24oYSxjKXthLl9waXhpSWR8fChhLl9waXhpSWQ9XCJ2aWRlb19cIitiLlRleHR1cmVDYWNoZUlkR2VuZXJhdG9yKyspO3ZhciBkPWIuQmFzZVRleHR1cmVDYWNoZVthLl9waXhpSWRdO3JldHVybiBkfHwoZD1uZXcgYi5WaWRlb1RleHR1cmUoYSxjKSxiLkJhc2VUZXh0dXJlQ2FjaGVbYS5fcGl4aUlkXT1kKSxkfSxiLlZpZGVvVGV4dHVyZS50ZXh0dXJlRnJvbVZpZGVvPWZ1bmN0aW9uKGEsYyl7dmFyIGQ9Yi5WaWRlb1RleHR1cmUuYmFzZVRleHR1cmVGcm9tVmlkZW8oYSxjKTtyZXR1cm4gbmV3IGIuVGV4dHVyZShkKX0sYi5WaWRlb1RleHR1cmUuZnJvbVVybD1mdW5jdGlvbihhLGMpe3ZhciBkPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJ2aWRlb1wiKTtyZXR1cm4gZC5zcmM9YSxkLmF1dG9QbGF5PSEwLGQucGxheSgpLGIuVmlkZW9UZXh0dXJlLnRleHR1cmVGcm9tVmlkZW8oZCxjKX0sYi5Bc3NldExvYWRlcj1mdW5jdGlvbihhLGMpe3RoaXMuYXNzZXRVUkxzPWEsdGhpcy5jcm9zc29yaWdpbj1jLHRoaXMubG9hZGVyc0J5VHlwZT17anBnOmIuSW1hZ2VMb2FkZXIsanBlZzpiLkltYWdlTG9hZGVyLHBuZzpiLkltYWdlTG9hZGVyLGdpZjpiLkltYWdlTG9hZGVyLHdlYnA6Yi5JbWFnZUxvYWRlcixqc29uOmIuSnNvbkxvYWRlcixhdGxhczpiLkF0bGFzTG9hZGVyLGFuaW06Yi5TcGluZUxvYWRlcix4bWw6Yi5CaXRtYXBGb250TG9hZGVyLGZudDpiLkJpdG1hcEZvbnRMb2FkZXJ9fSxiLkV2ZW50VGFyZ2V0Lm1peGluKGIuQXNzZXRMb2FkZXIucHJvdG90eXBlKSxiLkFzc2V0TG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkFzc2V0TG9hZGVyLGIuQXNzZXRMb2FkZXIucHJvdG90eXBlLl9nZXREYXRhVHlwZT1mdW5jdGlvbihhKXt2YXIgYj1cImRhdGE6XCIsYz1hLnNsaWNlKDAsYi5sZW5ndGgpLnRvTG93ZXJDYXNlKCk7aWYoYz09PWIpe3ZhciBkPWEuc2xpY2UoYi5sZW5ndGgpLGU9ZC5pbmRleE9mKFwiLFwiKTtpZigtMT09PWUpcmV0dXJuIG51bGw7dmFyIGY9ZC5zbGljZSgwLGUpLnNwbGl0KFwiO1wiKVswXTtyZXR1cm4gZiYmXCJ0ZXh0L3BsYWluXCIhPT1mLnRvTG93ZXJDYXNlKCk/Zi5zcGxpdChcIi9cIikucG9wKCkudG9Mb3dlckNhc2UoKTpcInR4dFwifXJldHVybiBudWxsfSxiLkFzc2V0TG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShhKXtiLm9uQXNzZXRMb2FkZWQoYS5kYXRhLmNvbnRlbnQpfXZhciBiPXRoaXM7dGhpcy5sb2FkQ291bnQ9dGhpcy5hc3NldFVSTHMubGVuZ3RoO2Zvcih2YXIgYz0wO2M8dGhpcy5hc3NldFVSTHMubGVuZ3RoO2MrKyl7dmFyIGQ9dGhpcy5hc3NldFVSTHNbY10sZT10aGlzLl9nZXREYXRhVHlwZShkKTtlfHwoZT1kLnNwbGl0KFwiP1wiKS5zaGlmdCgpLnNwbGl0KFwiLlwiKS5wb3AoKS50b0xvd2VyQ2FzZSgpKTt2YXIgZj10aGlzLmxvYWRlcnNCeVR5cGVbZV07aWYoIWYpdGhyb3cgbmV3IEVycm9yKGUrXCIgaXMgYW4gdW5zdXBwb3J0ZWQgZmlsZSB0eXBlXCIpO3ZhciBnPW5ldyBmKGQsdGhpcy5jcm9zc29yaWdpbik7Zy5vbihcImxvYWRlZFwiLGEpLGcubG9hZCgpfX0sYi5Bc3NldExvYWRlci5wcm90b3R5cGUub25Bc3NldExvYWRlZD1mdW5jdGlvbihhKXt0aGlzLmxvYWRDb3VudC0tLHRoaXMuZW1pdChcIm9uUHJvZ3Jlc3NcIix7Y29udGVudDp0aGlzLGxvYWRlcjphfSksdGhpcy5vblByb2dyZXNzJiZ0aGlzLm9uUHJvZ3Jlc3MoYSksdGhpcy5sb2FkQ291bnR8fCh0aGlzLmVtaXQoXCJvbkNvbXBsZXRlXCIse2NvbnRlbnQ6dGhpc30pLHRoaXMub25Db21wbGV0ZSYmdGhpcy5vbkNvbXBsZXRlKCkpfSxiLkpzb25Mb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuY3Jvc3NvcmlnaW49Yix0aGlzLmJhc2VVcmw9YS5yZXBsYWNlKC9bXlxcL10qJC8sXCJcIiksdGhpcy5sb2FkZWQ9ITF9LGIuSnNvbkxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Kc29uTG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5Kc29uTG9hZGVyLnByb3RvdHlwZSksYi5Kc29uTG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7d2luZG93LlhEb21haW5SZXF1ZXN0JiZ0aGlzLmNyb3Nzb3JpZ2luPyh0aGlzLmFqYXhSZXF1ZXN0PW5ldyB3aW5kb3cuWERvbWFpblJlcXVlc3QsdGhpcy5hamF4UmVxdWVzdC50aW1lb3V0PTNlMyx0aGlzLmFqYXhSZXF1ZXN0Lm9uZXJyb3I9dGhpcy5vbkVycm9yLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vbnRpbWVvdXQ9dGhpcy5vbkVycm9yLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vbnByb2dyZXNzPWZ1bmN0aW9uKCl7fSx0aGlzLmFqYXhSZXF1ZXN0Lm9ubG9hZD10aGlzLm9uSlNPTkxvYWRlZC5iaW5kKHRoaXMpKToodGhpcy5hamF4UmVxdWVzdD13aW5kb3cuWE1MSHR0cFJlcXVlc3Q/bmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdDpuZXcgd2luZG93LkFjdGl2ZVhPYmplY3QoXCJNaWNyb3NvZnQuWE1MSFRUUFwiKSx0aGlzLmFqYXhSZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZT10aGlzLm9uUmVhZHlTdGF0ZUNoYW5nZWQuYmluZCh0aGlzKSksdGhpcy5hamF4UmVxdWVzdC5vcGVuKFwiR0VUXCIsdGhpcy51cmwsITApLHRoaXMuYWpheFJlcXVlc3Quc2VuZCgpfSxiLkpzb25Mb2FkZXIucHJvdG90eXBlLm9uUmVhZHlTdGF0ZUNoYW5nZWQ9ZnVuY3Rpb24oKXs0IT09dGhpcy5hamF4UmVxdWVzdC5yZWFkeVN0YXRlfHwyMDAhPT10aGlzLmFqYXhSZXF1ZXN0LnN0YXR1cyYmLTEhPT13aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKFwiaHR0cFwiKXx8dGhpcy5vbkpTT05Mb2FkZWQoKX0sYi5Kc29uTG9hZGVyLnByb3RvdHlwZS5vbkpTT05Mb2FkZWQ9ZnVuY3Rpb24oKXtpZighdGhpcy5hamF4UmVxdWVzdC5yZXNwb25zZVRleHQpcmV0dXJuIHRoaXMub25FcnJvcigpLHZvaWQgMDtpZih0aGlzLmpzb249SlNPTi5wYXJzZSh0aGlzLmFqYXhSZXF1ZXN0LnJlc3BvbnNlVGV4dCksdGhpcy5qc29uLmZyYW1lcyl7dmFyIGE9dGhpcy5iYXNlVXJsK3RoaXMuanNvbi5tZXRhLmltYWdlLGQ9bmV3IGIuSW1hZ2VMb2FkZXIoYSx0aGlzLmNyb3Nzb3JpZ2luKSxlPXRoaXMuanNvbi5mcmFtZXM7dGhpcy50ZXh0dXJlPWQudGV4dHVyZS5iYXNlVGV4dHVyZSxkLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkZWRcIix0aGlzLm9uTG9hZGVkLmJpbmQodGhpcykpO2Zvcih2YXIgZiBpbiBlKXt2YXIgZz1lW2ZdLmZyYW1lO2lmKGcpe3ZhciBoPW5ldyBiLlJlY3RhbmdsZShnLngsZy55LGcudyxnLmgpLGk9aC5jbG9uZSgpLGo9bnVsbDtpZihlW2ZdLnRyaW1tZWQpe3ZhciBrPWVbZl0uc291cmNlU2l6ZSxsPWVbZl0uc3ByaXRlU291cmNlU2l6ZTtqPW5ldyBiLlJlY3RhbmdsZShsLngsbC55LGsudyxrLmgpfWIuVGV4dHVyZUNhY2hlW2ZdPW5ldyBiLlRleHR1cmUodGhpcy50ZXh0dXJlLGgsaSxqKX19ZC5sb2FkKCl9ZWxzZSBpZih0aGlzLmpzb24uYm9uZXMpaWYoYi5BbmltQ2FjaGVbdGhpcy51cmxdKXRoaXMub25Mb2FkZWQoKTtlbHNle3ZhciBtPXRoaXMudXJsLnN1YnN0cigwLHRoaXMudXJsLmxhc3RJbmRleE9mKFwiLlwiKSkrXCIuYXRsYXNcIixuPW5ldyBiLkpzb25Mb2FkZXIobSx0aGlzLmNyb3Nzb3JpZ2luKSxvPXRoaXM7bi5vbkpTT05Mb2FkZWQ9ZnVuY3Rpb24oKXtpZighdGhpcy5hamF4UmVxdWVzdC5yZXNwb25zZVRleHQpcmV0dXJuIHRoaXMub25FcnJvcigpLHZvaWQgMDt2YXIgYT1uZXcgYi5TcGluZVRleHR1cmVMb2FkZXIodGhpcy51cmwuc3Vic3RyaW5nKDAsdGhpcy51cmwubGFzdEluZGV4T2YoXCIvXCIpKSksZD1uZXcgYy5BdGxhcyh0aGlzLmFqYXhSZXF1ZXN0LnJlc3BvbnNlVGV4dCxhKSxlPW5ldyBjLkF0bGFzQXR0YWNobWVudExvYWRlcihkKSxmPW5ldyBjLlNrZWxldG9uSnNvbihlKSxnPWYucmVhZFNrZWxldG9uRGF0YShvLmpzb24pO2IuQW5pbUNhY2hlW28udXJsXT1nLG8uc3BpbmU9ZyxvLnNwaW5lQXRsYXM9ZCxvLnNwaW5lQXRsYXNMb2FkZXI9bixhLmxvYWRpbmdDb3VudD4wP2EuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRlZEJhc2VUZXh0dXJlXCIsZnVuY3Rpb24oYSl7YS5jb250ZW50LmNvbnRlbnQubG9hZGluZ0NvdW50PD0wJiZvLm9uTG9hZGVkKCl9KTpvLm9uTG9hZGVkKCl9LG4ubG9hZCgpfWVsc2UgdGhpcy5vbkxvYWRlZCgpfSxiLkpzb25Mb2FkZXIucHJvdG90eXBlLm9uTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5sb2FkZWQ9ITAsdGhpcy5kaXNwYXRjaEV2ZW50KHt0eXBlOlwibG9hZGVkXCIsY29udGVudDp0aGlzfSl9LGIuSnNvbkxvYWRlci5wcm90b3R5cGUub25FcnJvcj1mdW5jdGlvbigpe3RoaXMuZGlzcGF0Y2hFdmVudCh7dHlwZTpcImVycm9yXCIsY29udGVudDp0aGlzfSl9LGIuQXRsYXNMb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuYmFzZVVybD1hLnJlcGxhY2UoL1teXFwvXSokLyxcIlwiKSx0aGlzLmNyb3Nzb3JpZ2luPWIsdGhpcy5sb2FkZWQ9ITF9LGIuQXRsYXNMb2FkZXIuY29uc3RydWN0b3I9Yi5BdGxhc0xvYWRlcixiLkV2ZW50VGFyZ2V0Lm1peGluKGIuQXRsYXNMb2FkZXIucHJvdG90eXBlKSxiLkF0bGFzTG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy5hamF4UmVxdWVzdD1uZXcgYi5BamF4UmVxdWVzdCx0aGlzLmFqYXhSZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZT10aGlzLm9uQXRsYXNMb2FkZWQuYmluZCh0aGlzKSx0aGlzLmFqYXhSZXF1ZXN0Lm9wZW4oXCJHRVRcIix0aGlzLnVybCwhMCksdGhpcy5hamF4UmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlJiZ0aGlzLmFqYXhSZXF1ZXN0Lm92ZXJyaWRlTWltZVR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIpLHRoaXMuYWpheFJlcXVlc3Quc2VuZChudWxsKX0sYi5BdGxhc0xvYWRlci5wcm90b3R5cGUub25BdGxhc0xvYWRlZD1mdW5jdGlvbigpe2lmKDQ9PT10aGlzLmFqYXhSZXF1ZXN0LnJlYWR5U3RhdGUpaWYoMjAwPT09dGhpcy5hamF4UmVxdWVzdC5zdGF0dXN8fC0xPT09d2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZihcImh0dHBcIikpe3RoaXMuYXRsYXM9e21ldGE6e2ltYWdlOltdfSxmcmFtZXM6W119O3ZhciBhPXRoaXMuYWpheFJlcXVlc3QucmVzcG9uc2VUZXh0LnNwbGl0KC9cXHI/XFxuLyksYz0tMyxkPTAsZT1udWxsLGY9ITEsZz0wLGg9MCxpPXRoaXMub25Mb2FkZWQuYmluZCh0aGlzKTtmb3IoZz0wO2c8YS5sZW5ndGg7ZysrKWlmKGFbZ109YVtnXS5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLFwiXCIpLFwiXCI9PT1hW2ddJiYoZj1nKzEpLGFbZ10ubGVuZ3RoPjApe2lmKGY9PT1nKXRoaXMuYXRsYXMubWV0YS5pbWFnZS5wdXNoKGFbZ10pLGQ9dGhpcy5hdGxhcy5tZXRhLmltYWdlLmxlbmd0aC0xLHRoaXMuYXRsYXMuZnJhbWVzLnB1c2goe30pLGM9LTM7ZWxzZSBpZihjPjApaWYoYyU3PT09MSludWxsIT1lJiYodGhpcy5hdGxhcy5mcmFtZXNbZF1bZS5uYW1lXT1lKSxlPXtuYW1lOmFbZ10sZnJhbWU6e319O2Vsc2V7dmFyIGo9YVtnXS5zcGxpdChcIiBcIik7aWYoYyU3PT09MyllLmZyYW1lLng9TnVtYmVyKGpbMV0ucmVwbGFjZShcIixcIixcIlwiKSksZS5mcmFtZS55PU51bWJlcihqWzJdKTtlbHNlIGlmKGMlNz09PTQpZS5mcmFtZS53PU51bWJlcihqWzFdLnJlcGxhY2UoXCIsXCIsXCJcIikpLGUuZnJhbWUuaD1OdW1iZXIoalsyXSk7XG5lbHNlIGlmKGMlNz09PTUpe3ZhciBrPXt4OjAseTowLHc6TnVtYmVyKGpbMV0ucmVwbGFjZShcIixcIixcIlwiKSksaDpOdW1iZXIoalsyXSl9O2sudz5lLmZyYW1lLnd8fGsuaD5lLmZyYW1lLmg/KGUudHJpbW1lZD0hMCxlLnJlYWxTaXplPWspOmUudHJpbW1lZD0hMX19YysrfWlmKG51bGwhPWUmJih0aGlzLmF0bGFzLmZyYW1lc1tkXVtlLm5hbWVdPWUpLHRoaXMuYXRsYXMubWV0YS5pbWFnZS5sZW5ndGg+MCl7Zm9yKHRoaXMuaW1hZ2VzPVtdLGg9MDtoPHRoaXMuYXRsYXMubWV0YS5pbWFnZS5sZW5ndGg7aCsrKXt2YXIgbD10aGlzLmJhc2VVcmwrdGhpcy5hdGxhcy5tZXRhLmltYWdlW2hdLG09dGhpcy5hdGxhcy5mcmFtZXNbaF07dGhpcy5pbWFnZXMucHVzaChuZXcgYi5JbWFnZUxvYWRlcihsLHRoaXMuY3Jvc3NvcmlnaW4pKTtmb3IoZyBpbiBtKXt2YXIgbj1tW2ddLmZyYW1lO24mJihiLlRleHR1cmVDYWNoZVtnXT1uZXcgYi5UZXh0dXJlKHRoaXMuaW1hZ2VzW2hdLnRleHR1cmUuYmFzZVRleHR1cmUse3g6bi54LHk6bi55LHdpZHRoOm4udyxoZWlnaHQ6bi5ofSksbVtnXS50cmltbWVkJiYoYi5UZXh0dXJlQ2FjaGVbZ10ucmVhbFNpemU9bVtnXS5yZWFsU2l6ZSxiLlRleHR1cmVDYWNoZVtnXS50cmltLng9MCxiLlRleHR1cmVDYWNoZVtnXS50cmltLnk9MCkpfX1mb3IodGhpcy5jdXJyZW50SW1hZ2VJZD0wLGg9MDtoPHRoaXMuaW1hZ2VzLmxlbmd0aDtoKyspdGhpcy5pbWFnZXNbaF0ub24oXCJsb2FkZWRcIixpKTt0aGlzLmltYWdlc1t0aGlzLmN1cnJlbnRJbWFnZUlkXS5sb2FkKCl9ZWxzZSB0aGlzLm9uTG9hZGVkKCl9ZWxzZSB0aGlzLm9uRXJyb3IoKX0sYi5BdGxhc0xvYWRlci5wcm90b3R5cGUub25Mb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLmltYWdlcy5sZW5ndGgtMT50aGlzLmN1cnJlbnRJbWFnZUlkPyh0aGlzLmN1cnJlbnRJbWFnZUlkKyssdGhpcy5pbWFnZXNbdGhpcy5jdXJyZW50SW1hZ2VJZF0ubG9hZCgpKToodGhpcy5sb2FkZWQ9ITAsdGhpcy5lbWl0KFwibG9hZGVkXCIse2NvbnRlbnQ6dGhpc30pKX0sYi5BdGxhc0xvYWRlci5wcm90b3R5cGUub25FcnJvcj1mdW5jdGlvbigpe3RoaXMuZW1pdChcImVycm9yXCIse2NvbnRlbnQ6dGhpc30pfSxiLlNwcml0ZVNoZWV0TG9hZGVyPWZ1bmN0aW9uKGEsYil7dGhpcy51cmw9YSx0aGlzLmNyb3Nzb3JpZ2luPWIsdGhpcy5iYXNlVXJsPWEucmVwbGFjZSgvW15cXC9dKiQvLFwiXCIpLHRoaXMudGV4dHVyZT1udWxsLHRoaXMuZnJhbWVzPXt9fSxiLlNwcml0ZVNoZWV0TG9hZGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlNwcml0ZVNoZWV0TG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5TcHJpdGVTaGVldExvYWRlci5wcm90b3R5cGUpLGIuU3ByaXRlU2hlZXRMb2FkZXIucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLGM9bmV3IGIuSnNvbkxvYWRlcih0aGlzLnVybCx0aGlzLmNyb3Nzb3JpZ2luKTtjLm9uKFwibG9hZGVkXCIsZnVuY3Rpb24oYil7YS5qc29uPWIuZGF0YS5jb250ZW50Lmpzb24sYS5vbkxvYWRlZCgpfSksYy5sb2FkKCl9LGIuU3ByaXRlU2hlZXRMb2FkZXIucHJvdG90eXBlLm9uTG9hZGVkPWZ1bmN0aW9uKCl7dGhpcy5lbWl0KFwibG9hZGVkXCIse2NvbnRlbnQ6dGhpc30pfSxiLkltYWdlTG9hZGVyPWZ1bmN0aW9uKGEsYyl7dGhpcy50ZXh0dXJlPWIuVGV4dHVyZS5mcm9tSW1hZ2UoYSxjKSx0aGlzLmZyYW1lcz1bXX0sYi5JbWFnZUxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5JbWFnZUxvYWRlcixiLkV2ZW50VGFyZ2V0Lm1peGluKGIuSW1hZ2VMb2FkZXIucHJvdG90eXBlKSxiLkltYWdlTG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLmhhc0xvYWRlZD90aGlzLm9uTG9hZGVkKCk6dGhpcy50ZXh0dXJlLmJhc2VUZXh0dXJlLm9uKFwibG9hZGVkXCIsdGhpcy5vbkxvYWRlZC5iaW5kKHRoaXMpKX0sYi5JbWFnZUxvYWRlci5wcm90b3R5cGUub25Mb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLmVtaXQoXCJsb2FkZWRcIix7Y29udGVudDp0aGlzfSl9LGIuSW1hZ2VMb2FkZXIucHJvdG90eXBlLmxvYWRGcmFtZWRTcHJpdGVTaGVldD1mdW5jdGlvbihhLGMsZCl7dGhpcy5mcmFtZXM9W107Zm9yKHZhciBlPU1hdGguZmxvb3IodGhpcy50ZXh0dXJlLndpZHRoL2EpLGY9TWF0aC5mbG9vcih0aGlzLnRleHR1cmUuaGVpZ2h0L2MpLGc9MCxoPTA7Zj5oO2grKylmb3IodmFyIGk9MDtlPmk7aSsrLGcrKyl7dmFyIGo9bmV3IGIuVGV4dHVyZSh0aGlzLnRleHR1cmUuYmFzZVRleHR1cmUse3g6aSphLHk6aCpjLHdpZHRoOmEsaGVpZ2h0OmN9KTt0aGlzLmZyYW1lcy5wdXNoKGopLGQmJihiLlRleHR1cmVDYWNoZVtkK1wiLVwiK2ddPWopfXRoaXMubG9hZCgpfSxiLkJpdG1hcEZvbnRMb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuY3Jvc3NvcmlnaW49Yix0aGlzLmJhc2VVcmw9YS5yZXBsYWNlKC9bXlxcL10qJC8sXCJcIiksdGhpcy50ZXh0dXJlPW51bGx9LGIuQml0bWFwRm9udExvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5CaXRtYXBGb250TG9hZGVyLGIuRXZlbnRUYXJnZXQubWl4aW4oYi5CaXRtYXBGb250TG9hZGVyLnByb3RvdHlwZSksYi5CaXRtYXBGb250TG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dGhpcy5hamF4UmVxdWVzdD1uZXcgYi5BamF4UmVxdWVzdCx0aGlzLmFqYXhSZXF1ZXN0Lm9ucmVhZHlzdGF0ZWNoYW5nZT10aGlzLm9uWE1MTG9hZGVkLmJpbmQodGhpcyksdGhpcy5hamF4UmVxdWVzdC5vcGVuKFwiR0VUXCIsdGhpcy51cmwsITApLHRoaXMuYWpheFJlcXVlc3Qub3ZlcnJpZGVNaW1lVHlwZSYmdGhpcy5hamF4UmVxdWVzdC5vdmVycmlkZU1pbWVUeXBlKFwiYXBwbGljYXRpb24veG1sXCIpLHRoaXMuYWpheFJlcXVlc3Quc2VuZChudWxsKX0sYi5CaXRtYXBGb250TG9hZGVyLnByb3RvdHlwZS5vblhNTExvYWRlZD1mdW5jdGlvbigpe2lmKDQ9PT10aGlzLmFqYXhSZXF1ZXN0LnJlYWR5U3RhdGUmJigyMDA9PT10aGlzLmFqYXhSZXF1ZXN0LnN0YXR1c3x8LTE9PT13aW5kb3cubG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZihcImh0dHBcIikpKXt2YXIgYT10aGlzLmFqYXhSZXF1ZXN0LnJlc3BvbnNlWE1MO2lmKCFhfHwvTVNJRSA5L2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KXx8bmF2aWdhdG9yLmlzQ29jb29uSlMpaWYoXCJmdW5jdGlvblwiPT10eXBlb2Ygd2luZG93LkRPTVBhcnNlcil7dmFyIGM9bmV3IERPTVBhcnNlcjthPWMucGFyc2VGcm9tU3RyaW5nKHRoaXMuYWpheFJlcXVlc3QucmVzcG9uc2VUZXh0LFwidGV4dC94bWxcIil9ZWxzZXt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2QuaW5uZXJIVE1MPXRoaXMuYWpheFJlcXVlc3QucmVzcG9uc2VUZXh0LGE9ZH12YXIgZT10aGlzLmJhc2VVcmwrYS5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhZ2VcIilbMF0uZ2V0QXR0cmlidXRlKFwiZmlsZVwiKSxmPW5ldyBiLkltYWdlTG9hZGVyKGUsdGhpcy5jcm9zc29yaWdpbik7dGhpcy50ZXh0dXJlPWYudGV4dHVyZS5iYXNlVGV4dHVyZTt2YXIgZz17fSxoPWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJpbmZvXCIpWzBdLGk9YS5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNvbW1vblwiKVswXTtnLmZvbnQ9aC5nZXRBdHRyaWJ1dGUoXCJmYWNlXCIpLGcuc2l6ZT1wYXJzZUludChoLmdldEF0dHJpYnV0ZShcInNpemVcIiksMTApLGcubGluZUhlaWdodD1wYXJzZUludChpLmdldEF0dHJpYnV0ZShcImxpbmVIZWlnaHRcIiksMTApLGcuY2hhcnM9e307Zm9yKHZhciBqPWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjaGFyXCIpLGs9MDtrPGoubGVuZ3RoO2srKyl7dmFyIGw9cGFyc2VJbnQoaltrXS5nZXRBdHRyaWJ1dGUoXCJpZFwiKSwxMCksbT1uZXcgYi5SZWN0YW5nbGUocGFyc2VJbnQoaltrXS5nZXRBdHRyaWJ1dGUoXCJ4XCIpLDEwKSxwYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcInlcIiksMTApLHBhcnNlSW50KGpba10uZ2V0QXR0cmlidXRlKFwid2lkdGhcIiksMTApLHBhcnNlSW50KGpba10uZ2V0QXR0cmlidXRlKFwiaGVpZ2h0XCIpLDEwKSk7Zy5jaGFyc1tsXT17eE9mZnNldDpwYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcInhvZmZzZXRcIiksMTApLHlPZmZzZXQ6cGFyc2VJbnQoaltrXS5nZXRBdHRyaWJ1dGUoXCJ5b2Zmc2V0XCIpLDEwKSx4QWR2YW5jZTpwYXJzZUludChqW2tdLmdldEF0dHJpYnV0ZShcInhhZHZhbmNlXCIpLDEwKSxrZXJuaW5nOnt9LHRleHR1cmU6Yi5UZXh0dXJlQ2FjaGVbbF09bmV3IGIuVGV4dHVyZSh0aGlzLnRleHR1cmUsbSl9fXZhciBuPWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJrZXJuaW5nXCIpO2ZvcihrPTA7azxuLmxlbmd0aDtrKyspe3ZhciBvPXBhcnNlSW50KG5ba10uZ2V0QXR0cmlidXRlKFwiZmlyc3RcIiksMTApLHA9cGFyc2VJbnQobltrXS5nZXRBdHRyaWJ1dGUoXCJzZWNvbmRcIiksMTApLHE9cGFyc2VJbnQobltrXS5nZXRBdHRyaWJ1dGUoXCJhbW91bnRcIiksMTApO2cuY2hhcnNbcF0ua2VybmluZ1tvXT1xfWIuQml0bWFwVGV4dC5mb250c1tnLmZvbnRdPWcsZi5hZGRFdmVudExpc3RlbmVyKFwibG9hZGVkXCIsdGhpcy5vbkxvYWRlZC5iaW5kKHRoaXMpKSxmLmxvYWQoKX19LGIuQml0bWFwRm9udExvYWRlci5wcm90b3R5cGUub25Mb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLmVtaXQoXCJsb2FkZWRcIix7Y29udGVudDp0aGlzfSl9LGIuU3BpbmVMb2FkZXI9ZnVuY3Rpb24oYSxiKXt0aGlzLnVybD1hLHRoaXMuY3Jvc3NvcmlnaW49Yix0aGlzLmxvYWRlZD0hMX0sYi5TcGluZUxvYWRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5TcGluZUxvYWRlcixiLkV2ZW50VGFyZ2V0Lm1peGluKGIuU3BpbmVMb2FkZXIucHJvdG90eXBlKSxiLlNwaW5lTG9hZGVyLnByb3RvdHlwZS5sb2FkPWZ1bmN0aW9uKCl7dmFyIGE9dGhpcyxjPW5ldyBiLkpzb25Mb2FkZXIodGhpcy51cmwsdGhpcy5jcm9zc29yaWdpbik7Yy5vbihcImxvYWRlZFwiLGZ1bmN0aW9uKGIpe2EuanNvbj1iLmRhdGEuY29udGVudC5qc29uLGEub25Mb2FkZWQoKX0pLGMubG9hZCgpfSxiLlNwaW5lTG9hZGVyLnByb3RvdHlwZS5vbkxvYWRlZD1mdW5jdGlvbigpe3RoaXMubG9hZGVkPSEwLHRoaXMuZW1pdChcImxvYWRlZFwiLHtjb250ZW50OnRoaXN9KX0sYi5BYnN0cmFjdEZpbHRlcj1mdW5jdGlvbihhLGIpe3RoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnNoYWRlcnM9W10sdGhpcy5kaXJ0eT0hMCx0aGlzLnBhZGRpbmc9MCx0aGlzLnVuaWZvcm1zPWJ8fHt9LHRoaXMuZnJhZ21lbnRTcmM9YXx8W119LGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQWJzdHJhY3RGaWx0ZXIsYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUuc3luY1VuaWZvcm1zPWZ1bmN0aW9uKCl7Zm9yKHZhciBhPTAsYj10aGlzLnNoYWRlcnMubGVuZ3RoO2I+YTthKyspdGhpcy5zaGFkZXJzW2FdLmRpcnR5PSEwfSxiLkFscGhhTWFza0ZpbHRlcj1mdW5jdGlvbihhKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLGEuYmFzZVRleHR1cmUuX3Bvd2VyT2YyPSEwLHRoaXMudW5pZm9ybXM9e21hc2s6e3R5cGU6XCJzYW1wbGVyMkRcIix2YWx1ZTphfSxtYXBEaW1lbnNpb25zOnt0eXBlOlwiMmZcIix2YWx1ZTp7eDoxLHk6NTExMn19LGRpbWVuc2lvbnM6e3R5cGU6XCI0ZnZcIix2YWx1ZTpbMCwwLDAsMF19fSxhLmJhc2VUZXh0dXJlLmhhc0xvYWRlZD8odGhpcy51bmlmb3Jtcy5tYXNrLnZhbHVlLng9YS53aWR0aCx0aGlzLnVuaWZvcm1zLm1hc2sudmFsdWUueT1hLmhlaWdodCk6KHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbj10aGlzLm9uVGV4dHVyZUxvYWRlZC5iaW5kKHRoaXMpLGEuYmFzZVRleHR1cmUub24oXCJsb2FkZWRcIix0aGlzLmJvdW5kTG9hZGVkRnVuY3Rpb24pKSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgbWFzaztcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidW5pZm9ybSB2ZWMyIG9mZnNldDtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSB2ZWMyIG1hcERpbWVuc2lvbnM7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjMiBtYXBDb3JkcyA9IHZUZXh0dXJlQ29vcmQueHk7XCIsXCIgICBtYXBDb3JkcyArPSAoZGltZW5zaW9ucy56dyArIG9mZnNldCkvIGRpbWVuc2lvbnMueHkgO1wiLFwiICAgbWFwQ29yZHMueSAqPSAtMS4wO1wiLFwiICAgbWFwQ29yZHMueSArPSAxLjA7XCIsXCIgICBtYXBDb3JkcyAqPSBkaW1lbnNpb25zLnh5IC8gbWFwRGltZW5zaW9ucztcIixcIiAgIHZlYzQgb3JpZ2luYWwgPSAgdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKTtcIixcIiAgIGZsb2F0IG1hc2tBbHBoYSA9ICB0ZXh0dXJlMkQobWFzaywgbWFwQ29yZHMpLnI7XCIsXCIgICBvcmlnaW5hbCAqPSBtYXNrQWxwaGE7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSAgb3JpZ2luYWw7XCIsXCJ9XCJdfSxiLkFscGhhTWFza0ZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5BbHBoYU1hc2tGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQWxwaGFNYXNrRmlsdGVyLGIuQWxwaGFNYXNrRmlsdGVyLnByb3RvdHlwZS5vblRleHR1cmVMb2FkZWQ9ZnVuY3Rpb24oKXt0aGlzLnVuaWZvcm1zLm1hcERpbWVuc2lvbnMudmFsdWUueD10aGlzLnVuaWZvcm1zLm1hc2sudmFsdWUud2lkdGgsdGhpcy51bmlmb3Jtcy5tYXBEaW1lbnNpb25zLnZhbHVlLnk9dGhpcy51bmlmb3Jtcy5tYXNrLnZhbHVlLmhlaWdodCx0aGlzLnVuaWZvcm1zLm1hc2sudmFsdWUuYmFzZVRleHR1cmUub2ZmKFwibG9hZGVkXCIsdGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uKX0sT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuQWxwaGFNYXNrRmlsdGVyLnByb3RvdHlwZSxcIm1hcFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5tYXNrLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5tYXNrLnZhbHVlPWF9fSksYi5Db2xvck1hdHJpeEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17bWF0cml4Ont0eXBlOlwibWF0NFwiLHZhbHVlOlsxLDAsMCwwLDAsMSwwLDAsMCwwLDEsMCwwLDAsMCwxXX19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIGZsb2F0IGludmVydDtcIixcInVuaWZvcm0gbWF0NCBtYXRyaXg7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpICogbWF0cml4O1wiLFwifVwiXX0sYi5Db2xvck1hdHJpeEZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5Db2xvck1hdHJpeEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Db2xvck1hdHJpeEZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Db2xvck1hdHJpeEZpbHRlci5wcm90b3R5cGUsXCJtYXRyaXhcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMubWF0cml4LnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5tYXRyaXgudmFsdWU9YX19KSxiLkdyYXlGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e2dyYXk6e3R5cGU6XCIxZlwiLHZhbHVlOjF9fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ1bmlmb3JtIGZsb2F0IGdyYXk7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKTtcIixcIiAgIGdsX0ZyYWdDb2xvci5yZ2IgPSBtaXgoZ2xfRnJhZ0NvbG9yLnJnYiwgdmVjMygwLjIxMjYqZ2xfRnJhZ0NvbG9yLnIgKyAwLjcxNTIqZ2xfRnJhZ0NvbG9yLmcgKyAwLjA3MjIqZ2xfRnJhZ0NvbG9yLmIpLCBncmF5KTtcIixcIn1cIl19LGIuR3JheUZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5HcmF5RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkdyYXlGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuR3JheUZpbHRlci5wcm90b3R5cGUsXCJncmF5XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmdyYXkudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLmdyYXkudmFsdWU9YX19KSxiLkRpc3BsYWNlbWVudEZpbHRlcj1mdW5jdGlvbihhKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLGEuYmFzZVRleHR1cmUuX3Bvd2VyT2YyPSEwLHRoaXMudW5pZm9ybXM9e2Rpc3BsYWNlbWVudE1hcDp7dHlwZTpcInNhbXBsZXIyRFwiLHZhbHVlOmF9LHNjYWxlOnt0eXBlOlwiMmZcIix2YWx1ZTp7eDozMCx5OjMwfX0sb2Zmc2V0Ont0eXBlOlwiMmZcIix2YWx1ZTp7eDowLHk6MH19LG1hcERpbWVuc2lvbnM6e3R5cGU6XCIyZlwiLHZhbHVlOnt4OjEseTo1MTEyfX0sZGltZW5zaW9uczp7dHlwZTpcIjRmdlwiLHZhbHVlOlswLDAsMCwwXX19LGEuYmFzZVRleHR1cmUuaGFzTG9hZGVkPyh0aGlzLnVuaWZvcm1zLm1hcERpbWVuc2lvbnMudmFsdWUueD1hLndpZHRoLHRoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS55PWEuaGVpZ2h0KToodGhpcy5ib3VuZExvYWRlZEZ1bmN0aW9uPXRoaXMub25UZXh0dXJlTG9hZGVkLmJpbmQodGhpcyksYS5iYXNlVGV4dHVyZS5vbihcImxvYWRlZFwiLHRoaXMuYm91bmRMb2FkZWRGdW5jdGlvbikpLHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCBkaXNwbGFjZW1lbnRNYXA7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInVuaWZvcm0gdmVjMiBzY2FsZTtcIixcInVuaWZvcm0gdmVjMiBvZmZzZXQ7XCIsXCJ1bmlmb3JtIHZlYzQgZGltZW5zaW9ucztcIixcInVuaWZvcm0gdmVjMiBtYXBEaW1lbnNpb25zO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzIgbWFwQ29yZHMgPSB2VGV4dHVyZUNvb3JkLnh5O1wiLFwiICAgbWFwQ29yZHMgKz0gKGRpbWVuc2lvbnMuencgKyBvZmZzZXQpLyBkaW1lbnNpb25zLnh5IDtcIixcIiAgIG1hcENvcmRzLnkgKj0gLTEuMDtcIixcIiAgIG1hcENvcmRzLnkgKz0gMS4wO1wiLFwiICAgdmVjMiBtYXRTYW1wbGUgPSB0ZXh0dXJlMkQoZGlzcGxhY2VtZW50TWFwLCBtYXBDb3JkcykueHk7XCIsXCIgICBtYXRTYW1wbGUgLT0gMC41O1wiLFwiICAgbWF0U2FtcGxlICo9IHNjYWxlO1wiLFwiICAgbWF0U2FtcGxlIC89IG1hcERpbWVuc2lvbnM7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54ICsgbWF0U2FtcGxlLngsIHZUZXh0dXJlQ29vcmQueSArIG1hdFNhbXBsZS55KSk7XCIsXCIgICBnbF9GcmFnQ29sb3IucmdiID0gbWl4KCBnbF9GcmFnQ29sb3IucmdiLCBnbF9GcmFnQ29sb3IucmdiLCAxLjApO1wiLFwiICAgdmVjMiBjb3JkID0gdlRleHR1cmVDb29yZDtcIixcIn1cIl19LGIuRGlzcGxhY2VtZW50RmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkRpc3BsYWNlbWVudEZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5EaXNwbGFjZW1lbnRGaWx0ZXIsYi5EaXNwbGFjZW1lbnRGaWx0ZXIucHJvdG90eXBlLm9uVGV4dHVyZUxvYWRlZD1mdW5jdGlvbigpe3RoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS54PXRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLndpZHRoLHRoaXMudW5pZm9ybXMubWFwRGltZW5zaW9ucy52YWx1ZS55PXRoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlLmhlaWdodCx0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZS5iYXNlVGV4dHVyZS5vZmYoXCJsb2FkZWRcIix0aGlzLmJvdW5kTG9hZGVkRnVuY3Rpb24pfSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5EaXNwbGFjZW1lbnRGaWx0ZXIucHJvdG90eXBlLFwibWFwXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmRpc3BsYWNlbWVudE1hcC52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMuZGlzcGxhY2VtZW50TWFwLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRGlzcGxhY2VtZW50RmlsdGVyLnByb3RvdHlwZSxcInNjYWxlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLnNjYWxlLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5zY2FsZS52YWx1ZT1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkRpc3BsYWNlbWVudEZpbHRlci5wcm90b3R5cGUsXCJvZmZzZXRcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMub2Zmc2V0LnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5vZmZzZXQudmFsdWU9YX19KSxiLlBpeGVsYXRlRmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtpbnZlcnQ6e3R5cGU6XCIxZlwiLHZhbHVlOjB9LGRpbWVuc2lvbnM6e3R5cGU6XCI0ZnZcIix2YWx1ZTpuZXcgYi5GbG9hdDMyQXJyYXkoWzFlNCwxMDAsMTAsMTBdKX0scGl4ZWxTaXplOnt0eXBlOlwiMmZcIix2YWx1ZTp7eDoxMCx5OjEwfX19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIHZlYzIgdGVzdERpbTtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSB2ZWMyIHBpeGVsU2l6ZTtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzIgY29vcmQgPSB2VGV4dHVyZUNvb3JkO1wiLFwiICAgdmVjMiBzaXplID0gZGltZW5zaW9ucy54eS9waXhlbFNpemU7XCIsXCIgICB2ZWMyIGNvbG9yID0gZmxvb3IoICggdlRleHR1cmVDb29yZCAqIHNpemUgKSApIC8gc2l6ZSArIHBpeGVsU2l6ZS9kaW1lbnNpb25zLnh5ICogMC41O1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCBjb2xvcik7XCIsXCJ9XCJdfSxiLlBpeGVsYXRlRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLlBpeGVsYXRlRmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlBpeGVsYXRlRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlBpeGVsYXRlRmlsdGVyLnByb3RvdHlwZSxcInNpemVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMucGl4ZWxTaXplLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLnBpeGVsU2l6ZS52YWx1ZT1hfX0pLGIuQmx1clhGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e2JsdXI6e3R5cGU6XCIxZlwiLHZhbHVlOjEvNTEyfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgYmx1cjtcIixcInVuaWZvcm0gc2FtcGxlcjJEIHVTYW1wbGVyO1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzQgc3VtID0gdmVjNCgwLjApO1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggLSA0LjAqYmx1ciwgdlRleHR1cmVDb29yZC55KSkgKiAwLjA1O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggLSAzLjAqYmx1ciwgdlRleHR1cmVDb29yZC55KSkgKiAwLjA5O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggLSAyLjAqYmx1ciwgdlRleHR1cmVDb29yZC55KSkgKiAwLjEyO1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggLSBibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMTU7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCwgdlRleHR1cmVDb29yZC55KSkgKiAwLjE2O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLnggKyBibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMTU7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCArIDIuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMTI7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCArIDMuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMDk7XCIsXCIgICBzdW0gKz0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2ZWMyKHZUZXh0dXJlQ29vcmQueCArIDQuMCpibHVyLCB2VGV4dHVyZUNvb3JkLnkpKSAqIDAuMDU7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSBzdW07XCIsXCJ9XCJdfSxiLkJsdXJYRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkJsdXJYRmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLkJsdXJYRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkJsdXJYRmlsdGVyLnByb3RvdHlwZSxcImJsdXJcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYmx1ci52YWx1ZS8oMS83ZTMpfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLmJsdXIudmFsdWU9MS83ZTMqYX19KSxiLkJsdXJZRmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtibHVyOnt0eXBlOlwiMWZcIix2YWx1ZToxLzUxMn19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIGZsb2F0IGJsdXI7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICB2ZWM0IHN1bSA9IHZlYzQoMC4wKTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkgLSA0LjAqYmx1cikpICogMC4wNTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkgLSAzLjAqYmx1cikpICogMC4wOTtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkgLSAyLjAqYmx1cikpICogMC4xMjtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkgLSBibHVyKSkgKiAwLjE1O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSkpICogMC4xNjtcIixcIiAgIHN1bSArPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZlYzIodlRleHR1cmVDb29yZC54LCB2VGV4dHVyZUNvb3JkLnkgKyBibHVyKSkgKiAwLjE1O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSArIDIuMCpibHVyKSkgKiAwLjEyO1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSArIDMuMCpibHVyKSkgKiAwLjA5O1wiLFwiICAgc3VtICs9IHRleHR1cmUyRCh1U2FtcGxlciwgdmVjMih2VGV4dHVyZUNvb3JkLngsIHZUZXh0dXJlQ29vcmQueSArIDQuMCpibHVyKSkgKiAwLjA1O1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gc3VtO1wiLFwifVwiXX0sYi5CbHVyWUZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5CbHVyWUZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5CbHVyWUZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5CbHVyWUZpbHRlci5wcm90b3R5cGUsXCJibHVyXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmJsdXIudmFsdWUvKDEvN2UzKX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMuYmx1ci52YWx1ZT0xLzdlMyphfX0pLGIuQmx1ckZpbHRlcj1mdW5jdGlvbigpe3RoaXMuYmx1clhGaWx0ZXI9bmV3IGIuQmx1clhGaWx0ZXIsdGhpcy5ibHVyWUZpbHRlcj1uZXcgYi5CbHVyWUZpbHRlcix0aGlzLnBhc3Nlcz1bdGhpcy5ibHVyWEZpbHRlcix0aGlzLmJsdXJZRmlsdGVyXX0sYi5CbHVyRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkJsdXJGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQmx1ckZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5CbHVyRmlsdGVyLnByb3RvdHlwZSxcImJsdXJcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYmx1clhGaWx0ZXIuYmx1cn0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuYmx1clhGaWx0ZXIuYmx1cj10aGlzLmJsdXJZRmlsdGVyLmJsdXI9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5CbHVyRmlsdGVyLnByb3RvdHlwZSxcImJsdXJYXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmJsdXJYRmlsdGVyLmJsdXJ9LHNldDpmdW5jdGlvbihhKXt0aGlzLmJsdXJYRmlsdGVyLmJsdXI9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5CbHVyRmlsdGVyLnByb3RvdHlwZSxcImJsdXJZXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmJsdXJZRmlsdGVyLmJsdXJ9LHNldDpmdW5jdGlvbihhKXt0aGlzLmJsdXJZRmlsdGVyLmJsdXI9YX19KSxiLkludmVydEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17aW52ZXJ0Ont0eXBlOlwiMWZcIix2YWx1ZToxfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gZmxvYXQgaW52ZXJ0O1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkKTtcIixcIiAgIGdsX0ZyYWdDb2xvci5yZ2IgPSBtaXgoICh2ZWMzKDEpLWdsX0ZyYWdDb2xvci5yZ2IpICogZ2xfRnJhZ0NvbG9yLmEsIGdsX0ZyYWdDb2xvci5yZ2IsIDEuMCAtIGludmVydCk7XCIsXCJ9XCJdfSxiLkludmVydEZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5JbnZlcnRGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuSW52ZXJ0RmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkludmVydEZpbHRlci5wcm90b3R5cGUsXCJpbnZlcnRcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuaW52ZXJ0LnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5pbnZlcnQudmFsdWU9YX19KSxiLlNlcGlhRmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtzZXBpYTp7dHlwZTpcIjFmXCIsdmFsdWU6MX19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIGZsb2F0IHNlcGlhO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJjb25zdCBtYXQzIHNlcGlhTWF0cml4ID0gbWF0MygwLjM1ODgsIDAuNzA0NCwgMC4xMzY4LCAwLjI5OTAsIDAuNTg3MCwgMC4xMTQwLCAwLjIzOTIsIDAuNDY5NiwgMC4wOTEyKTtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLnJnYiA9IG1peCggZ2xfRnJhZ0NvbG9yLnJnYiwgZ2xfRnJhZ0NvbG9yLnJnYiAqIHNlcGlhTWF0cml4LCBzZXBpYSk7XCIsXCJ9XCJdfSxiLlNlcGlhRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLlNlcGlhRmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlNlcGlhRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlNlcGlhRmlsdGVyLnByb3RvdHlwZSxcInNlcGlhXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLnNlcGlhLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5zZXBpYS52YWx1ZT1hfX0pLGIuVHdpc3RGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e3JhZGl1czp7dHlwZTpcIjFmXCIsdmFsdWU6LjV9LGFuZ2xlOnt0eXBlOlwiMWZcIix2YWx1ZTo1fSxvZmZzZXQ6e3R5cGU6XCIyZlwiLHZhbHVlOnt4Oi41LHk6LjV9fX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ1bmlmb3JtIGZsb2F0IHJhZGl1cztcIixcInVuaWZvcm0gZmxvYXQgYW5nbGU7XCIsXCJ1bmlmb3JtIHZlYzIgb2Zmc2V0O1wiLFwidm9pZCBtYWluKHZvaWQpIHtcIixcIiAgIHZlYzIgY29vcmQgPSB2VGV4dHVyZUNvb3JkIC0gb2Zmc2V0O1wiLFwiICAgZmxvYXQgZGlzdGFuY2UgPSBsZW5ndGgoY29vcmQpO1wiLFwiICAgaWYgKGRpc3RhbmNlIDwgcmFkaXVzKSB7XCIsXCIgICAgICAgZmxvYXQgcmF0aW8gPSAocmFkaXVzIC0gZGlzdGFuY2UpIC8gcmFkaXVzO1wiLFwiICAgICAgIGZsb2F0IGFuZ2xlTW9kID0gcmF0aW8gKiByYXRpbyAqIGFuZ2xlO1wiLFwiICAgICAgIGZsb2F0IHMgPSBzaW4oYW5nbGVNb2QpO1wiLFwiICAgICAgIGZsb2F0IGMgPSBjb3MoYW5nbGVNb2QpO1wiLFwiICAgICAgIGNvb3JkID0gdmVjMihjb29yZC54ICogYyAtIGNvb3JkLnkgKiBzLCBjb29yZC54ICogcyArIGNvb3JkLnkgKiBjKTtcIixcIiAgIH1cIixcIiAgIGdsX0ZyYWdDb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgY29vcmQrb2Zmc2V0KTtcIixcIn1cIl19LGIuVHdpc3RGaWx0ZXIucHJvdG90eXBlPU9iamVjdC5jcmVhdGUoYi5BYnN0cmFjdEZpbHRlci5wcm90b3R5cGUpLGIuVHdpc3RGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuVHdpc3RGaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuVHdpc3RGaWx0ZXIucHJvdG90eXBlLFwib2Zmc2V0XCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLm9mZnNldC52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMuZGlydHk9ITAsdGhpcy51bmlmb3Jtcy5vZmZzZXQudmFsdWU9YX19KSxPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Ud2lzdEZpbHRlci5wcm90b3R5cGUsXCJyYWRpdXNcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMucmFkaXVzLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLnJhZGl1cy52YWx1ZT1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlR3aXN0RmlsdGVyLnByb3RvdHlwZSxcImFuZ2xlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmFuZ2xlLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLmFuZ2xlLnZhbHVlPWF9fSksYi5Db2xvclN0ZXBGaWx0ZXI9ZnVuY3Rpb24oKXtiLkFic3RyYWN0RmlsdGVyLmNhbGwodGhpcyksdGhpcy5wYXNzZXM9W3RoaXNdLHRoaXMudW5pZm9ybXM9e3N0ZXA6e3R5cGU6XCIxZlwiLHZhbHVlOjV9fSx0aGlzLmZyYWdtZW50U3JjPVtcInByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1wiLFwidmFyeWluZyB2ZWMyIHZUZXh0dXJlQ29vcmQ7XCIsXCJ2YXJ5aW5nIHZlYzQgdkNvbG9yO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ1bmlmb3JtIGZsb2F0IHN0ZXA7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgdmVjNCBjb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCk7XCIsXCIgICBjb2xvciA9IGZsb29yKGNvbG9yICogc3RlcCkgLyBzdGVwO1wiLFwiICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XCIsXCJ9XCJdfSxiLkNvbG9yU3RlcEZpbHRlci5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShiLkFic3RyYWN0RmlsdGVyLnByb3RvdHlwZSksYi5Db2xvclN0ZXBGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQ29sb3JTdGVwRmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLkNvbG9yU3RlcEZpbHRlci5wcm90b3R5cGUsXCJzdGVwXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLnN0ZXAudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLnN0ZXAudmFsdWU9YX19KSxiLkRvdFNjcmVlbkZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17c2NhbGU6e3R5cGU6XCIxZlwiLHZhbHVlOjF9LGFuZ2xlOnt0eXBlOlwiMWZcIix2YWx1ZTo1fSxkaW1lbnNpb25zOnt0eXBlOlwiNGZ2XCIsdmFsdWU6WzAsMCwwLDBdfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ1bmlmb3JtIGZsb2F0IGFuZ2xlO1wiLFwidW5pZm9ybSBmbG9hdCBzY2FsZTtcIixcImZsb2F0IHBhdHRlcm4oKSB7XCIsXCIgICBmbG9hdCBzID0gc2luKGFuZ2xlKSwgYyA9IGNvcyhhbmdsZSk7XCIsXCIgICB2ZWMyIHRleCA9IHZUZXh0dXJlQ29vcmQgKiBkaW1lbnNpb25zLnh5O1wiLFwiICAgdmVjMiBwb2ludCA9IHZlYzIoXCIsXCIgICAgICAgYyAqIHRleC54IC0gcyAqIHRleC55LFwiLFwiICAgICAgIHMgKiB0ZXgueCArIGMgKiB0ZXgueVwiLFwiICAgKSAqIHNjYWxlO1wiLFwiICAgcmV0dXJuIChzaW4ocG9pbnQueCkgKiBzaW4ocG9pbnQueSkpICogNC4wO1wiLFwifVwiLFwidm9pZCBtYWluKCkge1wiLFwiICAgdmVjNCBjb2xvciA9IHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZCk7XCIsXCIgICBmbG9hdCBhdmVyYWdlID0gKGNvbG9yLnIgKyBjb2xvci5nICsgY29sb3IuYikgLyAzLjA7XCIsXCIgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KHZlYzMoYXZlcmFnZSAqIDEwLjAgLSA1LjAgKyBwYXR0ZXJuKCkpLCBjb2xvci5hKTtcIixcIn1cIl19LGIuRG90U2NyZWVuRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkRvdFNjcmVlbkZpbHRlci5wcm90b3R5cGUuY29uc3RydWN0b3I9Yi5Eb3RTY3JlZW5GaWx0ZXIsT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRG90U2NyZWVuRmlsdGVyLnByb3RvdHlwZSxcInNjYWxlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLnNjYWxlLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLnNjYWxlLnZhbHVlPWF9fSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGIuRG90U2NyZWVuRmlsdGVyLnByb3RvdHlwZSxcImFuZ2xlXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmFuZ2xlLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy5kaXJ0eT0hMCx0aGlzLnVuaWZvcm1zLmFuZ2xlLnZhbHVlPWF9fSksYi5Dcm9zc0hhdGNoRmlsdGVyPWZ1bmN0aW9uKCl7Yi5BYnN0cmFjdEZpbHRlci5jYWxsKHRoaXMpLHRoaXMucGFzc2VzPVt0aGlzXSx0aGlzLnVuaWZvcm1zPXtibHVyOnt0eXBlOlwiMWZcIix2YWx1ZToxLzUxMn19LHRoaXMuZnJhZ21lbnRTcmM9W1wicHJlY2lzaW9uIG1lZGl1bXAgZmxvYXQ7XCIsXCJ2YXJ5aW5nIHZlYzIgdlRleHR1cmVDb29yZDtcIixcInZhcnlpbmcgdmVjNCB2Q29sb3I7XCIsXCJ1bmlmb3JtIGZsb2F0IGJsdXI7XCIsXCJ1bmlmb3JtIHNhbXBsZXIyRCB1U2FtcGxlcjtcIixcInZvaWQgbWFpbih2b2lkKSB7XCIsXCIgICAgZmxvYXQgbHVtID0gbGVuZ3RoKHRleHR1cmUyRCh1U2FtcGxlciwgdlRleHR1cmVDb29yZC54eSkucmdiKTtcIixcIiAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCwgMS4wLCAxLjAsIDEuMCk7XCIsXCIgICAgaWYgKGx1bSA8IDEuMDApIHtcIixcIiAgICAgICAgaWYgKG1vZChnbF9GcmFnQ29vcmQueCArIGdsX0ZyYWdDb29yZC55LCAxMC4wKSA9PSAwLjApIHtcIixcIiAgICAgICAgICAgIGdsX0ZyYWdDb2xvciA9IHZlYzQoMC4wLCAwLjAsIDAuMCwgMS4wKTtcIixcIiAgICAgICAgfVwiLFwiICAgIH1cIixcIiAgICBpZiAobHVtIDwgMC43NSkge1wiLFwiICAgICAgICBpZiAobW9kKGdsX0ZyYWdDb29yZC54IC0gZ2xfRnJhZ0Nvb3JkLnksIDEwLjApID09IDAuMCkge1wiLFwiICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1wiLFwiICAgICAgICB9XCIsXCIgICAgfVwiLFwiICAgIGlmIChsdW0gPCAwLjUwKSB7XCIsXCIgICAgICAgIGlmIChtb2QoZ2xfRnJhZ0Nvb3JkLnggKyBnbF9GcmFnQ29vcmQueSAtIDUuMCwgMTAuMCkgPT0gMC4wKSB7XCIsXCIgICAgICAgICAgICBnbF9GcmFnQ29sb3IgPSB2ZWM0KDAuMCwgMC4wLCAwLjAsIDEuMCk7XCIsXCIgICAgICAgIH1cIixcIiAgICB9XCIsXCIgICAgaWYgKGx1bSA8IDAuMykge1wiLFwiICAgICAgICBpZiAobW9kKGdsX0ZyYWdDb29yZC54IC0gZ2xfRnJhZ0Nvb3JkLnkgLSA1LjAsIDEwLjApID09IDAuMCkge1wiLFwiICAgICAgICAgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNCgwLjAsIDAuMCwgMC4wLCAxLjApO1wiLFwiICAgICAgICB9XCIsXCIgICAgfVwiLFwifVwiXX0sYi5Dcm9zc0hhdGNoRmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLkNyb3NzSGF0Y2hGaWx0ZXIucHJvdG90eXBlLmNvbnN0cnVjdG9yPWIuQ3Jvc3NIYXRjaEZpbHRlcixPYmplY3QuZGVmaW5lUHJvcGVydHkoYi5Dcm9zc0hhdGNoRmlsdGVyLnByb3RvdHlwZSxcImJsdXJcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYmx1ci52YWx1ZS8oMS83ZTMpfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5ibHVyLnZhbHVlPTEvN2UzKmF9fSksYi5SR0JTcGxpdEZpbHRlcj1mdW5jdGlvbigpe2IuQWJzdHJhY3RGaWx0ZXIuY2FsbCh0aGlzKSx0aGlzLnBhc3Nlcz1bdGhpc10sdGhpcy51bmlmb3Jtcz17cmVkOnt0eXBlOlwiMmZcIix2YWx1ZTp7eDoyMCx5OjIwfX0sZ3JlZW46e3R5cGU6XCIyZlwiLHZhbHVlOnt4Oi0yMCx5OjIwfX0sYmx1ZTp7dHlwZTpcIjJmXCIsdmFsdWU6e3g6MjAseTotMjB9fSxkaW1lbnNpb25zOnt0eXBlOlwiNGZ2XCIsdmFsdWU6WzAsMCwwLDBdfX0sdGhpcy5mcmFnbWVudFNyYz1bXCJwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcIixcInZhcnlpbmcgdmVjMiB2VGV4dHVyZUNvb3JkO1wiLFwidmFyeWluZyB2ZWM0IHZDb2xvcjtcIixcInVuaWZvcm0gdmVjMiByZWQ7XCIsXCJ1bmlmb3JtIHZlYzIgZ3JlZW47XCIsXCJ1bmlmb3JtIHZlYzIgYmx1ZTtcIixcInVuaWZvcm0gdmVjNCBkaW1lbnNpb25zO1wiLFwidW5pZm9ybSBzYW1wbGVyMkQgdVNhbXBsZXI7XCIsXCJ2b2lkIG1haW4odm9pZCkge1wiLFwiICAgZ2xfRnJhZ0NvbG9yLnIgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQgKyByZWQvZGltZW5zaW9ucy54eSkucjtcIixcIiAgIGdsX0ZyYWdDb2xvci5nID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkICsgZ3JlZW4vZGltZW5zaW9ucy54eSkuZztcIixcIiAgIGdsX0ZyYWdDb2xvci5iID0gdGV4dHVyZTJEKHVTYW1wbGVyLCB2VGV4dHVyZUNvb3JkICsgYmx1ZS9kaW1lbnNpb25zLnh5KS5iO1wiLFwiICAgZ2xfRnJhZ0NvbG9yLmEgPSB0ZXh0dXJlMkQodVNhbXBsZXIsIHZUZXh0dXJlQ29vcmQpLmE7XCIsXCJ9XCJdfSxiLlJHQlNwbGl0RmlsdGVyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGIuQWJzdHJhY3RGaWx0ZXIucHJvdG90eXBlKSxiLlJHQlNwbGl0RmlsdGVyLnByb3RvdHlwZS5jb25zdHJ1Y3Rvcj1iLlJHQlNwbGl0RmlsdGVyLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlJHQlNwbGl0RmlsdGVyLnByb3RvdHlwZSxcInJlZFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy51bmlmb3Jtcy5yZWQudmFsdWV9LHNldDpmdW5jdGlvbihhKXt0aGlzLnVuaWZvcm1zLnJlZC52YWx1ZT1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlJHQlNwbGl0RmlsdGVyLnByb3RvdHlwZSxcImdyZWVuXCIse2dldDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnVuaWZvcm1zLmdyZWVuLnZhbHVlfSxzZXQ6ZnVuY3Rpb24oYSl7dGhpcy51bmlmb3Jtcy5ncmVlbi52YWx1ZT1hfX0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShiLlJHQlNwbGl0RmlsdGVyLnByb3RvdHlwZSxcImJsdWVcIix7Z2V0OmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudW5pZm9ybXMuYmx1ZS52YWx1ZX0sc2V0OmZ1bmN0aW9uKGEpe3RoaXMudW5pZm9ybXMuYmx1ZS52YWx1ZT1hfX0pLFwidW5kZWZpbmVkXCIhPXR5cGVvZiBleHBvcnRzPyhcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKGV4cG9ydHM9bW9kdWxlLmV4cG9ydHM9YiksZXhwb3J0cy5QSVhJPWIpOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGIpOmEuUElYST1ifSkuY2FsbCh0aGlzKTsiLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHt9IDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IGdsb2JhbFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gZ2xvYmFsWydjYW5jZWwnICsgc3VmZml4XSB8fCBnbG9iYWxbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuICAsIGlzTmF0aXZlID0gdHJ1ZVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJhZjsgaSsrKSB7XG4gIHJhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWwnICsgc3VmZml4XVxuICAgICAgfHwgZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICBpc05hdGl2ZSA9IGZhbHNlXG5cbiAgdmFyIGxhc3QgPSAwXG4gICAgLCBpZCA9IDBcbiAgICAsIHF1ZXVlID0gW11cbiAgICAsIGZyYW1lRHVyYXRpb24gPSAxMDAwIC8gNjBcblxuICByYWYgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIGlmKHF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdmFyIF9ub3cgPSBub3coKVxuICAgICAgICAsIG5leHQgPSBNYXRoLm1heCgwLCBmcmFtZUR1cmF0aW9uIC0gKF9ub3cgLSBsYXN0KSlcbiAgICAgIGxhc3QgPSBuZXh0ICsgX25vd1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGNwID0gcXVldWUuc2xpY2UoMClcbiAgICAgICAgLy8gQ2xlYXIgcXVldWUgaGVyZSB0byBwcmV2ZW50XG4gICAgICAgIC8vIGNhbGxiYWNrcyBmcm9tIGFwcGVuZGluZyBsaXN0ZW5lcnNcbiAgICAgICAgLy8gdG8gdGhlIGN1cnJlbnQgZnJhbWUncyBxdWV1ZVxuICAgICAgICBxdWV1ZS5sZW5ndGggPSAwXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjcC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmKCFjcFtpXS5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIHRyeXtcbiAgICAgICAgICAgICAgY3BbaV0uY2FsbGJhY2sobGFzdClcbiAgICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB0aHJvdyBlIH0sIDApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9LCBNYXRoLnJvdW5kKG5leHQpKVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKHtcbiAgICAgIGhhbmRsZTogKytpZCxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayxcbiAgICAgIGNhbmNlbGxlZDogZmFsc2VcbiAgICB9KVxuICAgIHJldHVybiBpZFxuICB9XG5cbiAgY2FmID0gZnVuY3Rpb24oaGFuZGxlKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZihxdWV1ZVtpXS5oYW5kbGUgPT09IGhhbmRsZSkge1xuICAgICAgICBxdWV1ZVtpXS5jYW5jZWxsZWQgPSB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oZm4pIHtcbiAgLy8gV3JhcCBpbiBhIG5ldyBmdW5jdGlvbiB0byBwcmV2ZW50XG4gIC8vIGBjYW5jZWxgIHBvdGVudGlhbGx5IGJlaW5nIGFzc2lnbmVkXG4gIC8vIHRvIHRoZSBuYXRpdmUgckFGIGZ1bmN0aW9uXG4gIGlmKCFpc05hdGl2ZSkge1xuICAgIHJldHVybiByYWYuY2FsbChnbG9iYWwsIGZuKVxuICB9XG4gIHJldHVybiByYWYuY2FsbChnbG9iYWwsIGZ1bmN0aW9uKCkge1xuICAgIHRyeXtcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgICB9IGNhdGNoKGUpIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICB9XG4gIH0pXG59XG5tb2R1bGUuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgY2FmLmFwcGx5KGdsb2JhbCwgYXJndW1lbnRzKVxufVxuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjYuM1xuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLypcbi8vQCBzb3VyY2VNYXBwaW5nVVJMPXBlcmZvcm1hbmNlLW5vdy5tYXBcbiovXG4iLCIvKiFcbiAqIHJhbmRvbS1leHRcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ia3VtYXIyL3JhbmRvbS1leHQuZ2l0XG4gKlxuICogQ29weXJpZ2h0IDIwMTQgQmlwdWwgS3VtYXJcbiAqIFxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICogXG4gKiAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuICogXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTIElTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbmZ1bmN0aW9uIF9hcnJheShsZW5ndGgsIGVsZW1lbnRGdW5jdGlvbiwgYXJncykge1xuXHR2YXIgYXJyYXkgPSBbXTtcblx0aWYgKGxlbmd0aCAhPSBudWxsKSB7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdFx0YXJyYXlbaV0gPSBlbGVtZW50RnVuY3Rpb24uYXBwbHkodGhpcywgYXJncyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IFwibGVuZ3RoIGlzIHJlcXVpcmVkLlwiO1xuXHR9XG5cdHJldHVybiBhcnJheTtcbn1cblxuZnVuY3Rpb24gYm9vbGVhbigpIHtcblx0cmV0dXJuIE1hdGgucmFuZG9tKCkgPCAwLjU7XG59XG5cbmZ1bmN0aW9uIGJvb2xlYW5BcnJheShsZW5ndGgpIHtcblx0cmV0dXJuIF9hcnJheShsZW5ndGgsIGJvb2xlYW4pO1xufVxuXG5mdW5jdGlvbiBmbG9hdChsaW1pdCwgbWluKSB7XG5cdGlmIChsaW1pdCAhPSBudWxsKSB7XG5cdFx0aWYgKG1pbiAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobGltaXQgLSBtaW4pKSArIG1pbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIE1hdGgucmFuZG9tKCkgKiBsaW1pdDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgXCJtYXggaXMgcmVxdWlyZWQuXCI7XG5cdH1cbn1cblxuZnVuY3Rpb24gZmxvYXRBcnJheShsZW5ndGgsIGxpbWl0LCBtaW4pIHtcblx0cmV0dXJuIF9hcnJheShsZW5ndGgsIGZsb2F0LCBbIGxpbWl0LCBtaW4gXSk7XG59XG5cbmZ1bmN0aW9uIGludGVnZXIobWF4LCBtaW4pIHtcblx0aWYgKG1heCAhPSBudWxsKSB7XG5cdFx0aWYgKG1pbiAhPSBudWxsKSB7XG5cdFx0XHRpZiAobWF4IDwgbWluKSB7XG5cdFx0XHRcdHRocm93IFwibWF4IFtcIiArIG1heCArIFwiXSBpcyBsZXNzIHRoYW4gbWluIFtcIiArIG1pblxuXHRcdFx0XHRcIl1cIjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpICsgbWluO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCArIDEpKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgXCJtYXggaXMgcmVxdWlyZWQuXCI7XG5cdH1cbn1cblxuZnVuY3Rpb24gaW50ZWdlckFycmF5KGxlbmd0aCwgbWF4LCBtaW4pIHtcblx0cmV0dXJuIF9hcnJheShsZW5ndGgsIGludGVnZXIsIFsgbWF4LCBtaW4gXSk7XG59XG5cbmZ1bmN0aW9uIF9ub3JtYWxpemVSYW5nZXMocmFuZ2VzKSB7XG5cdGlmIChyYW5kb21FeHQuREVCVUcpIHtcblx0XHRjb25zb2xlLmxvZyhcIk5vcm1hbGl6aW5nIHJhbmdlczpcIiwgcmFuZ2VzKTtcblx0fVxuXHRyYW5nZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG5cdFx0cmV0dXJuIGFbMF0gLSBiWzBdO1xuXHR9KTtcblx0aWYgKHJhbmRvbUV4dC5ERUJVRykge1xuXHRcdGNvbnNvbGUubG9nKFwic29ydGVkIHJhbmdlczpcIiwgcmFuZ2VzKTtcblx0fVxuXHRmb3IgKHZhciBpID0gMDsgaSA8IHJhbmdlcy5sZW5ndGggLSAxOyArK2kpIHtcblx0XHRmb3IgKHZhciBqID0gaSArIDE7IGogPCByYW5nZXMubGVuZ3RoOyArK2opIHtcblx0XHRcdC8vIHJlbW92ZSByaWdodCBjb250YWluZWRcblx0XHRcdGlmIChyYW5nZXNbaV1bMV0gPj0gcmFuZ2VzW2pdWzFdKSB7XG5cdFx0XHRcdHJhbmdlcy5zcGxpY2UoaiwgMSk7XG5cdFx0XHRcdGotLTtcblx0XHRcdH0gZWxzZVxuXHRcdFx0Ly8gZml4IG92ZXJsYXBcblx0XHRcdGlmIChyYW5nZXNbaV1bMV0gPj0gcmFuZ2VzW2pdWzBdKSB7XG5cdFx0XHRcdHJhbmdlc1tqXVswXSA9IHJhbmdlc1tpXVsxXSArIDE7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmFuZG9tRXh0LkRFQlVHKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiaXRlcmF0aW9uIChcIiArIGkgKyBcIixcIiArIGogKyBcIik6XCIsIHJhbmdlcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGlmIChyYW5kb21FeHQuREVCVUcpIHtcblx0XHRjb25zb2xlLmxvZyhcIk5vcm1hbGl6ZWQgcmFuZ2VzOlwiLCByYW5nZXMpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9pbnRlZ2VyRnJvbVJhbmdlcyhyYW5nZXMpIHtcblx0X25vcm1hbGl6ZVJhbmdlcyhyYW5nZXMpO1xuXHRpZiAocmFuZ2VzICE9IG51bGwpIHtcblx0XHR2YXIgc3BhbiA9IDA7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdHNwYW4gKz0gKHJhbmdlc1tpXVsxXSAtIHJhbmdlc1tpXVswXSArIDEpO1xuXHRcdH1cblx0XHR2YXIgcmFuZG9tTnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc3Bhbik7XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCByYW5nZXMubGVuZ3RoOyArK2kpIHtcblx0XHRcdHJhbmRvbU51bWJlciArPSByYW5nZXNbaV1bMF07XG5cdFx0XHRpZiAocmFuZG9tTnVtYmVyIDw9IHJhbmdlc1tpXVsxXSkge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJhbmRvbU51bWJlciAtPSAocmFuZ2VzW2ldWzFdICsgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiByYW5kb21OdW1iZXI7XG5cdH0gZWxzZSB7XG5cdFx0dGhyb3cgXCJyYW5nZXMgaXMgcmVxdWlyZWQuXCI7XG5cdH1cbn1cblxuZnVuY3Rpb24gX2ludGVnZXJBcnJheUZyb21SYW5nZXMobGVuZ3RoLCByYW5nZXMpIHtcblx0dmFyIG51bWJlckFycmF5ID0gW107XG5cdGlmIChsZW5ndGggIT0gbnVsbCAmJiByYW5nZXMgIT0gbnVsbCkge1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRcdG51bWJlckFycmF5W2ldID0gX2ludGVnZXJGcm9tUmFuZ2VzKHJhbmdlcyk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHRocm93IFwibGVuZ3RoIGFuZCByYW5nZXMgaXMgcmVxdWlyZWQuXCI7XG5cdH1cblx0cmV0dXJuIG51bWJlckFycmF5O1xufVxuXG5mdW5jdGlvbiBfc3RyaW5nRnJvbVJhbmdlcyhtYXhMZW5ndGgsIG1pbkxlbmd0aCwgcmFuZ2VzKSB7XG5cdHZhciBkU3RyaW5nID0gXCJcIjtcblx0dmFyIGxlbmd0aCA9IGludGVnZXIobWF4TGVuZ3RoLCBtaW5MZW5ndGgpO1xuXHR2YXIgdW5pY29kZU51bWJlcnMgPSBfaW50ZWdlckFycmF5RnJvbVJhbmdlcyhsZW5ndGgsIHJhbmdlcyk7XG5cdGRTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KHRoaXMsIHVuaWNvZGVOdW1iZXJzKTtcblx0cmV0dXJuIGRTdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGRhdGUoZW5kRGF0ZSwgc3RhcnREYXRlKSB7XG5cdGlmIChlbmREYXRlID09IG51bGwpIHtcblx0XHR0aHJvdyBcImVuZCBkYXRlIGlzIHJlcXVpcmVkLlwiO1xuXHR9XG5cdHZhciBlbmREYXRlVGltZSA9IGVuZERhdGUuZ2V0VGltZSgpO1xuXHR2YXIgc3RhcnREYXRlVGltZSA9IHN0YXJ0RGF0ZSAhPSBudWxsID8gc3RhcnREYXRlLmdldFRpbWUoKSA6IDA7XG5cdHJldHVybiBuZXcgRGF0ZShpbnRlZ2VyKGVuZERhdGVUaW1lLCBzdGFydERhdGVUaW1lKSk7XG59XG5cbmZ1bmN0aW9uIGRhdGVBcnJheShsZW5ndGgsIGVuZERhdGUsIHN0YXJ0RGF0ZSkge1xuXHRyZXR1cm4gX2FycmF5KGxlbmd0aCwgZGF0ZSwgWyBlbmREYXRlLCBzdGFydERhdGUgXSk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZyhtYXhMZW5ndGgsIG1pbkxlbmd0aCkge1xuXHRpZiAocmFuZG9tRXh0LkRFQlVHKSB7XG5cdFx0Y29uc29sZS5sb2coXCJzdHJpbmcgbWF4TGVuZ3RoOlwiLCBtYXhMZW5ndGgsIFwiIG1pbkxlbmd0aDpcIixcblx0XHRcdFx0bWluTGVuZ3RoKTtcblx0fVxuXHRyZXR1cm4gX3N0cmluZ0Zyb21SYW5nZXMobWF4TGVuZ3RoLCBtaW5MZW5ndGgsIFsgWyAzMiwgMTI2IF0gXSk7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ0FycmF5KGFycmF5TGVuZ3RoLCBzdHJpbmdNYXhMZW5ndGgsIHN0cmluZ01pbkxlbmd0aCkge1xuXHRyZXR1cm4gX2FycmF5KGFycmF5TGVuZ3RoLCBzdHJpbmcsIFsgc3RyaW5nTWF4TGVuZ3RoLFxuXHRcdFx0c3RyaW5nTWluTGVuZ3RoIF0pO1xufVxuXG5mdW5jdGlvbiByZXN0cmljdGVkU3RyaW5nKGNvbnRlbnQsIG1heExlbmd0aCwgbWluTGVuZ3RoKSB7XG5cdHZhciByYW5nZXMgPSBbXTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjb250ZW50Lmxlbmd0aDsgKytpKSB7XG5cdFx0dmFyIGNvbnRlbnRUeXBlID0gY29udGVudFtpXTtcblx0XHRzd2l0Y2ggKGNvbnRlbnRUeXBlKSB7XG5cdFx0Y2FzZSByYW5kb21FeHQuQ0hBUl9UWVBFLlNQRUNJQUw6XG5cdFx0XHRyYW5nZXMgPSByYW5nZXMuY29uY2F0KFsgWyAzMywgNDcgXSwgWyA1OCwgNjQgXSwgWyA5MSwgOTYgXSxcblx0XHRcdFx0XHRbIDEyMywgMTI2IF0gXSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIHJhbmRvbUV4dC5DSEFSX1RZUEUuU1BBQ0U6XG5cdFx0XHRyYW5nZXMgPSByYW5nZXMuY29uY2F0KFsgWyAzMiwgMzIgXSBdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgcmFuZG9tRXh0LkNIQVJfVFlQRS5OVU1FUklDOlxuXHRcdFx0cmFuZ2VzID0gcmFuZ2VzLmNvbmNhdChbIFsgNDgsIDU3IF0gXSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIHJhbmRvbUV4dC5DSEFSX1RZUEUuVVBQRVJDQVNFOlxuXHRcdFx0cmFuZ2VzID0gcmFuZ2VzLmNvbmNhdChbIFsgNjUsIDkwIF0gXSk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIHJhbmRvbUV4dC5DSEFSX1RZUEUuTE9XRVJDQVNFOlxuXHRcdFx0cmFuZ2VzID0gcmFuZ2VzLmNvbmNhdChbIFsgOTcsIDEyMiBdIF0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSByYW5kb21FeHQuQ0hBUl9UWVBFLkhFWDpcblx0XHRcdHJhbmdlcyA9IHJhbmdlcy5jb25jYXQoWyBbIDQ4LCA1NyBdLCBbIDk3LCAxMDQgXSBdKTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRpZiAodHlwZW9mIGNvbnRlbnRUeXBlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdGZvciAodmFyIGogPSAwOyBqIDwgY29udGVudFR5cGUubGVuZ3RoOyArK2opIHtcblx0XHRcdFx0XHRyYW5nZXMgPSByYW5nZXMuY29uY2F0KFsgWyBjb250ZW50VHlwZS5jaGFyQ29kZUF0KGopLFxuXHRcdFx0XHRcdFx0XHRjb250ZW50VHlwZS5jaGFyQ29kZUF0KGopIF0gXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIF9zdHJpbmdGcm9tUmFuZ2VzKG1heExlbmd0aCwgbWluTGVuZ3RoLCByYW5nZXMpO1xufVxuXG5mdW5jdGlvbiByZXN0cmljdGVkU3RyaW5nQXJyYXkoYXJyYXlMZW5ndGgsIGNvbnRlbnQsIHN0cmluZ01heExlbmd0aCxcblx0XHRzdHJpbmdNaW5MZW5ndGgpIHtcblx0cmV0dXJuIF9hcnJheShhcnJheUxlbmd0aCwgcmVzdHJpY3RlZFN0cmluZywgWyBjb250ZW50LFxuXHRcdFx0c3RyaW5nTWF4TGVuZ3RoLCBzdHJpbmdNaW5MZW5ndGggXSk7XG59XG5cbmZ1bmN0aW9uIF9mcm9tRGVzY3JpcHRvcihyYW5kb21EZXNjcmlwdG9yKSB7XG5cdHZhciByYW5kb21WYWx1ZSA9IG51bGw7XG5cdGlmIChyYW5kb21EZXNjcmlwdG9yID09IG51bGwgfHwgIXJhbmRvbURlc2NyaXB0b3Iuc2hpZnRcblx0XHRcdHx8IHJhbmRvbURlc2NyaXB0b3IubGVuZ3RoIDw9IDBcblx0XHRcdHx8IHR5cGVvZiByYW5kb21EZXNjcmlwdG9yWzBdICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRyYW5kb21WYWx1ZSA9IHJhbmRvbURlc2NyaXB0b3I7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIHJhbmRvbUZ1bmN0aW9uID0gcmFuZG9tRGVzY3JpcHRvclswXTtcblx0XHRpZiAocmFuZG9tRGVzY3JpcHRvci5sZW5ndGggPiAxKSB7XG5cdFx0XHR2YXIgcHJvcGVydHlWYWx1ZUFyZ3MgPSByYW5kb21EZXNjcmlwdG9yLnNsaWNlKDEsXG5cdFx0XHRcdFx0cmFuZG9tRGVzY3JpcHRvci5sZW5ndGgpO1xuXHRcdFx0cmFuZG9tVmFsdWUgPSByYW5kb21GdW5jdGlvbi5hcHBseSh0aGlzLCBwcm9wZXJ0eVZhbHVlQXJncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJhbmRvbVZhbHVlID0gcmFuZG9tRnVuY3Rpb24oKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHJhbmRvbVZhbHVlO1xufVxuXG5mdW5jdGlvbiBvYmplY3QodGVtcGxhdGUpIHtcblx0aWYgKHJhbmRvbUV4dC5ERUJVRykge1xuXHRcdGNvbnNvbGUubG9nKFwib2JqZWN0IHRlbXBsYXRlOlwiLCB0ZW1wbGF0ZSk7XG5cdH1cblx0dmFyIG5ld09iamVjdCA9IHt9O1xuXHR2YXIgcHJvcGVydGllcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlbXBsYXRlKTtcblx0Zm9yICh2YXIgaSA9IDA7IGkgPCBwcm9wZXJ0aWVzLmxlbmd0aDsgKytpKSB7XG5cdFx0dmFyIHByb3BlcnR5ID0gcHJvcGVydGllc1tpXTtcblx0XHR2YXIgcmFuZG9tRGVzY3JpcHRvciA9IHRlbXBsYXRlW3Byb3BlcnR5XTtcblx0XHRuZXdPYmplY3RbcHJvcGVydHldID0gX2Zyb21EZXNjcmlwdG9yKHJhbmRvbURlc2NyaXB0b3IpO1xuXHR9XG5cdHJldHVybiBuZXdPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIG9iamVjdEFycmF5KGxlbmd0aCwgdGVtcGxhdGUpIHtcblx0cmV0dXJuIF9hcnJheShsZW5ndGgsIG9iamVjdCwgWyB0ZW1wbGF0ZSBdKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5nUGF0dGVybihwYXR0ZXJuLCB2YXJpYWJsZURlZmluaXRpb24pIHtcblx0dmFyIHN0cmluZ1BhdHRlcm4gPSBwYXR0ZXJuO1xuXHR2YXIgcHJvcGVydGllcyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHZhcmlhYmxlRGVmaW5pdGlvbik7XG5cdHZhciByZXBsYWNlZFN0cmluZ0FycmF5ID0gbmV3IEFycmF5KCk7XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgc3RyaW5nUGF0dGVybi5sZW5ndGg7ICsraSkge1xuXHRcdGlmICh2YXJpYWJsZURlZmluaXRpb24uaGFzT3duUHJvcGVydHkoc3RyaW5nUGF0dGVybltpXSkpIHtcblx0XHRcdHJlcGxhY2VkU3RyaW5nQXJyYXlbaV0gPSBfZnJvbURlc2NyaXB0b3IodmFyaWFibGVEZWZpbml0aW9uW3N0cmluZ1BhdHRlcm5baV1dKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVwbGFjZWRTdHJpbmdBcnJheVtpXSA9IHN0cmluZ1BhdHRlcm5baV07XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZXBsYWNlZFN0cmluZ0FycmF5LmpvaW4oXCJcIik7XG59XG5cbmZ1bmN0aW9uIHN0cmluZ1BhdHRlcm5BcnJheShsZW5ndGgsIHBhdHRlcm4sIHZhcmlhYmxlRGVmaW5pdGlvbikge1xuXHRyZXR1cm4gX2FycmF5KGxlbmd0aCwgc3RyaW5nUGF0dGVybiwgWyBwYXR0ZXJuLFxuXHRcdFx0dmFyaWFibGVEZWZpbml0aW9uIF0pO1xufVxuXG5mdW5jdGlvbiBwaWNrKGFycmF5KSB7XG5cdGlmIChhcnJheSA9PSBudWxsKSB7XG5cdFx0dGhyb3cgXCJpbnB1dCBhcnJheSBpcyBudWxsIG9yIHVuZGVmaW5lZC5cIjtcblx0fVxuXHRyZXR1cm4gYXJyYXlbaW50ZWdlcihhcnJheS5sZW5ndGggLSAxKV07XG59XG5cbmZ1bmN0aW9uIHNodWZmbGUoYXJyYXkpIHtcblx0aWYgKGFycmF5ID09IG51bGwpIHtcblx0XHR0aHJvdyBcImlucHV0IGFycmF5IGlzIG51bGwgb3IgdW5kZWZpbmVkLlwiO1xuXHR9XG5cdGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXkubGVuZ3RoOyArK2kpIHtcblx0XHR2YXIgcmFuZG9tSW5kZXggPSBpbnRlZ2VyKGFycmF5Lmxlbmd0aCAtIDEpO1xuXHRcdHZhciB0ZW1wID0gYXJyYXlbcmFuZG9tSW5kZXhdO1xuXHRcdGFycmF5W3JhbmRvbUluZGV4XSA9IGFycmF5W2ldO1xuXHRcdGFycmF5W2ldID0gdGVtcDtcblx0fVxufVxuXG5mdW5jdGlvbiBjb2xvcigpIHtcblx0cmV0dXJuICcjJy5jb25jYXQoKE1hdGgucmFuZG9tKCkqMHhGRkZGRkY8PDApLnRvU3RyaW5nKDE2KSk7XG59XG5cbnZhciByYW5kb21FeHQgPSB7XG5cdGJvb2xlYW4gOiBib29sZWFuLFxuXHRib29sZWFuQXJyYXkgOiBib29sZWFuQXJyYXksXG5cdGludGVnZXIgOiBpbnRlZ2VyLFxuXHRpbnRlZ2VyQXJyYXkgOiBpbnRlZ2VyQXJyYXksXG5cdGZsb2F0IDogZmxvYXQsXG5cdGZsb2F0QXJyYXkgOiBmbG9hdEFycmF5LFxuXHRkYXRlIDogZGF0ZSxcblx0ZGF0ZUFycmF5IDogZGF0ZUFycmF5LFxuXHRzdHJpbmcgOiBzdHJpbmcsXG5cdHN0cmluZ0FycmF5IDogc3RyaW5nQXJyYXksXG5cdHJlc3RyaWN0ZWRTdHJpbmcgOiByZXN0cmljdGVkU3RyaW5nLFxuXHRyZXN0cmljdGVkU3RyaW5nQXJyYXkgOiByZXN0cmljdGVkU3RyaW5nQXJyYXksXG5cdG9iamVjdCA6IG9iamVjdCxcblx0b2JqZWN0QXJyYXkgOiBvYmplY3RBcnJheSxcblx0c3RyaW5nUGF0dGVybiA6IHN0cmluZ1BhdHRlcm4sXG5cdHN0cmluZ1BhdHRlcm5BcnJheSA6IHN0cmluZ1BhdHRlcm5BcnJheSxcblx0cGljayA6IHBpY2ssXG5cdHNodWZmbGUgOiBzaHVmZmxlLFxuXHRjb2xvcjogY29sb3IsXG5cdENIQVJfVFlQRSA6IHtcblx0XHRMT1dFUkNBU0UgOiAwLFxuXHRcdFVQUEVSQ0FTRSA6IDEsXG5cdFx0TlVNRVJJQyA6IDIsXG5cdFx0U1BFQ0lBTCA6IDMsXG5cdFx0U1BBQ0UgOiA0LFxuXHRcdEhFWCA6IDVcblx0fSxcblx0REVCVUcgOiBmYWxzZVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSByYW5kb21FeHQ7XG4iLCIvLyBzdGF0cy5qcyAtIGh0dHA6Ly9naXRodWIuY29tL21yZG9vYi9zdGF0cy5qc1xudmFyIFN0YXRzPWZ1bmN0aW9uKCl7dmFyIGw9RGF0ZS5ub3coKSxtPWwsZz0wLG49SW5maW5pdHksbz0wLGg9MCxwPUluZmluaXR5LHE9MCxyPTAscz0wLGY9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtmLmlkPVwic3RhdHNcIjtmLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIixmdW5jdGlvbihiKXtiLnByZXZlbnREZWZhdWx0KCk7dCgrK3MlMil9LCExKTtmLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDo4MHB4O29wYWNpdHk6MC45O2N1cnNvcjpwb2ludGVyXCI7dmFyIGE9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTthLmlkPVwiZnBzXCI7YS5zdHlsZS5jc3NUZXh0PVwicGFkZGluZzowIDAgM3B4IDNweDt0ZXh0LWFsaWduOmxlZnQ7YmFja2dyb3VuZC1jb2xvcjojMDAyXCI7Zi5hcHBlbmRDaGlsZChhKTt2YXIgaT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2kuaWQ9XCJmcHNUZXh0XCI7aS5zdHlsZS5jc3NUZXh0PVwiY29sb3I6IzBmZjtmb250LWZhbWlseTpIZWx2ZXRpY2EsQXJpYWwsc2Fucy1zZXJpZjtmb250LXNpemU6OXB4O2ZvbnQtd2VpZ2h0OmJvbGQ7bGluZS1oZWlnaHQ6MTVweFwiO1xuaS5pbm5lckhUTUw9XCJGUFNcIjthLmFwcGVuZENoaWxkKGkpO3ZhciBjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7Yy5pZD1cImZwc0dyYXBoXCI7Yy5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZmZcIjtmb3IoYS5hcHBlbmRDaGlsZChjKTs3ND5jLmNoaWxkcmVuLmxlbmd0aDspe3ZhciBqPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJzcGFuXCIpO2ouc3R5bGUuY3NzVGV4dD1cIndpZHRoOjFweDtoZWlnaHQ6MzBweDtmbG9hdDpsZWZ0O2JhY2tncm91bmQtY29sb3I6IzExM1wiO2MuYXBwZW5kQ2hpbGQoail9dmFyIGQ9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtkLmlkPVwibXNcIjtkLnN0eWxlLmNzc1RleHQ9XCJwYWRkaW5nOjAgMCAzcHggM3B4O3RleHQtYWxpZ246bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMwMjA7ZGlzcGxheTpub25lXCI7Zi5hcHBlbmRDaGlsZChkKTt2YXIgaz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuay5pZD1cIm1zVGV4dFwiO2suc3R5bGUuY3NzVGV4dD1cImNvbG9yOiMwZjA7Zm9udC1mYW1pbHk6SGVsdmV0aWNhLEFyaWFsLHNhbnMtc2VyaWY7Zm9udC1zaXplOjlweDtmb250LXdlaWdodDpib2xkO2xpbmUtaGVpZ2h0OjE1cHhcIjtrLmlubmVySFRNTD1cIk1TXCI7ZC5hcHBlbmRDaGlsZChrKTt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2UuaWQ9XCJtc0dyYXBoXCI7ZS5zdHlsZS5jc3NUZXh0PVwicG9zaXRpb246cmVsYXRpdmU7d2lkdGg6NzRweDtoZWlnaHQ6MzBweDtiYWNrZ3JvdW5kLWNvbG9yOiMwZjBcIjtmb3IoZC5hcHBlbmRDaGlsZChlKTs3ND5lLmNoaWxkcmVuLmxlbmd0aDspaj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic3BhblwiKSxqLnN0eWxlLmNzc1RleHQ9XCJ3aWR0aDoxcHg7aGVpZ2h0OjMwcHg7ZmxvYXQ6bGVmdDtiYWNrZ3JvdW5kLWNvbG9yOiMxMzFcIixlLmFwcGVuZENoaWxkKGopO3ZhciB0PWZ1bmN0aW9uKGIpe3M9Yjtzd2l0Y2gocyl7Y2FzZSAwOmEuc3R5bGUuZGlzcGxheT1cblwiYmxvY2tcIjtkLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7YnJlYWs7Y2FzZSAxOmEuc3R5bGUuZGlzcGxheT1cIm5vbmVcIixkLnN0eWxlLmRpc3BsYXk9XCJibG9ja1wifX07cmV0dXJue1JFVklTSU9OOjEyLGRvbUVsZW1lbnQ6ZixzZXRNb2RlOnQsYmVnaW46ZnVuY3Rpb24oKXtsPURhdGUubm93KCl9LGVuZDpmdW5jdGlvbigpe3ZhciBiPURhdGUubm93KCk7Zz1iLWw7bj1NYXRoLm1pbihuLGcpO289TWF0aC5tYXgobyxnKTtrLnRleHRDb250ZW50PWcrXCIgTVMgKFwiK24rXCItXCIrbytcIilcIjt2YXIgYT1NYXRoLm1pbigzMCwzMC0zMCooZy8yMDApKTtlLmFwcGVuZENoaWxkKGUuZmlyc3RDaGlsZCkuc3R5bGUuaGVpZ2h0PWErXCJweFwiO3IrKztiPm0rMUUzJiYoaD1NYXRoLnJvdW5kKDFFMypyLyhiLW0pKSxwPU1hdGgubWluKHAsaCkscT1NYXRoLm1heChxLGgpLGkudGV4dENvbnRlbnQ9aCtcIiBGUFMgKFwiK3ArXCItXCIrcStcIilcIixhPU1hdGgubWluKDMwLDMwLTMwKihoLzEwMCkpLGMuYXBwZW5kQ2hpbGQoYy5maXJzdENoaWxkKS5zdHlsZS5oZWlnaHQ9XG5hK1wicHhcIixtPWIscj0wKTtyZXR1cm4gYn0sdXBkYXRlOmZ1bmN0aW9uKCl7bD10aGlzLmVuZCgpfX19O1wib2JqZWN0XCI9PT10eXBlb2YgbW9kdWxlJiYobW9kdWxlLmV4cG9ydHM9U3RhdHMpO1xuIiwiLyoqXG4gKiBUd2Vlbi5qcyAtIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogaHR0cHM6Ly9naXRodWIuY29tL3NvbGUvdHdlZW4uanNcbiAqIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAqXG4gKiBTZWUgaHR0cHM6Ly9naXRodWIuY29tL3NvbGUvdHdlZW4uanMvZ3JhcGhzL2NvbnRyaWJ1dG9ycyBmb3IgdGhlIGZ1bGwgbGlzdCBvZiBjb250cmlidXRvcnMuXG4gKiBUaGFuayB5b3UgYWxsLCB5b3UncmUgYXdlc29tZSFcbiAqL1xuXG4vLyBEYXRlLm5vdyBzaGltIGZvciAoYWhlbSkgSW50ZXJuZXQgRXhwbG8oZHxyKWVyXG5pZiAoIERhdGUubm93ID09PSB1bmRlZmluZWQgKSB7XG5cblx0RGF0ZS5ub3cgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gbmV3IERhdGUoKS52YWx1ZU9mKCk7XG5cblx0fTtcblxufVxuXG52YXIgVFdFRU4gPSBUV0VFTiB8fCAoIGZ1bmN0aW9uICgpIHtcblxuXHR2YXIgX3R3ZWVucyA9IFtdO1xuXG5cdHJldHVybiB7XG5cblx0XHRSRVZJU0lPTjogJzE0JyxcblxuXHRcdGdldEFsbDogZnVuY3Rpb24gKCkge1xuXG5cdFx0XHRyZXR1cm4gX3R3ZWVucztcblxuXHRcdH0sXG5cblx0XHRyZW1vdmVBbGw6IGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0X3R3ZWVucyA9IFtdO1xuXG5cdFx0fSxcblxuXHRcdGFkZDogZnVuY3Rpb24gKCB0d2VlbiApIHtcblxuXHRcdFx0X3R3ZWVucy5wdXNoKCB0d2VlbiApO1xuXG5cdFx0fSxcblxuXHRcdHJlbW92ZTogZnVuY3Rpb24gKCB0d2VlbiApIHtcblxuXHRcdFx0dmFyIGkgPSBfdHdlZW5zLmluZGV4T2YoIHR3ZWVuICk7XG5cblx0XHRcdGlmICggaSAhPT0gLTEgKSB7XG5cblx0XHRcdFx0X3R3ZWVucy5zcGxpY2UoIGksIDEgKTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdHVwZGF0ZTogZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0XHRpZiAoIF90d2VlbnMubGVuZ3RoID09PSAwICkgcmV0dXJuIGZhbHNlO1xuXG5cdFx0XHR2YXIgaSA9IDA7XG5cblx0XHRcdHRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpICk7XG5cblx0XHRcdHdoaWxlICggaSA8IF90d2VlbnMubGVuZ3RoICkge1xuXG5cdFx0XHRcdGlmICggX3R3ZWVuc1sgaSBdLnVwZGF0ZSggdGltZSApICkge1xuXG5cdFx0XHRcdFx0aSsrO1xuXG5cdFx0XHRcdH0gZWxzZSB7XG5cblx0XHRcdFx0XHRfdHdlZW5zLnNwbGljZSggaSwgMSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdH1cblx0fTtcblxufSApKCk7XG5cblRXRUVOLlR3ZWVuID0gZnVuY3Rpb24gKCBvYmplY3QgKSB7XG5cblx0dmFyIF9vYmplY3QgPSBvYmplY3Q7XG5cdHZhciBfdmFsdWVzU3RhcnQgPSB7fTtcblx0dmFyIF92YWx1ZXNFbmQgPSB7fTtcblx0dmFyIF92YWx1ZXNTdGFydFJlcGVhdCA9IHt9O1xuXHR2YXIgX2R1cmF0aW9uID0gMTAwMDtcblx0dmFyIF9yZXBlYXQgPSAwO1xuXHR2YXIgX3lveW8gPSBmYWxzZTtcblx0dmFyIF9pc1BsYXlpbmcgPSBmYWxzZTtcblx0dmFyIF9yZXZlcnNlZCA9IGZhbHNlO1xuXHR2YXIgX2RlbGF5VGltZSA9IDA7XG5cdHZhciBfc3RhcnRUaW1lID0gbnVsbDtcblx0dmFyIF9lYXNpbmdGdW5jdGlvbiA9IFRXRUVOLkVhc2luZy5MaW5lYXIuTm9uZTtcblx0dmFyIF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLkxpbmVhcjtcblx0dmFyIF9jaGFpbmVkVHdlZW5zID0gW107XG5cdHZhciBfb25TdGFydENhbGxiYWNrID0gbnVsbDtcblx0dmFyIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9IGZhbHNlO1xuXHR2YXIgX29uVXBkYXRlQ2FsbGJhY2sgPSBudWxsO1xuXHR2YXIgX29uQ29tcGxldGVDYWxsYmFjayA9IG51bGw7XG5cdHZhciBfb25TdG9wQ2FsbGJhY2sgPSBudWxsO1xuXG5cdC8vIFNldCBhbGwgc3RhcnRpbmcgdmFsdWVzIHByZXNlbnQgb24gdGhlIHRhcmdldCBvYmplY3Rcblx0Zm9yICggdmFyIGZpZWxkIGluIG9iamVjdCApIHtcblxuXHRcdF92YWx1ZXNTdGFydFsgZmllbGQgXSA9IHBhcnNlRmxvYXQob2JqZWN0W2ZpZWxkXSwgMTApO1xuXG5cdH1cblxuXHR0aGlzLnRvID0gZnVuY3Rpb24gKCBwcm9wZXJ0aWVzLCBkdXJhdGlvbiApIHtcblxuXHRcdGlmICggZHVyYXRpb24gIT09IHVuZGVmaW5lZCApIHtcblxuXHRcdFx0X2R1cmF0aW9uID0gZHVyYXRpb247XG5cblx0XHR9XG5cblx0XHRfdmFsdWVzRW5kID0gcHJvcGVydGllcztcblxuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5zdGFydCA9IGZ1bmN0aW9uICggdGltZSApIHtcblxuXHRcdFRXRUVOLmFkZCggdGhpcyApO1xuXG5cdFx0X2lzUGxheWluZyA9IHRydWU7XG5cblx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSBmYWxzZTtcblxuXHRcdF9zdGFydFRpbWUgPSB0aW1lICE9PSB1bmRlZmluZWQgPyB0aW1lIDogKCB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucGVyZm9ybWFuY2UgIT09IHVuZGVmaW5lZCAmJiB3aW5kb3cucGVyZm9ybWFuY2Uubm93ICE9PSB1bmRlZmluZWQgPyB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCkgOiBEYXRlLm5vdygpICk7XG5cdFx0X3N0YXJ0VGltZSArPSBfZGVsYXlUaW1lO1xuXG5cdFx0Zm9yICggdmFyIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdC8vIGNoZWNrIGlmIGFuIEFycmF5IHdhcyBwcm92aWRlZCBhcyBwcm9wZXJ0eSB2YWx1ZVxuXHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0aWYgKCBfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdLmxlbmd0aCA9PT0gMCApIHtcblxuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBjcmVhdGUgYSBsb2NhbCBjb3B5IG9mIHRoZSBBcnJheSB3aXRoIHRoZSBzdGFydCB2YWx1ZSBhdCB0aGUgZnJvbnRcblx0XHRcdFx0X3ZhbHVlc0VuZFsgcHJvcGVydHkgXSA9IFsgX29iamVjdFsgcHJvcGVydHkgXSBdLmNvbmNhdCggX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSApO1xuXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF9vYmplY3RbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmKCAoIF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSBpbnN0YW5jZW9mIEFycmF5ICkgPT09IGZhbHNlICkge1xuXHRcdFx0XHRfdmFsdWVzU3RhcnRbIHByb3BlcnR5IF0gKj0gMS4wOyAvLyBFbnN1cmVzIHdlJ3JlIHVzaW5nIG51bWJlcnMsIG5vdCBzdHJpbmdzXG5cdFx0XHR9XG5cblx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3AgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRpZiAoICFfaXNQbGF5aW5nICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0VFdFRU4ucmVtb3ZlKCB0aGlzICk7XG5cdFx0X2lzUGxheWluZyA9IGZhbHNlO1xuXG5cdFx0aWYgKCBfb25TdG9wQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdF9vblN0b3BDYWxsYmFjay5jYWxsKCBfb2JqZWN0ICk7XG5cblx0XHR9XG5cblx0XHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnN0b3BDaGFpbmVkVHdlZW5zID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRfY2hhaW5lZFR3ZWVuc1sgaSBdLnN0b3AoKTtcblxuXHRcdH1cblxuXHR9O1xuXG5cdHRoaXMuZGVsYXkgPSBmdW5jdGlvbiAoIGFtb3VudCApIHtcblxuXHRcdF9kZWxheVRpbWUgPSBhbW91bnQ7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnJlcGVhdCA9IGZ1bmN0aW9uICggdGltZXMgKSB7XG5cblx0XHRfcmVwZWF0ID0gdGltZXM7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLnlveW8gPSBmdW5jdGlvbiggeW95byApIHtcblxuXHRcdF95b3lvID0geW95bztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cblx0dGhpcy5lYXNpbmcgPSBmdW5jdGlvbiAoIGVhc2luZyApIHtcblxuXHRcdF9lYXNpbmdGdW5jdGlvbiA9IGVhc2luZztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMuaW50ZXJwb2xhdGlvbiA9IGZ1bmN0aW9uICggaW50ZXJwb2xhdGlvbiApIHtcblxuXHRcdF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24gPSBpbnRlcnBvbGF0aW9uO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5jaGFpbiA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdF9jaGFpbmVkVHdlZW5zID0gYXJndW1lbnRzO1xuXHRcdHJldHVybiB0aGlzO1xuXG5cdH07XG5cblx0dGhpcy5vblN0YXJ0ID0gZnVuY3Rpb24gKCBjYWxsYmFjayApIHtcblxuXHRcdF9vblN0YXJ0Q2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25VcGRhdGUgPSBmdW5jdGlvbiAoIGNhbGxiYWNrICkge1xuXG5cdFx0X29uVXBkYXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMub25Db21wbGV0ZSA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25Db21wbGV0ZUNhbGxiYWNrID0gY2FsbGJhY2s7XG5cdFx0cmV0dXJuIHRoaXM7XG5cblx0fTtcblxuXHR0aGlzLm9uU3RvcCA9IGZ1bmN0aW9uICggY2FsbGJhY2sgKSB7XG5cblx0XHRfb25TdG9wQ2FsbGJhY2sgPSBjYWxsYmFjaztcblx0XHRyZXR1cm4gdGhpcztcblxuXHR9O1xuXG5cdHRoaXMudXBkYXRlID0gZnVuY3Rpb24gKCB0aW1lICkge1xuXG5cdFx0dmFyIHByb3BlcnR5O1xuXG5cdFx0aWYgKCB0aW1lIDwgX3N0YXJ0VGltZSApIHtcblxuXHRcdFx0cmV0dXJuIHRydWU7XG5cblx0XHR9XG5cblx0XHRpZiAoIF9vblN0YXJ0Q2FsbGJhY2tGaXJlZCA9PT0gZmFsc2UgKSB7XG5cblx0XHRcdGlmICggX29uU3RhcnRDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0XHRfb25TdGFydENhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0fVxuXG5cdFx0XHRfb25TdGFydENhbGxiYWNrRmlyZWQgPSB0cnVlO1xuXG5cdFx0fVxuXG5cdFx0dmFyIGVsYXBzZWQgPSAoIHRpbWUgLSBfc3RhcnRUaW1lICkgLyBfZHVyYXRpb247XG5cdFx0ZWxhcHNlZCA9IGVsYXBzZWQgPiAxID8gMSA6IGVsYXBzZWQ7XG5cblx0XHR2YXIgdmFsdWUgPSBfZWFzaW5nRnVuY3Rpb24oIGVsYXBzZWQgKTtcblxuXHRcdGZvciAoIHByb3BlcnR5IGluIF92YWx1ZXNFbmQgKSB7XG5cblx0XHRcdHZhciBzdGFydCA9IF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSB8fCAwO1xuXHRcdFx0dmFyIGVuZCA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cblx0XHRcdGlmICggZW5kIGluc3RhbmNlb2YgQXJyYXkgKSB7XG5cblx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IF9pbnRlcnBvbGF0aW9uRnVuY3Rpb24oIGVuZCwgdmFsdWUgKTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHQvLyBQYXJzZXMgcmVsYXRpdmUgZW5kIHZhbHVlcyB3aXRoIHN0YXJ0IGFzIGJhc2UgKGUuZy46ICsxMCwgLTMpXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwic3RyaW5nXCIgKSB7XG5cdFx0XHRcdFx0ZW5kID0gc3RhcnQgKyBwYXJzZUZsb2F0KGVuZCwgMTApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gcHJvdGVjdCBhZ2FpbnN0IG5vbiBudW1lcmljIHByb3BlcnRpZXMuXG5cdFx0XHRcdGlmICggdHlwZW9mKGVuZCkgPT09IFwibnVtYmVyXCIgKSB7XG5cdFx0XHRcdFx0X29iamVjdFsgcHJvcGVydHkgXSA9IHN0YXJ0ICsgKCBlbmQgLSBzdGFydCApICogdmFsdWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0fVxuXG5cdFx0fVxuXG5cdFx0aWYgKCBfb25VcGRhdGVDYWxsYmFjayAhPT0gbnVsbCApIHtcblxuXHRcdFx0X29uVXBkYXRlQ2FsbGJhY2suY2FsbCggX29iamVjdCwgdmFsdWUgKTtcblxuXHRcdH1cblxuXHRcdGlmICggZWxhcHNlZCA9PSAxICkge1xuXG5cdFx0XHRpZiAoIF9yZXBlYXQgPiAwICkge1xuXG5cdFx0XHRcdGlmKCBpc0Zpbml0ZSggX3JlcGVhdCApICkge1xuXHRcdFx0XHRcdF9yZXBlYXQtLTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHJlYXNzaWduIHN0YXJ0aW5nIHZhbHVlcywgcmVzdGFydCBieSBtYWtpbmcgc3RhcnRUaW1lID0gbm93XG5cdFx0XHRcdGZvciggcHJvcGVydHkgaW4gX3ZhbHVlc1N0YXJ0UmVwZWF0ICkge1xuXG5cdFx0XHRcdFx0aWYgKCB0eXBlb2YoIF92YWx1ZXNFbmRbIHByb3BlcnR5IF0gKSA9PT0gXCJzdHJpbmdcIiApIHtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSArIHBhcnNlRmxvYXQoX3ZhbHVlc0VuZFsgcHJvcGVydHkgXSwgMTApO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChfeW95bykge1xuXHRcdFx0XHRcdFx0dmFyIHRtcCA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblx0XHRcdFx0XHRcdF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXSA9IF92YWx1ZXNFbmRbIHByb3BlcnR5IF07XG5cdFx0XHRcdFx0XHRfdmFsdWVzRW5kWyBwcm9wZXJ0eSBdID0gdG1wO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdF92YWx1ZXNTdGFydFsgcHJvcGVydHkgXSA9IF92YWx1ZXNTdGFydFJlcGVhdFsgcHJvcGVydHkgXTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKF95b3lvKSB7XG5cdFx0XHRcdFx0X3JldmVyc2VkID0gIV9yZXZlcnNlZDtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdF9zdGFydFRpbWUgPSB0aW1lICsgX2RlbGF5VGltZTtcblxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRpZiAoIF9vbkNvbXBsZXRlQ2FsbGJhY2sgIT09IG51bGwgKSB7XG5cblx0XHRcdFx0XHRfb25Db21wbGV0ZUNhbGxiYWNrLmNhbGwoIF9vYmplY3QgKTtcblxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Zm9yICggdmFyIGkgPSAwLCBudW1DaGFpbmVkVHdlZW5zID0gX2NoYWluZWRUd2VlbnMubGVuZ3RoOyBpIDwgbnVtQ2hhaW5lZFR3ZWVuczsgaSsrICkge1xuXG5cdFx0XHRcdFx0X2NoYWluZWRUd2VlbnNbIGkgXS5zdGFydCggdGltZSApO1xuXG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cblx0XHRcdH1cblxuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXG5cdH07XG5cbn07XG5cblxuVFdFRU4uRWFzaW5nID0ge1xuXG5cdExpbmVhcjoge1xuXG5cdFx0Tm9uZTogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gaztcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YWRyYXRpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqICggMiAtIGsgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIC0gMC41ICogKCAtLWsgKiAoIGsgLSAyICkgLSAxICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRDdWJpYzoge1xuXG5cdFx0SW46IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgKiBrICogaztcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIC0tayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogaztcblx0XHRcdHJldHVybiAwLjUgKiAoICggayAtPSAyICkgKiBrICogayArIDIgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdFF1YXJ0aWM6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiBrICogayAqIGsgKiBrO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtICggLS1rICogayAqIGsgKiBrICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGs7XG5cdFx0XHRyZXR1cm4gLSAwLjUgKiAoICggayAtPSAyICkgKiBrICogayAqIGsgLSAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRRdWludGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayAqIGsgKiBrICogayAqIGs7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAtLWsgKiBrICogayAqIGsgKiBrICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIGsgKiBrICogayAqIGsgKiBrO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiBrICogayAqIGsgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRTaW51c29pZGFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMSAtIE1hdGguY29zKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc2luKCBrICogTWF0aC5QSSAvIDIgKTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gMC41ICogKCAxIC0gTWF0aC5jb3MoIE1hdGguUEkgKiBrICkgKTtcblxuXHRcdH1cblxuXHR9LFxuXG5cdEV4cG9uZW50aWFsOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHRyZXR1cm4gayA9PT0gMCA/IDAgOiBNYXRoLnBvdyggMTAyNCwgayAtIDEgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIGsgPT09IDEgPyAxIDogMSAtIE1hdGgucG93KCAyLCAtIDEwICogayApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIDAuNSAqIE1hdGgucG93KCAxMDI0LCBrIC0gMSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggLSBNYXRoLnBvdyggMiwgLSAxMCAqICggayAtIDEgKSApICsgMiApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0Q2lyY3VsYXI6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gTWF0aC5zcXJ0KCAxIC0gayAqIGsgKTtcblxuXHRcdH0sXG5cblx0XHRPdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0cmV0dXJuIE1hdGguc3FydCggMSAtICggLS1rICogayApICk7XG5cblx0XHR9LFxuXG5cdFx0SW5PdXQ6IGZ1bmN0aW9uICggayApIHtcblxuXHRcdFx0aWYgKCAoIGsgKj0gMiApIDwgMSkgcmV0dXJuIC0gMC41ICogKCBNYXRoLnNxcnQoIDEgLSBrICogaykgLSAxKTtcblx0XHRcdHJldHVybiAwLjUgKiAoIE1hdGguc3FydCggMSAtICggayAtPSAyKSAqIGspICsgMSk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRFbGFzdGljOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuIC0gKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXG5cdFx0fSxcblxuXHRcdE91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcywgYSA9IDAuMSwgcCA9IDAuNDtcblx0XHRcdGlmICggayA9PT0gMCApIHJldHVybiAwO1xuXHRcdFx0aWYgKCBrID09PSAxICkgcmV0dXJuIDE7XG5cdFx0XHRpZiAoICFhIHx8IGEgPCAxICkgeyBhID0gMTsgcyA9IHAgLyA0OyB9XG5cdFx0XHRlbHNlIHMgPSBwICogTWF0aC5hc2luKCAxIC8gYSApIC8gKCAyICogTWF0aC5QSSApO1xuXHRcdFx0cmV0dXJuICggYSAqIE1hdGgucG93KCAyLCAtIDEwICogaykgKiBNYXRoLnNpbiggKCBrIC0gcyApICogKCAyICogTWF0aC5QSSApIC8gcCApICsgMSApO1xuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzLCBhID0gMC4xLCBwID0gMC40O1xuXHRcdFx0aWYgKCBrID09PSAwICkgcmV0dXJuIDA7XG5cdFx0XHRpZiAoIGsgPT09IDEgKSByZXR1cm4gMTtcblx0XHRcdGlmICggIWEgfHwgYSA8IDEgKSB7IGEgPSAxOyBzID0gcCAvIDQ7IH1cblx0XHRcdGVsc2UgcyA9IHAgKiBNYXRoLmFzaW4oIDEgLyBhICkgLyAoIDIgKiBNYXRoLlBJICk7XG5cdFx0XHRpZiAoICggayAqPSAyICkgPCAxICkgcmV0dXJuIC0gMC41ICogKCBhICogTWF0aC5wb3coIDIsIDEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSApO1xuXHRcdFx0cmV0dXJuIGEgKiBNYXRoLnBvdyggMiwgLTEwICogKCBrIC09IDEgKSApICogTWF0aC5zaW4oICggayAtIHMgKSAqICggMiAqIE1hdGguUEkgKSAvIHAgKSAqIDAuNSArIDE7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCYWNrOiB7XG5cblx0XHRJbjogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTg7XG5cdFx0XHRyZXR1cm4gayAqIGsgKiAoICggcyArIDEgKSAqIGsgLSBzICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHZhciBzID0gMS43MDE1ODtcblx0XHRcdHJldHVybiAtLWsgKiBrICogKCAoIHMgKyAxICkgKiBrICsgcyApICsgMTtcblxuXHRcdH0sXG5cblx0XHRJbk91dDogZnVuY3Rpb24gKCBrICkge1xuXG5cdFx0XHR2YXIgcyA9IDEuNzAxNTggKiAxLjUyNTtcblx0XHRcdGlmICggKCBrICo9IDIgKSA8IDEgKSByZXR1cm4gMC41ICogKCBrICogayAqICggKCBzICsgMSApICogayAtIHMgKSApO1xuXHRcdFx0cmV0dXJuIDAuNSAqICggKCBrIC09IDIgKSAqIGsgKiAoICggcyArIDEgKSAqIGsgKyBzICkgKyAyICk7XG5cblx0XHR9XG5cblx0fSxcblxuXHRCb3VuY2U6IHtcblxuXHRcdEluOiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdHJldHVybiAxIC0gVFdFRU4uRWFzaW5nLkJvdW5jZS5PdXQoIDEgLSBrICk7XG5cblx0XHR9LFxuXG5cdFx0T3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8ICggMSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogayAqIGs7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIgLyAyLjc1ICkgKSB7XG5cblx0XHRcdFx0cmV0dXJuIDcuNTYyNSAqICggayAtPSAoIDEuNSAvIDIuNzUgKSApICogayArIDAuNzU7XG5cblx0XHRcdH0gZWxzZSBpZiAoIGsgPCAoIDIuNSAvIDIuNzUgKSApIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi4yNSAvIDIuNzUgKSApICogayArIDAuOTM3NTtcblxuXHRcdFx0fSBlbHNlIHtcblxuXHRcdFx0XHRyZXR1cm4gNy41NjI1ICogKCBrIC09ICggMi42MjUgLyAyLjc1ICkgKSAqIGsgKyAwLjk4NDM3NTtcblxuXHRcdFx0fVxuXG5cdFx0fSxcblxuXHRcdEluT3V0OiBmdW5jdGlvbiAoIGsgKSB7XG5cblx0XHRcdGlmICggayA8IDAuNSApIHJldHVybiBUV0VFTi5FYXNpbmcuQm91bmNlLkluKCBrICogMiApICogMC41O1xuXHRcdFx0cmV0dXJuIFRXRUVOLkVhc2luZy5Cb3VuY2UuT3V0KCBrICogMiAtIDEgKSAqIDAuNSArIDAuNTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cblRXRUVOLkludGVycG9sYXRpb24gPSB7XG5cblx0TGluZWFyOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuTGluZWFyO1xuXG5cdFx0aWYgKCBrIDwgMCApIHJldHVybiBmbiggdlsgMCBdLCB2WyAxIF0sIGYgKTtcblx0XHRpZiAoIGsgPiAxICkgcmV0dXJuIGZuKCB2WyBtIF0sIHZbIG0gLSAxIF0sIG0gLSBmICk7XG5cblx0XHRyZXR1cm4gZm4oIHZbIGkgXSwgdlsgaSArIDEgPiBtID8gbSA6IGkgKyAxIF0sIGYgLSBpICk7XG5cblx0fSxcblxuXHRCZXppZXI6IGZ1bmN0aW9uICggdiwgayApIHtcblxuXHRcdHZhciBiID0gMCwgbiA9IHYubGVuZ3RoIC0gMSwgcHcgPSBNYXRoLnBvdywgYm4gPSBUV0VFTi5JbnRlcnBvbGF0aW9uLlV0aWxzLkJlcm5zdGVpbiwgaTtcblxuXHRcdGZvciAoIGkgPSAwOyBpIDw9IG47IGkrKyApIHtcblx0XHRcdGIgKz0gcHcoIDEgLSBrLCBuIC0gaSApICogcHcoIGssIGkgKSAqIHZbIGkgXSAqIGJuKCBuLCBpICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGI7XG5cblx0fSxcblxuXHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHYsIGsgKSB7XG5cblx0XHR2YXIgbSA9IHYubGVuZ3RoIC0gMSwgZiA9IG0gKiBrLCBpID0gTWF0aC5mbG9vciggZiApLCBmbiA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuQ2F0bXVsbFJvbTtcblxuXHRcdGlmICggdlsgMCBdID09PSB2WyBtIF0gKSB7XG5cblx0XHRcdGlmICggayA8IDAgKSBpID0gTWF0aC5mbG9vciggZiA9IG0gKiAoIDEgKyBrICkgKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyAoIGkgLSAxICsgbSApICUgbSBdLCB2WyBpIF0sIHZbICggaSArIDEgKSAlIG0gXSwgdlsgKCBpICsgMiApICUgbSBdLCBmIC0gaSApO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0aWYgKCBrIDwgMCApIHJldHVybiB2WyAwIF0gLSAoIGZuKCB2WyAwIF0sIHZbIDAgXSwgdlsgMSBdLCB2WyAxIF0sIC1mICkgLSB2WyAwIF0gKTtcblx0XHRcdGlmICggayA+IDEgKSByZXR1cm4gdlsgbSBdIC0gKCBmbiggdlsgbSBdLCB2WyBtIF0sIHZbIG0gLSAxIF0sIHZbIG0gLSAxIF0sIGYgLSBtICkgLSB2WyBtIF0gKTtcblxuXHRcdFx0cmV0dXJuIGZuKCB2WyBpID8gaSAtIDEgOiAwIF0sIHZbIGkgXSwgdlsgbSA8IGkgKyAxID8gbSA6IGkgKyAxIF0sIHZbIG0gPCBpICsgMiA/IG0gOiBpICsgMiBdLCBmIC0gaSApO1xuXG5cdFx0fVxuXG5cdH0sXG5cblx0VXRpbHM6IHtcblxuXHRcdExpbmVhcjogZnVuY3Rpb24gKCBwMCwgcDEsIHQgKSB7XG5cblx0XHRcdHJldHVybiAoIHAxIC0gcDAgKSAqIHQgKyBwMDtcblxuXHRcdH0sXG5cblx0XHRCZXJuc3RlaW46IGZ1bmN0aW9uICggbiAsIGkgKSB7XG5cblx0XHRcdHZhciBmYyA9IFRXRUVOLkludGVycG9sYXRpb24uVXRpbHMuRmFjdG9yaWFsO1xuXHRcdFx0cmV0dXJuIGZjKCBuICkgLyBmYyggaSApIC8gZmMoIG4gLSBpICk7XG5cblx0XHR9LFxuXG5cdFx0RmFjdG9yaWFsOiAoIGZ1bmN0aW9uICgpIHtcblxuXHRcdFx0dmFyIGEgPSBbIDEgXTtcblxuXHRcdFx0cmV0dXJuIGZ1bmN0aW9uICggbiApIHtcblxuXHRcdFx0XHR2YXIgcyA9IDEsIGk7XG5cdFx0XHRcdGlmICggYVsgbiBdICkgcmV0dXJuIGFbIG4gXTtcblx0XHRcdFx0Zm9yICggaSA9IG47IGkgPiAxOyBpLS0gKSBzICo9IGk7XG5cdFx0XHRcdHJldHVybiBhWyBuIF0gPSBzO1xuXG5cdFx0XHR9O1xuXG5cdFx0fSApKCksXG5cblx0XHRDYXRtdWxsUm9tOiBmdW5jdGlvbiAoIHAwLCBwMSwgcDIsIHAzLCB0ICkge1xuXG5cdFx0XHR2YXIgdjAgPSAoIHAyIC0gcDAgKSAqIDAuNSwgdjEgPSAoIHAzIC0gcDEgKSAqIDAuNSwgdDIgPSB0ICogdCwgdDMgPSB0ICogdDI7XG5cdFx0XHRyZXR1cm4gKCAyICogcDEgLSAyICogcDIgKyB2MCArIHYxICkgKiB0MyArICggLSAzICogcDEgKyAzICogcDIgLSAyICogdjAgLSB2MSApICogdDIgKyB2MCAqIHQgKyBwMTtcblxuXHRcdH1cblxuXHR9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzPVRXRUVOOyIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhbk11dGF0aW9uT2JzZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgaWYgKGNhbk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdmFyIGhpZGRlbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZUxpc3QgPSBxdWV1ZS5zbGljZSgpO1xuICAgICAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHF1ZXVlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShoaWRkZW5EaXYsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIGlmICghcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgneWVzJywgJ25vJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBUV0VFTiA9IHJlcXVpcmUoJ3R3ZWVuLmpzJyk7XG52YXIgU2NlbmUgPSByZXF1aXJlKCcuLi9lbmdpbmUvc2NlbmUnKTtcblxuZnVuY3Rpb24gYmFja2dyb3VuZFNjZW5lIChnYW1lKSB7XG5cdHZhciBzY2VuZSA9IG5ldyBTY2VuZShnYW1lKTtcblx0dmFyIHNjcm9sbFNwZWVkID0gMC41O1xuXHR2YXIgYmdQYXRoID0gJ2Fzc2V0cy80OTU0NDY0Mzc4Xzk5MGEzZTU0YTFfYi5qcGcnO1xuXHR2YXIgdGlsZTtcblxuXHRzY2VuZS5hY3RpdmUgPSBmYWxzZTtcbiAgICBzY2VuZS5zdGFnZS52aXNpYmxlID0gZmFsc2U7XG4gICAgZ2FtZS5vbigncHJlbG9hZCcsIGZ1bmN0aW9uKGFzc2V0cykge1xuICAgIFx0YXNzZXRzLnB1c2goYmdQYXRoKTtcbiAgICB9KTtcbiAgICBnYW1lLm9uKCdsb2FkJywgZnVuY3Rpb24oKSB7XG4gICAgXHR2YXIgc3ByaXRlID0gUElYSS5TcHJpdGUuZnJvbUltYWdlKGJnUGF0aCk7XG4gICAgXHRzcHJpdGUuc2NhbGUgPSB7IHg6IDAuNjUsIHk6IDAuNjUgfTtcbiAgICBcdHNjZW5lLnN0YWdlLmFkZENoaWxkKHNwcml0ZSk7XG4gICAgXHR2YXIgdGV4dHVyZSA9IG5ldyBQSVhJLkdyYXBoaWNzKCk7XG5cdFx0dGV4dHVyZS5iZWdpbkZpbGwoMHg0NDAwMDIpO1xuICAgICAgICB0ZXh0dXJlLmRyYXdDaXJjbGUoMCwgMCwgZ2FtZS5yZW5kZXJlci53aWR0aCk7XG4gICAgICAgIHRleHR1cmUuZW5kRmlsbCgpO1xuICAgIFx0dGlsZSA9IG5ldyBQSVhJLlRpbGluZ1Nwcml0ZSh0ZXh0dXJlLmdlbmVyYXRlVGV4dHVyZSgpLCBnYW1lLnJlbmRlcmVyLndpZHRoLCBnYW1lLnJlbmRlcmVyLmhlaWdodCk7XG4gICAgXHR0aWxlLnBvc2l0aW9uLnkgPSB0aWxlLmhlaWdodCAvIDI7XG4gICAgXHRzY2VuZS5zdGFnZS5hZGRDaGlsZCh0aWxlKTtcbiAgICBcdHRpbGUudHdlZW4gPSBuZXcgVFdFRU4uVHdlZW4odGlsZS5wb3NpdGlvbik7XG4gICAgfSk7XG5cdHNjZW5lLm9uKCdhY3RpdmUnLCBmdW5jdGlvbiAoKSB7XG5cdCAgICBzY2VuZS5zdGFnZS52aXNpYmxlID0gdHJ1ZTtcblx0fSk7XG5cdHNjZW5lLm9uKCd1cGRhdGUnLCBmdW5jdGlvbigpIHtcblx0XHR0aWxlLnRpbGVQb3NpdGlvbi54IC09IHNjcm9sbFNwZWVkO1xuXHRcdGlmIChnYW1lLmtleWJvYXJkLnVwKSB7XG5cdFx0XHR0aWxlLnBvc2l0aW9uLnkgKz0gMC4yO1xuXHRcdFx0dGhpcy50d2VlblRvID0gJys0Jztcblx0XHR9XG5cdFx0aWYgKGdhbWUua2V5Ym9hcmQuZG93biAmJiB0aWxlLnBvc2l0aW9uLnkgPiB0aWxlLmhlaWdodCAvIDIpIHtcblx0XHRcdHRpbGUucG9zaXRpb24ueSAtPSAwLjI7XG5cdFx0XHR0aGlzLnR3ZWVuVG8gPSAnLTQnO1xuXHRcdH1cblx0XHRlbHNlIGlmICh0aGlzLnR3ZWVuVG8pIHtcblx0XHRcdHRpbGUudHdlZW5cblx0XHRcdFx0LnRvKHsgeTogdGhpcy50d2VlblRvIH0sIDYwMClcblx0XHRcdFx0LmVhc2luZyhUV0VFTi5FYXNpbmcuUXVhZHJhdGljLk91dClcblx0XHRcdFx0LnN0YXJ0KCk7XG5cdFx0XHR0aGlzLnR3ZWVuVG8gPSBudWxsO1xuXHRcdFx0dGhpcy5zaG91bGRUd2VlbiA9IHRydWU7XG5cdFx0fVxuXHR9KTtcblx0c2NlbmUub24oJ3JlbmRlcicsIGZ1bmN0aW9uKHRpbWUpIHtcblx0XHRpZiAodGhpcy5zaG91bGRUd2Vlbikge1xuXHRcdFx0dGhpcy5zaG91bGRUd2VlbiA9IHRpbGUudHdlZW4udXBkYXRlKHRpbWUpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBzY2VuZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBiYWNrZ3JvdW5kU2NlbmU7XG4iLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBIb3dsID0gcmVxdWlyZSgnaG93bGVyJykuSG93bDtcbnZhciBUV0VFTiA9IHJlcXVpcmUoJ3R3ZWVuLmpzJyk7XG52YXIgY3VycnkgPSByZXF1aXJlKCdjdXJyeScpO1xudmFyIHJhbmRvbSA9IHJlcXVpcmUoJ3JhbmRvbS1leHQnKTtcbnZhciBTY2VuZSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9zY2VuZScpO1xudmFyIFBsYXllciA9IHJlcXVpcmUoJy4uL2VudGl0aWVzL3BsYXllcicpO1xudmFyIFJvY2sgPSByZXF1aXJlKCcuLi9lbnRpdGllcy9yb2NrJyk7XG52YXIgRHVzdCA9IHJlcXVpcmUoJy4uL2VudGl0aWVzL2R1c3QnKTtcbnZhciB1dGlscyA9IHJlcXVpcmUoJy4uL2VuZ2luZS91dGlscycpO1xuXG5mdW5jdGlvbiBwbGF5U2NlbmUgKGdhbWUpIHtcblx0dmFyIHNjZW5lID0gbmV3IFNjZW5lKGdhbWUpO1xuXHR2YXIgYmdNdXNpYyA9IG5ldyBIb3dsKHsgdXJsczogWydhc3NldHMvZ3VyZG9uYXJrXy1fUmVsaWVmLm1wMyddLCB2b2x1bWU6IDAuNSB9KTtcblx0dmFyIHN0YWdlVHdlZW47XG5cdHZhciByb2NrcyA9IFtdO1xuXHR2YXIgZHVzdCA9IFtdO1xuXHR2YXIgcGxheWVyO1xuXHR2YXIgZmxhc2ggPSBuZXcgUElYSS5HcmFwaGljcygpO1xuXG5cdHZhciBwbGF5ZXJSb2NrQ29sbGlkZSA9IGZ1bmN0aW9uKHRpbWUsIHBsYXllciwgcm9jaykge1xuXHRcdHJvY2sucmVtb3ZlRnJvbVNjZW5lKCk7XG5cdFx0cGxheWVyLmhpdCgpO1xuXHRcdGlmIChzY2VuZS5zdGFnZS5hbHBoYSA8IDAuOTQpIHtcblx0XHRcdHN0YWdlVHdlZW4udG8oeyBhbHBoYTogJyswLjA2JyB9LCAyMDApLnN0YXJ0KCk7XG5cdFx0fVxuXHRcdGZsYXNoLnZpc2libGUgPSB0cnVlO1xuXHRcdGZsYXNoLmxhc3RWaXNpYmxlID0gdGltZTtcblx0fTtcblxuXHR2YXIgcGxheWVyRHVzdENvbGxpZGUgPSBmdW5jdGlvbih0aW1lLCBwbGF5ZXIsIGR1c3QpIHtcblx0XHRkdXN0LnJlbW92ZUZyb21TY2VuZSgpO1xuXHRcdHN0YWdlVHdlZW4udG8oeyBhbHBoYTogJy0wLjAzJyB9LCAyMDApLnN0YXJ0KCk7XG5cdFx0cGxheWVyLnNoaW5lR2V0KCk7XG5cdH07XG5cblx0Zmxhc2guYmVnaW5GaWxsKDB4ZmZmZmZmKTtcblx0Zmxhc2guZHJhd1JlY3QoMCwgMCwgZ2FtZS5yZW5kZXJlci53aWR0aCwgZ2FtZS5yZW5kZXJlci5oZWlnaHQpO1xuXHRmbGFzaC5lbmRGaWxsKCk7XG5cdGZsYXNoLnZpc2libGUgPSBmYWxzZTtcblx0c2NlbmUuc3RhZ2UuYWRkQ2hpbGQoZmxhc2gpO1xuXHRQbGF5ZXIucHJlbG9hZChnYW1lKTtcblx0Z2FtZS5vbignbG9hZCcsIGZ1bmN0aW9uKCkge1xuXHRcdHNjZW5lLmFjdGl2ZSA9IGZhbHNlO1xuXHRcdHNjZW5lLnN0YWdlLnZpc2libGUgPSBmYWxzZTtcblx0XHRwbGF5ZXIgPSBuZXcgUGxheWVyKGdhbWUsIHtcblx0XHRcdHg6IGdhbWUucmVuZGVyZXIud2lkdGggLyA2LFxuXHRcdFx0eTogZ2FtZS5yZW5kZXJlci5oZWlnaHQgLyAyXG5cdFx0fSk7XG5cdFx0cGxheWVyLmFkZFRvU2NlbmUoc2NlbmUpO1xuXHR9KTtcblx0c2NlbmUub24oJ2FjdGl2ZScsIGZ1bmN0aW9uICgpIHtcblx0XHRzY2VuZS5zdGFnZS52aXNpYmxlID0gdHJ1ZTtcblx0XHRzY2VuZS5zdGFnZS5hbHBoYSA9IDE7XG5cdFx0cGxheWVyLnJlc2V0KCk7XG5cdFx0cm9ja3MuZm9yRWFjaChyb2NrID0+IHJvY2sucmVtb3ZlRnJvbVNjZW5lKCkpO1xuXHRcdHJvY2tzID0gW107XG5cdFx0ZHVzdC5mb3JFYWNoKGQgPT4gZC5yZW1vdmVGcm9tU2NlbmUoKSk7XG5cdFx0ZHVzdCA9IFtdO1xuXHRcdGJnTXVzaWMuc3RvcCgpLnBsYXkoKTtcblx0XHRzdGFnZVR3ZWVuID0gbmV3IFRXRUVOLlR3ZWVuKHNjZW5lLnN0YWdlKTtcblx0fSk7XG5cdHNjZW5lLm9uKCd1cGRhdGUnLCBmdW5jdGlvbih0aW1lKXtcblx0XHRpZiAoTWF0aC5yb3VuZCh0aW1lKSAlIDEwNCA9PT0gMCkge1xuXHRcdFx0bGV0IHJvY2sgPSBuZXcgUm9jayhnYW1lKTtcblx0XHRcdHJvY2suYWRkVG9TY2VuZShzY2VuZSk7XG5cdFx0XHRyb2Nrcy5wdXNoKHJvY2spO1xuXHRcdH1cblx0XHRpZiAoTWF0aC5yb3VuZCh0aW1lKSAlIDUyID09PSAwKSB7XG5cdFx0XHRsZXQgZCA9IG5ldyBEdXN0KGdhbWUpO1xuXHRcdFx0ZC5hZGRUb1NjZW5lKHNjZW5lKTtcblx0XHRcdGR1c3QucHVzaChkKTtcblx0XHR9XG5cdFx0cm9ja3MgPSByb2Nrcy5maWx0ZXIocm9jayA9PiAhcm9jay5yZW1vdmVkKTtcblx0XHRkdXN0ID0gZHVzdC5maWx0ZXIoZHVzdCA9PiAhZHVzdC5yZW1vdmVkKTtcblx0XHR1dGlscy5jb2xsaWRlKHBsYXllciwgZHVzdCwgY3VycnkocGxheWVyRHVzdENvbGxpZGUpKHRpbWUpKTtcblx0XHR1dGlscy5jb2xsaWRlKHBsYXllciwgcm9ja3MsIGN1cnJ5KHBsYXllclJvY2tDb2xsaWRlKSh0aW1lKSk7XG5cdFx0aWYgKHNjZW5lLnN0YWdlLmFscGhhIDwgMCkge1xuXHRcdFx0c2NlbmUuZW1pdCgnd2luJyk7XG5cdFx0fVxuXHRcdGlmICh0aW1lIC0gZmxhc2gubGFzdFZpc2libGUgPiAzMCkge1xuXHRcdFx0Zmxhc2gudmlzaWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0XHRpZiAodGltZSAtIGZsYXNoLmxhc3RWaXNpYmxlID4gMTIwKSB7XG5cdFx0XHRzY2VuZS5zdGFnZS5wb3NpdGlvbiA9IHsgeDogMCwgeTogMH07XG5cdFx0fVxuXHRcdGVsc2UgaWYgKGZsYXNoLmxhc3RWaXNpYmxlKSB7XG5cdFx0XHRzY2VuZS5zdGFnZS5wb3NpdGlvbiA9IHtcblx0XHRcdFx0eDogcmFuZG9tLmludGVnZXIoNSwtNSksXG5cdFx0XHRcdHk6IHJhbmRvbS5pbnRlZ2VyKDUsLTUpXG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG5cdHNjZW5lLm9uKCdyZW5kZXInLCBmdW5jdGlvbih0aW1lKSB7XG5cdFx0aWYgKHN0YWdlVHdlZW4pIHtcblx0XHRcdHN0YWdlVHdlZW4udXBkYXRlKHRpbWUpO1xuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIHNjZW5lO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHBsYXlTY2VuZTsiLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBrYiA9IHJlcXVpcmUoJ2tiLWNvbnRyb2xzJyk7XG52YXIgU2NlbmUgPSByZXF1aXJlKCcuLi9lbmdpbmUvc2NlbmUnKTtcblxuZnVuY3Rpb24gc3RhcnRTY2VuZSAoZ2FtZSkge1xuICAgIHZhciBzY2VuZSA9IG5ldyBTY2VuZShnYW1lKTtcbiAgICB2YXIgdGV4dCA9IG5ldyBQSVhJLlRleHQoJ1ByZXNzIHNwYWNlIHRvIHN0YXJ0Jywge1xuICAgICAgICBmaWxsOiAnd2hpdGUnXG4gICAgfSk7XG4gICAgc2NlbmUuc3RhZ2UuYWRkQ2hpbGQodGV4dCk7XG4gICAgc2NlbmUub24oJ3VwZGF0ZScsIGZ1bmN0aW9uIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHNjZW5lLmFjdGl2ZSAmJiBnYW1lLmtleWJvYXJkLnNwYWNlKSB7XG4gICAgICAgICAgICBzY2VuZS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pXG4gICAgLm9uKCdpbmFjdGl2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2NlbmUuc3RhZ2UudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHNjZW5lLmFjdGl2ZSA9IHRydWU7XG4gICAgcmV0dXJuIHNjZW5lO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHN0YXJ0U2NlbmU7XG4iLCJ2YXIgUElYSSA9IHJlcXVpcmUoJ3BpeGkuanMnKTtcbnZhciBTY2VuZSA9IHJlcXVpcmUoJy4uL2VuZ2luZS9zY2VuZScpO1xuXG5mdW5jdGlvbiB3aW5TY2VuZSAoZ2FtZSkge1xuICAgIHZhciBzY2VuZSA9IG5ldyBTY2VuZShnYW1lKTtcbiAgICB2YXIgdGV4dCA9IG5ldyBQSVhJLlRleHQoJ1lvdSBXaW4hISEhIScsIHtcbiAgICAgICAgZmlsbDogJ3doaXRlJ1xuICAgIH0pO1xuICAgIHNjZW5lLnN0YWdlLmFkZENoaWxkKHRleHQpO1xuICAgIHNjZW5lLm9uKCd1cGRhdGUnLCBmdW5jdGlvbiB1cGRhdGUoKSB7XG4gICAgICAgIGlmIChzY2VuZS5hY3RpdmUgJiYgZ2FtZS5rZXlib2FyZC5zcGFjZSkge1xuICAgICAgICAgICAgc2NlbmUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KVxuICAgIC5vbignYWN0aXZlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHNjZW5lLnN0YWdlLnZpc2libGUgPSB0cnVlO1xuICAgIH0pXG4gICAgLm9uKCdpbmFjdGl2ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2NlbmUuc3RhZ2UudmlzaWJsZSA9IGZhbHNlO1xuICAgIH0pO1xuICAgIHNjZW5lLmFjdGl2ZSA9IGZhbHNlO1xuICAgIHNjZW5lLnN0YWdlLnZpc2libGUgPSBmYWxzZTtcbiAgICByZXR1cm4gc2NlbmU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2luU2NlbmU7XG4iXX0=

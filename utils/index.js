var PIXI = require('pixi.js');

exports.frameRange = function frameRange(start, end, prefix) {
    var frames = [];
    for (var i = start; i <= end; i++) {
        frames.push(new PIXI.Texture.fromFrame(prefix + i));
    }
    return frames;
};

exports.outOfWorldBounds = function outOfWorldBounds(object, bounds) {
    return (object.x < 0 || object.y < 0 || object.x + object.width > bounds.width || object.y + object.height > bounds.height);
};

exports.setBoundingBox = function(object, opts) {
    opts = opts || {};
    var box = new PIXI.Rectangle(
        opts.x || 0,
        opts.y || 0,
        opts.width || object.width,
        opts.height || object.height
    );
    object.body = box;
};

exports.showBoundingBox = function showBoundingBox(object) {
    var box = new PIXI.Graphics();
    box.beginFill(0xff0000);
    box.alpha = 0.5;
    if (!object.body) {
        box.drawRect(0, 0, object.width, object.height);
    }
    else {
        box.drawRect(object.body.x, object.body.y, object.body.width, object.body.height);
    }
    object.addChild(box);
};

exports.ySort = function ySort(children) {
    var getBottom = function(obj) {
        if (obj.body) {
            return obj.body.y + obj.y + obj.body.height;
        }
        return obj.y + obj.height;
    };
    return children.sort(function(a, b) {
        return getBottom(a) > getBottom(b); 
    });
};

exports.getBounds = function(entity) {
    var bounds = {
        x: entity.x,
        y: entity.y,
        width: entity.width,
        height: entity.height
    };
    if (entity.body) {
        bounds.x += entity.body.x;
        bounds.y += entity.body.y;
        bounds.width = entity.body.width;
        bounds.height = entity.body.height;
    }
    return bounds;
}
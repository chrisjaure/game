var PIXI = require('pixi.js');

exports.frameRange = function(start, end, prefix) {
    var frames = [];
    for (var i = start; i <= end; i++) {
        frames.push(new PIXI.Texture.fromFrame((prefix || null) + i));
    }
    return frames;
};

exports.outOfWorldBounds = function(objectBounds, bounds) {
    // console.log(objectBounds.x, objectBounds.y, objectBounds.x + objectBounds.width, objectBounds.y + objectBounds.height, bounds.width, bounds.height);
    return (objectBounds.x < 0 || objectBounds.y < 0 || objectBounds.x + objectBounds.width > bounds.width || objectBounds.y + objectBounds.height > bounds.height);
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

exports.showBoundingBox = function(object, color) {
    var bounds = object.getBounds();
    if (!object.stage) {
        return;
    }
    if (!object.body) {
        let box = new PIXI.Graphics();
        box.alpha = 0.3;
        object.stage.addChild(box);
        object.body = box;
    }
    object.body.clear();
    object.body.x = bounds.x;
    object.body.y = bounds.y;
    object.body.lineStyle(2, color || 0x00ff00, 1);
    object.body.drawRect(0, 0, bounds.width, bounds.height);
};

exports.ySort = function(children) {
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
};

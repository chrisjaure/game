var PIXI = require('pixi.js');
var boxCollide = require('box-collide');

exports.collide = function(collection1, collection2, cb) {
    if (!Array.isArray(collection1)) {
        collection1 = [collection1];
    }
    if (!Array.isArray(collection2)) {
        collection2 = [collection2];
    }
    collection1.forEach(item1 => {
        collection2.forEach(item2 => {
            if (boxCollide(item1.getBoundingBox(), item2.getBoundingBox())) {
                cb(item1, item2);
            }
        });
    });
};

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

exports.showBoundingBox = function(object, color) {
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
    object.body.x = object.x;
    object.body.y = object.y;
    object.body.lineStyle(2, color || 0x00ff00, 1);
    object.body.drawRect(0, 0, object.width, object.height);
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
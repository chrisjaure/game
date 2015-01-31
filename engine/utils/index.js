var PIXI = require('pixi.js');
var boxCollide = require('box-collide');

var circleCollide = function(circle1, circle2) {
    var dx = (circle1.x + circle1.radius) - (circle2.x + circle2.radius);
    var dy = (circle1.y + circle1.radius) - (circle2.y + circle2.radius);
    var distance = Math.sqrt(dx * dx + dy * dy);
    
    return (distance < circle1.radius + circle2.radius);
};

exports.collide = function(collection1, collection2, cb) {
    if (!Array.isArray(collection1)) {
        collection1 = [collection1];
    }
    if (!Array.isArray(collection2)) {
        collection2 = [collection2];
    }
    collection1.forEach(item1 => {
        let item1Bounds = item1.getBoundingBox();
        collection2.forEach(item2 => {
            let item2Bounds = item2.getBoundingBox();
            if (item1Bounds.radius !== undefined && item2Bounds.radius !== undefined) {
                if (circleCollide(item1Bounds, item2Bounds)) {
                    cb(item1, item2);
                }
            }
            else if (boxCollide(item1.getBoundingBox(), item2.getBoundingBox())) {
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

exports.showBoundingBox = function(object, stage) {
    if (!stage) {
        return;
    }
    var bounds = object.getBoundingBox();
    if (!object.body) {
        let box = new PIXI.Graphics();
        box.alpha = 0.3;
        stage.addChild(box);
        object.body = box;
    }
    object.body.clear();
    object.body.x = bounds.x;
    object.body.y = bounds.y;
    object.body.lineStyle(2, 0x00ff00, 1);
    if (bounds.radius !== undefined) {
        object.body.drawCircle(bounds.radius, bounds.radius, bounds.radius);
    }
    else {
        object.body.drawRect(0, 0, bounds.width, bounds.height);
    }
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
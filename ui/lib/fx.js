var classdef = require('classdef');

var _requestRepaint = window.requestAnimationFrame ||
                      window.webkitRequestAnimationFrame ||
                      window.mozRequestAnimationFrame ||
                      window.msRequestAnimationFrame ||
                      _requestAnimationFallback;
_requestRepaint = _requestRepaint.bind(window);

function _requestAnimationFallback(callback) {
  setTimeout(callback, 16);
}

module.exports.requestAnimationFrame = _requestRepaint;

var _repaintScheduled = false;
function _scheduleRepaint() {
  if (!_repaintScheduled) {
    _requestRepaint(_tick);
    _repaintScheduled = true;
  }
}

var _currentTweenId = 0;
var _tweens = {};
var _ticking = false;
var _pendingValueTweens = [];

function _nextTweenId() {
 _currentTweenId++;
 return _currentTweenId;
}

function _tick() {
  var a;

  _ticking = true;
  _repaintScheduled = false;

  var tweensRemaining = false;
  var expiredTweens = [];

  for (var id in _tweens) {
    var tween = _tweens[id];
    if (!tween.running) {
      expiredTweens.push(tween);
      continue;
    }

    var t = Math.min(1, (Date.now() - tween.startTime) / tween.duration);
    if (t < 1) {
      tweensRemaining = true;
      var out = {};
      for (var v in tween.starts) {
        out[v] = tween.starts[v] + tween.ease(t) * tween.deltas[v];
      }
      tween.onTick && tween.onTick(tween.isSingleton ? out.__v : out);
    } else {
      expiredTweens.push(tween);
      tween.onTick && tween.onTick(tween.isSingleton ? tween.stops.__v : tween.stops);
      tween.onFinish && tween.onFinish();
    }
  }

  for (a = 0; a < expiredTweens.length; a++) {
    delete _tweens[expiredTweens[a].id];
  }

  for (a = 0; a < _pendingValueTweens.length; a++) {
    var newTween = _pendingValueTweens[a];
    _tweens[newTween.id] = newTween;
    tweensRemaining = true;
  }
  _pendingValueTweens = [];

  if (tweensRemaining) {
    _scheduleRepaint();
  }

  _ticking = false;
}

var ValueTween = classdef({
  constructor: function(id, startTime, starts, deltas, stops, duration, ease, onTick, onFinish,
                        isSingleton) {
    this.id = id;
    this.startTime = startTime;
    this.starts = starts;
    this.deltas = deltas;
    this.stops = stops;
    this.duration = duration;
    this.ease = ease;
    this.onTick = onTick;
    this.onFinish = onFinish;
    this.isSingleton = isSingleton;

    this.running = true;
  },

  stop: function() {
    this.running = false;
  }
});

module.exports.tweenValues = function(start, stop, duration, ease, onTick, onFinish) {
  var isSingleton = false;
  if (typeof start != 'object') {
    start = {__v: start};
    stop = {__v: stop};
    isSingleton = true;
  }

  var valStart = {};
  var valDeltas = {};
  for (var v in start) {
    if (typeof start[v] != 'number' || typeof stop[v] != 'number') {
      continue;
    }
    valStart[v] = start[v];
    valDeltas[v] = stop[v] - start[v];
  }

  ease = ease || module.exports.linear;

  var vt = new ValueTween(_nextTweenId(), Date.now(), valStart, valDeltas, stop, duration, ease,
                          onTick, onFinish, isSingleton);

  if (_ticking) {
    _pendingValueTweens.push(vt);
  } else {
    _tweens[vt.id] = vt;
    _scheduleRepaint();
  }

  return vt;
};


module.exports.linear = function(t) {
  return t;
};

module.exports.cubic = {
  easeIn: function(t) {
    return t * t * t;
  },

  easeOut: function(t) {
    return 1 - (t = 1 - t) * t * t;
  },

  easeInOut: function(t) {
    t *= 2;
    if (t < 1) {
      return 0.5 * t * t * t;
    } else {
      t = 2 - t;
      return 0.5 + 0.5 * (1 - t * t * t);
    }
  }
};

module.exports.quintic = {
  easeIn: function(t) {
    return t * t * t * t * t;
  },

  easeOut: function(t) {
    return 1 - (t = 1 - t) * t * t * t * t;
  },

  easeInOut: function(t) {
    t *= 2;
    if (t < 1) {
      return 0.5 * t * t * t * t * t;
    } else {
      t = 2 - t;
      return 0.5 + 0.5 * (1 - t * t * t * t * t);
    }
  }
};
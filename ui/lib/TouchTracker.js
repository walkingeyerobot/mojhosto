var classdef = require('classdef');

var TouchTracker = module.exports = classdef({
  constructor: function(smoothingDepth, smoothingStrategy) {
    this._depth = smoothingDepth || 6;
    this._strat = smoothingStrategy || 'avg';
    this._smoothingFunc = _smoothingFuncs[smoothingStrategy] || _avg;
    this._points = null;
    this._nextSlot = 0;

    this.clear();
  },

  clear: function() {
    this._points = new Array(this._depth);
  },

  add: function(speed) {
    this._points[this._nextSlot] = speed;
    this._nextSlot = (this._nextSlot + 1) % this._depth;
  },

  smooth: function() {
    return this._smoothingFunc(this._points);
  }
});

var _smoothingFuncs = {
  'avg': _avg,
  'max': _max
};

function _avg(points) {
  var p;
  var sum = 0;
  var count = 0;
  for (var a = 0; a < points.length; a++) {
    if ((p = points[a]) != null) {
      sum += p;
      count++;
    }
  }
  if (count === 0) {
    return 0;
  } else {
    return sum / count;
  }
}

function _max(points) {

}
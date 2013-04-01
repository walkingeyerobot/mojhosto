var classdef = require('classdef');

var templates = require('./templates'),
    taplistener = require('./taplistener');


var _leftBar, _rightBar;

exports.init = function() {

}

exports.attachTo = function(target) {
  _leftBar = new LifeBar('left');
  _rightBar = new LifeBar('right');

  _leftBar.$el.appendTo(target);
}

exports.resetLifeTotals = function(maxLife) {

}

var LifeBar = classdef({
  constructor: function(side) {
    this._side = side;
    this._maxLife = 20;
    this._life = this._maxLife;

    this._touchStartY = 0;
    this._touchStartLife = 0;
    this._touchStartPerc = 0;
    this._touchCurrentPerc = 0;
    this._columnHeight = 500;

    this.$el = templates.build('lib/LifeBar.html');
    this.el = this.$el[0];

    this._plusOne = this.$el.find('.lb-plusOne')[0];
    this._plusFive = this.$el.find('.lb-plusFive')[0];
    this._minusOne = this.$el.find('.lb-minusOne')[0];
    this._minusFive = this.$el.find('.lb-minusFive')[0];

    this._badge = this.$el.find('.lb-badge')[0];
    this._healthBar = this.$el.find('.lb-health')[0];

    taplistener.listen(this._plusOne, onDeltaDown, onDeltaUp,
        this._onDeltaButtonTap.bind(this, 1), this);
    taplistener.listen(this._plusFive, onDeltaDown, onDeltaUp,
        this._onDeltaButtonTap.bind(this, 5), this);
    taplistener.listen(this._minusOne, onDeltaDown, onDeltaUp,
        this._onDeltaButtonTap.bind(this, -1), this);
    taplistener.listen(this._minusFive, onDeltaDown, onDeltaUp,
        this._onDeltaButtonTap.bind(this, -5), this);

    this._badge.addEventListener('touchstart',
        this._onBadgeTouchStart.bind(this), false);
    this._badge.addEventListener('touchmove',
        this._onBadgeTouchMove.bind(this), false);
    this._badge.addEventListener('touchend',
        this._onBadgeTouchEnd.bind(this), false);

    this._setLfe(this._life);
  },

  _onDeltaButtonTap: function(delta, el) {
    this._setLfe(this._life + delta);
  },

  _setLfe: function(val) {
    this._life = val;

    var perc = Math.max(0, Math.min(1, this._life / this._maxLife));

    this._healthBar.style.webkitTransitionDuration = '100ms';
    this._healthBar.style.height = perc * 100 + '%';

    this._badge.style.webkitTransitionDuration = '100ms';
    this._badge.style.webkitTransform = 'translate3d(0,' +
      (1 - perc) * this._columnHeight + 'px,0)';
    this._badge.innerText = this._life;
  },

  _onBadgeTouchStart: function(e) {
    if (e.touches.length != 1) {
      return;
    }
    e.preventDefault();

    this._touchStartY = e.touches[0].pageY;
    this._touchStartLife = this._life;
    this._touchStartPerc = Math.max(0, Math.min(1, this._life / this._maxLife));
  },

  _onBadgeTouchMove: function(e) {
    e.preventDefault();

    var currentPerc = Math.max(0, Math.min(1, this._touchStartPerc -
      (e.touches[0].pageY - this._touchStartY) / this._columnHeight));

    this._healthBar.style.webkitTransitionDuration = '0s';
    this._healthBar.style.height = currentPerc * 100 + '%';

    this._badge.style.webkitTransitionDuration = '0s';
    this._badge.style.webkitTransform = 'translate3d(0,' +
      (1 - currentPerc) * this._columnHeight + 'px,0)';

    this._touchCurrentPerc = currentPerc;
    this._life = Math.round(this._maxLife * currentPerc);
    this._badge.innerText = this._life;
  },

  _onBadgeTouchEnd: function(e) {
    this._setLfe(Math.round(this._maxLife * this._touchCurrentPerc));
  }
});

function onDeltaDown(el) {
  el.style.backgroundColor = '#666';
}

function onDeltaUp(el) {
  el.style.backgroundColor = '';
}
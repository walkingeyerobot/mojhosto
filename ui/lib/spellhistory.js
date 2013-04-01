var templates = require('./templates'),
    fx = require('./fx'),
    cardformatter = require('./cardformatter');

var _cards = [];

var _$el, _el, _cnt;

var _currentPos = 0;

var _tween = null;

exports.init = function() {
  _$el = templates.build('lib/spellhistory.html');
  _el = _$el[0];
  exports.$el = _$el;
  exports.el = _el;

  _cnt = _$el.find('.sh-cnt');

  _el.addEventListener('touchstart', _onTouchStart, false);
  _el.addEventListener('touchmove', _onTouchMove, false);
  _el.addEventListener('touchend', _onTouchEnd, false);

  /*for (var a = 0; a < 10; a++) {
    _fakeCard.name = a + '' + a + a;
    exports.addCard(_fakeCard);
  }
  _currentPos = _cards.length - 1;
  _arrangeCards(_currentPos);*/
}

exports.$el = null;
exports.el = null;

exports.attachTo = function(target) {
  _$el.appendTo(target);
}

exports.addCard = function(data) {
  var cardEl = cardformatter.buildCard(data);
  cardEl.addClass('sh-card');
  _cnt.append(cardEl[0]);
  _cards.push(cardEl[0]);

  if (_currentPos == _cards.length - 2) {
    _currentPos++;
  }
  _arrangeCards(_currentPos);
}

function _arrangeCards(position) {
  //position = Math.max(0, Math.min(_cards.length - 1, position));

  var leftPos = Math.floor(position);
  var rightPos = Math.ceil(position);

  if (leftPos == rightPos) {
    rightPos++;
  }

  //console.log('lp, rp', leftPos, rightPos);

  var mid = window.innerWidth / 2;
  var halfStage = 250;
  var stackOffset = 100;

  var fallback = -300;
  var maxAngle = 45;

  var a, card, pos, res;

  res = position - leftPos;

  for (a = 0; a < leftPos; a++) {
    card = _cards[a];
    if (!card) {
      continue;
    }
    pos = -halfStage - (leftPos - (a - res)) * stackOffset;
    card.style.webkitTransform = translate3d(pos, 0, fallback) +
        ' rotate3d(0, 1, 0, ' + maxAngle + 'deg)';
  }

  for (a = rightPos + 1; a < _cards.length; a++) {
    //a0 = a + (1 - res);
    /*if (a == rightPos + 1) {
      console.log('a0:', a - rightPos + (1 - res));
    }*/

    card = _cards[a];
    if (!card) {
      continue;
    }
    pos = 1.5 * halfStage + (a - rightPos + (1 - res)) * stackOffset;
    card.style.webkitTransform = translate3d(pos, 0, (a - rightPos + (1 - res)) * 50) +
        ' rotate3d(0, 1, 0, ' + maxAngle + 'deg)';
  }

  if (leftPos == rightPos) {
    card = _cards[leftPos];
    card.style.webkitTransform = translate3d(0, 0, 0);

  } else {
    card = _cards[leftPos];
    if (card) {
      card.style.webkitTransform = translate3d(
        res * (-halfStage - stackOffset),
        0,
        res * fallback
      ) + ' rotate3d(0, 1, 0, ' + res * maxAngle + 'deg)';
    }

    card = _cards[rightPos];
    if (card) {
      res = 1 - res;
      card.style.webkitTransform = translate3d(
        res * (1.5 * halfStage + stackOffset),
        0,
        res * 1 * 50
      ) + ' rotate3d(0, 1, 0, ' + res * maxAngle + 'deg)';
    }
  }
}

var _touchStartX = 0;
var _touchStartPos = 0;

function _onTouchStart(e) {
  if (e.touches.length > 1) {
    return;
  }

  var touch = e.touches[0];

  _touchStartX = touch.pageX;
  _touchStartPos = _currentPos;

  _tween && _tween.stop();
}

function _onTouchMove(e) {
  var touch = e.touches[0];

  _currentPos = _touchStartPos + (_touchStartX - touch.pageX) / 300;

  var maxPos = _cards.length - 1;

  if (_currentPos < 0) {
    _currentPos = _currentPos * 0.3;
  } else if (_currentPos > maxPos) {
    _currentPos = maxPos + (_currentPos - maxPos) * 0.5;
  }

  _arrangeCards(_currentPos);
}

function _onTouchEnd(e) {
  // do some animations, bro

  var targetPos = Math.round(Math.max(0, Math.min(_cards.length - 1,
      _currentPos)));
  fx.tweenValues(_currentPos, targetPos, 300, fx.cubic.easeOut, function(v) {
    _currentPos = v;
    _arrangeCards(_currentPos);
  });
}

var _fakeCard = {
  'id': 2032,
  'face': 1,
  'typeline': 'Sorcery',
  'color': 'G',
  'cost': '2G',
  'rules': 'Search your library for up to two basic land cards, reveal those ' +
           'cards, and put one onto the battlefield tapped and the other into ' +
           'your hand. Then shuffle your library.\n',
  'name': 'Cultivate'
}

function translate3d(x, y, z) {
  return 'translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';
}
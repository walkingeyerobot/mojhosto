var classdef = require('classdef');

var templates = require('./templates'),
    fx = require('./fx'),
    cardformatter = require('./cardformatter'),
    taplistener = require('./taplistener'),
    TouchTracker = require('./TouchTracker'),
    stubapi = require('./stubapi'),
    spellhistory = require('./spellhistory');

var $el, el;
var coin, coinFace, coinGlow, coinFlash, doors, leftDoor, rightDoor, carousel;

var currentAngle = 0;
var cards = [];

var dragStartAngle = 0;

var _touchTracker = new TouchTracker(6, 'avg');
var _prevTouchTime, _prevTouchVal;

var _carouselTween = null;
var _focusedCardIndex = 0;

var _selectionMode = null;
var _frontCard = null;
var _selectedCard = null;

var easeInQuad = 'cubic-bezier(0.550, 0.085, 0.680, 0.530)';
var easeInCubic = 'cubic-bezier(0.550, 0.055, 0.675, 0.190)';
var easeInOutQuad = 'cubic-bezier(0.455, 0.030, 0.515, 0.955)';

exports.init = function() {
  $el = templates.build('lib/jhoira.html');
  el = $el[0];

  exports.$el = $el;
  exports.el = $el;

  coin = $el.find('.jh-coin')[0];
  coinFace = $el.find('.jh-coinFace')[0];
  coinFlash = $el.find('.jh-coinFlash')[0];
  coinGlow = $el.find('.jh-coinGlow')[0];

  doors = $el.find('.jh-doors')[0];
  leftDoor = $el.find('.jh-leftDoor')[0];
  rightDoor = $el.find('.jh-rightDoor')[0];
  carousel = $el.find('.jh-carousel')[0];

  coin.addEventListener('touchstart', onCoinTouchStart, false);
  coin.addEventListener('touchmove', onCoinTouchMove, false);
  coin.addEventListener('touchend', onCoinTouchEnd, false);

  carousel.addEventListener('touchstart', onCarouselTouchStart, false);
  carousel.addEventListener('touchmove', onCarouselTouchMove, false);
  carousel.addEventListener('touchend', onCarouselTouchEnd, false);

  //stubapi.fetchSorceries(_createCards);

  /*el.addEventListener('touchstart', function(e) {
    coinFlash.style.webkitTransitionDuration = '0s';
    coinFlash.style.opacity = '1';
    coinFace.style.display = 'none';
    coinGlow.style.opacity = '0';

    setTimeout(function() {
      coinFlash.style.webkitTransitionDuration = '500ms';
      coinFlash.style.opacity = '0';
    }, 0);

    //coin.style.display = 'none';
    //leftDoor.style.left = '-50%';
    //rightDoor.style.left = '100%';
    leftDoor.style.webkitTransform = 'translate3d(' + (-window.innerWidth / 2) +
        'px,0,0)';
    rightDoor.style.webkitTransform = 'translate3d(' + (window.innerWidth / 2) +
        'px,0,0)';


    var startAngle = -200;
    var startDepth = -800;

    currentAngle = startAngle;
    spinCards(startAngle, startDepth);
    _carouselTween = fx.tweenValues(
      {angle: startAngle, depth: startDepth},
      {angle: 0, depth: 0},
      3500, fx.cubic.easeOut, function(v) {
        currentAngle = v.angle;
        spinCards(v.angle, v.depth);
      });

  }, false);*/
}

exports.$el = null;
exports.el = null;

exports.attachTo = function(target) {
  $el.appendTo(target);
}

function _clearCards() {
  carousel.innerHTML = '';
  cards = [];
  _focusedCardIndex = 0;
  currentAngle = 0;
}

function _createCards(cardList) {
  carousel.innerHTML = '';
  cards = [];
  for (var a = 0; a < cardList.length; a++) {
    var cardData = cardList[a];

    var cardEl = cardformatter.buildCard(cardData);

/*
    var container = $('<div class="jh-card"></div>')[0];

    var cardEl = templates.build('lib/card.html', {
      name: card.name,
      cost: cardformatter.formatCastingCost(card.cost),
      typeline: card.typeline,
      rules: cardformatter.formatRulesText(card.rules)
    });*/
    cardEl.addClass('jh-card');

    taplistener.listen(cardEl, null, null, onCardTapped);

    //container.appendChild(cardEl[0]);

    //card.className = card.className + ' testCard' + a;
    cards.push(new Card(cardEl[0], cardData));
    carousel.appendChild(cardEl[0]);
  }

  _focusedCardIndex = 0;
  currentAngle = 0;
  spinCards(currentAngle);
}

function spinCards(angle, zOffset) {
  if (zOffset == null) {
    zOffset = 0;
  }

  var radius = 350;

  angle = angle / 360 * Math.PI * 2;

  var angleStep = Math.PI * 2 / cards.length;

  var bestZ = -Number.MAX_VALUE;

  var cardDepths = [];

  for (var a = 0; a < cards.length; a++) {
    var card = cards[a];
    var cardAngle = angleStep * a + angle;

    var x = Math.sin(cardAngle) * radius;
    var z = Math.cos(cardAngle) * radius - radius + zOffset;
    if (Math.abs(x) < 0.001) {
      x = 0;
    }
    if (Math.abs(z) < 0.001) {
      z = 0;
    }

    card.z = z;
    cardDepths.push(card);

    card.el.style.webkitTransform = 'translate3d(' + x +'px, 0, ' + z + 'px)';
  }
  cardDepths.sort(function(a, b) {
    if (a.z > b.z) {
      return 1;
    } else if (a.z < b.z) {
      return -1;
    } else {
      return 0;
    }
  });
  for (a = 0; a < cardDepths.length; a++) {
    cardDepths[a].el.style.zIndex = a;
    //carousel.appendChild(cardDepths[a].card);
  }

  if (cardDepths.length > 0) {
    _frontCard = cardDepths[cardDepths.length - 1];
  }
}

var _spinning = false;
var _opening = false;

var _coinAngle = 0;

var _coinStartAngle = 0;
var _coinTouchStartAngle = 0;
var _prevRotationAngle = 0;
var _prevCoinTimestamp = 0;

var _coinSpeed = 0;

var _lapCount = 0;

var _coinTracker = new TouchTracker(6, 'avg');

function onCoinTouchStart(e) {
  if (e.touches.length > 1) {
    return;
  }
  e.preventDefault();

  var touch = e.touches[0];

  coin.style.webkitTransitionDuration = '0s';

  coinGlow.style.opacity = '1';
  if (touch.pageX < window.innerWidth / 2) {
    _selectionMode = 'instant';
    coinGlow.style.backgroundPosition = '-1px -10px';
    coinGlow.style.webkitTransform = 'translate3d(74px, 210px, 0)';
  } else {
    _selectionMode = 'sorcery';
    coinGlow.style.backgroundPosition = '-189px -10px';
    coinGlow.style.webkitTransform = 'translate3d(341px, 209px, 0)';
  }

  _coinTracker.clear();
  _coinTouchStartAngle = getAngle(touch);
  _coinStartAngle = _coinAngle;
  _prevRotationAngle = 0;
  _prevCoinTimestamp = Date.now();
}

function onCoinTouchMove(e) {
  var touch = e.touches[0];
  e.preventDefault();

  var angle = getAngle(touch);
  //console.log('ANGLE:', angle);

  if (_prevRotationAngle < 90 && angle > 270) {
    _lapCount--;
  } else if (_prevRotationAngle > 270 && angle < 90) {
    _lapCount++;
  }

  var adjustedAngle = angle + 360 * _lapCount;

  _coinAngle = _coinTouchStartAngle - adjustedAngle;
  coin.style.webkitTransform = 'rotate3d(0, 0, 1, ' + _coinAngle + 'deg)';

  //console.log('Angle:', Math.round(ringRotation));

  var now = Date.now();
  _coinTracker.add((angle - _prevRotationAngle) / Math.max(1, now - _prevCoinTimestamp));

  _prevCoinTimestamp = now;
  _prevRotationAngle = angle;
}

function onCoinTouchEnd(e) {
  //coinGlow.style.opacity = '0';
  _coinSpeed = _coinTracker.smooth();
  console.log('VELOCITY:', _coinSpeed);

  var absSpeed = Math.abs(_coinSpeed);

  if (absSpeed < 0.5) {
    _coinAngle = 0;
    coin.style.webkitTransitionDuration = '400ms';
    coin.style.webkitTransform = 'rotate3d(0, 0, 1, 0deg)';
    coinGlow.style.opacity = '0';
  } else {
    absSpeed = Math.min(1.5, Math.max(1.5, _coinSpeed));
    if (_coinSpeed < 0) {
      _coinSpeed = -absSpeed;
    } else {
      _coinSpeed = absSpeed;
    }

    _spinning = true;
    spinCoin();

    setTimeout(function() {
      _spinning = false;
      fetchCards(_selectionMode);
      openDoors();

    }, 500);
  }
}

function spinCoin() {
  if (!_spinning) {
    return;
  }

  var now = Date.now();

  _coinAngle -= _coinSpeed * (now - _prevCoinTimestamp);
  coin.style.webkitTransform = 'rotate3d(0, 0, 1, ' + _coinAngle + 'deg)';

  _prevCoinTimestamp = now;

  setTimeout(spinCoin, 16);
}

function openDoors() {
  _opening = true;

  coinFlash.style.webkitTransitionDuration = '0s';
  coinFlash.style.opacity = '1';
  coinFace.style.display = 'none';
  coinGlow.style.opacity = '0';

  setTimeout(function() {
    coinFlash.style.webkitTransitionDuration = '500ms';
    coinFlash.style.opacity = '0';
  }, 0);

  setTimeout(function() {
    coin.style.display = 'none';
  }, 550);

  //coin.style.display = 'none';
  //leftDoor.style.left = '-50%';
  //rightDoor.style.left = '100%';
  setTimeout(function() {
    leftDoor.style.webkitTransitionDuration = '1500ms';
    rightDoor.style.webkitTransitionDuration = '1500ms';

    leftDoor.style.webkitTransitionTimingFunction = easeInOutQuad;
    leftDoor.style.webkitTransform = 'translate3d(' + (-window.innerWidth / 2) +
        'px,0,0)';
    rightDoor.style.webkitTransitionTimingFunction = easeInOutQuad;
    rightDoor.style.webkitTransform = 'translate3d(' + (window.innerWidth / 2) +
        'px,0,0)';

    var startAngle = -200;
    var startDepth = -800;

    currentAngle = startAngle;
    spinCards(startAngle, startDepth);
    _carouselTween = fx.tweenValues(
      {angle: startAngle, depth: startDepth},
      {angle: 0, depth: 0},
      3500, fx.cubic.easeOut, function(v) {
        currentAngle = v.angle;
        spinCards(v.angle, v.depth);
      });
  }, 150);

  setTimeout(function() {
    doors.style.pointerEvents = 'none';
  }, 2000);
}

function closeDoors() {
  doors.style.pointerEvents = '';

  leftDoor.style.webkitTransitionDuration = '800ms';
    rightDoor.style.webkitTransitionDuration = '800ms';

  leftDoor.style.webkitTransitionTimingFunction = easeInCubic;
  rightDoor.style.webkitTransitionTimingFunction = easeInCubic;
  leftDoor.style.webkitTransform = 'translate3d(0,0,0)';
  rightDoor.style.webkitTransform = 'translate3d(0,0,0)';

  setTimeout(function() {
    coin.style.display = 'block';
    coinFlash.style.webkitTransitionDuration = '0s';
    coinFlash.style.opacity = '1';

    setTimeout(function() {
      coinFlash.style.webkitTransitionDuration = '500ms';
      coinFlash.style.opacity = '0';
      coinFace.style.display = 'block';
      coin.style.webkitTransform = 'rotate3d(0, 0, 1, 0)';
      _coinAngle = 0;
    }, 0);

    _clearCards();
  }, 800);
}

var touchStartX;
var touchStartY;

var cTouchMode = null;

function onCarouselTouchStart(e) {
  _carouselTween && _carouselTween.stop();
  _touchTracker.clear();
  dragStartAngle = currentAngle;

  var touch = e.touches[0];
  touchStartX = touch.pageX;
  touchStartY = touch.pageY;

  _prevTouchVal = currentAngle;
  _prevTouchTime = Date.now();
}

function onCarouselTouchMove(e) {
  if (_selectedCard) {
    _selectedCard.el.style.boxShadow = '';
    _selectedCard.el.style.borderColor = '';
    _selectedCard = null;
  }

  var touch = e.touches[0];
  currentAngle = dragStartAngle + (touch.pageX - touchStartX) / 8;
  spinCards(currentAngle);

  var now = Date.now();
  _touchTracker.add((currentAngle - _prevTouchVal) / (now - _prevTouchTime));
  _prevTouchVal = currentAngle;
  _prevTouchTime = now;
}

function onCarouselTouchEnd(e) {
  var speed = _touchTracker.smooth();

  var angleStep = 360 / cards.length;
  var targetPos = _focusedCardIndex;

  var transitionSpeed = 0.10;
  if (speed > transitionSpeed) {
    targetPos--
  } else if (speed < -transitionSpeed) {
    targetPos++
  } else {
    targetPos = -Math.round(currentAngle / angleStep);
    if (targetPos > _focusedCardIndex) {
      targetPos = _focusedCardIndex + 1;
    } else if (targetPos < _focusedCardIndex) {
      targetPos = _focusedCardIndex - 1;
    }
  }

  _focusedCardIndex = targetPos;

  var targetAngle = -targetPos * angleStep;
  _carouselTween && _carouselTween.stop();
  if (targetAngle != currentAngle) {
    _carouselTween = fx.tweenValues(currentAngle, targetAngle, 500,
        fx.cubic.easeOut, function(v) {
      currentAngle = v;
      spinCards(v);
    });
  }
}

function onCardTapped(cardElem) {
  if (_selectedCard && cardElem == _selectedCard.el) {
    // HUZZAH
    cardElem.style.webkitTransitionDuration = '300ms';
    cardElem.style.webkitTransform = 'translate3d(0, 700px, 0)';
    spellhistory.addCard(_selectedCard.data);

    setTimeout(function() {
      closeDoors();
    }, 150);

  } else if (_frontCard && cardElem == _frontCard.el) {
    console.log('FRONT!');
    _selectedCard = _frontCard;
    if (_selectionMode == 'instant') {
      cardElem.style.boxShadow = '0 0 60px #0099ff';
      cardElem.style.borderColor = '#00ccff';
    } else {
      cardElem.style.boxShadow = '0 0 60px #ff9900';
      cardElem.style.borderColor = '#ffcc00';
    }
  }
}

function getAngle(touch) {
  return Math.atan2(
    touch.pageX - window.innerWidth / 2,
    touch.pageY - window.innerHeight / 2
  ) / (2 * Math.PI) * 360 + 180;
}

function fetchCards(mode) {
  if (mode == 'sorcery') {
    stubapi.fetchSorceries(_createCards);
  } else {
    stubapi.fetchInstants(_createCards);
  }
}

var Card = classdef({
  constructor: function(el, data) {
    this.el = el;
    this.data = data;
    this.z = 0;
  }
});
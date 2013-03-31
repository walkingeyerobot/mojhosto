var templates = require('./templates'),
    taplistener = require('./taplistener');

var stubapi = require('./stubapi');

exports.init = function() {
  $el = templates.build('lib/momir.html');
  el = $el[0];
  exports.$el = $el;
  exports.el = el;

  ringCenter = $el.find('.ring-center')[0];
  ringNums = $el.find('.ring-nums')[0];

  ring = $el.find('.ring')[0];
  ringMetal = $el.find('.ring-metal')[0];
  ringGlow = $el.find('.ring-glow')[0];
  ringBlur = $el.find('.ring-blur')[0];
  ringFlash = $el.find('.ring-flash')[0];

  equipBtn = $el.find('.mo-equipBtn')[0];
  cancelBtn = $el.find('.mo-cancelBtn')[0];
  continueBtn = $el.find('.mo-continueBtn')[0];

  ring.addEventListener('touchstart', onRingTouchStart, false);
  ring.addEventListener('touchmove', onRingTouchMove, false);
  ring.addEventListener('touchend', onRingTouchEnd, false);
  ring.addEventListener('mousedown', function(e) {
    e.preventDefault();
  }, false);

  equipBtn.addEventListener('touchstart', onEquipBtnTouchStart, false);

  taplistener.listen(cancelBtn, onFloatButtonDown, onFloatButtonUp,
      onCancelButtonTap);
  taplistener.listen(continueBtn, onFloatButtonDown, onFloatButtonUp,
      onContinueButtonTap);
};

exports.$el = null;
exports.el = null;

exports.attachTo = function(target) {
  target.append(el);
};

var requestAnimationFrame = function(fun) {
  window.setTimeout(fun, 16);
};

var $el, el;

var ring;
var ringCenter;
var ringNums;
var ringMetal;
var ringGlow;
var ringBlur;
var ringFlash;

var equipBtn, cancelBtn, continueBtn;

var ringRotation = 0;
var lapCount = 0;

var minGlowOpacity = 0.3;
var maxVelocity = 0.62;

var prevAngle = 0;
var startAngle = 0;
var startRotation = 0;

var lastTouchTimestamp = 0;
var ringVelocity = 0;

var speeds = null;
var nextSpeedSlot = 0;

var ringLocked = false;
var touching = false;
var portalOpening = false;
var cancelPortal = false;

var selectedCmc = 0;
var equipmentMode = false;

var ringValues = [null, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 16];
var numPositions = [
    [354, 100],
    [444, 120], [523, 174], [575, 251], [595, 345], [575, 437],
    [522, 518], [444, 568], [347, 589], [256, 571], [177, 518],
    [122, 439], [103, 345], [121, 253], [173, 176], [251, 122]
];

function onEquipBtnTouchStart(e) {
  setEquipMode(!equipmentMode);
}

function setEquipMode(val) {
  equipmentMode = val;
  if (equipmentMode) {
    equipBtn.style.backgroundPosition = '-144px 0';
  } else {
    equipBtn.style.backgroundPosition = '';
  }
}

function onRingTouchStart(e) {
  e.preventDefault();

  if (e.touches.length > 1 || ringLocked) {
    return;
  }

  if (portalOpening) {
    //cancelPortal = true;
    return;
  }

  var touch = e.touches[0];
  var touchX = window.innerWidth / 2 - touch.pageX;
  var touchY = window.innerHeight / 2 - touch.pageY;
  var touchRadius = Math.sqrt(touchX * touchX + touchY * touchY);

  if (touchRadius > 360 || touchRadius < 260) {
    return;
  }

  touching = true;

  startAngle = getAngle(touch);
  prevAngle = startAngle;

  startRotation = ringRotation;

  speeds = new Array(6);
  nextSpeedSlot = 0;
  ringVelocity = 0;
  lastTouchTimestamp = Date.now();

  ring.style.webkitTransitionDuration = '0ms';

  ringGlow.style.webkitTransitionDuration = '500ms';
  ringGlow.style.opacity = minGlowOpacity;

  //console.log('startAngle:', startAngle);

  var index = (15 - Math.floor((startAngle - 11.25) / 22.5)) % 16;

  selectedCmc = ringValues[index]

  var numPosition = numPositions[index];
  ringNums.style.opacity = '1';
  ringNums.style.backgroundPosition = -index * 58 + 'px 0';
  ringNums.style.webkitTransform = 'translate3d(' + numPosition[0] + 'px,' +
      numPosition[1] + 'px,0)';
}

function onRingTouchMove(e) {
  if (!touching) {
    return
  }

  var touch = e.touches[0];

  var angle = getAngle(touch);

  if (prevAngle < 90 && angle > 270) {
    lapCount--;
  } else if (prevAngle > 270 && angle < 90) {
    lapCount++;
  }

  var adjustedAngle = angle + 360 * lapCount;

  //console.log('Angle:', (startAngle - angle) / (2 * Math.PI) * 360);

  ringRotation = startRotation + startAngle - adjustedAngle;
  ring.style.webkitTransform = 'rotate3d(0, 0, 1, ' + ringRotation + 'deg)';

  //console.log('Angle:', Math.round(ringRotation));

  var now = Date.now();
  ringVelocity = (angle - prevAngle) / Math.max(1, now - lastTouchTimestamp);
  speeds[nextSpeedSlot] = ringVelocity;
  nextSpeedSlot = (nextSpeedSlot + 1) % speeds.length;

  //console.log('Speed:', ringVelocity);
  //setGlow(ringVelocity, minGlowOpacity);

  lastTouchTimestamp = now;
  prevAngle = angle;
}

function onRingTouchEnd(e) {
  if (!touching) {
    return;
  }
  touching = false;

  prevRingTick = lastTouchTimestamp;
  //requestAnimationFrame(onRingDecelTick);
  ringVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, computeFinalRingVelocity(speeds)));
  //console.log('FINAL VELOCITY:', ringVelocity);
  //onRingDecelTick();
  if (Math.abs(ringVelocity) >= maxVelocity) {
    portalOpening = true;
    //setGlow(1, 0);
    ringGlow.style.webkitTransitionDuration = '0ms';
    ringGlow.style.opacity = '1';
    onRingAccelTick();

    setTimeout(function() {
      if (selectedCmc != null) {
        if (equipmentMode) {
          stubapi.printEquipment(selectedCmc);
        } else {
          stubapi.printCreature(selectedCmc);
        }
      }
    }, 500);
  } else {
    ringRotation = Math.round(ringRotation / 22.5) * 22.5;
    ring.style.webkitTransitionDuration = '1000ms';
    ring.style.webkitTransform = 'rotate3d(0, 0, 1, ' + ringRotation + 'deg)';

    setGlow(0, 0);
    ringNums.style.opacity = '0';
  }
}

var prevRingTick = 0;

var blurVisible = false;

function onRingAccelTick() {
  if (cancelPortal) {
    cancelPortal = false;
    portalOpening = false;
    blurVisible = false;
    ringLocked = true;
    ringRotation = 0;

    ringBlur.style.opacity = '0';
    ringCenter.style.opacity = '1';
    ringNums.style.opacity = '0';
    ringMetal.style.opacity = '1';

    equipBtn.style.opacity = '1';

    ring.style.webkitTransform = 'rotate3d(0, 0, 1, -15deg)';
    ringFlash.style.webkitTransitionDuration = '0ms';
    ringFlash.style.opacity = '1';
    setTimeout(function() {
      ringFlash.style.webkitTransitionDuration = '400ms';
      ringFlash.style.opacity = '0';
      ring.style.webkitTransitionDuration = '4000ms';
      ring.style.webkitTransform = 'rotate3d(0, 0, 1, 0)';
      setTimeout(function() {
        ringLocked = false;
      }, 4000);
    }, 0);

    hideFloatButtons(80);

    if (equipmentMode) {
      setEquipMode(false);
    }

    setGlow(0, 0);
    return;
  }

  var maxSpeed = 0.65;

  var absSpeed = Math.abs(ringVelocity);

  if (absSpeed < maxSpeed) {
    if (ringVelocity > 0) {
      ringVelocity += 0.00025;
    } else  {
      ringVelocity -= 0.00025;
    }
    var fadeOpacity = 1 - 0.7 * (absSpeed - maxVelocity) / (maxSpeed - maxVelocity);
    ringCenter.style.opacity = fadeOpacity;
    ringMetal.style.opacity = fadeOpacity;
    equipBtn.style.opacity = fadeOpacity;

  } else if (!blurVisible) {
    blurVisible = true;
    ringCenter.style.opacity = '0';
    ringNums.style.opacity = '0';
    ringMetal.style.opacity = '0';

    ringGlow.style.webkitTransitionDuration = '0ms';
    ringGlow.style.opacity = '0';

    equipBtn.style.opacity = '0';

    ringFlash.style.webkitTransitionDuration = '0ms';
    ringFlash.style.opacity = '1';
    ringBlur.style.opacity = '1';
    setTimeout(function() {
      ringFlash.style.webkitTransitionDuration = '400ms';
      ringFlash.style.opacity = '0';
    }, 0);

    if (equipmentMode) {
      setTimeout(function() {
        cancelPortal = true;
      }, 4000);
    } else {
      setTimeout(function() {
        showFloatButtons(500);
      }, 4000);
    }
  }

  var now = Date.now();
  ringRotation -= ringVelocity * (now - prevRingTick);
  ring.style.webkitTransform = 'rotate3d(0, 0, 1, ' + (ringRotation % 360) + 'deg)';
  requestAnimationFrame(onRingAccelTick);

  /*if (!blurVisible) {
    setGlow(ringVelocity, 0);
  }*/

  prevRingTick = now;
}

function onRingDecelTick() {
  //console.log('Sup');
  if (touching) {
    return;
  }
  var now = Date.now();

  ringVelocity *= 0.99;
  ringRotation -= ringVelocity * (now - prevRingTick);
  ring.style.webkitTransform = 'rotate3d(0, 0, 1, ' + ringRotation + 'deg)';
  setGlow(ringVelocity, 0);

  if (Math.abs(ringVelocity) > 0.001) {
    requestAnimationFrame(onRingDecelTick);
  } else {
    setGlow(0);
  }

  prevRingTick = now;
}

function onFloatButtonDown(el) {
  el.style.webkitTransitionDuration = '0s';
  el.style.opacity = '1';
}

function onFloatButtonUp(el) {
  el.style.webkitTransitionDuration = '500s';
  el.style.opacity = '0.5';
}

function onCancelButtonTap(el) {
  cancelPortal = true;
}

function onContinueButtonTap(el) {
  hideFloatButtons(200);
  if (selectedCmc != null) {
    stubapi.printEquipment(selectedCmc);
  }
  setTimeout(function() {
    cancelPortal = true;
  }, 2000);
}

function showFloatButtons(duration) {
  duration = duration || 0;

  cancelBtn.style.display = 'block';
  cancelBtn.style.webkitTransitionDuration = duration + 'ms';
  cancelBtn.style.opacity = '0.5';

  continueBtn.style.display = 'block';
  continueBtn.style.webkitTransitionDuration = duration + 'ms';
  continueBtn.style.opacity = '0.5';
}

function hideFloatButtons(duration) {
  duration = duration || 0;

  cancelBtn.style.webkitTransitionDuration = duration + 'ms';
  cancelBtn.style.opacity = '0';

  continueBtn.style.webkitTransitionDuration = duration + 'ms';
  continueBtn.style.opacity = '0';

  setTimeout(function() {
    cancelBtn.style.display = 'none';
    continueBtn.style.display = 'none';
  }, duration);
}

function computeFinalRingVelocity(speeds) {
  var absSpeed = 0;
  var nextAbs = 0;
  var signedSpeed = 0;
  for (var a = 0; a < speeds.length; a++) {
    nextAbs = Math.abs(speeds[a]);
    if (nextAbs > absSpeed) {
      absSpeed = nextAbs;
      signedSpeed = speeds[a];
    }
  }
  return signedSpeed;
}

function setGlow(ringVelocity, minGlow) {
  //console.log('Speed:', ringVelocity);
  //ringGlow.style.webkitTransitionDuration = '0ms';
  ringGlow.style.opacity = Math.max(minGlow,
      Math.min(1, Math.abs(ringVelocity) / 0.4));
}

function getAngle(touch) {
  return Math.atan2(
    touch.pageX - window.innerWidth / 2,
    touch.pageY - window.innerHeight / 2
  ) / (2 * Math.PI) * 360 + 180;
}

function getTouchAngleRadians(touch) {
  return Math.atan2(
    touch.pageX - window.innerWidth / 2,
    touch.pageY - window.innerHeight / 2
  );
}
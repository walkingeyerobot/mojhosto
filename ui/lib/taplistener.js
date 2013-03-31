var nextId = 0;

var envs = {};

exports.listen = function(el, onDown, onUp, onTap, context) {
  if (el.length !== undefined) {
    for (var a = 0; a < el.length; a++) {
      exports.listen(el[a], onDown, onUp, onTap, context);
    }
    return;
  }

  el.__tlid = nextId;
  envs[nextId] = {
    el: el,
    context: context,
    onDown: onDown,
    onUp: onUp,
    onTap: onTap,
    sawMove: false
  };
  nextId++;

  el.addEventListener('touchstart', onTouchStart, false);
}

exports.unlisten = function(el) {
  if (el.__tlid) {
    delete envs[el.__tlid];
  }
}

function onTouchStart(e) {
  var env = envs[e.currentTarget.__tlid];
  if (!env) {
    return;
  }

  if (e.targetTouches.length > 1) {
    unlisten(env);
    callback(env, 'onUp');
  } else {
    env.sawMove = false;
    env.el.addEventListener('touchmove', onTouchMove, false);
    env.el.addEventListener('touchend', onTouchEnd, false);
    callback(env, 'onDown');
  }
}

function onTouchMove(e) {
  var env = envs[e.currentTarget.__tlid];
  if (!env) {
    return;
  }
  env.sawMove = true;

  unlisten(env);
  callback(env, 'onUp');
}

function onTouchEnd(e) {
  var env = envs[e.currentTarget.__tlid];
  if (!env) {
    return;
  }
  unlisten(env);

  callback(env, 'onUp');
  if (!env.sawMove) {
    callback(env, 'onTap');
  }
}

function unlisten(env) {
  env.el.removeEventListener('touchmove', onTouchMove, false);
  env.el.removeEventListener('touchend', onTouchStart, false);
}

function callback(env, name) {
  env[name] && env[name].call(env.context, env.el);
}
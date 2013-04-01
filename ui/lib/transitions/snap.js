var momir = require('../momir'),
    jhoira = require('../jhoira'),
    spellhistory = require('../spellhistory'),
    lifetracker = require('../lifetracker');

var cnt;

var _momirBtn, _jhoiraBtn, _historyBtn;

var _currentEl;

exports.init = function() {
  cnt = $('.mjs-cnt');

  momir.init();
  jhoira.init();
  spellhistory.init();

  _currentEl = momir.$el;
  _currentEl.appendTo(cnt);


  var btnCnt = $('<div class="tr-snapBtns"></div>');
  _momirBtn = $('<div class="tr-snapBtn"></div>').appendTo(btnCnt);
  _jhoiraBtn = $('<div class="tr-snapBtn"></div>').appendTo(btnCnt);
  _historyBtn = $('<div class="tr-snapBtn"></div>').appendTo(btnCnt);

  _momirBtn[0].addEventListener('touchstart', onMomirTap, false);
  _jhoiraBtn[0].addEventListener('touchstart', onJhoiraTap, false);
  _historyBtn[0].addEventListener('touchstart', onHistoryTap, false);

  btnCnt.appendTo(document.body);
}

function onMomirTap(e) {
  if (_currentEl != momir.$el) {
    _currentEl && _currentEl.detach();
    momir.$el.appendTo(cnt);
    _currentEl = momir.$el;
  }
}

function onJhoiraTap(e) {
  if (_currentEl != jhoira.$el) {
    _currentEl && _currentEl.detach();
    jhoira.$el.appendTo(cnt);
    _currentEl = jhoira.$el;
  }
}

function onHistoryTap(e) {
  if (_currentEl != spellhistory.$el) {
    _currentEl && _currentEl.detach();
    spellhistory.$el.appendTo(cnt);
    _currentEl = spellhistory.$el;
  }
}
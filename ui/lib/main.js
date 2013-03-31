
var momir = require('./momir'),
    jhoira = require('./jhoira'),
    spellhistory = require('./spellhistory'),
    lifetracker = require('./lifetracker');

var snap = require('./transitions/snap');

var cnt;

$(function() {
  cnt = $('.mjs-cnt');

  /*setTimeout(function() {
    $('<div style="color:red; position:absolute; top: 0; left: 0">')
      .text($('.mainSplash').width() + 'x' + $('.mainSplash').height())
      .appendTo(document.body);
  }, 2000);*/

  //momir.init();
  //momir.attachTo(cnt);

  //jhoira.init();
  //jhoira.attachTo(cnt);

  //spellhistory.init();
  //spellhistory.attachTo(cnt);

  //lifetracker.init();
  //lifetracker.attachTo(document.body);

  snap.init();

  var reloadBtn = $('<div>')
    .css({
      position: 'absolute',
      left: '0',
      top: '0',
      width: '50px',
      height: '50px',
      background: '#444',
      'z-index': 10000
    })
    .appendTo(document.body)
    .on('touchstart', function(e) {
      window.location = window.location;
    });
});

function onUpdateReady() {
  window.console.log('update ready. reloading...');
  window.applicationCache.swapCache();
  window.location.reload();
}
window.applicationCache.addEventListener('updateready', onUpdateReady);
if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
  onUpdateReady();
}
$(function() {
  var card = JSON.stringify({
      arr: ['hello world 1\n', 'hello world 2\n'] // make sure they end in \n
  });
  function pheldy(e) {
    var injectedObject = window.injectedObject || window.$injectedObject;
    if (injectedObject && injectedObject.printCard) {
	window.console.log(injectedObject.printCard(card));
    } else {
      window.console.log('miss');
    }
  }
  function jho(instant) {
    var text = instant ? 'instant' : 'sorcery';
    $('#jho>div').each(function(i, elem) {
      $(elem).text(text + ' ' + Math.random());
    });
  }
  function instant(e) {
    jho(true);
  }
  function sorcery(e) {
    jho(false);
  }
  $('#pheldy').click(pheldy);
  $('#instant').click(instant);
  $('#sorcery').click(sorcery);
});
function onUpdateReady() {
    window.console.log('update ready');
    window.applicationCache.swapCache();
    window.location.reload();
}
window.applicationCache.addEventListener('updateready', onUpdateReady);
if(window.applicationCache.status === window.applicationCache.UPDATEREADY) {
    onUpdateReady();
}

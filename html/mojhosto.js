$(function() {
  function pheldy(e) {
    var injectedObject = window.injectedObject || window.$injectedObject;
    if (injectedObject && injectedObject.printCard) {
      window.console.log(injectedObject.printCard());
    } else {
      window.console.log('miss');
    }
  }
  $('#pheldy').click(pheldy);
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

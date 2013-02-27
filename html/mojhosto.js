$(function() {
  var btoa = window.btoa || $.base64().encode;
  var card = JSON.stringify({
    arr: [
      btoa('hello world 1\n'),
      btoa('hello world 2\n')
    ] // make sure the strings end in \n
  });
  var injectedObject = window.injectedObject || window.$injectedObject;
  function printCard(e) {
    window.console.log(injectedObject.printCard(card));
  }
  function printPheldy(e) {
    window.console.log(injectedObject.printPheldy());
  }
  function creature(e) {
    console.log('creature ' + $('#creature-cmc').val());
  }
  function creatureCmc(e) {
    var v = parseInt($(this).val(), 10);
    if (v === 0) {
      v = '-';
    } else if (v > 8) {
      v = 8;
    }
    $('#equipment-cmc').val(v+'');
    equipmentCmc.call($('#equipment-cmc'), e);
  }
  function equipment(e) {
    console.log('equipment <' + $('#equipment-cmc').val());
  }
  function equipmentCmc(e) {
    if ($(this).val() === '-') {
      $('#equipment').attr('disabled', 'disabled');
    } else {
      $('#equipment').removeAttr('disabled');
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
  $('#pheldy').click(printPheldy);
  $('#card').click(printCard);
  $('#creature').click(creature);
  $('#creature-cmc').change(creatureCmc);
  $('#equipment').click(equipment);
  $('#equipment-cmc').change(equipmentCmc);
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

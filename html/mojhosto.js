$(function() {
  var btoa = window.btoa || $.base64().encode;
  var card = JSON.stringify({
    arr: [
      btoa('hello world 1\n'),
      btoa('hello world 2\n')
    ] // make sure the strings end in \n
  });
  function notFound() {
    return 'injectedObject not found.';
  }
  var injectedObject =
    window.injectedObject ||
    window.$injectedObject ||
    {
      printCard: notFound,
      printPheldy: notFound
    };
  function printCard(e) {
    window.console.log(injectedObject.printCard(card));
  }
  function printPheldy(e) {
    window.console.log(injectedObject.printPheldy());
  }
  function creature(e) {
    var json = $.getJSON('mojhosto_db.json', function(json) {
      var creatures = json.creatures;
      var randomCmc = creatures[
        Math.floor(Math.random() * creatures.length)].cards;
      var item = randomCmc[
        Math.floor(Math.random() * randomCmc.length)];
      console.log(item);
      console.log(injectedObject.printCard(
        JSON.stringify({arr: [item.data]})));
    });
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

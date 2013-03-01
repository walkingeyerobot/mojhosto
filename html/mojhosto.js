$(function() {
  var btoa = window.btoa || $.base64().encode;
  var card = JSON.stringify({
    arr: [
      btoa('hello world 1\n'),
      btoa('hello world 2\n')
    ] // make sure the strings end in \n
  });
  var json;
  $.getJSON('mojhosto_db.json', function(j) {
    json = j;
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
    if (json) {
      var creatures = json.creatures;
      var val = $('#creature-cmc').val();
      var idx = 0;
      if (val === '15') {
        val = 1;
        idx = 1;
      }
      // TODO(mitch): there may be missing cmcs in the array, so index does not
      // necessarily correspond to cmc. Either loop through the array, or change
      // the values on the <option>s.
      var cmc = creatures[val].cards;
      var item = cmc[idx];
        //Math.floor(Math.random() * cmc.length)];
      window.console.log(item);
      window.console.log(injectedObject.printCard(
        JSON.stringify({arr: [item.data]})));
    }
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

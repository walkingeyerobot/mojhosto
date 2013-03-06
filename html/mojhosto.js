$(function() {
  var injectedObject =
    window.injectedObject ||
    window.$injectedObject ||
    {
      printCard: notFound,
      printPheldy: notFound,
      fake: true
    };
  var btoa = window.btoa || $.base64().encode;
  var testData = JSON.stringify({
    arr: [
      btoa('hello world 1\n'),
      'G0AbIQCSloWggqGDlKMKGyEBkpaFoIKhg5SjChshApKWhaCCoYOUowobQAoKCgoK',
      btoa('hello world 2\n')
    ] // make sure the strings end in \n
  });
  var linebreaks = btoa('\n\n\n');

  function notFound() {
    return 'injectedObject not found.';
  }
  function printCard(e) {
    window.console.log(injectedObject.printCard(testData));
  }
  function printPheldy(e) {
    window.console.log(injectedObject.printPheldy());
  }
  function creature(e) {
    var val = $('#creature-cmc').val();
    var sql =
      'SELECT data, name FROM Creatures WHERE cmc=' +
      val +
      ' ORDER BY RANDOM() LIMIT 1';
    window.console.log(sql);
    var ret = injectedObject.printCard(sql, linebreaks);
    last = { card: ret, table: 'Creatures' };
    window.console.log(ret);
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
    var val = $('#equipment-cmc').val();
    var sql =
      'SELECT data, name FROM Equipment WHERE cmc<' +
      val +
      ' ORDER BY RANDOM() LIMIT 1';
    window.console.log(sql);
    var ret = injectedObject.printCard(sql, linebreaks);
    last = { card: ret, table: 'Equipment' };
    window.console.log(ret);
  }
  function equipmentCmc(e) {
    if ($(this).val() === '-') {
      $('#equipment').attr('disabled', 'disabled');
    } else {
      $('#equipment').removeAttr('disabled');
    }
  }
  function lastCard() {
    if (last && last.card && last.table) {
      window.console.log(injectedObject.printCard(
        'SELECT data, name FROM ' +
        last.table +
        ' WHERE name=\'' +
        last.card +
        '\'', linebreaks));
    } else {
      window.console.log('no last card data.');
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
  function log(str) {
    $('#log').text(str.toString());
    return true;
  }
  $('#last').click(lastCard);
  $('#card').click(printCard);
  $('#creature').click(creature);
  $('#creature-cmc').change(creatureCmc);
  $('#equipment').click(equipment);
  $('#equipment-cmc').change(equipmentCmc);
  $('#instant').click(instant);
  $('#sorcery').click(sorcery);
  window.logFromJava = log;
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

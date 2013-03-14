$(function() {
  var injectedObject =
    window.injectedObject ||
    window.$injectedObject ||
    {
      printCard: notFound,
      printPheldy: notFound,
      getJhos: fakeJhos,
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
  function fakeJhos() {
    var ret = [
      {
        "id": 2032,
        "face": 1,
        "typeline": "Sorcery",
        "color": "G",
        "cost": "2G",
        "rules": "Search your library for up to two basic land cards, reveal those cards, and put one onto the battlefield tapped and the other into your hand. Then shuffle your library.\n",
        "name": "Cultivate"
      }, {
        "id": 1692,
        "face": 1,
        "typeline": "Sorcery",
        "color": "B",
        "cost": "4BB",
        "rules": "Search target player's library for X cards, where X is the number of cards in your hand, and exile them. Then that player shuffles his or her library.\nEpic (For the rest of the game, you can't cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)\n",
        "name": "Neverending Torment"
      }, {
        "id": 2337,
        "face": 1,
        "typeline": "Sorcery",
        "color": "R",
        "cost": "R",
        "rules": "Replicate {R} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nDestroy target artifact.\n",
        "name": "Shattering Spree"
      }
    ];
    doSomethingWithInstantsAndSorceries(ret);
  }
  function doSomethingWithInstantsAndSorceries(arr) {
    // TODO(ned): this will get called with instant or sorcery data.
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
    $('#equipment-cmc').val(v + '');
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
    var text = instant ? 'INSTANTS' : 'SORCERIES';
    var jhos = injectedObject.getJhos(
      'SELECT s.id, c.name, c.face, c.cost, c.color_ind, c.typeline, ' +
      'c.rules, c.color FROM ' +
      text +
      ' s LEFT OUTER JOIN CARDDATA c ON s.id=c.id ORDER BY RANDOM() ' +
      'LIMIT 3;', text, linebreaks);
    window.console.log(jhos);
    doSomethingWithInstantsAndSorceries(JSON.parse(jhos));
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

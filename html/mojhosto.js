$(function() {
  var injectedObject =
    window.injectedObject ||
    window.$injectedObject ||
    {
      printCard: notFound,
      getJhos: fakeJhos,
      fake: true
    };
  var btoa = window.btoa || $.base64().encode;
  var linebreaks = btoa('\n\n\n');
  var last;

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
  function creature(e) {
    var val = $('#creature-cmc').val();
    var sql =
      'SELECT data, name FROM Creatures WHERE cmc=' +
      val +
      ' ORDER BY RANDOM() LIMIT 1';
    log(sql);
    var ret = injectedObject.printCard(sql, linebreaks);
    last = { card: ret, table: 'Creatures' };
    log(ret);
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
    log(sql);
    var ret = injectedObject.printCard(sql, linebreaks);
    last = { card: ret, table: 'Equipment' };
    log(ret);
  }
  function equipmentCmc(e) {
    if ($(this).val() === '-') {
      $('#equipment').attr('disabled', 'disabled');
    } else {
      $('#equipment').removeAttr('disabled');
    }
  }
  function lastCard() {
    if (last) {
	  if (last.card && last.table) {
        log(injectedObject.printCard(
          'SELECT data, name FROM ' +
          last.table +
          ' WHERE name=\'' +
          last.card +
          '\'', linebreaks));
      } else if (last.jhos && last.table) {
	    log(injectedObject.printCard(
		  'SELECT (SELECT a.data FROM ' +
		  last.table +
		  ' a WHERE a.id=' +
		  last.jhos[0] + 
		  ') || (SELECT b.data FROM ' +
		  last.table +
		  ' b WHERE b.id=' +
		  last.jhos[1] +
		  ') || (SELECT c.data FROM ' +
		  last.table +
		  ' c WHERE c.id=' +
		  last.jhos[2] + ')', linebreaks));
	  }
    } else {
      log('no last card data.');
    }
  }
  function jho(instant) {
    var text = instant ? 'INSTANTS' : 'SORCERIES';
    var jhos = injectedObject.getJhos(
      'SELECT c.id, c.name, c.face, c.cost, c.color_ind, c.typeline, c.rules, ' +
      'c.color FROM (SELECT s.id FROM ' +
      text + 
      ' s ORDER BY RANDOM() LIMIT 3) AS ss LEFT OUTER JOIN CARDDATA c ' +
      'ON ss.id=c.id ORDER BY c.id,c.face;',
      text, linebreaks); // pass '', '' instead for real data (but no printing)
    log(jhos);
	last = {
	  table: text,
	  jhos: JSON.parse(jhos)
	};
    doSomethingWithInstantsAndSorceries(JSON.parse(jhos));
  }
  function instant(e) {
    jho(true);
  }
  function sorcery(e) {
    jho(false);
  }
  function log(str) {
    window.console.log(str);
  }
  $('#last').click(lastCard);
  $('#creature').click(creature);
  $('#creature-cmc').change(creatureCmc);
  $('#equipment').click(equipment);
  $('#equipment-cmc').change(equipmentCmc);
  $('#instant').click(instant);
  $('#sorcery').click(sorcery);
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

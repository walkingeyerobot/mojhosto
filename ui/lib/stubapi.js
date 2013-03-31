var comm = window.injectedObject || window.$injectedObject;
var btoa2 = window.btoa || $.base64().encode;
var linebreaks = btoa2('\n\n\n');

exports.printCreature = function(cmc) {
  console.log('[API] Printing creature with CMC', cmc, '...');
  if (comm) {
    var sql =
      'SELECT data, name FROM Creatures WHERE cmc=' +
      cmc +
      ' ORDER BY RANDOM() LIMIT 1';
    console.log(sql);
    var ret = comm.printCard(sql, linebreaks);
    //last = { card: ret, table: 'Creatures' };
    console.log(ret);
  }
};

exports.printEquipment = function(cmc) {
  console.log('[API] Printing equipment with CMC', cmc, '...');
  if (comm) {
    var sql =
      'SELECT data, name FROM Equipment WHERE cmc<' +
      cmc +
      ' ORDER BY RANDOM() LIMIT 1';
    //log(sql);
    var ret = comm.printCard(sql, linebreaks);
    //last = { card: ret, table: 'Equipment' };
    console.log(ret);
  }

};

exports.fetchSorceries = function(callback) {
  callback(getJho(false));
};

exports.fetchInstants = function(callback) {
  callback(getJho(true));
};

function getJho(instant) {
  if (comm) {
    var text = instant ? 'INSTANTS' : 'SORCERIES';
    var jhos = comm.getJhos(
      'SELECT c.id, c.name, c.face, c.cost, c.color_ind, c.typeline, c.rules, ' +
      'c.color FROM (SELECT s.id FROM ' +
      text +
      ' s ORDER BY RANDOM() LIMIT 3) AS ss LEFT OUTER JOIN CARDDATA c ' +
      'ON ss.id=c.id ORDER BY c.id,c.face;',
      '', ''); // pass '', '' instead for real data (but no printing)
    //console.log(jhos);
    /*last = {
      table: text,
      jhos: JSON.parse(jhos)
    };*/
    return JSON.parse(jhos);
  } else {
    return instant ? fakeCards2 : fakeCards;
  }
}

var fakeCards = [
  {
    'id': 2032,
    'face': 1,
    'typeline': 'Sorcery',
    'color': 'G',
    'cost': '2G',
    'rules': 'Search your library for up to two basic land cards, reveal those cards, and put one onto the battlefield tapped and the other into your hand. Then shuffle your library.\n',
    'name': 'Cultivate'
  }, {
    'id': 1692,
    'face': 1,
    'typeline': 'Sorcery',
    'color': 'B',
    'cost': '8UUUU',
    'rules': 'Search target player\'s library for X cards, where X is the number of cards in your hand, and exile them. Then that player shuffles his or her library.\nEpic (For the rest of the game, you can\'t cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)\n',
    'name': 'Neverending Torment'
  }, {
    'id': 2337,
    'face': 1,
    'typeline': 'Sorcery',
    'color': 'R',
    'cost': '(W/U)(W/B)(U/B)(U/R)(B/R)(B/G)(R/G)(R/W)(G/W)(G/U)',
    'rules': 'Replicate {W/U}{W/B}{U/B}{U/R}{B/R}{B/G}{R/G}{R/W}{G/W}{G/U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nDestroy target artifact.\n{2/W}{2/U}{2/B}{2/R}{2/G}{W/P}{U/P}{B/P}{R/P}{G/P}\n',
    'name': 'Shattering Spree'
  }
];

var fakeCards2 = [
  {
    'id': 2032,
    'face': 1,
    'typeline': 'Instant',
    'color': 'G',
    'cost': '2G',
    'rules': 'Search your library for up to two basic land cards, reveal those cards, and put one onto the battlefield tapped and the other into your hand. Then shuffle your library.\n',
    'name': 'Cultivate'
  }, {
    'id': 1692,
    'face': 1,
    'typeline': 'Instant',
    'color': 'B',
    'cost': '8UUUU',
    'rules': 'Search target player\'s library for X cards, where X is the number of cards in your hand, and exile them. Then that player shuffles his or her library.\nEpic (For the rest of the game, you can\'t cast spells. At the beginning of each of your upkeeps, copy this spell except for its epic ability. You may choose a new target for the copy.)\n',
    'name': 'Neverending Torment'
  }, {
    'id': 2337,
    'face': 1,
    'typeline': 'Instant',
    'color': 'R',
    'cost': '(W/U)(W/B)(U/B)(U/R)(B/R)(B/G)(R/G)(R/W)(G/W)(G/U)',
    'rules': 'Replicate {W/U}{W/B}{U/B}{U/R}{B/R}{B/G}{R/G}{R/W}{G/W}{G/U} (When you cast this spell, copy it for each time you paid its replicate cost. You may choose new targets for the copies.)\nDestroy target artifact.\n{2/W}{2/U}{2/B}{2/R}{2/G}{W/P}{U/P}{B/P}{R/P}{G/P}\n',
    'name': 'Shattering Spree'
  }
];
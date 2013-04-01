var templates = require('./templates');

var _reminderTextPattern = /\([^)]+\)/g;
var _glyphPattern = /{([^}]+)}/g;
var _newLinePattern = /\n/g;

var _symbolMap = {
  'T': 't.gif',
  'Q': 'q.gif',

  'W': 'w.gif',
  'U': 'u.gif',
  'B': 'b.gif',
  'R': 'r.gif',
  'G': 'g.gif',

  'W/U': 'wu.gif',
  'W/B': 'wb.gif',
  'U/B': 'ub.gif',
  'U/R': 'ur.gif',
  'B/R': 'br.gif',
  'B/G': 'bg.gif',
  'R/G': 'rg.gif',
  'R/W': 'rw.gif',
  'G/W': 'gw.gif',
  'G/U': 'gu.gif',

  '2/W': '2w.png',
  '2/U': '2u.png',
  '2/B': '2b.png',
  '2/R': '2r.png',
  '2/G': '2g.png',

  'W/P': 'wp.png',
  'U/P': 'up.png',
  'B/P': 'bp.png',
  'R/P': 'rp.png',
  'G/P': 'gp.png',

  'X': 'x.gif',
  '0': '0.gif',
  '1': '1.gif',
  '2': '2.gif',
  '3': '3.gif',
  '4': '4.gif',
  '5': '5.gif',
  '6': '6.gif',
  '7': '7.gif',
  '8': '8.gif',
  '9': '9.gif',
  '10': '10.gif',
  '11': '11.gif',
  '12': '12.gif',
  '13': '13.gif',
  '14': '14.gif',
  '15': '15.gif',
  '16': '16.gif'
};

var _imgFragmentStart = '<span class="mtg-symbol" style="background-image: url(/img/mtg/symbols/';
var _imgFragmentEnd = ')"></span>'

function _wrapReminderText(match) {
  return '<span class="mtg-rt">' + match + '</span>';
}

function _replaceGlyphPattern(match, p1) {
  if (_symbolMap[p1]) {
    return _imgFragmentStart + _symbolMap[p1] + _imgFragmentEnd;
  } else {
    return '';
  }
}

exports.formatRulesText = function(rulesText) {
  return '<p>' + rulesText
    .replace(_reminderTextPattern, _wrapReminderText)
    .replace(_glyphPattern, _replaceGlyphPattern)
    .split('\n')
    .join('</p><p>') + '</p>';
}

exports.formatCastingCost = function(cost) {
  var symbols = [];
  var c, url;
  for (var a = 0; a < cost.length; a++) {
    c = cost[a];
    if (cost[a+1] == '/') {
      c = cost.substr(a, 3);
      a += 2;
    }
    if (url = _symbolMap[c]) {
      symbols.push(_imgFragmentStart + url + _imgFragmentEnd);
    }
  }
  return symbols.join('');
}

exports.buildCard = function(data) {
  var container = $('<div class="jh-card"></div>')[0];

  var cardEl = templates.build('lib/card.html', {
    name: data.name,
    cost: exports.formatCastingCost(data.cost),
    typeline: data.typeline,
    rules: exports.formatRulesText(data.rules)
  });

  return cardEl;
}
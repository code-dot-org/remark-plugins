const test = require('tape');

const {
  markdownToHtml,
  markdownToRedacted,
  sourceAndRedactedToRestored
} = require('./utils');

const fontAwesomeIcon = require('../src/fontAwesomeIcon');

const basicInput = "The slide icon <i class=\"fa fa-list-alt\" aria-hidden=\"true\"></i> indicates that there is a slide in the unit slide deck.";

test('fontAwesomeIcon plugin does not change any rendering', t => {
  t.plan(1);
  const output = markdownToHtml(basicInput, fontAwesomeIcon);
  t.equal(output, `<p>${basicInput}</p>`);
});

test('fontAwesomeIcon plugin redacts fontAwesomeIcons', t => {
  t.plan(1);
  const output = markdownToRedacted(basicInput, fontAwesomeIcon);
  t.equal(output, "The slide icon [list-alt][0] indicates that there is a slide in the unit slide deck.\n");
});

test('fontAwesomeIcon plugin can restore fontAwesomeIcons back to markdown', t => {
  t.plan(1);
  const redacted = "L'icône de diapositive [some-text][0] indique qu'il y a une diapositive dans la plate-forme de diapositives de l'unité."
  const output = sourceAndRedactedToRestored(basicInput, redacted, fontAwesomeIcon);
  const expected = "L'icône de diapositive <i class=\"fa fa-list-alt\" aria-hidden=\"true\"></i> indique qu'il y a une diapositive dans la plate-forme de diapositives de l'unité.\n"
  t.equal(output, expected);
});

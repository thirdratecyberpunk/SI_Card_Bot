/**
 * Utility method that returns the double adversary weighted difficulty
 * given two adversary difficulties
 * @param {*} a -> adversary A difficulty
 * @param {*} b -> adversary B difficulty
 * @param {*} lowWeight -> how much to alter lower bound by (defaults to 0.625 as this is the difficulty
 * used by the app:
 * The rulebook says "The combined Difficulty of two Adversaries is roughly equal to the higher of the two Difficulties plus 50-75% of the lower."
 *  We have to pick something, so checked with GTG, and we're using 62.5% (then rounded), but JE rules are vague)
 * @returns float
 */
function combineDifficulty(a, b, lowWeight = 0.625) {
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  return Math.round(high + lowWeight * low);
}
module.exports = { combineDifficulty };

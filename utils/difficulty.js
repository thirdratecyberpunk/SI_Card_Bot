/**
 * Utility method that returns the double adversary weighted difficulty
 * given two adversary difficulties
 * @param {*} a -> adversary A difficulty
 * @param {*} b -> adversary B difficulty
 * @param {*} lowWeight -> how much to alter lower bound by (defaults to 0.75, but JE rules are vague)
 * @returns float
 */
function combineDifficulty(a, b, lowWeight = 0.75) {
  const high = Math.max(a, b);
  const low = Math.min(a, b);
  return high + lowWeight * low;
}
module.exports = { combineDifficulty };

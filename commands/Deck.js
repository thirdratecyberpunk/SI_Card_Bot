const InvaderDeckCard = require("./InvaderDeckCard.js");

class Deck {
  constructor() {
    this.cards = [
      new InvaderDeckCard(1),
      new InvaderDeckCard(1),
      new InvaderDeckCard(1),
      new InvaderDeckCard(2),
      new InvaderDeckCard(2),
      new InvaderDeckCard(2),
      new InvaderDeckCard(2),
      new InvaderDeckCard(3),
      new InvaderDeckCard(3),
      new InvaderDeckCard(3),
      new InvaderDeckCard(3),
      new InvaderDeckCard(3),
    ];
  }
  /**
   * Returns an invader deck given an adversary and a level
   * @param {*} adv
   * @param {*} lvl
   * @param {*} strict
   */
  applyAdv(adv, lvl, strict = false) {
    if (!adv.deckModification.hasOwnProperty(lvl) && strict) {
      throw new Error(`${adv.title} doesn't have ${lvl} rule`);
    }

    for (let i = 0; i <= lvl; i++) {
      if (adv.deckModification.hasOwnProperty(lvl)) {
        this.cards = adv.deckModification[i](this.cards);
      }
    }
  }

  /**
   * "Accelerates" a deck -> i.e returns the deck after Discarding the topmost card of
   * the lowest Invader Stage remaining in the deck.
   * TODO: technically a deck of all Stage IIIs can be accelerated, should
   * change the logic to find the first index of the lowest stage but
   * this can be done when acceleration calculation is more required
   * @returns
   */
  accel() {
    const index = this.cards.findIndex((card) => card === 1 || card === 2);
    if (index === -1) {
      throw new Error("No 1 or 2 found in deck");
    }

    const card = this.cards.splice(index, 1)[0];
    return [index, card, this.cards];
  }

  /**
   * Returns a dashed representation of the current invader deck
   */
  formattedDeck() {
    let arr = this.cards;
    let result = [];
    let currentGroup = [arr[0]];

    for (let i = 1; i < arr.length; i++) {
      if (arr[i].stage === arr[i - 1].stage) {
        currentGroup.push(arr[i].cardSymbol);
      } else {
        result.push(
          currentGroup.length === 1
            ? String(currentGroup[0].cardSymbol)
            : String(currentGroup[0].cardSymbol) +
                currentGroup.slice(1).join(""),
        );
        currentGroup = [arr[i]];
      }
    }

    result.push(
      currentGroup.length === 1
        ? String(currentGroup[0].cardSymbol)
        : String(currentGroup[0].cardSymbol) + currentGroup.slice(1).join(""),
    );

    return result.join("-");
  }
}

module.exports = Deck;

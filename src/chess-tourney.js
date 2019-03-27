/* ----------------------------------------------------------------------------
*                               Chess Tourney js
*
* This file handles all of the tournament logic.
* At some point, this could turn into a standalone node module.
* --------------------------------------------------------------------------- */
const {chain, flatten, last, times, zip} = require('lodash');
const EloRank = require('elo-rank');
const {firstBy} = require('thenby');

/**
 * @constant KFACTOR The k-factor used for calculating ratings
 * @constant ELO     The EloRank object
 */
const KFACTOR = 16;
const ELO = new EloRank(KFACTOR);


/**
 * Represents an indivudal player.
 * @param {string} firstName
 * @param {string} lastName
 * @param {int}    rating
 */
class Player {
  constructor (firstName, lastName = '', rating = 1200) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.rating = rating;
    this.dummy = false;
  }
}

/**
 * A stand-in for bye matches.
 * @constant {Player} DUMMYPLAYER
 */
const DUMMYPLAYER =  new Player('Dummy');
DUMMYPLAYER.dummy = true;
DUMMYPLAYER.rating = 0;

/**
 * Tournament class
 * @param {string} name
 * @param {int}    timeControl
 * @param {array}  roster
 * @param {int}    byeValue
 */
class Tournament {
  constructor(name = '', timeControl = 15, roster = [], byeValue = 1) {
    this.name = name;
    this.timeControl = timeControl;
    this.roster = {
      all: roster,
      inactive: [],
      active: function() {
        return this.all.filter(i => !this.inactive.includes(i))
      }
    };
    this.roundList = [];
    this.byeValue = byeValue;
  }

  /**
   * Add a player to the roster.
   * @param {Player} player the player to add
   */
  addPlayer(player) {
    this.roster.all.push(player);
  }

  /**
   * Add a list of players to the roster.
   * @param {Array} players the list of players to add
   */
  addPlayers(players) {
    this.roster.all = this.roster.all.concat(players);
  }

  /**
   * Remove a player from the active roster. This player won't be placed in
   * future rounds.
   * @param {Player} player 
   */
  deactivatePlayer(player) {
    this.roster.inactive.push(player);
  }
  
  /**
   * Add a player to the active roster. This player will be placed in future
   * rounds.
   * @param {Player} player 
   */
  activatePlayer(player) {
    this.roster.inactive.splice(this.roster.inactive.indexOf(player), 1);
  }

  /**
   * Calculate number of rounds.
   * @returns {int} the number of rounds
   */
  numOfRounds() {
    return Math.ceil(Math.log2(this.roster.active().length));
  }

  /**
   * Calculate standings
   */
  calcStandings () {
    return true; // todo
  }

  /**
   * Get a list of all of a player's scores from each match.
   * @param {Player} player
   * @returns {array} the list of scores
   */
  playerScoreList(player, round = null) {
    var scores = [];
    if ( round === null) {
      round = this.roundList.length;
    }
    times(round + 1, i => {
      if(this.roundList[i] !== undefined) {
        this.roundList[i].matches.forEach(match => {
          var index = match.players.indexOf(player);
          if (index !== -1) {
            scores.push(match.result[index]);
          }
        });
      }
    });
    return scores;
  }

  /**
   * Get the total score of a player after a given round.
   * @param {Player} player 
   * @param {number} roundNum 
   */
  playerScore(player, roundNum = null) {
    var score = 0;
    var scores = this.playerScoreList(player, roundNum);
    if (scores.length > 0) {
      score = scores.reduce((a, b) => a + b);
    }
    return score;
  }

  /**
   * Get the cumulative score of a player
   * @param {Player} player 
   * @param {number} roundNum 
   */
  playerScoreCum(player, roundNum = null) {
    var runningScore = 0;
    var cumScores = []
    var scores = this.playerScoreList(player, roundNum);
    scores.forEach(score => {
      runningScore += score;
      cumScores.push(runningScore);
    });
    return cumScores.reduce((a, b) => a + b);;
  }

  /**
   * Calculate a player's color balance
   * @param {Player} player
   * @param {Int}    round The ID of the highest round to consider
   * @returns {Int} A negative number means they played as black more. A positive number means they played as white more.
   */
  playerColorBalance (player, round = null) {
    var color = 0;
    if ( round === null) {
      round = this.roundList.length;
    }
    times(round + 1, i => {
      if(this.roundList[i] !== undefined) {
        this.roundList[i].matches.forEach(match => {
          if (match.players[0] === player) {
            color += 1;
          } else if (match.players[1] === player) {
            color += -1;
          }
        });
      }
    });
    return color;
  }

  /**
   * Sort the standings by score and USCF tie-break rules from § 34. USCF
   * recommends using these methods in-order: modified median, solkoff, 
   * cumulative, and cumulative of opposition.
   * @param {number} roundNum 
   * @returns {Array} The sorted list of players
   */
  playerStandings(roundNum = null) {
    var playersClone = [].concat(this.roster.all);
    playersClone.sort(
      firstBy(p => this.playerScore(p, roundNum), -1)
      .thenBy(p => this.modifiedMedian(p, roundNum), -1) /* USCF § 34E1 */
      .thenBy(p => this.solkoff(p, roundNum), -1) /* USCF § 34E2 */
      .thenBy(p => this.playerScoreCum(p, roundNum), -1) /* USCF § 34E3 */
      .thenBy(p => this.playerOppScoreCum(p, roundNum), -1) /* USCF § 34E9 */
    );
    return playersClone;
  }

  /**
   * Gets the modified median factor defined in USCF § 34E1
   * @param {Player} player 
   * @param {number} roundNum 
   */
  modifiedMedian(player, roundNum = null, solkoff = false) {
    // get all of the opponent's scores
    var scores = this.playerOppHistory(player, roundNum)
      .map(opponent => this.playerScore(opponent, roundNum));
    //sort them, then remove the first and last items
    scores.sort();
    if (!solkoff) {
      scores.pop();
      scores.shift();
    }
    var finalScore = 0;
    if (scores.length > 0) {
      finalScore = scores.reduce((a,b) => a + b);
    }
    return finalScore;
  }
  
  /**
   * A shortcut for passing the `solkoff` variable to `this.modifiedMedian`.
   * @param {Player} player 
   * @param {number} roundNum 
   */
  solkoff(player, roundNum = null) {
    return this.modifiedMedian(player, roundNum, true);
  }

  /**
   * Generate a list of a player's opponents.
   * @param   {Player} player
   * @returns {Array} A list of past opponents
   */
  playerOppHistory(player, round = null) {
    var opponents = [];
    if ( round === null) {
      round = this.roundList.length - 1;
    }
    times(round + 1, i => {
      this.roundList[i].matches.forEach(match => {
        if (match.players.includes(player)) {
          opponents = opponents.concat(
            match.players
              .filter(player2 => player2 !== player)
              .filter(player2 => !opponents.includes(player2))
          );
        }
      });
    });
    return opponents
  }

  playerOppScoreCum(player, round = null) {
    const opponents = this.playerOppHistory(player, round);
    var oppScores = opponents.map(p => this.playerScoreCum(p, round));
    return oppScores.reduce((a, b) => a + b);
  }

  /**
   * Generates a new round.
   * @returns {Array} the new round
   */
  newRound() {
    var newRound = new Round(
      this,
      this.roundList.length,
      last(this.roundList),
      this.roster.active()
    );
    newRound.pairPlayers();
    this.roundList.push(newRound);
    return newRound;
  }
}

/**
 * Represents a round in a tournament.
 */
class Round {
  constructor(tourney, roundNum, prevRound, players) {
    this.roundNum = roundNum;
    this.tourney = tourney;
    this.roster = players;
    this.prevRound = prevRound;
    this.playerTree = {};
    this.matches = [];
    this.hasDummy = false;
  }

  /**
   * Pair the players
   */
  pairPlayers() {
    /**
     * Part 1: Split players into separate groups based on their scores
     * (USCF § 27A2)
     * Tree structure:
     * {
     *  score: [list of players],
     *  ...
     * }
     */
    this.roster.forEach(player => {
      var score = this.tourney.playerScore(player);
      if(!(score in this.playerTree)) {
        this.playerTree[score] = [];
      }
      this.playerTree[score].push(player);
    });
    /**
     * Part 2: Split each score group into an upper half and a lower half, 
     * based on rating (USCF § 27A3)
     * Tree structure:
     * {
     *  score: [
     *    [upper half list of players],
     *    [lower half list of players]
     *  ],
     *  ...
     * }
     */
    Object.keys(this.playerTree).reverse().forEach((score, i, scoreList) => {
      var players = this.playerTree[score];
      /**
       * If there's an odd number of players in this score group,
       */
      if (players.length % 2 !== 0) {
        /**
         * ...and if there's an odd number of players in the total round, then
         * add a dummy player.
         */
        if (this.roster.length % 2 !== 0 && !this.hasDummy) {
          players.push(DUMMYPLAYER);
          this.hasDummy = true;
        /**
         * But if there's an even number of players in the total round, then
         * just move a player to the next score group.
         */
        } else {
          var oddPlayer = players[players.length - 1];
          players.splice(players.length - 1, 1);
          var newGroup = scoreList[i + 1]; // the group to move the player to
          if(!(newGroup in this.playerTree)) {
            this.playerTree[newGroup] = [];
          }
          this.playerTree[newGroup].push(oddPlayer);
        }
      }
      /**
       * If there are no players in this group (e.g. a lone player got pushed
       * to another group) then delete the key.
       */
      if (players.length === 0) {
        delete this.playerTree[score];
      } else {
        this.playerTree[score] = chain(players)
        .sortBy('rating')
        .reverse()
        .chunk(players.length / 2)
        .value();
      }
    });
    Object.keys(this.playerTree).forEach(score => {
      // name the upperHalf and lowerHalf to make the code easier to read
      var upperHalf = this.playerTree[score][0];
      var lowerHalf = this.playerTree[score][1];
      /**
       * If there was no previous round, zip the players and call it a day.
       */
      if (this.prevRound === undefined) {
        zip(upperHalf, lowerHalf)
          .forEach(match => 
            this.matches.push(new Match(this, ...match))
          );
      } else {
        /**
         * If there was a previous round, then things get complicated....
         * 1. Record each upper-half player's opponent history
         * 2. Iterate through each upper-half player to find an opponent in the
         *    lower half
         * 3. Attempt to match with a lower-half opponent who isn't in their
         *    history yet AND who is in the history of other upper-half
         *    players. The second part helps eliminate a small percentage of
         *    history overlap.
         *      * (USCF § 27A1 - highest priority rule)
         * 4. If no opponent was found, try again but don't consider the
         *    history of other upper-half players.
         * 5. If still no opponent was found, just pick whoever is left in the
         *    lower half, even if they've played each other before.
         * 6. If they have played each other before, attempt to swap opponents
         *    with another upper-half player.
         * 
         * This code is certainly not the most reliable or the most efficient.
         * Changes will be needed.
         */
        /**
         * 1.
         * @var {Array} upperHalfHistory Each index matches the player's indexin upperHalf. Each sub-array is a list of their opponents.
         */
        try {
          var upperHalfHistory = upperHalf.map(p => 
            [].concat(lowerHalf).concat(upperHalf) // merge the upperHalf and lowerHalf
              .filter(p2 =>
                this.tourney.playerOppHistory(p2).includes(p) // filter the players who have played this player
              )
          );
        } catch (error) {
          console.log(score, this.playerTree[score]);
          throw error;
        }
        /**
         * 2.
         */
        upperHalf.forEach(player1 => {
          var history = upperHalfHistory[upperHalf.indexOf(player1)];
          var othersHistory = flatten(upperHalfHistory
            .slice(upperHalf.indexOf(player1))
          );
          /**
           * 3.
           */
          var [ player2, match ] = this
            ._findAMatch(player1, lowerHalf.filter(x =>
              othersHistory.includes(x)), history
          );
          /**
           * 4.
           */
          if (!player2) {
            [ player2, match ] = this._findAMatch(player1, lowerHalf, history);
          }
          /**
           * 5.
           */
          if (!player2) {
            [ player2, match ] = this._findAMatch(player1, lowerHalf, []);
          }
          /**
           * 6.
           */
          if (history.includes(player2)) {
            var foundASwap = false;
            upperHalf.filter(p => p !== player1).forEach(otherPlayer => {
              if(!foundASwap) {
                var otherMatch = this.matches
                  .filter(m => m.players.includes(otherPlayer))[0];
                if(otherMatch) {
                  var otherPlayer2 = otherMatch.players
                    .filter(p => p !== otherPlayer)[0];
                  var otherHistory = upperHalfHistory[upperHalf
                    .indexOf(otherPlayer)];
                  if (!history.includes(otherPlayer2)
                      && !otherHistory.includes(player2)) {
                    match.players = [player1, otherPlayer2];
                    otherMatch.players = [otherPlayer, player2];
                    foundASwap = true;
                  }
                }
              }
            })
          }
        })
      }
    })
    return this.matches;
  }
  
  /**
   * Find a match for a given player.
   * @param   {Player} player1  The player to be paired
   * @param   {Array}  pool      The pool of available players
   * @param   {Array}  blackList A blacklist of players, possibly in the pool, who should not be paired
   * @returns {Array}  The paired player and the Match object. Both will be undefined if no match was made.
   */
  _findAMatch (player1, pool, blackList = []) {
    /**
     * Try to pair the player as the opposite color as their last round.
     * (USCF § 27A4 and § 27A5)
     */
    var lastColor = this.prevRound.playerColor(player1);
    var hasntPlayed = pool
      .filter(p2 => !blackList.includes(p2)) // Filter anyone on the blacklist (e.g. past opponents [USCF § 27A1])
      .filter(p2 => p2 !== player1) // Don't pair players with themselves
      .filter(p2 => !flatten(this.matches.map(m => m.players)).includes(p2)); // Don't pair anyone who's already been paired
    /**
     * Prioritize opponents who played that color for *their* last round. (USCF § 27A4 and § 27A5)
     */
    var oppColor = pool
      .filter(p2 => lastColor !== this.prevRound.playerColor(p2));
    var player2 = hasntPlayed
      .filter(p2 => oppColor.includes(p2))[0] || hasntPlayed[0];
    var newMatch;
    if (player2) {
      newMatch = new Match(this, player1, player2);
      if (this.tourney.playerColorBalance(player1) > this.tourney.playerColorBalance(player2)) {
        newMatch.players.reverse();
      }
      this.matches.push(newMatch);
    }
    return [ player2, newMatch ];
  }

  /**
   * Sees what color a player was for this round.
   * @param {Player} player 
   * @return {number} 0 for white and 1 for black
   */
  playerColor(player) {
    var color = -1;
    this.matches.forEach(match => {
      if (match.players.includes(player)) {
        color = match.players.indexOf(player);
      }
    })
    return color;
  }

  /**
   * Add a player to the roster
   *
   * @param {Player} player
   */
  addPlayer(player) {
    this.players.push(player);
  }
}

/**
 * Represents a match in a tournament.
 *
 * @param {Player} black
 * @param {Player} white
 */
class Match {
  constructor(round, white, black) {
    this.round = round;
    this.players = [white, black];
    this.result = [0, 0];
    this.scoreExpected = [0, 0]; // used for the Elo calculator
    this.origRating = [white.rating, black.rating]; // cache the ratings from when the match began
    this.newRating = [white.rating, black.rating]; // the newly calculated ratings after the match ends
    // set bye rounds
    const dummies = this.players.map(p => p.dummy);
    if (dummies[0]) {
      this.result = [0, 1];
    } else if(dummies[1]) {
      this.result = [1, 0];
    }
  }

  get whitePlayer() {
    return this.players[0];
  }

  get blackPlayer() {
    return this.players[1];
  }

  get whiteOrigRating() {
    return this.origRating[0];
  }

  get blackOrigRating() {
    return this.origRating[1];
  }

  get isComplete() {
    return this.result.reduce((a, b) => a + b) !== 0;
  }

  /**
   * Sets black as the winner.
   */
  blackWon() {
    this.result = [0, 1];
    this.calcRatings();
  }

  /**
   * Sets white as the winner.
   */
  whiteWon() {
    this.result = [1, 0];
    this.calcRatings();
  }

  /**
   * Sets result as a draw.
   */
  draw() {
    this.result = [0.5, 0.5];
    this.calcRatings();
  }

  resetResult() {
    this.result = [0, 0];
    this.newRating = this.origRating;
  }

  get isBye() {
    return this.players.includes(DUMMYPLAYER);
  }

  calcRatings() {
    this.scoreExpected = [
      ELO.getExpected(this.whiteOrigRating, this.blackOrigRating),
      ELO.getExpected(this.blackOrigRating, this.whiteOrigRating),
    ];
    this.newRating = [
      ELO.updateRating(this.scoreExpected[0], this.result[0], this.whiteOrigRating),
      ELO.updateRating(this.scoreExpected[1], this.result[1], this.blackOrigRating)
    ];
    this.whitePlayer.rating = this.newRating[0];
    this.blackPlayer.rating = this.newRating[1];
  }
}

// This fails for some reason...
// module.exports = {Tournament, Player};

export {Tournament, Player};

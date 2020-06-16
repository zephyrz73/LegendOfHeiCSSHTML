/**
 * Name: Zephyr Zhou
 * Date: 05/13/2020
 * Section: CSE 154 _AK
 *
 * -- your description of what this file does here --
 * This is the homework for pokemon go that we develop a pokedex for every pokemon
 * and also the game implementation for pokemon cards
 */
"use strict";
(function() {
  let imageUrl = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/";
  let dexUrl = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/pokedex.php";
  let gameUrl = "https://courses.cs.washington.edu/courses/cse154/webservices/pokedex/game.php";
  let userPokemon;
  let oppPokemon;
  let guid;
  let pid;

  window.addEventListener("load", init);

  /**
   * It initialize the game state: set the sprite board, enable the start button
   * flee button and endgame button
   */
  function init() {
    qs("#p1 .card-container #start-btn").classList.add("hidden");
    setSpritesBoard();
    qs("#p1 .card-container #start-btn").addEventListener("click", enterGameView);
    qs("#p1 .card-container #flee-btn").addEventListener("click", fleeGame);
    qs("#p1 .card-container #endgame").addEventListener('click', () => toggleView(0));
  }

  /**
   * What will happen if poke flee the game: determine win or lost quickly,
   * flee message appears, hide the opponent poke's move.
   */
  function fleeGame() {
    winOrLost(0);
    fetchMoveResult("flee");
    qs("#results-container #p2-turn-results").classList.add("hidden");
  }

  /**
   * Enter the game view with two poke cards displayed.
   */
  function enterGameView() {
    toggleView(1);
    let params = new FormData();
    params.append("startgame", "true");
    params.append("mypokemon", userPokemon);
    fetch(gameUrl, {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(processInitialGameData)
      .catch(console.error);
    qs("#p1 .card-container .hp-info").classList.remove("hidden");
    qs("#p1 .card-container #start-btn").classList.add("hidden");
    id("results-container").classList.remove("hidden");
    qs("#p1 .card-container #flee-btn").classList.remove("hidden");
    qs("header h1").textContent = "Pokemon Battle Mode!";
    let buttons = qs("#p1 .card-container .card .moves").children;
    for (let i = 0; i < buttons.length; i++) {
      buttons.item(i).addEventListener("click", onClickMove);
    }
    toggleAllowMove(1);
  }

  /**
   * When click the move button we want to fetch the move result
   * by move name we clicked on
   */
  function onClickMove() {
    let clickMoveName = this.children.item(0).textContent.toLowerCase();
    fetchMoveResult(clickMoveName);
  }

  /**
   * Fetch the move result data from API.
   * @param {string} moveName the name of move we selected
   */
  function fetchMoveResult(moveName) {
    let moveParams = new FormData();
    moveParams.append("guid", guid);
    moveParams.append("pid", pid);
    moveParams.append("movename", moveName);
    qs("#results-container #loading").classList.remove("hidden");
    fetch(gameUrl, {method: "POST", body: moveParams})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(showMoveResult)
      .catch(console.error);
  }

  /**
   * Process the move result get from API and display it.
   * @param {object} moveResult the move result from API
   */
  function showMoveResult(moveResult) {
    qs("#results-container #loading").classList.add("hidden");
    let results = moveResult.results;
    if (results["p1-move"]) {
      let p1TurnResult = qs("#results-container #p1-turn-results");
      p1TurnResult.classList.remove("hidden");
      p1TurnResult.textContent = "Player 1 played " +
          results["p1-move"] +
          " and " +
          results["p1-result"];
    }
    if (results["p2-move"]) {
      let p2TurnResult = qs("#results-container #p2-turn-results");
      p2TurnResult.classList.remove("hidden");
      p2TurnResult.textContent = "Player 2 played " +
          results["p2-move"] +
          " and " +
          results["p2-result"];
    }
    updateHealth(moveResult);
  }

  /**
   * Deal with the health change caused by move. Calculated percentage
   * and update the width of health bar
   * @param {object} moveResult the move result from API
   */
  function updateHealth(moveResult) {
    const floatCvt = 1.0;
    const percentCvt = 100;
    const lowHealththreshold = 0.2;
    let p1hpText = qs("#p1 .card-container .card .hp");
    let p2hpText = qs("#p2 .card-container .card .hp");
    p1hpText.textContent = moveResult.p1["current-hp"] + "HP";
    p2hpText.textContent = moveResult.p2["current-hp"] + "HP";
    const p1Percentage = moveResult.p1["current-hp"] * floatCvt / moveResult.p1.hp;
    const p2Percentage = moveResult.p2["current-hp"] * floatCvt / moveResult.p2.hp;
    qs("#p1 .card-container .health-bar").style.width = p1Percentage * percentCvt + "%";
    if (p1Percentage < lowHealththreshold) {
      qs("#p1 .card-container .health-bar").classList.add("low-health");
    }
    qs("#p2 .card-container .health-bar").style.width = p2Percentage * percentCvt + "%";
    if (p2Percentage < lowHealththreshold) {
      qs("#p2 .card-container .health-bar").classList.add("low-health");
    }
    if (p1Percentage === 0 || p2Percentage === 0) {
      if (p1Percentage === 0) {
        winOrLost(0);
      }
      if (p2Percentage === 0) {
        winOrLost(1);
      }
    } else {
      toggleAllowMove(1);
    }
  }

  /**
   * Determine things happens for minning and losing.
   * @param {number} winCode 0 means lost and 1 means win
   */
  function winOrLost(winCode) {
    if (winCode === 0) {
      qs("header h1").textContent = "You lost!";
      let healthBar = qs("#p1 .card-container .health-bar");
      if (!healthBar.classList.contains("low-health")) {
        healthBar.classList.add("low-health");
      }
      healthBar.style.width = "0%";
    }
    if (winCode === 1) {
      qs("header h1").textContent = "You won!";
      if (!qs("main #pokedex-view #" + oppPokemon).classList.contains("found")) {
        qs("main #pokedex-view #" + oppPokemon).classList.add("found");
        qs("main #pokedex-view #" + oppPokemon).addEventListener("click", getPokeData);
      }
    }
    toggleAllowMove(0);
    qs("#p1 .card-container #flee-btn").classList.add("hidden");
    qs("#p1 .card-container #endgame").classList.remove("hidden");
    let buttons = qs("#p1 .card-container .card .moves").children;
    for (let i = 0; i < buttons.length; i++) {
      buttons.item(i).removeEventListener("click", onClickMove);
    }
  }

  /**
   * Process and set the opponent data. Save uid and pid
   * @param {object} gameData the data get from fetching move result
   */
  function processInitialGameData(gameData) {
    setPokeCards(gameData.p2, 2);
    oppPokemon = gameData.p2.name.toLowerCase();
    guid = gameData.guid;
    pid = gameData.pid;
  }

  /**
   * Add event listener to sprite on sprite board for
   * every poke founded.
   */
  function addListenerToFound() {
    let sprites = qs("main #pokedex-view").childNodes;
    for (let i = 0; i < sprites.length; i++) {
      if (sprites[i].classList.contains("found")) {
        sprites[i].addEventListener("click", getPokeData);
      }
    }
  }

  /**
   * Toggle disable attribute for all the move button
   * @param {number} disableCode 1 means need to disable 0 means not
   */
  function toggleAllowMove(disableCode) {
    let buttons = qs("#p1 .card-container .card .moves").children;
    for (let i = 0; i < buttons.length; i++) {
      if (disableCode === 1) {
        buttons[i].disabled = false;
      }
      if (disableCode === 0) {
        buttons[i].disabled = true;
      }
    }
  }

  /**
   * Toggle the view according to the view code.
   * @param {number} viewCode 1 is the dex view 0 is the game view
   */
  function toggleView(viewCode) {
    if (viewCode === 1) {
      qs("#pokedex-view").classList.add("hidden");
      qs("#p2").classList.remove("hidden");
    }
    if (viewCode === 0) {
      qs("#pokedex-view").classList.remove("hidden");
      qs("#p2").classList.add("hidden");
      qs("#results-container").classList.add("hidden");
      qs("#p1 .card-container .hp-info").classList.add("hidden");
      qs("#p1 .card-container #start-btn").classList.remove("hidden");
      qs("#p1 .card-container #endgame").classList.add("hidden");
      qs("header h1").textContent = "Your Pokedex";
      qs("#p1 .card-container .health-bar").style.width = "100%";
      qs("#p1 .card-container .health-bar").classList.remove("low-health");
      qs("#p2 .card-container .health-bar").style.width = "100%";
      qs("#p2 .card-container .health-bar").classList.remove("low-health");
    }
  }

  /**
   * Fetch the sprite name from API.
   */
  function setSpritesBoard() {
    let spriteUrl = dexUrl + "?pokedex=all";
    fetch(spriteUrl)
      .then(checkStatus)
      .then(response => response.text())
      .then(addStartSprite)
      .catch(console.error);
  }

  /**
   * Parse the sprite names and populate sprite board.
   * @param {text} spriteData sprite names got from API
   */
  function addStartSprite(spriteData) {
    const numberOfSprite = 151;
    let withColonArray = spriteData.split("\n");
    for (let i = 0; i < numberOfSprite; i++) {
      let nameWithoutColon = withColonArray[i].split(":");
      let spriteSrc = imageUrl + "sprites/" + nameWithoutColon[1] + ".png";
      let spriteBlock = gen("img");
      spriteBlock.src = spriteSrc;
      spriteBlock.alt = nameWithoutColon[0] + "'s sprite";
      spriteBlock.id = nameWithoutColon[1];
      spriteBlock.classList.add("sprite");
      id("pokedex-view").appendChild(spriteBlock);
      if (nameWithoutColon[0] === "Bulbasaur" ||
          nameWithoutColon[0] === "Charmander" ||
          nameWithoutColon[0] === "Squirtle") {
        spriteBlock.classList.add("found");
      }
    }
    addListenerToFound();
  }

  /**
   * Fetch poke data from API by poke name
   */
  function getPokeData() {
    qs("#p1 .card-container #start-btn").classList.remove("hidden");
    userPokemon = this.id;
    let pokeInfoUrl = dexUrl + "?pokemon=" + userPokemon;
    fetch(pokeInfoUrl)
      .then(checkStatus)
      .then(response => response.json())
      .then(function(data) {
        setPokeCards(data, 1);
      })
      .catch(console.error);
  }

  /**
   * Set up player's pokemon card
   * @param {object} pokeData poke information got from API
   * @param {number} personId player number
   */
  function setPokeCards(pokeData, personId) {
    let typeIconImageSrc = imageUrl + pokeData.images.typeIcon;
    let cardString = "#p" + personId + " .card-container .card ";
    qs(cardString + ".type").src = typeIconImageSrc;
    let weaknessIconImageSrc = imageUrl + pokeData.images.weaknessIcon;
    qs(cardString + ".weakness").src = weaknessIconImageSrc;
    let pokeImageSrc = imageUrl + pokeData.images.photo;
    qs(cardString + ".pokepic").src = pokeImageSrc;
    qs(cardString + ".name").textContent = pokeData.name;
    qs(cardString + ".hp").textContent = pokeData.hp + "HP";
    qs(cardString + ".info").textContent = pokeData.info.description;
    let movesArray = pokeData.moves;
    let buttonArr = qsa(cardString + ".moves button");
    setUpMoveButton(buttonArr, movesArray);
  }

  /**
   * Set up the move button including the local, name and DP
   * @param {Array} buttonArr the list of move buttons
   * @param {Array} movesArray the array of moves
   */
  function setUpMoveButton(buttonArr, movesArray) {
    for (let i = 0; i < buttonArr.length; i++) {
      let moveDp = buttonArr[i].children.item(1);
      if (i < movesArray.length) {
        buttonArr[i].disabled = true;
        buttonArr[i].classList.remove("hidden");
        buttonArr[i].children.item(0).textContent = movesArray[i].name;
        if (movesArray[i].dp) {
          moveDp.classList.remove("hidden");
          moveDp.textContent = movesArray[i].dp + " DP";
        } else {
          moveDp.classList.add("hidden");
          moveDp.textContent = "";
        }
        let moveType = movesArray[i].type;
        let moveTypeIconSrc = imageUrl + "icons/" + moveType + ".jpg";
        buttonArr[i].children.item(2).src = moveTypeIconSrc;
      } else {
        buttonArr[i].classList.add("hidden");
        moveDp.textContent = "";
      }
    }
  }

  /** ------------------------------ Helper Functions  ------------------------------ */

  /**
   * See if the connction works, if there is an error output that request
   * error.
   * @param {object} response the response from attempting get connection
   * @returns {object} response if response is ok or error if it is not
   */
  function checkStatus(response) {
    if (response.ok) {
      return response;
    } else {
      throw Error("Request Error: " + response.statusText);
    }
  }

  /**
   * Returns the element that has the ID attribute with the specified value.
   * @param {string} idName - element ID
   * @returns {object} DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Returns the first element that matches the given CSS selector.
   * @param {string} selector - CSS query selector.
   * @returns {object} The first DOM object matching the query.
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Returns the array of elements that match the given CSS selector.
   * @param {string} selector - CSS query selector
   * @returns {object[]} array of DOM objects matching the query.
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();

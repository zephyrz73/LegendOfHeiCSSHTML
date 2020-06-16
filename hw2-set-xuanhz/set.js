"use strict";
(function() {
  // Required module globals
  let timerId;
  let remainingSeconds;

  const ONE_SECOND = 1000;
  let style = ["solid", "outline", "striped"];
  let color = ["green", "purple", "red"];
  let shape = ["diamond", "oval", "squiggle"];
  let count = [1, 2, 3];
  let easy = true;
  window.addEventListener("load", init);

  /**
   * Initialize the game, click the start button to make the game start
   */
  function init() {
    qs("#menu-view #start-btn").addEventListener('click', startGame);
  }

  /**
   * Start the game:
   * View changed to game view, get select difficulties create the board,
   * figure out refresh button and start the timer
   */
  function startGame() {
    toggleViews();
    if (st('input')[1].checked) {
      easy = false;
    } else {
      easy = true;
    }
    createBoard();
    qs("#game-view #details-bar #refresh-btn").addEventListener('click', refreshBoard);
    startTimer();
  }

  /**
   * Create the board with different number of cards according to the
   * difficulty, also implement the back to home button
   */
  function createBoard() {
    let cardNumber;
    const easyCardNumber = 9;
    const hardCardNumber = 12;
    if (easy) {
      cardNumber = easyCardNumber;
    } else {
      cardNumber = hardCardNumber;
    }
    for (let i = 0; i < cardNumber; i++) {
      let cards = generateUniqueCard(easy);
      qs("#game-view #board").appendChild(cards);
    }
    qs("#game-view #details-bar #back-btn").addEventListener('click', backButton);
  }

  /**
   * The behavior after the backButton was clicked. Set count set
   * to zero, board was cleaned up. Switch to the menu view,
   * timer cleaned up.
   */
  function backButton() {
    qs("#game-view #details-bar #set-count").textContent = 0;
    qs("#game-view #details-bar #refresh-btn").removeAttribute("disabled");
    cleanBoard();
    toggleViews();
    clearInterval(timerId);
  }

  /**
   * Switch view between the menu view and the game view
   */
  function toggleViews() {
    if (id("game-view").classList.contains("hidden")) {
      id("menu-view").classList.add("hidden");
      id("game-view").classList.remove("hidden");
    } else {
      id("menu-view").classList.remove("hidden");
      id("game-view").classList.add("hidden");
    }
  }

  /**
   * Generate randome attributes for cards
   * @param {boolean} isEasy the level of difficulty
   * @return {string[]} array storing random generated attributes
   */
  function generateRandomAttributes(isEasy) {
    let requireStyle = "solid";
    let requireColor = "";
    let requireShape = "";
    let requireCount = "";
    if (!isEasy) {
      const randIndex1 = Math.floor(Math.random() * 3);
      requireStyle = style[randIndex1];
    }
    const randIndex2 = Math.floor(Math.random() * 3);
    requireColor = color[randIndex2];
    const randIndex3 = Math.floor(Math.random() * 3);
    requireShape = shape[randIndex3];
    const randIndex4 = Math.floor(Math.random() * 3);
    requireCount = count[randIndex4];
    return [requireStyle, requireShape, requireColor, requireCount];
  }

  /**
   * It generate unique card that has not appeared in the board
   * @param {boolean} isEasy the difficulty level
   * @return {object} a div element with COUNT number of img elements
   * append as its children.
   */
  function generateUniqueCard(isEasy) {
    let card = gen("div");
    card.classList.add("card");
    let randAttributes = generateRandomAttributes(isEasy);
    let uniqueCount = randAttributes[3];
    let stringAttributes = randAttributes[0] + "-" +
    randAttributes[1] + "-" + randAttributes[2];
    let withCount = stringAttributes + "-" + uniqueCount;
    while (qs("#game-view #board").contains(id(withCount))) {
      randAttributes = generateRandomAttributes(isEasy);
      uniqueCount = randAttributes[3];
      stringAttributes = randAttributes[0] + "-" + randAttributes[1] +
      "-" + randAttributes[2];
      withCount = stringAttributes + "-" + uniqueCount;
    }
    card.id = withCount;
    for (let i = 0; i < uniqueCount; i++) {
      let img = gen("img");
      img.src = "img/" + stringAttributes + ".png";
      img.alt = withCount;
      card.appendChild(img);
    }
    card.addEventListener('click', cardSelected);
    return card;
  }

  /**
   * Starts the timer for a new game.
   */
  function startTimer() {
    let index = qs("#menu-view select").selectedIndex;
    remainingSeconds = qs("#menu-view select").options[index].value;
    let timeString = timeFormatting(remainingSeconds);
    qs("#game-view #time").textContent = timeString;
    timerId = setInterval(advanceTimer, ONE_SECOND);
  }

  /**
   * Change number of seconds to formated time string
   * @param {const} seconds given number of seconds
   * @return {string} formated string with seconds
   */
  function timeFormatting(seconds) {
    const secPerMin = 60;
    const min = Math.floor(seconds / secPerMin);
    const sec = seconds - min * secPerMin;
    const ten = 10;
    let minString = min.toString();
    let secString = sec.toString();
    if (min < ten) {
      minString = "0" + min;
    }
    if (sec < ten) {
      secString = "0" + sec;
    }
    return minString + ":" + secString;
  }

  /**
   * Updates the game timer (module-global and #time shown on page) by 1 second.
   */
  function advanceTimer() {
    if (remainingSeconds === 1) {
      qs("#game-view #time").textContent = "00:00";
      noTimeEndGame();
    } else {
      remainingSeconds -= 1;
      let newTimeString = timeFormatting(remainingSeconds);
      qs("#game-view #time").textContent = newTimeString;
    }
  }

  /**
   * Clear the board, remove all cards.
   */
  function cleanBoard() {
    qsa("#game-view #board *").forEach(card => card.remove());
  }

  /**
   * Refresh the board. Clear up the cards in the board and
   * regenerate the board.
   */
  function refreshBoard() {
    cleanBoard();
    createBoard();
  }

  /**
   * Toggle the select status of given node.
   * @param {object} node the node that have to be toggled select status
   */
  function toggleSelect(node) {
    if (!node.classList.contains("selected")) {
      node.classList.add("selected");
    } else {
      node.classList.remove("selected");
    }
  }

  /**
   * Used when a card is selected, checking how many cards are
   * currently selected. If 3 cards are selected, uses isASet
   * (provided) to handle "correct" and "incorrect" cases. No
   * return value.
   */
  function cardSelected() {
    toggleSelect(this);
    if (qsa(".card.selected").length === 3) {
      let selectedCards = qsa(".card.selected");
      let boolIsASet = isASet(selectedCards);
      if (boolIsASet) {
        const setCount = parseInt(qs("#game-view #details-bar #set-count").textContent) + 1;
        qs("#game-view #details-bar #set-count").textContent = setCount;
      }
      for (let i = 0; i < 3; i++) {
        selectedCards[i].classList.remove("selected");
        let setText = gen("p");
        if (boolIsASet) {
          setText.textContent = "SET!";
          let card = generateUniqueCard(easy);
          qs("#game-view #board").replaceChild(card, selectedCards[i]);
          card.classList.add("hide-imgs");
          card.appendChild(setText);
        } else {
          setText.textContent = "Not a Set";
          selectedCards[i].classList.add("hide-imgs");
          selectedCards[i].appendChild(setText);
        }
      }
      setTimeout(revealImage, ONE_SECOND);
    }
  }

  /**
   * If there is no time left end the game. Any cards currently selected
   * should appear unselected.To ensure a user cannot continue playing
   * until a new game is started, nothing should happen when a
   * user clicks on a card. The "Refresh Board" button should also be disabled
   * until it is re-enabled after clicking #back-btn.
   * timer stopped.
   */
  function noTimeEndGame() {
    clearInterval(timerId);
    qs("#game-view #details-bar #refresh-btn").disabled = true;
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].classList.contains("selected")) {
        cards[i].classList.remove("selected");
      }
      cards[i].removeEventListener('click', cardSelected);
    }
  }

  /**
   * Reveal the cards image after showing SET! or Not a Set! text.
   */
  function revealImage() {
    let hideImage = qsa(".card.hide-imgs");
    for (let i = 0; i < 3; i++) {
      hideImage[i].removeChild(hideImage[i].lastChild);
      hideImage[i].classList.remove("hide-imgs");
    }
  }

  /**
   * Checks to see if the three selected cards make up a valid set.
   * This is done by comparing each of the type of attribute against
   * the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set.
   * If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to
   * check if a set.
   * @return {boolean} true if valid set false otherwise.
   */
  function isASet(selected) {
    let attribute = [];
    for (let i = 0; i < selected.length; i++) {
      attribute.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attribute[0].length; i++) {
      let allSame = attribute[0][i] === attribute[1][i] &&
                    attribute[1][i] === attribute[2][i];
      let allDiff = attribute[0][i] !== attribute[1][i] &&
                    attribute[1][i] !== attribute[2][i] &&
                    attribute[0][i] !== attribute[2][i];
      if (!(allSame || allDiff)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Fetch the id required.
   * @param {string} idName the id need to fetch
   * @returns {object} the node with the given id
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * Fetch the node with selector provided
   * @param {string} selector the provided selector
   * @returns {object} the node with corresponding selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }

  /**
   * Fetch all node under provided selector.
   * @param {string} selector provided selector
   * @returns {object[]} all node with corresponding selector
   */
  function qsa(selector) {
    return document.querySelectorAll(selector);
  }

  /**
   * Generate a new item with type as
   * providing tag.
   * @param {string} tagName provided tag
   * @returns {object} the node created with the tag
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }

  /**
   * Search element by tagName.
   * @param {String} tagName provided tag
   * @returns {object} the node with the tag
   */
  function st(tagName) {
    return document.getElementsByTagName(tagName);
  }
})();
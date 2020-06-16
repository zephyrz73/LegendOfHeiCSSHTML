/**
 * Name: Zephyr Zhou
 * Date: 06/05/2020
 * Section: CSE 154 _AK
 *
 * This specify the zoomingo front end behavior including start
 * the bingo game and pass info to server to store
 *
 */
"use strict";
(function() {

  let selectedSize;
  let timer;
  window.addEventListener("load", init);

  /**
   * the init function ad event listenners to all buttons
   * and drop down list for size change
   */
  function init() {
    qs("#small-btn-field #resume")
      .addEventListener("click", resumeGame);
    qs("#small-btn-field #new-game")
      .addEventListener("click", startNewGame);
    qs("#small-btn-field #reset")
      .addEventListener("click", resetGame);
    qs("#play-view #bingo").addEventListener("click", bingo);
    qs("#input-view #size-input #size-select").addEventListener("change", onBoardSizeChange);
  }

  /**
   * It define behavior when resume button clicked which is
   * to use saved game_id and player id to get the saved data to resume
   */
  function resumeGame() {
    if (localStorage.getItem("player_id") || localStorage.getItem("game_id") ||
    !isNaN(parseInt(localStorage.getItem("player_id"), 10)) ||
    !isNaN(parseInt(localStorage.getItem("game_id"), 10))) {
      let gameID = localStorage.getItem("game_id");
      let playerID = localStorage.getItem("player_id");
      let resumeURL = "/resumeGame?game_id=" + gameID + "&player_id=" + playerID;
      fetch(resumeURL)
        .then(checkStatus)
        .then(resp => resp.json())
        .then(handleResumedData)
        .catch(handleError);
    }
  }

  /**
   * It handle data got from API and update the board to reflect
   * the saved data and resume the game
   * @param {object} resumeData the resumed data passed from API
   */
  function handleResumedData(resumeData) {
    qs("input").disabled = true;
    qs("input").value = resumeData.player.name;
    qs("select").disabled = true;
    let resumeBoardArr = resumeData.player.board;
    let resumeSelectedArr = resumeData.player["selected_scenarios"];
    selectedSize = resumeBoardArr.length;
    qs("select").selectedIndex = Math.sqrt(selectedSize) - 2;
    generateBlankBoard();
    populateBoard(resumeData, true);
    let square = qsa("#play-view #board .square");
    for (let i = 0; i < square.length; i++) {
      if (resumeSelectedArr.includes(parseInt(square[i].firstChild.id, 10))) {
        square[i].classList.add("selected");
        square[i].removeEventListener("click", onClickScenario);
      }
    }

  }

  /**
   * If the board size change, remove everything once in
   * board before.
   */
  function onBoardSizeChange() {
    qsa("#play-view #board *").forEach(node => node.remove());
    selectedSize = this.options[this.selectedIndex].value;
    generateBlankBoard();
  }

  /**
   * Generate a blank board according to users' choice
   */
  function generateBlankBoard() {
    const widthOfBoard = 100;
    let board = qs("#play-view #board");
    let sideSize = Math.sqrt(selectedSize);
    let squareWidth = Math.floor(widthOfBoard / sideSize);
    for (let i = 0; i < selectedSize; i++) {
      let square = gen("div");
      square.classList.add("square");
      let scenario = gen("p");
      scenario.classList.add("scenario");
      square.style.width = squareWidth + "vh";
      square.appendChild(scenario);
      board.appendChild(square);
    }
  }

  /**
   * Handle things that happened if user click on BINGO!
   * button decides if a user win
   */
  function bingo() {
    let gameID = localStorage.getItem("game_id");
    qs("input").disabled = false;
    qs("select").disabled = false;
    let bingoForm = new FormData();
    bingoForm.append("game_id", gameID);
    fetch("/bingo", {method: "POST", body: bingoForm})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleWinning)
      .catch(handleError);
  }

  /**
   * Fetch winner information from API
   * @param {object} bingoData the bingo data got from API
   */
  function handleWinning(bingoData) {
    const noWinMsgTime = 1000;
    if (bingoData.winner) {
      qsa("#play-view #board .square")
        .forEach(node => node.removeEventListener("click", onClickScenario));
      qs("#play-view #win").textContent = "Congradulations! You Win!";
      qs("input").disabled = false;
      qs("select").disabled = false;
    } else {
      qs("#play-view #win").textContent = "Nobody Win.....";
      timer = setTimeout(clearField, noWinMsgTime);
    }
  }

  /**
   *Clear the field of winner and display no winner
   */
  function clearField() {
    qs("#play-view #win").textContent = "";
  }

  /**
   * Make sure to always add a descriptive comment above
   * every function detailing what it's purpose is
   * Use JSDoc format with @param and @return.
   */
  function startNewGame() {
    let board = qs("#play-view #board");
    if (!board.hasChildNodes()) {
      generateBlankBoard();
    }
    let username = qs("#input-view #name-input #name").value;
    if (!username || !selectedSize) {
      if (!username) {
        qs("#play-view #error").textContent = "Error: Please enter a name";
      }
      if (!selectedSize) {
        qs("#play-view #error").textContent = "Error: Please enter a size";
      }
    } else {
      qs("#play-view #error").textContent = "";
      let startGameUrl = "/newGame?name=" + username + "&size=" + selectedSize;
      qs("input").disabled = true;
      qs("select").disabled = true;
      qs("#small-btn-field #resume").disabled = true;
      fetch(startGameUrl)
        .then(checkStatus)
        .then(resp => resp.json())
        .then((data) => populateBoard(data, false))
        .catch(handleError);
    }
  }

  /**
   * Populate the board by changing the text on the divs
   * to scenario text from API if is not in resume mode, set
   * the local storage
   * @param {object} boardData scenarios data fetch from API
   * @param {boolean} resumeTag the tag if true means we are
   * populating a resume board
   */
  function populateBoard(boardData, resumeTag) {
    if (!resumeTag) {
      localStorage.setItem("player_id", boardData.player.id);
      localStorage.setItem("game_id", boardData["game_id"]);
    }
    let boardArr = boardData.player.board;
    const middleIndex = Math.floor(selectedSize * 1.0 / 2) - 1;
    if (boardArr.length < selectedSize - 1) {
      qs("#play-view #error").textContent = "Error: Server does not return enough scenarios";
    }
    let scenarios = qsa("#play-view #board .scenario");
    let square = qsa("#play-view #board .square");
    for (let i = 0; i < scenarios.length - 1; i++) {
      square[i].addEventListener("click", onClickScenario);
      if (i < middleIndex + 1) {
        scenarios[i].textContent = boardData.player.board[i]["text"];
        scenarios[i].id = boardData.player.board[i]["id"];
      } else {
        scenarios[i + 1].textContent = boardData.player.board[i]["text"];
        scenarios[i + 1].id = boardData.player.board[i]["id"];
      }
    }
    square[square.length - 1].addEventListener("click", onClickScenario);
    scenarios[middleIndex + 1].textContent = "FREE";
    scenarios[middleIndex + 1].id = 1;
  }

  /**
   * Deal with things happened when the user clicked each scenario.
   * It will call API and store the selected scenes.
   */
  function onClickScenario() {
    let gameID = localStorage.getItem("game_id");
    this.removeEventListener("click", onClickScenario);
    this.classList.add("selected");
    let selectForm = new FormData();
    selectForm.append("game_id", gameID);
    selectForm.append("scenario_id", this.firstChild.id);
    fetch("/selectScenario", {method: "POST", body: selectForm})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleSelect)
      .catch(handleError);
  }

  /**
   * If server could not select and return error
   * show to the user
   * @param {object} selectData the data pass in from API
   */
  function handleSelect(selectData) {
    if (!selectData["game_id"] || !selectData["scenario_id"]) {
      qs("#play-view #error").textContent = "Error with server can not select";
    }
  }

  /**
   * If clicks the reset button reset the board accordingly
   */
  function resetGame() {
    localStorage.removeItem("player_id");
    localStorage.removeItem("game_id");
    qs("input").disabled = false;
    qs("select").disabled = false;
    qs("#play-view #board").innerHTML = "";
    qs("#play-view #error").textContent = "";
    qs("#play-view #win").textContent = "";
    clearTimeout(timer);
  }

  /**
   * Handles the error from server
   */
  function handleError() {
    qs("#play-view #error").textContent = "Something wrong with the server. Please try again.";
  }

  /** ------------------------------ Helper Functions  ------------------------------ */
  /**
   * Note: You may use these in your code, but remember that your code should not have
   * unused functions. Remove this comment in your own code.
   */

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

/*
 * Name: Zephyr Zhou
 * Date: April 22, 2020
 * AK Austin Jenchi, Jeffrey Worley
 *
 * This is the JS to implement the UI for story solitare game,
 * it specify the game progress.
 */

"use strict";
(
  function() {

    let save = [];
    let hasBeginning = false;
    let timerID;
    let lastScrollTop = 0;
    let scrolled = false;
    window.addEventListener("load", init);

    /**
     * Initialize the game state : input field only display
     * start button and view-content field have one of randomly
     * generated beginning and selector displayed.
     * All beginning loaded to the save array.
     */
    function init() {
      qs("#input #game-interface").style.visibility = "hidden";
      id("start-button").style.visibility = "visible";
      id("start-button").addEventListener('click', startGame);
      id("submit-button").addEventListener('click', submit);
      let allBeginning = qsa("#view-content #beginning");
      for (let i = 0; i < allBeginning.length; i++) {
        save.push(allBeginning[i]);
        allBeginning[i].remove();
      }
      randomBeginningGenerator();
      qs("select").addEventListener('change', randomBeginningGenerator);
    }

    /**
     * Event happend when user click start the button and the
     * game start. Input field, clear button displayed. Word count
     * started to count. Window listen for scrolling up event.
     */
    function startGame() {
      const updateFrame = 800;
      id("start-button").style.visibility = "hidden";
      qs("#input #game-interface").style.visibility = "visible";
      id("clear-button").addEventListener('click', clearContent);
      timerID = setInterval(wordCount, updateFrame);
      setInterval(updateScroll, updateFrame);
      window.addEventListener('scroll', changeScroll);
    }

    /**
     * If the window is scrolling up change the scrolled to true.
     */
    function changeScroll() {
      const st = window.pageYOffset;
      if (st < lastScrollTop) {
        scrolled = true;
      }
    }

    /**
     * Count the number of words in total and display it
     */
    function wordCount() {
      const count = qs("textarea").value.split(' ').length;
      let newCount = gen("p");
      let text = document.createTextNode(count);
      newCount.appendChild(text);
      qs("#input #info").replaceChild(newCount, qs("#input #info").children[1]);
    }

    /**
     * Behavior for the clear button that it should
     * clear all content in input field.
     */
    function clearContent() {
      qs("#input #game-interface textarea").value = "";
    }

    /**
     * Generate random beginning story sentences from the saved
     * beginnings, if there is already a beginning delete and change
     * it.
     */
    function randomBeginningGenerator() {
      let index = qs("#scroll-view select").selectedIndex;
      let randIndex = Math.floor(Math.random() * 3);
      let beginningId;
      if (qs("#scroll-view select").options[index].value === "romantic") {
        beginningId = randIndex;
      } else {
        beginningId = 3 + randIndex;
      }
      if (hasBeginning) {
        let list = id("view-content");
        list.removeChild(qs("#view-content .beginning"));
      }
      let node = save[0].children[beginningId].cloneNode(true);
      id("view-content").appendChild(node);
      hasBeginning = true;
    }

    /**
     * The behavior of submit that all the text created in the input
     * box was deleted and these input insted display on the view-content
     * field. Minus icon displayed and enable deleting of added content.
     */
    function submit() {
      const updateFrame = 800;
      let userInput = gen("div");
      userInput.classList.add("user-input");
      let userPara = gen("p");
      let node = document.createTextNode(qs("textarea").value);
      userPara.appendChild(node);
      userInput.appendChild(userPara);

      let minusIcon = gen("img");
      minusIcon.src = "pictures/minus.png";
      userInput.appendChild(minusIcon);

      minusIcon.addEventListener('click', deleteParent);
      id("view-content").appendChild(userInput);
      clearInterval(timerID);
      clearContent();
      timerID = setInterval(wordCount, updateFrame);
    }

    /**
     * If the user have not been scrolled up then automatically
     * scroll to the bottom of the page. Thus the input field and
     * the recent input is visible.
     */
    function updateScroll() {
      lastScrollTop = pageYOffset;
      if (!scrolled) {
        window.scrollTo(0, document.body.scrollHeight);
      }
    }

    /**
     * Delete the parent node.
     */
    function deleteParent() {
      this.parentNode.remove();
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
  }
)();
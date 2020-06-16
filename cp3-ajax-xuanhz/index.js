"use strict";
(
  function() {

    window.addEventListener("load", init);
    let timeID;
    let dotsCount = 0;
    let artist;
    let title;

    /**
     * The starting of the lyric searcher. The input-view should be shown,
     * the output view should be hidden. The background is loaded. Submit button
     * listen for submit of the input field and change background button listen
     * for change of background.
     */
    function init() {
      if (qs("#main #input-view").classList.contains("hidden")) {
        qs("#main #input-view").classList.remove("hidden");
      }
      qs("#main #output-view").classList.add("hidden");
      getBackGround();
      id("submit-button").addEventListener('click', submit);
      id("change-bg").addEventListener('click', getBackGround);
    }

    /**
     * Get the background iamge from the picsum API
     */
    function getBackGround() {
      let bgUrl = "https://picsum.photos/v2/list";
      fetch(bgUrl)
        .then(checkStatus)
        .then(imgResp => imgResp.json())
        .then(showBackGround)
        .catch(handleBgError);

    }

    /**
     * If there is an error that background image doesn't load
     * display UW theme color
     */
    function handleBgError() {
      qs("body").style.backgroundColor = "rgb(71, 50, 127)";
    }

    /**
     * Show a random background image from list 30 images provided
     * by the picsum
     * @param {Object} imgData the JSON object including 30 pictures
     */
    function showBackGround(imgData) {
      const rand = 25;
      let randIndex = Math.floor(Math.random() * rand);
      qs("body").style.backgroundImage = "url(" +
      imgData[randIndex].download_url + ")";
    }

    /**
     * Things happened when user click submit: output view show, input
     * view hide, another search button available, lyric is shown. When
     * second time submit is clicked remove previous search result.
     */
    function submit() {
      qs("#output-view #another").addEventListener('click', init);
      qs("#main #output-view").classList.remove("hidden");
      qs("#main #input-view").classList.add("hidden");
      let content = qs("#main #output-view .lyrics");
      let contentChild = qs("#main #output-view .lyrics .lyric-content");
      if (content.contains(contentChild)) {
        content.removeChild(contentChild);
      }
      let errMsg = qs("#main #output-view .lyrics .err-msg");
      if (content.contains(errMsg)) {
        content.removeChild(errMsg);
      }
      getLyrics();
    }

    /**
     * Get the search result from the lyric search API, if
     * the input fields are blank have text indication. Shows
     * loading msg until result poped out.
     */
    function getLyrics() {
      artist = qs(".input-text #artists").value;
      title = qs(".input-text #title").value;
      if (artist === "" || title === "") {
        qs("h2").textContent = "I didn't see any input....";
      } else {
        const dotIncrTime = 100;
        qs("h2").textContent = "Try To Catch Your Lyrics";
        timeID = setInterval(loading, dotIncrTime);
        let url = "https://api.lyrics.ovh/v1/" + artist + "/" + title;
        fetch(url)
          .then(checkStatus)
          .then(response => response.json())
          .then(showLyrics)
          .catch(handleError);
      }
    }

    /**
     * Handle the error when can't get result lyrics from API.
     */
    function handleError() {
      clearInterval(timeID);
      let error = gen("p");
      error.classList.add("err-msg");
      let msg = "We could not get lyrics from our lyric planet." +
                "Maybe try search another lyric or refresh the page!!";
      error.textContent = msg;
      qs("h2").textContent = "Ooops! Your Lyrics Escaped!";
      qs(".lyrics").appendChild(error);
    }

    /**
     * Show the lyrics found by lyric search engine API
     * @param {object} lyricData the result from Lyric search engine API
     */
    function showLyrics(lyricData) {
      qs("h2").textContent = title.toUpperCase() + " By " + artist.toUpperCase();
      clearInterval(timeID);
      let lyricArr = lyricData.lyrics.split("\n");
      for (let i = 0; i < lyricArr.length; i++) {
        let lyrics = gen("p");
        lyrics.classList.add("lyric-content");
        qs(".lyrics").appendChild(lyrics);
        lyrics.textContent = lyricArr[i];
      }
    }

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
     * Append the dot symbol after the loading massage as time passby.
     */
    function loading() {
      dotsCount++;
      const maxDotsCount = 10;
      if (dotsCount === maxDotsCount) {
        qs("h2").textContent = "Try To Catch Your Lyrics";
        dotsCount = 0;
      } else {
        qs("h2").textContent += " . ";
      }
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
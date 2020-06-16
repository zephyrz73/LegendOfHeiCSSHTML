/**
 * Name: Zephyr Zhou
 * Date: 05/22/2020
 * Section: CSE 154 AK
 *
 * This is the js file for specialize the behavior display on
 * client's computer including multiple fetch from written API
 */
"use strict";
(function() {

  /**
   * Add a function that will be called when the window is loaded.
   */
  window.addEventListener("load", init);

  /**
   * CHANGE: Describe what your init function does here.
   */
  function init() {
    // THIS IS THE CODE THAT WILL BE EXECUTED ONCE THE WEBPAGE LOAD
    id("sign-up").classList.add("hidden");
    id("logged-in").classList.add("hidden");
    qs("#log-in #go-sign-up").addEventListener("click", toggleLogInSignUpView);
    qs("#log-in #log-in-btn").addEventListener("click", logIn);
    qs("#sign-up #go-log-in").addEventListener("click", toggleLogInSignUpView);
    qs("#sign-up #sign-up-btn").addEventListener("click", signUp);
    qs("#sign-up #rand-name-btn").addEventListener("click", randomNameGenerator);
    qs("#logged-in #change-bg #change-bg-drop").addEventListener("change", changeBackground);
    let initimg;
    fetch("/rand-img")
      .then(checkStatus)
      .then(resp => resp.blob())
      .then(images => {
        initimg = URL.createObjectURL(images);
        qs("body").style.backgroundImage = "url(" + initimg + ")";
      })
      .catch(handleError);
  }

  /**
   * CHANGE: Describe what your init function does here.
   */
  function toggleLogInSignUpView() {
    if (!id("log-in").classList.contains("hidden")) {
      id("log-in").classList.add("hidden");
      id("sign-up").classList.remove("hidden");
      id("logged-in").classList.add("hidden");
    } else {
      id("log-in").classList.remove("hidden");
      id("sign-up").classList.add("hidden");
      id("logged-in").classList.add("hidden");
    }
  }

  /**
   * CHANGE: Describe what your init function does here.
   */
  function logIn() {
    let loginName = qs("#log-in #log-in-name").value;
    let passWord = qs("#log-in #log-in-password").value;
    let loginInfo = new FormData();
    loginInfo.append("name", loginName);
    loginInfo.append("password", passWord);
    fetch("/login", {method: "POST", body: loginInfo})
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleLoginOutput)
      .catch(handleError);
  }

  /**
   * Sign the user up
   */
  function signUp() {
    let spUser = qs("#sign-up .username #sign-up-name").value;
    let spPass = qs("#sign-up .password #sign-up-password").value;
    let pen = qs("#sign-up .pen-name #pen-name").value;
    let birthday = qs("#sign-up .birthday #birthday").value;
    let gender;
    if (qs("#sign-up .gender #female").checked) {
      gender = "female";
    }
    if (qs("#sign-up .gender #male").checked) {
      gender = "male";
    }
    let params = new FormData();
    params.append("username", spUser);
    params.append("password", spPass);
    params.append("birthday", birthday);
    params.append("penName", pen);
    params.append("gender", gender);
    fetch("/signup", {method: "POST", body: params})
      .then(checkStatus)
      .then(resp => resp.text())
      .then(handleSignUpData)
      .catch(handleError);
  }

  /**
   * Generate random name for user to pick
   */
  function randomNameGenerator() {
    fetch("/rand-name")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleRandName)
      .catch(handleError);
  }

  /**
   * Handle the random pen name and username sent by my API
   * @param {object} data the name data fetched from API
   */
  function handleRandName(data) {
    let username = data.username;
    let penName = data["pen-name"];
    qs("#sign-up .username #sign-up-name").value = username;
    qs("#sign-up .pen-name #pen-name").value = penName;
  }

  /**
   * Handle sign up information from json input
   * @param {object} signUpData the json object for sign up data
   */
  function handleSignUpData(signUpData) {
    let signUpOutput = gen("p");
    signUpOutput.textContent = signUpData;
    qs("#sign-up #sign-up-output").appendChild(signUpOutput);
    let note = gen("p");
    note.textContent = "Click Button to go back for sign in.";
    qs("#sign-up #sign-up-output").appendChild(note);
  }

  /**
   * handle sentence data got from my API put in logged-in page
   * @param {object} sentenceData the sentence data got from my API
   */
  function handleSentenceForTheDay(sentenceData) {
    let sentence = gen("p");
    sentence.textContent = JSON.stringify(sentenceData);
    qs("#logged-in #sentence").appendChild(sentence);
  }

  /**
   * @param {object} loginData the json object for login data
   */
  function handleLoginOutput(loginData) {
    const timeDelay = 1000;
    let output = gen("p");
    if (loginData.error) {
      output.textContent = loginData.error;
      qs("#log-in #log-in-output").appendChild(output);
    } else {
      output.textContent = "Successfully Log In!";
      qs("#log-in #log-in-output").appendChild(output);
      setTimeout(function() {
        id("log-in").classList.add("hidden");
        id("sign-up").classList.add("hidden");
        id("logged-in").classList.remove("hidden");
      }, timeDelay);
      qs("#logged-in h1 .pen-name").textContent = loginData.penName;
      let birthday = gen("p");
      birthday.textContent = loginData.birthday;
      let gender = gen("img");
      if (loginData.gender === "male") {
        gender.src = "localpics/boy.jpeg/";
      }
      if (loginData.gender === "female") {
        gender.src = "localpics/girl.jpeg";
      }
      qs("#logged-in #profile").appendChild(birthday);
      qs("#logged-in #profile").appendChild(gender);
      fetchSentence();
    }
  }

  /**
   * Fetch Sentence for today from API
   */
  function fetchSentence() {
    fetch("/sentence")
      .then(checkStatus)
      .then(resp => resp.text())
      .then(handleSentenceForTheDay)
      .catch(handleError);
  }

  /**
   * Change the background according to taste of user
   */
  function changeBackground() {
    let index = qs("#logged-in #change-bg #change-bg-drop").selectedIndex;
    let selectedStyle = qs("#logged-in #change-bg #change-bg-drop").options[index].value;
    let bgUrl;
    if (selectedStyle === "original") {
      bgUrl = "/rand-img";
    } else if (selectedStyle === "blackwhite") {
      bgUrl = "/rand-img?style=blackWhite";
    } else {
      bgUrl = "/rand-img?style=crystalize";
    }
    let outside;
    fetch(bgUrl)
      .then(checkStatus)
      .then(resp => resp.blob())
      .then(images => {
        outside = URL.createObjectURL(images);
        qs("body").style.backgroundImage = "url(" + outside + ")";
      })
      .catch(handleError);
  }

  /**
   * Handle the error case of fetch
   * @param {err} err the error pass from fetch.
   */
  function handleError(err) {
    let explain = gen("p");
    explain.textContent = "Can't not fetch connection from API, the problem is: ";
    let error = gen("p");
    error.textContent = err;
    id("error").appendChild(error);
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
   * Returns a new element with the given tag name.
   * @param {string} tagName - HTML tag name for new DOM element.
   * @returns {object} New DOM object for given HTML tag.
   */
  function gen(tagName) {
    return document.createElement(tagName);
  }
})();
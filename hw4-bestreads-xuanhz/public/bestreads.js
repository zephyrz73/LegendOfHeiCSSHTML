/**
 * Name: Zephyr Zhou
 * Date: May 27 2020
 * Section: CSE 154 AK
 *
 * This is the js file that specify the behavior of bestreads website
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  /**
   * The init function request all books to put on the grid shelf
   * while also add the event listener for home button to return home
   */
  function init() {
    requestAllBooks();
    qs("header #home").addEventListener("click", onClickHome);
  }

  /**
   * This function requested all books from the web API we have
   */
  function requestAllBooks() {
    fetch("/bestreads/books")
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleBooksData)
      .catch(handleError);
  }

  /**
   * When click the home button, the single book and all book view toggles
   * all review field cleared and home disabled is set to false
   */
  function onClickHome() {
    qs("main #book-data #single-book").classList.add("hidden");
    qs("main #book-data #all-books").classList.remove("hidden");
    let parent = qs("main #book-data #single-book #book-reviews");
    while (parent.firstChild) {
      parent.removeChild(parent.firstChild);
    }
    if (qs("header #home").disabled === true) {
      qs("header #home").disabled = false;
    }
  }

  /**
   * Handle books data and populate gird book shelf
   * @param {object} booksData the data of all books got from API
   */
  function handleBooksData(booksData) {
    for (let i = 0; i < booksData.books.length; i++) {
      let bookDiv = gen("div");
      let bookimg = gen("img");
      let booktitle = gen("p");
      bookimg.src = "covers/" + booksData.books[i].book_id + ".jpg";
      booktitle.textContent = booksData.books[i].title;
      bookDiv.appendChild(bookimg);
      bookDiv.appendChild(booktitle);
      bookDiv.classList.add("selectable");
      bookDiv.id = booksData.books[i].book_id;
      bookDiv.addEventListener("click", onClickBook);
      qs("main #book-data #all-books").appendChild(bookDiv);
    }
  }

  /**
   * When click each book, the single book view and books view toggled
   */
  function onClickBook() {
    qs("main #book-data #all-books").classList.add("hidden");
    qs("main #book-data #single-book").classList.remove("hidden");
    qs("main #book-data #single-book #book-cover").src =
      "covers/" + this.id + ".jpg";
    fetch("/bestreads/info/" + this.id)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleInfoData)
      .catch(handleError);
    fetch("/bestreads/description/" + this.id)
      .then(checkStatus)
      .then(resp => resp.text())
      .then(handleDescriptionData)
      .catch(handleError);
    fetch("/bestreads/reviews/" + this.id)
      .then(checkStatus)
      .then(resp => resp.json())
      .then(handleReviewData)
      .catch(handleError);
  }

  /**
   * Handle infoData go from API: update title and author
   * of single book view
   * @param {*} infoData the info got from API
   */
  function handleInfoData(infoData) {
    qs("main #book-data #single-book #book-info #book-title")
      .textContent = infoData.title;
    qs("main #book-data #single-book #book-info #book-author")
      .textContent = infoData.author;
  }

  /**
   * Handle description data go from API: update description
   * of single book view
   * @param {*} descpData the description got from API
   */
  function handleDescriptionData(descpData) {
    qs("main #book-data #single-book #book-info #book-description")
      .textContent = descpData;
  }

  /**
   * Handle review data go from API: update review fields
   * including name, rating, and text of single book view's
   * review field
   * @param {*} reviewData the review data got from API
   */
  function handleReviewData(reviewData) {
    let sum = 0;
    for (let i = 0; i < reviewData.length; i++) {
      sum += reviewData[i].rating;
      let name = gen("h3");
      name.textContent = reviewData[i].name;
      let rating = gen("h4");
      rating.textContent = "Rating: " + reviewData[i].rating.toFixed(1);
      let text = gen("p");
      text.textContent = reviewData[i].text;
      let bookReviews = qs("main #book-data #single-book #book-reviews");
      bookReviews.appendChild(name);
      bookReviews.appendChild(rating);
      bookReviews.appendChild(text);

    }
    let average = (sum * 1.0 / reviewData.length).toFixed(1);
    qs("main #book-data #single-book #book-info #book-rating")
      .textContent = average;
  }

  /**
   * Handle the error sent by server.
   */
  function handleError() {
    id("book-data").classList.add("hidden");
    id("error-text").classList.remove("hidden");
    qs("header #home").disabled = true;
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

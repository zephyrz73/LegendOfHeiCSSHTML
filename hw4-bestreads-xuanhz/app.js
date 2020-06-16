/**
 * Name: Zephyr Zhou
 * Date: 05/22/2020
 * Section: CSE 154 AK
 *
 * This is the API on the server which takes handles login, fetch random
 * image, random name, and random sentence for the day
 */
'use strict';
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');
const PORT = process.env.PORT || 8000;
const SERVER_ERR = 500;
const USER_ERR = 400;

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

/**
 * The end point for get description according to non-optional parameter
 * book id. Send as text
 */
app.get("/bestreads/description/:book_id", async (req, res) => {
  try {
    let bookid = req.params.book_id;
    let getDescriptionSQL = "SELECT description FROM books WHERE book_id=?;";
    let description = await queryData(getDescriptionSQL, bookid);
    res.type("text");
    if (description) {
      res.send(description[0].description);
    } else {
      res.status(USER_ERR).send("No results found for " + bookid + ".");
    }
  } catch (err) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * The end point for get title and author according to non-optional
 * parameter book id. Send as json
 */
app.get("/bestreads/info/:book_id", async (req, res) => {
  try {
    let infoBookid = req.params.book_id;
    let infoSQL = "SELECT title, author FROM books WHERE book_id=?;";
    let info = await queryData(infoSQL, infoBookid);
    if (info) {
      res.type("json");
      res.send(info[0]);
    } else {
      res.type("text");
      res.status(USER_ERR).send("No results found for " + infoBookid + ".");
    }
  } catch (err) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * The end point for get reviews' name, rating, and text according
 * to non-optional parameter book id. Send as json
 */
app.get("/bestreads/reviews/:book_id", async (req, res) => {
  try {
    let reviewBookid = req.params.book_id;
    let reviewSQL = "SELECT name, rating, text FROM reviews WHERE book_id=?;";
    let review = await queryData(reviewSQL, reviewBookid);
    if (review) {
      res.type("json");
      res.send(review);
    } else {
      res.type("text");
      res.status(USER_ERR).send("No results found for " + reviewBookid + ".");
    }
  } catch (err) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * The end point for get all books according to non-optional parameter
 * book id. Send as json
 */
app.get("/bestreads/books", async (req, res) => {
  try {
    let reviewSQL = "SELECT title, book_id FROM books ORDER BY book_id ASC;";
    let books = await queryData(reviewSQL, null);
    if (books) {
      res.type("json");
      let booksRes = {"books": books};
      res.send(booksRes);
    }
  } catch (err) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

// ---------------Helper Method------------
/**
 * get connection to the data base
 * @returns {object} the connection to database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'bestreads.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * pass in query return result
 * @param {string} sql the sql need to retreive result
 * @param {array} sqlParams the params for the sql
 */
async function queryData(sql, sqlParams) {
  try {
    const db = await getDBConnection();
    let rows;
    if (sqlParams) {
      rows = await db.all(sql, sqlParams);
    } else {
      rows = await db.all(sql);
    }
    db.close();
    return rows;
  } catch (error) {
    console.error(error);
  }
}

app.use(express.static("public"));
app.listen(PORT);

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
const fs = require('fs').promises;
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
 * get connection to the data base
 * @returns {object} the connection to database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'data/user.db',
    driver: sqlite3.Database
  });
  return db;
}

/**
 * create the table
 */
async function createTable() {
  const db = await getDBConnection();
  const sql = await fs.readFile('data/setup.sql', 'utf8');
  await db.exec(sql);
  db.close();
}

/**
 * pass in query return result
 * @param {string} sql the sql need to retreive result
 */
async function queryData(sql) {
  try {
    const db = await getDBConnection();
    let rows = await db.all(sql);
    db.close();
    return rows;
  } catch (error) {
    console.error(error);
  }
}

/**
 * get random number from 0 to max
 * @param {number} max the max number
 * @returns {number} the random number
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * See if password and username match system records
 * if so return the profile except password, else return
 * error that fail to log in user.
 * /login which is to log the user on to the system
 * it is a post requrest without any params.
 */
app.post("/login", async (req, res) => {
  try {
    let name = req.body.name;
    let password = req.body.password;
    if (!(name && password)) {
      res.status(USER_ERR).send("Missing POST parameter: name, and/or password");
    }
    let loginByUsernameSQL = "SELECT username, penName, birthday, gender " +
      "FROM players WHERE username == '" + name + "' AND password = '" + password + "';";
    let loginByPenNameSQL = "SELECT username, penName, birthday, gender " +
      "FROM players WHERE penName == '" + name + "' AND password = '" + password + "';";
    let loginByUsername = await queryData(loginByUsernameSQL);
    let loginByPenName = await queryData(loginByPenNameSQL);
    res.type("json");
    let result;
    if (isEmpty(loginByUsername) && isEmpty(loginByPenName)) {
      result = {"error": "Name and password do not match!"};
    } else if (!isEmpty(loginByUsername)) {
      result = loginByUsername[0];
    } else if (!isEmpty(loginByPenName)) {
      result = loginByPenName[0];
    }
    res.send(result);
  } catch (err) {
    res.status(SERVER_ERR).send("There is problem with server to log you in.");
    console.error(err);
  }
});

/**
 * Sign up the user. See if username, pen name, password
 * already exist in records, if so, send text says match records,
 * otherwise sign user up, insert profile into database
 * /signup endpoint is a post request don't have params
 */
app.post("/signup", async (req, res) => {
  try {
    let username = req.body.username;
    let password = req.body.password;
    let birthday = req.body.birthday;
    let gender = req.body.gender;
    let penName = req.body.penName;
    if (!(username && password && penName)) {
      res.status(USER_ERR).send("Missing POST parameter: username, password, and/or penName");
    }
    let sql4 = "INSERT INTO players (" +
              "username, password, penName, birthday, gender) " +
              "VALUES ( '" + username + "', '" + password + "', '" + penName +
              "', '" + birthday + "', '" + gender + "');";
    await createTable();
    let ifExist = await checkExist(username, password, penName);
    res.type("text");
    if (ifExist) {
      res.send("The username, password or penName already exist in system");
    } else {
      await queryData(sql4);
      res.send("Successfully signed up!");
    }
  } catch (err) {
    res.status(SERVER_ERR).send("There is problem with server to sign you up.");
    console.error(err);
  }
});

/**
 * Check if username, password, pen name exists
 * @param {string} username username to check
 * @param {string} password password to check
 * @param {*} penName pen name to check
 */
async function checkExist(username, password, penName) {
  let sql1 = "SELECT id, username FROM players WHERE username = '" + username + "';";
  let sql2 = "SELECT id, username FROM players WHERE password = '" + password + "';";
  let sql3 = "SELECT id, username FROM players WHERE penName = '" + penName + "';";
  let sql4 = "SELECT id, username FROM players WHERE userName = '" + penName + "';";
  let sql5 = "SELECT id, username FROM players WHERE penName = '" + username + "';";
  let getUsername = await queryData(sql1);
  let getPassword = await queryData(sql2);
  let getPenName = await queryData(sql3);
  let userNameisPen = await queryData(sql4);
  let PenNameisUser = await queryData(sql5);
  return (!isEmpty(getUsername) ||
    !isEmpty(getPassword) ||
    !isEmpty(getPenName) ||
    !isEmpty(userNameisPen) ||
    !isEmpty(PenNameisUser));

}

/**
 * Check if this array has empty body
 * @param {array} array the array need to check
 * @returns {boolean} if array is empty return true, else return false
 */
function isEmpty(array) {
  return !(Array.isArray(array) && array.length);
}

/**
 * Get random username, penname pair send as json
 * /rand-name does not have optional or non-optional params
 */
app.get("/rand-name", async (req, res) => {
  try {
    res.type("json");
    let contents = await fs.readFile('username.json', 'utf-8');
    let object = JSON.parse(contents);
    const max = object["random-username"].length;
    const randIndex1 = getRandomInt(max);
    const randIndex2 = getRandomInt(max);
    let result = {"username": object["random-username"][randIndex1],
      "pen-name": object["random-pen-name"][randIndex2]};
    res.type("json").send(result);
  } catch (err) {
    res.status(SERVER_ERR).send("There is problem with server to fetch random username");
    console.error(err);
  }
});

/**
 * Get random sentence for the day from txt file
 * /sentence endpoint do not have any optional or non-optional params
 */
app.get("/sentence", async (req, res) => {
  try {
    let sentence = await fs.readFile('sentence-for-day.txt', 'utf-8');
    let sentArr = sentence.toString().split('\n');
    let randsen = getRandomInt(sentArr.length);
    let result = sentArr[randsen];
    res.type('text');
    res.send(result);
  } catch (err) {
    res.status(SERVER_ERR).send("There is problem with server to fetch sentence for the day");
    console.error(err);
  }
});

/**
 * Get random img with different style crystalize, blackwhite or original
 * /rand-img endpoint has optional params style of the image:
 * crystalize, blackwhite or original.
 */
app.get("/rand-img", async (req, res) => {
  const randnum = 1 + getRandomInt(4);
  let filename = "";
  try {
    res.type('png');
    if (req.query.style) {
      if (req.query.style === "crystalize") {
        filename = 'public/pics/clbg' + randnum + ".png";
      } else if (req.query.style === "blackWhite") {
        filename = 'public/pics/bwbg' + randnum + ".png";
      } else {
        res.status(USER_ERR).send("Can't find this style!");
      }
    } else {
      filename = 'public/pics/bg' + randnum + ".png";
    }
    let image = await fs.readFile(filename);
    res.send(image);
  } catch (err) {
    res.status(SERVER_ERR).send("There is problem with server to fetch random image");
    console.error(err);
  }
});

app.use(express.static("public"));

app.listen(PORT);
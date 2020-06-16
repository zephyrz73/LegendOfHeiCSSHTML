/**
 * Name: Zephyr Zhou
 * Date: 06/09/2020
 * Section: CSE 154 AK
 *
 * This is the API on the server which handles operation to
 * the database using data clients pass in from the front end
 */
'use strict';
const express = require('express');
const app = express();
const sqlite3 = require('sqlite3');
const sqlite = require('sqlite');
const multer = require('multer');

// const fs = require('fs').promises;
const DEFAULT_PORT = 8080;
const PORT = process.env.PORT || DEFAULT_PORT;
const SERVER_ERR = 500;
const USER_ERR = 400;

const SCENARIO_NUMBER = 38;

// for application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true})); // built-in middleware
// for application/json
app.use(express.json()); // built-in middleware
// for multipart/form-data (required with FormData)
app.use(multer().none()); // requires the "multer" module

/**
 * Get Endpoint to get scenario to establish a newGame
 * params including name (name of player) and size (size selected)
 */
app.get("/newGame", async (req, res) => {
  try {
    // await createTable();
    let name = req.query.name;
    let size = req.query.size;
    if (!name || !size) {
      res.status(USER_ERR).send("No name or size inputed");
    }
    let gameID = await insertReturnID("games", "winner", null);
    let playerID;
    let playerInfo = await findPlayerInfoByName(name);
    if (isEmpty(playerInfo)) {
      playerID = await insertReturnID("players", "name", name);
    } else {
      playerID = playerInfo[0]["id"];
    }
    let combineArray = await generateRandomScene(size);
    await insertGameState(gameID, playerID, combineArray);
    res.type("json");
    let newGameRespond = {"game_id": gameID,
      "player": {"id": playerID, "name": name, "board": combineArray[0]}};
    res.send(newGameRespond);
  } catch (err) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * Post Endpoint to select some scenario and update database
 * params including game_id and scenario_id
 */
app.post("/selectScenario", async (req, res) => {
  try {
    let gameId = parseInt(req.body["game_id"], 10);
    let scenarioId = parseInt(req.body["scenario_id"], 10);
    if (!gameId || !scenarioId) {
      res.status(USER_ERR).send("No game_id or scenario_id inputed");
    } else {
      let findSceneByGIDSQL = "SELECT id, given_scenario_ids, selected_scenario_ids " +
                            "FROM game_state WHERE game_id=?;";
      let twoArr = await queryData(findSceneByGIDSQL, [gameId]);
      let boardId = twoArr[0]["id"];
      let scenariosArr = JSON.parse(twoArr[0]["given_scenario_ids"]);
      let selectedArr = JSON.parse(twoArr[0]["selected_scenario_ids"]);
      let isInScenarios = (scenariosArr) ? scenariosArr.includes(scenarioId) : false;
      let isSelected = (selectedArr) ? selectedArr.includes(scenarioId) : false;
      res.type("json");
      if (isInScenarios && !isSelected) {
        await updateGameStateTable(boardId, parseInt(scenarioId, 10), selectedArr);
        res.send({"game_id": gameId, "scenario_id": scenarioId});
      } else {
        let stringError = "Could not select scenario ID: " + scenarioId;
        res.status(USER_ERR).send({"error": stringError});
      }
    }
  } catch (error) {
    console.error(error);
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * Post endpoint to find if bingo is legal and update database
 * params including game_id
 */
app.post("/bingo", async (req, res) => {
  try {
    let bingoGameId = req.body["game_id"];
    if (!bingoGameId) {
      res.status(USER_ERR).send("No game_id inputs");
    }
    let getBoardInfoSQL = "SELECT * FROM game_state WHERE game_id=?;";
    let boardInfo = await queryData(getBoardInfoSQL, [bingoGameId]);
    let sceneArr = JSON.parse(boardInfo[0]["given_scenario_ids"]);
    let selectedArr = JSON.parse(boardInfo[0]["selected_scenario_ids"]);
    let playerId = boardInfo[0]["player_id"].toString();
    let getWinnerSQL = "SELECT * FROM players WHERE id=" + playerId + ";";
    let winnerData = await queryData(getWinnerSQL, null);
    if (selectedArr.length >= Math.sqrt(sceneArr.length - 1)) {
      let winner = await queryData("SELECT winner FROM games WHERE id=?;", [bingoGameId]);
      if (winner[0]["winner"]) {
        res.status(USER_ERR).send({"error": "Game has already been won."});
      } else {
        let updateWinnerSQL = "UPDATE games SET winner=? where id=?;";
        await queryData(updateWinnerSQL, [playerId, bingoGameId]);
        res.type("json");
        res.send({"game_id": parseInt(bingoGameId, 10), "winner": winnerData[0]["name"]});
      }
    } else {
      res.send({"game_id": parseInt(bingoGameId, 10), "winner": null});
    }
  } catch (error) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * Get the info need for resume the game.
 * params including game_id and player_id
 */
app.get("/resumeGame", async (req, res) => {
  try {
    let resumeGameId = parseInt(req.query["game_id"], 10);
    let resumePlayerId = parseInt(req.query["player_id"], 10);
    if (!resumeGameId || !resumePlayerId) {
      res.status(USER_ERR).send("no game_id or player_id");
    }
    let retrieveStateSQL = "SELECT * FROM game_state WHERE game_id=? AND player_id=?;";
    let gameState = await queryData(retrieveStateSQL, [resumeGameId, resumePlayerId]);
    let errorMSG = "Cannot resume game: Player " +
          resumePlayerId + " was not part of game " + resumeGameId;
    if (!isEmpty(gameState)) {
      if (gameState[0]["player_id"] !== parseInt(resumePlayerId, 10)) {
        res.status(USER_ERR).send({"error": errorMSG});
      } else {
        res.type("json");
        let playerName = await findNameById(resumePlayerId);
        let boardInfoArr = await retrieveBoardData(JSON.parse(gameState[0]["given_scenario_ids"]));
        let resumeResult = {"game_id": gameState[0]["game_id"], "player":
        {"id": gameState[0]["player_id"], "name": playerName[0].name, "board": boardInfoArr,
          "selected_scenarios": JSON.parse(gameState[0]["selected_scenario_ids"])}};
        res.send(resumeResult);
      }
    } else {
      res.status(USER_ERR).send({"error": errorMSG});
    }
  } catch (error) {
    res.status(SERVER_ERR).send("Something went wrong on the server, try again later.");
  }
});

/**
 * Find plyaer's name
 * @param {string} id the id of the player
 * @return {object} the player name
 */
async function findNameById(id) {
  let findNameSQL = "SELECT name from players WHERE id=?";
  let name = await queryData(findNameSQL, [id]);
  return name;
}

// ---------------Helper Method---------------

/**
 * Finds the player info by name
 * @param {string} name the name of player
 * @return {object} the json object store player info
 */
async function findPlayerInfoByName(name) {
  let findPlayerIDSQL = "SELECT * FROM players WHERE name=?;";
  let playerInfo = await queryData(findPlayerIDSQL, [name]);
  return playerInfo;
}

/**
 * Retrieve the board datas
 * @param {array} sceneIdArray the scene id array that store scene ids
 * which is needed to retrieve data
 * @returns {object} board array that has all the board data
 */
async function retrieveBoardData(sceneIdArray) {
  let findSceneInfoSQL = "SELECT * FROM scenarios WHERE id=?;";
  let boardInfoArray = [];
  for (let i = 0; i < sceneIdArray.length; i++) {
    let sceneId = sceneIdArray[i];
    let sceneInfo = await queryData(findSceneInfoSQL, [sceneId]);
    boardInfoArray.push({"id": sceneInfo[0]["id"],
      "text": sceneInfo[0]["text"]});
  }
  return boardInfoArray;
}

/**
 * insert the gamestate into data base
 * @param {string} gameID game id
 * @param {string} playerID player id
 * @param {string} combineArray combine array[0] contains scenario data
 * and array[1] contains scenario id
 */
async function insertGameState(gameID, playerID, combineArray) {
  const db = await getDBConnection();
  let storeGameStateSQL = "INSERT INTO 'game_state' ('game_id','player_id','given_scenario_ids') " +
                          "VALUES (?,?,?);";
  combineArray[1].push(1);
  await db.run(storeGameStateSQL, [gameID, playerID, JSON.stringify(combineArray[1])]);
  db.close();
}

/**
 * Update the game state table with array of selected scenario
 * @param {string} boardId id of the board
 * @param {string} scenarioId id of scenario
 * @param {array} selectedArr the array contain selected scenario
 */
async function updateGameStateTable(boardId, scenarioId, selectedArr) {
  let updateStateSQL = "UPDATE game_state SET selected_scenario_ids=? WHERE id=" + boardId + ";";
  let scenarioIDArr = [scenarioId];
  let newSelectedArr;
  if (isEmpty(selectedArr)) {
    newSelectedArr = JSON.stringify(scenarioIDArr);
  } else {
    newSelectedArr = selectedArr.slice();
    newSelectedArr.push(scenarioId);
    newSelectedArr = JSON.stringify(newSelectedArr);
  }
  await queryData(updateStateSQL, [newSelectedArr]);
}

/**
 * Generate random scenes with given size
 * @param {number} size the size needed to generage scenes
 * @return {array} combined array[0] contain board scenes data,
 * [1] contain board id
 */
async function generateRandomScene(size) {
  let getSceneSQL = "SELECT id, text FROM scenarios WHERE id =?;";
  let boardSceneArray = [];
  let SceneIdArray = [];
  for (let sceneCount = 0; sceneCount < size - 1; sceneCount++) {
    let randScenarioId = Math.floor(Math.random() * SCENARIO_NUMBER + 2);
    while (SceneIdArray.includes(randScenarioId)) {
      randScenarioId = Math.floor(Math.random() * SCENARIO_NUMBER + 2);
    }
    let sceneText = await queryData(getSceneSQL, randScenarioId);
    boardSceneArray.push({"id": sceneText[0].id, "text": sceneText[0].text});
    SceneIdArray.push(sceneText[0].id);
  }
  boardSceneArray.push({"id": 1, "text": "FREE"});
  return [boardSceneArray, SceneIdArray];
}

/**
 * Insert value to single column and return the autogenerated id
 * @param {string} table the table need to insert
 * @param {string} column the column need to insert
 * @param {string} value the value need to insert
 * @return {string} the autogenerated id
 */
async function insertReturnID(table, column, value) {
  try {
    const db = await getDBConnection();
    let insertSQL = "INSERT INTO '" + table + "' ('" + column + "') VALUES (?);";
    let result = await db.run(insertSQL, [value]);
    db.close();
    return result.lastID;
  } catch (error) {
    console.error(error);
  }
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
 * Create all the tables using create.sql and if haven't
 * insert scenario to the scenarios table
 */

/**
 * async function createTable() {
 * const db = await getDBConnection();
 * const sql = await fs.readFile('create.sql', 'utf8');
 * await db.exec(sql);
 * let isEmptySQL = "SELECT id FROM scenarios;";
 * let scenarioText = await queryData(isEmptySQL, null);
 * if (isEmpty(scenarioText)) {
 *    const insertingSQL = await fs.readFile('scenarios.sql', 'utf8');
 *    await db.exec(insertingSQL);
 * }
 * db.close();
 * }
 */

/**
 * get connection to the data base
 * @returns {object} the connection to database
 */
async function getDBConnection() {
  const db = await sqlite.open({
    filename: 'zoomingo.db',
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
# Zoomingo Game API Documentation
This API handles player, board and game information from
zoomingo game front end and store them in the database.
It respond to front end's request to fetch game data
as needed.

## Get Info For New Game
**Request Format:**  /newGame?name=`somename`&size=`somesize`

**Request Type:** GET

**Returned Data Format**: json

**Description:**
- Generates a new (random) board for the player of the appropriate size.
- Generates a new Game ID.
- References to the Game ID, the player ID, and the given scenarios are stored in the game_state table.
- Returns the player's board as JSON, in the form:

**Example Request:**  /newGame?name="zephyr"&size=9

**Example Response:**

```json
{
  "game_id": 123,
  "player": {
    "id": 123,
    "name": "abc",
    "board": [
      {"id": 123, "text": "abc"},
      // ...
    ]
  }
}
```

**Error Handling:**
- Possible 400 errors (plain text):
  - if name or size is null send `No name or size inputed`
- Possible 500 errors (plain text):
  - if cannot perform operation with data base send `Something went wrong on the server, try again later.`
## Select Scenario
**Request Format:** /selectScenario endpoint with body parameters of `game_id` and `scenario_id`

**Request Type:** POST

**Returned Data Format**: json

**Description:**
- Updates the game_state table .

- Checks to validate that this scenario is in their list of given scenarios, and then adds it to that player's list of "selected" scenarios.

  - If this scenario_id is not in their list of given scenarios, this player cannot select this scenario, and no change to the database is made.
  - If this scenario_id is already in their list of selected scenarios, no change to the database is made, as they've already selected it.

**Example Request:** /selectScenario with body parameters `("game_id",1)`, `("scenario_id", 1)`

**Example Response:**

```json
{
  "game_id": 123,
  "scenario_id": 123
}

```

**Error Handling:**

- Possible 400 errors:
  - If game_id or scenario_id is null send text `"No game_id or scenario_id inputed"`
  - If senario is selected or is not in scenario array of the data base send json
  ```json
    {
    "error": "Could not select scenario ID: <insert scenario ID>"
    }

  ```
- Possible 500 errors:
  - if queries are not exert correctly send text `"Something went wrong on the server, try again later."`

## Desides If It Is A BINGO!
**Request Format:** /bingo with body params `game_id`

**Request Type:** POST

**Returned Data Format**: JSON

**Description:**
- Once the player calls "Bingo!" (clicks the #bingo button), the /bingo endpoint validates whether or not they can win.

- This is determined by checking if they have at least Math.sqrt(board_size) scenarios selected.
- If there wasn't a winner (for example, in the case that the player did not have enough selected scenarios), the "winner" parameter is set to null:

**Example Request:** /bingo with body params
`("game_id", 1)`

**Example Response:**
- If bingo is legal:
```json
{
  "game_id": 123,
  "winner": "abc"
}
```
- If bingo is not legal:
```json
{
  "game_id": 123,
  "winner": null
}
```
**Error Handling:**

- Possible 400 errors:
  - If game_id is null send text `"No game_id inputs"`
  - If game already has a winner send json
  ```json
  {
  "error": "Game has already been won."
  }
  ```
- Possible 500 errors:
  - If sql doesn't fetch result correctly send text `"Something went wrong on the server, try again later."`

## Resume Game To Previous State
**Request Format:** /resumeGame?game_id=`somegid`&player_id=`somepid`

**Request Type**: GET

**Returned Data Format**: JSON

**Description:**
Retrieves the game state for this game_id from the database.

**Example Request:** /resumeGame?game_id=123&player_id=123

**Example Response:**
```json
{
  "game_id": 123,
  "player": {
    "id": 123,
    "name": "abc",
    "board": [
      {"id": 123, "text": "abc"},
      // ...
    ],
    "selected_scenarios": [
      123,
      456,
      // ...
    ]
  }
}
```

**Error Handling:**
- Possible 400:
  - If game_id or player_id is null send text `"no game_id or player_id"`
  - If the player_id given in the parameters is not in the game_state data send json
  ```json
  {
  "error": "Cannot resume game: Player <id> was not part of game <id>"
  }
  ```
- Possible 500 errors:
  - If database is not function well send text `"Something went wrong on the server, try again later."`


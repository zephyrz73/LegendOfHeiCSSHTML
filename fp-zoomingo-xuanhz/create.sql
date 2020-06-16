CREATE TABLE IF NOT EXISTS game_state (
  board_id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_id INTEGER NOT NULL,
  player_id INTEGER,
  scenarios_id TEXT,
  selected_id TEXT,
  FOREIGN KEY (game_id) REFERENCES games(game_id),
  FOREIGN KEY (player_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS players (
  player_id INTEGER PRIMARY KEY AUTOINCREMENT,
  names VARCHAR(256)
);

CREATE TABLE IF NOT EXISTS games (
  game_id INTEGER PRIMARY KEY AUTOINCREMENT,
  winner_id INTEGER,
  FOREIGN KEY (winner_id) REFERENCES players(player_id)
);

CREATE TABLE IF NOT EXISTS scenarios (
  scenario_id INTEGER PRIMARY KEY AUTOINCREMENT,
  text VARCHAR(256) NOT NULL
);

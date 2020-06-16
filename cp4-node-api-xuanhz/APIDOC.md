# Story Solitare Login API Documentation
This API handles Story Solitare users' login and sign up behavior by manage the storage of player profile data. It also auto-generate random background image, random daily sentence, and random username, pen name pair for the client.

## Get Sentence For The Day
**Request Format:** /sentence

**Request Type:** GET

**Returned Data Format**: Plain Text

**Description:** Get random sentence for the day from sentence-for-day.txt


**Example Request:** /sentence

**Example Response:**

```
Science is organized knowledge. Wisdom is organized life.
```

**Error Handling:**
- Possible 500 (invalid request) errors (all plain text):
  - If fail to read from sentence-for-day.txt send `There is problem with server to fetch sentence for the day`

## Send Random Image With Given Style Or Send Original
**Request Format:** /rand-img?style=(specified style)

**Request Type:** GET

**Returned Data Format**: PNG

**Description:** Get random img with different style crystalize, blackwhite or original

**Example Request:** /rand-img?style=crystalize

**Example Response:**

![background](public/pics/clbg1.png)
```
Response type: png
```

**Error Handling:**

- Possible 500 (invalid request) errors (all plain text):
  - If fail to read image file from pics directory send `"There is problem with server to fetch random image"`

## Generate random username pename pair
**Request Format:** /rand-name

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Get random username, penname pair send as json

**Example Request:** /rand-name

**Example Response:**
```json
{"username":"iloveice01","pen-name":"Amelia"}
```

**Error Handling:**

- Possible 500 (invalid request) errors (all plain text):
  - If fail to read json file which store the usernames and pen names `"There is problem with server to fetch random username"`

## Login the user into the system
**Request Format:** /login endpoint with POST parameters of `name` and `password`

**Request Type**: POST

**Returned Data Format**: JSON

**Description:** See if password and username match system records if so return the profile except password, else return error that fail to log in user..

**Example Request:** /login with POST parameters of `username=zephyrZZ` and `password=afghm334`

**Example Response:**
```json
{"username": "zephyrZZ", "penName": "Zephyr Z","birthday": "1999-07-03", "gender": "female"}
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If didn't put in username or password `Missing POST parameter: name, and/or password`
- Possible 500 (invalid request) errors (all plain text):
  - If fail to get result from data base `""There is problem with server to log you in.""`

## Sign the User up
**Request Format:** /signup endpoint with POST parameters of `name`, `password`, `birthday`, `gender`, `penName`

**Request Type**: POST

**Returned Data Format**: Plain Text

**Description:** Sign up the user. See if username, pen name, password already exist in records, if so, send text says match records, otherwise sign user up, insert profile into database and send sign up successfully

**Example Request:** /signup with POST parameters of `username=zephyrZZ`, `password=afghm334`, `birthday=02-10-1999`, `gender=female`, `penName=Zephyr Z`

**Example Response:**
```
Successfully signed up!
```

**Error Handling:**
- Possible 400 (invalid request) errors (all plain text):
  - If didn't put in username ,pen name, and/or password `Missing POST parameter: username, password, and/or penName`
- Possible 500 (invalid request) errors (all plain text):
  - If fail to get result from data base or inserting new information to the table send `"There is problem with server to sign you up."`


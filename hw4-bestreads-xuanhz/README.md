# Homework 4 - Bestreads - Project Specification

*Special thanks to Allison Obourn for the original version of this assignment. Additional thanks to
Tal Wolman and Jack Venberg for the adaptation of this assignment into Node.js*

## Overview
This assignment focuses on implementing a web service in Node.js with Express and then using AJAX from a client JS program to retrieve data from it. The web service you implement will generate a variety of data about different books depending on the parameters it is sent. The client-side JS you will implement will make requests to this service and use the responses to update pages on your site.

<p>
  <img src="http://courses.cs.washington.edu/courses/cse154/20sp/homework/hw4/screenshots/overview-img.png" width="60%" alt="Bestreads main view">
</p>
Figure 1: Bestreads front page (rendered in Chrome on Mac OSX)

### Starter Files and Final Deliverables

In this HW4 repository you will find the following starter files and directories:

| File/folders | Repository files to stay unchanged |
|--------------------|------------------------------|
| `public/bestreads.html` |  The HTML file for the Bestreads website.|
| `public/bestreads.css`  |  The stylesheet for `bestreads.html`. |
| `public/covers/`  | All book cover images used to display on the webpage. |
| `public/images/`        | All other images used by the `HTML` and `CSS` for the webpage. |
| `bestreads.db`         | Represents database with all relevant tables|
| `.gitignore` | A file provided to ignore `node_modules` when pushing your code to GitLab |

The  `bestreads.html`, `bestreads.css`, `covers`, and `images` starter files are located inside of a `public` subdirectory inside of your repository. This allows you to serve these files to the client from your server. Everything outside of that directory, the client cannot access. You should not change the provided directory structure. Your repository should be submitted with these (**unchanged**) starter files as well as the following files you are responsible for creating:

| File          | Repository file you will implement and turn in |
|---------------|------------------------------|
| `package.json` | The JSON file with your project dependencies (e.g. `express`) which you initialize with `npm init` |
| `app.js` |The Node.js service that will supply the book data. |
| `public/bestreads.js`  | The JavaScript that will request the information from `app.js` and populate it into `bestreads.html`. |

**Important Note**: Make sure to never directly edit the `package.json` to ensure we can install the `node_modules` necessary for your solution.

The `app.js` file  should be saved at the root of this directory (at the same level as `public`). Your solution will be graded only on `app.js` and `bestreads.js`. Any changes you make to `bestreads.html`, `bestreads.css`, `images`, or the `covers` subdirectory will not be eligible for full credit.

## External Requirements
Your webpage should match the overall appearance/behavior of the provided screenshots and it **must** match the appearance/behavior specified in this document.

When the page loads it should display the images and titles of each book for which you have data in a grid-like collection of selectable books (with covers and title) as depicted in Figure 1. The interface for this page is fairly straightforward: When the mouse hovers over a book on the main page, the cursor should turn to a pointer indicating that the user may click on that title by adding the provided `.selectable` CSS class. Clicking on any portion of a book cover (the title, image or rectangle container) hides the `#all-books` section, using the provided `.hidden` CSS class, and it will show the book details page (contained in the `#single-book` section). The `#single-book` section will be populated with all of the information about that book, as shown in Figure 2.

If the Home button in the upper right corner of the screen is clicked, the user will be returned to the `#all-books` view by hiding the `#single-book` and showing the `#all-books` view.

<p>
  <img src="http://courses.cs.washington.edu/courses/cse154/20sp/homework/hw4/screenshots/single-book-img.png" width="100%" alt="Single Book main view">
</p>
Figure 2: Bestreads single book image page (rendered in Chrome on Mac OSX)  
  
The information displayed on these pages will be retrieved through `GET` requests to the API you create.  You should send a request to the server for data for this book and display its cover image, title, author, description and reviews. Based on the reviews, you will also set the overall rating for the book.

If at any time there is an error, the entire `#book-data` section (which contains both the `#all-books` and `#single-book` sections) should be hidden, the `#err-text` should be shown, and the Home button should be disabled. Note that on this particular client-side use of the Bestreads API, it doesn't make sense to tell a user of the website what type of error occurred, so we have a generic message included in the HTML that is hidden with the `hidden` class, but should be shown whenever an error occurs (whether it is the 400 or 500 error code). The expected view when an error occurs is shown in Figure 3 below.

<p>
  <img src="http://courses.cs.washington.edu/courses/cse154/20sp/homework/hw4/screenshots/error-mode.png" width="100%" alt="Error text displayed">
</p>
Figure 3: Sample Bestreads error displayed (rendered in Chrome on Mac OSX)


## Bestreads API Overview
The `bestreads.db` file contains both the `books` and `reviews` table containing all pertinent information. The `books` table contains four columns; `book_id`, `title`, `author` and `description`. The reviews table also contains four columns; `book_id`, `name`, `rating` and `text`. 

### Bestreads API Request Details
Your `app.js` web service will provide different data based upon the route. The possible endpoints are described below:

#### Endpoint 1: Get a book’s description
**Request Format:** `/bestreads/description/:book_id`  
**Request Type:** `GET`  
**Returned Data Format:** plain text  
**Description:** . Your service get the `description` from the `books` table based on the `book_id` and respond with the entire contents as plain text.  
**Example Request:** `/bestreads/description/harrypotter`  
**Example Output:**
```
Harry Potter is lucky to reach the age of thirteen, since he has already survived
the murderous attacks of the feared Dark Lord on more than one occasion. But his
hopes for a quiet term concentrating on Quidditch are dashed when a maniacal
mass-murderer escapes from Azkaban, pursued by the soul-sucking Dementors who
guard the prison. It's assumed that Hogwarts is the safest place for Harry to
be. But is it a coincidence that he can feel eyes watching him in the dark,
and should he be taking Professor Trelawney's ghoulish predictions seriously?
```

#### Endpoint 2: Get a book’s information
**Request Format:** `/bestreads/info/:book_id`  
**Request Type:** `GET`  
**Returned Data Format:** JSON  
**Description:** Your service should get the `title` and `author` from the `books` table based on the `book_id` and output in JSON format
**Example Request:** `/bestreads/info/harrypotter`  
**Example Output:**

```json
{
  "title": "Harry Potter and the Prisoner of Azkaban (Harry Potter #3)",
  "author": "by J.K. Rowling, Mary GrandPre (Illustrator)"
}
```

#### Endpoint 3: Get a book’s reviews
**Request Format:** `/bestreads/reviews/:book_id`  
**Request Type:** `GET`  
**Returned Data Format:** JSON  
**Description:**  Your service should get all the `name`s, `ratings`s and `text` from the `reviews` table for the book (based on the `book_id`) and output an array (in JSON form) containing all the reviews for the book   
**Example Request:** `/bestreads/reviews/harrypotter`  
**Example Output:**
```json
[
    {
        "name": "Wil Wheaton",
        "rating": 4.1,
        "text": "I'm beginning to wonder if there will ever be a Defense Against The Dark Arts teacher who is just a teacher."
    },
    {
        "name": "Zoe",
        "rating": 4.8,
        "text": "Yup yup yup I love this book"
    },
    {
        "name": "Kiki",
        "rating": 5,
        "text": "Literally one of the best books I've ever read. I was chained to it for two days. I cried and laughed and yelled AHH when all of the action went down."
    }
]
```

#### Endpoint 4: Get the list of all books
**Request Format:** `/bestreads/books`  
**Request Type:** `GET`  
**Returned Data Format:** JSON  
**Description:** Your service should get the `title` and `book_id` from the `books` table and outputs JSON containing the information in the order of book_ids alphabetically.  
**Example Request:** `/bestreads/books`  
**Example Output:** (abbreviated)  
```json
{
    "books": [
        {
            "title": "2001: A Space Odyssey",
            "book_id": "2001spaceodyssey"
        },
        {
            "title": "Alanna: The First Adventure (Song of the Lioness #1)",
            "book_id": "alannathefirstadventure"
        },
        {
            "title": "Alice in Wonderland",
            "book_id": "aliceinwonderland"
        },
        ... (one entry like this for each folder inside books/)
    ]
}
```
#### Handling Invalid Requests
Your web service should handle invalid requests with the appropriate status code. The only invalid request you need to handle is if a given `book_id` parameter does not exist in the `books` table. 

If no data exists for the given `book_id`, the error should be sent with the **in plain text** message:

  `"No results found for <book_id>."`

replacing `<book_id>` with the parameter passed (**maintaining original letter-casing**). No other output should be produced.

### Handling Server-side Errors
If any error occurs _not_ due to an invalid `book_id` parameter (handled above), it must be handled appropriately with the plain text message:

  `"Something went wrong on the server, try again later."`

### Client-side JavaScript Details
Your `bestreads.js` will use AJAX `fetch` to request data from your Node.js Bestreads API and insert it into `bestreads.html`. Your page should have the following functionality:

* When the page loads it should request all of the books (`/bestreads/books`) from the Bestreads API. It should display each of these books by adding the image of the books cover (in a `img` tag) and the books title (in a `p` tag) *directly* into a `div` and adding that `div` *directly* to the `#all-books` section already on the page *in the order that they are returned from the API*. The `#single-book` section should be hidden. The `.hidden` class is provided in `bestreads.css`.

* **Note**: Only one listing for each book returned by the API should appear on the page.

* As mentioned previously, it should be apparent to the user that they can click on a book. Thus the cursor should turn to a pointer when the user's mouse is hovering over either a book cover, title, or container. To assist you we have provided the `.selectable` class in `bestreads.css` which you should add to the created book elements.

* When a user clicks on a book cover, or title of a book, or the container holding both, the  `#all-books` section should be hidden and the `#single-book` section should be shown. You should then request the info, description, and reviews for that book from the server. The cover image, title, and author retrieved from the info and the description requests, should be inserted into the `"book-cover"`, `#book-title`, `#book-author`, and `#book-description` elements in the `#single-book` section (replacing any information from a previously-selected book).  

* For the reviews, you will need to create elements to append information for each review *directly* in the `#book-reviews` section of the page *in the order that they are returned from the API*:
  * The name of the reviewer and should be placed into an `h3`.
  * The rating of the review should be placed in an `h4` prepended with `"Rating: "`. For example if a
  review had a rating of 4.3 from a reviewer, the second line of the review would display:
  ```
  Rating: 4.3
  ```
  * The text of the review should be inserted into a `p` element.
  * The `h3`, `h4`, and the `p` must be appended _directly_ into the `#book-reviews` section.
* You will also need to calculate and display the value for the `#book-rating` element of the `#single-book` section. This can be accomplished by averaging the ratings from each review (above). You may assume all books have at least one review for the purposes of this calculation.

**Details about Rating Formats:**  
The ratings returned from the web service are not guaranteed to be formatted consistently (for example, a rating for one review may be 3 and the rating for another review may be 3.0). All ratings (`#book-rating` and the `h4` for each review rating) should be displayed consistently on the bestreads website rounded to 1 decimal place. For example, `3.72` should be rounded to `3.7`. This includes whole numbers, for example if the average is 3, it should be displayed as `3.0`.

To accomplish this formatting for all ratings, including the average, (for the `#book-rating`, make sure to format _after_ calculating the average), you should use the [`toFixed`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) function which returns a string representation of a Number guaranteeing a precision of 1 digit after the decimal. For example, a rating of 3, 2.99, or 3.03 should all be formatted and displayed as 3.0, and a rating of 4.5 should be formatted and displayed as 4.5.

```javascript
let averageRating = 3.01; // or 2.99 or 3.03
let formattedRating = averageRating.toFixed(1); // "3.0"
```

* If the Home button on the upper-right is clicked the `#single-book` section should be hidden and the `#all-books` section should be displayed with all of the books still shown. You may assume that the list of books won't change between visits to the `#all-books` view, and thus you should *not* make unnecessary requests to the server when showing this view.

* All fetch calls in `bestreads.js` should catch any possible errors returned by bestreads API. You may use `async`/`await` in your client-side JS as an alternative to the Promise `.then` chain, but must catch errors with the `try`/`catch` equivalent of `.then`/`.catch`.

## Internal Requirements
For full credit, your page must not only match the external requirements listed above, but must also
demonstrate good use of client-side and server-side JS and overall code quality as demonstrated in class and
  detailed in the [CSE 154 Code Quality Guidelines](https://courses.cs.washington.edu/courses/cse154/codequalityguide). We also expect you to implement relevant feedback from previous assignments. As usual, we have included some common things relevant to this assignment below.

### Overall JS
* Both JS files must pass the linter with no errors
* JS files must include `"use strict"` at the top of the file.
* If a particular literal value is used frequently, declare it as a "program constant" with `const` `IN_UPPER_CASE` and use the constant in your code.
* Utilize functions for good readability. Capture common operations as functions to keep code size and complexity from growing. You should not have any functions that are more than 30 lines of code. Keep variable scope as limited as possible.

### Server-side JS
* Your Node.js web service must follow the guidelines and conventions demonstrated in class as well as the [Node/Express](https://courses.cs.washington.edu/courses/cse154/codequalityguide/node/#table-of-contents) section of the Code Quality Guide.
* Each response should [specify the correct content type](https://courses.cs.washington.edu/courses/cse154/codequalityguide/node/#setting-response-headers) before sending a response (this includes the 400 and 500 error responses). Also remember that by default a response is sent as HTML, which is not the same as plain text.
* Content type headers should only be set when necessary and should never be overridden (see relevant section of Code Quality Guide [here](https://courses.cs.washington.edu/courses/cse154/codequalityguide/node/#overwriting-headers)).
* Similar to your client-side JS, decompose your Node.js/Express API by writing smaller, more generic functions that complete one task rather than a few larger "do-everything" functions - your web service should have _at least_ one helper function defined and used for _each_ endpoint. This means that, at minimum, you should define four functions in your web service.
* Declare modules at the top of your file, using `const` and camelCasing conventions to represent values that should never change (recall this is different than a program constant such as `PORT` which should still follow `UPPER_CASE` naming conventions). Only declare modules that you use.
* Handle all db errors with `try`/`catch`
* Prefer `async`/`await` to simplify your asynchronous code.
* Do not pass the `req` and/or `res` as arguments to helper functions. Prefer pulling out other functionality into helper functions as demonstrated in section and lecture.

### Client-side JS
* Your client-side JS must use the module pattern.
* Do not use any global variables, and minimize the use of module-global variables. Do not ever
  store DOM element objects, such as those returned by the `document.getElementById` function, as
  module-global variables.
* Avoid unnecessary fetch requests to the web service - you should only make requests where needed to update DOM elements based on the expected behavior outlined in this spec. We **strongly** recommend walking through different interactions on your page with the Networks tab to see how often you are making fetch requests.
* Separate content (HTML), presentation (CSS), and behavior (JS). Your JS code should use styles and classes from the CSS when provided rather than manually setting each style property in the JS. For example, rather than setting the
`.style.display` of a DOM object to make it hidden/visible, instead, add/remove the `.hidden`
class in the provided CSS to the object's `classList`.
* Do not include any files in your final repository other than those outlined in "Starter Files and Final Deliverables".

### Documentation
* For both JS files, place a comment header in each file with your name, section, a brief description of the file.
* Use JSDoc to properly document all of your JS functions with a description of the function as well as `@param` and `@return` where necessary.
* In your Node.js file, your file header comment should provide a descriptive summary of the web service and description of all endpoints (endpoint format, parameters, response content type, and possible errors). This file comment should be more descriptive than other JS file comments since you are not providing an APIDOC.
* Each endpoint should also be briefly commented with 1-2 sentences having similar expectations of a function comment (but without `@param` or `@return`)

## Grading
A potential rubric for this assignment **might be** summarized as:  

* External Correctness: 45-55%
* Internal Correctness: 35-45%
* Documentation: 5-10%

## Academic Integrity
As with other CSE 154 HW assignments, you may not work with other students on HW4, and all work must be your own. Submissions found sharing code or using code from resources online will be subject to the University's Academic Misconduct process. You may also not place your solution to a publicly-accessible web
site, neither during nor after the school quarter is over. Doing so is considered a violation of our
course [academic integrity](https://courses.cs.washington.edu/courses/cse154/20sp/syllabus/syllabus.html#academic-conduct)
policy. As a reminder: This page page states:

  The Paul G Allen School has an entire page on
  [Academic Misconduct](https://www.cs.washington.edu/academics/misconduct) within the context of
  Computer Science, and the University of Washington has an entire page on how
  [Academic Misconduct](https://www.washington.edu/cssc/for-students/academic-misconduct/) is
  handled on their
  [Community Standards and Student Conduct](https://www.washington.edu/cssc/) Page. Please acquaint
  yourself with both of those pages, and in particular how academic misconduct will be reported to
  the University.

**Note about fair use for book cover images:** The book cover images for this assignment were found through various public domains (e.g. wikipedia.org). Under [Fair Use](https://www.law.cornell.edu/uscode/text/17/113), these are considered lawfully distributed for educational purposes.

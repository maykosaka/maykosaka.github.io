/*  MOVIE TRACKER APP

* API Call: user enters movie name, hit Submit AJAX call to omdb endpoint with movie name dynamically added on
* Create: when user clicks a movie image from the selection, saves it to Database. (later) Heart icon next to each movie
* Read: Faves page show all Faves/Hearted & shows if they’re watched.
* Update: click Watched on a movie of Faves page, adds Watched value to that movie in Database
* Delete: when user clicks a movie on Faves page, movie gets deleted from Database
*/

$(document).ready(function() {

  $("#faves").addClass('hide')

  // create object instance of my Firebase database
  var myDBReference = new Firebase('https://mayko-app.firebaseio.com/');

  // grab <li> Handlebars template & compile
  var sourceTemplate = $('#list-template').html();
  var template = Handlebars.compile(sourceTemplate);



  // user Submits movie name, it searches OMDB, and returns movies that match
  $('#movie-form').submit(function(event) {
    // prevents page refresh
    event.preventDefault();

    // grab user input, clear input field, clear DOM of previous search results
    var movie = $('#movie').val().trim();
    $('#movie').val('');

    // if Faves list was already in DOM, hide it
    $("#faves").addClass('hide')

    // AJAX call to get movie info from OMDB, dynamically append to DOM
    var omdbUrl = 'https://www.omdbapi.com/?s=';
    $.ajax({
      url: omdbUrl + movie,
      type: 'GET',
      success: function(movieObject) {
        // log movie info to check
        console.log(movieObject);

        // handle exception for if the movie doesn't exist on omdb
        if ( movieObject.Search !== undefined) {

            // loop through the data which is an array of movies
            for(var i = 0; i < movieObject.Search.length; i++) {
              // define data object
              var context = {
                image: "https://img.omdbapi.com/?i=" + movieObject.Search[i].imdbID + "&apikey=7fe29f8b",
                title: movieObject.Search[i].Title,
                year: movieObject.Search[i].Year,
                type: movieObject.Search[i].Type,
                imdb: movieObject.Search[i].imdbID
              }
              // send movie info to DOM
              var html = template(context);
              $('#search-results').append(html);
            } // end of for loop

            // CREATE: when user Clicks movie image from the selection (later change to Heart button), add it's info to database
            $('.movie-image').click(function() {
              // prevents page refresh
              //event.preventDefault();

              // var image = movieObject.Search[this].Poster;    didn't work: "no Poster of undefined"
              // add movie info from DOM
              var image = $(this).attr("src"),
                  title = $(this).next().text(),
                  year = $(this).next().next().text(),
                  type = $(this).next().next().next().text();

              var moviesReference = myDBReference.child('faves');
              moviesReference.push({
                image: image,
                title: title,
                year: year,
                type: type
                });
            }) // end of ('.movie-image').click
        } // end of if statement
        else {
          alert("Sorry, " + movie + " doesn't exist in our database. Please try another movie.");
        }
      }, // end of success function
      error: function(movieObject) {
        console.log(movieObject);
        alert('Sorry, our database seems to be down. Please try again later.')
      }
    }); // end of ajax call
  }); // end of Submit function



  // READ functionality: click Favorites button to show Favorites list
  // grab <li> Handlebars template & compile
  var sourceFavesTemplate = $('#faves-template').html();
  var favesTemplate = Handlebars.compile(sourceFavesTemplate);

  $( "#faves-button" ).click(function(event) {
      event.preventDefault();
      // clear Search results from DOM
      $('#search-results').empty();

      $("#faves").removeClass('hide');
      $('#faves-list').empty();

      myDBReference.once("value", function(singleUser) {
          // callback function that will get called for each movie
          singleUser.forEach(function(favesSnapshot) {
            var faves = favesSnapshot.key(); // faves

            favesSnapshot.forEach(function(movieSnapshot) {
              var key = movieSnapshot.key(); // "KLYA7ThSpep0SeYd258"
              var image = movieSnapshot.child('image').val(); // "http://img.omdbapi.com/?i=tt0126029&apikey=7fe29f8b"
              var title = movieSnapshot.child('title').val(); // "Shrek"
              var type = movieSnapshot.child('type').val(); // "Type: movie"
              var year = movieSnapshot.child('year').val(); // "Year: 2001"

              var data = {
                movieId: key,
                favesImage: image,
                favesTitle: title,
                favesYear: year,
                favesType: type,
              };

            var templateHTML = favesTemplate(data);
            var $templateHTML = $(templateHTML);

            $('#faves-list').append($templateHTML);

          })
        })

        // UPDATE functionality: click “Not watched” of a movie on Faves page, add the movie to Watched list in DB
        $('.watched-status').click(function() {
          console.log('watched status been clicked');
          //this.html("<h3>Watched</h3>");   //need this to work so that it changes particular movie, not all movies in faves
          $('.watched-status').html("<h3>Watched</h3>");  // changed in DOM, need to change in DB
        })

        // DELETE functionality: click Remove to delete movie from Faves list
        $('.remove').click(function() {
          console.log('remove been clicked');
        })

      })
  }) // end of Faves button click

});
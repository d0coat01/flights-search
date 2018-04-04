const express = require('express');
const app = express();
var Flights = require('./flights');

app.set('port', (process.env.PORT || 8000));

app.use(express.static(__dirname + '/public'));
app.set('view options', { pretty: true });

app.get('/', function(request, response) {
  response.send("Welcome! Please use /flights/search for search results.");
});

app.get('/flights/search', function(request, response) {
  let flights = new Flights();
  flights.search(function(err , results){
    //There were errors.
    if (err) {
      response.status('400').send({"status":"error", "message": "Something went wrong."});
    }
    //no errors
    else {
      response.send(results);
    }
  });
});
var server = app.listen(app.get('port'), function() {
  console.log('Recommendations is running on port', app.get('port'));
});

module.exports = server;

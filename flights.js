//Using the javascript Fetch API for scraper requests.
var fetch = require('node-fetch');
//Normally this list would probably be stored in a db somewhere where it could be easily kept up to date.
var providers = ["Expedia", "Orbitz", "Priceline", "Travelocity", "United"];

class Flights {
  constructor(){
  }
  search(callback) {
    let self = this;
    // Construct every search request.
    // searches will be an array of async promises.
    let searches = [];
    for(let provider of providers) {
      let search_request = async function () {
      const res = await fetch('http://localhost:9000/scrapers/' + provider);
      const json = await res.json();
      return json;
    }();
      searches.push(search_request);
    }
    // Resolve all promises in search which are then passed back as an array.
    let results = Promise.all(searches).then(function(values) {
      // For easy lookup and faster sorting, make each provider a key with their flights as data.
      let lookup = {};
      for(let value of values) {
        //make sure provider exists and there is at least one flight.
        if(value.results && value.results[0] && value.results[0].provider) {
          lookup[value.results[0].provider] = value.results;
        }
      }
      callback(null, self.sortByAgony(lookup));
    });
  }

  sortByAgony(searches) {
    let pointers = {};
    let min_agony = [];
    // Initialize pointers.
    for (let search_key in searches) {
      pointers[search_key] = 0;
      min_agony.push(search_key);
    }
    /* The pointers object looks up the current index of each provider.
    *  min_agony is an array of providers.
    *
    * Implementation of Sort:
    * 1. Sort min_agony in reverse order.
    *    - Each value in min_agony yields a provider.
    *    - Lookup the current index in pointers with the value from min_agony.
         - Lookup the agony value in searches with this current index.
         - Compare it to the other agony values.
         - Lowest agony value has its provider moved towards the "top" of min_agony.
    * 2. min_agony.pop() will return the provider of the next lowest agony value.
    * 3. Use provider to lookup its current index in pointers and then push that flight to our results.
    * 4. Increment the index in provider's pointer.
    * 5. If provider's new pointer index matches to a flight, push provider back to min_agony.
    * 6. Repeat until there are no flights remaining in min_agony.
    */
    let results = [];
    while (min_agony.length > 0) {
      min_agony.sort(function(a, b) {
        //We want to sort in reverse order to mimick a stack.
        if(!(pointers[a] || pointers[b])) return 0;
        let agony_a = searches[a][pointers[a]].agony;
        let agony_b = searches[b][pointers[b]].agony;
        if(agony_a > agony_b) return -1;
        else if(agony_a < agony_b) return 1;
        else return 0;
      });
      let lowest_agony_provider = min_agony.pop();
      let lowest_agony = searches[lowest_agony_provider][pointers[lowest_agony_provider]];
      results.push(lowest_agony);
      pointers[lowest_agony_provider]++;
      if(searches[lowest_agony_provider][pointers[lowest_agony_provider]]) {
        min_agony.push(lowest_agony_provider);
      }
    }
    return {"results":results};
  }
}

module.exports = Flights;

# Flights Search

An Express Node.js application that gathers multiple flight search API requests, sorts them based on their agony rating, and returns the sorted flights.

## Requirements
* Node.js >= vers. 7.6
* npm
* python 2.7


## Installation

1. Follow instructions from Hippmunk's [Searchrunner](https://github.com/Hipmunk/hipproblems) problem.
2. From your terminal: `git clone https://github.com/d0coat01/flights-search`
3. `cd flights-search`
4. `npm install`

## Quick Start

1. From flights-search root directory: `node index.js`
2. Open [http://localhost:8000/flights/search](http://localhost:8000/flights/search).
3. See Hippmunk's test [documentation](https://github.com/Hipmunk/hipproblems/tree/master/searchrunner) to make sure everything works.

## Implementation && Analysis

### Tech Stack

* Express.js for an easy API routing framework.
* Node.js >7.6 for the wonderful async/await functionality.

### File Structure

* index.js - Sets up the server and routing using Express.js.
* flights.js - Implements the Flights class that contains flight search and sort logic.

### Retrieve Each Provider's API Search

* Loop through every provider and create an async API request function using [fetch](https://www.npmjs.com/package/node-fetch).
* Store each request in an array.
* Use Promise.all to wait for each API request, which then returns us an array of all the returned flight data.

### Sorting Algorithm

Since each API request result is already sorted by agony, we know that by comparing the first flight of every provider will yield the lowest possible agony. Knowing that, here is the implementation of sorting:

1. Replicate a hash table with a javascript object and store a pointer to each provider's current lowest agony (starting at 0 for each provider).
	- Ex. pointers = `{"Expedia": 0, "United": 0, "Travelocity": 0}`
	- min_agony = `["Expedia", "United", "Travelocity"]`
2. Then, instead of sorting the entire dataset, we can just sort the current flights our pointers reference, with the lowest agony at the highest index so we can easily pop().
	- Ex. What our pointers reference: Expedia agony: 3, United agony: 2, Travelocity agony: 5.
	- Resulting min_agony = `["Travelocity", "Expedia", "United"]`
3. Pop() min_agony, look up that provider's current index in pointers, and add that flight to the results.
	- min_agony = `["Travelocity", "Expedia"]`
	- results = `[{United flight object}]`
4. Next we increment the pointer index we just used and lookup that new flight to check if it exists. 

	- If it does:
		- pointers = `{"Expedia": 0, "United": 1, "Travelocity": 0}`
		- min_agony: `["Travelocity", "Expedia", "United"]`
	- does not:
		- pointers are same as above.
		- min_agony: `["Travelocity", "Expedia"]`

5 . Loop through 1-4 until there are no providers left in min_agony.

### Analysis

#### Sorting time
Variables:
- flights = combined flights of all providers.
- provider_count = # of providers.

Execution time is O(flights * provider_count * log(provider_count)) since we need to loop through every flight at least once and for each flight we need to sort an array of size provider_count at least once.

Memory consumption is O(n) since I built another array of flight data without deallocating the previous data. I did this to save time since splicing each flight from the original data is expensive. If the original data from the API calls were reverse sorted, I could simply pop the flight and allocate it to the results, therefore using O(1) memory.



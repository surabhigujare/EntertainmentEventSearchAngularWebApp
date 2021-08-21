const express = require('express');
const app = express();
const axios = require('axios');

var eventRoute = express.Router();

var data =  {"hi" : "hello"}
var SpotifyWebApi = require('spotify-web-api-node');
const { response } = require('express');
var spotifyApi = new SpotifyWebApi({
  clientId: 'a74aa2c6f121432a84e3f72bb5385c14',
  clientSecret: '108335a44f464f38893ec618c732381f'
});


eventRoute.route('/print-helloWorld/:id').get((req, res) => {
  res.json(data)
});

// Keyword Suggestions API
eventRoute.route('/getKeywordSuggestions/:keywordId').get((req, res) => {
  keyword = req.params.keywordId
  var result = callTicketMasterSuggestionsApi(keyword)
  var keywordSuggestionsresponse = {}
  result.then(function(responseData) {
    keywordSuggestionsresponse = parsekeywordSuggestionsAPI(responseData)
    res.json(keywordSuggestionsresponse)
 })
});

async function callTicketMasterSuggestionsApi(keyword) {
  var keywordParam = keyword.split(' ').join('+');
  let API_URL = 'https://app.ticketmaster.com/discovery/v2/suggest?apikey=bpohdMVIE4tkLwi5EHt4ZkWwziN4L43l&keyword=' + keywordParam
  const result = await axios.get(API_URL)
  .then(response => {
    return response.data
  })
  .catch(error => {
    console.log("error", error);
    return {}
  });
  return result
}

function parsekeywordSuggestionsAPI(response) {
  keywordSuggestionsResponse = {}
  if ('_embedded' in response && 'attractions' in response['_embedded'] && (response['_embedded']['attractions']).length !=0){
    suggestions = response['_embedded']['attractions']
    keywordSuggestions = []
    for (var i = 0; i < suggestions.length ; i++ ) {
      if ('name' in suggestions[i]) {
        keywordSuggestions.push(suggestions[i]['name'])
      }
    }

    keywordSuggestionsResponse = {
      "isDataPresent" : true,
      "keywordSuggestions": keywordSuggestions
    }

  }else {
    keywordSuggestionsResponse = {
      "isDataPresent" : false
    }
  }

  return keywordSuggestionsResponse

}

//Eventlist API
eventRoute.route('/getEventsList/:eventInfo').get((req, res) => {
  var requestParams = JSON.parse(req.params.eventInfo)

  var segementId = getSegmentid(requestParams["category"])
  if (requestParams["radioType"] == "currentLocation") {
    var latitude = requestParams["latitude"]
    var longitude = requestParams["longitude"]
    var geohashCode = getgeohashCode(latitude, longitude )
    var result = callTicketMasterApi(geohashCode, requestParams["distance"], requestParams["unit"], segementId, requestParams["keyword"])
    var event_response = {}
    result.then(function(responseData) {
      if ("_embedded" in responseData) {
        event_response = parseTicketMasterApiResponse(responseData["_embedded"]);
      } else {
        event_response = {
          "isDataPresent" : false
        }
      }
      res.json(event_response)
    })
  } else if (requestParams["radioType"] == "userLocation") {

    var geocodeResponse = getGeocode(requestParams["location"])
    geocodeResponse.then( function(responseData){
      if ("results" in responseData && responseData["results"] == 0) {
        event_response = {
          "isDataPresent" : false
        }
        res.json(event_response)
      } else {
        var response = responseData.results[0]
        var latitude = response['geometry']['location']['lat']
        var longitude = response['geometry']['location']['lng']
        var geohashCode = getgeohashCode(latitude, longitude )
        var result = callTicketMasterApi(geohashCode, requestParams["distance"], requestParams["unit"], segementId, requestParams["keyword"])
        var event_response = {}
        result.then(function(responseData) {
          if ("_embedded" in responseData) {
            event_response = parseTicketMasterApiResponse(responseData["_embedded"]);
          } else {
            event_response = {
              "isDataPresent" : false
            }
          }
          res.json(event_response)
        })
      }
    })
  }
});

//Geocoding API
async function getGeocode(location) {

  var address = location.split(' ').join('+');
  let API_URL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + address + '&key=AIzaSyBL6dMhA--787cy_KrTNjcv-6qCgQ1gshU'
  const result = await axios.get(API_URL)
  .then(response => {
    return response.data
  })
  .catch(error => {
    return response.status(404).send({})
  });
  return result
}

function getgeohashCode(latitude, longitude) {
  var geohash = require('ngeohash');
  return geohash.encode(latitude, longitude);
}

function getSegmentid(category_type) {
  category = {
    "all" : "",
    "Music" : "KZFzniwnSyZfZ7v7nJ",
    "Sports" : "KZFzniwnSyZfZ7v7nE",
    "Arts & theatre" : "KZFzniwnSyZfZ7v7na",
    "Film" : "KZFzniwnSyZfZ7v7nn",
    "Miscellaneous" : "KZFzniwnSyZfZ7v7n1"
  }
  segementId = category[category_type]
  return segementId
}

async function callTicketMasterApi(geohashValue, distance, unit, segment_id, keyword) {
  api_key = "bpohdMVIE4tkLwi5EHt4ZkWwziN4L43l"
  API_URL = "https://app.ticketmaster.com/discovery/v2/events.json?apikey="+api_key+"&keyword="+keyword+"&segmentId="+segment_id+"&radius="+distance+"&unit="+unit+"&geoPoint="+geohashValue+"&sort=date,name,asc"
  console.log(API_URL)
  const result = await axios.get(API_URL)
  .then(response => {
    return response.data
  })
  .catch(error => {
    console.log("error", error);
    return {}
  });
  return result
}

function parseTicketMasterApiResponse(eventsData) {
  eventList = []
  event_response = {}
  undefinedCase = ['Undefined', 'undefined', 'UNDEFINED']
  for (var i = 0; i < eventsData['events'].length; i++)  {
    eventDetails = {"eventId" : null,"date" : "N/A", "genre" : "N/A", "event" : "N/A", "venue": "N/A" }

    item = eventsData['events'][i]
    if ('id' in item) {
      eventDetails['eventId'] = item['id']
    }

    if (('dates' in item) && ('start' in item['dates'])) {
      date = item['dates']['start']
      dateStr = ''
      if ('localDate' in date) {
        dateStr = date['localDate']
      }

      // if ('localTime' in date) {
      //   dateStr += ' ' + date['localTime']
      // }
      eventDetails['date'] = dateStr
    }

    if ('classifications' in item && (item['classifications']).length != 0) {
      classifications = item['classifications'][0]
      genreStr = ''

      if ('segment' in classifications && !(undefinedCase.includes(classifications['segment']['name'])) && (genreStr.includes(classifications['segment']['name']) == false)) {
        genreStr += classifications['segment']['name'] + ' | '
      }

      if ('genre' in classifications && !(undefinedCase.includes(classifications['genre']['name'])) && (genreStr.includes(classifications['genre']['name']) == false)) {
        genreStr += classifications['genre']['name'] + ' | '
      }

      if ('subGenre' in classifications && !(undefinedCase.includes(classifications['subGenre']['name'])) && (genreStr.includes(classifications['subGenre']['name']) == false)) {
        genreStr += classifications['subGenre']['name'] + ' | '
      }

      if ('type' in classifications && !(undefinedCase.includes(classifications['type']['name'])) && (genreStr.includes(classifications['type']['name']) == false)) {
        genreStr += classifications['type']['name'] + ' | '
      }

      if ('subType' in classifications && !(undefinedCase.includes(classifications['subType']['name'])) && (genreStr.includes(classifications['subType']['name']) == false)) {
        genreStr += classifications['subType']['name'] + ' | '
      }

      genreStr = genreStr.slice(0, genreStr.length - 3)
      eventDetails['genre'] = genreStr

    }

    eventDetails['event'] = item['name']

    if ('_embedded' in item && 'venues' in item['_embedded'] && item['_embedded']['venues'].length != 0) {
      venue_details = item['_embedded']['venues'][0]
      if ('name' in venue_details) {
        venue = venue_details['name']
        eventDetails['venue'] = venue
      }
    }
    eventList.push(eventDetails)
    event_response = {
      "isDataPresent" : true,
      "events" : eventList
    }
  }
  return event_response
}

//Event Details API
eventRoute.route('/getEventDetails/:eventId').get((req, res) => {

  eveId = req.params.eventId
  var result = callGetEventDetailsAPI(eveId)
  var eventDetailsresponse = {}
  result.then(function(responseData) {
    eventDetailsresponse = parseEventDetailsApi(responseData);
    res.json(eventDetailsresponse)
 })

});

async function callGetEventDetailsAPI(eventId) {
  API_KEY = "bpohdMVIE4tkLwi5EHt4ZkWwziN4L43l"
  API_URL = 'https://app.ticketmaster.com/discovery/v2/events/'+eventId+'?apikey='+API_KEY
  console.log("event details api", API_URL)
  const result = await axios.get(API_URL)
  .then(response => {
    return response.data
  })
  .catch(error => {
    return {};
  });
  return result
}

function parseEventDetailsApi(eventDetails) {
  eventResponse = {}
  undefinedCase = ['Undefined', 'undefined', 'UNDEFINED']

  if (eventDetails == '') {
    eventResponse['isDataPresent'] = false
  } else {

    if ('name' in eventDetails && !(eventDetails['name'] in undefinedCase)) {
      eventResponse['title'] = eventDetails['name']
    }

    if (('dates' in eventDetails) && ('start' in eventDetails['dates'])) {
      date = eventDetails['dates']['start']
      dateStr = ''
      if ('localDate' in date) {
        dateStr = date['localDate']
      }

      if ('localTime' in date) {
        dateStr += ' ' + date['localTime']
      }
      eventResponse['date'] = dateStr
    }

    if ('_embedded' in eventDetails && 'attractions' in eventDetails['_embedded'] && (eventDetails['_embedded']['attractions']).length != 0) {
      artists = eventDetails['_embedded']['attractions']
      artistStr = ''
      artistsArr = []
      for (var i = 0; i < artists.length; i++ ) {
        artist = {}
        if ('name' in artists[i]) {
          artistStr += artists[i]['name'] + ' | '
          artist['name'] = artists[i]['name']
        }
        artistsArr.push(artist)
      }
      artistStr = artistStr.slice(0, artistStr.length - 3)
      eventResponse['artist_str'] = artistStr
      eventResponse['artist_team'] = artistsArr
    }

    if ('_embedded' in eventDetails && 'venues' in eventDetails['_embedded'] && (eventDetails['_embedded']['venues']).length != 0) {
      venues = eventDetails['_embedded']['venues'][0]
      eventResponse['venue'] = venues['name']
    }


    if ('classifications' in eventDetails && (eventDetails['classifications']).length != 0) {
      genreStr = ''
      for( var i = 0; i < (eventDetails['classifications']).length; i++) {
        classifications = eventDetails['classifications'][i]

        if ('segment' in classifications && !(undefinedCase.includes(classifications['segment']['name'])) && (genreStr.includes(classifications['segment']['name']) == false)) {
          genreStr += classifications['segment']['name'] + ' | '
        }

        if ('genre' in classifications && !(undefinedCase.includes(classifications['genre']['name'])) && (genreStr.includes(classifications['genre']['name']) == false)) {
          genreStr += classifications['genre']['name'] + ' | '
        }

        if ('subGenre' in classifications && !(undefinedCase.includes(classifications['subGenre']['name'])) && (genreStr.includes(classifications['subGenre']['name']) == false)) {
          genreStr += classifications['subGenre']['name'] + ' | '
        }

        if ('type' in classifications && !(undefinedCase.includes(classifications['type']['name'])) && (genreStr.includes(classifications['type']['name']) == false)) {
          genreStr += classifications['type']['name'] + ' | '
        }

        if ('subType' in classifications && !(undefinedCase.includes(classifications['subType']['name'])) && (genreStr.includes(classifications['subType']['name']) == false)) {
          genreStr += classifications['subType']['name'] + ' | '
        }
      }

      genreStr = genreStr.slice(0, genreStr.length - 3)
      eventResponse['genres'] = genreStr

    }

    if ('priceRanges' in eventDetails && (eventDetails['priceRanges']).length != 0) {
      prices = eventDetails['priceRanges'][0]
      eventResponse['price'] = (prices['min']).toString() + ' - ' + (prices['max']).toString() + ' ' + prices['currency']
    }

    if ('url' in eventDetails) {
      eventResponse['buy_at'] = 'Ticketmaster'
      eventResponse['buy_at_url'] = eventDetails['url']
    }

    if ('seatmap' in eventDetails && 'staticUrl' in eventDetails['seatmap']) {
      eventResponse['seat_url'] = eventDetails['seatmap']['staticUrl']
    }


    if ('dates' in eventDetails && 'status' in eventDetails['dates'] && 'code' in eventDetails['dates']['status']) {
      eventResponse['ticket_status'] = eventDetails['dates']['status']['code']
    }

    eventResponse['isDataPresent'] = true
  }
  return eventResponse
}

//Venue Details API
eventRoute.route('/getVenueDetails/:venueId').get((req, res) => {
  venueName = req.params.venueId
  var result = callTicketmasterVenueAPI(venueName)
  var venueResponse = {}
  result.then(function(responseData) {
    venueResponse = parseTicketmasterVenueAPI(responseData)
    res.json(venueResponse)
 })
})

async function callTicketmasterVenueAPI(venueName) {
  var venueNameParam = venueName.split(' ').join('+');
  let API_URL = 'https://app.ticketmaster.com/discovery/v2/venues.json?keyword=' + venueNameParam + '&apikey=bpohdMVIE4tkLwi5EHt4ZkWwziN4L43l'
  console.log("Venue Details API", API_URL)
  const result = await axios.get(API_URL)
  .then(response => {
    return response.data
  })
  .catch(error => {
    console.log(" Venue Api error");
    return {}
  });
  return result
}

function parseTicketmasterVenueAPI(responseData) {
  parsedResponse = {}
  if ('_embedded' in responseData && 'venues' in responseData['_embedded'] && (responseData['_embedded']['venues']).length != 0) {
    res = responseData['_embedded']['venues'][0]
    parsedResponse = {"isDataPresent": true, "address": "N/A", "city" : "N/A", "phoneNo" : "N/A", "open_hours": "N/A", "general_rule": "N/A", "child_rule": "N/A", "latitude": 0, "longitude": 0}

    if ('address' in res && 'line1' in res['address']){
      parsedResponse['address'] = res['address']['line1']
    }

    if ('city' in res && 'name' in res['city'] ) {
      citystr = ''
      citystr = res['city']['name']
      if ('state' in res && 'name' in res['state'] ) {
        citystr += ', ' + res['state']['name']
      }
      parsedResponse['city'] = citystr
    }

    if ('boxOfficeInfo' in res && 'phoneNumberDetail' in res['boxOfficeInfo'] ) {
      parsedResponse['phoneNo'] = res['boxOfficeInfo']['phoneNumberDetail']
    }

    if ('boxOfficeInfo' in res && 'openHoursDetail' in res['boxOfficeInfo'] ) {
      parsedResponse['open_hours'] = res['boxOfficeInfo']['openHoursDetail']
    }

    if ('generalInfo' in res && 'generalRule' in res['generalInfo'] ) {
      parsedResponse['general_rule'] = res['generalInfo']['generalRule']
    }

    if ('generalInfo' in res && 'childRule' in res['generalInfo'] ) {
      parsedResponse['child_rule'] = res['generalInfo']['childRule']
    }

    if ('generalInfo' in res && 'childRule' in res['generalInfo'] ) {
      parsedResponse['child_rule'] = res['generalInfo']['childRule']
    }

    if ('location' in res && 'longitude' in res['location'] ) {
      parsedResponse['longitude'] = parseFloat(res['location']['longitude'])
    }

    if ('location' in res && 'latitude' in res['location'] ) {
      parsedResponse['latitude'] = parseFloat(res['location']['latitude'])
    }

  } else {
    parsedResponse["isDataPresent"] = false
  }

  return parsedResponse
}

//Spotify - Search Artist API
//client -id a74aa2c6f121432a84e3f72bb5385c14
//client -secret 108335a44f464f38893ec618c732381f

eventRoute.route('/getArtistsDetails/:artistName').get( async(req, res) => {
  artistNameParam = JSON.parse(req.params.artistName)
  var artistResponse = []
  for (var i = 0; i < artistNameParam.length; i++) {
    var artist = artistNameParam[i]['name']
    console.log("artist name", artist)
    var result = await callSpotifySearchArtistsAPI(artist)

    if(result.statusCode == 401) {
      var result = await spotifyApi.clientCredentialsGrant().then(
        function(data) {
          console.log('The access token expires in ' + data.body['expires_in']);
          console.log('The access token is ' + data.body['access_token']);
          // Save the access token so that it's used in future calls
          spotifyApi.setAccessToken(data.body['access_token']);
        },
        function(err) {
          console.log('Something went wrong when retrieving an access token', err);
        }
      );

      var artistdata = await callSpotifySearchArtistsAPI(artist)
      if(artistdata.statusCode == 200) {
        var parsedResponse = parseSpotifySearchArtistsAPI(artistdata.body, artist)
        console.log("artist rsponse", parsedResponse)
        artistResponse.push(parsedResponse)
        if (i == artistNameParam.length - 1) {
          res.json(artistResponse)
        }
      }
    } else {
      var parsedResponse = parseSpotifySearchArtistsAPI(result.body, artist)
      console.log("artist rsponse", parsedResponse)
      artistResponse.push(parsedResponse)
      if (i == artistNameParam.length - 1) {
        res.json(artistResponse)
      }
   }
  }
});

async function callSpotifySearchArtistsAPI(artistName) {
  console.log("search artist api")
  var result =  await spotifyApi.searchArtists(artistName)
  .then(function(data) {
    return data
  }, function(err) {
    console.error("spotify error", err);
    var data = {
      "statusCode" : 401
    }
    return data
  });
  return result
}

function parseSpotifySearchArtistsAPI(responseData, artistName) {
  var response = {}
  if ('artists' in responseData && 'items' in responseData['artists'] && (responseData['artists']['items']).length != 0) {
    items = responseData['artists']['items']
    for (var i = 0; i < items.length; i++) {
      if (artistName.toUpperCase() == items[i]['name'].toUpperCase()) {
        response = {"isDataPresent": true,"name": "N/A", "followers" : "0", "popularity" : "N/A", "checkAt": "N/A"}
        response["name"] = items[i]['name']
        response["followers"] = items[i]['followers']["total"]
        response["popularity"] = items[i]['popularity']
        response["checkAt"] = items[i]['external_urls']["spotify"]
        break
      } else {
        response = { "isDataPresent": false}
      }
    }
  } else {
    response = { "isDataPresent": false}
  }
  return response
}


module.exports = eventRoute;

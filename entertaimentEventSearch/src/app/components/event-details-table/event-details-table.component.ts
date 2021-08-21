import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/service/event.service';
import { eventDetailsDataModel } from '../eventDetailsDataModel';
import { artistDetailsDataModel } from '../artistDetailsDataModel';
import { venueDetailsDataModel } from '../venueDetailsDataModel';
import { animate, style, transition, trigger } from '@angular/animations';
import { eventDataModel } from '../eventDataModel';

@Component({
  selector: 'app-event-details-table',
  templateUrl: './event-details-table.component.html',
  styleUrls: ['./event-details-table.component.css'],
  animations: [
    trigger('flyInOut', [
      transition('void => *', [
        style({transform: 'translateX(-100%)'}),
        animate('0.3s')
      ]),
      transition('* => void',[
        animate('0.3s', style({transform: 'translateX(100%)'}))
      ])
    ])
  ]
})
export class EventDetailsTableComponent implements OnInit {

  constructor(private eventService: EventService) { }

  eventDetailsObj: eventDetailsDataModel = new eventDetailsDataModel();
  artistDetailsObjArray: artistDetailsDataModel[] = [];
  venueDetailsObj: venueDetailsDataModel = new venueDetailsDataModel();
  artistNames = [];
  eventDataObj:eventDataModel = new eventDataModel();

  viewMode = 'tab1';
  currentPopularity = 91;
  maxPopularity = 100;
  displayComponent: Boolean = false

  venueErrorType = "no error";
  eventdetailsErrorType = "no error";
  artistdetailsErrorType = "no error";

  ngOnInit(): void {
    this.shouldDisplayComponent()
    this.getDetails()
  }

  shouldDisplayComponent() {
    this.eventService.displayEventDetailsTab
    .subscribe(clicked => {
      this.displayComponent = clicked
    })
  }

  getDetails() {
    this.eventService.eventDetails
    .subscribe( response => {
      this.eventService.isEventFavourite.subscribe( eventDataObj => {
        this.parseEventDetailsResponse(response, eventDataObj)
        this.callArtistDetailsApi()
      })
    })

    this.eventService.venueDetails
    .subscribe( response => {
      this.venueErrorType = "no error";
      console.log("Venue Details Response", response)
      this.parseVenueDetailsResponse(response)
    })
  }

  parseEventDetailsResponse(response: any, eventDataObj: eventDataModel) {
    this.eventDetailsObj = new eventDetailsDataModel()
    var tempEventObj = new eventDetailsDataModel()
    this.artistNames = []
      if ('isDataPresent' in response && response['isDataPresent'] == true) {

        if ('title' in response) {
          tempEventObj.eventname = response['title']
        }

        if ('artist_team' in response) {
          this.artistNames = response['artist_team']
          this.artistdetailsErrorType = "no error"
        } else {
          this.artistNames = []
          this.artistDetailsObjArray = []
          this.artistdetailsErrorType = "warning"
        }

        if ('artist_str' in response) {
          tempEventObj.artistName = response['artist_str']
        }
        if ('venue' in response) {
          tempEventObj.eventVenue = response['venue']
        }

        if ('date' in response) {
          tempEventObj.eventTime = response['date']
        }

        if ('genres' in response) {
          tempEventObj.eventcategory = response['genres']
        }

        if ('price' in response) {
          tempEventObj.eventPriceRange = response['price']
        }

        if ('ticket_status' in response) {
          tempEventObj.eventTicketstatus = response['ticket_status']
        }

        if ('buy_at_url' in response) {
          tempEventObj.buyAt = response['buy_at']
          tempEventObj.buyAtUrl = response['buy_at_url']
        }

        if ('seat_url' in response) {
          tempEventObj.eventSeatMap = response['seat_url']
        }

        tempEventObj.isFavourite = eventDataObj.isFavourite
        tempEventObj.eventId = eventDataObj.eventId
        tempEventObj.isInfoAvailable = true
        this.eventdetailsErrorType = "no error";
        this.eventDataObj = eventDataObj

      } else if ('isDataPresent' in response && response['isDataPresent'] == false) {
        console.log('No Event Details Data Found!!!')
        console.log("So no artists array")
        this.eventdetailsErrorType = "warning";
        this.artistdetailsErrorType = "warning"
        this.artistNames = []
        this.artistDetailsObjArray = []
        tempEventObj.isInfoAvailable = false
      } if ('error' in response) {
        console.log("Event Details API Failure error")
        this.eventdetailsErrorType = "danger";
        this.artistdetailsErrorType = "danger"
      }
      this.eventDetailsObj = tempEventObj
  }

  parseVenueDetailsResponse(response: any) {
    this.venueDetailsObj = new venueDetailsDataModel()

    if ('isDataPresent' in response && response['isDataPresent'] == true) {

      var tempVenueObj = new venueDetailsDataModel()
      tempVenueObj.isInfoAvailable = true
      if ('address' in response) {
        tempVenueObj.address = response['address']
      }

      if ('child_rule' in response) {
        tempVenueObj.childRule = response['child_rule']
      }
      if ('city' in response) {
        tempVenueObj.city = response['city']
      }

      if ('general_rule' in response) {
        tempVenueObj.generalRule = response['general_rule']
      }

      if ('latitude' in response) {
        tempVenueObj.latitude = response['latitude']
      }

      if ('longitude' in response) {
        tempVenueObj.longitude = response['longitude']
      }

      if ('open_hours' in response) {
        tempVenueObj.openHours = response['open_hours']
      }

      if ('phoneNo' in response) {
        tempVenueObj.phoneNo = response['phoneNo']
      }

      this.venueErrorType = "no error";
      this.venueDetailsObj = tempVenueObj
    } else if ('isDataPresent' in response && response['isDataPresent'] == false){
      var tempVenueObj = new venueDetailsDataModel()
      tempVenueObj.isInfoAvailable = false
      console.log('No Venue Details Data Found!!!')
      this.venueErrorType = "warning";
      this.venueDetailsObj = tempVenueObj
    } else if ("error" in response) {
      this.venueErrorType = "danger";
      console.log("Venue API Failure Error")
    }

  }

  callArtistDetailsApi() {
    if (this.artistNames.length > 0) {
      this.eventService.getArtistsDetails(this.artistNames)
      .subscribe((res) => {
        this.artistDetailsObjArray = []
        this.parseArtistDetailsResponse(res)
      }, error => {
        this.artistDetailsObjArray = []
        this.parseArtistDetailsResponse(error)
      })
    } else {
      console.log("Artist Names array empty")
      this.artistDetailsObjArray = []
    }
  }

  parseArtistDetailsResponse(responseData: any) {
    this.artistDetailsObjArray = []

    if (responseData.length != 0) {
      var tempArtistArray: artistDetailsDataModel[] = [];
      for (var i = 0; i < responseData.length; i++) {

        var response = responseData[i]
        if (response['isDataPresent'] == true) {

          var artistDetailsObj: artistDetailsDataModel  = new artistDetailsDataModel();
          artistDetailsObj.isInfoAvailable = true

          if ('name' in response) {
            artistDetailsObj.title = response['name']
          } else if(this.eventDetailsObj.artistName != '' ){
            artistDetailsObj.title = this.eventDetailsObj.artistName
          } else if(this.eventDetailsObj.eventname != '' ) {
            artistDetailsObj.title = this.eventDetailsObj.eventname
          }

          if ('name' in response) {
            artistDetailsObj.artistName = response['name']
          }

          if ('followers' in response) {
            artistDetailsObj.followers = response['followers']
          }
          if ('popularity' in response) {
            artistDetailsObj.popularity = response['popularity']
          }

          if ('checkAt' in response) {
            artistDetailsObj.checkAt = response['checkAt']
          }
          tempArtistArray.push(artistDetailsObj)
          console.log("artist object added")
        } else if ('name' in response) {
          var artistDetailsObj: artistDetailsDataModel  = new artistDetailsDataModel();
          artistDetailsObj.isInfoAvailable = false
          artistDetailsObj.title = response['name']
          artistDetailsObj.subtitle = 'No Details Available'
          console.log('No Artists Details Data Found in response name!!!')
          tempArtistArray.push(artistDetailsObj)
        } else if (this.eventDetailsObj.artistName != '' ){
          var artistDetailsObj: artistDetailsDataModel  = new artistDetailsDataModel();
          artistDetailsObj.isInfoAvailable = false
          artistDetailsObj.title = this.artistNames[i]['name']
          artistDetailsObj.subtitle = 'No Details Available'
          console.log('No Artists Details Data Found in event response!!!')
          tempArtistArray.push(artistDetailsObj)
        } else {
          //warning
          console.log('final else')
        }

      }
      this.artistDetailsObjArray = tempArtistArray
    } else {
      console.log("artist response length = 0")
    }
  }

  listButtonClicked() {
    this.eventService.displayEventListFunction(true);
    this.eventService.displayEventDetailsTabFunction(false);
  }

  favouriteButtonClicked() {
    this.eventDetailsObj.isFavourite = !this.eventDetailsObj.isFavourite
    this.eventDataObj.isFavourite = !this.eventDataObj.isFavourite
    if(this.eventDataObj.isFavourite) {
      this.eventService.addEventToFavourites(this.eventDataObj)
    } else {
      this.eventService.removeEventFromfavourites(this.eventDataObj)
    }
  }
}

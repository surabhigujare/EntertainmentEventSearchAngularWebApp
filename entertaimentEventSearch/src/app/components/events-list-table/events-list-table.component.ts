import { Component, OnInit } from '@angular/core';
import { EventService } from 'src/app/service/event.service'
import { eventDataModel } from '../eventDataModel';


@Component({
  selector: 'app-events-list-table',
  templateUrl: './events-list-table.component.html',
  styleUrls: ['./events-list-table.component.css']
})
export class EventsListTableComponent implements OnInit {

  constructor(private eventService: EventService) { }

  eventListDataSource: eventDataModel[] = [];
  eventlistHeadings = ['#', 'Date', 'Event', 'Category', 'Venue Info', 'Favorite'];
  favouriteEventsList: eventDataModel[] = [];

  isProgressVisible = false;
  dataAvailable = 10
  displayComponent: Boolean = false;
  shouldFavouriteListDisplay = false;
  displayList = "results";
  isDetailsBtnDisabled = true;
  lastAccessedEvent!: eventDataModel;
  errorType = "no error";

  ngOnInit(): void {
    this.shouldDisplayComponent();
    this.getEventListData();
    this.getFavouritesList();
    this.isSearchButtonClicked();
  }

  shouldDisplayComponent() {
    this.eventService.displayEventList
    .subscribe(clicked => {
      this.displayComponent = clicked;
      this.favouriteEventsList = []
      this.callFavouritesData()
    })
  }

  isSearchButtonClicked() {
    this.eventService.isSearchButtonClicked
    .subscribe(clicked => {
      this.displayList = "results";
      if (clicked) {
        this.isProgressVisible = true
        this.dataAvailable = 30
      } else {
        this.isProgressVisible = false
      }
    })
  }

  getEventListData() {
    this.eventService.eventList
    .subscribe(response => {
      this.errorType = "no error"
      this.dataAvailable = 50
      this.isProgressVisible = false
      this.parseEventlistData(response);
    })
  }

  parseEventlistData(response: any) {

    this.eventListDataSource = []
    var tempEventList: eventDataModel[] = [];
    if ("isDataPresent" in response && response["isDataPresent"] == true) {
      this.errorType = "no error"
      var items = response["events"]

      for (var i = 0; i < items.length; i++) {
        var eventObject = new eventDataModel();
        eventObject.eventdate = items[i]['date']
        eventObject.eventId = items[i]['eventId']

        var newName = "", tooltip = ""
        if(items[i]['event'].length >= 35){
          newName = items[i]['event'].substring(0, 32) + "..."
          tooltip = items[i]['event']
        }else{
          newName = items[i]['event']
        }
        eventObject.tooltip = tooltip
        eventObject.eventname = newName
        eventObject.eventcategory = items[i]['genre']
        eventObject.eventVenue = items[i]['venue']
        eventObject.isFavourite = true;
        tempEventList.push(eventObject)
      }
      this.updateEventListData(tempEventList)
    } else if ("isDataPresent" in response && response["isDataPresent"] == false) {
      console.log("No events list data present")
      this.errorType = "warning"
    } else if ("error" in response) {
      console.log("Error")
      this.errorType = "danger"
    }
  }

  getFavouritesList() {
    this.eventService.favouritesData.subscribe(values => {
      this.favouriteEventsList = []
      this.favouriteEventsList = values
      this.updateEventListData(this.eventListDataSource)
    })
  }

  clickedOnEvent(eventObject: eventDataModel) {
    this.lastAccessedEvent = eventObject
    this.shouldFavouriteListDisplay = false
    var eventId = eventObject.eventId
    this.eventService.displayEventListFunction(false)
    this.eventService.displayEventDetailsTabFunction(true)
    this.eventService.sendIsEventFavourite(eventObject)
    this.isDetailsBtnDisabled = false
    this.eventService.getEventDetails(eventId)
      .subscribe( response => {
        this.eventService.sendEventDetails(response)
      }, error => {
        this.eventService.sendEventDetails(error)
      })

    var venue = eventObject.eventVenue
    this.eventService.getVenueDetails(venue)
      .subscribe( response => {
        this.eventService.sendVenueDetails(response)
      }, error => {
        this.eventService.sendVenueDetails(error)
      })
  }

  detailsButtonClicked() {
    this.clickedOnEvent(this.lastAccessedEvent)
  }

  favouriteButtonClicked(eventObj: eventDataModel) {
    eventObj.isFavourite = !eventObj.isFavourite
    if(eventObj.isFavourite) {
      this.eventService.addEventToFavourites(eventObj)
    } else {
      this.eventService.removeEventFromfavourites(eventObj)
    }
  }

  favouriteTabClicked() {
    this.shouldFavouriteListDisplay = true
    this.displayList ='favourites'
    this.callFavouritesData()
    this.eventService.displayEventListFunction(true)
    this.eventService.displayEventDetailsTabFunction(false)
  }

  resultsTabClicked() {
    this.updateEventListData(this.eventListDataSource)
    this.displayList ='results'
  }

  callFavouritesData() {
    this.eventService.getAllFavoriteEventsByObservable()
  }

  deleteButtonClicked(eventObj: eventDataModel) {
    eventObj.isFavourite = false
    this.eventService.removeEventFromfavourites(eventObj)
    this.callFavouritesData()
  }

  updateEventListData(tempEventList: eventDataModel[]) {
    var tempFavouriteEventsList = this.eventService.getAllFavoriteEvents()
    for(var i = 0; i < tempEventList.length; i++ ) {
      tempEventList[i].isFavourite = false
      for (var j = 0; j < tempFavouriteEventsList.length; j++) {
        if (tempEventList[i].eventId == tempFavouriteEventsList[j].eventId) {
          tempEventList[i].isFavourite = true
        }
      }
    }
    this.eventListDataSource = tempEventList
  }
}

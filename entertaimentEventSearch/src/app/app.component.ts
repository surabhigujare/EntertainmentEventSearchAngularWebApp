import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { EventService } from './service/event.service';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title(title: any) {
    throw new Error('Method not implemented.');
  }

  // Http Header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  keyword: String = ""
  categoryOption: String = "all"
  distance = ""
  unit: String = "miles"
  radioType = "currentLocation"
  location: String = ""
  latitude: String = ""
  longitude: String = ""
  autocompleteList: String[] = []
  isLocationsDisabled: boolean = true

  categoryOptions = ["Music", "Sports", "Arts & theatre", "Film", "Miscellaneous"]

  constructor(private eventService: EventService, private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.getCurrentLocation()
  }

  onSearchButtonClicked() {
    this.getEventsList()
    this.eventService.searchButtonClicked(true)
    this.eventService.displayEventListFunction(true)
    this.eventService.displayEventDetailsTabFunction(false)
  }

  getEventsList() {
    if (this.distance == "" || this.distance == null) {
      this.distance = "10"
    }

    if (this.keyword == null) {
      this.keyword = ""
    }

    if (this.categoryOption == null) {
      this.categoryOption = "all"
    }

    if (this.unit == null) {
      this.unit = "miles"
    }

    if (this.radioType == null) {
      this.unit = "currentLocation"
    }

    if (this.location == null) {
      this.location = ""
    }

    console.log("current lat long while submit", this.latitude, this.longitude)
   var data = {
      "keyword" : this.keyword,
      "category" : this.categoryOption,
      "distance" : this.distance,
      "unit": this.unit,
      "radioType": this.radioType,
      "latitude": this.latitude,
      "longitude": this.longitude,
      "location": this.location
    }
    this.eventService.getEventsList(data)
    .subscribe(res => {
      console.log("Events List Response", res)
      this.eventService.sendEventListData(res)
    }, err => {
      console.log("Events List Response", err)
      this.eventService.sendEventListData(err)
    }
    )
  }

  clearButtonClicked() {
    this.isLocationsDisabled = true
    this.keyword = ""
    this.categoryOption = "all"
    this.distance = ""
    this.unit = "miles"
    this.radioType = "currentLocation"
    this.autocompleteList = []
    this.location = ""
    this.eventService.displayEventListFunction(false)
    this.eventService.displayEventDetailsTabFunction(false)
  }
  // IP Info

  getCurrentLocation() {
    let API_URL = 'https://ipinfo.io/json?token=b42e020c1b42a3'
    this.httpClient.get(API_URL).subscribe((data) => {
      var location = (data as any).loc
      var value = location.split(",")
      this.latitude = value[0]
      this.longitude = value[1]
    })
  }

  getAutocompleteSuggestions(key:any) {
    if ((key as String).length != 0) {
      this.eventService.getKeywordSuggestions(key).subscribe(res => {
        this.parseAutoCompleteResponse(res)
      })
    }
  }

  parseAutoCompleteResponse(res: any) {
    if ("isDataPresent" in res && res["isDataPresent"] == true) {
      this.autocompleteList = res["keywordSuggestions"]
    }
  }

  radioButtonClicked(isCurrentLocation: boolean) {
    if (isCurrentLocation) {
      this.location = ""
    }
    this.isLocationsDisabled = isCurrentLocation
  }

}

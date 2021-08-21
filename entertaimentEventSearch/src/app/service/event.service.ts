import { Inject, Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { LOCAL_STORAGE, StorageService } from 'ngx-webstorage-service';
import { eventDataModel } from '../components/eventDataModel';
import { eventDetailsDataModel } from '../components/eventDetailsDataModel';

@Injectable({
  providedIn: 'root'
})

export class EventService {


  //event list observable variables
  private _eventsListDataSource = new BehaviorSubject({});
  eventList = this._eventsListDataSource.asObservable();

  //event details observable variables
  private _eventsDetailstDataSource = new BehaviorSubject({});
  eventDetails = this._eventsDetailstDataSource.asObservable();

  private _isEventFavourite = new BehaviorSubject(new eventDataModel());
  isEventFavourite = this._isEventFavourite.asObservable();

  //artist details observable variables
  private _artistDetailstDataSource = new BehaviorSubject({});
  artistDetails = this._artistDetailstDataSource.asObservable();

  //venue details observable variables
  private _venueDetailstDataSource = new BehaviorSubject({});
  venueDetails = this._venueDetailstDataSource.asObservable();

  // table display observable variables

  private _displayEventListObservable  = new BehaviorSubject<Boolean>(false);
  displayEventList = this._displayEventListObservable.asObservable();

  private _displayEventDetailsTab = new BehaviorSubject<Boolean>(false);
  displayEventDetailsTab = this._displayEventDetailsTab.asObservable();

  //search Button Clicked observable variables

  private _searchButtonClickedObservable  = new BehaviorSubject<Boolean>(false);
  isSearchButtonClicked = this._searchButtonClickedObservable.asObservable();

  //local storage observable variables
  private _favouritesDataObservable = new BehaviorSubject<eventDataModel[]>([]);
  favouritesData = this._favouritesDataObservable.asObservable();

  private _isFavouritesEventObservable = new Subject();
  isFavouritesEvent = this._isFavouritesEventObservable.asObservable();

  // Node/Express API
  REST_API: string = '/api';

  // Http Header
  httpHeaders = new HttpHeaders().set('Content-Type', 'application/json');

  constructor(private httpClient: HttpClient, @Inject(LOCAL_STORAGE) private storage: StorageService) { }

  //Print Hello World
  PrintHelloWorld(data: any): Observable<any> {
    let API_URL = `${this.REST_API}/print-helloWorld/${data}`;
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
      .pipe(map((res: any) => {
        return res || {}
      }),
      catchError(this.handleError)
    )
  }

  //function to get keyword suggestions for autocomplete
  getKeywordSuggestions(keyword: any): Observable<any> {
    let API_URL = `${this.REST_API}/getKeywordSuggestions/${keyword}`;
    console.log("API_URL service", API_URL)
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
  }

  // function to get events list
  getEventsList(data: any): Observable<any> {
    let API_URL = `${this.REST_API}/getEventsList/${JSON.stringify(data)}`;
    console.log("API_URL service", API_URL)
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
  }

  //function to get event details
  getEventDetails(eventId: any): Observable<any> {
    let API_URL = `${this.REST_API}/getEventDetails/${eventId}`;
    console.log("API_URL service", API_URL)
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
  }

  //function to get venue details
  getVenueDetails(venue: any): Observable<any> {
    let API_URL = `${this.REST_API}/getVenueDetails/${venue}`;
    console.log("API_URL service", API_URL)
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
  }

  // function to get artist details
  getArtistsDetails(artistName: any): Observable<any> {
    let API_URL = `${this.REST_API}/getArtistsDetails/${JSON.stringify(artistName)}`;
    console.log("API_URL service", API_URL)
    return this.httpClient.get(API_URL, {headers: this.httpHeaders})
  }

  //Component Interactions
  sendEventListData(data: any) {
    this._eventsListDataSource.next(data);
  }

  sendEventDetails(data: any) {
    this._eventsDetailstDataSource.next(data);
  }

  sendIsEventFavourite(IsEventFavourite: eventDataModel) {
    this._isEventFavourite.next(IsEventFavourite);
  }

  sendArtistDetails(data: any) {
    this._artistDetailstDataSource.next(data);
  }

  sendVenueDetails(data: any) {
    this._venueDetailstDataSource.next(data);
  }

  displayEventListFunction(shouldDisplay: Boolean) {
    this._displayEventListObservable.next(shouldDisplay)
  }

  displayEventDetailsTabFunction(shouldDisplay: Boolean) {
    this._displayEventDetailsTab.next(shouldDisplay)
  }

  searchButtonClicked(isSearchButtonClicked: Boolean) {
    this._searchButtonClickedObservable.next(isSearchButtonClicked)
  }

  //Local Storage Methods

  addEventToFavourites(event: eventDataModel) {
    this.storage.set(event.eventId, JSON.stringify(event));
  }

  removeEventFromfavourites(event: eventDataModel) {
    this.storage.remove(event.eventId);
  }

  getFavouriteEvents(eventId: string) {
    this._isFavouritesEventObservable.next(this.storage.get(eventId))
  }

  getAllFavoriteEventsByObservable() {
    var values: eventDataModel[] = [],
        keys = Object.keys(localStorage),
        i = keys.length;

    while ( i-- ) {
      if (localStorage.getItem(keys[i]) != null) {
        var value = JSON.parse(localStorage.getItem(keys[i]) ?? '')
        var eventObject = this.parseFavouritesListData(value)
        var newName = "", tooltip = "", eventname = eventObject.eventname ?? ""
        if(eventname.length >= 35){
          newName = eventname.substring(0, 32) + "..."
          tooltip = eventname
        }else{
          newName = eventname
        }
        eventObject.eventname = newName
        eventObject.tooltip = tooltip
        values.push(eventObject);
      }
    }
    this._favouritesDataObservable.next(values)
  }

  getAllFavoriteEvents() {
    var values: eventDataModel[] = [],
        keys = Object.keys(localStorage),
        i = keys.length;

    while ( i-- ) {
      if (localStorage.getItem(keys[i]) != null) {
        var value = JSON.parse(localStorage.getItem(keys[i]) ?? '')
        var eventObject = this.parseFavouritesListData(value)
        var newName = "", tooltip = "", eventname = eventObject.eventname ?? ""
        if(eventname.length >= 35){
          newName = eventname.substring(0, 32) + "..."
          tooltip = eventname
        }else{
          newName = eventname
        }
        eventObject.eventname = newName
        eventObject.tooltip = tooltip
        values.push(eventObject);
      }
    }
    return values
  }

  parseFavouritesListData(list: any ) {
    list = JSON.parse(list);
    var eventObject = new eventDataModel();
    eventObject.eventdate = list['eventdate']
    eventObject.eventId = list['eventId']
    eventObject.eventname = list['eventname']
    eventObject.eventcategory = list['eventcategory']
    eventObject.eventVenue = list['eventVenue']
    eventObject.isFavourite = list['isFavourite']
    return eventObject
  }

  // Error{}
  handleError(error: HttpErrorResponse) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Handle client error
      errorMessage = error.error.message;
    } else {
      // Handle server error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

}

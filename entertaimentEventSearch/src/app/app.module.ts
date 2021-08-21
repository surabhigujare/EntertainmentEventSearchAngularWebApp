import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EventsListTableComponent } from './components/events-list-table/events-list-table.component';
import { EventDetailsTableComponent } from './components/event-details-table/event-details-table.component';
import {RoundProgressModule} from 'angular-svg-round-progressbar';
import { AgmCoreModule } from '@agm/core';
import { BrowserAnimationsModule} from '@angular/platform-browser/animations'
import { StorageServiceModule } from 'ngx-webstorage-service';
import {MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatFormFieldModule, MatFormFieldControl } from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    AppComponent,
    EventsListTableComponent,
    EventDetailsTableComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RoundProgressModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBL6dMhA--787cy_KrTNjcv-6qCgQ1gshU'
    }),
    BrowserAnimationsModule,
    StorageServiceModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent, EventsListTableComponent, EventDetailsTableComponent]
})
export class AppModule { }

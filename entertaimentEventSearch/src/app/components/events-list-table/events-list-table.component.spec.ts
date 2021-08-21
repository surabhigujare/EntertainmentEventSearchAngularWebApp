import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventsListTableComponent } from './events-list-table.component';

describe('EventsListTableComponent', () => {
  let component: EventsListTableComponent;
  let fixture: ComponentFixture<EventsListTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EventsListTableComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EventsListTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

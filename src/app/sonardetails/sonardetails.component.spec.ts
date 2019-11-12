import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SonardetailsComponent } from './sonardetails.component';

describe('SonardetailsComponent', () => {
  let component: SonardetailsComponent;
  let fixture: ComponentFixture<SonardetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SonardetailsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SonardetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TopnavigationComponent } from './topnavigation.component';

describe('TopnavigationComponent', () => {
  let component: TopnavigationComponent;
  let fixture: ComponentFixture<TopnavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TopnavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TopnavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JirachartComponent } from './jirachart.component';

describe('JirachartComponent', () => {
  let component: JirachartComponent;
  let fixture: ComponentFixture<JirachartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JirachartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JirachartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-topnavigation',
  templateUrl: './topnavigation.component.html',
  styleUrls: ['./topnavigation.component.css']
})
export class TopnavigationComponent implements OnInit {
  constructor() { }
  public showTime: Date = new Date();
  ngOnInit() {
    interval(10000).subscribe(i =>
      this.getCurrentTime()
    );
  }
  /* Display date time */
  getCurrentTime(): void {
    this.showTime = new Date();
  }
}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-sonardetails',
  templateUrl: './sonardetails.component.html',
  styleUrls: ['./sonardetails.component.css']
})
export class SonardetailsComponent implements OnInit {
  safeHtmlContent: string;

  constructor() { }
  @Input() sonarDetails: any;
  ngOnInit() {
    this.safeHtmlContent = this.sonarDetails;
  }
}

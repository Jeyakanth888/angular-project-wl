import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-modalpopup',
  templateUrl: './modalpopup.component.html',
  styleUrls: ['./modalpopup.component.css']
})
export class ModalpopupComponent implements OnChanges, OnInit {
  constructor() { }
  @ViewChild('modal') openModal: ElementRef;
  @Input() failureBuildsDetails: any;

  ngOnInit() {
    this.openModalPopup();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.openModalPopup();
  }

  openModalPopup() {
    // this.getBuildStatusChange.emit(this.failureBuildsDetails)
    if (this.failureBuildsDetails.length > 0) {
      this.openModal.nativeElement.classList.add('md-show');
      setTimeout(() => {
        this.closeModalPopup();
      }, 20000);
    }
  }
  closeModalPopup() {
    this.openModal.nativeElement.classList.remove('md-show');
  }

}

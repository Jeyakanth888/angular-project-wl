import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as Chart from 'chart.js';
@Component({
  selector: 'app-jirachart',
  templateUrl: './jirachart.component.html',
  styleUrls: ['./jirachart.component.css']
})


export class JirachartComponent implements OnInit {
  public chart: any = [];
  public labels: any = [];
  public data: any = [];
  @ViewChild('canvas') canvas: ElementRef;
  constructor() { }
  @Input() jiraDetails: any;
  ngOnInit() {
    setTimeout(() => {
      // this.printChart();
    }, 100);
  }

  printChart(): void {
    if (this.jiraDetails !== '' && this.jiraDetails !== null && this.jiraDetails !== undefined) {
      const labels = this.jiraDetails.labels;
      const jdata = this.jiraDetails.data;
      const backgroundColors = Array.apply(null, Array(jdata.length)).map(() => 'rgba(243, 149, 7,0.8)');
      this.chart = new Chart(this.canvas.nativeElement.getContext('2d'), {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Jira Priority Bugs',
            data: jdata,
            backgroundColor: backgroundColors,
            borderWidth: 1
          }]
        },
        options: {
          hover: {
            intersect: true
          },
          onHover(ev: MouseEvent, points: any[]) {
            return;
          },

          tooltips: {
            filter: data => Number(data.yLabel) > 0,
            intersect: true,
            itemSort: (a, b) => Math.random() - 0.5,
            position: 'average',
            caretPadding: 2,
            displayColors: true,
            borderColor: 'rgba(0,0,0,0)',
            borderWidth: 1
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  drawOnChartArea: false
                }
              }
            ]
          },
          legend: {
            display: true,
            labels: {
              usePointStyle: true,
              padding: 40
            }
          },
          devicePixelRatio: 2,
          responsive: false
        }
      });
    }
  }

}

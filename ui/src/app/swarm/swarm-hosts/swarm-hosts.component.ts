import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-swarm-hosts',
  templateUrl: './swarm-hosts.component.html',
  styleUrls: ['./swarm-hosts.component.scss']
})
export class SwarmHostsComponent implements OnInit {

  @Input() dockerData: any;

  panelOpenCache = {};
  balance = {type: 'horizontalBar', data: { labels: [], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      legend: { position: 'bottom' },
      tooltips: { mode: 'nearest' },
      scales: {
        xAxes: [ { stacked: true } ],
        yAxes: [ { stacked: true } ]
      }
  }};

  constructor() { }

  ngOnInit() {
    // <chart [type]="balance.type" [data]="balance.data" [options]="balance.options"></chart>
    this.panelOpenCache = JSON.parse(localStorage.getItem( 'Hosts-panels'))  || {'balance': true};
    this.balance.data = {
      labels: ['DKRV01', 'DKRV02', 'DKRV03', 'DKRV04', 'DKRV05'],
      datasets: [{
        label: 'Total CPU',
        data: [100, 100, 150, 100, 80],
        stack: 'grp1',
        backgroundColor: [
            'rgba(0,147,43,0.2)',
            'rgba(0,147,43,0.2)',
            'rgba(0,147,43,0.2)',
            'rgba(0,147,43,0.2)',
            'rgba(0,147,43,0.2)'
        ],
        borderColor: [
            'rgba(0,147,43,1)',
            'rgba(0,147,43,1)',
            'rgba(0,147,43,1)',
            'rgba(0,147,43,1)',
            'rgba(0,147,43,1)'
        ],
        borderWidth: 1
    }, {
          label: 'Eco 1',
          data: [100, 5, 21],
          stack: 'grp2',
          backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 99, 132, 0.2)',
              'rgba(255, 99, 132, 0.2)'
          ],
          borderColor: [
              'rgba(255,99,132,1)',
              'rgba(255,99,132,1)',
              'rgba(255,99,132,1)'
          ],
          borderWidth: 1
      },
      {
        label: 'Eco 2',
        data: [100, 13, 32],
        stack: 'grp2',
        backgroundColor: [
            'rgba(255, 206, 86, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(255, 206, 86, 0.2)'
        ],
        borderColor: [
            'rgba(255, 206, 86, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1
      }]
    };
  }

  panelToggle = (panel, isOpen): void => {
    this.panelOpenCache[panel] = isOpen;
    localStorage.setItem( 'Hosts-panels', JSON.stringify(this.panelOpenCache));
  }

}

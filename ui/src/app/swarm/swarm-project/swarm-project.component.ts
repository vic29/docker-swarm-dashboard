import { Component, OnInit, Input } from '@angular/core';
import { SwarmIndexService } from '../swarm-index.service';

@Component({
  selector: 'app-swarm-project',
  templateUrl: './swarm-project.component.html',
  styleUrls: ['./swarm-project.component.scss']
})
export class SwarmProjectComponent implements OnInit {

  @Input() tab: any;
  @Input() dockerData: any;
  @Input() isProjectTab: boolean;

  origTab;
  linksJson;
  panelOpenCache = {};

  /* For test /
  type = 'horizontalBar';
  data = {
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
  options = {
    responsive: true,
    maintainAspectRatio: true,
    legend: {
      position: 'bottom'
    },
    scales: {
      xAxes: [{
          stacked: true
      }],
      yAxes: [{
          stacked: true
      }]
    },
    tooltips: {
      mode: 'nearest'
    }
  };

    // <chart [type]="type" [data]="data" [options]="options"></chart>
   / For Test */

  constructor(private swarmService: SwarmIndexService) { }

  ngOnInit() {
    this.origTab = Object.assign({}, this.tab);
    this.linksJson = JSON.stringify(this.tab.links, null, 4);
    this.panelOpenCache = JSON.parse(localStorage.getItem( this.tab.label + '-panels'))  || {'links': true, 'services': true};
  }

  panelToggle = (panel, isOpen): void => {
    this.panelOpenCache[panel] = isOpen;
    localStorage.setItem( this.tab.label + '-panels', JSON.stringify(this.panelOpenCache));
  }

  onTabFilterSubmit = (): void => {
    this.swarmService.updateTab(this.tab.label, {serviceFilter: this.tab.serviceFilter});
  }
  removeTab = (tabName: string): void => {
    this.swarmService.removeTab(tabName);
  }



  onTabLinksSubmit = (): void => {
    if ( this.isValidObject(this.linksJson) ) {
      this.tab.links = JSON.parse(this.linksJson);
      this.swarmService.updateTab(this.tab.label, {links: this.tab.links});
    }
  }
  previewLinks = (): void => {
    if ( this.isValidObject(this.linksJson) ) {
      this.tab.links = JSON.parse(this.linksJson);
    }
  }
  resetLinks = (): void => {
    this.tab.links = this.origTab.links;
    this.linksJson = JSON.stringify(this.tab.links, null, 4);
  }

  isValidObject = (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }

}

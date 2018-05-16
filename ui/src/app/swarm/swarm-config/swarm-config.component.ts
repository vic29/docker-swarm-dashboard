import { Component, OnInit, ViewChild } from '@angular/core';
import { SwarmIndexService } from '../swarm-index.service';

import * as _ from 'lodash';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-swarm-config',
  templateUrl: './swarm-config.component.html',
  styleUrls: ['./swarm-config.component.scss']
})
export class SwarmConfigComponent implements OnInit {

  tabs = [];
  passwd: string;

  dockerResources = [];

  newTab = {
    label: null,
    serviceFilter: null,
    links: [],
    allocation: {
      weight: null
    }
  };

  chartData = {
    chartType: 'PieChart',
    dataTable: [],
    options: {
      title: 'Project workspace allocation',
      pieHole: 0.4,
      is3D: true,
      height: 500
    }
  };

  constructor(private swarmService: SwarmIndexService, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.swarmService.refreshTab();

    this.swarmService.getTabData().subscribe(tabSrvData => {
      this.tabs = tabSrvData;
    });

    this.swarmService.badMasterPwd().subscribe(msg => {
      this.snackBar.open(msg, 'Bad password', {
        duration: 5000,
      });
    });

    this.swarmService.getDockerResources().subscribe(resources => {
      if (!_.isEqual(this.dockerResources, resources)) {
        console.log('New docker resources:', resources);

        this.dockerResources = resources;

        this.chartData.dataTable = [];
        this.chartData.dataTable.push(['Projects', 'Allocated percentage']);
        this.dockerResources.forEach(r => {
          if (r.serviceFilter) {
            this.chartData.dataTable.push([
              r.label,
              r.workspace.resource.usableTotalMemory
            ]);
          }
        });

      }
    });
  }

  editPools = (): void => {
    if ( this.passwd ) {
      const invalidTabs = this.tabs.filter(t => !this.isTabValid(t));
      if ( this.isTabValid(this.newTab) ) {
        this.tabs.push(this.newTab);
      }
      if ( invalidTabs.length === 0 ) {
          this.swarmService.saveTabMeta(this.passwd, this.tabs);
          this.newTab = {
            label: null,
            serviceFilter: null,
            links: [],
            allocation: {
              weight: null
            }
          };
          this.dockerResources = [];
          this.chartData.dataTable = [];

          this.snackBar.open('Pool successfully saved! Please wait while the next check loop!', 'Save pool', {
            duration: 10000,
          });
      } else {
        this.snackBar.open('There are invalid pool definitions! Please fill the required fields!', 'Invalid pool', {
          duration: 5000,
        });
      }
    }
  }

  private isTabValid(tab) {
    return tab.label === 'All services' ? true : tab.label && tab.serviceFilter && tab.allocation.weight;
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';

import { SwarmIndexService } from './../swarm-index.service';
import { MatTabChangeEvent } from '@angular/material';

import * as _ from 'lodash';

@Component({
  selector: 'app-swarm-index',
  templateUrl: './swarm-index.component.html',
  styleUrls: ['./swarm-index.component.scss']
})
export class SwarmIndexComponent implements OnInit {

  constructor(public swarmService: SwarmIndexService) { }

  dockerData = {config: {}};
  tabs = [];
  tabSelectedIndex = -1;

  ngOnInit() {
    this.swarmService.getDockerData().subscribe(message => {
      this.dockerData = message;
      console.log('NEW docker data:', this.dockerData);
    });
    this.swarmService.getTabData().subscribe(tabSrvData => {
      console.log('Tab server information changed!', tabSrvData);

      this.tabs = tabSrvData;
      // tslint:disable-next-line:radix
      const newTabIndex = localStorage.getItem('selectedTabIndex') == null ? 1 : parseInt(localStorage.getItem('selectedTabIndex'));
      this.tabSelectedIndex = newTabIndex > this.tabs.length ? 1 : newTabIndex;
    });
  }

  tabChanged = (tabChangeEvent: MatTabChangeEvent): void => {
    this.tabSelectedIndex = tabChangeEvent.index;
    localStorage.setItem('selectedTabIndex', this.tabSelectedIndex + '');
  }

}

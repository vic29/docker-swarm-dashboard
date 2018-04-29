import { Component, OnInit } from '@angular/core';
import { SwarmIndexService } from '../swarm-index.service';

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
    label: null, serviceFilter: null, links: [], allocation: {
      weight: null
    }
  };

  constructor(private swarmService: SwarmIndexService) { }

  ngOnInit() {
    this.swarmService.refreshTab();

    this.swarmService.getTabData().subscribe(tabSrvData => {
      this.tabs = tabSrvData;
    });

    this.swarmService.getDockerResources().subscribe(resources => {
      console.log('resources', resources);

      this.dockerResources = resources;
    });
  }

  onNewProjectSubmit = (): void => {
    this.swarmService.addTab(this.newTab);
    this.newTab = {
      label: null, serviceFilter: null, links: [], allocation: {
        weight: null
      }
    };
  }

  editPools = (): void => {

  }

}

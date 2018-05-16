import { Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { SwarmIndexService } from '../swarm-index.service';
import { ResourcesPipe } from '../pipe/resources.pipe';

@Component({
  selector: 'app-swarm-project',
  templateUrl: './swarm-project.component.html',
  styleUrls: ['./swarm-project.component.scss']
})
export class SwarmProjectComponent implements OnInit, OnChanges {

  @ViewChild('chartcpu') chartcpu;
  @ViewChild('chartmemory') chartmemory;

  @Input() tab: any;
  @Input() dockerData: any;
  @Input() isProjectTab: boolean;

  isEditLinks = false;
  origTab;
  linksJson;
  panelOpenCache = {};

  chartDataCpu = {
    chartType: 'ColumnChart',
    dataTable: [],
    options: {
      title: 'CPU core usage',
      legend: { position: 'top' },
      vAxis: { viewWindowMode: 'pretty' }
    }
  };
  chartDataMemory = {
    chartType: 'ColumnChart',
    dataTable: [],
    options: {
      title: 'Memory usage',
      legend: { position: 'top' },
      vAxis: { viewWindowMode: 'pretty' }
    }
  };

  constructor(private swarmService: SwarmIndexService, private resourcesPipe: ResourcesPipe) { }

  ngOnInit() {
    this.origTab = Object.assign({}, this.tab);
    this.linksJson = JSON.stringify(this.tab.links, null, 4);
    // tslint:disable-next-line:max-line-length
    this.panelOpenCache = JSON.parse(localStorage.getItem(this.tab.label + '-panels')) || { 'links': true, 'services': true, 'chart-overview': true };

    console.log('Tab data: ', this.tab);

  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('OnChange volt', changes);

    this.chartDataCpu.dataTable = [
      ['CPU Core', 'Used', 'Dedicated'],
      ['CPU Core',
        this.resourcesPipe.transform(this.tab.workspace.resource.usedTotalCPU, { type: 'NanoCPUs' }),
        this.resourcesPipe.transform(this.tab.workspace.resource.usableTotalCPU, { type: 'NanoCPUs' })
      ],
    ];
    this.chartDataMemory.dataTable = [
      ['Memory (GB)', 'Used', 'Dedicated'],
      ['Memory (GB)',
        this.resourcesPipe.transform(this.tab.workspace.resource.usedTotalMemory, { type: 'MemoryGBNumberOnly' }),
        this.resourcesPipe.transform(this.tab.workspace.resource.usableTotalMemory, { type: 'MemoryGBNumberOnly' })
      ],
    ];

    const vm = this;
    setTimeout(function () {
      console.log('Redraw charts!');
      vm.chartcpu.wrapper.draw();
      vm.chartmemory.redraw();
    }, 1500);

  }

  panelToggle = (panel, isOpen): void => {
    this.panelOpenCache[panel] = isOpen;
    localStorage.setItem(this.tab.label + '-panels', JSON.stringify(this.panelOpenCache));
  }

  onTabLinksSubmit = (): void => {
    if (this.isValidObject(this.linksJson)) {
      this.tab.links = JSON.parse(this.linksJson);
      this.swarmService.saveTabLinks(this.tab.label, { links: this.tab.links });
      this.isEditLinks = !this.isEditLinks;
      this.panelToggle('links', true);
    }
  }
  previewLinks = (): void => {
    if (this.isValidObject(this.linksJson)) {
      this.tab.links = JSON.parse(this.linksJson);
      this.panelToggle('links', true);
    }
  }
  resetLinks = (): void => {
    this.tab.links = this.origTab.links;
    this.linksJson = JSON.stringify(this.tab.links, null, 4);
    this.panelToggle('links', true);
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

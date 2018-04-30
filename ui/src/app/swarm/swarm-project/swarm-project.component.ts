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

  isEditLinks = false;
  origTab;
  linksJson;
  panelOpenCache = {};

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

  onTabLinksSubmit = (): void => {
    if ( this.isValidObject(this.linksJson) ) {
      this.tab.links = JSON.parse(this.linksJson);
      this.swarmService.saveTabLinks(this.tab.label, {links: this.tab.links});
      this.isEditLinks = !this.isEditLinks;
      this.panelToggle('links', true);
    }
  }
  previewLinks = (): void => {
    if ( this.isValidObject(this.linksJson) ) {
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

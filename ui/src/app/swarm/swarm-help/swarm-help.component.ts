import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { SwarmIndexService } from './../swarm-index.service';

@Component({
  selector: 'app-swarm-help',
  templateUrl: './swarm-help.component.html',
  styleUrls: ['./swarm-help.component.scss']
})
export class SwarmHelpComponent implements OnInit {

  helpMarkdown = '';
  swarmConfig = {
    cloudName: window.location.href.substring(window.location.href.length - 1) === '/' ?
      window.location.href.substring(0, window.location.href.length - 1) :
      window.location.href
  };

  constructor(private http: HttpClient, private swarmService: SwarmIndexService) { }

  ngOnInit() {
    this.http.get('assets/swarm_help.md', {responseType: 'text'}).subscribe(data => {
        this.helpMarkdown = this.replaceAll(data, '{URL}', this.swarmConfig.cloudName);
    });
  }

  private replaceAll(target, search, replacement): string {
    return target.replace(new RegExp(search, 'g'), replacement);
  }

}

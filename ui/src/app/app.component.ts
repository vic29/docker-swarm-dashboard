import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SwarmHelpComponent } from './swarm/swarm-help/swarm-help.component';
import { SwarmIndexService } from './swarm/swarm-index.service';

import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [Title]
})
export class AppComponent implements OnInit {

  lastCheckedDate;
  onlineNum;
  swarmConfig = {cloudName: ''};

  constructor(public dialog: MatDialog, public swarmService: SwarmIndexService, private title: Title) {}

  ngOnInit() {
    this.swarmService.getLastRefresh().subscribe(message => {
      this.lastCheckedDate = message.lastCheckedDate;
    });
    this.swarmService.getOnlineuserNum().subscribe(message => {
      this.onlineNum = message;
    });
    this.swarmService.getDockerData().subscribe(message => {
      this.swarmConfig = message.config;

      this.title.setTitle(this.swarmConfig.cloudName + ' swarm dashboard');
    });
  }

  openDialog() {
    const dialogRef = this.dialog.open(SwarmHelpComponent, { autoFocus: false });

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog result: ${result}`);
    });
  }

}

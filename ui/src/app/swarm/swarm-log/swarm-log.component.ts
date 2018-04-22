import { Component, OnInit } from '@angular/core';
import { SwarmIndexService } from '../swarm-index.service';

@Component({
  selector: 'app-swarm-log',
  templateUrl: './swarm-log.component.html',
  styleUrls: ['./swarm-log.component.scss']
})
export class SwarmLogComponent implements OnInit {

  task: any;
  containerContent = '';
  secLeft = 5 * 60 * 1000;

  constructor(private swarmService: SwarmIndexService) { }

  ngOnInit() {
    this.containerContent = '';
    this.countDown();

    this.swarmService.getDockerLogs(this.task.ServiceID).subscribe( logData => {
      this.containerContent += logData;
    });
  }

  countDown() {
    if ( this.secLeft > 0 ) {
      setTimeout(() => {
        this.secLeft -= 1000;
        this.countDown();
      }, 1000);
    }
  }

}

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-swarm-port-table',
  templateUrl: './swarm-port-table.component.html',
  styleUrls: ['./swarm-port-table.component.scss']
})
export class SwarmPortTableComponent implements OnInit {

  @Input() serviceGroups: any;
  @Input() dockerData: any;

  constructor() { }

  ngOnInit() {
  }

}

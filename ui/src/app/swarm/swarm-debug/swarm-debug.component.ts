import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-swarm-debug',
  templateUrl: './swarm-debug.component.html',
  styleUrls: ['./swarm-debug.component.scss']
})
export class SwarmDebugComponent implements OnInit {

  title: string;
  data: any;
  Json = JSON;

  constructor() { }

  ngOnInit() {
  }

}

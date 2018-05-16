import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SwarmDebugComponent } from '../swarm-debug/swarm-debug.component';
import { SwarmLogComponent } from '../swarm-log/swarm-log.component';

@Component({
  selector: 'app-swarm-table',
  templateUrl: './swarm-table.component.html',
  styleUrls: ['./swarm-table.component.scss']
})
export class SwarmTableComponent implements OnInit {

  @Input() dockerData: any;
  @Input() filteredServiceGroups: any;

  filterValue = '';

  private showedFailedContainers = [];
  private expandedRowNames = [];

  pageNum = 1;
  pageSize = 10;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.expandedRowNames = JSON.parse(sessionStorage.getItem('expandedRows')) || [];
    this.showedFailedContainers = JSON.parse(sessionStorage.getItem('showFailedContainers')) || [];
  }

  expandRow(row) {
    if ( !this.isExpanded(row) ) {
      this.expandedRowNames.push(row.name);
    } else {
      this.expandedRowNames = this.expandedRowNames.filter(e => e !== row.name);
    }
    sessionStorage.setItem('expandedRows', JSON.stringify(this.expandedRowNames));
  }
  isExpanded(row): boolean {
    return this.expandedRowNames.filter(e => e === row.name).length > 0;
  }

  onFilterChange(filterString: string) {
    this.filterValue = filterString;
  }
  onFailedContainerChanged(id: any) {
    if ( this.isShowFailedContainer(id) ) {
      this.showedFailedContainers = this.showedFailedContainers.filter(e => e !== id);
    } else {
      this.showedFailedContainers.push(id);
    }
    sessionStorage.setItem('showFailedContainers', JSON.stringify(this.showedFailedContainers));
  }
  isShowFailedContainer(id): boolean {
    return this.showedFailedContainers.filter(e => e === id).length > 0;
  }

  openDebug(rawData, title) {
    const dialogRef = this.dialog.open(SwarmDebugComponent, { autoFocus: false });
    dialogRef.componentInstance.title = title;
    dialogRef.componentInstance.data = rawData;
  }
  openLog(task) {
    const dialogRef = this.dialog.open(SwarmLogComponent, { autoFocus: false });
    dialogRef.componentInstance.task = task;
  }
}

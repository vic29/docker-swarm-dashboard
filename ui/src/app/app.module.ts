import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { MarkdownToHtmlModule } from 'ng2-markdown-to-html';

import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {BrowserAnimationsModule, NoopAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatAutocompleteModule,
  MatButtonModule,
  MatButtonToggleModule,
  MatCardModule,
  MatCheckboxModule,
  MatChipsModule,
  MatDatepickerModule,
  MatDialogModule,
  MatDividerModule,
  MatExpansionModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatNativeDateModule,
  MatPaginatorModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatRadioModule,
  MatRippleModule,
  MatSelectModule,
  MatSidenavModule,
  MatSliderModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  MatSortModule,
  MatStepperModule,
  MatTableModule,
  MatTabsModule,
  MatToolbarModule,
  MatTooltipModule,
} from '@angular/material';
import {PopoverModule} from "ngx-popover";

import { Ng2GoogleChartsModule } from 'ng2-google-charts';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SwarmIndexComponent } from './swarm/swarm-index/swarm-index.component';
import { SwarmIndexService } from './swarm/swarm-index.service';
import { SwarmHelpComponent } from './swarm/swarm-help/swarm-help.component';
import { SwarmTableComponent } from './swarm/swarm-table/swarm-table.component';
import { AllDockerLabelsPipe } from './swarm/pipe/all-docker-labels.pipe';
import { KeepHtmlPipe } from './swarm/pipe/keep-html.pipe';
import { FilterAnywherePipe } from './swarm/pipe/filter-anywhere.pipe';
import { CountServicesPipe } from './swarm/pipe/count-services.pipe';
import { LimitToPipe } from './swarm/pipe/limit-to.pipe';
import { ImageNamePipe } from './swarm/pipe/image-name.pipe';
import { NodesPipe } from './swarm/pipe/nodes.pipe';
import { ResourcesPipe } from './swarm/pipe/resources.pipe';
import { SwarmPortTableComponent } from './swarm/swarm-port-table/swarm-port-table.component';
import { PortsPipe } from './swarm/pipe/ports.pipe';
import { SwarmHostsComponent } from './swarm/swarm-hosts/swarm-hosts.component';
import { SwarmProjectComponent } from './swarm/swarm-project/swarm-project.component';
import { SortPipe } from './swarm/pipe/sort.pipe';
import { NodeByPipe } from './swarm/pipe/node-by.pipe';
import { KeysPipe } from './swarm/pipe/keys.pipe';
import { SwarmDebugComponent } from './swarm/swarm-debug/swarm-debug.component';
import { SwarmLogComponent } from './swarm/swarm-log/swarm-log.component';
import { TimeCountDownPipe } from './swarm/pipe/time-count-down.pipe';
import { ShowFailedTasksPipe } from './swarm/pipe/show-failed-tasks.pipe';
import { SwarmConfigComponent } from './swarm/swarm-config/swarm-config.component';
import { FilterResourcesByGroupLabelPipe } from './swarm/pipe/filter-resources-by-group-label.pipe';
import { PaginationPipe } from './swarm/pipe/pagination.pipe';
import { PaginationPagesPipe } from './swarm/pipe/pagination-pages.pipe';


@NgModule({
  declarations: [
    AppComponent,
    SwarmIndexComponent,
    SwarmHelpComponent,
    SwarmTableComponent,
    AllDockerLabelsPipe,
    KeepHtmlPipe,
    FilterAnywherePipe,
    CountServicesPipe,
    LimitToPipe,
    ImageNamePipe,
    NodesPipe,
    ResourcesPipe,
    SwarmPortTableComponent,
    PortsPipe,
    SwarmHostsComponent,
    SwarmProjectComponent,
    SortPipe,
    NodeByPipe,
    KeysPipe,
    SwarmDebugComponent,
    SwarmLogComponent,
    TimeCountDownPipe,
    ShowFailedTasksPipe,
    SwarmConfigComponent,
    FilterResourcesByGroupLabelPipe,
    PaginationPipe,
    PaginationPagesPipe
  ],
  imports: [
    BrowserModule, FormsModule,
    AppRoutingModule, HttpClientModule,
    /*BrowserAnimationsModule,*/ NoopAnimationsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MarkdownToHtmlModule.forRoot(),
    PopoverModule,
    Ng2GoogleChartsModule
  ],
  providers: [DatePipe, FilterAnywherePipe, SwarmIndexService, ResourcesPipe],
  bootstrap: [AppComponent],
  entryComponents: [
    SwarmHelpComponent, SwarmDebugComponent, SwarmLogComponent
  ]
})
export class AppModule { }

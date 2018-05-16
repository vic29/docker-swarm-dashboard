import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

@Injectable()
export class SwarmIndexService {

  private url = environment.socketUrl ? environment.socketUrl :  window.location.href;
  private socket;

  constructor() {}

  connectIfNeed(): void {
    if ( !this.socket ) {
      this.socket = io(this.url);
    }
  }

  saveTabMeta(pwd, tabsData): void {
    this.connectIfNeed();
    this.socket.emit('tabs-save', {pwd: pwd, data: tabsData});
  }
  refreshTab(): void {
    this.connectIfNeed();
    this.socket.emit('tabs-refresh', null);
  }
  saveTabLinks(tabName, tabData): void {
    this.connectIfNeed();
    tabData['label'] = tabName;
    this.socket.emit('tabs-links', tabData);
  }
  badMasterPwd(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
        this.socket.on('bad-pwd', (message) => {
            observer.next(message);
        });
    });
  }

  getDockerData(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
        this.socket.on('docker', (message) => {
            observer.next(message);
        });
    });
  }
  getDockerResources(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
      this.socket.on('docker-resources', (message) => {
          observer.next(message);
      });
  });
  }
  getDockerLogs(containerId: string): Observable<any> {
    this.connectIfNeed();
    this.socket.emit('docker-logs', containerId);
    return Observable.create((observer) => {
        this.socket.on('docker-logs-' + containerId, (message) => {
            observer.next(message);
        });
    });
  }
  getTabData(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
        this.socket.on('tabs', (message) => {
            observer.next(message);
        });
    });
  }
  getLastRefresh(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
        this.socket.on('refresh', (message) => {
            observer.next(message);
        });
    });
  }
  getOnlineuserNum(): Observable<any> {
    this.connectIfNeed();
    return Observable.create((observer) => {
        this.socket.on('online', (message) => {
            observer.next(message);
        });
    });
  }

}

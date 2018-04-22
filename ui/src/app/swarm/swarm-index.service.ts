import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { environment } from '../../environments/environment';

@Injectable()
export class SwarmIndexService {

  private url = environment.socketUrl ? environment.socketUrl :  window.location.href;
  private socket;

  constructor() {
    this.socket = io(this.url);
  }

  addTab(tabData): void {
    this.socket.emit('tabs-create', tabData);
  }
  updateTab(tabName, tabData): void {
    tabData['label'] = tabName;
    this.socket.emit('tabs-update', tabData);
  }
  removeTab(tabName): void {
    this.socket.emit('tabs-delete', tabName);
  }

  getDockerData(): Observable<any> {
    return Observable.create((observer) => {
        this.socket.on('docker', (message) => {
            observer.next(message);
        });
    });
  }
  getDockerLogs(containerId: string): Observable<any> {
    this.socket.emit('docker-logs', containerId);
    return Observable.create((observer) => {
        this.socket.on('docker-logs-' + containerId, (message) => {
            observer.next(message);
        });
    });
  }
  getTabData(): Observable<any> {
    return Observable.create((observer) => {
        this.socket.on('tabs', (message) => {
            observer.next(message);
        });
    });
  }
  getLastRefresh(): Observable<any> {
    return Observable.create((observer) => {
        this.socket.on('refresh', (message) => {
            observer.next(message);
        });
    });
  }
  getOnlineuserNum(): Observable<any> {
    return Observable.create((observer) => {
        this.socket.on('online', (message) => {
            observer.next(message);
        });
    });
  }

}

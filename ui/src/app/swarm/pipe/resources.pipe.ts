import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'resources'
})
export class ResourcesPipe implements PipeTransform {
// TODO nemjó
  transform(data: any, args?: any): any {
    let value = 0;
    try {
      // tslint:disable-next-line:radix
      value = parseInt(data.Spec.Resources[args.check][args.type]);
      if (isNaN(value)) { throw new Error('NaN'); }
    } catch (e) {
      try {
        // tslint:disable-next-line:radix
        value = parseInt(data.Spec.TaskTemplate.Resources[args.check][args.type]);
        if (isNaN(value)) { throw new Error('NaN'); }
      } catch (e2) {
        value = 0;
      }
    }

    try {
      if ( args.type === 'NanoCPUs' ) {
        value = value / 1000000000;
      } else if ( args.type === 'MemoryBytes' ) {
        return this.humanFileSize(value, true);
      }
    } catch (e) {
      value = 0;
    }

    return value;
  }

  humanFileSize(bytes, si) {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    const units = si
        ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
        : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    let u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1) + ' ' + units[u];
}

}

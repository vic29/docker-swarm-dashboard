import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'countServices'
})
export class CountServicesPipe implements PipeTransform {

  transform(value: any, filter: string): number {
    if (!filter) {
      filter = 'all';
    }
    const services = (value instanceof Array) ? value : [ value ];

    if ( filter === 'all' ) {
      let result = 0;
      services.forEach(e => {
        try {
          result += e.Spec.Mode.Replicated.Replicas;
        } catch (e) {}
      });
      return result < services.length ? services.length : result;
    } else if (filter === 'up') {
      let result = 0;
      services.forEach(service => {
        service.tasks.forEach(task => {
          try {
            result += task.DesiredState === 'running' ? 1 : 0 ;
          } catch (e) {}
        });
      });
      return result;
    }  else if (filter === 'down') {
      let result = 0;
      services.forEach(service => {
        service.tasks.forEach(task => {
          try {
            result += task.DesiredState !== 'running' ? 1 : 0 ;
          } catch (e) {}
        });
      });
      return result;
    }
    return 0;
  }

}

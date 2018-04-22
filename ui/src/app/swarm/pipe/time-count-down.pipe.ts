import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeCountDown'
})
export class TimeCountDownPipe implements PipeTransform {

  transform(value: number, args?: any): any {
    if ( value >  60 * 1000  ) {
      const min = Math.floor(value / (60 * 1000));
      return min + ' min ' + Math.floor( (value - (min * 60 * 1000)) / 1000) + ' sec';
    } else {
      return Math.floor(value / 1000) + ' sec';
    }
  }

}

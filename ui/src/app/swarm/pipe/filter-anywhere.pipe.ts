import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterAnywhere'
})
export class FilterAnywherePipe implements PipeTransform {

  transform(value: any[], text?: string): any[] {
    if ( text ) {
      const result = [];
      value.forEach(e => {
        const str = JSON.stringify(e);
        if ( str.toLowerCase().indexOf(text.toLowerCase()) > -1 ) {
          result.push(e);
        }
      });
      return result;
    }
    return value;
  }

}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodes'
})
export class NodesPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    const result = [];
    if ( value['Run'] ) {
      value['Run'].forEach(r => {
        if ( result.indexOf(r.node) < 0 ) {
          result.push(r.node);
        }
      });
    }
    return result;
  }

}

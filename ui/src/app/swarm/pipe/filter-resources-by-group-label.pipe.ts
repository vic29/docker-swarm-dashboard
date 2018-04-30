import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterResourcesByGroupLabel'
})
export class FilterResourcesByGroupLabelPipe implements PipeTransform {

  transform(dockerResources: any, args?: any): any {
    let result = dockerResources.filter(r => r.label === args.label);
    if ( result.length > 0 ) {
      result = result[0];
    }
    try {
      return result.workspace.resource[args.resource];
    } catch (e) {
      return 0;
    }
  }

}

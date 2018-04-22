import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ports'
})
export class PortsPipe implements PipeTransform {

  transform(stackList: any, args?: any): any {
    const result = [];
      if ( stackList ) {
        for (let s = 0; s < stackList.length; s++) {
          const stack = stackList[s];
          for (let i = 0; i < stack.services.length; i++) {
            const subService = stack.services[i];
            if ( subService.Endpoint && subService.Endpoint.Ports ) {
              for (let p = 0; p < subService.Endpoint.Ports.length; p++) {
                const port = subService.Endpoint.Ports[p];
                port.stack = {name: stack.name };
                result.push(port);
              }
            }
          }
        }
      }
      result.sort(function(a, b) {return (a.PublishedPort > b.PublishedPort) ? 1 : ((b.PublishedPort > a.PublishedPort) ? -1 : 0); } );
      return result;
  }

}

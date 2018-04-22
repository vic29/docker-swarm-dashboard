import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'nodeBy'
})
export class NodeByPipe implements PipeTransform {

  transform(nodes: any[], id: any): any {
    return nodes.filter(node => node.ID === id);
  }

}

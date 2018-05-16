import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'pagination'
})
export class PaginationPipe implements PipeTransform {

  transform(arr: any[], page: number, size: number): any {
    const from = (page * size) - size;
    const end = page * size;
    return arr.slice(from, end);
  }

}

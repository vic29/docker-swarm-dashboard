import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paginationPages'
})
export class PaginationPagesPipe implements PipeTransform {

  transform(arr: any[], pageSize): any {
    const result = [];
    for (let i = 1; i <= Math.ceil(arr.length / pageSize); i++) {
      result.push(i);
    }
    return result;
  }

}

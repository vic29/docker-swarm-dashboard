import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'showFailedTasks'
})
export class ShowFailedTasksPipe implements PipeTransform {

  transform(tasks: any[], show: boolean): any {
    if ( show ) {
      return tasks;
    } else {
      return tasks.filter(task => task.DesiredState === 'running' );
    }
  }

}

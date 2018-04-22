import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'allDockerLabels'
})
export class AllDockerLabelsPipe implements PipeTransform {

  transform(value: any, labelPrefix?: string): any {
    if ( !labelPrefix) {
      labelPrefix = '';
    }
    const services = (value instanceof Array) ? value : [ value ];

    let customLabels = [];
    services.forEach(s => {
      const sourceLabels = s.Spec ? s.Spec.Labels || {} : {};
      const labels = Object.keys(sourceLabels).map(function(objectKey, index) {
        return {key: objectKey, value: sourceLabels[objectKey]};
      }).filter(l => l.key.toLowerCase().startsWith(labelPrefix));
      customLabels = customLabels.concat(labels);
    });
    return customLabels;
  }

}

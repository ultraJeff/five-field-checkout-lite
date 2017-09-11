import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'expFormatter'
})
export class ExpFormatterPipe implements PipeTransform {

  transform(input: string, args?: any): string {
    if (!input) { return '' }
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, '');

    // Trim the remaining input to five characters, to preserve expiration format
    input = input.substring(0, 5);

    // Based upon the length of the string, we add formatting as necessary
    let size = input.length;
    if (size === 2) {
      input = input + '/';
    } else if (size > 2) {
      input = input.substring(0, 2) + '/' + input.substring(2);
    }

    return input;
  }

}

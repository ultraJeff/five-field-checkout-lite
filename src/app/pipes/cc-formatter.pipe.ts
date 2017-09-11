import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ccFormatter',
  pure: false
})
export class CcFormatterPipe implements PipeTransform {
   private cardTypes = {
    //Card types correlate exactly to CSS class names
    discover: ['6011', '622126', '622925', '644', '649', '65'],
    visa: ['4'],
    mastercard: ['50', '54', '55'],
    amex: [ '34', '37'],
    dinersclub: ['300', '305', '309', '36', '38', '39'],
    jcb: ['3528', '3589']
  }

  getCardIcon = (input) => {
    for (const card in this.cardTypes) {
      //This is just using the length of the first value in each credit card key. Not a true comparison.
      let substringLength = this.cardTypes[card][0].length;
      if (this.cardTypes[card].includes(input.substr(0, substringLength))) {
        return card
      }
    }
  }

  transform(input: string, args?: any): any {
    if (!input) { return '' }
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, '');

    // Only check for card type if there isn't one already
    let cardClass = this.getCardIcon(input);

    // Trim the remaining input to sixteen or fourteen characters (American credit cards or American Express)
    input = cardClass === 'amex' ? input.substring(0, 14) : input.substring(0, 16);

    // Based upon card type, we add formatting as necessary
    let size = input.length;
    if (cardClass !== 'amex') {
      if (size < 5) {
        input = input;
      } else if (size < 9) {
        input = input.substring(0, 4) + ' ' + input.substring(4);
      } else if (size < 13) {
        input = input.substring(0, 4) + ' ' + input.substring(4, 8) + ' ' + input.substring(8);
      } else {
        input = input.substring(0, 4) + ' ' + input.substring(4, 8) + ' ' + input.substring(8, 12) + ' ' + input.substring(12);
      }
    } else {
      //Assume American Express
      if (size < 4) {
        input = input;
      } else if (size < 10) {
        input = input.substring(0, 3) + ' ' + input.substring(3);
      } else if (size < 15) {
        input = input.substring(0, 3) + ' ' + input.substring(3, 9) + ' ' + input.substring(9);
      }
    }

    return input;
  }

}

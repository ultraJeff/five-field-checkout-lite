import { Injectable } from '@angular/core';

@Injectable()
export class CardIconService {

  constructor() { }

  getCardIcon(input: string) {
    for (const card in CARDTYPES) {
      if (CARDTYPES[card].includes(input)) {
        return card
      }
    }

    return null;
  }

}

export const CARDTYPES = {
  //Card types correlate exactly to CSS class names
  discover: ['6011', '622126', '622925', '644', '649', '65'],
  visa: ['4'],
  mastercard: ['50', '54', '55'],
  amex: [ '34', '37'],
  dinersclub: ['300', '305', '309', '36', '38', '39'],
  jcb: ['3528', '3589']
}

import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CardIconService } from 'services/card-icon.service';

import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Observable } from 'rxjs/Rx';
import { Card } from 'models/customer';


@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input('group')
  public cardForm: FormGroup;

  public cardNumberMaxLength: number;
  private getCardIcon: Observable<string>;

  getCustomerCard: Observable<Card>;
  cardIcon: string;

  constructor(
    private store: Store<fromRoot.State>,
    private cardIconService: CardIconService
  ) {
    this.getCustomerCard = store.select(fromRoot.getCustomerCard);

    this.getCardIcon = store.select(fromRoot.getCustomerCardIcon);
    this.getCardIcon.subscribe(icon => {
      this.cardIcon = icon;
    });
  }

  onFocus(event) {
    event.target.previousElementSibling.classList.add('active');
  }

  onBlur(event) {
    if (event.target.value === '') {
      event.target.previousElementSibling.classList.remove('active');
    }
  }

  // A function to format credit card numbers
  formatCard(input: string) {
    if (!input) { return this.cardIcon = undefined; }
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, '');

    // Only check for card type if there isn't one already
    if (!this.cardIcon) {
      // Show the correct credit card icon
      this.cardIcon = this.cardIconService.getCardIcon(input);
    }

    // Trim the remaining input to sixteen or fourteen characters (American credit cards or American Express)
    this.cardIcon === 'amex' ? this.cardNumberMaxLength = 16 : this.cardNumberMaxLength = 19;

    // Based upon card type, we add formatting as necessary
    let size = input.length;
    if (this.cardIcon !== 'amex') {
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

    //Should onlySelf validation be on this?
    (<FormControl>this.cardForm.controls['number'])
      .setValue(input, { onlySelf: true })
  }

  // A function to format text to look like a phone number
  formatExpiration(input: string) {
    if (!input) { return undefined }
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, '');

    // Based upon the length of the string, we add formatting as necessary
    let size = input.length;
    if (size === 2) {
      input = input + '/';
    } else if (size > 2) {
      input = input.substring(0, 2) + '/' + input.substring(2);
    }

    //Should onlySelf validation be on this?
    (<FormControl>this.cardForm.controls['expiration'])
      .setValue(input, { onlySelf: true })
  }

}

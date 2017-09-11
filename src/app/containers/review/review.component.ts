import { Component } from '@angular/core';
import { CheckoutService } from 'services/checkout.service';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from 'reducers';

import { Customer } from 'models/customer';
import { Item } from 'models/cart';

@Component({
  selector: 'review-component',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent {
	public priceTotal: Observable<number>;
	public customer: Observable<Customer>;
	public items: Observable<Item[]>;
	public workflow: Observable<string>;

	constructor(
    private checkoutService: CheckoutService,
    private store: Store<fromRoot.State>
	) {
  	this.priceTotal = store.select(fromRoot.getCartTotal);
		this.customer = store.select(fromRoot.getCustomerAll);
		this.workflow = store.select(fromRoot.getWorkflow);
		this.items = store.select(fromRoot.getCartItems);
	}

	onSubmit(event) {
		alert('Payment Submitted!');
    console.log(event)
	}
}

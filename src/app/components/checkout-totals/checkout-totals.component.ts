import { Component, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import * as fromRoot from 'reducers';
import { Shipping } from 'models/cart';

@Component({
  selector: 'app-checkout-totals',
  templateUrl: './checkout-totals.component.html',
  styleUrls: ['./checkout-totals.component.scss']
})
export class CheckoutTotalsComponent {

  @Input() checkoutTotals;
  public shippingType: string;
  public shippingPrice: number;
  public subtotal: Observable<number>
  public shipping: Observable<Shipping>
  public tax: number;
  public total: Observable<number>;

  constructor(private store: Store<fromRoot.State>) {
    this.subtotal = store.select(fromRoot.getCartSubtotal);
    this.shipping = store.select(fromRoot.getCartShipping);
    this.tax = 0;
    this.total = store.select(fromRoot.getCartTotal)
  }
}

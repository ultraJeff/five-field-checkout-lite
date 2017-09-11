import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { HelpersService } from 'services/helpers.service';
import { PaymentRequestService } from 'services/payment-request.service';
import { CheckoutService } from 'services/checkout.service';
import { Router, ActivatedRoute, Params } from  '@angular/router';

import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import * as customer from 'actions/customer';
import { Customer } from 'models/customer';
import { Item } from 'models/cart';
import { Observable } from 'rxjs/Rx';

@Component({
  selector: 'cart-component',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  _items: Observable<Item[]>
  _quantityTotal: Observable<number>
  _priceTotal: Observable<number>
  _workflow: Observable<string>
  workflow: string

  constructor(public store:Store<fromRoot.State>,
    private paymentRequestService: PaymentRequestService,
    private checkoutService: CheckoutService,
    private helpersService: HelpersService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this._items = store.select(fromRoot.getCartItems);
    this._quantityTotal = store.select(fromRoot.getCartSize);
    this._priceTotal = store.select(fromRoot.getCartTotal);
    this._workflow = store.select(fromRoot.getWorkflow);
    this._workflow.subscribe(workflow => {
      this.workflow = workflow;
    });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((queryParams: Params) => {
      let pr = queryParams['pr'];
      if (!!pr && this.workflow === 'payment') { this.onPaymentRequestShow() }
    })
  }

  onPaymentRequestShow() {
    let cartItems = [];

    this._items.subscribe( item => {
      return item.map( item => {
        cartItems.push({label: item.title, amount: {currency: 'USD', value: item.price.toString()} })
      })
    });

    let priceTotal;

    this._priceTotal.subscribe( x => {priceTotal = x} );

    if (!(<any>window).PaymentRequest) {
      this.helpersService.error('PaymentRequest API is not supported.');
      return;
    }

    let request = this.paymentRequestService.buildPaymentRequest(priceTotal, cartItems);
    let that = this;

    // This part is just to show off request.canMakePayment
    // canMakePayment signifies whether or not the user already has a form of payment saved with Google
    // if (request.canMakePayment) {
    //   request.canMakePayment().then(function(result) {
    //     that.helpersService.info(result ? "Can make payment" : "Cannot make payment");
    //   }).catch(function(err) {
    //     that.helpersService.error('canMakePaymentError. ' + err);
    //   });
    // }

    try {
      request.show()
      //Need to add another .then() here to handle posting to server
      .then(paymentResponse => {
        //This only fires once the user selects Pay and enters CVC
        if (paymentResponse) { //This condition isn't useful
          return paymentResponse.complete('success')
            .then(() => {
              //Type on paymentResponse.details is Object, which means you can't access the subproperties...
              //Adds safety, so I'm bypassing :)
              let paymentInfoHack: any = paymentResponse.details;
              let order: Customer = {
                name: paymentResponse.payerName,
                billingAddress: paymentResponse.shippingAddress.addressLine[0] + ' ' + paymentResponse.shippingAddress.city + ', ' + paymentResponse.shippingAddress.region + ' ' + paymentResponse.shippingAddress.postalCode,
                shippingAddress: paymentResponse.shippingAddress.addressLine[0] + ' ' + paymentResponse.shippingAddress.city + ', ' + paymentResponse.shippingAddress.region + ' ' + paymentResponse.shippingAddress.postalCode,
                email: paymentResponse.payerEmail,
                phone: paymentResponse.payerPhone,
                card: {
                  number: paymentInfoHack.cardNumber,
                  expiration: paymentInfoHack.expiryMonth + '/' + paymentInfoHack.expiryYear,
                  //Could ACTUALLY grab the CVC too, but let's not give everything away.
                  cvc: ''
                }
              }
              //The following is helpful in debugging
              //that.helpersService.done('Thank you!', paymentResponse);
              this.store.dispatch(new customer.UpdateBuyerAction({...order}))

              //Navigate to review page
              that.router.navigate(['/review']);
            }, err => {
              that.helpersService.error(err);
            })
        } else {
          return paymentResponse.complete('fail')
            .then(() => {
              that.helpersService.done('Sadness!', paymentResponse);
            }, err => {
              that.helpersService.error(err);
            })
        }
      }, err => {
        //Request canceled
        this.helpersService.error(err);
      })
    } catch (e) {
      request.abort();
      this.helpersService.error('Developer mistake: \'' + e + '\'');
    }
  }
}

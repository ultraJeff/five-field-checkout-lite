import { Component, ElementRef, OnInit, NgZone, ViewChild, Input } from '@angular/core';
import { Router }                                          from  '@angular/router';
import { Validators, FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { MapsAPILoader }                                   from '@agm/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import * as customer from 'actions/customer';
import { Customer } from 'models/customer';
import { Observable } from 'rxjs/Rx';
import { Shipping } from 'models/cart';
import { Card } from 'models/customer';
import 'rxjs/add/operator/let';

@Component({
  selector: 'checkout-component',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})

export class CheckoutComponent implements OnInit {
  public cardReaderMessage: string;
  private getCardIcon: Observable<string>
  public addressName: string;
  public customer: Observable<Customer>
  public customerData: any;
  public cardExp: string;
  public cardIcon: string;
  public checkoutForm: FormGroup;
  public formattedCard: string;
  public getCardExp: Observable<string>
  public getFormattedCard: Observable<string>
  public workflow: Observable<string>

  public errorMessage: string;
  public shippable: boolean;

  @ViewChild("autocomplete")
  public searchElementRef: ElementRef;

  constructor(
    private _fb: FormBuilder,
    private router: Router,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private store: Store<fromRoot.State>,
  ) {
    //This is mostly for refilling the form when the user clicks Edit Details from review page
    this.customer = store.select(fromRoot.getCustomerAll);
    this.customer.subscribe(customer => {
      this.customerData = customer;
    });
    this.addressName = this.customerData.place;

    this.getCardIcon = store.select(fromRoot.getCustomerCardIcon);
    this.getCardIcon.subscribe(icon => {
      this.cardIcon = icon;
    });

    this.workflow = store.select(fromRoot.getWorkflow);

    this.shippable = false;
  }

  ngOnInit() {
    // we will initialize our form here
    //TODO: toggle whether billingAddress is actually === to shippingAddress!
    this.checkoutForm = this._fb.group({
      name: [this.customerData.name, Validators.required],
      billingAddress: [this.customerData.shippingAddress, Validators.required],
      shippingAddress: [this.customerData.shippingAddress, Validators.required],
      email: [this.customerData.email, Validators.required],
      phone: [this.customerData.phone, Validators.required],
      card: this._fb.group({
        number: [this.customerData.card.number, Validators.required],
        expiration: [this.customerData.card.expiration, Validators.required],
        cvc: [this.customerData.card.cvc, Validators.required]
      })
    });

    // Load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();

          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //Set checkoutForm address value
          this.checkoutForm.controls['shippingAddress'].setValue(place.formatted_address);
          this.checkoutForm.controls['billingAddress'].setValue(place.formatted_address);

          //Set shorthand address name for "Use Shipping Address as Billing" section
          this.addressName = place.name;

        });
      });
    });
  }

  submit(order) {
    this.store.dispatch(new customer.UpdateBuyerAction({...order.value, place: this.addressName}));
    this.router.navigate(['/review']);
  }

  onFocus(event) {
    event.target.previousElementSibling.classList.add('active');
  }

  onBlur(event) {
    if (event.target.value === '') {
      event.target.previousElementSibling.classList.remove('active');
    }
  }

  onInput() {
    this.addressName = undefined;
  }

  handleCardReaderComplete(cardNumber) {
    if (cardNumber && cardNumber.length) {
      //Need to still use patchValue on these new values
      //since onSubmit grabs all reactive form values
      //and for Angular's form validation controls
      this.checkoutForm.controls['card'].patchValue({
        number: cardNumber[0],
        expiration: '',
        cvc: ''
      });

      let newCard: Card = {
        number: cardNumber[0],
        expiration: '',
        cvc: ''
      }

      let newCustomer: Customer = {
        name: this.checkoutForm.controls['name'].value,
        billingAddress: this.checkoutForm.controls['billingAddress'].value,
        shippingAddress: this.checkoutForm.controls['shippingAddress'].value,
        place: this.addressName,
        email: this.checkoutForm.controls['email'].value,
        phone: this.checkoutForm.controls['phone'].value,
        card: newCard
      }
      //Honestly, the only reason we need to dispatch this is so
      //that the getCardIcon observable in card.component.ts updates (since its distinctUntilChanged)
      this.store.dispatch(new customer.UpdateBuyerAction(newCustomer));
    } else {
      this.cardReaderMessage = "Sorry, we couldn't read your card!";
    }
  }

  // A function to format text to look like a phone number
  formatPhone(input: string) {
    // Strip all characters from the input except digits
    input = input.replace(/\D/g, '');

    // Trim the remaining input to ten characters, to preserve phone number format
    input = input.substring(0, 10);

    // Based upon the length of the string, we add formatting as necessary
    let size = input.length;
    if (size === 0) {
      input = input;
    } else if (size < 4) {
      input = '(' + input;
    } else if (size < 7) {
      input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6);
    } else {
      input = '(' + input.substring(0, 3) + ') ' + input.substring(3, 6) + '.' + input.substring(6, 10);
    }

    //Should onlySelf validation be on this?
    (<FormControl>this.checkoutForm.controls['phone'])
      .setValue(input, { onlySelf: true })

  }
}

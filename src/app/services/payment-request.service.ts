import { Injectable } from '@angular/core';
import { HelpersService } from './helpers.service';

@Injectable()
export class PaymentRequestService {

  private totalPrice: number = 0;
  private selectedShippingOption: PaymentShippingOption;
  private allShippingOptionsMap: Map<string, PaymentShippingOption>;

  constructor(private helpersService: HelpersService) {
    this.allShippingOptionsMap = new Map();
    this.allShippingOptionsMap.set('ground', {
      id: 'ground',
      label: 'Ground Shipping',
      amount: {
        currency: 'USD',
        value: '0.00'
      }
    });
    this.allShippingOptionsMap.set('twoday', {
      id: 'twoday',
      label: 'Two Day Shipping',
      amount: {
        currency: 'USD',
        value: '5.00'
      }
    });
    this.allShippingOptionsMap.set('international', {
      id: 'international',
      label: 'International Shipping',
      amount: {
        currency: 'USD',
        value: '35.00'
      }
    });
  }

  /**
   * Updates the shipping price and the total based on the shipping address event (shippingaddresschange).
   *
   * @private
   * @param {PaymentDetails} details The line items and shipping options.
   * @param {string} shippingOption User's preferred shipping option to use for
   * shipping price calculations.
   */
  updateDetails(details: PaymentDetails, shippingOption: string): Promise<PaymentDetails> {

    //TODO: experiment with commenting this out
    for (let option of details.shippingOptions) {
      if (option.id === shippingOption) {
        option.selected = true
        this.selectedShippingOption = option;
      } else {
        option.selected = false
      }
    }

    if (shippingOption === 'ground') {
      details.total.amount.value = this.totalPrice.toFixed(2).toString();
    } else if (shippingOption === 'twoday') {
      details.total.amount.value = (this.totalPrice + 5.00).toFixed(2).toString();
    } else if (shippingOption === 'international') {
      details.total.amount.value = (this.totalPrice + 35.00).toFixed(2).toString();
    }

    //Note: Resolving shippingaddresschange event and
    //leaving details.shippingOptions as an empty array also means address rejection
    return Promise.resolve(details);
  };

  /**
   * Updates the shipping options based on the shipping address.
   *
   * @private
   * @param {PaymentDetails} details The line items and shipping options.
   * @param {PaymentAddress} shippingAddress User's preferred shipping address to use for
   * shipping option availability.
   */
  setShippingOptions(details: PaymentDetails, shippingAddress: PaymentAddress): Promise<PaymentDetails> {

    let validShippingOptions: PaymentShippingOption[] = [];

    if (shippingAddress.country === 'US') {
      // Domestic
      validShippingOptions.push(this.allShippingOptionsMap.get('ground'));
      //Update the price (base price)
      details.total.amount.value = this.totalPrice.toString();

      if (shippingAddress.region === 'CA') {
        // If shipping inside CA add twoday shipping (just for fun)
        validShippingOptions.push(this.allShippingOptionsMap.get('twoday'))
      }

      details.shippingOptions = validShippingOptions;
    } else {
      // International
      details.shippingOptions = [this.allShippingOptionsMap.get('international')];
      //Update the price (add $35) - don't do this here
      details.total.amount.value = (this.totalPrice + 35.00).toFixed(2).toString();
    }
    //Reset shipping selection
    for (let i = 0; i < details.shippingOptions.length; i++) {
      if (i === 0) {
        details.shippingOptions[i].selected = true
      } else {
        details.shippingOptions[i].selected = false
      }
    }

    return Promise.resolve(details);
  };

  /**
   * Initializes the payment request object.
   */
  buildPaymentRequest(totalPrice: number, displayItems: PaymentItem[]): PaymentRequest {

    if (!(<any>window).PaymentRequest) {
      return null;
    }

    let that = this;
    let request: PaymentRequest;

    //Probably should do this in ngOnInit
    this.totalPrice = totalPrice;

    //1. Payment Method Data (1st argument to PaymentRequest)
    const PAYMENTMETHODDATA: PaymentMethodData[] = [{
      supportedMethods: ['visa', 'mastercard', 'amex', 'discover']
    }, {
      supportedMethods: ['basic-card'],
      data: {
        supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
        supportedTypes: ['credit', 'debit', 'prepaid']
      }
    }];
    //2. Payment Details (2nd argument to PaymentRequest)
    let paymentDetails: PaymentDetails = {
      total: {
        label: 'Order Total',
        amount: {
          currency: 'USD',
          value: totalPrice.toString()
        }
      },
      displayItems: displayItems,
      // Note: details.shippingOptions need to be undefined or an empty array upon initialization
      // in order to receive shippingaddresschange event. Otherwise, the event won't be fired. (Not true!)
      // Set this value on initialization only when shipping options won't change based on address (such as global free shipping).
      shippingOptions: [/*{
        id: 'standard',
        label: 'Standard Shipping',
        amount: {
          currency: 'USD',
          value: '0.00'
        },
        selected: true
      }, {
        id: 'twoday',
        label: 'Two Day Shipping',
        amount: {
          currency: 'USD',
          value: '5.00'
        }
      }/*, {
        id: 'oneday',
        label: 'One Day Shipping',
        amount: {
          currency: 'USD',
          value: '15.00'
        }
      }*/]
      //Don't quite know how modifiers works yet
      // modifiers: [{
      //   supportedMethods: ['visa'],
      //   total: {
      //     label: 'Discounted donation',
      //     amount: {
      //       currency: 'USD',
      //       value: '45.00'
      //     }
      //   },
      //   additionalDisplayItems: [{
      //     label: 'VISA discount',
      //     amount: {
      //       currency: 'USD',
      //       value: '-10.00'
      //     }
      //   }],
      //   data: {
      //     discountProgramParticipantId: '86328764873265'
      //   }
      // }]
    };
    //3. Payment Options(3rd Argument to PaymentRequest)
    const PAYMENTOPTIONS: PaymentOptions = {
      requestShipping: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
      requestPayerName: true,
      shippingType: 'delivery'
    };

    try {
      request = new (<any>window).PaymentRequest(PAYMENTMETHODDATA, paymentDetails, PAYMENTOPTIONS);
      //Event Handlers
      //KNOWN ISSUE: Fist time this event fires, console will say that in the following line
      //"the given value is not a Promise". It is a promise though, and the error only occurs once
      //and doesn't affect PaymentRequest functionality at all. It's a mystery.
      //Maybe has something to do with ZoneAwarePromise?
      request.onshippingaddresschange = (e: PaymentRequestUpdateEvent) => {
        e.updateWith(that.setShippingOptions(paymentDetails, request.shippingAddress));
      };
      //request.onshippingoptionchange = (e: PaymentRequestUpdateEvent) => {
      request.addEventListener('shippingoptionchange', (e: PaymentRequestUpdateEvent) => {
        e.updateWith(that.updateDetails(paymentDetails, request.shippingOption));
      });
    } catch (e) {
      this.helpersService.error('Developer mistake: \'' + e + '\'');
    }

    return request;
  }
}

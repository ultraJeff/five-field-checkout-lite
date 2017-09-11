import { Injectable } from '@angular/core';

@Injectable()
export class HelpersService {

  private timeoutID1: number;
  private timeoutID2: number;

  constructor() { }

  //TODO: Convert this into a global messaging service

  /**
   * Prints the given error message.
   * @param {string} msg - The error message to print.
   */
  error(msg: string) {
    document.getElementById('msg').className = 'show error'
    document.getElementById('msg').innerHTML = msg;
  }

  /**
   * Prints the given informational message.
   * @param {string} msg - The information message to print.
   */
  info(msg: string) {
    var element = document.createElement('pre');
    element.innerHTML = msg;
    element.className = 'info';
    document.getElementById('msg').appendChild(element);
  }

  /**
   * FOR DEBUGGING ONLY!
   * Called when the payment request is complete.
   * @param {string} message - The human readable message to display.
   * @param {PaymentResponse} respo - The payment response.
   */
  done(message, resp) {  // eslint-disable-line no-unused-vars
    var element = document.getElementById('contents');
    element.innerHTML = message;

    if (resp.toJSON) {
      this.info(JSON.stringify(resp, undefined, 2));
      return;
    }

    var shippingOption = resp.shippingOption ?
        'shipping, delivery, pickup option: ' + resp.shippingOption + '<br/>' :
        '';

    var shippingAddress = resp.shippingAddress ?
        'shipping, delivery, pickup address: ' +
            JSON.stringify(resp.shippingAddress, undefined, 2) +
            '<br/>' :
        '';

    var instrument =
        'instrument:' + JSON.stringify(resp.details, undefined, 2) + '<br/>';

    var method = 'method: ' + resp.methodName + '<br/>';
    var email = resp.payerEmail ? 'email: ' + resp.payerEmail + '<br/>' : '';
    var phone = resp.payerPhone ? 'phone: ' + resp.payerPhone + '<br/>' : '';
    var name = resp.payerName ? 'name: ' + resp.payerName + '<br/>' : '';


    this.info(email + phone + name + shippingOption + shippingAddress + method +
        instrument);
  }
}

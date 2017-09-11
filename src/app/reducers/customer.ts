import { createSelector } from 'reselect';
import * as customer from 'actions/customer';
import { Card } from 'models/customer';
import { CARDTYPES } from 'services/card-icon.service';

//TODO: Figure out how to properly import Customer instead of duplicating the interface
export interface State {
  name: string;
  billingAddress: string;
  shippingAddress: string;
  place?: string | null;
  email: string;
  phone: string;
  card: Card | null;
}

export const initialState: State = {
  name: '',
  billingAddress: '',
  shippingAddress: '',
  place: null,
  email: '',
  phone: '',
  card: {
    number: '',
    expiration: '',
    cvc: ''
  }
}

export function reducer(state = initialState, action: customer.Actions): State {
	switch(action.type) {
    case customer.APIAI_SHIPPING:
      return Object.assign({}, state, {
        shippingAddress: action.payload
      })
		case customer.UPDATE_BUYER:
      return Object.assign({}, state, action.payload)
    case customer.RESET:
      return {
        name: '',
        billingAddress: '',
        shippingAddress: '',
        place: '',
        email: '',
        phone: '',
        card: {
          number: '',
          expiration: '',
          cvc: ''
        }
      }
		default:
			return state;
	}
}

const _getCardIcon = (input) => {
  for (const card in CARDTYPES) {
    //This is just using the length of the first value in each credit card key. Not a true comparison.
    let substringLength = CARDTYPES[card][0].length;
    if (CARDTYPES[card].includes(input.substr(0, substringLength))) {
      return card
    }
  }
}

export const getName = (state: State) => state.name;
export const getBillingAddress = (state: State) => state.billingAddress;
export const getShippingAddress = (state: State) => state.shippingAddress;
export const getPlace = (state: State) => state.place;
export const getEmail = (state: State) => state.email;
export const getPhone = (state: State) => state.phone;
export const getCard = (state: State) => state.card;
export const getCardIcon = (state: State) => _getCardIcon(state.card.number)
export const getAll = createSelector(getName, getBillingAddress, getShippingAddress, getPlace, getEmail, getPhone, getCard,
  (name, billingAddress, shippingAddress, place, email, phone, card) => {
    return {
      name: name,
      billingAddress: billingAddress,
      shippingAddress: shippingAddress,
      place: place,
      email: email,
      phone: phone,
      card: card
    }
  }
);

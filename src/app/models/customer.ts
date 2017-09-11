//Customer Interface
export interface Customer {
  name: string;
  billingAddress: string;
  shippingAddress: string;
  place?: string;
  email: string;
  phone: string;
  card: Card;
}

//Card Interface
export interface Card {
  number: string;
  expiration: string;
  cvc: string;
}

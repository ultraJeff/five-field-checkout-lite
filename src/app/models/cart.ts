//Cart Interface
// export interface Cart {
//   //discount: number;
//   items: Item[];
//   shipping: Shipping;
//   subtotal: number;
//   //tax: number;
//   total: number;
// }
//Item Interface
export interface Item {
  id: number;
  imgUrl: string;
  imgAlt: string;
  title: string;
  price: number;
  quantity: number;
  type: string;
}
//Shipping Interface
export interface Shipping {
  type: string;
  amount: number;
}

export interface ItemTypeQty {
  quantity: number,
  type: string
}

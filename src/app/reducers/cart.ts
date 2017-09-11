import { Item, Shipping, ItemTypeQty } from 'models/cart';
import * as cart from 'actions/cart';

//TODO: Figure out how to properly import Cart instead of duplicating the interface
export interface State {
  //discount: number;
  cartSize: number;
  items: Item[];
  shipping: Shipping | null;
  subtotal: number;
  //tax: number;
  total: number;
}

//Initial Cart State
export const initialState: State = {
  cartSize: 6,
  items: [
    { id: 0, imgUrl: '../assets/truck.jpg', imgAlt: 'Skateboard Truck', title: 'Tony Hawk 7" MH-001 Aluminum Trucks (2 per)', price: 38.90, quantity: 1, type: 'truck' },
    { id: 1, imgUrl: '../assets/deck.jpg', imgAlt: 'Skateboard Deck', title: 'Anti Hero Beres Sprack Eagle Deck', price: 49.99, quantity: 3, type: 'deck' },
    { id: 2, imgUrl: '../assets/wheels.jpg', imgAlt: 'Skateboard Wheels', title: 'Bones ATF Rough Riders Wheels (4 per)', price: 29.99, quantity: 2, type: 'wheel' }
  ],
  subtotal: 248.85,
  total: 248.85,
  shipping: {
    type: '',
    amount: 0
  }
}

export function reducer(state = initialState, action: cart.Actions): State {
	switch(action.type) {
    case cart.CHANGE_SHIPPING:
      const shipping: Shipping = action.payload;
      return Object.assign({}, state, {
        shipping: shipping,
        total: shipping.amount + state.total
      })
    case cart.CHANGE_QTY_BY_TYPE:
      const newItems = state.items.map(item => {
        return item.type === action.payload.type ? Object.assign({}, item, action.payload) : item;
      });

      //TODO: Simplify this
      const newSubtotal: number = Math.round(newItems.map(
        ({quantity, price}) => quantity * price).reduce(function(a, b) {
          return a + b;
        }, 0) * 100) / 100

      const newCartSize: number = newItems.map(
        ({quantity}) => quantity).reduce((a: number, b: number) => {
          return a + b;
        }, 0)

      return {
        cartSize: newCartSize,
        items: newItems,
        shipping: state.shipping,
        subtotal: newSubtotal,
        total: newSubtotal + state.shipping.amount
      }
    case cart.RESET:
    	 const noItems = state.items.map(item => {
    		return {...item, quantity: 0}
    	});

       return {
         cartSize: 0,
         items: noItems,
         shipping: {
          type: '',
          amount: 0
         },
         subtotal: 0,
         total: 0
       }
		default:
			return state;
	}
}

/**
 * Because the data structure is defined within the reducer it is optimal to
 * locate our selector functions at this level. If store is to be thought of
 * as a database, and reducers the tables, selectors can be considered the
 * queries into said database. Remember to keep your selectors small and
 * focused so they can be combined and composed to fit each particular
 * use-case.
 */

 export const getSize = (state: State) => state.cartSize;

 export const getItems = (state: State) => state.items;

 export const getShipping = (state: State) => state.shipping;

 export const getSubtotal = (state: State) => state.subtotal;

 export const getTotal = (state: State) => state.total;

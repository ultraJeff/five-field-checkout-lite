import { ActionReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import { createSelector } from 'reselect';

/**
 * The compose function is one of our most handy tools. In basic terms, you give
 * it any number of functions and it returns a function. This new function
 * takes a value and chains it through every composed function, returning
 * the output.
 *
 * More: https://drboolean.gitbooks.io/mostly-adequate-guide/content/ch5.html
 */
import { compose } from '@ngrx/core/compose';

/**
 * storeFreeze prevents state from being mutated. When mutation occurs, an
 * exception will be thrown. This is useful during development mode to
 * ensure that none of the reducers accidentally mutates the state.
 */
import { storeFreeze } from 'ngrx-store-freeze';

/**
 * combineReducers is another useful metareducer that takes a map of reducer
 * functions and creates a new reducer that gathers the values
 * of each reducer and stores them using the reducer's key. Think of it
 * almost like a database, where every reducer is a table in the db.
 *
 * More: https://egghead.io/lessons/javascript-redux-implementing-combinereducers-from-scratch
 */
import { combineReducers } from '@ngrx/store';

/**
 * Every reducer module's default export is the reducer function itself. In
 * addition, each module should export a type or interface that describes
 * the state of the reducer plus any selector functions. The `* as`
 * notation packages up all of the exports into a single object.
 */
import * as fromWorkflow from './workflow';
import * as fromCart from './cart';
import * as fromCustomer from './customer';

/**
 * As mentioned, we treat each reducer like a table in a database. This means
 * our top level state interface is just a map of keys to inner state types.
 */
export interface State {
  cart: fromCart.State;
  customer: fromCustomer.State;
  workflow: fromWorkflow.State;
}

/**
 * Because metareducers take a reducer function and return a new reducer,
 * we can use our compose helper to chain them together. Here we are
 * using combineReducers to make our top level reducer, and then
 * wrapping that in storeLogger. Remember that compose applies
 * the result from right to left.
 */
const reducers = {
  cart: fromCart.reducer,
  customer: fromCustomer.reducer,
  workflow: fromWorkflow.reducer
};

const developmentReducer: ActionReducer<State> = compose(storeFreeze, combineReducers)(reducers);
const productionReducer: ActionReducer<State> = combineReducers(reducers);

export function reducer(state: any, action: any) {
  if (environment.production) {
    return productionReducer(state, action);
  } else {
    return developmentReducer(state, action);
  }
}

/**
 * A selector function is a map function factory. We pass it parameters and it
 * returns a function that maps from the larger state tree into a smaller
 * piece of state. This selector simply selects the `books` state.
 *
 * Selectors are used with the `select` operator.
 *
 * ```ts
 * class MyComponent {
 *   constructor(state$: Observable<State>) {
 *     this.booksState$ = state$.select(getBooksState);
 *   }
 * }
 * ```
 */
export const getCartState = (state: State) => state.cart

/**
 * Every reducer module exports selector functions, however child reducers
 * have no knowledge of the overall state tree. To make them useable, we
 * need to make new selectors that wrap them.
 *
 * The createSelector function from the reselect library creates
 * very efficient selectors that are memoized and only recompute when arguments change.
 * The created selectors can also be composed together to select different
 * pieces of state.
 */
export const getCartSize = createSelector(getCartState, fromCart.getSize);
export const getCartItems = createSelector(getCartState, fromCart.getItems);
export const getCartShipping = createSelector(getCartState, fromCart.getShipping);
export const getCartSubtotal = createSelector(getCartState, fromCart.getSubtotal);
export const getCartTotal = createSelector(getCartState, fromCart.getTotal);

////////////////////////////////////////////////////////////////

export const getCustomerState = (state: State) => state.customer

export const getCustomerName = createSelector(getCustomerState, fromCustomer.getName);
export const getCustomerBillingAddress = createSelector(getCustomerState, fromCustomer.getBillingAddress);
export const getCustomerShippingAddress = createSelector(getCustomerState, fromCustomer.getShippingAddress);
export const getCustomerPlace = createSelector(getCustomerState, fromCustomer.getPlace);
export const getCustomerEmail = createSelector(getCustomerState, fromCustomer.getEmail);
export const getCustomerPhone = createSelector(getCustomerState, fromCustomer.getPhone);
export const getCustomerCard = createSelector(getCustomerState, fromCustomer.getCard);
export const getCustomerCardIcon = createSelector(getCustomerState, fromCustomer.getCardIcon);
export const getCustomerAll = createSelector(getCustomerState, fromCustomer.getAll);

//TODO: Use the concept in the following to join across states!
/**
 * Some selector functions create joins across parts of state. This selector
 * composes the search result IDs to return an array of books in the store.
 */
// export const getSearchResults = createSelector(getBookEntities, getSearchBookIds, (books, searchIds) => {
//   return searchIds.map(id => books[id]);
// });

////////////////////////////////////////////////////////////////

export const getWorkflowState = (state: State) => state.workflow

export const getWorkflow = createSelector(getWorkflowState, fromWorkflow.getWorkflow);

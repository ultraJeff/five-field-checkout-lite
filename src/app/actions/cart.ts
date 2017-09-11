import { Action } from '@ngrx/store';
import { Shipping, ItemTypeQty } from 'models/cart';

export const CHANGE_SHIPPING =      '[Cart] Change Shipping Type and Upcharge Amount';
export const CHANGE_QTY_BY_TYPE =   '[Cart] Change Cart Quantities by Type';
export const RESET =                '[Cart] Reset Cart Quantities'

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class ChangeShippingAction implements Action {
  readonly type = CHANGE_SHIPPING;

  constructor(public payload: Shipping) { }
}

export class ChangeQtyByTypeAction implements Action {
  readonly type = CHANGE_QTY_BY_TYPE;

  constructor(public payload: ItemTypeQty) { }
}

export class ResetAction implements Action {
  readonly type = RESET;

  //constructor(public payload: Cart) { }
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
  = ChangeShippingAction
  | ChangeQtyByTypeAction
  | ResetAction;


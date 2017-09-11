import { Action } from '@ngrx/store';
import { Customer } from 'models/customer';

export const APIAI_SHIPPING =     '[Customer] Update Customer Shipping Information with API.AI';
export const UPDATE_BUYER =       '[Customer] Update All Customer Info Input Through Traditional Form';
export const RESET =              '[Customer] Reset Customer Information'

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */

export class ApiAiShippingAction implements Action {
  readonly type = APIAI_SHIPPING;

  constructor(public payload: string) { }
}

export class UpdateBuyerAction implements Action {
  readonly type = UPDATE_BUYER;

  constructor(public payload: Customer) { }
}

export class ResetAction implements Action {
  readonly type = RESET;
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
export type Actions
  = ApiAiShippingAction
  | UpdateBuyerAction
  | ResetAction


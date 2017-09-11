import { Action } from '@ngrx/store';

export const MAPS_WORKFLOW =     '[Workflow] Maps'
export const PAYMENT_WORKFLOW =  '[Workflow] PaymentRequest'
export const NLP_WORKFLOW =      '[Workflow] NLP API.AI'

/**
 * Every action is comprised of at least a type and an optional
 * payload. Expressing actions as classes enables powerful
 * type checking in reducer functions.
 *
 * See Discriminated Unions: https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions
 */
export class MapsWorkflowAction implements Action {
  readonly type = MAPS_WORKFLOW;
}

export class PaymentRequestWorkflowAction implements Action {
  readonly type = PAYMENT_WORKFLOW;
}

export class NLPAPIAIWorkflowAction implements Action {
  readonly type = NLP_WORKFLOW;
}

/**
 * Export a type alias of all actions in this action group
 * so that reducers can easily compose action types
 */
 export type Actions
   = MapsWorkflowAction
   | PaymentRequestWorkflowAction
   | NLPAPIAIWorkflowAction;

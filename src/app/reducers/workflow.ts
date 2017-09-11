import * as workflow from 'actions/workflow';

export interface State {
  workflow: string
};

export const initialState: State = {
  workflow: 'maps'
}

export function reducer(state = initialState, action: workflow.Actions): State {
	switch(action.type) {
		case workflow.MAPS_WORKFLOW:
			return {
        workflow: 'maps'
      }
		case workflow.PAYMENT_WORKFLOW:
			return {
        workflow: 'payment'
      }
		case workflow.NLP_WORKFLOW:
			return {
        workflow: 'nlp'
      }
		default:
			return state;
	}
}

export const getWorkflow = (state: State) => state.workflow;

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import * as workflow from 'actions/workflow';
import * as cart from 'actions/cart';
import * as customer from 'actions/customer';

@Component({
  selector: 'header-component',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class HeaderComponent implements OnInit {
  isNavTriggerClicked: boolean;

  constructor(private store: Store<fromRoot.State>) { }

  ngOnInit(): void {
    this.initializeHeader();
  }

	// Open/close primary navigation
  onNavTriggerClick(e: MouseEvent) {
		this.isNavTriggerClicked = !this.isNavTriggerClicked;
  }

  initializeHeader() {
  	// Primary navigation slide-in effect
  	this.isNavTriggerClicked = false;
  }

  setMapsWorkflow() {
    this.isNavTriggerClicked = !this.isNavTriggerClicked;
    this.store.dispatch(new workflow.MapsWorkflowAction())
  }

  setPaymentWorkflow() {
    this.isNavTriggerClicked = !this.isNavTriggerClicked;
    this.store.dispatch(new workflow.PaymentRequestWorkflowAction())
  }

  setNLPWorkflow() {
    this.isNavTriggerClicked = !this.isNavTriggerClicked;
    this.store.dispatch(new workflow.NLPAPIAIWorkflowAction());
    this.store.dispatch(new cart.ResetAction());
    this.store.dispatch(new customer.ResetAction());
    let newQuantity = {
      type: 'wheel',
      quantity: 2
    }
    this.store.dispatch(new cart.ChangeQtyByTypeAction(newQuantity));

    newQuantity = {
      type: 'deck',
      quantity: 2
    }
    this.store.dispatch(new cart.ChangeQtyByTypeAction(newQuantity));
  }
}

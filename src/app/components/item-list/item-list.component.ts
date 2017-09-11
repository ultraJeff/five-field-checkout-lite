import { Component, Input, /*Output, EventEmitter*/ } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import * as cart from 'actions/cart';
import { Observable } from 'rxjs/Rx';
//import { Item } from 'models/cart';

@Component({
	selector: 'item-list',
	templateUrl: './item-list.component.html',
	styleUrls: ['./item-list.component.scss']
})
export class ItemList /*implements AfterViewInit*/ {
	//Inputs
	@Input() _items = [];
	@Input() _quantityTotal;
	@Input() _priceTotal;

	//Outputs
	// @Output() action = new EventEmitter();

  _workflow: Observable<string>
  //_items: Observable<Item[]>

  constructor(private store: Store<fromRoot.State>) {
    this._workflow = store.select(fromRoot.getWorkflow);
    //this._items = store.select(fromRoot.getCartItems);
  }

	//Functions
	changeQuantity($event, _item) {
    let newQuantity = {
      type: _item.type,
      quantity: parseInt($event.target.value, 10)
    }

    this.store.dispatch(new cart.ChangeQtyByTypeAction(newQuantity));
    //this.action.emit(new cart.ChangeQtyByTypeAction(newQuantity));;
	}
}

import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';

@Component({
	selector: 'razorfish-app',
	template: `
		<header-component></header-component>
		<router-outlet></router-outlet>
	`
})

export class AppComponent {
	title = 'Five Field Checkout'

	constructor(public store: Store<fromRoot.State>){
		store.subscribe( store => console.log(store));
	}
}

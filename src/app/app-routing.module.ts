import {Routes, RouterModule} from '@angular/router';
import {ModuleWithProviders} from '@angular/core';

import { CartComponent }          from 'containers/cart/cart.component';
import { CheckoutComponent }    from 'containers/checkout/checkout.component';
import { ReviewComponent }		from 'containers/review/review.component';

// The Angular router is an external, optional Angular NgModule called RouterModule.
// The router is a combination of multiple provided services (RouterModule),
// multiple directives (RouterOutlet, RouterLink, RouterLinkActive), and a configuration (Routes)
// ========================================================================================================
// We use the forRoot method because we're providing a configured router at the root of the application.
// The forRoot method gives us the Router service providers and directives needed for routing, and performs
// the initial navigation based on the current browser URL.

const routes: Routes = [
  { path: '', redirectTo: '/cart', pathMatch: 'full' },
  { path: 'cart', component: CartComponent },
  { path: 'checkout',  component: CheckoutComponent },
  // TODO: Block review path unless submitted=true
  { path: 'review',  component: ReviewComponent },
];

//export default routes;
export const AppRoutingModule: ModuleWithProviders = RouterModule.forRoot(routes);

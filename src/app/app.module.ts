import { NgModule }      				from '@angular/core';
import { BrowserModule } 				from '@angular/platform-browser';
import { FormsModule } 					from '@angular/forms';
import { ReactiveFormsModule }  from '@angular/forms';
import { HttpModule }           from '@angular/http';

import { StoreModule }          from '@ngrx/store';

import { AppRoutingModule }     from './app-routing.module';

//Containers
import { AppComponent } 				from './containers/app.component';
import { CartComponent }        from './containers/cart/cart.component';
import { CheckoutComponent }    from './containers/checkout/checkout.component';
import { ReviewComponent }      from './containers/review/review.component';

//Services
import { CheckoutService }      from './services/checkout.service';
import { CardIconService }      from './services/card-icon.service';
import { PaymentRequestService } from './services/payment-request.service';
import { HelpersService } 		  from './services/helpers.service';

//Components
import { HeaderComponent }       from './components/header/header.component';
import { CardReaderComponent }   from './components/card-reader/card-reader.component';
import { CheckoutTotalsComponent } from './components/checkout-totals/checkout-totals.component';
import { NlpAiComponent }        from './components/nlp-ai/nlp-ai.component';
import { ItemList }              from './components/item-list/item-list.component';
import { CardComponent }         from './components/card/card.component';

//Pipes
import { SpeechSynthesisPipe } from 'pipes/speech-synthesis.pipe';
import { CcFormatterPipe } from 'pipes/cc-formatter.pipe';
import { ExpFormatterPipe } from 'pipes/exp-formatter.pipe';

import { reducer } from './reducers';

//Google Places Autocomplete (Maps) (3rd Party Lib)
import { AgmCoreModule } from "@agm/core";
@NgModule({
  imports:      [
    AgmCoreModule.forRoot({
      apiKey: "YOUR_GOOGLE_MAPS_API_KEY",
      libraries: ["places"]
    }),
  	BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    /**
     * StoreModule.provideStore is imported once in the root module, accepting a reducer
     * function or object map of reducer functions. If passed an object of
     * reducers, combineReducers will be run creating your application
     * meta-reducer. This returns all providers for an @ngrx/store
     * based application.
     */
    StoreModule.provideStore(reducer)
	],
  declarations: [
  	AppComponent,
    HeaderComponent,
    CartComponent,
    CheckoutComponent,
    ReviewComponent,
    CardReaderComponent,
    CheckoutTotalsComponent,
    ItemList,
    CardComponent,
    NlpAiComponent,
    SpeechSynthesisPipe,
    CcFormatterPipe,
    ExpFormatterPipe
	],
	providers: [ CheckoutService, CardIconService, PaymentRequestService, HelpersService ],
  bootstrap: [ AppComponent ]
})

export class AppModule { }

# [Five Field Checkout](https://five-field-checkout.appspot.com)
###### (using your browser dev tools, toggle the device toolbar and set it to a SmartPhone view)

*Please note that this repo does not contain the necessary keys to run API.AI or GCP Products (Speech, Vision, Maps). This means that only Workflow #2 below will work beyond the simple checkout flow. However, you may access a complete working version using the above link.*

UX Strategy idea by Jason Goldberg (see [PDF](src/MobileCheckout_Razorfish.pdf))

---

This prototype explores:
- Techniques for reducing the number of user "taps" required to get through a typical mobile web browser based e-commerce credit card checkout workflow.
- Leveraging Google Cloud Platform services to facilitate the Five Field Checkout promise.
- The burgeoning PaymentRequest API used on the Chrome mobile browser (and coming to other mobile browsers soon).
- Speech technology combined with machine learning and AI to create a conversational checkout workflow experience.
- The technologies associated with creating a Progressive Web App

## Technology
The five-field-checkout prototype is built atop [angular-cli v1.0.0](https://github.com/angular/angular-cli) which utilizes Webpack 2.2.1 for module bundling. The DEV and PROD environments also utilize the following important stack technologies:

- Angular v4.1.3 (Typescript v2.2.2)
- RxJS v5.4.0
- @ngrx/store v2.2.2
- Node v7.3.0
- Express v4.15.3
- Yarn v0.24.6 (optional)
- [Google Cloud Platform Cloud SDK](https://cloud.google.com/sdk/)
- API.AI v4.0.2
- SCSS
- Webapp manifest for PWA

## Features
- Workflow 1: Uses Google Place and Vision APIs to introduce the concept and demonstrate certain checkout convenieinces.
- Workflow 2: Uses PaymentRequest API on Chrome/Android to facilitate user payment data to the payment processing backend.
- Workflow 3: Uses API.AI chatbot technology and machine learning to create a purely speech enabled checkout experience.
- Webapp manifest.json
- @ngrx/store is an Observable based Redux-style store system used to keep track of the current state of the app (between workflows, customer information, and cart information).

## Workflow Walkthroughs

#### Workflow 1: Google Places Autocomplete / Google Vision
1. Tap on the checkout button to be taken to the checkout page. Begin by entering in your name.
2. Once you get to the address field, begin typing an address to see a geolocalized list of autofill suggestions.
3. Continue entering your customer information.
4. Once you arrive at the credit card information, tap on the Scan Card button to pull up a dialog to either take a picture or use an image from your phone. If you take a picture, make sure the contrast is good and submit it. If the submission is clean enough, Google Vision will return the card number into the credit card input field. The custom cc-formatter pipe attached by Angular will then format the card and the card icon service will place the proper card icon for the card.

#### Workflow 2: PaymentRequest API

> Be sure to be on an Android device using the Chrome browser v53.0 or greater

1. Tap on the checkout button. Google's version of the Payment Request standard will then appear and you can walk through adding a new address and credit card information.
2. Use a fake credit card or else the CVC verification after you click continue will fail! (Unless you use your real CVC)

#### Workflow 3: Google Speech / API.AI
1. Click on the microphone icon on the bottom.
2. Say "Add some trucks to my order and remove the decks." Cart should update.
3. Say one of the following to checkout (doesn't have to be exact, but there are three different fake accounts with different information stored):
  - "Use Sam's personal account to checkout"
  - "Use Sam Smith's business account to checkout"
  - "Use the Smith Family account to checkout"
4. If the chatbot gets it right, you will then be asked if you would like to review your order. Saying "yes" takes you to the review page.
5. On the review page, say "Ship this to [enter an address]" to initiate a *shipping* address change. The chatbot will then ask you about the city, state, zip code, and shipping speed you would like to use. Your options are roughly **ground, second day, and overnight**.

> All addresses are based in the USA.

## Setup

#### Development server (localhost)
1. Navigate to the Five Field Checkout git repo.
2. Switch to the `develop` git branch.
3. Run `yarn` (recommended) or `npm install` to install the latest dependencies.
4. Run `ng build --watch` in a terminal window.
5. Run `nodemon server.js` in a **different** terminal window. This will start Express.
6. Navigate to [http://localhost:8080/](http://localhost:8080/).
7. Using your browser dev tools, toggle the device toolbar and set it to a SmartPhone view
8. Change between workflows (see **Features**) from the header menu.

> The app will automatically recompile when you make changes to any files within the repo, however the page itself will not reload. You will need to refresh manually.

#### Code scaffolding

From the CLI, run any of the following commands to create the associated angular-cli scaffold.

Scaffold | Usage
-------- | -----
Component | ng g component my-new-component
Directive | ng g directive my-new-directive
Pipe | ng g pipe my-new-pipe
Service | ng g service my-new-service
Class | ng g class my-new-class
Interface | ng g interface my-new-interface
Enum | ng g enum my-new-enum
Module | ng g module my-module

#### Build

Run `ng build` for a one-off build of the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build (increased validity checks, tree-shaking, etc.)

#### Deploying to Google Cloud Platform

> Assumption: you have already installed google cloud sdk and have initiated it for your app. For detailed steps, check out the [sdk quick start page](https://cloud.google.com/sdk/docs/quickstarts).

Run `yarn run gcpdeploy` or `npm run gcpdeploy`
  - There will be a Y/n prompt that will verify you are deploying to that right page.
  - Wait ~8 minutes for the Docker image to be created, verified, and tested.
  - More info [here](https://github.com/GoogleCloudPlatform/nodejs-docker) and [here](http://stackoverflow.com/questions/37683120/gcloud-preview-app-deploy-process-takes-8-minutes-is-this-normal).

#### Further help

Global search for "TODO" to find all the areas in this app that should be updated!

To get more help on `angular-cli` use `ng --help` or go check out the [Angular-CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Current Browser Support
- Android Mobile Chrome web browser (version 53+)

---

## Appendix

### PaymentRequest Example Links
- [PaymentRequest Introduction](https://developers.google.com/web/updates/2016/07/payment-request?hl=en)
- [Google Chrome GitHub Samples](https://googlechrome.github.io/samples/paymentrequest/)
- [rsolomakhin's GitHub Samples](https://rsolomakhin.github.io/)
- [Chrome Docs Version 53](https://github.com/google/Chrome.Docs/tree/master/m53)

### Stripe Test Cards
- [For testing credit cards, fakely](https://stripe.com/docs/testing#cards)

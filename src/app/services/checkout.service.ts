import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class CheckoutService {
  private headersJSON = new Headers({'Content-Type': 'application/json'});
  //private headersOgg = new Headers({'Content-Type': 'audio/ogg'});
  //private headers = new Headers({'Content-Type': 'application/x-www-form-urlencoded'});

  constructor(private http: Http) { }

  postVision(dataUri): any {
    return this.http
      // .post(), .get(), .delete() are observables which are a stream of events that we can process with array-like operators.
      .post('vision', {base64Image: dataUri}, {headers: this.headersJSON})
      .map(res => res.json())
      .catch(this.handleError);
  }

  postSpeech(blob: Blob, apiaiContexts: Object): any {
    return this.http
      .post('speech', {audioBlob: blob, apiaiContexts: apiaiContexts}, {headers: this.headersJSON})
      .map(res => res.json())
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}

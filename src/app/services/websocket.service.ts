import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
//import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject'
//import * as io from 'socket.io-client';

//STUB! TODO: Use something like this in conjunction with nlp-ai.component.ts to stream microphone audio from front end to back end.

@Injectable()
export class WebSocketService {

  private socket: Subject<MessageEvent>;

  constructor() {}

  public connect(url): Subject<MessageEvent> {
    if(!this.socket) {
      this.socket = this.create(url);
    }
    return this.socket;
  }

  private create(url): Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Observable.create(
      (obs: Observer<MessageEvent>) => {
        ws.onmessage = obs.next.bind(obs);
        ws.onerror = obs.error.bind(obs);
        ws.onclose = obs.complete.bind(obs);

        return ws.close.bind(ws);
      }
    );

    let observer = {
      next: (data: Object) => {
        if (ws.readyState === WebSocket.OPEN) {
          //Not for binary
          ws.send(JSON.stringify(data));
        }
      }
    };

    return Subject.create(observer, observable);
  }

}

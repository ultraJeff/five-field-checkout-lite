import { Component, ViewChild, Renderer2, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router } from  '@angular/router';
import { CheckoutService } from 'services/checkout.service';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import * as customer from 'actions/customer';
import * as cart from 'actions/cart';
import { Shipping } from 'models/cart';

@Component({
  selector: 'app-nlp-ai',
  templateUrl: './nlp-ai.component.html',
  styleUrls: ['./nlp-ai.component.scss']
})
export class NlpAiComponent {
  public loading: boolean;
  public recording: boolean;
  public apiaiSpeech: string;

  private apiaiContexts;
  private context;
  private reader: FileReader = new FileReader();
  private leftChannel;
  //private rightChannel;
  private recordingLength: number;
  private sampleRate;
  private bufferSize = 2048;

  @ViewChild('nlp')
  public nlpElement: ElementRef;

  @Output() nlpAiComplete = new EventEmitter();

  constructor(
    private router: Router,
    private store: Store<fromRoot.State>,
    private renderer: Renderer2,
    private element: ElementRef,
    private checkoutService: CheckoutService) {
    this.apiaiSpeech = ''
    this.apiaiContexts = []
    this.loading = false
    this.recording = false
    this.reader.onload = this._handleFileReader.bind(this)
    this.leftChannel = []
    //this.rightChannel = []
    this.recordingLength = 0
  }

  _resolveApiai(data: any) {
    let nlpResponse = data.result;
    console.log(nlpResponse);

    switch (nlpResponse.action) {
      case 'order.from-account':
        if (nlpResponse.fulfillment.data) {
          let newCustomer = nlpResponse.fulfillment.data;
          this.store.dispatch(new customer.UpdateBuyerAction(newCustomer));
        }
      break;

      case 'orderfrom-account.orderfrom-account-yes':
      //This case happens when the user picks an account to check out with but then says no when asked if they are ready to checkout.
      case 'orderfrom-account.orderfrom-account-no.orderfrom-account-no-follow-up':
        // Timeout is here just so system has enough time for speech synthesis
        setTimeout(() => {
          this.router.navigate(['/review']);
        }, 2000)
      break;

      case 'order.complete':
        this.nlpAiComplete.emit('Complete Order!')
      break;

      case 'fill-checkout-shipping':
        let apiaiAddress: string = '';
        let shippingAmount = 0;
        let {
          address: address,
          'geo-city': city,
          'geo-state-us': state,
          'zip-code': zip,
          'shipping-type-synonyms': shipping
        } = nlpResponse.parameters;

        if (address) {
          apiaiAddress += `${address}, `
        }

        if (city) {
          apiaiAddress += `${city}, `
        }

        if (state) {
          apiaiAddress += `${state} `
        }

        if (zip) {
          apiaiAddress += `${zip},`
        }

        this.store.dispatch(new customer.ApiAiShippingAction(`${apiaiAddress} USA`));

        switch(shipping) {
          case 'ground':
            shippingAmount = 0;
            break;
          case 'two day':
            shippingAmount = 5;
            break;
          case 'one day':
            shippingAmount = 10;
            break;
        }

        let newShipping: Shipping = {
          type: shipping,
          amount: shippingAmount
        }

        this.store.dispatch(new cart.ChangeShippingAction(newShipping));
      break;

      case 'update-cart-totals':
        //TODO: Need a backup action here to trigger an API.AI response of "I didn't get that" as error handling!
        let quantities = nlpResponse.parameters['number'].length
          ? nlpResponse.parameters['number']
          : nlpResponse.parameters['number-types'];

        nlpResponse.parameters['skateboard-parts'].map((part, index) => {
          let newQuantity = {
            type: part,
            quantity: parseInt(quantities[index], 10)
          }

          this.store.dispatch(new cart.ChangeQtyByTypeAction(newQuantity));
        })
      break;
    }
  }

  _clearAudio() {
    this.recordingLength = 0;
    this.leftChannel = [];
    //this.rightChannel = [];
  }

  toggleOnClick() {
    this.recording ? this.stopOnClick() : this.recordOnClick()
  }

  recordOnClick() {
    this.recording = true;
    this._clearAudio();
    if (!navigator.mediaDevices.getUserMedia) { console.log('getUserMedia not supported on your browser!'); return false }

    this.renderer
      .addClass(this.nlpElement.nativeElement, 'active')
    this.renderer
      .setAttribute(this.nlpElement.nativeElement, 'disabled', 'true')

    //This is the entry point!
    navigator.mediaDevices.getUserMedia({audio: true})
    .then(
      (stream) => this.onSuccess(stream)
    ).catch(
      (error) => this.onError(error)
    );
  }

  stopOnClick() {
    this.recording = false;
    this.context.close();
    this._encodeWav(true);

    this.renderer
      .removeClass(this.nlpElement.nativeElement, 'active')
    this.renderer
      .setAttribute(this.nlpElement.nativeElement, 'disabled', 'false')
  }

  _handleFileReader(e) {
    //Send audioURL to Google Speech
    this.checkoutService.postSpeech(e.target.result, this.apiaiContexts)
      .subscribe(
        response => {
          //Emit this to a new API.AI reducer (for context)
          this.apiaiContexts = response.result.contexts
          //TODO: Maybe think about splitting API.AI into it's own separate component and add an HTTP request
          //between getting text back from Speech API and sending text to API.AI
          this.apiaiSpeech = response.result.fulfillment.speech
          this._resolveApiai(response);
          this.loading = false;
        },
        error => {
          this.loading = false;
          try {
            throw new Error('Error Handling Google Speech')
          } catch (e) {
            console.log(e.name + ': ' + e.message);
          }
        }/*,
        complete => console.log('Complete', complete)*/
      )
  }

  _recorderProcess(e: AudioProcessingEvent) {
    //TODO: Offload this process to a web worker
    // We have now PCM data samples from the left channel. Since we are recording in mono we only need the left channel. Now moving on to streaming these chunks to the server.
    let left = e.inputBuffer.getChannelData(0);
    //let right = e.inputBuffer.getChannelData(1);
    // we clone the samples
    this.leftChannel.push(new Float32Array (left));
    //this.rightChannel.push(new Float32Array (right));

    this.recordingLength += this.bufferSize;
    //TODO: Add back in websocket (+observable pattern?) and/or gRPC
    //to stream audio to Google Speech in Express using Google Speech's streaming method
    //this.ws.send(this.leftChannel);
  }

  _mergeBuffers(channelBuffer, recordingLength){
    var result = new Float32Array(recordingLength);
    var offset = 0;
    var lng = channelBuffer.length;
    for (var i = 0; i < lng; i++){
      var buffer = channelBuffer[i];
      result.set(buffer, offset);
      offset += buffer.length;
    }
    return result;
  }

  // interleave(leftChannel, rightChannel){
  //   var length = leftChannel.length + rightChannel.length;
  //   var result = new Float32Array(length);

  //   var inputIndex = 0;

  //   for (var index = 0; index < length; ){
  //     result[index++] = leftChannel[inputIndex];
  //     result[index++] = rightChannel[inputIndex];
  //     inputIndex++;
  //   }
  //   return result;
  // }

  _writeUTFBytes(view, offset, string){
    var lng = string.length;
    for (var i = 0; i < lng; i++){
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  _encodeWav(mono) {
    //Show loading icon instead of microphone
    this.loading = true;

    // we flat the left and right channels down
    var leftBuffer = this._mergeBuffers ( this.leftChannel, this.recordingLength );
    //var rightBuffer = this._mergeBuffers ( this.rightChannel, this.recordingLength );
    // we interleave both channels together
    //var interleaved = this.interleave ( leftBuffer, rightBuffer );

    // create the buffer and view to create the .WAV file
    //var buffer = new ArrayBuffer(44 + interleaved.length * 2);
    var buffer = new ArrayBuffer(44 + leftBuffer.length * 2);
    var view = new DataView(buffer);

    // write the WAV container, check spec at: https://ccrma.stanford.edu/courses/422/projects/WaveFormat/

    /* RIFF identifier */
    this._writeUTFBytes(view, 0, 'RIFF');
    //view.setUint32(4, 44 + interleaved.length * 2, true);
    /* file length */
    view.setUint32(4, 32 + leftBuffer.length * 2, true);
    /* RIFF type */
    this._writeUTFBytes(view, 8, 'WAVE');
    /* format chunk identifier */
    this._writeUTFBytes(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, mono?1:2, true);
    /* sample rate */
    view.setUint32(24, this.sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, this.sampleRate * 4, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 4, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    this._writeUTFBytes(view, 36, 'data');
    //view.setUint32(40, interleaved.length * 2, true);
    /* data chunk length */
    view.setUint32(40, leftBuffer.length * 2, true);

    // write the PCM samples
    //var lng = interleaved.length;
    var lng = leftBuffer.length;
    var index = 44;
    var volume = 1;
    for (var i = 0; i < lng; i++){
      //view.setInt16(index, interleaved[i] * (0x7FFF * volume), true);
      view.setInt16(index, leftBuffer[i] * (0x7FFF * volume), true);
      index += 2;
    }

    // Our exit point. The final binary blob that we can hand off
    let blob = new Blob ( [ view ], { type : 'audio/wav' } );
    this.reader.readAsDataURL(blob);
  }

  onSuccess = (stream) => {
    // Having the microphone stream you can use the AudioContext interface to make the audio (PCM data) go through different processing nodes before reaching its destination.
    // There are nodes for gain, compressor, panner, and much more. We are going to write a custom node, so we can access the audio samples. For that we add a ScriptProcessorNode.
    this.context = new AudioContext();
    this.sampleRate = this.context.sampleRate;
    let audioInput = this.context.createMediaStreamSource(stream);
    // createScripProcessor() allows for direct audio processing
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/createScriptProcessor
    let recorder = this.context.createScriptProcessor(this.bufferSize, 1, 1);
    // specifying the processing function
    recorder.onaudioprocess = this._recorderProcess.bind(this);
    // connect stream to our recorder
    audioInput.connect(recorder);
    // connect our recorder to the previous destination
    recorder.connect(this.context.destination);
  }

  onError = function(err) {
    console.log(`The following error occured: ${err}`);
  }
}

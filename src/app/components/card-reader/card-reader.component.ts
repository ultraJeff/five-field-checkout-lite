import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CheckoutService } from 'services/checkout.service';

@Component({
  selector: 'app-card-reader',
  templateUrl: './card-reader.component.html',
  styleUrls: ['./card-reader.component.scss']
})
export class CardReaderComponent {

  @Input() cardReaderMessage: string = '';
  @Output() cardReaderComplete = new EventEmitter();

  loading: boolean;
  imageSrc: string = '';
  baseImageSize: number = 800;
  reader: FileReader = new FileReader();
  image: HTMLImageElement = new Image();

  constructor(private checkoutService: CheckoutService) {
    this.reader.onload = this._handleFileReader.bind(this)
    this.image.onload = this._resizeBase64.bind(this)
    this.loading = false
  }

  // Check out http://embed.plnkr.co/mMVsbT/ for more design patterns
  scanCard(e) {
    //Reset cardReaderMessage if any
    this.loading = true;
    this.cardReaderMessage = '';

    let file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

    let pattern = /image-*/;

    if (!file.type.match(pattern)) {
      this.loading = false;
      alert('invalid format');
      return;
    }
    // Read in the image as a data URI
    this.reader.readAsDataURL(file);
  }

  _handleFileReader(e) {
    // 1
    // e.target is FileReader
    this.imageSrc = e.target.result;
    // setting the image.src triggers _resizeBase64
    this.image.src = this.imageSrc;
  }

  _resizeBase64() {
    // 2
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    let isPortrait = this.image.naturalHeight > this.image.naturalWidth ? true : false;
    if (isPortrait) {
      // Portrait
      canvas.height = this.baseImageSize;
      canvas.width = canvas.height * (this.image.naturalWidth / this.image.naturalHeight);
    } else {
      // Landscape
      canvas.width = this.baseImageSize;
      canvas.height = canvas.width * (this.image.naturalHeight / this.image.naturalWidth);
    }

    ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);
    this.imageSrc = canvas.toDataURL("image/png");

    this._handleGoogleVision();
  }

  _handleGoogleVision() {
    // 3
    this.checkoutService.postVision(this.imageSrc)
      .subscribe(cardNumber => {
        this.cardReaderComplete.emit(cardNumber);
        this.loading = false;
      }, err => {
        this.loading = false;
        try {
          throw new Error('Error Handling Google Vision')
        } catch (e) {
          this.loading = false;
          console.log(e.name + ': ' + e.message);
        }
      }, () => console.log('onCompleted'))
  }
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'speechSynthesis'
})
export class SpeechSynthesisPipe implements PipeTransform {

  public msg = new SpeechSynthesisUtterance();
  public speechSynthesis;

  constructor() {
    this.msg.volume = 1; // 0 to 1
    this.msg.rate = 1; // 0.1 to 10
    this.msg.pitch = 1; //0 to 2
    this.msg.lang = 'en-US';
    this.speechSynthesis = window.speechSynthesis;
  }

  transform(value: string, args?: any): string {
    let voices = this.speechSynthesis.getVoices();

    this.msg.voice = this.getVoice(voices);
    this.msg.text = value;

    speechSynthesis.speak(this.msg);

    return value;
  }

  getVoice(voices): SpeechSynthesisVoice {
    let voice: SpeechSynthesisVoice;

    for (let v of voices) {
      if (v.name === 'Google US English') {
        voice = v;
        break;
      }
    }

    return voice;
  }

}

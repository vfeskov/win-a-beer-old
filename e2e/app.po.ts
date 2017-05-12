import { browser, by, element } from 'protractor';

export class WinABeerPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('wab-root h1')).getText();
  }
}

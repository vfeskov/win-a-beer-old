import { WinABeerPage } from './app.po';

describe('win-a-beer App', () => {
  let page: WinABeerPage;

  beforeEach(() => {
    page = new WinABeerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('wab works!');
  });
});

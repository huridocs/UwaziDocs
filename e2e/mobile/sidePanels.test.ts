import { adminLogin, logout } from '../helpers/login';
import proxyMock from '../helpers/proxyMock';
import insertFixtures from '../helpers/insertFixtures';
import disableTransitions from '../helpers/disableTransitions';
import { getContentBySelector } from '../helpers/selectorUtils';

const selectors = {
  showFiltersButton: '.library-header .library-toolbar .header-bottom .toggle-button.only-mobile',
  sidePanelFiltersTitle: '.sidepanel-title > div > span',
  firstEntityView: '.documents-list > div > .item-group > div > .item-actions > div > a > span',
};

describe('Side panels', () => {
  beforeAll(async () => {
    await insertFixtures();
    await proxyMock();
    await adminLogin();
    await expect(page).toClick('a.public-documents');
    // iphone 6 measurements
    await page.setViewport({ width: 376, height: 667 });
    await disableTransitions();
  });

  afterAll(async () => {
    await logout();
  });

  describe('library view', () => {
    it('when clicking on the search button a side panel should appear', async () => {
      await expect(page).toClick('.open-toolbar-button .toggle-toolbar-button');
      await expect(page).toClick(selectors.showFiltersButton);
      await expect(page).toMatchElement(selectors.sidePanelFiltersTitle, { text: 'Filters' });
      await expect(page).toClick('button[aria-label="Close side panel"]');
      await expect(page).toClick('.close-toolbar-button .toggle-toolbar-button');
      await page.waitForSelector(selectors.showFiltersButton, { visible: false });
    });
  });

  describe('Entity view', () => {
    it('should show attachments', async () => {
      await expect(page).toClick(selectors.firstEntityView);
      await expect(page).toMatchElement('.item-name', {
        text: 'Artavia Murillo y otros. Resolución de la CorteIDH de 26 de febrero de 2016',
      });
      await expect(page).toMatchElement('div.file > div.file-originalname');
      const [filename] = await getContentBySelector('div.file > div.file-originalname');
      expect(filename).toEqual('SamplePDF.pdf');
    });
  });
});

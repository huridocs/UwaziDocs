import { waitForNavigation } from '../helpers/formActions';
import disableTransitions from '../helpers/disableTransitions';
import insertFixtures from '../helpers/insertFixtures';
import { adminLogin, logout } from '../helpers/login';
import proxyMock from '../helpers/proxyMock';
import { host } from '../config';

describe('Metadata', () => {
  beforeAll(async () => {
    await insertFixtures();
    await proxyMock();
    await adminLogin();
    await disableTransitions();
  });

  beforeEach(async () => {
    await waitForNavigation(expect(page).toClick('a', { text: 'Account settings' }));
    expect(page.url()).toBe(`${host}/en/settings/account`);
  });

  describe('Thesauri tests', () => {
    it('should create a new thesaurus with two values', async () => {
      await expect(page).toClick('a', { text: 'Thesauri' });
      await expect(page).toClick('a', { text: 'Add thesaurus' });
      await expect(page).toFill('input[name="thesauri.data.name"', 'New thesaurus');
      await expect(page).toFill('input[name="thesauri.data.values[0].label"', 'Value 1');
      await expect(page).toFill('input[name="thesauri.data.values[1].label"', 'Value 2');
      await expect(page).toClick('button', { text: 'Save' });
      await expect(page).toClick('.alert.alert-success');
    });

    it('should go back to thesauri then edit the created thesaurus', async () => {
      await expect(page).toClick('a', { text: 'Thesauri' });
      await expect(page).toClick(
        'div.thesauri-list > table > tbody > tr:nth-child(4) > td:nth-child(3) > div > a'
      );
      await expect(page).toClick('button', { text: 'Add group' });
      await expect(page).toFill('input[name="thesauri.data.values[2].label"', 'Group');
      await expect(page).toFill(
        'input[name="thesauri.data.values[2].values[0].label"',
        'Sub value 1'
      );
      await expect(page).toFill(
        'input[name="thesauri.data.values[2].values[1].label"',
        'Sub value 2'
      );
      await expect(page).toClick('button', { text: 'Save' });
      await expect(page).toClick('.alert.alert-success');
    });

    it('should go back to thesauri then delete the created thesaurus', async () => {
      await expect(page).toClick('a', { text: 'Thesauri' });
      await page.waitForSelector(
        '.thesauri-list > table > tbody > tr:nth-child(4) > td:nth-child(3) > div > button'
      );
      await expect(page).toClick(
        '.thesauri-list > table > tbody > tr:nth-child(4) > td:nth-child(3) > div > button'
      );
      await page.waitForSelector('div.modal-content');
      await expect(page).toMatchElement('div.modal-body > h4', {
        text: 'Confirm delete thesaurus: New thesaurus',
      });
      await expect(page).toClick('button', { text: 'Accept' });
    });
  });

  describe('Templates tests', () => {
    it('should create a new template with no properties added', async () => {
      await expect(page).toClick('a', { text: 'Templates' });
      await expect(page).toClick('a', { text: 'Add template' });
      await expect(page).toFill('input[name="template.data.name"', 'My template');
      await expect(page).toClick('button', { text: 'Save' });
      await expect(page).toClick('.alert.alert-success');
    });

    it('should go back and then edit the created template', async () => {
      await expect(page).toClick('a', { text: 'Templates' });
      await expect(page).toClick('a', { text: 'My template' });
      await expect(page).toFill('input[name="template.data.name"', 'My edited template');
      await expect(page).toClick('.panel-body > div > aside > div > ul > li:nth-child(1) > button');
      await expect(page).toClick('button', { text: 'Save' });
      await expect(page).toClick('.alert.alert-success');
    });

    it('should go back to Template then delete the created template', async () => {
      await expect(page).toClick('a', { text: 'Templates' });
      await page.waitForSelector(
        '.settings-content > div > ul > li:nth-child(6) > div > button.btn.btn-danger.btn-xs.template-remove'
      );
      await expect(page).toClick(
        '.settings-content > div > ul > li:nth-child(6) > div > button.btn.btn-danger.btn-xs.template-remove'
      );
      await page.waitForSelector('div.modal-content');
      await expect(page).toMatchElement('div.modal-body > h4', {
        text: 'Confirm delete of template: My edited template',
      });
      await expect(page).toClick('button', { text: 'Accept' });
    });
  });

  afterAll(async () => {
    await logout();
  });
});

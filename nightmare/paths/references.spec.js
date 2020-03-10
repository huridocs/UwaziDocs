import { catchErrors } from 'api/utils/jasmineHelpers';
import createNightmare from '../helpers/nightmare';
import selectors from '../helpers/selectors.js';
import insertFixtures from '../helpers/insertFixtures';

const nightmare = createNightmare();

const getInnerText = selector => document.querySelector(selector).innerText;

describe('references path', () => {
  beforeAll(async () => insertFixtures());
  afterAll(async () => nightmare.end());

  describe('login', () => {
    it('should log in as admin', done => {
      nightmare
        .login('admin', 'admin')
        .then(() => {
          done();
        })
        .catch(catchErrors(done));
    });
  });

  describe('search for document', () => {
    it('should find a document then open it', done => {
      nightmare
        .wait(selectors.libraryView.librarySecondDocumentTitle)
        .evaluate(getInnerText, selectors.libraryView.librarySecondDocumentTitle)
        .then(itemName => {
          return nightmare
            .openDocumentFromLibrary(itemName)
            .wait(selectors.documentView.documentPage)
            .isVisible(selectors.documentView.documentPage)
            .then(result => {
              expect(result).toBe(true);
              done();
            });
        })
        .catch(catchErrors(done));
    });

    it('select a word from the document, fill the form and click the next button', async () => {
      await nightmare
        .selectText(selectors.documentView.documentPageFirstParagraph)
        .waitToClick(selectors.documentView.createParagraphLinkButton)
        .wait(selectors.documentView.createReferenceSidePanelIsActive)
        .waitToClick(selectors.documentView.createReferenceSidePanelSelectFirstType)
        .write(selectors.documentView.createReferenceSidePanelInput, 'home')
        .wait(3000)
        .waitToClick(selectors.documentView.createReferenceSidePanelFirstSearchSuggestion)
        .waitToClick(selectors.documentView.createReferenceSidePanelNextButton)
        .wait(selectors.documentView.targetDocument)
        .isVisible(selectors.documentView.targetDocument)
        .then(result => {
          expect(result).toBe(true);
        });
    });

    it('should select a word from the second document then click the save button', async () => {
      await nightmare
        .wait('#page-1 > div > div.textLayer > span:nth-child(1)')
        .scrollElement(selectors.documentView.viewer, 500)
        .selectText('#page-1 > div > div.textLayer > span:nth-child(1)')
        .waitToClick(selectors.documentView.saveConnectionButton)
        .waitToClick('.alert.alert-success')
        .wait(selectors.documentView.activeConnection)
        .isVisible(selectors.documentView.activeConnection)
        .then(result => {
          expect(result).toBe(true);
        });
    });

    it('should delete the created connection', done => {
      nightmare
        .wait('a.reference')
        .mouseover(selectors.documentView.activeConnection)
        .waitToClick(selectors.documentView.unlinkIcon)
        .waitToClick('.modal-footer .btn-danger')
        .wait('.alert.alert-success')
        .isVisible('.alert.alert-success')
        .then(result => {
          expect(result).toBe(true);
          done();
        })
        .catch(catchErrors(done));
    });
  });
});

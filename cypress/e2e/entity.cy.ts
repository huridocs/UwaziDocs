import { clearCookiesAndLogin } from './helpers/login';
import { changeLanguage } from './helpers/language';
import {
  clickOnCreateEntity,
  clickOnEditEntity,
  saveEntity,
  selectRestrictedEntities,
} from './helpers';

const filesAttachments = ['./cypress/test_files/valid.pdf', './cypress/test_files/batman.jpg'];
const entityTitle = 'Entity with all props';
const textWithHtml = `<h1>The title</h1>
  <a href="https://duckduckgo.com/" target="_blank">
    I am a link to an external site
  </a>
  <br />
  <a href="/entity/6z2x77oi2yyqr529">
    I am a link to the Tracy Robinson entity
  <a/>
  <ol class="someClass">
    <li>List item 1</li>
    <li>List item 2</li>
  </ol>`;

const clickMediaAction = (field: string, action: string) => {
  cy.contains(field).parentsUntil('.form-group').contains('button', action).scrollIntoView();
  cy.contains(field).parentsUntil('.form-group').contains('button', action).click();
};

const addVideo = (local: boolean = true) => {
  clickMediaAction('Media', 'Add file');
  if (local) {
    cy.get('.upload-button input[type=file]')
      .last()
      .selectFile('./cypress/test_files/short-video.mp4', {
        force: true,
      });
  } else {
    cy.get('input[name="urlForm.url"]').type(
      'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      { delay: 0 }
    );
    cy.contains('button', 'Add from URL').click();
  }

  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(2000);
  cy.contains('.form-group.media', 'Media').scrollIntoView();
  cy.contains('.form-group.media', 'Media').within(() => {
    cy.get('video').should('be.visible');
  });
};

const addImage = () => {
  clickMediaAction('Image', 'Add file');
  cy.contains('button', 'Select from computer');
  cy.get('.upload-button input[type=file]')
    .first()
    .selectFile('./cypress/test_files/batman.jpg', {
      force: true,
    });
  // wait for image
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(200);
  cy.contains('.form-group.image', 'Image').scrollIntoView();
  cy.contains('.form-group.image', 'Image').within(() => {
    cy.get('img').should('be.visible');
  });
};

const addInvalidFile = (field: string) => {
  cy.contains(field).parentsUntil('.form-group').contains('button', 'Add file').scrollIntoView();
  cy.contains('button', 'Select from computer');
  cy.get('.upload-button input[type=file]')
    .first()
    .selectFile('./cypress/test_files/sample.pdf', {
      force: true,
    });
  cy.contains(field)
    .parentsUntil('.form-group')
    .contains('This file type is not supported on media fields')
    .scrollIntoView();
  cy.contains(field)
    .parentsUntil('.form-group')
    .contains('This file type is not supported on media fields')
    .should('be.visible');
};

const checkMediaSnapshots = (selector: string) => {
  cy.get(selector).scrollIntoView({ offset: { top: -30, left: 0 } });
  cy.get(selector).toMatchImageSnapshot({ disableTimersAndAnimations: true, threshold: 0.08 });
};

const waitForVideo = async () => {
  cy.get('aside video', { timeout: 5000 }).then(async $video => {
    const readyState = new Promise(resolve => {
      $video[0].removeAttribute('controls');
      const interval = setInterval(() => {
        const videoElement = $video[0] as HTMLVideoElement;
        if (videoElement.readyState >= 3) {
          clearInterval(interval);
          resolve($video);
        }
      }, 10);
      cy.get('@successMessage').should('not.exist');
    });
    await readyState;
  });
};

const webAttachments = {
  name: 'Resource from web',
  url: 'https://fonts.googleapis.com/icon?family=Material+Icons',
};

describe('Entities', () => {
  before(() => {
    const env = { DATABASE_NAME: 'uwazi_e2e', INDEX_NAME: 'uwazi_e2e' };
    cy.exec('yarn e2e-fixtures', { env });
    clearCookiesAndLogin();
    cy.intercept('POST', 'api/entities').as('saveEntity');
  });

  describe('Metadata', () => {
    it('should log in as admin then click the settings nav button.', () => {
      cy.contains('a', 'Settings').click();
      cy.url().should('include', '/en/settings/account');
    });

    it('should test number of available properties.', () => {
      cy.get('a').contains('Templates').click();
      cy.get('a').contains('Add template').click();
      cy.get('.property-options-list li').should('have.length', 13);
    });

    it('should create a template with all the properties', () => {
      cy.get('a').contains('Templates').click();
      cy.get('a').contains('Add template').click();
      cy.get('input[name="template.data.name"]').type('All props');

      cy.get('.property-options-list li button').each(($btn, index) => {
        //intentionaly leaving the last fields out of the test: violated articles (nested), generated id.
        if (index < 11) {
          cy.wrap($btn).click();
        }
      });

      cy.contains('.metadataTemplate span', 'Relationship').siblings().contains('button', 'Edit').click();
      cy.contains('Any entity or document');
      cy.contains('.metadataTemplate', 'Relationship').get('select').eq(1).select(1);
      cy.contains('span', 'Media').siblings().contains('button', 'Edit').click();
      cy.contains('span', 'Show in cards').click();

      cy.get('button').contains('Save').click();
      cy.get('div.alert-success').should('exist');
    });

    it('should add another select of type multiselect', () => {
      cy.get('li.list-group-item:nth-child(3) > button:nth-child(1)').click();
      cy.get('.metadataTemplate-list > li:nth-child(15) > div:nth-child(1) > div:nth-child(2) > button')
        .contains('Edit')
        .click();
      cy.get('#property-label').type('Multiselect');
      cy.get('#property-type').select('Multiple select');
      cy.get('button').contains('Save').click();
      cy.get('div.alert-success').should('exist');
    });

    it('should add multidate, date range and multidate range', () => {
      for (let index = 0; index < 3; index += 1) {
        cy.get('li.list-group-item:nth-child(5) > button:nth-child(1)').click();
      }

      cy.get('.metadataTemplate-list > li:nth-child(16) > div:nth-child(1) > div:nth-child(2) > button')
        .contains('Edit')
        .click();
      cy.get('#property-label').type('Multi Date');
      cy.get('#property-type').select('Multiple date');

      cy.get('.metadataTemplate-list > li:nth-child(17) > div:nth-child(1) > div:nth-child(2) > button')
        .contains('Edit')
        .click();
      cy.get('#property-label').type('Date Range');
      cy.get('#property-type').select('Single date range');

      cy.get('.metadataTemplate-list > li:nth-child(18) > div:nth-child(1) > div:nth-child(2) > button')
        .contains('Edit')
        .click();
      cy.get('#property-label').type('Multi Date Range');
      cy.get('#property-type').select('Multiple date range');

      cy.get('button').contains('Save').click();
      cy.get('div.alert-success').should('exist');
    });

    it('should not allow duplicated properties', () => {
      cy.get('.property-options-list li:first-child button').click();
      cy.get('button').contains('Save').click();
      cy.get('.alert.alert-danger').should('exist');
    });

    it('should create an entity filling all the props.', () => {
      cy.contains('a', 'Library').click();
      cy.get('button').contains('Create entity').click();
      cy.get('textarea[name="library.sidepanel.metadata.title"]').type(entityTitle, { delay: 0 });
      cy.contains('#metadataForm', 'Type').get('select').eq(0).select('All props');
      cy.get('select:first-of-type').select('All props');
      cy.get('.form-group.text input').type('demo text', { delay: 0 });
      cy.get('.form-group.numeric input').type('42');
      cy.get('.form-group.select select').select('Activo');
      cy.get('.form-group.multiselect li.multiselectItem').contains('Activo').click();
      cy.get('.form-group.relationship li.multiselectItem').contains('19 Comerciantes').click();

      addImage();
      addVideo();

      cy.get('.leaflet-container').click(200, 100).click(200, 100);
      cy.get('.leaflet-marker-icon').should('have.length', 1);
      cy.get('.form-group.date').scrollIntoView().find('input').type('08/09/1966', { delay: 0 });
      cy.get('.form-group.daterange div.DatePicker__From input').type('23/11/1963', { delay: 0 });
      cy.get('.form-group.daterange div.DatePicker__To input').type('12/09/1964', { delay: 0 });
      cy.get('.form-group.multidate button.btn.add').click();
      cy.get('.form-group.multidate .multidate-item:first-of-type input').type('23/11/1963', { delay: 0 });
      cy.get('.form-group.multidate .multidate-item:nth-of-type(2) input').type('12/09/1964', { delay: 0 });
      cy.get('.form-group.multidaterange button.btn.add').click();
      cy.get('.form-group.link #label').type('Huridocs', { delay: 0 });
      cy.get('.form-group.link #url').scrollIntoView().type('https://www.huridocs.org/', { delay: 0 });
      cy.get('.form-group.multidaterange .multidate-item:first-of-type div.DatePicker__From input').type('23/11/1963', { delay: 0 });
      cy.get('.form-group.multidaterange .multidate-item:first-of-type div.DatePicker__To input').type('12/09/1964', { delay: 0 });
      cy.get('.form-group.multidaterange .multidate-item:nth-of-type(2) div.DatePicker__From input').type('23/11/1963', { delay: 0 });
      cy.get('.form-group.multidaterange .multidate-item:nth-of-type(2) div.DatePicker__To input').type('12/09/1964', { delay: 0 });
      cy.get('.form-group.markdown textarea').type(textWithHtml, { delay: 0 });
      saveEntity();
    });

    it('should have all the values correctly saved.', () => {
      cy.get('.metadata-type-text').should('contain.text', 'demo text');
      cy.get('.metadata-type-numeric').should('contain.text', '42');
      cy.get('.metadata-type-select').should('contain.text', 'Activo');
      checkMediaSnapshots('#tabpanel-metadata .metadata-type-multimedia.metadata-name-image');
      checkMediaSnapshots('#tabpanel-metadata .metadata-type-multimedia.metadata-name-media');
      cy.get('.metadata-type-multiselect').should('contain.text', 'Activo');
      cy.get('.metadata-type-relationship').should('contain.text', '19 Comerciantes');
      cy.get('.metadata-type-date').should('contain.text', 'Sep 8, 1966');
      cy.get('.metadata-type-daterange').should('contain.text', 'Date RangeNov 23, 1963 ~ Sep 12, 1964');
      cy.get('.metadata-type-multidate').should('contain.text', 'DateMulti DateNov 23, 1963Sep 12, 1964');
      cy.get('.metadata-type-multidaterange').should('contain.text', 'DateMulti Date RangeNov 23, 1963 ~ Sep 12, 1964 2');
      cy.get('.metadata-type-link a').should('have.text', 'Huridocs').and('have.attr', 'href', 'https://www.huridocs.org/');
      cy.get('.leaflet-container').scrollIntoView();
      cy.get('.leaflet-marker-icon').should('have.length', 1);
    });

    it('should check that the HTML is show as expected', () => {
      cy.contains('h1', 'The title').should('exist');
      cy.contains('a', 'I am a link to an external site').should('exist');
      cy.contains('.someClass > li:nth-child(1)', 'List item 1').should('exist');
      cy.contains('.someClass > li:nth-child(2)', 'List item 2').should('exist');
    });
    //cy.addTimeLink(2000, 'Second one');

    it('should check the media properties', () => {
      cy.get('.metadata-name-image > dd > img')
        .should('have.prop', 'src')
        .and('match', /\w+\/api\/files\/\w+\.jpg$/);
      cy.contains('span', 'Geolocation').scrollTo('top');
      cy.contains('.metadata-name-media', 'Media').within(() => {
        cy.get('video')
          .should('have.prop', 'src')
          .and('match', /^blob:http:\/\/localhost:3000\/[\w-]+$/);
      });
      const expectedNewEntityFiles = ['batman.jpg', 'short-video.webm'];
      cy.get('.attachment-name span:not(.attachment-size)').each((element, index) => {
        const content = element.text();
        cy.wrap(content).should('eq', expectedNewEntityFiles[index]);
      });
    });

    it('should navigate to an entity via the rich text field link', () => {
      cy.contains('a', 'I am a link to the Tracy Robinson entity').click();
      cy.contains('.content-header-title > h1:nth-child(1)', 'Tracy Robinson').should('exist');
    });


    xdescribe('Media properties', () => {
      it('should allow add timelinks to an existing entity media property', () => {
        selectRestrictedEntities();
        clickOnEditEntity();
        cy.addTimeLink(2000, 'Control point');
        saveEntity('Entity updated');
        checkMediaSnapshots('.metadata-type-multimedia.metadata-name-image');
        checkMediaSnapshots('.metadata-type-multimedia.metadata-name-media');
      });

      it('should allow set an external link from a media property', () => {
        addVideo(false);
        cy.contains('button', 'Add timelink').scrollIntoView();
        cy.contains('button', 'Add timelink').should('be.visible').click();
        cy.clearAndType('input[name="timelines.0.timeMinutes"]', '09');
        cy.clearAndType('input[name="timelines.0.timeSeconds"]', '57');
        cy.clearAndType('input[name="timelines.0.label"]', 'Dragon');
        saveEntity();
        checkMediaSnapshots('.metadata-type-multimedia.metadata-name-media');
      });

      it('should show an error for an invalid property and allow to replace it for a valid one', () => {
        addInvalidFile('Image');
        addInvalidFile('Media');
        clickMediaAction('Image', 'Unlink');
        addImage();
        clickMediaAction('Media', 'Unlink');
        addVideo();
        saveEntity();
        checkMediaSnapshots('.metadata-type-multimedia.metadata-name-image');
        checkMediaSnapshots('.metadata-type-multimedia.metadata-name-media');
      });

      it('should allow unlink the value of a media property', () => {
        cy.contains('h2', 'Reporte con propiedades audiovisuales corregidas').click();
        cy.contains('button', 'Edit').should('be.visible');
        clickOnEditEntity();
        clickMediaAction('Media', 'Unlink');
        cy.contains('button', 'Save').click();
        cy.wait('@saveEntity');
        cy.contains('Entity updated').as('successMessage');
        // eslint-disable-next-line cypress/no-unnecessary-waiting
        cy.wait(1000);
        cy.get('@successMessage').should('not.exist');
      });

      describe('thumbnails', () => {
        const checkExternalMedia = () => {
          cy.get('video').should(
            'have.attr',
            'src',
            'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
          );
        };

        it('should display the external player for external media', () => {
          cy.get('.item-group > :nth-child(2)').within(() => {
            cy.contains('span', 'Reporte con contenido externo').click();
            cy.contains('Media').scrollIntoView({
              offset: { top: -10, left: 0 },
            });
            checkExternalMedia();
          });
        });

        it('should show the external player on the sidepanel and entity view', () => {
          cy.get('.item-group > :nth-child(2) > .item-info').click();
          cy.get('.side-panel.is-active').within(() => {
            cy.contains('h1', 'Reporte con contenido externo');
            cy.get('.metadata-type-multimedia.metadata-name-media').scrollIntoView({
              offset: { top: -30, left: 0 },
            });
            checkExternalMedia();
          });

          cy.get('.item-group > :nth-child(2)').within(() => {
            cy.contains('a', 'View').click();
          });

          cy.contains('h1', 'Reporte con contenido externo');
          checkExternalMedia();
        });

        it('should render a generic thumbnail for internal media', () => {
          cy.contains('a', 'Library').click();
          cy.contains('Media');
          cy.get('.item-group > :nth-child(3)').toMatchImageSnapshot();
        });

        it('should render the player for internal media on the sidepanel and entity view', () => {
          cy.get('.item-group > :nth-child(3) > .item-info').click();
          cy.get('.side-panel.is-active').within(() => {
            cy.contains('h1', 'Reporte audiovisual con lineas de tiempo');
            cy.get('.react-player').within(() => {
              cy.get('video', { timeout: 2000 });
            });
          });

          cy.get('.item-group > :nth-child(3)').within(() => {
            cy.contains('a', 'View').click();
          });

          cy.contains('h1', 'Reporte audiovisual con lineas de tiempo');

          cy.get('.react-player').within(() => {
            cy.get('video', { timeout: 2000 });
          });
        });
      });
    });

    xit('should be able to remove all the values from properties.', () => {
      cy.get('button.edit-metadata.btn svg').click();

      cy.get('.form-group.text input').clear();
      cy.get('.form-group.numeric input').clear();
      cy.get('.form-group.select select').select('Select...');
      cy.get('.form-group.multiselect li.multiselectItem').contains('Activo').click();
      cy.get('.form-group.relationship li.multiselectItem').contains('19 Comerciantes').click();

      cy.get('.form-group.date input').scrollIntoView().clear();
      cy.get('.form-group.daterange div.DatePicker__From input').clear();
      cy.get('.form-group.daterange div.DatePicker__To input').clear();
      cy.get('.form-group.multidate .multidate-item:nth-of-type(2) > button').click();
      cy.get('.form-group.multidate .multidate-item:first-of-type > button').click();
      cy.get('div.form-group.multidaterange .multidate-item:nth-child(2) > div > button').click();
      cy.get('div.form-group.multidaterange .multidate-item:nth-child(1) > div > button').click();
      cy.get('.form-group.markdown textarea').scrollIntoView().clear();
      cy.get('.form-group.link #label').clear();
      cy.get('.form-group.link #url').clear();

      cy.get('.form-group #lat').scrollIntoView().clear();
      cy.get('.form-group #lon').clear();

      cy.get('button').contains('Save').click();
      cy.get('div.alert-success').should('exist');
    });

    xit('should not have metadata.', () => {
      cy.get('div.metadata.tab-content-visible div.view > dl > div').should('have.length', 0);
    });

  })

  xdescribe('supporting files and main documents', () => {
    describe('Entity with supporting files', () => {
      it('Should create a new entity with supporting files', () => {

        cy.contains('button', 'Add file').click();
        cy.get('#tab-uploadComputer').click();
        cy.get('input[aria-label="fileInput"]').first().selectFile(filesAttachments[0], {
          force: true,
        });
        cy.contains('button', 'Add file').click();
        cy.get('#tab-uploadComputer').click();
        cy.get('input[aria-label="fileInput"]').first().selectFile(filesAttachments[1], {
          force: true,
        });
        cy.get('input[aria-label=fileInput]').first().selectFile(filesAttachments[0], {
          force: true,
        });
        cy.contains('button', 'Add file').click();
        cy.get('#tab-uploadComputer').click();
        cy.get('input[aria-label=fileInput]').first().selectFile(filesAttachments[1], {
          force: true,
        });
        cy.contains('button', 'Add file').click();
        cy.contains('.tab-link', 'Add from web').click();
        cy.get('.web-attachment-url').click();
        cy.get('.web-attachment-url').type(webAttachments.url, { delay: 0 });
        cy.get('.web-attachment-name').click();
        cy.get('.web-attachment-name').type(webAttachments.name, { delay: 0 });
        cy.contains('button', 'Add from URL').click();
        saveEntity();
        cy.contains('.item-document', 'Entity with supporting files').click();
        const expectedNewFiles = ['batman.jpg', 'Resource from web', 'valid.pdf'];
        cy.get('.attachment-name span:not(.attachment-size)').each((element, index) => {
          const content = element.text();
          cy.wrap(content).should('eq', expectedNewFiles[index]);
        });

      });

      it('should rename a supporting file', () => {
        cy.contains('.item-document', 'Entity with supporting files').click();
        clickOnEditEntity();
        cy.get('input[name="library.sidepanel.metadata.attachments.2.originalname"]').clear();
        cy.get('input[name="library.sidepanel.metadata.attachments.2.originalname"]').type(
          'My PDF.pdf',
          { delay: 0 }
        );
        cy.contains('button', 'Save').click();
        cy.contains('.item-document', 'Entity with supporting files').click();
        const expectedRenamedFiles = ['batman.jpg', 'My PDF.pdf', 'Resource from web'];
        cy.get('.attachment-name span:not(.attachment-size)').each((element, index) => {
          const content = element.text();
          cy.wrap(content).should('eq', expectedRenamedFiles[index]);
        });
      });

      it('should delete the first supporting file', () => {
        cy.contains('.item-document', entityTitle).click();
        clickOnEditEntity();
        cy.get('.delete-supporting-file').eq(0).click();
        cy.contains('button', 'Save').click();
        cy.contains('.item-document', entityTitle).click();
        const expectedRemainingFiles = ['My PDF.pdf', 'Resource from web'];
        cy.get('.attachment-name span:not(.attachment-size)').each((element, index) => {
          const content = element.text();
          cy.wrap(content).should('eq', expectedRemainingFiles[index]);
        });
      });


      describe('Entity with main documents', () => {
        it('Should create a new entity with a main documents', () => {
          cy.get('.document-list-parent > input')
            .first()
            .selectFile('./cypress/test_files/valid.pdf', {
              force: true,
            });
          saveEntity();
        });

        it('should create a reference from main document', () => {
          cy.contains('.item-document', 'Entity with main documents').within(() => {
            cy.get('.view-doc').click();
          });
          cy.contains('span', 'La Sentencia de fondo');
          cy.get('#p3R_mc24 > span:nth-child(2)').realClick({ clickCount: 3 });
          cy.get('.fa-file', { timeout: 5000 }).then(() => {
            cy.get('.fa-file').realClick();
          });
          cy.contains('.create-reference', 'Relacionado a').should('be.visible');
          cy.contains('li.multiselectItem', 'Relacionado a').realClick();
          cy.get('aside.create-reference input').type('Patrick Robinson', { timeout: 5000 });
          cy.contains('Tracy Robinson', { timeout: 5000 });
          cy.contains('.item-name', 'Patrick Robinson', { timeout: 5000 }).realClick();
          cy.contains('aside.create-reference .btn-success', 'Save', { timeout: 5000 }).click({
            timeout: 5000,
          });
          cy.contains('Saved successfully.');
          cy.get('#p3R_mc0').scrollIntoView();
          cy.get('.row').toMatchImageSnapshot();
        });

        it('should edit the entity and the documents', () => {
          cy.contains('a', 'Library').click();
          cy.contains('.item-document', 'Entity with main documents').click();
          cy.contains('.metadata-type-text', 'An entity with main documents').click();
          clickOnEditEntity();
          cy.get('input[name="library.sidepanel.metadata.documents.0.originalname"]').click();
          cy.get('input[name="library.sidepanel.metadata.documents.0.originalname"]').clear();
          cy.get('input[name="library.sidepanel.metadata.documents.0.originalname"]').type(
            'Renamed file.pdf',
            { delay: 0 }
          );
          cy.get('.document-list-parent > input')
            .first()
            .selectFile('./cypress/test_files/invalid.pdf', {
              force: true,
            });
          saveEntity('Entity updated');
          cy.contains('.item-document', 'Entity with main documents').click();
          cy.contains('.file-originalname', 'Renamed file.pdf').should('exist');
          cy.contains('.file-originalname', 'invalid.pdf').should('exist');
        });

        it('should delete the invalid document', () => {
          clickOnEditEntity();
          cy.get('.attachments-list > .attachment:nth-child(2) > button').click();
          cy.contains('button', 'Save').click();
          cy.contains('Entity updated').as('successMessage');
          cy.get('@successMessage').should('not.exist');
          cy.contains('.item-document', 'Entity with main documents').click();
          cy.contains('.file-originalname', 'Renamed file.pdf').should('exist');
          cy.contains('.file-originalname', 'invalid.pdf').should('not.exist');
        });

        it('should keep searched text between tabs', () => {
          cy.clearAndType(
            'input[aria-label="Type something in the search box to get some results."]',
            '"4 de julio de 2006"',
            { delay: 0 }
          );
          cy.get('svg[aria-label="Search button"]').click();
          cy.contains('.item-snippet', '4 de julio de 2006').should('have.length', 1);
          cy.contains('.item-document .item-actions a', 'View').click();
          cy.contains('VISTO');
          cy.get('.snippet-text').should('have.length', 2);
          cy.get('#tab-metadata').click();
          cy.get('.entity-sidepanel-tab-link').then(element => {
            expect(element.attr('href')).to.contain('searchTerm=%224%20de%20julio%20de%202006%22');
          });
          cy.contains('a', 'Library').click();
          cy.get('svg[aria-label="Reset Search input"]').click();
        });
      });
    });
  });

  xdescribe('Languages', () => {
    it('should change the entity in Spanish', () => {
      changeLanguage('Español');
      cy.contains('.item-document', 'Test entity').click();
      clickOnEditEntity('Editar');
      cy.get('textarea[name="library.sidepanel.metadata.title"]').click();
      cy.clearAndType('textarea[name="library.sidepanel.metadata.title"]', 'Título de prueba', {
        delay: 0,
      });
      cy.get('input[name="library.sidepanel.metadata.metadata.resumen"]').click();
      cy.clearAndType(
        'input[name="library.sidepanel.metadata.metadata.resumen"]',
        'Resumen en español',
        { delay: 0 }
      );
      cy.contains('.multiselectItem-name', 'Argentina').click();
      cy.contains('button', 'Guardar').click();
    });

    it('should check the values for the entity in Spanish', () => {
      changeLanguage('Español');
      cy.contains('.item-document', 'Título de prueba').click();
      cy.contains('h1.item-name', 'Título de prueba').should('exist');
      cy.contains('.metadata-type-text > dd', 'Resumen en español').should('exist');
      cy.contains('.multiline > .item-value > a', 'Argentina').should('exist');
    });

    it('should edit the text field in English', () => {
      changeLanguage('English');
      cy.contains('.item-document', 'Test entity').click();
      clickOnEditEntity();
      cy.get('input[name="library.sidepanel.metadata.metadata.resumen"]').click();
      cy.get('input[name="library.sidepanel.metadata.metadata.resumen"]').type('Brief in English', {
        delay: 0,
      });
      cy.contains('button', 'Save').click();
      cy.contains('Entity updated');
    });

    it('should not affect the text field in Spanish', () => {
      changeLanguage('Español');
      cy.contains('.item-document', 'Título de prueba').click();
      cy.contains('.metadata-type-text > dd', 'Resumen en español').should('exist');
    });
  });

  xdescribe('new thesauri values shortcut', () => {
    before(() => {
      changeLanguage('English');
      cy.get('li[title=Published]').click();
      cy.contains(
        'Artavia Murillo y otros. Resolución de la Corte IDH de 31 de marzo de 2014'
      ).click();
      clickOnEditEntity();
    });

    it('should add a thesauri value on a multiselect field and select it', () => {
      cy.get(
        '#metadataForm > div:nth-child(3) > .form-group.multiselect > ul > .wide > div > div > button > span'
      ).scrollIntoView();
      cy.contains(
        '#metadataForm > div:nth-child(3) > .form-group.multiselect > ul > .wide > div > div > button > span',
        'add value'
      )
        .parent()
        .click();
      cy.contains('.modal-content', 'Add thesaurus value');
      cy.get('input[name=value]#newThesauriValue').type('New Value', {
        delay: 0,
      });
      cy.contains('.file-form button.confirm-button', 'Save').click();
      cy.contains(
        '#metadataForm > div:nth-child(3) > .form-group.multiselect > ul > .wide > div > ul > li:nth-child(4) > label > .multiselectItem-name',
        'New Value'
      ).should('exist');
      const expectedMultiselect = [
        'De asunto',
        'Medidas Provisionales',
        'New Value',
        'Excepciones Preliminares',
        'Fondo',
      ];
      cy.get(
        '#metadataForm > div:nth-child(3) > .form-group.multiselect > ul > li.wide > div > ul > li > label > .multiselectItem-name'
      ).each((element, index) => {
        const content = element.text();
        cy.wrap(content).should('eq', expectedMultiselect[index]);
      });
    });

    it('should add a thesauri value on a single select field and select it', () => {
      cy.contains(
        '#metadataForm > div:nth-child(3) > .form-group.select > ul > .wide > div > div > button > span',
        'add value'
      ).click();
      cy.get('input[name=value]#newThesauriValue').click();
      cy.get('input[name=value]#newThesauriValue').type('New Value', {
        delay: 0,
      });
      cy.contains('.confirm-button', 'Save').click();
    });
  });
});

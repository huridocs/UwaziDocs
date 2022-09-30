/**
 * @jest-environment jsdom
 */
import Immutable from 'immutable';
import { LocalForm } from 'react-redux-form';
import Dropzone from 'react-dropzone';
import { MetadataFormFields } from 'app/Metadata';
import { Captcha } from 'app/ReactReduxForms';
import api from 'app/utils/api';
import { renderConnectedMount } from 'app/utils/test/renderConnected';
import PublicForm from '../PublicForm';

describe('PublicForm', () => {
  let props;
  let component;
  let instance;
  let submit;
  let request;

  beforeEach(() => {
    request = Promise.resolve({ promise: Promise.resolve('ok') });
    submit = jasmine.createSpy('submit').and.callFake(async () => request);
  });
  const prepareMocks = () => {
    instance = component.instance();
    instance.refreshCaptcha = jest.fn();
    instance.formDispatch = jest.fn();
    component.find(LocalForm).props().getDispatch(instance.formDispatch);
    const captcha = component.find(Captcha);
    captcha.props().refresh = instance.refreshCaptcha;
    captcha.props().refresh(instance.refreshCaptcha);
  };

  const render = (customProps, generatedId = false) => {
    props = {
      template: Immutable.fromJS({
        _id: '123',
        commonProperties: [
          {
            label: 'Title changed',
            name: 'title',
            generatedId,
          },
        ],
        properties: [
          { type: 'text', name: 'text' },
          { type: 'image', name: 'image' },
        ],
      }),
      thesauris: Immutable.fromJS([]),
      file: false,
      attachments: false,
      submit,
      remote: false,
    };
    const state = {
      entityView: {
        entity: Immutable.fromJS({
          sharedId: 'entity1',
          templatedId: 'template1',
          title: 'Entity 1',
          attachments: [],
          metadata: [{ text: [] }],
        }),
        entityForm: { attachments: [] },
      },
      settings: { collection: Immutable.fromJS({ dateFormat: 'dateFormat' }) },
      templates: Immutable.fromJS([
        {
          name: 'template1',
          _id: 'templateId',
          properties: [],
          commonProperties: [{ name: 'title', label: 'Title' }],
        },
      ]),
    };
    const mappedProps = { ...props, ...customProps };
    spyOn(api, 'get').and.returnValue(
      Promise.resolve({
        json: {
          data: [
            { title: 'Southern Nights', documents: [], attachments: [] },
            { title: 'elenore', documents: [{ originalName: 'The Turtles' }], attachments: [] },
          ],
        },
      })
    );

    component = renderConnectedMount(PublicForm.WrappedComponent, state, mappedProps, true);
    prepareMocks();
  };

  it('should bind the MetadataFormFields change to this form', () => {
    render();
    const metadataFormFields = component.find(MetadataFormFields);
    metadataFormFields.props().boundChange('publicForm.title', 'New Title');

    expect(instance.formDispatch).toHaveBeenCalledWith(
      expect.objectContaining({ value: 'New Title', model: 'publicForm.title' })
    );
  });

  it('should render a generated ID as title if the option is marked', () => {
    render({}, true);
    const title = component.find('#title').at(0);
    expect(title.props().defaultValue).toEqual(expect.stringMatching(/^[a-zA-Z0-9-]{12}$/));
  });

  it('should load a generated Id as title after submit if the option is marked', async () => {
    render({}, true);
    const title = component.find('#title').at(0);
    expect(title.props().defaultValue).toEqual(expect.stringMatching(/^[a-zA-Z0-9-]{12}$/));

    const formSubmit = component.find(LocalForm).props().onSubmit;
    await formSubmit({ title: 'test' });

    component.update();
    const title1 = component.find('#title').at(0);
    expect(title1.props().defaultValue).toEqual(expect.stringMatching(/^[a-zA-Z0-9-]{12}$/));
    expect(title1).not.toEqual(title);
  });

  it('should enable remote captcha', () => {
    render({ remote: true });

    expect(component.find(Captcha).props()).toMatchObject({
      model: '.captcha',
      refresh: expect.any(Function),
      remote: true,
    });
  });

  it('should render a form with file and attachments', () => {
    render({ file: true, attachments: true });
    const formSubmit = component.find(LocalForm);
    expect(formSubmit.length).toBe(1);
    expect(component.find(Dropzone).length).toBe(2);
  });

  it('should submit the values wrapped', async () => {
    render();

    const formSubmit = component.find(LocalForm).props().onSubmit;
    await formSubmit({ title: 'test', metadata: { color: 'red', size: 42, date: 13442423 } });

    expect(props.submit).toHaveBeenCalledWith(
      {
        file: undefined,
        metadata: { color: [{ value: 'red' }], date: [{ value: 13442423 }], size: [{ value: 42 }] },
        template: '123',
        title: 'test',
        attachments: [],
      },
      false
    );
  });

  it('should refresh the captcha and clear the form after submit', async () => {
    render();
    const formSubmit = component.find(LocalForm).props().onSubmit;
    await formSubmit({ title: 'test' });
    expect(instance.refreshCaptcha).toHaveBeenCalled();
    expect(instance.formDispatch).toHaveBeenCalledWith({
      model: 'publicform',
      type: 'rrf/reset',
    });
  });

  it('should refresh captcha and NOT clear the form on submission error', async () => {
    request = new Promise(resolve => {
      resolve({ promise: Promise.reject() });
    });
    submit = jasmine.createSpy('submit').and.returnValue(request);
    render();
    const formSubmit = component.find(LocalForm).props().onSubmit;
    await formSubmit({ title: 'test' });

    request.then(uploadCompletePromise => {
      uploadCompletePromise.promise
        .then(() => fail('should throw error'))
        .catch(() => {
          expect(instance.formDispatch).not.toHaveBeenCalledWith();
          expect(instance.refreshCaptcha).toHaveBeenCalled();
        });
    });
  });

  it('should keep attachments after a submission error', async done => {
    request = new Promise(resolve => {
      resolve({ promise: Promise.reject() });
    });

    const newFile = new File([Buffer.from('image').toString('base64')], 'image.jpg', {
      type: 'image/jpg',
    });
    render({ attachments: true });
    const attachments = component.find('.preview-title');
    expect(attachments.length).toEqual(0);
    const formSubmit = component.find(LocalForm).props().onSubmit;
    component.find(Dropzone).props().onDrop([newFile]);
    component.update();
    await formSubmit({ title: 'test' });
    request.then(uploadCompletePromise => {
      uploadCompletePromise.promise
        .then(() => fail('should throw error'))
        .catch(() => {
          const actualAttachments = component.find('.preview-title');
          expect(actualAttachments.length).toBe(1);
          expect(actualAttachments.get(0).props.children).toEqual('image.jpg');
          expect(instance.formDispatch).not.toHaveBeenCalledWith();
          expect(instance.refreshCaptcha).toHaveBeenCalled();
          done();
        });
    });
  });
});

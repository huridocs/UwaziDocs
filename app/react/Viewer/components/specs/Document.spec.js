/**
 * @jest-environment jsdom
 */
import React from 'react';
import { shallow } from 'enzyme';
import Immutable from 'immutable';

import Text from 'app/Viewer/utils/Text';
import PDF from 'app/PDF';
import { Document } from 'app/Viewer/components/Document.js';

describe('Document', () => {
  let component;
  let instance;

  let props;

  beforeEach(() => {
    props = {
      setSelection: jasmine.createSpy('setSelection'),
      PDFReady: jasmine.createSpy('PDFReady'),
      unsetSelection: jasmine.createSpy('unsetSelection'),
      onClick: jasmine.createSpy('onClick'),
      doc: Immutable.fromJS({ _id: 'documentId', documents: [{ pdfInfo: { test: 'pdfInfo' } }] }),
      file: { language: 'eng', _id: 'fileId', pdfInfo: { test: 'pdfInfo' } },
      onDocumentReady: jasmine.createSpy('onDocumentReady'),
      selectedSnippet: Immutable.fromJS({}),
      docHTML: Immutable.fromJS({
        pages: ['page1', 'page2', 'page3'],
        css: 'css',
      }),
    };
  });

  const render = () => {
    component = shallow(<Document {...props} />);
    instance = component.instance();
  };

  it('should add id as a className', () => {
    render();
    expect(
      component
        .find('div')
        .children()
        .first()
        .hasClass('_documentId')
    ).toBe(true);
  });

  it('should add the className passed', () => {
    props.className = 'aClass';
    render();
    expect(
      component
        .find('div')
        .children()
        .first()
        .hasClass('aClass')
    ).toBe(true);
  });

  it('should add the correct LTR or RTL direction according to file franc language', () => {
    render();
    expect(component.find('.document').hasClass('force-ltr')).toBe(true);

    props.file.language = 'arb';
    render();
    expect(component.find('.document').hasClass('force-rtl')).toBe(true);
  });

  describe('onClick', () => {
    describe('when executeOnClickHandler = true', () => {
      it('should execute onClick', () => {
        props.executeOnClickHandler = true;
        render();
        component.find('.pages').simulate('click', { target: {} });

        expect(props.onClick).toHaveBeenCalled();
      });
    });

    describe('when executeOnClickHandler = false', () => {
      it('should not execute onClick', () => {
        props.executeOnClickHandler = false;
        render();
        component.find('.pages').simulate('click', { target: {} });

        expect(props.onClick).not.toHaveBeenCalled();
      });
    });

    describe('when the target is a reference', () => {
      beforeEach(() => {
        props.references = Immutable.fromJS([{ reference: 'reference' }]);
      });

      it('should activate the reference', () => {
        props.executeOnClickHandler = true;
        props.references = Immutable.fromJS([{ _id: 'referenceId', test: 'test' }]);
        props.activateReference = jasmine.createSpy('activateReference');
        render();
        instance.text = { selected: jasmine.createSpy('selected').and.returnValue(false) };
        component.find('.pages').simulate('click', {
          target: { className: 'reference', getAttribute: () => 'referenceId' },
        });
        expect(props.activateReference).toHaveBeenCalledWith(
          props.references.get(0).toJS(),
          props.file.pdfInfo,
          props.references.toJS()
        );
        expect(props.onClick).not.toHaveBeenCalled();
      });

      describe('when text is selected', () => {
        it('should not active the reference', () => {
          props.executeOnClickHandler = true;
          props.activateReference = jasmine.createSpy('activateReference');
          props.references = Immutable.fromJS([{ _id: 'referenceId', test: 'test' }]);
          render();
          instance.text = { selected: jasmine.createSpy('selected').and.returnValue(true) };
          component.find('.pages').simulate('click', {
            target: { className: 'reference', getAttribute: () => 'referenceId' },
          });
          expect(props.activateReference).not.toHaveBeenCalledWith(
            props.references.get(0).toJS(),
            props.doc.toJS().pdfInfo
          );
          expect(props.onClick).toHaveBeenCalled();
        });
      });
    });
  });

  describe('when PDF is ready', () => {
    it('should call the onDocumentReady prop with the doc as argument', () => {
      render();
      const pdf = component.find(PDF).first();
      pdf.simulate('PDFReady');
      expect(props.onDocumentReady).toHaveBeenCalledWith(props.doc);
    });
  });

  describe('componentWillReceiveProps', () => {
    it('should unset selection if different doc', () => {
      render();
      expect(props.unsetSelection.calls.count()).toBe(1);
      instance.componentWillReceiveProps({
        doc: Immutable.fromJS({ _id: 'documentId' }),
        selectedSnippet: Immutable.fromJS({}),
      });
      expect(props.unsetSelection.calls.count()).toBe(1);
      instance.componentWillReceiveProps({
        doc: Immutable.fromJS({ _id: 'anotherId' }),
        selectedSnippet: Immutable.fromJS({}),
      });
      expect(props.unsetSelection.calls.count()).toBe(2);
    });
  });

  describe('componentWillMount', () => {
    it('should unset selection', () => {
      render();
      expect(props.unsetSelection.calls.count()).toBe(1);
      instance.componentWillMount();
      expect(props.unsetSelection.calls.count()).toBe(2);
    });
  });

  describe('componentDidMount', () => {
    it('should instantiate a Text object with pageContainer', () => {
      render();
      instance.componentDidMount();
      expect(instance.text.container).toBe(instance.pagesContainer);
    });
  });

  describe('onMouseUp/onTouchEnd', () => {
    beforeEach(() => {
      render();
      instance.text = Text(instance.pagesContainer);
    });

    describe('when props.disableTextSelection', () => {
      it('should no execute onTextSelected', () => {
        props.disableTextSelection = true;
        render();
        spyOn(instance, 'onTextSelected');
        instance.text = Text(instance.pagesContainer);
        spyOn(instance.text, 'selected').and.returnValue(true);

        component.find('.pages').simulate('mouseup');
        expect(instance.onTextSelected).not.toHaveBeenCalled();
      });
    });

    describe('when text selected', () => {
      it('should call onTextSelected', () => {
        spyOn(instance, 'onTextSelected');
        spyOn(instance.text, 'selected').and.returnValue(true);

        component.find('.pages').simulate('mouseup');
        expect(instance.onTextSelected).toHaveBeenCalled();

        instance.onTextSelected.calls.reset();
        component.find('.pages').simulate('touchend');
        expect(instance.onTextSelected).toHaveBeenCalled();
      });
    });

    describe('when no text selected', () => {
      it('should unsetSelection', () => {
        spyOn(instance.text, 'selected').and.returnValue(false);

        component.find('.pages').simulate('mouseup');

        expect(props.unsetSelection).toHaveBeenCalled();
      });

      it('should not call onTextSelected', () => {
        spyOn(instance, 'onTextSelected');
        spyOn(instance.text, 'selected').and.returnValue(false);

        component.find('.pages').simulate('mouseup');
        expect(instance.onTextSelected).not.toHaveBeenCalled();

        instance.onTextSelected.calls.reset();
        component.find('.pages').simulate('touchend');
        expect(instance.onTextSelected).not.toHaveBeenCalled();
      });
    });
  });

  describe('onTextSelected', () => {
    beforeEach(() => {
      props.selection = { selection: 'selection' };
      props.highlightedReference = 'highlightedReference';
      props.references = Immutable.fromJS([{ reference: 'reference' }]);
      props.forceSimulateSelection = true;
      props.pdfIsRdy = true;
      props.searchTerm = 'searchTerm';
      props.snippets = Immutable.fromJS(['snippet']);
      render();
      instance.text = Text(instance.pagesContainer);
      spyOn(instance.text, 'getSelection').and.returnValue('serializedRange');
      spyOn(instance.text, 'simulateSelection');
      spyOn(instance.text, 'highlight');
      spyOn(instance.text, 'renderReferences');
    });

    it('should setSelection with the range serialized', () => {
      instance.onTextSelected();
      expect(props.setSelection).toHaveBeenCalledWith('serializedRange', 'fileId');
    });

    describe('componentDidUpdate', () => {
      it('should simulateSelection', () => {
        instance.componentDidUpdate();
        expect(instance.text.simulateSelection).toHaveBeenCalledWith(
          { selection: 'selection' },
          props.forceSimulateSelection
        );
      });

      it('should render the references', () => {
        instance.componentDidUpdate();
        expect(instance.text.renderReferences).toHaveBeenCalledWith([{ reference: 'reference' }]);
      });
    });
  });
});

/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, act, queryAllByAttribute, cleanup, RenderResult } from '@testing-library/react';
import { configMocks, mockIntersectionObserver } from 'jsdom-testing-mocks';
import { Provider } from 'react-redux';
import { pdfScaleAtom } from 'V2/atoms';
import { TestAtomStoreProvider, LEGACY_createStore as createStore } from 'V2/testing';
import PDF from '../PDF';

configMocks({ act });
const oberserverMock = mockIntersectionObserver();

const mockPageRender = jest.fn();
const mockPageDestroy = jest.fn();

const renderingStates = {
  INITIAL: 0,
  RUNNING: 1,
  PAUSED: 2,
  FINISHED: 3,
};

jest.mock('../pdfjs.ts', () => ({
  EventBus: jest.fn(),
  PDFJS: {
    getDocument: jest.fn(() => ({
      promise: Promise.resolve({
        numPages: 5,
        getPage: jest.fn(async () =>
          Promise.resolve({
            getViewport: () => ({ width: 100, height: 300 }),
          })
        ),
      }),
    })),
    PixelsPerInch: { PDF_TO_CSS_UNITS: 0.5 },
  },
  PDFJSViewer: {
    PDFPageView: jest.fn().mockImplementation(() => ({
      setPdfPage: jest.fn(),
      draw: jest.fn().mockImplementation(async () => {
        mockPageRender();
        return Promise.resolve();
      }),
      destroy: mockPageDestroy,
      renderingState: 0,
      cancelRendering: jest.fn(),
    })),
    RenderingStates: renderingStates,
  },
  CMAP_URL: 'legacy_character_maps',
}));

describe('PDF', () => {
  let renderResult: RenderResult;

  const renderComponet = () => {
    renderResult = render(
      <Provider store={createStore()}>
        <TestAtomStoreProvider initialValues={[[pdfScaleAtom, 1.5]]}>
          <PDF fileUrl="" />
        </TestAtomStoreProvider>
      </Provider>
    );
  };

  afterEach(() => {
    cleanup();
  });

  afterAll(() => {
    oberserverMock.cleanup();
  });

  it('should render the pdf file', async () => {
    await act(() => {
      renderComponet();
    });
    const { container } = renderResult;
    const page1 = queryAllByAttribute('class', container, 'pdf-page')[0];
    await act(() => {
      oberserverMock.enterNode(page1);
    });
    expect(mockPageRender).toHaveBeenCalled();
    expect(container).toMatchSnapshot();
  });
});

/* eslint-disable max-statements */
import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { PDFPageView } from 'pdfjs-dist/web/pdf_viewer.mjs';
import { Highlight } from '@huridocs/react-text-selection-handler';
import { useAtom } from 'jotai';
import { pdfScaleAtom } from 'V2/atoms';
import { EventBus, PDFJSViewer, PDFJS } from './pdfjs';
import { TextHighlight } from './types';
import { calculateScaling } from './functions/calculateScaling';
import { adjustSelectionsToScale } from './functions/handleTextSelection';

interface PDFPageProps {
  pdf: PDFDocumentProxy;
  page: number;
  eventBus: typeof EventBus.prototype;
  highlights?: TextHighlight[];
  containerWidth?: number;
}

const PDFPage = ({ pdf, page, eventBus, containerWidth, highlights }: PDFPageProps) => {
  const pageContainerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [pdfPage, setPdfPage] = useState<PDFPageProxy>();
  const [error, setError] = useState<string>();
  const [pdfScale, setPdfScale] = useAtom(pdfScaleAtom);
  const pageViewer = useRef<PDFPageView>();

  useEffect(() => {
    pdf
      .getPage(page)
      .then(result => setPdfPage(result))
      .catch((e: Error) => setError(e.message));
  }, [page, pdf]);

  useEffect(() => {
    if (pageContainerRef.current && pdfPage) {
      const currentContainer = pageContainerRef.current;
      const originalViewport = pdfPage.getViewport({ scale: 1 });
      const scale = calculateScaling(
        originalViewport.width * PDFJS.PixelsPerInch.PDF_TO_CSS_UNITS,
        containerWidth
      );
      const defaultViewport = pdfPage.getViewport({ scale });

      setPdfScale(scale);

      if (!pageViewer.current) {
        pageViewer.current = new PDFJSViewer.PDFPageView({
          container: currentContainer,
          id: page,
          scale,
          defaultViewport,
          annotationMode: 0,
          eventBus,
        });

        pageViewer.current.setPdfPage(pdfPage);
      }
    }
  }, [containerWidth, eventBus, page, pdfPage, setPdfScale]);

  useEffect(() => {
    const currentContainer = pageContainerRef.current;

    const handleIntersection: IntersectionObserverCallback = entries => {
      const [entry] = entries;
      setIsVisible(entry.isIntersecting);
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: null,
      threshold: 0.1,
    });

    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) observer.unobserve(currentContainer);
      return undefined;
    };
  }, []);

  useEffect(() => {
    if (pageViewer.current) {
      if (isVisible) {
        pageViewer.current.draw().catch(e => setError(e));
      }
      if (pageViewer.current.renderingState && !isVisible) {
        pageViewer.current.destroy();
      }
    }
  }, [isVisible]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div ref={pageContainerRef} className="pdf-page">
      {isVisible &&
        highlights?.map(highlight => {
          const scaledHightlight = {
            ...highlight,
            textSelection: adjustSelectionsToScale(highlight.textSelection, pdfScale),
          };
          return (
            <Highlight
              key={scaledHightlight.key}
              textSelection={scaledHightlight.textSelection}
              color={scaledHightlight.color}
            />
          );
        })}
    </div>
  );
};

export default PDFPage;

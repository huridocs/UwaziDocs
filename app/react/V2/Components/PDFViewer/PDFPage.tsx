/* eslint-disable max-statements */
import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
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

  useEffect(() => {
    pdf
      .getPage(page)
      .then(result => setPdfPage(result))
      .catch((e: Error) => setError(e.message));
  }, [page, pdf]);

  useEffect(() => {
    if (pageContainerRef.current && pdfPage) {
      const currentContainer = pageContainerRef.current;

      const handleIntersection: IntersectionObserverCallback = entries => {
        const [entry] = entries;
        if (!isVisible) {
          setIsVisible(entry.isIntersecting);
        }
      };

      const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: '100px',
        threshold: 0.1,
      });

      observer.observe(currentContainer);

      return () => observer.unobserve(currentContainer);
    }

    return () => {};
  });

  useEffect(() => {
    if (pageContainerRef.current && pdfPage) {
      const currentContainer = pageContainerRef.current;
      const originalViewport = pdfPage.getViewport({ scale: 1 });
      const scale = calculateScaling(
        originalViewport.width * PDFJS.PixelsPerInch.PDF_TO_CSS_UNITS,
        containerWidth
      );
      const defaultViewport = pdfPage.getViewport({ scale });

      const handlePlaceHolder = () => {
        currentContainer.style.height = `${defaultViewport.height}px`;
        currentContainer.style.width = `${defaultViewport.width}px`;
      };

      setPdfScale(scale);

      if (isVisible) {
        const pageViewer = new PDFJSViewer.PDFPageView({
          container: currentContainer,
          id: page,
          scale,
          defaultViewport,
          annotationMode: 0,
          eventBus,
        });

        pageViewer.setPdfPage(pdfPage);

        pageViewer.draw().catch((e: Error) => setError(e.message));
      }

      if (!isVisible) {
        handlePlaceHolder();
      }
    }
    // This effect is expensive and it's preferable to avoid unnecessary re-renderings
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible, containerWidth]);

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

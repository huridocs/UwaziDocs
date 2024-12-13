/* eslint-disable max-statements */
import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Highlight } from '@huridocs/react-text-selection-handler';
import { useAtom, useSetAtom } from 'jotai';
import { pdfScaleAtom } from 'V2/atoms';
import { EventBus, PDFJSViewer, PDFJS } from './pdfjs';
import { TextHighlight } from './types';
import { calculateScaling } from './functions/calculateScaling';
import { adjustSelectionsToScale } from './functions/handleTextSelection';

interface PDFPageProps {
  pdf: PDFDocumentProxy;
  page: number;
  highlights?: TextHighlight[];
  containerWidth?: number;
}

const PDFPage = ({ pdf, page, containerWidth, highlights }: PDFPageProps) => {
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
      const scale = calculateScaling(originalViewport.width, containerWidth);
      const defaultViewport = pdfPage.getViewport({ scale });

      setPdfScale(scale);

      const handlePlaceHolder = () => {
        currentContainer.style.height = `${defaultViewport.height}px`;
        currentContainer.style.width = `${defaultViewport.width}px`;
      };

      if (isVisible) {
        const pageViewer = new PDFJSViewer.PDFPageView({
          container: currentContainer,
          id: page,
          scale: scale / PDFJS.PixelsPerInch.PDF_TO_CSS_UNITS,
          defaultViewport,
          annotationMode: 0,
          eventBus: new EventBus(),
        });
        pageViewer.setPdfPage(pdfPage);
        pageViewer.draw().catch((e: Error) => setError(e.message));
      }

      if (!isVisible) {
        handlePlaceHolder();
      }
    }
  }, [isVisible, page, pdfPage, containerWidth, setPdfScale]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div ref={pageContainerRef}>
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

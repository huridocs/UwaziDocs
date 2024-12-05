/* eslint-disable max-statements */
import React, { useEffect, useRef, useState } from 'react';
import { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';
import { Highlight } from '@huridocs/react-text-selection-handler';
import { useAtom } from 'jotai';
import { pdfScaleAtom } from 'V2/atoms';
import { EventBus, PDFJSViewer } from './pdfjs';
import { TextHighlight } from './types';
import { calculateScaling } from './functions/calculateScaling';

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
  const [scale, setScale] = useAtom(pdfScaleAtom);

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
      const defaultViewport = pdfPage.getViewport({ scale: 1 });

      const handlePlaceHolder = () => {
        currentContainer.style.height = `${defaultViewport.height}px`;
      };

      const { devicePixelRatio } = window;
      const adjustedScale = calculateScaling(
        devicePixelRatio,
        defaultViewport.width,
        containerWidth
      );

      setScale(adjustedScale);

      const adjustedViewport = pdfPage.getViewport({ scale: adjustedScale });

      if (isVisible) {
        const pageViewer = new PDFJSViewer.PDFPageView({
          container: currentContainer,
          id: page,
          scale: adjustedScale,
          defaultViewport: adjustedViewport,
          annotationMode: 0,
          eventBus: new EventBus(),
        });
        pageViewer.setPdfPage(pdfPage);
        currentContainer.style.height = 'auto';
        pageViewer.draw().catch((e: Error) => setError(e.message));
      }

      if (!isVisible) {
        handlePlaceHolder();
      }
    }
  }, [isVisible, scale, page, pdfPage, setScale, containerWidth]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div ref={pageContainerRef} style={{ width: '100%' }}>
      {isVisible &&
        highlights?.map(highlight => {
          const scaledHightlight = {
            ...highlight,
            textSelection: {
              ...highlight.textSelection,
              selectionRectangles: highlight.textSelection.selectionRectangles.map(rectangle => ({
                ...rectangle,
                left: rectangle.left * scale,
                top: rectangle.top * scale,
                width: rectangle.width * scale,
                height: rectangle.height * scale,
              })),
            },
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

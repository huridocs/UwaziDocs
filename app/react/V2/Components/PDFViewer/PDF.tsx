import React, { useEffect, useRef, useState } from 'react';
import loadable from '@loadable/component';
import { SelectionRegion, HandleTextSelection } from '@huridocs/react-text-selection-handler';
import { TextSelection } from '@huridocs/react-text-selection-handler/dist/TextSelection';
import { PDFDocumentProxy } from 'pdfjs-dist';
import { Translate } from 'app/I18N';
import { PDFJS, CMAP_URL } from './pdfjs';
import { TextHighlight } from './types';

const PDFPage = loadable(async () => import(/* webpackChunkName: "LazyLoadPDFPage" */ './PDFPage'));

interface PDFProps {
  fileUrl: string;
  highlights?: { [page: string]: TextHighlight[] };
  onSelect?: (selection: TextSelection) => any;
  onDeselect?: () => any;
  scrollToPage?: string;
  size?: { height?: string; width?: string; overflow?: string };
}

const getPDFFile = async (fileUrl: string) =>
  PDFJS.getDocument({
    url: fileUrl,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
    isEvalSupported: false,
  }).promise;

const PDF = ({
  fileUrl,
  highlights,
  onSelect = () => {},
  onDeselect,
  scrollToPage,
  size,
}: PDFProps) => {
  const scrollToRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const [pdf, setPDF] = useState<PDFDocumentProxy>();
  const [error, setError] = useState<string>();

  const containerStyles = {
    height: size?.height || '100%',
    width: size?.width || '100%',
    overflow: size?.overflow || 'auto',
    paddingLeft: '10px',
    paddingRight: '10px',
  };

  useEffect(() => {
    getPDFFile(fileUrl)
      .then(pdfFile => {
        setPDF(pdfFile);
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }, [fileUrl]);

  useEffect(() => {
    let animationFrameId = 0;
    let attempts = 0;

    const triggerScroll = () => {
      if (attempts > 10) {
        return;
      }

      if (scrollToRef.current && scrollToRef.current.clientHeight > 0) {
        scrollToRef.current.scrollIntoView({ behavior: 'instant' });
        attempts = 0;
        return;
      }

      attempts += 1;
      animationFrameId = requestAnimationFrame(triggerScroll);
    };

    if (pdf && scrollToPage) {
      triggerScroll();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [scrollToPage, pdf]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <HandleTextSelection onSelect={onSelect} onDeselect={onDeselect}>
      <div id="pdf-container" ref={pdfContainerRef} style={containerStyles}>
        {pdf ? (
          Array.from({ length: pdf.numPages }, (_, index) => index + 1).map(number => {
            const regionId = number.toString();
            const pageHighlights = highlights ? highlights[regionId] : undefined;
            const shouldScrollToPage = scrollToPage === regionId;
            const containerWidth =
              pdfContainerRef.current?.offsetWidth && pdfContainerRef.current.offsetWidth - 20;

            return (
              <div
                key={`page-${regionId}`}
                className="w-fit m-auto"
                id={`page-${regionId}-container`}
                ref={shouldScrollToPage ? scrollToRef : undefined}
              >
                <SelectionRegion regionId={regionId}>
                  <PDFPage
                    pdf={pdf}
                    page={number}
                    highlights={pageHighlights}
                    containerWidth={containerWidth}
                  />
                </SelectionRegion>
              </div>
            );
          })
        ) : (
          <Translate>Loading</Translate>
        )}
      </div>
    </HandleTextSelection>
  );
};

export type { PDFProps };
export default PDF;

import React, { useEffect, useState } from 'react';
import loadable from '@loadable/component';
import { SelectionRegion, HandleTextSelection } from 'react-text-selection-handler';
import { TextSelection } from 'react-text-selection-handler/dist/TextSelection';
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
  size?: { height?: number | string; width?: number | string; overflow?: string };
}

const getPDFFile = async (fileUrl: string) =>
  PDFJS.getDocument({
    url: fileUrl,
    cMapUrl: CMAP_URL,
    cMapPacked: true,
  }).promise;

const PDF = ({
  fileUrl,
  highlights,
  onSelect = () => {},
  onDeselect,
  scrollToPage,
  size,
}: PDFProps) => {
  const [pdf, setPDF] = useState<PDFDocumentProxy>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    getPDFFile(fileUrl)
      .then(pdfFile => {
        setPDF(pdfFile);
      })
      .catch((e: Error) => {
        setError(e.message);
      });
  }, [fileUrl]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    //@ts-ignore https://github.com/huridocs/uwazi/issues/6067
    <HandleTextSelection onSelect={onSelect} onDeselect={onDeselect}>
      <div
        id="pdf-container"
        style={{
          height: `${size?.height}px` || 'auto',
          width: `${size?.width}px` || 'auto',
          overflow: size?.overflow || 'auto',
        }}
      >
        {pdf ? (
          Array.from({ length: pdf.numPages }, (_, index) => index + 1).map(number => {
            const regionId = number.toString();
            const pageHighlights = highlights ? highlights[regionId] : undefined;
            return (
              <div key={`page-${regionId}`} className="relative" id={`page-${regionId}-container`}>
                {/* @ts-ignore https://github.com/huridocs/uwazi/issues/6067 */}
                <SelectionRegion regionId={regionId}>
                  <PDFPage pdf={pdf} page={number} highlights={pageHighlights} />
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

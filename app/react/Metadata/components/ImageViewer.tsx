import { Translate } from 'app/I18N';
import React, { useState } from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageViewer = ({ alt, src, className }: ImageViewerProps) => {
  const [errorFlag, setErrorFlag] = useState(false);

  if (errorFlag) {
    return (
      <div className="media-error">
        <Translate>Error loading your image</Translate>
      </div>
    );
  }

  return <img className={className} src={src} onError={() => setErrorFlag(true)} alt={alt} />;
};

export { ImageViewer, type ImageViewerProps };

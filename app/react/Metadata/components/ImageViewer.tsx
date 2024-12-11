import { Translate } from 'app/I18N';
import React, { useState, useEffect } from 'react';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
}

const ImageViewer = ({ alt, src, className }: ImageViewerProps) => {
  const [imageExists, setImageExists] = useState<boolean | null>(null);
  const [errorFlag, setErrorFlag] = useState(false);

  useEffect(() => {
    const checkImageExists = async (url: string) => {
      try {
        const response = await fetch(url, { method: 'GET' });
        setImageExists(Boolean(response.ok));
      } catch (error) {
        setImageExists(false);
      }
    };

    // eslint-disable-next-line no-void
    void checkImageExists(src);
  }, [src]);
  if (imageExists === false) {
    return (
      <div className="media-error">
        <Translate>Image not found</Translate>
      </div>
    );
  }

  if (errorFlag) {
    return (
      <div className="media-error">
        <Translate>This file type is not supported on image fields</Translate>
      </div>
    );
  }

  if (imageExists === null) {
    return <Translate>Loading</Translate>;
  }

  return <img className={className} src={src} onError={() => setErrorFlag(true)} alt={alt} />;
};

export { ImageViewer, type ImageViewerProps };

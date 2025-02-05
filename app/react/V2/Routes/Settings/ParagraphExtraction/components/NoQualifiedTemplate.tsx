import { Translate } from 'app/I18N';
import React from 'react';

const NoQualifiedTemplatesMessage = () => (
  <div className="flex flex-col gap-2 items-center text-gray-500 text-xs uppercase">
    <p>
      <Translate>No valid target template available</Translate>
    </p>
    <p>
      (<Translate>The target template needs at least 1 rich text property</Translate>)
    </p>
  </div>
);

export { NoQualifiedTemplatesMessage };

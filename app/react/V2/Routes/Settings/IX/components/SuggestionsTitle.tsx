import React from 'react';
import { FunnelIcon } from '@heroicons/react/24/solid';
import { Translate } from 'app/I18N';
import { Pill, Button } from 'app/V2/Components/UI';
import { ClientTemplateSchema } from 'app/istore';
import {
  DatePropertyIcon,
  MarkdownPropertyIcon,
  NumericPropertyIcon,
  TextPropertyIcon,
} from 'app/V2/Components/CustomIcons';

const SuggestionsTitle = ({
  propertyName,
  templates,
  onFiltersButtonClicked,
}: {
  propertyName: string;
  templates: ClientTemplateSchema[];
  onFiltersButtonClicked: () => void;
}) => {
  const allProperties = [...(templates[0].commonProperties || []), ...templates[0].properties];
  const template = allProperties.find(prop => prop.name === propertyName);
  let propGraphics: string | React.ReactNode = '_';
  switch (template?.type) {
    case 'text':
      propGraphics = <TextPropertyIcon className="w-3" />;
      break;
    case 'date':
      propGraphics = <DatePropertyIcon className="w-3" />;
      break;
    case 'numeric':
      propGraphics = <NumericPropertyIcon className="w-3" />;
      break;
    case 'markdown':
      propGraphics = <MarkdownPropertyIcon className="w-3" />;
      break;
    default:
      propGraphics = '_';
  }
  return (
    <div className="flex">
      <div className="flex-1">
        <div className="flex space-x-2">
          <span className="flex items-center justify-center font-sans text-sm text-center text-gray-700 bg-indigo-200 rounded-full w-7 h-7">
            {propGraphics}
          </span>
          <span>{template?.label}</span>
          <span className="italic font-normal">
            <Translate>for</Translate>
          </span>
          {templates.map(templateToDisplay => (
            <Pill
              color="gray"
              className="inline-flex items-center text-xs font-medium"
              key={templateToDisplay._id}
            >
              {templateToDisplay.name}
            </Pill>
          ))}
        </div>
      </div>
      <div className="flex-none">
        <Button size="small" styling="light" onClick={onFiltersButtonClicked}>
          <FunnelIcon className="inline w-5 px-1 text-gray-800" />
          <Translate>Stats & Filters</Translate>
        </Button>
      </div>
    </div>
  );
};

export { SuggestionsTitle };

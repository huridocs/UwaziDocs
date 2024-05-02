import { ClientSettingsFilterSchema } from 'app/apiResponseTypes';
import { ClientTemplateSchema } from 'app/istore';

type LoaderData = {
  filters: ClientSettingsFilterSchema[] | undefined;
  templates: ClientTemplateSchema[];
};

const filterAvailableTemplates = (
  templates: ClientTemplateSchema[],
  filters?: ClientSettingsFilterSchema[]
) => {
  const usedTemplatesIds: string[] = [];

  filters?.forEach(filter => {
    if (filter.items) {
      filter.items.forEach(item => {
        usedTemplatesIds.push(item.id!);
      });
    }

    if (filter.id) {
      usedTemplatesIds.push(filter.id);
    }
  });

  return templates.filter(template => !usedTemplatesIds.includes(template._id));
};

const createNewFilters = (
  selectedTemplatesIds: string[],
  templates?: ClientTemplateSchema[]
): ClientSettingsFilterSchema[] => {
  const newFilters = selectedTemplatesIds.map(templateId => {
    const template = templates?.find(templ => templ._id === templateId);
    return { id: templateId, name: template?.name };
  });

  return newFilters;
};

const updateFilters = (
  newFilter: ClientSettingsFilterSchema,
  filters?: ClientSettingsFilterSchema[]
) => {
  let isNewFilter = true;

  const updatedFilters = filters?.map(filter => {
    if (filter.id === newFilter.id) {
      isNewFilter = false;
      return newFilter;
    }
    return filter;
  });

  if (isNewFilter) {
    return [...(updatedFilters || []), newFilter];
  }

  return updatedFilters;
};

const deleteFilters = (
  originalFilters?: ClientSettingsFilterSchema[],
  filtersToRemove?: (string | undefined)[]
) => {
  if (!filtersToRemove) {
    return originalFilters;
  }

  return originalFilters
    ?.map(filter => {
      if (filtersToRemove.includes(filter.id!)) {
        return {};
      }

      if (filter.items) {
        const nestedFilters = filter.items.filter(item => !filtersToRemove.includes(item.id!));
        return { ...filter, items: nestedFilters };
      }

      return { ...filter };
    })
    .filter(filter => {
      if (!filter.id) {
        return false;
      }
      if (filter.items && filter.items.length === 0) {
        return false;
      }
      return true;
    });
};

const sanitizeFilters = (filters?: ClientSettingsFilterSchema[]) => {
  const sanitizedFilters = filters?.map(filter => {
    const sanitizedFilter = { ...filter };

    if (filter.items) {
      sanitizedFilter.items = filter.items.map(
        (item: { id?: string; label?: string; _id?: string }) => {
          const sanitizedItem = { ...item };
          if (sanitizedItem._id) {
            delete sanitizedItem._id;
          }
          return sanitizedItem;
        }
      );
    }

    return sanitizedFilter;
  });

  return sanitizedFilters;
};

export type { LoaderData };
export {
  filterAvailableTemplates,
  createNewFilters,
  updateFilters,
  deleteFilters,
  sanitizeFilters,
};

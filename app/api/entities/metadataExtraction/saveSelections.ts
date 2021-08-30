import { files } from 'api/files';
import { uniqBy } from 'lodash';
import { ExtractedMetadataSchema } from 'shared/types/commonTypes';
import { EntitySchema } from 'shared/types/entityType';
import { FileType } from 'shared/types/fileType';

interface EntityWithExtractedMetadata extends EntitySchema {
  __extractedMetadata: { selections: ExtractedMetadataSchema[] };
}

const updateSelections = (
  newSelections: ExtractedMetadataSchema[],
  storedSelections: ExtractedMetadataSchema[]
) => {
  const merged = newSelections.concat(storedSelections);
  const selections = uniqBy(merged, 'name');
  return selections;
};

const prepareSelections = (entity: EntityWithExtractedMetadata, file: FileType) => {
  let selections = entity.__extractedMetadata?.selections || [];

  if (file.extractedMetadata) {
    selections = updateSelections(selections, file.extractedMetadata);
  }

  return selections;
};

const selectionsHaveChanged = (
  fileExtractedMetadata: ExtractedMetadataSchema[],
  selections: ExtractedMetadataSchema[]
) => {
  if (fileExtractedMetadata.length === selections.length) {
    const hasChanges = fileExtractedMetadata.filter(
      (extractedData, index) => extractedData.selection?.text !== selections[index].selection?.text
    );
    return hasChanges.length > 0;
  }
  return true;
};

const saveSelections = async (entity: EntityWithExtractedMetadata) => {
  const mainDocument = await files.get({
    entity: entity.sharedId,
    type: 'document',
  });

  if (mainDocument.length > 0) {
    const selections = prepareSelections(entity, mainDocument[0]);
    if (selectionsHaveChanged(mainDocument[0].extractedMetadata || [], selections)) {
      const finalizedSelections = selections.map(selection => ({
        language: entity.language,
        ...selection,
      }));
      return files.save({ _id: mainDocument[0]._id, extractedMetadata: finalizedSelections });
    }
  }

  return null;
};

export { saveSelections };

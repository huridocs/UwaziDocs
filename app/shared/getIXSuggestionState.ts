import { isSameDate } from 'shared/isSameDate';
import { PropertySchema } from 'shared/types/commonTypes';
import { IXSuggestionStateType } from './types/suggestionType';
import { setsEqual } from './data_utils/setUtils';
import {
  propertyIsMultiselect,
  propertyIsSelect,
  propertyIsSelectOrMultiSelect,
} from './propertyTypes';

type CurrentValue = string | number | null;

interface SuggestionValues {
  currentValue: CurrentValue | CurrentValue[];
  labeledValue: string | null;
  suggestedValue: string | null;
  modelCreationDate: number;
  error: string;
  date: number;
  segment: string | null;
  state: string | null;
  status: string | null;
}

const sameValueSet = (first: any, second: any) => setsEqual(first || [], second || []);

const EQUALITIES: Record<string, (first: any, second: any) => boolean> = {
  date: isSameDate,
  multiselect: sameValueSet,
};

const equalsForType = (type: PropertySchema['type']) => (first: any, second: any) =>
  EQUALITIES[type] ? EQUALITIES[type](first, second) : first === second;

class IXSuggestionState implements IXSuggestionStateType {
  labeled = false;

  withValue = false;

  withSuggestion = false;

  match = false;

  hasContext = false;

  obsolete = false;

  processing = false;

  error = false;

  constructor(values: SuggestionValues, propertyType: PropertySchema['type']) {
    this.setLabeled(values, propertyType);
    this.setWithValue(values, propertyType);
    this.setWithSuggestion(values);
    this.setMatch(values, propertyType);
    this.setHasContext(values, propertyType);
    this.setObsolete(values);
    this.setProcessing(values);
    this.setError(values);
  }

  setLabeled(
    { labeledValue, currentValue }: SuggestionValues,
    propertyType: PropertySchema['type']
  ) {
    if (
      labeledValue ||
      (propertyIsSelect(propertyType) && currentValue) ||
      (propertyIsMultiselect(propertyType) &&
        Array.isArray(currentValue) &&
        currentValue.length > 0)
    ) {
      this.labeled = true;
    }
  }

  setWithValue({ currentValue }: SuggestionValues, propertyType: PropertySchema['type']) {
    if (propertyIsMultiselect(propertyType) && Array.isArray(currentValue)) {
      this.withValue = currentValue?.length > 0;
    } else if (currentValue) {
      this.withValue = true;
    }
  }

  setWithSuggestion({ suggestedValue }: SuggestionValues) {
    if (suggestedValue) {
      this.withSuggestion = true;
    }
  }

  setMatch(
    { suggestedValue, currentValue }: SuggestionValues,
    propertyType: PropertySchema['type']
  ) {
    const equals = equalsForType(propertyType);

    if (suggestedValue === '') {
      this.withSuggestion = false;
    } else if (equals(suggestedValue, currentValue)) {
      this.match = true;
    }
  }

  setHasContext({ segment }: SuggestionValues, propertyType: PropertySchema['type']) {
    if (segment || propertyIsSelectOrMultiSelect(propertyType)) {
      this.hasContext = true;
    }
  }

  setObsolete({ modelCreationDate, date }: SuggestionValues) {
    if (date < modelCreationDate) {
      this.obsolete = true;
    }
  }

  setProcessing({ status }: SuggestionValues) {
    if (status === 'processing') {
      this.processing = true;
    }
  }

  setError({ error, status }: SuggestionValues) {
    if ((error && error !== '') || (status && status === 'failed')) {
      this.error = true;
    }
  }
}

const getSuggestionState = (
  values: SuggestionValues,
  propertyType: PropertySchema['type']
): IXSuggestionStateType => {
  const state = new IXSuggestionState(values, propertyType);

  return state;
};

export { getSuggestionState };
export type { CurrentValue, SuggestionValues };

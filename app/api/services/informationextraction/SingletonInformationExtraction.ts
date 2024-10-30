import { InformationExtraction } from './InformationExtraction';

let informationExtraction: InformationExtraction;

export const getSingletonInformationExtraction = () => {
  if (!informationExtraction) {
    informationExtraction = new InformationExtraction();
  }

  return informationExtraction;
};

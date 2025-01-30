import { z } from 'zod';

import { UseCase } from 'api/common.v2/contracts/UseCase';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';

import { PXExtractor } from '../domain/PXExtractor';
import { PXExtractorsDataSource } from '../domain/PXExtractorDataSource';
import { SourceTemplateNotFoundError } from '../domain/SourceTemplateNotFoundError';
import { TargetTemplateNotFoundError } from '../domain/TargetTemplateNotFoundError';
import { IdGenerator } from 'api/common.v2/contracts/IdGenerator';

type Input = z.infer<typeof InputSchema>;
type Output = PXExtractor;

type Dependencies = {
  templatesDS: TemplatesDataSource;
  extractorDS: PXExtractorsDataSource;
  idGenerator: IdGenerator;
};

const InputSchema = z.object({
  targetTemplateId: z.string({ message: 'You should provide a target template' }),
  sourceTemplateId: z.string({ message: 'You should provide a source template' }),
});

export class PXCreateExtractor implements UseCase<Input, Output> {
  constructor(private dependencies: Dependencies) {}

  async execute(input: Input): Promise<Output> {
    const [targetTemplate, sourceTemplate] = await Promise.all([
      this.dependencies.templatesDS.getById(input.targetTemplateId),
      this.dependencies.templatesDS.getById(input.sourceTemplateId),
    ]);

    if (!targetTemplate) {
      throw new TargetTemplateNotFoundError(input.targetTemplateId);
    }

    if (!sourceTemplate) {
      throw new SourceTemplateNotFoundError(input.sourceTemplateId);
    }

    const extractor = new PXExtractor({
      id: this.dependencies.idGenerator.generate(),
      targetTemplate,
      sourceTemplate,
    });

    await this.dependencies.extractorDS.create(extractor);

    return extractor;
  }
}

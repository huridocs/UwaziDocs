import { z } from 'zod';
import { UseCase } from 'api/common.v2/contracts/UseCase';
import { Extractor, ExtractorStatus } from 'api/paragraphExtraction/domain/Extractor';
import { ExtractorDataSource } from 'api/paragraphExtraction/domain/ExtractorDataSource';
import { TemplatesDataSource } from 'api/templates.v2/contracts/TemplatesDataSource';

type Input = z.infer<typeof InputSchema>;
type Output = Extractor;

type Dependencies = {
  templatesDS: TemplatesDataSource;
  extractorDS: ExtractorDataSource;
};

const InputSchema = z.object({
  targetTemplateId: z.string({ message: 'You should provide a target template' }),
  sourceTemplateId: z.string({ message: 'You should provide a source template' }),
});

export class CreateExtractorUseCase implements UseCase<Input, Output> {
  // eslint-disable-next-line no-useless-constructor, no-empty-function
  constructor(private dependencies: Dependencies) {} // Eslint rules are disabled to take advantage of properties shorthand declaration

  async execute(input: Input): Promise<Output> {
    InputSchema.parse(input);

    const [targetTemplate, sourceTemplate] = await Promise.all([
      this.dependencies.templatesDS.getById(input.targetTemplateId),
      this.dependencies.templatesDS.getById(input.sourceTemplateId),
    ]);

    if (!targetTemplate) {
      throw new Error(`Target template with id ${input.targetTemplateId} was not found`);
    }

    if (!sourceTemplate) {
      throw new Error(`Source template with id ${input.targetTemplateId} was not found`);
    }

    const extractor = new Extractor({
      id: this.dependencies.extractorDS.nextId(),
      targetTemplate,
      sourceTemplate,
      status: ExtractorStatus.Idle,
    });

    await this.dependencies.extractorDS.create(extractor);

    return extractor;
  }
}

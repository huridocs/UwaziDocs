import { DBFixture } from 'api/utils/testing_db';
import { getFixturesFactory } from 'api/utils/fixturesFactory';

const factory = getFixturesFactory();

const fixturesPdfNameA = 'documentA.pdf';
const fixturesPdfNameB = 'documentB.pdf';
const fixturesPdfNameC = 'documentC.pdf';
const fixturesPdfNameD = 'documentD.pdf';
const fixturesPdfNameE = 'documentE.pdf';
const fixturesPdfNameF = 'documentF.pdf';
const fixturesPdfNameG = 'documentG.pdf';
const fixturesPdfNameH = 'documentH.pdf';
const fixturesPdfNameI = 'documentI.pdf';
const ficturesPdfNameJ = 'documentJ.pdf';
const fixturesPdfNameK = 'documentK.pdf';
const fixturesPdfNameL = 'documentL.pdf';
const fixturesPdfNameM = 'documentM.pdf';
const pdfWithouTSegmentations = 'documentWithoutSegmentations.pdf';

const fixtures: DBFixture = {
  settings: [
    {
      languages: [{ default: true, label: 'English', key: 'en' }],
      features: {
        'metadata-extraction': true,
        metadataExtraction: {
          url: 'http://localhost:1234/',
        },
        segmentation: {
          url: 'http://localhost:1234/files',
        },
      },
    },
  ],
  ixextractors: [
    factory.ixExtractor('prop1extractor', 'property1', [
      'templateToSegmentA',
      'templateToSegmentB',
    ]),
    factory.ixExtractor('prop2extractor', 'property2', ['templateToSegmentA']),
    factory.ixExtractor('prop3extractor', 'property3', ['templateToSegmentA']),
    factory.ixExtractor('extractorWithOneFailedSegmentation', 'property15', ['templateToSegmentC']),
    factory.ixExtractor('extractorWithSelect', 'property_select', ['templateToSegmentD']),
    factory.ixExtractor('extractorWithMultiselect', 'property_multiselect', ['templateToSegmentD']),
    factory.ixExtractor('extractorWithMultiselectWithoutTrainingData', 'property_multiselect', [
      'templateToSegmentE',
    ]),
    factory.ixExtractor('extractorWithRelationship', 'property_relationship', [
      'templateToSegmentF',
    ]),
    factory.ixExtractor('extractorWithEmptyRelationship', 'property_empty_relationship', [
      'templateToSegmentF',
    ]),
    factory.ixExtractor('extractorWithRelationshipToAny', 'property_relationship_to_any', [
      'templateToSegmentF',
    ]),
    factory.ixExtractor('extractorWithoutSegmentations', 'title', ['templateWithoutSegmentations']),
    factory.ixExtractor('selectExtractorWithoutSegmentations', 'property_select', [
      'templateWithoutSegmentations',
    ]),
  ],
  entities: [
    factory.entity('P1', 'relationshipPartnerTemplate', {}, { sharedId: 'P1sharedId' }),
    factory.entity('P2', 'relationshipPartnerTemplate', {}, { sharedId: 'P2sharedId' }),
    factory.entity('P3', 'relationshipPartnerTemplate', {}, { sharedId: 'P3sharedId' }),
    factory.entity(
      'A1',
      'templateToSegmentA',
      {
        property1: [
          {
            value: 1088985600,
          },
        ],
      },
      { language: 'other' }
    ),
    factory.entity('A1', 'templateToSegmentA', {
      property1: [
        {
          value: 'different from selected text',
        },
      ],
      property2: [
        {
          value: 1299196800,
        },
      ],
    }),
    factory.entity('A2', 'templateToSegmentA'),
    factory.entity('A3', 'templateToSegmentA', { property2: [{ value: 1 }] }),
    factory.entity('A4', 'templateToSegmentA'),
    factory.entity('A5', 'templateToSegmentA', { property1: [{ value: 1 }] }),
    factory.entity('A6', 'templateToSegmentA'),
    factory.entity('A7', 'templateToSegmentA'),
    factory.entity('A8', 'templateToSegmentA'),
    factory.entity('A9', 'templateToSegmentA'),
    factory.entity('A10', 'templateToSegmentA'),
    factory.entity('A11', 'templateToSegmentA'),
    factory.entity('A12', 'templateToSegmentA'),
    factory.entity('A13', 'templateToSegmentA'),
    factory.entity('A14', 'templateToSegmentA'),
    factory.entity('A15', 'templateToSegmentC'),
    factory.entity('A16', 'templateToSegmentC'),
    factory.entity('A17', 'templateToSegmentD', {
      property_select: [{ value: 'A', label: 'A' }],
      property_multiselect: [{ value: 'A', label: 'A' }],
    }),
    factory.entity('A18', 'templateToSegmentD', {
      property_select: [{ value: 'B', label: 'B' }],
      property_multiselect: [
        { value: 'B', label: 'B' },
        { value: 'C', label: 'C' },
      ],
    }),
    factory.entity('A19', 'templateToSegmentD', {
      property_select: [],
      property_multiselect: [],
    }),
    factory.entity('A20', 'templateToSegmentE', {
      property_multiselect: [],
    }),
    factory.entity('A21', 'templateToSegmentF', {
      property_relationship: [{ value: 'P1sharedId', label: 'P1' }],
      property_empty_relationship: [],
      property_relationship_to_any: [{ value: 'P1sharedId', label: 'P1' }],
    }),
    factory.entity('A22', 'templateToSegmentF', {
      property_relationship: [
        { value: 'P1sharedId', label: 'P1' },
        { value: 'P3sharedId', label: 'P3' },
      ],
      property_empty_relationship: [],
      property_relationship_to_any: [
        { value: 'P1', label: 'P1' },
        { value: 'A1', label: 'A1' },
      ],
    }),
    factory.entity('A23', 'templateToSegmentF', {
      property_relationship: [],
      property_empty_relationship: [],
      property_relationship_to_any: [],
    }),
    factory.entity('entityWithoutSegmentation', 'templateWithoutSegmentations', {
      property_select: [{ value: 'B', label: 'B' }],
    }),
  ],
  files: [
    factory.fileDeprecated('F1', 'A1', 'document', fixturesPdfNameA, 'other', '', [
      {
        name: 'property1',
        selection: {
          text: 'something not in the entity',
          selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
        },
      },
      {
        name: 'property2',
        selection: {
          text: 'Fri Mar 04 2011',
          selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
        },
      },
    ]),
    factory.fileDeprecated('F2', 'A2', 'document', fixturesPdfNameB, 'eng', '', [
      {
        name: 'text',
        selection: {
          text: 'property1',
          selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
        },
      },
    ]),
    factory.fileDeprecated('F3', 'A3', 'document', fixturesPdfNameC, 'eng', '', [
      {
        name: 'property1',
        selection: {
          text: 'something',
          selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
        },
      },
    ]),
    factory.fileDeprecated('F4', 'A1', 'document', fixturesPdfNameD, 'eng', '', [
      {
        name: 'property2',
        selection: {
          text: 'something',
          selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
        },
      },
    ]),
    factory.fileDeprecated('F5', 'A5', 'document', fixturesPdfNameE, 'spa'),
    factory.fileDeprecated('F6', 'A6', 'document', fixturesPdfNameF, 'eng'),
    factory.fileDeprecated('F15', 'A15', 'document', fixturesPdfNameA, 'eng'),
    factory.fileDeprecated('F16', 'A16', 'document', fixturesPdfNameC, 'eng'),
    factory.fileDeprecated('F17', 'A17', 'document', fixturesPdfNameG, 'eng'),
    factory.fileDeprecated('F18', 'A18', 'document', fixturesPdfNameH, 'eng'),
    factory.fileDeprecated('F19', 'A19', 'document', fixturesPdfNameI, 'eng'),
    factory.fileDeprecated('F20', 'A20', 'document', ficturesPdfNameJ, 'eng'),
    factory.fileDeprecated('F21', 'A21', 'document', fixturesPdfNameK, 'eng'),
    factory.fileDeprecated('F22', 'A22', 'document', fixturesPdfNameL, 'eng'),
    factory.fileDeprecated('F23', 'A23', 'document', fixturesPdfNameM, 'eng'),
    factory.document('FileWithoutSegmentations', {
      language: 'eng',
      filename: pdfWithouTSegmentations,
      entity: 'entityWithoutSegmentation',
      extractedMetadata: [
        {
          name: 'title',
          selection: {
            text: 'something',
            selectionRectangles: [{ top: 0, left: 0, width: 0, height: 0, page: '1' }],
          },
        },
      ],
    }),
  ],
  segmentations: [
    {
      _id: factory.id('S1'),
      filename: fixturesPdfNameA,
      xmlname: 'documentA.xml',
      fileID: factory.id('F1'),
      status: 'ready',
      segmentation: {
        page_height: 841,
        page_width: 595,
        paragraphs: [
          {
            left: 58,
            top: 63,
            width: 457,
            height: 15,
            page_number: 1,
            text: 'something',
          },
        ],
      },
    },
    {
      _id: factory.id('S2'),
      filename: fixturesPdfNameB,
      xmlname: 'documentB.xml',
      fileID: factory.id('F2'),
      status: 'ready',
      segmentation: { page_height: 1, page_width: 2, paragraphs: [] },
    },
    {
      _id: factory.id('S3'),
      filename: fixturesPdfNameC,
      xmlname: 'documentC.xml',
      fileID: factory.id('F3'),
      status: 'ready',
      segmentation: { page_height: 1, page_width: 2, paragraphs: [] },
    },
    {
      _id: factory.id('S4'),
      filename: fixturesPdfNameD,
      xmlname: 'documentD.xml',
      fileID: factory.id('F4'),
      status: 'ready',
      segmentation: { page_height: 1, page_width: 2, paragraphs: [] },
    },
    {
      _id: factory.id('S5'),
      filename: fixturesPdfNameE,
      xmlname: 'documentE.xml',
      fileID: factory.id('F5'),
      status: 'ready',
      segmentation: { page_height: 1, page_width: 2, paragraphs: [] },
    },
    {
      _id: factory.id('S6'),
      filename: fixturesPdfNameF,
      xmlname: 'documentF.xml',
      fileID: factory.id('F6'),
      status: 'processing',
    },
    {
      _id: factory.id('S7'),
      filename: fixturesPdfNameG,
      xmlname: 'documentG.xml',
      fileID: factory.id('F17'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'A',
          },
        ],
      },
    },
    {
      _id: factory.id('S8'),
      filename: fixturesPdfNameH,
      xmlname: 'documentH.xml',
      fileID: factory.id('F18'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'B',
          },
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'C',
          },
        ],
      },
    },
    {
      _id: factory.id('S9'),
      filename: fixturesPdfNameI,
      xmlname: 'documentI.xml',
      fileID: factory.id('F19'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [],
      },
    },
    {
      _id: factory.id('S10'),
      filename: ficturesPdfNameJ,
      xmlname: 'documentJ.xml',
      fileID: factory.id('F20'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [],
      },
    },
    {
      _id: factory.id('S11'),
      filename: fixturesPdfNameK,
      xmlname: 'documentK.xml',
      fileID: factory.id('F21'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'P1',
          },
        ],
      },
    },
    {
      _id: factory.id('S12'),
      filename: fixturesPdfNameL,
      xmlname: 'documentL.xml',
      fileID: factory.id('F22'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'P1',
          },
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'P2',
          },
        ],
      },
    },
    {
      _id: factory.id('S13'),
      filename: fixturesPdfNameM,
      xmlname: 'documentM.xml',
      fileID: factory.id('F23'),
      status: 'ready',
      segmentation: {
        page_height: 13,
        page_width: 13,
        paragraphs: [
          {
            left: 1,
            top: 1,
            width: 1,
            height: 1,
            page_number: 1,
            text: 'P3',
          },
        ],
      },
    },
  ],
  ixsuggestions: [
    {
      fileId: factory.id('F1'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      propertyName: 'property1',
      extractorId: factory.id('prop1extractor'),
      suggestedValue: 'suggestion_text_1',
      segment: 'segment_text_1',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      fileId: factory.id('F3'),
      entityId: 'A3',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      propertyName: 'property1',
      extractorId: factory.id('prop1extractor'),
      suggestedValue: 'suggestion_text_3',
      segment: 'segment_text_3',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      fileId: factory.id('F4'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      extractorId: factory.id('prop2extractor'),
      propertyName: 'property2',
      suggestedValue: 'suggestion_text_1',
      segment: 'segment_text_1',
      status: 'processing',
      page: 1,
      date: 100,
    },
    {
      fileId: factory.id('F4'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      extractorId: factory.id('prop2extractor'),
      propertyName: 'property2',
      suggestedValue: 'suggestion_text_1',
      segment: 'segment_text_1',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      fileId: factory.id('F4'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      extractorId: factory.id('prop2extractor'),
      propertyName: 'property2',
      suggestedValue: 'suggestion_text_property2_1',
      segment: 'segment_text_property2_1',
      status: 'ready',
      page: 1,
      date: 220,
    },
    {
      fileId: factory.id('F4'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      extractorId: factory.id('prop2extractor'),
      propertyName: 'property2',
      suggestedValue: 'suggestion_text_property2_2',
      segment: 'segment_text_property2_2',
      status: 'ready',
      page: 1,
      date: 190,
    },
    {
      fileId: factory.id('F4'),
      entityId: 'A1',
      entityTemplate: factory.id('templateToSegmentA').toString(),
      language: 'en',
      extractorId: factory.id('prop2extractor'),
      propertyName: 'property2',
      suggestedValue: 'suggestion_text_property2_3',
      segment: 'segment_text_property2_3',
      status: 'ready',
      page: 1,
      date: 220,
    },
    {
      fileId: factory.id('F15'),
      entityId: 'A15',
      entityTemplate: factory.id('templateToSegmentC').toString(),
      language: 'en',
      extractorId: factory.id('extractorWithOneFailedSegmentation'),
      propertyName: 'property15',
      suggestedValue: '',
      segment: '',
      status: 'ready',
      state: {
        labeled: false,
        withValue: false,
        withSuggestion: false,
        match: false,
        hasContext: false,
        obsolete: true,
        processing: false,
        error: false,
      },
      date: 100,
    },
    {
      fileId: factory.id('F16'),
      entityId: 'A16',
      entityTemplate: factory.id('templateToSegmentC').toString(),
      language: 'en',
      extractorId: factory.id('extractorWithOneFailedSegmentation'),
      propertyName: 'property15',
      suggestedValue: '',
      segment: '',
      status: 'ready',
      state: {
        labeled: false,
        withValue: false,
        withSuggestion: false,
        match: false,
        hasContext: false,
        obsolete: true,
        processing: false,
        error: true,
      },
      date: 100,
    },
    {
      _id: factory.id('SUG17'),
      fileId: factory.id('F17'),
      entityId: 'A17',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_multiselect',
      extractorId: factory.id('extractorWithMultiselect'),
      suggestedValue: ['A'],
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG18'),
      fileId: factory.id('F18'),
      entityId: 'A18',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_multiselect',
      extractorId: factory.id('extractorWithMultiselect'),
      suggestedValue: ['B', 'C'],
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG19'),
      fileId: factory.id('F19'),
      entityId: 'A19',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_multiselect',
      extractorId: factory.id('extractorWithMultiselect'),
      suggestedValue: [],
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG17B'),
      fileId: factory.id('F17'),
      entityId: 'A17',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_select',
      extractorId: factory.id('extractorWithSelect'),
      suggestedValue: 'A',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG18B'),
      fileId: factory.id('F18'),
      entityId: 'A18',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_select',
      extractorId: factory.id('extractorWithSelect'),
      suggestedValue: 'B',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG19B'),
      fileId: factory.id('F19'),
      entityId: 'A19',
      entityTemplate: factory.id('templateToSegmentD').toString(),
      language: 'en',
      propertyName: 'property_select',
      extractorId: factory.id('extractorWithSelect'),
      suggestedValue: '',
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG21'),
      fileId: factory.id('F21'),
      entityId: 'A21',
      entityTemplate: factory.idString('templateToSegmentF'),
      language: 'en',
      propertyName: 'property_relationship',
      extractorId: factory.id('extractorWithRelationship'),
      suggestedValue: ['P1'],
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG22'),
      fileId: factory.id('F22'),
      entityId: 'A22',
      entityTemplate: factory.idString('templateToSegmentF'),
      language: 'en',
      propertyName: 'property_relationship',
      extractorId: factory.id('extractorWithRelationship'),
      suggestedValue: ['P1', 'P2'],
      status: 'ready',
      page: 1,
      date: 100,
    },
    {
      _id: factory.id('SUG23'),
      fileId: factory.id('F23'),
      entityId: 'A23',
      entityTemplate: factory.idString('templateToSegmentF'),
      language: 'en',
      propertyName: 'property_relationship',
      extractorId: factory.id('extractorWithRelationship'),
      suggestedValue: [],
      status: 'ready',
      page: 1,
      date: 100,
    },
  ],
  ixmodels: [
    {
      extractorId: factory.id('prop1extractor'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('prop4extractor'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithOneFailedSegmentation'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('prop2extractor'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('prop3extractor'),
      creationDate: 200,
      status: 'processing',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithSelect'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithMultiselect'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithMultiselectWithoutTrainingData'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: false,
    },
    {
      extractorId: factory.id('extractorWithRelationship'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithEmptyRelationship'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
    {
      extractorId: factory.id('extractorWithRelationshipToAny'),
      creationDate: 200,
      status: 'ready',
      findingSuggestions: true,
    },
  ],
  relationtypes: [
    factory.relationType('related'),
    factory.relationType('emptyRelated'),
    factory.relationType('relatedToAny'),
  ],
  templates: [
    factory.template('relationshipPartnerTemplate'),
    factory.template('templateToSegmentA', [
      factory.property('property1', 'text'),
      factory.property('property2', 'date'),
      factory.property('property3', 'numeric'),
    ]),
    factory.template('templateToSegmentB', [factory.property('property1', 'text')]),
    factory.template('templateToSegmentC', [factory.property('property15', 'text')]),
    factory.template('templateToSegmentD', [
      factory.property('property_select', 'select', {
        content: factory.id('thesauri1').toString(),
      }),
      factory.property('property_multiselect', 'multiselect', {
        content: factory.id('thesauri1').toString(),
      }),
    ]),
    factory.template('templateToSegmentE', [
      factory.property('property_multiselect', 'multiselect', {
        content: factory.id('thesauri1').toString(),
      }),
    ]),
    factory.template('templateToSegmentF', [
      factory.property('property_relationship', 'relationship', {
        content: factory.idString('relationshipPartnerTemplate'),
        relationType: factory.idString('related'),
      }),
      factory.property('property_empty_relationship', 'relationship', {
        content: factory.idString('relationshipPartnerTemplate'),
        relationType: factory.idString('emptyRelated'),
      }),
      factory.property('property_relationship_to_any', 'relationship', {
        content: '',
        relationType: factory.idString('relatedToAny'),
      }),
    ]),
    factory.template('templateWithoutSegmentations', [
      factory.property('property_select', 'select', {
        content: factory.id('thesauri1').toString(),
      }),
    ]),
  ],
  dictionaries: [factory.nestedThesauri('thesauri1', ['A', 'B', 'C', { 1: ['1A', '1B'] }])],
};

export { fixtures, factory };

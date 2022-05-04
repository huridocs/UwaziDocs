/* eslint-disable max-lines */
import Immutable from 'immutable';
import { EntitySchema } from 'shared/types/entityType';
import { IImmutable } from 'shared/types/Immutable';
import { TemplateSchema } from 'shared/types/templateType';

const dbTemplate: IImmutable<TemplateSchema> = Immutable.fromJS({
  _id: '5bfbb1a0471dd0fc16ada146',
  name: 'Document',
  commonProperties: [
    {
      _id: '5bfbb1a0471dd0fc16ada148',
      label: 'Title',
      name: 'title',
      isCommonProperty: true,
      type: 'text',
      prioritySorting: false,
    },
    {
      _id: '5bfbb1a0471dd0fc16ada147',
      label: 'Date added',
      name: 'creationDate',
      isCommonProperty: true,
      type: 'date',
      prioritySorting: false,
    },
  ],
  properties: [
    {
      _id: '6267e68226904c252518f914',
      label: 'Text',
      type: 'text',
      name: 'text',
      filter: true,
    },
    {
      _id: '6267e68226904c252518f915',
      label: 'Numeric',
      type: 'numeric',
      name: 'numeric',
      filter: true,
    },
    {
      _id: '62693f2b3483cd0da78b6ffb',
      label: 'Select',
      type: 'select',
      content: '626825379c8a75a1ea9a821e',
      name: 'select',
      filter: true,
    },
    {
      _id: '627176d9ff128cfd6de09972',
      label: 'Multi Select',
      type: 'multiselect',
      content: '626825379c8a75a1ea9a821e',
      name: 'multi_select',
    },
    {
      _id: '626c191b8a46c11701b499b3',
      label: 'Relationship',
      type: 'relationship',
      content: '6272dc3e4c077e92cc2b72ed',
      relationType: '626c19088a46c11701b493e6',
      name: 'relationship',
    },
    {
      _id: '626c19418a46c11701b4a390',
      label: 'Inherit',
      type: 'relationship',
      content: '626c19238a46c11701b49a55',
      relationType: '626c19088a46c11701b493e6',
      name: 'inherit',
      inherit: {
        property: '626c19498a46c11701b4a702',
        type: 'date',
      },
    },
    {
      _id: '627176d9ff128cfd6de09975',
      label: 'Date',
      type: 'date',
      name: 'date',
    },
    {
      _id: '627176d9ff128cfd6de09976',
      label: 'Date Range',
      type: 'daterange',
      name: 'date_range',
    },
    {
      _id: '627176d9ff128cfd6de09977',
      label: 'Multi Date',
      type: 'multidate',
      name: 'multi_date',
    },
    {
      _id: '627176d9ff128cfd6de09978',
      label: 'Multi Date Range',
      type: 'multidaterange',
      name: 'multi_date_range',
    },
    {
      _id: '627176d9ff128cfd6de09979',
      label: 'Rich Text',
      type: 'markdown',
      name: 'rich_text',
    },
    {
      _id: '627176d9ff128cfd6de0997a',
      label: 'Link',
      type: 'link',
      name: 'link',
    },
    {
      _id: '627176d9ff128cfd6de0997b',
      label: 'Image',
      type: 'image',
      name: 'image',
    },
    {
      _id: '627176d9ff128cfd6de0997c',
      label: 'Media',
      type: 'media',
      name: 'media',
    },
    {
      _id: '627176d9ff128cfd6de0997d',
      label: 'Geolocation',
      type: 'geolocation',
      name: 'geolocation_geolocation',
    },
  ],
  __v: 0,
  default: true,
  color: '#e46841',
  entityViewPage: '8x8b1bzsj1i',
});

const dbEntity: EntitySchema = {
  _id: '6267e69026904c252518f946',
  metadata: {
    text: [
      {
        value: 'one',
      },
    ],
    numeric: [
      {
        value: 1,
      },
    ],
    select: [
      {
        value: 'f5t0ah6aluq',
        label: 'Argentina',
      },
    ],
    multi_select: [
      {
        value: 'k9vqx1bkkso',
        label: 'Colombia',
      },
      {
        value: 'f5t0ah6aluq',
        label: 'Argentina',
      },
    ],
    inherit: [
      {
        value: 'zse9gkdu27',
        label: 'Test 5',
        icon: null,
        type: 'entity',
        inheritedValue: [
          {
            value: 1650412800,
          },
        ],
        inheritedType: 'date',
      },
    ],
    date: [
      {
        value: 1651536000,
      },
    ],
    date_range: [
      {
        value: {
          from: 1651536000,
          to: 1651708799,
        },
      },
    ],
    multi_date: [
      {
        value: 1651622400,
      },
      {
        value: 1651708800,
      },
    ],
    multi_date_range: [
      {
        value: {
          from: 1651968000,
          to: 1652486399,
        },
      },
      {
        value: {
          from: 1652572800,
          to: 1653091199,
        },
      },
    ],
    rich_text: [
      {
        value: 'Test 1 long text',
      },
    ],
    link: [
      {
        value: {
          label: 'test',
          url: 'https://google.com',
        },
      },
    ],
    image: [
      {
        value: '/api/files/1651603234992smwovxz1mq.jpeg',
      },
    ],
    media: [
      {
        value: '/api/files/1651603234992ndu8pskupzp.mp4',
      },
    ],
    geolocation_geolocation: [
      {
        value: {
          lat: 46.660244945286394,
          lon: 8.283691406250002,
          label: '',
        },
      },
    ],
    relationship: [
      {
        value: 'e9oxs8zgyc9',
        label: 'Test 6',
        icon: null,
        type: 'entity',
      },
    ],
  },
  template: '5bfbb1a0471dd0fc16ada146',
  title: 'Test 1',
  user: '58ada34d299e82674854510f',
  creationDate: 1650976400574,
  published: true,
  editDate: 1651694706834,
  language: 'en',
  sharedId: 'mtpkxxe1uom',
  permissions: [
    {
      refId: '58ada34d299e82674854510f',
      type: 'user',
      level: 'write',
    },
  ],
  __v: 0,
  documents: [],
  attachments: [
    {
      _id: '62717723ff128cfd6de09ab5',
      originalname: 'mars.jpeg',
      mimetype: 'image/jpeg',
      size: 3405,
      filename: '1651603234992smwovxz1mq.jpeg',
      entity: 'mtpkxxe1uom',
      type: 'attachment',
      creationDate: 1651603235065,
    },
    {
      _id: '62717723ff128cfd6de09ab7',
      originalname: 'sample video.mp4',
      mimetype: 'video/mp4',
      size: 1570024,
      filename: '1651603234992ndu8pskupzp.mp4',
      entity: 'mtpkxxe1uom',
      type: 'attachment',
      creationDate: 1651603235066,
    },
  ],
  relations: [
    {
      template: '626c19088a46c11701b493e6',
      entityData: {
        _id: '626c195b8a46c11701b4aaaf',
        metadata: {
          date: [
            {
              value: 1650412800,
            },
          ],
          relationship_2: [
            {
              value: 'l8rnfv6qss',
              label: 'Test 4',
              icon: null,
              type: 'entity',
            },
          ],
        },
        template: '626c19238a46c11701b49a55',
        title: 'Test 5',
        creationDate: 1651251547653,
        published: true,
        sharedId: 'zse9gkdu27',
        documents: [],
        attachments: [],
      },
      _id: '626c19658a46c11701b4aafb',
      entity: 'zse9gkdu27',
      hub: '626c19658a46c11701b4aaf5',
    },
    {
      template: null,
      entityData: {
        _id: '6267e69026904c252518f946',
        metadata: {
          text: [
            {
              value: 'one',
            },
          ],
          numeric: [
            {
              value: 1,
            },
          ],
          select: [
            {
              value: 'f5t0ah6aluq',
              label: 'Argentina',
            },
          ],
          multi_select: [
            {
              value: 'k9vqx1bkkso',
              label: 'Colombia',
            },
            {
              value: 'f5t0ah6aluq',
              label: 'Argentina',
            },
          ],
          inherit: [
            {
              value: 'zse9gkdu27',
              label: 'Test 5',
              icon: null,
              type: 'entity',
              inheritedValue: [
                {
                  value: 1650412800,
                },
              ],
              inheritedType: 'date',
            },
          ],
          date: [
            {
              value: 1651536000,
            },
          ],
          date_range: [
            {
              value: {
                from: 1651536000,
                to: 1651708799,
              },
            },
          ],
          multi_date: [
            {
              value: 1651622400,
            },
            {
              value: 1651708800,
            },
          ],
          multi_date_range: [
            {
              value: {
                from: 1651968000,
                to: 1652486399,
              },
            },
            {
              value: {
                from: 1652572800,
                to: 1653091199,
              },
            },
          ],
          rich_text: [
            {
              value: 'Test 1 long text',
            },
          ],
          link: [
            {
              value: {
                label: 'test',
                url: 'https://google.com',
              },
            },
          ],
          image: [
            {
              value: '/api/files/1651603234992smwovxz1mq.jpeg',
            },
          ],
          media: [
            {
              value: '/api/files/1651603234992ndu8pskupzp.mp4',
            },
          ],
          geolocation_geolocation: [
            {
              value: {
                lat: 46.660244945286394,
                lon: 8.283691406250002,
                label: '',
              },
            },
          ],
          relationship: [
            {
              value: 'e9oxs8zgyc9',
              label: 'Test 6',
              icon: null,
              type: 'entity',
            },
          ],
        },
        template: '5bfbb1a0471dd0fc16ada146',
        title: 'Test 1',
        creationDate: 1650976400574,
        published: true,
        sharedId: 'mtpkxxe1uom',
        documents: [],
        attachments: [
          {
            _id: '62717723ff128cfd6de09ab5',
            originalname: 'mars.jpeg',
            mimetype: 'image/jpeg',
            size: 3405,
            filename: '1651603234992smwovxz1mq.jpeg',
            entity: 'mtpkxxe1uom',
            type: 'attachment',
            creationDate: 1651603235065,
          },
          {
            _id: '62717723ff128cfd6de09ab7',
            originalname: 'sample video.mp4',
            mimetype: 'video/mp4',
            size: 1570024,
            filename: '1651603234992ndu8pskupzp.mp4',
            entity: 'mtpkxxe1uom',
            type: 'attachment',
            creationDate: 1651603235066,
          },
        ],
      },
      _id: '626c19658a46c11701b4aafa',
      entity: 'mtpkxxe1uom',
      hub: '626c19658a46c11701b4aaf5',
    },
    {
      template: '626c19088a46c11701b493e6',
      entityData: {
        _id: '6272dc514c077e92cc2b78a9',
        metadata: {
          text: [
            {
              value: 'Some text',
            },
          ],
        },
        template: '6272dc3e4c077e92cc2b72ed',
        title: 'Test 6',
        creationDate: 1651694673470,
        published: false,
        sharedId: 'e9oxs8zgyc9',
        documents: [],
        attachments: [],
        inheritedProperty: 'title',
      },
      _id: '6272dc724c077e92cc2b7fb8',
      entity: 'e9oxs8zgyc9',
      hub: '626c19658a46c11701b4aaf5',
    },
  ],
};

const thesauri = Immutable.fromJS([
  {
    _id: '626825379c8a75a1ea9a821e',
    values: [
      {
        label: 'Argentina',
        id: 'f5t0ah6aluq',
      },
      {
        label: 'Peru',
        id: 'agq2wnfyism',
      },
      {
        label: 'Colombia',
        id: 'k9vqx1bkkso',
      },
      {
        label: 'Cambodia',
        id: 'yx6zptkxp7j',
      },
      {
        label: 'Puerto Rico',
        id: '9v2i080m3j6',
      },
    ],
    name: 'País',
    __v: 0,
  },
  {
    default: true,
    values: [
      {
        id: 'mtpkxxe1uom',
        label: 'Test 1',
      },
      {
        id: 'i4a5p7hnqr',
        label: 'Test 2',
      },
      {
        id: 'am4a13pt3b',
        label: 'Test 3',
      },
      {
        id: 'l8rnfv6qss',
        label: 'Test 4',
      },
    ],
    color: '#e46841',
    name: 'Document',
    optionsCount: 4,
    properties: [
      {
        _id: '6267e68226904c252518f914',
        label: 'Text',
        type: 'text',
        name: 'text',
        filter: true,
      },
      {
        _id: '6267e68226904c252518f915',
        label: 'Numeric',
        type: 'numeric',
        name: 'numeric',
        filter: true,
      },
      {
        _id: '62693f2b3483cd0da78b6ffb',
        label: 'Select',
        type: 'select',
        content: '626825379c8a75a1ea9a821e',
        name: 'select',
        filter: true,
      },
      {
        _id: '627176d9ff128cfd6de09972',
        label: 'Multi Select',
        type: 'multiselect',
        content: '626825379c8a75a1ea9a821e',
        name: 'multi_select',
      },
      {
        _id: '626c191b8a46c11701b499b3',
        label: 'Relationship',
        type: 'relationship',
        content: '6272dc3e4c077e92cc2b72ed',
        relationType: '626c19088a46c11701b493e6',
        name: 'relationship',
      },
      {
        _id: '626c19418a46c11701b4a390',
        label: 'Inherit',
        type: 'relationship',
        content: '626c19238a46c11701b49a55',
        relationType: '626c19088a46c11701b493e6',
        name: 'inherit',
        inherit: {
          property: '626c19498a46c11701b4a702',
          type: 'date',
        },
      },
      {
        _id: '627176d9ff128cfd6de09975',
        label: 'Date',
        type: 'date',
        name: 'date',
      },
      {
        _id: '627176d9ff128cfd6de09976',
        label: 'Date Range',
        type: 'daterange',
        name: 'date_range',
      },
      {
        _id: '627176d9ff128cfd6de09977',
        label: 'Multi Date',
        type: 'multidate',
        name: 'multi_date',
      },
      {
        _id: '627176d9ff128cfd6de09978',
        label: 'Multi Date Range',
        type: 'multidaterange',
        name: 'multi_date_range',
      },
      {
        _id: '627176d9ff128cfd6de09979',
        label: 'Rich Text',
        type: 'markdown',
        name: 'rich_text',
      },
      {
        _id: '627176d9ff128cfd6de0997a',
        label: 'Link',
        type: 'link',
        name: 'link',
      },
      {
        _id: '627176d9ff128cfd6de0997b',
        label: 'Image',
        type: 'image',
        name: 'image',
      },
      {
        _id: '627176d9ff128cfd6de0997c',
        label: 'Media',
        type: 'media',
        name: 'media',
      },
      {
        _id: '627176d9ff128cfd6de0997d',
        label: 'Geolocation',
        type: 'geolocation',
        name: 'geolocation_geolocation',
      },
    ],
    __v: 0,
    entityViewPage: '8x8b1bzsj1i',
    _id: '5bfbb1a0471dd0fc16ada146',
    type: 'template',
    commonProperties: [
      {
        _id: '5bfbb1a0471dd0fc16ada148',
        label: 'Title',
        name: 'title',
        isCommonProperty: true,
        type: 'text',
        prioritySorting: false,
      },
      {
        _id: '5bfbb1a0471dd0fc16ada147',
        label: 'Date added',
        name: 'creationDate',
        isCommonProperty: true,
        type: 'date',
        prioritySorting: false,
      },
    ],
  },
  {
    values: [
      {
        id: 'zse9gkdu27',
        label: 'Test 5',
      },
    ],
    color: '#D9534F',
    name: 'Document 2',
    optionsCount: 1,
    properties: [
      {
        _id: '626c19498a46c11701b4a702',
        label: 'Date',
        type: 'date',
        name: 'date',
      },
      {
        _id: '626c19fd8a46c11701b4aea8',
        label: 'Relationship 2',
        type: 'relationship',
        content: '5bfbb1a0471dd0fc16ada146',
        relationType: '626c19088a46c11701b493e6',
        name: 'relationship_2',
      },
    ],
    __v: 0,
    entityViewPage: '',
    _id: '626c19238a46c11701b49a55',
    type: 'template',
    commonProperties: [
      {
        _id: '626c19238a46c11701b49a56',
        label: 'Title',
        name: 'title',
        isCommonProperty: true,
        type: 'text',
        prioritySorting: false,
        generatedId: false,
      },
      {
        _id: '626c19238a46c11701b49a57',
        label: 'Date added',
        name: 'creationDate',
        isCommonProperty: true,
        type: 'date',
        prioritySorting: false,
      },
      {
        _id: '626c19238a46c11701b49a58',
        label: 'Date modified',
        name: 'editDate',
        isCommonProperty: true,
        type: 'date',
        prioritySorting: false,
      },
    ],
  },
  {
    values: [
      {
        id: 'e9oxs8zgyc9',
        label: 'Test 6',
      },
    ],
    color: '#E91E63',
    name: 'Document 3',
    optionsCount: 1,
    properties: [
      {
        _id: '6272dc3e4c077e92cc2b72ee',
        label: 'Text',
        type: 'text',
        name: 'text',
      },
    ],
    __v: 0,
    entityViewPage: '',
    _id: '6272dc3e4c077e92cc2b72ed',
    type: 'template',
    commonProperties: [
      {
        _id: '6272dc3e4c077e92cc2b72ef',
        label: 'Title',
        name: 'title',
        isCommonProperty: true,
        type: 'text',
        prioritySorting: false,
        generatedId: false,
      },
      {
        _id: '6272dc3e4c077e92cc2b72f0',
        label: 'Date added',
        name: 'creationDate',
        isCommonProperty: true,
        type: 'date',
        prioritySorting: false,
      },
      {
        _id: '6272dc3e4c077e92cc2b72f1',
        label: 'Date modified',
        name: 'editDate',
        isCommonProperty: true,
        type: 'date',
        prioritySorting: false,
      },
    ],
  },
]);

const expectedFormattedEntity = {
  _id: '6267e69026904c252518f946',
  template: '5bfbb1a0471dd0fc16ada146',
  title: 'Test 1',
  user: '58ada34d299e82674854510f',
  creationDate: 1650976400574,
  published: true,
  editDate: 1651694706834,
  language: 'en',
  sharedId: 'mtpkxxe1uom',
  permissions: [
    {
      refId: '58ada34d299e82674854510f',
      type: 'user',
      level: 'write',
    },
  ],
  __v: 0,
  documents: [],
  metadata: {
    text: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '6267e68226904c252518f914',
      label: 'Text',
      type: 'text',
      name: 'text',
      filter: true,
      indexInTemplate: 0,
      value: 'one',
    },
    numeric: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '6267e68226904c252518f915',
      label: 'Numeric',
      type: 'numeric',
      name: 'numeric',
      filter: true,
      indexInTemplate: 1,
      value: 1,
    },
    select: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '62693f2b3483cd0da78b6ffb',
      label: 'Select',
      type: 'select',
      content: '626825379c8a75a1ea9a821e',
      name: 'select',
      filter: true,
      indexInTemplate: 2,
      originalValue: 'f5t0ah6aluq',
      value: 'Argentina',
      icon: undefined,
      url: undefined,
      parent: undefined,
    },
    multi_select: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09972',
      label: 'Multi Select',
      type: 'multiselect',
      content: '626825379c8a75a1ea9a821e',
      name: 'multi_select',
      indexInTemplate: 3,
      value: [
        {
          value: 'Argentina',
          originalValue: 'f5t0ah6aluq',
          url: undefined,
          icon: undefined,
          relatedEntity: undefined,
        },
        {
          value: 'Colombia',
          originalValue: 'k9vqx1bkkso',
          url: undefined,
          icon: undefined,
          relatedEntity: undefined,
        },
      ],
    },
    relationship: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '626c191b8a46c11701b499b3',
      label: 'Relationship',
      type: 'relationship',
      content: '6272dc3e4c077e92cc2b72ed',
      relationType: '626c19088a46c11701b493e6',
      name: 'relationship',
      indexInTemplate: 4,
      value: [
        {
          value: 'Test 6',
          originalValue: 'e9oxs8zgyc9',
          url: '/entity/e9oxs8zgyc9',
          icon: null,
          parent: undefined,
          relatedEntity: {
            _id: '6272dc514c077e92cc2b78a9',
            metadata: {
              text: [
                {
                  value: 'Some text',
                },
              ],
            },
            template: '6272dc3e4c077e92cc2b72ed',
            title: 'Test 6',
            creationDate: 1651694673470,
            published: false,
            sharedId: 'e9oxs8zgyc9',
            documents: [],
            attachments: [],
            inheritedProperty: 'title',
          },
        },
      ],
    },
    inherit: {
      translateContext: '626c19238a46c11701b49a55',
      label: 'Inherit',
      name: 'inherit',
      type: 'inherit',
      noLabel: undefined,
      value: [
        {
          label: 'Inherit',
          name: 'inherit',
          value: 'Apr 20, 2022',
          timestamp: 1650412800,
        },
      ],
      inheritedType: 'date',
      onlyForCards: false,
      indexInTemplate: 5,
    },
    date: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09975',
      label: 'Date',
      type: 'date',
      name: 'date',
      indexInTemplate: 6,
      value: 'May 3, 2022',
      timestamp: 1651536000,
    },
    date_range: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09976',
      label: 'Date Range',
      type: 'daterange',
      name: 'date_range',
      indexInTemplate: 7,
      value: 'May 3, 2022 ~ May 4, 2022',
      originalValue: {
        from: 1651536000,
        to: 1651708799,
      },
    },
    multi_date: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09977',
      label: 'Multi Date',
      type: 'multidate',
      name: 'multi_date',
      indexInTemplate: 8,
      value: [
        {
          timestamp: 1651622400,
          value: 'May 4, 2022',
        },
        {
          timestamp: 1651708800,
          value: 'May 5, 2022',
        },
      ],
    },
    multi_date_range: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09978',
      label: 'Multi Date Range',
      type: 'multidaterange',
      name: 'multi_date_range',
      indexInTemplate: 9,
      value: [
        {
          value: 'May 8, 2022 ~ May 13, 2022',
          originalValue: {
            from: 1651968000,
            to: 1652486399,
          },
        },
        {
          value: 'May 15, 2022 ~ May 20, 2022',
          originalValue: {
            from: 1652572800,
            to: 1653091199,
          },
        },
      ],
    },
    rich_text: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de09979',
      label: 'Rich Text',
      type: 'markdown',
      name: 'rich_text',
      indexInTemplate: 10,
      value: 'Test 1 long text',
    },
    link: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de0997a',
      label: 'Link',
      type: 'link',
      name: 'link',
      indexInTemplate: 11,
      value: {
        label: 'test',
        url: 'https://google.com',
      },
    },
    image: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de0997b',
      label: 'Image',
      type: 'image',
      name: 'image',
      indexInTemplate: 12,
      style: 'contain',
      noLabel: false,
      value: '/api/files/1651603234992smwovxz1mq.jpeg',
    },
    media: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de0997c',
      label: 'Media',
      type: 'media',
      name: 'media',
      indexInTemplate: 13,
      style: 'contain',
      noLabel: false,
      value: '/api/files/1651603234992ndu8pskupzp.mp4',
    },
    geolocation_geolocation: {
      translateContext: '5bfbb1a0471dd0fc16ada146',
      _id: '627176d9ff128cfd6de0997d',
      label: 'Geolocation',
      type: 'geolocation',
      name: 'geolocation_geolocation',
      indexInTemplate: 14,
      value: [
        {
          lat: 46.660244945286394,
          lon: 8.283691406250002,
          label: '',
        },
      ],
      onlyForCards: false,
    },
  },
  attachments: [
    {
      _id: '62717723ff128cfd6de09ab5',
      originalname: 'mars.jpeg',
      mimetype: 'image/jpeg',
      size: 3405,
      filename: '1651603234992smwovxz1mq.jpeg',
      entity: 'mtpkxxe1uom',
      type: 'attachment',
      creationDate: 1651603235065,
    },
    {
      _id: '62717723ff128cfd6de09ab7',
      originalname: 'sample video.mp4',
      mimetype: 'video/mp4',
      size: 1570024,
      filename: '1651603234992ndu8pskupzp.mp4',
      entity: 'mtpkxxe1uom',
      type: 'attachment',
      creationDate: 1651603235066,
    },
  ],
  relations: [
    {
      template: '626c19088a46c11701b493e6',
      entityData: {
        _id: '626c195b8a46c11701b4aaaf',
        metadata: {
          date: [
            {
              value: 1650412800,
            },
          ],
          relationship_2: [
            {
              value: 'l8rnfv6qss',
              label: 'Test 4',
              icon: null,
              type: 'entity',
            },
          ],
        },
        template: '626c19238a46c11701b49a55',
        title: 'Test 5',
        creationDate: 1651251547653,
        published: true,
        sharedId: 'zse9gkdu27',
        documents: [],
        attachments: [],
      },
      _id: '626c19658a46c11701b4aafb',
      entity: 'zse9gkdu27',
      hub: '626c19658a46c11701b4aaf5',
    },
    {
      template: null,
      entityData: {
        _id: '6267e69026904c252518f946',
        metadata: {
          text: [
            {
              value: 'one',
            },
          ],
          numeric: [
            {
              value: 1,
            },
          ],
          select: [
            {
              value: 'f5t0ah6aluq',
              label: 'Argentina',
            },
          ],
          multi_select: [
            {
              value: 'k9vqx1bkkso',
              label: 'Colombia',
            },
            {
              value: 'f5t0ah6aluq',
              label: 'Argentina',
            },
          ],
          inherit: [
            {
              value: 'zse9gkdu27',
              label: 'Test 5',
              icon: null,
              type: 'entity',
              inheritedValue: [
                {
                  value: 1650412800,
                },
              ],
              inheritedType: 'date',
            },
          ],
          date: [
            {
              value: 1651536000,
            },
          ],
          date_range: [
            {
              value: {
                from: 1651536000,
                to: 1651708799,
              },
            },
          ],
          multi_date: [
            {
              value: 1651622400,
            },
            {
              value: 1651708800,
            },
          ],
          multi_date_range: [
            {
              value: {
                from: 1651968000,
                to: 1652486399,
              },
            },
            {
              value: {
                from: 1652572800,
                to: 1653091199,
              },
            },
          ],
          rich_text: [
            {
              value: 'Test 1 long text',
            },
          ],
          link: [
            {
              value: {
                label: 'test',
                url: 'https://google.com',
              },
            },
          ],
          image: [
            {
              value: '/api/files/1651603234992smwovxz1mq.jpeg',
            },
          ],
          media: [
            {
              value: '/api/files/1651603234992ndu8pskupzp.mp4',
            },
          ],
          geolocation_geolocation: [
            {
              value: {
                lat: 46.660244945286394,
                lon: 8.283691406250002,
                label: '',
              },
            },
          ],
          relationship: [
            {
              value: 'e9oxs8zgyc9',
              label: 'Test 6',
              icon: null,
              type: 'entity',
            },
          ],
        },
        template: '5bfbb1a0471dd0fc16ada146',
        title: 'Test 1',
        creationDate: 1650976400574,
        published: true,
        sharedId: 'mtpkxxe1uom',
        documents: [],
        attachments: [
          {
            _id: '62717723ff128cfd6de09ab5',
            originalname: 'mars.jpeg',
            mimetype: 'image/jpeg',
            size: 3405,
            filename: '1651603234992smwovxz1mq.jpeg',
            entity: 'mtpkxxe1uom',
            type: 'attachment',
            creationDate: 1651603235065,
          },
          {
            _id: '62717723ff128cfd6de09ab7',
            originalname: 'sample video.mp4',
            mimetype: 'video/mp4',
            size: 1570024,
            filename: '1651603234992ndu8pskupzp.mp4',
            entity: 'mtpkxxe1uom',
            type: 'attachment',
            creationDate: 1651603235066,
          },
        ],
      },
      _id: '626c19658a46c11701b4aafa',
      entity: 'mtpkxxe1uom',
      hub: '626c19658a46c11701b4aaf5',
    },
    {
      template: '626c19088a46c11701b493e6',
      entityData: {
        _id: '6272dc514c077e92cc2b78a9',
        metadata: {
          text: [
            {
              value: 'Some text',
            },
          ],
        },
        template: '6272dc3e4c077e92cc2b72ed',
        title: 'Test 6',
        creationDate: 1651694673470,
        published: false,
        sharedId: 'e9oxs8zgyc9',
        documents: [],
        attachments: [],
        inheritedProperty: 'title',
      },
      _id: '6272dc724c077e92cc2b7fb8',
      entity: 'e9oxs8zgyc9',
      hub: '626c19658a46c11701b4aaf5',
    },
  ],
  documentType: 'Document',
};

export { dbTemplate, dbEntity, thesauri, expectedFormattedEntity };

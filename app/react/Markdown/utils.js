const objectPath = (path, object) =>
  path.split('.').reduce((o, key) => {
    if (!o || !key) {
      return o;
    }
    return o.toJS ? o.get(key) : o[key];
  }, object);

const logError = (err, propValueOf, propLabelOf) => {
  /* eslint-disable no-console */
  console.error('Error on EntityData: ');
  console.error('value-of: ', propValueOf, '; label-of: ', propLabelOf);
  console.error(err);
  /* eslint-enable no-console */
};

const validHtmlTags = new Set([
  'a',
  'abbr',
  'acronym',
  'address',
  'area',
  'article',
  'aside',
  'audio',
  'b',
  'bdi',
  'bdo',
  'big',
  'blink',
  'blockquote',
  'body',
  'br',
  'button',
  'canvas',
  'caption',
  'center',
  'circle',
  'cite',
  'clipPath',
  'code',
  'col',
  'colgroup',
  'content',
  'data',
  'datalist',
  'dd',
  'decorator',
  'defs',
  'del',
  'desc',
  'details',
  'dfn',
  'dir',
  'div',
  'dl',
  'dt',
  'element',
  'ellipse',
  'em',
  'embed',
  'feBlend',
  'feColorMatrix',
  'feComponentTransfer',
  'feComposite',
  'feConvolveMatrix',
  'feDiffuseLighting',
  'feDisplacementMap',
  'feDistantLight',
  'feFlood',
  'feFuncA',
  'feFuncB',
  'feFuncG',
  'feFuncR',
  'feGaussianBlur',
  'feImage',
  'feMerge',
  'feMergeNode',
  'feMorphology',
  'feOffset',
  'fePointLight',
  'feSpecularLighting',
  'feSpotLight',
  'feTile',
  'feTurbulence',
  'fieldset',
  'figcaption',
  'figure',
  'filter',
  'font',
  'footer',
  'foreignObject',
  'form',
  'g',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'head',
  'header',
  'hgroup',
  'hr',
  'html',
  'i',
  'iframe',
  'image',
  'img',
  'input',
  'ins',
  'kbd',
  'label',
  'legend',
  'li',
  'line',
  'linearGradient',
  'main',
  'map',
  'mark',
  'marker',
  'marquee',
  'mask',
  'menu',
  'menuitem',
  'metadata',
  'meter',
  'nav',
  'nobr',
  'object',
  'ol',
  'optgroup',
  'option',
  'output',
  'p',
  'path',
  'pattern',
  'polygon',
  'polyline',
  'pre',
  'progress',
  'q',
  'radialGradient',
  'rect',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'section',
  'select',
  'shadow',
  'small',
  'source',
  'spacer',
  'span',
  'strike',
  'strong',
  'style',
  'sub',
  'summary',
  'sup',
  'svg',
  'switch',
  'symbol',
  'table',
  'tbody',
  'td',
  'template',
  'textarea',
  'tfoot',
  'th',
  'thead',
  'time',
  'tr',
  'track',
  'tspan',
  'tt',
  'u',
  'ul',
  'use',
  'var',
  'video',
  'view',
  'wbr',
]);

export { objectPath, logError, validHtmlTags };

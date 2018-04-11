const knownURLProps = [
  'data',
  'href',
  'url',
  'src',
  'uri',
  'action',
  'srcset',
  'poster',
  'responseURL'
]

const constructorURLProps = ['url', 'href', 'scriptUrl', 'scriptURL']

const checkSpecial = new Map([
  ['Attr', { props: ['value', 'nodeValue'] }],
  [
    'Document',
    {
      funs: new Set(['write', 'writeln']),
      props: ['domain', 'cookie']
    }
  ],
  ['Node', { funs: new Set(['appendChild', 'insertBefore', 'replaceChild']) }],
  [
    'SVGImageElement',
    {
      funs: new Set([
        'getAttribute',
        'setAttribute',
        'getAttributeNS',
        'setAttributeNS'
      ])
    }
  ],
  [
    'Element',
    {
      funs: new Set([
        'getAttribute',
        'setAttribute',
        'insertAdjacentHTML',
        'insertAdjacentElement'
      ]),
      props: ['innerHTML', 'outerHTML']
    }
  ],
  ['HTMLIFrameElement', { props: ['srcdoc'] }],
  ['HTMLMetaElement', { props: ['content'] }],
  ['HTMLFormElement', { props: ['action'] }],
  ['HTMLStyleElement', { props: ['textContent'] }],
  [
    'CSSStyleDeclaration',
    {
      funs: new Set(['setProperty']),
      props: [
        'cssText',
        'background',
        'backgroundImage',
        'cursor',
        'listStyle',
        'listStyleImage',
        'border',
        'borderImage',
        'borderImageSource'
      ]
    }
  ]
])

const baseInterface = new Set(['Attr', 'Node', 'Element'])

module.exports = {
  baseInterface,
  checkSpecial,
  constructorURLProps,
  knownURLProps
}

const btypes = require('@babel/types')

const elemMod = {
  HTMLLinkElement: { href: 'cs_' },
  HTMLImageElement: { src: 'im_', srcset: 'im_' },
  HTMLIFrameElement: { src: 'if_' },
  HTMLFrameElement: { src: 'fr_' },
  HTMLScriptElement: { src: 'js_' },
  HTMLVideoElement: { src: 'oe_', poster: 'im_' },
  HTMLAudioElement: { src: 'oe_', poster: 'im_' },
  HTMLSourceElement: { src: 'oe_', srcset: 'oe_' },
  HTMLTrackElement: { src: 'oe_' },
  HTMLInputElement: { src: 'oe_' },
  HTMLEmbedElement: { src: 'oe_' },
  HTMLObjectElement: { data: 'oe_' },
  HTMLBaseElement: { href: 'mp_' },
  HTMLMetaElement: { content: 'mp_' },
  HTMLFormElement: { action: 'mp_' }
}

const tagToMod = {
  a: { href: undefined },
  area: { href: undefined },
  link: { href: 'cs_' },
  img: { src: 'im_', srcset: 'im_' },
  iframe: { src: 'if_' },
  frame: { src: 'if_' },
  script: { src: 'js_' },
  video: { src: 'oe_', poster: 'im_' },
  audio: { src: 'oe_', poster: 'im_' },
  source: { src: 'oe_', srcset: 'oe_' },
  input: { src: 'oe_' },
  embed: { src: 'oe_' },
  object: { data: 'oe_' },
  base: { href: 'mp_' },
  meta: { content: 'mp_' },
  form: { action: 'mp_' },
  track: { src: 'oe_' }
}

const tagToModGS = {
  a: { href: { getter: null, setter: null } },
  area: { href: { getter: null, setter: null } },
  link: { href: { getter: null, setter: null } },
  img: {
    src: { getter: null, setter: null },
    srcset: { getter: null, setter: null }
  },
  iframe: { src: { getter: null, setter: null } },
  frame: { src: { getter: null, setter: null } },
  script: { src: { getter: null, setter: null } },
  video: {
    src: { getter: null, setter: null },
    poster: { getter: null, setter: null }
  },
  audio: {
    src: { getter: null, setter: null },
    poster: { getter: null, setter: null }
  },
  source: {
    src: { getter: null, setter: null },
    srcset: { getter: null, setter: null }
  },
  input: { src: { getter: null, setter: null } },
  embed: { src: { getter: null, setter: null } },
  object: { data: { getter: null, setter: null } },
  base: { href: { getter: null, setter: null } },
  meta: { content: { getter: null, setter: null } },
  form: { action: { getter: null, setter: null } },
  track: { src: { getter: null, setter: null } }
}

const jsToTag = {
  HTMLAnchorElement: 'a',
  HTMLAreaElement: 'area',
  HTMLLinkElement: 'link',
  HTMLImageElement: 'img',
  HTMLIFrameElement: 'iframe',
  HTMLFrameElement: 'frame',
  HTMLScriptElement: 'script',
  HTMLVideoElement: 'video',
  HTMLAudioElement: 'audio',
  HTMLSourceElement: 'source',
  HTMLInputElement: 'input',
  HTMLEmbedElement: 'embed',
  HTMLObjectElement: 'object',
  HTMLBaseElement: 'base',
  HTMLMetaElement: 'meta',
  HTMLFormElement: 'form',
  HTMLTrackElement: 'track'
}

function getModifier (elem, prop) {
  if (elemMod[elem]) {
    if (elemMod[elem][prop]) {
      return btypes.stringLiteral(elemMod[elem][prop])
    }
    return undefined
  }
  return undefined
}

module.exports = {
  getModifier,
  elemMod,
  jsToTag,
  tagToMod,
  tagToModGS
}

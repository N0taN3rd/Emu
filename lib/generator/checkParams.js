const btypes = require('@babel/types')

function checkParams (params) {
  if (Array.isArray(params)) {
    params = params.filter(Boolean)
    for (let i = 0; i < params.length; i++) {
      if (typeof params[i] === 'string') {
        params[i] = btypes.identifier(params[i])
      }
    }
  } else {
    if (typeof params === 'string') {
      params = btypes.identifier(params)
      params = [params]
    } else if (params) {
      params = [params]
    } else {
      params = []
    }
  }

  return params
}

module.exports = checkParams

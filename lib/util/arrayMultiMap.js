class ArrayMultiMap {
  constructor (preload) {
    this._map = new Map(preload)
  }

  set (key, value) {
    let set = this._map.get(key)
    if (!set) {
      set = []
      this._map.set(key, set)
    }
    set.push(value)
  }

  get (key) {
    let result = this._map.get(key)
    if (!result) result = []
    return result
  }

  has (key) {
    return this._map.has(key)
  }

  get size () {
    return this._map.size
  }

  deleteAll (key) {
    this._map.delete(key)
  }

  firstValue (key) {
    const set = this._map.get(key)
    if (!set) {
      return null
    }
    return set.values().next().value
  }

  firstKey () {
    return this._map.keys().next().value
  }

  valuesArray () {
    const result = []
    for (const key of this._map.keys()) {
      result.push(...Array.from(this._map.get(key).values()))
    }
    return result
  }

  keysArray () {
    return Array.from(this._map.keys())
  }

  clear () {
    this._map.clear()
  }

  entries () {
    return this._map.entries()
  }

  toJSON () {
    return Array.from(this._map.entries())
  }

  static fromJSON (contents) {
    return new ArrayMultiMap(contents)
  }

  [Symbol.iterator] () {
    return this._map[Symbol.iterator]()
  }
}

module.exports = ArrayMultiMap

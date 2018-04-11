class Multimap {
  constructor (preload) {
    /**
     * @type {Map<string, Set<string>>}
     * @private
     */
    this._map = new Map(preload)
  }

  set (key, value) {
    let set = this._map.get(key)
    if (!set) {
      set = new Set()
      this._map.set(key, set)
    }
    set.add(value)
  }

  get (key) {
    let result = this._map.get(key)
    if (!result) result = new Set()
    return result
  }

  has (key) {
    return this._map.has(key)
  }

  hasValue (key, value) {
    const set = this._map.get(key)
    if (!set) return false
    return set.has(value)
  }

  get size () {
    return this._map.size
  }

  delete (key, value) {
    const values = this.get(key)
    const result = values.delete(value)
    if (!values.size) {
      this._map.delete(key)
    }
    return result
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
    const arr = []
    for (const [k, v] of this._map.entries()) {
      arr.push([k, Array.from(v)])
    }
    return arr
  }

  [Symbol.iterator] () {
    return this._map[Symbol.iterator]()
  }

  static fromJSON (contents) {
    const newContents = []
    for (let i = 0; i < contents.length; ++i) {
      let [k, v] = contents[i]
      newContents.push([k, new Set(v)])
    }
    return new Multimap(newContents)
  }
}

module.exports = Multimap

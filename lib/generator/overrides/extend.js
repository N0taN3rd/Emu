class ExtendOverride {
  apply (iface) {
    const atts = iface.getAtts()
    if (atts.normal.length === 0) {
      // all readOnly or no atts id'd
    }
  }

  applyNamed (iface) {
    if (iface.hasIdConstructors()) {
      if (iface.hasIdOperations()) {

      } else {

      }
    }
  }
}
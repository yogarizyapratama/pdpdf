// Global polyfills for server-side rendering
// This prevents ReferenceError when PDF libraries are imported during SSG

if (typeof global !== 'undefined') {
  // Mock browser APIs that might be accessed during import time
  global.DOMMatrix = global.DOMMatrix || class DOMMatrix {
    constructor() {}
    static fromMatrix() { return new DOMMatrix() }
  }
  
  global.OffscreenCanvas = global.OffscreenCanvas || class OffscreenCanvas {
    constructor() {}
    getContext() { return {} }
  }
  
  global.createImageBitmap = global.createImageBitmap || function() {
    return Promise.resolve({})
  }
  
  global.HTMLCanvasElement = global.HTMLCanvasElement || class HTMLCanvasElement {
    constructor() {}
    getContext() { return {} }
    toDataURL() { return '' }
    toBlob() {}
  }
  
  global.CanvasRenderingContext2D = global.CanvasRenderingContext2D || class CanvasRenderingContext2D {
    constructor() {}
  }
}

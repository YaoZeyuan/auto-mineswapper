import pngjs from 'pngjs'

export default class T {
  static async asyncPng2pixel(source: Buffer) {
    const png = pngjs.PNG.sync.read(source)
    return png
  }
}

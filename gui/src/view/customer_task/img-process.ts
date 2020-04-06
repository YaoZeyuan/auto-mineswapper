import pngjs, { PNG } from 'pngjs'
import { desktopCapturer } from 'electron'
import robotjs from 'robotjs'
const remote = require('electron').remote

class TypePixel {
  r: number
  g: number
  b: number
  a: number
  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
    this.r = r
    this.g = g
    this.b = b
    this.a = a
  }

  isSame_模糊匹配(a: TypePixel) {
    const RGB_Range = 10
    let isR = a.r + RGB_Range > this.r && this.r > a.r - RGB_Range
    let isG = a.g + RGB_Range > this.g && this.g > a.g - RGB_Range
    let isB = a.b + RGB_Range > this.b && this.b > a.b - RGB_Range

    return isR && isG && isB
  }

  isSame_精确匹配(a: TypePixel) {
    const RGB_Range = 10
    let isR = RGB_Range === this.r
    let isG = RGB_Range === this.g
    let isB = RGB_Range === this.b

    return isR && isG && isB
  }
}
// const PonsitionPixel = new TypePixel(245, 235, 112, 0)
const Pixel_选择框特征颜色_黄 = new TypePixel(244, 233, 87, 0)
const Pixel_地雷标记特征颜色_红 = new TypePixel(154, 11, 0, 0)

class PositionBlock {
  minX: number = Number.MAX_SAFE_INTEGER
  minY: number = Number.MAX_SAFE_INTEGER
  maxX: number = -Number.MAX_SAFE_INTEGER
  maxY: number = -Number.MAX_SAFE_INTEGER
  constructor(
    minX: number = Number.MAX_SAFE_INTEGER,
    minY: number = Number.MAX_SAFE_INTEGER,
    maxX: number = -Number.MAX_SAFE_INTEGER,
    maxY: number = -Number.MAX_SAFE_INTEGER,
  ) {
    this.minX = minX
    this.minY = minY
    this.maxY = maxY
    this.maxX = maxX
  }

  updatePosition(x = 0, y = 0) {
    if (x < this.minX) {
      this.minX = x
    }
    if (x > this.maxY) {
      this.maxX = x
    }

    if (y < this.minY) {
      this.minY = y
    }
    if (y > this.maxY) {
      this.maxY = y
    }
  }

  get width() {
    return this.maxX - this.minX
  }

  get height() {
    return this.maxY - this.minY
  }
}

class PngWithPosition {
  content: Uint8Array
  width: number = 0
  height: number = 0
  constructor(souceImg: pngjs.PNGWithMetadata) {
    this.width = souceImg.width
    this.height = souceImg.height
    this.content = souceImg.data
  }

  getPixel(x: number, y: number): TypePixel {
    let indexAt = (y * this.width + x) * 4
    let r = this.content[indexAt]
    let g = this.content[indexAt + 1]
    let b = this.content[indexAt + 2]
    let a = this.content[indexAt + 3]
    return new TypePixel(r, g, b, a)
  }
}

export default class T {
  static Alpha_Rate = 200

  static async get屏幕截图() {
    // 保证一定会有黄圈
    // 移动鼠标
    // robotjs.moveMouse(1, 200)
    // 模拟点击(使扫雷获取屏幕焦点)
    // robotjs.mouseClick()
    // 模拟键盘点击事件, 多重复几次, 确保黄框在最上边
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    // robotjs.keyTap('up')
    const screenConfig = remote.getGlobal('screenConfig')
    const screenWidth = screenConfig.width
    const screenHeight = screenConfig.height
    let sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: {
        height: screenHeight,
        width: screenWidth,
      },
    })
    let pngItem: pngjs.PNGWithMetadata = new PNG()
    for (const source of sources) {
      if (source.name === 'Entire Screen') {
        // 只能通过全屏窗口截取
        const pngBuffer = source.thumbnail.toPNG()
        pngItem = pngjs.PNG.sync.read(pngBuffer)
      }
    }
    return pngItem
  }

  /**
   * 截取png图片中指定位置的图像, 返回像素数组
   * @param sourceImg
   * @param startX
   * @param startY
   * @param clipWidth
   * @param clipHeight
   */
  static get按区域截图(sourceImg: pngjs.PNGWithMetadata, startX = 0, startY = 0, clipWidth = 100, clipHeight = 100) {
    const sourceImgWidth = sourceImg.width
    let clipImgData = new Uint8ClampedArray(clipWidth * clipHeight * 4)
    // new Buffer(clipWidth * clipHeight * 4)

    for (let indexAt = 0; indexAt < clipImgData.length; indexAt++) {
      // 先将所有像素位初始化为0
      if (indexAt % 4 === 3) {
        clipImgData[indexAt] = T.Alpha_Rate
      } else {
        clipImgData[indexAt] = 0
      }
    }

    for (let 原图_w = startX; 原图_w <= startX + clipWidth; 原图_w++) {
      for (let 原图_h = startY; 原图_h <= startY + clipHeight; 原图_h++) {
        let indexAt = (sourceImgWidth * 原图_h + 原图_w) * 4
        let rgba = {
          r: sourceImg.data[indexAt],
          g: sourceImg.data[indexAt + 1],
          b: sourceImg.data[indexAt + 2],
          a: sourceImg.data[indexAt + 3],
        }

        let canvasIndexAt = (clipWidth * (原图_h - startY) + (原图_w - startX)) * 4
        // 进行灰度处理
        // Gray = (R*19595 + G*38469 + B*7472) >> 16
        let gray = Math.floor((rgba.r * 19595 + rgba.g * 38469 + rgba.b * 7472) >> 16)

        clipImgData[canvasIndexAt] = rgba.r
        clipImgData[canvasIndexAt + 1] = rgba.g
        clipImgData[canvasIndexAt + 2] = rgba.b
        clipImgData[canvasIndexAt + 3] = rgba.a
      }
    }
    return clipImgData
  }

  static getBlock(sourceImg: pngjs.PNGWithMetadata) {
    let blockPosition = new PositionBlock()
    let positionPng = new PngWithPosition(sourceImg)
    for (let x = 0; x < positionPng.width; x++) {
      for (let y = 0; y < positionPng.height; y++) {
        let pixel = positionPng.getPixel(x, y)
        if (x === 544 && y == 152) {
          // debugger
        }
        // if (pixel.r === 255) {
        //   debugger
        // }
        // if (pixel.g === 243) {
        //   debugger
        // }
        // if (pixel.b === 90) {
        //   debugger
        // }
        // console.log('g =>', pixel.g)
        if (pixel.isSame_模糊匹配(Pixel_选择框特征颜色_黄)) {
          debugger
          blockPosition.updatePosition(x, y)
        }
      }
    }
    return blockPosition
  }

  static async readImg() {
    // 从截图区域中, 寻找带黄标的区块
    return
  }
}

import pngjs from 'pngjs'

export default class T {
  static Alpha_Rate = 200

  static async asyncPng2pixel(source: Buffer) {
    const png = pngjs.PNG.sync.read(source)
    return png
  }

  static async async二值化png(png: pngjs.PNGWithMetadata) {}

  /**
   * 截取png图片中指定位置的图像, 返回像素数组
   * @param sourceImg
   * @param startX
   * @param startY
   * @param clipWidth
   * @param clipHeight
   */
  static get截图区域(sourceImg: pngjs.PNGWithMetadata, startX = 0, startY = 0, clipWidth = 100, clipHeight = 100) {
    const sourceImgWidth = sourceImg.width
    let clipImgData = new Buffer(clipWidth * clipHeight)

    for (let indexAt = 0; indexAt < clipImgData.length; indexAt++) {
      // 先初始化为0
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
        // 进行二极化处理, 经实验, 130作为阈值比较合适
        // rgba.b === 0 时, 色块一定为数字/已标记雷区
        // if(rgba.b === 0 || gray > 130 ){
        //     gray = 255
        // }else{
        //   gray = 0
        // }

        // // 可以考虑进行两次二极化
        // // 第一次识别出数字
        // // 第二次识别出已经被挖开的块, 和不能被挖开的块
        // if (rgba.b === 0) {
        //   gray = 0
        // } else {
        //   if (15 <= gray && gray <= 35) {
        //     gray = 255
        //   } else {
        //     gray = 0
        //   }
        // }
        // clipImgData[canvasIndexAt] = rgba.r
        // clipImgData[canvasIndexAt + 1] = rgba.g
        // clipImgData[canvasIndexAt + 2] = rgba.b
        // clipImgData[canvasIndexAt + 3] = T.Alpha_Rate
        clipImgData[canvasIndexAt] = gray
        clipImgData[canvasIndexAt + 1] = gray
        clipImgData[canvasIndexAt + 2] = gray
        clipImgData[canvasIndexAt + 3] = T.Alpha_Rate
      }
    }
    return clipImgData
  }
}

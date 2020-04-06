export default class Test {
  /**
   * 延迟执行函数, 返回一个 Promise
   * @param {number} ms
   */
  static sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

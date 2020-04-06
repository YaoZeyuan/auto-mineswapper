<template>
  <div>
    <el-card>
      <el-form label-width="100px">
        <el-form-item label="个人主页">
          <div class="input-homepage-url">
          </div>
        </el-form-item>
      
        <el-form-item label="操作">
          <el-button type="primary" @click="asyncHandleStartTask">测试</el-button>
          <el-button type="primary" @click="asyncCopyBase64Content">复制base64文字内容</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <div></div>
    <h1>图片:</h1>
    <div class="capture-img">
      <img :src="base64.png"/>
    </div>
    <h1>截取内容</h1>
    <div class="show-canvas">
      <canvas :style="canvasStyle" id="canvas-item"/>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import imgProcess from "./img-process"
import pngjs, { PNG } from 'pngjs'
import utils from "./utils"
// In the renderer process.
import { desktopCapturer } from 'electron'
const remote = require("electron").remote
const clipboard = require('electron').clipboard

import _ from 'lodash'
import moment from 'moment'
import fs from 'fs'
import {  CanvasHTMLAttributes } from 'react'


export default Vue.extend({
  name: 'customerTask',
  data(): {} {
   
    return {
      base64:{
        png:"",
        bmp:"",
      },
      canvas:{
        width:200,
        height:200,
      }
      // imgContentList:[]
    }
  },
  async mounted() {
  },
  methods: {
    async asyncCopyBase64Content(){
      clipboard.writeText(this.base64.bmp, "clipboard")
      console.log("复制成功")
    },
    async asyncHandleStartTask() {
      let screenPng = await this.catchScreenShot()
      let positionBlock = await imgProcess.getBlock(screenPng)
      console.log("positionBlock => ", positionBlock)
      this.generateClipImg(screenPng, positionBlock.minX,positionBlock.minY,positionBlock.width,positionBlock.height)
      // 对雷区进行建模
      // 1. 获取游戏图像边界 
      // 2. 点击↓键, 生成黄色框 => rgb值(225,243,90)
      // 3. 找到黄框, 确认每个格子大小
      // 4. 按大小将图像分割为雷区
      // 5. 识别雷区文字: 已开/未开/确认为雷/数字/不可开放
      // 6. 标记所有地雷(按数字1键)
      // 7. 打开第一个为0的数字区域(回车或空格键, 使用上下左右键移动过去)
      // 重复1~7, 直到找不到新增为0区域为止
    },
    async catchScreenShot(){
      // 临时隐藏窗口, 方便截图
      const currentWindow = remote.getCurrentWindow()
      // currentWindow.hide();
      // console.log("sleep")
      // await utils.sleep(1)
      // console.log("weak up")
      let pngItem= await imgProcess.get屏幕截图()

      // 恢复最大化状态
      // currentWindow.show();

      return pngItem
    },
    async generateClipImg(pngItem: pngjs.PNGWithMetadata, startX:number=0, startY:number=0, clipWidth:number=300, clipHeight:number=300){

      // 设置canvas宽高
      this.canvas.width = clipWidth
      this.canvas.height = clipHeight

      console.log("arguments =>", arguments)
      // 绘制canvas
      let canvasItem:HTMLCanvasElement = document.getElementById("canvas-item");
      // canvas 元素是 可替换元素, 有默认的宽高属性(此属性与 css 样式中的 width 和 height 不同), 默认 300px*150px
      // canvas 的绘制宽高取决于它的宽高属性, 与 css 样式中的宽高无关
      canvasItem.setAttribute('width', clipWidth + "px")
      canvasItem.setAttribute('height', clipHeight + "px")
      var ctx=canvasItem.getContext("2d");
      const bufferArray = imgProcess.get按区域截图(pngItem, startX, startY, clipWidth, clipHeight)
      let myImageData = new ImageData(bufferArray, clipWidth, clipHeight)
      for(let index=0;index < myImageData.data.length;index++){
        myImageData.data[index] = bufferArray[index]
      }
      ctx!.putImageData(myImageData, 0,0)
    }
  },
  computed: {
    canvasStyle(){
      return `width:${this.canvas.width}px;height:${this.canvas.height}px;`
    }
  },
})
</script>

<style scoped>
.input-homepage-url {
  display: flex;
}
.input-homepage-url .el-icon-question {
  margin-left: 12px;
  margin-right: 12px;
}
.capture-img img{
  width: 60vw;
  height: auto;
}
.base64-img-content{
  white-space:normal;
  width:60vw;
  word-break:break-all; 
}
#canvas-item{
  /* width: 640px; */
  /* height:640px; */
}
</style>

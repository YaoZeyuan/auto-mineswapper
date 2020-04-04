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
    <h1>base64编码内容:</h1>
    <div class="base64-img-content">
      <!-- {{base64.png}} -->
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
// In the renderer process.
import { desktopCapturer } from 'electron'
const remote = require("electron").remote
const clipboard = require('electron').clipboard

import _ from 'lodash'
import moment from 'moment'
import fs from 'fs'
import { Canvas_End_HTMLAttributes, CanvasHTMLAttributes } from 'react'


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
      const screenConfig = remote.getGlobal('screenConfig')
      const screenWidth = screenConfig.width
      const screenHeight =  screenConfig.height
      
      console.log("test start")
      let sources = await desktopCapturer.getSources({ types: ['screen'],thumbnailSize:{
        height:screenHeight,
        width:screenWidth,
      }})
      // this.imgContentList = []
      for (const source of sources) {
        console.log(' source.name => ', source.name)
      
        if (source.name === 'Entire Screen') {
          // 只能通过全屏窗口截取
          const bitContent = source.thumbnail.toDataURL()
          const pngBuffer = source.thumbnail.toPNG()
          // const base64Content = bitContent.toString('base64')
          

          this.base64.png = bitContent
          const img = await imgProcess.asyncPng2pixel(pngBuffer)



          const width = img.width
          const height = img.height
          
          const canvas_Start_W = 0;
          const canvas_Start_H = 600;
          const canvas_End_W = canvas_Start_W + 300;
          const canvas_End_H = canvas_Start_H + 300;
          
          // 设置canvas宽高
          this.canvas.width = 300
          this.canvas.height = 300

          // 绘制canvas
          let canvasItem = document.getElementById("canvas-item");
          // canvasItem.width = width
          // canvasItem.height = height
          var ctx=canvasItem.getContext("2d");

         
          let myImageData = ctx.getImageData(0, 0, canvas_End_W, canvas_End_H);
           const bufferArray = imgProcess.get截图区域(img, 0, 0, 300, 300)
          for(let index=0;index < myImageData.data.length;index++){
            myImageData.data[index] = bufferArray[index]
          }
          ctx.putImageData(myImageData, 0,0)

          // let canvas_Self_Height = myImageData.height
          // let canvas_Self_Width = myImageData.width
          // let canvasIndex = 0
          
          // for(let indexAt = 0;indexAt < myImageData.data.length;indexAt++){
          //   // 先初始化为0
          //   if(indexAt%4 ===3){
          //     myImageData.data[indexAt] = 200;
          //   }else{
          //     myImageData.data[indexAt] = 0;
          //   }
          // }
          // // console.log(" myImageData.data => ", myImageData.data)



          // for(let w = canvas_Start_W; w<= canvas_End_W; w++){
          //   for(let h =canvas_Start_H;h<=canvas_End_H;h++){
          //     let indexAt = (width * h + w) * 4
          //     let rgba = {
          //       r : img.data[indexAt],
          //       g : img.data[indexAt+1],
          //       b : img.data[indexAt+2],
          //       a : img.data[indexAt+3]
          //     }

          //       let canvasIndexAt = (canvas_Self_Width * (h-canvas_Start_H) + (w-canvas_Start_W) ) * 4 
          //       // 进行灰度处理
          //       // Gray = (R*19595 + G*38469 + B*7472) >> 16
          //       let gray = Math.floor( (rgba.r *19595 + rgba.g*38469 + rgba.b*7472) >> 16)
          //       // 进行二极化处理, 经实验, 130作为阈值比较合适
          //       // rgba.b === 0 时, 色块一定为数字/已标记雷区
          //       // if(rgba.b === 0 || gray > 130 ){
          //       //     gray = 255
          //       // }else{
          //       //   gray = 0
          //       // }

          //       // 可以考虑进行两次二极化
          //       // 第一次识别出数字
          //       // 第二次识别出已经被挖开的块, 和不能被挖开的块
          //       if(rgba.b ===0){
          //       gray = 0
          //       }else{
          //       if( 15 <= gray  && gray <= 35 ){
          //           gray = 255
          //       }else{
          //         gray = 0
          //         }
          //       }
          //       myImageData.data[canvasIndexAt] = gray
          //       myImageData.data[canvasIndexAt+1] = gray
          //       myImageData.data[canvasIndexAt+2] = gray
          //       myImageData.data[canvasIndexAt+3] = 255
          //   }
          // }
          // console.log("img.data =>", img.data)
          // console.log("myImageData =>", myImageData.data)
          // ctx.putImageData(myImageData, 0,0)

          // this.base64.bmp = source.thumbnail.toBitmap().toString("base64")
          // this.imgSrc = bitContent// "data:image/bmp;base64," + base64Content
          //   try {
          //     const stream = await navigator.mediaDevices.getUserMedia({
          //       audio: false,
          //       video: {
          //         mandatory: {
          //           chromeMediaSource: 'desktop',
          //           chromeMediaSourceId: source.id,
          //           minWidth: 1280,
          //           maxWidth: 1280,
          //           minHeight: 720,
          //           maxHeight: 720,
          //         },
          //       },
          //     })
          //     handleStream(stream)
          //   } catch (e) {
          //     handleError(e)
          //   }
          //   return
        }
      }


      // // 将当前任务配置发送给服务器
      // ipcRenderer.sendSync('start-test')
    },
  },
  computed: {
    canvasStyle(){
      return `width:${this.canvas.width}px;height:${this.canvas.height}px;`
      // return `width:300px;height:300px;`
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

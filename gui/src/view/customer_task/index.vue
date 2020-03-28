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
          // 设置canvas宽高
          this.canvas.width = width
          this.canvas.height = height

          // 绘制canvas
          let canvasItem = document.getElementById("canvas-item");
          // canvasItem.width = width
          // canvasItem.height = height
          var ctx=canvasItem.getContext("2d");

          const canvas_Start_W = 100;
          const canvas_Start_H = 200;
          const canvas_End_W = 200;
          const canvas_End_H = 300;
          let myImageData = ctx.getImageData(0, 0, canvas_End_W, canvas_End_H);
          let canvas_Self_Height = myImageData.height
          let canvas_Self_Width = myImageData.width
          let canvasIndex = 0
          
          for(let indexAt = 0;indexAt < myImageData.data.length;indexAt++){
            // 先初始化为0
            if(indexAt%4 ===3){
              myImageData.data[indexAt] = 200;
            }else{
              myImageData.data[indexAt] = 0;
            }
          }
          // console.log(" myImageData.data => ", myImageData.data)



          for(let w = canvas_Start_W; w<= canvas_End_W; w++){
            for(let h =canvas_Start_H;h<=canvas_End_H;h++){
              let indexAt = (width * h + w) * 4
              let rgba = {
                r : img.data[indexAt],
                g : img.data[indexAt+1],
                b : img.data[indexAt+2],
                a : img.data[indexAt+3]
              }

                let canvasIndexAt = (canvas_Self_Width * (h-canvas_Start_H) + (w-canvas_Start_W) ) * 4 
                
                myImageData.data[canvasIndexAt] = rgba.r
                myImageData.data[canvasIndexAt+1] = rgba.g
                myImageData.data[canvasIndexAt+2] = rgba.b
                myImageData.data[canvasIndexAt+3] = rgba.a
            }
          }
          console.log("img.data =>", img.data)
          console.log("myImageData =>", myImageData.data)
          ctx.putImageData(myImageData, 0,0)

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

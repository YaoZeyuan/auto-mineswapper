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
        </el-form-item>
      </el-form>
    </el-card>
    <div></div>
    <h1>图片:</h1>
    <div>
      <img :src="imgSrc"/>
    </div>
    <h1>base64编码内容:</h1>
    <div>
      <p>{{imgSrc}}</p>
    </div>
    <!-- <h1>所有图片:</h1>
    <div>
      <div v-for="item of imgContentList">
        <h1>{{item.name}}</h1>
        <img :src="item.content"/>
        <hr />
      </div>
      
    </div> -->
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
// In the renderer process.
import { desktopCapturer } from 'electron'
const remote = require("electron").remote


import _ from 'lodash'
import moment from 'moment'
import fs from 'fs'


export default Vue.extend({
  name: 'customerTask',
  data(): {} {
   
    return {
      imgSrc:'',
      // imgContentList:[]
    }
  },
  async mounted() {
  },
  methods: {
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
          // const base64Content = bitContent.toString('base64')
          

          this.imgSrc = bitContent// "data:image/bmp;base64," + base64Content
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
</style>

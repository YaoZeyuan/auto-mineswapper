// Modules to control application life and create native browser window
import Electron, { Menu } from 'electron'
// import test from '~/src/screen-catch'
// import CommonUtil from '~/src/library/util/common'
// import ConfigHelperUtil from '~/src/library/util/config_helper'
// import PathConfig from '~/src/config/path'
// import Logger from '~/src/library/logger'
// import DispatchTaskCommand from '~/src/command/dispatch_task'
// import MUser from '~/src/model/mblog_user'
// import MBlog from '~/src/model/mblog'
import fs from 'fs'
import _ from 'lodash'

let argv = process.argv
let isDebug = argv.includes('--debug')
let { app, BrowserWindow, ipcMain, session, shell } = Electron
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: Electron.BrowserWindow

// 关闭https证书校验
app.commandLine.appendSwitch('ignore-certificate-errors', 'true')

function createWindow() {
  if (process.platform === 'darwin') {
    const template = [
      {
        label: 'Application',
        submenu: [
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              app.quit()
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
        ],
      },
    ]
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    Menu.setApplicationMenu(null)
  }

  const { screen } = Electron
  const { width, height } = screen.getPrimaryDisplay().workAreaSize


  // Create the browser window.
  mainWindow = new BrowserWindow({
    width,
    height,
    // 自动隐藏菜单栏
    autoHideMenuBar: true,
    // 窗口的默认标题
    title: '稳部落',
    // 在屏幕中间展示窗口
    center: true,
    // 展示原生窗口栏
    frame: true,
    // 禁用web安全功能 --> 个人软件, 要啥自行车
    webPreferences: {
      // 开启 DevTools.
      devTools: true,
      // 禁用同源策略, 允许加载任何来源的js
      webSecurity: false,
      // 允许 https 页面运行 http url 里的资源
      allowRunningInsecureContent: true,
      // 启用node支持
      nodeIntegration: true,
      // 启用webview标签
      webviewTag: true,
      // 启用共享模块
      enableRemoteModule: true,
    },
  })


  global.screenConfig = {
    width,
    height,
  }
  // and load the index.html of the app.
  if (isDebug) {
    // 本地调试 & 打开控制台
    mainWindow.loadURL('http://127.0.0.1:8080')
    mainWindow.webContents.openDevTools()
  } else {
    // 线上地址
    mainWindow.loadFile('./gui/dist/index.html')
  }

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// ipcMain.on('start-test', async event => {
//   console.log('start-test start')
//   event.returnValue = true
//   test()
//   console.log('start-test finish')
//   return
// })

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

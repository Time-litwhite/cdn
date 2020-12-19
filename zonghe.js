 
/**
 *
 *  You can modify and use this source freely
 *  only for the development of application related Live2D.
 *
 *  (c) Live2D Inc. All rights reserved.
 */
 
// Modified by xiazeyu.
 
/**
* @desc A library that provide basic IO and json function
*/
 
import { currWebGL } from './elementMgr';
import { Live2DModelWebGL } from "./lib/live2d.core";
 
 
//============================================================
//============================================================
//  class PlatformManager     extend IPlatformManager
//============================================================
//============================================================
 
/**
* @name PlatformManager
* @desc Define the variable type of PlatformManager
* @param null
* @returns {Structure} PlatformManager
*/
export function PlatformManager()
{
 
}
 
 
//============================================================
//    PlatformManager # loadBytes()
//============================================================
 
/**
* @name loadBytes
* @desc load bytes from the path and callback
* @param {String} path, {Function} callback
* @returns callback {raw} context
* @memberOf PlatformManager
*/
 
PlatformManager.prototype.loadBytes       = function(path/*String*/, callback)
{
    var request = new XMLHttpRequest();
    request.open("GET", path, true);
    request.responseType = "arraybuffer";
    request.onload = function(){
        switch(request.status){
        case 200:
            callback(request.response);
            break;
        default:
            console.error("Failed to load (" + request.status + ") : " + path);
            break;
        }
    }
    request.send(null);
    // return request;
}
 
 
//============================================================
//    PlatformManager # loadString()
//============================================================
 
/**
* @name loadString
* @desc load bytes from the path and put it into buffer
* @param {String} path
* @returns buffer {raw} context
* @memberOf PlatformManager
*/
PlatformManager.prototype.loadString      = function(path/*String*/)
{
 
    this.loadBytes(path, function(buf) {
        return buf;
    });
 
}
 
 
//============================================================
//    PlatformManager # loadLive2DModel()
//============================================================
 
/**
* @name loadLive2DModel
* @desc load Live2DModel from the path and put it into buffer
* @param {String} path, {function} callback
* @returns callback loaded model
* @memberOf PlatformManager
*/
PlatformManager.prototype.loadLive2DModel = function(path/*String*/, callback)
{
    var model = null;
 
    // load moc
    this.loadBytes(path, function(buf){
        model = Live2DModelWebGL.loadModel(buf);
        callback(model);
    });
 
}
 
 
//============================================================
//    PlatformManager # loadTexture()
//============================================================
 
/**
* @name loadTexture
* @desc load Live2DModel's Texture and callback
* @param {Live2DModelWebGL}model, {int}no, {string}path, {function}callback
* @returns callback
* @memberOf PlatformManager
*/
PlatformManager.prototype.loadTexture     = function(model/*ALive2DModel*/, no/*int*/, path/*String*/, callback)
{
    // load textures
    var loadedImage = new Image();
    // Thanks to @mashirozx & @fghrsh
    // Issues:
    // @https://github.com/journey-ad/live2d_src/issues/1
    // @https://github.com/journey-ad/live2d_src/issues/3
    loadedImage.crossOrigin = 'Anonymous';
    loadedImage.src = path;
    loadedImage.onload = onload;
    loadedImage.onerror = onerror;
 
    // var thisRef = this;
    loadedImage.onload = function() {
        // create texture
        var gl = currWebGL;
        var texture = gl.createTexture();
        if (!texture){ console.error("Failed to generate gl texture name."); return -1; }
 
        if(!model.isPremultipliedAlpha()){
            // 乗算済アルファテクスチャ以外の場合
            // emmmm, maybe do something for textures with alpha layer.
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
        }
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,
                      gl.UNSIGNED_BYTE, loadedImage);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
 
 
 
        model.setTexture(no, texture);
 
        // テクスチャオブジェクトを解放
        // Release the texture object to prevent buffer overruns.
        texture = null;
 
        if (typeof callback == "function") callback();
    };
 
    loadedImage.onerror = function() {
        console.error("Failed to load image : " + path);
    }
}
 
 
//============================================================
//    PlatformManager # parseFromBytes(buf)
 
//============================================================
 
/**
* @name jsonParseFromBytes
* @desc parse json file into arrays
* @param {raw} buf
* @returns {Array}jsonObj
* @memberOf PlatformManager
*/
PlatformManager.prototype.jsonParseFromBytes = function(buf){
 
    var jsonStr;
    var bomCode = new Uint8Array(buf, 0, 3);
    if (bomCode[0] == 239 && bomCode[1] == 187 && bomCode[2] == 191) {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf, 3));
    } else {
        jsonStr = String.fromCharCode.apply(null, new Uint8Array(buf));
    }
 
    var jsonObj = JSON.parse(jsonStr);
 
    return jsonObj;
};
 
 
 
//============================================================
//    PlatformManager # log()
//============================================================
 
/**
* @name log
* @desc output log in console
* @param {string} txt
* @returns null
* @memberOf PlatformManager
*/
PlatformManager.prototype.log             = function(txt/*String*/)
{
    console.log(txt);
}
/**
 * @description The main part of live2d-widget
 */
 
 
import { config } from './config/configMgr';
import { createElement, currWebGL, currCanvas } from './elementMgr';
import { UtSystem,
         UtDebug,
         LDTransform,
         LDGL,
         Live2D,
         Live2DModelWebGL,
         Live2DModelJS,
         Live2DMotion,
         MotionQueueManager,
         PhysicsHair,
         AMotion,
         PartsDataID,
         DrawDataID,
         BaseDataID,
         ParamID } from './lib/live2d.core';
import { L2DTargetPoint, L2DViewMatrix, L2DMatrix44 } from "./lib/Live2DFramework";
import { cManager } from "./cManager";
import { MatrixStack } from "./utils/MatrixStack";
import { cDefine } from "./cDefine";
import device from 'current-device';
 
let live2DMgr = null;
let captureFrameCB = undefined;
let isDrawStart = false;
let dragMgr = null;
let viewMatrix = null;
let projMatrix = null;
let deviceToScreen = null;
let drag = false;
let lastMouseX = 0;
let lastMouseY = 0;
let headPos = 0.5;
let opacityDefault = 0.7;
let opacityHover = 1;
let eventemitter = null;
 
 
/**
 * Main function of live2d-widget
 * @return {null}
 */
 
function theRealInit (emitter){
 
  createElement();
  initEvent();
 
  live2DMgr = new cManager(eventemitter)
  dragMgr = new L2DTargetPoint();
  let rect = currCanvas.getBoundingClientRect();
  let ratio = rect.height / rect.width;
  let left = cDefine.VIEW_LOGICAL_LEFT;
  let right = cDefine.VIEW_LOGICAL_RIGHT;
  let bottom = -ratio;
  let top = ratio;
 
  viewMatrix = new L2DViewMatrix();
 
  viewMatrix.setScreenRect(left, right, bottom, top);
 
  viewMatrix.setMaxScreenRect(cDefine.VIEW_LOGICAL_MAX_LEFT,
    cDefine.VIEW_LOGICAL_MAX_RIGHT,
    cDefine.VIEW_LOGICAL_MAX_BOTTOM,
    cDefine.VIEW_LOGICAL_MAX_TOP);
 
  modelScaling(device.mobile() && config.mobile.scale || config.model.scale)
 
  projMatrix = new L2DMatrix44();
  projMatrix.multScale(1, (rect.width / rect.height));
 
  deviceToScreen = new L2DMatrix44();
  deviceToScreen.multTranslate(-rect.width / 2.0, -rect.height / 2.0);  // #32
  deviceToScreen.multScale(2 / rect.width, -2 / rect.height);  // #32
 
 
  Live2D.setGL(currWebGL);
  currWebGL.clearColor(0.0, 0.0, 0.0, 0.0);
  changeModel(config.model.jsonPath);
  startDraw();
 
 
}
 
/**
 * Capture current frame to png file
 * @param  {Function} callback The callback function which will receive the current frame
 * @return {null}
 * @example
 * You can use codes below to let the user download the current frame
 *
 * L2Dwidget.captureFrame(
 *   function(e){
 *     let link = document.createElement('a');
 *     document.body.appendChild(link);
 *     link.setAttribute('type', 'hidden');
 *     link.href = e;
 *     link.download = 'live2d.png';
 *     link.click();
 *   }
 * );
 *
 * @description Thanks to @journey-ad https://github.com/journey-ad/live2d_src/commit/97356a19f93d2abd83966f032a53b5ca1109fbc3
 */
 
function captureFrame(callback){
  captureFrameCB = callback;
}
 
function initEvent(){
  if (currCanvas.addEventListener) {
    window.addEventListener("click", mouseEvent);
    window.addEventListener("mousedown", mouseEvent);
    window.addEventListener("mousemove", mouseEvent);
    window.addEventListener("mouseup", mouseEvent);
    document.addEventListener("mouseleave", mouseEvent);
    window.addEventListener("touchstart", touchEvent);
    window.addEventListener("touchend", touchEvent);
    window.addEventListener("touchmove", touchEvent);
  }
}
 
function startDraw() {
  if (!isDrawStart) {
    isDrawStart = true;
    (function tick() {
      draw();
      let requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;
 
      requestAnimationFrame(tick, currCanvas);
      if(captureFrameCB !== undefined){
        captureFrameCB(currCanvas.toDataURL());
        captureFrameCB = undefined;
      }
    })();
  }
}
 
function draw()
{
    MatrixStack.reset();
    MatrixStack.loadIdentity();
    dragMgr.update();
    live2DMgr.setDrag(dragMgr.getX(), dragMgr.getY());
 
    currWebGL.clear(currWebGL.COLOR_BUFFER_BIT);
 
    MatrixStack.multMatrix(projMatrix.getArray());
    MatrixStack.multMatrix(viewMatrix.getArray());
    MatrixStack.push();
 
    for (let i = 0; i < live2DMgr.numModels(); i++)
    {
        let model = live2DMgr.getModel(i);
 
        if(model == null) return;
 
        if (model.initialized && !model.updating)
        {
            model.update();
            model.draw(currWebGL);
        }
    }
    MatrixStack.pop();
}
 
function changeModel(modelurl) // 更换模型
{
    live2DMgr.reloadFlg = true;
    live2DMgr.count++; // 现在仍有多模型支持，稍后可以精简
    live2DMgr.changeModel(currWebGL, modelurl);
}
 
function modelScaling(scale) {
  viewMatrix.adjustScale(0, 0, scale);
}
/*
function transformRange(center, transform, range)
{
    let a = {
        x: transform.x - center.x,
        y: transform.y - center.y
    }
    let r = Math.sqrt(Math.pow(a.x,2) + Math.pow(a.y,2));
    if (r > range) {
        a = {
            x: a.x / r * range + center.x,
            y: a.y / r * range + center.y
        };
        return a;
    } else {
        return transform;
    }
}
*/
function dot(A,B)
{
    return A.x * B.x + A.y * B.y;
}
 
function normalize(x,y)
{
    let length = Math.sqrt(x * x + y * y)
    return {
        x: x / length,
        y: y / length
    }
}
 
function transformRect(center, transform, rect)
{
    if (transform.x < rect.left + rect.width && transform.y < rect.top + rect.height &&
        transform.x > rect.left && transform.y > rect.top) return transform;
    let Len_X = center.x - transform.x;
    let Len_Y = center.y - transform.y;
 
    function angle(Len_X, Len_Y)
    {
        return Math.acos(dot({
            x: 0,
            y: 1
        }, normalize(Len_X, Len_Y))) * 180 / Math.PI
    }
 
    let angleTarget = angle(Len_X, Len_Y);
    if (transform.x < center.x) angleTarget = 360 - angleTarget;
    let angleLeftTop = 360 - angle(rect.left - center.x, (rect.top - center.y) * -1);
    let angleLeftBottom = 360 - angle(rect.left - center.x, (rect.top + rect.height - center.y) * -1);
    let angleRightTop = angle(rect.left + rect.width - center.x, (rect.top - center.y) * -1);
    let angleRightBottom = angle(rect.left + rect.width - center.x, (rect.top + rect.height - center.y) * -1);
    let scale = Len_Y / Len_X;
    let res = {};
 
    if (angleTarget < angleRightTop) {
        let y3 = rect.top - center.y;
        let x3 = y3 / scale;
        res = {
            y: center.y + y3,
            x: center.x + x3
        }
    } else if(angleTarget < angleRightBottom) {
        let x3 = rect.left + rect.width - center.x;
        let y3 = x3 * scale;
        res = {
            y: center.y + y3,
            x: center.x + x3
        }
    } else if (angleTarget < angleLeftBottom) {
        let y3 = rect.top + rect.height - center.y;
        let x3 = y3 / scale;
        res = {
            y: center.y + y3,
            x: center.x + x3
        }
    } else if (angleTarget < angleLeftTop) {
        let x3 = center.x - rect.left;
        let y3 = x3 * scale;
        res = {
            y: center.y - y3,
            x: center.x - x3
        }
    } else {
        let y3 = rect.top - center.y;
        let x3 = y3 / scale;
        res = {
            y: center.y + y3,
            x: center.x + x3
        }
    }
 
    return res;
}
 
function modelTurnHead(event)
{
    drag = true;
 
    let rect = currCanvas.getBoundingClientRect();
 
    let sx = transformScreenX(event.clientX - rect.left);
    let sy = transformScreenY(event.clientY - rect.top);
    let target = transformRect({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * headPos
    }, {
        x: event.clientX,
        y: event.clientY
    }, rect)
    let vx = transformViewX(target.x - rect.left);
    let vy = transformViewY(target.y - rect.top);
 
    if (cDefine.DEBUG_MOUSE_LOG)
        console.log("modelTurnHead onMouseMove device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");
 
    lastMouseX = sx;
    lastMouseY = sy;
 
    dragMgr.setPoint(vx, vy);
}
 
function modelTapEvent(event)
{
    drag = true;
 
    let rect = currCanvas.getBoundingClientRect();
 
    let sx = transformScreenX(event.clientX - rect.left);
    let sy = transformScreenY(event.clientY - rect.top);
    let target = transformRect({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * headPos
    }, {
        x: event.clientX,
        y: event.clientY
    }, rect)
    let vx = transformViewX(target.x - rect.left);
    let vy = transformViewY(target.y - rect.top);
 
    if (cDefine.DEBUG_MOUSE_LOG)
        console.log("modelTapEvent onMouseDown device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");
 
    lastMouseX = sx;
    lastMouseY = sy;
 
    eventemitter.emit('tap', event);
 
    live2DMgr.tapEvent(vx, vy);
}
 
function followPointer(event)
{
    let rect = currCanvas.getBoundingClientRect();
 
    let sx = transformScreenX(event.clientX - rect.left);
    let sy = transformScreenY(event.clientY - rect.top);
 
    // log but seems ok
    // console.log("ecx=" + event.clientX + " ecy=" + event.clientY + " sx=" + sx + " sy=" + sy);
 
    let target = transformRect({// seems ok here
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height * headPos
    }, {
        x: event.clientX,
        y: event.clientY
    }, rect)
    let vx = transformViewX(target.x - rect.left);
    let vy = transformViewY(target.y - rect.top);
 
    if (cDefine.DEBUG_MOUSE_LOG)
        console.log("followPointer onMouseMove device( x:" + event.clientX + " y:" + event.clientY + " ) view( x:" + vx + " y:" + vy + ")");
 
    if (drag)
    {
        lastMouseX = sx;
        lastMouseY = sy;
        dragMgr.setPoint(vx, vy);
    }
}
 
function lookFront()
{
    if (drag) {
        drag = false;
    }
    dragMgr.setPoint(0, 0);
}
 
function mouseEvent(e)
{
    //e.preventDefault();
    if (e.type == "mousedown") {
        modelTapEvent(e);
    } else if (e.type == "mousemove") {
        modelTurnHead(e);
    } else if (e.type == "mouseup") {
        if("button" in e && e.button != 0) return;
        // lookFront();
    } else if (e.type == "mouseleave") {
        lookFront();
    }
}
 
function touchEvent(e)
{
    var touch = e.touches[0];
    if (e.type == "touchstart") {
        if (e.touches.length == 1) modelTapEvent(touch);
        // onClick(touch);
    } else if (e.type == "touchmove") {
        followPointer(touch);
    } else if (e.type == "touchend") {
        lookFront();
    }
}
 
function transformViewX(deviceX)
{
    var screenX = deviceToScreen.transformX(deviceX);
    return viewMatrix.invertTransformX(screenX);
}
 
 
function transformViewY(deviceY)
{
    var screenY = deviceToScreen.transformY(deviceY);
    return viewMatrix.invertTransformY(screenY);
}
 
 
function transformScreenX(deviceX)
{
    return deviceToScreen.transformX(deviceX);
}
 
 
function transformScreenY(deviceY)
{
    return deviceToScreen.transformY(deviceY);
}
 
export{
  theRealInit,
  captureFrame,
}
/**
 * @description Automatic locate the publicPath and set it up for webpack.
 */
 
 
'use strict';
 
/**
 * Get current script path
 * @return {String} The path of current script
 * @example
 * get 'file:///C:/git/live2d-widget/dev/bundle.js' or 'https://www.host.com/test/js/bundle.js'
 */
 
function getCurrentPath(){
 
  try{
 
    // FF, Chrome, Modern browsers
    // use their API to get the path of current script
 
    // a.b();
    // console.log('wpStage1');
 
    return document.currentScript.src;
 
    if(DOC.currentScript){ // FF 4+
      return DOC.currentScript.src;
    }
 
  }catch(e){
 
    // document.currentScript doesn't supports
 
    // console.log('wpStage2');
 
    // Method 1
    // https://github.com/mozilla/pdf.js/blob/e081a708c36cb2aacff7889048863723fcf23671/src/shared/compatibility.js#L97
    // IE, Chrome < 29
 
    let scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
 
/*
    // Method 2
    // parse the error stack trace maually
    // https://github.com/workhorsy/uncompress.js/blob/master/js/uncompress.js#L25
 
    let stack = e.stack;
    let line = null;
 
    // Chrome and IE
    if (stack.indexOf('@') !== -1) {
      line = stack.split('@')[1].split('\n')[0];
    // Firefox
    } else {
      line = stack.split('(')[1].split(')')[0];
    }
    line = line.substring(0, line.lastIndexOf('/')) + '/';
    return line;
*/
/*
    // Method 3
    // https://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html
 
    let stack = e.stack;
    if(!stack && window.opera){
      // Opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
      stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
    }
    if(stack){
      // e.stack最后一行在所有支持的浏览器大致如下:
      // chrome23:
      // @ http://113.93.50.63/data.js:4:1
      // firefox17:
      // @http://113.93.50.63/query.js:4
      // opera12:
      // @http://113.93.50.63/data.js:4
      // IE10:
      // @ Global code (http://113.93.50.63/data.js:4:1)
      stack = stack.split(/[@ ]/g).pop(); // 取得最后一行,最后一个空格或@之后的部分
      stack = stack[0] == '(' ? stack.slice(1,-1) : stack;
      return stack.replace(/(:\d+)?:\d+$/i, ''); // 去掉行号与或许存在的出错字符起始位置
    }
    let nodes = head.getElementsByTagName('script'); // 只在head标签中寻找
    for(var i = 0, node; node = nodes[i++];){
      if(node.readyState === 'interactive'){
        return node.className = node.src;
      }
    }
*/
  }
 
}
 
// expose the path to the global,
// and wp will finish the following work
__webpack_public_path__ = getCurrentPath().replace(/[^/\\\\]+$/, '');
if (process.env.NODE_ENV === 'development'){
  console.log(`Live2Dwidget: publicPath: ${__webpack_public_path__}`);
}
 
export {
  getCurrentPath,
}
import { Live2DFramework } from "./lib/Live2DFramework";
import { PlatformManager } from "./PlatformManager";
import { cModel } from "./cModel";
import { cDefine } from "./cDefine";
 
function cManager(eventemitter) {
  // console.log("--> cManager()");
 
  this.eventemitter = eventemitter;
 
  this.models = [];
  this.count = -1;
  this.reloadFlg = false;
 
  Live2DFramework.setPlatformManager(new PlatformManager());
 
}
 
cManager.prototype.createModel = function () {
 
  var model = new cModel();
  this.models.push(model);
 
  return model;
 
}
 
 
cManager.prototype.changeModel = function (gl, modelurl) {
  // console.log("--> cManager.update(gl)");
 
  if (this.reloadFlg) {
    this.reloadFlg = false;
    this.releaseModel(0, gl);
    this.createModel();
    this.models[0].load(gl, modelurl);
  }
 
};
 
 
cManager.prototype.getModel = function (no) {
  // console.log("--> cManager.getModel(" + no + ")");
 
  if (no >= this.models.length) return null;
 
  return this.models[no];
};
 
 
 
cManager.prototype.releaseModel = function (no, gl) {
  // console.log("--> cManager.releaseModel(" + no + ")");
 
  if (this.models.length <= no) return;
 
  this.models[no].release(gl);
 
  delete this.models[no];
  this.models.splice(no, 1);
};
 
 
 
cManager.prototype.numModels = function () {
  return this.models.length;
};
 
 
 
cManager.prototype.setDrag = function (x, y) {
  for (var i = 0; i < this.models.length; i++) {
    this.models[i].setDrag(x, y);
  }
}
 
cManager.prototype.tapEvent = function (x, y) {
  if (cDefine.DEBUG_LOG)
    console.log("tapEvent view x:" + x + " y:" + y);
 
  for (var i = 0; i < this.models.length; i++) {
 
    if (this.models[i].hitTest(cDefine.HIT_AREA_HEAD, x, y)) {
      this.eventemitter.emit('tapface');
      
      if (cDefine.DEBUG_LOG)
        console.log("Tap face.");
 
      this.models[i].setRandomExpression();
    }
    else if (this.models[i].hitTest(cDefine.HIT_AREA_BODY, x, y)) {
      this.eventemitter.emit('tapbody');
      if (cDefine.DEBUG_LOG)
        console.log("Tap body." + " models[" + i + "]");
 
      this.models[i].startRandomMotion(cDefine.MOTION_GROUP_TAP_BODY,
        cDefine.PRIORITY_NORMAL);
    }
  }
 
  return true;
};
 
export{
  cManager,
}
import { Live2DFramework, L2DBaseModel, L2DEyeBlink } from "./lib/Live2DFramework";
import { ModelSettingJson } from "./utils/ModelSettingJson";
import { MatrixStack } from "./utils/MatrixStack";
import { cDefine } from "./cDefine";
import { UtSystem,/*
         UtDebug,
         LDTransform,
         LDGL,
         Live2D,
         Live2DModelWebGL,
         Live2DModelJS,
         Live2DMotion,
         MotionQueueManager,
         PhysicsHair,
         AMotion,
         PartsDataID,
         DrawDataID,
         BaseDataID,
         ParamID*/ } from './lib/live2d.core';
//============================================================
//============================================================
//  class cModel     extends L2DBaseModel
//============================================================
//============================================================
export function cModel()
{
    //L2DBaseModel.apply(this, arguments);
    L2DBaseModel.prototype.constructor.call(this);
 
    this.modelHomeDir = "";
    this.modelSetting = null;
    this.tmpMatrix = [];
}
 
cModel.prototype = new L2DBaseModel();
 
 
cModel.prototype.load = function(gl, modelSettingPath, callback)
{
    this.setUpdating(true);
    this.setInitialized(false);
 
    this.modelHomeDir = modelSettingPath.substring(0, modelSettingPath.lastIndexOf("/") + 1);
 
    this.modelSetting = new ModelSettingJson();
 
    var thisRef = this;
 
    this.modelSetting.loadModelSetting(modelSettingPath, function(){
 
        var path = thisRef.modelHomeDir + thisRef.modelSetting.getModelFile();
        thisRef.loadModelData(path, function(model){
 
            for (var i = 0; i < thisRef.modelSetting.getTextureNum(); i++)
            {
                if( /^https?:\/\/|^\/\//i.test(thisRef.modelSetting.getTextureFile(i)) ){
 
                    var texPaths = thisRef.modelSetting.getTextureFile(i);
 
                }else{
                var texPaths = thisRef.modelHomeDir + thisRef.modelSetting.getTextureFile(i);
                }
                thisRef.loadTexture(i, texPaths, function() {
 
                    if( thisRef.isTexLoaded ) {
 
                        if (thisRef.modelSetting.getExpressionNum() > 0)
                        {
 
                            thisRef.expressions = {};
 
                            for (var j = 0; j < thisRef.modelSetting.getExpressionNum(); j++)
                            {
                                var expName = thisRef.modelSetting.getExpressionName(j);
                                var expFilePath = thisRef.modelHomeDir +
                                    thisRef.modelSetting.getExpressionFile(j);
 
                                thisRef.loadExpression(expName, expFilePath);
                            }
                        }
                        else
                        {
                            thisRef.expressionManager = null;
                            thisRef.expressions = {};
                        }
 
 
 
                        if (thisRef.eyeBlink == null)
                        {
                            thisRef.eyeBlink = new L2DEyeBlink();
                        }
 
 
                        if (thisRef.modelSetting.getPhysicsFile() != null)
                        {
                            thisRef.loadPhysics(thisRef.modelHomeDir +
                                                thisRef.modelSetting.getPhysicsFile());
                        }
                        else
                        {
                            thisRef.physics = null;
                        }
 
 
 
                        if (thisRef.modelSetting.getPoseFile() != null)
                        {
                            thisRef.loadPose(
                                thisRef.modelHomeDir +
                                thisRef.modelSetting.getPoseFile(),
                                function() {
                                    thisRef.pose.updateParam(thisRef.live2DModel);
                                }
                            );
                        }
                        else
                        {
                            thisRef.pose = null;
                        }
 
 
 
                        if (thisRef.modelSetting.getLayout() != null)
                        {
                            var layout = thisRef.modelSetting.getLayout();
                            if (layout["width"] != null)
                                thisRef.modelMatrix.setWidth(layout["width"]);
                            if (layout["height"] != null)
                                thisRef.modelMatrix.setHeight(layout["height"]);
 
                            if (layout["x"] != null)
                                thisRef.modelMatrix.setX(layout["x"]);
                            if (layout["y"] != null)
                                thisRef.modelMatrix.setY(layout["y"]);
                            if (layout["center_x"] != null)
                                thisRef.modelMatrix.centerX(layout["center_x"]);
                            if (layout["center_y"] != null)
                                thisRef.modelMatrix.centerY(layout["center_y"]);
                            if (layout["top"] != null)
                                thisRef.modelMatrix.top(layout["top"]);
                            if (layout["bottom"] != null)
                                thisRef.modelMatrix.bottom(layout["bottom"]);
                            if (layout["left"] != null)
                                thisRef.modelMatrix.left(layout["left"]);
                            if (layout["right"] != null)
                                thisRef.modelMatrix.right(layout["right"]);
                        }
 
                        for (var j = 0; j < thisRef.modelSetting.getInitParamNum(); j++)
                        {
 
                            thisRef.live2DModel.setParamFloat(
                                thisRef.modelSetting.getInitParamID(j),
                                thisRef.modelSetting.getInitParamValue(j)
                            );
                        }
 
                        for (var j = 0; j < thisRef.modelSetting.getInitPartsVisibleNum(); j++)
                        {
 
                            thisRef.live2DModel.setPartsOpacity(
                                thisRef.modelSetting.getInitPartsVisibleID(j),
                                thisRef.modelSetting.getInitPartsVisibleValue(j)
                            );
                        }
 
 
 
                        thisRef.live2DModel.saveParam();
                        // thisRef.live2DModel.setGL(gl);
 
 
                        thisRef.preloadMotionGroup(cDefine.MOTION_GROUP_IDLE);
                        thisRef.mainMotionManager.stopAllMotions();
 
                        thisRef.setUpdating(false);
                        thisRef.setInitialized(true);
 
                        if (typeof callback == "function") callback();
 
                    }
                });
            }
        });
    });
};
 
 
 
cModel.prototype.release = function(gl)
{
    // this.live2DModel.deleteTextures();
    var pm = Live2DFramework.getPlatformManager();
 
    gl.deleteTexture(pm.texture);
}
 
 
 
cModel.prototype.preloadMotionGroup = function(name)
{
    var thisRef = this;
 
    for (var i = 0; i < this.modelSetting.getMotionNum(name); i++)
    {
        var file = this.modelSetting.getMotionFile(name, i);
        this.loadMotion(file, this.modelHomeDir + file, function(motion) {
            motion.setFadeIn(thisRef.modelSetting.getMotionFadeIn(name, i));
            motion.setFadeOut(thisRef.modelSetting.getMotionFadeOut(name, i));
        });
 
    }
}
 
 
cModel.prototype.update = function()
{
    // console.log("--> cModel.update()");
 
    if(this.live2DModel == null)
    {
        if (cDefine.DEBUG_LOG) console.error("Failed to update.");
 
        return;
    }
 
    var timeMSec = UtSystem.getUserTimeMSec() - this.startTimeMSec;
    var timeSec = timeMSec / 1000.0;
    var t = timeSec * 2 * Math.PI;
 
 
    if (this.mainMotionManager.isFinished())
    {
 
        this.startRandomMotion(cDefine.MOTION_GROUP_IDLE, cDefine.PRIORITY_IDLE);
    }
 
    //-----------------------------------------------------------------
 
 
    this.live2DModel.loadParam();
 
 
 
    var update = this.mainMotionManager.updateParam(this.live2DModel);
    if (!update) {
 
        if(this.eyeBlink != null) {
            this.eyeBlink.updateParam(this.live2DModel);
        }
    }
 
 
    this.live2DModel.saveParam();
 
    //-----------------------------------------------------------------
 
 
    if (this.expressionManager != null &&
        this.expressions != null &&
        !this.expressionManager.isFinished())
    {
        this.expressionManager.updateParam(this.live2DModel);
    }
 
 
 
    this.live2DModel.addToParamFloat("PARAM_ANGLE_X", this.dragX * 30, 1);
    this.live2DModel.addToParamFloat("PARAM_ANGLE_Y", this.dragY * 30, 1);
    this.live2DModel.addToParamFloat("PARAM_ANGLE_Z", (this.dragX * this.dragY) * -30, 1);
 
 
 
    this.live2DModel.addToParamFloat("PARAM_BODY_ANGLE_X", this.dragX*10, 1);
 
 
 
    this.live2DModel.addToParamFloat("PARAM_EYE_BALL_X", this.dragX, 1);
    this.live2DModel.addToParamFloat("PARAM_EYE_BALL_Y", this.dragY, 1);
 
 
 
    this.live2DModel.addToParamFloat("PARAM_ANGLE_X",
                                     Number((15 * Math.sin(t / 6.5345))), 0.5);
    this.live2DModel.addToParamFloat("PARAM_ANGLE_Y",
                                     Number((8 * Math.sin(t / 3.5345))), 0.5);
    this.live2DModel.addToParamFloat("PARAM_ANGLE_Z",
                                     Number((10 * Math.sin(t / 5.5345))), 0.5);
    this.live2DModel.addToParamFloat("PARAM_BODY_ANGLE_X",
                                     Number((4 * Math.sin(t / 15.5345))), 0.5);
    this.live2DModel.setParamFloat("PARAM_BREATH",
                                   Number((0.5 + 0.5 * Math.sin(t / 3.2345))), 1);
 
 
    if (this.physics != null)
    {
        this.physics.updateParam(this.live2DModel);
    }
 
 
    if (this.lipSync == null)
    {
        this.live2DModel.setParamFloat("PARAM_MOUTH_OPEN_Y",
                                       this.lipSyncValue);
    }
 
 
    if( this.pose != null ) {
        this.pose.updateParam(this.live2DModel);
    }
 
    this.live2DModel.update();
};
 
 
 
cModel.prototype.setRandomExpression = function()
{
    var tmp = [];
    for (var name in this.expressions)
    {
        tmp.push(name);
    }
 
    var no = parseInt(Math.random() * tmp.length);
 
    this.setExpression(tmp[no]);
}
 
 
 
cModel.prototype.startRandomMotion = function(name, priority)
{
    var max = this.modelSetting.getMotionNum(name);
    var no = parseInt(Math.random() * max);
    this.startMotion(name, no, priority);
}
 
 
 
cModel.prototype.startMotion = function(name, no, priority)
{
    // console.log("startMotion : " + name + " " + no + " " + priority);
 
    var motionName = this.modelSetting.getMotionFile(name, no);
 
    if (motionName == null || motionName == "")
    {
        if (cDefine.DEBUG_LOG)
            console.error("Failed to motion.");
        return;
    }
 
    if (priority == cDefine.PRIORITY_FORCE)
    {
        this.mainMotionManager.setReservePriority(priority);
    }
    else if (!this.mainMotionManager.reserveMotion(priority))
    {
        if (cDefine.DEBUG_LOG)
            console.log("Motion is running.")
        return;
    }
 
    var thisRef = this;
    var motion;
 
    if (this.motions[name] == null)
    {
        this.loadMotion(name, this.modelHomeDir + motionName, function(mtn) {
            motion = mtn;
 
 
            thisRef.setFadeInFadeOut(name, no, priority, motion);
            
        });
    }
    else
    {
        motion = this.motions[name];
 
 
        thisRef.setFadeInFadeOut(name, no, priority, motion);
    }
}
 
 
cModel.prototype.setFadeInFadeOut = function(name, no, priority, motion)
{
    var motionName = this.modelSetting.getMotionFile(name, no);
 
    motion.setFadeIn(this.modelSetting.getMotionFadeIn(name, no));
    motion.setFadeOut(this.modelSetting.getMotionFadeOut(name, no));
 
 
    if (cDefine.DEBUG_LOG)
            console.log("Start motion : " + motionName);
 
    if (this.modelSetting.getMotionSound(name, no) == null)
    {
        this.mainMotionManager.startMotionPrio(motion, priority);
    }
    else
    {
        var soundName = this.modelSetting.getMotionSound(name, no);
        // var player = new Sound(this.modelHomeDir + soundName);
 
        var snd = document.createElement("audio");
        snd.src = this.modelHomeDir + soundName;
 
        if (cDefine.DEBUG_LOG)
            console.log("Start sound : " + soundName);
 
        snd.play();
        this.mainMotionManager.startMotionPrio(motion, priority);
    }
}
 
 
 
cModel.prototype.setExpression = function(name)
{
    var motion = this.expressions[name];
 
    if (cDefine.DEBUG_LOG)
        console.log("Expression : " + name);
 
    this.expressionManager.startMotion(motion, false);
}
 
 
 
cModel.prototype.draw = function(gl)
{
    //console.log("--> cModel.draw()");
 
    // if(this.live2DModel == null) return;
 
 
    MatrixStack.push();
 
    MatrixStack.multMatrix(this.modelMatrix.getArray());
 
    this.tmpMatrix = MatrixStack.getMatrix()
    this.live2DModel.setMatrix(this.tmpMatrix);
    this.live2DModel.draw();
 
    MatrixStack.pop();
 
};
 
 
 
cModel.prototype.hitTest = function(id, testX, testY)
{
    var len = this.modelSetting.getHitAreaNum();
    for (var i = 0; i < len; i++)
    {
        if (id == this.modelSetting.getHitAreaName(i))
        {
            var drawID = this.modelSetting.getHitAreaID(i);
 
            return this.hitTestSimple(drawID, testX, testY);
        }
    }
 
    return false;
}
/**
 * @description The container and manager for all the DOM and WebGL emelents.
 */
 
 
import { config } from './config/configMgr';
import { L2Dwidget } from './index';
import { createDialogElement } from './dialog';
 
/**
 * The current WebGL element
 * @type {RenderingContext}
 */
 
let currWebGL = undefined;
 
/**
 * The current canvas element
 * @type {HTMLElement}
 */
 
let currCanvas;
 
 
/**
 * Create the canvas and styles using DOM
 * @return {null}
 */
 
function createElement() {
 
  let e = document.getElementById(config.name.div)
  if (e !== null) {
    document.body.removeChild(e);
  }
 
  let newElem = document.createElement('div');
  newElem.id = config.name.div;
  newElem.className = 'live2d-widget-container';
  newElem.style.setProperty('position', 'fixed');
  newElem.style.setProperty(config.display.position, config.display.hOffset + 'px');
  newElem.style.setProperty('bottom', config.display.vOffset + 'px');
  newElem.style.setProperty('width', config.display.width + 'px');
  newElem.style.setProperty('height', config.display.height + 'px');
  newElem.style.setProperty('z-index', 99999);
  newElem.style.setProperty('opacity', config.react.opacity);
  newElem.style.setProperty('pointer-events', 'none');
  document.body.appendChild(newElem);
  L2Dwidget.emit('create-container', newElem);
 
  if (config.dialog.enable)
    createDialogElement(newElem);
 
  let newCanvasElem = document.createElement('canvas');
  newCanvasElem.setAttribute('id', config.name.canvas);
  newCanvasElem.setAttribute('width', config.display.width * config.display.superSample);
  newCanvasElem.setAttribute('height', config.display.height * config.display.superSample);
  newCanvasElem.style.setProperty('position', 'absolute');
  newCanvasElem.style.setProperty('left', '0px');
  newCanvasElem.style.setProperty('top', '0px');
  newCanvasElem.style.setProperty('width', config.display.width + 'px');
  newCanvasElem.style.setProperty('height', config.display.height + 'px');
  if (config.dev.border) newCanvasElem.style.setProperty('border', 'dashed 1px #CCC');
  newElem.appendChild(newCanvasElem);
 
  currCanvas = document.getElementById(config.name.canvas);
  L2Dwidget.emit('create-canvas', newCanvasElem);
 
  initWebGL();
 
}
 
/**
 * Find and set the current WebGL element to the container
 * @return {null}
 */
 
function initWebGL() {
 
  var NAMES = ['webgl2', 'webgl', 'experimental-webgl2', 'experimental-webgl', 'webkit-3d', 'moz-webgl'];
  for (let i = 0; i < NAMES.length; i++) {
    try {
      let ctx = currCanvas.getContext(NAMES[i], {
        alpha: true,
        antialias: true,
        premultipliedAlpha: true,
        failIfMajorPerformanceCaveat: false,
      });
      if (ctx) currWebGL = ctx;
    } catch (e) { }
  }
  if (!currWebGL) {
    console.error('Live2D widgets: Failed to create WebGL context.');
    if (!window.WebGLRenderingContext) {
      console.error('Your browser may not support WebGL, check https://get.webgl.org/ for futher information.');
    }
    return;
  }
};
 
 
export {
  createElement,
  currWebGL,
  currCanvas,
}
/**
 * @description Automatic locate the publicPath and set it up for webpack.
 */
 
 
'use strict';
 
/**
 * Get current script path
 * @return {String} The path of current script
 * @example
 * get 'file:///C:/git/live2d-widget/dev/bundle.js' or 'https://www.host.com/test/js/bundle.js'
 */
 
function getCurrentPath(){
 
  try{
 
    // FF, Chrome, Modern browsers
    // use their API to get the path of current script
 
    // a.b();
    // console.log('wpStage1');
 
    return document.currentScript.src;
 
    if(DOC.currentScript){ // FF 4+
      return DOC.currentScript.src;
    }
 
  }catch(e){
 
    // document.currentScript doesn't supports
 
    // console.log('wpStage2');
 
    // Method 1
    // https://github.com/mozilla/pdf.js/blob/e081a708c36cb2aacff7889048863723fcf23671/src/shared/compatibility.js#L97
    // IE, Chrome < 29
 
    let scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1].src;
 
/*
    // Method 2
    // parse the error stack trace maually
    // https://github.com/workhorsy/uncompress.js/blob/master/js/uncompress.js#L25
 
    let stack = e.stack;
    let line = null;
 
    // Chrome and IE
    if (stack.indexOf('@') !== -1) {
      line = stack.split('@')[1].split('\n')[0];
    // Firefox
    } else {
      line = stack.split('(')[1].split(')')[0];
    }
    line = line.substring(0, line.lastIndexOf('/')) + '/';
    return line;
*/
/*
    // Method 3
    // https://www.cnblogs.com/rubylouvre/archive/2013/01/23/2872618.html
 
    let stack = e.stack;
    if(!stack && window.opera){
      // Opera 9没有e.stack,但有e.Backtrace,但不能直接取得,需要对e对象转字符串进行抽取
      stack = (String(e).match(/of linked script \S+/g) || []).join(' ');
    }
    if(stack){
      // e.stack最后一行在所有支持的浏览器大致如下:
      // chrome23:
      // @ http://113.93.50.63/data.js:4:1
      // firefox17:
      // @http://113.93.50.63/query.js:4
      // opera12:
      // @http://113.93.50.63/data.js:4
      // IE10:
      // @ Global code (http://113.93.50.63/data.js:4:1)
      stack = stack.split(/[@ ]/g).pop(); // 取得最后一行,最后一个空格或@之后的部分
      stack = stack[0] == '(' ? stack.slice(1,-1) : stack;
      return stack.replace(/(:\d+)?:\d+$/i, ''); // 去掉行号与或许存在的出错字符起始位置
    }
    let nodes = head.getElementsByTagName('script'); // 只在head标签中寻找
    for(var i = 0, node; node = nodes[i++];){
      if(node.readyState === 'interactive'){
        return node.className = node.src;
      }
    }
*/
  }
 
}
 
// expose the path to the global,
// and wp will finish the following work
__webpack_public_path__ = getCurrentPath().replace(/[^/\\\\]+$/, '');
if (process.env.NODE_ENV === 'development'){
  console.log(`Live2Dwidget: publicPath: ${__webpack_public_path__}`);
}
 
export {
  getCurrentPath,
}

var Lau = {};
Lau.getScroll = function(){
  if(window.pageYOffset){
    return {
      x : window.pageXOffset,
      y : window.pageYOffset
    }
  }else{
    return {
      x : document.body.scrollLeft + document.documentElement.scrollLeft,
      y : document.body.scrollTop + document.documentElement.scrollTop
    }
  }
}


Lau.getViewportOffset = function(){
  if(window.clientHeight){
    return {
      x : window.clientWidth,
      y : window.clientHeight
    }
  }else{
    if(document.compatMode === 'CSS1Compat') {
      return {
        x : document.documentElement.clientWidth,
        y : document.documentElement.clientHeight
      }
    }else{
      return {
        x : document.body.clientWidth,
        y : document.body.clientHeight
      }
    }
  }
}

Lau.getStyle = function(ele, prop){
  if(window.getComputedStyle){
    return window.getComputedStyle(ele, null)[prop]
  }else{
    return ele.currentStyle[prop]
  }
}

// 求任意元素在文档的坐标
Lau.getElePos = function(ele){
  var x = ele.offsetLeft,
      y = ele.offsetTop;
  while (ele.offsetParent) {
    ele = ele.offsetParent;
    x += ele.offsetLeft;
    y += ele.offsetTop;
  }
  return {x: x, y : y};
}

// 添加事件
Lau.addEvent = function(ele,type,fn){
  if(ele.addEventListener){
    ele.addEventListener(type, fn, false);
  }else if(ele.attachEvent){
    var fnName = fn.name || fn.toString().match(/function\s*([^(]*)\(/)[1]; //获取函数名字兼容
    var fnUsual = function(){
      fn.call(ele); //保证this指向
    }
    if(fnName !== ''){ //当 不为匿名函数的时候
      ele[fnName] = fnUsual; //方便在外头取消绑定
    }
    ele.attachEvent('on' + type, fnUsual);
  }else{
    ele['on' + type] = fn;
  }
}
// 取消冒泡
Lau.stopBubble = function(e){
  if(e.stopPropagation){
    e.stopPropagation();
  }else{
    e.cancelBubble = true;
  }
}
// 取消默认事件
// return false
Lau.cancelHandler = function(e){
  if(e.preventDefault){
    e.preventDefault();
  }else{
    e.returnValue = false;
  }
}

// 拖拽  pageX 在ie9以下用不了
Lau.drag = function(ele){
  var disX, disY;
  Lau.addEvent(ele, 'mousedown' , function(e){
    var e = e || window.event;
    disX = e.pageX - ele.offsetLeft;
    disY = e.pageY - ele.offsetTop; 
    Lau.addEvent(document, 'mousemove',fnMove);
    Lau.addEvent(document, 'mouseup', fnUp);
  })
  function fnMove(e){
    var e = e || window.event;
    ele.style.left = e.pageX - disX + 'px';
    ele.style.top = e.pageY - disY + 'px';
  }
  function fnUp(e){
    var e = e || window.event;
    if(document.removeEventListener){
      document.removeEventListener('mousemove', fnMove);
    }else{
      document.detachEvent('onmousemove', document['fnMove']);
    }
  }
}

// 异步加载脚本
 Lau.loadScript = function(src,callback){
  var script = document.createElement('script');
  var head = document.getElementsByTagName('head')[0];
  script.type = 'text/javascript';
  head.appendChild(script);
  
  if(script.readyState){
    script.onreadystatechange = function(){
      if(script.readyState == 'complete' || script.readyState == 'loader'){
        callback();
      }
    }
  }else{
    script.onload = function(){
      callback();
      // eval
      // obj[callback]();
    }
  }
  
  script.src = src; // 放下面最后 防止网速快 readyState 不变
}



// css(兼容transform部分待完善)
Lau.css = function(ele,type,value){
  var arg = arguments,
      len = arg.length,
      ele = arg[0],
      type = arg[1],
      value = arg[2];
  
  // 只有两个参数
  if(len === 2){
    
    if(typeof type === 'object'){
      // 设置一组属性值
      for(var key in type){
        set(key,type[key]);
      }
      return
    }
    
    if(type.trim() === '' ){
      // 清空行间样式
      ele.style.cssText = '';
      return
    }
    
    if(typeof type === 'string'){
      // 查找属性值
      if(styleTransform(type)){
        return ele.transformAttr[type]
      }
      
      if(window.getComputedStyle){
        return window.getComputedStyle(ele,null)[type]
      }else{
        return ele.currentStyle[type]
      }
    }
  }
  
  // 三个参数
  if(len === 3){
    set(type,value);
  }
  
  // 判断是否使用px  是否属于transform属性  再设置
  function set(type,value){
    if(styleUsePx(type)){
      ele.style[type] = parseFloat(value) + 'px';
    }else if(styleTransform(type)){
      var attr = ele.transformAttr = ele.transformAttr || {},
          str = '';
          
      attr[type] = value;
      
      for(var key in attr){
        
        // deg px 两种单位
        switch(key){
          case 'translateX':
          case 'translateY':
          case 'translateZ':
          str += attr[key] === ''? ``: `${key}(${attr[key]}px)`;
          break;
          
          case 'rotate':
          case 'rotateX':
          case 'rotateY':
          case 'skew':
          case 'skewX':
          case 'skewY':
          str += attr[key] === ''? `` :`${key}(${attr[key]}deg)`;
          break;
          
          default:
          str += attr[key] === ''? `` :`${key}(${attr[key]})`;
        }
      }
      ele.style.transform = str;
    }else{
      ele.style[type] = value;
    }
  }
  
  // 常用px
  function styleUsePx(type){
    return type ==='left'||type ==='right'||type ==='bottom'||type ==='top'||type ==='width'
    ||type ==='height'||type ==='margin-top'||type ==='margin-right'||type ==='margin-bottom'
    ||type ==='margin-left'||type ==='padding-top'||type ==='padding-right'||type ==='padding-bottom'
    ||type ==='padding-left';
  }
  
  //transform
  function styleTransform(type){
    return type === 'skew'||type === 'skewX'||type === 'skewY'||type === 'rotate'||
    type === 'rotateX'||type==='rotateY'||type==='translateX'||type==='translateY'||
    type === 'scale'||type === 'scaleX'||type === 'scaleY';
  }
}
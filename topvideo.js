var sUserAgent = navigator.userAgent.toLowerCase();
var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
var bIsMidp = sUserAgent.match(/midp/i) == "midp";
var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
var bIsAndroid = sUserAgent.match(/android/i) == "android";
var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
if (!(bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM)) {
    // 判断 header里是否存在full_page
    if($("#page-header").hasClass("full_page")){
      // 插入<video>
      var html = "<video id='video' muted loop autoplay style='height: 100%;width: 100%;object-fit: cover;'></video>";
      document.getElementsByClassName("full_page")[0].innerHTML += html;
      // 获取 <video>
      var video = document.getElementById('video');
      // 插入视频(m3u8)
      var videoSrc = 'https://cdn.jsdelivr.net/gh/Time-litwhite/Time-litwhite.github.io/img/video/video.m3u8';
      if (Hls.isSupported()) {
        var hls = new Hls();
        hls.loadSource(videoSrc);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
          video.play();
        });
      }
    }
}else{
  // 判断 header里是否存在full_page
  if($("#page-header").hasClass("full_page")){
    // 插入<video>
    var html = "<video id='video' muted loop autoplay style='height: 100%;width: 100%;object-fit: cover;'></video>";
    document.getElementsByClassName("full_page")[0].innerHTML += html;
    // 获取 <video>
    var video = document.getElementById('video');
    // 插入视频(m3u8)
    var videoSrc = 'https://cdn.jsdelivr.net/gh/Time-litwhite/Time-litwhite.github.io/img/video/video.m3u8';
    if (Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(videoSrc);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
        video.play();
      });
    }
  }
}
if($("#page-header").hasClass("full_page")){
  var sub = new Array("人生只有一次，大胆的生活！！", "Life only once, live boldly!!");

  var randomSub = Math.floor((Math.random() * sub.length));

  var subtitle = document.getElementById('subtitle')
  var i = 0; 
  function typing() {
    var timer = 0; var str = sub[randomSub];
    if (i <= str.length) {
        subtitle.innerHTML = str.slice(0, i++)
        timer = setTimeout(typing, 200)
    }else{
      subtitle.innerHTML = str
      clearTimeout(timer)
    }
  }
  typing()
}

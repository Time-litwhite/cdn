  
 var OriginTitle = document.title;
 var titleTime;
 document.addEventListener('visibilitychange', function() {
     if (document.hidden) {
         $('[rel="icon"]').attr('href', "/img/favicon.ico");
         document.title = 'ヽ(●-`Д´-)ノ你要玩捉迷藏嘛';
         clearTimeout(titleTime);
     } else {
         $('[rel="icon"]').attr('href', "/img/favicon.ico");
         document.title = '(Ő∀Ő3)ノ好哦！' + OriginTitle;
         titleTime = setTimeout(function() {
             document.title = OriginTitle;
         }, 2000);
     }
 });

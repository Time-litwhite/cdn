const catalogMagnet = new Vue({
	el:'#catalogMagnet',
	data:{
		message:'你好！欢迎访问我的主页zfe.space!',
		link: [],
		postnum:[],
		//这里是磁贴背景图片
		img:[
			"/images/1.JPG",
			"/images/2.JPG",
			"/images/3.JPG",
			"/images/4.JPG",
			"/images/5.JPG",
			"/images/6.JPG",
			"/images/7.JPG",
			"/images/8.JPG",
      "/images/9.JPG",
      "/images/10.JPG",
      "/images/11.JPG",
      "/images/12.JPG",
      "/images/13.JPG",
      "/images/14.JPG",
      "/images/15.JPG",
      "/images/16.JPG",
      "/images/17.JPG",
      "/images/18.JPG",
      "/images/19.JPG",
      "/images/20.JPG",
      "/images/21.JPG",
		],
		//这里是磁贴描述信息
		describe:[
			"vue学习记录",
			"我的各种作品",
			"我的学习整理",
			"我的各种教程",
			"我的游戏评测",
			"生活点点滴滴",
			"一切胡思乱想",
		],
		//这里是磁贴的文字颜色
		figLetColor: {color:'white'},
		//这里是磁贴的文字遮罩
		figLetimg: {backgroundImage: 'linear-gradient(to bottom,rgba(0, 0, 0, 0.4) 25%,rgba(16,16,16,0) 100%)'},
		//这里是当磁贴图片为透明背景png时默认展示的背景颜色
		figbackColor: {background:'#000000 URL()'},
		//这里是当磁贴图片为透明背景png时默认展示的凹凸效果
		figShadow: {boxShadow: 'inset 3px 3px 18px 0px rgba(50,50,50, 0.4)'},
	},

})

catalogMagnet.link = $(".categoryMagnetitem").children().children().children("a");
catalogMagnet.postnum = $(".categoryMagnetitem").children().children().children("span");
let linecolor = catalogMagnet.figLetColor.color
$("<style type='text/css' id='dynamic-after' />").appendTo("head");
$("#dynamic-after").text(".magnetname:after{background:" + linecolor + "!important}");

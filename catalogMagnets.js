const catalogMagnet = new Vue({
	el:'#catalogMagnet',
	data:{
		message:'你好！欢迎访问我的主页 时光微亮 w(ﾟДﾟ)w !',
		link: [],
		postnum:[],
		//这里是磁贴背景图片
		img:[
			"http://pic1.win4000.com/wallpaper/2018-10-20/5bcae76023929.jpg",
			"https://images2.alphacoders.com/998/thumb-1920-998287.jpg",
			"https://images3.alphacoders.com/111/thumb-1920-1111062.png",
			"https://img2.huashi6.com/images/resource/2020/11/30/8600h7884p0.png?imageView2/3/q/100/interlace/1/w/1600/h/1600/format/webp",
			"https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3206960973,3220443373&fm=26&gp=0.jpg",
			"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=614092072,2786645878&fm=26&gp=0.jpg",
			"https://img2.huashi6.com/images/resource/2017/07/15/638h71867p0.png?imageView2/3/q/100/interlace/1/w/1600/h/1600/format/webp",
			"https://img2.huashi6.com/images/resource/2019/04/07/74079h941p0.jpg?imageView2/3/q/100/interlace/1/w/1600/h/1600/format/webp",
		],
		//这里是磁贴描述信息
		describe:[
			"学习记录",
			"我的各种作品",
			"我的思考感悟",
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

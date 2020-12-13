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
			"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1607871324935&di=eb1d21d95c75ebdd94c8f9df02187306&imgtype=0&src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F15%2F20200215163751_fxdqn.thumb.400_0.jpg",
			"https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=3206960973,3220443373&fm=26&gp=0.jpg",
			"https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=614092072,2786645878&fm=26&gp=0.jpg",
			"https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1607871324929&di=5fb81170a36cd65b1ef3b420c466906e&imgtype=0&src=http%3A%2F%2Finews.gtimg.com%2Fnewsapp_match%2F0%2F10390029617%2F0.jpg",
			"https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3405443497,290088942&fm=175&app=25&f=JPG?w=640&h=705&s=15F065374D1352D85C6C29EE0300A022",
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

/**
 * Created by css on 2016/4/18.
 */

// -------CityImg-----------------------------------------------------------------------------------------
function CityImg(ws, hs) {
    // 23 * 33; 15 * 20; 12 * 17
    this.chaoImg = null;
    this.daImg = null;
    this.xiaoImg = null;

    this.chaoWidth = 11.5;
    this.chaoHeight = 33;
    this.daWidth = 7.5;
    this.daHeight = 20;
    this.xiaoWidth = 6;
    this.xiaoHeight = 17;

    // 图片伸缩比
    this.wscale = ws;
    this.hscale = hs;

    // 绘制的文字
    this.textcont = '';
}
// 设置
CityImg.prototype.setImgs = function (imgchao, imgda, imgxiao) {
    this.chaoImg = imgchao;
    this.daImg = imgda;
    this.xiaoImg = imgxiao;
};
// 绘制 大小城市图
CityImg.prototype.drawImg = function (CGD, singlecityPo) {
    CGD.save();
    CGD.scale(this.wscale,this.hscale);
    if (singlecityPo.isBig) {
        CGD.drawImage(this.daImg, (singlecityPo.posX - this.daWidth), (singlecityPo.posY - this.daHeight));
    } else {
        CGD.drawImage(this.xiaoImg, (singlecityPo.posX - this.xiaoWidth), (singlecityPo.posY - this.xiaoHeight));
    }
    CGD.restore();
};
// 绘制 端点
CityImg.prototype.drawPointImg = function (CGD, singlecityPo) {
    CGD.save();
    CGD.scale(this.wscale,this.hscale);
    CGD.drawImage(this.chaoImg, (singlecityPo.posX - this.chaoWidth), (singlecityPo.posY - this.chaoHeight));
    CGD.restore();
};
// 绘制文字
CityImg.prototype.drawText = function (CGD, singlecityPo, offsetVal) {
    CGD.font='bold  20px Verdana';
    this.textcont = singlecityPo.zhcity + ':' + singlecityPo.housePrice;
    CGD.save();
    CGD.scale(this.wscale,this.hscale);
    if (singlecityPo.posX > 550) {
        CGD.fillText(this.textcont, (singlecityPo.posX - this.chaoWidth)-70, (singlecityPo.posY - this.xiaoHeight) + offsetVal);
    } else {
        CGD.fillText(this.textcont, (singlecityPo.posX - this.chaoWidth)-40, (singlecityPo.posY - this.xiaoHeight) + offsetVal);
    }

    CGD.restore();
};
// ----end---CityImg-----------------------------------------------------------------------------------------

// -------CityPo-----------------------------------------------------------------------------------------
function CityPo() {
    this.options = {
        cityArr:[
            {cityIndex:0,encity:'xj',zhcity:'乌鲁木齐',posX:161,posY:147,isBig:true},
            {cityIndex:1,encity:'lasa',zhcity:'拉萨',posX:187,posY:343,isBig:true},
            {cityIndex:2,encity:'xn',zhcity:'西宁',posX:293,posY:265,isBig:true},
            {cityIndex:3,encity:'yinchuan',zhcity:'银川',posX:364,posY:232,isBig:true},
            {cityIndex:4,encity:'nm',zhcity:'呼和浩特',posX:395,posY:204,isBig:true},
            {cityIndex:5,encity:'cd',zhcity:'成都',posX:345,posY:342,isBig:true},
            {cityIndex:6,encity:'cq',zhcity:'重庆',posX:375,posY:363,isBig:true},
            {cityIndex:7,encity:'km',zhcity:'昆明',posX:327,posY:425,isBig:true},
            {cityIndex:8,encity:'gy',zhcity:'贵阳',posX:362,posY:409,isBig:true},
            {cityIndex:9,encity:'lz',zhcity:'兰州',posX:342,posY:278,isBig:true},
            {cityIndex:10,encity:'hrb',zhcity:'哈尔滨',posX:570,posY:101,isBig:true},
            {cityIndex:11,encity:'changchun',zhcity:'长春',posX:561,posY:131,isBig:true},
            {cityIndex:12,encity:'jl',zhcity:'吉林',posX:579,posY:131,isBig:false},
            {cityIndex:13,encity:'qhd',zhcity:'秦皇岛',posX:524,posY:180,isBig:true},
            {cityIndex:14,encity:'sy',zhcity:'沈阳',posX:546,posY:170,isBig:false},
            {cityIndex:15,encity:'ts',zhcity:'唐山',posX:507,posY:196,isBig:false},
            {cityIndex:16,encity:'dl',zhcity:'大连',posX:543,posY:199,isBig:false},
            {cityIndex:17,encity:'bj',zhcity:'北京',posX:477,posY:199,isBig:true},
            {cityIndex:18,encity:'yanjiao',zhcity:'燕郊',posX:489,posY:189,isBig:true},
            {cityIndex:19,encity:'bd',zhcity:'保定',posX:457,posY:199,isBig:true},
            {cityIndex:20,encity:'tj',zhcity:'天津',posX:489,posY:209,isBig:true},
            {cityIndex:21,encity:'sjz',zhcity:'石家庄',posX:458,posY:224,isBig:true},
            {cityIndex:22,encity:'taiyuan',zhcity:'太原',posX:430,posY:247,isBig:true},
            {cityIndex:23,encity:'jn',zhcity:'济南',posX:494,posY:254,isBig:true},
            {cityIndex:24,encity:'zb',zhcity:'淄博',posX:501,posY:248,isBig:false},
            {cityIndex:25,encity:'wf',zhcity:'潍坊',posX:511,posY:250,isBig:false},
            {cityIndex:26,encity:'yt',zhcity:'烟台',posX:533,posY:238,isBig:false},
            {cityIndex:27,encity:'weihai',zhcity:'威海',posX:542,posY:234,isBig:false},
            {cityIndex:28,encity:'qd',zhcity:'青岛',posX:517,posY:262,isBig:false},
            {cityIndex:29,encity:'rz',zhcity:'日照',posX:507,posY:274,isBig:false},
            {cityIndex:30,encity:'xz',zhcity:'徐州',posX:495,posY:284,isBig:false},
            {cityIndex:31,encity:'kaifeng',zhcity:'开封',posX:470,posY:279,isBig:false},
            {cityIndex:32,encity:'zz',zhcity:'郑州',posX:455,posY:281,isBig:true},
            {cityIndex:33,encity:'ly',zhcity:'洛阳',posX:438,posY:287,isBig:false},
            {cityIndex:34,encity:'xian',zhcity:'西安',posX:393,posY:290,isBig:true},
            {cityIndex:35,encity:'huainan',zhcity:'淮南',posX:480,posY:301,isBig:false},
            {cityIndex:36,encity:'nanjing',zhcity:'南京',posX:514,posY:307,isBig:true},
            {cityIndex:37,encity:'suzhou',zhcity:'苏州',posX:534,posY:310,isBig:false},
            {cityIndex:38,encity:'cz',zhcity:'常州',posX:523,posY:301,isBig:false},
            {cityIndex:39,encity:'yz',zhcity:'扬州',posX:524,posY:295,isBig:false},
            {cityIndex:40,encity:'wuxi',zhcity:'无锡',posX:530,posY:309,isBig:false},
            {cityIndex:41,encity:'sh',zhcity:'上海',posX:552,posY:319,isBig:true},
            {cityIndex:42,encity:'jx',zhcity:'嘉兴',posX:541,posY:326,isBig:false},
            {cityIndex:43,encity:'huzhou',zhcity:'湖州',posX:522,posY:319,isBig:false},
            {cityIndex:44,encity:'hf',zhcity:'合肥',posX:496,posY:323,isBig:true},
            {cityIndex:45,encity:'wuhan',zhcity:'武汉',posX:464,posY:345,isBig:false},
            {cityIndex:46,encity:'yc',zhcity:'宜昌',posX:441,posY:343,isBig:false},
            {cityIndex:47,encity:'changde',zhcity:'常德',posX:425,posY:367,isBig:true},
            {cityIndex:48,encity:'nc',zhcity:'南昌',posX:489,posY:371,isBig:true},
            {cityIndex:49,encity:'hz',zhcity:'杭州',posX:535,posY:343,isBig:true},
            {cityIndex:50,encity:'sx',zhcity:'绍兴',posX:540,posY:351,isBig:false},
            {cityIndex:51,encity:'nb',zhcity:'宁波',posX:551,posY:356,isBig:false},
            {cityIndex:52,encity:'jh',zhcity:'金华',posX:536,posY:366,isBig:false},
            {cityIndex:53,encity:'wz',zhcity:'温州',posX:544,posY:380,isBig:false},
            {cityIndex:54,encity:'cs',zhcity:'长沙',posX:454,posY:390,isBig:true},
            {cityIndex:55,encity:'fz',zhcity:'福州',posX:527,posY:405,isBig:true},
            {cityIndex:56,encity:'qz',zhcity:'泉州',posX:522,posY:418,isBig:false},
            {cityIndex:57,encity:'xm',zhcity:'厦门',posX:516,posY:399,isBig:false},
            {cityIndex:58,encity:'gy',zhcity:'贵阳',posX:363,posY:409,isBig:true},
            {cityIndex:59,encity:'guilin',zhcity:'桂林',posX:411,posY:424,isBig:false},
            {cityIndex:60,encity:'gz',zhcity:'广州',posX:462,posY:430,isBig:true},
            {cityIndex:61,encity:'dg',zhcity:'东莞',posX:472,posY:431,isBig:false},
            {cityIndex:62,encity:'sz',zhcity:'深圳',posX:487,posY:444,isBig:false},
            {cityIndex:63,encity:'zh',zhcity:'珠海',posX:457,posY:456,isBig:false},
            {cityIndex:64,encity:'fs',zhcity:'佛山',posX:450,posY:447,isBig:false},
            {cityIndex:65,encity:'jm',zhcity:'江门',posX:440,posY:451,isBig:false},
            {cityIndex:66,encity:'nn',zhcity:'南宁',posX:395,posY:454,isBig:true},
            {cityIndex:67,encity:'hn',zhcity:'海口',posX:422,posY:502,isBig:false},
            {cityIndex:68,encity:'sanya',zhcity:'三亚',posX:415,posY:516,isBig:false},
            {cityIndex:69,encity:'huizhou',zhcity:'惠州',posX:499,posY:417,isBig:false}

        ],
        cityStore:new Array,
        nodeStore:new Array
    };
}
// 初始绘线参数
CityPo.prototype.initPara = function (str) {
    if(str){
        var tempArrone = str.split(';');
        var templen = tempArrone.length;
        var tempArrtwo = [];
        var temCityArr = this.options.cityArr;

        var temIndex = 0;
        var temWeight = 0;
        for (var i = templen - 1; i > -1;i--) {
            tempArrtwo = tempArrone[i].split('+');
            temIndex = Number(tempArrtwo[0]);
            temWeight = Number(tempArrtwo[1]);
            this.options.cityStore.push({encity: temCityArr[temIndex].encity,
                zhcity: temCityArr[temIndex].zhcity,
                posX: temCityArr[temIndex].posX,
                posY: temCityArr[temIndex].posY,
                isBig: temCityArr[temIndex].isBig,
                weightVal: temWeight,
                housePrice: tempArrtwo[2]
            });
        }
    }
};
// 初始端点参数  index+weight+price
CityPo.prototype.initNodeStore = function (nodeCitystr) {
    var temCityArr = this.options.cityArr;

    // -----启始结束城市-------------------------------
    var tempArr = nodeCitystr.split('+');
    var temIndex = Number(tempArr[0]);
    var temWeight = Number(tempArr[1]);
    this.options.nodeStore.push({encity: temCityArr[temIndex].encity,
        zhcity: temCityArr[temIndex].zhcity,
        posX: temCityArr[temIndex].posX,
        posY: temCityArr[temIndex].posY,
        isBig: temCityArr[temIndex].isBig,
        weightVal: temWeight,
        housePrice: tempArr[2]
    });
};

// 比较数字大小 依据weightVal
CityPo.prototype.compareArr = function (objone, objtwo) {
    if(objone.weightVal < objtwo.weightVal){
        return -1;
    } else {
        return 1;
    }
};
// 打印存储数组
CityPo.prototype.sortArrByWeight = function () {
    this.options.cityStore.sort(this.compareArr);
};
// ----end---CityPo-----------------------------------------------------------------------------------------

// ------DashLine-------------------------------------------------------------------------------------------------
function DashLine(cwidth, chight, dashLength, ws, hs) {
    // canvas 宽高
    this.cwidth = cwidth;
    this.chight = chight;

    this.ws = ws;
    this.hs = hs;
    /*    // 开始 结束点坐标
     this.startX = startX * ws;
     this.startY = startY * hs;
     this.endX = endX * ws;
     this.endY = endY * hs;*/

    // 两点点距离
    this.sDistanceLen = 0;
    // 是否只启始点较 结束点 小
    this.isHorX = true;
    this.isVerY = true;

    // 总已绘线长度
    this.growXDis = 0;
    this.growYDis = 0;
    this.growDis = 0;

    // 单次画长度
    this.growSingleXDis = 0;
    this.growSingleYDis = 0;

    this.growSingleDis = 0;
    this.growJudgeDis = 0;

    // x,y各自绘长度
    this.distiX = 0;
    this.distiY = 0;

    // ------------
    this.dashLen = dashLength === undefined ? 5 : dashLength;
    // 横向的宽度;
    this.xpos = 0;
    // 得到纵向的高度;
    this.ypos = 0;
    this.numDashes = 0;

    this.initLineParam();
}
// 设置绘制线的开始结束点坐标
DashLine.prototype.setLinePara = function (startX, startY, endX,endY) {
    // 开始 结束点坐标
    this.startX = startX * this.ws;
    this.startY = startY * this.hs;
    this.endX = endX * this.ws;
    this.endY = endY * this.hs;
};
// 初始化参数
DashLine.prototype.initLineParam = function () {
    // 不考虑  两点重合
    this.sDistanceLen = Math.floor(Math.sqrt((this.endX - this.startX) * (this.endX - this.startX) + (this.endY - this.startY) * (this.endY - this.startY)));
    if (this.endX !== this.startX) {
        this.growSingleXDis = Math.abs((this.endX - this.startX) / this.sDistanceLen);
        this.growSingleDis = this.growSingleXDis;
        this.growJudgeDis = Math.abs(this.endX - this.startX);
    }
    if (this.endY !== this.startY) {
        this.growSingleYDis = Math.abs((this.endY - this.startY) / this.sDistanceLen);
        this.growSingleYDis = Math.abs((this.endY - this.startY) / this.sDistanceLen);
        this.growSingleDis = this.growSingleYDis;
        this.growJudgeDis = Math.abs(this.endY - this.startY);
    }

    this.growDis = 0;
    this.growXDis = 0;
    this.growYDis = 0;
    if (this.startX < this.endX) {
        this.isHorX = true;
    } else {
        this.isHorX = false;
    }
    if (this.startY < this.endY) {
        this.isVerY = true;
    } else {
        this.isVerY = false;
    }
};

// 初始绘线参数
DashLine.prototype.initDrawPara = function () {
    this.xpos = this.distiX - this.startX;
    this.ypos = this.distiY - this.startY;
    this.numDashes = Math.floor(Math.sqrt(this.xpos * this.xpos + this.ypos * this.ypos) / this.dashLen);
};

// 判断是否可继续画
DashLine.prototype.isContinueDraw = function () {
    if (this.growDis < this.growJudgeDis) {
        return true;
    } else {
        return false;
    }
};

// 设置绘线参数
DashLine.prototype.setDrawPara = function () {
    this.growDis += this.growSingleDis;

    this.growXDis += this.growSingleXDis;
    this.growYDis += this.growSingleYDis;

    if (this.isHorX) {
        this.distiX = this.startX + this.growXDis;
    } else {
        this.distiX = this.startX - this.growXDis;
    }
    if (this.isVerY) {
        this.distiY = this.startY + this.growYDis;
    } else {
        this.distiY = this.startY - this.growYDis;
    }
};

// 绘制dashline
DashLine.prototype.drawDashLine = function (CGD) {
    CGD.clearRect(0, 0, this.cwidth, this.chight);
    this.initDrawPara();
    CGD.moveTo(this.startX, this.startY);
    // 利用正切获取斜边的长度除以虚线长度，得到要分为多少段;
    for (var i = 0; i < this.numDashes; i++) {
        if (i % 2 === 0) {
            CGD.moveTo(this.startX + this.xpos / this.numDashes * i, this.startY + this.ypos / this.numDashes * i);
            // 有了横向宽度和多少段，得出每一段是多长，起点 + 每段长度 * i = 要绘制的起点；
        } else {
            CGD.lineTo(this.startX + this.xpos / this.numDashes * i, this.startY + this.ypos / this.numDashes * i);
        }
    }
    CGD.stroke();
};
// --------end---DashLine---------------------------------------------------------------------------------

/**
 * Created by css on 2016/4/17.
 */

$(function (){
    'use strict';

    var divWidth = $('#s_ditu_js').width();
    var divHeight = $('#s_ditu_js').height();
    var canvas = document.getElementById('canvas_js');
    var CGD = canvas.getContext('2d');
    canvas.width = divWidth;
    canvas.height = divHeight;
    // 设置canvas 画线样式
    CGD.lineWidth = 2;
    CGD.strokeStyle = '#5B2300';

    // 离屏层  主要负责绘制线条
    var offCanvas = document.createElement('canvas');
    offCanvas.width = divWidth;
    offCanvas.height = divHeight;
    var offContext = offCanvas.getContext('2d');
    offContext.lineWidth = 2;
    offContext.strokeStyle = '#5B2300';

    // 离屏层2 负责绘制
    var offCanvastwo = document.createElement('canvas');
    offCanvastwo.width = divWidth;
    offCanvastwo.height = divHeight;
    var offContexttwo = offCanvastwo.getContext('2d');

    // 间隔线条
    var dashLine = null;

    // 起始结束城市信息
    var startCityStr = '';
    var endCityStr = '';
    // 区域城市信息
    var areaCityStr = '';

    var cityImgs = new CityImg(divWidth / 640 , divHeight /  526);
    var cityPo = new CityPo();
    var nodeCity = null;
    var areaCity = null;

    // 记录鼠标位置信息
    var mouseX = 1;
    var mouseY = 1;
// ----util-------------------------------------------------------------
    var gImgs = [
        // 总背景图为：640* 526
        // 23*33  端点城市标
        'chao.png',
        // 15*20  大城市标
        'da.png',
        // 12*17   小城市标
        'xiao.png'
    ];

    // 图片路径
    var imgSrcStr = '';

    // 加载图片函数
    function loadImages(arr, fn, fnError) {
        var count = 0;
        var json = {};

        for (var i = 0; i < arr.length; i++) {
            var oImg = new Image();

            (function (index) {
                oImg.onload = function () {
                    var name = arr[index].split('.')[0];
                    json[name] = this;
                    count++;
                    if (count === arr.length) {
                        fn(json);
                    }
                };
                oImg.onerror = function () {
                    fnError && fnError();
                };
            })(i);
            oImg.src = imgSrcStr + arr[i];
        }
    }
// ----end--util-------------------------------------------------------------
    // -----------------------------------------------------------------
    // 初始活动变量
    function initGame(){
        startCityStr = $('#startCityInfo_js').val();
        endCityStr = $('#endCityInfo_js').val();
        areaCityStr = $('#passCityInfo_js').val();
        dashLine = new DashLine(divWidth, divHeight, 5,divWidth / 640 ,divHeight /  526);
        imgSrcStr = $('#imgurl_js').val();
    }
    initGame();

    // 绘线  绘制离屏上
    function growLine() {
        CGD.clearRect(0, 0, divWidth, divHeight);
        offContext.clearRect(0, 0, divWidth, divHeight);
        if (dashLine.isContinueDraw()) {
            dashLine.setDrawPara();
            dashLine.drawDashLine(offContext);
            requestAnimationFrame(function () {
                growLine();
            });
            CGD.drawImage(offCanvas,0,0);
            CGD.drawImage(offCanvastwo,0,0);
        } else {
            dashLine.drawDashLine(offContext);
            drawPlot();
            CGD.drawImage(offCanvas,0,0);
            CGD.drawImage(offCanvastwo,0,0);

            if(dashLine.isVerY){
                cityImgs.drawText(CGD,nodeCity[0],-15);
                cityImgs.drawText(CGD,nodeCity[1],20);
            } else {
                cityImgs.drawText(CGD,nodeCity[0],20);
                cityImgs.drawText(CGD,nodeCity[1],-15);
            }
            $('#floatBox_js').addClass('none');
            $('#s_ditu_js').on('click', function (event){
                mouseX = event.offsetX * 640 / divWidth ;
                mouseY = event.offsetY * 526 / divHeight + 15;
                showCityText(mouseX,mouseY);
            });
        }
    }

    // 遍历城市 根据x y坐标 找出唯一对应城市  并绘制出 颀文字
    var areaCityLen = 1;
    var recMouseX = 1;
    var recMouseY = 1;
    var isAtArea = false;
    function showCityText(mx,my){
        isAtArea = false;
        areaCityLen = areaCity.length;
        for (var i = 0;i < areaCityLen; i++) {
            recMouseX = areaCity[i].posX;
            recMouseY = areaCity[i].posY;
            if(mx < recMouseX + 15 && mx > recMouseX - 15 && my < recMouseY + 15 && my > recMouseY - 15){
                isAtArea = true;
                CGD.clearRect(0, 0, divWidth, divHeight);
                CGD.drawImage(offCanvas,0,0);
                CGD.drawImage(offCanvastwo,0,0);
                cityImgs.drawText(CGD,areaCity[i],0);
                break;
            }
        }
        if(!isAtArea) {
            areaCityLen = nodeCity.length;
            for (i = 0;i < areaCityLen; i++) {
                recMouseX = nodeCity[i].posX;
                recMouseY = nodeCity[i].posY;
                if(mx < recMouseX + 15 && mx > recMouseX - 15 && my < recMouseY + 15 && my > recMouseY - 15){
                    isAtArea = true;
                    CGD.clearRect(0, 0, divWidth, divHeight);
                    CGD.drawImage(offCanvas,0,0);
                    CGD.drawImage(offCanvastwo,0,0);
                    cityImgs.drawText(CGD,nodeCity[i],0);
                    break;
                }
            }
        }

    }
    // 页面首次绘制
    function firstDraw(){
        offContexttwo.clearRect(0, 0, divWidth, divHeight);
        var areaCityLen = areaCity.length;
        for (var i = 0;i < areaCityLen; i++) {
            cityImgs.drawImg(offContexttwo,areaCity[i]);
        }
        cityImgs.drawPointImg(offContexttwo,nodeCity[0]);
        cityImgs.drawPointImg(offContexttwo,nodeCity[1]);
        if(dashLine.isVerY){
            cityImgs.drawText(offContexttwo,nodeCity[0],-15);
            cityImgs.drawText(offContexttwo,nodeCity[1],20);
        } else {
            cityImgs.drawText(offContexttwo,nodeCity[0],20);
            cityImgs.drawText(offContexttwo,nodeCity[1],-15);
        }

        growLine();
    }
    // 绘制标图
    function drawPlot(){
        offContexttwo.clearRect(0, 0, divWidth, divHeight);
        areaCityLen = areaCity.length;
        for (var i = 0;i < areaCityLen; i++) {
            cityImgs.drawImg(offContexttwo,areaCity[i]);
        }
        cityImgs.drawPointImg(offContexttwo,nodeCity[0]);
        cityImgs.drawPointImg(offContexttwo,nodeCity[1]);
    }
    // -----------------------
    // 加载图片
    loadImages(gImgs, function (imgs) {
        cityImgs.setImgs(imgs.chao, imgs.da, imgs.xiao);
        // 初始化起始结束城市
        cityPo.initNodeStore(startCityStr);
        cityPo.initNodeStore(endCityStr);
        // 初始化区域城市
        cityPo.initPara(areaCityStr);
        // cityPo.sortArrByWeight();
        nodeCity = cityPo.options.nodeStore;
        areaCity = cityPo.options.cityStore;
        dashLine.setLinePara(nodeCity[0].posX, nodeCity[0].posY, nodeCity[1].posX, nodeCity[1].posY);
        dashLine.initLineParam();
        // 开始绘制
        firstDraw();
    });

    $('.alert').on('click', function () {
        $('#floatBox_js').addClass('none');
    });

// -----------------------------------------------------------------
})



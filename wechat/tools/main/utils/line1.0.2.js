/**
 * @file 搜索功能模块
 * @author icy
 */
const app = getApp();
const Promise = require('./promise.js').Promise;
// 基础方法模块
const utils = require('./utils.js');
// 通用数据
const vars = app.vars;

// es6 assign polyfill
Object.assign || (Object.assign = utils.assign);

module.exports = {
    /**
     * 初始化
     * @param data
     */
    line102Init: function (data) {
        let that = this;

        // 初始化数据
        this.line102step = 0;
        this.line102totalStep = 50;
        this.line102over = false;
        // 剪裁的宽度，用来绘制动画
        this.clipWidth = 0;
        this.options = {
            // 高度
            h: 200,
            // 宽度
            w: 640,
            // 走势线线宽
            linePx: 2,
            // 单个字符的宽度
            txtW: 7,
            // 循环线的颜色
            lineColor: ['#ff6666', '#ff9900', '#a6b5ee'],
            // 刻度个数
            scaleNumber: 5,
            // 底部字体大小及颜色
            downFontSize: 10,
            downTxtColor: '#cccccc',
            // 刻度字体大小及颜色
            scaleFontSize: 10,
            scaleColor: '#cccccc',
            // 刻度的一侧间隔
            scaleBorder: 5,
            // 点半径
            pointRadis: 4,
            // 点颜色
            pointColor: '',
            // 背景线线宽及颜色
            bgLinePx: 1,
            bgLineColor: '#cccccc',
            // 走势图的上下间隔
            chartSp: 25,
            // 下部横坐标值区域的间隔
            downSp: 20,
            // 走势图左右区域的间隔
            borderLeft: 30,
            borderRight: 0,
            xAxis: ['1', '2', '3', '4', '5', '6'],
            data: [{forecast: true, yAxis: [ '81108', '84243', '90238', '90534', '95013', '99300']}]
        };
        Object.assign(this.options, data);
        // 计算出走势图部分高度
        this.chartTotalH = this.options.h - this.options.downSp;
        // 计算出显示走势图的高度
        this.chartH = this.chartTotalH - this.options.chartSp * 2;
        // 设置走势图canvas及绘图api
        this.chartDrawApi = wx.createCanvasContext('line102');
        this.chartDrawApi.clearRect(0, 0, this.options.w, this.options.h);

        // 获取横坐标个数
        this.dataLine102xAxisL = this.options.xAxis.length;
        // 获取数据数组
        this.dataLine102Arr = this.options.data;
        // 获取数据数组个数
        this.dataLine102ArrL = this.dataLine102Arr.length;
        /**
         * 循环遍历出走势图数据取出最大值
         */
        let arr = [];
        for (let i = 0; i < this.dataLine102ArrL; i++) {
            arr = arr.concat(this.dataLine102Arr[i].yAxis);
        }
        // 赋值计算出的数据给全局
        this.maxVal = Math.max.apply(null, arr);
        this.minVal = Math.min.apply(null, arr);
        // 设置刻度显示canvas
        // 设置刻度canvas宽度 最大值的宽度 7为单个字的宽度
        var scaleTextW = Math.ceil(this.maxVal.toString().length * this.options.txtW);
        // 设置走势图容器宽度
        this.chartTotalW = this.options.w;
        // 获取走势图除两边间距后的每一部分横坐标刻度的宽度
        this.portWidth = Math.floor((this.options.w - this.options.borderLeft - this.options.borderRight ) / this.dataLine102xAxisL);
        this.chartW = this.portWidth * (this.dataLine102xAxisL - 1) + this.options.borderLeft + this.options.borderRight;
        // 设置走势图canvas宽度和走势图容器宽度
        this.setData({
            'lineInfo.canvasWidth': this.options.w
        });
        this.line102run();
    },
    /**
     * 调用动画渲染
     */
    line102run: function () {
        setTimeout(() => {
            this.line102animation();
        },16);
    },
    /**
     * canvas绘图
     */
    line102animation: function () {
        var that = this;
        this.chartDrawApi.clearRect(0, 0, this.options.w, this.options.h);
        this.line102drawScale();
        this.line102drawBg();
        this.line102drawLine();
        this.line102updateStep();
        this.chartDrawApi.draw();
        if (!that.line102over) {
            that.line102run();
        }
    },
    /**
     * 渐进动画计数
     */
    line102updateStep: function () {
        var that = this;
        that.line102step++;
        that.clipWidth = Math.floor(that.chartW) * (that.line102step / that.line102totalStep);
        if (that.line102step >= that.line102totalStep) {
            that.line102over = true;
        }
        this.chartDrawApi.setFillStyle('#ffffff');
        this.chartDrawApi.fillRect(this.clipWidth, 0, this.chartW - this.clipWidth, this.chartTotalH);
    },
    /**
     * 填充数据，根据数据算出图形显示
     */
    line102drawScale: function () {
        var that = this;
        // 获取刻度高度间隔及数值间隔
        var scaleSpH = that.chartH / that.options.scaleNumber;
        var valSp = (that.maxVal - that.minVal) / that.options.scaleNumber;

        /**
         * 循环遍历算出所有的刻度，并显示到刻度canvas上
         */
        for (let i = 0; i <= that.options.scaleNumber; i++) {
            var scaleVal = String(Math.floor(that.maxVal - i * valSp));
            var my = that.options.chartSp + i * scaleSpH;
            // 画刻度值
            that.chartDrawApi.save();
            that.chartDrawApi.setFontSize(that.options.scaleFontSize);
            that.chartDrawApi.setFillStyle(that.options.scaleColor);
            that.chartDrawApi.fillText(scaleVal, that.chartW + that.options.scaleBorder, my);
            that.chartDrawApi.restore();
        }
    },

    /**
     * 画背景,包括背景线和下面的文案
     */
    line102drawBg: function () {
        var that = this;
        for (var i = 0; i < that.dataLine102xAxisL; i++) {
            var mx = that.options.borderLeft + i * that.portWidth;
            let xTxt = that.options.xAxis[i].toString();
            // 画背景线
            that.chartDrawApi.save();
            that.chartDrawApi.setStrokeStyle(that.options.bgLineColor);
            that.chartDrawApi.setLineWidth(that.options.bgLinePx);
            that.chartDrawApi.beginPath();
            that.chartDrawApi.moveTo(mx, 0);
            that.chartDrawApi.lineTo(mx, that.chartTotalH);
            that.chartDrawApi.stroke();
            that.chartDrawApi.restore();
            // 画下部文案
            that.chartDrawApi.save();
            that.chartDrawApi.setFontSize(that.options.downFontSize);
            that.chartDrawApi.setFillStyle(that.options.downTxtColor);
            that.chartDrawApi.fillText(xTxt, mx - xTxt.length * that.options.txtW / 2, that.chartTotalH + that.options.downSp / 3 * 2);
            that.chartDrawApi.restore();
        }
        // 画横线
        that.chartDrawApi.save();
        that.chartDrawApi.setStrokeStyle(that.options.bgLineColor);
        that.chartDrawApi.setLineWidth(that.options.bgLinePx);
        that.chartDrawApi.beginPath();
        that.chartDrawApi.moveTo(0, that.chartTotalH);
        that.chartDrawApi.lineTo(that.chartW, that.chartTotalH);
        that.chartDrawApi.moveTo(0, that.options.bgLinePx);
        that.chartDrawApi.lineTo(that.chartW, that.options.bgLinePx);
        that.chartDrawApi.stroke();
        that.chartDrawApi.restore();
    },

    /**
     * 画线
     */
    line102drawLine: function () {
        var that = this;
        var colorIdx = 0;

        /**
         * 循环遍历获取每一组走势线的数据
         */
        for (var i = 0; i < that.dataLine102ArrL; i++) {
            var color;
            // 判断是否有颜色赋值，有就用该赋值
            if (that.dataLine102Arr[i].color) {
                color = that.dataLine102Arr[i].color;
            } else {
                // 没有赋值时使用lineColor数组中的各颜色以此循环使用
                if (colorIdx > that.options.lineColor.length) {
                    colorIdx = 0;
                }
                color = that.options.lineColor[colorIdx];
            }
            // 根据走势线的值数据画一条曲线
            that.line102drawOneline(that.dataLine102Arr[i].yAxis, color, that.dataLine102Arr[i].forecast);
            colorIdx++;
        }
    },

    /**
     * 画一条线
     * @param arr 该线的数据
     * @param color 改线的颜色
     * @param forecast 是否有预测
     */
    line102drawOneline: function (arr, color, forecast) {
        var that = this;
        // 该走势线的点个数
        var l = arr.length;
        // 循环使用
        var i = 0,
            // 换算点索引数组
            p = [];

        /**
         * 循环遍历计算出走势点在canvas中的像素坐标，并储存到p数组中
         */
        for (; i < l; i++) {
            var mx = that.options.borderLeft + i * that.portWidth;
            var my = (1 - (Number(arr[i]) - that.minVal) / (that.maxVal - that.minVal)) * that.chartH + that.options.chartSp;
            p.push({x: mx, y: my});
        }

        // 设置曲线的样式
        that.chartDrawApi.save();
        that.chartDrawApi.setStrokeStyle(color);
        that.chartDrawApi.setLineWidth(that.options.linePx);

        var bL = forecast ? l - 2 : l - 1;

        /**
         * 循环遍历，根据公式画出三次贝塞尔曲线的两个控制点位置，并画出走势图曲线
         */
        for (i = 0; i < bL; i++) {
            var ctrlP = that.line102getCtrlPoint(p, i);
            that.chartDrawApi.beginPath();
            that.chartDrawApi.moveTo(p[i].x, p[i].y);
            that.chartDrawApi.bezierCurveTo(ctrlP.pA.x, ctrlP.pA.y, ctrlP.pB.x, ctrlP.pB.y, p[i + 1].x, p[i + 1].y);
            that.chartDrawApi.stroke();
        }
        if (forecast) {
            that.line102dashedLineTo(that.chartDrawApi, p[l - 2].x, p[l - 2].y, p[l - 1].x, p[l - 1].y);
        }
        that.chartDrawApi.restore();

        /**
         * 循环遍历画点
         */
        for (i = 0; i < l; i++) {
            var mxx = that.options.borderLeft + i * that.portWidth;
            var myy = (1 - (arr[i] - that.minVal) / (that.maxVal - that.minVal)) * that.chartH + that.options.chartSp;
            if (i !== l - 2 || !forecast) {
                that.chartDrawApi.save();
                // that.chartDrawApi.globalCompositeOperation = 'destination-out';
                that.chartDrawApi.setFillStyle('#ffffff');
                that.chartDrawApi.beginPath();
                that.chartDrawApi.arc(mxx, myy, that.options.pointRadis + 2, 0, Math.PI * 2);
                that.chartDrawApi.fill();
                that.chartDrawApi.restore();
            }
            that.chartDrawApi.save();
            that.chartDrawApi.setFillStyle(color);
            that.chartDrawApi.beginPath();
            that.chartDrawApi.arc(mxx, myy, that.options.pointRadis, 0, Math.PI * 2);
            that.chartDrawApi.fill();
            that.chartDrawApi.restore();
            if (i === l - 2 && forecast) {
                that.chartDrawApi.save();
                that.chartDrawApi.setStrokeStyle(color);
                that.chartDrawApi.beginPath();
                that.chartDrawApi.arc(mxx, myy, that.options.pointRadis + 5, 0, Math.PI * 2);
                that.chartDrawApi.stroke();
                that.chartDrawApi.restore();
            }
            // 画刻度文案
            if (forecast && i === l - 1) {
                that.chartDrawApi.save();
                that.chartDrawApi.setFontSize(that.options.scaleFontSize);
                // that.chartDrawApi.textAlign = 'center';
                // that.chartDrawApi.textBaseline = 'bottom';
                that.chartDrawApi.setFillStyle(that.options.scaleColor);
                that.chartDrawApi.fillText('预测', mxx, myy - 10);
                that.chartDrawApi.restore();
            }
        }
    },

    /**
     * 画虚线
     * @param drawApi
     * @param fromX
     * @param fromY
     * @param toX
     * @param toY
     * @param pattern 虚线间断距离
     */
    line102dashedLineTo: function (drawApi, fromX, fromY, toX, toY, pattern) {
        if (typeof pattern === 'undefined') {
            pattern = 5;
        }

        // 计算刻度值
        var dx = toX - fromX;
        var dy = toY - fromY;
        var distance = Math.floor(Math.sqrt(dx * dx + dy * dy));
        var dashLineInteveral = pattern <= 0 ? distance : distance / pattern;
        var deltay = dy * pattern / distance;
        var deltax = dx * pattern / distance;

        // 画虚线点
        drawApi.beginPath();
        for (var dl = 0; dl < dashLineInteveral; dl++) {
            if (dl % 2) {
                drawApi.lineTo(fromX + dl * deltax, fromY + dl * deltay);
            } else {
                drawApi.moveTo(fromX + dl * deltax, fromY + dl * deltay);
            }
        }
        drawApi.stroke();
    },

    /**
     * 此公式是根据
     * 根据已知点获取第i个控制点的坐标
     * param ps  已知曲线将经过的坐标点
     * param i   第i个坐标点
     * param a,b 可以自定义的正数
     */
    line102getCtrlPoint: function (ps, i, a, b) {
        if (!a || !b) {
            a = 0.25;
            b = 0.25;
        }
        var pAx, pAy, pBx, pBy;
        if (i < 1) {
            var idx = 0;
            pAx = ps[idx].x + (ps[idx + 1].x - ps[idx].x) * a;
            pAy = ps[idx].y + (ps[idx + 1].y - ps[idx].y) * a;
        } else {
            pAx = ps[i].x + (ps[i + 1].x - ps[i - 1].x) * a;
            pAy = ps[i].y + (ps[i + 1].y - ps[i - 1].y) * a;
        }
        // 处理两种极端情形
        if (i === ps.length - 2) {
            var last = ps.length - 1;
            pBx = ps[last].x - (ps[last].x - ps[last - 1].x) * b;
            pBy = ps[last].y - (ps[last].y - ps[last - 1].y) * b;
        } else {
            pBx = ps[i + 1].x - (ps[i + 2].x - ps[i].x) * b;
            pBy = ps[i + 1].y - (ps[i + 2].y - ps[i].y) * b;
        }
        return {
            pA: {x: pAx, y: pAy},
            pB: {x: pBx, y: pBy}
        };
    }
};

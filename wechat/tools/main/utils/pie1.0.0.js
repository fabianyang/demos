/**
 * @file 饼状图功能模块
 * @author tankunpeng
 */
module.exports = {
    /**
     * 初始化饼状图
     * @param dataArr
     */
    pie100Init: function (dataArr) {
        // 初始化数据
        this.dataArr = dataArr;
        this.pie100step = 0;
        this.pie100totalStep = 50;
        this.total = 0;
        this.pie100over = false;
        // 获取value 总和
        for (let i = 0, l = this.dataArr.length; i < l; i++) {
            this.total += +this.dataArr[i].value;
        }
        this.drawApi = wx.createCanvasContext('pie100');
        this.pie100run();
    },
    /**
     * 调用动画渲染饼状图
     */
    pie100run: function () {
        setTimeout(() => {
            this.pie100animation();
        },16);
    },
    /**
     * canvas绘图
     */
    pie100animation: function () {
        this.pie100updateStep();
        this.drawApi.clearRect(0, 0, 140, 140);
        this.drawApi.translate(70, 70);
        this.drawApi.rotate(-Math.PI / 2);
        let l = this.dataArr.length;
        for (let i = 0; i < l; i++) {
            let angle = this.dataArr[i];
            this.drawApi.save();
            this.drawApi.setStrokeStyle('#ffffff');
            this.drawApi.setLineWidth(1);
            this.drawApi.setFillStyle(angle.color);
            this.drawApi.beginPath();
            this.drawApi.moveTo(0, 0);
            this.drawApi.arc(0, 0, 70, angle.startAngle, angle.endAngle, false);
            this.drawApi.closePath();
            this.drawApi.fill();
            this.drawApi.stroke();
            this.drawApi.restore();
        }
        // 画中心白圈
        this.drawApi.save();
        this.drawApi.setFillStyle('#ffffff');
        this.drawApi.beginPath();
        this.drawApi.moveTo(0, 0);
        this.drawApi.arc(0, 0, 35, 0, Math.PI * 2, false);
        this.drawApi.closePath();
        this.drawApi.fill();
        this.drawApi.restore();

        // 画中心文字
        this.drawApi.save();
        this.drawApi.rotate(Math.PI / 2);
        this.drawApi.setFontSize(16);
        this.drawApi.setFillStyle('#83868f');
        this.drawApi.fillText('月供',-16,0);
        this.drawApi.fillText('¥5775',-22,18);
        this.drawApi.restore();
        this.drawApi.draw();

        if (!this.pie100over) {
            this.pie100run();
        }
    },
    /**
     * 渐进动画计数
     */
    pie100updateStep: function () {
        let that = this;
        that.pie100step++;
        if (that.pie100step > this.pie100totalStep) {
            that.pie100over = true;
            return;
        }
        let l = that.dataArr.length;
        for (let i = 0; i < l; i++) {
            let endAngle = +that.dataArr[i].value / that.total * (that.pie100step / that.pie100totalStep) * Math.PI * 2;
            if (i === 0) {
                that.dataArr[i].startAngle = 0;
                that.dataArr[i].endAngle = endAngle;
            } else {
                that.dataArr[i].startAngle = that.dataArr[i - 1].endAngle;
                that.dataArr[i].endAngle = that.dataArr[i].startAngle + endAngle;
            }
        }
    },
};

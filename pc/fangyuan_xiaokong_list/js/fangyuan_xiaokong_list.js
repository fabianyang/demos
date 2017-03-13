/*
* @Author: yangfan
* @Date:   2016-04-14 16:55:55
* @Last Modified by:   user
* @Last Modified time: 2016-04-19 13:16:07
* @Update:
*     1, 删除表格盒子上下滚动条;
*     2, 添加房源信息滚动;
*     3, 防止浮动表头遮挡工具栏下拉框;
*     4, 选择户型后，暴露浮动表头添加或删除方法;
*     5, 选择户型后，暴露初始化表格盒子高度方法;
*     6, 删除更改表格左侧楼层高度，为了确定初始表格高度
*/
$(function () {
    'use strict';

    // 功能区域盒子 top: 包括户型、楼号选择工具栏，左侧选房表格，右侧房源信息
    var wrap = $('.xfwrap')
    var wrapTop = wrap.offset().top;

    // 表格盒子 top: 包括楼层、单元号、数据
    var box = $('.xfboxl');
    var boxTop = box.offset().top;

    var winHeight = $(window).height();

    // 表格左侧: 包括楼层、交叉表头。表格右侧: 包括单元号、数据
    var col01ul = $('.col01 > ul'),
        ovauto = $('.ovauto');

    var ovautoClone, col01ulClone;
    /**
     * 添加浮动表头：表头克隆，绝对定位，添加到各自父元素中。
     * 初始状态：隐藏（防止遮住工具栏下拉框选项），位置 top: 0, left: 0
     * 窗口滚动时，需要表头固定能够一直显示，克隆出的表头利用绝对定位，随滚动条进行定位。
     * @param {string} top 表头定位 top 位置
     */
    function addClone(top) {
        var top = top ? top : 0;
        ovautoClone = ovauto.clone();
        ovautoClone.find('.ulhover').remove();
        ovautoClone.css({
            position: 'absolute',
            top: top,
            left: 0,
            'z-index': 78,
            overflow: 'hidden'
        }).hide().prependTo($('.col02'));

        col01ulClone = col01ul.clone();
        col01ulClone.find('.bj01').remove();
        col01ulClone.css({
            position: 'absolute',
            top: top,
            left: 0,
            'z-index': 78,
            overflow: 'hidden'
        }).hide().prependTo($('.col01'));
    }
    addClone();

    /**
     * 销毁浮动表头
     */
    function removeClone() {
        ovautoClone.remove();
        col01ulClone.remove();
    }

    var initBoxHeight;
    /**
     * 初始化表格盒子高度，固定为表格左侧楼层高度
     */
    function updateInitBoxHeight() {
        initBoxHeight = $('.col01').height();
        updateBoxHeight(initBoxHeight);
    }
    updateInitBoxHeight();

    /**
     * 更新表格高度，包括盒子，楼层，数据
     * @param  {number} height 目标高度
     */
    function updateBoxHeight(height) {
        box.height(height);
        ovauto.height(height);
        // col01ul.height(height - 17);
    };

    // 右侧房源信息， DOM, 变量等基础信息
    var fy = $('.xzfy'),
        fyxx = $('.other'),
        fybtn = $('.bottr');
    var fyTop = fy.offset().top,
        fyHeight = fy.height(),
        fyxxHeight = fyxx.height() ? fyxx.height() : 170;
    var fyArr = [fy, fyxx, fybtn],
        fyCss = {
            position: 'absolute',
            top: 0,
            left: 0,
            'z-index': 78
        }

    /**
     * 重置房源信息样式
     * 注意：和后端配合过程中，jsp 页面也会对 dom 进行样式修改。
     * 这种重置方式比较强硬
     */
    function fyRemoveCss() {
        var i = fyArr.length;
        while (i--) {
            fyArr[i].removeAttr('style');
        }
    }

    var boxHeight;
    /**
     * 窗口滚动条开始滚动, 动态计算表格盒子高度，动态计算房源信息显示位置
     * @event
     */
    $(window).on('scroll', function () {
        var scrollTop = $(this).scrollTop();
        // console.log('window scroll top is not 0!', scrollTop);

        // 滚动条高度大于功能区域盒子高度，并且初始表格盒子大于窗口高度
        // 进行表格盒子高度随窗口增高，定位浮动表头
        if (scrollTop > wrapTop && initBoxHeight >= winHeight) {
            boxHeight = winHeight + (scrollTop - boxTop);
            updateBoxHeight(boxHeight);

            // 滚动条高度比较表格盒子高度，进行浮动表头的隐藏初始化或显示定位
            if (scrollTop < boxTop) {
                ovautoClone.hide().css('top', 0);
                col01ulClone.hide().css('top', 0);
            } else {
                ovautoClone.show().css('top', scrollTop - boxTop);
                col01ulClone.show().css('top', scrollTop - boxTop);
            }
        }

        // 滚动条高度比较房源信息高度，进行房源信息定位。
        if (scrollTop > fyTop - 10) {
            fyCss.top = scrollTop - boxTop + 10;
            fy.css(fyCss);
            fyCss.top = fyCss.top + fyHeight + 10;
            fyxx.css(fyCss)
            fyCss.top = fyCss.top + fyxxHeight + 10;
            fybtn.css(fyCss);
        } else {
            fyRemoveCss();
        }

        // 随滚动条的下拉，表格盒子高度会逐渐增高，判断还原高度
        if (boxHeight >= initBoxHeight) {
            updateBoxHeight(initBoxHeight);
        }
    });

    /**
     * 表格右侧滚动条开始滚动, 左右滚动，同时滚动表头
     * @event
     */
    ovauto.on('scroll', function () {
        var scrollLeft = $(this).scrollLeft();
        ovautoClone.scrollLeft(scrollLeft);
    });

    // 暴露公共方法
    window.addClone = addClone;
    window.removeClone = removeClone;
    window.updateInitBoxHeight = updateInitBoxHeight;
});

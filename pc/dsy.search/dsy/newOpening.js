/*
 * @file: main
 * @author: yangfan
 * @Create Time: 2017-10-24 15:30:35
 * @description: pc 首页 新房 -> 新开楼盘 -> 时间轴 jscroll 模块。进行原逻辑改写。
 *
 */
define('dsy/newOpening', [
    'jquery',
    'jscroll'
], function (require) {
    var $ = require('jquery');

    var domBox = $('#ee').css({
        position: 'relative',
        visibility: 'visible'
    });

    // 修改 ie relative bug
    // domBox.parent().css({
    //     position: 'relative'
    // });

    var domContent = domBox.find('ul');
    var domTop = $('#sign_date_now');

    var boxHeight = domBox.height(),
        contentHeight = domContent.height(),
        topPosition = domTop.position().top;

    var n = boxHeight / contentHeight * topPosition;
    domBox.jscroll({
        W: '8px',
        Btn: {
            btn: !1
        },
        Bg: '#f1f1f1',
        Bar: {
            Pos: '',
            Bd: {
                Out: '#cccccc',
                Hover: '#cccccc'
            },
            Bg: {
                Out: '#cccccc',
                Hover: '#cccccc',
                Focus: '#cccccc'
            }
        }
    }, n);
    // var o = $("#sign_date_now").position().top, // topPosition
    // i = $(".jscroll-c").height(),   // contentHeight
    // c = $(".jscroll-e").height(),   // boxHeight
    // ee = $("#ee").height(); // boxHeight
    // console.log(o, i, c, ee, -(i - ee), n);
    // console.log(topPosition, contentHeight, boxHeight, boxHeight, -(contentHeight - boxHeight), c / i * o);
    if (boxHeight < contentHeight) {
        if (contentHeight - boxHeight >= topPosition) {
            domBox.find('.jscroll-c').css('top', -topPosition);
        } else {
            domBox.find('.jscroll-c').css('top', -(contentHeight - boxHeight));
        }
    }
    domBox.find('.jscroll-h').css('top', n);
});

/**
 * code backup
n.async(["jscroll"], function() {
    t(document).ready(function() {
        var n = c / i * o;
        t("#ee").css("visibility", "visible").jscroll({ W: "8px", Btn: { btn: !1 }, Bg: "#f1f1f1", Bar: { Pos: "", Bd: { Out: "#cccccc", Hover: "#cccccc" }, Bg: { Out: "#cccccc", Hover: "#cccccc", Focus: "#cccccc" } } }, n);
        var o = t("#sign_date_now").position().top,
            i = t(".jscroll-c").height(),
            c = t(".jscroll-e").height(),
            ee = t("#ee").height();
        if (ee < i) {
            if (i - ee >= o) {
                t(".jscroll-c").css("top", -o);
            } else {
                t(".jscroll-c").css("top", -(i - ee));
            }
        }
        t(".jscroll-h").css("top", c / i * o);
    })
});
 */
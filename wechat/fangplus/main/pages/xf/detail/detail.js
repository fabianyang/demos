/**
 * pages/xf/detail/detail.js
 * @file 新房详情页
 * @author 袁辉辉(yuanhuihui@fang.com)
 */
const app = getApp();
const Promise = require('../../../utils/promise.js').Promise;
const utils = require('../../../utils/utils.js');
const common = require('../../../utils/common.js');
const share = require('../../../utils/share.js');
let vars = app.vars;
// 页面配置
let page = {
  // 设置分享信息
  shareInfoFn: function () {
    return { title: this.data.pageInfo.projname || '', desc: (this.data.pageInfo.proj_type || '') + '  ' + (this.data.pageInfo.price || '') + '  ' + (this.data.pageInfo.address || '') };
  },
  // 页面数据
  data: {
    swiper: {
      indicatorDots: true,
      circular: true,
      autoplay: false,
      interval: 5000,
      duration: 1000
    },
    showDtMore: false,
    dataLoad: false
  },

  // 动态加载更多
  showDtMoreTap: function () {
    this.setData({
      'showDtMore': !this.data.showDtMore,
    });
  },
  // 本项目信息加载更多
  showMoreProjInfo: function () {
    this.setData({
      'showPageInfoMore': !this.data.showPageInfoMore,
    });
  },

  // 点评加载更多更多
  dpShowMore: function (e) {
    let curObj = e.currentTarget.dataset;
    var newCommentList = this.data.dp.commentList;
    newCommentList[curObj.idx].showMore = !newCommentList[curObj.idx].showMore;
    this.setData({
      'dp.commentList': newCommentList
    });
  },

  // call
  callHer: function (e) {
    let ds = e.currentTarget.dataset,
      that = this;
    ds.tel && wx.makePhoneCall({
      phoneNumber: ds.tel,
      success: function() {
          // yf: 增加统计
          utils.request({
            url: vars.interfaceSite + 'call',
            data: {
                city: that.params.cityname || app.userPosition.shortCity || '',
                tel: ds.tel,
                newcode: that.params.houseid,
                newtype: ''
            }
          })
      }
    });
  },

  /***
   * 打开微信内置地图
   * @returns null
   */
  openPosition: function () {
    wx.openLocation({
      latitude: +this.data.pageInfo.mapy,
      longitude: +this.data.pageInfo.mapx,
      name: this.data.pageInfo.projname,
      address: this.data.pageInfo.address,
      scale: 18
    })
  },
  // 跳转到其他小区详情
  gotoXf: function (e) {
    let curObj = e.currentTarget.dataset;
    let paramObj = { cityname: this.params.cityname, houseid: curObj.id, title: curObj.title }
    let paramStr = utils.queryStringify(paramObj);
    wx.redirectTo({
      url: '/pages/xf/detail/detail?' + paramStr
    });
  },
  /***
   * 页面加载回调
   * @returns null
   */
  onLoad: function (options) {
    // Do some initialize when page load.
    let that = this;
    // 设置loading
    that.loadingToast();
    that.params = options || {};
    that.params.cityname = options.cityname || app.userPosition.shortCity || '北京';

    // 设置标题
    wx.setNavigationBarTitle({
      title: options.title || '新房详情'
    });
    // 获取新房详情任务
    let pageInfoTask = new Promise((resolve, reject) => {
      utils.request({
        url: vars.interfaceSiteJava + 'xfInfo',
        data: {
          city: encodeURIComponent(that.params.cityname),
          id: that.params.houseid
        },
        complete: res => {
          console.log('pageInfo:', res);
          let resData = res.data;
          if (typeof resData === 'object') {
            // 处理图片数据数据
            resData.img && (resData.img = resData.img.split(','));
            // 处理tags
            resData.tags && (resData.tags = resData.tags.split(','));
            // 图片限制为为5
            let maxImgNum = 5;
            if (resData.img && resData.img.length && resData.img.length > maxImgNum) {
              let newArr = resData.img.filter((item, idx) => {
                return idx < maxImgNum;
              });
              resData.img = newArr;
            };
            // 处理评分
            if (resData.zhulihuxing) {
              resData.zhulihuxing.forEach(hx => {
                if (hx && typeof hx === 'object') {
                  hx.scoreArr = utils.scoreToArr(hx.hx_score);
                }
              });
            }

            //  百度坐标转为国测局坐标（腾讯坐标）
            if (resData.mapx && resData.mapy) {
              let latLng = utils.bd09ToGcj02(resData.mapx, resData.mapy);
              resData.mapx_t = latLng.lng;
              resData.mapy_t = latLng.lat;
            }
            // 初始化页面数据
            that.setData({
              dataLoad: true,
              pageInfo: resData
            });
            resolve(res);
          } else {
            reject();
            console.log('非object' + resData);
          }
        }
      });
    });
    // 置业顾问列表和底部电话
    let guwenTask = new Promise((resolve, reject) => {
      utils.request({
        url: vars.interfaceSiteJava + 'getZygwZbjjr',
        data: {
          city: encodeURIComponent(that.params.cityname),
          newcode: that.params.houseid
        },
        complete: res => {
          console.log('guwen:', res);
          let resData = res.data;
          if (typeof resData === 'object') {
            // 图片可能无协议
            if (resData.zygwList && resData.zygwList.length) {
              resData.zygwList = utils.ensurepProtocol(resData.zygwList, 'licenseUrl', null, 'http:');
            }
            // 若都无电话则置业顾问模块隐藏
            if (resData.sfbzygwlist && resData.sfbzygwlist.length) {
              let telGuB = resData.sfbzygwlist.filter((x, i) => {
                return x.telephone;
              });
              if (!telGuB.length) {
                resData.noTel = true;
              }
            }
            if (!resData.sfbzygwlist.length && resData.zygwList && resData.zygwList.length) {
              let telGu = resData.zygwList.filter((x, i) => {
                return x.tel400;
              });
              if (!telGu.length) {
                resData.noTel = true;
              }
            }
            // 初始化页面数据
            that.setData({
              guwen: resData
            });
          } else {
            console.log('非object' + resData);
          }
        }
      });
    });

    // 周边
    let zbTask = new Promise((resolve, reject) => {
      utils.request({
        url: vars.interfaceSiteJava + 'getzb',
        data: {
          city: encodeURIComponent(that.params.cityname),
          newcode: that.params.houseid
        },
        complete: res => {
          let resData = res.data;
          if (typeof resData === 'object') {
            // 初始化页面数据
            that.setData({
              zb: resData
            });
          } else {
            console.log('非object' + resData);
          }
        }
      });
    });
    Promise.all([pageInfoTask]).then(res => {
      // 点评：详情接口电话优先
      let dpTask = new Promise((resolve, reject) => {
        utils.request({
          url: vars.interfaceSiteJava + 'getCommentGood',
          data: {
            city: encodeURIComponent(that.params.cityname),
            newcode: that.params.houseid
          },
          complete: res => {
            let resData = res.data;
            if (typeof resData === 'object') {
              // 评分及图片处理
              resData.commentList.forEach(el => {
                if (el && typeof el === 'object') {
                  // 图片处理
                  el.userPhoto = utils.ensurepProtocol(null, null, el.userPhoto, 'https:');
                  el.scoreArr = utils.scoreToArr(el.totalSocreStar);
                  // 默认为不展开
                  el.showMore = false;
                  // 处理换行:换行标识
                  let flag = '{{fang-cicle-block}}';
                  el.zhuContent = el.zhuContent.replace(/\\n\\n/g, flag).replace(/\\n/g, flag);
                  el.zhuContentArr = el.zhuContent.split(flag);
                }
              });
              // 总分
              resData.scoreArr = utils.scoreToArr(resData.totalScore);
              // 初始化页面数据
              that.setData({
                dp: resData
              });
            } else {
              console.log('非object' + resData);
            }
          }
        });
      });
      // 对此楼盘感兴趣还浏览 indexXfTj
      let xqTask = new Promise((resolve, reject) => {
        utils.request({
          url: vars.interfaceSiteJava + 'indexXfTj',
          data: {
            city: encodeURIComponent(that.params.cityname),
            id: that.params.houseid,
            x: +this.data.pageInfo.mapx,
            y: +this.data.pageInfo.mapy
          },
          complete: res => {
            let resData = res.data;
            if (typeof resData === 'object') {
              // character
              resData.forEach(el => {
                // 图片处理
                el.character = ('' || el.character).split(',');
              });
              // 初始化页面数据
              that.setData({
                other: resData
              });
            } else {
              console.log('非object' + resData);
            }
          }
        });
      });
    });

  }
};
// 合并属性
utils.assign(page, share, common);
// 渲染页面
Page(page);
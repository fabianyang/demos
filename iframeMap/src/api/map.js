let vars = global.FangMap.vars,
    functions = global.FangMap.functions;

let buildingFormat = (data) => {
    return {
        phone: data.phoneNumber || '',
        title: data.title,
        lng: data.point.lng,
        lat: data.point.lat,
        city: data.city,
        distance: data.distance,
        url: data.detailUrl || '',
        address: data.address || ''
    };
};

let iconImage = {
    marker: require('@/assets/img/dest_markers.png'),
    transit: require('@/assets/img/trans_icons.png')
};

class MapApi {
    constructor() {
        if (this.self) {
            return this.self;
        }
        this.self = this;
    }

    // 基础方法 -- 开始

    // 添加起点覆盖物
    addStart(point, title) {
        let marker = new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon(iconImage.marker, new BMap.Size(42, 34), {
                offset: new BMap.Size(14, 32),
                imageOffset: new BMap.Size(0, 0)
                // anchor
            })
        });
        marker.setTop(true);
        this.instance.addOverlay(marker);
    }

    // 添加终点覆盖物
    addEnd(point, title) {
        let marker = new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon(iconImage.marker, new BMap.Size(42, 34), {
                offset: new BMap.Size(14, 32),
                imageOffset: new BMap.Size(0, -34)
            })
        });
        marker.setTop(true);
        this.instance.addOverlay(marker);
    }

    addBusMarker(point, title) {
        this.instance.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon(iconImage.transit, new BMap.Size(22, 21), {
                offset: new BMap.Size(10, (11 + 1)),
                imageOffset: new BMap.Size(0, -2 * 25 - 5)
            })
        }));

        // myIcon = new BMap.Icon(url, new BMap.Size(width, d), {
        //     offset: new BMap.Size(10, (11 + jia)),
        //     imageOffset: new BMap.Size(0, 0 - index * height - cha)
        // });
    }

    addSubwayMarker(point, title) {
        this.instance.addOverlay(new BMap.Marker(point, {
            title: title,
            icon: new BMap.Icon(iconImage.transit, new BMap.Size(22, 25), {
                offset: new BMap.Size(10, 11),
                imageOffset: new BMap.Size(0, -2 * 25)
            })
        }));
    }


    // 添加路线
    addWalkRoute(path) {
        this.instance.addOverlay(new BMap.Polyline(path, {
            strokeStyle: 'dashed',
            strokeColor: '#30a208',
            strokeOpacity: 0.75,
            strokeWeight: 4,
            enableMassClear: true,
            enableClicking: false
        }));
    }

    addLine(path) {
        this.instance.addOverlay(new BMap.Polyline(path, {
            strokeColor: '#0030ff',
            strokeOpacity: 0.45,
            strokeWeight: 6,
            enableMassClear: true,
            enableClicking: false
        }));
    }

    clearOverlays() {
        this.instance.clearOverlays();
    }

    clearSearch(key) {
        if (this[key]) {
            this[key].clearResults();
        }
    }

    // 基础功能方法 -- 结束

    // createMarker
    addRichMarker(el, {
        lng = 116.404,
        lat = 39.915,
        anchor = {
            x: 0,
            y: 0
        }
    }) {
        var point = new BMap.Point(lng, lat);
        var marker = new BMapLib.RichMarker(el, point, {
            anchor: new BMap.Size(anchor.x, anchor.y)
        });
        this.instance.addOverlay(marker);
    }

    create(el, {
        lng = 116.404,
        lat = 39.915,
        zoom = 14,
        options = {
            minZoom: 10,
            maxZoom: 19,
            enableMapClick: false
        }
    }) {
        // this.isClick = 0;
        // this.viewAuto = true;
        let center = new BMap.Point(lng, lat);
        // this.zoomPartition = 11;
        // this.zoomAdapt = 15;
        // this.maxDistance = 26200;
        // this.container = document.getElementById(cont);
        // this.zooms = zoom;
        var map = new BMap.Map(el, options);
        map.centerAndZoom(center, zoom);
        map.enableScrollWheelZoom();

        // 添加平移缩放控件
        map.addControl(new BMap.NavigationControl());

        // 添加比例尺控件
        map.addControl(new BMap.ScaleControl());

        let hasComplete = false;
        let that = this;
        this.driving = new BMap.DrivingRoute(map, {
            renderOptions: {
                map: map,
                autoViewport: true
            },
            onSearchComplete: function (data) {
                // if (hasComplete) {
                //     return;
                // }
                // hasComplete = true;
                if (data.getNumPlans() > 0) {
                    var plan = data.getPlan(0);
                    let result = {
                        duration: plan.getDuration(false), // parseInt(duration / 60) + '分钟'
                        distance: plan.getDistance(false), // Math.round( parseFloat( distance / 1000 ) * 10) / 10; + '公里'
                        steps: []
                    };
                    if (plan.getNumRoutes() > 0) {
                        var routes = plan.getRoute(0);
                        for (var m = 0; m < routes.getNumSteps(); m++) {
                            result.steps.push(routes.getStep(m).getDescription(false));
                        }
                    }
                    that.onSearchComplete && that.onSearchComplete([result]);
                } else {
                    that.onSearchComplete && that.onSearchComplete();
                }
            }
        });

        this.transit = new BMap.TransitRoute(map, {
            renderOptions: {
                map: map,
                autoViewport: false
            },
            onSearchComplete: function (data) {
                // if (hasComplete) {
                //     return;
                // }
                // hasComplete = true;
                let result_plans = [];
                let planCount = data.getNumPlans();
                if (planCount > 0) {
                    for (let i = 0; i < planCount; i++) {
                        let plan = data.getPlan(i);
                        let planObject = {
                            duration: plan.getDuration(false), // parseInt(duration / 60) + '分钟'
                            distance: plan.getDistance(false), // Math.round( parseFloat( distance / 1000 ) * 10) / 10; + '公里'
                            line: [],
                            route: []
                        };
                        for (let j = 0; j < plan.getNumLines(); j++) {
                            let line = plan.getLine(j);
                            // console.log('line ' + j + ': ', line);
                            let onStop = line.getGetOnStop(),
                                offStop = line.getGetOffStop();

                            let lineObject = {
                                title: line.title.split('(')[0],
                                onStop: onStop.title,
                                offStop: offStop.title
                            };

                            planObject.line.push(lineObject);
                        }

                        // for (let k = 0; k < plan.getNumRoutes(); k++) {
                        //     let route = plan.getRoute(k);
                        //     planObject.route.push({
                        //         distance: route.getDistance(false)
                        //     });
                        // }

                        result_plans.push(planObject);
                    }
                    that.onSearchComplete && that.onSearchComplete(result_plans);
                } else {
                    that.onSearchComplete && that.onSearchComplete();
                }
            }
        });


        this.instance = map;
        // this._markerManager = new MarkerManager(this._map);
        // this.first = true;
        return map;
    }

    localSearch(keyword, {
        lng = 116.404,
        lat = 39.915
    }) {
        return new Promise((resolve, reject) => {
            let center = new BMap.Point(lng, lat);
            let ls = new BMap.LocalSearch(this.instance, {
                onSearchComplete: function (data) {
                    let result = [];
                    // if (ls.getStatus() === BMap_STATUS_SUCCESS) {
                    for (var i = 0; i < data.getCurrentNumPois(); i++) {
                        var info = data.getPoi(i);


                        // 过滤地铁中的地铁口
                        let type = '';
                        if ('subway' === type) {
                            let isSubway = info.tags.every((v) => {
                                return v !== '地铁';
                            }) || info.address.indexOf('线');
                            if (isSubway) {
                                continue;
                            }
                        }

                        /* 计算距离*/
                        info.distance = functions.getShortDistance(lng, lat, info.point.lng, info.point.lat);
                        result.push(buildingFormat(info));
                    }
                    // } else {
                    //     reject();
                    // }
                    resolve(result);
                }
            });
            ls.setPageCapacity(20);
            ls.searchNearby(keyword, center, 2000);
        });
    }

    createPanorama(el, {
        lng = 116.404,
        lat = 39.915
    }) {
        var map = new BMap.Map(el);
        map.centerAndZoom(new BMap.Point(lng, lat), 12);
        map.addTileLayer(new BMap.PanoramaCoverageLayer());
        var panorama = new BMap.Panorama(el);
        panorama.setPov({
            heading: -40,
            pitch: 6
        });
        panorama.setPosition(new BMap.Point(lng, lat));

        var ctrl = new BMap.PanoramaControl();
        ctrl.setOffset(new BMap.Size(20, 20));
        map.addControl(ctrl);
    }

    getPanoramaByLocation({
        lng = 116.404,
        lat = 39.915
    }, callBack) {
        new BMap.PanoramaService().getPanoramaByLocation(new BMap.Point(lng, lat), callBack);
    }

    getCardPosition({
        lng = 116.404,
        lat = 39.915,
        main_key
    }) {
        let map = this.instance;

        let tabWidth = 380;
        let cardWidth = 356,
            cardHeight = 153;
        if (main_key !== 'around') {
            cardHeight = 128;
        }
        var point = new BMap.Point(lng, lat);
        // this.instance.setCenter(point);
        var pixel = map.pointToPixel(point);
        var point2 = map.pixelToPoint(new BMap.Pixel(pixel.x + tabWidth / 2, pixel.y - cardHeight / 2));
        map.panTo(point2);

        let center = map.getCenter();
        let pixelCenter = map.pointToPixel(center);
        return {
            x: pixelCenter.x - cardWidth,
            y: pixelCenter.y - cardHeight / 2 - (main_key === 'main' ? 45 : 5)
        };
    }

    openDistanceTool() {
        let map = this.instance;
        let distanceTool = this._distanceTool;
        if (!distanceTool) {
            distanceTool = new BMapLib.DistanceTool(map);
            distanceTool.addEventListener('drawend',
                function () {
                    distanceTool.close();
                });
            this._distanceTool = distanceTool;
        }
        this._distanceTool.open();
    }

    switchTransitPlan(index) {
        let results = this.transit.getResults();
        // let plan = results.getPlan(index);
        // return plan;

        // 从结果对象中获取起点和终点信息
        var start = results.getStart();
        var end = results.getEnd();
        this.addStart(start.point, start.title);
        this.addEnd(end.point, end.title);
        // 直接获取第一个方案
        var plan = results.getPlan(index);
        // 遍历所有步行线路
        for (var i = 0; i < plan.getNumRoutes(); i++) {
            if (plan.getRoute(i).getDistance(false) > 0) {
                // 判断只有大于0的步行线路才会绘制
                this.addWalkRoute(plan.getRoute(i).getPath());
            }
        }
        // 遍历所有公交线路
        // var allLinePath = [];
        // for (let i = 0; i < plan.getNumLines(); i++) {
        //     allLinePath = allLinePath.concat(plan.getLine(i).getPath());
        //     this.addLine(plan.getLine(i).getPath());
        // }
        // console.log(allLinePath);
        // this.instance.setViewport(allLinePath);

        let linePaths = [];
        for (let i = 0; i < plan.getNumLines(); i++) {
            let line = plan.getLine(i);

            let onStop = line.getGetOnStop(),
                offStop = line.getGetOffStop();

            // BMAP_LINE_TYPE_BUS
            if (+line.type === 0) {
                this.addBusMarker(onStop.point, onStop.title);
                this.addBusMarker(offStop.point, offStop.title);
            }
            // BMAP_LINE_TYPE_SUBWAY
            if (+line.type === 1) {
                this.addSubwayMarker(onStop.point, onStop.title);
                this.addSubwayMarker(offStop.point, offStop.title);
            }

            linePaths = linePaths.concat(line.getPath());
            this.addLine(line.getPath());
        }
    }

    setZoom(zoom = 14) {
        this.instance.setZoom(zoom);
    }

    setCenter({
        lng = 116.404,
        lat = 39.915
    }) {
        let point = new BMap.Point(lng, lat);
        this.instance.setCenter(point);
    }
}

export default new MapApi();

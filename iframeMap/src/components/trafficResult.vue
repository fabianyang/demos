<template>
    <div class="traffic_result">
        <div v-if="tool === 'transit' && !nodata">
            <div class="map_line" v-for="(plan, i) in ds" :key="i">
                <div class="map_line_tit" @click="switchPlan(i)">
                    <strong v-for="(line, j) in plan.line" :key="j">
                        <span class="hcard" v-if="j === 0">{{ i + 1 }} </span>{{ line.title }}
                        <span class="rarr" v-if="j < plan.line.length - 1">→</span>
                    </strong>
                    <em>约{{ parseInt( plan.duration / 60 ) }}分钟/{{ Math.round( parseFloat( plan.distance / 1000 ) * 10) / 10 }}公里</em>
                </div>
                <div v-show="drop_index === i">
                    <dl class="map_line_way">
                        <dt class="start">
                            <strong>{{ start }}</strong>
                        </dt>
                        <template v-for="(line, j) in plan.line">
                            <dd>
                                <i class="walk"></i>
                                <div class="info">步行至
                                    <a>{{ line.onStop }}</a>
                                </div>
                            </dd>
                            <dd>
                                <i class="bus"></i>
                                <div class="info">乘坐
                                    <strong>{{ line.title }}</strong>, 在
                                    <a class="ks">{{ line.offStop }}</a> 下车
                                </div>
                            </dd>
                        </template>
                        <dt class="end">
                            <strong>{{ end }}</strong>
                        </dt>
                    </dl>
                </div>
            </div>
        </div>
        <div v-if="tool === 'driving' && !nodata">
            <div class="map_line" v-for="(plan, i) in ds" :key="i">
                <div class="map_line_tit">约{{ parseInt( plan.duration / 60 ) }}分钟/{{ Math.round( parseFloat( plan.distance / 1000 ) * 10) / 10 }}公里</div>
                <dl class="map_line_way drive">
                    <dt class="start">
                        <strong>{{ start }}</strong>
                    </dt>
                    <dd v-for="(step, j) in plan.steps" :key="j">
                        <i>{{ j + 1 }}.</i>
                        <div class="info">{{ step }}</div>
                    </dd>
                    <dt class="end">
                        <strong>{{ end }}</strong>
                    </dt>
                </dl>
            </div>
        </div>
        <div v-if="nodata === 1" class="lzbcxb">
            <div class="title">请选择准确的起点、途经点或终点</div>
            <div class="content">
                <div class="seltop">
                    <div class="s3"></div>
                    <div class="name">起点：
                        <strong>{{ start }}</strong>
                    </div>
                </div>
                <div class="seltop">
                    <div class="s3"></div>
                    <div class="name">终点：
                        <strong>{{ end }}</strong>
                    </div>
                </div>
                <div class="info">未找到相关地点。<br>您可以修改搜索内容。</div>
            </div>
        </div>
    </div>
</template>

<script>
import map from '@/api/map';
export default {
    name: 'tabPanel',
    props: ['ds', 'nodata', 'tool', 'start', 'end'],
    methods: {
        switchPlan(index) {
            this.drop_index = index;
            map.clearOverlays();
            map.switchTransitPlan(index);
        }
    },
    data() {
        return {
            drop_index: 0
        }
    }
}
</script>

<style scoped>
.map_line {
    margin-top: 12px;
    border: 1px solid #9cb5ff;
}

.map_line_tit {
    padding: 0 5px;
    line-height: 20px;
    border-bottom: 1px solid #9cb5ff;
    background: #ebf1fb;
    color: #999;
    cursor: pointer;
}

.map_line_tit strong {
    margin-right: 5px;
    font-size: 14px;
    color: #039;
}

.map_line_way {
    margin: 0 5px;
    padding: 5px 0 20px 0;
}

.map_line_way dd {
    padding: 3px 0;
    overflow: hidden;
}

.map_line_way dd a {
    color: #039;
}

.map_line_way dd i {
    float: left;
    width: 23px;
    height: 22px;
    line-height: 20px;
    text-align: right;
    font-style: normal;
}

.map_line_way dd i.walk {
    background: url(../assets/img/way_more.gif) no-repeat left -1px;
}

.map_line_way dd i.bus {
    background: url(../assets/img/way_more.gif) no-repeat -24px -1px;
}

.map_line_way dd .info {
    line-height: 20px;
    overflow: hidden;
}

.map_line_way .start {
    padding: 5px 6px 0 30px;
    height: 28px;
    line-height: 28px;
    background: url(../assets/img/way_start.gif) 0 7px no-repeat;
}

.map_line_way .end {
    padding: 5px 6px 0 30px;
    height: 28px;
    line-height: 28px;
    background: url(../assets/img/way_end.gif) 0 7px no-repeat;
}
</style>


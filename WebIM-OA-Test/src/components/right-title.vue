<template>
    <div class="fbconrtit clearfix">
        <div class="flol">
            <span class="searchdel" @click="closeSearch"></span>
            <input id="im_inputsearch" class="search" type="text" @input="search" @focus="onFucus" placeholder="搜索">
        </div>
        <a class="flol close2" @click="stateChange(['app', 'min'])"></a>
    </div>
</template>

<script>
import events from '../events';
import { mapState, mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE, VIEW_SEARCH_USER_CHANGE } from '../store/mutation-types';

let timer = null,
    lastRightState = '',
    el_input = null;

let getElInput = () => {
    if (!el_input) {
        el_input = document.getElementById('im_inputsearch');
    }
    return el_input;
}

export default {
    name: 'right-title',
    computed: mapState({
        rightState: state => state.right
    }),
    methods: {
        closeSearch() {
            clearTimeout(timer);
            getElInput().value = '';
            if (lastRightState) {
                this.stateChange(['right', lastRightState]);
            }
        },
        search() {
            let keyword = getElInput().value;
            this.stateSearchChage({
                result: [],
                info: 'loading'
            });
            // 隐藏搜索界面
            if (keyword) {
                this.stateChange(['right', 'search']);
            } else {
                this.stateChange(['right', lastRightState])
                return;
            }
            clearTimeout(timer);
            let that = this;
            timer = setTimeout(() => {
                that.stateSearchChage({
                    keyword: keyword
                });
                events.trigger('view:search:user', {
                    keyword: keyword
                });
            }, 1000);
        },
        onFucus() {
            if (this.rightState !== 'search') {
                lastRightState = this.rightState;
            }
        },
        ...mapMutations({
            'stateSearchChage': VIEW_SEARCH_USER_CHANGE,
            'stateChange': VIEW_STATE_CHANGE // 映射 this.add() 为 this.$store.commit('increment')
        })
    },
    data() {
        return {
            lastRightState: ''
        }
    }
}
</script>

<style lang="scss" scoped>
div,
input,
a {
    box-sizing: border-box;
}

div {
    margin: 0;
    padding: 0;
    border: 0;
}

input {
    font-size: 12px;
    padding: 0;
    font-family: inherit;
}

a {
    color: #333;
    text-decoration: none;
}

a:hover {
    color: #333;
    cursor: pointer;
}

.flol {
    position: relative;
}
.flol .searchdel {
    width: 20px;
    height: 20px;
    position: absolute;
    right: 10px;
    top: 5px;
    cursor: pointer;
    background: url(../assets/images/search-del.png) no-repeat center;
}

/* 搜索 最小化 */

.fbconrtit {
    width: 240px;
    height: 52px;
    padding: 11px 0px 11px 15px;
}

.fbconrtit .search {
    width: 180px;
    height: 30px;
    padding: 5px;
    padding-left: 34px;
    line-height: 18px;
    border: 1px solid #e5e5e5;
    border-radius: 4px;
    background: url(../assets/images/icon-search.png) no-repeat 10px center;
    background-color: #f7f7f7;
}

.fbconrtit .close2 {
    width: 45px;
    height: 30px;
    display: inline-block;
    background: url(../assets/images/icon-close2.png) no-repeat center;
}

</style>
<template>
    <div class="fbconrtit clearfix">
        <form class="flol">
            <input class="search" type="text" name="" placeholder="搜索">
        </form>
        <a class="flol close2" @click="stateChange(['app', 'min'])"></a>
    </div>
</template>

<script>

import { mapMutations } from 'vuex';
import { VIEW_STATE_CHANGE } from '../store/mutation-types';

export default {
    name: 'right-title',
    methods: {
        ...mapMutations({
            'stateChange': VIEW_STATE_CHANGE // 映射 this.add() 为 this.$store.commit('increment')
        })
    },
    data() {
        return {
            msg: 'Welcome to Your Vue.js App'
        }
    }
}
</script>

<style lang="scss" scoped>
div,
form,
input,
a {
    box-sizing: border-box;
}

div,
form {
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
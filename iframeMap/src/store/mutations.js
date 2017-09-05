import {
    VIEW_TOPNAV_CHANGE,
    VIEW_TOOL_CHANGE,
    VIEW_MAINTAB_CHANGE,
    VIEW_SUBTAB_CHANGE,
    VIEW_BUILDING_CHANGE,
    VIEW_AROUND_CHANGE,
    VIEW_LOCALSEARCH_CHANGE,
    VIEW_XIANWU_CHANGE,
    VIEW_MARKER_HOVER,
    VIEW_MARKER_CLICK,
    VIEW_CARD_CLOSE
} from './mutation-types';

// let vars = window.FangMap.vars;

let clear = (state) => {
    state.dsBuildingCard = '';
    state.marker.click = '';
    state.tool = '';
};

export default {
    [VIEW_CARD_CLOSE](state) {
        clear(state);
    },
    [VIEW_MARKER_HOVER](state, data) {
        state.marker.hover = data;
    },
    [VIEW_MARKER_CLICK](state, data) {
        state.marker.click = data;
    },
    [VIEW_TOPNAV_CHANGE](state, data) {
        clear(state);
        state.view = data;
    },
    [VIEW_TOOL_CHANGE](state, data) {
        clear(state);
        if (data !== 'meter') {
            state.tool = data;
        }
    },
    [VIEW_MAINTAB_CHANGE](state, data) {
        clear(state);
        state.mainKey = data.key;
    },
    [VIEW_SUBTAB_CHANGE](state, data) {
        clear(state);
        state.subKey = data.key;
        let mainKey = state.mainKey || 'around';
        state.dsAroundMarkers = state[mainKey][data.key] || [];
    },
    [VIEW_BUILDING_CHANGE](state, data) {
        state.dsBuildingCard = data;
    },
    [VIEW_AROUND_CHANGE](state, data) {
        if (!data) {
            state.dsAroundMarkers = state.around[state.subTab.around[0]] || [];
        } else {
            state.subTab.around = data.list;
            state.around = data.data;
            state.dsAroundMarkers = state.around[data.list[0]] || [];
        }
    },
    [VIEW_XIANWU_CHANGE](state, data) {
        if (!data) {
            state.dsAroundMarkers = state.xianwu[state.subTab.xianwu[0]] || [];
        } else {
            state.subTab.xianwu = data.list;
            state.xianwu = data.data;
        }
    },
    [VIEW_LOCALSEARCH_CHANGE](state, data) {
        let subKey = state.subTab[data.key][0];
        state[data.key] = data.data;
        state.dsAroundMarkers = data.data[subKey] || [];
    }
};

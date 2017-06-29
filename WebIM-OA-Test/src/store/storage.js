let config = window.FangChat.config;

class Storage {
    constructor() {
        this.key = 'fang_oaim_' + config.username;
        let ls = window.localStorage;
        if (ls) {
            try {
                if (ls) {
                    ls.setItem('testPrivateModel', !1);
                }
            } catch (e) {
                ls = null;
                console.log('window localStorage is private');
            }
        } else {
            ls = null;
            console.log('window not find localStorage');
        }
        this.core = window.localStorage;
        this.synctime = {};

        if (ls) {
            let item = ls.getItem(this.key);
            if (item) {
                let json = JSON.parse(item);
                if (json.synctime) {
                    this.synctime = json.synctime;
                } else {
                    this.synctime = {};
                }
            } else {
                ls.setItem(this.key, JSON.stringify({
                    synctime: {}
                }));
            }
        }
    }

    setSynctime(id, time = new Date().getTime()) {
        let item = this.core.getItem(this.key);
        let json = JSON.parse(item);

        this.synctime[id] = time;

        json.synctime = this.synctime;

        this.core.setItem(this.key, JSON.stringify(json));
    }

    getSynctime(id) {
        let synctime = this.synctime;
        if (id) {
            return this.synctime[id];
        }

        let result = Object.keys(synctime).sort((a, b) => {
            return synctime[a] - synctime[b];
        });

        return synctime[result[0]] || 0;
    }

    // key 和 mutation 最好一致
    coreSet(key, data) {
        let item = this.core.getItem(this.key);
        let json = JSON.parse(item);
        json[key] = data;
        this.core.setItem(this.key, JSON.stringify(json));
    }
    coreGet(key) {
        let item = this.core.getItem(this.key);
        let json = JSON.parse(item);
        return json[key] || undefined;
    }
}
let s = new Storage();

export default s;

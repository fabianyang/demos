// https://codereview.stackexchange.com/questions/105754/access-resolve-function-outside-of-a-javascript-promise
function Deferred(callback) {
    var instance = this;

    // Catch the resolve and reject
    this._resolver = null;
    this._rejector = null;
    this._promise = new Promise(function (resolve, reject) {
        instance._resolver = resolve;
        instance._rejector = reject;
    });

    // Deferred has { resolve, reject }. But personally, I like the Promise
    // version of resolve and reject as separate args.
    if (typeof callback === 'function')
        callback.call(this, this._resolver, this._rejector);
}

Deferred.prototype.then = function (resolve, reject) {
    return this._promise.then(resolve, reject);
};

Deferred.prototype.resolve = function (resolution) {
    this._resolver.call(null, resolution);
    return this;
};
Deferred.prototype.reject = function (rejection) {
    this._rejector.call(null, rejection);
    return this;
};

// resolve, reject etc.

// For other APIs, refer to jQuery for Deferred and MDN for Promises:
// https://api.jquery.com/category/deferred-object/
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise

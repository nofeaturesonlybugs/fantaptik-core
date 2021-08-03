/**
 * @namespace promise
 * @example
 * import promise from '@fantaptik/core';
 * 
 * promise.reject( 1000, "error" ).catch( e => console.log( e ) ); // "error" after 1s
 * promise.resolve( 500, ["a", "b"] ).then( data => console.log( data ) ); // ["a", "b"] after .5s
 */

/**
 * `reject` returns a promise that will reject after the specified `timeout` with `result`.
 * 
 * @name promise.reject
 * @static 
 * @function
 * 
 * @param {number} timeout Timeout in ms.
 * @param {*} result The result to reject.
 * @returns {Promise}
 */
const reject = (timeout, result) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( () => {
            reject( result )
        }, timeout );
    } );
}

/**
 * `resolve` returns a promise that will resolve after the specified `timeout` with `result`.
 * 
 * @name promise.reject
 * @static 
 * @function
 * 
 * @param {number} timeout Timeout in ms.
 * @param {*} result The result to resolve.
 * @returns {Promise}
 */
const resolve = (timeout, result) => {
    return new Promise( (resolve, reject ) => {
        setTimeout( () => {
            resolve( result )
        }, timeout );
    } );
}

export default { reject, resolve };
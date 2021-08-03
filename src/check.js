/**
 * @namespace check
 * @example
 * import check from '@fantaptik/core';
 * 
 * console.log( check.gte( 10 - 11, 1 ) );  // 1
 * console.log( check.gte( 10 - 6, 1 ) );   // 4
 */

/**
 * `gte` returns `value >= against ? value : against`  
 * 
 * @name check.gte
 * @static 
 * @function
 * 
 * @param {number|string} value Value to check
 * @param {number} against Minimum value allowed.
 * @returns {number}
 */
const gte = (value, against) => {
    value = parseInt( value, 10 );
    value = value >= against ? value : against;
    return value;
}

/**
 * `lte` returns `value <= against ? value : against`  
 * 
 * @name check.lte
 * @static 
 * @function
 * 
 * @param {number|string} value Value to check
 * @param {number} against Maximum value allowed.
 * @returns {number}
 */
const lte = (value, against) => {
    value = parseInt( value, 10 );
    value = value <= against ? value : against;
    return value;
}

export default { gte, lte };
import { MODULE_NAME } from './consts';

/**
 * `destroy` acts as a destructor for `obj`.  All top-level methods of `obj` are replaced by methods that issue a
 * console warning.
 * 
 * @example
 * destroy( instance, "myThingerPackage", "Thinger" );
 * 
 * @param {Object} obj The object to destroy.
 * @param {string} module The package or library name.
 * @param {string} label An identifying label for the entity being destroyed.
 */
const destroy = ( obj, module, label ) => {
    const type = typeof obj;
    const test = obj === null || obj === undefined
        || type === "bigint" || type === "boolean" || type === "function" || type === "number" || type === "string" || type === "symbol";
    if( test ) {
        return;
    }
    for( let [ key, value ] of Object.entries( obj ) ) {
        if( typeof value === "function" ) {
            obj[ key ] = () => {
                console.warn( `${module}/${label}: Calling ${key}() on destroyed instance.` );
            }
        } /* else {
            console.log( MODULE_NAME + `${module}/${label} <${key}, ${value}>` );
        } */
    }
}

export default destroy;
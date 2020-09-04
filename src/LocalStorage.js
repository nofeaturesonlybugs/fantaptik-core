import { MODULE_NAME } from './consts';
import destroy from './destroy';
import Events from './Events';

const EVENT_STORAGE = "storage";

/**
 * `StorageEvent` defines the events dispatched by `LocalStorage`.
 * 
 * @see {LocalStorage}
 * @typedef StorageEvent
 * @type {Object}
 * @property {string|null} key The storage item key.
 * @property {Object|string|null} oldValue The old value.
 * @property {Object|string|null} newValue The new value.
 * @property {boolean} cleared `true` if the storage was cleared.
 * @property {boolean} created `true` if this event fired due to `key` being created in storage.
 * @property {boolean} deleted `true` if this event fired due to `key` being removed from storage.
 * @property {boolean} modified `true` if this event fired due to `key` being modified in storage.
 */

/**
 * Will be `true` if the features needed by this class are available in the environment; `false` otherwise.
 * 
 * @ignore
 */
const ENABLED = true
    && window 
    && window.localStorage && window.localStorage.setItem && window.localStorage.getItem && window.localStorage.removeItem
    && window.addEventListener && window.removeEventListener;

/**
 * `LocalStorage` provides access to `window.localStorage`.  
 * 
 * > *Support*  
 * >> `LocalStorage` only works when `window.localStorage` is an `Object` with the approproate interface.  In environments where
 * `window.localStorage` does not exist or does not have the correct interface all methods on `LocalStorage` are no-ops.  
 * 
 * > *Automatic Encoding*  
 * >> Values set or retrieved from storage are automatically JSON encoded and decoded.  A value that can not be JSON decoded is
 * returned as-is when retrieving said value or dispatching events.
 * 
 * > *Global or Prefixed*  
 * >> Access to storage can be *global* or *prefixed* by setting `opts.prefix` to an empty string or a non-empty string respectively.  
 * 
 * >> *Global*  
 * >>> When *global* it is possible for items set in storage to overwrite or replace items set by other packages or modules.  Events are not
 * filtered and you will receive `StorageEvent`s for items you may not care to receive.
 * 
 * >> *Prefixed*  
 * >>> When *prefixed* items only overwrite or replace items set with the same prefix.  Events for items are filtered by prefix and you
 * will only receive events for items with a matching prefix.  
 * >>> Prefixes are automatically prepended or stripped from item keys as appropriate; you only need to set the prefix when creating
 * an instance of `LocalStorage`.  
 * 
 * > *Predictable Prefixes*  
 * >> `LocalStorage` is used to send data across browser tabs; therefore when using prefixes each tab needs to use the same
 * prefix to only receive events it cares about.  
 * >> UUIDs or other unique identifiers will not make good prefixes unless you implement a mechanism to share those values
 * with every browser tab of your application.  
 * 
 * > *Examples*  
 * >> Consider the following event handler for all of the examples:  
 * >> ```js
 * >> const storageHandler = event => {
 * >>     console.log( 
 * >>         event.key, event.created, event.deleted, event.modified,
 * >>         event.oldValue, event.newValue
 * >>     );
 * >> }
 * >> ```
 * 
 * >> *Global*  
 * >>> ```js
 * >>> const storage = new LocalStorage();
 * >>> let unregister = storage.register( storageHandler );
 * >>>
 * >>> storage.set( 'message', 'Hello, World!' );
 * >>> // console: message, true, false, false, null, 'Hello, World!'
 * >>>
 * >>> storage.set( 'message', 'Good bye!' );
 * >>> // console: message, false, false, true, 'Hello, World!', 'Good bye!'
 * >>>
 * >>> unregister(); // Removes handler
 * >>>
 * >>> // Only events for keys === 'total' will fire.
 * >>> unregister = storage.registerItem( 'total', storageHandler );
 * >>>
 * >>> storage.set( 'message', 'Hello, World!' );
 * >>> storage.set( 'message', 'Good bye!' );
 * >>> // Neither of the above will create console output.
 * >>>
 * >>> storage.set( 'total', 42 );
 * >>> // console: total, true, false, false, null, 42
 * >>> ```
 * 
 * >> *Prefixed*  
 * >>> ```js
 * >>> const storage = new LocalStorage();
 * >>> const prefixed = new LocalStorage( { prefix : 'some-unique-value' } );
 * >>> let unregister = prefixed.register( storageHandler );
 * >>>
 * >>> storage.set( 'message', 'Hello, World!' );
 * >>> // No console output -- setting value on global storage does not
 * >>> // trigger events on prefixed storage.
 * >>>
 * >>> prefixed.set( 'someValue', 'important data' );
 * >>> // console: someValue, true, false, false, null, 'important data'
 * >>> // NB: Handlers on `storage` would fire as well with 
 * >>> //     key as 'some-unique-value' + 'someValue'
 * >>> ```
 * 
 * @class
 * @see {StorageEvent}
 */
class LocalStorage {
    /**
     * Creates a new `LocalStorage` instance.
     * 
     * @param {Object} opts Options for `LocalStorage`.
     * @param {string} opts.prefix If provided acts as a prefix for items set and retrieved in the storage;
     * can be used to prevent name collisions.
     */
    constructor( opts ) {
        opts = opts || {};
        let { prefix } = opts;
        prefix = typeof prefix === "string" ? prefix : "";
        this.props = {
            prefix,
            // `events` are handlers for every item or key in the storage.
            events : new Events(),
            // `itemEvents` are handlers for specific items or keys in the storage.
            itemEvents : new Events(),
        };
        this.funcs = {
            /**
             * `decode` decodes the values from storage.
             * 
             * @param {string} value The `value` of the storage item.
             * @returns {Object|string|null}
             */
            decode : value => {
                if( typeof value !== "string" ) {
                    return value;
                }
                // This package assumes values are JSON encoded.
                try {
                    let decoded = JSON.parse( value );
                    value = decoded;
                } catch( decodeError ) {
                    ; // Error decoding JSON - just use as a string.
                }
                return value;
            },

            /**
             * `handler` is our internal handler for storage events.
             */
            handler : storageEvent => {
                let { key, oldValue, newValue } = storageEvent;
                const cleared = key === null;
                const created = ! cleared && oldValue === null && newValue !== null;
                const deleted = cleared || oldValue !== null && newValue === null;
                const modified = ! cleared && ! created && oldValue !== newValue;
                let event = { key, oldValue, newValue, cleared, created, deleted, modified };
                if( key !== null && (prefix === "" || key.startsWith( prefix )) ) {
                    // This package assumes values are JSON encoded.
                    oldValue = this.funcs.decode( oldValue );
                    newValue = this.funcs.decode( newValue );
                    key = prefix !== "" ? key.replace( prefix, "" ) : key;
                    event = { ...event, key, oldValue, newValue };
                    this.props.events.trigger( EVENT_STORAGE, event );
                    this.props.itemEvents.trigger( key, event );
                } else if( key === null ) {
                    this.props.events.trigger( EVENT_STORAGE, event );
                }
            }
        }
        //
        if( ENABLED ) {
            window.addEventListener( "storage", this.funcs.handler );
        }
    }

    /**
     * `destroy` unregisters all handlers and frees internal members.  
     * 
     * It does not delete any of the data in local storage.
     * 
     * @method
     */
    destroy = () => {
        if( ENABLED ) {
            window.removeEventListener( "storage", this.funcs.handler );
        }
        //
        this.props.events.destroy();
        this.props.itemEvents.destroy();
        delete this.props;
        //
        destroy( this, MODULE_NAME, "LocalStorage" );
    }

    /**
     * `get` returns the storage value for `item`.
     * 
     * @method
     * @param {string} item The `item` to get.
     * @returns {Object|string}
     */
    get = ( item ) => {
        if( ENABLED ) {
            const { prefix } = this.props;
            item = window.localStorage.getItem( prefix + item );
            return this.funcs.decode( item );
        }
        return null;
    }

    /**
     * `register` registers an event `handler` for any change in the storage.  Changes to specific items
     * and clearing the storage will fire `handler`.
     * 
     * @method
     * @param {func} handler Handler with signature ` (StorageEvent) => {}`
     * @returns {func} An unregister function.
     */
    register = handler => {
        if( ENABLED ) {
            return this.props.events.register( EVENT_STORAGE, handler );
        }
        return () => null;
    }

    /**
     * `registerItem` registers an event `handler` for any change in storage for a specific storage item
     * or key.
     * 
     * @method
     * @param {string} item The `item` name or key.
     * @param {func} handler Handler with signature ` (StorageEvent) => {}`
     * @returns {func} An unregister function.
     */
    registerItem = ( item, handler ) => {
        if( ENABLED ) {
            return this.props.itemEvents.register( item, handler );
        }
        return () => null;
    }

    /**
     * `remove` removes the data in the named `item`.
     * 
     * @method
     * @param {string} item The `item` to remove.
     */
    remove = item => {
        if( ENABLED ) {
            const { prefix } = this.props;
            window.localStorage.removeItem( prefix + item );
        }
    }

    /**
     * `set` sets the storage `item` to `value`.  `value` will be JSON encoded.
     * 
     * @method
     * @param {string} item The `item` to set.
     * @param {Object|string} value The `value` to store.
     */
    set = ( item, value ) => {
        if( ENABLED ) {
            const { prefix } = this.props;
            window.localStorage.setItem( prefix + item, JSON.stringify( value ) );
        }
    }
}

export default LocalStorage;
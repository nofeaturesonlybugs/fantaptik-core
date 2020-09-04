import { MODULE_NAME } from './consts';
import destroy from './destroy';

/**
 * `EventHandler` defines the event handler signature expected by `Events`.
 * 
 * @see {Events}
 * @callback EventHandler
 * @param {Object} eventData The event data associated with the event.
 */

/**
 * `Events` provides unified event handling for event registering, unregistering, and notifying of
 * registered handlers.
 * 
 * @class
 * @see {EventHandler}
 * @interface
 */
class Events {
    constructor() {
        this.props = {
            listeners : [],
        };
    }

    /**
     * `destroy` unregisters all handlers and frees internal members.
     * 
     * @method
     */
    destroy = () => {
        delete this.props;
        //
        destroy( this, MODULE_NAME, "Events" );
    }

    /**
     * `register` registers an event handler that will fire only for events matching `name`.
     * 
     * @method
     * @param {string} name The event `name` to register the handler to.
     * @param {EventHandler} handler The handler function.
     * @returns {func} A function that can be called to unregister the handler.
     */
    register = ( name, handler ) => {
        const meta = { name, handler };
        this.props.listeners.push( meta );
        return () => {
            if( this.props && this.props.listeners ) {
                this.props.listeners = this.props.listeners.filter( existing => existing !== meta );
            }
        }
    }

    /**
     * `trigger` fires all of the appropriate handlers matching `name` with `data` as the event data.
     * 
     * @method
     * @param {string} name
     * @param {Object} data
     */
    trigger = ( name, data ) => {
        this.props.listeners.map( meta => name === meta.name ? meta.handler( data ) : null );
    }
}

export default Events;
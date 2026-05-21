
import EventEmitter from "node:events";
import { AdapterLibrary } from "./adapter_library";
import { Location } from "./location";

/** Type that describes a fnction that has any number of any arguments and returns anything */
export type AnyFunction = (...args: any[]) => any
/** Type that describes an arbitrary configuration of adapter for custom functionality */
export type AdapterConfig = {[index: string]: any}

/** Class representing the implementation of a service */
export class MultiPostAdapter {
  /** Unique ID of adapter across all MultiPost adapters */
  id: string = ""
  /** Unique ID of instance, usually referring to the authenticated account on service */
  instance_id: string = ""

  /** If the adapter is ready for processing or not */
  ready: boolean = false

  /** Full Unique ID of adapter when compared to entire global MultiPost context */
  get full_id() { return [this.id, this.instance_id] }

  /** Arbitrary configuration of adapter for custom functionality */
  config: AdapterConfig

  _events: EventEmitter = new EventEmitter()

	/**
	 * Listens to events of adapter
	 * @param {string} eventName - Name of event channel to listen on
	 * @param {AnyFunction} callback - Callback function to be fired when event is emitted
	 */
  on(eventName: string, callback: AnyFunction) { return this._events.on(eventName, callback) }

	/**
	 * Wait for the adapter to be ready
	 * @returns {Promise<void>} Promise that resolves once adapter is ready
	 */
  awaitReady(): Promise<void> {
    return new Promise<void>((res, rej) => {
      if (this.ready) { res() } else {
        this._events.once("ready", res)
      }
    })
  }

  /**
   * Create an adapter
   * @constructor
   * @param {Post[]} config - Arbitrary configuration of adapter for custom functionality
   */
  constructor(config: AdapterConfig) {
    this.config = config
    this._setup()
  }

  async _setup(): Promise<void> {
    AdapterLibrary.add(this)
    
    let res = await (this as any)?.setup?.()

    this._events.emit("ready")
    this.ready = true
    
    return res
  }

  /**
   * Gets a location
   * @param {any[]} args - Arguments for query / selecting a specific location
   * @returns {Promise<Location | undefined>} Either a location or undefined if nothing found
   */
  async get_location(...args: any[]): Promise<Location | undefined> { return }
}
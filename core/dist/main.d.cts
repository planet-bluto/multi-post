import EventEmitter from "node:events";

//#region src/extends/print.d.ts
declare global {
  function print(...args: any[]): void;
}
//#endregion
//#region src/modules/adapter.d.ts
/** Type that describes a fnction that has any number of any arguments and returns anything */
type AnyFunction = (...args: any[]) => any;
/** Type that describes an arbitrary configuration of adapter for custom functionality */
type AdapterConfig = {
  [index: string]: any;
};
/** Class representing the implementation of a service */
declare class MultiPostAdapter {
  /** Unique ID of adapter across all MultiPost adapters */
  id: string;
  /** Unique ID of instance, usually referring to the authenticated account on service */
  instance_id: string;
  /** If the adapter is ready for processing or not */
  ready: boolean;
  /** Full Unique ID of adapter when compared to entire global MultiPost context */
  get full_id(): string[];
  /** Arbitrary configuration of adapter for custom functionality */
  config: AdapterConfig;
  _events: EventEmitter;
  /**
   * Listens to events of adapter
   * @param {string} eventName - Name of event channel to listen on
   * @param {AnyFunction} callback - Callback function to be fired when event is emitted
   */
  on(eventName: string, callback: AnyFunction): EventEmitter<any>;
  /**
   * Wait for the adapter to be ready
   * @returns {Promise<void>} Promise that resolves once adapter is ready
   */
  awaitReady(): Promise<void>;
  /**
   * Create an adapter
   * @constructor
   * @param {Post[]} config - Arbitrary configuration of adapter for custom functionality
   */
  constructor(config: AdapterConfig);
  _setup(): Promise<void>;
  /**
   * Gets a location
   * @param {any[]} args - Arguments for query / selecting a specific location
   * @returns {Promise<Location | undefined>} Either a location or undefined if nothing found
   */
  get_location(...args: any[]): Promise<Location | undefined>;
}
//#endregion
//#region src/modules/content.d.ts
interface IContentRow {
  parts: IContentPart[];
  locations?: string[][] | Location[];
}
interface IContentPart {
  text: string;
  locations?: string[][] | Location[];
}
//#endregion
//#region src/modules/media.d.ts
interface IMedia {
  path: string;
  caption: string;
}
//#endregion
//#region src/modules/post.d.ts
type MEDIA_SLOTS = [IMedia?, IMedia?, IMedia?, IMedia?];
interface IPost {
  content: IContentRow[];
  media: MEDIA_SLOTS;
}
/** Class representing a singular post within a crosspost */
declare class Post implements IPost {
  /** The text content of the post. Formatted to handle filtering for each location, inline formatting and special characters */
  content: IContentRow[];
  /** The media attached to the post. Only up to 4 can be attached since that's the usual limit */
  media: MEDIA_SLOTS;
  /**
   * Create a post
   * @constructor
   * @param {IContentRow[]} content - The text content of the post. Formatted to handle filtering for each location, inline formatting and special characters
   * @param {MEDIA_SLOTS} media - The media attached to the post. Only up to 4 can be attached since that's the usual limit
   */
  constructor(content: IContentRow[], media: MEDIA_SLOTS);
}
//#endregion
//#region src/modules/location.d.ts
/** Class representing a destination of a crosspost */
declare abstract class Location {
  /** Unique ID of location within the adapter / service */
  abstract id: string;
  /** Adapter / owner of this location */
  abstract adapter: MultiPostAdapter;
  /**
   * Makes posts to this location
   * @param {IPost[]} posts - Posts to be made. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters
   * @param {MultiPostOptions} opts - Arbitrary options for custom functionality within adapters
   * @returns {Promise<void>} Should resolve once ALL posts are made
   */
  abstract make_posts(posts: IPost[], opts?: MultiPostOptions): Promise<void>;
  /** Full Unique ID of location when compared to entire global MultiPost context */
  get full_id(): string[];
}
//#endregion
//#region src/modules/multi_post.d.ts
/** Type that describes arbitrary options for custom functionality within adapters */
type MultiPostOptions = {
  [index: string]: any;
};
/**
 * Utility function for resolving to a location ID from either a Location instance or a location ID
 * @param {string[] | Location} locOrLocID - A Location instance or a location ID
 * @return {string[]}
 */
declare function resolveLocationID(locOrLocID: string[] | Location): string[];
/** Class representing a crosspost */
declare class MultiPost {
  /** The post(s) to be crossposted. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters */
  posts: Post[];
  /** The target locations to send the post(s) */
  locations: Location[];
  /** Arbitrary options for custom functionality within adapters */
  opts: MultiPostOptions;
  /**
   * Create a crosspost
   * @constructor
   * @param {Post[]} posts - The post(s) to be crossposted. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters
   * @param {Location[]} locations - The target locations to send the post(s)
   * @param {MultiPostOptions} opts - Arbitrary options for custom functionality within adapters
   */
  constructor(posts?: Post[], locations?: Location[], opts?: MultiPostOptions);
  /**
   * Method that actually makes the posts
   */
  crosspost(): Promise<void>;
}
/**
 * Utility function for testing if the contents of two arrays the exact same
 * @param {any[]} arr1 - First array to compare
 * @param {any[]} arr2 - Second array to compare
 * @return {boolean}
 */
declare function arrayEqual(arr1: any[], arr2: any[]): boolean;
//#endregion
//#region src/modules/adapter_library.d.ts
/** Static class for managing and querying all MultiPost adapters */
declare class AdapterLibrary {
  static _adapters: Map<string, MultiPostAdapter>;
  static _events: EventEmitter;
  /**
   * Adds an adapter. Automatically called by the {@link MultiPostAdapter} during construction
   * @param {MultiPostAdapter} adapter - The adapter to add
   */
  static add(adapter: MultiPostAdapter): void;
  /**
   * Gets an adapter by ID
   * @param {string} id - ID of the adapter to look
  * @returns {MultiPostAdapter | undefined} Either the found adapter or undefined if nothing found
   */
  static get(id: string): MultiPostAdapter | undefined;
  /**
   * Wait for all added adapter to be ready
  * @returns {Promise<void>} Promise that resolves once ALL adapter are ready
   */
  static awaitReady(): Promise<void>;
}
//#endregion
export { AdapterConfig, AdapterLibrary, AnyFunction, IContentPart, IContentRow, IMedia, IPost, Location, MultiPost, MultiPostAdapter, MultiPostOptions, Post, arrayEqual, resolveLocationID };
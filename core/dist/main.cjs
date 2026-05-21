Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let node_events = require("node:events");
node_events = __toESM(node_events);
//#region src/extends/print.ts
global.print = console.log;
//#endregion
//#region src/modules/multi_post.ts
/**
* Utility function for resolving to a location ID from either a Location instance or a location ID
* @param {string[] | Location} locOrLocID - A Location instance or a location ID
* @return {string[]}
*/
function resolveLocationID(locOrLocID) {
	if (Array.isArray(locOrLocID)) return locOrLocID;
	else return locOrLocID.full_id;
}
/** Class representing a crosspost */
var MultiPost = class {
	/**
	* Create a crosspost
	* @constructor
	* @param {Post[]} posts - The post(s) to be crossposted. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters
	* @param {Location[]} locations - The target locations to send the post(s)
	* @param {MultiPostOptions} opts - Arbitrary options for custom functionality within adapters
	*/
	constructor(posts = [], locations = [], opts = {}) {
		this.posts = [];
		this.locations = [];
		this.posts = posts;
		this.locations = locations;
		this.opts = opts;
	}
	/**
	* Method that actually makes the posts
	*/
	async crosspost() {
		for (const location of this.locations) {
			let posts = this.posts.map((base_post) => {
				let post = Object.assign({}, base_post);
				post.content = post.content.filter((row) => row.locations == void 0 || (row.locations ?? []).some((loc) => arrayEqual(resolveLocationID(loc), location.full_id)));
				post.content = post.content.map((base_row) => {
					let row = Object.assign({}, base_row);
					delete row.locations;
					row.parts = row.parts.filter((part) => part.locations == void 0 || (part.locations ?? []).some((loc) => arrayEqual(resolveLocationID(loc), location.full_id)));
					return row;
				});
				return post;
			});
			await location.make_posts(posts, this.opts);
		}
	}
};
/**
* Utility function for testing if the contents of two arrays the exact same
* @param {any[]} arr1 - First array to compare
* @param {any[]} arr2 - Second array to compare
* @return {boolean}
*/
function arrayEqual(arr1, arr2) {
	let test = arr1.length == arr2.length && arr1.every((val, idx) => arr2[idx] == val);
	print("arr equal:", arr1, arr2, test);
	return test;
}
//#endregion
//#region src/modules/post.ts
/** Class representing a singular post within a crosspost */
var Post = class {
	/**
	* Create a post
	* @constructor
	* @param {IContentRow[]} content - The text content of the post. Formatted to handle filtering for each location, inline formatting and special characters
	* @param {MEDIA_SLOTS} media - The media attached to the post. Only up to 4 can be attached since that's the usual limit
	*/
	constructor(content, media) {
		this.content = content;
		this.media = media;
	}
};
//#endregion
//#region src/modules/location.ts
/** Class representing a destination of a crosspost */
var Location = class {
	/** Full Unique ID of location when compared to entire global MultiPost context */
	get full_id() {
		return [
			this.adapter.id,
			this.adapter.instance_id,
			this.id
		];
	}
};
//#endregion
//#region src/modules/adapter_library.ts
/** Static class for managing and querying all MultiPost adapters */
var AdapterLibrary = class AdapterLibrary {
	static {
		this._adapters = /* @__PURE__ */ new Map();
	}
	/**
	* Adds an adapter. Automatically called by the {@link MultiPostAdapter} during construction
	* @param {MultiPostAdapter} adapter - The adapter to add
	*/
	static add(adapter) {
		AdapterLibrary._adapters.set(adapter.id, adapter);
	}
	/**
	* Gets an adapter by ID
	* @param {string} id - ID of the adapter to look
	* @returns {MultiPostAdapter | undefined} Either the found adapter or undefined if nothing found
	*/
	static get(id) {
		return AdapterLibrary._adapters.get(id);
	}
	/**
	* Wait for all added adapter to be ready
	* @returns {Promise<void>} Promise that resolves once ALL adapter are ready
	*/
	static async awaitReady() {
		for (const adapter of AdapterLibrary._adapters.values()) await adapter.awaitReady();
	}
};
//#endregion
//#region src/modules/adapter.ts
/** Class representing the implementation of a service */
var MultiPostAdapter = class {
	/** Full Unique ID of adapter when compared to entire global MultiPost context */
	get full_id() {
		return [this.id, this.instance_id];
	}
	/**
	* Listens to events of adapter
	* @param {string} eventName - Name of event channel to listen on
	* @param {AnyFunction} callback - Callback function to be fired when event is emitted
	*/
	on(eventName, callback) {
		return this._events.on(eventName, callback);
	}
	/**
	* Wait for the adapter to be ready
	* @returns {Promise<void>} Promise that resolves once adapter is ready
	*/
	awaitReady() {
		return new Promise((res, rej) => {
			if (this.ready) res();
			else this._events.once("ready", res);
		});
	}
	/**
	* Create an adapter
	* @constructor
	* @param {Post[]} config - Arbitrary configuration of adapter for custom functionality
	*/
	constructor(config) {
		this.id = "";
		this.instance_id = "";
		this.ready = false;
		this._events = new node_events.default();
		this.config = config;
		this._setup();
	}
	async _setup() {
		AdapterLibrary.add(this);
		let res = await this?.setup?.();
		this._events.emit("ready");
		this.ready = true;
		return res;
	}
	/**
	* Gets a location
	* @param {any[]} args - Arguments for query / selecting a specific location
	* @returns {Promise<Location | undefined>} Either a location or undefined if nothing found
	*/
	async get_location(...args) {}
};
//#endregion
exports.AdapterLibrary = AdapterLibrary;
exports.Location = Location;
exports.MultiPost = MultiPost;
exports.MultiPostAdapter = MultiPostAdapter;
exports.Post = Post;
exports.arrayEqual = arrayEqual;
exports.resolveLocationID = resolveLocationID;

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
let _multi_post_core = require("@multi-post/core");
let fs = require("fs");
fs = __toESM(fs);
let mime = require("mime");
mime = __toESM(mime);
let path = require("path");
path = __toESM(path);
require("ffprobe");
let _atproto_api = require("@atproto/api");
//#region src/extends/print.ts
global.print = (...args) => {
	if (process.env?.NODE_ENV == "dev") console.log(...args);
};
//#endregion
//#region src/modules/location.ts
var BlueSkyFeedLocation = class extends _multi_post_core.Location {
	constructor(adapter) {
		super();
		this.adapter = adapter;
		this.id = "feed";
		this.agent = this.adapter.agent;
	}
	async postToRecord(post, last_post) {
		let agent = this.agent;
		let record = { text: post.content.map((row) => row.parts.map((part) => part.text).join(" ")).join("\n") };
		let embed = {};
		if (post.media.length > 0) {
			let idx = -1;
			for (const media of post.media) {
				idx++;
				if (media == void 0) continue;
				let mimeType = mime.default.getType(path.default.extname(media.path));
				print("mimeType: ", mimeType);
				if (mimeType?.startsWith("video")) {
					if (idx != 0) continue;
				} else if (!mimeType?.startsWith("image")) continue;
				const mediaBytes = fs.default.readFileSync(media.path);
				let upload_res = await agent.uploadBlob?.(mediaBytes);
				print("upload_res: ", upload_res);
				if (mimeType?.startsWith("video")) {
					embed.$type = "app.bsky.embed.video";
					embed.alt = media.caption;
					embed.video = upload_res.data.blob;
					break;
				} else {
					if (embed.images == void 0) embed.images = [];
					embed.$type = "app.bsky.embed.images";
					embed.images.push({
						alt: media.caption,
						image: upload_res.data.blob
					});
				}
			}
			record.embed = embed;
		}
		print("record: ", record);
		if (last_post != void 0) record.reply = {
			root: last_post,
			parent: last_post
		};
		return record;
	}
	async make_posts(posts) {
		if (posts.length == 0) return;
		if (this.agent == void 0) return;
		let root_post = posts.shift();
		if (root_post == void 0) return;
		let last_post = await this.agent.post(await this.postToRecord(root_post));
		print("last_post: ", last_post);
		for (const post of posts) last_post = await this.agent.post(await this.postToRecord(post, last_post));
	}
};
//#endregion
//#region src/modules/adapter.ts
var MultiPostAdapterBlueSky = class extends _multi_post_core.MultiPostAdapter {
	async setup() {
		print("Setting up BlueSky client...");
		const session = new _atproto_api.CredentialSession(new URL("https://bsky.social"));
		await session.login(this.config);
		this.agent = new _atproto_api.Agent(session);
		return true;
	}
	async get_location(id) {
		if (await this.agent?.post == null) return;
		return new BlueSkyFeedLocation(this);
	}
};
//#endregion
exports.BlueSkyFeedLocation = BlueSkyFeedLocation;
exports.MultiPostAdapterBlueSky = MultiPostAdapterBlueSky;

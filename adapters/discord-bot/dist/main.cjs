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
let discord_js = require("discord.js");
let path = require("path");
path = __toESM(path);
//#region src/extends/print.ts
global.print = (...args) => {
	if (process.env?.NODE_ENV == "dev") console.log(...args);
};
//#endregion
//#region src/modules/client.ts
function handleDiscordClient(client) {
	return new Promise((res, rej) => {
		client.on(discord_js.Events.ClientReady, (readyClient) => {
			print(`Logged in as ${readyClient.user.tag}!`);
			res(readyClient);
		});
	});
}
//#endregion
//#region src/modules/location.ts
var DiscordTextChannelLocation = class DiscordTextChannelLocation extends _multi_post_core.Location {
	constructor(adapter, channel) {
		super();
		this.adapter = adapter;
		this.channel = channel;
		this.id = this.channel.id;
	}
	static postToMessage(post) {
		return {
			content: post.content.map((row) => row.parts.map((part) => part.text).join(" ")).join("\n"),
			files: post.media.map((media) => ({
				attachment: media?.path ?? "",
				name: path.default.basename(media?.path ?? ""),
				description: media?.caption
			}))
		};
	}
	async make_posts(posts, opts) {
		if (posts.length == 0) return;
		let root_post = posts.shift();
		if (root_post == void 0) return;
		let last_msg = await this.channel.send(DiscordTextChannelLocation.postToMessage(root_post));
		if (opts?.discord_thread && this.channel.permissionsFor(this.channel.client.user)?.has(discord_js.PermissionFlagsBits.CreatePublicThreads)) {
			let thread = await last_msg.startThread({ name: String(opts?.discord_thread) });
			for (const post of posts) await thread.send(DiscordTextChannelLocation.postToMessage(post));
		} else for (const post of posts) last_msg = await last_msg.reply(DiscordTextChannelLocation.postToMessage(post));
	}
};
//#endregion
//#region src/modules/adapter.ts
var MultiPostAdapterDiscordBot = class extends _multi_post_core.MultiPostAdapter {
	constructor(..._args) {
		super(..._args);
		this.client = new discord_js.Client({ intents: [discord_js.GatewayIntentBits.Guilds] });
	}
	async setup() {
		print("Setting up Discord Bot client...");
		this.client = new discord_js.Client({ intents: [discord_js.GatewayIntentBits.Guilds] });
		const { client } = this;
		client.login(this.config.token);
		this.client = await handleDiscordClient(client);
		return true;
	}
	async get_location(id) {
		let channel = await this.client.channels.fetch(id);
		if (channel == null) return;
		return new DiscordTextChannelLocation(this, channel);
	}
};
//#endregion
exports.DiscordTextChannelLocation = DiscordTextChannelLocation;
exports.MultiPostAdapterDiscordBot = MultiPostAdapterDiscordBot;

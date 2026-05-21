import { IPost, Location, MultiPostAdapter, MultiPostOptions } from "@multi-post/core";
import { Client, MessageCreateOptions, TextChannel } from "discord.js";

//#region src/extends/print.d.ts
declare global {
  function print(...args: any[]): void;
}
//#endregion
//#region src/modules/location.d.ts
declare class DiscordTextChannelLocation extends Location {
  id: string;
  adapter: MultiPostAdapterDiscordBot;
  channel: TextChannel;
  constructor(adapter: MultiPostAdapterDiscordBot, channel: TextChannel);
  static postToMessage(post: IPost): MessageCreateOptions;
  make_posts(posts: IPost[], opts: MultiPostOptions): Promise<void>;
}
//#endregion
//#region src/modules/adapter.d.ts
declare class MultiPostAdapterDiscordBot extends MultiPostAdapter {
  client: Client;
  setup(): Promise<boolean>;
  get_location(id: string): Promise<DiscordTextChannelLocation | undefined>;
}
//#endregion
export { DiscordTextChannelLocation, MultiPostAdapterDiscordBot };
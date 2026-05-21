import { IPost, Location, MultiPostAdapter } from "@multi-post/core";
import { Agent, AppBskyFeedPost } from "@atproto/api";

//#region src/extends/print.d.ts
declare global {
  function print(...args: any[]): void;
}
//#endregion
//#region src/modules/location.d.ts
declare class BlueSkyFeedLocation extends Location {
  id: string;
  adapter: MultiPostAdapterBlueSky;
  agent: Agent | undefined;
  constructor(adapter: MultiPostAdapterBlueSky);
  postToRecord(post: IPost, last_post?: {
    uri: string;
    cid: string;
  }): Promise<(Partial<AppBskyFeedPost.Record> & Omit<AppBskyFeedPost.Record, "createdAt">)>;
  make_posts(posts: IPost[]): Promise<void>;
}
//#endregion
//#region src/modules/adapter.d.ts
declare class MultiPostAdapterBlueSky extends MultiPostAdapter {
  agent: Agent | undefined;
  setup(): Promise<boolean>;
  get_location(id: string): Promise<BlueSkyFeedLocation | undefined>;
}
//#endregion
export { BlueSkyFeedLocation, MultiPostAdapterBlueSky };
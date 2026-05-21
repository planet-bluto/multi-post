import { MultiPostAdapter } from "./adapter";
import { MultiPostOptions } from "./multi_post";
import { IPost } from "./post";

/** Class representing a destination of a crosspost */
export abstract class Location {
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
	get full_id(): string[] {
		return [this.adapter.id, this.adapter.instance_id, this.id]
	}
}
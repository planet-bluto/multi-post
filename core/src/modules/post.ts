import { IContentRow } from "./content";
import { Location } from "./location";
import { IMedia } from "./media";

type MEDIA_SLOTS = [IMedia?, IMedia?, IMedia?, IMedia?]

export interface IPost {
	content: IContentRow[];
	media: MEDIA_SLOTS;
}

/** Class representing a singular post within a crosspost */
export class Post implements IPost {
  /** The text content of the post. Formatted to handle filtering for each location, inline formatting and special characters */
	content: IContentRow[]
  /** The media attached to the post. Only up to 4 can be attached since that's the usual limit */
  media: MEDIA_SLOTS;

  /**
   * Create a post
   * @constructor
   * @param {IContentRow[]} content - The text content of the post. Formatted to handle filtering for each location, inline formatting and special characters
   * @param {MEDIA_SLOTS} media - The media attached to the post. Only up to 4 can be attached since that's the usual limit
   */
	constructor(content: IContentRow[], media: MEDIA_SLOTS) {
		this.content = content
		this.media = media
	}
}
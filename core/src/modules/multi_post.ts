import { Location } from "./location";
import { Post } from "./post";

/** Type that describes arbitrary options for custom functionality within adapters */
export type MultiPostOptions = {[index: string]: any}

/**
 * Utility function for resolving to a location ID from either a Location instance or a location ID
 * @param {string[] | Location} locOrLocID - A Location instance or a location ID
 * @return {string[]}
 */
export function resolveLocationID(locOrLocID: string[] | Location): string[] {
  if (Array.isArray(locOrLocID)) { return locOrLocID }
  else { return locOrLocID.full_id }
}

/** Class representing a crosspost */
export class MultiPost {
  /** The post(s) to be crossposted. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters */
  posts: Post[] = []
  /** The target locations to send the post(s) */
  locations: Location[] = []
  /** Arbitrary options for custom functionality within adapters */
  opts: MultiPostOptions

  /**
   * Create a crosspost
   * @constructor
   * @param {Post[]} posts - The post(s) to be crossposted. Multiple posts usually gets treated as a thread or reply chain, depending on the implementation of the adapters
   * @param {Location[]} locations - The target locations to send the post(s)
   * @param {MultiPostOptions} opts - Arbitrary options for custom functionality within adapters
   */
  constructor(posts: Post[] = [], locations: Location[] = [], opts: MultiPostOptions = {}) {
    this.posts = posts
    this.locations = locations
    this.opts = opts
  }

  /**
   * Method that actually makes the posts
   */
  async crosspost(): Promise<void> {
    for (const location of this.locations) {
      let posts = this.posts.map(base_post => {
        let post = Object.assign({}, base_post)

        post.content = post.content.filter(row => 
          (row.locations == undefined) || // Keep row if no location filter found...
          (row.locations ?? []).some(loc => arrayEqual(resolveLocationID(loc), location.full_id)) // If any location in the filter array is THIS location...
        )

        post.content = post.content.map(base_row => {
          let row = Object.assign({}, base_row)

          delete row.locations
          row.parts = row.parts.filter(part =>
            (part.locations == undefined) ||
            (part.locations ?? []).some(loc => arrayEqual(resolveLocationID(loc), location.full_id)))
          return row
        })

        return post
      })
      
      await location.make_posts(posts, this.opts)
    }
  }
}

/**
 * Utility function for testing if the contents of two arrays the exact same
 * @param {any[]} arr1 - First array to compare
 * @param {any[]} arr2 - Second array to compare
 * @return {boolean}
 */
export function arrayEqual(arr1: any[], arr2: any[]): boolean {
  let test = ((arr1.length == arr2.length) && (arr1.every((val, idx) => arr2[idx] == val)))
  print("arr equal:", arr1, arr2, test)
  return test
}
import { Location, IPost } from "@multi-post/core";
import fs from "fs";
import mime from 'mime';
import { MultiPostAdapterBlueSky } from "./adapter";
import { Agent, AppBskyFeedPost } from "@atproto/api";
import path from "path";
import ffprobe from "ffprobe";

async function getAspectRatio(filePath: string) {
  const { streams } = await ffprobe(filePath, {path: filePath});
  const videoSteam = streams.find((stream: any) => stream.codec_type === "video");
  return {
    width: videoSteam?.width ?? 0,
    height: videoSteam?.height ?? 0,
  };
}


export class BlueSkyFeedLocation extends Location {
  id: string
  adapter: MultiPostAdapterBlueSky

  agent: Agent | undefined

  constructor(adapter: MultiPostAdapterBlueSky) {
    super()
    this.adapter = adapter
    this.id = "feed"
    
    this.agent = this.adapter.agent
  }

  async postToRecord(post: IPost, last_post?: {uri: string, cid: string}): Promise<(Partial<AppBskyFeedPost.Record> & Omit<AppBskyFeedPost.Record, "createdAt">)> {
    let agent: Agent = (this.agent as Agent)

    let record: Omit<AppBskyFeedPost.Record, "createdAt"> = {
      text: post.content.map(row => row.parts.map(part => part.text).join(" ")).join("\n")
    }

    let embed: any = {}

    if (post.media.length > 0) {
      let idx = -1
      for (const media of post.media) {
        idx++
        if (media == undefined) { continue }

        let mimeType = mime.getType(path.extname(media.path))
        print("mimeType: ", mimeType)

        if (mimeType?.startsWith("video")) {
          if (idx != 0) { continue } 
        } else if (!mimeType?.startsWith("image")) {
          continue
        }

        const mediaBytes = fs.readFileSync(media.path)

        let upload_res = await agent.uploadBlob?.(mediaBytes)
        
        print("upload_res: ", upload_res)

        if (mimeType?.startsWith("video")) {
          embed.$type = "app.bsky.embed.video"
          embed.alt = media.caption
          embed.video = upload_res.data.blob
          // embed.aspectRatio = await getAspectRatio(media.path)
          break // you can only attach one video you chud
        } else {
          if (embed.images == undefined) { embed.images = [] }
          embed.$type = "app.bsky.embed.images"
          embed.images.push({
            alt: media.caption,
            image: upload_res.data.blob,
          })
        }
      }

      record.embed = embed
    }

    print("record: ", record)

    if (last_post != undefined) {
      record.reply = {
        // $type: 'app.bsky.feed.post#replyRef',
        root: last_post,
        parent: last_post
      }
    }

    return record
  }

  async make_posts(posts: IPost[]): Promise<void> {
    if (posts.length == 0) { return }
    if (this.agent == undefined) { return }

    let root_post = posts.shift()

    if (root_post == undefined) { return } // literally not possible btw FUCK YOU 

    let last_post = await this.agent.post(await this.postToRecord(root_post))

    print("last_post: ", last_post)

    for (const post of posts) {
      last_post = await this.agent.post(await this.postToRecord(post, last_post))
    }
  }
}
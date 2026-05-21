import { Location, IPost, MultiPostOptions } from "@multi-post/core";
import { Message, MessageCreateOptions, PermissionFlagsBits, TextChannel } from "discord.js";
import path from "path";
import { MultiPostAdapterDiscordBot } from "./adapter";

export class DiscordTextChannelLocation extends Location {
  id: string
  adapter: MultiPostAdapterDiscordBot

  channel: TextChannel
  constructor(adapter: MultiPostAdapterDiscordBot, channel: TextChannel) {
    super()
    this.adapter = adapter
    this.channel = channel
    this.id = this.channel.id
  }

  static postToMessage(post: IPost): MessageCreateOptions {
    return {
      content: post.content.map(row => row.parts.map(part => part.text).join(" ")).join("\n"),
      files: post.media.map(media => ({
        attachment: (media?.path ?? ""),
        name: path.basename(media?.path ?? ""),
        description: media?.caption
      }))
    }
  }

  async make_posts(posts: IPost[], opts: MultiPostOptions): Promise<void> {
    if (posts.length == 0) { return }
    let root_post = posts.shift()

    if (root_post == undefined) { return } // literally not possible btw FUCK YOU 

    let last_msg: Message = await this.channel.send(DiscordTextChannelLocation.postToMessage(root_post))

    if (opts?.discord_thread && this.channel.permissionsFor(this.channel.client.user)?.has(PermissionFlagsBits.CreatePublicThreads)) {
      let thread = await last_msg.startThread({
        name: String(opts?.discord_thread)
      })

      for (const post of posts) {
        await thread.send(DiscordTextChannelLocation.postToMessage(post))
      }
    } else {
      for (const post of posts) {
        last_msg = await last_msg.reply(DiscordTextChannelLocation.postToMessage(post))
      }
    }
  }
}
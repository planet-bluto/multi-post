import { MultiPostAdapter } from "@multi-post/core";
import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import handleDiscordClient from "./client";
import { DiscordTextChannelLocation } from "./location";

export class MultiPostAdapterDiscordBot extends MultiPostAdapter {
  client: Client = new Client({ intents: [GatewayIntentBits.Guilds] })
  async setup() {
    print("Setting up Discord Bot client...")

    this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
    const {client} = this

    client.login(this.config.token)

    this.client = await handleDiscordClient(client)

    return true
  }

  async get_location(id: string) {
    // print("this.client: ", this.client)
    let channel = await this.client.channels.fetch(id)
    if (channel == null) { return }
    
    let location = new DiscordTextChannelLocation(this, channel as TextChannel)

    return location
  }
}
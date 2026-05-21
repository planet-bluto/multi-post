import { MultiPostAdapter } from "@multi-post/core";
import { BlueSkyFeedLocation } from "./location";
import { Agent, AtpAgentLoginOpts, CredentialSession } from "@atproto/api";

export class MultiPostAdapterBlueSky extends MultiPostAdapter {
  agent: Agent | undefined
  async setup() {
    print("Setting up BlueSky client...")

    const session = new CredentialSession(new URL('https://bsky.social'))
    await session.login(this.config as AtpAgentLoginOpts)
    // const agent
    this.agent = new Agent(session)
    // return agent

    // this.client = new Client({ intents: [GatewayIntentBits.Guilds] })
    // const {client} = this

    // client.login(this.config.token)

    // this.client = await handleDiscordClient(client)

    return true
  }

  async get_location(id: string) {
    // print("this.client: ", this.client)
    let channel = await this.agent?.post 
    if (channel == null) { return }
    
    let location = new BlueSkyFeedLocation(this)

    return location
  }
}
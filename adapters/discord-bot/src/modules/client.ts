import { Client, Events } from "discord.js";

export default function handleDiscordClient(client: Client): Promise<Client<true>> {
  return new Promise<Client<true>>((res, rej) => {
    client.on(Events.ClientReady, (readyClient) => {
      print(`Logged in as ${readyClient.user.tag}!`)
      res(readyClient)
    })
  })
}
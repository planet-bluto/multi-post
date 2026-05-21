# MultiPost
A plug-in based API wrapper for constructing and making crossposts across multiple different services

<p>

  <a href="https://www.npmjs.com/package/@multi-post/core" target="_blank"><img alt="npm" src="https://img.shields.io/npm/dt/@multi-post/core?color=%23024aca"></a>

  <a href="https://www.npmjs.com/package/@multi-post/core" target="_blank"><img alt="npm" src="https://img.shields.io/npm/v/@multi-post/core?color=%23024aca"></a>

</p>

## Installation
 *``@multi-post/bluesky`` & ``@multi-post/discord-bot`` are optional, but they are the official adapters that work with this package*
```bash
npm i @multi-post/core @multi-post/bluesky-adapter @multi-post/discord-bot-adapter
# - or - 
yarn add @multi-post/core @multi-post/bluesky-adapter @multi-post/discord-bot-adapter
```
## Usage
```ts
import { Post, MultiPost, AdapterLibrary } from "@multi-post/core"

import { MultiPostAdapterBlueSky } from "@multi-post/bluesky-adapter"
import { MultiPostAdapterDiscordBot } from "@multi-post/discord-bot-adapter"

const bsky_adapter = new MultiPostAdapterBlueSky({
  identifier: "<USERNAME>",
  password: "<PASSWORD>"
})

const discord_bot_adapter = new MultiPostAdapterDiscordBot({
	token: "<TOKEN>"
})

AdapterLibrary.awaitReady().then(async () => {
	console.log("Ready to make posts!")
	
	let bsky_feed_location = await bsky_adapter.get_location("feed")
	let discord_channel_location = await discord_bot_adapter.get_location("<TEXT_CHANNEL_ID>")

  if (bsky_feed_location == undefined || discord_channel_location == undefined) { return }
	
	let new_post = new Post(
	  [ // makes a new row with a newline / enter
	    {parts: [ // parts get joined together with a whitespace / space " " and is just for filtering parts of one row to one location basically
	      {text: "Hi, welcome to MultiPost!"},
	      {text: "It adds a space bar between parts automatically..."},
	      {text: "You should only see this part on BlueSky btw", locations: [bsky_feed_location]} // <= Filter by location on every part and/or row
	    ]},
	    {parts: [{text: "This makes a new line! 🎉"}]},
	    {parts: [{text: "-# You can only see this part on Discord!"}], locations: [discord_channel_location]}
	  ],
	  [ // Add media easily!
	    {path: "<LOCAL FILE PATH>", caption: "<media alt text or caption>"}
	  ]
	)
	
	const multi_post = new MultiPost(
	  [new_post, /* ... */ ], // Multiple posts makes a thread or reply chain!
	  [bsky_feed_location, discord_channel_location]
	)
	
	await multi_post.crosspost() // ...Aaaaaaand crosspost!
})
```
## Making an Adapter
Adapters are added by extending the ``MultiPostAdapter`` and ``Location`` classes. They're separate because one can be thought of as handling the instance of an account on a service, and the other is places the account would post to

This is just how I make adapters as entire separate packages, but you can define them within your own scripts/codebase and it'll work fine. **I mainly just recommend making it's own NPM package because then others can use it**
##### Recommended folder structure
- src/
	- modules/
		- adapter.ts
		- location.ts
	- main.ts
#### **main.ts**
 > Mainly just for storing instanced based variables
```ts
export * from "./modules/adapter"
export * from "./modules/location"
```

#### **adapter.ts**
 > Mainly just for storing instanced based variables. **Remember to rename things as needed**
```ts
import { MultiPostAdapter } from "@multi-post/core";

export class MultiPostAdapterExample extends MultiPostAdapter {
	// ... You can add properties to be stored per instance
	async setup() {
	    // ... service authentication and setup done here
	}

	async get_location(id: string) {
		let location = getLocationSomeHow()
		return location
	}
}
```

#### **location.ts**
 > The implementation for actually making the posts are usually added here. **Remember to rename things as needed**
```ts
import { Location } from "@multi-post/core";
import { MultiPostAdapterExample } from "./adapter";

export class ExampleLocation extends Location {
  id: string
  adapter: MultiPostAdapterExample

  constructor(adapter: MultiPostAdapterExample) {
    super()
    this.adapter = adapter
    this.id = "feed"
  }
  
  async postToApiableObject(post: IPost) {
	  return post
  }

  async make_posts(posts: IPost[]): Promise<void> {
    if (posts.length == 0) { return }
    
    // Usually, you must make the first post, then reply to that post following after, so this is the rough outline of that process

    let root_post = posts.shift()

    let last_post = await makePostSomehow(await this.postToApiableObject(root_post))

    for (const post of posts) {
	    await replyToRootPostSomehow(await this.postToApiableObject(post))
    }
  }
}
```
## Contribute
A simple git clone, then running...
```bash
npm install
npm run dev
```
# Discord Bot Adapter for MultiPost

<p>
  <a href="https://www.npmjs.com/package/@multi-post/core" target="_blank"><img alt="npm" src="https://img.shields.io/npm/dt/@multi-post/core?color=%23024aca"></a>
  <a href="https://www.npmjs.com/package/@multi-post/core" target="_blank"><img alt="npm" src="https://img.shields.io/npm/v/@multi-post/core?color=%23024aca"></a>
</p>

## Adapter Config
```ts
{
	token: string; // token to log in with
}
```

## Multi-Post Config
```ts
{
	discord_thread?: string; // Name of thread to create. Usually this is undefined does a reply-chain instead, but just defining this uses threads instead
}
```

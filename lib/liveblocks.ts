import "server-only"

import { Liveblocks } from "@liveblocks/node"

if (!process.env.LIVEBLOCKS_SECRET_KEY) {
  throw new Error("LIVEBLOCKS_SECRET_KEY is not set")
}

// Server-side Liveblocks client, holding the secret key. Use it for auth
// (`identifyUser`), room creation and permissions, and the rest of the REST API.
export const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY,
})

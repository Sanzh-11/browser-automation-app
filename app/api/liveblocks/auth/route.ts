import { auth, currentUser } from "@clerk/nextjs/server"

import { liveblocks } from "@/lib/liveblocks"

export async function POST() {
  const { userId, orgId } = await auth()

  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Rooms are scoped to an organization, so a user without an active
  // organization has nothing to join.
  if (!orgId) {
    return new Response("No active organization", { status: 403 })
  }

  const user = await currentUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Identify the user to Liveblocks. Room access itself is decided by the
  // permissions set on each room — `groupsAccesses` keyed by the Clerk
  // organization ID below.
  const { status, body } = await liveblocks.identifyUser(
    {
      userId,
      groupIds: [orgId],
      organizationId: orgId,
    },
    {
      userInfo: {
        name:
          user.fullName ??
          user.username ??
          user.primaryEmailAddress?.emailAddress ??
          "Anonymous",
        avatar: user.imageUrl,
      },
    }
  )

  return new Response(body, { status })
}

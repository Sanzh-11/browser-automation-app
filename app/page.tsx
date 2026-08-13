import { UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"

export default async function Page() {
  // Signed-out visitors are redirected to /sign-in and sent back here after auth.
  await auth.protect()

  return <UserButton />
}

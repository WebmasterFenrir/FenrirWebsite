/// <reference path="../pb_data/types.d.ts" />

// users: add `inviteToken` so admins can onboard new members with an invite
// link instead of creating the account with a shared password. The hook
// (pb_hooks/invites.pb.js) generates the token on admin-created users and
// clears it once the invitee has set their own password (single-use).
migrate((app) => {
  const col = app.findCollectionByNameOrId("users")
  if (!col) throw new Error("users collection not found")

  if (!col.fields.getByName("inviteToken")) {
    col.fields.add(new TextField({
      hidden: false,
      name: "inviteToken",
      required: false,
      presentable: false,
      system: false,
    }))
  }

  app.save(col)
}, (app) => {
  const col = app.findCollectionByNameOrId("users")
  if (!col) return

  col.fields.removeByName("inviteToken")

  app.save(col)
})

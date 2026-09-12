@AGENTS.md

# Working agreement

## Don't push unless asked

Work locally only. After making changes: edit, typecheck, lint, and verify on
localhost. **Do not `git commit`, `git push`, or `vercel --prod` until the user
explicitly asks.** The user checks the result on localhost first, and pushing
early just makes the loop slower. When the work is ready, say so and wait.

Pushing includes anything that publishes: `git push`, `vercel deploy`,
`vercel --prod`. Creating a local commit counts as well — keep the working tree
as the deliverable until asked.

## Everything runs on main

Work directly on `main`. Do not create branches or worktrees — this is a solo
project and the user handles it themselves.

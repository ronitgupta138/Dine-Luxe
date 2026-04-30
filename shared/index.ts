// Shared package entrypoint for both frontend and backend.
// Example import in frontend or backend code:
// import { User, UserRole, OrderStatus } from "@repo/shared"
// In frontend/backend package.json, link this package like:
// "dependencies": {
//   "@repo/shared": "workspace:*"
// }

export * from "./types"
export * from "./enums"

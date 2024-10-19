import {boolean, integer, pgEnum, pgTable, serial, timestamp, uuid, varchar, unique} from "drizzle-orm/pg-core";
import {sql} from "drizzle-orm";
import * as c from "../lib/constants"

// Enums
export const orgRoleEnum = pgEnum('org_roles', c.orgRoles )
export const orgPlanEnum = pgEnum("user_plan", c.userPlans)

// Tables
export const user = pgTable("lp_user", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.primaryKey(),
	username: varchar("username").notNull(),
	password: varchar("password").notNull(),
	email: varchar("email").unique().notNull(),
	created_at: timestamp("created_at").default(sql`now()`),
});
export const org = pgTable("organization", {
	id: uuid("id")
		.default(sql`gen_random_uuid()`)
		.primaryKey(),
	name: varchar("org_name").unique(),
	created_by: uuid("created_by").references(() => user.id),
	created_at: timestamp("created_at").default(sql`now()`),
	plan: orgPlanEnum("org_plan")
})
export const userOrg = pgTable("user_org", {
	userId: uuid("user_id").references(() => user.id),
	orgId: uuid("org_id").references(() => org.id),
	role: orgRoleEnum('role')
}, (t) => ({
	unique_user_org: unique().on(
		t.orgId,
		t.userId
	)
}))
export const orgInvite = pgTable("org_invite", {
	token: varchar("token").primaryKey(),
	timestamp: integer('timestamp')
		.notNull()
		.default(sql`extract(epoch from now())`),
	invitee: varchar("invitee").notNull(),
	invitedRole: orgRoleEnum('role').notNull(),
	inviter: uuid('inviter').references(() => user.id).notNull(),
	orgId: uuid("org_id").references(() => org.id).notNull()
})
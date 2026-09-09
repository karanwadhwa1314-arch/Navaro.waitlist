import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core'

export const waitlistSignups = pgTable(
  'waitlist_signups',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone'),
    metaLeadId: text('meta_lead_id').unique(), // nullable — only set for Meta-sourced signups
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    welcomeEmailSentAt: timestamp('welcome_email_sent_at', { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index('waitlist_signups_email_idx').on(table.email),
  }),
)

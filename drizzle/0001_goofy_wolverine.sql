ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "company_official_email" varchar(255);--> statement-breakpoint
ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "start_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "grace_period_min" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "differential_rate_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "park_mate"."parking_plans" ADD COLUMN "differential_rate_after_hr" integer;--> statement-breakpoint
ALTER TABLE "park_mate"."subscriptions" DROP COLUMN IF EXISTS "company_official_email";
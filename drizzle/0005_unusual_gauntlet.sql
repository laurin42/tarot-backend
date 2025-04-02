ALTER TABLE "users" ALTER COLUMN "created_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "gender" varchar(1);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "zodiac_sign" varchar(20);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "birthday" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email_verified" boolean DEFAULT false;
ALTER TABLE "drawn_cards" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "drawn_cards" ADD COLUMN "user_id" integer;--> statement-breakpoint
ALTER TABLE "drawn_cards" ADD COLUMN "position" integer;--> statement-breakpoint
ALTER TABLE "drawn_cards" ADD COLUMN "session_id" varchar(255);--> statement-breakpoint
ALTER TABLE "drawn_cards" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "drawn_cards" ADD CONSTRAINT "drawn_cards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
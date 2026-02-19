CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"last_update_at" timestamp DEFAULT now(),
	"create_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "rooms_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_create_user_id_users_id_fk" FOREIGN KEY ("create_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
CREATE TYPE "public"."access_type" AS ENUM('ALL', 'ONLY_READ');--> statement-breakpoint
CREATE TABLE "roomInvite" (
	"id" uuid PRIMARY KEY NOT NULL,
	"room_id" uuid NOT NULL,
	"action_user_id" uuid NOT NULL,
	"invited_user_id" uuid NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"accessType" "access_type" NOT NULL
);
--> statement-breakpoint
ALTER TABLE "rooms" DROP CONSTRAINT "rooms_id_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_id_unique";--> statement-breakpoint
ALTER TABLE "rooms" ADD COLUMN "allowed_user_ids" uuid[] NOT NULL;--> statement-breakpoint
ALTER TABLE "roomInvite" ADD CONSTRAINT "roomInvite_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomInvite" ADD CONSTRAINT "roomInvite_action_user_id_users_id_fk" FOREIGN KEY ("action_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "roomInvite" ADD CONSTRAINT "roomInvite_invited_user_id_users_id_fk" FOREIGN KEY ("invited_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "allowed_user_ids_idx" ON "rooms" USING gin ("allowed_user_ids");
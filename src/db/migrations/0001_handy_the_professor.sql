CREATE TABLE "tasks" (
	"cuid" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_user_id_users_cuid_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("cuid") ON DELETE no action ON UPDATE no action;
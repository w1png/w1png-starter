ALTER TABLE "files" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "tests" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
CREATE INDEX "files_deleted_at_null_idx" ON "files" USING btree ("deleted_at") WHERE "files"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "files_id_idx" ON "files" USING btree ("id");--> statement-breakpoint
CREATE INDEX "files_created_at_idx" ON "files" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tests_deleted_at_null_idx" ON "tests" USING btree ("deleted_at") WHERE "tests"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "tests_id_idx" ON "tests" USING btree ("id");--> statement-breakpoint
CREATE INDEX "tests_created_at_idx" ON "tests" USING btree ("created_at");
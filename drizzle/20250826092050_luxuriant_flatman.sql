CREATE TABLE "demo_department" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"group" varchar(255) NOT NULL,
	"date" date NOT NULL,
	"in_time" time NOT NULL,
	"out_time" time NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_department" ADD CONSTRAINT "demo_department_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "demo_department_unique_idx" ON "demo_department" USING btree ("name","tenant_id");
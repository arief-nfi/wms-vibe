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
CREATE TABLE "sys_option" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"value" varchar(255) NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_permission" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_role" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"is_system" boolean NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sys_role_permission" (
	"role_id" uuid NOT NULL,
	"permission_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "sys_role_permission_role_id_permission_id_tenant_id_pk" PRIMARY KEY("role_id","permission_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "sys_tenant" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sys_tenant_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "sys_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"fullname" varchar(255) NOT NULL,
	"status" varchar(255) NOT NULL,
	"email" varchar(255),
	"avatar" varchar(255),
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sys_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "sys_user_role" (
	"user_id" uuid NOT NULL,
	"role_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "sys_user_role_user_id_role_id_tenant_id_pk" PRIMARY KEY("user_id","role_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "sys_user_tenant" (
	"user_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	CONSTRAINT "sys_user_tenant_user_id_tenant_id_pk" PRIMARY KEY("user_id","tenant_id")
);
--> statement-breakpoint
CREATE TABLE "master_partner" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"pic_name" varchar(255) NOT NULL,
	"pic_email" varchar(255) NOT NULL,
	"description" varchar(1000),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_inbound" (
	"id" uuid PRIMARY KEY NOT NULL,
	"partner_id" uuid NOT NULL,
	"api_key" varchar(128) NOT NULL,
	"description" varchar(1000),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "integration_inbound_api_key_unique" UNIQUE("api_key")
);
--> statement-breakpoint
CREATE TABLE "integration_webhook" (
	"id" uuid PRIMARY KEY NOT NULL,
	"partner_id" uuid NOT NULL,
	"tenant_id" uuid NOT NULL,
	"event_type" varchar(100) NOT NULL,
	"url" varchar(1000) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webhook_event" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(1000),
	"is_active" boolean DEFAULT true NOT NULL,
	"tenant_id" uuid NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_department" ADD CONSTRAINT "demo_department_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_option" ADD CONSTRAINT "sys_option_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_permission" ADD CONSTRAINT "sys_permission_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role" ADD CONSTRAINT "sys_role_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_permission" ADD CONSTRAINT "sys_role_permission_role_id_sys_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_permission" ADD CONSTRAINT "sys_role_permission_permission_id_sys_permission_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."sys_permission"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_role_permission" ADD CONSTRAINT "sys_role_permission_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user" ADD CONSTRAINT "sys_user_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_role" ADD CONSTRAINT "sys_user_role_user_id_sys_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_role" ADD CONSTRAINT "sys_user_role_role_id_sys_role_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."sys_role"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_role" ADD CONSTRAINT "sys_user_role_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_tenant" ADD CONSTRAINT "sys_user_tenant_user_id_sys_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."sys_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sys_user_tenant" ADD CONSTRAINT "sys_user_tenant_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "master_partner" ADD CONSTRAINT "master_partner_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_inbound" ADD CONSTRAINT "integration_inbound_partner_id_master_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."master_partner"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_partner_id_master_partner_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."master_partner"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_webhook" ADD CONSTRAINT "integration_webhook_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "webhook_event" ADD CONSTRAINT "webhook_event_tenant_id_sys_tenant_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."sys_tenant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "demo_department_unique_idx" ON "demo_department" USING btree ("name","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "option_unique_idx" ON "sys_option" USING btree ("code","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "permission_unique_idx" ON "sys_permission" USING btree ("code","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_unique_idx" ON "sys_role" USING btree ("code","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_code_unique_idx" ON "master_partner" USING btree ("code","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "partner_name_unique_idx" ON "master_partner" USING btree ("name","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "integration_api_key_unique_idx" ON "integration_inbound" USING btree ("api_key");
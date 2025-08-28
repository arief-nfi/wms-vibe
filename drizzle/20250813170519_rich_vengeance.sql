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
CREATE UNIQUE INDEX "permission_unique_idx" ON "sys_permission" USING btree ("code","tenant_id");--> statement-breakpoint
CREATE UNIQUE INDEX "role_unique_idx" ON "sys_role" USING btree ("code","tenant_id");
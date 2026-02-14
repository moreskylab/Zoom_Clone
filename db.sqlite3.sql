BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "auth_group" (
	"id"	integer NOT NULL,
	"name"	varchar(150) NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "auth_group_permissions" (
	"id"	integer NOT NULL,
	"group_id"	integer NOT NULL,
	"permission_id"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("group_id") REFERENCES "auth_group"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("permission_id") REFERENCES "auth_permission"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "auth_permission" (
	"id"	integer NOT NULL,
	"content_type_id"	integer NOT NULL,
	"codename"	varchar(100) NOT NULL,
	"name"	varchar(255) NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("content_type_id") REFERENCES "django_content_type"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "auth_user" (
	"id"	integer NOT NULL,
	"password"	varchar(128) NOT NULL,
	"last_login"	datetime,
	"is_superuser"	bool NOT NULL,
	"username"	varchar(150) NOT NULL UNIQUE,
	"last_name"	varchar(150) NOT NULL,
	"email"	varchar(254) NOT NULL,
	"is_staff"	bool NOT NULL,
	"is_active"	bool NOT NULL,
	"date_joined"	datetime NOT NULL,
	"first_name"	varchar(150) NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "auth_user_groups" (
	"id"	integer NOT NULL,
	"user_id"	integer NOT NULL,
	"group_id"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("group_id") REFERENCES "auth_group"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "auth_user_user_permissions" (
	"id"	integer NOT NULL,
	"user_id"	integer NOT NULL,
	"permission_id"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("permission_id") REFERENCES "auth_permission"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "base_message" (
	"id"	integer NOT NULL,
	"body"	text NOT NULL,
	"created"	datetime NOT NULL,
	"user_id"	integer NOT NULL,
	"room_id"	bigint NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("room_id") REFERENCES "base_room"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "base_room" (
	"id"	integer NOT NULL,
	"topic"	varchar(200) NOT NULL,
	"name"	varchar(200) NOT NULL UNIQUE,
	"created"	datetime NOT NULL,
	"host_id"	integer,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("host_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "base_room_participants" (
	"id"	integer NOT NULL,
	"room_id"	bigint NOT NULL,
	"user_id"	integer NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("room_id") REFERENCES "base_room"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "base_userprofile" (
	"id"	integer NOT NULL,
	"display_name"	varchar(100) NOT NULL,
	"user_id"	integer NOT NULL UNIQUE,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "django_admin_log" (
	"id"	integer NOT NULL,
	"object_id"	text,
	"object_repr"	varchar(200) NOT NULL,
	"action_flag"	smallint unsigned NOT NULL CHECK("action_flag" >= 0),
	"change_message"	text NOT NULL,
	"content_type_id"	integer,
	"user_id"	integer NOT NULL,
	"action_time"	datetime NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("content_type_id") REFERENCES "django_content_type"("id") DEFERRABLE INITIALLY DEFERRED,
	FOREIGN KEY("user_id") REFERENCES "auth_user"("id") DEFERRABLE INITIALLY DEFERRED
);
CREATE TABLE IF NOT EXISTS "django_content_type" (
	"id"	integer NOT NULL,
	"app_label"	varchar(100) NOT NULL,
	"model"	varchar(100) NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "django_migrations" (
	"id"	integer NOT NULL,
	"app"	varchar(255) NOT NULL,
	"name"	varchar(255) NOT NULL,
	"applied"	datetime NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "django_session" (
	"session_key"	varchar(40) NOT NULL,
	"session_data"	text NOT NULL,
	"expire_date"	datetime NOT NULL,
	PRIMARY KEY("session_key")
);
INSERT INTO "auth_permission" VALUES (1,2,'add_room','Can add room');
INSERT INTO "auth_permission" VALUES (2,2,'change_room','Can change room');
INSERT INTO "auth_permission" VALUES (3,2,'delete_room','Can delete room');
INSERT INTO "auth_permission" VALUES (4,2,'view_room','Can view room');
INSERT INTO "auth_permission" VALUES (5,1,'add_message','Can add message');
INSERT INTO "auth_permission" VALUES (6,1,'change_message','Can change message');
INSERT INTO "auth_permission" VALUES (7,1,'delete_message','Can delete message');
INSERT INTO "auth_permission" VALUES (8,1,'view_message','Can view message');
INSERT INTO "auth_permission" VALUES (9,3,'add_userprofile','Can add user profile');
INSERT INTO "auth_permission" VALUES (10,3,'change_userprofile','Can change user profile');
INSERT INTO "auth_permission" VALUES (11,3,'delete_userprofile','Can delete user profile');
INSERT INTO "auth_permission" VALUES (12,3,'view_userprofile','Can view user profile');
INSERT INTO "auth_permission" VALUES (13,4,'add_logentry','Can add log entry');
INSERT INTO "auth_permission" VALUES (14,4,'change_logentry','Can change log entry');
INSERT INTO "auth_permission" VALUES (15,4,'delete_logentry','Can delete log entry');
INSERT INTO "auth_permission" VALUES (16,4,'view_logentry','Can view log entry');
INSERT INTO "auth_permission" VALUES (17,6,'add_permission','Can add permission');
INSERT INTO "auth_permission" VALUES (18,6,'change_permission','Can change permission');
INSERT INTO "auth_permission" VALUES (19,6,'delete_permission','Can delete permission');
INSERT INTO "auth_permission" VALUES (20,6,'view_permission','Can view permission');
INSERT INTO "auth_permission" VALUES (21,5,'add_group','Can add group');
INSERT INTO "auth_permission" VALUES (22,5,'change_group','Can change group');
INSERT INTO "auth_permission" VALUES (23,5,'delete_group','Can delete group');
INSERT INTO "auth_permission" VALUES (24,5,'view_group','Can view group');
INSERT INTO "auth_permission" VALUES (25,7,'add_user','Can add user');
INSERT INTO "auth_permission" VALUES (26,7,'change_user','Can change user');
INSERT INTO "auth_permission" VALUES (27,7,'delete_user','Can delete user');
INSERT INTO "auth_permission" VALUES (28,7,'view_user','Can view user');
INSERT INTO "auth_permission" VALUES (29,8,'add_contenttype','Can add content type');
INSERT INTO "auth_permission" VALUES (30,8,'change_contenttype','Can change content type');
INSERT INTO "auth_permission" VALUES (31,8,'delete_contenttype','Can delete content type');
INSERT INTO "auth_permission" VALUES (32,8,'view_contenttype','Can view content type');
INSERT INTO "auth_permission" VALUES (33,9,'add_session','Can add session');
INSERT INTO "auth_permission" VALUES (34,9,'change_session','Can change session');
INSERT INTO "auth_permission" VALUES (35,9,'delete_session','Can delete session');
INSERT INTO "auth_permission" VALUES (36,9,'view_session','Can view session');
INSERT INTO "auth_user" VALUES (1,'pbkdf2_sha256$1200000$F8ndx6JOgRHeAthEJY9zO7$l4nqRctIHAMZJ4O/RrczBTU09AmeeJztycDhNDFLyMs=','2026-02-09 14:45:58.488327',0,'test123','','',0,1,'2026-02-04 01:11:13.088318','');
INSERT INTO "auth_user" VALUES (2,'pbkdf2_sha256$1200000$TH8BLbZo5CVyxqiXJQyti1$ursaoFRBiR6qagE1xUcdwXzsSna7QZvW6U6gH62Bym4=','2026-02-04 01:57:52.404357',0,'admin','','',0,1,'2026-02-04 01:11:48.742250','');
INSERT INTO "base_message" VALUES (1,'Hi','2026-02-04 02:00:46.571490',2,2);
INSERT INTO "base_message" VALUES (2,'Hello','2026-02-04 02:00:59.092194',1,2);
INSERT INTO "base_room" VALUES (1,'General Meeting','lobby','2026-02-04 01:12:05.774366',2);
INSERT INTO "base_room" VALUES (2,'General Meeting','test','2026-02-04 01:34:39.880454',2);
INSERT INTO "base_userprofile" VALUES (1,'',1);
INSERT INTO "base_userprofile" VALUES (2,'',2);
INSERT INTO "django_content_type" VALUES (1,'base','message');
INSERT INTO "django_content_type" VALUES (2,'base','room');
INSERT INTO "django_content_type" VALUES (3,'base','userprofile');
INSERT INTO "django_content_type" VALUES (4,'admin','logentry');
INSERT INTO "django_content_type" VALUES (5,'auth','group');
INSERT INTO "django_content_type" VALUES (6,'auth','permission');
INSERT INTO "django_content_type" VALUES (7,'auth','user');
INSERT INTO "django_content_type" VALUES (8,'contenttypes','contenttype');
INSERT INTO "django_content_type" VALUES (9,'sessions','session');
INSERT INTO "django_migrations" VALUES (1,'contenttypes','0001_initial','2026-02-04 01:10:38.383240');
INSERT INTO "django_migrations" VALUES (2,'auth','0001_initial','2026-02-04 01:10:38.392753');
INSERT INTO "django_migrations" VALUES (3,'admin','0001_initial','2026-02-04 01:10:38.402823');
INSERT INTO "django_migrations" VALUES (4,'admin','0002_logentry_remove_auto_add','2026-02-04 01:10:38.411348');
INSERT INTO "django_migrations" VALUES (5,'admin','0003_logentry_add_action_flag_choices','2026-02-04 01:10:38.416395');
INSERT INTO "django_migrations" VALUES (6,'contenttypes','0002_remove_content_type_name','2026-02-04 01:10:38.428469');
INSERT INTO "django_migrations" VALUES (7,'auth','0002_alter_permission_name_max_length','2026-02-04 01:10:38.436598');
INSERT INTO "django_migrations" VALUES (8,'auth','0003_alter_user_email_max_length','2026-02-04 01:10:38.443140');
INSERT INTO "django_migrations" VALUES (9,'auth','0004_alter_user_username_opts','2026-02-04 01:10:38.447788');
INSERT INTO "django_migrations" VALUES (10,'auth','0005_alter_user_last_login_null','2026-02-04 01:10:38.455807');
INSERT INTO "django_migrations" VALUES (11,'auth','0006_require_contenttypes_0002','2026-02-04 01:10:38.456806');
INSERT INTO "django_migrations" VALUES (12,'auth','0007_alter_validators_add_error_messages','2026-02-04 01:10:38.461807');
INSERT INTO "django_migrations" VALUES (13,'auth','0008_alter_user_username_max_length','2026-02-04 01:10:38.468410');
INSERT INTO "django_migrations" VALUES (14,'auth','0009_alter_user_last_name_max_length','2026-02-04 01:10:38.475462');
INSERT INTO "django_migrations" VALUES (15,'auth','0010_alter_group_name_max_length','2026-02-04 01:10:38.482968');
INSERT INTO "django_migrations" VALUES (16,'auth','0011_update_proxy_permissions','2026-02-04 01:10:38.488992');
INSERT INTO "django_migrations" VALUES (17,'auth','0012_alter_user_first_name_max_length','2026-02-04 01:10:38.496689');
INSERT INTO "django_migrations" VALUES (18,'base','0001_initial','2026-02-04 01:10:38.513273');
INSERT INTO "django_migrations" VALUES (19,'sessions','0001_initial','2026-02-04 01:10:38.517282');
INSERT INTO "django_session" VALUES ('77bs3mcwvbkxzbimaq1mddbhrhbb2emf','.eJxVjDsOwjAQRO_iGlnxN1lKes5g7XptHECOFCcV4u5gKQVUI817My8RcN9K2Ftaw8ziLLQ4_XaE8ZFqB3zHeltkXOq2ziS7Ig_a5HXh9Lwc7t9BwVa-awJlB2vyOBrlVCKIzjFmNMOktAfAzEDgLGrlfbYwGUrIuYdxiUG8P8_7N-Y:1vnRmm:H71vCX5PVa5lkPowHel1tQi1tJBPzLxhZmtL66trRI4','2026-02-18 01:34:28.702600');
INSERT INTO "django_session" VALUES ('qlsux7d3nn2fhztu679fekt98totk7d3','.eJxVjDsOwjAQRO_iGlnxN1lKes5g7XptHECOFCcV4u5gKQVUI817My8RcN9K2Ftaw8ziLLQ4_XaE8ZFqB3zHeltkXOq2ziS7Ig_a5HXh9Lwc7t9BwVa-awJlB2vyOBrlVCKIzjFmNMOktAfAzEDgLGrlfbYwGUrIuYdxiUG8P8_7N-Y:1vnS9Q:U5WeW0u9I0W8yESDr_nq7BuqpmkAHHPS-MiQIby_JwM','2026-02-18 01:57:52.411979');
INSERT INTO "django_session" VALUES ('ue4wk9udyxk03jju9av48gfmnfyzo49s','.eJxVjEEOwiAURO_C2hAofNq4dO8ZyIf5StXQpLQr490NSRe6nffevFXkfStxb7LGGeqsrDr9bonzU2oHeHC9LzovdVvnpLuiD9r0dYG8Lof7d1C4lV4LGZMEsCQEAjJjBIsLLiR4b01gvqU8jSmALbMYQjaDEzcNIK8-XykZOVw:1vnSAE:zcvXmja51lYHimwjuBY3iUx0q1tSsdvCz6GyOSurGVw','2026-02-18 01:58:42.392488');
INSERT INTO "django_session" VALUES ('8ldih768e6edyt2q3ywf50dynydflbfm','.eJxVjEEOwiAURO_C2hAofNq4dO8ZyIf5StXQpLQr490NSRe6nffevFXkfStxb7LGGeqsrDr9bonzU2oHeHC9LzovdVvnpLuiD9r0dYG8Lof7d1C4lV4LGZMEsCQEAjJjBIsLLiR4b01gvqU8jSmALbMYQjaDEzcNIK8-XykZOVw:1vpSWU:gBNy5oAhCuRzCGOMdox6f0vbvuaT5FjJlgsNotd2TCg','2026-02-23 14:45:58.492853');
CREATE INDEX IF NOT EXISTS "auth_group_permissions_group_id_b120cbf9" ON "auth_group_permissions" (
	"group_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_group_permissions_group_id_permission_id_0cd325b0_uniq" ON "auth_group_permissions" (
	"group_id",
	"permission_id"
);
CREATE INDEX IF NOT EXISTS "auth_group_permissions_permission_id_84c5c92e" ON "auth_group_permissions" (
	"permission_id"
);
CREATE INDEX IF NOT EXISTS "auth_permission_content_type_id_2f476e4b" ON "auth_permission" (
	"content_type_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_permission_content_type_id_codename_01ab375a_uniq" ON "auth_permission" (
	"content_type_id",
	"codename"
);
CREATE INDEX IF NOT EXISTS "auth_user_groups_group_id_97559544" ON "auth_user_groups" (
	"group_id"
);
CREATE INDEX IF NOT EXISTS "auth_user_groups_user_id_6a12ed8b" ON "auth_user_groups" (
	"user_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_groups_user_id_group_id_94350c0c_uniq" ON "auth_user_groups" (
	"user_id",
	"group_id"
);
CREATE INDEX IF NOT EXISTS "auth_user_user_permissions_permission_id_1fbb5f2c" ON "auth_user_user_permissions" (
	"permission_id"
);
CREATE INDEX IF NOT EXISTS "auth_user_user_permissions_user_id_a95ead1b" ON "auth_user_user_permissions" (
	"user_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "auth_user_user_permissions_user_id_permission_id_14a6b632_uniq" ON "auth_user_user_permissions" (
	"user_id",
	"permission_id"
);
CREATE INDEX IF NOT EXISTS "base_message_room_id_6b04a640" ON "base_message" (
	"room_id"
);
CREATE INDEX IF NOT EXISTS "base_message_user_id_46a57e37" ON "base_message" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "base_room_host_id_6c009082" ON "base_room" (
	"host_id"
);
CREATE INDEX IF NOT EXISTS "base_room_participants_room_id_8701ee11" ON "base_room_participants" (
	"room_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "base_room_participants_room_id_user_id_2e298648_uniq" ON "base_room_participants" (
	"room_id",
	"user_id"
);
CREATE INDEX IF NOT EXISTS "base_room_participants_user_id_2a86ea9a" ON "base_room_participants" (
	"user_id"
);
CREATE INDEX IF NOT EXISTS "django_admin_log_content_type_id_c4bce8eb" ON "django_admin_log" (
	"content_type_id"
);
CREATE INDEX IF NOT EXISTS "django_admin_log_user_id_c564eba6" ON "django_admin_log" (
	"user_id"
);
CREATE UNIQUE INDEX IF NOT EXISTS "django_content_type_app_label_model_76bd3d3b_uniq" ON "django_content_type" (
	"app_label",
	"model"
);
CREATE INDEX IF NOT EXISTS "django_session_expire_date_a5c62663" ON "django_session" (
	"expire_date"
);
COMMIT;

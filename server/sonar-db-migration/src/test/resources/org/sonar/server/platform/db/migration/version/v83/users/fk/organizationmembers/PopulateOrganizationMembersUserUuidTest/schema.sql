CREATE TABLE "USERS"(
    "ID" INTEGER NOT NULL AUTO_INCREMENT (1,1),
    "UUID" VARCHAR(255) NOT NULL,
    "LOGIN" VARCHAR(255) NOT NULL,
    "ORGANIZATION_UUID" VARCHAR(40),
    "NAME" VARCHAR(200),
    "EMAIL" VARCHAR(100),
    "CRYPTED_PASSWORD" VARCHAR(100),
    "SALT" VARCHAR(40),
    "HASH_METHOD" VARCHAR(10),
    "ACTIVE" BOOLEAN DEFAULT TRUE,
    "SCM_ACCOUNTS" VARCHAR(4000),
    "EXTERNAL_LOGIN" VARCHAR(255) NOT NULL,
    "EXTERNAL_IDENTITY_PROVIDER" VARCHAR(100) NOT NULL,
    "EXTERNAL_ID" VARCHAR(255) NOT NULL,
    "IS_ROOT" BOOLEAN NOT NULL,
    "USER_LOCAL" BOOLEAN,
    "ONBOARDED" BOOLEAN NOT NULL,
    "HOMEPAGE_TYPE" VARCHAR(40),
    "HOMEPAGE_PARAMETER" VARCHAR(40),
    "LAST_CONNECTION_DATE" BIGINT,
    "CREATED_AT" BIGINT,
    "UPDATED_AT" BIGINT
);
ALTER TABLE "USERS" ADD CONSTRAINT "PK_USERS" PRIMARY KEY("ID");
CREATE UNIQUE INDEX "USERS_LOGIN" ON "USERS"("LOGIN");
CREATE INDEX "USERS_UPDATED_AT" ON "USERS"("UPDATED_AT");
CREATE UNIQUE INDEX "USERS_UUID" ON "USERS"("UUID");
CREATE UNIQUE INDEX "UNIQ_EXTERNAL_ID" ON "USERS"("EXTERNAL_IDENTITY_PROVIDER", "EXTERNAL_ID");
CREATE UNIQUE INDEX "UNIQ_EXTERNAL_LOGIN" ON "USERS"("EXTERNAL_IDENTITY_PROVIDER", "EXTERNAL_LOGIN");


CREATE TABLE "ORGANIZATION_MEMBERS"(
    "ORGANIZATION_UUID" VARCHAR(40) NOT NULL,
    "USER_ID" INTEGER NOT NULL,
    "USER_UUID" VARCHAR(40),
);
ALTER TABLE "ORGANIZATION_MEMBERS" ADD CONSTRAINT "PK_ORGANIZATION_MEMBERS" PRIMARY KEY("ORGANIZATION_UUID", "USER_ID");
CREATE INDEX "IX_ORG_MEMBERS_ON_USER_ID" ON "ORGANIZATION_MEMBERS"("USER_ID");


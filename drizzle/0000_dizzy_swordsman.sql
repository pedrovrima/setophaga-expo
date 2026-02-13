CREATE TABLE "cities" (
	"id" serial PRIMARY KEY NOT NULL,
	"state_id" integer NOT NULL,
	"ibge_code" varchar(20),
	"name" varchar(150) NOT NULL,
	"microregion_name" varchar(100),
	"mesoregion_name" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "countries" (
	"id" serial PRIMARY KEY NOT NULL,
	"code" varchar(3) NOT NULL,
	"code2" varchar(2) NOT NULL,
	"name" varchar(100) NOT NULL,
	"name_local" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "countries_code_unique" UNIQUE("code"),
	CONSTRAINT "countries_code2_unique" UNIQUE("code2")
);
--> statement-breakpoint
CREATE TABLE "states" (
	"id" serial PRIMARY KEY NOT NULL,
	"country_id" integer NOT NULL,
	"code" varchar(10) NOT NULL,
	"name" varchar(100) NOT NULL,
	"region_name" varchar(100),
	"region_code" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "birds" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_code" varchar(50) NOT NULL,
	"cbro_code" varchar(50),
	"name_sci_cbro" varchar(255),
	"name_sci_ebird" varchar(255),
	"taxon_order" varchar(100),
	"family" varchar(100),
	"genera" varchar(100),
	"species" varchar(100),
	"status" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "birds_species_code_unique" UNIQUE("species_code")
);
--> statement-breakpoint
CREATE TABLE "vernacular_names" (
	"id" serial PRIMARY KEY NOT NULL,
	"species_code" varchar(50) NOT NULL,
	"language" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_primary" boolean DEFAULT false,
	"source" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(100),
	"last_name" varchar(100),
	"role" varchar(20) DEFAULT 'user' NOT NULL,
	"avatar_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synonyms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"bird_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "synonym_records" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"synonym_id" uuid NOT NULL,
	"country_id" integer,
	"state_id" integer,
	"city_id" integer,
	"location_description" text,
	"region" varchar(100),
	"latitude" numeric(10, 7),
	"longitude" numeric(10, 7),
	"collector_id" uuid,
	"collector_name" varchar(255),
	"informant" varchar(255),
	"observation" text,
	"collection_date" date,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"synced_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "cities" ADD CONSTRAINT "cities_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "states" ADD CONSTRAINT "states_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonyms" ADD CONSTRAINT "synonyms_bird_id_birds_id_fk" FOREIGN KEY ("bird_id") REFERENCES "public"."birds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonym_records" ADD CONSTRAINT "synonym_records_synonym_id_synonyms_id_fk" FOREIGN KEY ("synonym_id") REFERENCES "public"."synonyms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonym_records" ADD CONSTRAINT "synonym_records_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonym_records" ADD CONSTRAINT "synonym_records_state_id_states_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."states"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonym_records" ADD CONSTRAINT "synonym_records_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "synonym_records" ADD CONSTRAINT "synonym_records_collector_id_profiles_id_fk" FOREIGN KEY ("collector_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cities_state_id_idx" ON "cities" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "cities_name_idx" ON "cities" USING btree ("name");--> statement-breakpoint
CREATE INDEX "cities_ibge_code_idx" ON "cities" USING btree ("ibge_code");--> statement-breakpoint
CREATE INDEX "cities_state_name_idx" ON "cities" USING btree ("state_id","name");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_code_idx" ON "countries" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "countries_code2_idx" ON "countries" USING btree ("code2");--> statement-breakpoint
CREATE INDEX "countries_name_idx" ON "countries" USING btree ("name");--> statement-breakpoint
CREATE INDEX "states_country_id_idx" ON "states" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "states_code_idx" ON "states" USING btree ("code");--> statement-breakpoint
CREATE INDEX "states_name_idx" ON "states" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX "states_country_code_idx" ON "states" USING btree ("country_id","code");--> statement-breakpoint
CREATE INDEX "birds_species_code_idx" ON "birds" USING btree ("species_code");--> statement-breakpoint
CREATE INDEX "birds_cbro_code_idx" ON "birds" USING btree ("cbro_code");--> statement-breakpoint
CREATE INDEX "birds_name_sci_cbro_idx" ON "birds" USING btree ("name_sci_cbro");--> statement-breakpoint
CREATE INDEX "birds_name_sci_ebird_idx" ON "birds" USING btree ("name_sci_ebird");--> statement-breakpoint
CREATE INDEX "birds_family_idx" ON "birds" USING btree ("family");--> statement-breakpoint
CREATE INDEX "birds_taxon_order_idx" ON "birds" USING btree ("taxon_order");--> statement-breakpoint
CREATE INDEX "vernacular_names_species_code_idx" ON "vernacular_names" USING btree ("species_code");--> statement-breakpoint
CREATE INDEX "vernacular_names_language_idx" ON "vernacular_names" USING btree ("language");--> statement-breakpoint
CREATE INDEX "vernacular_names_name_idx" ON "vernacular_names" USING btree ("name");--> statement-breakpoint
CREATE INDEX "vernacular_names_source_idx" ON "vernacular_names" USING btree ("source");--> statement-breakpoint
CREATE INDEX "vernacular_names_species_language_idx" ON "vernacular_names" USING btree ("species_code","language");--> statement-breakpoint
CREATE INDEX "synonyms_name_idx" ON "synonyms" USING btree ("name");--> statement-breakpoint
CREATE INDEX "synonyms_bird_id_idx" ON "synonyms" USING btree ("bird_id");--> statement-breakpoint
CREATE UNIQUE INDEX "synonyms_name_bird_idx" ON "synonyms" USING btree ("name","bird_id");--> statement-breakpoint
CREATE INDEX "synonym_records_synonym_id_idx" ON "synonym_records" USING btree ("synonym_id");--> statement-breakpoint
CREATE INDEX "synonym_records_country_id_idx" ON "synonym_records" USING btree ("country_id");--> statement-breakpoint
CREATE INDEX "synonym_records_state_id_idx" ON "synonym_records" USING btree ("state_id");--> statement-breakpoint
CREATE INDEX "synonym_records_city_id_idx" ON "synonym_records" USING btree ("city_id");--> statement-breakpoint
CREATE INDEX "synonym_records_collector_id_idx" ON "synonym_records" USING btree ("collector_id");--> statement-breakpoint
CREATE INDEX "synonym_records_synced_at_idx" ON "synonym_records" USING btree ("synced_at");--> statement-breakpoint
CREATE INDEX "synonym_records_deleted_at_idx" ON "synonym_records" USING btree ("deleted_at");
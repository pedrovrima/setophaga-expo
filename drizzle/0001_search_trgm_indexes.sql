CREATE EXTENSION IF NOT EXISTS pg_trgm;
--> statement-breakpoint
CREATE OR REPLACE FUNCTION immutable_unaccent(text) RETURNS text AS $$
  SELECT public.unaccent($1);
$$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
--> statement-breakpoint
CREATE INDEX vernacular_names_name_trgm_idx
  ON vernacular_names USING gin (lower(immutable_unaccent(name)) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX synonyms_name_trgm_idx
  ON synonyms USING gin (lower(immutable_unaccent(name)) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX birds_sci_cbro_trgm_idx
  ON birds USING gin (lower(immutable_unaccent(coalesce(name_sci_cbro, ''))) gin_trgm_ops);
--> statement-breakpoint
CREATE INDEX birds_sci_ebird_trgm_idx
  ON birds USING gin (lower(immutable_unaccent(coalesce(name_sci_ebird, ''))) gin_trgm_ops);

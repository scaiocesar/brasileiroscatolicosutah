-- Add editable publication date and gallery images to articles.
ALTER TABLE articles ADD COLUMN published_at TEXT NOT NULL DEFAULT '';
ALTER TABLE articles ADD COLUMN gallery_keys TEXT;

-- Backfill published_at from created_at for existing rows.
UPDATE articles SET published_at = created_at;

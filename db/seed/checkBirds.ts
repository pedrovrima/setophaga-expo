import 'dotenv/config';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function main() {
  // Check what tables exist with 'bird' in the name
  const tables = await sql`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`;
  console.log('All public tables:', tables.map(t => t.table_name));

  // Check old birds table structure (the one created by Supabase client)
  const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'birds' ORDER BY ordinal_position`;
  console.log('\nbirds columns:', cols.map(c => `${c.column_name} (${c.data_type})`));

  // Count
  const count = await sql`SELECT count(*) as cnt FROM birds`;
  console.log('\nbirds count:', count[0].cnt);

  // Sample
  const sample = await sql`SELECT * FROM birds LIMIT 1`;
  console.log('\nSample bird:', JSON.stringify(sample[0], null, 2));

  process.exit(0);
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });

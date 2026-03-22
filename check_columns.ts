import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const { data: cols, error: errCols } = await supabase.rpc('get_table_columns_v2', { query_table_name: 'usuarios' });
    if (cols) { console.log("COLUMNS:", cols); }
    
    // Fallback if no RPC
    const { data, error } = await supabase.from('jugadores').select('*').limit(1);
    if (data && data.length > 0) console.log("DATA ROWS:", Object.keys(data[0]));
    if (error) console.log("ERROR:", error);
}

main();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    // Check columns in apuestas
    const { data: cols, error: errCols } = await supabase.rpc('exec_sql', {
        sql_string: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'apuestas';"
    });
    console.log("Columns:", cols, errCols);

    if (errCols) {
        // If exec_sql RPC doesn't exist, let's just make a dummy insert to see schema errors or fetch one row
        const { data: rows, error: errRows } = await supabase.from('apuestas').select('*').limit(1);
        console.log("Row sample:", rows, errRows);
    }
}

checkSchema();

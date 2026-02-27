import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
    let output = "Checking DB...\n";

    // 1. Get auth users
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
        output += "Auth error: " + JSON.stringify(authError) + "\n";
    } else {
        const minimalUsers = users.map(u => ({ id: u.id, email: u.email }));
        output += "AUTH_USERS_START\n";
        output += JSON.stringify(minimalUsers, null, 2) + "\n";
        output += "AUTH_USERS_END\n";
    }

    // 2. Get usuarios table
    const { data: usuarios, error: usError } = await supabase.from('usuarios').select('*');
    if (usError) {
        output += "Usuarios table error: " + JSON.stringify(usError) + "\n";
    } else {
        output += "USUARIOS_TABLE_START\n";
        output += JSON.stringify(usuarios, null, 2) + "\n";
        output += "USUARIOS_TABLE_END\n";
    }

    fs.writeFileSync('test-db-out.txt', output, 'utf8');
}

main();

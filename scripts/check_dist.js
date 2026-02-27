const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        env[key] = value;
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error, count } = await supabase
        .from('contenidos_base')
        .select('trimestre', { count: 'exact' });

    if (error) {
        console.error(error);
        return;
    }

    const stats = {};
    data.forEach(row => {
        const t = row.trimestre || 'NULL';
        stats[t] = (stats[t] || 0) + 1;
    });

    console.log('Trimester distribution in contenidos_base:');
    console.log(JSON.stringify(stats, null, 2));
    console.log('Total rows:', count);
}

check();

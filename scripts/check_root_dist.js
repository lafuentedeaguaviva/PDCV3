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
    const { data, error } = await supabase
        .from('contenidos_base')
        .select('id, padre_id, trimestre');

    if (error) {
        console.error(error);
        return;
    }

    let rootWithTrimestre = 0;
    let rootWithoutTrimestre = 0;
    let childWithTrimestre = 0;
    let childWithoutTrimestre = 0;

    data.forEach(row => {
        const isRoot = row.padre_id === null;
        const hasTrimestre = !!row.trimestre;

        if (isRoot) {
            if (hasTrimestre) rootWithTrimestre++;
            else rootWithoutTrimestre++;
        } else {
            if (hasTrimestre) childWithTrimestre++;
            else childWithoutTrimestre++;
        }
    });

    console.log('Roots with trimester:', rootWithTrimestre);
    console.log('Roots without trimester:', rootWithoutTrimestre);
    console.log('Children with trimester:', childWithTrimestre);
    console.log('Children without trimester:', childWithoutTrimestre);
}

check();

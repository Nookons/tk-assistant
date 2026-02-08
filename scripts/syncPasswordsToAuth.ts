// scripts/setDefaultPasswords.ts
import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';

config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Environment check:');
console.log('URL:', supabaseUrl ? '✅' : '❌');
console.log('Service Key:', supabaseServiceKey ? '✅' : '❌');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables!');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function setDefaultPassword(authId: string, cardId: string | number) {
    const cardIdStr = String(cardId);

    if (cardIdStr.length < 4) {
        console.error(`❌ Card ID too short: ${cardIdStr}`);
        return false;
    }

    const defaultPassword = "TKService123";

    try {
        // Используем auth_id для обновления пользователя в Auth
        const { error } = await supabase.auth.admin.updateUserById(authId, {
            password: defaultPassword,
        });

        if (error) {
            console.error(`❌ ${cardIdStr}: ${error.message}`);
            return false;
        }

        console.log(`✅ ${cardIdStr} → PIN: ${defaultPassword}`);
        return true;
    } catch (err: any) {
        console.error(`❌ ${cardIdStr}: ${err.message}`);
        return false;
    }
}

async function setAllDefaultPasswords() {
    console.log('🔄 Starting to set default passwords...\n');

    try {
        const { data: employees, error } = await supabase
            .from('employees')
            .select('id, auth_id, card_id, user_name')
            .order('card_id');

        if (error) {
            console.error('❌ Database error:', error.message);
            return;
        }

        if (!employees || employees.length === 0) {
            console.log('⚠️  No employees found');
            return;
        }

        console.log(`📋 Found ${employees.length} employees\n`);

        let successCount = 0;
        let failCount = 0;
        let skippedCount = 0;

        for (const [index, employee] of employees.entries()) {
            const cardIdStr = String(employee.card_id);
            console.log(`\n[${index + 1}/${employees.length}] ${employee.user_name} (${cardIdStr})`);

            // Проверяем есть ли auth_id
            if (!employee.auth_id) {
                console.log(`⚠️  No auth_id - skipping`);
                skippedCount++;
                continue;
            }

            const success = await setDefaultPassword(employee.auth_id, employee.card_id);

            if (success) {
                // Обновляем флаги в таблице employees
                await supabase
                    .from('employees')
                    .update({
                        must_change_password: true,
                        password_changed: false
                    })
                    .eq('id', employee.id);

                successCount++;
            } else {
                failCount++;
            }

            // Задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 300));
        }

        console.log('\n' + '='.repeat(60));
        console.log(`✅ Successfully updated: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`⚠️  Skipped (no auth_id): ${skippedCount}`);
        console.log('\n💡 Default PIN = last 4 digits of Card ID');
        console.log('💡 Users will be asked to change PIN on first login');
        console.log('='.repeat(60) + '\n');

    } catch (err: any) {
        console.error('\n❌ Unexpected error:', err.message);
        console.error(err);
    }
}

setAllDefaultPasswords();
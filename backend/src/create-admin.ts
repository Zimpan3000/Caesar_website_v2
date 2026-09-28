import './environment'
import { createAccount } from './members/accounts'
import { supabaseAdmin, usesSupabase } from './members/supabase'

async function main() {
  if (!usesSupabase) throw new Error('Set MEMBERS_PROVIDER=supabase first.')
  const { data, error } = await supabaseAdmin().from('caesar_profiles').select('id').eq('role', 'admin').limit(1)
  if (error) throw new Error('Cannot read accounts. Apply all SQL files in supabase/migrations in filename order first.')
  if (data?.length !== 0) throw new Error('An administrator already exists. This command only creates the first administrator.')
  await createAccount({ username: process.env.BOOTSTRAP_ADMIN_USERNAME, name: process.env.BOOTSTRAP_ADMIN_NAME || 'Admin', password: process.env.BOOTSTRAP_ADMIN_PASSWORD }, 'admin')
  console.log('Administrator created. Remove BOOTSTRAP_ADMIN_PASSWORD from the environment file, then sign in with your chosen username and password.')
}
main().catch(error => { console.error((error as Error).message); process.exitCode = 1 })

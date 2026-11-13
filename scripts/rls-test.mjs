import { createClient } from '@supabase/supabase-js'

const url = 'https://ezkyqecsbiscsrfrkggz.supabase.co'
const key = process.env.SUPABASE_KEY        // publishable key
const password = process.env.TEST_PASSWORD  // the password you gave both test users

async function loginAs(email) {
  const sb = createClient(url, key)
  const { error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
  return sb
}

// 1. user1 adds a task and reads their tasks
const user1 = await loginAs('user1@test.com')
const { data: added, error: addErr } = await user1
  .from('tasks').insert({ title: 'user1 private task' }).select()
console.log('1. user1 insert:', addErr ?? added)

const { data: own } = await user1.from('tasks').select()
console.log('2. user1 sees:', own.length, 'task(s)')

// 2. user2 tries to see, change and fake-insert
const user2 = await loginAs('user2@test.com')
const { data: seen } = await user2.from('tasks').select()
console.log('3. user2 sees:', seen.length, 'task(s)')

const { data: changed } = await user2
  .from('tasks').update({ title: 'hacked' }).eq('id', added[0].id).select()
console.log('4. user2 updated:', changed.length, 'row(s)')

const { error: fakeErr } = await user2
  .from('tasks').insert({ title: 'fake', user_id: added[0].user_id })
console.log('5. user2 insert as user1:', fakeErr?.message ?? 'allowed (bad!)')

// 3. someone who is not logged in
const anon = createClient(url, key)
const { error: anonErr } = await anon.from('tasks').select()
console.log('6. logged-out visitor:', anonErr?.message ?? 'allowed (bad!)')
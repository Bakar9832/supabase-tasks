'use client'
import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

type Task = { id: number; title: string; is_done: boolean }

export default function Home() {
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')

  async function loadTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, is_done')
      .order('id')
    if (error) setMessage(error.message)
    else setTasks(data ?? [])
  }

  // Track login state and load tasks when a session appears
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadTasks()
    })
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) loadTasks()
    })
    return () => data.subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function signIn() {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setMessage(error?.message ?? '')
  }
  async function signUp() {
    const { error } = await supabase.auth.signUp({ email, password })
    setMessage(error?.message ?? 'Check your email to confirm your account.')
  }
  async function addTask() {
    if (!title.trim()) return
    const { error } = await supabase.from('tasks').insert({ title })
    if (error) setMessage(error.message)
    else {
      setTitle('')
      loadTasks()
    }
  }
  async function toggle(t: Task) {
    await supabase.from('tasks').update({ is_done: !t.is_done }).eq('id', t.id)
    loadTasks()
  }
  async function remove(id: number) {
    await supabase.from('tasks').delete().eq('id', id)
    loadTasks()
  }

  // Show nothing when logged out
  const visibleTasks = session ? tasks : []

  const input = 'border rounded px-3 py-2 w-full bg-white text-black placeholder-gray-500'
  const button = 'border rounded px-3 py-2'

  return (
    <main className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Tasks</h1>
      {message && <p className="text-sm text-red-500">{message}</p>}

      {!session ? (
        <div className="space-y-2">
          <input
            className={input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button className={button} onClick={signIn}>Sign in</button>
            <button className={button} onClick={signUp}>Sign up</button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>{session.user.email}</span>
            <button className="underline" onClick={() => supabase.auth.signOut()}>
              Sign out
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className={input}
              placeholder="New task"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <button className={button} onClick={addTask}>Add</button>
          </div>
          <ul className="space-y-2">
            {visibleTasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between border rounded px-3 py-2"
              >
                <span className={t.is_done ? 'line-through opacity-60' : ''}>
                  {t.title}
                </span>
                <span className="flex gap-2">
                  <button onClick={() => toggle(t)}>{t.is_done ? 'Undo' : 'Done'}</button>
                  <button onClick={() => remove(t.id)}>Delete</button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
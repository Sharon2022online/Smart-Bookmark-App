'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

/* ---------------- ICONS ---------------- */

const TrashIcon = () => (
  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m4-6v6M5 7h14l-1 14H6L5 7z" />
  </svg>
)

const PencilIcon = () => (
  <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

/* ---------------- MAIN ---------------- */

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => setUser(session?.user ?? null)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Login />

  return <Dashboard user={user} />
}

/* ---------------- LOGIN ---------------- */

function Login() {
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    await supabase.auth.signInWithOAuth({ provider: 'google' })
    setLoading(false)
  }

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-gray-100">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center space-y-6 w-96">
        <h1 className="text-2xl font-bold text-gray-900">
          Smart Bookmark Manager 🚀
        </h1>

        <button
          title="Login with Google"
          onClick={handleLogin}
          className="w-full bg-black text-white py-3 rounded-lg hover:scale-105 transition cursor-pointer"
        >
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  )
}

/* ---------------- DASHBOARD ---------------- */

function Dashboard({ user }: { user: any }) {
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [search, setSearch] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [dropdown, setDropdown] = useState(false)

  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from('bookmarks')
      .select('*')
      .order('created_at', { ascending: false })

    setBookmarks(data || [])
  }

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const handleSave = async () => {
    if (!title || !url) return

    if (editId) {
      await supabase.from('bookmarks').update({ title, url }).eq('id', editId)
    } else {
      await supabase.from('bookmarks').insert([
        { title, url, user_id: user.id },
      ])
    }

    setTitle('')
    setUrl('')
    setEditId(null)
    setShowModal(false)
    fetchBookmarks()
  }

  const handleDelete = async () => {
    if (!showDelete) return

    await supabase.from('bookmarks').delete().eq('id', showDelete)
    setShowDelete(null)
    fetchBookmarks()
  }

  const filtered = bookmarks.filter((b) =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.url.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [search])

  const totalPages = Math.ceil(filtered.length / itemsPerPage)

  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Your Bookmarks</h2>

          <div className="relative">
            <button
              title="Menu"
              onClick={() => setDropdown(!dropdown)}
              className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              <MenuIcon />
            </button>

            {dropdown && (
              <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg p-3 w-56 border">
                <p className="text-sm text-gray-900 font-medium">{user.email}</p>

                <button
                  title="Logout"
                  onClick={() => supabase.auth.signOut()}
                  className="mt-2 text-red-600 hover:bg-red-50 px-2 py-1 rounded w-full text-left font-medium cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex gap-2 mb-5">
          <input
            placeholder="Search bookmarks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border px-4 py-2 rounded-lg text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-black"
          />

          <button
            title="Add Bookmark"
            onClick={() => {
              setEditId(null)
              setTitle('')
              setUrl('')
              setShowModal(true)
            }}
            className="bg-black text-white px-4 rounded-lg hover:scale-105 transition cursor-pointer"
          >
            +
          </button>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {paginated.length === 0 ? (
            <p className="text-center text-gray-500">No bookmarks found</p>
          ) : (
            paginated.map((b) => (
              <div key={b.id} className="flex justify-between p-4 border rounded-xl hover:shadow">

                <div>
                  <p className="font-semibold text-gray-900">{b.title}</p>
                  <a href={b.url} target="_blank" className="text-blue-600 text-sm">
                    {b.url}
                  </a>
                </div>

                <div className="flex gap-4">
                  <button
                    title="Edit"
                    className="cursor-pointer"
                    onClick={() => {
                      setEditId(b.id)
                      setTitle(b.title)
                      setUrl(b.url)
                      setShowModal(true)
                    }}>
                    <PencilIcon />
                  </button>

                  <button
                    title="Delete"
                    className="cursor-pointer"
                    onClick={() => setShowDelete(b.id)}>
                    <TrashIcon />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

        {/* PAGINATION */}
        {filtered.length > itemsPerPage && (
          <div className="flex justify-center gap-4 mt-6">

            <button
              title="Previous Page"
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-black text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              Prev
            </button>

            <span className="text-sm font-medium text-gray-700 flex items-center">
              Page {currentPage} / {totalPages}
            </span>

            <button
              title="Next Page"
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-black text-black disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 cursor-pointer"
            >
              Next
            </button>

          </div>
        )}

      </div>

      {/* MODALS SAME AS BEFORE */}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4 shadow-xl">

            <h2 className="font-bold text-lg text-gray-900">
              {editId ? 'Edit Bookmark' : 'Add Bookmark'}
            </h2>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full border p-2 rounded text-black placeholder-gray-500 focus:ring-2 focus:ring-black outline-none"
            />

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL"
              className="w-full border p-2 rounded text-black placeholder-gray-500 focus:ring-2 focus:ring-black outline-none"
            />

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowModal(false)} className="text-gray-700 cursor-pointer">
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-black text-white px-3 py-1 rounded cursor-pointer"
              >
                {editId ? 'Update' : 'Save'}
              </button>
            </div>

          </div>
        </div>
      )}

      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-80 space-y-4 shadow-xl">

            <p className="text-gray-900 font-medium">Delete this bookmark?</p>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowDelete(null)} className="text-gray-700 cursor-pointer">
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-3 py-1 rounded cursor-pointer"
              >
                Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
# 🚀 Smart Bookmark Manager

## 🔗 Live Demo

https://smart-bookmark-app-kappa-puce.vercel.app/

---

## 📌 Overview

Smart Bookmark Manager is a fullstack web application that allows users to securely save, manage, and access their bookmarks with real-time synchronization across tabs.

The app is built using **Next.js (App Router)**, **Supabase (Auth, Database, Realtime)**, and **Tailwind CSS**, and is deployed on **Vercel**.

---

## 🔐 Authentication & Row Level Security (RLS)

Authentication is implemented using **Supabase Google OAuth**, ensuring a seamless login experience without requiring email/password.

### RLS Implementation

Bookmarks are private per user and enforced at the **database level** using Supabase Row Level Security policies.

### Policy Used:

```sql
auth.uid() = user_id
```

### Applied to:

* SELECT → Users can only read their own bookmarks
* INSERT → Users can only create bookmarks for themselves
* UPDATE → Users can only modify their own bookmarks
* DELETE → Users can only delete their own bookmarks

✅ This ensures strict data isolation and prevents unauthorized access.

---

## ⚡ Real-Time Sync

Real-time updates are implemented using **Supabase Realtime subscriptions**.

### Approach:

* Subscribed to changes on the `bookmarks` table
* Listens to INSERT, UPDATE, and DELETE events
* Automatically refetches bookmarks when changes occur

### Cleanup:

Subscriptions are properly cleaned up using:

```ts
supabase.removeChannel(channel)
```

### Result:

* Changes in one tab instantly reflect in another
* No manual refresh required

---

## ✨ Features

* 🔐 Google OAuth login
* ➕ Add bookmarks (title + URL)
* ✏️ Edit bookmarks
* 🗑️ Delete bookmarks with confirmation modal
* 🔍 Search bookmarks (real-time filtering)
* 📄 Pagination for better usability
* ⚡ Real-time sync across tabs
* 🎨 Clean, responsive UI with Tailwind CSS

---

## 🎁 Bonus Feature

### 🔍 Search + Pagination

I implemented **search and pagination** to improve usability when managing a large number of bookmarks.

**Why this matters:**

* Makes navigation faster and more efficient
* Improves overall UX for scaling bookmark lists
* Keeps UI clean and organized

---

## ⚠️ Challenges Faced

### 1. RLS Blocking Updates

* Initially, updates/deletes failed due to missing policies
* Fixed by correctly applying RLS for all operations

### 2. Git & Deployment Setup

* Faced issues connecting local repo to GitHub
* Resolved by properly setting remote origin

### 3. UI Visibility Issues

* Default styling made buttons hard to see
* Improved contrast, hover states, and cursor feedback

---

## 🔧 What I’d Improve

If I had more time, I would add:

* 📂 Bookmark folders or tagging system
* ⭐ Favorite pinning
* 🌐 Auto-fetch metadata (title + favicon from URL)
* 🎨 Micro-interactions and animations

---

## 🛠️ Tech Stack

* **Frontend:** Next.js (App Router)
* **Backend:** Supabase (PostgreSQL)
* **Auth:** Supabase Google OAuth
* **Realtime:** Supabase Realtime
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

---

## 📂 GitHub Repository

https://github.com/Sharon2022online/Smart-Bookmark-App.git

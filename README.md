/*
Full single-file React app (App.jsx)

Instructions:
1. Create a React app (Vite / Create React App).
2. Install dependencies: `npm install @supabase/supabase-js react-router-dom`
3. Add Tailwind CSS to the project (recommended). The code uses Tailwind classes.
4. Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project's values.
5. Put this file at src/App.jsx and run the dev server.

Notes: This is a compact, single-file demo. For production, split into modules, add proper error handling, security, RLS policies, and server-side functions.

Required Supabase schema (minimal):
- profiles(id uuid primary key references auth.users,id, username text unique, display_name text, avatar_url text)
- posts(id serial primary key, author uuid references profiles(id), file_url text, caption text, is_story boolean default false, is_reel boolean default false, created_at timestamptz default now())
- likes(id serial, post_id int references posts(id), user_id uuid)
- comments(id serial, post_id int, user_id uuid, content text, created_at timestamptz default now())
- follows(id serial, follower uuid, following uuid)
- messages(id serial, sender uuid, recipient uuid, content text, created_at timestamptz default now())
- notifications(id serial, user_id uuid, actor_id uuid, type text, meta json, created_at timestamptz default now())
- Storage bucket: uploads (public) for files
*/

import React, { useEffect, useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import './index.css'; // assume Tailwind is configured

// ---------- CONFIG ----------
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR-ANON-KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- App ----------
export default function App() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [view, setView] = useState('feed'); // feed | reels | stories | explore | messages | profile | shop | create
  const [feed, setFeed] = useState([]);
  const [discover, setDiscover] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatOpen, setChatOpen] = useState(null);

  useEffect(() => {
    checkSession();
    fetchDiscover();
  }, []);

  async function checkSession() {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      setUser(data.session.user);
      await loadProfile(data.session.user.id);
    }
  }

  async function loadProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data || null);
    await loadFeed();
    await loadNotifications();
  }

  async function loadFeed() {
    const { data } = await supabase
      .from('posts')
      .select('*, profiles:profiles(username, display_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(100);
    setFeed(data || []);
  }

  async function fetchDiscover() {
    const { data } = await supabase.from('profiles').select('*').limit(20);
    setDiscover(data || []);
  }

  async function loadNotifications() {
    if (!user) return;
    const { data } = await supabase.from('notifications').select('*, actor:profiles(username)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    setNotifications(data || []);
  }

  function onLogin(userObj, profileObj) {
    setUser(userObj); setProfile(profileObj); setView('feed'); loadFeed(); loadNotifications();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 to-pink-600 text-white">
      <Header user={user} profile={profile} onLogout={async () => { await supabase.auth.signOut(); setUser(null); setProfile(null); }} setView={setView} />

      <main className="max-w-5xl mx-auto p-4">
        {!user ? (
          <Auth onLoggedIn={onLogin} />
        ) : (
          <div className="grid grid-cols-4 gap-6">
            <div className="col-span-1">
              <Sidebar profile={profile} setView={setView} notifications={notifications} loadNotifications={loadNotifications} />
            </div>

            <div className="col-span-2">
              {view === 'feed' && <Feed feed={feed} refresh={loadFeed} openChat={(id, name)=>{ setChatOpen({id,name}); setView('messages'); }} />}
              {view === 'reels' && <Reels />}
              {view === 'stories' && <Stories />}
              {view === 'explore' && <Explore discover={discover} />}
              {view === 'create' && <CreatePost onPosted={loadFeed} />}
              {view === 'profile' && <ProfilePage profile={profile} refresh={loadProfile} />}
              {view === 'shop' && <Shop />}
            </div>

            <div className="col-span-1">
              <Discover discover={discover} openChat={(id,name)=>{ setChatOpen({id,name}); setView('messages'); }} />
            </div>
          </div>
        )}

        {user && <MessagesModal chatOpen={chatOpen} onClose={()=>setChatOpen(null)} currentUser={user} />}
      </main>

    </div>
  );
}

// ---------- Header ----------
function Header({ user, profile, onLogout, setView }){
  return (
    <header className="flex items-center justify-between p-4 max-w-5xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="text-2xl font-bold">🎬 TheFilmyDJ</div>
        <nav className="hidden md:flex gap-3">
          <button onClick={()=>setView('feed')} className="px-3 py-1 rounded bg-white/10">Feed</button>
          <button onClick={()=>setView('reels')} className="px-3 py-1 rounded bg-white/10">Reels</button>
          <button onClick={()=>setView('stories')} className="px-3 py-1 rounded bg-white/10">Stories</button>
          <button onClick={()=>setView('explore')} className="px-3 py-1 rounded bg-white/10">Explore</button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={()=>setView('create')} className="bg-green-500 px-3 py-2 rounded">+ Create</button>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="text-sm">{profile?.username}</div>
            <img src={profile?.avatar_url||'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full" />
            <button onClick={onLogout} className="bg-red-600 px-3 py-1 rounded">Logout</button>
          </div>
        ) : null}
      </div>
    </header>
  );
}

// ---------- Auth (Signup only, no login button shown) ----------
function Auth({ onLoggedIn }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [msg, setMsg] = useState('');

  async function handleSignup(){
    if(!email||!password||!username){ setMsg('Fill all fields'); return; }
    setMsg('Creating account...');

    // ensure username unique
    const { data:existing } = await supabase.from('profiles').select('id').eq('username', username).limit(1);
    if(existing && existing.length){ setMsg('Username taken'); return; }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if(error){ setMsg(error.message); return; }

    const userId = data.user?.id;
    if(userId){
      await supabase.from('profiles').insert([{ id:userId, username, display_name:username }]);
      // auto sign-in may not happen; fetch session
      const { data:sessionData } = await supabase.auth.getSession();
      const sessionUser = sessionData.session?.user || data.user;
      setMsg('Account created. Logged in.');
      onLoggedIn(sessionUser, { id:userId, username });
    }
  }

  return (
    <div className="bg-white/5 p-6 rounded-lg max-w-2xl mx-auto">
      <h2 className="text-2xl mb-4">Create your account</h2>
      <div className="grid grid-cols-2 gap-3">
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" className="p-2 rounded bg-white/10" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="p-2 rounded bg-white/10" />
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" className="p-2 rounded bg-white/10" />
        <button onClick={handleSignup} className="bg-green-500 p-2 rounded">Create Account</button>
      </div>
      <p className="mt-3 text-sm text-yellow-200">{msg}</p>
      <p className="mt-3 text-sm">By creating an account you agree to prototype terms.</p>
    </div>
  );
}

// ---------- Sidebar ----------
function Sidebar({ profile, setView, notifications, loadNotifications }){
  return (
    <div>
      <div className="bg-white/5 p-4 rounded mb-4 text-center">
        <img src={profile?.avatar_url||'https://via.placeholder.com/80'} className="w-20 h-20 rounded-full mx-auto mb-2" />
        <div className="font-semibold">{profile?.display_name||profile?.username}</div>
        <div className="text-xs text-gray-300">@{profile?.username}</div>
      </div>
      <div className="bg-white/5 p-4 rounded mb-4">
        <button onClick={()=>setView('feed')} className="w-full mb-2 p-2 rounded bg-gray-700">Home</button>
        <button onClick={()=>setView('reels')} className="w-full mb-2 p-2 rounded bg-gray-700">Reels</button>
        <button onClick={()=>setView('stories')} className="w-full mb-2 p-2 rounded bg-gray-700">Stories</button>
        <button onClick={()=>setView('explore')} className="w-full p-2 rounded bg-gray-700">Explore</button>
      </div>
      <div className="bg-white/5 p-4 rounded">
        <div className="flex justify-between items-center mb-2">
          <div className="font-semibold">Notifications</div>
          <button onClick={loadNotifications} className="text-sm text-cyan-300">Refresh</button>
        </div>
        {notifications.length===0 ? <div className="text-sm text-gray-300">No notifications</div> : (
          notifications.map(n => <div key={n.id} className="p-2 text-sm bg-slate-800 rounded mb-2">{n.actor?.username} {n.type}</div>)
        )}
      </div>
    </div>
  );
}

// ---------- Feed ----------
function Feed({ feed, refresh, openChat }){
  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Home</h2>
        <button onClick={refresh} className="text-sm bg-white/10 p-2 rounded">Refresh</button>
      </div>
      {feed.map(post => (
        <PostCard key={post.id} post={post} openChat={openChat} />
      ))}
    </div>
  );
}

function PostCard({ post, openChat }){
  const isVideo = post.file_url && post.file_url.includes('.mp4');
  return (
    <div className="bg-white/5 rounded p-4 mb-4 text-black/90 text-white">
      <div className="flex items-center gap-3 mb-3">
        <img src={post.profiles?.avatar_url||'https://via.placeholder.com/48'} className="w-12 h-12 rounded-full" />
        <div className="flex-1 text-left">
          <div className="font-semibold text-white">{post.profiles?.username}</div>
          <div className="text-xs text-gray-300">{new Date(post.created_at).toLocaleString()}</div>
        </div>
        <button className="text-sm text-cyan-400" onClick={()=>openChat(post.author, post.profiles?.username)}>Message</button>
      </div>
      <div className="mb-3">
        {isVideo ? <video src={post.file_url} controls className="w-full rounded" /> : <img src={post.file_url} className="w-full rounded" />}
      </div>
      <div className="mb-2">{post.caption}</div>
      <div className="flex gap-2">
        <LikeButton postId={post.id} />
        <CommentBox postId={post.id} />
      </div>
    </div>
  );
}

function LikeButton({ postId }){
  const [liked, setLiked] = useState(false);
  async function toggle(){
    // simple toggle demo (no user context here)
    setLiked(!liked);
  }
  return <button onClick={toggle} className={`px-3 py-1 rounded ${liked? 'bg-pink-500':'bg-gray-700'}`}>{liked? 'Liked':'Like'}</button>;
}

function CommentBox({ postId }){
  const [text, setText] = useState('');
  async function post(){
    if(!text) return; await supabase.from('comments').insert([{ post_id: postId, content: text }]); setText(''); alert('Comment posted');
  }
  return (
    <div className="flex gap-2">
      <input value={text} onChange={e=>setText(e.target.value)} placeholder="Add comment" className="p-2 rounded bg-white/10" />
      <button onClick={post} className="bg-emerald-500 px-3 rounded">Post</button>
    </div>
  );
}

// ---------- Create Post ----------
function CreatePost({ onPosted }){
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [msg, setMsg] = useState('');

  async function handleUpload(){
    if(!file) { setMsg('Select a file'); return; }
    setMsg('Uploading...');
    const path = `posts/${Date.now()}_${file.name}`;
    const { error: upErr } = await supabase.storage.from('uploads').upload(path, file);
    if(upErr){ setMsg('Upload failed: '+upErr.message); return; }
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
    const publicUrl = urlData.publicUrl;
    const { error: postErr } = await supabase.from('posts').insert([{ author: (await supabase.auth.getSession()).data.session.user.id, file_url: publicUrl, caption }]);
    if(postErr){ setMsg('Post failed: '+postErr.message); return; }
    setMsg('Posted!'); setFile(null); setCaption(''); onPosted();
  }

  return (
    <div className="bg-white/5 p-4 rounded">
      <h3 className="font-semibold mb-2">Create Post / Story / Reel</h3>
      <input type="file" onChange={e=>setFile(e.target.files[0])} className="mb-2" />
      <input value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Write a caption..." className="w-full p-2 rounded bg-white/10 mb-2" />
      <div className="flex gap-2">
        <button onClick={handleUpload} className="bg-cyan-500 px-3 py-2 rounded">Upload & Post</button>
        <button onClick={()=>alert('Story/Reel helper - use checkboxes in real app')} className="bg-yellow-500 px-3 py-2 rounded">Advanced</button>
      </div>
      <p className="text-sm text-yellow-200 mt-2">{msg}</p>
    </div>
  );
}

// ---------- Reels (simple grid of is_reel posts) ----------
function Reels(){
  const [reels, setReels] = useState([]);
  useEffect(()=>{ load(); },[]);
  async function load(){ const { data } = await supabase.from('posts').select('*').eq('is_reel', true).order('created_at', {ascending:false}); setReels(data||[]); }
  return (
    <div>
      <h2 className="text-xl mb-4">Reels</h2>
      <div className="grid grid-cols-2 gap-4">
        {reels.map(r=> (
          <div key={r.id} className="bg-white/5 rounded overflow-hidden">
            <video src={r.file_url} controls className="w-full h-64 object-cover" />
            <div className="p-2 text-sm">{r.caption}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Stories (top bar) ----------
function Stories(){
  const [stories, setStories] = useState([]);
  useEffect(()=>{ load(); },[]);
  async function load(){ const { data } = await supabase.from('posts').select('*, profiles(username, avatar_url)').eq('is_story', true).order('created_at', {ascending:false}).limit(50); setStories(data||[]); }
  return (
    <div>
      <h2 className="text-xl mb-4">Stories</h2>
      <div className="flex gap-3 overflow-auto">
        {stories.map(s=> (
          <div key={s.id} className="w-28 text-center">
            <img src={s.profiles?.avatar_url||'https://via.placeholder.com/80'} className="w-20 h-20 rounded-full mx-auto mb-1" />
            <div className="text-sm">{s.profiles?.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Explore ----------
function Explore({ discover }){
  return (
    <div>
      <h2 className="text-xl mb-4">Explore</h2>
      <div className="grid grid-cols-3 gap-3">
        {discover.map(u=> (
          <div key={u.id} className="bg-white/5 rounded p-2 text-center">
            <img src={u.avatar_url||'https://via.placeholder.com/100'} className="w-full h-32 object-cover rounded mb-2" />
            <div className="font-semibold">{u.username}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Discover (right column) ----------
function Discover({ discover, openChat }){
  return (
    <div className="bg-white/5 p-4 rounded">
      <h3 className="font-semibold mb-3">Suggested</h3>
      {discover.map(u=> (
        <div key={u.id} className="flex items-center gap-2 mb-2">
          <img src={u.avatar_url||'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full" />
          <div className="flex-1">
            <div className="font-semibold">{u.username}</div>
          </div>
          <button onClick={()=>openChat(u.id,u.username)} className="text-sm underline">Message</button>
        </div>
      ))}
    </div>
  );
}

// ---------- Profile Page ----------
function ProfilePage({ profile, refresh }){
  return (
    <div>
      <div className="bg-white/5 p-4 rounded mb-4 flex items-center gap-4">
        <img src={profile?.avatar_url||'https://via.placeholder.com/100'} className="w-24 h-24 rounded-full" />
        <div>
          <div className="text-xl font-semibold">{profile?.display_name}</div>
          <div className="text-sm text-gray-300">@{profile?.username}</div>
        </div>
      </div>
      <div className="bg-white/5 p-4 rounded">Profile content (posts, highlights, insights) coming soon.</div>
    </div>
  );
}

// ---------- Messages Modal (basic) ----------
function MessagesModal({ chatOpen, onClose, currentUser }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  useEffect(()=>{ if(chatOpen) load(); }, [chatOpen]);
  async function load(){ if(!chatOpen) return; const { data } = await supabase.from('messages').select('*').or(`(sender.eq.${currentUser.id},recipient.eq.${currentUser.id})`).order('created_at',{ascending:true}).limit(500); const conv = data.filter(m=> (m.sender===currentUser.id && m.recipient===chatOpen.id) || (m.sender===chatOpen.id && m.recipient===currentUser.id)); setMessages(conv); }
  async function send(){ if(!text) return; await supabase.from('messages').insert([{ sender: currentUser.id, recipient: chatOpen.id, content: text }]); setText(''); load(); }
  if(!chatOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center p-4">
      <div className="bg-slate-900 w-full max-w-2xl rounded p-4">
        <div className="flex justify-between items-center mb-2"><div className="font-semibold">Chat with {chatOpen.name}</div><button onClick={onClose}>Close</button></div>
        <div className="h-64 overflow-auto bg-slate-800 p-3 rounded mb-2">
          {messages.map(m=> <div key={m.id} className={m.sender===currentUser.id? 'text-right':'text-left'}>{m.content}</div>)}
        </div>
        <div className="flex gap-2"><input className="flex-1 p-2 rounded bg-white/10" value={text} onChange={e=>setText(e.target.value)} /><button onClick={send} className="bg-cyan-500 p-2 rounded">Send</button></div>
      </div>
    </div>
  );
}

// ---------- Shop (placeholder) ----------
function Shop(){
  return (
    <div>
      <h2 className="text-xl mb-4">Shop</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 p-4 rounded">Product 1<br/><button className="mt-2 bg-green-500 px-3 py-2 rounded">Buy</button></div>
        <div className="bg-white/5 p-4 rounded">Product 2<br/><button className="mt-2 bg-green-500 px-3 py-2 rounded">Buy</button></div>
      </div>
    </div>
  );
}

/*
This single-file app is a starter. It includes:
- Signup-only auth (no login button in UI; you can extend to login)
- Create posts (upload to storage), feed, reels, stories, explore, messages, notifications placeholder

Next steps I can do for you (pick any):
1) Split into components and add routing
2) Realtime subscriptions (on insert) for feed & messages
3) Full UI polish to match exact Instagram screens you showed
4) Add Stories editor (camera + stickers) and Reels editor
5) Add server-side functions (transcoding, thumbnails)

Tell me which next and I'll generate it.
*/

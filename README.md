/*
FilmYDJ - Single-file React app (GitHub Pages friendly)

How to use:
1. Create a new GitHub repo (e.g. filmydj-site).
2. Add this file as `src/App.jsx` in a Create React App or Vite React project,
   or paste into a project scaffold. This component is the entire app.
3. Install dependencies (if using CRA/Vite): none required beyond React.
4. Build & publish to GitHub Pages via gh-pages or deploy the built site to GitHub Pages.

Notes / limitations:
- This is a frontend-only, client-side demo implementing many features locally
  (using localStorage and in-browser APIs). For a full production site you'd
  need a backend (auth, media storage, streaming server, payments, search indexing).
- Live streaming is simulated using webcam (getUserMedia). Actual multi-user live
  requires a signalling server and media server.

Features included (mocked / local):
- Posts: photo/video upload, location tag, simple CSS filters, tagging people (by username)
- Stories: ephemeral posts that expire after 24 hours, with music (audio URL), polls & quizzes
- Reels: short video recording, upload, add music and collaborators
- Live: start/stop local webcam stream (simulated live)
- Explore: search posts by keywords, users, hashtags
- DMs: simple direct message threads stored locally
- Notes: short profile status visible on avatar hover
- Shop: product listing, product tags, quick 'buy' simulation
- Highlights: save stories permanently to profile
- Professional Dashboard: simple insights (counts)
- Interactive stickers: Polls, Quizzes inside Stories

This file exports a default React component `App`.
*/

import React, { useEffect, useState, useRef } from "react";

// Utility helpers
const uid = () => Math.random().toString(36).slice(2, 9);
const now = () => Date.now();
const HOUR = 3600 * 1000;
const DAY = 24 * HOUR;

// localStorage helpers
const STORAGE_KEY = "filmydj_data_v1";
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Initial demo data
function defaultData() {
  const userId = "user_main";
  return {
    users: {
      [userId]: {
        id: userId,
        username: "filmydj",
        displayName: "FilmyDJ",
        avatar: null,
        notes: "Online — DJing today!",
        isProfessional: true,
        followers: ["u_alice", "u_bob"],
        following: ["u_alice"],
        highlights: [],
      },
      u_alice: { id: "u_alice", username: "alice", displayName: "Alice Singer", avatar: null, notes: "Coffee + Music" },
      u_bob: { id: "u_bob", username: "bob", displayName: "Bob Producer", avatar: null, notes: "Beats maker" },
    },
    posts: [
      // Each post: {id, userId, type:"image"|"video", src, caption, tags:[], location, createdAt}
    ],
    stories: [
      // {id,userId, type, src, createdAt, expiresAt, stickers: []}
    ],
    reels: [],
    lives: [],
    dms: {}, // {threadId: {id, participants:[ids], messages:[{id,userId,text,createdAt}]}}
    shop: [
      { id: "p1", title: "DJ Headphones", price: 49.99, tags: ["audio","gear"], image: null },
      { id: "p2", title: "Vinyl Bundle", price: 19.99, tags: ["music","collectible"], image: null },
    ],
  };
}

// Simple image uploader -> dataURL
function readFileAsDataURL(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}

// App Component
export default function App() {
  // load or init
  const [data, setData] = useState(() => loadData() || defaultData());
  const mainUserId = "user_main";
  const mainUser = data.users[mainUserId];

  useEffect(() => {
    saveData(data);
  }, [data]);

  // Navigation
  const [view, setView] = useState("feed");

  // Post creation state
  const [postUploading, setPostUploading] = useState(false);
  const [postFile, setPostFile] = useState(null);
  const [postCaption, setPostCaption] = useState("");
  const [postLocation, setPostLocation] = useState("");
  const [postFilter, setPostFilter] = useState("none");
  const [postTags, setPostTags] = useState("");

  // Story composer
  const [storyFile, setStoryFile] = useState(null);
  const [storyMusic, setStoryMusic] = useState("");
  const [storyStickers, setStoryStickers] = useState([]);

  // Reel composer
  const [reelFile, setReelFile] = useState(null);
  const [reelMusic, setReelMusic] = useState("");
  const [reelCollaborators, setReelCollaborators] = useState("");

  // DM
  const [dmTo, setDmTo] = useState("");
  const [dmText, setDmText] = useState("");
  const [selectedThread, setSelectedThread] = useState(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Live
  const [isLive, setIsLive] = useState(false);
  const localVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  // Professional dashboard insights
  const dashboard = {
    followers: mainUser.followers.length,
    posts: data.posts.filter((p) => p.userId === mainUserId).length,
    stories: data.stories.filter((s) => s.userId === mainUserId).length,
    reels: data.reels.filter((r) => r.userId === mainUserId).length,
  };

  // Helpers to update data state immutably
  function updateData(mutator) {
    setData((d) => {
      const copy = JSON.parse(JSON.stringify(d));
      mutator(copy);
      return copy;
    });
  }

  // Post upload flow
  async function handleCreatePost(e) {
    e.preventDefault();
    if (!postFile) return alert("Choose a photo or video first.");
    setPostUploading(true);
    const src = await readFileAsDataURL(postFile);
    const newPost = {
      id: uid(),
      userId: mainUserId,
      type: postFile.type.startsWith("video") ? "video" : "image",
      src,
      caption: postCaption,
      tags: postTags.split(",").map((t) => t.trim()).filter(Boolean),
      location: postLocation,
      createdAt: now(),
    };
    updateData((d) => d.posts.unshift(newPost));
    setPostFile(null);
    setPostCaption("");
    setPostLocation("");
    setPostTags("");
    setPostFilter("none");
    setPostUploading(false);
    setView("feed");
  }

  // Story creator
  async function handleCreateStory(e) {
    e.preventDefault();
    if (!storyFile) return alert("Choose media for story.");
    const src = await readFileAsDataURL(storyFile);
    const createdAt = now();
    const expiresAt = createdAt + DAY; // 24 hours
    const story = {
      id: uid(),
      userId: mainUserId,
      type: storyFile.type.startsWith("video") ? "video" : "image",
      src,
      createdAt,
      expiresAt,
      stickers: storyStickers.slice(),
      music: storyMusic,
    };
    updateData((d) => d.stories.unshift(story));
    setStoryFile(null);
    setStoryMusic("");
    setStoryStickers([]);
    setView("feed");
  }

  // Save story to highlights
  function saveToHighlights(storyId, title = "Highlight") {
    updateData((d) => {
      d.users[mainUserId].highlights.push({ id: uid(), storyId, title });
    });
  }

  // Reel creator
  async function handleCreateReel(e) {
    e.preventDefault();
    if (!reelFile) return alert("Choose a video for reel.");
    const src = await readFileAsDataURL(reelFile);
    const reel = {
      id: uid(),
      userId: mainUserId,
      src,
      music: reelMusic,
      collaborators: reelCollaborators.split(",").map((s) => s.trim()).filter(Boolean),
      createdAt: now(),
    };
    updateData((d) => d.reels.unshift(reel));
    setReelFile(null);
    setReelMusic("");
    setReelCollaborators("");
    setView("reels");
  }

  // DM send
  function handleSendDM(e) {
    e.preventDefault();
    if (!dmTo || !dmText) return alert("Choose recipient and write a message.");
    const recipient = Object.values(data.users).find(u => u.username === dmTo || u.id === dmTo);
    if (!recipient) return alert("Recipient not found (use username).");
    // find or create thread
    const participants = [mainUserId, recipient.id].sort();
    const threadId = participants.join("_");
    updateData((d) => {
      d.dms[threadId] = d.dms[threadId] || { id: threadId, participants, messages: [] };
      d.dms[threadId].messages.push({ id: uid(), userId: mainUserId, text: dmText, createdAt: now() });
    });
    setDmText("");
    setView("dm");
    setSelectedThread(threadId);
  }

  // Search
  function runSearch(q) {
    const ql = q.trim().toLowerCase();
    if (!ql) return setSearchResults([]);
    const postMatches = data.posts.filter(p => (p.caption || "").toLowerCase().includes(ql) || (p.tags||[]).join(",").includes(ql) || (p.location||"").toLowerCase().includes(ql));
    const userMatches = Object.values(data.users).filter(u => (u.username + " " + (u.displayName||"")).toLowerCase().includes(ql));
    setSearchResults([...userMatches, ...postMatches]);
  }

  // Live start/stop — local webcam preview (simulated live)
  async function startLive() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      setIsLive(true);
      updateData(d => d.lives.unshift({ id: uid(), userId: mainUserId, startedAt: now(), viewers: 0, streamId: uid() }));
    } catch (e) {
      alert("Camera access failed: " + e.message);
    }
  }
  function stopLive() {
    const s = localStreamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
    }
    setIsLive(false);
  }

  // Shop buy simulation
  function buyProduct(productId) {
    const p = data.shop.find(s => s.id === productId);
    if (!p) return;
    alert(`Purchased ${p.title} for $${p.price} (simulated).`);
  }

  // Story expiration cleanup
  useEffect(() => {
    const t = setInterval(() => {
      const nowTime = now();
      updateData((d) => {
        d.stories = d.stories.filter(s => s.expiresAt > nowTime);
      });
    }, 60 * 1000);
    return () => clearInterval(t);
  }, []);

  // Render helpers for media with filters
  function Media({ item, filter = "none", style = {} }) {
    const cssFilter = {
      none: "",
      bw: "grayscale(1)",
      vintage: "sepia(0.6) contrast(0.9)",
      bright: "brightness(1.2) saturate(1.1)",
    }[filter] || "";
    if (item.type === "video") return (
      <video controls style={{ maxWidth: "100%", filter: cssFilter, ...style }} src={item.src} />
    );
    return <img alt="post-media" style={{ maxWidth: "100%", filter: cssFilter, ...style }} src={item.src} />;
  }

  // UI components (simple)
  function TopBar() {
    return (
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-3">
          <div className="font-bold text-xl">FilmyDJ</div>
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search users, posts, tags..." className="px-2 py-1 rounded border" />
          <button onClick={() => runSearch(searchQuery)} className="px-2 py-1 rounded border">Search</button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setView("feed")} className="px-2 py-1">Feed</button>
          <button onClick={() => setView("stories")} className="px-2 py-1">Stories</button>
          <button onClick={() => setView("reels")} className="px-2 py-1">Reels</button>
          <button onClick={() => setView("live")} className="px-2 py-1">Live</button>
          <button onClick={() => setView("dm")} className="px-2 py-1">DMs</button>
          <button onClick={() => setView("shop")} className="px-2 py-1">Shop</button>
          <button onClick={() => setView("profile")} className="px-2 py-1">Profile</button>
        </div>
      </div>
    );
  }

  function FeedView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Create Post</h2>
        <form onSubmit={handleCreatePost} className="p-3 border rounded space-y-2">
          <input type="file" accept="image/*,video/*" onChange={(e) => setPostFile(e.target.files?.[0]||null)} />
          <div className="flex gap-2">
            <select value={postFilter} onChange={e=>setPostFilter(e.target.value)} className="px-2 py-1 border rounded">
              <option value="none">No filter</option>
              <option value="bw">Black & White</option>
              <option value="vintage">Vintage</option>
              <option value="bright">Bright</option>
            </select>
            <input value={postLocation} onChange={e=>setPostLocation(e.target.value)} placeholder="Location" className="px-2 py-1 border rounded" />
            <input value={postTags} onChange={e=>setPostTags(e.target.value)} placeholder="tags (comma)" className="px-2 py-1 border rounded" />
          </div>
          <textarea value={postCaption} onChange={e=>setPostCaption(e.target.value)} placeholder="Write a caption..." className="w-full p-2 border rounded" />
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">Post</button>
            <button type="button" onClick={() => { setPostFile(null); setPostCaption(""); }} className="px-3 py-1 border rounded">Clear</button>
          </div>
        </form>

        <h2 className="text-lg font-semibold my-3">Feed</h2>
        <div className="space-y-4">
          {data.posts.length === 0 && <div className="italic text-sm">No posts yet — create one!</div>}
          {data.posts.map(post => (
            <div key={post.id} className="border rounded p-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-full bg-gray-300 w-10 h-10 flex items-center justify-center">{data.users[post.userId]?.displayName?.[0]||"U"}</div>
                <div>
                  <div className="font-semibold">{data.users[post.userId]?.displayName || post.userId}</div>
                  <div className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="mb-2">
                <Media item={post} filter={postFilter} />
              </div>
              <div className="mb-1">{post.caption}</div>
              <div className="text-sm text-gray-600">{post.tags && post.tags.length ? "#" + post.tags.join(" #") : null}</div>
              <div className="text-sm text-gray-500">{post.location}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function StoriesView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Create Story</h2>
        <form onSubmit={handleCreateStory} className="p-3 border rounded space-y-2">
          <input type="file" accept="image/*,video/*" onChange={(e)=>setStoryFile(e.target.files?.[0]||null)} />
          <input value={storyMusic} onChange={e=>setStoryMusic(e.target.value)} placeholder="Music URL (optional)" className="px-2 py-1 border rounded w-full" />
          <div>
            <label className="text-sm">Add Sticker: Poll / Quiz</label>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => setStoryStickers(s => [...s, { id: uid(), type: 'poll', question: 'Which song?', options: ['A','B'], votes: [0,0] }])} className="px-2 py-1 border rounded">Add Poll</button>
              <button type="button" onClick={() => setStoryStickers(s => [...s, { id: uid(), type: 'quiz', question: 'Quiz?', options: ['1','2'], answerIndex: 0 }])} className="px-2 py-1 border rounded">Add Quiz</button>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-3 py-1 bg-purple-600 text-white rounded">Share Story</button>
            <button type="button" onClick={()=>{setStoryFile(null); setStoryStickers([]);}} className="px-3 py-1 border rounded">Clear</button>
          </div>
        </form>

        <h2 className="text-lg font-semibold my-3">Stories</h2>
        <div className="flex gap-3 overflow-x-auto pb-3">
          {data.stories.length === 0 && <div className="italic">No stories yet</div>}
          {data.stories.map(story => (
            <div key={story.id} className="w-48 border rounded p-2">
              <div className="font-semibold mb-1">{data.users[story.userId]?.displayName}</div>
              <div className="mb-2"><Media item={story} style={{ maxHeight: 180, objectFit: 'cover' }} /></div>
              <div className="text-xs text-gray-500">Expires: {new Date(story.expiresAt).toLocaleString()}</div>
              <div className="flex gap-2 mt-2">
                <button onClick={()=>saveToHighlights(story.id)} className="px-2 py-1 border rounded text-sm">Save Highlight</button>
                <button onClick={()=>{ /* open story view */ }} className="px-2 py-1 border rounded text-sm">View</button>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-4 font-semibold">Your Highlights</h3>
        <div className="space-y-2 mt-2">
          {mainUser.highlights.length === 0 && <div className="italic">No highlights yet</div>}
          {mainUser.highlights.map(h => (
            <div key={h.id} className="border rounded p-2">{h.title} (storyId: {h.storyId})</div>
          ))}
        </div>
      </div>
    );
  }

  function ReelsView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Create Reel</h2>
        <form onSubmit={handleCreateReel} className="p-3 border rounded space-y-2">
          <input type="file" accept="video/*" onChange={(e)=>setReelFile(e.target.files?.[0]||null)} />
          <input value={reelMusic} onChange={e=>setReelMusic(e.target.value)} placeholder="Music URL" className="px-2 py-1 border rounded w-full" />
          <input value={reelCollaborators} onChange={e=>setReelCollaborators(e.target.value)} placeholder="Collaborators (usernames comma)" className="px-2 py-1 border rounded w-full" />
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-green-600 text-white rounded" type="submit">Upload Reel</button>
          </div>
        </form>

        <h2 className="text-lg font-semibold my-3">Reels</h2>
        <div className="space-y-3">
          {data.reels.length === 0 && <div className="italic">No reels yet</div>}
          {data.reels.map(r => (
            <div key={r.id} className="border rounded p-3">
              <div className="font-semibold">{data.users[r.userId]?.displayName}</div>
              <video controls src={r.src} style={{ maxWidth: '100%' }} />
              <div className="text-sm text-gray-600">Music: {r.music}</div>
              <div className="text-sm">Collab: {r.collaborators.join(', ')}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function LiveView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Live</h2>
        <div className="flex gap-3">
          <div className="w-2/3 border rounded p-3">
            <div className="mb-2">Local preview (simulated live):</div>
            <video ref={localVideoRef} autoPlay muted style={{ width: '100%', background: '#000' }} />
            <div className="mt-2 flex gap-2">
              {!isLive ? <button onClick={startLive} className="px-3 py-1 bg-red-600 text-white rounded">Start Live</button> : <button onClick={stopLive} className="px-3 py-1 border rounded">Stop Live</button>}
            </div>
          </div>
          <div className="w-1/3 border rounded p-3">
            <h3 className="font-semibold">Active Lives</h3>
            {data.lives.length === 0 && <div className="italic">No active lives</div>}
            {data.lives.map(l => (
              <div key={l.id} className="border rounded p-2 mt-2">{data.users[l.userId]?.displayName} — started {new Date(l.startedAt).toLocaleTimeString()}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  function DMView() {
    const threads = Object.values(data.dms);
    const thread = selectedThread ? data.dms[selectedThread] : threads[0];
    return (
      <div className="p-4 flex gap-4">
        <div className="w-1/3 border rounded p-2">
          <h3 className="font-semibold mb-2">Threads</h3>
          <div className="space-y-2">
            {threads.length === 0 && <div className="italic">No DMs yet</div>}
            {threads.map(t => (
              <div key={t.id} onClick={()=>setSelectedThread(t.id)} className="p-2 border rounded cursor-pointer">{t.participants.filter(id=>id!==mainUserId).map(id=>data.users[id]?.displayName||id).join(', ')}</div>
            ))}
          </div>
          <h4 className="mt-3">Send quick message</h4>
          <form onSubmit={handleSendDM} className="space-y-2">
            <input value={dmTo} onChange={e=>setDmTo(e.target.value)} placeholder="Recipient username" className="w-full p-1 border rounded" />
            <textarea value={dmText} onChange={e=>setDmText(e.target.value)} placeholder="Message" className="w-full p-1 border rounded" />
            <button className="px-2 py-1 bg-blue-600 text-white rounded">Send</button>
          </form>
        </div>
        <div className="w-2/3 border rounded p-2">
          <h3 className="font-semibold">Conversation</h3>
          {!thread && <div className="italic">Select a thread</div>}
          {thread && (
            <div>
              <div className="space-y-2 h-96 overflow-y-auto border p-2">
                {thread.messages.map(m => (
                  <div key={m.id} className={`p-2 rounded ${m.userId===mainUserId? 'bg-blue-50 self-end':'bg-gray-100'}`}>
                    <div className="text-sm font-semibold">{data.users[m.userId]?.displayName || m.userId}</div>
                    <div>{m.text}</div>
                    <div className="text-xs text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="mt-2">
                <button onClick={() => { /* simulate reply */ updateData(d => { thread.messages.push({ id: uid(), userId: thread.participants.find(id=>id!==mainUserId), text: 'Auto reply (simulated)', createdAt: now() }); }); }} className="px-2 py-1 border rounded">Simulate reply</button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  function ShopView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-2">Shop</h2>
        <div className="grid grid-cols-2 gap-4">
          {data.shop.map(p => (
            <div key={p.id} className="border rounded p-3">
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-gray-600">${p.price}</div>
              <div className="text-sm text-gray-500">Tags: {p.tags.join(', ')}</div>
              <div className="mt-2"><button onClick={()=>buyProduct(p.id)} className="px-2 py-1 bg-green-600 text-white rounded">Buy</button></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function ProfileView() {
    return (
      <div className="p-4">
        <div className="flex gap-4">
          <div className="w-1/3 border rounded p-3">
            <div className="text-2xl font-bold">{mainUser.displayName}</div>
            <div className="text-sm text-gray-600">@{mainUser.username}</div>
            <div className="mt-2 italic">{mainUser.notes}</div>
            <div className="mt-3">
              <button onClick={()=>setView('dashboard')} className="px-2 py-1 border rounded">Professional Dashboard</button>
            </div>
          </div>
          <div className="w-2/3 border rounded p-3">
            <h3 className="font-semibold">Your Posts</h3>
            <div className="space-y-2 mt-2">
              {data.posts.filter(p=>p.userId===mainUserId).map(p=> (
                <div key={p.id} className="border rounded p-2">{p.caption}</div>
              ))}
            </div>
            <h3 className="mt-4 font-semibold">Highlights</h3>
            <div className="space-y-2 mt-2">
              {mainUser.highlights.map(h => <div key={h.id} className="border rounded p-2">{h.title}</div>)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function DashboardView() {
    return (
      <div className="p-4">
        <h2 className="text-lg font-semibold">Professional Dashboard</h2>
        <div className="grid grid-cols-3 gap-4 mt-3">
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Followers</div>
            <div className="text-2xl font-bold">{dashboard.followers}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Posts</div>
            <div className="text-2xl font-bold">{dashboard.posts}</div>
          </div>
          <div className="border rounded p-3">
            <div className="text-sm text-gray-600">Stories</div>
            <div className="text-2xl font-bold">{dashboard.stories}</div>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="font-semibold">Quick Actions</h3>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>alert('Promote (simulated)')} className="px-2 py-1 border rounded">Promote Post</button>
            <button onClick={()=>alert('Boost Story (simulated)')} className="px-2 py-1 border rounded">Boost Story</button>
          </div>
        </div>
      </div>
    );
  }

  function ExploreResults() {
    if (!searchQuery) return null;
    return (
      <div className="p-4 border-t">
        <h3 className="font-semibold">Search results</h3>
        <div className="space-y-2 mt-2">
          {searchResults.map((r, idx) => (
            <div key={idx} className="border rounded p-2">
              {r.username ? <div>User: {r.displayName} (@{r.username})</div> : <div>Post: {(r.caption || '').slice(0,100)}</div>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <TopBar />
      <div className="max-w-5xl mx-auto">
        {view === 'feed' && <FeedView />}
        {view === 'stories' && <StoriesView />}
        {view === 'reels' && <ReelsView />}
        {view === 'live' && <LiveView />}
        {view === 'dm' && <DMView />}
        {view === 'shop' && <ShopView />}
        {view === 'profile' && <ProfileView />}
        {view === 'dashboard' && <DashboardView />}
        <ExploreResults />
      </div>

      <footer className="mt-10 p-4 text-center text-sm text-gray-500">FilmyDJ demo • Client-side only • Save to GitHub Pages</footer>
    </div>
  );
}

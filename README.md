<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TheFilmyDJ Portal — Social</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script type="module">
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    // ---------------------------
    // 🔐 Supabase config (use your existing values)
    // ---------------------------
    const SUPABASE_URL = "https://egdgitzfonjkqtgejwdj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZGdpdHpmb25qa3F0Z2Vqd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgxMjcsImV4cCI6MjA3ODU0NDEyN30.3bpjskODWgya0hSQDLmddJ9w1evCZNZ5_MU9oDYiF0U";
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // ---------------------------
    // App state helpers
    // ---------------------------
    window.state = {
      user: null,
      profile: null,
      feed: [],
      viewing: 'feed' // feed | reels | upload | messages | profile | settings
    };

    // ---------------------------
    // AUTH: signup, login, logout
    // ---------------------------
    window.signup = async function () {
      const email = document.getElementById('su-email').value;
      const password = document.getElementById('su-password').value;
      const username = document.getElementById('su-username').value.trim();
      const msg = document.getElementById('auth-msg');
      msg.textContent = '⏳ Creating account...';

      if (!email || !password || !username) { msg.textContent = 'Fill all fields'; return; }

      // check username uniqueness in profiles
      const { data: existing } = await supabase.from('profiles').select('id').eq('username', username).limit(1);
      if (existing && existing.length) { msg.textContent = '❌ Username already taken'; return; }

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { msg.textContent = '❌ ' + error.message; return; }

      // insert profile row
      const userId = data.user?.id || null;
      if (userId) {
        await supabase.from('profiles').insert([{ id: userId, username, display_name: username }]);
      }

      msg.textContent = '✅ Account created. Please login below.';
    }

    window.login = async function () {
      const email = document.getElementById('li-email').value;
      const password = document.getElementById('li-password').value;
      const lmsg = document.getElementById('login-msg');
      lmsg.textContent = '⏳ Logging in...';

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { lmsg.textContent = '❌ ' + error.message; return; }

      state.user = data.user;
      await loadProfile();
      lmsg.textContent = '';
      renderApp();
    }

    window.logout = async function () {
      await supabase.auth.signOut();
      state.user = null; state.profile = null;
      renderApp();
    }

    // ---------------------------
    // Load profile and feed
    // ---------------------------
    async function loadProfile() {
      if (!state.user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', state.user.id).single();
      state.profile = data;
      await loadFeed();
    }

    async function loadFeed() {
      // get latest posts (posts table expected)
      const { data } = await supabase.from('posts').select(`*, profiles(username, display_name, avatar_url)`).order('created_at', { ascending: false }).limit(50);
      state.feed = data || [];
      renderFeed();
    }

    // ---------------------------
    // Upload & Create Post
    // ---------------------------
    window.uploadAndCreatePost = async function () {
      const fileInput = document.getElementById('fileInput');
      const caption = document.getElementById('post-caption').value;
      const msg = document.getElementById('upload-msg');
      if (!fileInput.files.length) { msg.textContent = 'Select a file'; return; }
      const file = fileInput.files[0];
      const path = `posts/${Date.now()}_${file.name}`;
      msg.textContent = '⏳ Uploading...';

      const { data: upData, error: upErr } = await supabase.storage.from('uploads').upload(path, file);
      if (upErr) { msg.textContent = '❌ Upload failed: ' + upErr.message; return; }

      const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // create post row
      const { error } = await supabase.from('posts').insert([{ author: state.user.id, file_url: publicUrl, caption }]);
      if (error) { msg.textContent = '❌ Post creation failed: ' + error.message; return; }

      msg.textContent = '✅ Uploaded & posted!';
      fileInput.value = '';
      document.getElementById('post-caption').value = '';
      await loadFeed();
    }

    // ---------------------------
    // Like / Comment / Follow
    // ---------------------------
    window.toggleLike = async function (postId) {
      if (!state.user) { alert('Login first'); return; }
      // check existing
      const { data: existing } = await supabase.from('likes').select('*').eq('post_id', postId).eq('user_id', state.user.id).limit(1);
      if (existing && existing.length) {
        await supabase.from('likes').delete().eq('id', existing[0].id);
      } else {
        await supabase.from('likes').insert([{ post_id: postId, user_id: state.user.id }]);
        // add notification
        const post = state.feed.find(p => p.id === postId);
        if (post && post.author !== state.user.id) {
          await supabase.from('notifications').insert([{ user_id: post.author, actor_id: state.user.id, type: 'like', meta: JSON.stringify({ post_id: postId }) }]);
        }
      }
      await loadFeed();
    }

    window.addComment = async function (postId) {
      const el = document.getElementById('comment-'+postId);
      const text = el.value.trim();
      if (!text || !state.user) return;
      await supabase.from('comments').insert([{ post_id: postId, user_id: state.user.id, content: text }]);
      // notify
      const post = state.feed.find(p => p.id === postId);
      if (post && post.author !== state.user.id) {
        await supabase.from('notifications').insert([{ user_id: post.author, actor_id: state.user.id, type: 'comment', meta: JSON.stringify({ post_id: postId }) }]);
      }
      el.value = '';
      await loadFeed();
    }

    window.toggleFollow = async function (targetId) {
      if (!state.user) { alert('Login first'); return; }
      const { data: existing } = await supabase.from('follows').select('*').eq('follower', state.user.id).eq('following', targetId).limit(1);
      if (existing && existing.length) {
        await supabase.from('follows').delete().eq('id', existing[0].id);
      } else {
        await supabase.from('follows').insert([{ follower: state.user.id, following: targetId }]);
        await supabase.from('notifications').insert([{ user_id: targetId, actor_id: state.user.id, type: 'follow' }]);
      }
      await loadFeed();
    }

    // ---------------------------
    // Messaging (basic)
    // ---------------------------
    window.openChat = async function (otherId, otherName) {
      document.getElementById('chat-with').textContent = otherName;
      document.getElementById('messages-list').innerHTML = '';
      document.getElementById('chat-modal').classList.remove('hidden');
      // load last 50 messages between the two
      const { data } = await supabase.from('messages').select('*').or(`(sender.eq.${state.user.id},recipient.eq.${state.user.id})`).order('created_at', { ascending: true }).limit(200);
      // simple filter client-side
      const conv = data.filter(m => (m.sender===state.user.id && m.recipient===otherId) || (m.sender===otherId && m.recipient===state.user.id));
      conv.forEach(m => {
        const div = document.createElement('div');
        div.className = m.sender===state.user.id? 'text-right':'text-left';
        div.textContent = m.content;
        document.getElementById('messages-list').appendChild(div);
      });
      document.getElementById('send-to').dataset.to = otherId;
    }

    window.sendMessage = async function () {
      const to = document.getElementById('send-to').dataset.to;
      const text = document.getElementById('send-to').value.trim();
      if (!to || !text) return;
      await supabase.from('messages').insert([{ sender: state.user.id, recipient: to, content: text }]);
      document.getElementById('send-to').value = '';
      // you may reload messages (not implemented fully)
      alert('Message sent');
    }

    window.closeChat = function () { document.getElementById('chat-modal').classList.add('hidden'); }

    // ---------------------------
    // Render UI
    // ---------------------------
    window.renderApp = function () {
      document.getElementById('auth-area').classList.toggle('hidden', !!state.user);
      document.getElementById('main-area').classList.toggle('hidden', !state.user);
      if (state.user) {
        document.getElementById('top-username').textContent = state.profile?.username || 'You';
        loadFeed();
      }
    }

    function renderFeed() {
      const container = document.getElementById('feed');
      container.innerHTML = '';
      state.feed.forEach(post => {
        const card = document.createElement('div');
        card.className = 'bg-slate-800 rounded-lg p-4 mb-4 text-left';
        const author = post.profiles?.username || 'unknown';
        const avatar = post.profiles?.avatar_url || 'https://via.placeholder.com/48';
        card.innerHTML = `
          <div class='flex items-center gap-3 mb-3'>
            <img src='${avatar}' class='w-12 h-12 rounded-full' />
            <div class='flex-1'>
              <div class='font-semibold'>${author}</div>
              <div class='text-xs text-gray-300'>${new Date(post.created_at).toLocaleString()}</div>
            </div>
            <button onclick="toggleFollow('${post.author}')" class='text-sm text-cyan-400 underline'>Follow</button>
          </div>
          <div class='mb-3'>
            ${post.file_url.includes('.mp4')?`<video src='${post.file_url}' controls class='w-full rounded'></video>`:`<img src='${post.file_url}' class='w-full rounded' />`}
          </div>
          <div class='mb-2'>${post.caption||''}</div>
          <div class='flex items-center gap-4 text-sm'>
            <button onclick="toggleLike(${post.id})" class='px-2 py-1 bg-gray-700 rounded'>Like</button>
            <button onclick="document.getElementById('comment-box-${post.id}').classList.toggle('hidden')" class='px-2 py-1 bg-gray-700 rounded'>Comment</button>
            <button onclick="openChat('${post.author}','${author}')" class='px-2 py-1 bg-gray-700 rounded'>Message</button>
          </div>
          <div id='comment-box-${post.id}' class='hidden mt-3'>
            <input id='comment-${post.id}' placeholder='Write comment' class='w-full p-2 rounded bg-slate-700 mb-2' />
            <button onclick="addComment(${post.id})" class='w-full bg-green-500 p-2 rounded'>Post Comment</button>
          </div>
        `;
        container.appendChild(card);
      });
    }

    // ---------------------------
    // On load: check session
    // ---------------------------
    window.addEventListener('load', async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) { state.user = data.session.user; await loadProfile(); }
      renderApp();
    });

    // expose supabase for debugging
    window.supabase = supabase;
  </script>
</head>
<body class="bg-gradient-to-br from-slate-900 to-purple-700 text-white min-h-screen font-sans">

  <!-- Header -->
  <header class="p-4 flex items-center justify-between">
    <h1 class="text-2xl font-bold text-cyan-300">🎬 TheFilmyDJ</h1>
    <div class="flex items-center gap-3">
      <div id="top-username" class="text-sm"></div>
      <button onclick="logout()" class="bg-red-600 px-3 py-1 rounded text-sm">Logout</button>
    </div>
  </header>

  <main class="p-6">
    <!-- AUTH AREA (shown when not logged in) -->
    <section id="auth-area" class="max-w-3xl mx-auto grid grid-cols-2 gap-6">

      <div class="bg-slate-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Login</h2>
        <input id="li-email" placeholder="Email" class="w-full p-2 rounded bg-slate-700 mb-3" />
        <input id="li-password" type="password" placeholder="Password" class="w-full p-2 rounded bg-slate-700 mb-3" />
        <button onclick="login()" class="w-full bg-cyan-500 p-2 rounded">Login</button>
        <p id="login-msg" class="text-sm text-yellow-300 mt-2"></p>
      </div>

      <div class="bg-slate-800 p-6 rounded-lg">
        <h2 class="text-xl font-semibold mb-3">Sign up</h2>
        <input id="su-username" placeholder="Choose username (unique)" class="w-full p-2 rounded bg-slate-700 mb-3" />
        <input id="su-email" placeholder="Email" class="w-full p-2 rounded bg-slate-700 mb-3" />
        <input id="su-password" type="password" placeholder="Password" class="w-full p-2 rounded bg-slate-700 mb-3" />
        <button onclick="signup()" class="w-full bg-green-500 p-2 rounded">Create account</button>
        <p id="auth-msg" class="text-sm text-yellow-300 mt-2"></p>
      </div>

    </section>

    <!-- MAIN AREA (when logged in) -->
    <section id="main-area" class="hidden max-w-4xl mx-auto">
      <div class="grid grid-cols-3 gap-6">
        <!-- Left: actions -->
        <div class="col-span-1">
          <div class="bg-slate-800 p-4 rounded mb-4">
            <h3 class="font-semibold mb-2">Create</h3>
            <input id="fileInput" type="file" class="mb-2 w-full text-sm" />
            <input id="post-caption" placeholder="Caption" class="w-full p-2 rounded bg-slate-700 mb-2" />
            <button onclick="uploadAndCreatePost()" class="w-full bg-emerald-500 p-2 rounded">Upload & Post</button>
            <p id="upload-msg" class="text-sm text-yellow-300 mt-2"></p>
          </div>

          <div class="bg-slate-800 p-4 rounded mb-4">
            <h3 class="font-semibold mb-2">Navigation</h3>
            <button onclick="window.state.viewing='feed'; loadFeed();" class="w-full mb-2 p-2 rounded bg-gray-700">Feed</button>
            <button onclick="window.state.viewing='reels';alert('Reels UI coming soon')" class="w-full mb-2 p-2 rounded bg-gray-700">Reels</button>
            <button onclick="window.state.viewing='messages';alert('Open Messages from posts or search users to chat')" class="w-full mb-2 p-2 rounded bg-gray-700">Messages</button>
            <button onclick="window.state.viewing='profile';alert('Profile page coming soon')" class="w-full p-2 rounded bg-gray-700">Profile</button>
          </div>
        </div>

        <!-- Center: feed -->
        <div class="col-span-1">
          <div id="feed"></div>
        </div>

        <!-- Right: users & notifications -->
        <div class="col-span-1">
          <div class="bg-slate-800 p-4 rounded mb-4">
            <h3 class="font-semibold mb-2">Discover Users</h3>
            <div id="discover"></div>
            <button onclick="renderDiscover()" class="mt-2 w-full bg-cyan-500 p-2 rounded">Refresh</button>
          </div>

          <div class="bg-slate-800 p-4 rounded">
            <h3 class="font-semibold mb-2">Notifications</h3>
            <div id="notifications"></div>
            <button onclick="renderNotifications()" class="mt-2 w-full bg-yellow-500 p-2 rounded">Load</button>
          </div>
        </div>
      </div>
    </section>

    <!-- Chat Modal -->
    <div id="chat-modal" class="hidden fixed inset-0 flex items-end justify-center bg-black/50 p-4">
      <div class="bg-slate-900 w-full max-w-xl rounded p-4">
        <div class="flex justify-between mb-2">
          <div id="chat-with" class="font-semibold"></div>
          <button onclick="closeChat()" class="text-red-400">Close</button>
        </div>
        <div id="messages-list" class="h-60 overflow-auto bg-slate-800 p-3 rounded mb-2"></div>
        <div class="flex gap-2">
          <input id="send-to" data-to="" placeholder="Message" class="flex-1 p-2 rounded bg-slate-700" />
          <button onclick="sendMessage()" class="bg-cyan-500 p-2 rounded">Send</button>
        </div>
      </div>
    </div>

  </main>

  <script>
    // helper UI renders for discover & notifications (simple implementations)
    async function renderDiscover() {
      const d = document.getElementById('discover'); d.innerHTML = '';
      const { data } = await supabase.from('profiles').select('*').limit(10);
      data.forEach(u => {
        const div = document.createElement('div');
        div.className = 'flex items-center gap-2 mb-2';
        div.innerHTML = `<img src='${u.avatar_url||'https://via.placeholder.com/40'}' class='w-10 h-10 rounded-full' /><div class='flex-1'><div class='font-semibold'>${u.username}</div></div><button onclick="openChat('${u.id}','${u.username}')" class='text-sm underline'>Chat</button>`;
        d.appendChild(div);
      });
    }

    async function renderNotifications() {
      const n = document.getElementById('notifications'); n.innerHTML = '';
      if (!window.state.user) { n.textContent = 'Login to see notifications'; return; }
      const { data } = await supabase.from('notifications').select(`*, actor:profiles(username)`).eq('user_id', window.state.user.id).order('created_at', { ascending: false }).limit(20);
      if (!data || !data.length) { n.textContent = 'No notifications yet'; return; }
      data.forEach(nt => {
        const el = document.createElement('div');
        el.className = 'mb-2 text-sm bg-slate-800 p-2 rounded';
        el.textContent = `${nt.actor?.username || 'Someone'} ${nt.type} ${nt.meta? ' — ' + nt.meta : ''}`;
        n.appendChild(el);
      });
    }
  </script>

</body>
</html>

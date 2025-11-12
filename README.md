**<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>thefilmydj_ — Mini Insta (Supabase)</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;500;700&display=swap" rel="stylesheet">
<style>
  :root{
    --bg:#fafafa; --card:#fff; --muted:#777; --accent:#ff0066;
    --accent2:#0095f6; --radius:12px;
  }
  *{box-sizing:border-box}
  body{font-family:Inter, Arial, sans-serif;background:linear-gradient(180deg,#fff,#f7fbff);margin:0;color:#111}
  header{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:rgba(255,255,255,0.8);position:sticky;top:0;backdrop-filter:blur(4px);z-index:10}
  .brand{display:flex;align-items:center;gap:10px}
  .logo{width:42px;height:42px;border-radius:10px;background:linear-gradient(135deg,#ff9a9e,#fad0c4);display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700}
  nav{display:flex;gap:8px;align-items:center}
  .btn{padding:8px 12px;border-radius:10px;border:0;background:var(--accent2);color:#fff;cursor:pointer;font-weight:600}
  .ghost{background:transparent;color:var(--accent2);border:1px solid rgba(0,0,0,0.06)}
  main{max-width:1100px;margin:18px auto;display:grid;grid-template-columns:1fr 320px;gap:18px;padding:0 16px}
  .card{background:var(--card);border-radius:var(--radius);padding:12px;border:1px solid #eee}
  .uploader{display:flex;flex-direction:column;gap:8px;align-items:center;padding:10px;border-radius:10px;border:1px dashed #e2e8f0}
  .upload-preview{width:100%;max-height:420px;object-fit:cover;border-radius:8px}
  .feed{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
  .post{background:var(--card);border-radius:10px;padding:10px;border:1px solid #eee}
  .post video, .post img{width:100%;border-radius:8px}
  .profile-box{display:flex;align-items:center;gap:12px}
  .avatar{width:72px;height:72px;border-radius:14px;background:#ddd;overflow:hidden}
  .avatar img{width:100%;height:100%;object-fit:cover}
  .small{font-size:13px;color:var(--muted)}
  .muted{color:var(--muted)}
  footer{max-width:1100px;margin:12px auto;text-align:center;color:var(--muted)}
  .grid-sm{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  .search{display:flex;gap:8px;align-items:center}
  input[type="text"],input[type="email"],input[type="password"]{padding:8px;border-radius:8px;border:1px solid #ddd}
  .pill{padding:6px 10px;border-radius:999px;background:#f1f5f9;border:1px solid #eee;cursor:pointer}
  .tabs{display:flex;gap:8px}
  .hidden{display:none}
  .like-btn{background:transparent;border:0;color:crimson;cursor:pointer;font-weight:700}
  .top-actions{display:flex;gap:8px;align-items:center}
  .accent{color:var(--accent)}
  /* colorful themes - simple */
  .theme-1 header{background:linear-gradient(90deg,#ff9a9e,#fad0c4)}
  .theme-2 header{background:linear-gradient(90deg,#a18cd1,#fbc2eb)}
  .theme-3 header{background:linear-gradient(90deg,#43cea2,#185a9d);color:#fff}
  @media(max-width:900px){
    main{grid-template-columns:1fr}
  }
</style>
</head>
<body class="theme-1">

<header>
  <div class="brand">
    <div class="logo">FD</div>
    <div>
      <div style="font-weight:700">thefilmydj_</div>
      <div class="small">Reels • Uploads • Community</div>
    </div>
  </div>

  <nav>
    <div class="search">
      <input id="searchInput" placeholder="Search username or caption" type="text" />
      <button class="pill" id="searchBtn">Search</button>
    </div>
    <div class="tabs" style="margin-left:10px">
      <button class="pill" onclick="showTab('home')">Home</button>
      <button class="pill" onclick="showTab('reels')">Reels</button>
      <button class="pill" onclick="showTab('profile')">Profile</button>
    </div>
    <div class="top-actions">
      <div id="who" class="small muted"></div>
      <button id="loginBtn" class="btn ghost">Login</button>
      <button id="signupBtn" class="btn">Sign up</button>
    </div>
  </nav>
</header>

<main>
  <!-- LEFT: main content -->
  <div>
    <!-- HOME TAB -->
    <section id="homeTab" class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h3 style="margin:0">Home</h3>
        <div class="small muted">Share reels, photos, songs</div>
      </div>

      <div class="card uploader" style="margin-top:12px">
        <div class="small muted">Choose image/video (≤ 10 MB). Optional: attach song name.</div>
        <input id="fileInput" type="file" accept="image/*,video/*" />
        <input id="caption" placeholder="Caption..." type="text" style="width:100%"/>
        <input id="song" placeholder="Attach song name (optional)" type="text" style="width:100%"/>
        <div style="display:flex;gap:8px">
          <button class="btn" id="uploadBtn">+ New Reel / Post</button>
          <button class="btn ghost" id="clearBtn">Clear</button>
        </div>
        <div style="width:100%;margin-top:8px">
          <img id="imgPreview" class="upload-preview hidden" alt="img preview">
          <video id="videoPreview" class="upload-preview hidden" controls></video>
        </div>
      </div>

      <div style="margin-top:12px">
        <h4>Feed</h4>
        <div id="feed" class="feed"></div>
      </div>
    </section>

    <!-- REELS TAB -->
    <section id="reelsTab" class="card hidden" style="margin-top:12px">
      <h3>Reels</h3>
      <div id="reels" class="grid-sm"></div>
    </section>

    <!-- PROFILE TAB -->
    <section id="profileTab" class="card hidden" style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div class="profile-box">
          <div class="avatar" id="myAvatar"><img id="avatarImg" src="" alt="avatar" onerror="this.src='https://via.placeholder.com/150'"></div>
          <div>
            <div id="profileName" style="font-weight:700">@thefilmydj_</div>
            <div class="small muted" id="profileMeta">0 posts • 0 followers</div>
          </div>
        </div>
        <div>
          <button class="btn" id="editProfileBtn">Edit Profile</button>
          <button class="btn ghost" id="logoutBtn">Logout</button>
        </div>
      </div>

      <div style="margin-top:12px">
        <h4>My Posts</h4>
        <div id="myPosts" class="feed"></div>
      </div>
    </section>
  </div>

  <!-- RIGHT: sidebar -->
  <aside>
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div><strong>Quick</strong><div class="small muted">Tools & settings</div></div>
        <div>
          <button class="pill" onclick="themePick(1)">🎨</button>
          <button class="pill" onclick="themePick(2)">🌈</button>
          <button class="pill" onclick="themePick(3)">🌃</button>
        </div>
      </div>

      <div style="margin-top:12px">
        <input id="displayName" placeholder="Display name" type="text" style="width:100%;margin-bottom:8px"/>
        <label class="small muted">Search users</label>
        <div style="display:flex;gap:6px;margin-top:8px">
          <input id="userSearch" placeholder="username" type="text"/>
          <button class="pill" id="userSearchBtn">Go</button>
        </div>
        <div style="margin-top:10px">
          <h5 class="small muted">Song list (sample)</h5>
          <div id="songList" style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
            <button class="pill songOpt">Song: Beat 1</button>
            <button class="pill songOpt">Song: Beat 2</button>
            <button class="pill songOpt">Song: Dance Loop</button>
            <button class="pill songOpt">Song: Chill Mix</button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <h4>Messages</h4>
      <div id="msgList" class="small muted">No messages yet</div>
      <div style="margin-top:8px">
        <input id="msgTo" placeholder="To (username)" type="text"/><br/><br/>
        <input id="msgText" placeholder="Message..." type="text"/><br/><br/>
        <button class="btn" id="sendMsgBtn">Send</button>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <h4>Followers</h4>
      <div id="followersPanel" class="small muted">—</div>
    </div>
  </aside>
</main>

<footer>Built for <strong>thefilmydj_</strong> — demo uses Supabase. Make keys & rules secure when going production.</footer>

<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js"></script>
<script>
/* ==========  IMPORTANT: PUT YOUR SUPABASE KEYS HERE  ========== */
const SUPABASE_URL = "**https://YOUR-PROJECT.supabase.co**";
const SUPABASE_ANON_KEY = "**YOUR-ANON-KEY**";
/* ============================================================ */

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ---------- UI helpers ---------- */
const who = document.getElementById('who');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');

function showTab(t){
  ['home','reels','profile'].forEach(x=>{
    document.getElementById(x + 'Tab').classList.toggle('hidden', x!==t);
  });
}
function themePick(n){
  document.body.classList.remove('theme-1','theme-2','theme-3');
  document.body.classList.add('theme-' + n);
}

/* ---------- Auth UI ---------- */
async function updateAuthUI(){
  const { data: { user } } = await supabase.auth.getUser();
  if(user){
    who.textContent = user.email;
    loginBtn.classList.add('hidden'); signupBtn.classList.add('hidden');
    document.getElementById('who').style.color = '#333';
    document.getElementById('displayName').value = localStorage.getItem('displayName') || 'thefilmydj_';
  } else {
    who.textContent = '(not logged in)';
    loginBtn.classList.remove('hidden'); signupBtn.classList.remove('hidden');
  }
}
updateAuthUI();

/* Signup/Login handlers (simple email/password) */
signupBtn.onclick = async ()=>{
  const email = prompt('Enter email for signup (test):');
  const pass = prompt('Enter password (min 6 chars):');
  if(!email || !pass) return;
  const { data, error } = await supabase.auth.signUp({ email, password: pass });
  if(error) return alert(error.message);
  alert('Signed up — check email if confirm required. Now login.');
};

loginBtn.onclick = async ()=>{
  const email = prompt('Email:');
  const pass = prompt('Password:');
  if(!email||!pass) return;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if(error) return alert(error.message);
  await onAuthChange();
};

document.addEventListener('click', async(e)=>{
  if(e.target && e.target.id === 'logoutBtn'){
    await supabase.auth.signOut(); location.reload();
  }
});

/* Listen to auth changes */
supabase.auth.onAuthStateChange((event)=>onAuthChange());

async function onAuthChange(){
  const { data:{ user } } = await supabase.auth.getUser();
  if(user){
    who.textContent = user.email;
    document.getElementById('displayName').value = (await loadProfileName(user.id)) || 'thefilmydj_';
  } else {
    who.textContent = '(not logged in)';
  }
  loadFeed(); loadMyPosts(); loadFollowersPanel(); loadMessages();
}

/* ---------- PROFILE helpers ---------- */
async function loadProfileName(uid){
  if(!uid) return null;
  const { data } = await supabase.from('profiles').select('display_name').eq('id', uid).single();
  return data?.display_name || null;
}

/* ---------- UPLOAD preview & limit ---------- */
const fileInput = document.getElementById('fileInput');
const imgPreview = document.getElementById('imgPreview');
const videoPreview = document.getElementById('videoPreview');
const uploadBtn = document.getElementById('uploadBtn');
const clearBtn = document.getElementById('clearBtn');

let currentBlob = null;
fileInput.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) { clearPreview(); return; }
  if(f.size > 10 * 1024 * 1024){ alert('File too large — max 10 MB'); fileInput.value=''; return; }
  if(currentBlob){ URL.revokeObjectURL(currentBlob); currentBlob = null; }
  currentBlob = URL.createObjectURL(f);
  if(f.type.startsWith('image/')){ videoPreview.classList.add('hidden'); imgPreview.src = currentBlob; imgPreview.classList.remove('hidden'); }
  else if(f.type.startsWith('video/')){ imgPreview.classList.add('hidden'); videoPreview.src = currentBlob; videoPreview.classList.remove('hidden'); }
  else { alert('Unsupported file type'); clearPreview(); }
});

function clearPreview(){
  fileInput.value=''; imgPreview.src=''; videoPreview.src=''; imgPreview.classList.add('hidden'); videoPreview.classList.add('hidden');
  if(currentBlob){ URL.revokeObjectURL(currentBlob); currentBlob=null; }
}

/* ---------- Auto Upload on File Choose ---------- */
fileInput.addEventListener('change', async (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  if(f.size > 10 * 1024 * 1024) return alert('File too large — max 10 MB');

  const { data: { session } } = await supabase.auth.getSession();
  if(!session) return alert('Login first to upload');

  const user = session.user;
  const uname = document.getElementById('displayName').value || 'thefilmydj_';
  const caption = document.getElementById('caption').value || '';
  const song = document.getElementById('song').value || '';

  alert('Uploading file... Please wait ⏳');

  // unique path तयार करा
  const ext = f.name.split('.').pop();
  const fname = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${fname}`;

  // upload करा
  const { error: upErr } = await supabase.storage.from('uploads').upload(path, f, {
    cacheControl: '3600',
    upsert: false
  });
  if(upErr) return alert('Upload failed: ' + upErr.message);

  // public URL घ्या
  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
  const file_url = urlData.publicUrl;
  const type = f.type.startsWith('video/') ? 'video' : 'image';

  // post insert करा
  const { error: insertErr } = await supabase.from('posts').insert([
    { user_id: user.id, username: uname, file_url, type, song, caption }
  ]);
  if(insertErr) return alert('DB insert failed: ' + insertErr.message);

  clearPreview();
  document.getElementById('caption').value='';
  document.getElementById('song').value='';
  loadFeed(); loadMyPosts();

  alert('✅ Uploaded successfully!');
});


/* ---------- Load feed ---------- */
async function loadFeed(){
  const feedEl = document.getElementById('feed');
  feedEl.innerHTML = '<div class="small muted">Loading...</div>';
  const { data, error } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(100);
  if(error) { feedEl.innerHTML = '<div class="small muted">Error loading feed</div>'; console.error(error); return; }
  if(!data || data.length===0){ feedEl.innerHTML = '<div class="small muted">No posts yet</div>'; return; }

  feedEl.innerHTML = '';
  data.forEach(p=>{
    const div = document.createElement('div'); div.className='post';
    const meta = document.createElement('div'); meta.style.display='flex'; meta.style.justifyContent='space-between';
    meta.innerHTML = `<div style="font-weight:700">@${p.username}</div><div class="small muted">${new Date(p.created_at).toLocaleString()}</div>`;
    div.appendChild(meta);
    if(p.type==='video'){ const v=document.createElement('video'); v.src=p.file_url; v.controls=true; div.appendChild(v); }
    else { const im=document.createElement('img'); im.src=p.file_url; div.appendChild(im); }
    if(p.song) { const s=document.createElement('div'); s.className='small muted'; s.textContent='🎵 ' + p.song; div.appendChild(s); }
    if(p.caption){ const c=document.createElement('div'); c.style.marginTop='6px'; c.textContent=p.caption; div.appendChild(c); }

    // like + follow + details
    const controls = document.createElement('div'); controls.style.display='flex'; controls.style.gap='8px'; controls.style.marginTop='8px';
    const likeBtn = document.createElement('button'); likeBtn.className='like-btn'; likeBtn.textContent='♡ Like';
    likeBtn.onclick = async ()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if(!user) return alert('Login to like');
      // simple insert to likes table and increment counter (no duplicate check for simplicity)
      await supabase.from('likes').insert([{ post_id: p.id, user_id: user.id }]);
      await supabase.from('posts').update({ likes: p.likes + 1 }).eq('id', p.id);
      loadFeed();
    };
    const followBtn = document.createElement('button'); followBtn.className='pill'; followBtn.textContent='Follow';
    followBtn.onclick = async ()=>{
      const { data:{ user } } = await supabase.auth.getUser();
      if(!user) return alert('Login to follow');
      // insert follower relation
      await supabase.from('followers').insert([{ user_id: p.user_id, follower_id: user.id }]);
      alert('Followed');
      loadFollowersPanel();
    };
    controls.appendChild(likeBtn); controls.appendChild(followBtn);
    div.appendChild(controls);

    feedEl.appendChild(div);
  });

  // reels area
  const reelsEl = document.getElementById('reels');
  if(reelsEl){
    reelsEl.innerHTML = '';
    data.slice(0,6).forEach(p=>{
      if(p.type==='video'){ const tile = document.createElement('video'); tile.muted=true; tile.loop=true; tile.src=p.file_url; tile.style.width='100%'; tile.style.borderRadius='8px'; reelsEl.appendChild(tile); }
      else { const im=document.createElement('img'); im.src=p.file_url; im.style.width='100%'; im.style.borderRadius='8px'; reelsEl.appendChild(im); }
    });
  }
}

/* ---------- My posts ---------- */
async function loadMyPosts(){
  const { data:{ user } } = await supabase.auth.getUser();
  const el = document.getElementById('myPosts'); el.innerHTML = '';
  if(!user) return;
  const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at',{ascending:false});
  if(error) return;
  data.forEach(p=>{
    const div = document.createElement('div'); div.className='post';
    if(p.type==='video'){ const v=document.createElement('video'); v.controls=true; v.src=p.file_url; div.appendChild(v); }
    else { const im = document.createElement('img'); im.src=p.file_url; div.appendChild(im); }
    el.appendChild(div);
  });
}

/* ---------- Search ---------- */
document.getElementById('searchBtn').onclick = async ()=>{
  const q = searchInput.value.trim();
  if(!q) return alert('Type search term');
  // search by username or caption
  const { data, error } = await supabase.from('posts').select('*').ilike('username', `%${q}%`).limit(50);
  const { data: cap, error: e2 } = await supabase.from('posts').select('*').ilike('caption', `%${q}%`).limit(50);
  const results = (data||[]).concat(cap||[]);
  if(results.length===0) return alert('No results');
  // show results in feed temporarily
  const feedEl = document.getElementById('feed'); feedEl.innerHTML = '';
  results.forEach(p=>{
    const div = document.createElement('div'); div.className='post';
    div.innerHTML = `<div style="font-weight:700">@${p.username} • ${new Date(p.created_at).toLocaleString()}</div>`;
    if(p.type==='video'){ const v=document.createElement('video'); v.controls=true; v.src=p.file_url; div.appendChild(v); }
    else { const im=document.createElement('img'); im.src=p.file_url; div.appendChild(im); }
    feedEl.appendChild(div);
  });
};

/* ---------- Followers panel ---------- */
async function loadFollowersPanel(){
  const el = document.getElementById('followersPanel');
  const { data:{ user } } = await supabase.auth.getUser();
  if(!user){ el.textContent='Login to see followers'; return; }
  const { data, error } = await supabase.from('followers').select('follower_id').eq('user_id', user.id);
  if(error) return; el.textContent = (data?.length || 0) + ' followers';
}

/* ---------- Messages ---------- */
document.getElementById('sendMsgBtn').onclick = async ()=>{
  const toU = document.getElementById('msgTo').value.trim();
  const txt = document.getElementById('msgText').value.trim();
  if(!toU || !txt) return alert('Fill to + message');
  // find user by username in profiles table OR use auth.users; for demo we just insert text (requires mapping)
  // simple approach: require entering recipient email instead of username
  alert('Demo send: messages saved locally only (improve by storing recipient id).');
  // store simplified: insert into messages with from_user = current user id, to_user = null
  const { data:{ user } } = await supabase.auth.getUser();
  if(!user) return alert('Login to send');
  await supabase.from('messages').insert([{ from_user: user.id, to_user: user.id, content: txt }]);
  alert('Message saved (demo).'); loadMessages();
};

async function loadMessages(){
  const el = document.getElementById('msgList');
  const { data:{ user } } = await supabase.auth.getUser();
  if(!user){ el.textContent='Login to see messages'; return; }
  const { data, error } = await supabase.from('messages').select('*').or(`from_user.eq.${user.id},to_user.eq.${user.id}`).order('created_at',{ascending:false}).limit(20);
  if(error) return;
  if(!data||data.length===0) { el.textContent='No messages'; return; }
  el.innerHTML = '';
  data.forEach(m=>{ const d=document.createElement('div'); d.textContent = `${new Date(m.created_at).toLocaleString()}: ${m.content}`; el.appendChild(d); });
}

/* ---------- Load initial ---------- */
loadFeed(); loadMyPosts(); loadFollowersPanel(); loadMessages();

</script>
</body>
</html>
**

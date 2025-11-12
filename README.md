<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TheFilmyDJ</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<style>
body {
  font-family: Arial, sans-serif;
  background: #0d0d0d;
  color: #fff;
  margin: 0;
  padding: 0;
  text-align: center;
}
header {
  background: #1a1a1a;
  padding: 10px;
  position: sticky;
  top: 0;
}
input, textarea {
  margin: 5px;
  padding: 8px;
  border-radius: 6px;
  border: none;
  width: 80%;
  max-width: 400px;
}
button {
  background: #ff2e63;
  border: none;
  color: #fff;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
}
button:hover { background: #ff5179; }
#feed, #myPosts {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}
.post {
  background: #1a1a1a;
  padding: 10px;
  border-radius: 10px;
  width: 320px;
}
.post img, .post video {
  width: 100%;
  border-radius: 10px;
}
.hidden { display: none; }
</style>
</head>
<body>

<header>
  <h2>🎬 TheFilmyDJ</h2>
  <div id="authSection">
    <input type="email" id="email" placeholder="Enter email">
    <input type="password" id="password" placeholder="Enter password">
    <button id="loginBtn">Login / Register</button>
    <button id="logoutBtn" class="hidden">Logout</button>
  </div>
</header>

<section id="uploadSection" class="hidden">
  <h3>Upload Photo / Video</h3>
  <input type="file" id="fileInput" accept="image/*,video/*"><br>
  <input type="text" id="displayName" placeholder="Username"><br>
  <input type="text" id="song" placeholder="Song name (optional)"><br>
  <textarea id="caption" placeholder="Write a caption..."></textarea><br>
</section>

<h3>📢 Feed</h3>
<div id="feed">Loading...</div>

<h3>🎥 My Posts</h3>
<div id="myPosts"></div>

<script>
// 🟢 Supabase config
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🟡 Login/Register
document.getElementById('loginBtn').onclick = async ()=>{
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();
  if(!email || !pass) return alert('Enter email & password');

  let { error } = await supabase.auth.signInWithPassword({ email, password: pass });
  if(error){
    // If user not found, sign up
    const { error: signupErr } = await supabase.auth.signUp({ email, password: pass });
    if(signupErr) return alert(signupErr.message);
    alert('✅ Account created! Check your email for verification.');
  } else {
    alert('✅ Logged in!');
  }
  checkAuth();
};

// 🔴 Logout
document.getElementById('logoutBtn').onclick = async ()=>{
  await supabase.auth.signOut();
  checkAuth();
};

// 🟣 Check Auth State
async function checkAuth(){
  const { data:{ user } } = await supabase.auth.getUser();
  const uploadSec = document.getElementById('uploadSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  if(user){
    uploadSec.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    loadFeed(); loadMyPosts();
  } else {
    uploadSec.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    document.getElementById('feed').innerHTML='Login to see feed';
  }
}
checkAuth();

// 📤 Auto Upload on File Choose
document.getElementById('fileInput').addEventListener('change', async (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  if(f.size > 10 * 1024 * 1024) return alert('File too large (max 10MB)');

  const { data:{ user } } = await supabase.auth.getUser();
  if(!user) return alert('Please login first.');

  const uname = document.getElementById('displayName').value || 'thefilmydj_';
  const caption = document.getElementById('caption').value || '';
  const song = document.getElementById('song').value || '';

  alert('Uploading... Please wait ⏳');
  const ext = f.name.split('.').pop();
  const fname = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const path = `uploads/${fname}`;

  const { error: upErr } = await supabase.storage.from('uploads').upload(path, f);
  if(upErr) return alert('Upload failed: ' + upErr.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(path);
  const file_url = urlData.publicUrl;
  const type = f.type.startsWith('video/') ? 'video' : 'image';

  const { error: insertErr } = await supabase.from('posts').insert([
    { user_id: user.id, username: uname, file_url, type, song, caption }
  ]);
  if(insertErr) return alert('Database insert error: ' + insertErr.message);

  alert('✅ Uploaded successfully!');
  document.getElementById('caption').value='';
  document.getElementById('song').value='';
  loadFeed(); loadMyPosts();
});

// 🟢 Load Feed
async function loadFeed(){
  const feedEl = document.getElementById('feed');
  const { data, error } = await supabase.from('posts').select('*').order('created_at',{ascending:false}).limit(30);
  if(error) return feedEl.textContent = 'Error loading feed.';
  feedEl.innerHTML='';
  data.forEach(p=>{
    const div = document.createElement('div');
    div.className='post';
    div.innerHTML = `<div><b>@${p.username}</b> • ${new Date(p.created_at).toLocaleString()}</div>`;
    if(p.type==='video'){
      div.innerHTML += `<video src="${p.file_url}" controls></video>`;
    } else {
      div.innerHTML += `<img src="${p.file_url}">`;
    }
    if(p.caption) div.innerHTML += `<div>${p.caption}</div>`;
    feedEl.appendChild(div);
  });
}

// 🟢 Load My Posts
async function loadMyPosts(){
  const { data:{ user } } = await supabase.auth.getUser();
  const el = document.getElementById('myPosts');
  if(!user){ el.innerHTML='Login to see your posts'; return; }
  const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at',{ascending:false});
  if(error) return el.innerHTML='Error loading posts';
  el.innerHTML='';
  data.forEach(p=>{
    const div = document.createElement('div');
    div.className='post';
    if(p.type==='video') div.innerHTML = `<video src="${p.file_url}" controls></video>`;
    else div.innerHTML = `<img src="${p.file_url}">`;
    el.appendChild(div);
  });
}
</script>

</body>
</html>

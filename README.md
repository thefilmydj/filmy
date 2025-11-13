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
// 🟢 Supabase config (इथे तुझं project URL आणि anon key टाक)
const SUPABASE_URL = "[https://YOUR_PROJECT_ID.supabase.co](https://egdgitzfonjkqtgejwdj.supabase.co)";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZGdpdHpmb25qa3F0Z2Vqd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgxMjcsImV4cCI6MjA3ODU0NDEyN30.3bpjskODWgya0hSQDLmddJ9w1evCZNZ5_MU9oDYiF0U";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🟡 Login / Register
document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value.trim();
  if (!email || !pass) return alert('Enter email & password');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });

  if (error) {
    // जर user नसल्यास - sign up करा
    const { error: signupErr } = await supabase.auth.signUp({ email, password: pass });
    if (signupErr) return alert('Signup error: ' + signupErr.message);
    alert('✅ Account created! Please verify your email.');
  } else {
    alert('✅ Logged in!');
  }

  checkAuth();
};

// 🔴 Logout
document.getElementById('logoutBtn').onclick = async () => {
  await supabase.auth.signOut();
  checkAuth();
};

// 🟣 Check Auth State
async function checkAuth() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const uploadSec = document.getElementById('uploadSection');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (user) {
    uploadSec.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    loginBtn.classList.add('hidden');
    document.getElementById('feed').textContent = 'Loading feed...';
    await loadFeed();
    await loadMyPosts();
  } else {
    uploadSec.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    loginBtn.classList.remove('hidden');
    document.getElementById('feed').textContent = 'Login to see feed.';
    document.getElementById('myPosts').innerHTML = '';
  }
}

// पहिल्यांदा page load झाल्यावर user check करा
checkAuth();

// 📤 Upload when file selected
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 10 * 1024 * 1024) return alert('File too large (max 10MB)');

  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return alert('Please login first.');

  const uname = document.getElementById('displayName').value || 'thefilmydj_';
  const caption = document.getElementById('caption').value || '';
  const song = document.getElementById('song').value || '';

  alert('Uploading... Please wait ⏳');
  const ext = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${ext}`;

  const { error: uploadErr } = await supabase.storage.from('uploads').upload(fileName, file);
  if (uploadErr) return alert('Upload failed: ' + uploadErr.message);

  const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
  const file_url = urlData.publicUrl;
  const type = file.type.startsWith('video/') ? 'video' : 'image';

  const { error: insertErr } = await supabase.from('posts').insert([
    { user_id: user.id, username: uname, file_url, type, song, caption }
  ]);
  if (insertErr) return alert('Database insert error: ' + insertErr.message);

  alert('✅ Uploaded successfully!');
  e.target.value = '';
  document.getElementById('caption').value = '';
  document.getElementById('song').value = '';
  await loadFeed();
  await loadMyPosts();
});

// 🟢 Load Feed
async function loadFeed() {
  const feedEl = document.getElementById('feed');
  const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(30);
  if (error) return (feedEl.textContent = 'Error loading feed: ' + error.message);
  feedEl.innerHTML = '';
  data.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'post';
    div.innerHTML = `<b>@${p.username}</b><br>${new Date(p.created_at).toLocaleString()}<br>`;
    if (p.type === 'video') div.innerHTML += `<video src="${p.file_url}" controls></video>`;
    else div.innerHTML += `<img src="${p.file_url}" alt="post">`;
    if (p.caption) div.innerHTML += `<p>${p.caption}</p>`;
    feedEl.appendChild(div);
  });
}

// 🟢 Load My Posts
async function loadMyPosts() {
  const el = document.getElementById('myPosts');
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;
  if (!user) return (el.innerHTML = 'Login to see your posts.');
  const { data, error } = await supabase.from('posts').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
  if (error) return (el.innerHTML = 'Error loading posts.');
  el.innerHTML = '';
  data.forEach((p) => {
    const div = document.createElement('div');
    div.className = 'post';
    if (p.type === 'video') div.innerHTML = `<video src="${p.file_url}" controls></video>`;
    else div.innerHTML = `<img src="${p.file_url}" alt="my post">`;
    el.appendChild(div);
  });
}
</script>

</body>
</html>

<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>filmydj — Prototype</title>

  <!--
    Single-file filmydj prototype
    - Save as index.html and open in browser
    - Place your final logo image as "logo.png" in same folder to show on header
    - All data stored in localStorage (frontend-only). For production add backend, storage, auth, streaming provider.
  -->

 :root{
  --bg:#0f1724;        /* Background as is (dark modern look) */
  --panel:#0b1220;     /* Same panel, looks good with Insta colors */
  --muted:#cfcfd2;     /* Softer grey for better contrast */

  /* Instagram Gradient Colors */
  --accent1:#f09433;   /* Start: warm orange */
  --accent2:#bc1888;   /* End: deep purple-pink */

  --white:#ffffff;     /* Brighter white for insta style */
  --card:#151d2b;      /* Slightly lighter for cards */
}

    *{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial;}
    html,body{height:100%;margin:0;background:linear-gradient(180deg,#021024 0%, #071428 40%, #081029 100%);color:var(--white);-webkit-font-smoothing:antialiased}
    .app{max-width:1100px;margin:18px auto;padding:12px;display:grid;grid-template-columns:1fr 340px;gap:18px;}

    header{display:flex;align-items:center;gap:12px;padding:12px;border-radius:12px;background:linear-gradient(90deg,var(--accent1),var(--accent2));box-shadow:0 6px 24px rgba(0,0,0,.5);margin-bottom:12px;}
    .logo-wrap{display:flex;align-items:center;gap:10px}
    .logo{width:56px;height:56px;border-radius:12px;object-fit:cover;border:3px solid rgba(255,255,255,.12);background:#111}
    .app-title{font-weight:800;font-size:20px;letter-spacing:0.6px}
    .search{flex:1}
    .search input{width:100%;padding:10px 12px;border-radius:10px;border:0;background:rgba(255,255,255,0.06);color:var(--white)}

    /* left column */
    .left-col{display:flex;flex-direction:column;gap:12px}
    .card{background:linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));padding:12px;border-radius:12px;border:1px solid rgba(255,255,255,0.04);box-shadow:0 4px 20px rgba(2,6,23,.6)}
    .stories{display:flex;gap:12px;overflow:auto;padding:6px}
    .story{width:82px;height:82px;border-radius:50%;flex-shrink:0;border:3px solid radial-gradient(circle at 30% 20%,  #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5);display:flex;align-items:center;justify-content:center;overflow:hidden;cursor:pointer;background:#222}
    .story img{width:100%;height:100%;object-fit:cover}
    .composer textarea{width:100%;min-height:70px;padding:10px;border-radius:10px;border:0;background:rgba(255,255,255,0.03);color:var(--white);resize:vertical}
    .composer .row{display:flex;gap:8px;margin-top:8px;align-items:center}
    .btn{padding:8px 12px;border-radius:10px;border:0;cursor:pointer;background:rgba(255,255,255,0.04);color:var(--white)}
    .btn.primary{background:linear-gradient(90deg,var(--accent1),var(--accent2));box-shadow:0 6px 18px rgba(230,104,60,0.18)}
    .media-preview img,.media-preview video{max-width:100%;border-radius:8px;display:block;margin-top:8px}

    .post{margin-top:12px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.03)}
    .post .meta{display:flex;align-items:center;gap:10px;padding:10px}
    .avatar{width:44px;height:44px;border-radius:50%;background:#222;flex-shrink:0}
    .post .content{padding:12px;background:linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))}
    .post .content img,.post .content video{width:100%;border-radius:8px;max-height:520px;object-fit:cover}
    .post .actions{display:flex;gap:10px;padding:10px;align-items:center}
    .small{font-size:13px;color:var(--muted)}

    /* right column */
    .sidebar{display:flex;flex-direction:column;gap:12px}
    .mini-card{display:flex;gap:10px;align-items:center}
    .big-btn{width:100%;padding:10px;border-radius:10px;border:0;background:rgba(255,255,255,0.04);color:var(--white);cursor:pointer}

    /* reels grid */
    .reels-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}
    .reel-thumb{width:100%;height:110px;border-radius:8px;object-fit:cover}

    /* modal/dm */
    .overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;padding:12px;z-index:60}
    .modal{width:100%;max-width:820px;background:#061424;border-radius:12px;padding:12px;border:1px solid rgba(255,255,255,0.04)}

    /* subtle animation */
    @keyframes floaty {0%{transform:translateY(0)}50%{transform:translateY(-6px)}100%{transform:translateY(0)}}
    .logo{animation:floaty 4s ease-in-out infinite}

    /* responsive */
    @media (max-width:980px){.app{grid-template-columns:1fr;padding:12px} .sidebar{display:none}}
  </style>
</head>
<body>

<header>
  <div class="logo-wrap">
    <img src="20240313_134001.png" alt="logo" class="logo" onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2256%22 height=%2256%22><rect rx=%2212%22 width=%2256%22 height=%2256%22 fill=%22%23011115%22/><text x=%2228%22 y=%2234%22 font-size=%2216%22 text-anchor=%22middle%22 fill=%22%23fff%22 font-family=%22Arial%22>FD</text></svg>'">
    <div>
      <div class="app-title">filmydj</div>
      <div class="small">thefilmydj_</div>
    </div>
  </div>

  <div style="flex:1"></div>

  <div style="width:420px">
    <input id="searchInput" placeholder="Search posts, users, tags..." />
  </div>
</header>

<main class="app">

  <!-- LEFT: main feed -->
  <section class="left-col">

    <!-- Stories + quick composer -->
    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <strong>Stories</strong>
        <div class="small">Add • 24h expiry • stickers</div>
      </div>

      <div class="stories" id="storiesRow"></div>

      <div style="height:8px"></div>

      <div class="composer">
        <textarea id="postText" placeholder="Share a photo or video... (caption, tags)"></textarea>
        <div class="row">
          <input id="fileInput" type="file" accept="image/*,video/*" />
          <input id="locationInput" placeholder="Location" />
          <input id="tagsInput" placeholder="tags: movies,music" />
        </div>
        <div class="media-preview" id="mediaPreview"></div>
        <div style="display:flex;gap:8px;margin-top:8px">
          <button id="postBtn" class="btn primary">Post</button>
          <button id="storyBtn" class="btn">Add Story</button>
          <button id="reelBtn" class="btn">Create Reel</button>
          <button id="liveBtn" class="btn">Go Live</button>
        </div>
      </div>
    </div>

    <!-- Feed area -->
    <div id="feedList"></div>

  </section>

  <!-- RIGHT: sidebar -->
  <aside class="sidebar">
    
  <div class="card mini-card">
      <div style="flex:1">
        <div style="font-weight:700">Shubham</div>
        <div class="small">@filmydj</div>
      </div>
      <button id="openDMBtn" class="big-btn">DM</button>
    </div>

    <div class="card">
      <strong>Reels</strong>
      <div style="height:8px"></div>
      <div class="reels-grid" id="reelsGrid"></div>
    </div>

    <div class="card">
      <strong>Shop</strong>
      <div class="small">Products for creators</div>
      <div id="shopList"></div>
      <div style="height:8px"></div>
      <button id="addProductBtn" class="btn">Add Product (demo)</button>
    </div>

    <div class="card">
      <strong>Creator Dashboard</strong>
      <div class="small" style="margin-top:6px">Posts: <span id="statPosts">0</span> • Reels: <span id="statReels">0</span></div>
      <div style="margin-top:8px">
        <button id="insightsBtn" class="btn">Insights</button>
      </div>
    </div>

    <div class="card">
      <strong>Notes</strong>
      <textarea id="notesArea" style="width:100%;min-height:80px;background:rgba(255,255,255,0.02);border-radius:8px;padding:8px;border:0;color:var(--white)"></textarea>
    </div>

  </aside>
</main>

<!-- DM modal -->
<div id="dmModal" style="display:none" class="overlay">
  <div class="modal">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <strong>Direct Messages</strong>
      <div>
        <button id="closeDm" class="btn">Close</button>
      </div>
    </div>
    <div id="dmList" style="margin-top:10px;max-height:360px;overflow:auto"></div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <input id="dmTo" placeholder="to user id" style="flex:1" />
      <input id="dmText" placeholder="message" style="flex:2" />
      <button id="sendDm" class="btn primary">Send</button>
    </div>
  </div>
</div>

<!-- Story viewer modal -->
<div id="storyViewer" style="display:none" class="overlay">
  <div class="modal" id="storyContent"></div>
</div>

<script>
/* ======================
   filmydj — single file JS
   frontend-only demo (localStorage)
   ====================== */

(() => {
  const STORAGE_KEY = 'filmydj_demo_v1';
  const nowISO = () => new Date().toISOString();
  const hoursFromNow = h => new Date(Date.now() + h*3600*1000).toISOString();

  // initial state
  let state = {
    user: { id:'u1', name:'Shubham', handle:'@filmydj' },
    posts: [],
    stories: [],
    reels: [],
    dms: [],
    shop: [],
    notes: []
  };

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw) state = JSON.parse(raw);
    } catch(e){ console.warn(e) }
  }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

  // minimal helpers
  function uid(prefix='id'){ return prefix+'_'+Math.random().toString(36).slice(2,9); }
  function q(id){ return document.getElementById(id); }
  function el(tag, attrs={}, children=''){ const d=document.createElement(tag); for(const k in attrs) d.setAttribute(k, attrs[k]); if(children) d.innerHTML = children; return d; }

  // DOM refs
  const fileInput = q('fileInput'), mediaPreview=q('mediaPreview'), postText=q('postText'), tagsInput=q('tagsInput'), locationInput=q('locationInput');
  const postBtn=q('postBtn'), storyBtn=q('storyBtn'), reelBtn=q('reelBtn'), liveBtn=q('liveBtn');
  const storiesRow=q('storiesRow'), feedList=q('feedList'), reelsGrid=q('reelsGrid');
  const notesArea=q('notesArea'), addProductBtn=q('addProductBtn'), shopList=q('shopList');
  const openDMBtn=q('openDMBtn'), dmModal=q('dmModal'), dmList=q('dmList'), closeDm=q('closeDm'), sendDm=q('sendDm'), dmTo=q('dmTo'), dmText=q('dmText');
  const storyViewer=q('storyViewer'), storyContent=q('storyContent');
  const statPosts=q('statPosts'), statReels=q('statReels'), searchInput=q('searchInput'), insightsBtn=q('insightsBtn');

  // preview file selected
  let currentMedia = null;
  fileInput.addEventListener('change', e=>{
    const f = e.target.files && e.target.files[0];
    if(!f){ currentMedia=null; mediaPreview.innerHTML=''; return; }
    const reader = new FileReader();
    reader.onload = ev => {
      currentMedia = { name:f.name, type:f.type, dataUrl:ev.target.result };
      renderMediaPreview();
    };
    reader.readAsDataURL(f);
  });
  function renderMediaPreview(){
    if(!currentMedia){ mediaPreview.innerHTML=''; return; }
    if(currentMedia.type.startsWith('image')) mediaPreview.innerHTML = '<img src="'+currentMedia.dataUrl+'">';
    else mediaPreview.innerHTML = '<video src="'+currentMedia.dataUrl+'" controls style="width:100%;border-radius:8px"></video>';
  }

  // create post
  postBtn.addEventListener('click', ()=>{
    const text = postText.value.trim();
    const tags = tagsInput.value.split(',').map(s=>s.trim()).filter(Boolean);
    const loc = locationInput.value.trim();
    if(!text && !currentMedia) return alert('Add caption or media');
    const p = { id:uid('post'), user:state.user, text, tags, location:loc, media: currentMedia, likes:0, createdAt:nowISO() };
    state.posts.unshift(p); save(); resetComposer(); renderAll();
  });

  // create story
  storyBtn.addEventListener('click', ()=>{
    if(!currentMedia) return alert('Add media for story');
    const caption = postText.value.trim();
    const s = { id:uid('story'), user:state.user, media:currentMedia, caption, createdAt:nowISO(), expiresAt:hoursFromNow(24) };
    state.stories.unshift(s); save(); resetComposer(); renderAll();
  });

  // create reel
  reelBtn.addEventListener('click', ()=>{
    if(!currentMedia) return alert('Add media for reel');
    const caption = postText.value.trim();
    const r = { id:uid('reel'), user:state.user, media:currentMedia, caption, likes:0, createdAt:nowISO() };
    state.reels.unshift(r); save(); resetComposer(); renderAll();
  });

  liveBtn.addEventListener('click', ()=>{
    alert('Live streaming is a placeholder here. Integrate a provider (Agora/Twilio/Mediasoup) for production.');
  });

  function resetComposer(){ postText.value=''; tagsInput.value=''; locationInput.value=''; fileInput.value=''; currentMedia=null; mediaPreview.innerHTML=''; }

  // render stories, feed, reels, shop
  function renderStories(){
    // remove expired
    const now = nowISO();
    state.stories = state.stories.filter(s => s.expiresAt > now);
    storiesRow.innerHTML='';
    if(state.stories.length===0){ storiesRow.innerHTML = '<div class="small">No stories yet</div>'; return; }
    state.stories.forEach(s=>{
      const d = el('div','',{});
      d.className='story';
      const im = el('img',{src:s.media.dataUrl, alt:'story'});
      d.appendChild(im);
      d.addEventListener('click', ()=> openStory(s));
      storiesRow.appendChild(d);
    });
  }

  function openStory(st){
    storyContent.innerHTML = '';
    const head = el('div','',`<div style="display:flex;align-items:center;gap:10px"><div style="font-weight:700">${st.user.name}</div><div class="small" style="margin-left:8px">${new Date(st.createdAt).toLocaleString()}</div></div>`);
    const mediaWrap = el('div','');
    if(st.media.type.startsWith('image')) mediaWrap.innerHTML = '<img src="'+st.media.dataUrl+'" style="width:100%;border-radius:8px">';
    else mediaWrap.innerHTML = '<video src="'+st.media.dataUrl+'" controls style="width:100%;border-radius:8px"></video>';
    const footer = el('div','',`<div style="margin-top:8px;color:var(--muted)">${st.caption||''}</div><div style="margin-top:6px;color:var(--muted);font-size:13px">Expires: ${new Date(st.expiresAt).toLocaleString()}</div>`);
    storyContent.appendChild(head); storyContent.appendChild(mediaWrap); storyContent.appendChild(footer);
    storyViewer.style.display='flex';
  }

  storyViewer.addEventListener('click', (e)=>{ if(e.target===storyViewer) storyViewer.style.display='none' });

  function renderFeed(filter=''){
    feedList.innerHTML='';
    const posts = filter ? state.posts.filter(p=>(p.text||'').toLowerCase().includes(filter) || (p.tags||[]).join(' ').toLowerCase().includes(filter)) : state.posts;
    if(posts.length===0){ feedList.innerHTML='<div class="card"><div class="small">No posts yet</div></div>'; return; }
    posts.forEach(p=>{
      const container = el('div'); container.className='post card';
      const meta = el('div','',`<div class="meta"><div class="avatar"></div><div style="margin-left:8px"><div style="font-weight:700">${p.user.name}</div><div class="small">${new Date(p.createdAt).toLocaleString()}</div></div></div>`);
      container.appendChild(meta);
      const content = el('div'); content.className='content';
      if(p.media){
        if(p.media.type.startsWith('image')) content.innerHTML = '<img src="'+p.media.dataUrl+'">';
        else content.innerHTML = '<video src="'+p.media.dataUrl+'" controls></video>';
      }
      content.innerHTML += `<div style="padding:8px 0">${escapeHtml(p.text||'')}</div>`;
      if(p.location) content.innerHTML += `<div class="small">📍 ${escapeHtml(p.location)}</div>`;
      if(p.tags && p.tags.length) content.innerHTML += `<div style="margin-top:6px">${p.tags.map(t=>'<span style="background:rgba(255,255,255,0.04);padding:4px 8px;border-radius:8px;margin-right:6px;font-size:12px">'+escapeHtml(t)+'</span>').join('')}</div>`;
      content.innerHTML += `<div class="actions"><button class="btn" data-like="${p.id}">♡</button><button class="btn" data-share="${p.id}">Share</button><button class="btn" data-tag="${p.id}">Tag Product</button> <span style="margin-left:8px" class="small">${p.likes} likes</span></div>`;
      container.appendChild(content);
      feedList.appendChild(container);

      // actions
      container.querySelector('[data-like]').addEventListener('click', ()=>{
        p.likes = (p.likes||0)+1; save(); renderAll();
      });
      container.querySelector('[data-share]').addEventListener('click', ()=> {
        const text = prompt('Share message (demo)');
        if(text) alert('Shared: '+text);
      });
      container.querySelector('[data-tag]').addEventListener('click', ()=>{
        const prodId = prompt('Enter product id to tag (demo). Use from Shop list shown in sidebar.');
        if(!prodId) return;
        // attach product tag to post (demo)
        p.productTag = prodId; save(); renderAll();
      });
    });
  }

  function renderReels(){
    reelsGrid.innerHTML='';
    if(state.reels.length===0){ reelsGrid.innerHTML='<div class="small">No reels yet</div>'; return; }
    state.reels.slice(0,9).forEach(r=>{
      const img = el('img',{src: r.media ? r.media.dataUrl : '', class:'reel-thumb'});
      if(!r.media) img.style.background='#122';
      const wrap = el('div'); wrap.appendChild(img);
      wrap.addEventListener('click', ()=> {
        const w = window.open('','_blank','width=420,height=720');
        if(!w) return alert('Pop-up blocked');
        w.document.write('<html><body style="margin:0;background:#000;color:#fff"><div style="padding:8px"><h3>'+escapeHtml(r.caption||'Reel')+'</h3></div>'+ (r.media && r.media.type.startsWith('image') ? '<img src="'+r.media.dataUrl+'" style="width:100%"/>' : '<video src="'+(r.media? r.media.dataUrl : '')+'" controls style="width:100%"></video>') +'</body></html>');
      });
      reelsGrid.appendChild(wrap);
    });
  }

  // shop
  addProductBtn.addEventListener('click', ()=> {
    const title = prompt('Product title','FilmyDJ Hoodie'); if(!title) return;
    const price = prompt('Price (INR)','799'); if(!price) return;
    const pid = uid('prod');
    state.shop.unshift({ id:pid, title, price:Number(price), createdAt: nowISO() }); save(); renderShop();
  });

  function renderShop(){
    shopList.innerHTML='';
    if(state.shop.length===0){ shopList.innerHTML='<div class="small">No products</div>'; return; }
    state.shop.forEach(p=>{
      const d = el('div','',`<div style="display:flex;justify-content:space-between;align-items:center"><div><div style="font-weight:700">${escapeHtml(p.title)}</div><div class="small">₹ ${p.price}</div></div><div><button class="btn" data-buy="${p.id}">Buy</button></div></div>`);
      shopList.appendChild(d);
      d.querySelector('[data-buy]').addEventListener('click', ()=> alert('Checkout demo: '+p.title));
    });
  }

  // DMs
  openDMBtn.addEventListener('click', ()=>{ dmModal.style.display='flex'; renderDMs(); });
  closeDm.addEventListener('click', ()=> dmModal.style.display='none');
  sendDm.addEventListener('click', ()=> {
    const to = dmTo.value.trim() || 'user2';
    const txt = dmText.value.trim();
    if(!txt) return;
    state.dms.push({ id:uid('dm'), from: state.user.id, to, text: txt, createdAt: nowISO() }); save(); dmText.value=''; renderDMs();
  });
  function renderDMs(){ dmList.innerHTML=''; if(state.dms.length===0){ dmList.innerHTML='<div class="small">No messages</div>'; return; } state.dms.slice().reverse().forEach(m=> { const div=el('div','',`<div style="padding:8px;border-bottom:1px solid rgba(255,255,255,0.02)"><div style="font-weight:700">${m.from} → ${m.to}</div><div style="color:var(--muted)">${escapeHtml(m.text)}</div><div class="small">${new Date(m.createdAt).toLocaleString()}</div></div>`); dmList.appendChild(div); }); }

  // notes area
  notesArea.addEventListener('input', ()=> { state.notes = notesArea.value.split('\\n'); save(); });

  // helpers
  function escapeHtml(s){ return (s||'').toString().replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[c]); }

  // search filter
  searchInput.addEventListener('input', ()=> {
    const q = searchInput.value.trim().toLowerCase();
    renderFeed(q);
  });

  insightsBtn.addEventListener('click', ()=> alert('Insights demo: Posts '+state.posts.length+' • Reels '+state.reels.length+' • Shop items '+state.shop.length));

  // initial demo content (if empty)
  function seedDemo(){
    if(state.posts.length===0 && state.reels.length===0 && state.shop.length===0){
      state.posts.unshift({
        id:uid('post'), user:state.user, text:'Welcome to filmydj — prototype', tags:['welcome','filmydj'], location:'Mumbai', media:null, likes:4, createdAt: nowISO()
      });
      state.reels.unshift({ id:uid('reel'), user:state.user, media:null, caption:'Sample Reel (add your media)', likes:3, createdAt: nowISO() });
      state.shop.unshift({ id:uid('prod'), title:'FilmyDJ Sticker Pack', price:199, createdAt:nowISO() });
      save();
    }
  }

  // render everything
  function renderAll(){ renderStories(); renderFeed(); renderReels(); renderShop(); updateStats(); notesArea.value = (state.notes||[]).join('\\n'); }
  function updateStats(){ statPosts.textContent = state.posts.length; statReels.textContent = state.reels.length; }

  // load & init
  load(); seedDemo(); renderAll();

  // close story viewer on click outside
  document.querySelectorAll('.overlay').forEach(o=> o.addEventListener('click', (e)=> { if(e.target===o) o.style.display='none' }));

  // expose small debug
  window.filmydj = { state, save, renderAll };

})();
</script>

</body>
</html>

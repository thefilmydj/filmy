<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TheFilmyDJ Portal</title>

  <!-- Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- Framer Motion for smooth animation -->
  <script src="https://cdn.jsdelivr.net/npm/framer-motion@11.0.8/dist/framer-motion.umd.js"></script>

  <!-- Supabase -->
  <script type="module">
    import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

    // 🧩 तुमचा Supabase URL आणि Key इथे टाका
    const SUPABASE_URL = "https://egdgitzfonjkqtgejwdj.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZGdpdHpmb25qa3F0Z2Vqd2RqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NjgxMjcsImV4cCI6MjA3ODU0NDEyN30.3bpjskODWgya0hSQDLmddJ9w1evCZNZ5_MU9oDYiF0U";

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 🔐 LOGIN FUNCTION
    window.login = async function () {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const msg = document.getElementById("login-msg");

      msg.textContent = "⏳ Logging in...";

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        msg.textContent = "❌ " + error.message;
      } else {
        msg.textContent = "";
        showUploadPage();
      }
    };

    // 📤 UPLOAD FUNCTION
    window.uploadFile = async function () {
      const fileInput = document.getElementById("fileInput");
      const msg = document.getElementById("upload-msg");

      if (fileInput.files.length === 0) {
        msg.textContent = "⚠️ Please select a file first!";
        return;
      }

      const file = fileInput.files[0];
      const filePath = `${Date.now()}_${file.name}`;

      msg.textContent = "⏳ Uploading...";

      const { data, error } = await supabase.storage.from("uploads").upload(filePath, file);
      if (error) {
        msg.textContent = "❌ Upload failed: " + error.message;
      } else {
        const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(filePath);
        msg.innerHTML = `✅ Uploaded Successfully! <br> 
          <a href="${urlData.publicUrl}" target="_blank" class="text-cyan-400 underline">View File</a>`;
      }
    };

    // 🚪 LOGOUT FUNCTION
    window.logout = async function () {
      await supabase.auth.signOut();
      showLoginPage();
    };

    // ✨ PAGE SWITCHING FUNCTIONS
    function showUploadPage() {
      document.getElementById("login-section").classList.add("hidden");
      document.getElementById("upload-section").classList.remove("hidden");
    }

    function showLoginPage() {
      document.getElementById("upload-section").classList.add("hidden");
      document.getElementById("login-section").classList.remove("hidden");
    }
  </script>
</head>

<body class="bg-gradient-to-br from-slate-900 to-gray-800 text-white min-h-screen flex items-center justify-center font-sans">

  <!-- 🔐 LOGIN SECTION -->
  <div id="login-section" class="bg-slate-800 p-8 rounded-2xl shadow-2xl w-96 text-center transition-all duration-500">
    <h1 class="text-3xl font-bold mb-6 text-cyan-400">🎬 TheFilmyDJ Login</h1>
    <input id="email" type="email" placeholder="Email" class="w-full mb-4 p-3 rounded bg-slate-700 text-white outline-none focus:ring-2 focus:ring-cyan-400" />
    <input id="password" type="password" placeholder="Password" class="w-full mb-6 p-3 rounded bg-slate-700 text-white outline-none focus:ring-2 focus:ring-cyan-400" />
    <button onclick="login()" class="w-full bg-cyan-500 hover:bg-cyan-600 text-white p-3 rounded font-semibold transition">Login</button>
    <p id="login-msg" class="text-sm text-red-400 mt-3"></p>
  </div>

  <!-- 📤 UPLOAD SECTION -->
  <div id="upload-section" class="hidden bg-slate-800 p-8 rounded-2xl shadow-2xl w-[450px] text-center transition-all duration-500">
    <h2 class="text-3xl font-bold mb-6 text-green-400">📤 Upload Media</h2>
    <input type="file" id="fileInput" class="mb-4 w-full text-white" />
    <button onclick="uploadFile()" class="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded font-semibold transition">Upload</button>
    <p id="upload-msg" class="text-sm text-yellow-300 mt-4"></p>
    <button onclick="logout()" class="mt-6 text-sm text-red-400 hover:text-red-500 underline">Logout</button>
  </div>

</body>
</html>

const uploadBtn = document.getElementById("uploadBtn");
const feed = document.getElementById("feed");

uploadBtn.addEventListener("click", async () => {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "video/*";

  fileInput.onchange = () => {
    const file = fileInput.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      const video = document.createElement("video");
      video.src = videoURL;
      video.controls = true;
      feed.appendChild(video);
    }
  };

  fileInput.click();
});

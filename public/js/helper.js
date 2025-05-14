const chatRoom = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const rooName = document.getElementById("room-name");
const userList = document.getElementById("users");
const emoji_btn = document.getElementById("emoji-button");
const joinedas = document.getElementById("joined-as");
const previewContainer = document.getElementById("filePreview");
const socket = io("http://localhost:8000", {
  withCredentials: true,
});

//to get query values
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
document.getElementById("file-icon").addEventListener("click", () => {
  document.getElementById("file-upload").click();
});

const currentusername = username;
console.log(username, room);
//join room
socket.emit("joinroom", { username, room });

//getroom and users
socket.on("userRoom", ({ room, users }) => {
  displayRoomname(room);
  displayUsers(users);
});
socket.on("loadmessages", (previousmessages) => {
  previousmessages.forEach((message) => {
    displayMessage(message);
  });
});

socket.on("message", (data) => {
  console.log("username", data.username);
  displayMessage(data);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: "smooth" });

  if (data.username !== currentusername) {
    document.getElementById("received-sound").play();
  }
});
//preview before upload
document.getElementById("file-upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  previewContainer.innerHTML = ""; // Clear previous preview

  if (!file) return;

  const ext = file.name.split(".").pop().toLowerCase();
  const url = URL.createObjectURL(file);

  const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
  const isAudio = ["mp3", "wav"].includes(ext);
  const isVideo = ["mp4", "webm", "mov"].includes(ext);
  const isPdf = ext === "pdf";

  if (isImage) {
    const img = document.createElement("img");
    img.src = url;
    img.alt = file.name;
    img.style.maxWidth = "150px";
    img.style.maxHeight = "150px";
    previewContainer.appendChild(img);
  } else if (isAudio) {
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = url;
    previewContainer.appendChild(audio);
  } else if (isVideo) {
    const video = document.createElement("video");
    video.controls = true;
    video.src = url;
    video.style.maxWidth = "200px";
    video.style.maxHeight = "200px";
    previewContainer.appendChild(video);
  } else if (isPdf) {
    const embed = document.createElement("embed");
    embed.src = url;
    embed.type = "application/pdf";
    embed.width = "100%";
    embed.height = "200px";
    previewContainer.appendChild(embed);
  } else {
    const icon = document.createElement("p");
    icon.innerHTML = `📄 Selected: ${file.name}`;
    previewContainer.appendChild(icon);
  }
});

//message submit
chatRoom.addEventListener("submit", async (e) => {
  e.preventDefault();

  //get message from input
  const message = e.target.elements.msg.value.trim();
  const fileInput = document.getElementById("file-upload");
  const file = fileInput.files[0];
  if (file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const result = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });

      const data = await result.json();
      console.log("File uploaded successfully", data.filename);
      socket.emit("chatMessage", {
        type: "file",
        filename: data.filename,
        originalname: file.name,
        url: data.url,
        size: file.size,
      });
    } catch (err) {
      console.log("File upload failed:", err);
      alert("File upload failed! Please try again.");
    }
    fileInput.value = "";
    previewContainer.innerHTML = ""

  }

  //play sounds
  if (message !== "") {
    socket.emit("chatMessage", {
      type: "text",
      text: message,
    });
    document.getElementById("sent-sound").play();
  }
  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});
//file size calculator
const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

//icons
function getFileIcon(ext) {
  switch (ext) {
    case "pdf":
      return '<i class="fas fa-file-pdf fa-lg" style="color: #e74c3c;"></i>';
    case "doc":
    case "docx":
      return '<i class="fas fa-file-word fa-lg" style="color: #2e86de;"></i>';
    case "xls":
    case "xlsx":
      return '<i class="fas fa-file-excel fa-lg" style="color: #28b463;"></i>';
    case "zip":
    case "rar":
      return '<i class="fas fa-file-archive fa-lg" style="color: #f39c12;"></i>';
    case "ppt":
    case "pptx":
      return '<i class="fas fa-file-powerpoint fa-lg" style="color: #e67e22;"></i>';
    case "txt":
      return '<i class="fas fa-file-alt fa-lg"></i>';
    case "mp3":
    case "wav":
      return '<i class="fas fa-file-audio fa-lg" style="color: #9b59b6;"></i>';
    case "mp4":
    case "mov":
      return '<i class="fas fa-file-video fa-lg" style="color: #16a085;"></i>';
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "webp":
      return '<i class="fas fa-file-image fa-lg" style="color: #f1c40f;"></i>';
    default:
      return '<i class="fas fa-file fa-lg"></i>';
  }
}

const displayMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message"); //adds message div from chat.html

  if (message.type === "system") {
    div.classList.add("system-greet");
  } else {
    div.classList.add(
      message.username === currentusername ? "send" : "received"
    );
  }
  let content = `<p class="meta">${message.username}<span class="time">${message.time}</span></p>`;
  if (message.text) {
    content += `<p class="text">${
      message.type === "file"
        ? `<a href="/file/${message.filename}" target="_blank" download>${message.originalname}</a>`
        : message.text
    }
   </p>`;
  }
  if (message.filename || message.url) {
    const filelink = message.url || `/uploads/${message.filename}`;
    const ext = message.filename.split(".").pop().toLowerCase();
    // const isImage = ["jpg", "png", "gif", "jpeg", "webp"].includes(ext);
    const downloadlink =
      message.url +
      "?fl_attachment=" +
      encodeURIComponent(message.originalname);
    const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
    const isAudio = ["mp3", "wav"].includes(ext);
    const isVideo = ["mp4", "webm"].includes(ext);

    content += `<div class="chat-file">`;
    if (isImage) {
      content += `
        <img src="${message.url}" alt="${message.filename}" class="chat-image" />
        <p><a href="${downloadlink} download class="file-link"><i class="fas fa-download"></i> Download File<a></p>`;
    } else if (isAudio) {
      const mimeType = ext === "mp3" ? "audio/mpeg" : "audio/wav";
      content += `<audio controls class="chat-audio"><source src="${message.url}" type="${mimeType}"></audio>
      <p><a href="${downloadlink} download class="file-link"><i class="fas fa-download"></i> Download File<a></p>`;
    } else if (isVideo) {
      content += `<video controls src="${message.url} class="chat-vidio></video>
      <p><a href="${downloadlink} download class="file-link"><i class="fas fa-download"></i> Download File<a></p>`;
    } else {
      const icon = getFileIcon(ext);
      content += `<p>${icon} ${message.originalname}</p>
      <p><a href="${downloadlink}" class="file-link" target="_blank" download>
      <i class="fas fa-download"></i> Download File
     </a></p>`;
    }

    if (message.size) {
      content += `<p class="file-size"><i class="fas fa-box-archive"></i> Size: ${formatBytes(
        message.size
      )}</p>`;
    }

    // content += `<p><a href="${downloadlink}"  target="_blank" download class="file-link">📄 Download${message.filename}<a> </p>`;
    content += `</div>`;
  }
  div.innerHTML = content;
  document.querySelector(".chat-messages").appendChild(div);
};
const pickerOptions = {
  onEmojiSelect: (emoji) => {
    const msginput = document.getElementById("msg");
    msginput.value += emoji.native;
  },
};
const picker = new EmojiMart.Picker(pickerOptions);
picker.classList.add("emoji-picker");
document.body.appendChild(picker);

emoji_btn.addEventListener("click", () => {
  const pickerElement = document.querySelector(".emoji-picker");
  pickerElement.style.display =
    pickerElement.style.display === "none" ? "block" : "none";
  const rect = emoji_btn.getBoundingClientRect();
  pickerElement.style.top = `${
    rect.top - pickerElement.offsetHeight - 5 + window.scrollY
  }px`;
  pickerElement.style.center = `${rect.right + window.scrollX}px`;
});

function displayRoomname(room) {
  rooName.innerHTML = room;
}

function displayUsers(users) {
  joinedas.textContent = "Joined as: " + currentusername;

  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

const chatRoom = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const rooName = document.getElementById("room-name");
const userList = document.getElementById("users");
const socket = io('http://localhost:8000', {
    withCredentials: true
});

//to get query values
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
const currentusername = username
console.log(username, room);
//join room
socket.emit("joinroom", { username, room });

//getroom and users
socket.on("userRoom", ({ room, users }) => {
  displayRoomname(room);
  displayUsers(users);
});

socket.on("message", (data) => {
  displayMessage(data);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

//message submit
chatRoom.addEventListener("submit", (e) => {
  e.preventDefault();

  //get message from input
  const message = e.target.elements.msg.value;

  //emit to server
  socket.emit("chatMessage", message);

  //clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

const displayMessage = (message) => {
  const div = document.createElement("div");
  div.classList.add("message"); //adds message div from chat.html

  if(message.username === currentusername) {
    div.classList.add("send")
  }else{
    div.classList.add("received")
  }
  div.innerHTML = `<p class="meta">${message.username}<span class="time">${message.time}</span></p>
            <p class="text">
              
            ${message.text}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
};

function displayRoomname(room) {
  rooName.innerHTML = room;
}

function displayUsers(users) {
  userList.innerHTML = `
    ${users.map((user) => `<li>${user.username}</li>`).join("")}
    `;
}

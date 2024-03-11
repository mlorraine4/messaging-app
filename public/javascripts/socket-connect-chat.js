const initChat = (() => {
  let message = document.getElementById("message");
  let button = document.getElementById("submit-btn");
  let messagesContainer = document.getElementById("messages-container");
  let socket = io.connect();

  // Connect to socket.
  function connectToChat() {
    socket.emit("join-chat", user_id, chat_id);
  }

  connectToChat();

  button.addEventListener("click", (e) => {
    e.preventDefault();

    if (message.value) {
      let messageData = {
        chat: chat_id,
        text: message.value,
        author: user_display_name,
        author_id: user_id,
        timestamp: Date.now(),
      };
      // Send message to socket listener (for specific chat).
      socket.emit("send-message", { message: messageData, room: chat_id });

      // Post message data to server.
      postData("https://strife.mariasilvia.me/send-message", messageData).then(
        (response) => {
          console.log(response);
        }
      );
    }
  });

  async function postData(url = "", data = {}) {
    // Default options are marked with *
    const response = await fetch(url, {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
      body: JSON.stringify(data), // body data type must match "Content-Type" header
    });
    return response.json(); // parses JSON response into native JavaScript objects
  }

  socket.on("recieve-message", (message) => {
    // Get any new socket messages and append message to chat container.
    let container = document.createElement("div");
    let header = document.createElement("div");
    let author = document.createElement("div");
    let time = document.createElement("div");
    let anchor = document.getElementById("anchor");

    time.innerHTML = "";
    time.className = "chat-date";

    author.innerHTML = message.author;
    author.className = "msg-author";

    header.append(author, time);
    container.innerHTML = message.text;
    container.append(time);

    messagesContainer.insertBefore(container, anchor);

    if (message.author === user_display_name) {
      container.className = "current-user-msg";
    } else {
      container.className = "recieving-user-msg";
    }
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
})();

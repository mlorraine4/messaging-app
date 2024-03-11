const init = (() => {
  const socket = io.connect("https://strife.mariasilvia.me", {
    path: "/socket.io",
    transports: ["websocket"],
    secure: true,
  });

  const user = {
    id: user_id,
    display_name: user_display_name,
    friends: [user_friends],
  };

  // log user in to socket connection, get all users connected to socket
  function connectSocket() {
    socket.emit("online", user);
  }

  // get users logged-in to socket connection
  function getOnlineFriends() {
    console.log("getting friends");
    socket.emit("get-online-friends", user);
  }

  connectSocket();
  getOnlineFriends();
  setInterval(getOnlineFriends, 60000);

  // get user list when a user comes online
  socket.on("users", (users) => {
    displayFriends(users);
  });

  // get user when they log out
  socket.on("user-logged-out", (user) => {
    console.log("user logged out ", user);
    removeUser(document.getElementById("f" + user.id));
  });

  // display users online
  function displayFriends(users) {
    let friendsContainer = document.getElementById("friends-list");
    let friendList = document.querySelectorAll(".friend-container");

    friendList.forEach((div) => {
      if (users.filter((e) => e.id === div.id).length > 0) {
        // user is still logged in, don't remove div
      } else {
        console.log("user is not logged in");
        removeUser(div);
      }
    });

    users.forEach((user) => {
      if (document.getElementById("f" + user._id) === null) {
        let form = document.createElement("form");
        let input = document.createElement("input");
        let button = document.createElement("button");
        let inputContainer = document.createElement("div");

        form.method = "POST";
        form.action = "/get-chat";

        input.value = user.id;
        input.name = "user";
        input.id = "user";
        input.setAttribute("hidden", true);

        inputContainer.id = "f" + user.id;
        inputContainer.className = "friend-container";
        form.appendChild(input);

        button.textContent = user.display_name;
        button.className = "user-online-btn";
        form.appendChild(button);

        inputContainer.appendChild(form);
        friendsContainer.appendChild(inputContainer);
      }
    });
    document.getElementById("online-count").innerHTML =
      "Online - " + users.length;
  }

  function removeUser(div) {
    let friendsContainer = document.getElementById("friends-list");

    if (div !== null) {
      friendsContainer.removeChild(div);
    }
  }
})();

// src/app.js

import { Auth, getUser } from "./auth";
import {
  deleteFragment,
  getFragment,
  getFragmentMeta,
  getUserFragments,
  postFragments,
  putFragment,
} from "./api";

async function init() {
  // Get our UI elements
  const userSection = document.querySelector("#user");
  const loginBtn = document.querySelector("#login");
  const logoutBtn = document.querySelector("#logout");
  const postButton = document.querySelector("#post");
  const content = document.querySelector("#content");
  const contentType = document.querySelector("#type");
  const fileUpload = document.querySelector("#file");

  // Wire up event handlers to deal with login and logout.
  loginBtn.onclick = () => {
    // Sign-in via the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/advanced/q/platform/js/#identity-pool-federation
    Auth.federatedSignIn();
  };
  logoutBtn.onclick = () => {
    // Sign-out of the Amazon Cognito Hosted UI (requires redirects), see:
    // https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js/#sign-out
    Auth.signOut();
  };

  // See if we're signed in (i.e., we'll have a `user` object)
  const user = await getUser();
  if (!user) {
    // Disable the Logout button
    logoutBtn.disabled = true;
    return;
  }

  // Log the user info for debugging purposes
  console.log({ user });

  // Update the UI to welcome the user
  userSection.hidden = false;

  // Show the user's username
  userSection.querySelector(".username").innerText = user.username;

  // Disable the Login button
  loginBtn.disabled = true;

  postButton.onclick = async () => {
    if (content.value.trim() === "") {
      const file = fileUpload.files[0];
      // Read the file using the FileReader API
      const reader = new FileReader();
      if (
        contentType.options[contentType.selectedIndex].value.startsWith("image")
      ) {
        reader.onload = function (event) {
          // Get the file data as a base64 encoded string
          const imageData = event.target.result;
        };

        // Read the file as a DataURL
        await postFragments(
          user,
          contentType.options[contentType.selectedIndex].value,
          reader.readAsDataURL(file)
        );
      } else {
        reader.readAsText(file);
        reader.onload = async function () {
          const content = reader.result;
          // Send the file to the server
          console.log("content", content.length);
          await postFragments(
            user,
            contentType.options[contentType.selectedIndex].value,
            content
          );
        };
      }
    } else {
      let data = content.value;
      let contentTypeValue =
        contentType.options[contentType.selectedIndex].value;

      await postFragments(user, contentTypeValue, data);
    }
  };

}

// Wait for the DOM to be ready, then start the app
addEventListener("DOMContentLoaded", init);

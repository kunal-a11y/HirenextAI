import React from "react";

export default function LoginSuccess() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    window.location.href = "/chat";
  } else {
    window.location.href = "/login";
  }

  return null;
}

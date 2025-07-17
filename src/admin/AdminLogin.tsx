import { useMutation } from "@tanstack/react-query";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CustomResponseType, ErrorType } from "../utility/types";
import Error from "../components/utility/Error.tsx";

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const adminLoginMutation = useMutation<CustomResponseType, ErrorType>({
    mutationFn: async (songString) => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorBody: ErrorType = await response.json();
        throw errorBody;
      }

      return response.json() as Promise<CustomResponseType>;
    },
    onSuccess: (data) => {
      console.log("Response from server:", data);
      sessionStorage.setItem("isAdmin", "true");
      navigate("/admin");
    },
    onError: (error: ErrorType) => {
      console.log(error);
      console.error("Error submitting songs:", error.message);
    },
  });

  return (
    <div>
      <h2>Admin Login</h2>
      <div>
        <label htmlFor="username">Username:</label>
        <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        <input
          type="password" // Use type="password" for security/browser hints
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        onClick={() => {
          adminLoginMutation.mutate();
        }}
        type="submit"
        disabled={!username || !password}
      >
        Login
      </button>
      {adminLoginMutation.isError && (
        <div>
          <Error errorInfo={adminLoginMutation.error} />
        </div>
      )}
    </div>
  );
}

export default AdminLogin;

import { useState } from "react";
import { createUser } from "../../api/adminApi";
import "../../styles/createEmployee.css";

export default function CreateEmployee() {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {

    e.preventDefault();

   await createUser({
  name: username,
  password: password
});

    alert("Employee Created");

    setUsername("");
    setPassword("");
  };

  return (

    <div className="create-user-page">

      <div className="create-user-card">

        <h2>Create Employee</h2>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Username</label>

            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

          </div>

          <button className="create-btn">
            Create User
          </button>

        </form>

      </div>

    </div>

  );
}
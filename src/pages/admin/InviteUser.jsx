import { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/inviteUser.css";

export default function InviteUser(){

  const [users,setUsers] = useState([]);
  const [meetingId,setMeetingId] = useState("");

  useEffect(()=>{
    fetchUsers();
  },[]);

  const fetchUsers = async()=>{

    try{

      const token = localStorage.getItem("token");

      const res = await API.get("/admin/users",{
        headers:{
          Authorization:"Bearer "+token
        }
      });

      setUsers(res.data);

    }catch(err){
      console.error(err);
    }

  };


  const inviteUser = async(userId)=>{

    const token = localStorage.getItem("token");

    try{

      await API.post(
        "/meeting/invite",
        {
          meetingId: meetingId,
          userId: userId
        },
        {
          headers:{
            Authorization:"Bearer "+token
          }
        }
      );

      alert("Invitation sent to " + userId);

    }catch(err){
      console.error(err);
      alert("Failed to invite user");
    }

  };


  return(

    <div className="invite-page">

      <h2>Invite Employees To Meeting</h2>

      <div className="meeting-input">

        <label>Meeting Code</label>

        <input
          type="text"
          placeholder="Enter Meeting ID or Code"
          value={meetingId}
          onChange={(e)=>setMeetingId(e.target.value)}
        />

      </div>

      <table className="invite-table">

        <thead>

          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {users.map((user)=>(

            <tr key={user.userId}>

              <td>{user.userId}</td>
              <td>{user.name}</td>

              <td>

                <button
                  className="invite-btn"
                  onClick={()=>inviteUser(user.userId)}
                >
                  Invite
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}
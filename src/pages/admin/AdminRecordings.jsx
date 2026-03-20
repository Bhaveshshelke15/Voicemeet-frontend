import React, { useEffect, useState } from "react";
import API from "../../api/api";
import "../../styles/adminRecordings.css";

function AdminRecordings() {

const [recordings, setRecordings] = useState([]);

useEffect(() => {

 fetchRecordings();

}, []);

const fetchRecordings = async () => {

 try {

  const res = await API.get("/recording/all");
  setRecordings(res.data);

 } catch (err) {
  console.error(err);
 }

};

return (

<div className="recording-container">

<h2>Meeting Recordings</h2>

{recordings.length === 0 ? (

<p className="no-recordings">
No recordings available
</p>

) : (

<table className="recording-table">

<thead>
<tr>
<th>Meeting Name</th>
<th>Meeting ID</th>
<th>Date</th>
<th>Time</th>
<th>Play</th>
<th>Download</th>
</tr>
</thead>

<tbody>

{recordings.map((r) => (

<tr key={r.id}>

<td>{r.meetingName}</td>
<td>{r.meetingId}</td>
<td>{r.date}</td>
<td>{r.time}</td>

<td>

<audio controls>
<source
src={"https://voicemeet.onrender.com/recordings/" + r.fileName}
type="audio/webm"
/>
</audio>

</td>

<td>

<a
href={"https://voicemeet.onrender.com/recordings/" + r.fileName}
download
className="download-btn"
>
Download
</a>

</td>

</tr>

))}

</tbody>

</table>

)}

</div>

);

}

export default AdminRecordings;
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
      console.log("Recordings:", res.data);
      setRecordings(res.data);

    } catch (err) {
      console.error(err);
    }
  };

  // ✅ FIXED URL
  const getAudioUrl = (fileName) => {
    return `https://voicemeet.onrender.com/recording/file/${fileName}`;
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

                <td>{r.meetingId}</td>
                <td>{r.date}</td>
                <td>{r.time}</td>

                {/* ✅ PLAY */}
                <td>
                  <audio controls style={{ width: "200px" }}>
                    <source
                      src={getAudioUrl(r.fileName)}
                      type="audio/webm"
                    />
                    Your browser does not support audio
                  </audio>
                </td>

                {/* ✅ DOWNLOAD */}
                <td>
                  <a
                    href={getAudioUrl(r.fileName)}
                    download
                    className="download-btn"
                  >
                    ⬇ Download
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
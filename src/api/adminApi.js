import axios from "axios";

const BASE_URL = "https://voicemeet.onrender.com";

export const createUser = async (data) => {
  const token = localStorage.getItem("token");

  return axios.post(
    BASE_URL + "/admin/create-user",
    data,
    {
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/json"
      }
    }
  );
};
import API from "./axiosConfig";

export const createMeeting = (data) => {
  return API.post("/meeting/create", data);
};

export const getUserMeetings = (userId) => {
  return API.get(`/meeting/userMeetings?userId=${userId}`);
};
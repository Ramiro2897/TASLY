import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchHomeData = (token: string, todayLocal: string) => {
  const headers = { Authorization: `Bearer ${token}` };

  return Promise.all([
    axios.get(`${API_URL}/api/auth/tasklist`, { headers }),
    axios.post(
      `${API_URL}/api/auth/tasklistAll`,
      { date: todayLocal },
      { headers }
    ),
    axios.get(`${API_URL}/api/auth/phraseslist`, { headers }),
    axios.get(`${API_URL}/api/auth/goallist`, { headers }),
  ]);
};
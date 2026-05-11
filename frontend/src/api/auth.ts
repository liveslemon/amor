import API from "./client";

export const signup = async (data: {
  name: string;
  whatsapp_number: string;
  password: string;
}) => {
  const res = await API.post("/auth/signup", data);
  if (typeof window !== 'undefined' && res.data.access_token) {
    localStorage.setItem("mingle_token", res.data.access_token);
  }
  return res.data;
};

export const login = async (data: {
  whatsapp_number: string;
  password: string;
}) => {
  const res = await API.post("/auth/login", data);
  if (typeof window !== 'undefined' && res.data.access_token) {
    localStorage.setItem("mingle_token", res.data.access_token);
  }
  return res.data;
};

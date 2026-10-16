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

  try {
    const profile = await API.get("/me/profile");
    return {
      ...res.data,
      user: profile.data?.user || res.data.user,
      profile: profile.data?.profile,
      preferences: profile.data?.preferences,
      focuses: profile.data?.focuses,
      preferred_builds: profile.data?.preferred_builds,
      photos: profile.data?.photos,
    };
  } catch (error) {
    console.error("Signed in, but could not refresh the saved profile:", error);
    return res.data;
  }
};

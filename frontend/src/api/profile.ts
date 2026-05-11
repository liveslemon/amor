import API from "./client";

export const saveProfile = async (data: any) => {
  const res = await API.post("/profile", data);
  return res.data;
};

export const savePreferences = async (data: any) => {
  const res = await API.post("/preferences", data);
  return res.data;
};

export const saveFocuses = async (focuses: string[]) => {
  const res = await API.post("/focuses", { focuses });
  return res.data;
};

export const savePreferredBuilds = async (builds: string[]) => {
  const res = await API.post("/preferred-builds", { builds });
  return res.data;
};

export const savePhotos = async (photos: any[]) => {
  const res = await API.post("/photos", { photos });
  return res.data;
};

export const uploadPhotoBinary = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = typeof window !== 'undefined' 
    ? (localStorage.getItem("mingle_token") || localStorage.getItem("mingle_access_token")) 
    : null;
  const headers: any = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // We omit Content-Type so Axios/Browser generates it with correct boundary automatically
  const res = await API.post("/photos/upload", formData, {
    headers
  });
  return res.data; 
};

export const getMe = async () => {
  const res = await API.get("/me/profile");
  return res.data;
};

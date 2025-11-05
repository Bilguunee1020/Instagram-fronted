import realAxios from "axios";
import { useUser } from "../providers/UserProvider";

export const useAxios = () => {
  const { token } = useUser();

  const axios = realAxios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return axios;
};

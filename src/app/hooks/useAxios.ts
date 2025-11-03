import realAxios from "axios";
import { useUser } from "../providers/UserProvider";

export const useAxios = () => {
  const { token } = useUser();

  const axios = realAxios.create({
    baseURL: "http://localhost:5500",
    headers: {
      Authorization: "Bearer " + token,
    },
  });

  return axios;
};

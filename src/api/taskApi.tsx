import axios from "axios";
import { Task } from "../types/Task";

const API_URL = "https://68c23e25f9928dbf33edab49.mockapi.io/Task";
export const taskApi = {
  getAll: async (): Promise<Task[]> => {
    const res = await axios.get<Task[]>(API_URL);
    return res.data;
  },

  getById: async (id: string): Promise<Task> => {
    const res = await axios.get<Task>(`${API_URL}/${id}`);
    return res.data;
  },

  create: async (task: Omit<Task, "id">): Promise<Task> => {
    const res = await axios.post<Task>(API_URL, task);
    return res.data;
  },

  update: async (id: string, task: Partial<Task>): Promise<Task> => {
    const res = await axios.put<Task>(`${API_URL}/${id}`, task);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
  },
};

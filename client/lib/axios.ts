import Axios, { AxiosError } from "axios";
import { toast } from "react-toastify";
import { authClient } from "@/lib/auth-client";

const sleep = (delay: number) =>
  new Promise((resolve) => setTimeout(resolve, delay));

const axios = Axios.create({
  baseURL: process.env.VITE_API_URL,
  headers: {
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
  withXSRFToken: true,
});

// ─── REQUEST interceptor ─────────────────────────────────────
axios.interceptors.request.use(async (config) => {
  // Better-auth daje ci session — weź token i włóż w header
  const { data: session } = await authClient.getSession();

  if (session) {
    config.headers["Authorization"] = `Bearer ${session.token}`;
  }

  return config;
});

// ─── RESPONSE interceptor ────────────────────────────────────
axios.interceptors.response.use(
  async (response) => {
    if (process.env.DEV) await sleep(300);
    return response;
  },
  async (error: AxiosError) => {
    if (process.env.DEV) await sleep(300);

    // 🔴 Serwer nie odpowiada
    if (!error.response) {
      toast.error("Service is not available. Please try again later.");
      window.location.href = "/server-error";
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    switch (status) {
      // 🔴 Validation errors z Laravel
      case 400: {
        if (data.errors) {
          const modalStateErrors = Object.values(data.errors).flat();
          throw modalStateErrors;
        }
        toast.error(data.message || "Bad request");
        break;
      }

      // 🔴 Nie zalogowany lub token wygasł
      case 401: {
        // Token wygasł — wyloguj i przekieruj
        await authClient.signOut();
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        break;
      }

      // 🔴 Brak uprawnień (zalogowany, ale nie ma dostępu)
      case 403: {
        toast.error("You do not have permission to do this.");
        window.location.href = "/forbidden";
        break;
      }

      // 🔴 Nie znaleziono
      case 404: {
        toast.error(data.message || "Not found");
        window.location.href = "/not-found";
        break;
      }

      // 🔴 Server error
      case 500: {
        toast.error(data.message || "Internal server error");
        window.location.href = "/server-error";
        break;
      }

      default:
        toast.error("Something went wrong");
        break;
    }

    return Promise.reject(error);
  },
);

export default axios;

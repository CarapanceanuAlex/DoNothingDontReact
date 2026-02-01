import { ConvexClient } from "convex/browser";

const client = new ConvexClient(import.meta.env.VITE_CONVEX_URL);

export default client;

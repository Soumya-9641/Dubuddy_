export interface UserPayload {
  id: number;
  username: string;
  role: "admin" | "manager" | "viewer";
}

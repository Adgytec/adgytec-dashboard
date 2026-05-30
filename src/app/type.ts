import type { User } from "firebase/auth";

export interface UserProps {
    user: User | null;
}

"use client";

import { createContext, useContext } from "react";

export type OnEditSuccessInput = {
    id: string;
    name: string;
    role: string;
};

export type UserActionsProviderType = {
    onEditSuccess: (params: OnEditSuccessInput) => void;
    onDeleteSuccess: (id: string) => void;
};

export const UserActionProvider = createContext<UserActionsProviderType | null>(
    null
);

export function useUserAction() {
    const ctx = useContext(UserActionProvider);
    if (!ctx) {
        throw new Error(
            "useUserAction must be used within a UserActionProvider"
        );
    }
    return ctx;
}

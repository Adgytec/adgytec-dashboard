import { createContext, useContext } from "react";

export type AlbumContextType = {
    removeAlbum: (id: string) => void;
    updateAlbumName: (id: string, name: string) => void;
    updateAlbumCover: (id: string, cover: string) => void;
    projectID: string;
};

export const AlbumContext = createContext<AlbumContextType | null>(null);

export function useAlbumActions() {
    const ctx = useContext(AlbumContext);
    if (!ctx) {
        throw new Error("'useAlbumActions should be used inside AlbumContext");
    }

    return ctx;
}

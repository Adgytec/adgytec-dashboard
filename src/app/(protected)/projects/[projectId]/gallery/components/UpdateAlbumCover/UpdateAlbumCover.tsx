import { ModalOverlay } from "react-aria-components";

export const UpdateAlbumCover: React.FC<{
    id: string;
    currentCover: string;
    isOpen: boolean;
    onOpenChange: (val: boolean) => void;
}> = () => {
    return <ModalOverlay></ModalOverlay>;
};

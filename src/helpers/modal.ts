export const lightDismiss = ({
	target: dialog,
}: React.MouseEvent<HTMLDialogElement, MouseEvent>) => {
	if (dialog instanceof HTMLDialogElement) {
		if (dialog.nodeName === "DIALOG") dialog.close();
	}
};

export const handleModalClose = (
	ref: React.MutableRefObject<HTMLDialogElement | null>
) => {
	ref.current?.close();
};

export const handleEscModal = (e: React.KeyboardEvent<HTMLDialogElement>) => {
	if (e.code === "Escape") e.preventDefault();
};

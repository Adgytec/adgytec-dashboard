import React from "react";

interface EmailConfirmModalProps {
	handleClose: () => void;
}

const EmailConfirmModal = ({ handleClose }: EmailConfirmModalProps) => {
	return (
		<div>
			<h2>Email Verification Required</h2>

			<p>
				A verification email has been sent to your email address. To
				complete your registration, please check your inbox and follow
				the instructions to verify your email. If you don&apos;t see the
				email within a few minutes, check your spam or junk folder.
				<br />
				For further assistance, please contact support.
			</p>

			<div>
				<button
					data-type="button"
					data-variant="secondary"
					onClick={handleClose}
				>
					Ok
				</button>
			</div>
		</div>
	);
};

export default EmailConfirmModal;

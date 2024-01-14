import { FC } from "react";
import { Modal } from "..";

export type SignupModalProps = {
	open: boolean;
	onClose: () => void;
};
export const SignupModal: FC<SignupModalProps> = ({ open, onClose }) => {
	return (
		<Modal open={open} onClose={onClose}>
			Log in | Sign up
		</Modal>
	);
};

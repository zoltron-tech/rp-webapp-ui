"use client";

import { FC, useState } from "react";
import * as S from "./styles";
import { IoIosCloseCircle } from "react-icons/io";
import { ShouldRender } from "../should-render";
import { PALETTE } from "@/theme";

type Props = {
	children: React.ReactNode;
	open: boolean;
	onClose: () => void;
};
export const Modal: FC<Props> = ({ children, open, onClose }) => {
	const [closeHover, setCloseHover] = useState(false);

	const onCloseClick = () => {
		onClose();
	};

	return (
		<S.Container onClick={onCloseClick} open={open}>
			<S.Content>
				<S.CloseButton
					onMouseEnter={() => setCloseHover(true)}
					onMouseLeave={() => setCloseHover(false)}
					onClick={onCloseClick}
				>
					<IoIosCloseCircle
						color={closeHover ? PALETTE.DANGER : PALETTE.PRIMARY}
					/>
				</S.CloseButton>
				{children}
			</S.Content>
		</S.Container>
	);
};

"use client";

import { FC, useState } from "react";
import { Button, Modal, SignupModal } from "@/components";

import * as S from "./styles";
import Image from "next/image";
import { Logo } from "@/assets/logos";

type Props = {};
export const TopBar: FC<Props> = () => {
	const [modalOpen, setModalOpen] = useState(false);

	const onLoginClick = () => {
		setModalOpen(true);
	};

	const onSignupClick = () => {
		setModalOpen(true);
	};

	const onModalClose = () => {
		setModalOpen(false);
	};

	return (
		<S.Bar>
			<S.LogoContainer>
				<S.Logo>RP</S.Logo>
				<S.LogoText>Novelists' Corner</S.LogoText>
			</S.LogoContainer>
			<S.ButtonsContainer>
				<Button onClick={onLoginClick}>Log in</Button>
				<Button onClick={onSignupClick} variant="secondary">
					Sign up
				</Button>
			</S.ButtonsContainer>
			<SignupModal open={modalOpen} onClose={onModalClose} />
		</S.Bar>
	);
};

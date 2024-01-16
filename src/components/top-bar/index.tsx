"use client";

import { FC, useContext, useState } from "react";
import { Button, SignupModal } from "@/components";

import * as S from "./styles";
import { ThemeToggle } from "../theme-toggle";
import { ThemeContext } from "@/context";

type Props = {};

export const TopBar: FC<Props> = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const { theme } = useContext(ThemeContext);

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
		<>
			<SignupModal open={modalOpen} onClose={onModalClose} />
			<S.Bar theme={theme}>
				<S.LogoContainer>
					<S.Logo>RP</S.Logo>
					<S.LogoText>Novelists&apos; Corner</S.LogoText>
				</S.LogoContainer>
				<S.ActionsContainer>
					<ThemeToggle />
					<S.ButtonsContainer>
						<Button onClick={onLoginClick}>Log in</Button>
						<Button onClick={onSignupClick} variant="secondary">
							Sign up
						</Button>
					</S.ButtonsContainer>
				</S.ActionsContainer>
			</S.Bar>
		</>
	);
};

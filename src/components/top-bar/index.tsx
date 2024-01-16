"use client";

import { FC, useState } from "react";
import { Button, SignupModal } from "@/components";

import * as S from "./styles";
import { ThemeToggle } from "../theme-toggle";

type Props = {
	toggleTheme: () => void;
	theme: "light" | "dark";
};

export const TopBar: FC<Props> = ({ theme, toggleTheme }) => {
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
		<>
			<SignupModal open={modalOpen} onClose={onModalClose} />
			<S.Bar>
				<S.LogoContainer>
					<S.Logo>RP</S.Logo>
					<S.LogoText>Novelists&apos; Corner</S.LogoText>
				</S.LogoContainer>
				<S.ActionsContainer>
					<ThemeToggle theme={theme} toggleTheme={toggleTheme} />
					<S.ButtonsContainerDesktop>
						<Button onClick={onLoginClick}>Log in</Button>
						<Button onClick={onSignupClick} variant="secondary">
							Sign up
						</Button>
					</S.ButtonsContainerDesktop>
					<S.ButtonsContainerMobile>
						<Button variant="link" onClick={onLoginClick}>
							Log in
						</Button>
						<Button variant="link" onClick={onSignupClick}>
							Sign up
						</Button>
					</S.ButtonsContainerMobile>
				</S.ActionsContainer>
			</S.Bar>
		</>
	);
};

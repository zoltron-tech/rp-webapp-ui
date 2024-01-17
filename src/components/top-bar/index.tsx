"use client";

import { FC, useState } from "react";
import { Button, LoginModal, ShouldRender } from "@/components";

import * as S from "./styles";
import { ThemeToggle } from "../theme-toggle";
import { useAuth } from "@/hooks";
import { logout } from "@/app/actions";
import { redirect } from "next/navigation";

type Props = {
	toggleTheme: () => void;
	theme: "light" | "dark";
};

export const TopBar: FC<Props> = ({ theme, toggleTheme }) => {
	const [modalOpen, setModalOpen] = useState(false);
	const { isLoggedIn } = useAuth();

	const onLoginClick = () => {
		setModalOpen(true);
	};

	const onSignupClick = () => {
		setModalOpen(true);
	};

	const onLogoutClick = async () => {
		await logout();
	};

	const onModalClose = () => {
		setModalOpen(false);
	};

	return (
		<>
			<LoginModal open={modalOpen} onClose={onModalClose} />
			<S.Bar>
				<S.LogoContainer>
					<S.Logo>RP</S.Logo>
					<S.LogoText>Novelists&apos; Corner</S.LogoText>
				</S.LogoContainer>
				<S.ActionsContainer>
					<ThemeToggle theme={theme} toggleTheme={toggleTheme} />
					<ShouldRender if={!isLoggedIn}>
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
					</ShouldRender>
					<ShouldRender if={isLoggedIn}>
						<S.ButtonsContainerDesktop>
							<Button onClick={onLogoutClick}>Log out</Button>
						</S.ButtonsContainerDesktop>
					</ShouldRender>
				</S.ActionsContainer>
			</S.Bar>
		</>
	);
};

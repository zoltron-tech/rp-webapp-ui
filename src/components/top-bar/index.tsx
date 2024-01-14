"use client";

import { FC, useEffect, useState } from "react";
import { Button, NovelistCard, SignupModal } from "@/components";

import * as S from "./styles";
import { Novelist } from "@/types/novelist";
import { ShouldRender } from "../should-render";

type Props = {};

const RAW_GIST_URL =
	"https://gist.githubusercontent.com/uqayyum/65d1e528c683939c7e03896465da3d5e/raw/0f1c3b2cafdf89e08c3379c307b3a8bc37149bdc/novelist.json";
export const TopBar: FC<Props> = () => {
	const [modalOpen, setModalOpen] = useState(false);
	const [novelists, setNovelists] = useState<Novelist[] | null>(null);

	const onLoginClick = () => {
		setModalOpen(true);
	};

	const onSignupClick = () => {
		setModalOpen(true);
	};

	const onModalClose = () => {
		setModalOpen(false);
	};

	const fetchData = async () => {
		const data = await fetch(RAW_GIST_URL);
		const json: Novelist[] = await data.json();
		setNovelists(json);
	};

	useEffect(() => {
		if (novelists) return;
		fetchData();
	}, []);

	return (
		<>
			<S.Bar>
				<S.LogoContainer>
					<S.Logo>RP</S.Logo>
					<S.LogoText>Novelists&apos; Corner</S.LogoText>
				</S.LogoContainer>
				<S.ButtonsContainer>
					<Button onClick={onLoginClick}>Log in</Button>
					<Button onClick={onSignupClick} variant="secondary">
						Sign up
					</Button>
				</S.ButtonsContainer>
				<SignupModal open={modalOpen} onClose={onModalClose} />
			</S.Bar>
			<ShouldRender if={!!novelists}>
				<S.NovelistCarouselContainer>
					<S.NovelistCarousel>
						{novelists?.map((novelist) => (
							<NovelistCard novelist={novelist} />
						))}
					</S.NovelistCarousel>
				</S.NovelistCarouselContainer>
			</ShouldRender>
		</>
	);
};

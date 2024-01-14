"use client";

import { FC } from "react";
import { Button } from "@/components";

import * as S from "./styles";

type Props = {};
export const TopBar: FC<Props> = () => {
	return (
		<S.Bar>
			<S.Logo>RP.</S.Logo>
			<S.ButtonsContainer>
				<Button>Log in</Button>
				<Button variant="secondary">Sign up</Button>
			</S.ButtonsContainer>
		</S.Bar>
	);
};

"use client";

import { Novelist } from "@/types/novelist";
import { FC, useRef, useState } from "react";

import * as S from "./styles";

type Props = {
	novelist?: Novelist | null;
};
export const NovelistCard: FC<Props> = ({ novelist }) => {
	if (!novelist) return <></>;

	return (
		<S.Card
			onClick={() => {
				console.log("clicked: ", novelist.firstName, novelist.lastName);
			}}
			className="novelist-card"
		>
			<S.CardHeader>
				<S.Avatar>
					<img src={novelist.image} />
				</S.Avatar>

				<S.NovelistInfo>
					<S.Title>
						{novelist.firstName} {novelist.lastName}
					</S.Title>
					<S.Username>{novelist.userName}</S.Username>
					<S.Email>{novelist.email}</S.Email>
				</S.NovelistInfo>
			</S.CardHeader>
			<S.MuseListContainer>
				<S.MuseListFade />
				<S.MuseList>
					{novelist.muses.map((muse) => (
						<S.Muse key={`${muse.firstName}-${muse.lastName}`}>
							<S.Muse.Avatar>
								<img src={muse.image} />
							</S.Muse.Avatar>

							<S.Muse.Name>
								{muse.firstName} {muse.lastName}
							</S.Muse.Name>
						</S.Muse>
					))}
				</S.MuseList>
			</S.MuseListContainer>
		</S.Card>
	);
};

"use client";

import { Novelist } from "@/types/novelist";
import { FC, useEffect, useState } from "react";

import * as S from "./styles";
import { ShouldRender } from "..";
import classNames from "classnames";
import { useSwiperSlide } from "swiper/react";
import { MdOutlineExpandLess, MdOutlineExpandMore } from "react-icons/md";
type Props = {
	novelist?: Novelist | null;
};
export const NovelistCard: FC<Props> = ({ novelist }) => {
	const [expanded, setExpanded] = useState(false);
	const { isActive } = useSwiperSlide();

	useEffect(() => {
		if (!isActive) {
			setTimeout(() => {
				setExpanded(false);
			}, 250);
		}
	}, [isActive]);

	if (!novelist) return <></>;

	return (
		<S.CardWrapper className={classNames({ expanded })}>
			<S.CardBackground banner={novelist.image} />
			<S.Card className="novelist-card">
				<S.ExpandButton
					onClick={() => setExpanded((current) => !current)}
					className={classNames({ expanded })}
				>
					<ShouldRender if={!expanded}>
						<MdOutlineExpandMore />
					</ShouldRender>
					<ShouldRender if={expanded}>
						<MdOutlineExpandLess />
					</ShouldRender>
				</S.ExpandButton>
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
				<ShouldRender if={expanded}>
					<S.MuseList>
						{novelist.muses.map((muse) => (
							<S.Muse key={`${muse.firstName}-${muse.lastName}`}>
								<S.Muse.Avatar>
									<img src={muse.image} />
								</S.Muse.Avatar>

								<S.Muse.Name>
									{muse.firstName}{" "}
									<span
										className={classNames([
											"muse-last-name",
										])}
									>
										{muse.lastName}
									</span>
								</S.Muse.Name>
							</S.Muse>
						))}
					</S.MuseList>
				</ShouldRender>
			</S.Card>
		</S.CardWrapper>
	);
};

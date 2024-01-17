import classNames from "classnames";
import { FC, ReactElement, useState } from "react";
import * as S from "./styles";
import { GoEye, GoEyeClosed } from "react-icons/go";
import { MdErrorOutline } from "react-icons/md";

interface Props {
	label: string;
	type: string;
	placeholder?: string;
	value?: string | boolean | number;
	defaultValue?: string | boolean | number;
	readOnly?: boolean;
	icon?: ReactElement;
	errorMsg?: any;
	longErrorMsg?: boolean;
	minDate?: string;
	maxDate?: string;
	inputProps?: any;
	onChange?: (val?: string) => void;
	pattern?: string;
}

export const Input: FC<Props> = (props) => {
	const [hidden, setHidden] = useState(true);
	const [passwordType, setPasswordType] = useState("password");
	const {
		icon,
		label,
		defaultValue,
		type,
		value,
		readOnly,
		inputProps,
		placeholder,
		errorMsg,
		longErrorMsg,
		minDate,
		maxDate,
		onChange,
		...rest
	} = props;
	const isPassword = type === "password";

	return (
		<S.InputWrapper>
			<S.InputContainer
				className={classNames({ "long-err": longErrorMsg })}
			>
				<S.Input
					key={defaultValue}
					aria-label={label}
					className={classNames({
						error: errorMsg,
						"left-icon": icon,
						"right-icon": isPassword,
					})}
					type={isPassword ? passwordType : type}
					placeholder={placeholder || " "}
					value={value}
					readOnly={readOnly}
					defaultValue={defaultValue}
					min={minDate}
					max={maxDate}
					onChange={(val): void => {
						if (onChange) onChange(val?.target?.value);
					}}
					{...inputProps}
					{...rest}
				/>
				<S.InputLabel>{label}</S.InputLabel>
				{isPassword && (
					<S.RightIconBox
						onClick={(): void => {
							setHidden(!hidden);
							if (hidden) setPasswordType("text");
							if (!hidden) setPasswordType("password");
						}}
					>
						{hidden ? <GoEyeClosed /> : <GoEye />}
					</S.RightIconBox>
				)}
			</S.InputContainer>
			<S.ErrorMsg className={classNames({ "long-err": longErrorMsg })}>
				<>
					<span>
						{errorMsg && typeof errorMsg !== "boolean" ? (
							<MdErrorOutline />
						) : (
							""
						)}
					</span>
					{errorMsg}
				</>
			</S.ErrorMsg>
		</S.InputWrapper>
	);
};

export default Input;

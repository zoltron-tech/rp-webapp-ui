import { FC, useEffect, useState } from "react";
import { Button, Input, Modal } from "@/components";
import { LoginPayload, LoginResponse } from "@/types";
import { login } from "@/app/actions";

import * as S from "./styles";
import { useTheme } from "styled-components";
import { generateToastSuccess } from "@/utils";

export type LoginModalProps = {
	open: boolean;
	onClose: () => void;
};
export const LoginModal: FC<LoginModalProps> = ({ open, onClose }) => {
	const [loading, setLoading] = useState<boolean>(false);
	const [email, setEmail] = useState<string>("example@gmail.com");
	const [password, setPassword] = useState<string>("12345678");
	const [error, setError] = useState<string>("");
	const theme = useTheme();

	const checkError = () => {
		if (!email || !password) {
			setError("Please fill in all fields");
			return;
		}

		const validEmail = email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);

		if (!validEmail) {
			setError("Please enter a valid email");
			return;
		}

		const validPassword = password.match(/^(?=.*\d).{8,}$/);

		if (!validPassword) {
			setError(
				"Password must be at least 8 characters long and contain at least one number"
			);
			return;
		}

		setError("");
	};

	const handleLogin = async (payload: LoginPayload) => {
		setLoading(true);

		const response: LoginResponse = await login(payload);

		console.log(response);

		if (response.message === "Success.") {
			generateToastSuccess("Logged in successfully", theme);
			onClose();
			console.log("success");
		}
		setLoading(false);
	};

	useEffect(() => {
		checkError();
	}, [email, password]);

	return (
		<Modal width={"400px"} open={open} onClose={onClose}>
			<S.Container>
				<S.Header>
					New user?<span className="link">Sign Up!</span>
				</S.Header>
				<S.Content>
					<Input
						label="Email"
						type="text"
						onChange={(value) => setEmail(value || "")}
						value={email}
					/>
					<Input
						label="Password"
						type="password"
						onChange={(value) => setPassword(value || "")}
						value={password}
						errorMsg={error}
					/>
					<S.Buttons>
						<Button
							onClick={() => handleLogin({ email, password })}
							variant="primary"
							disabled={!!error}
							loading={loading}
						>
							Log in
						</Button>
					</S.Buttons>
				</S.Content>
			</S.Container>
		</Modal>
	);
};

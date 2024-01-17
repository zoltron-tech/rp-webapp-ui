import toast from "react-hot-toast";
import { DefaultTheme } from "styled-components";

export const generateToastError = (
	errorMsg: string,
	theme: DefaultTheme,
	id = ""
) => {
	toast.error(errorMsg, {
		position: "top-right",

		style: { color: theme.danger },
	});
};

export const generateToastSuccess = (
	message: string,
	theme: DefaultTheme,
	id = ""
) => {
	toast.success(message, {
		position: "top-right",

		style: { color: theme.success },
	});
};

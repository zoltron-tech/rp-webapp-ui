import { useEffect, useState } from "react";

export const useAuth = () => {
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const cookies = document.cookie.split("; ");
	const token = cookies.find((cookie) => cookie.startsWith("rp_jwt="));

	console.log(cookies);

	useEffect(() => {
		const token = cookies.find((cookie) => cookie.startsWith("rp_jwt="));
		if (token) {
			setIsLoggedIn(true);
		}
	}, [token]);

	return {
		isLoggedIn,
	};
};

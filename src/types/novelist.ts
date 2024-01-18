export type Muse = {
	firstName: string;
	lastName: string;
	image: string;
	dateOfBirth: {
		year: number;
		month: string;
		day: number;
	};
};

export type Novelist = {
	firstName: string;
	lastName: string;
	userName: string;
	note: string;
	image: string;
	muses: Muse[];
};

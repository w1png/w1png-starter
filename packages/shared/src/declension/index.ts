type DeclensionInput = {
	"1": string;
	"2-4": string;
	"zero-or-rest": string;
};

export const daysDeclension: DeclensionInput = {
	"1": "день",
	"2-4": "дня",
	"zero-or-rest": "дней",
};

export const yearsDeclension: DeclensionInput = {
	"1": "год",
	"2-4": "года",
	"zero-or-rest": "лет",
};

export function getDeclension(input: DeclensionInput, n: number): string {
	const last2Digits = n % 100;
	const lastDigit = n % 10;

	if (last2Digits === 0) {
		return input["zero-or-rest"];
	}

	if (last2Digits > 10 && last2Digits < 20) {
		return input["zero-or-rest"];
	}

	if (lastDigit === 1) {
		return input["1"];
	}

	if (lastDigit >= 2 && lastDigit <= 4) {
		return input["2-4"];
	}

	return input["zero-or-rest"];
}

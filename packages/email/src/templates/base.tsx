import {
	Body,
	Container,
	Font,
	Head,
	Html,
	Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";

export default function EmailTemplate({ children }: { children: ReactNode }) {
	return (
		<Tailwind>
			<Html>
				<Head>
					<Font
						fallbackFontFamily="sans-serif"
						fontFamily="Inter"
						webFont={{
							url: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
							format: "woff2",
						}}
					/>
				</Head>
				<Body>
					<Container className="max-w-[50ch]">{children}</Container>
				</Body>
			</Html>
		</Tailwind>
	);
}

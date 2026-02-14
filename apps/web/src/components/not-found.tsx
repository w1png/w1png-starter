import Navbar from "@/routes/_landing/-navbar";
import { Link } from "@tanstack/react-router";
import { HouseIcon } from "lucide-react";
import { Button } from "./ui/button";
import Footer from "@/routes/_landing/-footer";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center">
			<Navbar />
			<div className="h-screen flex flex-col gap-4 items-center justify-center">
				<div className="flex flex-col items-center justify-center text-center">
					<h1 className="font-medium text-4xl">404</h1>
					<p className="text-muted-foreground">
						К сожалению, страница, которую вы ищете,
						<br />
						не существует или была удалена.
					</p>
				</div>
				<Link to="/" className="flex gap-2 w-full lg:w-fit">
					<Button className="grow">Вернуться на главную</Button>
					<Button className="size-11">
						<HouseIcon className="size-5" />
					</Button>
				</Link>
			</div>
			<Footer />
		</div>
	);
}

import { Button } from "./ui/button";
import { toast } from "sonner";

export default function ErrorComponent({
	error,
	reset,
}: {
	error: Error;
	reset: () => void;
}) {
	console.error(error);

	return (
		<div className="fixed w-screen h-screen inset-0 z-50">
			<div className="h-screen size-full relative flex items-center justify-center">
				<div className="mx-auto w-full flex flex-col gap-6 mt-10 max-w-md p-6 z-10 bg-sidebar rounded-xl text-sidebar-foreground shadow-md">
					<div className="flex flex-col gap-4 items-center justify-center">
						{/*
						<Logo className="w-16" />
            */}

						<div className="flex flex-col text-center gap-1 max-w-[30ch] select-none">
							<p className="text-2xl">Ошибка</p>
							<p className="text-muted-foreground text-sm">
								При загрузке страницы произошла ошибка.
							</p>
						</div>
					</div>
					<div className="flex flex-col gap-2">
						<Button className="w-full cursor-pointer" onClick={reset}>
							Попробовать ещё раз
						</Button>
						<Button
							className="w-full cursor-pointer text-foreground"
							onClick={() => {
								const sharableErrorWithStackAndCause = JSON.stringify({
									error: error,
									stack: error.stack,
									cause: error.cause,
								});
								navigator.clipboard.writeText(sharableErrorWithStackAndCause);
								toast.success("Ошибка скопирована в буфер обмена");
							}}
							variant="secondary"
						>
							Скопировать ошибку
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

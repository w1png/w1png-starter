import { toast } from "sonner";
import type { AdminRouterKeys, GetOutput } from "./types";
import { orpc, queryClient } from "@/lib/orpc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../ui/alert-dialog";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { Trash } from "lucide-react";
import { Button } from "../ui/button";

export function AutoAdminDelete({
	value,
	router: routerKey,
}: {
	value: GetOutput<AdminRouterKeys>;
	router: AdminRouterKeys;
}) {
	const [open, setOpen] = useState(false);

	const router = orpc[routerKey];
	const deleteMutation = useMutation(
		router.delete.mutationOptions({
			onSuccess: async () => {
				toast.success("Удалено");
				await queryClient.invalidateQueries({
					queryKey: router.getAll.key(),
				});
				setOpen(false);
			},
		}),
	);

	return (
		<AlertDialog open={open} onOpenChange={setOpen}>
			<AlertDialogTrigger asChild>
				<DropdownMenuItem onSelect={(e) => e.preventDefault()}>
					<Trash />
					<span>Удалить</span>
				</DropdownMenuItem>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Удалить занятие?</AlertDialogTitle>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Отмена</AlertDialogCancel>
					<AlertDialogAction asChild>
						<Button
							loading={deleteMutation.isPending}
							onClick={() => {
								deleteMutation.mutate({ id: value.id });
							}}
						>
							Удалить
						</Button>
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}

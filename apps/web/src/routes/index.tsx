import { orpc } from "@/utils/orpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: HomeComponent,
	async loader() {
		return await orpc.test.get.call();
	},
});

function HomeComponent() {
	const loaderData = Route.useLoaderData();
	const { data: res } = useQuery(
		orpc.test.get.queryOptions({
			initialData: loaderData,
		}),
	);

	return (
		<div className="flex flex-col gap-4 container">
			<p>{`client res: ${res}`}</p>
			<p>{`loader res: ${loaderData}`}</p>
		</div>
	);
}

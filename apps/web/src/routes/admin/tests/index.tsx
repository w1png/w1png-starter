import AutoAdmin from "@/components/auto-admin";
import { TestSchema } from "@lunarweb/shared/schemas";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/tests/")(
	AutoAdmin({
		schema: TestSchema,
		router: "tests",
		header: "тест",
	}),
);

import { PostgreSqlContainer } from "@testcontainers/postgresql";

export async function setupPostgresContainer() {
  console.log("SETUP POSTGRES");
  const container = await new PostgreSqlContainer().start();
  console.log(container.getConnectionUri());
  return container;
}

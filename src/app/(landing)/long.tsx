import { unstable_cache } from "next/cache";
import { api } from "~/server/api";

const getData = unstable_cache(
  async () => {
    return await api.long.get();
  },
  ["long"],
  {
    tags: ["long"],
    revalidate: 60,
  },
);

export default async function Long() {
  const { data } = await getData();

  return (
    <p className="">
      {data?.hello}
      <br />
      {data?.date.toLocaleString()}
    </p>
  );
}

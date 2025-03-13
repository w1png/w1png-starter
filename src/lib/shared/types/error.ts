import type { Treaty } from "@elysiajs/eden";

export class TreatyError<T extends Record<number, unknown>> extends Error {
  constructor(
    public readonly error:
      | Treaty.TreatyResponse<T>["error"]
      | {
          status: unknown;
          value: unknown;
        },
  ) {
    super(JSON.stringify(error));
    this.name = "TreatyError";
    Object.setPrototypeOf(this, TreatyError.prototype);
  }
}

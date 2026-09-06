export interface CrudService<Create, Update, Entity> {
	create(input: Create): Promise<Entity>;
	update(id: string, input: Update): Promise<Entity>;
	delete(id: string): Promise<void>;
	get(id: string): Promise<Entity>;
	getAll(): Promise<Entity[]>;
}

export class NotFoundError extends Error {
	constructor() {
		super("Resource not found");
		this.name = "NotFoundError";
	}
}

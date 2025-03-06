import type { Bindings } from "../types";

export async function getName(env: Bindings): Promise<string | null> {
	return await env.MY_KV.get("name");
}

export async function setName(env: Bindings, name: string): Promise<void> {
	await env.MY_KV.put("name", name);
}

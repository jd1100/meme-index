import { defineMiddleware } from "astro/middleware";
import { lucia } from "./lib/auth";
import { verifyRequestOrigin } from "lucia";
import { v4 as uuidv4 } from 'uuid';

export const onRequest = defineMiddleware(async (context, next) => {
	context.locals.jobId = uuidv4()
	context.locals.maxUploadSize = 1000000 * 1024 * 1024

	if (context.request.method !== "GET") {
		const originHeader = context.request.headers.get("Origin");
		const hostHeader = context.request.headers.get("Host");
		if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
			return new Response(null, {
				status: 403
			});
		}
	}

	const sessionId = context.cookies.get(lucia.sessionCookieName)?.value ?? null;
	if (!sessionId) {
		context.locals.user = null;
		context.locals.session = null;
		return next();
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
	}
	context.locals.session = session;
	context.locals.user = user;
	return next();
});
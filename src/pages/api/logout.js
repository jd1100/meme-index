import { lucia } from "../../lib/auth";

export async function GET(context) {
	if (!context.locals.session) {
		return new Response(null, {
			status: 401
		});
	}

	await lucia.invalidateSession(context.locals.session.id);

	const sessionCookie = lucia.createBlankSessionCookie();
	context.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);

	    // Get the Referer header, which contains the URL of the page that made the request
		const referer = context.request.headers.get('Referer');

		// If there's no Referer, you might want to redirect to a default page
		const redirectTo = referer || '/';
	
		// Return a response with a 302 status code and a Location header
		return new Response(null, {
			status: 302,
			headers: {
				'Location': redirectTo
			}
		});
}
import { HMAC } from 'https://deno.land/x/hmac@v2.0.1/mod.ts';
import { SHA256 } from 'https://deno.land/x/hmac@v2.0.1/deps.ts';
import { Buffer } from 'https://deno.land/std@0.177.0/node/buffer.ts';
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@1.32.1';

function timingSafeEqual(a: string, b: string): boolean {
	const bufA = new TextEncoder().encode(a);
	const bufB = new TextEncoder().encode(b);

	if (bufA.length !== bufB.length) {
		return false;
	}

	let result = 0;

	for (let i = 0; i < bufA.length; i++) {
		result |= bufA[i] ^ bufB[i];
	}

	return result === 0;
}

Deno.serve(async (request: Request) => {
	const webhook_id = request.headers.get('svix-id');
	const webhook_timestamp = request.headers.get('svix-timestamp');
	const signature = request.headers.get('svix-signature');

	if (!webhook_id || !webhook_timestamp || !signature) {
		console.log('Missing required headers');
		return new Response('Missing required headers', { status: 400 });
	}

	const body = await request.text();
	const signed_content = `${webhook_id}.${webhook_timestamp}.${body}`;
	const secret = Buffer.from(
		Deno.env.get('CLERK_SIGNING_SECRET')!.split('_')[1],
		'base64'
	);
	const expected_signature = new HMAC(new SHA256())
		.init(secret, 'base64')
		.update(signed_content)
		.digest('base64');

	try {
		timingSafeEqual(signature.split(',')[1], expected_signature);
	} catch (err) {
		console.log('Invalid Signature');
		return new Response('Invalid Signature', { status: 400 });
	}

	console.log('Signature Verified');
	const payload = JSON.parse(body);

	if (payload.type === 'user.created' || payload.type === 'user.updated') {
		const user = payload.data;

		console.log(`User ID: ${user.id}`);
		console.log(`First Name: ${user.first_name}`);
		console.log(`Last Name: ${user.last_name}`);
		console.log(`Email Address: ${user.email_addresses[0].email_address}`);

		const supabaseUrl = Deno.env.get('SUPABASE_URL');
		const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
		const supabase = createClient(supabaseUrl, supabaseKey);

		// Check if user already exists
		const { data: existingUser, error: selectError } = await supabase
			.from('users')
			.select('*')
			.eq('user_id', user.id)
			.single();

		if (selectError && selectError.code !== 'PGRST116') {
			// PGRST116: No results found
			console.log('Error fetching user data:', selectError.message);
			return new Response('Error fetching user data', { status: 500 });
		}

		if (!existingUser) {
			const { data, error } = await supabase.from('users').insert([
				{
					user_id: user.id,
					email: user.email_addresses[0].email_address,
					first_name: user.first_name,
					last_name: user.last_name,
					user_state: 'Active',
					created_at: new Date(),
					updated_at: new Date(),
					last_login_date: new Date(),
				},
			]);

			if (error) {
				console.log('Error inserting user data:', error.message);
				return new Response('Error inserting user data', { status: 500 });
			}

			console.log('User data inserted:', data);
		} else {
			console.log('User already exists. Skipping insertion.');
		}
	}

	return new Response(JSON.stringify({ ok: true }), {
		headers: { 'Content-Type': 'application/json' },
		status: 200,
	});
});

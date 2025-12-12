npx wrangler d1 create michaelmachohi
npx wrangler d1 execute michaelmachohi --remote --file=./schema.sql
npx wrangler d1 list
npx wrangler d1 execute michaelmachohi --local --command "SELECT * FROM users;"
curl -X POST https://backend.michaelmachohi.workers.dev/login \
  -H "Content-Type: application/json" \
  -d '{"email":"", "password":""}'
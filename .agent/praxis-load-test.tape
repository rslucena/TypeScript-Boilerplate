Output docs/public/praxis-load-test.gif
Set FontSize 14
Set Width 1000
Set Height 650
Set Padding 30
Set Theme "Catppuccin Macchiato"
Set WindowBar Colorful

Hide
Type 'export PS1="\e[36mpraxis-dev\e[0m:\e[34m~/app\e[0m$ "' Enter
Type "clear" Enter
Sleep 2s
Type "rm -rf src/domain/loadtest" Enter
Type "git restore src/functions/http-primary-webserver.ts" Enter
Type "podman exec redis redis-cli -a 65QaKz4Hn2KN flushall" Enter
Show

Sleep 500ms
Type "# Step 1: Generate a new CRUD domain" Enter
Type "bun gen:domain loadtest" Enter
Sleep 3s

Hide
# Patch routes for public access
Type "sed -i 's/request.restricted/request.noRestricted/g' src/domain/loadtest/routes.ts" Enter
# Sync database schema (handle prompt)
Type "bun db:migrate:push" Enter
Sleep 3s
Down
Sleep 500ms
Enter
Sleep 3s
# Increase rate limit and start server
Type "export RATE_LIMIT_MAX=1000000" Enter
Type "bun dev --workers=primary-webserver > /dev/null 2>&1 &" Enter
Sleep 8s
Type "clear" Enter
Show

Type "# Step 2: Create content via API" Enter
Type 'curl -s -X POST http://127.0.0.1:3000/api/v1/loadtests -H "Content-Type: application/json" -d "{\"name\": \"Praxis Performance\"}" | jq' Enter
Sleep 4s

Type "# Step 3: Brute force load test (100 connections)" Enter
Type "bunx autocannon -c 100 -d 5 http://127.0.0.1:3000/api/v1/loadtests" Enter
Sleep 15s

Hide
Type "kill %1" Enter
Sleep 1s

# Food Delivery Demo (Frontend + Backend)

This workspace now contains a small static frontend (`index.html`) with added animations and a simple Node/Express backend to persist orders.

What was added

- `index.html` — frontend UI with animations and a flying add-to-cart effect. It will try to fetch `/api/restaurants` and `/api/menu` at startup and falls back to bundled data if the API is unavailable.
- `server.js` — lightweight Express server that serves the static files and provides API endpoints:
  - `GET /api/restaurants` — returns restaurant list
  - `GET /api/menu` — returns menu items
  - `POST /api/orders` — accepts an order JSON and persists it to `orders.json`
- `orders.json` — storage for saved orders (array)
- `package.json` — start script and dependency (express)

Run locally

1. Install dependencies:

```bash
cd "d:/food delivery"
npm install
```

2. Start the server:

```bash
npm start
```

3. Open http://localhost:5000

Notes

- The server writes incoming orders to `orders.json` in the same folder.
- For development you can edit `index.html` and refresh the browser.
- If you prefer not to install Node, open `index.html` directly — the frontend will still work but orders won't be persisted to the backend.

Deployment (Docker)

You can build and run a Docker image to deploy the app:

```bash
cd "d:/food delivery"
docker build -t food-delivery-demo .
docker run -p 5000:5000 food-delivery-demo
```

Open http://localhost:5000 to view the app.

Credit

This app was created by Prakash.

Quick Docker Compose (recommended for local/development)

If you want the orders file to persist on the host and start the app with one command, use docker-compose (included):

```bash
cd "d:/food delivery"
docker compose up --build -d

# stop
docker compose down
```

Push to Docker Hub (optional)

1. Build and tag the image, replacing <youruser> with your Docker Hub username:

```bash
docker build -t <youruser>/food-delivery-demo:latest .
docker push <youruser>/food-delivery-demo:latest
```

2. On any host with Docker installed you can run:

```bash
docker run -p 5000:5000 <youruser>/food-delivery-demo:latest
```

Deploy to a managed container platform

- Render / Railway / Fly / DigitalOcean App Platform: connect the repository and set the start command to `npm start` (or build using the Dockerfile). Use a persistent disk/volume for `orders.json` if you need persisted orders.
- Heroku: this project works on Heroku because `package.json` has a `start` script; create an app and git push. For persistent storage, use a database (Heroku's filesystem is ephemeral).

Production recommendations

- Replace file-based `orders.json` with a database (SQLite, Postgres) before production.
- Use secure admin authentication (don't store credentials/tokens in code).
- Add HTTPS (TLS) via reverse proxy or platform-managed certs.


# Node MVC DynamoDB Demo

Simple Express + EJS MVC app backed by DynamoDB Local.

## Prerequisites
- Docker running with the DynamoDB Local stack (see `../docker_demo/docker-compose.yml` and run `docker compose up -d` there).
- Node.js 18+.

## Setup
```bash
cd node_mvc_dynamodb
cp .env.example .env   # adjust if needed
npm install
```

Create the table once (only if it does not exist):
```bash
aws dynamodb create-table \
  --table-name Products \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region us-west-2

  Note: even for DynamoDB Local you need dummy credentials. `.env` includes `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` (set to `local`).
```

## Run
```bash
npm start
# open http://localhost:3000/products

To run everything via Docker in this folder:
```
docker compose up -d --build
```
App: http://localhost:3000/products, GUI: http://localhost:8001, DynamoDB Local: http://localhost:8000
```

Routes:
- `GET /products` list
- `GET /products/new` form
- `POST /products` create
- `GET /products/:id/edit` edit form
- `POST /products/:id` update
- `POST /products/:id/delete` delete

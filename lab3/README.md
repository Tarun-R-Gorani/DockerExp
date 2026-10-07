# Simple Flask Items API

A small JSON REST API for creating, reading, replacing, and deleting items. Items are stored in memory and reset when the server restarts.

The dashboard at `http://127.0.0.1:5000/` explains the methods and lets you create, edit, and delete items in the browser.

Each item has an integer `id`, a required non-empty `name`, and an optional string `description` (defaults to an empty string).

## Run locally

From the workspace root, create and activate a virtual environment, then install Flask:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r lab3\requirements.txt
```

Start the server from the `lab3` directory:

```powershell
Set-Location lab3
python -m flask --app app run --debug
```

## Run with Docker

From the workspace root, build and start the container:

```powershell
docker build -t items-api ./lab3
docker run --rm -p 5000:5000 items-api
```

Open `http://127.0.0.1:5000/` to use the dashboard. Stop the container with `Ctrl+C`.

## Publish with GitHub Actions

The workflow at `.github/workflows/docker-publish.yml` builds and pushes an image when files under `lab3/` change on a pushed branch. It publishes a unique `sha-<commit>` tag for each push and publishes `latest` only for the repository's default branch. You can also start it manually from the repository's **Actions** tab.

Before using the workflow:

1. Create a Docker Hub repository named `items-api` under your Docker Hub account.
2. Create a Docker Hub access token with permission to read and write repositories.
3. In GitHub, open **Settings → Secrets and variables → Actions** and add these repository secrets:
	- `DOCKERHUB_USERNAME`: your Docker Hub username.
	- `DOCKERHUB_TOKEN`: the Docker Hub access token.

The pushed image is named `<dockerhub-username>/items-api`. For example, run it with `docker run --rm -p 5000:5000 <dockerhub-username>/items-api:latest`.

## Endpoints

| Method | Path | Behavior |
| --- | --- | --- |
| `GET` | `/items` | List all items |
| `GET` | `/items/<id>` | Retrieve one item |
| `POST` | `/items` | Create an item; returns `201` and a `Location` header |
| `PUT` | `/items/<id>` | Replace an item; returns `200` |
| `DELETE` | `/items/<id>` | Delete an item; returns `204` |

Invalid JSON or fields return `400`; requests for unknown IDs return `404`. Error responses have an `error` field.

Example create request:

```powershell
curl.exe -X POST http://127.0.0.1:5000/items -H "Content-Type: application/json" -d '{"name":"Notebook","description":"Grid paper"}'
```


from flask import Flask, jsonify, render_template, request, url_for


def create_app():
    app = Flask(__name__)
    items = {}
    next_item_id = 1

    def validated_payload():
        payload = request.get_json(silent=True)
        if not isinstance(payload, dict):
            return None

        name = payload.get("name")
        description = payload.get("description", "")
        if not isinstance(name, str) or not name.strip():
            return None
        if not isinstance(description, str):
            return None

        return {"name": name.strip(), "description": description}

    @app.get("/")
    def dashboard():
        return render_template("dashboard.html")

    @app.get("/items")
    def list_items():
        return jsonify(list(items.values()))

    @app.get("/items/<int:item_id>")
    def get_item(item_id):
        item = items.get(item_id)
        if item is None:
            return jsonify(error="Item not found"), 404
        return jsonify(item)

    @app.post("/items")
    def create_item():
        nonlocal next_item_id
        payload = validated_payload()
        if payload is None:
            return jsonify(error="Expected a JSON object with a non-empty name and a string description"), 400

        item = {"id": next_item_id, **payload}
        items[next_item_id] = item
        next_item_id += 1

        response = jsonify(item)
        response.status_code = 201
        response.headers["Location"] = url_for("get_item", item_id=item["id"])
        return response

    @app.put("/items/<int:item_id>")
    def replace_item(item_id):
        if item_id not in items:
            return jsonify(error="Item not found"), 404

        payload = validated_payload()
        if payload is None:
            return jsonify(error="Expected a JSON object with a non-empty name and a string description"), 400

        item = {"id": item_id, **payload}
        items[item_id] = item
        return jsonify(item)

    @app.delete("/items/<int:item_id>")
    def delete_item(item_id):
        if item_id not in items:
            return jsonify(error="Item not found"), 404
        del items[item_id]
        return "", 204

    return app


app = create_app()
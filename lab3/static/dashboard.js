const form = document.querySelector("[data-item-form]");
const nameInput = document.querySelector("#item-name");
const descriptionInput = document.querySelector("#item-description");
const itemsBody = document.querySelector("[data-items-body]");
const itemCount = document.querySelector("[data-item-count]");
const listCount = document.querySelector("[data-list-count]");
const notice = document.querySelector("[data-notice]");
const connectionDot = document.querySelector("[data-connection-dot]");
const connectionLabel = document.querySelector("[data-connection-label]");
const lastRequest = document.querySelector("[data-last-request]");
const formTitle = document.querySelector("#form-title");
const formIntro = document.querySelector("[data-form-intro]");
const submitLabel = document.querySelector("[data-submit-label]");
const cancelEdit = document.querySelector("[data-cancel-edit]");
let items = [];

function updateRequest(method, path, status) {
  lastRequest.textContent = `${method} ${path} - ${status}`;
}

function setConnection(online) {
  connectionDot.classList.toggle("is-online", online);
  connectionDot.classList.toggle("is-offline", !online);
  connectionLabel.textContent = online ? "API connected" : "API unavailable";
}

function showNotice(message, isError = false) {
  notice.hidden = false;
  notice.textContent = message;
  notice.classList.toggle("is-error", isError);
}

function addCell(row, value, className = "") {
  const cell = document.createElement("td");
  cell.textContent = value;
  if (className) cell.className = className;
  row.append(cell);
  return cell;
}

function renderItems() {
  itemsBody.replaceChildren();
  itemCount.textContent = String(items.length);
  listCount.textContent = `${items.length} ${items.length === 1 ? "item" : "items"}`;

  if (!items.length) {
    const row = document.createElement("tr");
    const cell = addCell(row, "No items yet. Create one to send your first POST request.", "table-message");
    cell.colSpan = 4;
    itemsBody.append(row);
    return;
  }

  for (const item of items) {
    const row = document.createElement("tr");
    addCell(row, String(item.id));
    addCell(row, item.name);
    addCell(row, item.description || "No description", "description-cell");
    const actions = document.createElement("td");
    const actionGroup = document.createElement("div");
    actionGroup.className = "row-actions";

    for (const [action, label] of [["edit", "Edit"], ["delete", "Delete"]]) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `row-action${action === "delete" ? " delete-action" : ""}`;
      button.dataset.action = action;
      button.dataset.id = String(item.id);
      button.textContent = label;
      actionGroup.append(button);
    }

    actions.append(actionGroup);
    row.append(actions);
    itemsBody.append(row);
  }
}

async function refreshItems(recordRequest = true) {
  try {
    const response = await fetch("/items");
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not load items");
    items = data;
    renderItems();
    setConnection(true);
    if (recordRequest) updateRequest("GET", "/items", response.status);
  } catch (error) {
    setConnection(false);
    showNotice(error.message, true);
    if (recordRequest) updateRequest("GET", "/items", "failed");
  }
}

function resetForm() {
  form.reset();
  delete form.dataset.editingId;
  formTitle.textContent = "Create an item";
  formIntro.textContent = "Send a JSON request to add a record to the collection.";
  submitLabel.firstChild.textContent = "Create item ";
  cancelEdit.hidden = true;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const editingId = form.dataset.editingId;
  const method = editingId ? "PUT" : "POST";
  const path = editingId ? `/items/${editingId}` : "/items";

  try {
    const response = await fetch(path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameInput.value, description: descriptionInput.value }),
    });
    const data = response.status === 204 ? {} : await response.json();
    updateRequest(method, path, response.status);
    if (!response.ok) throw new Error(data.error || "The request could not be completed");

    showNotice(method === "POST" ? "Item created successfully." : "Item updated successfully.");
    resetForm();
    await refreshItems(false);
  } catch (error) {
    showNotice(error.message, true);
  }
});

itemsBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const item = items.find((entry) => entry.id === Number(button.dataset.id));
  if (!item) return;

  if (button.dataset.action === "edit") {
    form.dataset.editingId = String(item.id);
    nameInput.value = item.name;
    descriptionInput.value = item.description;
    formTitle.textContent = `Edit item ${item.id}`;
    formIntro.textContent = "Save the replacement values with a PUT request.";
    submitLabel.firstChild.textContent = "Save changes ";
    cancelEdit.hidden = false;
    nameInput.focus();
    return;
  }

  if (!window.confirm(`Delete item ${item.id}?`)) return;
  const path = `/items/${item.id}`;
  try {
    const response = await fetch(path, { method: "DELETE" });
    updateRequest("DELETE", path, response.status);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Could not delete item");
    }
    showNotice(`Item ${item.id} deleted.`);
    await refreshItems(false);
  } catch (error) {
    showNotice(error.message, true);
  }
});

cancelEdit.addEventListener("click", resetForm);
document.querySelector("[data-refresh]").addEventListener("click", () => refreshItems());
refreshItems();
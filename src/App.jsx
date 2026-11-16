import { useReducer, useEffect, useState } from "react";
import "./App.css";

// Load todos from localStorage
function init() {
  try {
    const savedTodos = localStorage.getItem("todos");
    return savedTodos ? JSON.parse(savedTodos) : [];
  } catch (error) {
    console.error("Error loading todos:", error);
    return [];
  }
}

// Todo Reducer
function todoReducer(state, action) {
  switch (action.type) {
    case "ADD":
      return [...state, action.payload];

    case "TOGGLE":
      return state.map((todo) =>
        todo.id === action.payload
          ? { ...todo, done: !todo.done }
          : todo
      );

    case "DELETE":
      return state.filter(
        (todo) => todo.id !== action.payload
      );

    case "EDIT":
      return state.map((todo) =>
        todo.id === action.payload.id
          ? { ...todo, text: action.payload.text }
          : todo
      );

    case "CLEAR_DONE":
      return state.filter((todo) => !todo.done);

    default:
      return state;
  }
}

function App() {
  const [todos, dispatch] = useReducer(
    todoReducer,
    [],
    init
  );

  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("All");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  // Save todos whenever state changes
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Add Todo
  function handleAdd(e) {
    e.preventDefault();

    if (!input.trim()) return;

    const newTodo = {
      id: crypto.randomUUID(),
      text: input.trim(),
      done: false,
      createdAt: new Date().toISOString(),
    };

    dispatch({
      type: "ADD",
      payload: newTodo,
    });

    setInput("");
  }

  // Delete Todo
  function handleDelete(id) {
    dispatch({
      type: "DELETE",
      payload: id,
    });
  }

  // Toggle Todo
  function handleToggle(id) {
    dispatch({
      type: "TOGGLE",
      payload: id,
    });
  }

  // Start Editing
  function startEditing(todo) {
    setEditingId(todo.id);
    setEditText(todo.text);
  }

  // Save Editing
  function saveEdit(id) {
    if (editText.trim()) {
      dispatch({
        type: "EDIT",
        payload: {
          id,
          text: editText.trim(),
        },
      });
    }

    setEditingId(null);
    setEditText("");
  }

  // Cancel Editing
  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  // Filter Todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === "Active") return !todo.done;
    if (filter === "Completed") return todo.done;
    return true;
  });

  const remaining = todos.filter(
    (todo) => !todo.done
  ).length;

  return (
    <div className="app">
      <div className="todo-container">

        <header className="header">
          <p className="subtitle">MY PRODUCTIVITY</p>
          <h1>My Todo List</h1>
          <p className="description">
            Organize your day, one task at a time.
          </p>
        </header>

        {/* Add Todo Form */}
        <form className="todo-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          <button type="submit">+ Add</button>
        </form>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          {["All", "Active", "Completed"].map((item) => (
            <button
              key={item}
              className={filter === item ? "active" : ""}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <span>📝</span>
              <p>No tasks found!</p>
              <small>Add a new task to get started.</small>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div className="todo-item" key={todo.id}>

                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() => handleToggle(todo.id)}
                />

                {editingId === todo.id ? (
                  <input
                    className="edit-input"
                    value={editText}
                    autoFocus
                    onChange={(e) =>
                      setEditText(e.target.value)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        saveEdit(todo.id);
                      }

                      if (e.key === "Escape") {
                        cancelEdit();
                      }
                    }}
                    onBlur={() => saveEdit(todo.id)}
                  />
                ) : (
                  <span
                    className={`todo-text ${
                      todo.done ? "completed" : ""
                    }`}
                    onDoubleClick={() => startEditing(todo)}
                    title="Double-click to edit"
                  >
                    {todo.text}
                  </span>
                )}

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(todo.id)}
                  type="button"
                  title="Delete task"
                >
                  ✕
                </button>

              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <footer className="footer">
          <span>
            {remaining} {remaining === 1 ? "item" : "items"} left
          </span>

          <button
            onClick={() =>
              dispatch({ type: "CLEAR_DONE" })
            }
            type="button"
            disabled={!todos.some((todo) => todo.done)}
          >
            Clear completed
          </button>
        </footer>

      </div>
    </div>
  );
}

export default App;
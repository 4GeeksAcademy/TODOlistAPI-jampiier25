import React, { useState, useEffect } from "react";
import TodoService from "./TodoService";
import { useLocalStorageState } from "./useLocalStorageState";
import './TodoApp.css';

function TodoApp() {
  const [users, setUsers] = useLocalStorageState("todoUsers", ["jampiier", "pipe", "papa"]);
  const [tasksByUser, setTasksByUser] = useState({});
  const [expandedUsers, setExpandedUsers] = useState({});
  const [newUser, setNewUser] = useState("");
  const [newTask, setNewTask] = useState({});

  useEffect(() => {
    users.forEach((user) => {
      TodoService.getTasks(user)
        .then((tasks) =>
          setTasksByUser((prev) => ({ ...prev, [user]: tasks }))
        )
        .catch(() => {
          setTasksByUser((prev) => ({ ...prev, [user]: [] }));
        });
    });
  }, [users]);

  // Crear usuario
  const handleCreateUser = async () => {
    if (!newUser.trim()) return;
    try {
      await TodoService.createUser(newUser);
      if (!users.includes(newUser)) {
        setUsers([...users, newUser]);
      }
      setNewUser("");
    } catch (err) {
      console.error("Error al crear usuario:", err);
    }
  };

  // Añadir tarea
  const handleAddTask = async (username) => {
    const label = newTask[username];
    if (!label?.trim()) return;
    await TodoService.addTask(username, label);
    const updatedTasks = await TodoService.getTasks(username);
    setTasksByUser({ ...tasksByUser, [username]: updatedTasks });
    setNewTask({ ...newTask, [username]: "" });
  };

  // Editar tarea (sólo etiqueta, no cambia estado)
  const handleEditTask = async (username, id, label) => {
    // Buscamos tarea para obtener is_done actual
    const task = tasksByUser[username].find((t) => t.id === id);
    if (!task) return;
    const updatedTask = { label, is_done: task.is_done };
    await TodoService.updateTask(id, updatedTask);
    const updatedTasks = await TodoService.getTasks(username);
    setTasksByUser({ ...tasksByUser, [username]: updatedTasks });
  };

  // Toggle tarea hecha o no hecha
  const handleToggleDone = async (username, task) => {
    const updatedTask = { label: task.label, is_done: !task.is_done };
    await TodoService.updateTask(task.id, updatedTask);
    const updatedTasks = await TodoService.getTasks(username);
    setTasksByUser({ ...tasksByUser, [username]: updatedTasks });
  };

  // Eliminar tarea
  const handleDeleteTask = async (username, id) => {
    await TodoService.deleteTask(id);
    const updatedTasks = await TodoService.getTasks(username);
    setTasksByUser({ ...tasksByUser, [username]: updatedTasks });
  };

  // Eliminar todas las tareas
  const handleClearAll = async (username) => {
    await TodoService.clearAllTasks(tasksByUser[username] || []);
    setTasksByUser({ ...tasksByUser, [username]: [] });
  };

  // Eliminar usuario
  const handleDeleteUser = async (username) => {
    await TodoService.deleteUser(username);
    setUsers(users.filter((u) => u !== username));
    const copy = { ...tasksByUser };
    delete copy[username];
    setTasksByUser(copy);
    const copyExpanded = { ...expandedUsers };
    delete copyExpanded[username];
    setExpandedUsers(copyExpanded);
  };

  // Desplegable usuario
  const toggleExpandUser = (username) => {
    setExpandedUsers((prev) => ({
      ...prev,
      [username]: !prev[username],
    }));
  };

  return (
    <div className="container mt-4 notebook">
      <h2 className="mb-4">Usuarios y tareas</h2>

      <div className="input-group mb-3">
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
          className="form-control"
          placeholder="Nuevo usuario"
        />
        <button onClick={handleCreateUser} className="btn btn-primary">
          Crear usuario
        </button>
      </div>

      {users.length === 0 ? (
        <p>No hay usuarios creados.</p>
      ) : (
        users.map((username) => (
          <div key={username} className="card mb-3">
            <div
              className="card-header d-flex justify-content-between align-items-center"
              onClick={() => toggleExpandUser(username)}
              style={{ cursor: "pointer" }}
            >
              <strong>{username}</strong>
              <span>{expandedUsers[username] ? "🔽" : "▶️"}</span>
            </div>

            {expandedUsers[username] && (
              <>
                <ul className="list-group list-group-flush">
                  {(tasksByUser[username] || []).map((task) => (
                    <li
                      key={task.id}
                      className="list-group-item d-flex justify-content-between align-items-center"
                      style={{
                        color: task.is_done ? "green" : "gray",
                        fontWeight: task.is_done ? "bold" : "normal",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={task.is_done}
                        onChange={() => handleToggleDone(username, task)}
                        className="me-2"
                      />
                      <input
                        defaultValue={task.label}
                        className="form-control me-2 "
                        onBlur={(e) =>
                          handleEditTask(username, task.id, e.target.value)
                        }
                        style={{
                          color: task.is_done ? "green" : "gray",
                        }}
                      />
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteTask(username, task.id)}
                      >
                        🗑️
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="card-footer">
                  <div className="input-group mb-2">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Nueva tarea"
                      value={newTask[username] || ""}
                      onChange={(e) =>
                        setNewTask({ ...newTask, [username]: e.target.value })
                      }
                    />
                    <button
                      onClick={() => handleAddTask(username)}
                      className="btn btn-success"
                    >
                      Añadir
                    </button>
                  </div>
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => handleClearAll(username)}
                    >
                      Borrar todas las tareas
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(username)}
                    >
                      Eliminar usuario
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default TodoApp;
const BASE_URL = "https://playground.4geeks.com/todo";

const TodoService = {
    //crear usuario si no tenemos//
  createUser: (username) => {
    return fetch(`${BASE_URL}/users/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([]),
    });
  },

  //obtenemos el usuario creado y vemnos su informacion //
  getTasks: (username) => {
    return fetch(`${BASE_URL}/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Usuario no encontrado");
        return res.json();
      })
      .then((data) => data.todos || []);
  },

  //añadimos informacion o tareas //
  addTask: (username, label) => {
    const task = { label, is_done: false };
    return fetch(`${BASE_URL}/todos/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(task),
    });
  },

  //editamos o actualizamos la informacion o tareas//
  updateTask: (id, updatedTask) => {
    return fetch(`${BASE_URL}/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTask),
    });
  },

  //eliminamos por id//
  deleteTask: (id) => {
    return fetch(`${BASE_URL}/todos/${id}`, {
      method: "DELETE",
    });
  },

  //eliminamos todo//
  clearAllTasks: (tasks) => {
    const deletes = tasks.map(task =>
      fetch(`${BASE_URL}/todos/${task.id}`, { method: "DELETE" })
    );
    return Promise.all(deletes);
  },

  //eliminamos usuarios//
  deleteUser: async (username) => {
    const tasks = await TodoService.getTasks(username);
    return TodoService.clearAllTasks(tasks);
  }
};

export default TodoService;
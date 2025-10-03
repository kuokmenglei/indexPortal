import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "leaflet/dist/leaflet.css";

const localizer = momentLocalizer(moment);

function App() {
  const [tasks, setTasks] = useState([]);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("pending");
  const [priority, setPriority] = useState("low");
  const [dueDate, setDueDate] = useState("");
  const [location, setLocation] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const saved = localStorage.getItem("tasks_react");
    if (saved) setTasks(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("tasks_react", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (!description.trim()) return;
    const newTask = {
      id: Date.now().toString(),
      description,
      status,
      priority,
      dueDate,
      location,
    };
    setTasks([newTask, ...tasks]);
    setDescription("");
    setDueDate("");
    setLocation("");
    setPriority("low");
    setStatus("pending");
  };

  const toggleStatus = (id) => {
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: t.status === "pending" ? "completed" : "pending" }
          : t
      )
    );
  };

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id));

  const filteredTasks = tasks.filter((t) =>
    filter === "all" ? true : t.status === filter
  );

  const events = tasks
    .filter((t) => t.dueDate)
    .map((t) => ({
      id: t.id,
      title: t.description,
      start: new Date(t.dueDate),
      end: new Date(t.dueDate),
    }));

  return (
    <div className="p-4 space-y-6">
      <header className="flex justify-between items-center">
        <h1 className="text-xl font-bold">React Task Manager</h1>
        <div className="space-x-2">
          <button onClick={() => setFilter("all")}>All</button>
          <button onClick={() => setFilter("pending")}>Pending</button>
          <button onClick={() => setFilter("completed")}>Completed</button>
        </div>
      </header>

      <section>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (lat,lng)"
        />
        <button onClick={addTask}>Add Task</button>
      </section>

      <section>
        {filteredTasks.length === 0 && <p>No tasks</p>}
        {filteredTasks.map((task) => (
          <div key={task.id} style={{ border: "1px solid #ddd", margin: 4, padding: 6 }}>
            <p className={task.status === "completed" ? "line-through" : ""}>
              {task.description}
            </p>
            <small>
              {task.priority.toUpperCase()} {task.dueDate && `| Due ${task.dueDate}`}{" "}
              {task.location && `| ${task.location}`}
            </small>
            <div>
              <button onClick={() => toggleStatus(task.id)}>
                {task.status === "pending" ? "Mark Done" : "Mark Pending"}
              </button>
              <button onClick={() => deleteTask(task.id)}>Delete</button>
            </div>
          </div>
        ))}
      </section>

      <section style={{ height: "400px" }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%" }}
        />
      </section>

      <section style={{ height: "400px" }}>
        <MapContainer
          center={[37.7749, -122.4194]}
          zoom={3}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {tasks
            .filter((t) => t.location)
            .map((t) => {
              const [lat, lng] = t.location.split(",").map(Number);
              if (isNaN(lat) || isNaN(lng)) return null;
              return (
                <Marker key={t.id} position={[lat, lng]}>
                  <Popup>
                    <strong>{t.description}</strong>
                    <br /> {t.dueDate || "No due date"}
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </section>
    </div>
  );
}

export default App;
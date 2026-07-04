import { useEffect, useState } from "react";
import { FaCheckCircle, FaTasks } from "react-icons/fa";
import { getPortalResource } from "../../utils/portalDataApi";
import EmployeePortalLayout from "./EmployeePortalLayout";

const fallbackTasks = [
  { title: "Submit weekly research summary", due: "Today, 4:00 PM", priority: "High" },
  { title: "Review assignment brief updates", due: "Tomorrow, 11:30 AM", priority: "Medium" },
  { title: "Update project tracker notes", due: "Friday, 2:00 PM", priority: "Medium" },
  { title: "Prepare frontend glossary draft", due: "Monday, 10:00 AM", priority: "Low" },
];

function EmployeeTasks({ activePage, onNavigate }) {
  const [tasks, setTasks] = useState(fallbackTasks);

  useEffect(() => {
    getPortalResource("tasks", fallbackTasks).then((data) => {
      setTasks(Array.isArray(data) && data.length ? data : fallbackTasks);
    });
  }, []);

  return (
    <EmployeePortalLayout activePage={activePage} eyebrow="Tasks" title="Task Workspace" onNavigate={onNavigate}>
      <section className="portal-card">
        <div className="card-heading">
          <div><span>Pending</span><h3>Assigned Tasks</h3></div>
          <FaTasks />
        </div>
        <div className="task-list">
          {tasks.map((task) => (
            <div className="task-row" key={task.title}>
              <FaCheckCircle />
              <div><strong>{task.title}</strong><small>{task.due} - {task.priority}</small></div>
            </div>
          ))}
        </div>
      </section>
    </EmployeePortalLayout>
  );
}

export default EmployeeTasks;

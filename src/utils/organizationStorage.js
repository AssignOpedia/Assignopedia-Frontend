import { createApiResourceStore } from "./apiResourceStore";

const employeeEvent = "assignopedia-employee-updated";
const organizationEvent = "assignopedia-organization-updated";
const employeeCountEvent = "assignopedia-employee-count-updated";

const defaultDepartments = [
  { id: "dept-1", name: "Technical Team", lead: "Tapajit Da", members: "12 Members" },
  { id: "dept-2", name: "Content Team", lead: "Ritika Sharma", members: "18 Members" },
  { id: "dept-3", name: "HR Operations", lead: "HR Admin", members: "5 Members" },
  { id: "dept-4", name: "Quality Review", lead: "Nisha Roy", members: "9 Members" },
];

const employeeStore = createApiResourceStore({
  resource: "employees",
  event: employeeEvent,
  fallback: [],
});

const departmentStore = createApiResourceStore({
  resource: "departments",
  event: organizationEvent,
  fallback: defaultDepartments,
});

const normalizeEmployeeId = (id) => String(id || "").trim().toLowerCase();

export const createEmployeeID = (id, name, department, jobCode, email) => {
  const employees = employeeStore.get();
  const newEmployee = {
    id,
    name,
    department,
    jobCode,
    email,
    createdAt: new Date().toLocaleDateString(),
  };

  employeeStore.save([...employees, newEmployee]).catch(() => {});
  return newEmployee;
};

export const getEmployees = () => employeeStore.get();

export const updateEmployeeID = (id, updates) => {
  const employees = employeeStore.get();
  const normalizedId = normalizeEmployeeId(id);
  const nextEmployees = employees.map((emp) =>
    normalizeEmployeeId(emp.id) === normalizedId ? { ...emp, ...updates } : emp
  );
  const updated = nextEmployees.find((emp) => normalizeEmployeeId(emp.id) === normalizedId) || null;

  if (updated) {
    employeeStore.save(nextEmployees).catch(() => {});
  }

  return updated;
};

export const deleteEmployee = (id) => {
  employeeStore.save(employeeStore.get().filter((emp) => emp.id !== id)).catch(() => {});
};

export const getTotalEmployeeCount = () => getEmployees().length + 126;

export const getEmployeeEvent = () => employeeEvent;

export const getDepartments = () => departmentStore.get();

export const createDepartment = (name, lead, members) => {
  const departments = departmentStore.get();
  const newDept = {
    id: `dept-${Date.now()}`,
    name,
    lead,
    members,
  };

  departmentStore.save([...departments, newDept]).catch(() => {});
  return newDept;
};

export const updateDepartment = (id, updates) => {
  const departments = departmentStore.get();
  const nextDepartments = departments.map((dept) =>
    dept.id === id ? { ...dept, ...updates } : dept
  );
  const updated = nextDepartments.find((dept) => dept.id === id) || null;

  if (updated) {
    departmentStore.save(nextDepartments).catch(() => {});
  }

  return updated;
};

export const deleteDepartment = (id) => {
  departmentStore.save(getDepartments().filter((dept) => dept.id !== id)).catch(() => {});
};

export const getTotalEmployees = () => 126;

let savedTotalEmployees = 126;

export const setTotalEmployees = (count) => {
  savedTotalEmployees = Number(count) || 126;
  window.dispatchEvent(new CustomEvent(employeeCountEvent, { detail: savedTotalEmployees }));
};

export const getSavedTotalEmployees = () => savedTotalEmployees;

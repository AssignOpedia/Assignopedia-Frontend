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
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export const createEmployeeID = async (id, name, department, jobCode, email) => {
  const employees = employeeStore.get();
  const normalizedEmail = normalizeEmail(email);
  const newEmployee = {
    id: id.trim(),
    name: name.trim(),
    department: department.trim(),
    jobCode: jobCode.trim(),
    email: normalizedEmail,
    createdAt: new Date().toLocaleDateString(),
  };

  await employeeStore.save([...employees, newEmployee]);
  return newEmployee;
};

export const getEmployees = () => employeeStore.get();

export const loadEmployees = () => employeeStore.load();

export const getEmployeeByEmail = (email) => {
  const normalizedEmail = normalizeEmail(email);

  return employeeStore.get().find((employee) => normalizeEmail(employee.email) === normalizedEmail) || null;
};

export const updateEmployeeID = async (id, updates) => {
  const employees = employeeStore.get();
  const normalizedId = normalizeEmployeeId(id);
  const normalizedUpdates = {
    ...updates,
    ...(updates.id ? { id: updates.id.trim() } : {}),
    ...(updates.email ? { email: normalizeEmail(updates.email) } : {}),
  };
  const nextEmployees = employees.map((emp) =>
    normalizeEmployeeId(emp.id) === normalizedId ? { ...emp, ...normalizedUpdates } : emp
  );
  const updated =
    nextEmployees.find((emp) => normalizeEmployeeId(emp.id) === normalizeEmployeeId(normalizedUpdates.id)) ||
    nextEmployees.find((emp) => normalizeEmployeeId(emp.id) === normalizedId) ||
    null;

  if (updated) {
    await employeeStore.save(nextEmployees);
  }

  return updated;
};

export const deleteEmployee = async (id) => {
  const normalizedId = normalizeEmployeeId(id);
  await employeeStore.save(employeeStore.get().filter((emp) => normalizeEmployeeId(emp.id) !== normalizedId));
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

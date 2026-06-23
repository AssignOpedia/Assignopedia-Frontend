const employeeStorageKey = "assignopediaEmployees";
const organizationStorageKey = "assignopediaOrganization";
const employeeEvent = "assignopedia-employee-updated";

// Employee Management
const readEmployees = () => {
  try {
    return JSON.parse(localStorage.getItem(employeeStorageKey)) || [];
  } catch {
    return [];
  }
};

const saveEmployees = (employees) => {
  localStorage.setItem(employeeStorageKey, JSON.stringify(employees));
  window.dispatchEvent(new CustomEvent(employeeEvent));
};

const normalizeEmployeeId = (id) => String(id || "").trim().toLowerCase();

export const createEmployeeID = (id, name, department, jobCode, email) => {
  const employees = readEmployees();
  const newEmployee = {
    id,
    name,
    department,
    jobCode,
    email,
    createdAt: new Date().toLocaleDateString(),
  };

  employees.push(newEmployee);
  saveEmployees(employees);
  return newEmployee;
};

export const getEmployees = () => {
  return readEmployees();
};

export const updateEmployeeID = (id, updates) => {
  const employees = readEmployees();
  const normalizedId = normalizeEmployeeId(id);
  const index = employees.findIndex((emp) => normalizeEmployeeId(emp.id) === normalizedId);

  if (index !== -1) {
    employees[index] = { ...employees[index], ...updates };
    saveEmployees(employees);
    return employees[index];
  }

  return null;
};

export const deleteEmployee = (id) => {
  const employees = readEmployees();
  const filtered = employees.filter((emp) => emp.id !== id);
  saveEmployees(filtered);
};

export const getTotalEmployeeCount = () => {
  return readEmployees().length + 126; // 126 is base count
};

export const getEmployeeEvent = () => employeeEvent;

// Organization Management
const readOrganization = () => {
  try {
    return JSON.parse(localStorage.getItem(organizationStorageKey)) || [];
  } catch {
    return [];
  }
};

const saveOrganization = (departments) => {
  localStorage.setItem(organizationStorageKey, JSON.stringify(departments));
  window.dispatchEvent(new CustomEvent("assignopedia-organization-updated"));
};

export const getDepartments = () => {
  const stored = readOrganization();
  if (stored.length === 0) {
    return [
      { id: "dept-1", name: "Development Team", lead: "Tapajit Da", members: "12 Members" },
      { id: "dept-2", name: "Content Team", lead: "Ritika Sharma", members: "18 Members" },
      { id: "dept-3", name: "HR Operations", lead: "HR Admin", members: "5 Members" },
      { id: "dept-4", name: "Quality Review", lead: "Nisha Roy", members: "9 Members" },
    ];
  }
  return stored;
};

export const createDepartment = (name, lead, members) => {
  const departments = readOrganization();
  const newDept = {
    id: `dept-${Date.now()}`,
    name,
    lead,
    members,
  };

  departments.push(newDept);
  saveOrganization(departments);
  return newDept;
};

export const updateDepartment = (id, updates) => {
  const departments = readOrganization();
  const index = departments.findIndex((dept) => dept.id === id);

  if (index !== -1) {
    departments[index] = { ...departments[index], ...updates };
    saveOrganization(departments);
    return departments[index];
  }

  return null;
};

export const deleteDepartment = (id) => {
  const departments = readOrganization();
  const filtered = departments.filter((dept) => dept.id !== id);
  saveOrganization(filtered);
};

export const getTotalEmployees = () => {
  return 126; // Base count
};

export const setTotalEmployees = (count) => {
  localStorage.setItem("assignopediaTotalEmployees", count.toString());
  window.dispatchEvent(new CustomEvent("assignopedia-employee-count-updated"));
};

export const getSavedTotalEmployees = () => {
  const saved = localStorage.getItem("assignopediaTotalEmployees");
  return saved ? parseInt(saved, 10) : 126;
};

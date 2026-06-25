const today = new Date().toISOString();

const team = {
  leader: {
    id: "leader",
    name: "Raj Da",
    role: "CEO",
    imageDataUrl: "",
    imageName: "",
  },
  members: [
    { id: "hr-management", name: "HR Management", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "hr-name-1", name: "HR Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "hr-name-2", name: "HR Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "operation-management", name: "Operation Management", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "bdm-name", name: "BDM Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "digital-marketing", name: "Digital Marketing Executive Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "bdm-name-2", name: "BDM Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "team-lead", name: "Team Lead", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "team-lead-name", name: "Team Lead name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-1", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-2", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-3", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" },
    { id: "writer-4", name: "Technical Content Writer Name", role: "Team Member", imageDataUrl: "", imageName: "" }
  ],
};

const departments = [
  { id: "dept-1", name: "Development Team", lead: "Tapajit Da", members: "12 Members" },
  { id: "dept-2", name: "Content Team", lead: "Ritika Sharma", members: "18 Members" },
  { id: "dept-3", name: "HR Operations", lead: "HR Admin", members: "5 Members" },
  { id: "dept-4", name: "Quality Review", lead: "Nisha Roy", members: "9 Members" },
];

const notices = [
  { id: "default-1", title: "Updated holiday calendar is available for review.", date: "Jun 16", body: "The revised annual holiday list is now available." },
  { id: "default-2", title: "June payroll inputs close on Friday at 5 PM.", date: "Jun 18", body: "Submit payroll inputs before Friday 5 PM." },
  { id: "default-3", title: "WFH approval SLA revised to one working day.", date: "Jun 20", body: "WFH requests will be reviewed within one working day." },
];

const accounts = [
  { id: "account-admin", name: "Raj Da", email: "raj.admin@assignopedia.com", password: "admin123", role: "admin", createdAt: today },
  { id: "account-hr", name: "HR Admin", email: "hr@assignopedia.com", password: "hr123", role: "hr", createdAt: today },
  { id: "account-employee", name: "Employee", email: "employee@assignopedia.com", password: "employee123", role: "employee", createdAt: today }
];

const profiles = {
  "employee:employee@assignopedia.com": {
    name: "Employee",
    email: "employee@assignopedia.com",
    title: "Technical Content Writer",
    employeeId: "EMP-240128",
    jobCode: "FE-12",
    phone: "+91 98765 43210",
    location: "Kolkata, India",
    summary: "Experienced technical content writer supporting Assignopedia with structured project writeups, user-focused documentation, and quality-first delivery.",
    availability: "Available for assigned work"
  },
  "hr:hr@assignopedia.com": {
    name: "HR Admin",
    email: "hr@assignopedia.com",
    title: "Human Resources",
    phone: "+91 98765 43211",
    location: "Kolkata, India",
    department: "HR Operations"
  },
  "admin:raj.admin@assignopedia.com": {
    name: "Raj Da",
    email: "raj.admin@assignopedia.com",
    title: "Administrator",
    phone: "+91 98765 43212",
    location: "Kolkata, India",
    department: "Administration"
  }
};

const adminEmployees = [
  { id: "emp-admin-1", name: "Ananya Sen", role: "Project Lead", team: "Delivery", status: "Present", score: 94 },
  { id: "emp-admin-2", name: "Rahul Verma", role: "Frontend Engineer", team: "Engineering", status: "Present", score: 89 },
  { id: "emp-admin-3", name: "Meera Joshi", role: "QA Analyst", team: "Quality", status: "Absent", score: 82 },
  { id: "emp-admin-4", name: "Arjun Mehta", role: "Sales Manager", team: "Revenue", status: "Present", score: 91 },
  { id: "emp-admin-5", name: "Nisha Roy", role: "Support Specialist", team: "Support", status: "Absent", score: 77 }
];

module.exports = {
  accounts,
  attendance: [],
  blogPosts: [],
  contactSubmissions: [],
  cvApplications: [],
  departments,
  employees: [],
  adminEmployees,
  hrNotifications: [],
  employeeNotifications: [],
  leaveRequests: [],
  notices,
  passwordResetRequests: [],
  profiles,
  revenue: [],
  reports: [],
  settings: {},
  systemEvents: [],
  tasks: [],
  team,
  wfhRequests: [],
};

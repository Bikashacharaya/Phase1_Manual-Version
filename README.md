🎓 School Equipment Lending Portal — Phase 1
📘 Project Overview

The School Equipment Lending Portal is a full-stack web application that helps manage borrowing and returning of school or laboratory equipment.
It streamlines how students request, staff approve, and admins manage equipment through an easy-to-use dashboard.

Phase 1 focuses on implementing the core backend and frontend functionality, ensuring basic CRUD operations and workflows work end-to-end.

🧩 Tech Stack
Layer	Technology
Frontend	React (v18) — functional components, React Router
Styling	Simple CSS (clean functional UI)
Backend	Python Flask (REST API)
Database	MongoDB
API Base URL	/v1/

🧠 Functional Overview (Phase 1)
👥 User Roles
Role	Description
Student	View available equipment, request items, and track requests.
Staff	View pending requests, approve/reject them, and mark approved loans as returned.
Admin	Full control — manage equipment inventory, add/edit/delete items, approve/return loans, and view all activities.

⚙️ Core Functionalities Implemented

1️⃣ User Authentication
Signup & Login pages connected to Flask backend (/v1/auth/signup, /v1/auth/login).
Role selection during signup (Student / Staff / Admin).
Role-based access control for routes and dashboard options.
JWT/session handled through a simple auth utility.

2️⃣ Equipment Management
Admin can:
Add Equipment
Edit Equipment
Delete Equipment
Each item stores: name, category, condition, quantity, and available.
Real-time dashboard updates using API integration.

3️⃣ Loan Management
Students can request available equipment
Staff/Admin can:
Approve or reject loan requests
View approved loans
Mark items as returned
System automatically updates equipment availability when approved or returned.

4️⃣ Role-Based Dashboards
Page	Role	Description
Dashboard	All	View equipment list; students can request, admins can edit/delete.
Pending Requests	Staff/Admin	Approve or reject pending loan requests.
Approved Loans	Staff/Admin	View approved loans and mark as returned.
My Loans	All	View personal or all loans depending on role.

💬 Frontend Features
Notification banners for all API responses (success/error).
Clean, responsive tables for equipment and loan data.
Smooth navigation using React Router.
Role-specific Navbar links:
Student → Dashboard | My Loans | Logout
Staff → Dashboard | My Loans | Pending | Approved | Logout
Admin → Dashboard | My Loans | Add Item | Pending | Approved | Logout

✅ Phase 1 Deliverables Summary
✔ Flask backend with MongoDB integration
✔ User authentication and role management
✔ Equipment CRUD operations
✔ Loan request, approval, rejection, and return flows
✔ React frontend with dynamic dashboards and API integration
✔ Inline notifications for better UX
✔ Clean modular folder structure

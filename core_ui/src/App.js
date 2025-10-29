import React from "react";
import {Routes, Route, Navigate} from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import EquipmentForm from "./pages/EquipmentForm";
import PendingRequests from "./pages/PendingRequests";
import MyLoans from "./pages/MyLoans";
import PrivateRoute from "./components/PrivateRoute";
import ApprovedLoans from "./pages/ApprovedLoans";
import EquipmentEdit from "./pages/EquipmentEdit";

function App() {
    return (
        <div>
            <Navbar/>
            <main className="container">
                <Routes>
                    {/* Redirect root to dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace/>}/>

                    {/* Public routes */}
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/signup" element={<Signup/>}/>

                    {/* Protected routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Dashboard/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/equipment/new"
                        element={
                            <PrivateRoute roles={["admin"]}>
                                <EquipmentForm/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/pending"
                        element={
                            <PrivateRoute roles={["staff", "admin"]}>
                                <PendingRequests/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/approved"
                        element={
                            <PrivateRoute roles={["staff", "admin"]}>
                                <ApprovedLoans/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/equipment/edit/:id"
                        element={
                            <PrivateRoute roles={["admin"]}>
                                <EquipmentEdit/>
                            </PrivateRoute>
                        }
                    />

                    <Route
                        path="/my-loans"
                        element={
                            <PrivateRoute>
                                <MyLoans/>
                            </PrivateRoute>
                        }
                    />

                    {/* Fallback route */}
                    <Route path="*" element={<div>404 - Not Found</div>}/>
                </Routes>
            </main>
        </div>
    );
}

export default App;

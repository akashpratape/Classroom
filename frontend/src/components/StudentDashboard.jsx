import React, { useState, useEffect } from "react";
import { Table, Button } from "react-bootstrap";

function StudentDashboard() {
    const [students, setStudents] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch("/api/students");
            if (!response.ok) {
                throw new Error("Error fetching students");
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleEdit = (id) => {
        // Implement edit functionality
        console.log("Edit student with ID:", id);
    };

    return (
        <div>
            <h2>Student Dashboard</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Reg. No</th>
                        <th>Name</th>
                        <th>Department</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student) => (
                        <tr key={student.reg_no}>
                            <td>{student.reg_no}</td>
                            <td>{student.name}</td>
                            <td>{student.department}</td>
                            <td>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
}

export default StudentDashboard;

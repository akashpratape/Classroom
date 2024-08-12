import React, { useState, useEffect } from 'react';
import { Table, Button, Form } from 'react-bootstrap';

function TeacherDashboard() {
  const [students, setStudents] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      try {
        const response = await fetch('https://classroom-om4x.onrender.com/api/students');
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setStudents(data);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching students:', error);
      }
    }

    fetchStudents();
  }, []);

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleCancelEdit = () => {
    setEditingStudent(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditingStudent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`https://classroom-om4x.onrender.com/api/students/${editingStudent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStudent),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedStudent = await response.json();
      setStudents((prevState) =>
        prevState.map((student) =>
          student.id === updatedStudent.id ? updatedStudent : student
        )
      );
      setEditingStudent(null);
    } catch (error) {
      setError(error.message);
      console.error('Error updating student:', error);
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const response = await fetch(`https://classroom-om4x.onrender.com/api/students/${studentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setStudents((prevState) =>
        prevState.filter((student) => student.id !== studentId)
      );
    } catch (error) {
      setError(error.message);
      console.error('Error deleting student:', error);
    }
  };

  return (
    <div>
      <h2>Teacher Dashboard</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Reg. No</th>
            <th>Name</th>
            <th>Department</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              {editingStudent && editingStudent.id === student.id ? (
                <>
                  <td>
                    <Form.Control
                      type="text"
                      name="reg_no"
                      value={editingStudent.reg_no}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      name="name"
                      value={editingStudent.name}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      name="department"
                      value={editingStudent.department}
                      onChange={handleChange}
                    />
                  </td>
                  <td>
                    <Button variant="success" onClick={handleUpdate}>
                      Save
                    </Button>
                    <Button variant="secondary" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </td>
                </>
              ) : (
                <>
                  <td>{student.reg_no}</td>
                  <td>{student.name}</td>
                  <td>{student.department}</td>
                  <td>
                    <Button
                      variant="primary"
                      onClick={() => handleEdit(student)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleDelete(student.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TeacherDashboard;

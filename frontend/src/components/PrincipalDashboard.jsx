import React, { useState, useEffect } from 'react';

function PrincipalDashboard() {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedClassroom, setSelectedClassroom] = useState('');
    const [editingTeacher, setEditingTeacher] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const teachersResponse = await fetch('https://classroom-om4x.onrender.com/api/teachers');
                const classroomsResponse = await fetch('https://classroom-om4x.onrender.com/api/classrooms');
                const studentsResponse = await fetch('https://classroom-om4x.onrender.com/api/students');

                if (teachersResponse.ok) {
                    const teachersData = await teachersResponse.json();
                    setTeachers(teachersData);
                }

                if (classroomsResponse.ok) {
                    const classroomsData = await classroomsResponse.json();
                    setClassrooms(classroomsData);
                }

                if (studentsResponse.ok) {
                    const studentsData = await studentsResponse.json();
                    setStudents(studentsData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        const fetchStudents = async () => {
            try {
                const response = await fetch('https://classroom-om4x.onrender.com/api/students');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();
                setStudents(data);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
    
        fetchStudents();

    }, []);

    const handleAssignClassroom = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('https://classroom-om4x.onrender.com/api/assign-classroom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacherId: selectedTeacher, classroomId: selectedClassroom }),
            });
            const data = await response.json();
            alert(data.message);
        } catch (error) {
            console.error('Error assigning classroom:', error);
        }
    };

    const handleEditTeacher = (teacher) => {
        setEditingTeacher(teacher);
    };

    const handleUpdateTeacher = async () => {
        if (!editingTeacher) return;
    
        try {
            const response = await fetch(`https://classroom-om4x.onrender.com/api/teachers/${editingTeacher.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingTeacher),
            });
    
            if (response.ok) {
                const updatedTeacher = await response.json();
                setTeachers(teachers.map(t => t.id === updatedTeacher.teacher.id ? updatedTeacher.teacher : t));
                setEditingTeacher(null);
            } else {
                console.error('Failed to update teacher');
            }
        } catch (error) {
            console.error('Error updating teacher:', error);
        }
    };
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEditingTeacher(prevState => ({ ...prevState, [name]: value }));
    };

    return (
        <div>
            <h1>Principal Dashboard</h1>

            <section>
                <h2>Assign Classroom to Teacher</h2>
                <form onSubmit={handleAssignClassroom}>
                    <div>
                        <label htmlFor="teacher">Select Teacher:</label>
                        <select
                            id="teacher"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                            required
                        >
                            <option value="">Select a teacher</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.email}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="classroom">Select Classroom:</label>
                        <select
                            id="classroom"
                            value={selectedClassroom}
                            onChange={(e) => setSelectedClassroom(e.target.value)}
                            required
                        >
                            <option value="">Select a classroom</option>
                            {classrooms.map((classroom) => (
                                <option key={classroom.id} value={classroom.id}>
                                    {classroom.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit">Assign Classroom</button>
                </form>
            </section>

            <section>
                <h2>Teachers</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                                <td>{teacher.id}</td>
                                <td>
                                    {editingTeacher && editingTeacher.id === teacher.id ? (
                                        <input
                                            type="text"
                                            name="name"
                                            value={editingTeacher.name}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        teacher.name
                                    )}
                                </td>
                                <td>
                                    {editingTeacher && editingTeacher.id === teacher.id ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={editingTeacher.email}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        teacher.email
                                    )}
                                </td>
                                <td>
                                    {editingTeacher && editingTeacher.id === teacher.id ? (
                                        <input
                                            type="text"
                                            name="department"
                                            value={editingTeacher.department}
                                            onChange={handleChange}
                                        />
                                    ) : (
                                        teacher.department
                                    )}
                                </td>
                                <td>
                                    {editingTeacher && editingTeacher.id === teacher.id ? (
                                        <button onClick={handleUpdateTeacher}>Update</button>
                                    ) : (
                                        <button onClick={() => handleEditTeacher(teacher)}>Edit</button>
                                    )}
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`https://classroom-om4x.onrender.com/api/teachers/${teacher.id}`, {
                                                    method: 'DELETE',
                                                });
                                                if (response.ok) {
                                                    setTeachers(teachers.filter(t => t.id !== teacher.id));
                                                } else {
                                                    console.error('Failed to delete teacher');
                                                }
                                            } catch (error) {
                                                console.error('Error deleting teacher:', error);
                                            }
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section>
                <h2>Students</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Registration No</th>
                            <th>Name</th>
                            <th>Department</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.id}</td>
                                <td>{student.reg_no}</td>
                                <td>{student.name}</td>
                                <td>{student.department}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default PrincipalDashboard;

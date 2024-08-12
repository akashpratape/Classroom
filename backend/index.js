import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const PORT = parseInt(process.env.PORT, 10) || 8000;
const app = express();

// const pool = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_DATABASE,
//     password: process.env.DB_PASSWORD,
//     port: parseInt(process.env.DB_PORT, 10),
//     ssl: {
//       rejectUnauthorized: false
//     }
//   });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
});

export default pool;

app.use(express.json());

app.post('/api/login', async (req, res) => {
    const { email, password, userType } = req.body;

    try {
        console.log(`Received login attempt for email: ${email}, role: ${userType}`);

        const result = await pool.query('SELECT * FROM users WHERE email = $1 AND LOWER(role) = LOWER($2)', [email, userType]);
        const user = result.rows[0];

        console.log('Database result:', user);

        if (!user) {
            return res.status(401).json({ message: 'User not found or incorrect role' });
        }

        // Directly compare the plain-text password
        if (password === user.password) {
            res.json({ message: 'Login successful', role: user.role });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/register', async (req, res) => {
    const { email, password, role } = req.body;

    try {
        const validRoles = ['Teacher', 'Student', 'Principal'];
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Please provide email, password, and role.' });
        }
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Please choose Teacher, Student, or Principal.' });
        }

        // Save the password as plain text
        const result = await pool.query(
            'INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *',
            [email, password, role]
        );

        res.json({ message: 'User registered successfully', user: result.rows[0] });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error' });
    }
});



// Get all teachers
app.get('/api/teachers', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, department FROM teachers');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching teachers:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update a teacher/student
app.put('/api/teachers/:id', async (req, res) => {
    const { id } = req.params;
    const { name, department, email } = req.body;

    try {
        // Ensure valid ID is provided
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const query = `
            UPDATE teachers
            SET name = $1, department = $2, email = $3
            WHERE id = $4
            RETURNING *;
        `;
        
        const values = [name, department, email, id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json({ message: 'Teacher updated successfully', teacher: result.rows[0] });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(500).json({ message: 'Error updating teacher' });
    }
});



// Delete a teacher
app.delete('/api/teachers/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM teachers WHERE id = $1', [id]);
        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// fetching students 
app.get('/api/students', async (req, res) => {
    try {
        console.log("Fetching students from database");
        const result = await pool.query('SELECT id, reg_no, name, department FROM students');
        console.log("Students fetched:", result.rows);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ error: 'Error fetching students' });
    }
});

// Update student details
app.put('/api/students/:id', async (req, res) => {
    const studentId = req.params.id;
    const { name, department, reg_no } = req.body;

    try {
        const result = await pool.query(
            `UPDATE students
             SET name = $1, department = $2, reg_no = $3
             WHERE id = $4
             RETURNING *`,
            [name, department, reg_no, studentId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Delete a student
app.delete('/api/students/:id', async (req, res) => {
    const studentId = req.params.id;

    try {
        const result = await pool.query(
            `DELETE FROM students
             WHERE id = $1`,
            [studentId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// to assign a classroom to a teacher
app.post('/api/assign-classroom', async (req, res) => {
    const { teacherId, classroomId } = req.body;

    try {
        if (!teacherId || !classroomId || isNaN(parseInt(teacherId)) || isNaN(parseInt(classroomId))) {
            return res.status(400).json({ message: 'Invalid teacher or classroom ID' });
        }

        const result = await pool.query(`
            UPDATE teachers
            SET classroom_id = $1
            WHERE id = $2
            RETURNING *;
        `, [classroomId, teacherId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json({ message: 'Classroom assigned successfully', teacher: result.rows[0] });
    } catch (error) {
        console.error('Error assigning classroom:', error);
        res.status(500).json({ message: 'Error assigning classroom' });
    }
});


// Get all classrooms
app.get('/api/classrooms', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classrooms');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching classrooms:', error);
        res.status(500).json({ message: 'Error fetching classrooms' });
    }
});


// Create a new classroom
app.post('/api/classrooms', async (req, res) => {
    const { name, start_time, end_time, days } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO classrooms (name, start_time, end_time, days) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, start_time, end_time, days]
        );
        res.json({ message: 'Classroom created successfully', classroom: result.rows[0] });
    } catch (error) {
        console.error('Error creating classroom:', error);
        res.status(500).json({ message: 'Server error' });
    }
});






app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


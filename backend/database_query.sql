-- Used Postgresql database 

-- table for principal student and teachers to store there email and password 

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Principal', 'Teacher', 'Student'))
);

-- classrooms table to store information about classroom

CREATE TABLE classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    days VARCHAR(50) NOT NULL 
);

-- to link teachers to classrooms
CREATE TABLE teacher_classroom (
    teacher_id INT REFERENCES users(id) ON DELETE CASCADE,
    classroom_id INT REFERENCES classrooms(id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, classroom_id)
);


-- creating student tablke to store there data 

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    reg_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL
);

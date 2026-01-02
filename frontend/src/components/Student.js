import axios from "axios";
import { useEffect, useState } from "react";

function Student() {
  const [students, setStudents] = useState([]);
  const [name, setName] = useState("");
  const [course, setCourse] = useState("");
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    const res = await axios.get("http://localhost:5000/students");
    setStudents(res.data);
  };

  const handleAddOrUpdate = async () => {
    if (!name || !course) return alert("Enter all fields");

    if (editingId) {
      // UPDATE
      await axios.put(`http://localhost:5000/students/${editingId}`, {
        name,
        course
      });
      setEditingId(null);
    } else {
      // CREATE
      await axios.post("http://localhost:5000/students", { name, course });
    }

    setName("");
    setCourse("");
    loadStudents();
  };

  const handleEdit = (student) => {
    setName(student.name);
    setCourse(student.course);
    setEditingId(student._id);
  };

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:5000/students/${id}`);
    loadStudents();
  };

  return (
    <div>
      <input
        placeholder="Name"
        value={name}
        onChange={e => setName(e.target.value)}
      />
      <input
        placeholder="Course"
        value={course}
        onChange={e => setCourse(e.target.value)}
      />
      <button onClick={handleAddOrUpdate}>
        {editingId ? "Update Student" : "Add Student"}
      </button>

      <ul>
        {students.map(s => (
          <li key={s._id}>
            {s.name} - {s.course} {" "}
            <button onClick={() => handleEdit(s)}>Edit</button>
            <button onClick={() => handleDelete(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Student;

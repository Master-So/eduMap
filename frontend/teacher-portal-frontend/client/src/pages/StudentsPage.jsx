import { useCallback } from 'react';
import { UsersRound } from 'lucide-react';
import PageHeader from '../components/common/PageHeader.jsx';
import LoadingState from '../components/common/LoadingState.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import StudentConnectionCard from '../components/students/StudentConnectionCard.jsx';
import StudentTable from '../components/students/StudentTable.jsx';
import { useApiResource } from '../hooks/useApiResource.jsx';
import { studentService } from '../services/studentService.jsx';

const KEY_FIELDS = ['connectionKey', 'connection_key', 'teacherConnectionKey', 'teacher_connection_key', 'studentConnectionKey', 'student_connection_key', 'connectionCode', 'connection_code', 'key'];

function findConnectionKey(value) {
  if (typeof value === 'string') return value.trim() || null;
  if (!value || typeof value !== 'object') return null;
  for (const field of KEY_FIELDS) {
    if (typeof value[field] === 'string' && value[field].trim()) return value[field].trim();
  }
  for (const envelope of ['data', 'result', 'payload', 'response']) {
    const nested = findConnectionKey(value[envelope]);
    if (nested) return nested;
  }
  return null;
}

export default function StudentsPage() {
  const studentsLoader = useCallback(() => studentService.getConnectedStudents(), []);
  const keyLoader = useCallback(() => studentService.getConnectionKey(), []);
  const students = useApiResource(studentsLoader, { initialData: [] });
  const key = useApiResource(keyLoader);
  const connectionKey = findConnectionKey(key.data);
  const studentList = Array.isArray(students.data) ? students.data : students.data?.students;
  return <div className="page-stack">
    <PageHeader eyebrow="Student connection" title="Keep your classroom connected." description="Manage the students connected to your teacher workspace and share your key when you’re ready." action={<span className="page-icon"><UsersRound size={20} /></span>} />
    {key.loading ? <LoadingState label="Loading connection key..." /> : key.error ? <ErrorState message={key.error} onRetry={key.retry} /> : <StudentConnectionCard connectionKey={connectionKey} />}
    <section className="panel table-panel"><div className="panel-heading"><div><span className="eyebrow">Connected students</span><h2>Your student roster</h2></div></div>{students.loading ? <LoadingState label="Loading students..." /> : students.error ? <ErrorState message={students.error} onRetry={students.retry} /> : <StudentTable students={studentList} />}</section>
  </div>;
}

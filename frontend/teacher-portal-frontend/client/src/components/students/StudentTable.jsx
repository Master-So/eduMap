import { useState } from 'react';
import { Mail, UserRound } from 'lucide-react';
import EmptyState from '../common/EmptyState.jsx';
import { displayValue, initials } from '../../utils/safeData.jsx';
export default function StudentTable({ students, onDisconnect }) {
	const [disconnectingId, setDisconnectingId] = useState('');
	if (!students?.length) return <EmptyState title="No students connected yet." description="Share your teacher connection key to let students join your workspace." />;
	const disconnect = async (student) => {
		const studentId = student?.id || student?._id;
		if (!studentId || !onDisconnect) return;
		setDisconnectingId(studentId);
		try { await onDisconnect(studentId); } finally { setDisconnectingId(''); }
	};
	return <div className="table-wrap"><table><thead><tr><th>Student</th><th>Email</th><th>Joined</th><th>Performance</th><th>Action</th></tr></thead><tbody>{students.map((student, index) => { const studentId = student?.id || student?._id || index; return <tr key={studentId}><td><div className="table-person"><span className="avatar small">{initials(student?.name)}</span><span>{displayValue(student?.name, 'Unnamed student')}</span></div></td><td><span className="muted-cell"><Mail size={14} />{displayValue(student?.email)}</span></td><td>{displayValue(student?.joinedAt || student?.createdAt)}</td><td>{displayValue(student?.averageScore, 'No score yet')}</td><td><button className="button ghost small" onClick={() => disconnect(student)} disabled={disconnectingId === studentId}>{disconnectingId === studentId ? 'Disconnecting...' : 'Disconnect'}</button></td></tr>; })}</tbody></table></div>;
}

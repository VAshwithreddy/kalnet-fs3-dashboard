"use client";

import StudentDirectory from "@/components/StudentDirectory";

export default function TeacherStudentsPage() {
  return (
    <div className="p-8">
      <StudentDirectory 
        title="Student Directory" 
        subtitle="Manage and view all active students enrolled in your classes, classified into sections." 
      />
    </div>
  );
}

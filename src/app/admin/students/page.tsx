"use client";

import StudentDirectory from "@/components/StudentDirectory";

export default function AdminStudentsPage() {
  return (
    <div className="p-8">
      <StudentDirectory 
        title="Student Directory" 
        subtitle="View and manage the comprehensive school student directory, classified into sections." 
      />
    </div>
  );
}

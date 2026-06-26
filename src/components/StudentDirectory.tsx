"use client";

import React, { useState, useEffect } from "react";
import { Search, GraduationCap, Users, AlertCircle, Calendar } from "lucide-react";
import { TableSkeleton } from "@/components/Skeletons";
import { EmptyState } from "@/components/EmptyState";

interface Student {
  id: number;
  admissionNo: string | null;
  firstName: string;
  lastName: string;
  status: string;
  createdAt: string;
}

interface StudentWithClassSection extends Student {
  className: string;
  section: string;
}

export default function StudentDirectory({ title = "Student Directory", subtitle = "View and manage enrolled students." }) {
  const [students, setStudents] = useState<StudentWithClassSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch("/api/teacher/students");
        if (!res.ok) throw new Error("Failed to fetch students");
        const data: Student[] = await res.json();
        
        // Sort students alphabetically by first name and last name
        const sorted = [...data].sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        // Group into sections of 20 students under Grades 9-12
        const SECTION_SIZE = 20;
        const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"];
        const mapped: StudentWithClassSection[] = sorted.map((student, index) => {
          const sectionIndex = Math.floor(index / SECTION_SIZE);
          const gradeName = GRADES[sectionIndex % GRADES.length];
          const sectionNum = Math.floor(sectionIndex / GRADES.length);
          const sectionLetter = String.fromCharCode(65 + (sectionNum % 26));
          const sectionSuffix = sectionNum >= 26 ? Math.floor(sectionNum / 26) + 1 : "";
          const sectionName = `Section ${sectionLetter}${sectionSuffix}`;
          
          return {
            ...student,
            className: gradeName,
            section: sectionName
          };
        });

        setStudents(mapped);

        // Set the first class-section active by default
        if (mapped.length > 0) {
          setActiveGroup(`${mapped[0].className} - ${mapped[0].section}`);
        }
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load student directory data.");
      } finally {
        setLoading(false);
      }
    }
    fetchStudents();
  }, []);

  // Get list of unique class-sections and count of students in each
  const groupsMap: { [key: string]: number } = {};
  students.forEach((student) => {
    const key = `${student.className} - ${student.section}`;
    groupsMap[key] = (groupsMap[key] || 0) + 1;
  });

  // Sort groups logically: Grade 9, Grade 10, Grade 11, Grade 12, then Section letter
  const groupsList = Object.keys(groupsMap).sort((a, b) => {
    const matchA = a.match(/Grade (\d+)\s*-\s*Section ([A-Z]+)/);
    const matchB = b.match(/Grade (\d+)\s*-\s*Section ([A-Z]+)/);
    if (matchA && matchB) {
      const gradeA = parseInt(matchA[1]);
      const gradeB = parseInt(matchB[1]);
      if (gradeA !== gradeB) return gradeA - gradeB;
      return matchA[2].localeCompare(matchB[2]);
    }
    return a.localeCompare(b);
  });

  // Filter students based on search or active section group
  const isSearching = searchQuery.trim() !== "";
  
  const filteredStudents = students.filter((student) => {
    if (isSearching) {
      const search = searchQuery.toLowerCase().trim();
      const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const admissionNo = (student.admissionNo || "").toLowerCase();
      const className = student.className.toLowerCase();
      const section = student.section.toLowerCase();
      return (
        fullName.includes(search) ||
        admissionNo.includes(search) ||
        className.includes(search) ||
        section.includes(search)
      );
    } else {
      return `${student.className} - ${student.section}` === activeGroup;
    }
  });

  if (error) {
    return (
      <div className="p-8 flex justify-center items-center min-h-[500px]">
        <div className="bg-danger/10 border border-danger/20 p-6 rounded-2xl text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-3" />
          <div className="text-lg font-semibold text-danger mb-2">Error Loading Student Directory</div>
          <p className="text-sm text-text-secondary mb-4">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-text-heading tracking-tight">{title}</h1>
          <p className="text-text-secondary mt-2">{subtitle}</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Search name, class, section, ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-border bg-bg-input text-text-heading rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <TableSkeleton columns={6} rows={6} />
        </div>
      ) : students.length === 0 ? (
        <div className="bg-bg-card border border-border rounded-2xl p-6">
          <EmptyState
            icon={Users}
            title="No Students Found"
            description="There are currently no students registered in the database."
          />
        </div>
      ) : (
        <>
          {/* Section Selector Tabs (only shown when not searching) */}
          {!isSearching && (
            <div className="flex border-b border-border gap-2 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-border">
              {groupsList.map((groupName) => {
                const isActive = activeGroup === groupName;
                return (
                  <button
                    key={groupName}
                    onClick={() => setActiveGroup(groupName)}
                    className={`flex items-center gap-2 px-5 py-3 border-b-2 font-medium text-sm transition-all duration-200 cursor-pointer whitespace-nowrap ${
                      isActive
                        ? "border-primary text-primary"
                        : "border-transparent text-text-secondary hover:text-text-heading"
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                    {groupName}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive
                        ? "bg-primary-ghost text-primary"
                        : "bg-bg-card-hover text-text-muted"
                    }`}>
                      {groupsMap[groupName]}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Student List Table */}
          <div className="bg-bg-card border border-border shadow-shadow-card rounded-2xl overflow-hidden p-6">
            {filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Students Match"
                description={isSearching ? `No students found matching "${searchQuery}".` : "No students in this section."}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-text-secondary">
                      <th className="pb-3 px-2 font-medium">Student Name</th>
                      <th className="pb-3 px-2 font-medium">Admission No</th>
                      <th className="pb-3 px-2 font-medium">Class</th>
                      <th className="pb-3 px-2 font-medium">Section</th>
                      <th className="pb-3 px-2 font-medium">Status</th>
                      <th className="pb-3 px-2 font-medium">Enrolled Date</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-border/40 last:border-0 hover:bg-bg-app/45 transition-colors">
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary-ghost flex items-center justify-center text-primary font-medium text-xs">
                              {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                            </div>
                            <span className="text-text-heading font-medium">
                              {student.firstName} {student.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-text-heading">
                          {student.admissionNo || "-"}
                        </td>
                        <td className="py-4 px-2 text-text-heading">
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-bg-app border border-border font-medium text-text-secondary">
                            {student.className}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-text-heading">
                          <span className="px-2.5 py-1 rounded-lg text-xs bg-bg-app border border-border font-medium text-text-secondary">
                            {student.section}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            student.status === "ACTIVE" 
                              ? "bg-green/10 text-green border border-green/20" 
                              : "bg-danger/10 text-danger border border-danger/20"
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-text-muted" />
                            {new Date(student.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

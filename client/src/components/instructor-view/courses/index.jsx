import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { Edit, PlusCircle, BookOpen, Users, DollarSign, Sparkles } from "lucide-react";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import AICurriculumGeneratorModal from "../AICurriculumGeneratorModal";

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
  } = useContext(InstructorContext);

  return (
    <Card className="border-slate-800 bg-slate-900 text-slate-100 shadow-xl">
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-5">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-400" /> Course Catalog
          </CardTitle>
          <p className="text-xs text-slate-400 mt-1">
            Manage your published courses, curriculum structure, and pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AICurriculumGeneratorModal />
          <Button
            onClick={() => {
              setCurrentEditedCourseId(null);
              setCourseLandingFormData(courseLandingInitialFormData);
              setCourseCurriculumFormData(courseCurriculumInitialFormData);
              navigate("/instructor/create-new-course");
            }}
            className="gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold shadow-lg shadow-indigo-950"
          >
            <PlusCircle className="h-4 w-4" /> Create New Course
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-950/60 border-b border-slate-800">
                <TableHead className="font-bold text-slate-300">Course Info</TableHead>
                <TableHead className="font-bold text-slate-300">Level</TableHead>
                <TableHead className="font-bold text-slate-300">Students</TableHead>
                <TableHead className="font-bold text-slate-300">Total Revenue</TableHead>
                <TableHead className="text-right font-bold text-slate-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listOfCourses && listOfCourses.length > 0 ? (
                listOfCourses.map((course) => {
                  const studentCount = course?.students?.length || 0;
                  const totalRev = studentCount * (course?.pricing || 0);

                  return (
                    <TableRow key={course?._id} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                      <TableCell className="font-semibold text-white">
                        <div className="flex items-center gap-3">
                          {course?.image ? (
                            <img
                              src={course.image}
                              alt={course.title}
                              className="h-10 w-14 rounded-lg object-cover border border-slate-700"
                            />
                          ) : (
                            <div className="flex h-10 w-14 items-center justify-center rounded-lg bg-indigo-950 border border-indigo-800 text-indigo-400">
                              <BookOpen className="h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white line-clamp-1">{course?.title}</p>
                            <span className="text-[11px] font-semibold text-indigo-400 capitalize">
                              {course?.category || "General"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300 capitalize">
                          {course?.level || "All Levels"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-200">
                          <Users className="h-4 w-4 text-blue-400" />
                          {studentCount} learners
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm font-bold text-emerald-400">
                          <DollarSign className="h-4 w-4" />
                          {totalRev.toFixed(2)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => {
                            navigate(`/instructor/edit-course/${course?._id}`);
                          }}
                          variant="ghost"
                          size="sm"
                          className="hover:bg-indigo-950 hover:text-indigo-300 text-slate-300 gap-1.5"
                        >
                          <Edit className="h-4 w-4" /> Edit Course
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-slate-400">
                    <BookOpen className="mx-auto h-12 w-12 text-slate-600 mb-2" />
                    <p className="font-semibold text-base">No courses created yet</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Click "Create New Course" or use the "AI Curriculum Generator" to draft your first course.
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export default InstructorCourses;

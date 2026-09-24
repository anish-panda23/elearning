import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import EmptyState from "@/components/common/empty-state";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  fetchStudentBoughtCoursesService,
  fetchStudentProgressSummaryService,
} from "@/services";
import { BookOpen, Play } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const [progressByCourse, setProgressByCourse] = useState({});

  async function fetchStudentBoughtCourses() {
    const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
    if (response?.success) {
      setStudentBoughtCoursesList(response?.data || []);
    }
  }

  async function fetchProgress() {
    const response = await fetchStudentProgressSummaryService(auth?.user?._id);
    if (response?.success) {
      setProgressByCourse(response.data || {});
    }
  }

  useEffect(() => {
    fetchStudentBoughtCourses();
    fetchProgress();
  }, []);

  const courses = studentBoughtCoursesList || [];

  return (
    <div className="page-wrap py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My learning</h1>
        <p className="mt-1 text-muted-foreground">
          Resume lectures and track completion across your purchased courses.
        </p>
      </div>
      {courses.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {courses.map((course) => {
            const progress = progressByCourse[course?.courseId] || {
              percent: 0,
              viewed: 0,
              total: 0,
            };
            return (
              <Card key={course.courseId || course.id} className="flex flex-col overflow-hidden">
                <CardContent className="flex-grow p-0">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="h-44 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold">{course?.title}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {course?.instructorName}
                    </p>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress.percent || 0}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {progress.percent || 0}% complete
                      {progress.total
                        ? ` · ${progress.viewed}/${progress.total} lectures`
                        : ""}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button
                    onClick={() =>
                      navigate(`/course-progress/${course?.courseId}`)
                    }
                    className="w-full"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    {progress.percent > 0 ? "Continue" : "Start watching"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Explore the catalog and enroll in a course to start tracking your progress here."
          actionLabel="Browse courses"
          onAction={() => navigate("/courses")}
        />
      )}
    </div>
  );
}

export default StudentCoursesPage;

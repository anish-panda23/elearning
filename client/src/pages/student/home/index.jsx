import { courseCategories } from "@/config";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useState } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentBoughtCoursesService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import CourseCard from "@/components/common/course-card";
import {
  ArrowRight,
  Brain,
  Cloud,
  Code2,
  Gamepad2,
  GraduationCap,
  Lock,
  PlayCircle,
  Smartphone,
  Sparkles,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const categoryIcons = {
  "web-development": Code2,
  "backend-development": Code2,
  "data-science": Brain,
  "machine-learning": Brain,
  "artificial-intelligence": Sparkles,
  "cloud-computing": Cloud,
  "cyber-security": Lock,
  "mobile-development": Smartphone,
  "game-development": Gamepad2,
  "software-engineering": GraduationCap,
};

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [continueCourses, setContinueCourses] = useState([]);

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem(
      "filters",
      JSON.stringify({
        category: [getCurrentId],
      })
    );
    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
    setLoading(false);
  }

  async function fetchContinueLearning() {
    if (!auth?.user?._id) return;
    const response = await fetchStudentBoughtCoursesService(auth.user._id);
    if (response?.success) {
      setContinueCourses((response?.data || []).slice(0, 4));
    }
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
    fetchContinueLearning();
  }, []);

  const featured = (studentViewCoursesList || []).slice(0, 8);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.35),_transparent_45%)]" />
        <div className="page-wrap relative grid items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Structured learning for career-ready skills
            </p>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Learn faster. Build more. Get hired.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-300">
              Browse instructor-led courses, preview lectures, and track your
              progress from one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => navigate("/courses")}>
                Explore courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate("/student-courses")}
              >
                Continue learning
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Live catalog", value: studentViewCoursesList?.length || 0, icon: PlayCircle },
              { label: "Categories", value: courseCategories.length, icon: GraduationCap },
              { label: "Your courses", value: continueCourses.length, icon: Users },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <stat.icon className="mb-3 h-5 w-5 text-indigo-300" />
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-slate-300">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {continueCourses.length > 0 ? (
        <section className="page-wrap py-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Continue learning</h2>
              <p className="text-sm text-muted-foreground">
                Pick up where you left off
              </p>
            </div>
            <Button variant="ghost" onClick={() => navigate("/student-courses")}>
              View all
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {continueCourses.map((course) => (
              <CourseCard
                key={course.courseId}
                image={course.courseImage}
                title={course.title}
                instructorName={course.instructorName}
                onClick={() => navigate(`/course-progress/${course.courseId}`)}
              />
            ))}
          </div>
        </section>
      ) : null}

      <section className="page-wrap py-12">
        <h2 className="mb-6 text-2xl font-bold">Browse by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {courseCategories.map((categoryItem) => {
            const Icon = categoryIcons[categoryItem.id] || GraduationCap;
            return (
              <button
                key={categoryItem.id}
                className="flex items-center gap-3 rounded-xl border bg-white p-4 text-left text-sm font-medium shadow-sm transition hover:border-primary hover:shadow-md"
                onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
              >
                <Icon className="h-4 w-4 text-primary" />
                {categoryItem.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="page-wrap">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold">Featured courses</h2>
            <Button variant="outline" onClick={() => navigate("/courses")}>
              See catalog
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-64 rounded-2xl" />
                ))
              : featured.map((courseItem) => (
                  <CourseCard
                    key={courseItem?._id}
                    image={courseItem?.image}
                    title={courseItem?.title}
                    instructorName={courseItem?.instructorName}
                    pricing={courseItem?.pricing}
                    level={courseItem?.level}
                    lectures={courseItem?.curriculum?.length}
                    students={courseItem?.students?.length}
                    onClick={() => handleCourseNavigate(courseItem?._id)}
                  />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;

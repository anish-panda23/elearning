import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle, Users } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import CourseReviews from "@/components/common/CourseReviews";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const { id } = useParams();
  const location = useLocation();

  async function fetchStudentViewCourseDetails() {
    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }

  function handleSetFreePreview(getCurrentVideoInfo) {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  async function handleCreatePayment() {
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.image,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.pricing,
    };

    const response = await createPaymentService(paymentPayload);

    if (response.success) {
      sessionStorage.setItem(
        "currentOrderId",
        JSON.stringify(response?.data?.orderId)
      );
      const approveUrl = response?.data?.approveUrl || "";
      if (approveUrl) {
        // Use client-side navigation for same-origin URLs (mock / demo mode)
        // so we don't lose the sessionStorage token on full page reload.
        try {
          const urlObj = new URL(approveUrl);
          if (urlObj.origin === window.location.origin) {
            navigate(urlObj.pathname + urlObj.search);
          } else {
            // Real PayPal URL – must do a hard redirect to external site
            window.location.href = approveUrl;
          }
        } catch {
          window.location.href = approveUrl;
        }
      }
    }
  }

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname]);

  if (loadingState) {
    return (
      <div className="page-wrap space-y-4 py-8">
        <Skeleton className="h-48 rounded-2xl" />
        <Skeleton className="h-72 rounded-2xl" />
      </div>
    );
  }


  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  const createdOn = studentViewCourseDetails?.date
    ? String(studentViewCourseDetails.date).split("T")[0]
    : "Recently";
  const studentCount = studentViewCourseDetails?.students?.length || 0;
  const objectives = studentViewCourseDetails?.objectives
    ? studentViewCourseDetails.objectives.split(",")
    : [];

  return (
    <div className="pb-10">
      <div className="bg-slate-950 text-white">
        <div className="page-wrap py-10">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{studentViewCourseDetails?.category}</Badge>
            <Badge className="capitalize">{studentViewCourseDetails?.level}</Badge>
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-bold md:text-4xl">
            {studentViewCourseDetails?.title}
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-slate-300">
            {studentViewCourseDetails?.subtitle}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
            <span>By {studentViewCourseDetails?.instructorName}</span>
            <span>Created {createdOn}</span>
            <span className="inline-flex items-center">
              <Globe className="mr-1 h-4 w-4" />
              {studentViewCourseDetails?.primaryLanguage}
            </span>
            <span className="inline-flex items-center">
              <Users className="mr-1 h-4 w-4" />
              {studentCount} {studentCount === 1 ? "student" : "students"}
            </span>
          </div>
        </div>
      </div>
      <div className="page-wrap mt-8 flex flex-col gap-8 md:flex-row">
        <main className="flex-grow">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>What you will learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    <span>{objective.trim()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Course description</CardTitle>
            </CardHeader>
            <CardContent className="leading-relaxed text-muted-foreground">
              {studentViewCourseDetails?.description}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {studentViewCourseDetails?.curriculum?.map(
                  (curriculumItem, index) => (
                    <li
                      key={curriculumItem?._id || index}
                      className={`flex items-center rounded-lg border px-3 py-2 ${
                        curriculumItem?.freePreview
                          ? "cursor-pointer hover:bg-muted/60"
                          : "opacity-80"
                      }`}
                      onClick={
                        curriculumItem?.freePreview
                          ? () => handleSetFreePreview(curriculumItem)
                          : undefined
                      }
                    >
                      {curriculumItem?.freePreview ? (
                        <PlayCircle className="mr-3 h-4 w-4 text-primary" />
                      ) : (
                        <Lock className="mr-3 h-4 w-4" />
                      )}
                      <span className="text-sm">
                        {index + 1}. {curriculumItem?.title}
                      </span>
                      {curriculumItem?.freePreview ? (
                        <Badge variant="secondary" className="ml-auto">
                          Preview
                        </Badge>
                      ) : null}
                    </li>
                  )
                )}
              </ol>
            </CardContent>
          </Card>
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Student Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <CourseReviews courseId={id} />
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[380px]">
          <Card className="sticky top-24 overflow-hidden">
            <CardContent className="p-0">
              <div className="aspect-video bg-slate-900">
                <VideoPlayer
                  url={
                    getIndexOfFreePreviewUrl !== -1
                      ? studentViewCourseDetails?.curriculum[
                          getIndexOfFreePreviewUrl
                        ].videoUrl
                      : ""
                  }
                  width="100%"
                  height="100%"
                />
              </div>
              <div className="p-6">
                <p className="text-3xl font-bold">
                  ${studentViewCourseDetails?.pricing}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  One-time purchase. Lifetime access.
                </p>
                <Button onClick={handleCreatePayment} className="mt-5 w-full">
                  Buy now
                </Button>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-[800px]">
          <DialogHeader>
            <DialogTitle>Course preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video overflow-hidden rounded-lg bg-black">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="100%"
              height="100%"
            />
          </div>
          <div className="flex flex-col gap-2">
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem) => (
                <button
                  key={filteredItem?._id}
                  type="button"
                  onClick={() => handleSetFreePreview(filteredItem)}
                  className="rounded-md px-2 py-1 text-left text-sm font-medium hover:bg-muted"
                >
                  {filteredItem?.title}
                </button>
              ))}
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;

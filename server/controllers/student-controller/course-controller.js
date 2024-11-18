const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
    } = req.query;

    console.log(req.query, "req.query hello");

    let filters = {};
    if (category.length) {
      filters.category = { $in: category.split(",") };
    }
    if (level.length) {
      filters.level = { $in: level.split(",") };
    }
    if (primaryLanguage.length) {
      filters.primaryLanguage = { $in: primaryLanguage.split(",") };
    }

    let sortParam = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sortParam.pricing = 1;

        break;
      case "price-hightolow":
        sortParam.pricing = -1;

        break;
      case "title-atoz":
        sortParam.title = 1;

        break;
      case "title-ztoa":
        sortParam.title = -1;

        break;

      default:
        sortParam.pricing = 1;
        break;
    }

    const coursesList = await Course.find(filters).sort(sortParam);

    res.status(200).json({
      success: true,
      data: coursesList,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const getStudentViewCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const courseDetails = await Course.findById(id);

    if (!courseDetails) {
      return res.status(404).json({
        success: false,
        message: "No course details found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      data: courseDetails,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured!",
    });
  }
};

const checkCoursePurchaseInfo = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    console.log("id is", id);

    if (id === '670bac3e56d0e00978bd1a0d') {
      console.log("yes");
    }
 console.log("line number :");
    const studentCourses = await Course.findOne({
      _id: id,
    });
    console.log("line number : 103");
    console.log("student courses is", studentCourses);

    if (!studentCourses) {
      return res.status(404).json({
        success: false,
        message: "Student courses not found!",
      });
    }

   
    if (Array.isArray(studentCourses.courses)) {
      const ifStudentAlreadyBoughtCurrentCourse =
        studentCourses.courses.findIndex((item) => item.courseId === id) > -1;

      res.status(200).json({
        success: true,
        data: ifStudentAlreadyBoughtCurrentCourse,
      });
    } else {
    
      res.status(200).json({
        success: true,
        data: false,
        message: "No courses found for this student.",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred! Please check.",
    });
  }
};

module.exports = {
  getAllStudentViewCourses,
  getStudentViewCourseDetails,
  checkCoursePurchaseInfo,
};

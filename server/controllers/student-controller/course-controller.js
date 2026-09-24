const Course = require("../../models/Course");
const StudentCourses = require("../../models/StudentCourses");
const { searchCoursesElastic } = require("../../helpers/elasticsearch");

const getAllStudentViewCourses = async (req, res) => {
  try {
    const {
      category = [],
      level = [],
      primaryLanguage = [],
      sortBy = "price-lowtohigh",
      q = "",
    } = req.query;

    const parsedCategory = category.length ? String(category).split(",") : [];
    const parsedLevel = level.length ? String(level).split(",") : [];
    const parsedLang = primaryLanguage.length ? String(primaryLanguage).split(",") : [];

    // Try Elasticsearch query first if search query 'q' or filters are active
    const esResults = await searchCoursesElastic(q, {
      category: parsedCategory,
      level: parsedLevel,
      primaryLanguage: parsedLang,
    });

    if (esResults && Array.isArray(esResults) && esResults.length > 0) {
      const courseIds = esResults.map((item) => item._id);
      let coursesList = await Course.find({ _id: { $in: courseIds } });

      // Preserve Elasticsearch relevance order if query 'q' is present
      if (q && String(q).trim()) {
        const courseMap = new Map(coursesList.map((c) => [c._id.toString(), c]));
        coursesList = esResults
          .map((item) => courseMap.get(item._id))
          .filter(Boolean);
      }

      return res.status(200).json({
        success: true,
        source: "elasticsearch",
        data: coursesList,
      });
    }


    // Fallback to MongoDB standard query if Elasticsearch is offline or unavailable
    let filters = {};
    if (parsedCategory.length) {
      filters.category = { $in: parsedCategory };
    }
    if (parsedLevel.length) {
      filters.level = { $in: parsedLevel };
    }
    if (parsedLang.length) {
      filters.primaryLanguage = { $in: parsedLang };
    }
    if (q && String(q).trim()) {
      filters.title = { $regex: String(q).trim(), $options: "i" };
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
      source: "mongodb-fallback",
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
    const studentCourses = await StudentCourses.findOne({
      userId: studentId,
    });
    const purchased =
      studentCourses?.courses?.some((item) => item.courseId === id) || false;

    res.status(200).json({
      success: true,
      data: purchased,
    });
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

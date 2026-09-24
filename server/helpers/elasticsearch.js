const { Client } = require("@elastic/elasticsearch");

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || "http://127.0.0.1:9200";
const INDEX_NAME = "courses";

let esClient = null;
let isEsConnected = false;

try {
  esClient = new Client({
    node: ELASTICSEARCH_NODE,
    requestTimeout: 3000,
    maxRetries: 1,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
    },
  });
} catch (err) {
  console.warn("Elasticsearch client creation failed:", err.message);
}


const checkElasticConnection = async () => {
  if (!esClient) return false;
  try {
    await esClient.ping();
    isEsConnected = true;
    console.log("Elasticsearch cluster connected successfully.");
    return true;
  } catch (error) {
    isEsConnected = false;
    console.log("Elasticsearch is offline -> Using MongoDB fallback search mode.");
    return false;
  }
};


const initElasticsearch = async () => {
  const connected = await checkElasticConnection();
  if (!connected) return;

  try {
    const indexExists = await esClient.indices.exists({ index: INDEX_NAME });
    if (!indexExists) {
      await esClient.indices.create({
        index: INDEX_NAME,
        body: {
          mappings: {
            properties: {
              title: { type: "text" },
              description: { type: "text" },
              category: { type: "keyword" },
              level: { type: "keyword" },
              primaryLanguage: { type: "keyword" },
              subtitle: { type: "text" },
              instructorName: { type: "text" },
              pricing: { type: "double" },
              objectives: { type: "text" },
              welcomeMessage: { type: "text" },
            },
          },

        },
      });
      console.log(`Elasticsearch index '${INDEX_NAME}' created.`);
    }
  } catch (error) {
    console.error("Elasticsearch init index error:", error.message);
  }
};

const indexCourse = async (course) => {
  if (!isEsConnected || !esClient) return;
  try {
    await esClient.index({
      index: INDEX_NAME,
      id: course._id.toString(),
      document: {
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        primaryLanguage: course.primaryLanguage,
        subtitle: course.subtitle,
        instructorName: course.instructorName,
        pricing: course.pricing,
        objectives: course.objectives,
        welcomeMessage: course.welcomeMessage,
      },
    });
  } catch (error) {
    console.error("Elasticsearch indexCourse error:", error.message);
  }
};

const deleteCourseFromIndex = async (courseId) => {
  if (!isEsConnected || !esClient) return;
  try {
    await esClient.delete({
      index: INDEX_NAME,
      id: courseId.toString(),
    });
  } catch (error) {
    console.error("Elasticsearch deleteCourse error:", error.message);
  }
};

const searchCoursesElastic = async (q, filters = {}) => {
  if (!isEsConnected || !esClient) return null;

  try {
    const must = [];
    const filter = [];

    if (q && String(q).trim()) {
      must.push({
        multi_match: {
          query: String(q).trim(),
          fields: ["title^3", "subtitle^2", "description", "category", "instructorName"],
          fuzziness: "AUTO",
        },
      });
    } else {
      must.push({ match_all: {} });
    }

    if (filters.category && filters.category.length) {
      filter.push({ terms: { category: filters.category } });
    }
    if (filters.level && filters.level.length) {
      filter.push({ terms: { level: filters.level } });
    }
    if (filters.primaryLanguage && filters.primaryLanguage.length) {
      filter.push({ terms: { primaryLanguage: filters.primaryLanguage } });
    }

    const result = await esClient.search({
      index: INDEX_NAME,
      body: {
        query: {
          bool: {
            must,
            filter,
          },
        },
      },
    });

    const hits = result.hits?.hits || [];
    return hits.map((hit) => ({
      _id: hit._id,
      ...hit._source,
      esScore: hit._score,
    }));
  } catch (error) {
    console.error("Elasticsearch search error:", error.message);
    return null; // trigger fallback
  }
};

module.exports = {
  esClient,
  initElasticsearch,
  indexCourse,
  deleteCourseFromIndex,
  searchCoursesElastic,
};

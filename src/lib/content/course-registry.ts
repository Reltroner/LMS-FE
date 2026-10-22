import data from "../../../.public-content/data.json";
import { createCourseQueries } from "./queries";
import type { PublicCatalog } from "./compiler";

// The compiler validates this output before the application build starts.
const catalog: PublicCatalog = data as PublicCatalog;
export const {
  getCourseBySlug, getPublishedCourses, getLessonBySlug, getLessonsByCourseSlug,
  getCourseDuration, getLessonNavigation, getCourseRouteParams, getLessonRouteParams,
  getResourceById, getResourcesByCourseSlug, getResourcesByIds,
  getPathBySlug, getPublishedPaths,
} = createCourseQueries(catalog);

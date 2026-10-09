import type { Track } from "@/components/player/PlayerProvider";
import type { Course, Instructor } from "./types";

export function courseTrack(course: Course, instructor?: Instructor): Track {
  return {
    id: course.slug,
    title: course.title,
    subtitle: `Course preview${instructor ? ` · ${instructor.name}` : ""}`,
    src: course.preview,
    href: `/courses/${course.slug}`,
  };
}

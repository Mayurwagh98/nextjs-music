import { ImageResponse } from "next/og";
import { getCourse, getCourses, getInstructor } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { site } from "@/lib/site";

export const alt = "Course overview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

/** Social share card generated per course at build time (no design tool needed). */
export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  const instructor = course ? await getInstructor(course.instructor) : undefined;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #020617 0%, #042f2e 60%, #0f766e 100%)",
          color: "white",
        }}
      >
        <div style={{ display: "flex", fontSize: 28, color: "#5eead4", letterSpacing: 2 }}>
          {site.name.toUpperCase()}
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{course?.title ?? "Course"}</div>
          <div style={{ marginTop: 24, fontSize: 32, color: "#cbd5e1" }}>{course?.description ?? ""}</div>
        </div>
        <div style={{ display: "flex", gap: 24, fontSize: 30, color: "#e2e8f0" }}>
          {course && <span>{course.instrument}</span>}
          {course && <span>· {course.level}</span>}
          {course && <span>· {course.durationWeeks} weeks</span>}
          {course && <span>· {formatPrice(course.price)}</span>}
          {instructor && <span>· with {instructor.name}</span>}
        </div>
      </div>
    ),
    size
  );
}

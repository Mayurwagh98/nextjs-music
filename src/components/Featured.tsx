"use client";
import courseData from "../data/musicData.json";
import { BackgroundGradient } from "./ui/background-gradient";

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  instructor: string;
  isFeatured: boolean;
  image: string;
}

const Featured = () => {
  const featuredCourses = courseData.courses.filter(
    (course: Course) => course.isFeatured
  );
  return (
    <div className="w-full bg-gray-900 min-h-[30rem] py-5 px-3">
      <div className="text-center">
        <h2 className="text-base text-teal-600 font-semibold tracking-wide uppercase">
          FEATURED COURSES
        </h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-white sm:text-4xl">
          Learn With the Best
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8 mx-4">
        {featuredCourses?.map((course: Course) => (
          <BackgroundGradient
            key={course.id}
            className="flex flex-col rounded-[22px] bg-white dark:bg-zinc-900 overflow-hidden h-full w-full px-4 py-3 min-h-[14rem]"
          >
            <div className="flex flex-col space-y-3 justify-center items-center text-center">
              <img src={course.image} alt="image" className="w-[90%] h-[90%] rounded-lg" />
              <h3 className="text-lg sm:text-xl text-black mt-4 mb-2 dark:text-neutral-200">
                {course.title}
              </h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-grow">
                {course.description}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 flex-grow">
                ${course.price}/-
              </p>
              <button className="bg-black border border-gray-500 text-white rounded-md px-2 py-1 w-1/4">
                View
              </button>
            </div>
          </BackgroundGradient>
        ))}
      </div>
      <div className="mt-20 text-center">
        <button className="bg-purple-500 text-white px-3 py-2 rounded-md">
          View courses
        </button>
      </div>
    </div>
  );
};

export default Featured;

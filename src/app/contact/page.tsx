import { BackgroundBeams } from "@/components/ui/background-beams";

const ContactPage = () => {
  return (
    <div className="w-screen h-screen">
      <div className="h-[40rem] w-full rounded-md bg-neutral-950 relative flex flex-col items-center justify-center antialiased">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="relative z-10 text-lg md:text-7xl  bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600  text-center font-sans font-bold">
            Join the waitlist
          </h1>
          <p></p>
          <p className="text-neutral-500 max-w-lg mx-auto my-2 text-sm text-center relative z-10">
            Welcome to our Music Academy's exclusive waitlist. Be the first to access our
            comprehensive music education programs, from instrument lessons to music theory
            workshops. Whether you're interested in piano, guitar, vocals, or music production,
            we'll notify you when new courses and workshops become available.
          </p>
          <input
            type="text"
            placeholder="hi@manuarora.in"
            className="rounded-lg border border-neutral-800 focus:ring-2 focus:ring-teal-700  w-full relative z-10 mt-4  bg-neutral-950 placeholder:text-neutral-700 outline-none py-3 px-2"
          />
        </div>
        <BackgroundBeams />
      </div>
    </div>
  );
};

export default ContactPage;

import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiTrendingUp, FiHeart } from "react-icons/fi";
import { toast } from "react-hot-toast";
import axios from "axios";

export default function Home() {
  const [programs, setPrograms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  /* ------------------ fallback spotlight data ------------------ */
  const spotlight = [
    {
      id: "prog-1",
      title: "Social Empowerment",
      desc: "Building strong communities through social welfare activities and outreach.",
      image: ["/programs/community.jpg"],
    },
    {
      id: "prog-2",
      title: "Financial Development",
      desc: "Helping members access financial literacy, savings, and micro-loans.",
      image: ["/programs/finance.jpg"],
    },
    {
      id: "prog-3",
      title: "Personal Growth",
      desc: "Workshops and mentoring to support education and career opportunities.",
      image: ["/programs/development.jpg"],
    },
  ];

  useEffect(() => {
    const fetchPrograms = async () => {
      // try {
      //   const response = await axios.get(
      //     `${import.meta.env.VITE_BACKEND_URL}/api/programs`
      //   );
      //   setPrograms(response.data);
      // } catch (err) {
      //   console.error("Fetch failed:", err);
      //   toast.error("Failed to load programs. Showing highlights.");
      //   setPrograms(spotlight);
      // } finally {
      //   setIsLoading(false);
      // }
    };

    if (isLoading) {
      fetchPrograms();
    }
  }, [isLoading]);

  return (
    <Fragment>
      {/* ---------- HERO ---------- */}
      <section className="relative w-full h-[60vh] sm:h-[70vh] bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center overflow-hidden">
        <motion.img
          src="/foundation-banner.jpg"
          alt="Foundation banner"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />

        <div className="relative text-center text-white px-4">
          <motion.h1
            className="text-3xl sm:text-5xl font-extrabold drop-shadow-lg"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Thewana Shakthi Development Foundation
          </motion.h1>

          <motion.p
            className="mt-4 max-w-xl mx-auto text-base sm:text-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Empowering members through social, financial, and personal development
            for a brighter future.
          </motion.p>

          <motion.div
            className="mt-6 flex flex-col sm:flex-row justify-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              to="/programs"
              className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-gray-100"
            >
              Explore Programs
            </Link>
            <Link
              to="/about"
              className="px-6 py-3 border border-white font-semibold rounded-full hover:bg-white hover:text-indigo-700"
            >
              Learn More
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="bg-white py-12">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: <FiUsers size={36} />,
              title: "Social Development",
              desc: "Community programs to uplift and unite members.",
            },
            {
              icon: <FiTrendingUp size={36} />,
              title: "Financial Growth",
              desc: "Guidance, training, and opportunities for stability.",
            },
            {
              icon: <FiHeart size={36} />,
              title: "Personal Support",
              desc: "Mentorship and education for personal empowerment.",
            },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center">
              <div className="text-indigo-600">{icon}</div>
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="mt-1 text-gray-600 text-sm text-center px-4">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- PROGRAM HIGHLIGHTS ---------- */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          Our Key Programs
        </h2>

        {isLoading ? (
          <p className="text-center">Loading programs...</p>
        ) : programs.length === 0 ? (
          <p className="text-center text-gray-500">No programs available at the moment.</p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {programs.slice(0, 3).map((prog, idx) => (
              <motion.article
                key={prog.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/programs/${prog.id}`}>
                  <img
                    src={prog.image[0]}
                    alt={prog.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-semibold">{prog.title}</h3>
                    <p className="mt-2 text-gray-600 text-sm">{prog.desc}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link
            to="/programs"
            className="inline-block px-8 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50"
          >
            View All Initiatives
          </Link>
        </div>
      </section>

      {/* ---------- CTA BANNER ---------- */}
      <section className="w-full bg-indigo-700 text-white py-16 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Join Thewana Shakthi Development Foundation
        </h2>
        <p className="mt-4 max-w-2xl mx-auto px-4">
          Become a member, volunteer, or supporter and be part of a mission to
          uplift lives and create lasting impact.
        </p>
        <Link
          to="/register"
          className="mt-8 inline-block px-8 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-gray-100"
        >
          Get Involved
        </Link>
      </section>
    </Fragment>
  );
}

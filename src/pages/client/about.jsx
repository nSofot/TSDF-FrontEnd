import { Fragment } from "react";
import { motion } from "framer-motion";
import {
  FaHandsHelping,
  FaLeaf,
  FaRocket,
  FaUsers,
  FaGlobeAsia,
} from "react-icons/fa";

export default function About() {
  return (
    <Fragment>
      {/* ---------- SEO / meta ---------- */}
      <title>
        <title>About | Thewana Shakthi Development Foundation</title>
        <meta
          name="description"
          content="Learn about Thewana Shakthi Development Foundation’s mission to empower members through social, financial, and personal development."
        />
      </title>

      {/* ---------- Hero ---------- */}
      <section className="relative w-full h-[50vh] bg-gradient-to-r from-indigo-700 to-purple-700 flex items-center justify-center overflow-hidden">
        <motion.img
          src="/about-hero.jpg" // replace with foundation banner in /public
          alt="Community development"
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.h1
          className="relative text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg text-center"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          About Thewana Shakthi Development Foundation
        </motion.h1>
      </section>

      {/* ---------- Mission & vision ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            To uplift members by creating opportunities for social, financial, 
            and personal development—empowering individuals to live with dignity, 
            purpose, and resilience.
          </p>
        </div>
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Our Vision</h2>
          <p className="text-lg leading-relaxed text-gray-700">
            To build a strong, united community where every member has the 
            support and resources to achieve their fullest potential and 
            contribute meaningfully to society.
          </p>
        </div>
      </section>

      {/* ---------- Stats ---------- */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto grid sm:grid-cols-3 text-center gap-8">
          {[
            { value: "20+", label: "Years of Service" },
            { value: "10K+", label: "Active Members" },
            { value: "150+", label: "Community Projects" },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-4xl font-extrabold text-indigo-700">{value}</p>
              <p className="mt-2 text-gray-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Core values ---------- */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-10">Our Core Values</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: <FaHandsHelping size={40} />,
              title: "Compassion",
              desc: "We extend kindness and support to those in need.",
            },
            {
              icon: <FaUsers size={40} />,
              title: "Empowerment",
              desc: "We help individuals build confidence and skills for growth.",
            },
            {
              icon: <FaRocket size={40} />,
              title: "Progress",
              desc: "We embrace innovation to drive positive change in communities.",
            },
            {
              icon: <FaLeaf size={40} />,
              title: "Sustainability",
              desc: "We ensure our initiatives create lasting and meaningful impact.",
            },
            {
              icon: <FaGlobeAsia size={40} />,
              title: "Community",
              desc: "We believe in unity, collaboration, and shared responsibility.",
            },
          ].map(({ icon, title, desc }) => (
            <motion.div
              key={title}
              className="bg-white rounded-2xl p-8 shadow-md text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex justify-center mb-4 text-indigo-700">
                {icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Call-to-action ---------- */}
      <section className="w-full bg-indigo-700 text-white py-16">
        <div className="max-w-full mx-auto text-center px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            Be Part of the Change
          </h2>
          <p className="mb-8 text-lg max-w-2xl mx-auto">
            Join Thewana Shakthi Development Foundation as a member, 
            volunteer, or supporter—and help us uplift lives together.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-2xl font-semibold bg-white text-indigo-700 shadow"
              onClick={() => (window.location.href = "/register")}
            >
              Join Us
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 rounded-2xl font-semibold border border-white shadow"
              onClick={() => (window.location.href = "/contact")}
            >
              Contact Us
            </motion.button>
          </div>
        </div>
      </section>
    </Fragment>
  );
}

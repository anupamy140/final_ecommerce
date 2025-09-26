import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TextType from '../ui/TextType';

const slides = [
    { id: 1, title: "Summer Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-yellow-50 to-pink-50" },
    { id: 2, title: "Winter Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-pink-50 to-blue-50" },
    { id: 3, title: "Spring Sale Collections", description: "Sale! Up to 50% off!", img: "https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb", bg: "bg-gradient-to-r from-blue-50 to-yellow-50" },
];

const Slider = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-[calc(80vh)] my-8 rounded-3xl overflow-hidden">
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${current * 100}%)` }}
            >
                {slides.map((slide, index) => (
                    <div key={slide.id} className={`${slide.bg} flex-shrink-0 w-full h-full flex flex-col md:flex-row text-gray-800`}>
                        <div className="w-full md:w-1/2 h-full flex flex-col items-center justify-center gap-4 text-center p-4">
                            {current === index && (
                                <TextType
                                    as="h1"
                                    text={[slide.description, slide.title]}
                                    typingSpeed={75} deletingSpeed={40} pauseDuration={1500}
                                    className="text-5xl lg:text-7xl font-extrabold text-shadow"
                                />
                            )}
                            <a href="#products-section">
                                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}} transition={{delay: 0.5, duration: 0.5}}>
                                    <button className="rounded-md bg-black text-white py-3 px-6 font-semibold hover:bg-gray-800 transition-colors">
                                        SHOP NOW
                                    </button>
                                </motion.div>
                            </a>
                        </div>
                        <div className="w-full md:w-1/2 h-full relative">
                            <img src={slide.img} alt={slide.title} className="w-full h-full object-cover" />
                        </div>
                    </div>
                ))}
            </div>
            <div className="absolute m-auto left-1/2 bottom-8 flex gap-4 -translate-x-1/2">
                {slides.map((_, index) => (
                    <div key={index} onClick={() => setCurrent(index)} className={`w-3 h-3 rounded-full ring-1 ring-gray-600 cursor-pointer transition-all ${ current === index ? "scale-150 bg-gray-700" : "bg-white/50" }`} />
                ))}
            </div>
        </div>
    );
};

export default Slider;
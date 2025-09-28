
const logos = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/H%26M-Logo.svg/1280px-H%26M-Logo.svg.png",
    "https://upload.wikimedia.org/wikipedia/commons/a/a6/Calvin_klein_logo_web23.svg",
    "https://upload.wikimedia.org/wikipedia/commons/0/00/Samsung_Orig_Wordmark_BLACK_RGB.png",
    "https://upload.wikimedia.org/wikipedia/commons/f/f2/Nike_logo_1978.svg",
    "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gucci_logo.svg"
];

const BrandLogos = () => (
    <div className="py-12 border-t border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto flex justify-around items-center gap-8 flex-wrap">
            {logos.map((logo, i) => (
                <img key={i} src={logo} alt={`Brand ${i}`} className="h-8 object-contain dark:invert dark:brightness-0 opacity-60"/>
            ))}
        </div>
    </div>
);

export default BrandLogos;

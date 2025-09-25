// src/components/shared/CategoryCarousel.tsx
import { ImageWithLoader } from './ImageWithLoader';

interface CategoryCarouselProps {
    categories: string[];
    onCategorySelect: (category: string) => void;
    selectedCategory: string | null;
}

export const CategoryCarousel = ({ categories, onCategorySelect, selectedCategory }: CategoryCarouselProps) => {
    if (!categories || categories.length === 0) return null;
    return (
        <div className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Explore Our Collections</h2>
            <div className="flex p-4 gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-5 group mx-auto">
                    <div onClick={() => onCategorySelect("")} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== "" ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-50 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
                        <div className={`relative h-[28rem] w-full bg-gray-200 overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === "" || selectedCategory === null ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                            <ImageWithLoader src={`image.jpg`} alt="All Products" className="w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white capitalize">All Products</h3>
                        </div>
                    </div>
                    {categories.map((category) => (
                        <div key={category} onClick={() => onCategorySelect(category)} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== category ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-50 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
                            <div className={`relative h-[28rem] w-full bg-gray-200 overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === category ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                                <ImageWithLoader src={`/public/${category}.jpg`} alt={category} className="w-full h-full" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                                <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white capitalize">{category.replace(/-/g, ' ')}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
import { ImageWithLoader } from './ImageWithLoader';

interface CategoryCarouselProps {
    categories: string[];
    onCategorySelect: (category: string) => void;
    selectedCategory: string | null;
}

// --- 1. Humne yahan Category aur Cloudinary URL ka map banaya hai ---
// Key: Category ka naam (jaisa API se aata hai)
// Value: Uska Cloudinary Image URL
const categoryImageMap: { [key: string]: string } = {
    'all': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800816/image_xlmev3.jpg',
    'beauty': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800810/Beauty_epa8kg.jpg',
    'electronics': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758802581/electronics_dwpuyy.jpg',
    'fragrances': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800813/Fragrances_zy7n8a.jpg',
    'furniture': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800815/Furniture_amu1b1.jpg',
    'groceries': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800816/Groceries_c9pscj.jpg',
    'home-decoration': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800815/Home-Decoration_vwzhmg.jpg',
    'kitchen-accessories': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800821/Kitchen-Accessories_p7knts.jpg',
    'laptops': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800822/Laptops_xkoyce.jpg',
    'mens-shirts': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800825/Mens-Shirts_qvscby.jpg',
    'mens-shoes': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800826/Mens-Shoes_qrzizj.jpg',
    'mens-watches': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800829/Mens-Watches_mtrlhw.jpg',
    'mobile-accessories': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800830/Mobile-Accessories_q0bddy.jpg',
    'motorcycle': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800831/Motorcycle_dc1fe8.jpg',
    'skin-care': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800840/Skin-Care_cpfr8n.jpg',
    'smartphones': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800842/Smartphones_vqf4dh.jpg',
    'sports-accessories': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800845/Sports-Accessories_okcfe9.jpg',
    'sunglasses': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758801009/Screenshot_2025-09-25_171847_hsu0pg.png',
    'tablets': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800847/Tablets_k8dktb.jpg',
    'tops': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800848/Tops_ut1eiw.jpg',
    'vehicle': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800850/Vehicle_jdegzg.jpg',
    'womens-bags': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800850/Womens-Bags_drey3r.jpg',
    'womens-dresses': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800853/Womens-Dresses_upqwxb.jpg',
    'womens-jewellery': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800855/Womens-Jewellery_pluvle.jpg',
    'womens-shoes': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800858/Womens-Shoes_o3kqiw.jpg',
    'womens-watches': 'https://res.cloudinary.com/ddbgvr9al/image/upload/v1758800860/Womens-Watches_a4thur.jpg',
};


export const CategoryCarousel = ({ categories, onCategorySelect, selectedCategory }: CategoryCarouselProps) => {
    if (!categories || categories.length === 0) return null;

    return (
        <div className="py-12">
            <h2 className="text-3xl font-bold text-center mb-8 dark:text-white">Explore Our Collections</h2>
            <div className="flex p-4 gap-5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex gap-5 group mx-auto">
                    
                    {/* --- All Products Card --- */}
                    <div onClick={() => onCategorySelect("")} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== "" ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-100 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
                        <div className={`relative h-[28rem] w-full bg-gray-200 overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === "" || selectedCategory === null ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                            {/* --- UPDATED: 'all' key se image li gayi hai --- */}
                            <ImageWithLoader src={categoryImageMap['all']} alt="All Products" className="w-full h-full" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                            <h3 className="absolute bottom-5 left-5 text-2xl font-bold text-white capitalize">All Products</h3>
                        </div>
                    </div>

                    {/* --- Individual Category Cards --- */}
                    {categories.map((category) => (
                        <div key={category} onClick={() => onCategorySelect(category)} className={`flex-shrink-0 w-60 cursor-pointer transition-all duration-500 ease-in-out ${selectedCategory && selectedCategory !== category ? 'opacity-50 scale-95' : 'opacity-100 scale-100'} group-hover:opacity-100 group-hover:scale-95 hover:!opacity-100 hover:!scale-105 hover:-translate-y-4`}>
                            <div className={`relative h-[28rem] w-full bg-gray-200 overflow-hidden transition-all duration-300 rounded-2xl ${selectedCategory === category ? 'ring-4 ring-gray-900 dark:ring-yellow-400 ring-offset-4 ring-offset-gray-50 dark:ring-offset-gray-950' : ''}`}>
                                {/* --- UPDATED: Har category ke liye map se image li gayi hai --- */}
                                <ImageWithLoader
                                    src={categoryImageMap[category] || `https://placehold.co/400x600/e2e8f0/334155?text=${category}`}
                                    alt={category}
                                    className="w-full h-full"
                                />
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
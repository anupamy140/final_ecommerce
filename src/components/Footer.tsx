import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => (
    <footer className="bg-gray-900 text-gray-300 dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-accent text-accent-foreground p-10 rounded-2xl text-center mb-16">
                <h2 className="text-3xl font-bold">JOIN OUR COMMUNITY</h2>
                <p className="mt-2">Get exclusive deals and be the first to know about new collections.</p>
                <form className="mt-6 max-w-md mx-auto flex">
                    <input type="email" placeholder="Enter your email" className="flex-1 rounded-l-lg px-4 py-3 border-black outline-none text-black placeholder:text-gray-500"/>
                    <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-r-lg font-semibold hover:bg-opacity-90 transition-colors">SUBSCRIBE</button>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-bold text-white">FASHION</h3>
                    <p className="mt-4 text-gray-400">Complete your style with awesome clothes from us.</p>
                     <div className="flex space-x-4 mt-6">
                        <a href="#" className="text-gray-400 hover:text-white"><Facebook /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Twitter /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Instagram /></a>
                        <a href="#" className="text-gray-400 hover:text-white"><Linkedin /></a>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Company</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">About</a></li>
                        <li><a href="#" className="hover:text-white">Contact us</a></li>
                        <li><a href="#" className="hover:text-white">Support</a></li>
                        <li><a href="#" className="hover:text-white">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Quick Link</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">Orders Tracking</a></li>
                        <li><a href="#" className="hover:text-white">Size Guide</a></li>
                        <li><a href="#" className="hover:text-white">FAQs</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-white">Legal</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">Terms & conditions</a></li>
                        <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
             <div className="mt-16 border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} FASHION Inc. All rights reserved.</p>
            </div>
        </div>
    </footer>
);

export default Footer;
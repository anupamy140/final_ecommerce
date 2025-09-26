
const Footer = () => (
    <footer className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-yellow-400 text-black p-10 rounded-2xl text-center mb-16">
                <h2 className="text-3xl font-bold">JOIN SHOPPING COMMUNITY TO GET MONTHLY PROMO</h2>
                <p className="mt-2 text-gray-800">Type your email down below and be young wild generation</p>
                <form className="mt-6 max-w-md mx-auto flex">
                    <input type="email" placeholder="Add your email here" className="flex-1 rounded-l-lg px-4 py-3 border-black outline-none text-black"/>
                    <button type="submit" className="bg-black text-white px-6 py-3 rounded-r-lg font-semibold">SEND</button>
                </form>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-bold">FASHION</h3>
                    <p className="mt-4 text-gray-400">Complete your style with awesome clothes from us.</p>
                </div>
                <div>
                    <h4 className="font-semibold">Company</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">About</a></li>
                        <li><a href="#" className="hover:text-white">Contact us</a></li>
                        <li><a href="#" className="hover:text-white">Support</a></li>
                        <li><a href="#" className="hover:text-white">Careers</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">Quick Link</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">Orders Tracking</a></li>
                        <li><a href="#" className="hover:text-white">Size Guide</a></li>
                        <li><a href="#" className="hover:text-white">FAQs</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold">Legal</h4>
                    <ul className="mt-4 space-y-2 text-gray-400">
                        <li><a href="#" className="hover:text-white">Terms & conditions</a></li>
                        <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
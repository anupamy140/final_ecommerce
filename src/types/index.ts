export interface Product {
    id: number;
    title: string;
    description: string;
    price: number;
    rating: number;
    stock: number;
    brand: string;
    category: string;
    thumbnail: string;
    images: string[];
    vendorId?: string;
    discountPercentage?: number;
    sku?: string;
    tags?: string[];
    weight?: number;
    dimensions?: { width: number; height: number; depth: number };
    warrantyInformation?: string;
    shippingInformation?: string;
    returnPolicy?: string;
    minimumOrderQuantity?: number;
}

export interface CartItem {
    product_id: number;
    title: string;
    price: number;
    image: string;
    quantity: number;
}

export interface Address {
    _id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

export interface OrderItem {
    product_id: number;
    title?: string;
    price?: number;
    quantity: number;
    thumbnail?: string;
}

export interface OrderDoc {
    _id: string;
    user_id: string;
    items: OrderItem[];
    total: number;
    status: "pending" | "paid" | "failed";
    createdAt: string;
}

export interface Vendor {
    companyName: string;
    email: string;
    vendor_id: string;
}
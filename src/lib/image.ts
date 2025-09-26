// yeh function Cloudinary URL ya kisi bhi image URL ko optimize karta hai
export const optimizeCloudinaryImage = (
    url: string | undefined,
    width: number,
    height?: number,
    quality: string | number = 'auto',
    format: string = 'auto'
) => {
    if (!url || !url.includes('cloudinary.com')) {
        // Agar Cloudinary URL nahi hai to placeholder dikhayein
        return `https://placehold.co/${width}x${height || width}?text=Image+Not+Found`;
    }
    const heightParam = height ? `,h_${height}` : '';
    const transformations = `w_${width}${heightParam},c_fill,q_${quality},f_${format}`;
    return url.replace('/upload/', `/upload/${transformations}/`);
};

// yeh function Pexels URL ko optimize karta hai
export const optimizePexelsImage = (
    url: string,
    width: number,
) => {
    if (!url || !url.includes('pexels.com')) {
        return url;
    }
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}auto=compress&cs=tinysrgb&w=${width}&fit=crop`;
};

// yeh function Cloudinary URL ya kisi bhi image URL ko optimize karta hai
export const optimizeImage = (
    url: string | undefined,
    width: number,
    height?: number,
    quality: string | number = 'auto',
    format: string = 'auto'
) => {
    if (!url) {
        return `https://placehold.co/${width}x${height || width}?text=No+Image`;
    }
    // Check if it's a Cloudinary URL
    if (url.includes('cloudinary.com')) {
        const heightParam = height ? `,h_${height}` : '';
        const transformations = `w_${width}${heightParam},c_fill,q_${quality},f_${format}`;
        return url.replace('/upload/', `/upload/${transformations}/`);
    }
    // Agar Cloudinary URL nahi hai (jaise dummyjson.com se), to use waise hi return kar do
    return url;
};
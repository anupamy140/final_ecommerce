// src/components/shared/TextType.tsx
import React, { type ElementType, useEffect, useState } from "react";

interface TextTypeProps {
    className?: string; text: string | string[]; as?: ElementType; typingSpeed?: number;
    pauseDuration?: number; deletingSpeed?: number; loop?: boolean;
}

export const TextType = ({
    text, as: Component = 'div', typingSpeed = 50, pauseDuration = 2000,
    deletingSpeed = 30, loop = true, className = '', ...props
}: TextTypeProps & React.HTMLAttributes<HTMLElement>) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [textIndex, setTextIndex] = useState(0);

    useEffect(() => {
        const textArray = Array.isArray(text) ? text : [text];
        const handleTyping = () => {
            const currentText = textArray[textIndex];
            if (isDeleting) {
                if (displayedText.length > 0) {
                    setDisplayedText(currentText.substring(0, displayedText.length - 1));
                } else {
                    setIsDeleting(false);
                    setTextIndex((prev) => (prev + 1) % textArray.length);
                }
            } else {
                if (displayedText.length < currentText.length) {
                    setDisplayedText(currentText.substring(0, displayedText.length + 1));
                } else if (loop || textIndex < textArray.length - 1) {
                    setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            }
        };
        const speed = isDeleting ? deletingSpeed : typingSpeed;
        const timeout = setTimeout(handleTyping, speed);
        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, text, textIndex, typingSpeed, deletingSpeed, pauseDuration, loop]);

    return (
        <Component className={`${className} after:content-['|'] after:ml-1 after:animate-pulse`} {...props}>
            {displayedText}
        </Component>
    );
};
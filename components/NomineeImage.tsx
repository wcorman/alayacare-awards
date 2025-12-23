"use client";

import React, { useState } from 'react';

interface NomineeImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function NomineeImage({ src, alt, className = "" }: NomineeImageProps) {
    const [imageUrl, setImageUrl] = useState(src || "https://placehold.co/1200x600/dadadf/08193e?text=Photo+Missing");

    const handleError = () => {
        setImageUrl("https://placehold.co/1200x600/dadadf/08193e?text=Photo+Missing");
    };

    return (
        <img
            src={imageUrl}
            alt={alt}
            className={className}
            onError={handleError}
        />
    );
}


"use client";

import React, { useState } from 'react';

interface NomineeImageProps {
    src: string | null;
    alt: string;
    className?: string;
}

export default function NomineeImage({ src, alt, className = "" }: NomineeImageProps) {
    const [imageUrl, setImageUrl] = useState(src || "/nominee-placeholder.webp");

    const handleError = () => {
        setImageUrl("/nominee-placeholder.webp");
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

